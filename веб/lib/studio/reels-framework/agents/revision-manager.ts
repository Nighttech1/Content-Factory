import { randomBytes } from "node:crypto";
import { getReel, upsertReel } from "../store";
import { loadMontageProject, saveMontageProject, renderReel } from "../manager";
import type { MontageProject } from "../montage-schema";
import { validateMontageProject } from "../montage-schema";
import { proposeRuleFromFeedback } from "../memory/style-memory";
import type { ReelRevision } from "../types";

export type RevisionPlan = {
  targetSceneIds: string[];
  allowedChanges: string[];
  preserveSceneIds: string[];
  ambiguous: boolean;
  clarification?: string;
  summary: string;
};

/** Map NL feedback → targeted scene edits (deterministic heuristics). */
export function planRevision(
  project: MontageProject,
  feedback: string,
): RevisionPlan {
  const text = feedback.toLowerCase();
  const allIds = project.scenes.map((s) => s.scene_id);
  const targets: string[] = [];
  const allowed: string[] = [];

  if (/заголов|title|крупн/.test(text)) {
    const title = project.scenes.find((s) => s.type === "title");
    if (title) {
      targets.push(title.scene_id);
      allowed.push("title.text", "title.fontSize");
    }
  }
  if (/мем|вставк|insert/.test(text)) {
    project.scenes
      .filter((s) => s.type === "insert")
      .forEach((s) => {
        targets.push(s.scene_id);
        allowed.push("insert.replace");
      });
  }
  if (/музык|громк|звук/.test(text)) {
    allowed.push("audio.volume");
    // audio_bed or global — no scene required
  }
  if (/пауз/.test(text)) {
    const videos = project.scenes.filter((s) => s.type === "video");
    if (videos.length === 1) targets.push(videos[0]!.scene_id);
    else if (videos.length > 1 && !/сцен|scene_\d/.test(text)) {
      return {
        targetSceneIds: [],
        allowedChanges: [],
        preserveSceneIds: allIds,
        ambiguous: true,
        clarification: "Уточните, к какой сцене добавить паузу (scene_id).",
        summary: "ambiguous_pause",
      };
    }
    allowed.push("video.timing");
  }
  if (/дубл|эмоциональн/.test(text)) {
    project.scenes
      .filter((s) => s.type === "video")
      .forEach((s) => targets.push(s.scene_id));
    allowed.push("video.take");
  }
  if (/анимац/.test(text) && /убер|без/.test(text)) {
    project.scenes
      .filter((s) => s.type === "motion_graphic" || s.type === "title")
      .forEach((s) => {
        targets.push(s.scene_id);
        allowed.push("effects.remove");
      });
  }
  if (/предыдущ|откат|верн/.test(text)) {
    allowed.push("rollback");
  }

  const uniqueTargets = [...new Set(targets)];
  if (
    uniqueTargets.length === 0 &&
    !allowed.includes("audio.volume") &&
    !allowed.includes("rollback")
  ) {
    return {
      targetSceneIds: [],
      allowedChanges: [],
      preserveSceneIds: allIds,
      ambiguous: true,
      clarification: "Не удалось однозначно понять, что менять. Укажите сцену или элемент.",
      summary: "ambiguous",
    };
  }

  return {
    targetSceneIds: uniqueTargets,
    allowedChanges: allowed,
    preserveSceneIds: allIds.filter((id) => !uniqueTargets.includes(id)),
    ambiguous: false,
    summary: `targets=${uniqueTargets.join(",") || "global"}; changes=${allowed.join(",")}`,
  };
}

function applyPlan(
  project: MontageProject,
  feedback: string,
  plan: RevisionPlan,
): MontageProject {
  const nextScenes = project.scenes.map((scene) => {
    if (!plan.targetSceneIds.includes(scene.scene_id)) return scene;

    if (scene.type === "title" && plan.allowedChanges.some((c) => c.startsWith("title"))) {
      let text = scene.parameters.text;
      let fontSize = scene.parameters.fontSize ?? 48;
      if (/крупн/.test(feedback.toLowerCase())) fontSize = Math.min(96, fontSize + 16);
      if (/мельч|меньш/.test(feedback.toLowerCase())) fontSize = Math.max(28, fontSize - 12);
      const m = feedback.match(/«([^»]+)»|"([^"]+)"/);
      if (m) text = m[1] || m[2] || text;
      return {
        ...scene,
        parameters: { ...scene.parameters, text, fontSize },
        effects: plan.allowedChanges.includes("effects.remove") ? [] : scene.effects,
      };
    }

    if (scene.type === "video" && plan.allowedChanges.includes("video.timing")) {
      if (/больше пауз|длиннее/.test(feedback.toLowerCase())) {
        return {
          ...scene,
          source_end: scene.source_end + 0.5,
        };
      }
    }

    if (scene.type === "insert" && plan.allowedChanges.includes("insert.replace")) {
      return {
        ...scene,
        asset_id: `insert_replaced_${randomBytes(2).toString("hex")}`,
        reason: `replaced_by_feedback:${feedback.slice(0, 80)}`,
      };
    }

    return scene;
  });

  let audio = project.audio;
  if (plan.allowedChanges.includes("audio.volume")) {
    const quieter = /громк|тише|убав/.test(feedback.toLowerCase());
    audio = {
      ...audio,
      music_volume: quieter ? 0.08 : audio.music_volume ?? 0.15,
    };
  }

  return {
    ...project,
    version: project.version + 1,
    scenes: nextScenes,
    audio,
  };
}

export async function applyNaturalLanguageRevision(opts: {
  reelId: string;
  feedback: string;
  render?: boolean;
  proposeRule?: boolean;
}): Promise<{
  ok: true;
  revision: ReelRevision;
  proposedRuleId?: string;
  clarification?: string;
  reelId: string;
} | { ok: false; error: string; clarification?: string }> {
  const reel = getReel(opts.reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  const project = loadMontageProject(opts.reelId);
  if (!project) return { ok: false, error: "no_montage_project" };

  const plan = planRevision(project, opts.feedback);
  if (plan.ambiguous) {
    return {
      ok: false,
      error: "needs_clarification",
      clarification: plan.clarification,
    };
  }

  if (plan.allowedChanges.includes("rollback")) {
    // load previous version file if exists — simple: version-1
    return { ok: false, error: "rollback_use_plan_version_api" };
  }

  const before = project.version;
  const patched = applyPlan(project, opts.feedback, plan);

  // Integrity: preserved scenes unchanged
  for (const id of plan.preserveSceneIds) {
    const a = project.scenes.find((s) => s.scene_id === id);
    const b = patched.scenes.find((s) => s.scene_id === id);
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      return { ok: false, error: `preserve_violated:${id}` };
    }
  }

  const validated = validateMontageProject(patched);
  if (!validated.ok) return { ok: false, error: validated.error };

  const saved = saveMontageProject(opts.reelId, validated.project);
  if (!saved.ok) return { ok: false, error: saved.error };

  const revision: ReelRevision = {
    revisionId: `rev_${randomBytes(4).toString("hex")}`,
    createdAt: new Date().toISOString(),
    feedback: opts.feedback,
    targetSceneIds: plan.targetSceneIds,
    changeSummary: plan.summary,
    planVersionBefore: before,
    planVersionAfter: validated.project.version,
  };

  let proposedRuleId: string | undefined;
  if (opts.proposeRule !== false) {
    const looksPersistent =
      /всегда|обычно|больше не|правило|шрифт|субтитр/.test(opts.feedback.toLowerCase());
    if (looksPersistent) {
      const rule = proposeRuleFromFeedback({
        feedback: opts.feedback,
        sourceReelId: opts.reelId,
      });
      const { upsertRule } = await import("../store");
      upsertRule(rule);
      proposedRuleId = rule.id;
    }
  }

  upsertReel({
    ...getReel(opts.reelId)!,
    revisions: [...(getReel(opts.reelId)?.revisions ?? []), revision],
  });

  if (opts.render) {
    await renderReel(opts.reelId);
  }

  return {
    ok: true,
    revision,
    proposedRuleId,
    reelId: opts.reelId,
  };
}
