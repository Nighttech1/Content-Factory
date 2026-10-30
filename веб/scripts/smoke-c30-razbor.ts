/**
 * Smoke C-30: deterministic razbor pipeline + draft factory + API shape.
 *
 * File asserts always run. Live HTTP when BASE_URL reachable:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c30-razbor.ts
 *
 * Run: npx tsx scripts/smoke-c30-razbor.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getFeedForModule } from "../lib/studio/feed-fixtures";
import {
  buildCompetitorSlides,
  runRazborAnalysis,
  runRazborCascade,
} from "../lib/studio/razbor-pipeline";

const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertPipeline(): void {
  const feed = getFeedForModule("carousel-engine");
  assert(feed.competitors.length > 0, "need competitors");
  const post = feed.competitors[0];

  const analysis = runRazborAnalysis(post.id);
  assert(analysis, "analysis payload");
  assert(analysis!.competitorId === post.id, "competitorId match");
  assert(analysis!.analystMessages.length >= 2, "analyst messages");
  assert(
    analysis!.competitorSlides.length >= 4,
    `competitor slides >= 4 (got ${analysis!.competitorSlides.length})`,
  );
  assert(analysis!.scenario.includes("Vernatun"), "scenario branded");

  const slidesA = buildCompetitorSlides(post);
  const slidesB = buildCompetitorSlides(post);
  assert(
    slidesA.map((s) => s.imageUrl).join("|") ===
      slidesB.map((s) => s.imageUrl).join("|"),
    "competitor slides deterministic",
  );

  const cascade = runRazborCascade(post.id);
  assert(cascade, "cascade payload");
  assert(cascade!.scriptwriterMessages.length >= 2, "scriptwriter msgs");
  assert(cascade!.script.roles.length >= 1, "script.roles");
  assert(Boolean(cascade!.script.plot), "script.plot");
  assert(Boolean(cascade!.script.text), "script.text");
  assert(Boolean(cascade!.script.location), "script.location");
  const joined = cascade!.scriptwriterMessages.map((m) => m.text).join("\n");
  assert(joined.includes("roles:"), "msgs cover roles");
  assert(joined.includes("plot:"), "msgs cover plot");
  assert(joined.includes("location:"), "msgs cover location");
  assert(
    !("designerMessages" in cascade!) ||
      (cascade as { designerMessages?: unknown }).designerMessages == null,
    "no designerMessages on cascade",
  );
  assert(
    !("draft" in cascade!) || (cascade as { draft?: unknown }).draft == null,
    "no draft on cascade",
  );

  const again = runRazborCascade(post.id);
  assert(
    again!.script.text === cascade!.script.text,
    "cascade script deterministic",
  );

  const missing = runRazborAnalysis("no-such-competitor");
  assert(missing === null, "missing competitor → null");

  console.log("SMOKE_C30_PIPELINE_OK");
}

function assertUiSource(): void {
  const modal = readFileSync(
    join(ROOT, "components/studio/workspace/RazborModal.tsx"),
    "utf8",
  );
  const card = readFileSync(
    join(ROOT, "components/studio/workspace/FeedPostCard.tsx"),
    "utf8",
  );
  const drafts = readFileSync(
    join(ROOT, "components/studio/workspace/DraftsPanel.tsx"),
    "utf8",
  );
  const store = readFileSync(
    join(ROOT, "lib/studio/carousel-drafts-store.ts"),
    "utf8",
  );

  assert(modal.includes('data-testid="razbor-modal"'), "razbor-modal testid");
  assert(card.includes('data-testid="razbor-btn"'), "razbor-btn testid");
  assert(
    !modal.includes("/capcut") && !modal.includes("CapCut open"),
    "modal must not navigate to CapCut",
  );
  assert(drafts.includes("ours-drafts-panel"), "drafts panel testid");
  assert(store.includes("upsertDraft"), "drafts store upsert");
  assert(!store.includes("drawerOpen"), "drafts store isolated from generate");

  console.log("SMOKE_C30_UI_SOURCE_OK");
}

async function assertLiveHttp(): Promise<void> {
  if (!BASE) {
    console.log("SMOKE_C30_HTTP_SKIP (no BASE_URL)");
    return;
  }

  const feed = getFeedForModule("carousel-engine");
  const id = feed.competitors[0].id;

  const analyzeRes = await fetch(`${BASE}/api/studio/carousel-engine/razbor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ competitorId: id, action: "analyze" }),
  });
  assert(analyzeRes.ok, `analyze HTTP ${analyzeRes.status}`);
  const analyzeJson = (await analyzeRes.json()) as { ok?: boolean };
  assert(analyzeJson.ok === true, "analyze ok");

  const scriptRes = await fetch(`${BASE}/api/studio/carousel-engine/razbor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ competitorId: id, action: "script" }),
  });
  assert(scriptRes.ok, `script HTTP ${scriptRes.status}`);
  const scriptJson = (await scriptRes.json()) as {
    ok?: boolean;
    script?: { roles?: string[]; text?: string };
    draft?: { status?: string };
  };
  assert(scriptJson.ok === true, "script ok");
  assert(
    Array.isArray(scriptJson.script?.roles) &&
      (scriptJson.script?.roles.length ?? 0) >= 1,
    "http script.roles",
  );
  assert(Boolean(scriptJson.script?.text), "http script.text");
  assert(scriptJson.draft == null, "http must not return draft (C-51)");

  console.log("SMOKE_C30_HTTP_OK");
}

async function main(): Promise<void> {
  assertPipeline();
  assertUiSource();
  await assertLiveHttp();
  console.log("SMOKE_C30_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
