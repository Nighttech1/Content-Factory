/**
 * Live Mode A attempt (max 2 total across runs). Uses product path.
 * Topic fixed by client; web images; gpt-5.4 session.
 */
import { readFileSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import path, { resolve } from "node:path";

function loadDotEnv(file: string) {
  try {
    const raw = readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env) || !process.env[key]) process.env[key] = val;
    }
  } catch {
    /* missing ok */
  }
}
loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

import { runVernatunFromTopic } from "../lib/studio/vernatun-carousel/draw-bridge";

const TOPIC =
  "Почему связи в сообществе — сила, а не кумовство";

async function main() {
  const attempt = Number(process.env.VERNATUN_ATTEMPT ?? 1);
  console.log(`LIVE Mode A attempt ${attempt}/2`);
  console.log(`Topic: ${TOPIC}`);

  const result = await runVernatunFromTopic({
    topic: TOPIC,
    slideCount: 4,
    buildMode: "A",
    onProgress: (agent, message) => {
      console.log(`[${agent}] ${message}`);
    },
  });

  const outDir = path.join(process.cwd(), "tasks");
  await mkdir(outDir, { recursive: true });
  const verdictPath = path.join(outDir, "DEMO_VERDICT.md");

  if (!result.ok) {
    const body = `# DEMO VERDICT — Mode A attempt ${attempt}

- **ok:** false
- **error:** ${result.error.code} — ${result.error.message}
- **time:** ${new Date().toISOString()}

Клиент: полуфабрикат НЕ принят.
`;
    await writeFile(verdictPath, body, "utf8");
    console.error(result);
    process.exit(1);
  }

  const body = `# DEMO VERDICT — Mode A attempt ${attempt}

- **ok:** true
- **slides:** ${result.slides.length}
- **renderMode:** ${result.renderMode}
- **needsReview:** ${Boolean(result.needsReview)}
- **artifactDir:** ${result.artifactDir ?? "—"}
- **model:** ${result.model}
- **time:** ${new Date().toISOString()}

## PNG / preview URLs
${result.slides.map((s) => `- ${s.index}: ${s.imageUrl}`).join("\n")}

## Client gate
${result.needsReview ? "NOT FINAL — needsReview (клиент не принимает)" : "Looks FINAL-ready from bridge (verify summary.json status=FINAL)"}
`;
  await writeFile(verdictPath, body, "utf8");
  console.log(body);

  if (result.needsReview || result.slides.length !== 4) {
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
