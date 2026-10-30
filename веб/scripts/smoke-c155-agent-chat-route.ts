/**
 * C-155 — route contract smoke (D1 body shape).
 * Calls Next route handler in-process; exit 0 on live or soft mock.
 * Never prints API key.
 *
 *   npx tsx scripts/smoke-c155-agent-chat-route.ts
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
  const { POST } = await import("../app/api/studio/agent-chat/route");

  const req = new Request("http://localhost/api/studio/agent-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentRole: "scriptwriter",
      pipelineId: "carousel-engine",
      messages: [{ role: "user", content: "ping — короткий ответ" }],
      systemPrompt:
        "You are a concise studio scriptwriter. Reply in one short Russian sentence.",
      modelConfig: { temperature: 0.2, maxTokens: 64 },
    }),
  });

  const res = await POST(req);
  const json = (await res.json()) as {
    reply?: string;
    model?: string;
    source?: string;
    error?: string;
  };

  if (!res.ok) {
    console.error("C155_ROUTE_HTTP", res.status, json.error ?? "");
    process.exit(1);
  }

  if (typeof json.reply !== "string" || !json.reply.trim()) {
    console.error("C155_ROUTE_NO_REPLY");
    process.exit(1);
  }

  if (json.source !== "live" && json.source !== "mock") {
    console.error("C155_ROUTE_BAD_SOURCE", json.source);
    process.exit(1);
  }

  // No brief glue in user payload — this smoke never sends Бриф
  console.log(
    `C155_ROUTE_SOURCE=${json.source} model=${json.model ?? "?"} reply_len=${json.reply.length}`,
  );
  console.log("SMOKE_C155_ROUTE_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error("SMOKE_C155_ROUTE_ERR", e instanceof Error ? e.message : "fail");
  process.exit(1);
});
