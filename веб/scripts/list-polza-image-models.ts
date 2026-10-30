/**
 * List Polza models; highlight image-ish ids. Never prints API key.
 * npx tsx scripts/list-polza-image-models.ts
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
  const res = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log(`STATUS=${res.status}`);
  const j = (await res.json()) as {
    data?: Array<{ id?: string; owned_by?: string }>;
  };
  const arr = Array.isArray(j.data) ? j.data : [];
  const ids = arr.map((m) => m.id ?? "").filter(Boolean);
  console.log(`COUNT=${ids.length}`);
  const imgRe =
    /image|dall|flux|sdxl|stable|imagen|recraft|kandinsky|gpt-image|midjourney|firefly|banana|ideogram|schnell/i;
  const img = ids.filter((id) => imgRe.test(id));
  console.log(`IMAGE_N=${img.length}`);
  console.log(`IMAGE=${img.slice(0, 50).join("\n")}`);
  const cheap = ids
    .filter((id) => /mini|nano|flash|haiku|small|lite|8b|7b|schnell/i.test(id))
    .slice(0, 40);
  console.log(`CHEAP=${cheap.join("\n")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
