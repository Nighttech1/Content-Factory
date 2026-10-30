/**
 * C-31 smoke — CapCut gate matrix (no DB).
 * Usage:
 *   npx tsx scripts/smoke-c31-capcut-gate.ts
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c31-capcut-gate.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  isCapCutModule,
  parseRefDraftId,
  CAPCUT_MODULE_IDS,
} from "../lib/studio/capcut-gate";

const root = process.cwd();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function sourceOk() {
  const gate = join(root, "lib/studio/capcut-gate.ts");
  const edit = join(root, "app/studio/[moduleId]/edit/[draftId]/page.tsx");
  const workspace = join(root, "components/studio/StudioModuleWorkspace.tsx");
  const shell = join(root, "components/studio/editor/CapCutEditorShell.tsx");
  const card = join(root, "components/studio/workspace/FeedPostCard.tsx");

  for (const p of [gate, edit, workspace, shell, card]) {
    assert(existsSync(p), `missing ${p}`);
  }

  const editSrc = readFileSync(edit, "utf8");
  assert(editSrc.includes("isCapCutModule"), "edit page must gate");
  assert(editSrc.includes("notFound"), "edit page must notFound non-reels");

  const ws = readFileSync(workspace, "utf8");
  assert(ws.includes("openCompetitorEditor"), "reels competitor → CapCut");
  // C-53: Razbor on all modules; CapCut editor stays reels-only.
  assert(ws.includes("showRazborButton={true}"), "Razbor all modules");
  assert(
    !ws.includes("showRazborButton={isCarouselEngine}"),
    "carousel-only Razbor superseded",
  );
  assert(ws.includes("showEditorButton={isReels}"), "CapCut CTA reels-only");
  assert(ws.includes('aspectRatio={feedAspect}'), "reels aspect wiring");

  const shellSrc = readFileSync(shell, "utf8");
  assert(shellSrc.includes("parseRefDraftId"), "shell reads ref draft");
  assert(shellSrc.includes("editor-reference"), "reference UI testids");

  const cardSrc = readFileSync(card, "utf8");
  assert(
    cardSrc.includes("Открыть в редакторе") || cardSrc.includes("showEditorButton"),
    "reels editor CTA",
  );

  console.log("SMOKE_C31_UI_SOURCE_OK");
}

function unitOk() {
  assert(isCapCutModule("cartoon-reels"), "cartoon-reels allow");
  assert(isCapCutModule("heygen-reels"), "heygen-reels allow");
  assert(!isCapCutModule("carousel-engine"), "carousel deny");
  assert(!isCapCutModule("aesthetic-graphics"), "aesthetic deny");
  assert(!isCapCutModule("custom-foo"), "custom deny");
  assert(CAPCUT_MODULE_IDS.length === 2, "allowlist size 2");
  assert(parseRefDraftId("ref-comp-1") === "comp-1", "parse ref");
  assert(parseRefDraftId("draft-abc") === null, "non-ref");
  console.log("SMOKE_C31_UNIT_OK");
}

async function liveOk(base: string) {
  const reelsEdit = await fetch(
    `${base}/studio/cartoon-reels/edit/draft-smoke-c31`,
  );
  assert(reelsEdit.status === 200, `reels edit expected 200 got ${reelsEdit.status}`);

  const carouselEdit = await fetch(
    `${base}/studio/carousel-engine/edit/draft-should-404`,
  );
  assert(
    carouselEdit.status === 404,
    `carousel edit expected 404 got ${carouselEdit.status}`,
  );

  const inspect = await fetch(`${base}/studio/inspect/demo`);
  assert(inspect.status === 200, `inspect expected 200 got ${inspect.status}`);

  const reelsPage = await fetch(`${base}/studio/heygen-reels`);
  assert(reelsPage.status === 200, `heygen page expected 200`);

  console.log("SMOKE_C31_LIVE_OK");
}

async function main() {
  unitOk();
  sourceOk();
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (base) {
    await liveOk(base);
  } else {
    console.log("SMOKE_C31_LIVE_SKIP (set BASE_URL for live)");
  }
  console.log("SMOKE_C31_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
