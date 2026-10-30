/**
 * Mandatory carousel development log — every job writes prompts for Trainer/Orchestrator.
 * Rule: see root `promts` file — FINAL forbidden without this trail.
 * AD verdict log is the primary artifact the DEV TEAM reads before the next fix turn.
 */

import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

import type { ArtDirectorFinding } from "./types";

export async function ensurePromptLogDir(jobDir: string): Promise<string> {
  const dir = path.join(jobDir, "prompts");
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writePromptLog(
  jobDir: string,
  filename: string,
  content: string,
): Promise<void> {
  const dir = await ensurePromptLogDir(jobDir);
  await writeFile(path.join(dir, filename), content, "utf8");
}

export async function appendDevTrace(
  jobDir: string,
  line: string,
): Promise<void> {
  const dir = await ensurePromptLogDir(jobDir);
  const stamp = new Date().toISOString();
  await appendFile(
    path.join(dir, "DEV_TRACE.md"),
    `\n## ${stamp}\n\n${line}\n`,
    "utf8",
  );
}

export async function logSlideImagePrompt(input: {
  jobDir: string;
  slideIndex: number;
  prompt: string;
  refs: Array<{ role: string; path: string }>;
  model: string;
}): Promise<void> {
  const nn = String(input.slideIndex).padStart(2, "0");
  await writePromptLog(
    input.jobDir,
    `slide_${nn}_image_prompt.md`,
    `# Slide ${input.slideIndex} → GPT Image\n\nmodel: ${input.model}\n\n\`\`\`\n${input.prompt}\n\`\`\`\n`,
  );
  await writePromptLog(
    input.jobDir,
    `slide_${nn}_refs.json`,
    JSON.stringify(
      { slide_index: input.slideIndex, model: input.model, refs: input.refs },
      null,
      2,
    ),
  );
  await appendDevTrace(
    input.jobDir,
    `slide_${nn}: image prompt (${input.prompt.length} chars), refs=${input.refs.map((r) => r.role).join("+") || "none"}`,
  );
}

/**
 * HARD: Art Director always writes a team-facing verdict log.
 * Dev team MUST open this before coding the next fix (do not re-burn image API blindly).
 */
export async function writeAdVerdictLog(input: {
  jobDir: string;
  canFinalize: boolean;
  summary: string;
  findings: ArtDirectorFinding[];
  repairCycle: number;
  maxRepair: number;
}): Promise<void> {
  const verdict = input.canFinalize ? "APPROVED" : "REMARKS";
  const majors = input.findings.filter(
    (f) => f.severity === "major" || f.severity === "blocker",
  );
  const md = `# AD VERDICT — ${verdict}

**Для команды разработки:** читайте этот файл ПЕРЕД следующим фиксом. Не запускайте новую карусель, пока не разберёте каждый major/blocker.

- verdict: **${verdict}**
- can_finalize: ${input.canFinalize}
- repair_cycle: ${input.repairCycle}/${input.maxRepair}
- findings_total: ${input.findings.length}
- majors_blockers: ${majors.length}

## Summary
${input.summary || "(empty)"}

## Findings (все)
${
  input.findings.length
    ? input.findings
        .map(
          (f, i) =>
            `### ${i + 1}. [${f.severity}] ${f.slide_id} · \`${f.element}\`
- observed: ${f.observed_issue}
- fix: ${f.recommended_change}
- reason: ${f.reason}
- check: ${f.acceptance_check}`,
        )
        .join("\n\n")
    : "_Замечаний нет._"
}

## Как чинить (чеклист)
1. Открыть \`slide_NN_image_prompt.md\` для проблемных слайдов.
2. Сверить с PNG в \`rendered/\` / \`public/vernatun-jobs/<jobId>/\`.
3. Править промпт / layout-QA / bake — **не** жечь GPT Image «наугад».
4. На ход разработки: **одна** новая генерация карусели после фикса.
`;

  await writePromptLog(input.jobDir, "AD_VERDICT.md", md);
  await writePromptLog(
    input.jobDir,
    "AD_FINDINGS.json",
    JSON.stringify(
      {
        verdict,
        canFinalize: input.canFinalize,
        summary: input.summary,
        repairCycle: input.repairCycle,
        maxRepair: input.maxRepair,
        findings: input.findings,
        team_rule:
          "Read AD_VERDICT.md before next code fix; one carousel gen per turn in DEV.",
      },
      null,
      2,
    ),
  );
  await appendDevTrace(
    input.jobDir,
    `AD_VERDICT=${verdict}; canFinalize=${input.canFinalize}; findings=${input.findings.length}; majors=${majors.length}; repair=${input.repairCycle}/${input.maxRepair}`,
  );
}
