/**
 * HeyGen script draft prompts — `heygen-script@v1`
 * Technique: zero-shot structured extraction (JSON lines for avatar).
 * Used by heygen-reels generateDraft (template helpers; mock path needs no LLM).
 */

export const HEYGEN_SCRIPT_PROMPT_VERSION = "heygen-script@v1" as const;

export type HeyGenScriptLineDraft = {
  lineIndex: number;
  speaker: string;
  textRu: string;
  textHy: string;
  approxSeconds: number;
};

export const HEYGEN_SCRIPT_SYSTEM = `You are Script Writer for Vernatun Content Factory (Module 4: heygen-reels).
Version: ${HEYGEN_SCRIPT_PROMPT_VERSION}.

Task: Write short spoken lines for an AI avatar host (9:16 reel).

Rules:
- Hook in the FIRST line (winner hook energy, ≤18 words).
- Remaining lines: clear spoken beats; no stage directions.
- RU primary; HY is a short parallel greeting/beat (Armenian glyphs OK).
- Do not invent brand colors, secrets, or API keys.
- No auto-publish language; HITL will approve later.
- Output ONLY valid JSON matching the schema — no markdown fences.

JSON schema:
{
  "lines": [
    {
      "lineIndex": number,
      "speaker": string,
      "textRu": string,
      "textHy": string,
      "approxSeconds": number
    }
  ]
}`;

export function buildHeyGenScriptUserPrompt(input: {
  topic: string;
  persona: string;
  lineCount: number;
}): string {
  return `### Input
topic: ${input.topic}
persona: ${input.persona}
lineCount: ${input.lineCount}

### Task
Produce exactly ${input.lineCount} spoken script lines for the avatar.`;
}

/**
 * Deterministic mock draft (no LLM) — used on localhost when no LLM key.
 * Mirrors the prompt contract so adapters stay thin.
 */
export function buildHeyGenScriptMockLines(input: {
  topic: string;
  persona: string;
  lineCount: number;
}): HeyGenScriptLineDraft[] {
  const topic = input.topic.trim() || "untitled";
  const count = Math.min(8, Math.max(2, input.lineCount));
  const lines: HeyGenScriptLineDraft[] = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      lineIndex: i,
      speaker: input.persona,
      textRu:
        i === 0
          ? `Стоп. Сегодня про «${topic.slice(0, 60)}» — за 30 секунд.`
          : i === count - 1
            ? `Сохрани. И напиши, что откликнулось про «${topic.slice(0, 40)}».`
            : `Пункт ${i}: ${topic.slice(0, 80)}.`,
      textHy: i === 0 ? "Կանգ։ Կարճ պատմեմ։" : i === count - 1 ? "Պահպանիր։" : `Կետ ${i}`,
      approxSeconds: i === 0 ? 5 : 4,
    });
  }
  return lines;
}
