/**
 * Smoke — C-audit-04 markdown strip, C-audit-05 kit density, C-audit-06 fallback chain.
 *   npx tsx scripts/smoke-c-audit-04-05-06.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  sanitizeOnSlideMarkup,
  stripMarkdownEmphasis,
  buildCarouselSlideHtmlFromPreset,
} from "../lib/studio/carousel-html-renderer";
import { isRetryableAggregatorChatError } from "../lib/llm/aggregator-chat";
import {
  DEFAULT_SCRIPTWRITER_MODEL,
  SCRIPTWRITER_MODEL_FALLBACK_CHAIN,
  SCRIPTWRITER_SONNET_FALLBACK,
  SCRIPTWRITER_HAIKU_LAST_RESORT,
} from "../types/mesh-agent";
import { LLM_MODEL_CATALOG } from "../lib/settings/llm-models";
import type { DesignPresetFile } from "../types/design";

let failed = 0;
function assert(name: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`OK  ${name}${detail ? ` · ${detail}` : ""}`);
  } else {
    failed++;
    console.error(`FAIL ${name}${detail ? ` · ${detail}` : ""}`);
  }
}

// ── C-audit-04 ─────────────────────────────────────────────────────────────
const md = sanitizeOnSlideMarkup("Ритуал важнее *рецепта*");
assert("G4-1 no raw *рецепта*", !md.includes("*рецепта*") && !/\*[^*]+\*/.test(md), md);
assert("G4-2 has em", md.includes("<em") && md.includes("рецепта"), md);
assert(
  "G4-3 stripMarkdownEmphasis",
  stripMarkdownEmphasis("Сохрани *ритуал*") === "Сохрани ритуал",
);

const darkPreset: DesignPresetFile = {
  id: "smoke-dark",
  preset: "dark_notes",
  name: "smoke",
  designMd: "",
  colors: {
    bg: "#1A1814",
    surface: "#242018",
    text: "#F5F0E6",
    muted: "#A89B84",
    accent: "#F5D547",
    accentSoft: "#FFE88A",
  },
  typography: {
    display: "Manrope, sans-serif",
    body: "Manrope, sans-serif",
  },
  components: {
    buttonCta: { glow: false, radius: "12px", labelWeight: 700 },
    card: { glass: false },
    doodle: { enabled: true },
  },
  version: 1,
};

const bodyHtml = buildCarouselSlideHtmlFromPreset({
  backgroundUrl: "",
  primary: "Ритуал важнее *рецепта*",
  secondary: "пауза в реальности",
  role: "body_slide",
  preset: darkPreset,
  slideIndex: 1,
  slideTotal: 3,
  bodyOrdinal: 0,
});
assert("G4-4 body HTML no *рецепта*", !bodyHtml.includes("*рецепта*"));
assert("G4-5 body has em or md-em", /md-em|<\/em>/.test(bodyHtml));

// ── C-audit-05 ─────────────────────────────────────────────────────────────
assert("G5-1 body value-card", bodyHtml.includes("value-card"));
assert("G5-2 body chalk-fill", bodyHtml.includes("chalk-fill"));
assert(
  "G5-3 body checklist density",
  (bodyHtml.match(/check-row/g) ?? []).length >= 3,
);

const posterHtml = buildCarouselSlideHtmlFromPreset({
  backgroundUrl: "",
  primary: "Тишина громче *поста*?",
  secondary: "за столом",
  role: "cover",
  preset: {
    ...darkPreset,
    id: "smoke-poster",
    preset: "bold_poster",
    colors: {
      bg: "#FFFFFF",
      surface: "#FFF7F0",
      text: "#121212",
      muted: "#5C534C",
      accent: "#FF5A1F",
      accentSoft: "#FFB087",
    },
  },
  kitAesthetic: "clean_poster",
  defaultCtaLabel: "Пиши в комментариях",
  slideIndex: 0,
  slideTotal: 3,
  bodyOrdinal: -1,
});
assert("G5-4 poster-mid", posterHtml.includes("poster-mid"));
assert("G5-5 poster-beat", posterHtml.includes("poster-beat"));
assert("G5-6 poster no raw *поста*", !posterHtml.includes("*поста*"));

// ── C-audit-06 ─────────────────────────────────────────────────────────────
assert(
  "G6-1 chain primary",
  SCRIPTWRITER_MODEL_FALLBACK_CHAIN[0] === DEFAULT_SCRIPTWRITER_MODEL &&
    DEFAULT_SCRIPTWRITER_MODEL === "anthropic/claude-3.7-sonnet",
);
assert(
  "G6-2 chain has sonnet-4 before haiku",
  SCRIPTWRITER_MODEL_FALLBACK_CHAIN.includes(SCRIPTWRITER_SONNET_FALLBACK) &&
    SCRIPTWRITER_MODEL_FALLBACK_CHAIN.indexOf(SCRIPTWRITER_SONNET_FALLBACK) <
      SCRIPTWRITER_MODEL_FALLBACK_CHAIN.indexOf(SCRIPTWRITER_HAIKU_LAST_RESORT),
);
assert(
  "G6-3 haiku is last",
  SCRIPTWRITER_MODEL_FALLBACK_CHAIN[
    SCRIPTWRITER_MODEL_FALLBACK_CHAIN.length - 1
  ] === SCRIPTWRITER_HAIKU_LAST_RESORT,
);
assert(
  "G6-4 retryable 503",
  isRetryableAggregatorChatError("aggregator_http_503"),
);
assert(
  "G6-5 catalog sonnet-4",
  LLM_MODEL_CATALOG.some((m) => m.id === "anthropic/claude-sonnet-4"),
);

const agentChat = readFileSync(
  resolve(process.cwd(), "app/api/studio/agent-chat/route.ts"),
  "utf8",
);
assert(
  "G6-6 agent-chat fallbackModels",
  /fallbackModels:\s*true/.test(agentChat) &&
    /useScriptwriterFallback/.test(agentChat),
);

const decisions = readFileSync(
  resolve(
    process.cwd(),
    "memory/tickets/C-audit-06-sonnet-live-503/decisions.md",
  ),
  "utf8",
);
assert("G6-7 decisions D-f", /D-f-3/.test(decisions) && /sonnet-4/.test(decisions));

if (failed > 0) {
  console.error(`\nSMOKE FAIL ${failed}`);
  process.exit(1);
}
console.log("\nSMOKE OK c-audit-04/05/06");
