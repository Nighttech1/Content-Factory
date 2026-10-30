/**
 * C-26: Century Gothic UI font — Inter removed.
 * Run: node scripts/smoke-c26-century-gothic.mjs
 * Optional live: BASE_URL=http://127.0.0.1:3000 node scripts/smoke-c26-century-gothic.mjs
 * Exit 0 = GREEN; non-zero = RED for Fixer.
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

const layout = read("app/layout.tsx");
const css = read("app/globals.css");

// G1: Inter must not be imported / applied as UI font in layout
assert(
  !/\bInter\b/.test(layout),
  "C-26 G1: app/layout.tsx must not reference Inter",
);
assert(
  !/from\s+["']next\/font\/google["'][\s\S]*\bInter\b|\bInter\b[\s\S]*from\s+["']next\/font\/google["']/.test(
    layout,
  ),
  "C-26 G1: Inter must not come from next/font/google",
);
assert(
  /JetBrains_Mono/.test(layout),
  "C-26 G1: JetBrains_Mono must remain in layout",
);
assert(
  /Noto_Sans_Armenian/.test(layout),
  "C-26 G1: Noto_Sans_Armenian must remain in layout",
);
assert(
  /--font-mono-jb/.test(layout) && /--font-hy/.test(layout),
  "C-26 G1: --font-mono-jb and --font-hy CSS variables must remain",
);

// G2: --font-ui is Century Gothic stack; Inter not assigned as UI font
assert(
  /--font-ui:\s*[^;]*Century Gothic/i.test(css),
  "C-26 G2: --font-ui must include Century Gothic",
);
assert(
  !/--font-ui:\s*[^;]*\bInter\b/i.test(css),
  "C-26 G2: --font-ui must not include Inter",
);
assert(
  /@font-face[\s\S]*font-family:\s*["']Century Gothic["']/i.test(css),
  "C-26 G2: @font-face for Century Gothic required",
);
assert(
  /local\(\s*["']Century Gothic["']\s*\)/i.test(css),
  "C-26 G2: @font-face src must use local(Century Gothic)",
);
assert(
  /font-family:\s*var\(--font-ui\)/i.test(css),
  "C-26 G2: body (or cascade) must use var(--font-ui)",
);

// G3: no next/font Inter residual in layout className chain
assert(
  !/inter\.(variable|className|style)/i.test(layout),
  "C-26 G3: no Inter font object usage on body/html",
);

console.log("SMOKE_C26_SOURCE_OK");

const base = process.env.BASE_URL?.replace(/\/$/, "");
if (base) {
  try {
    const res = await fetch(`${base}/studio`);
    assert(res.status === 200, `C-26 live: GET /studio → ${res.status}, want 200`);
    const html = await res.text();
    assert(
      !/fonts\.googleapis\.com\/css2\?family=Inter/i.test(html),
      "C-26 live: HTML must not load Inter from Google Fonts",
    );
    assert(
      !/__next_font_inter|font-inter/i.test(html),
      "C-26 live: HTML must not embed Inter next/font class markers",
    );
    console.log("SMOKE_C26_LIVE_STUDIO_OK", res.status);
  } catch (e) {
    fails.push(`C-26 live fetch failed: ${e?.message || e}`);
  }
} else {
  console.log("SMOKE_C26_LIVE_SKIPPED (set BASE_URL for live HTTP)");
}

if (fails.length) {
  console.error("SMOKE_C26_FAIL");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}

console.log("SMOKE_C26_OK");
process.exit(0);
