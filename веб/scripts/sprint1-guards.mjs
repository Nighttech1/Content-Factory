/**
 * Sprint 1 executable guards for C-01 / C-02 / C-03.
 * Run: node scripts/sprint1-guards.mjs
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

// --- C-01: scaffold + deps ---
const pkg = JSON.parse(read("package.json") || "{}");
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
for (const name of [
  "next",
  "react",
  "react-dom",
  "@xyflow/react",
  "framer-motion",
  "lucide-react",
  "zustand",
  "@tanstack/react-query",
  "zod",
  "clsx",
  "tailwind-merge",
  "tailwindcss",
  "@tailwindcss/postcss",
]) {
  assert(Boolean(deps[name]), `C-01: package.json missing dep ${name}`);
}
assert(
  String(deps.next || "").startsWith("15."),
  `C-01: next must be 15.x, got ${deps.next}`,
);
assert(existsSync(join(root, "next.config.ts")), "C-01: next.config.ts missing");
assert(existsSync(join(root, "tsconfig.json")), "C-01: tsconfig.json missing");
assert(existsSync(join(root, "postcss.config.mjs")), "C-01: postcss.config.mjs missing");
assert(existsSync(join(root, "app/layout.tsx")), "C-01: app/layout.tsx missing");

// --- C-02: tokens + RBAC ---
const css = read("app/globals.css");
for (const token of [
  "--bg-canvas",
  "--bg-card",
  "--accent-blue",
  "--accent-gold",
  "--accent-terracotta",
]) {
  assert(css.includes(token), `C-02: globals.css missing token ${token}`);
}
assert(
  /--bg-canvas:\s*#08090a/i.test(css),
  "C-02: --bg-canvas must be #08090a family",
);
assert(
  /--accent-blue:\s*#2563eb/i.test(css),
  "C-02: --accent-blue must be cobalt #2563EB",
);

const session = read("lib/session-store.ts");
assert(
  /role:\s*"OWNER"/.test(session) || /role:\s*'OWNER'/.test(session),
  "C-02: session-store default role must be OWNER",
);
assert(
  session.includes('"OWNER"') && session.includes('"ADMIN"'),
  "C-02: session-store must support OWNER | ADMIN",
);

const sidebar = read("components/shell/SidebarNavigation.tsx");
assert(
  sidebar.includes("ownerOnly") &&
    /role\s*===\s*["']OWNER["']/.test(sidebar),
  "C-02: SidebarNavigation must hide ownerOnly items unless OWNER",
);
assert(
  sidebar.includes("Canvas (Node Mesh)"),
  "C-02: Canvas nav label must exist",
);

const mesh = read("app/admin/mesh/page.tsx");
assert(
  /role\s*===\s*["']ADMIN["']/.test(mesh) &&
    (mesh.includes('"/studio"') || mesh.includes("'/studio'")),
  "C-02: /admin/mesh must redirect ADMIN → /studio",
);

const layout = read("app/layout.tsx");
assert(
  layout.includes("Noto_Sans_Armenian") || layout.includes("Noto Sans Armenian"),
  "C-02: Noto Sans Armenian font must be wired in layout",
);

// --- C-03: primitives demo ---
for (const rel of [
  "components/ui/GlassCard.tsx",
  "components/ui/NeonBadge.tsx",
  "components/ui/ReactiveButton.tsx",
]) {
  assert(existsSync(join(root, rel)), `C-03: missing ${rel}`);
}
const glass = read("components/ui/GlassCard.tsx");
assert(
  glass.includes("backdrop-blur") && glass.includes("border-glass"),
  "C-03: GlassCard must use blur + glass border",
);
const badge = read("components/ui/NeonBadge.tsx");
assert(
  /cobalt|blue/.test(badge) && badge.includes("gold") && badge.includes("terracotta"),
  "C-03: NeonBadge must expose cobalt/gold/terracotta tones",
);
const btn = read("components/ui/ReactiveButton.tsx");
assert(
  btn.includes("whileTap") && /damping:\s*25/.test(btn) && /stiffness:\s*300/.test(btn),
  "C-03: ReactiveButton must use spring 25/300 press",
);
// C-03 demo section on /studio was replaced by Launchpad (C-06). Primitives must
// still exist (above) and GlassCard/NeonBadge remain mounted via ModuleSelectorGrid.
const grid = read("components/studio/ModuleSelectorGrid.tsx");
assert(
  grid.includes("GlassCard") && grid.includes("NeonBadge"),
  "C-03: Launchpad ModuleSelectorGrid must still use GlassCard + NeonBadge",
);
assert(
  existsSync(join(root, "components/ui/ReactiveButton.tsx")),
  "C-03: ReactiveButton must remain in DS (may be unused on Launchpad page)",
);

if (fails.length) {
  console.error("sprint1-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint1-guards: GREEN (C-01, C-02, C-03)");
process.exit(0);
