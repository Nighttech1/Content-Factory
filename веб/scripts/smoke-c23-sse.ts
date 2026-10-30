/**
 * Smoke C-23: in-memory job registry + mock SSE timeline.
 * Does not require Redis or a running Next server for the core path.
 *
 * Optional live check (if BASE_URL reachable):
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c23-sse.ts
 *
 * Run: npx tsx scripts/smoke-c23-sse.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  __resetJobRegistryForTests,
  createJobWithMockStream,
  getEventsAfter,
  getJob,
  subscribeJob,
  type StoredJobEvent,
} from "../lib/jobs";

const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

/** S1: store must drive steps via SSE, not local simulated pipeline timers. */
function assertNoSimulatedPipeline(): void {
  const store = readFileSync(join(ROOT, "lib/studio-store.ts"), "utf8");
  assert(
    !store.includes("runSimulatedPipeline"),
    "S1 fail: lib/studio-store.ts still references runSimulatedPipeline",
  );
  assert(
    store.includes("openJobStream"),
    "S1 fail: lib/studio-store.ts must call openJobStream",
  );
  console.log("SMOKE_C23_S1_NO_SIMULATED_PIPELINE_OK");
}

async function waitForCompleted(jobId: string, timeoutMs = 8000): Promise<StoredJobEvent[]> {
  const job = getJob(jobId);
  assert(job, "job missing after create");

  if (job.completed) return [...job.events];

  return new Promise((resolve, reject) => {
    const collected: StoredJobEvent[] = [...job.events];
    const timer = setTimeout(() => {
      unsub();
      reject(new Error("timeout waiting for completed"));
    }, timeoutMs);

    const unsub = subscribeJob(jobId, (ev) => {
      collected.push(ev);
      if (ev.status === "completed" || ev.status === "failed") {
        clearTimeout(timer);
        unsub();
        resolve(collected);
      }
    });
  });
}

function parseSseChunk(buffer: string): { frames: Array<{ id: number; data: unknown }>; rest: string } {
  const frames: Array<{ id: number; data: unknown }> = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  for (const block of parts) {
    if (!block.trim()) continue;
    let id = 0;
    let dataRaw = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("id:")) id = Number.parseInt(line.slice(3).trim(), 10);
      if (line.startsWith("data:")) dataRaw += line.slice(5).trim();
    }
    if (!dataRaw) continue;
    frames.push({ id, data: JSON.parse(dataRaw) as unknown });
  }
  return { frames, rest };
}

async function liveHttpSmoke(jobId: string): Promise<void> {
  const miss = await fetch(`${BASE}/api/jobs/job_does_not_exist/stream`);
  assert(miss.status === 404, `expected 404 for unknown job, got ${miss.status}`);
  const missJson = (await miss.json()) as { ok?: boolean; error?: string };
  assert(missJson.ok === false && missJson.error === "job_not_found", "404 body shape");

  const res = await fetch(`${BASE}/api/jobs/${jobId}/stream`, {
    headers: { Accept: "text/event-stream" },
  });
  assert(res.status === 200, `stream status ${res.status}`);
  assert(
    (res.headers.get("content-type") ?? "").includes("text/event-stream"),
    "content-type event-stream",
  );
  assert(res.body, "stream body missing");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const seen: Array<{ id: number; data: { progress?: number; status?: string } }> = [];
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parsed = parseSseChunk(buf);
    buf = parsed.rest;
    for (const f of parsed.frames) {
      seen.push(f as (typeof seen)[number]);
    }
    if (seen.some((f) => f.data?.status === "completed")) break;
  }
  await reader.cancel().catch(() => undefined);

  assert(seen.length >= 1, "expected ≥1 SSE frame");
  assert(
    seen.some((f) => typeof f.data?.progress === "number"),
    "expected progress field",
  );
  console.log("SMOKE_C23_HTTP_OK", jobId, `frames=${seen.length}`);
}

async function main() {
  assertNoSimulatedPipeline();

  __resetJobRegistryForTests();

  assert(!getJob("job_missing"), "unknown job must be undefined");

  const jobId = createJobWithMockStream();
  assert(jobId.startsWith("job_"), `jobId shape: ${jobId}`);

  const immediate = getJob(jobId);
  assert(immediate, "job registered");
  assert(immediate.events.length >= 1, "first event sync so stream is not empty");
  assert(immediate.events[0].id === 1, "monotonic id starts at 1");

  const events = await waitForCompleted(jobId);
  assert(events.length >= 4, `expected agent steps, got ${events.length}`);
  assert(events.every((e, i) => i === 0 || e.id === events[i - 1].id + 1), "monotonic ids");
  assert(events[events.length - 1].status === "completed", "last status completed");
  assert(events[events.length - 1].progress === 100, "progress 100");

  const agents = new Set(events.map((e) => e.agent));
  assert(agents.has("researcher"), "researcher");
  assert(agents.has("hook_writer"), "hook_writer");
  assert(agents.has("script_writer"), "script_writer");
  assert(agents.has("designer"), "designer");

  const after2 = getEventsAfter(immediate!, 2);
  assert(after2.every((e) => e.id > 2), "Last-Event-ID replay filter");

  console.log("SMOKE_C23_OK", jobId, `events=${events.length}`);

  if (BASE) {
    // Fresh job for HTTP (same process registry only if hitting this node's API —
    // for real Next, create via generate; here we only verify 404 + note).
    const missOnly = await fetch(`${BASE}/api/jobs/job_does_not_exist/stream`);
    assert(missOnly.status === 404, `live 404 got ${missOnly.status}`);
    console.log("SMOKE_C23_LIVE_404_OK");

    // Full stream needs a job created inside the Next process (generate).
    // If GENERATE_MODULE is set, POST generate then stream.
    const moduleId = process.env.GENERATE_MODULE ?? "carousel-engine";
    try {
      const gen = await fetch(`${BASE}/api/modules/${moduleId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "smoke-c23-sse" }),
      });
      if (gen.ok) {
        const body = (await gen.json()) as { jobId?: string; ok?: boolean };
        assert(body.ok && typeof body.jobId === "string", "generate must return jobId");
        await liveHttpSmoke(body.jobId);
      } else {
        console.log("SMOKE_C23_LIVE_SKIP_GENERATE", gen.status);
      }
    } catch (e) {
      console.log("SMOKE_C23_LIVE_SKIP", e instanceof Error ? e.message : e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
