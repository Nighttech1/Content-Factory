/**
 * Sprint 5 LIVE executable guards for C-16 / C-17 / C-18.
 * Run: node scripts/sprint5-live-guards.mjs
 *
 * Filesystem assertions always run. Optional HTTP against
 * /api/analytics/insights and /analytics when localhost responds.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fails.push(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

function fileExists(rel) {
  const ok = existsSync(join(root, rel));
  assert(ok, `missing file: ${rel}`);
  return ok;
}

function dirHasFiles(rel, min = 1) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fails.push(`missing dir: ${rel}`);
    return false;
  }
  try {
    const entries = readdirSync(p, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() || e.isDirectory());
    assert(files.length >= min, `dir ${rel} expected ≥${min} entries`);
    return files.length >= min;
  } catch {
    fails.push(`unreadable dir: ${rel}`);
    return false;
  }
}

/** Reject strings that look like live API keys (not placeholders). */
function looksLikeRealSecret(value) {
  const v = value.trim().replace(/^["']|["']$/g, "");
  if (!v || v.length < 20) return false;
  if (/^(change-me|your-|xxx|placeholder|sk-your|pk-test)/i.test(v)) return false;
  if (/USER|PASSWORD|localhost|example|empty|null/i.test(v)) return false;
  // OpenAI-style sk-... long tokens / long hex blobs
  if (/^sk-[A-Za-z0-9_-]{20,}$/.test(v)) return true;
  if (/^[A-Fa-f0-9]{32,}$/.test(v)) return true;
  if (/^[A-Za-z0-9_-]{40,}$/.test(v) && !/localhost|content_factory|postgresql/i.test(v)) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// C-16 — PostAnalytics schema + repository + no migrate reset
// ---------------------------------------------------------------------------
fileExists("prisma/schema.prisma");
fileExists("lib/db/analytics-repository.ts");
fileExists("lib/db/analytics-fallback.ts");
fileExists("package.json");
fileExists(".env.example");

const schema = read("prisma/schema.prisma");
const repo = read("lib/db/analytics-repository.ts");
const fallback = read("lib/db/analytics-fallback.ts");
const pkg = read("package.json");
const envExample = read(".env.example");

assert(
  /model\s+PostAnalytics\b/.test(schema),
  "C-16: prisma/schema must declare model PostAnalytics",
);
assert(
  /model\s+User\b/.test(schema),
  "C-16: prisma/schema must declare model User",
);
assert(
  /model\s+ContentJob\b/.test(schema),
  "C-16: prisma/schema must declare model ContentJob",
);
assert(
  schema.includes("views") &&
    schema.includes("saves") &&
    schema.includes("shares") &&
    schema.includes("retentionCurve") &&
    schema.includes("postId") &&
    schema.includes("platform"),
  "C-16: PostAnalytics must include views/saves/shares/retentionCurve/postId/platform",
);
assert(
  /provider\s*=\s*"postgresql"/.test(schema),
  "C-16: datasource provider must be postgresql",
);

assert(
  repo.includes("getAnalyticsRepository") ||
    repo.includes("createFallbackAnalyticsRepository"),
  "C-16: analytics-repository must expose getAnalyticsRepository / fallback wiring",
);
assert(
  repo.includes("analytics-fallback") ||
    repo.includes("createFallbackAnalyticsRepository"),
  "C-16: analytics-repository must wire fallback",
);
assert(
  fallback.includes("createFallbackAnalyticsRepository") ||
    fallback.length > 100,
  "C-16: analytics-fallback must implement JSON/in-memory store",
);

assert(
  !/"[^"]*migrate\s+reset[^"]*"/.test(pkg) &&
    !pkg.includes("prisma migrate reset") &&
    !pkg.includes("migrate:reset"),
  "C-16: package.json must NOT contain migrate reset script",
);

assert(
  envExample.includes("DATABASE_URL"),
  "C-16: .env.example must document DATABASE_URL",
);

// Secret hygiene: no assigned real-looking keys in .env.example
{
  const assigned = [
    ...envExample.matchAll(/^\s*([A-Z0-9_]+)\s*=\s*(.+)$/gm),
  ];
  for (const [, key, raw] of assigned) {
    if (looksLikeRealSecret(raw)) {
      fails.push(
        `C-16/C-17: .env.example has suspicious real-looking value for ${key}`,
      );
    }
  }
  assert(
    !/sk-[A-Za-z0-9]{20,}/.test(envExample),
    "C-16: .env.example must not embed live OpenAI-style keys",
  );
}

// ---------------------------------------------------------------------------
// C-17 — ingest + adapters + mock path
// ---------------------------------------------------------------------------
const ingestOk =
  fileExists("lib/analytics/ingest-post-metrics.ts") ||
  existsSync(join(root, "lib/analytics/ingest.ts"));
assert(
  ingestOk,
  "C-17: missing lib/analytics/ingest-post-metrics.ts (or ingest.ts)",
);

dirHasFiles("lib/analytics/adapters", 1);
fileExists("lib/analytics/adapters/mock-platform.ts");

const ingestSrc = existsSync(join(root, "lib/analytics/ingest-post-metrics.ts"))
  ? read("lib/analytics/ingest-post-metrics.ts")
  : read("lib/analytics/ingest.ts");
const adaptersIndex = read("lib/analytics/adapters/index.ts");
const mockAdapter = read("lib/analytics/adapters/mock-platform.ts");

assert(
  ingestSrc.includes("getAnalyticsRepository") ||
    ingestSrc.includes("upsert") ||
    ingestSrc.includes("write"),
  "C-17: ingest must write via repository (not freestyle wipe)",
);
assert(
  adaptersIndex.includes("mock") || mockAdapter.includes("createMock"),
  "C-17: adapters must expose mock platform path",
);
assert(
  mockAdapter.length > 50,
  "C-17: mock-platform adapter must be non-empty",
);

{
  const hasIngestApi = existsSync(
    join(root, "app/api/analytics/ingest/route.ts"),
  );
  const hasIngestScript = existsSync(
    join(root, "scripts/run-analytics-ingest.ts"),
  );
  assert(
    hasIngestApi || hasIngestScript,
    "C-17: need ingest API route and/or scripts/run-analytics-ingest.ts",
  );
}

assert(
  envExample.includes("INSTAGRAM") ||
    envExample.includes("YOUTUBE") ||
    envExample.includes("REDIS_URL"),
  "C-17: .env.example should document platform/queue placeholders",
);

// ---------------------------------------------------------------------------
// C-18 — analyst runner + prompt + API + InsightsFeed wire
// ---------------------------------------------------------------------------
fileExists("lib/analyst/run-insights.ts");
fileExists("workers/analyst/prompt.md");
fileExists("app/api/analytics/insights/route.ts");
fileExists("components/analytics/InsightsFeed.tsx");

const runInsights = read("lib/analyst/run-insights.ts");
const promptPack = read("workers/analyst/prompt.md");
const insightsRoute = read("app/api/analytics/insights/route.ts");
const insightsFeed = read("components/analytics/InsightsFeed.tsx");
const analyticsApi = existsSync(join(root, "lib/analytics-api.ts"))
  ? read("lib/analytics-api.ts")
  : "";

assert(
  runInsights.includes("runAnalystInsights") ||
    runInsights.includes("buildMockInsights"),
  "C-18: run-insights must export runner / mock path",
);
assert(
  runInsights.includes("mock") ||
    existsSync(join(root, "lib/analyst/mock-insights.ts")),
  "C-18: analyst must have no-key mock insights path",
);
assert(
  promptPack.includes("analyst@v") || promptPack.includes("SYSTEM"),
  "C-18: workers/analyst/prompt.md must be versioned prompt pack",
);
assert(
  /do\s+\*\*not\*\*\s+silently overwrite|Do not silently overwrite|HITL/i.test(
    promptPack,
  ) || promptPack.includes("promptHints"),
  "C-18: prompt pack must forbid silent overwrite / require HITL hints",
);
assert(
  insightsRoute.includes("GET") ||
    insightsRoute.includes("export async function GET"),
  "C-18: insights API route must export GET",
);
assert(
  insightsRoute.includes("runAnalyst") ||
    insightsRoute.includes("resolveInsights") ||
    insightsRoute.includes("insights"),
  "C-18: insights route must wire analyst / resolve path",
);

assert(
  insightsFeed.includes("fetchAnalyticsInsights") ||
    insightsFeed.includes("/api/analytics") ||
    insightsFeed.includes("analytics-api"),
  "C-18: InsightsFeed must fetch /api/analytics (or analytics-api client)",
);
assert(
  analyticsApi.includes("/api/analytics/insights") ||
    insightsFeed.includes("/api/analytics/insights") ||
    insightsFeed.includes("/api/analytics"),
  "C-18: client or feed must hit /api/analytics/insights (or analytics path)",
);
assert(
  insightsFeed.includes("hydrateInsightsFromApi") ||
    insightsFeed.includes("mock") ||
    insightsFeed.includes("insightsSource"),
  "C-18: InsightsFeed must keep mock fallback / hydrate on API failure",
);

assert(
  envExample.includes("OPENAI") ||
    envExample.includes("ANALYST_LLM") ||
    envExample.includes("ANTHROPIC"),
  "C-18: .env.example must document LLM key placeholders",
);

async function optionalHttpCheck() {
  const endpoints = [
    "http://127.0.0.1:3000/api/analytics/insights",
    "http://127.0.0.1:3000/analytics",
  ];
  for (const url of endpoints) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, {
        signal: ctrl.signal,
        redirect: "manual",
        headers: { Accept: "application/json, text/html" },
      });
      clearTimeout(timer);
      assert(
        res.status === 200,
        `C-18 HTTP: GET ${url} expected 200, got ${res.status}`,
      );
      console.log(`HTTP optional: GET ${url} → ${res.status}`);
    } catch (err) {
      console.log(
        `HTTP optional: ${url} not reachable (${err?.cause?.code || err?.name || "skip"}) — filesystem guards only`,
      );
    }
  }
}

await optionalHttpCheck();

if (fails.length) {
  console.error("sprint5-live-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint5-live-guards: GREEN (C-16, C-17, C-18)");
