/**
 * Vernatun carousel orchestrator — Mode A/B, AD loops, QA, packaging.
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { readSyncedActiveDesign } from "@/lib/settings/design-active-server";
import {
  createDefaultVernatunPreset,
  designPresetToCssVars,
} from "@/lib/settings/design-preset";
import { getBrandSettings } from "@/lib/settings/brand-store";
import { SEED_ADMIN_USER_ID } from "@/lib/db/actor";

import { resolveFactCheckBranch } from "./fact-check-flag";
import { runScriptwriter } from "./scriptwriter";
import { runScriptPhaseWithOptionalFactCheck } from "./script-factcheck-pipeline";
import { runImagePlanner } from "./image-planner";
import { prepareSlideImages } from "./image-gen";
import {
  appendDevTrace,
  writeAdVerdictLog,
  writePromptLog,
} from "./prompt-dev-log";
import { resolveVernatunEmblemPath } from "./mode-b-brand-chrome";
import {
  findingsBlockFinalize,
  findingsHaveBlocker,
} from "./findings";
import {
  captionsFromScript,
  ensurePublicUrls,
  renderByMode,
} from "./renderer";
import { runProgrammaticQa } from "./qa";
import { runArtDirectorFinal } from "./art-director-final";
import {
  mergeLayoutFindings,
  runProgrammaticLayoutQa,
} from "./layout-qa";
import { runProgrammaticTextQa } from "./text-qa";
import { applyRepairs } from "./repair";
import { runPipelineSupervisor } from "./pipeline-supervisor";
import { listRoleModelDefaults, isImageRegenAllowed } from "./role-models";
import { createJobLlmSession } from "./job-llm-session";
import {
  colorsNoteFrom,
  designColorsHash,
  ensureReadableDesignColors,
  type DesignColors,
} from "./design-colors";
import { appendToolLog } from "./tools/tool-log";
import { assertUserAssetsResolved } from "./ingest-user-assets";
import { lintRecipeDiversity } from "./recipes";
import { findingToDefect } from "./findings";
import type {
  AssetManifestRow,
  SlideGeometryOverride,
  VernatunJobBrief,
  VernatunJobResult,
  VernatunProgressFn,
  VernatunReleaseStatus,
  VernatunScript,
  VernatunSlideOut,
} from "./types";

async function logTool(
  jobDir: string,
  name: string,
  args: Record<string, unknown>,
  ok: boolean,
  detail?: string,
) {
  await appendToolLog(jobDir, {
    at: new Date().toISOString(),
    name,
    args,
    ok,
    detail,
  });
}

/**
 * Dev default = 0: one generate → AD APPROVED|REMARKS log → team fixes (no $ regen loops).
 * Production: set CAROUSEL_MAX_REPAIR=2 or brief.maxRepairCycles.
 */
function maxRepairCycles(briefMax?: number): number {
  const raw = process.env.CAROUSEL_MAX_REPAIR ?? briefMax;
  if (raw === undefined || raw === null || raw === "") return 0;
  const env = Number(raw);
  if (!Number.isFinite(env)) return 0;
  return Math.min(2, Math.max(0, Math.round(env)));
}

function progress(
  fn: VernatunProgressFn | undefined,
  agent: string,
  message: string,
) {
  return Promise.resolve(fn?.(agent, message));
}

function colorsFromPreset(): DesignColors {
  const preset = createDefaultVernatunPreset();
  const vars = designPresetToCssVars(preset);
  return ensureReadableDesignColors({
    panel:
      vars["--cf-design-surface"] ||
      vars["--cf-design-bg"] ||
      "#f4f0e9",
    ink: vars["--cf-design-text"] || vars["--cf-design-ink"] || "#171513",
    accent: vars["--cf-design-accent"] || vars["--cf-design-primary"] || "#e66e3e",
    pageBg: vars["--cf-design-bg"] || "#dedbd6",
  });
}

async function resolveColors(): Promise<{
  colors: DesignColors;
  source: "active_design" | "default_vernatun_preset";
  designPresetId?: string;
}> {
  const synced = await readSyncedActiveDesign();
  if (synced?.presetFile) {
    const vars = designPresetToCssVars(synced.presetFile);
    // Colors ONLY from Design MD preset — then ensure Mode A panel contrast.
    return {
      colors: ensureReadableDesignColors({
        panel:
          vars["--cf-design-surface"] ||
          vars["--cf-design-bg"] ||
          "#f4f0e9",
        ink: vars["--cf-design-text"] || "#171513",
        accent: vars["--cf-design-accent"] || "#e66e3e",
        pageBg: vars["--cf-design-bg"] || "#dedbd6",
      }),
      source: "active_design",
      designPresetId: synced.presetFile?.preset || synced.name || "active",
    };
  }
  return {
    colors: colorsFromPreset(),
    source: "default_vernatun_preset",
  };
}

async function resolveBrandLogoDataUrl(
  logoRef: string,
): Promise<string> {
  if (logoRef.startsWith("data:")) return logoRef;
  if (logoRef.startsWith("http")) {
    try {
      const res = await fetch(logoRef);
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = res.headers.get("content-type") || "image/png";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      /* fallthrough */
    }
  }
  const rel = logoRef.startsWith("/")
    ? path.join(process.cwd(), "public", logoRef.slice(1))
    : path.join(process.cwd(), logoRef);
  try {
    const buf = await readFile(rel);
    const ext = path.extname(rel).toLowerCase();
    const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    // 1x1 transparent
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  }
}

export async function runVernatunScriptPhase(
  brief: VernatunJobBrief,
  onProgress?: VernatunProgressFn,
): Promise<{ jobId: string; script: VernatunScript; model: string }> {
  await progress(onProgress, "Сценарист", "Пишу структуру и тексты слайдов…");
  const { script, model } = await runScriptwriter(brief);
  await progress(
    onProgress,
    "Сценарист",
    `Сценарий готов (${script.slides.length} слайдов). Жду вашего согласования.`,
  );
  return { jobId: randomUUID(), script, model };
}

export async function runVernatunCarouselJob(input: {
  brief: VernatunJobBrief;
  /** Pre-approved script; if omitted and skipScriptApproval, generates now. */
  approvedScript?: VernatunScript;
  jobId?: string;
  onProgress?: VernatunProgressFn;
}): Promise<VernatunJobResult> {
  // Mode A removed — carousels always generate full AI slides (Mode B).
  // Any legacy "A" request is coerced so the A code paths below never execute.
  if (input.brief.buildMode !== "B") {
    input.brief = { ...input.brief, buildMode: "B" };
  }
  const jobId = input.jobId ?? randomUUID();
  const jobDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-jobs",
    jobId,
  );
  await mkdir(path.join(jobDir, "reports"), { recursive: true });
  await mkdir(path.join(jobDir, "prompts"), { recursive: true });
  await writeFile(
    path.join(jobDir, "brief.json"),
    JSON.stringify(input.brief, null, 2),
    "utf8",
  );
  const session = createJobLlmSession(jobId);
  const defaults = listRoleModelDefaults();
  const textCfg = {
    provider: session.model.includes("/")
      ? session.model.split("/")[0]!
      : "openai",
    model: session.model,
  };
  const roleModelsFact = {
    ...defaults,
    orchestrator: textCfg,
    scriptwriter: textCfg,
    artDirectorScript: textCfg,
    imagePlanner: textCfg,
    designer: textCfg,
    artDirectorFinal: textCfg,
    _session: {
      textModel: session.model,
      note: "All text masks share one JobLlmSession transcript (env per-role ignored for product path)",
    },
  };
  await writeFile(
    path.join(jobDir, "role-models.json"),
    JSON.stringify(roleModelsFact, null, 2),
    "utf8",
  );

  const empty: VernatunJobResult = {
    ok: false,
    jobId,
    buildMode: input.brief.buildMode,
    status: "SCRIPT_PENDING",
    script: null,
    slides: [],
    remarks: [],
    defects: [],
    qa: null,
    jobDir,
    repairCycles: 0,
  };

  try {
    const factFlag = resolveFactCheckBranch(input.brief);
    let script = input.approvedScript ?? null;
    if (!script) {
      // Human chat gate (UI). Headless/smoke uses skipScriptApproval=true.
      if (!input.brief.skipScriptApproval) {
        return {
          ...empty,
          error: "script_approval_required",
          remarks: ["Сначала согласуйте сценарий в чате."],
        };
      }
      // FACT_CHECK: don't draft final claims before Research — pipeline writes later.
      // STANDARD: draft now as before.
      if (factFlag.branch === "STANDARD") {
        await progress(
          input.onProgress,
          "Сценарист",
          "Маска 1: пишу виральный сценарий + словарь HY…",
        );
        const sw = await runScriptwriter(input.brief, session);
        script = sw.script;
        await writePromptLog(jobDir, "01_script_system.md", sw.system);
        await writePromptLog(jobDir, "01_script_user.md", sw.user);
        await writePromptLog(
          jobDir,
          "01_script_out.json",
          JSON.stringify(script, null, 2),
        );
        await appendDevTrace(
          jobDir,
          `scriptwriter model=${sw.model}; slide_count=${script.slide_count ?? script.slides.length}; fact_branch=STANDARD`,
        );
        await logTool(
          jobDir,
          "write_script",
          {
            topic: input.brief.topic,
            slide_count: script.slide_count ?? script.slides.length,
            fact_branch: "STANDARD",
          },
          true,
        );
      } else {
        await appendDevTrace(
          jobDir,
          `fact_branch=FACT_CHECK raw=${factFlag.raw}; defer script until Research`,
        );
      }
    }

    if (script) {
      await writeFile(
        path.join(jobDir, "script.json"),
        JSON.stringify(script, null, 2),
        "utf8",
      );
    }
    await writePromptLog(
      jobDir,
      "00_brief.md",
      `# Brief\n\ntopic: ${input.brief.topic}\nbuildMode: ${input.brief.buildMode}\nslideCount hint/force: ${input.brief.slideCount ?? "AD chooses"}\nuserAssets: ${(input.brief.userAssets ?? []).length}\nfact_branch: ${factFlag.branch}\nfact_raw: ${factFlag.raw || "(empty)"}\nsheetRowKey: ${input.brief.sheetRowKey ?? ""}\n`,
    );
    if (input.approvedScript) {
      await logTool(jobDir, "write_script", { source: "approved" }, true);
    }

    let adScript = {
      approved: true,
      defects: [] as import("./types").VernatunDefect[],
      notes: "",
      model: "skipped",
      rounds: 0,
    };
    /** True when FACT_CHECK ran but research/final FC did not fully pass. */
    let factCheckNotVerified = false;
    if (process.env.CAROUSEL_SKIP_AD_SCRIPT?.trim() !== "1") {
      await progress(
        input.onProgress,
        "Арт-директор (сценарий)",
        factFlag.branch === "FACT_CHECK"
          ? "Маска AD: ветка FACT_CHECK — Research + Fact-Checker + смысл…"
          : "Маска 2: проверяю смысл, пользу, виральность (STANDARD — без фактчека)…",
      );
      const approval = await runScriptPhaseWithOptionalFactCheck({
        brief: input.brief,
        script: script ?? undefined,
        session,
        onProgress: input.onProgress,
        onLog: async (log) => {
          await writePromptLog(
            jobDir,
            "01_factcheck_pipeline.json",
            JSON.stringify(
              {
                branch: log.branch,
                factCheckRaw: log.factCheckRaw,
                warning: log.warning,
                questions: log.questions,
                research_available: log.research?.research_available,
                unavailable_reason: log.research?.unavailable_reason,
                claims: log.research?.claims,
                factCheckResearch: log.factCheckResearch,
                factCheckFinal: log.factCheckFinal,
                blocked: log.blocked,
                blockReason: log.blockReason,
              },
              null,
              2,
            ),
          );
          if (log.research) {
            await writePromptLog(
              jobDir,
              "01_research_report.json",
              JSON.stringify(log.research, null, 2),
            );
          }
        },
      });
      script = approval.script;
      factCheckNotVerified = Boolean(approval.factLog.blocked);
      adScript = {
        approved: approval.approved,
        defects: approval.defects,
        notes: approval.notes,
        model: approval.model,
        rounds: approval.rounds,
      };
      await writeFile(
        path.join(jobDir, "script.json"),
        JSON.stringify(script, null, 2),
        "utf8",
      );
      await writePromptLog(
        jobDir,
        "01_script_out.json",
        JSON.stringify(script, null, 2),
      );
      await writePromptLog(
        jobDir,
        "01_script_ad_verdict.json",
        JSON.stringify(
          {
            approved: approval.approved,
            verdict: approval.verdict,
            rounds: approval.rounds,
            notes: approval.notes,
            defects: approval.defects,
            fact_branch: approval.factLog.branch,
            fact_blocked: approval.factLog.blocked,
            fact_block_reason: approval.factLog.blockReason,
          },
          null,
          2,
        ),
      );
      // Hard stop only when editorial AD rejected. Fact-check soft-fail continues
      // to visuals but cannot claim verified FINAL (see factCheckNotVerified).
      if (!approval.approved) {
        const scriptRemarks = [
          "Сценарий не согласован маской арт-директора — картинки не запускались.",
          ...approval.defects.map(
            (d) =>
              `[${d.priority}] слайд ${d.slide_index}: ${d.reason} → ${d.fix}`,
          ),
        ];
        await writeAdVerdictLog({
          jobDir,
          verdict: "REMARKS",
          canFinalize: false,
          findings: approval.defects.map((d) => ({
            slide_id: `slide_${d.slide_index || 0}`,
            severity:
              d.priority === "BLOCKER"
                ? ("blocker" as const)
                : d.priority === "MINOR"
                  ? ("minor" as const)
                  : ("major" as const),
            element: d.element,
            observed_issue: d.reason,
            recommended_change: d.fix,
            reason: "ad_script_gate",
            acceptance_check: "Сценарий APPROVED двумя масками",
          })),
          repairCycle: 0,
          maxRepair: 0,
          summary: approval.notes || "script_not_approved",
        });
        await logTool(
          jobDir,
          "finalize",
          {
            status: "BLOCKED_WITH_REMARKS",
            stage: "script_ad",
          },
          false,
          "script_not_approved",
        );
        return {
          ...empty,
          ok: true,
          status: "BLOCKED_WITH_REMARKS" as VernatunReleaseStatus,
          script,
          slides: [] as VernatunSlideOut[],
          remarks: scriptRemarks,
          defects: approval.defects,
          qa: null,
          repairCycles: 0,
        };
      }
    } else {
      if (!script) {
        const sw = await runScriptwriter(input.brief, session);
        script = sw.script;
      }
      await progress(
        input.onProgress,
        "Арт-директор (сценарий)",
        "Пропуск сценарной проверки (CAROUSEL_SKIP_AD_SCRIPT=1).",
      );
    }

    await progress(
      input.onProgress,
      "Менеджер изображений",
      "Сценарий APPROVED — распределяю фото / генерирую слайды…",
    );
    const plan = await runImagePlanner({
      brief: input.brief,
      script,
      session,
    });

    const brand = await getBrandSettings(SEED_ADMIN_USER_ID);
    const logoDataUrl = await resolveBrandLogoDataUrl(brand.logoRef);
    const colorPack = await resolveColors();
    const colors = colorPack.colors;
    const colorsNote = colorsNoteFrom(colors);
    const colorsHash = designColorsHash(colors);
    await logTool(
      jobDir,
      "load_design_colors",
      { source: colorPack.source, hash: colorsHash },
      true,
      colorPack.designPresetId,
    );
    await writeFile(
      path.join(jobDir, "brief.json"),
      JSON.stringify(
        {
          ...input.brief,
          designColors: colors,
          designColorsHash: colorsHash,
          designColorsSource: colorPack.source,
          designPresetId: colorPack.designPresetId ?? null,
        },
        null,
        2,
      ),
      "utf8",
    );

    const userAssets = input.brief.userAssets ?? [];
    const userAssetPathById = new Map(
      userAssets.map((a) => [a.asset_id, a.path]),
    );
    await writePromptLog(
      jobDir,
      "02_image_plan.json",
      JSON.stringify(plan, null, 2),
    );
    await logTool(
      jobDir,
      "plan_images",
      { slots: plan.slots.length, userAssets: userAssets.length },
      true,
    );

    await progress(
      input.onProgress,
      "Менеджер изображений",
      input.brief.buildMode === "B"
        ? "Генерирую целые слайды (режим B, native logo)…"
        : "Фото: user → web → GPT Image fallback (режим A)…",
    );
    const logoPath = resolveVernatunEmblemPath();
    let images = await prepareSlideImages({
      jobDir,
      topic: input.brief.topic,
      script,
      slots: plan.slots,
      buildMode: input.brief.buildMode,
      brandName: brand.brandName,
      colorsNote,
      visualStyle: colorsNote,
      userAssetPathById,
      logoPath,
    });

    const manifest: AssetManifestRow[] = images.map((i) => i.manifest);
    // Mark used user assets (direct use_user OR Mode B photo reference)
    for (const row of manifest) {
      if (row.source_type === "user") {
        const id = row.source_url_or_provider;
        const asset = userAssets.find((a) => a.asset_id === id);
        if (asset) asset.status = "used";
      }
    }
    for (const slot of plan.slots) {
      if (slot.user_asset_id) {
        const asset = userAssets.find((a) => a.asset_id === slot.user_asset_id);
        if (asset) asset.status = "used";
      }
    }
    if (input.brief.buildMode === "B" && userAssets.length) {
      for (const a of userAssets) {
        if (a.status !== "rejected") a.status = "used";
      }
    }
    await writeFile(
      path.join(jobDir, "reports", "ASSET_MANIFEST.json"),
      JSON.stringify(manifest, null, 2),
      "utf8",
    );

    // Mode B only: slides are already full images; no HTML/CSS layout pass.
    const htmlPaths: string[] = [];
    const templates: string[] = [];
    const recipes: string[] = [];
    const brandModes: string[] = [];
    const textModes: string[] = [];
    await progress(
      input.onProgress,
      "Дизайнер",
      "Режим B: слайды уже как цельные изображения…",
    );
    await logTool(jobDir, "build_and_render", { mode: "B" }, true);

    const renderedDir = path.join(jobDir, "rendered");
    await progress(input.onProgress, "Рендерер", "Экспорт PNG 1080×1350…");
    let pngPaths = await renderByMode({
      buildMode: input.brief.buildMode,
      htmlPaths,
      images,
      renderedDir,
      brand: {
        logoDataUrl,
        brandName: brand.brandName,
        tagline: brand.tagline || "moscow armenian speaking club",
      },
      script,
      jobId,
      jobDir,
      session,
    });

    let repairCycles = 0;
    let remarks: string[] = [];
    let lastDefects = adScript.defects;
    let lastFindings: import("./types").ArtDirectorFinding[] = lastDefects.map(
      (d) => ({
        slide_id: `slide_${d.slide_index}`,
        severity:
          d.priority === "BLOCKER"
            ? ("blocker" as const)
            : d.priority === "MAJOR"
              ? ("major" as const)
              : ("minor" as const),
        element: d.element,
        observed_issue: d.reason,
        recommended_change: d.fix,
        reason: d.reason,
        acceptance_check: d.fix,
      }),
    );
    let geometry: SlideGeometryOverride[] = [];
    let status: VernatunReleaseStatus = "BUILDING";
    const MAX_REPAIR = maxRepairCycles(input.brief.maxRepairCycles);

    // Block FINAL if any asset is quality BLOCKED
    const blockedAssets = manifest.filter((m) => m.quality_status === "BLOCKED");

    while (repairCycles <= MAX_REPAIR) {
      await progress(input.onProgress, "QA", "Программные проверки…");
      const qa = await runProgrammaticQa({
        buildMode: input.brief.buildMode,
        script,
        pngPaths,
        manifest,
        templates,
      });
      await writeFile(
        path.join(jobDir, "reports", "QA_RELEASE_REPORT.json"),
        JSON.stringify(qa, null, 2),
        "utf8",
      );

      await progress(
        input.onProgress,
        "Главный арт-директор",
        "Сценарий уже согласован — смотрю сборку картинок и замечания сборщику…",
      );
      // Deterministic geometry gate → CANDIDATES; AD verifies + decides final.
      const { runGeometryGate, geometrySuspectsToPromptLines } = await import(
        "./geometry-gate"
      );
      const geometrySuspects = geometrySuspectsToPromptLines(
        await runGeometryGate(jobDir),
      );
      if (geometrySuspects.length) {
        await logTool(
          jobDir,
          "geometry_gate",
          { suspects: geometrySuspects.length },
          true,
        );
      }
      const adFinalRaw = await runArtDirectorFinal({
        script,
        pngPaths,
        session,
        geometrySuspects,
      });
      await progress(
        input.onProgress,
        "Layout QA (код)",
        "Проверяю safe zone лого, отступы от краёв и мусорные направляющие…",
      );
      // Deterministic layout gate (not LLM): logo zone, edge margins, orange guides.
      const layoutFindings = await runProgrammaticLayoutQa({
        pngPaths,
        jobDir,
      });
      await progress(
        input.onProgress,
        "Text QA (код)",
        "Сверяю HY bake со сценарием (помощь арт-директору)…",
      );
      const textFindings = await runProgrammaticTextQa({
        jobDir,
        script,
        pngPaths,
      });
      // Gemini often flags template_clone even when recipes are already unique —
      // demote those to minor when diversity lint is green (Client still sees notes).
      const diversity = lintRecipeDiversity(recipes);
      let adFindings = mergeLayoutFindings(
        [...layoutFindings, ...textFindings],
        adFinalRaw.findings,
      );
      // B4.5: HY painted by HTML bake — demote AD hy_spelling majors (GPT no longer paints HY).
      adFindings = adFindings.map((f) => {
        const blob = `${f.element} ${f.observed_issue}`.toLowerCase();
        if (
          (f.severity === "major" || f.severity === "blocker") &&
          /hy_spelling|армян|armenian|glyph|глиф|vocab.?chip/.test(blob) &&
          !/hy_vocab_bake|supporting/.test(blob)
        ) {
          return {
            ...f,
            severity: "minor" as const,
            reason: `${f.reason}|demoted_html_vocab_bake`,
          };
        }
        return f;
      });
      if (diversity.ok && diversity.adjacentClones === 0) {
        adFindings = adFindings.map((f) => {
          const blob =
            `${f.element} ${f.observed_issue} ${f.reason}`.toLowerCase();
          if (
            (f.severity === "major" || f.severity === "blocker") &&
            /template_clone|клон|одинаков(ый|ые) (шаблон|силуэт)|template clone|пустот|пустой (правый|блок|слон)|hyphen|перенос|дефис|footer_brand|единое положение футера|единый футер|бренд.?блок.*идентич|положение знака/.test(
              blob,
            ) &&
            !/concert|концерт|сцен|user.?asset|нечитаем|сливает/.test(blob)
          ) {
            return { ...f, severity: "minor" as const };
          }
          return f;
        });
      }
      // Programmatic layout majors ALWAYS kill FINAL (LLM cannot override).
      const layoutBlocks = findingsBlockFinalize(layoutFindings);
      const adFinal = {
        ...adFinalRaw,
        findings: adFindings,
        defects: adFindings.map(findingToDefect),
        canFinalize:
          !layoutBlocks &&
          !findingsHaveBlocker(adFindings) &&
          !findingsBlockFinalize(adFindings) &&
          (adFinalRaw.canFinalize ||
            (!findingsBlockFinalize(adFindings) && diversity.ok)),
      };
      lastDefects = adFinal.defects;
      lastFindings = adFinal.findings;
      // HARD: team-facing AD log — always written (APPROVED or REMARKS).
      await writeAdVerdictLog({
        jobDir,
        canFinalize: adFinal.canFinalize,
        summary: adFinal.summary,
        findings: adFinal.findings,
        repairCycle: repairCycles,
        maxRepair: MAX_REPAIR,
      });
      await writeFile(
        path.join(jobDir, "reports", "QA_VISUAL_REVIEW.md"),
        `# Visual review\n\n**См. также:** \`prompts/AD_VERDICT.md\` (лог для команды разработки)\n\n${adFinal.summary}\n\n${adFinal.findings
          .map(
            (f) =>
              `- [${f.severity}] ${f.slide_id} · ${f.element}: ${f.observed_issue} → ${f.recommended_change} (check: ${f.acceptance_check})`,
          )
          .join("\n")}\n`,
        "utf8",
      );
      await writeFile(
        path.join(jobDir, "session-transcript.json"),
        JSON.stringify(session.dump(), null, 2),
        "utf8",
      );

      await logTool(
        jobDir,
        "qa_auto",
        { status: qa.status, blockers: qa.blockers.length },
        qa.status === "PASS",
      );
      await logTool(
        jobDir,
        "vision_review",
        {
          canFinalize: adFinal.canFinalize,
          findings: adFinal.findings.length,
        },
        true,
        adFinal.summary.slice(0, 200),
      );

      const usedIds = new Set<string>([
        ...manifest
          .filter((m) => m.source_type === "user")
          .map((m) => m.source_url_or_provider),
        ...userAssets.filter((a) => a.status === "used").map((a) => a.asset_id),
        ...plan.slots
          .map((s) => s.user_asset_id)
          .filter((id): id is string => Boolean(id)),
      ]);
      const userGate = assertUserAssetsResolved({
        userAssets,
        usedAssetIds: usedIds,
      });

      const blockers = [
        ...qa.blockers,
        ...blockedAssets.map(
          (a) => `BLOCKED asset ${a.slide_id}: ${a.rejection_reason ?? "quality"}`,
        ),
        ...adFinal.defects
          .filter((d) => d.priority === "BLOCKER")
          .map((d) => d.reason),
        ...(!userGate.ok
          ? [`user_assets_unresolved:${userGate.unresolved.join(",")}`]
          : []),
      ];
      const blockingFindings = findingsBlockFinalize(adFinal.findings);
      const canFinal =
        qa.status === "PASS" &&
        adFinal.canFinalize &&
        blockers.length === 0 &&
        blockedAssets.length === 0 &&
        userGate.ok &&
        !blockingFindings &&
        !factCheckNotVerified;

      if (canFinal) {
        status = "FINAL";
        remarks = adFinal.defects
          .filter((d) => d.priority === "MINOR")
          .map((d) => `Слайд ${d.slide_index}: ${d.reason}`);
        await logTool(
          jobDir,
          "finalize",
          { status: "FINAL" },
          true,
          "can_final",
        );
        break;
      }

      if (repairCycles >= MAX_REPAIR) {
        // Client: no soft FINAL on leftover wow-majors / unresolved user assets.
        status = "BLOCKED_WITH_REMARKS";
        remarks = [
          `Есть замечания после ${repairCycles} циклов ремонта — не FINAL (клиент без поблажек).`,
          ...(factCheckNotVerified
            ? [
                "FACT_CHECK: исследование/проверка не подтверждены — нельзя сдавать как проверенные факты.",
              ]
            : []),
          ...blockers,
          ...(blockingFindings ? ["major_or_blocker_unresolved"] : []),
          ...adFinal.defects.map(
            (d) => `[${d.priority}] слайд ${d.slide_index}: ${d.reason}`,
          ),
        ];
        await logTool(
          jobDir,
          "finalize",
          { status: "BLOCKED_WITH_REMARKS" },
          false,
          "max_repair",
        );
        break;
      }

      repairCycles += 1;
      await progress(
        input.onProgress,
        "Repair loop",
        `Исправляю отмеченные дефекты (цикл ${repairCycles}/${MAX_REPAIR})…`,
      );
      await logTool(
        jobDir,
        "repair_slides",
        { cycle: repairCycles, findings: adFinal.findings.length },
        true,
      );
      const repaired = applyRepairs(script, adFinal.findings);
      script = repaired.script;
      // AD: per-slide wordmark tint (club name contrast) → lock into logo_bake.json
      if (
        repaired.logoWordmarkBySlide &&
        Object.keys(repaired.logoWordmarkBySlide).length &&
        input.brief.buildMode === "B"
      ) {
        const {
          applyWordmarkOverridesToMeta,
          ensureLogoBakeJobMeta,
          resolveLogoBakeEmblemPath,
        } = await import("./logo-bake");
        const emblemPath = resolveLogoBakeEmblemPath() || logoPath || "";
        if (emblemPath) {
          const meta = await ensureLogoBakeJobMeta(jobDir, jobId, emblemPath);
          await applyWordmarkOverridesToMeta(
            jobDir,
            meta,
            repaired.logoWordmarkBySlide,
          );
        }
      }
      // Never strip photos into graphic gradients on last cycle — that killed viral posters.
      // Bad stock is handled inside applyRepairs (concert/stage only).
      // Merge geometry overrides across cycles
      const geoMap = new Map(geometry.map((g) => [g.slideIndex, g]));
      for (const g of repaired.geometry) {
        geoMap.set(g.slideIndex, { ...geoMap.get(g.slideIndex), ...g });
      }
      geometry = [...geoMap.values()];

      // C-REMARKS-TO-BAKE-03: vision remarks → CHEAP re-bake only. GPT image
      // re-generation is EXPENSIVE and OFF by default (enable with
      // CAROUSEL_ALLOW_IMAGE_REGEN=1). Without it the scene is never re-drawn — the
      // cheap bake repairs (wordmark tint / geometry) from applyRepairs still apply
      // and renderByMode below re-bakes the overlay layer.
      if (
        repaired.slidesToRegen.length &&
        input.brief.buildMode === "B" &&
        isImageRegenAllowed()
      ) {
        const regenSet = new Set(repaired.slidesToRegen);
        const slots = plan.slots.filter((s) => regenSet.has(s.slide_index));
        if (slots.length) {
          const regenImages = await prepareSlideImages({
            jobDir,
            topic: input.brief.topic,
            script,
            slots,
            buildMode: "B",
            brandName: brand.brandName,
            colorsNote,
            visualStyle: colorsNote,
            userAssetPathById,
            logoPath,
          });
          const map = new Map(images.map((i) => [i.slideIndex, i]));
          for (const ri of regenImages) map.set(ri.slideIndex, ri);
          images = [...map.values()].sort((a, b) => a.slideIndex - b.slideIndex);
        }
      } else if (repaired.slidesToRegen.length && input.brief.buildMode === "B") {
        await logTool(
          jobDir,
          "image_regen_skipped",
          { slides: repaired.slidesToRegen.length, reason: "no_regen_default" },
          true,
          "remarks → bake-only re-bake (CAROUSEL_ALLOW_IMAGE_REGEN!=1)",
        );
      }

      pngPaths = await renderByMode({
        buildMode: input.brief.buildMode,
        htmlPaths,
        images,
        renderedDir,
        brand: {
          logoDataUrl,
          brandName: brand.brandName,
          tagline: brand.tagline || "moscow armenian speaking club",
        },
        script,
        jobId,
        jobDir,
        session,
      });
    }

    const urls = await ensurePublicUrls(pngPaths, jobId);
    const captions = captionsFromScript(script);
    const slides: VernatunSlideOut[] = pngPaths.map((p, i) => ({
      id: `slide-${i + 1}`,
      index: i + 1,
      imageUrl: urls[i] ?? p,
      caption: captions[i] ?? "",
      htmlPath: htmlPaths[i],
      pngPath: p,
    }));

    const qaFinal = await runProgrammaticQa({
      buildMode: input.brief.buildMode,
      script,
      pngPaths,
      manifest,
      templates,
    });
    qaFinal.visual_review = "done";

    await progress(
      input.onProgress,
      "Арт-директор",
      "Надзор пайплайна: сверка QA + замечаний…",
    );
    const supervised = await runPipelineSupervisor({
      buildMode: input.brief.buildMode,
      qa: qaFinal,
      defects: lastDefects,
      proposedStatus: status,
      remarks,
    });
    status = supervised.status;
    remarks = supervised.remarks.length ? supervised.remarks : remarks;

    const summaryPayload = {
      status,
      buildMode: input.brief.buildMode,
      repairCycles,
      remarks,
      designColorsHash: colorsHash,
      designColorsSource: colorPack.source,
      designPresetId: colorPack.designPresetId ?? null,
      recipes,
      templates,
      brandModes,
      textModes,
      supervisor: {
        model: supervised.model,
        summary: supervised.summary,
      },
      slides: slides.map((s) => s.imageUrl),
    };
    await mkdir(path.join(jobDir, "final"), { recursive: true });
    await writeFile(
      path.join(jobDir, "final", "summary.json"),
      JSON.stringify(summaryPayload, null, 2),
      "utf8",
    );

    if (status === "BLOCKED_WITH_REMARKS" || status === "BLOCKED") {
      await progress(
        input.onProgress,
        "Арт-директор",
        `Есть замечания: ${remarks.slice(0, 3).join("; ")}`,
      );
    } else {
      await progress(
        input.onProgress,
        "Арт-директор",
        "Карусель готова (FINAL).",
      );
    }

    return {
      ok: true,
      jobId,
      buildMode: input.brief.buildMode,
      status,
      script,
      slides,
      remarks,
      defects: lastDefects,
      findings: lastFindings,
      qa: qaFinal,
      jobDir,
      repairCycles,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await progress(input.onProgress, "Оркестратор", `Ошибка: ${message}`);
    return { ...empty, error: message, status: "BLOCKED_WITH_REMARKS" };
  }
}
