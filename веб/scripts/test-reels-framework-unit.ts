/**
 * Unit tests — Reels Framework (schema, revision preserve, store, profiles).
 * Run: npx tsx scripts/test-reels-framework-unit.ts
 */

import assert from "node:assert/strict";
import {
  validateMontageProject,
  MONTAGE_SCHEMA_VERSION,
} from "../lib/studio/reels-framework/montage-schema";
import {
  __resetReelsSoTForTests,
  upsertReel,
  getReel,
  listRules,
  upsertRule,
} from "../lib/studio/reels-framework/store";
import { createReel, buildAndSaveSimplePlan } from "../lib/studio/reels-framework/manager";
import { planRevision } from "../lib/studio/reels-framework/agents/revision-manager";
import { applyNaturalLanguageRevision } from "../lib/studio/reels-framework/agents/revision-manager";
import { generateScriptAndStoryboard } from "../lib/studio/reels-framework/agents/script-storyboard";
import { STYLE_PROFILES } from "../lib/studio/reels-framework/memory/style-profiles";
import {
  proposeRuleFromFeedback,
  confirmRule,
  findConflicts,
} from "../lib/studio/reels-framework/memory/style-memory";
import { ensureBasicMotionScenes } from "../lib/studio/reels-framework/pipeline/motion/basic-titles";
import { generateAsset } from "../lib/studio/reels-framework/adapters/generation-gateway";
import { runResearchIfEnabled } from "../lib/studio/reels-framework/agents/research-mode";
import { requiresUserApproval } from "../lib/studio/reels-framework/pipeline/auto-modes";
import { DEFAULT_MONTAGE_SETTINGS } from "../lib/studio/reels-framework/types";
import fs from "node:fs";
import path from "node:path";

function test(name: string, fn: () => void | Promise<void>) {
  return { name, fn };
}

const tests = [
  test("montage schema accepts valid project", () => {
    const v = validateMontageProject({
      schema_version: MONTAGE_SCHEMA_VERSION,
      reel_id: "reel_x",
      style_profile: "professional",
      version: 1,
      format: { width: 1080, height: 1920, fps: 30, aspect_ratio: "9:16" },
      scenes: [
        {
          scene_id: "scene_001",
          type: "title",
          duration: 2,
          transition: "cut",
          effects: [],
          parameters: { text: "Hello" },
        },
      ],
      audio: { normalize: true },
      subtitles: [],
    });
    assert.equal(v.ok, true);
  }),

  test("montage schema rejects duplicate scene_id", () => {
    const v = validateMontageProject({
      schema_version: MONTAGE_SCHEMA_VERSION,
      reel_id: "reel_x",
      style_profile: "professional",
      version: 1,
      format: { width: 1080, height: 1920, fps: 30, aspect_ratio: "9:16" },
      scenes: [
        {
          scene_id: "scene_001",
          type: "title",
          duration: 2,
          parameters: { text: "A" },
        },
        {
          scene_id: "scene_001",
          type: "endcard",
          duration: 2,
          parameters: { text: "B" },
        },
      ],
    });
    assert.equal(v.ok, false);
  }),

  test("montage schema rejects code-like payload", () => {
    const v = validateMontageProject({ code: "rm -rf /" });
    assert.equal(v.ok, false);
  }),

  test("four style profiles present", () => {
    assert.equal(STYLE_PROFILES.length, 4);
    assert.ok(STYLE_PROFILES.some((p) => p.id === "comedy"));
  }),

  test("create reel + script storyboard", () => {
    __resetReelsSoTForTests();
    const reel = createReel({ topic: "Последствия скромности", sheetRowKey: "51" });
    assert.equal(reel.status, "NEW_TOPIC");
    const s = generateScriptAndStoryboard(reel.id);
    assert.equal(s.ok, true);
    if (s.ok) {
      assert.equal(s.reel.status, "AWAITING_FOOTAGE");
      assert.ok(s.reel.script?.version === 1);
      const scriptPath = path.join(
        process.cwd(),
        "generatedMedia",
        "reels-jobs",
        reel.id,
        "script.json",
      );
      assert.ok(fs.existsSync(scriptPath));
    }
  }),

  test("revision enlarges title only", async () => {
    __resetReelsSoTForTests();
    const reel = createReel({ topic: "Тест правки" });
    // fake source meta without real file — plan builder needs sources
    upsertReel({
      ...getReel(reel.id)!,
      sources: [
        {
          assetId: "asset_1",
          fileName: "a.mp4",
          relativePath: "sources/a.mp4",
          mime: "video/mp4",
          sizeBytes: 10,
          durationSec: 5,
          uploadedAt: new Date().toISOString(),
        },
      ],
      status: "FOOTAGE_UPLOADED",
    });
    // write dummy source so paths exist optional — plan doesn't need file for JSON
    const plan = buildAndSaveSimplePlan(reel.id);
    assert.equal(plan.ok, true);
    if (!plan.ok) return;

    const titleBefore = plan.project.scenes.find((s) => s.type === "title");
    assert.ok(titleBefore && titleBefore.type === "title");
    const videoBefore = plan.project.scenes.find((s) => s.type === "video");

    const revPlan = planRevision(plan.project, "Сделай заголовок крупнее");
    assert.equal(revPlan.ambiguous, false);
    assert.ok(revPlan.targetSceneIds.includes("scene_title"));

    const applied = await applyNaturalLanguageRevision({
      reelId: reel.id,
      feedback: "Сделай заголовок крупнее",
      render: false,
      proposeRule: false,
    });
    assert.equal(applied.ok, true);

    const { loadMontageProject } = await import(
      "../lib/studio/reels-framework/manager"
    );
    const after = loadMontageProject(reel.id);
    assert.ok(after);
    const titleAfter = after!.scenes.find((s) => s.type === "title");
    const videoAfter = after!.scenes.find((s) => s.type === "video");
    assert.ok(titleAfter && titleAfter.type === "title");
    assert.ok(
      (titleAfter.parameters.fontSize ?? 0) >
        ((titleBefore as { parameters: { fontSize?: number } }).parameters.fontSize ?? 48),
    );
    assert.deepEqual(videoAfter, videoBefore);
  }),

  test("rule propose stays proposed until confirm", () => {
    __resetReelsSoTForTests();
    const rule = proposeRuleFromFeedback({
      feedback: "Всегда не закрывать лицо субтитрами",
      sourceReelId: "reel_test",
    });
    assert.equal(rule.status, "proposed");
    upsertRule(rule);
    assert.equal(listRules().find((r) => r.id === rule.id)?.status, "proposed");
    confirmRule(rule.id);
    assert.equal(listRules().find((r) => r.id === rule.id)?.status, "active");
    const conflicts = findConflicts({ ...rule, status: "active" });
    assert.ok(Array.isArray(conflicts));
  }),

  test("generation gateway respects budget flag", async () => {
    const denied = await generateAsset({
      kind: "image",
      prompt: "x",
      budgetAllowed: false,
    });
    assert.equal(denied.ok, false);
  }),

  test("research mode off by default", async () => {
    const r = await runResearchIfEnabled({ topic: "t", claims: ["1"] });
    assert.equal(r.enabled, false);
  }),

  test("draft mode requires approval", () => {
    assert.equal(requiresUserApproval(DEFAULT_MONTAGE_SETTINGS), true);
  }),

  test("motion helper adds title", () => {
    const base = validateMontageProject({
      schema_version: MONTAGE_SCHEMA_VERSION,
      reel_id: "r",
      style_profile: "dynamic",
      version: 1,
      format: { width: 1080, height: 1920, fps: 30, aspect_ratio: "9:16" },
      scenes: [
        {
          scene_id: "scene_video_001",
          type: "video",
          asset_id: "a",
          source_start: 0,
          source_end: 3,
        },
      ],
    });
    assert.equal(base.ok, true);
    if (!base.ok) return;
    const withMotion = ensureBasicMotionScenes(base.project, {
      title: "Hi",
      endcard: "Bye",
    });
    assert.ok(withMotion.scenes.some((s) => s.type === "title"));
    assert.ok(withMotion.scenes.some((s) => s.type === "endcard"));
  }),
];

async function main() {
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`ok - ${t.name}`);
    } catch (e) {
      failed += 1;
      console.error(`not ok - ${t.name}`);
      console.error(e);
    }
  }
  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  if (failed) process.exit(1);
}

void main();
