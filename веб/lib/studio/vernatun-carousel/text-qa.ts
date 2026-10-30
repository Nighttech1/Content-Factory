/**
 * Programmatic text / vocab gates — helpers for Art Director (not a replacement).
 * After logo + vocab bake: verify bake log matches script; soft check logo air.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseHyRuVocab } from "./hy-text";
import { logoSafeZoneRect } from "./layout-qa";
import { pickVocabSlot } from "./vocab-plaque-bake";
import type { ArtDirectorFinding, VernatunScript } from "./types";

export type TextQaInput = {
  jobDir: string;
  script: VernatunScript;
  pngPaths: string[];
};

async function logoAirInkHeavy(pngPath: string): Promise<boolean> {
  try {
    const sharp = (await import("sharp")).default;
    const zone = logoSafeZoneRect();
    const { data, info } = await sharp(pngPath)
      .extract({
        left: zone.left,
        top: zone.top,
        width: zone.width,
        height: zone.height,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    let dark = 0;
    const n = info.width * info.height;
    for (let i = 0; i < data.length; i += ch) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // After logo bake, emblem+wordmark legitimately occupy the zone.
      // Flag only if zone is almost empty of brand (no orange/dark ink) — skip.
      // Instead: high-contrast text-like dense non-logo pattern is hard without OCR.
      // Soft heuristic: lots of near-black thin streaks outside typical emblem colors.
      if (lum < 40) dark += 1;
    }
    // Emblem has dark pixels too — don't major on this alone.
    void dark;
    void n;
    return false;
  } catch {
    return false;
  }
}

/**
 * Build findings that AD merge should respect.
 * - Missing supporting_copy → major
 * - vocab_bake.json missing / mismatch → major hy_vocab_bake
 * - Mid without dashedExpected logged → minor note
 */
export async function runProgrammaticTextQa(
  input: TextQaInput,
): Promise<ArtDirectorFinding[]> {
  const findings: ArtDirectorFinding[] = [];
  const n = input.script.slides.length;
  const bakePath = path.join(input.jobDir, "prompts", "vocab_bake.json");
  let bakeRows: Array<{
    slideIndex?: number;
    hyRu?: string;
    slot?: string;
    dashedExpected?: boolean;
  }> = [];

  if (!existsSync(bakePath)) {
    findings.push({
      slide_id: "slide_0",
      severity: "major",
      element: "hy_vocab_bake",
      observed_issue: "vocab_bake.json отсутствует — HY pill не запечён",
      recommended_change: "Запустить vocab_plaque_bake на все слайды",
      reason: "programmatic_text_qa",
      acceptance_check: "prompts/vocab_bake.json есть и совпадает со script",
    });
  } else {
    try {
      const raw = JSON.parse(await readFile(bakePath, "utf8")) as {
        slides?: typeof bakeRows;
      };
      bakeRows = Array.isArray(raw.slides) ? raw.slides : [];
    } catch {
      findings.push({
        slide_id: "slide_0",
        severity: "major",
        element: "hy_vocab_bake",
        observed_issue: "vocab_bake.json битый JSON",
        recommended_change: "Перезаписать vocab bake log",
        reason: "programmatic_text_qa",
        acceptance_check: "валидный vocab_bake.json",
      });
    }
  }

  for (const slide of input.script.slides) {
    const sid = `slide_${slide.index}`;
    const pair = parseHyRuVocab(slide.supporting_copy);
    if (!pair) {
      findings.push({
        slide_id: sid,
        severity: "major",
        element: "hy_vocab",
        observed_issue: "В сценарии нет ровно одного HY—RU в supporting_copy",
        recommended_change: "Исправить supporting_copy формата «Հայերեն — русский»",
        reason: "programmatic_text_qa",
        acceptance_check: "1 HY—RU на слайд",
      });
      continue;
    }
    const expected = `${pair.hy} — ${pair.ru}`;
    const used =
      bakeRows.find((r) => Number(r.slideIndex) === slide.index) ??
      bakeRows[slide.index - 1];
    if (!used?.hyRu) {
      findings.push({
        slide_id: sid,
        severity: "major",
        element: "hy_vocab_bake",
        observed_issue: `Нет bake-записи для слайда ${slide.index}`,
        recommended_change: "Перезапечь vocab plaque",
        reason: "programmatic_text_qa",
        acceptance_check: "hyRu в vocab_bake = script",
      });
      continue;
    }
    const bakedPair = parseHyRuVocab(used.hyRu);
    if (
      !bakedPair ||
      bakedPair.hy !== pair.hy ||
      bakedPair.ru.toLowerCase() !== pair.ru.toLowerCase()
    ) {
      findings.push({
        slide_id: sid,
        severity: "major",
        element: "hy_vocab_bake",
        observed_issue: `Bake HY «${used.hyRu}» ≠ script «${expected}»`,
        recommended_change: "Перезапечь pill из script.supporting_copy",
        reason: "programmatic_text_qa",
        acceptance_check: "exact HY—RU match",
      });
    }
    const plan = pickVocabSlot(slide.index, n);
    if (plan.dashed && used.dashedExpected === false) {
      findings.push({
        slide_id: sid,
        severity: "minor",
        element: "vocab_slot",
        observed_issue: "Ожидался dashed VOCAB_SLOT (free composition) в логе bake",
        recommended_change: "Проверить image-prompt VOCAB SLOT",
        reason: "programmatic_text_qa",
        acceptance_check: "dashedExpected=true",
      });
    }
    if (
      used &&
      (used as { detected?: boolean }).detected === false &&
      plan.dashed
    ) {
      findings.push({
        slide_id: sid,
        severity: "major",
        element: "vocab_slot_detect",
        observed_issue:
          "Гайд VOCAB_SLOT не детектирован — pill в fallback, пунктир может остаться на кадре",
        recommended_change:
          "Пунктир CYAN #00E8FF (legacy magenta OK) + detect; не финалить с leftover",
        reason: "programmatic_text_qa",
        acceptance_check: "detected=true в vocab_bake.json; нет видимого пунктира",
      });
    }
  }

  // Soft logo-air pass (no OCR) — reserved
  for (let i = 0; i < input.pngPaths.length; i++) {
    const p = input.pngPaths[i]!;
    if (await logoAirInkHeavy(p)) {
      findings.push({
        slide_id: `slide_${i + 1}`,
        severity: "minor",
        element: "logo_air",
        observed_issue: "Подозрение на текст в logo air (soft)",
        recommended_change: "Проверить наезд глазами / regen",
        reason: "programmatic_text_qa",
        acceptance_check: "logo air без постороннего текста",
      });
    }
  }

  return findings;
}
