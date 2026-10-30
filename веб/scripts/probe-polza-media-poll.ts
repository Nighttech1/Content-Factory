/**
 * Full image gen + poll. Never prints API key.
 * npx tsx scripts/probe-polza-media-poll.ts
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = process.env.AGGREGATOR_API_KEY?.trim() ?? "";
  const baseUrl = (
    process.env.AGGREGATOR_BASE_URL?.trim() || "https://polza.ai/api/v1"
  ).replace(/\/$/, "");
  const model = "google/gemini-2.5-flash-image";

  const create = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt:
        "Dark luxury Armenian club Instagram carousel cover 4:5, gold accents, night atmosphere, no text",
      n: 1,
      size: "1024x1280",
    }),
  });
  const created = (await create.json()) as {
    requestId?: string;
    id?: string;
    data?: Array<{ url?: string }>;
    status?: string;
  };
  console.log(`CREATE status=${create.status}`);
  const syncUrl = created.data?.[0]?.url;
  if (syncUrl) {
    console.log(`SYNC_URL_OK len=${syncUrl.length}`);
    console.log("PROBE_IMAGE_OK");
    return;
  }
  const id = created.requestId || created.id;
  if (!id) {
    console.error("NO_ID", JSON.stringify(created).slice(0, 300));
    process.exit(1);
  }
  console.log(`POLL id_prefix=${String(id).slice(0, 12)}`);

  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const st = await fetch(`${baseUrl}/media/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = (await st.json()) as {
      status?: string;
      data?: { url?: string } | Array<{ url?: string }>;
      error?: { message?: string };
    };
    console.log(`POLL_${i} http=${st.status} status=${body.status ?? "?"}`);
    if (body.status === "completed") {
      const url = Array.isArray(body.data)
        ? body.data[0]?.url
        : body.data?.url;
      console.log(`URL_OK=${Boolean(url)} len=${url?.length ?? 0}`);
      console.log("PROBE_IMAGE_OK");
      return;
    }
    if (body.status === "failed") {
      console.error("FAILED", body.error?.message ?? "fail");
      process.exit(1);
    }
  }
  console.error("TIMEOUT");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
