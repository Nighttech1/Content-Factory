/**
 * C-30 — Carousel draft contract (session store; no Prisma).
 * Always unpublished; CapCut never opened from Razbor / Drafts (C-31).
 */

export type CarouselDraftSlide = {
  id: string;
  imageUrl: string;
  caption?: string;
  /** C-33 — Brand Kit logo URL on cover/finale (agents + preview). */
  brandLogoUrl?: string;
};

export type CarouselDraftStatus = "unpublished";

/** C-33 — Brand pack snapshot embedded on Razbor drafts. */
export type CarouselDraftBrand = {
  logoUrl: string;
  name: string;
  paletteNote: string;
  note: string;
};

export type CarouselDraft = {
  id: string;
  sourceCompetitorId: string;
  /** Alias for UI / API consumers that expect competitorId */
  competitorId?: string;
  title: string;
  slides: CarouselDraftSlide[];
  scenario?: string;
  status: CarouselDraftStatus;
  updatedAt: string;
  createdAt: string;
  /** C-33 — Brand Kit reference used by Designer */
  brand?: CarouselDraftBrand;
};

/**
 * C-59 — tab ids. Designer + publisher tabs only when moduleId is carousel-engine.
 * Publisher is a pane (datetime), not a chat agent.
 */
export type RazborAgentId =
  | "analyst"
  | "scriptwriter"
  | "designer"
  | "publisher";

export const CAROUSEL_ENGINE_MODULE_ID = "carousel-engine";

export function isCarouselRazborModule(moduleId?: string): boolean {
  return moduleId === CAROUSEL_ENGINE_MODULE_ID;
}

export type RazborChatMessage = {
  id: string;
  agentId: RazborAgentId;
  text: string;
  /** Suggested mock delay before showing (ms) */
  delayMs: number;
  /** C-32: user correction bubbles vs agent replies */
  role?: "user" | "agent";
};

export type RazborAgentMeta = {
  id: RazborAgentId;
  label: string;
  shortLabel: string;
};

/** C-51 default (non-carousel Razbor). */
/** C-77 — UI «Разборщик» (разбор чужого); id остаётся `analyst`. Аналитик = /analytics. */
export const RAZBOR_AGENTS: readonly RazborAgentMeta[] = [
  { id: "analyst", label: "Разборщик", shortLabel: "Разбор" },
  { id: "scriptwriter", label: "Сценарист", shortLabel: "Сценарий" },
] as const;

/**
 * Product TZ: carousel UI shows ONE Art Director chat.
 * Pipeline roles (script/designer/…) stay in Vernatun orchestrator as LLM masks —
 * not as separate UI tabs.
 */
export const RAZBOR_CAROUSEL_AGENTS: readonly RazborAgentMeta[] = [
  { id: "designer", label: "Арт-директор", shortLabel: "Арт" },
] as const;

/** @deprecated Multi-tab carousel Razbor — kept for reference only. */
export const RAZBOR_CAROUSEL_AGENTS_LEGACY: readonly RazborAgentMeta[] = [
  ...RAZBOR_AGENTS,
  { id: "designer", label: "Дизайнер", shortLabel: "Слайды" },
  { id: "publisher", label: "Публицист", shortLabel: "Слот" },
];

export function razborAgentsForModule(
  moduleId?: string,
): readonly RazborAgentMeta[] {
  return isCarouselRazborModule(moduleId)
    ? RAZBOR_CAROUSEL_AGENTS
    : RAZBOR_AGENTS;
}
