/**
 * C-audit-01 compact smoke — model routing + C-audit-02 static asserts (CTA / few-shots).
 *
 *   npx tsx scripts/smoke-c-audit-01-routing.ts
 *
 * No LIVE LLM / image API. Full 6-PNG wave gen → Deployer.
 */

import {
  COMBAT_USER_BRIEFS,
  seedAgentsForPipeline,
} from "../lib/mesh/agent-defaults";
import { buildCreateCarouselAgentBundle } from "../lib/studio/agent-start-bundle";
import { SPRINT9_CAROUSEL_FEWSHOT_BLOCK } from "../lib/studio/prompt-packs/sprint9-carousel-pack";
import { RAZBOR_ANALYST_MODEL } from "../lib/studio/razbor-live-shared";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  DEFAULT_DESIGNER_TEXT_MODEL,
  DEFAULT_SCRIPTWRITER_MODEL,
  isMeshImageModel,
} from "../types/mesh-agent";

const checks: { name: string; pass: boolean; detail?: string }[] = [];

function ok(name: string, cond: boolean, detail = "") {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Mirror agent-chat/route.ts D-m-4 (mode !== draw + image id → textModel). */
function resolveChatModel(input: {
  mode: "chat" | "handoff" | "describe" | "draw";
  preferredModel: string;
  textModel?: string;
  seedTextModel?: string;
}): string {
  let preferred = input.preferredModel.trim();
  if (input.mode !== "draw" && isMeshImageModel(preferred)) {
    preferred =
      input.textModel?.trim() ||
      input.seedTextModel?.trim() ||
      DEFAULT_DESIGNER_TEXT_MODEL;
  }
  return preferred;
}

// ── C-audit-01: constants ──────────────────────────────────────────
ok(
  "DEFAULT_SCRIPTWRITER_MODEL ≠ haiku",
  DEFAULT_SCRIPTWRITER_MODEL === "anthropic/claude-3.7-sonnet" &&
    !/haiku/i.test(DEFAULT_SCRIPTWRITER_MODEL),
  DEFAULT_SCRIPTWRITER_MODEL,
);
ok(
  "DEFAULT_DESIGNER_TEXT_MODEL = Sonnet",
  DEFAULT_DESIGNER_TEXT_MODEL === "anthropic/claude-3.7-sonnet",
  DEFAULT_DESIGNER_TEXT_MODEL,
);
ok(
  "DEFAULT_CAROUSEL_IMAGE_MODEL = image-2",
  DEFAULT_CAROUSEL_IMAGE_MODEL === "openai/gpt-5.4-image-2",
  DEFAULT_CAROUSEL_IMAGE_MODEL,
);
ok(
  "RAZBOR still Haiku",
  RAZBOR_ANALYST_MODEL === "anthropic/claude-haiku-4.5",
  RAZBOR_ANALYST_MODEL,
);
ok(
  "Razbor ≠ Scriptwriter",
  RAZBOR_ANALYST_MODEL === "anthropic/claude-haiku-4.5" &&
    DEFAULT_SCRIPTWRITER_MODEL === "anthropic/claude-3.7-sonnet",
  `${RAZBOR_ANALYST_MODEL} vs ${DEFAULT_SCRIPTWRITER_MODEL}`,
);

// ── C-audit-01: seeds ──────────────────────────────────────────────
const seeds = seedAgentsForPipeline("carousel-engine");
ok(
  "seed Scriptwriter = Sonnet + thinking",
  seeds.copywriter.modelConfig.model === DEFAULT_SCRIPTWRITER_MODEL &&
    seeds.copywriter.modelConfig.thinking === true &&
    seeds.copywriter.modelConfig.reasoningEffort === "high",
  String(seeds.copywriter.modelConfig.model),
);
ok(
  "seed Designer model = image-2",
  seeds.designer.modelConfig.model === DEFAULT_CAROUSEL_IMAGE_MODEL,
  String(seeds.designer.modelConfig.model),
);
ok(
  "seed Designer textModel = Sonnet",
  seeds.designer.modelConfig.textModel === DEFAULT_DESIGNER_TEXT_MODEL,
  String(seeds.designer.modelConfig.textModel),
);

const razborSeeds = seedAgentsForPipeline("carousel-engine");
ok(
  "seed Razbor Haiku (if present)",
  !razborSeeds.razbor ||
    razborSeeds.razbor.modelConfig.model === RAZBOR_ANALYST_MODEL,
  razborSeeds.razbor
    ? String(razborSeeds.razbor.modelConfig.model)
    : "no razbor seed",
);

// ── C-audit-01: describe with image id → Sonnet ────────────────────
const describeResolved = resolveChatModel({
  mode: "describe",
  preferredModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
  textModel: seeds.designer.modelConfig.textModel,
  seedTextModel: DEFAULT_DESIGNER_TEXT_MODEL,
});
ok(
  "describe(image-2) → Sonnet textModel",
  describeResolved === DEFAULT_DESIGNER_TEXT_MODEL &&
    !isMeshImageModel(describeResolved),
  describeResolved,
);

const chatResolved = resolveChatModel({
  mode: "chat",
  preferredModel: "openai/gpt-5.4-image-2",
  seedTextModel: DEFAULT_DESIGNER_TEXT_MODEL,
});
ok(
  "chat(image-2, no client textModel) → DEFAULT_DESIGNER_TEXT_MODEL",
  chatResolved === DEFAULT_DESIGNER_TEXT_MODEL,
  chatResolved,
);

const handoffResolved = resolveChatModel({
  mode: "handoff",
  preferredModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
  textModel: "anthropic/claude-3.7-sonnet",
});
ok(
  "handoff(image-2) → Sonnet",
  handoffResolved === "anthropic/claude-3.7-sonnet",
  handoffResolved,
);

const drawKeepsImage = resolveChatModel({
  mode: "draw",
  preferredModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
  textModel: DEFAULT_DESIGNER_TEXT_MODEL,
});
ok(
  "draw keeps image-2 (no substitute)",
  drawKeepsImage === DEFAULT_CAROUSEL_IMAGE_MODEL &&
    isMeshImageModel(drawKeepsImage),
  drawKeepsImage,
);

ok(
  "never fall to gpt-4o-mini for describe",
  describeResolved !== "gpt-4o-mini" &&
    describeResolved !== "openai/gpt-4o-mini",
  describeResolved,
);

// ── C-audit-02: COMBAT CTA catalog 1–4 ──────────────────────────────
const combat = COMBAT_USER_BRIEFS["carousel-engine"];
ok(
  "COMBAT has CTA catalog 1–4",
  /CTA catalog 1–4/.test(combat),
);
ok(
  "COMBAT CTA keywords (комментарии / подписка / TG / лайк)",
  /комментари/i.test(combat) &&
    /подписк/i.test(combat) &&
    (/TG|шапке профиля/i.test(combat) || /Telegram/i.test(combat)) &&
    /лайк/i.test(combat),
);
ok(
  "COMBAT NOT «бронь стола»",
  !/бронь стола/i.test(combat),
);
ok(
  "COMBAT NOT «запись в сторис»",
  !/запись в сторис/i.test(combat),
);

// ── C-audit-02: full JSON few-shots in pack/bundle ─────────────────
ok(
  "pack few-shot block has slides arrays",
  (SPRINT9_CAROUSEL_FEWSHOT_BLOCK.match(/"slides"\s*:\s*\[/g) ?? []).length >=
    3,
  `slides[] count=${(SPRINT9_CAROUSEL_FEWSHOT_BLOCK.match(/"slides"\s*:\s*\[/g) ?? []).length}`,
);
ok(
  "pack few-shot has 3 golden ids",
  /dark_notes_coffee/.test(SPRINT9_CAROUSEL_FEWSHOT_BLOCK) &&
    /bento_glass_metrics/.test(SPRINT9_CAROUSEL_FEWSHOT_BLOCK) &&
    /dark_editorial_night/.test(SPRINT9_CAROUSEL_FEWSHOT_BLOCK),
);
ok(
  "pack few-shot not name-only (has primary_copy)",
  (SPRINT9_CAROUSEL_FEWSHOT_BLOCK.match(/"primary_copy"/g) ?? []).length >= 3,
);

const bundle = buildCreateCarouselAgentBundle({
  agentRole: "scriptwriter",
  mode: "chat",
  pipelineId: "carousel-engine",
});
const bundleBlob = Object.values(bundle).join("\n");
ok(
  "agent-start bundle embeds full few-shots",
  /"slides"\s*:\s*\[/.test(bundleBlob) &&
    /dark_notes_coffee/.test(bundleBlob) &&
    (bundleBlob.match(/"slides"\s*:\s*\[/g) ?? []).length >= 3,
  `slides[] in bundle=${(bundleBlob.match(/"slides"\s*:\s*\[/g) ?? []).length}`,
);
ok(
  "bundle has paired invariants once (not triple spam)",
  (bundleBlob.match(/CREATE_CAROUSEL_PAIRED|Paired invariants|paired invariants/gi) ??
    []).length <= 4,
);

const failed = checks.filter((c) => !c.pass);
console.log(
  `\n--- SUMMARY: ${checks.filter((c) => c.pass).length}/${checks.length} PASS ---`,
);
if (failed.length) {
  console.log("FAILED:");
  for (const f of failed) console.log(` - ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
  process.exit(1);
}
console.log("SMOKE_C_AUDIT_01_ROUTING_OK");
