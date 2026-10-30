/**
 * Probe Polza image generation endpoints. Never prints API key.
 * npx tsx scripts/probe-polza-image.ts
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
  const apiKey = process.env.AGGREGATOR_API_KEY?.trim() ?? "";
  const baseUrl = (
    process.env.AGGREGATOR_BASE_URL?.trim() || "https://polza.ai/api/v1"
  ).replace(/\/$/, "");
  if (!apiKey) {
    console.error("NO_KEY");
    process.exit(1);
  }

  const models = [
    "google/gemini-2.5-flash-image",
    "openai/gpt-5-image-mini",
    "google/gemini-3.1-flash-lite-image",
    "qwen/image",
  ];

  for (const model of models) {
    const res = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt:
          "Simple Instagram carousel cover, Armenian club night, dark luxury, 4:5 portrait",
        n: 1,
        size: "1024x1280",
      }),
    });
    const text = await res.text();
    console.log(
      `IMG model=${model} status=${res.status} body=${text.slice(0, 220).replace(/\s+/g, " ")}`,
    );
    if (res.ok) {
      console.log("IMG_OK=" + model);
      break;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
