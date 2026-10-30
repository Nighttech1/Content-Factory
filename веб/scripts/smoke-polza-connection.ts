/**
 * Smoke: Polza AI / aggregator connectivity.
 * Loads .env via process (dotenv optional) — reads AGGREGATOR_* without logging the key.
 *
 *   npx tsx scripts/smoke-polza-connection.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
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
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

function mask(): string {
  const k = process.env.AGGREGATOR_API_KEY?.trim() ?? "";
  if (!k) return "(empty)";
  return `len=${k.length} prefix=${k.slice(0, 3)}…`;
}

async function main() {
  const apiKey = process.env.AGGREGATOR_API_KEY?.trim() ?? "";
  const baseUrl = (
    process.env.AGGREGATOR_BASE_URL?.trim() || "https://polza.ai/api/v1"
  ).replace(/\/$/, "");
  const model =
    process.env["AGGREGATOR_MODEL_MAP_gpt-4o-mini"]?.trim() ||
    process.env.AGGREGATOR_DEFAULT_MODEL?.trim() ||
    "openai/gpt-4o-mini";

  console.log(`BASE_URL=${baseUrl}`);
  console.log(`KEY=${mask()}`);
  console.log(`MODEL=${model}`);

  if (!apiKey) {
    console.error("SMOKE_POLZA_FAIL: AGGREGATOR_API_KEY empty");
    process.exit(1);
  }

  // 1) List models (auth check)
  const modelsRes = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log(`GET /models → ${modelsRes.status}`);
  if (!modelsRes.ok) {
    const t = await modelsRes.text();
    console.error("SMOKE_POLZA_FAIL models:", t.slice(0, 200));
    process.exit(1);
  }
  console.log("SMOKE_POLZA_MODELS_OK");

  // 2) Tiny chat completion
  const chatRes = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Ответь одним словом: ок" }],
      max_tokens: 16,
    }),
  });
  console.log(`POST /chat/completions → ${chatRes.status}`);
  const body = (await chatRes.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  if (!chatRes.ok) {
    console.error(
      "SMOKE_POLZA_FAIL chat:",
      body.error?.message ?? JSON.stringify(body).slice(0, 200),
    );
    process.exit(1);
  }
  const reply = body.choices?.[0]?.message?.content?.trim() ?? "";
  console.log(`REPLY_LEN=${reply.length}`);
  console.log("SMOKE_POLZA_CHAT_OK");
  console.log("SMOKE_POLZA_OK");
}

main().catch((err) => {
  console.error("SMOKE_POLZA_FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
});
