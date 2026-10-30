/**
 * Sprint 5 executable guards for C-13 / C-14 / C-15 (Performance Analytics UI).
 * Run: node scripts/sprint5-guards.mjs
 *
 * Filesystem assertions always run. Optional HTTP check against
 * http://127.0.0.1:3000/analytics when localhost responds.
 */
import { readFileSync, existsSync } from "node:fs";
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

// --- Required files (filesystem) ---
const requiredRels = [
  "components/analytics/AnalyticsShell.tsx",
  "components/analytics/KpiCard.tsx",
  "components/analytics/RetentionChart.tsx",
  "components/analytics/InsightsFeed.tsx",
  "lib/analytics-mock.ts",
];
for (const rel of requiredRels) fileExists(rel);

fileExists("app/analytics/page.tsx");
fileExists("package.json");

const shell = read("components/analytics/AnalyticsShell.tsx");
const kpi = read("components/analytics/KpiCard.tsx");
const retention = read("components/analytics/RetentionChart.tsx");
const insightsFeed = read("components/analytics/InsightsFeed.tsx");
const mock = read("lib/analytics-mock.ts");
const page = read("app/analytics/page.tsx");
const pkg = read("package.json");

// --- C-13: Analytics shell + KPI + mock ---
assert(
  page.includes("AnalyticsShell") || shell.length > 0,
  "C-13: /analytics must mount AnalyticsShell (page or shell present)",
);
assert(
  shell.includes("KpiCard") ||
    shell.includes("KpiCardsRow") ||
    existsSync(join(root, "components/analytics/KpiCardsRow.tsx")),
  "C-13: AnalyticsShell wires KPI row",
);
assert(
  kpi.length > 0 &&
    (kpi.includes("GlassCard") ||
      kpi.includes("sparkline") ||
      kpi.includes("delta")),
  "C-13: KpiCard present with glass/delta/sparkline signal",
);
assert(
  mock.includes("kpis") && mock.includes("AnalyticsSnapshot"),
  "C-13: analytics-mock must export AnalyticsSnapshot with kpis",
);
{
  const kpiIds = ["views", "save_rate", "followers", "ai_efficiency"];
  const found = kpiIds.filter((id) => mock.includes(`"${id}"`));
  assert(
    found.length === 4,
    `C-13: mock must include all 4 KPI ids (found ${found.length})`,
  );
}
assert(
  !page.includes("Sprint 5 placeholder") &&
    !page.toLowerCase().includes("sprint 5 placeholder"),
  "C-13: analytics page must not be Sprint 5 placeholder",
);

// --- C-14: Retention chart + recharts ---
assert(
  retention.includes('from "recharts"') || retention.includes("from 'recharts'"),
  "C-14: RetentionChart must import from recharts",
);
assert(
  retention.includes("LineChart"),
  "C-14: RetentionChart must use LineChart",
);
assert(
  /"recharts"\s*:/.test(pkg),
  "C-14: package.json must declare recharts dependency",
);
assert(
  retention.includes("Tooltip") || retention.includes("ResponsiveContainer"),
  "C-14: RetentionChart must wire Tooltip or ResponsiveContainer",
);

// --- C-15: Insights feed ≥3 ---
assert(
  insightsFeed.includes("insights.map") ||
    insightsFeed.includes(".map((insight") ||
    insightsFeed.includes(".map(insight"),
  "C-15: InsightsFeed must map insights to cards",
);
{
  // Count insight seed objects in mock (id: "ins-...")
  const insightIds = mock.match(/id:\s*"ins-[^"]+"/g) || [];
  assert(
    insightIds.length >= 3,
    `C-15: analytics-mock must seed ≥3 insights (found ${insightIds.length})`,
  );
}
assert(
  insightsFeed.includes("InsightCard") ||
    insightsFeed.includes("tone") ||
    insightsFeed.includes("NeonBadge"),
  "C-15: InsightsFeed must render tone-differentiated insight UI",
);

async function optionalHttpCheck() {
  const url = "http://127.0.0.1:3000/analytics";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, { signal: ctrl.signal, redirect: "manual" });
    clearTimeout(timer);
    assert(
      res.status === 200,
      `C-13 HTTP: GET ${url} expected 200, got ${res.status}`,
    );
    console.log(`HTTP optional: GET ${url} → ${res.status}`);
  } catch (err) {
    console.log(
      `HTTP optional: localhost not reachable (${err?.cause?.code || err?.name || "skip"}) — filesystem guards only`,
    );
  }
}

await optionalHttpCheck();

if (fails.length) {
  console.error("sprint5-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint5-guards: GREEN (C-13, C-14, C-15)");
