/**
 * B4.5 — Art Director vision fallback when pixel detect misses VOCAB_SLOT.
 * Returns chip bbox on 1080×1350 so bake can wipe + paste the HY—RU pill.
 */
import sharp from "sharp";

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { extractJsonObject } from "./json-parse";
import type { JobLlmSession } from "./job-llm-session";
import { FRAME_H, FRAME_W } from "./renderer";
import { resolveRoleModel } from "./role-models";

export type GuideRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type VocabGuideVisionResult = {
  rect: GuideRect;
  model: string;
  raw?: string;
};

const SYSTEM = `You are the Vernatun Art Director placing ONE orange vocabulary pill (rounded capsule, ~420×78 px) onto a FINISHED Instagram carousel slide (1080×1350).
LOOK AT THE IMAGE and choose a CLEAN, uncluttered area where the pill will sit WITHOUT overlapping ANYTHING important.
The pill MUST NOT overlap:
- any headline / body / CTA text already on the slide,
- faces, hands, the main dish/subject,
- the TOP-RIGHT logo pocket (x 820..1080, y 0..300),
- the BOTTOM-RIGHT swipe-arrow pocket (x 820..1080, y 1150..1350).
PREFER a calm, visually simple patch (plain wall, sky, table edge, blurred background) in the LOWER HALF of the frame, with clear empty space around it, so a solid orange capsule reads cleanly.
Return ONLY JSON (no markdown) — the pill's bounding box:
{"found":true,"left":N,"top":N,"width":N,"height":N}
or {"found":false} only if truly nowhere is clean.
Coordinates are pixels on 1080×1350 (origin top-left). width 300..520, height 60..96. Keep ≥40px from every outer edge.`;

async function fileToVisionDataUrl(filePath: string): Promise<string> {
  const jpeg = await sharp(filePath)
    .resize({ width: 768, height: 960, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

/** Clamp + validate AD bbox into a usable chip rect. */
export function normalizeVocabGuideVisionRect(
  raw: Record<string, unknown>,
): GuideRect | null {
  if (raw.found === false) return null;
  const left = Math.round(Number(raw.left));
  const top = Math.round(Number(raw.top));
  const width = Math.round(Number(raw.width));
  const height = Math.round(Number(raw.height));
  if (![left, top, width, height].every((n) => Number.isFinite(n))) return null;
  if (width < 140 || width > 560 || height < 40 || height > 240) return null;
  const aspect = width / Math.max(1, height);
  if (aspect < 1.4 || aspect > 12) return null;
  const L = Math.max(0, Math.min(FRAME_W - 40, left));
  const T = Math.max(0, Math.min(FRAME_H - 40, top));
  const W = Math.min(FRAME_W - L, Math.max(140, width));
  const H = Math.min(FRAME_H - T, Math.max(40, height));
  // Reject logo air / arrow air as the "guide"
  if (L >= 820 && T <= 280) return null;
  if (L >= 820 && T >= 1150) return null;
  return { left: L, top: T, width: W, height: H };
}

export function parseVocabGuideVisionText(text: string): GuideRect | null {
  try {
    const parsed = extractJsonObject(text) as Record<string, unknown>;
    return normalizeVocabGuideVisionRect(parsed);
  } catch {
    return null;
  }
}

/**
 * Ask AD vision for VOCAB_SLOT coords when pixel detect failed.
 * Skip with CAROUSEL_SKIP_VOCAB_VISION=1.
 */
export async function locateVocabGuideViaAdVision(input: {
  slidePath: string;
  session?: JobLlmSession;
}): Promise<VocabGuideVisionResult | null> {
  if (process.env.CAROUSEL_SKIP_VOCAB_VISION?.trim() === "1") return null;

  let image: string;
  try {
    image = await fileToVisionDataUrl(input.slidePath);
  } catch {
    return null;
  }

  const user = `Frame is 1080×1350. Look at this finished slide and return the bounding box for an orange vocab pill (~420×78) placed on a CLEAN area that does NOT overlap any text, CTA, faces, the top-right logo, or the bottom-right arrow. JSON only.`;
  const model = resolveRoleModel("artDirectorFinal").model;

  const res = input.session
    ? await input.session.callMask({
        role: "artDirectorFinal",
        system: SYSTEM,
        user,
        images: [image],
        temperature: 0.1,
        maxTokens: 400,
      })
    : await callAggregatorChat({
        system: SYSTEM,
        user,
        images: [image],
        model,
        temperature: 0.1,
        maxTokens: 400,
        fallbackModels: ["google/gemini-2.0-flash", "openai/gpt-4o"],
      });

  if (!res.ok) return null;
  const rect = parseVocabGuideVisionText(res.text);
  if (!rect) return null;
  return { rect, model: res.model, raw: res.text.slice(0, 500) };
}
