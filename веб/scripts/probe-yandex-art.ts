/**
 * Probe which yandex-art slug/size the aggregator accepts.
 * Usage: npx tsx scripts/probe-yandex-art.ts
 */
import { config } from "dotenv";
config();

import { resolveAggregatorEnv } from "../lib/llm/aggregator";

async function tryOnce(input: {
  model: string;
  size: string;
  withAr: boolean;
}): Promise<void> {
  const env = resolveAggregatorEnv();
  if (!env) {
    console.log("NO_AGGREGATOR_ENV");
    return;
  }
  const body: Record<string, unknown> = {
    model: input.model,
    prompt: "simple red circle on white background, no text",
    n: 1,
    size: input.size,
  };
  if (input.withAr) body.aspect_ratio = "4:5";
  const res = await fetch(`${env.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(
    JSON.stringify({
      model: input.model,
      size: input.size,
      withAr: input.withAr,
      status: res.status,
      body: text.slice(0, 400),
    }),
  );
}

async function main() {
  const models = [
    "yandex/yandex-art",
    "yandex-art",
    "ya/yandex-art",
    "yandex/art",
  ];
  const sizes = ["1024x1024", "1024x1280", "1080x1350", "512x512"];
  for (const model of models) {
    for (const size of sizes) {
      await tryOnce({ model, size, withAr: false });
      await tryOnce({ model, size, withAr: true });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
