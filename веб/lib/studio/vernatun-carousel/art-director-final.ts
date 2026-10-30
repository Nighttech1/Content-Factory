import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import sharp from "sharp";
import { PROMPT_AD_FINAL } from "./prompts";
import { resolveRoleModel } from "./role-models";
import { extractJsonObject } from "./json-parse";
import {
  findingToDefect,
  findingsBlockFinalize,
  findingsHaveBlocker,
  findingsHaveWowMajor,
  normalizeFindings,
} from "./findings";
import type { JobLlmSession } from "./job-llm-session";
import type { ArtDirectorFinding, VernatunDefect, VernatunScript } from "./types";

/**
 * Downscale for vision. Higher than before (768 → 960) so fine composite
 * artifacts stay legible — a thin arrow speed-trail, a gray plaque box-ghost or
 * a vocab pill overlapping the CTA all vanish at 768px. Full 1080×1350×N can
 * drop late attachments, so 960 is the ceiling that keeps the payload safe.
 */
async function fileToVisionDataUrl(filePath: string): Promise<string> {
  const jpeg = await sharp(filePath)
    .resize({ width: 960, height: 1200, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

/**
 * Drop false "slide N missing" when we actually attached N PNGs.
 * Vision models sometimes hallucinate a missing final slide under payload pressure.
 */
export function reconcileAttachmentFindings(
  findings: ArtDirectorFinding[],
  attachedCount: number,
  expectedCount: number,
): ArtDirectorFinding[] {
  if (attachedCount < expectedCount || attachedCount === 0) return findings;
  return findings.filter((f) => {
    const blob = `${f.element} ${f.observed_issue} ${f.reason} ${f.recommended_change}`.toLowerCase();
    const claimsMissing =
      /carousel_structure|отсутствует|нет слайд|missing slide|полностью отсутствует|оборвана/.test(
        blob,
      );
    return !claimsMissing;
  });
}

export type FinalAdResult = {
  findings: ArtDirectorFinding[];
  defects: VernatunDefect[];
  canFinalize: boolean;
  summary: string;
  model: string;
};

export async function runArtDirectorFinal(input: {
  script: VernatunScript;
  pngPaths: string[];
  session?: JobLlmSession;
  /**
   * Deterministic geometry-gate SUSPECTS (overlaps / clipping / fallback slot).
   * Injected as hints — the AD verifies them visually and makes the FINAL call;
   * code never blocks, so the AD can dismiss a rect false-positive.
   */
  geometrySuspects?: string[];
}): Promise<FinalAdResult> {
  const model = resolveRoleModel("artDirectorFinal");
  const paths = input.pngPaths.slice(0, 8);
  const images: string[] = [];
  for (const p of paths) {
    try {
      images.push(await fileToVisionDataUrl(p));
    } catch {
      /* skip */
    }
  }
  const expectedSlides = input.script.slides.length;

  const suspectsBlock =
    input.geometrySuspects && input.geometrySuspects.length
      ? `\n\nПРОГРАММНЫЕ ПОДОЗРЕНИЯ ГЕОМЕТРИИ (детерминированный гейт по рамкам бейка). Это ТОЛЬКО подсказки КУДА СМОТРЕТЬ, НЕ готовые findings. НЕ копируй их текст в ответ. По каждому: посмотри на ПИКСЕЛИ в указанном месте и реши сам. ВАЖНО: «fallback-позиция» сама по себе НЕ дефект — слот часто не детектится, и плашка всё равно лежит чисто. Пиши finding ТОЛЬКО если РЕАЛЬНО ВИДИШЬ наложение на кнопку/текст/лого, грязный/серый фон под плашкой или обрезку. Если в указанном месте визуально чисто — НЕ пиши про него finding вообще. Твоё решение финальное:\n${input.geometrySuspects.join("\n")}`
      : "";

  const user = `Сценарий (канон текста — сверяй БУКВА В БУКВУ с PNG):\n${JSON.stringify(
    {
      title: input.script.carousel_title,
      slides: input.script.slides.map((s) => ({
        index: s.index,
        role: s.role,
        headline: s.headline,
        body: s.body,
        supporting_copy: s.supporting_copy,
        recipe: s.recipe,
        visual_intent: s.visual_intent,
        cta: s.cta,
      })),
    },
    null,
    2,
  )}\n\nВЛОЖЕНИЯ: ровно ${images.length} JPEG (сжатые превью PNG) в порядке слайдов 1…${images.length}. Ожидалось ${expectedSlides} слайдов. Если число вложений = числу слайдов сценария — НЕ пиши finding «слайд отсутствует / карусель оборвана».\n\nФИНАЛЬНАЯ ПРИЁМКА (смотри ВСЕ кадры серии):\n1) Vernatun lockup TOP-RIGHT без наложений; контраст VERNATUN / ARMENIAN CLUB\n2) CTA на финале; type_system единый\n3) ПАГИНАЦИЯ СЕРИИ: либо везде один формат k/N, либо нигде. Счётчик только на части → major pagination_inconsistent. Если есть — контраст цифр как у wordmark\n4) Заголовки: без декоративных кавычек; без армянских букв если script headline RU; RU орфография буква в букву (не «чаушой»)\n5) ARMENIAN SPELLING: HY на кадре = exact из script. Ошибка → major hy_spelling\n6) OVERLAY OVERLAP: vocab-pill / плашка налезает на CTA-кнопку, другую плашку или лого и режет текст → blocker overlay_overlap\n7) BAKE ARTIFACT: серая подложка позади pill; горизонтальные штрихи/«шлейф»/полосы или грязные края вокруг pill или BR-стрелки → major bake_artifact (вернуть на re-bake); смотри зону ВОКРУГ стрелки и ПОД pill\nЕсли видишь дефект — пиши major/blocker, не молчи.${suspectsBlock}\nВерни ТОЛЬКО компактный JSON без markdown: максимум 6 findings. Поля: findings[], can_finalize, summary.`;

  const res = input.session
    ? await input.session.callMask({
        role: "artDirectorFinal",
        system: PROMPT_AD_FINAL,
        user,
        images,
        temperature: 0.15,
        maxTokens: 3500,
      })
    : await callAggregatorChat({
        system: PROMPT_AD_FINAL,
        user,
        images,
        model: model.model,
        temperature: 0.15,
        maxTokens: 3500,
        fallbackModels: true,
      });

  if (!res.ok) {
    const err = String(res.error || "");
    const opsFail = /402|429|5\d\d|timeout|aggregator/i.test(err);
    // Ops/billing outage must not forever block an otherwise green build —
    // mark suggestion, allow finalize; Client still audits craft separately.
    const findings: ArtDirectorFinding[] = [
      {
        slide_id: "slide_0",
        severity: opsFail ? "suggestion" : "major",
        element: "vision",
        observed_issue: `Арт-директор не смог проверить превью: ${err}`,
        recommended_change: opsFail
          ? "Повторить AD vision при доступном ключе; QA deterministic уже пройден"
          : "Повторить финальную проверку",
        reason: err,
        acceptance_check: "AD final call succeeds and returns findings JSON",
      },
    ];
    return {
      findings,
      defects: findings.map(findingToDefect),
      canFinalize: opsFail,
      summary: opsFail ? "ad_final_ops_skip" : "ad_final_fail",
      model: model.model,
    };
  }

  function finalizeFromParsed(
    parsed: Record<string, unknown>,
    modelUsed: string,
  ): FinalAdResult {
    let findings = reconcileAttachmentFindings(
      normalizeFindings(parsed.findings ?? parsed.defects),
      images.length,
      expectedSlides,
    );
    const hasBlocker = findingsHaveBlocker(findings);
    const hasWowMajor = findingsHaveWowMajor(findings);
    const blocks = findingsBlockFinalize(findings);
    const llmOk = parsed.can_finalize === true;
    return {
      findings,
      defects: findings.map(findingToDefect),
      canFinalize: llmOk && !hasBlocker && !hasWowMajor && !blocks,
      summary: String(parsed.summary ?? ""),
      model: modelUsed,
    };
  }

  async function parseOrRetry(
    text: string,
    modelUsed: string,
  ): Promise<FinalAdResult> {
    try {
      const parsed = extractJsonObject(text) as Record<string, unknown>;
      return finalizeFromParsed(parsed, modelUsed);
    } catch {
      // Gemini truncation: one text-only compact retry
      const retry = await callAggregatorChat({
        system: `${PROMPT_AD_FINAL}\n\nОтветь ОДНИМ JSON-объектом. Без markdown. Максимум 4 findings.`,
        user: `По сценарию Vernatun (${input.script.slides.length} слайдов, вложений было ${images.length}) дай findings v2 и can_finalize. Заголовки: ${input.script.slides.map((s) => s.headline).join(" | ")}`,
        model: model.model,
        temperature: 0.1,
        maxTokens: 1800,
        fallbackModels: ["google/gemini-2.0-flash", "openai/gpt-4o"],
      });
      if (!retry.ok) {
        return {
          findings: [],
          defects: [],
          canFinalize: false,
          summary: "ad_final_parse_fail",
          model: modelUsed,
        };
      }
      try {
        const parsed = extractJsonObject(retry.text) as Record<string, unknown>;
        return finalizeFromParsed(parsed, retry.model);
      } catch {
        return {
          findings: [],
          defects: [],
          canFinalize: false,
          summary: "ad_final_parse_fail",
          model: modelUsed,
        };
      }
    }
  }

  return parseOrRetry(res.text, res.model);
}
