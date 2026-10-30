/**
 * C-155 smoke — aggregator agent chat (tiny user message).
 * Exit 0 on live OR soft mock (no key / LLM fail). Never prints API key.
 *
 *   npx tsx scripts/smoke-c155-agent-chat.ts
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
  const hasKey = Boolean(
    process.env.AGGREGATOR_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.ANALYST_LLM_API_KEY?.trim(),
  );
  console.log(`C155_KEY=${hasKey ? "present" : "absent"}`);

  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { callAggregatorChat } = await import("../lib/llm/aggregator-chat");

  const env = resolveAggregatorEnv();
  if (!env) {
    console.log("C155_SOURCE=mock_no_key");
    console.log("SMOKE_C155_OK");
    process.exit(0);
  }

  const result = await callAggregatorChat({
    system: "You are a concise studio assistant. Reply in one short sentence.",
    user: "ping",
    temperature: 0.2,
    maxTokens: 64,
  });

  if (result.ok) {
    console.log(
      `C155_SOURCE=live model=${result.model} text_len=${result.text.length}`,
    );
    console.log("SMOKE_C155_OK");
    process.exit(0);
  }

  console.log(`C155_SOURCE=mock_after_fail error=${result.error}`);
  console.log("SMOKE_C155_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error("SMOKE_C155_ERR", e instanceof Error ? e.message : "fail");
  console.log("C155_SOURCE=mock_error");
  console.log("SMOKE_C155_OK");
  process.exit(0);
});
