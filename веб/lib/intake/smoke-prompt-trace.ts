/**
 * Smoke / CAROUSEL_PROMPT_TRACE — dump Scriptwriter→Designer→PNG timeline MD.
 * Secrets never written. Default folder: docs/карусель тест/layered-smoke-4/
 */

import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { NormalizedSheetRow } from "@/lib/intake/types";
import type { CarouselDrawImagePromptTrace } from "@/lib/studio/carousel-html-renderer";

export const DEFAULT_SMOKE_TRACE_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "layered-smoke-4",
);

export function isCarouselPromptTraceEnabled(): boolean {
  return process.env.CAROUSEL_PROMPT_TRACE?.trim() === "1";
}

export function resolveSmokeTraceDir(): string {
  const override = process.env.CAROUSEL_PROMPT_TRACE_DIR?.trim();
  if (override) {
    return path.isAbsolute(override)
      ? override
      : path.join(process.cwd(), override);
  }
  return DEFAULT_SMOKE_TRACE_DIR;
}

export type ScriptwriterAttemptTrace = {
  attempt: number;
  user: string;
  reply: string;
  criticOk: boolean;
  criticMessage?: string;
  criticReasons?: string[];
};

export type ScriptwriterTraceDump = {
  model: string;
  system: string;
  userBase: string;
  attempts: ScriptwriterAttemptTrace[];
  criticRetries: number;
  finalOk: boolean;
};

export type DesignerTraceDump = {
  model: string;
  renderMode?: string;
  imagePrompts: string[];
  promptTrace?: CarouselDrawImagePromptTrace[];
  visionFailures?: Array<{
    slide: number;
    reason: string;
    gensUsed: number;
  }>;
  needsReview?: boolean;
  pngAbsPaths: string[];
  pngDir?: string;
  artifactDir?: string;
};

export type UsefulSmokeTimelineInput = {
  row: NormalizedSheetRow;
  startedAt: string;
  finishedAt: string;
  draftId?: string;
  jobId: string;
  scriptwriter: ScriptwriterTraceDump;
  designer?: DesignerTraceDump;
  error?: string;
};

function padRowNum(key: string): string {
  const n = Number.parseInt(key.replace(/\D/g, ""), 10);
  if (Number.isFinite(n)) return String(n).padStart(2, "0");
  return key.slice(0, 8);
}

function fence(lang: string, body: string): string {
  return ["```" + lang, body.replace(/\r\n/g, "\n"), "```"].join("\n");
}

export function timelineFileName(sheetRowKey: string): string {
  const num = padRowNum(sheetRowKey);
  return `${num}-row-${sheetRowKey}-timeline.md`;
}

export async function writeUsefulSmokeTimeline(
  input: UsefulSmokeTimelineInput,
): Promise<{ mdPath: string; pngCopies: string[] }> {
  const root = resolveSmokeTraceDir();
  await mkdir(root, { recursive: true });

  const rowNum = padRowNum(input.row.sheetRowKey);
  const pngDir = path.join(root, input.row.sheetRowKey);
  await mkdir(pngDir, { recursive: true });

  const pngCopies: string[] = [];
  const designer = input.designer;
  if (designer?.pngAbsPaths?.length) {
    for (let i = 0; i < designer.pngAbsPaths.length; i++) {
      const src = designer.pngAbsPaths[i]!;
      const destName = `slide_${String(i + 1).padStart(2, "0")}.png`;
      const dest = path.join(pngDir, destName);
      try {
        await copyFile(src, dest);
        pngCopies.push(dest);
      } catch {
        // document missing copy; keep going
      }
    }
  }

  const sw = input.scriptwriter;
  const lines: string[] = [
    `# Useful-smoke timeline — row ${input.row.sheetRowKey}`,
    "",
    `- **started:** ${input.startedAt}`,
    `- **finished:** ${input.finishedAt}`,
    `- **jobId:** \`${input.jobId}\``,
    `- **draftId:** ${input.draftId ? `\`${input.draftId}\`` : "_(none)_"}`,
    `- **mode:** \`${input.row.mode}\` (gid useful only)`,
    `- **pipeline:** layered_html`,
    "",
    "## Sheet row",
    "",
    fence(
      "json",
      JSON.stringify(
        {
          sheetRowKey: input.row.sheetRowKey,
          mode: input.row.mode,
          topic: input.row.topic,
          notes: input.row.notes ?? null,
          meta: input.row.meta ?? null,
          statusRaw: input.row.statusRaw,
          slides: input.row.slides ?? null,
          cta_type: input.row.cta_type ?? null,
          hero: input.row.hero ?? null,
          pickable: input.row.pickable,
        },
        null,
        2,
      ),
    ),
    "",
    "## Scriptwriter",
    "",
    `- **model:** \`${sw.model}\``,
    `- **criticRetries:** ${sw.criticRetries}`,
    `- **finalOk:** ${sw.finalOk}`,
    "",
    "### System",
    "",
    fence("markdown", sw.system),
    "",
    "### User (base)",
    "",
    fence("text", sw.userBase),
    "",
  ];

  for (const attempt of sw.attempts) {
    lines.push(
      `### Attempt ${attempt.attempt}`,
      "",
      `- criticOk: ${attempt.criticOk}`,
      attempt.criticMessage
        ? `- criticMessage: ${attempt.criticMessage}`
        : "",
      attempt.criticReasons?.length
        ? `- criticReasons: ${attempt.criticReasons.join("; ")}`
        : "",
      "",
      "#### User message",
      "",
      fence("text", attempt.user),
      "",
      "#### Full LLM reply",
      "",
      fence("markdown", attempt.reply),
      "",
    );
  }

  if (input.error) {
    lines.push("## Error", "", fence("text", input.error), "");
  }

  if (designer) {
    lines.push(
      "## Designer / Image",
      "",
      `- **model:** \`${designer.model}\``,
      `- **renderMode:** \`${designer.renderMode ?? "?"}\``,
      `- **needs_review:** ${Boolean(designer.needsReview)}`,
      designer.artifactDir
        ? `- **artifactDir:** \`${designer.artifactDir}\``
        : "",
      "",
    );

    const traces =
      designer.promptTrace && designer.promptTrace.length > 0
        ? designer.promptTrace
        : designer.imagePrompts.map((p, i) => ({
            slide: i + 1,
            image_llm: designer.model,
            exact_prompt: p,
            html_inputs_summary: "html_overlay=none",
          }));

    for (const t of traces) {
      lines.push(
        `### Slide ${t.slide} — image prompt`,
        "",
        `- image_llm: \`${t.image_llm}\``,
        `- html: ${t.html_inputs_summary}`,
        "",
        fence("text", t.exact_prompt),
        "",
      );
    }

    if (designer.visionFailures?.length) {
      lines.push(
        "### Vision results (failures)",
        "",
        fence("json", JSON.stringify(designer.visionFailures, null, 2)),
        "",
      );
    } else {
      lines.push(
        "### Vision results",
        "",
        "_OFF on layered_html (S57) — no OCR regen_",
        "",
      );
    }

    lines.push("### PNG paths", "");
    for (let i = 0; i < designer.pngAbsPaths.length; i++) {
      const abs = designer.pngAbsPaths[i]!;
      const copy = pngCopies[i];
      lines.push(
        `- slide_${String(i + 1).padStart(2, "0")}: \`${abs}\`${
          copy ? ` → copy \`${path.relative(process.cwd(), copy)}\`` : ""
        }`,
      );
    }
    lines.push("");
  }

  lines.push(
    "---",
    "",
    "_Secrets redacted by design — no API keys / tokens in this file._",
    "",
  );

  const mdPath = path.join(root, timelineFileName(input.row.sheetRowKey));
  await writeFile(mdPath, lines.filter((l) => l !== undefined).join("\n"), "utf8");
  return { mdPath, pngCopies };
}

export async function writeUsefulSmokeReadme(opts: {
  rows: Array<{
    sheetRowKey: string;
    topic: string;
    draftId?: string;
    ok: boolean;
    pngCount: number;
    mdRel?: string;
    error?: string;
  }>;
  budgetMax: number;
  totalPng: number;
}): Promise<string> {
  const root = resolveSmokeTraceDir();
  await mkdir(root, { recursive: true });
  const lines = [
    "# Useful-smoke 51 / 1 / 17",
    "",
    `- **date:** ${new Date().toISOString()}`,
    `- **tab:** Полезные карусели · gid \`902078005\` only (meetings not polled)`,
    `- **budget:** ${opts.totalPng} / ${opts.budgetMax} PNG`,
    `- **pipeline:** correct (Scriptwriter → critic → Designer image → vision ≤2 → Draft)`,
    "",
    "| № | topic | ok | PNG | draftId | timeline |",
    "|---|-------|----|-----|---------|----------|",
  ];
  for (const r of opts.rows) {
    lines.push(
      `| ${r.sheetRowKey} | ${r.topic.slice(0, 60)} | ${r.ok ? "yes" : "no"} | ${r.pngCount} | ${r.draftId ?? "—"} | ${r.mdRel ? `\`${r.mdRel}\`` : "—"} |`,
    );
    if (r.error) {
      lines.push(`|  | _error:_ ${r.error.replace(/\|/g, "/")} |  |  |  |  |`);
    }
  }
  lines.push(
    "",
    "## PNG copies",
    "",
    "Per-row folders: `{num}/slide_01.png` … under this directory (copied from `public/generated/carousel/{jobId}/`).",
    "",
    "_No secrets._",
    "",
  );
  const readme = path.join(root, "README.md");
  await writeFile(readme, lines.join("\n"), "utf8");
  return readme;
}
