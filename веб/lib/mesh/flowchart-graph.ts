/**
 * C-139 — static flowchart layout constants (no @xyflow).
 * Dual-lane connection defs for SVG overlay.
 * Variant A — Art Director sits after Designer, before Publisher (carousel-only).
 */

export type StaticFlowConnection = {
  from: string;
  to: string;
  label: string | null;
  type: "direct" | "feedback";
};

/** Solid handoffs + dashed Trainer→release (no mid-text on feedback). */
export const STATIC_FLOW_CONNECTIONS: StaticFlowConnection[] = [
  { from: "node-user", to: "node-razbor", label: "запрос", type: "direct" },
  { from: "node-razbor", to: "node-copywriter", label: "разбор", type: "direct" },
  {
    from: "node-copywriter",
    to: "node-designer",
    label: "сценарий",
    type: "direct",
  },
  {
    from: "node-designer",
    to: "node-art-director",
    label: "ревью",
    type: "direct",
  },
  {
    from: "node-art-director",
    to: "node-publisher",
    label: "медиа",
    type: "direct",
  },
  { from: "node-scout", to: "node-analyst", label: "фильтр", type: "direct" },
  {
    from: "node-analyst",
    to: "node-trainer",
    label: "выводы",
    type: "direct",
  },
  { from: "node-trainer", to: "node-razbor", label: null, type: "feedback" },
  {
    from: "node-trainer",
    to: "node-copywriter",
    label: null,
    type: "feedback",
  },
  { from: "node-trainer", to: "node-designer", label: null, type: "feedback" },
  {
    from: "node-trainer",
    to: "node-art-director",
    label: null,
    type: "feedback",
  },
  {
    from: "node-trainer",
    to: "node-publisher",
    label: null,
    type: "feedback",
  },
];

/**
 * Fallback when Art Director agent is absent (legacy persist / non-seed).
 * Designer → Publisher direct (pre–Variant A).
 */
export const STATIC_FLOW_CONNECTIONS_NO_AD: StaticFlowConnection[] = [
  { from: "node-user", to: "node-razbor", label: "запрос", type: "direct" },
  { from: "node-razbor", to: "node-copywriter", label: "разбор", type: "direct" },
  {
    from: "node-copywriter",
    to: "node-designer",
    label: "сценарий",
    type: "direct",
  },
  {
    from: "node-designer",
    to: "node-publisher",
    label: "медиа",
    type: "direct",
  },
  { from: "node-scout", to: "node-analyst", label: "фильтр", type: "direct" },
  {
    from: "node-analyst",
    to: "node-trainer",
    label: "выводы",
    type: "direct",
  },
  { from: "node-trainer", to: "node-razbor", label: null, type: "feedback" },
  {
    from: "node-trainer",
    to: "node-copywriter",
    label: null,
    type: "feedback",
  },
  { from: "node-trainer", to: "node-designer", label: null, type: "feedback" },
  {
    from: "node-trainer",
    to: "node-publisher",
    label: null,
    type: "feedback",
  },
];

/** Lane A without Разборщик (non-carousel pipelines — no Art Director). */
export const STATIC_FLOW_CONNECTIONS_NO_RAZBOR: StaticFlowConnection[] = [
  {
    from: "node-user",
    to: "node-copywriter",
    label: "запрос",
    type: "direct",
  },
  {
    from: "node-copywriter",
    to: "node-designer",
    label: "сценарий",
    type: "direct",
  },
  {
    from: "node-designer",
    to: "node-publisher",
    label: "медиа",
    type: "direct",
  },
  { from: "node-scout", to: "node-analyst", label: "фильтр", type: "direct" },
  {
    from: "node-analyst",
    to: "node-trainer",
    label: "выводы",
    type: "direct",
  },
  {
    from: "node-trainer",
    to: "node-copywriter",
    label: null,
    type: "feedback",
  },
  { from: "node-trainer", to: "node-designer", label: null, type: "feedback" },
  {
    from: "node-trainer",
    to: "node-publisher",
    label: null,
    type: "feedback",
  },
];

/** Pick connection set for current mesh agents. */
export function getStaticFlowConnections(opts: {
  hasRazbor: boolean;
  hasArtDirector: boolean;
}): StaticFlowConnection[] {
  if (!opts.hasRazbor) return STATIC_FLOW_CONNECTIONS_NO_RAZBOR;
  if (opts.hasArtDirector) return STATIC_FLOW_CONNECTIONS;
  return STATIC_FLOW_CONNECTIONS_NO_AD;
}
