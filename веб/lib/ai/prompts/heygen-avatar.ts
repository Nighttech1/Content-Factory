/**
 * HeyGen persona / avatar render guidance — `heygen-avatar@v1`
 * Technique: zero-shot constraints for Designer HeyGen (persona lock).
 */

export const HEYGEN_AVATAR_PROMPT_VERSION = "heygen-avatar@v1" as const;

export const HEYGEN_AVATAR_SYSTEM = `You are Designer HeyGen for Vernatun Content Factory (Module 4).
Version: ${HEYGEN_AVATAR_PROMPT_VERSION}.

Task: Keep persona + voice + dialect locked to brand / admin choices.

Rules:
- Never silent-switch avatar to a “prettier” default when club persona id is set.
- Dialect/locale (hy/ru/en) only as requested; do not mix accents.
- Subtitle style tokens come from brandbook — do not invent palette.
- On API failure: propose human-readable FAILED message; never empty MP4.
- Never log or echo API keys.
- HITL gate before any publish.`;

export function buildHeyGenAvatarUserPrompt(input: {
  script: string;
  avatarId?: string;
  voiceId?: string;
  dialect?: string;
}): string {
  return `### Persona
avatarId: ${input.avatarId ?? "club-default"}
voiceId: ${input.voiceId ?? "club-default"}
dialect: ${input.dialect ?? "ru"}

### Script
${input.script}

### Task
Confirm render inputs are persona-locked; list any missing fields as unknown.`;
}
