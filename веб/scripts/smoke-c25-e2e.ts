/**
 * Smoke C-25: E2E QA polish — Armenian font wiring, mesh RBAC source, S1/C-23 regression.
 *
 * Core path is source/file asserts (no Playwright required).
 * Optional live HTTP when BASE_URL reachable:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c25-e2e.ts
 *
 * Run: npx tsx scripts/smoke-c25-e2e.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = join(__dirname, "..");
const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
const HAS_ARMENIAN = /[\u0530-\u058F]/;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

/** G1 — layout + inspect surfaces apply --font-hy / Noto Sans Armenian */
function assertArmenianFont(): void {
  const layout = read("app/layout.tsx");
  assert(
    layout.includes("Noto_Sans_Armenian"),
    "layout must import Noto_Sans_Armenian",
  );
  assert(
    layout.includes('variable: "--font-hy"') || layout.includes("variable: '--font-hy'"),
    "layout must expose CSS variable --font-hy",
  );
  assert(
    layout.includes("notoArmenian.variable") || layout.includes("${notoArmenian.variable}"),
    "layout body must apply notoArmenian.variable",
  );

  const scriptEditor = read("components/inspect/ScriptEditor.tsx");
  assert(
    scriptEditor.includes("font-[family-name:var(--font-hy)]"),
    "ScriptEditor must apply font-[family-name:var(--font-hy)]",
  );
  assert(
    scriptEditor.includes("HAS_ARMENIAN") || /\\u0530/.test(scriptEditor),
    "ScriptEditor must detect Armenian unicode for hy font",
  );

  const karaoke = read("components/inspect/KaraokeCaptions.tsx");
  assert(
    karaoke.includes('lang="hy"') || karaoke.includes("lang='hy'"),
    "KaraokeCaptions must set lang=hy",
  );
  assert(
    karaoke.includes("font-[family-name:var(--font-hy)]"),
    "KaraokeCaptions must apply --font-hy",
  );

  const carousel = read("components/inspect/CarouselDeck.tsx");
  assert(
    carousel.includes("font-[family-name:var(--font-hy)]"),
    "CarouselDeck must apply --font-hy on hy sample",
  );
  assert(HAS_ARMENIAN.test(carousel), "CarouselDeck must contain Armenian sample unicode");

  const mock = read("lib/inspect-mock.ts");
  assert(HAS_ARMENIAN.test(mock), "inspect-mock must include Armenian unicode samples");
  assert(
    mock.includes("textHy") && /Բարև|Ի՞նչ|Երևան|Կանգ/.test(mock),
    "inspect-mock captions/script must include Armenian glyphs",
  );

  // HookAlternatives: current HOOKS seed is English-only — document, not hard fail.
  const hooks = read("components/inspect/HookAlternatives.tsx");
  const hooksHaveHyClass = hooks.includes("font-[family-name:var(--font-hy)]");
  const mockHooksBlock = mock.slice(mock.indexOf("const HOOKS"), mock.indexOf("export function createInspectDraft"));
  const hooksSeedHasHy = HAS_ARMENIAN.test(mockHooksBlock);
  if (hooksSeedHasHy) {
    assert(
      hooksHaveHyClass,
      "HookAlternatives must apply --font-hy when hook seed contains Armenian",
    );
  } else {
    console.log(
      "SMOKE_C25_NOTE_HOOKS_EN_ONLY (HookAlternatives has no --font-hy; seed hooks are Latin — OK for now)",
    );
  }

  console.log("SMOKE_C25_ARMENIAN_FONT_OK");
}

/**
 * G2 — RBAC mesh: ADMIN cannot use Mesh (client redirect).
 * Honest: role lives in zustand (client-only); HTTP alone cannot flip role.
 */
function assertMeshRbac(): void {
  const session = read("lib/session-store.ts");
  assert(
    session.includes('"OWNER"') && session.includes('"ADMIN"'),
    "session-store must define OWNER | ADMIN",
  );
  assert(
    /role:\s*"OWNER"/.test(session) || /role:\s*'OWNER'/.test(session),
    "session-store default role must be OWNER",
  );
  assert(session.includes("setRole"), "session-store must expose setRole");

  const mesh = read("app/admin/mesh/page.tsx");
  assert(
    /role\s*===\s*["']ADMIN["']/.test(mesh),
    "mesh page must gate on role === ADMIN",
  );
  assert(
    mesh.includes('"/studio"') || mesh.includes("'/studio'"),
    "mesh page must redirect ADMIN → /studio",
  );
  assert(
    mesh.includes("router.replace") || mesh.includes("redirect"),
    "mesh page must call router.replace (or redirect) for ADMIN",
  );
  assert(
    mesh.includes("AgentMeshCanvas"),
    "mesh page must mount AgentMeshCanvas for OWNER",
  );
  // Early return: ADMIN must not render canvas
  const adminBlock = mesh.includes("if (role === \"ADMIN\")") || mesh.includes("if (role === 'ADMIN')");
  assert(adminBlock, "mesh page must early-return for ADMIN before canvas");

  const sidebar = read("components/shell/SidebarNavigation.tsx");
  assert(
    sidebar.includes("setRole") && sidebar.includes("OWNER") && sidebar.includes("ADMIN"),
    "Sidebar QA role switcher must call setRole(OWNER|ADMIN)",
  );
  assert(
    sidebar.includes("ownerOnly") && /role\s*===\s*["']OWNER["']/.test(sidebar),
    "Sidebar must hide ownerOnly (Canvas) unless OWNER",
  );

  console.log("SMOKE_C25_RBAC_MESH_OK (client-only zustand — flip via Sidebar QA role)");
}

/** G3 — S1 + C-23 regression: drawer testids, no simulated pipeline, generate/stream */
function assertS1Regression(): void {
  const store = read("lib/studio-store.ts");
  assert(!store.includes("runSimulatedPipeline"), "S1: no runSimulatedPipeline in studio-store");
  assert(store.includes("openJobStream"), "S1: studio-store must openJobStream");

  const drawer = read("components/studio/GenerationDrawer.tsx");
  assert(drawer.includes('data-testid="generation-drawer"'), "missing generation-drawer testid");
  assert(drawer.includes('data-testid="agent-step"'), "missing agent-step testid");
  assert(drawer.includes("data-step-state"), "missing data-step-state");

  const cmd = read("components/studio/FloatingCommandBar.tsx");
  assert(cmd.includes('data-testid="generate-draft"'), "missing generate-draft testid");

  // Reuse C-23 executable smoke (in-process)
  const c23 = spawnSync("npx", ["tsx", "scripts/smoke-c23-sse.ts"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, BASE_URL: "" }, // source-only child; live done separately
  });
  assert(c23.status === 0, `smoke-c23 failed:\n${c23.stdout}\n${c23.stderr}`);
  assert(
    (c23.stdout ?? "").includes("SMOKE_C23_OK"),
    "expected SMOKE_C23_OK from nested smoke-c23",
  );
  assert(
    (c23.stdout ?? "").includes("SMOKE_C23_S1_NO_SIMULATED_PIPELINE_OK"),
    "expected S1 no-simulated from smoke-c23",
  );

  console.log("SMOKE_C25_S1_C23_REGRESSION_OK");
}

async function liveHttp(): Promise<void> {
  if (!BASE) {
    console.log("SMOKE_C25_LIVE_SKIP (set BASE_URL for HTTP)");
    return;
  }

  const studio = await fetch(`${BASE}/studio`);
  assert(studio.status === 200, `/studio expected 200, got ${studio.status}`);

  const inspect = await fetch(`${BASE}/studio/inspect/demo`);
  assert(inspect.status === 200, `/studio/inspect/demo expected 200, got ${inspect.status}`);
  const inspectHtml = await inspect.text();
  // next/font injects class names; variable name may appear in CSS or style tags
  const hasFontHint =
    inspectHtml.includes("--font-hy") ||
    inspectHtml.includes("Noto_Sans_Armenian") ||
    inspectHtml.includes("noto_sans_armenian") ||
    /font-hy|Noto.?Sans.?Armenian/i.test(inspectHtml);
  // Soft: Next may hash font CSS without string in HTML body — note if missing
  if (!hasFontHint) {
    console.log(
      "SMOKE_C25_LIVE_NOTE_FONT_STRING_ABSENT_IN_HTML (OK if next/font hashes; source G1 still binds --font-hy)",
    );
  } else {
    console.log("SMOKE_C25_LIVE_INSPECT_FONT_HINT_OK");
  }

  const mesh = await fetch(`${BASE}/admin/mesh`);
  assert(mesh.status === 200, `/admin/mesh expected 200 (client gate), got ${mesh.status}`);
  const meshHtml = await mesh.text();
  // Client redirect: HTML may still ship mesh bundle; cannot assert ADMIN deny over HTTP alone
  assert(
    meshHtml.length > 0,
    "mesh page returned empty body",
  );
  console.log(
    "SMOKE_C25_LIVE_MESH_HTTP_OK (client-only RBAC — ADMIN deny needs Playwright/Sidebar setRole)",
  );

  // Generate + stream (C-23 live path)
  const moduleId = process.env.GENERATE_MODULE ?? "carousel-engine";
  const gen = await fetch(`${BASE}/api/modules/${moduleId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "smoke-c25-e2e" }),
  });
  assert(gen.ok, `generate status ${gen.status}`);
  const body = (await gen.json()) as { ok?: boolean; jobId?: string };
  assert(body.ok && typeof body.jobId === "string", "generate must return ok + jobId");

  const stream = await fetch(`${BASE}/api/jobs/${body.jobId}/stream`, {
    headers: { Accept: "text/event-stream" },
  });
  assert(stream.status === 200, `stream status ${stream.status}`);
  assert(
    (stream.headers.get("content-type") ?? "").includes("text/event-stream"),
    "content-type event-stream",
  );
  assert(stream.body, "stream body missing");

  const reader = stream.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let frames = 0;
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const block of parts) {
      if (block.includes("data:")) frames += 1;
    }
    if (frames >= 1) break;
  }
  await reader.cancel().catch(() => undefined);
  assert(frames >= 1, "expected ≥1 SSE frame from generate job");

  console.log("SMOKE_C25_LIVE_GENERATE_STREAM_OK", body.jobId, `frames≥${frames}`);
}

async function main() {
  assertArmenianFont();
  assertMeshRbac();
  assertS1Regression();
  await liveHttp();
  console.log("SMOKE_C25_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
