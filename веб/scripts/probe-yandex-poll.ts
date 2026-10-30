/**
 * One yandex gen + poll until URL.
 * Usage: npx tsx scripts/probe-yandex-poll.ts
 */
import { config } from "dotenv";
config();

import { resolveAggregatorEnv } from "../lib/llm/aggregator";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const env = resolveAggregatorEnv();
  if (!env) throw new Error("NO_ENV");

  const createRes = await fetch(`${env.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "yandex/yandex-art",
      prompt: "cozy cafe table laptop armenia, photoreal, no text",
      n: 1,
      size: "1024x1280",
    }),
  });
  const created = await createRes.json();
  console.log("create", createRes.status, JSON.stringify(created).slice(0, 300));
  const requestId =
    (created as { requestId?: string; id?: string }).requestId ||
    (created as { id?: string }).id;
  if (!requestId) throw new Error("no requestId");

  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const st = await fetch(`${env.baseUrl}/media/${requestId}`, {
      headers: { Authorization: `Bearer ${env.apiKey}` },
    });
    const body = await st.json();
    console.log(
      `poll ${i}`,
      st.status,
      JSON.stringify(body).slice(0, 400),
    );
    const status = String((body as { status?: string }).status ?? "");
    if (status === "completed" || status === "failed") break;
    // alternate endpoints some aggregators use
    if (i === 5) {
      const alt = await fetch(`${env.baseUrl}/images/${requestId}`, {
        headers: { Authorization: `Bearer ${env.apiKey}` },
      });
      console.log("alt /images/", alt.status, (await alt.text()).slice(0, 300));
    }
    if (i === 6) {
      const alt = await fetch(`${env.baseUrl}/generations/${requestId}`, {
        headers: { Authorization: `Bearer ${env.apiKey}` },
      });
      console.log(
        "alt /generations/",
        alt.status,
        (await alt.text()).slice(0, 300),
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
