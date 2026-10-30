/**
 * Live: 2 × Mode A × 4 slides → Client harsh verdict → Trainer notes.
 * Usage: npx tsx scripts/run-parity-demo-two-a.ts
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";
import {
  IMAGE_GEN_MODEL,
  TEXT_ORCHESTRATOR_MODEL,
} from "../lib/studio/vernatun-carousel/role-models";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

const TOPICS = [
  "Почему живые связи в Vernatun сильнее чатов",
  "Как зайти на первую встречу Vernatun без страха",
];

console.log(
  `[models] text=${TEXT_ORCHESTRATOR_MODEL} image=${IMAGE_GEN_MODEL}`,
);

type ClientRemark = {
  slide: number;
  severity: "blocker" | "major" | "minor";
  element: string;
  issue: string;
};

/** Super-strict Client (designer) — no leniency. */
function clientAudit(input: {
  status: string;
  templates?: string[];
  recipes?: string[];
  remarks: string[];
  designHash?: string | null;
}): { accepted: boolean; remarks: ClientRemark[]; summary: string } {
  const remarks: ClientRemark[] = [];
  if (input.status !== "FINAL") {
    remarks.push({
      slide: 0,
      severity: "blocker",
      element: "release",
      issue: `Статус ${input.status} — полуфабрикат. Клиент принимает только FINAL.`,
    });
  }
  const recipes = input.recipes ?? [];
  for (let i = 1; i < recipes.length; i++) {
    if (recipes[i] === recipes[i - 1]) {
      remarks.push({
        slide: i + 1,
        severity: "major",
        element: "template_clone",
        issue: `Слайд ${i + 1} клонирует recipe «${recipes[i]}» соседа — это лента-шаблон, не карусель.`,
      });
    }
  }
  const templates = input.templates ?? [];
  const uniqT = new Set(templates);
  if (templates.length >= 4 && uniqT.size < 3) {
    remarks.push({
      slide: 0,
      severity: "major",
      element: "layout",
      issue: `Мало силуэтов (${uniqT.size}/4). Нужна режиссура как у Mode B, не один каркас.`,
    });
  }
  if (!input.designHash) {
    remarks.push({
      slide: 0,
      severity: "major",
      element: "colors",
      issue: "Нет audit hash цветов Design — подозрение на самопальную палитру.",
    });
  }
  for (const r of input.remarks.slice(0, 6)) {
    const lower = r.toLowerCase();
    if (/фон|photo|background|template|clone|контраст|user/.test(lower)) {
      remarks.push({
        slide: 0,
        severity: "major",
        element: "pipeline_remark",
        issue: r,
      });
    }
  }
  // Always add at least one pointed craft note to train the team
  remarks.push({
    slide: 1,
    severity: "minor",
    element: "hierarchy",
    issue:
      "Обложка должна читаться как постер с 1 метра: 3–4 слова, акцент на последнем, фото — метафора тезиса, не сток «люди улыбаются».",
  });
  remarks.push({
    slide: 3,
    severity: "minor",
    element: "swipe",
    issue:
      "Средний слайд обязан давать новый силуэт и новый ритм текста — иначе свайп не зарабатывается.",
  });

  const blockers = remarks.filter((r) => r.severity === "blocker");
  const majors = remarks.filter((r) => r.severity === "major");
  const accepted = blockers.length === 0 && majors.length === 0;
  return {
    accepted,
    remarks,
    summary: accepted
      ? "ПРИНЯТО (FINAL, без wow-major)"
      : `НЕ ПРИНЯТО: blockers=${blockers.length} majors=${majors.length}`,
  };
}

async function readSummary(jobDir: string) {
  try {
    const raw = await readFile(
      path.join(jobDir, "final", "summary.json"),
      "utf8",
    );
    return JSON.parse(raw) as {
      status?: string;
      recipes?: string[];
      templates?: string[];
      designColorsHash?: string;
      remarks?: string[];
    };
  } catch {
    return {};
  }
}

async function main() {
  const outRoot = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    "2026-10-22-gemini-demo",
  );
  await mkdir(outRoot, { recursive: true });
  const report: unknown[] = [];
  const allClientRemarks: ClientRemark[] = [];

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i]!;
    console.log(`\n=== Mode A demo [${i + 1}/2] ===\n${topic}\n`);
    const result = await runVernatunCarouselJob({
      brief: {
        topic,
        audience: "участники Vernatun / армянское speaking-community",
        slideCount: 4,
        buildMode: "A",
        skipScriptApproval: true,
        cta: "Приходите на встречу Vernatun",
        maxRepairCycles: 2,
      },
      onProgress: (agent, message) => console.log(`  [${agent}] ${message}`),
    });
    // note: product maxRepair capped at 2 in orchestrator

    const summary = await readSummary(result.jobDir);
    const client = clientAudit({
      status: result.status,
      recipes: summary.recipes,
      templates: summary.templates,
      designHash: summary.designColorsHash,
      remarks: result.remarks,
    });
    allClientRemarks.push(...client.remarks);

    const row = {
      index: i + 1,
      topic,
      ok: result.ok,
      status: result.status,
      jobId: result.jobId,
      jobDir: result.jobDir,
      slides: result.slides.map((s) => s.imageUrl),
      repairCycles: result.repairCycles,
      recipes: summary.recipes,
      templates: summary.templates,
      designColorsHash: summary.designColorsHash,
      client,
    };
    report.push(row);
    console.log(
      `→ status=${result.status} client=${client.summary} slides=${result.slides.length}`,
    );

    if (result.ok && result.slides.length) {
      await upsertDraft(SEED_ADMIN_USER_ID, {
        id: `vernatun-a-parity-${i + 1}`,
        moduleId: "carousel-engine",
        title: `[A/${result.status}] ${topic}`,
        slides: result.slides.map((s, j) => ({
          id: `s${j + 1}`,
          imageUrl: s.imageUrl,
          caption: topic,
        })),
        scenario: [
          `mode=A`,
          `job=${result.jobId}`,
          `client=${client.summary}`,
          ...client.remarks.slice(0, 8).map((r) => `[${r.severity}] ${r.issue}`),
        ].join("\n"),
        status: "unpublished",
        sourceCompetitorId: "vernatun-parity",
        competitorId: "vernatun-parity",
      });
    }
  }

  await writeFile(
    path.join(outRoot, "demo-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  // Trainer reinforcement from Client remarks
  const trainerPath = path.join(
    process.cwd(),
    "plugins/trainer/vernatun-a-pipeline-close.md",
  );
  const skillPath = path.join(
    process.cwd(),
    "lib/studio/vernatun-carousel/skills/viral-carousel-design.md",
  );
  const majorThemes = [
    ...new Set(
      allClientRemarks
        .filter((r) => r.severity === "blocker" || r.severity === "major")
        .map((r) => r.element),
    ),
  ];
  const reinforce = `

## Trainer reinforcement (auto ${new Date().toISOString().slice(0, 10)})

Клиент жёстко бил по: ${majorThemes.join(", ") || "craft notes"}.
Усилить команду:
1. FINAL only — полуфабрикат = возврат тикета.
2. Adjacent recipe/template clone = major/blocker до смены recipe.
3. Design colors hash обязателен в summary.
4. Обложка = постер; средний слайд = новый силуэт + swipe-hook.
5. Фон обязан поддерживать тезис (не «сток-улыбки»).
`;

  try {
    const trainer = await readFile(trainerPath, "utf8");
    if (!trainer.includes("Trainer reinforcement (auto")) {
      await writeFile(trainerPath, `${trainer.trim()}\n${reinforce}`, "utf8");
    } else {
      await writeFile(
        trainerPath,
        trainer.replace(/## Trainer reinforcement[\s\S]*$/, reinforce.trim()),
        "utf8",
      );
    }
    const skill = await readFile(skillPath, "utf8");
    const skillBoost = `

### CLIENT HARD RULES (trainer ${new Date().toISOString().slice(0, 10)})
- Reject adjacent identical recipes/templates.
- Cover must read as a poster from 1m; max 4 words.
- Background must support thesis — stock smile groups without metaphor = major.
- Only Design preset colors; foreign accent = major.
- User attachments must appear on slides or be rejected with reason.
`;
    if (!skill.includes("CLIENT HARD RULES")) {
      await writeFile(skillPath, `${skill.trim()}\n${skillBoost}`, "utf8");
    }
  } catch (err) {
    console.warn("trainer/skill update skipped", err);
  }

  const verdictMd = `# DEMO_VERDICT_A_PARITY

Дата: ${new Date().toISOString()}

## Models
- Text / оркестратор + арт-директор: \`${TEXT_ORCHESTRATOR_MODEL}\`
- Image: \`${IMAGE_GEN_MODEL}\` (GPT Image 2.0)

## Jobs
${(report as Array<{ jobId: string; status: string; topic: string; client: { summary: string } }>)
  .map(
    (r, i) =>
      `${i + 1}. **${r.jobId}** — ${r.status} — ${r.topic}\n   Клиент: ${r.client.summary}`,
  )
  .join("\n")}

## Client
Жёсткая приёмка: только FINAL без wow-major (template/background/contrast/user). Без поблажек.

## Trainer
Обновлён \`plugins/trainer/vernatun-a-pipeline-close.md\` + skill CLIENT HARD RULES по замечаниям цикла.
`;

  await writeFile(
    path.join(process.cwd(), "tasks/DEMO_VERDICT_A_PARITY.md"),
    verdictMd,
    "utf8",
  );
  await writeFile(path.join(outRoot, "DEMO_VERDICT_A_PARITY.md"), verdictMd, "utf8");

  const anyRejected = (report as Array<{ client: { accepted: boolean } }>).some(
    (r) => !r.client.accepted,
  );
  console.log(`\n[Клиент] ${anyRejected ? "есть отклонения — правим по замечаниям" : "обе приняты"}`);
  if (anyRejected) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
