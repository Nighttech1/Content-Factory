/**
 * S46 smoke — W-2026-10-13-scriptwriter-swipe-cta
 * Tickets: C-scriptwriter-swipe-cta, C-scriptwriter-cta-hint-ui
 */
import fs from "node:fs";
import path from "node:path";
import {
  carouselJsonSchema,
  carouselCtaTypeSchema,
  CAROUSEL_JSON_SCHEMA_HINT,
} from "../lib/studio/carousel-json-contract";

const root = process.cwd();
const checks: { name: string; pass: boolean; detail?: string }[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function ok(name: string, cond: boolean, detail = "") {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

const prompts = read("lib/studio/create-carousel-prompts.ts");
ok(
  "overlay swipe META HARD",
  /swipe_trigger\s*=\s*META only \(HARD\)/i.test(prompts) &&
    /META only/i.test(prompts) &&
    /НИКОГДА[\s\S]{0,80}primary_copy[\s\S]{0,40}secondary_copy/i.test(prompts),
);
ok(
  "overlay CTA catalog 1–4",
  /CTA catalog 1–4 \(HARD\)/.test(prompts) &&
    /вопрос зрителю/.test(prompts) &&
    /хочешь ещё подобного/i.test(prompts) &&
    /живые встречи армянского разговорного клуба/.test(prompts) &&
    /лайк\+сохранить|лайк\+сохранить/i.test(prompts),
);
ok(
  "overlay ask CTA if missing",
  /спроси[\s\S]{0,40}CTA|ask 1–4/i.test(prompts),
);
ok(
  "designer describe no paint swipe",
  /CREATE_CAROUSEL_DESIGNER_DESCRIBE_OVERLAY[\s\S]*?do not render[\s\S]*?swipe_trigger/i.test(
    prompts,
  ) || /swipe_trigger[\s\S]{0,120}do not render/i.test(prompts),
);
ok(
  "designer draw no paint swipe",
  /Do not render[\s\S]{0,40}swipe_trigger|do not render[\s\S]{0,40}swipe_trigger/i.test(
    prompts,
  ),
);

const contract = read("lib/studio/carousel-json-contract.ts");
ok(
  "zod cta_type union 1|2|3|4",
  /carouselCtaTypeSchema\s*=\s*z\.union\(\[\s*z\.literal\(1\),\s*z\.literal\(2\),\s*z\.literal\(3\),\s*z\.literal\(4\),\s*\]\)/.test(
    contract,
  ),
);
ok(
  "cta_type on slide + root",
  /cta_type:\s*carouselCtaTypeSchema\.optional\(\)/.test(contract) &&
    (contract.match(/cta_type:\s*carouselCtaTypeSchema\.optional\(\)/g) || [])
      .length >= 2,
);
ok(
  "schema hint META + cta_type",
  /META engagement QA/.test(CAROUSEL_JSON_SCHEMA_HINT) &&
    /cta_type\?: 1\|2\|3\|4/.test(CAROUSEL_JSON_SCHEMA_HINT),
);

const ctaOk = carouselCtaTypeSchema.safeParse(2);
const ctaBad = carouselCtaTypeSchema.safeParse(5);
ok("zod accepts cta_type 2", ctaOk.success);
ok("zod rejects cta_type 5", !ctaBad.success);

const sample = {
  requested_slide_count: 2,
  cta_type: 2 as const,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Почему так говорят?",
      swipe_trigger: "Любопытство — листни за ответ",
      visual_prompt: "dark editorial cover",
    },
    {
      slide_number: 2,
      layout_variant: "cta",
      primary_copy: "Хочешь ещё подобного?",
      secondary_copy: "Подписывайся",
      swipe_trigger: "Конец — подписка",
      visual_prompt: "cta frame",
      cta_type: 2 as const,
    },
  ],
  caption: "caption",
  hashtags: ["#vernatun"],
};
const parsed = carouselJsonSchema.safeParse(sample);
ok("zod sample with cta_type ok", parsed.success);

const defaults = read("lib/mesh/agent-defaults.ts");
ok(
  "agent-defaults COMBAT CTA catalog 1–4 (C-audit-02)",
  /CTA catalog 1–4/.test(defaults) &&
    /вопрос→комментарии|вопрос→комменты/.test(defaults) &&
    /лайк\+сохранить/.test(defaults) &&
    !/бронь стола/.test(defaults) &&
    !/запись в сторис/.test(defaults),
);
ok(
  "designer defaults ignore swipe paint",
  /Do not render swipe_trigger|Ignore swipe_trigger paint/.test(defaults),
);

const hintUi = read("components/studio/workspace/ScriptwriterCtaHint.tsx");
ok(
  "ScriptwriterCtaHint testids",
  /create-scriptwriter-cta-hint/.test(hintUi) &&
    /create-scriptwriter-cta-hint-panel/.test(hintUi),
);
ok(
  "hint CTA rows 1–4 RU",
  /Вопрос зрителю/.test(hintUi) &&
    /Хочешь ещё подобного\?/.test(hintUi) &&
    /Живые встречи армянского разговорного клуба/.test(hintUi) &&
    /Понравился контент\?/.test(hintUi),
);

const modal = read("components/studio/workspace/CreateCarouselModal.tsx");
ok(
  "CreateCarouselModal is single Art Director chat",
  /Арт-директор/.test(modal) &&
    /create-carousel-ad-header/.test(modal) &&
    /Собрать карусель/.test(modal) &&
    !/ScriptwriterCtaHint/.test(modal),
);
ok(
  "ScriptwriterCtaHint component retained",
  /export function ScriptwriterCtaHint/.test(hintUi),
);

const failed = checks.filter((c) => !c.pass);
if (failed.length) {
  console.error(
    `\nSMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_FAIL (${failed.length})`,
  );
  process.exit(1);
}
console.log("\nSMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_OK");
