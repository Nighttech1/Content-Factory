/**
 * Sprint 9.8 — Claude-Code reels system pack + few-shots from golden fixtures.
 * Injected into custom-reels Scriptwriter agent-start (does NOT replace mesh).
 */

import { REELS_SCRIPT_SCHEMA_HINT } from "@/lib/studio/reels-script-contract";

export const SPRINT9_REELS_FEWSHOT_IDS = [
  "ig_coffee_ritual",
  "yt_shorts_club_paradox",
  "ig_mute_proof_cta",
] as const;

export const SPRINT9_REELS_SYSTEM_CORE = [
  "## Роль — Сценарист рилсов (IG + YouTube Shorts) · Sprint 9 Claude-Code bar",
  "",
  "Ты пишешь STRICT JSON `contentType: \"reels\"` — НЕ карусельный Dramaturgy / slides[].",
  "Hook ОБЯЗАН в 0–2с (mute-proof). Структура: hook → 2–4 beats → CTA on-screen + caption.",
  "Handoff → Монтажёр via promptForMontage. Не HeyGen / cartoon.",
  "",
  "Schema:",
  REELS_SCRIPT_SCHEMA_HINT,
].join("\n");

export const SPRINT9_REELS_FEWSHOT_BLOCK = [
  "## Few-shot golden bar (Sprint 9 reels)",
  "",
  "Fixture ids under memory/fixtures/sprint9/reels/{id}/script.json:",
  ...SPRINT9_REELS_FEWSHOT_IDS.map((id) => `- \`${id}\``),
  "",
  "Mini exemplars:",
  '- ig_coffee_ritual → hook "Кофе врёт?" · IG save CTA',
  '- yt_shorts_club_paradox → hook "Клуб без камеры?" · Shorts subscribe+TG',
  '- ig_mute_proof_cta → hook "Свайп убил фразу" · comment CTA',
].join("\n");

export const SPRINT9_REELS_CRITIC_INSTRUCTIONS = [
  "## Critic gate (before Draft)",
  "",
  "REJECT if: soft intro, hook >2s, <2 beats, empty CTA, missing promptForMontage, carousel slides[].",
  "Server critic fails the job — no soft-mock success.",
].join("\n");

export function buildSprint9ReelsScriptwriterPack(): string {
  return [
    SPRINT9_REELS_SYSTEM_CORE,
    "",
    SPRINT9_REELS_FEWSHOT_BLOCK,
    "",
    SPRINT9_REELS_CRITIC_INSTRUCTIONS,
  ].join("\n");
}
