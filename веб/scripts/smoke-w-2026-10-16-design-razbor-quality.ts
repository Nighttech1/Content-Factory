/**
 * S52 compact smoke — wave 2026-10-16-design-razbor-quality
 * Tickets: C-design-tokens-only · C-razbor-draft-edit · C-carousel-quality-etalon
 *
 * Static + light runtime asserts. Does NOT run live 9 PNG gen (Deployer).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks: { ticket: string; name: string; pass: boolean; detail?: string }[] =
  [];

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function ok(
  ticket: string,
  name: string,
  cond: boolean,
  detail = "",
): void {
  checks.push({ ticket, name, pass: !!cond, detail });
  console.log(
    `${cond ? "PASS" : "FAIL"} | [${ticket}] ${name}${detail ? ` — ${detail}` : ""}`,
  );
}

/* ─── C-design-tokens-only ─── */

const designLibCarousel = read(
  "components/settings/DesignLibraryCarousel.tsx",
);
{
  const noImport =
    !/import\s*\{[^}]*SlicedSlotPreview/.test(designLibCarousel) &&
    !/from\s+["'][^"']*SlicedSlotPreview["']/.test(designLibCarousel);
  const noJsx = !/<SlicedSlotPreview[\s/>]/.test(designLibCarousel);
  const noTestId = !/sliced-slot-preview/.test(designLibCarousel);
  ok(
    "C-design-tokens-only",
    "DesignLibraryCarousel: no SlicedSlotPreview / sliced-slot-preview",
    noImport && noJsx && noTestId,
    `import=${noImport} jsx=${noJsx} testid=${noTestId}`,
  );
}

{
  // Strip file header + line comments so "No COVER/BODY/CTA" docs don't fail
  const codeOnly = designLibCarousel
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  ok(
    "C-design-tokens-only",
    "DesignLibraryCarousel: no COVER/BODY/CTA role-kit chrome",
    !/data-testid=["']sliced-slot-preview["']/.test(codeOnly) &&
      !/data-role=["'](cover|body|cta)["']/i.test(codeOnly) &&
      !/brandbook-buttons-card/.test(codeOnly) &&
      !/<SlicedSlotPreview[\s/>]/.test(codeOnly) &&
      !/\bFRAMES\b.*COVER|\bCOVER\b.*\bBODY\b.*\bCTA\b/.test(codeOnly),
  );
}

ok(
  "C-design-tokens-only",
  "toolbar left (not justify-end under nav)",
  /data-testid=["']design-library-toolbar["']/.test(designLibCarousel) &&
    /data-align=["']left["']/.test(designLibCarousel) &&
    /justify-start/.test(designLibCarousel) &&
    !/data-testid=["']design-library-toolbar["'][\s\S]{0,200}justify-end/.test(
      designLibCarousel,
    ),
);

const brandbook = read("components/settings/BrandbookBoard.tsx");
ok(
  "C-design-tokens-only",
  "BrandbookBoard: no button kit (brandbook-buttons-card)",
  !/brandbook-buttons-card/.test(brandbook) &&
    !/Primary\s*\/\s*Ghost\s*\/\s*CTA/.test(brandbook),
);

const quickTuner = read("components/settings/QuickThemeTuner.tsx");
ok(
  "C-design-tokens-only",
  "QuickThemeTuner: no SlicedSlotPreview",
  !/SlicedSlotPreview/.test(
    quickTuner
      .split("\n")
      .filter((l) => !l.trim().startsWith("*") && !l.trim().startsWith("//"))
      .join("\n"),
  ) ||
    (!/import[\s\S]*SlicedSlotPreview/.test(quickTuner) &&
      !/<SlicedSlotPreview/.test(quickTuner)),
);

const designLib = read("lib/settings/design-library.ts");
ok(
  "C-design-tokens-only",
  "buildDesignTokensPayload exports token fields",
  /export function buildDesignTokensPayload/.test(designLib) &&
    /textBlock:/.test(designLib) &&
    /smallElement:/.test(designLib) &&
    /colors:/.test(designLib) &&
    /typography:/.test(designLib),
);

ok(
  "C-design-tokens-only",
  "formatActiveDesignMdForPrompt: tokens-only, no layout markup dump",
  /export function formatActiveDesignMdForPrompt/.test(designLib) &&
    /TOKENS ONLY/.test(designLib) &&
    /buildDesignTokensPayload\(preset\)/.test(designLib) &&
    /cover|body_slide|cta_slide|role\s*kit|layout\s*grid/i.test(designLib) &&
    // filter strips those — must have the strip regex
    /\.filter\(/.test(designLib),
);

// Runtime: payload shape has no COVER/BODY/CTA kit keys
{
  const payloadFnMatch = designLib.match(
    /export function buildDesignTokensPayload\([\s\S]*?\n\}/,
  );
  const fnBody = payloadFnMatch?.[0] ?? "";
  ok(
    "C-design-tokens-only",
    "buildDesignTokensPayload body: no role-kit / layout markup keys",
    !/\b(cover|body_slide|cta_slide|buttonCta|layoutGrid|roleKit)\b/.test(
      fnBody,
    ) && /textBlock:/.test(fnBody) && /smallElement:/.test(fnBody),
  );
}

/* ─── C-razbor-draft-edit ─── */

const razborModal = read("components/studio/workspace/RazborModal.tsx");
ok(
  "C-razbor-draft-edit",
  "draft-edit hides start btn (showWelcomeCta gated)",
  /draftEditMode/.test(razborModal) &&
    /isRazborDraftEditMode/.test(razborModal) &&
    /showWelcomeCta\s*=\s*\n?\s*!draftEditMode/.test(razborModal) &&
    /data-testid=["']razbor-start-btn["']/.test(razborModal) &&
    /showWelcomeCta\s*\?/.test(razborModal),
);

ok(
  "C-razbor-draft-edit",
  "RazborCompetitorPickChrome wired",
  /RazborCompetitorPickChrome/.test(razborModal) &&
    /razbor-competitor-pick-chrome|RazborCompetitorPickChrome/.test(
      razborModal,
    ),
);

const pickChrome = read(
  "components/studio/workspace/RazborCompetitorPickChrome.tsx",
);
ok(
  "C-razbor-draft-edit",
  "competitor Выбрать chrome exists",
  /data-testid=["']razbor-competitor-vybrat["']/.test(pickChrome) &&
    /Выбрать/.test(pickChrome) &&
    /data-testid=["']razbor-comparison-square["']/.test(pickChrome) &&
    /data-testid=["']razbor-competitor-pick-chrome["']/.test(pickChrome),
);

const draftCtx = read("lib/studio/razbor-draft-context.ts");
ok(
  "C-razbor-draft-edit",
  "isRazborDraftEditMode + carousel context builder",
  /export function isRazborDraftEditMode/.test(draftCtx) &&
    /export function buildRazborDraftCarouselContext/.test(draftCtx),
);

/* ─── C-carousel-quality-etalon ─── */

const combat = read("lib/mesh/agent-defaults.ts");
// COMBAT briefs are string arrays joined — extract carousel-engine entry only
const combatCarouselBlock = (() => {
  const m = combat.match(
    /"carousel-engine":\s*\[([\s\S]*?)\]\.join\(/,
  );
  return m?.[1] ?? "";
})();

ok(
  "C-carousel-quality-etalon",
  "COMBAT carousel: TOPIC = user HARD present",
  combatCarouselBlock.length > 0 &&
    (/TOPIC LOCK \(HARD/.test(combatCarouselBlock) ||
      /ТОЛЬКО из сообщения пользователя/.test(combatCarouselBlock)),
  combatCarouselBlock.length === 0 ? "extract empty" : "",
);

ok(
  "C-carousel-quality-etalon",
  "COMBAT carousel: no coffee/jazz as default topic lock",
  /ЗАПРЕТ предполагать кофе\s*\/\s*джаз/.test(combatCarouselBlock) ||
    /нет topic-lock на кофе\/клуб/.test(combatCarouselBlock),
);

const prompts = read("lib/studio/create-carousel-prompts.ts");
ok(
  "C-carousel-quality-etalon",
  "create-carousel-prompts: TOPIC=user HARD",
  /TOPIC\s*=\s*user only \(HARD/.test(prompts) ||
    /### TOPIC = user only \(HARD/.test(prompts),
);

ok(
  "C-carousel-quality-etalon",
  "create-carousel-prompts: forbids coffee/jazz default topic",
  /Не подставляй кофе\s*\/\s*джаз|не подставляй кофе/i.test(prompts),
);

const etalonDir = "generatedMedia/эталон карусели";
ok(
  "C-carousel-quality-etalon",
  "etalon folder exists",
  exists(etalonDir) && exists(path.join(etalonDir, "README.md")),
  etalonDir,
);

{
  const etalonAbs = path.join(root, etalonDir);
  let pngCount = 0;
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (/\.png$/i.test(ent.name)) pngCount += 1;
    }
  }
  walk(etalonAbs);
  ok(
    "C-carousel-quality-etalon",
    "etalon has reference PNGs (seed)",
    pngCount >= 9,
    `pngCount=${pngCount}`,
  );
}

ok(
  "C-carousel-quality-etalon",
  "live-gen script prepared (Deployer owns run)",
  exists("scripts/live-gen-s52-armenian.ts"),
);

/* ─── summary ─── */

const byTicket = new Map<string, { pass: number; fail: number }>();
for (const c of checks) {
  const cur = byTicket.get(c.ticket) ?? { pass: 0, fail: 0 };
  if (c.pass) cur.pass += 1;
  else cur.fail += 1;
  byTicket.set(c.ticket, cur);
}

console.log("\n=== TICKET VERDICT ===");
let allPass = true;
for (const [ticket, s] of byTicket) {
  const verdict = s.fail === 0 ? "PASS" : "FAIL";
  if (s.fail > 0) allPass = false;
  console.log(`${verdict} | ${ticket} (${s.pass} pass / ${s.fail} fail)`);
}

const failed = checks.filter((c) => !c.pass);
if (failed.length) {
  console.log("\nFailed checks:");
  for (const f of failed) {
    console.log(`  - [${f.ticket}] ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  }
}

process.exit(allPass ? 0 : 1);
