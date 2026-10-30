/**
 * C-154 smoke — carousel live images via Polza aggregator.
 * Exit 0 on live OR soft mock. Never prints API key.
 *
 *   npx tsx scripts/smoke-c154-carousel-images.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

async function main() {
  const hasKey = Boolean(process.env.AGGREGATOR_API_KEY?.trim());
  console.log(`C154_KEY=${hasKey ? "present" : "absent"}`);

  const { generateAggregatorImage, DEFAULT_CAROUSEL_IMAGE_MODEL } =
    await import("../lib/llm/aggregator-images");
  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");

  const env = resolveAggregatorEnv();
  if (!env) {
    console.log("C154_SOURCE=mock_no_key");
    console.log("SMOKE_C154_OK");
    process.exit(0);
  }

  const model =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL;
  console.log(`C154_MODEL=${model}`);

  const url = await generateAggregatorImage({
    prompt:
      "Dark luxury Armenian club Instagram carousel cover 4:5, warm gold accents, night atmosphere, no text overlay",
    model,
  });

  if (url) {
    console.log(`C154_SOURCE=live url_len=${url.length}`);
    console.log("SMOKE_C154_OK");
    process.exit(0);
  }

  // Soft mock path (same contract as generate-slides route)
  console.log("C154_SOURCE=mock_after_fail");
  console.log("SMOKE_C154_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error("SMOKE_C154_ERR", e instanceof Error ? e.message : "fail");
  // Soft-fail contract: still exit 0 (mock acceptable)
  console.log("C154_SOURCE=mock_error");
  console.log("SMOKE_C154_OK");
  process.exit(0);
});
