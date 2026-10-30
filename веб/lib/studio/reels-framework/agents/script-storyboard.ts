import fs from "node:fs";
import path from "node:path";
import { getReel, upsertReel } from "../store";
import { ensureReelDirs } from "../paths";
import type { ReelRecord, ReelScriptVersion } from "../types";

/** Deterministic script/storyboard for MVP (+ optional LLM later). */
export function generateScriptAndStoryboard(reelId: string): {
  ok: true;
  reel: ReelRecord;
} | { ok: false; error: string } {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };

  upsertReel({ ...reel, status: "SCRIPT_GENERATING" });

  const topic = reel.topic;
  const script = {
    contentType: "reels" as const,
    title: topic,
    goal: `Короткий ролик на тему: ${topic}`,
    audience: "подписчики клуба / соцсети",
    durationSec: 25,
    hook: {
      t0: 0,
      t1: 3,
      onScreen: topic.slice(0, 40),
      vo: `Хук: ${topic}`,
    },
    beats: [
      {
        t0: 3,
        t1: 10,
        label: "проблема",
        onScreen: "В чём суть",
        vo: `Разбор: ${topic}`,
      },
      {
        t0: 10,
        t1: 18,
        label: "поворот",
        onScreen: "Что делать",
        vo: "Практический шаг без воды",
      },
      {
        t0: 18,
        t1: 23,
        label: "cta",
        onScreen: "Ваш ход",
        vo: "Напишите в комментарии свой опыт",
      },
    ],
    cta: {
      t0: 23,
      t1: 26,
      onScreen: "Комментарий",
      vo: "Один конкретный шаг сегодня",
      captionLine: "Напишите в комментарии",
    },
    promptForMontage:
      "cut on energy; burn-in RU subs; endcard CTA; keep face clear of titles",
    shootingBrief: {
      shots: [
        "Крупный план в камеру — хук",
        "Средний план — объяснение с жестом",
        "Энергичный дубль для поворота",
        "Спокойный финал с CTA",
      ],
      brollNeeded: ["деталь рук", "окружение"],
      humorSlots: ["после поворота — короткая реакция"],
      graphicsSlots: ["заголовок на хуке", "endcard"],
    },
  };

  const storyboard = {
    scenes: script.beats.map((b, i) => ({
      id: `sb_${i + 1}`,
      label: b.label,
      visual: b.onScreen,
      vo: b.vo,
      durationHint: b.t1 - b.t0,
    })),
  };

  const version: ReelScriptVersion = {
    version: (reel.script?.version ?? 0) + 1,
    createdAt: new Date().toISOString(),
    script: script as unknown as Record<string, unknown>,
    storyboard,
  };

  const dirs = ensureReelDirs(reelId);
  fs.writeFileSync(
    path.join(dirs.root, "script.json"),
    JSON.stringify(version, null, 2),
    "utf8",
  );

  const next = upsertReel({
    ...getReel(reelId)!,
    script: version,
    status: "AWAITING_FOOTAGE",
  });

  return { ok: true, reel: next };
}
