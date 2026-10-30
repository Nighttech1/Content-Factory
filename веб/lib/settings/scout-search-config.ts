/**
 * C-97 / C-144 / S52 — Scout auto-search parameters (client localStorage).
 * Global key kept for migrate; Team Scout writes per pipeline (+ agent id).
 */

export const SCOUT_SEARCH_KEY = "cf.scout.search.v1";
export const SCOUT_LAST_RUN_KEY = "cf.scout.lastRun.v1";

export type ScoutSearchConfig = {
  version: 1;
  defaultTopic: string;
  lookbackDays: number;
  minViews: number;
  /** S52 — min likes filter before snapshot write */
  minLikes: number;
  /** S52 — min popularity score (likes+comments+views) */
  minVirality: number;
  /** S52 — auto-scout interval hours when autoRun */
  frequencyHours: number;
  platforms: string[];
  contentTypes: string[];
  autoRun: boolean;
};

export const DEFAULT_SCOUT_SEARCH: ScoutSearchConfig = {
  version: 1,
  defaultTopic: "",
  lookbackDays: 7,
  minViews: 10000,
  minLikes: 500,
  minVirality: 0,
  frequencyHours: 12,
  platforms: ["instagram", "tiktok", "youtube"],
  contentTypes: ["reels", "carousel", "shorts"],
  autoRun: false,
};

export function scoutSearchStorageKey(
  pipelineId?: string,
  agentId?: string,
): string {
  if (!pipelineId) return SCOUT_SEARCH_KEY;
  if (agentId) return `${SCOUT_SEARCH_KEY}:${pipelineId}:${agentId}`;
  return `${SCOUT_SEARCH_KEY}:${pipelineId}`;
}

function scoutLastRunKey(pipelineId: string, agentId = "scout"): string {
  return `${SCOUT_LAST_RUN_KEY}:${pipelineId}:${agentId}`;
}

function parseScoutConfig(raw: string | null): ScoutSearchConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ScoutSearchConfig>;
    return { ...DEFAULT_SCOUT_SEARCH, ...parsed, version: 1 };
  } catch {
    return null;
  }
}

/** Legacy global Settings key — migrate once into per-pipeline without wipe. */
export function readScoutSearchFromStorage(): ScoutSearchConfig {
  if (typeof window === "undefined") return DEFAULT_SCOUT_SEARCH;
  try {
    return (
      parseScoutConfig(window.localStorage.getItem(SCOUT_SEARCH_KEY)) ??
      DEFAULT_SCOUT_SEARCH
    );
  } catch {
    return DEFAULT_SCOUT_SEARCH;
  }
}

export function writeScoutSearchToStorage(cfg: ScoutSearchConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCOUT_SEARCH_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

/**
 * Per-pipeline (and optional scout agent id) read with one-shot migrate
 * from the legacy global `cf.scout.search.v1` key.
 */
export function readScoutSearchForAgent(
  pipelineId: string,
  agentId = "scout",
): ScoutSearchConfig {
  if (typeof window === "undefined") return DEFAULT_SCOUT_SEARCH;
  try {
    const keyed = scoutSearchStorageKey(pipelineId, agentId);
    const keyedCfg = parseScoutConfig(window.localStorage.getItem(keyed));
    if (keyedCfg) return keyedCfg;

    const pipelineOnly = scoutSearchStorageKey(pipelineId);
    const pipelineCfg = parseScoutConfig(
      window.localStorage.getItem(pipelineOnly),
    );
    if (pipelineCfg) {
      writeScoutSearchForAgent(pipelineId, agentId, pipelineCfg);
      return pipelineCfg;
    }

    const legacy = readScoutSearchFromStorage();
    writeScoutSearchForAgent(pipelineId, agentId, legacy);
    return legacy;
  } catch {
    return DEFAULT_SCOUT_SEARCH;
  }
}

export function writeScoutSearchForAgent(
  pipelineId: string,
  agentId: string,
  cfg: ScoutSearchConfig,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      scoutSearchStorageKey(pipelineId, agentId),
      JSON.stringify({ ...cfg, version: 1 }),
    );
  } catch {
    /* ignore */
  }
}

export function readScoutLastRunAt(
  pipelineId: string,
  agentId = "scout",
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(scoutLastRunKey(pipelineId, agentId));
  } catch {
    return null;
  }
}

export function writeScoutLastRunAt(
  pipelineId: string,
  agentId: string,
  iso: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(scoutLastRunKey(pipelineId, agentId), iso);
  } catch {
    /* ignore */
  }
}

/** Client-side auto-scout gate (mirrors server helper). */
export function shouldRunAutoScoutClient(
  lastRunAtIso: string | null | undefined,
  frequencyHours: number,
  nowMs = Date.now(),
): boolean {
  const hours = Math.max(1, Number(frequencyHours) || 12);
  if (!lastRunAtIso) return true;
  const last = Date.parse(lastRunAtIso);
  if (!Number.isFinite(last)) return true;
  return nowMs - last >= hours * 60 * 60 * 1000;
}

export const SCOUT_SNAPSHOT_UPDATED_EVENT = "cf.scout.snapshot-updated";

export function emitScoutSnapshotUpdated(moduleId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(SCOUT_SNAPSHOT_UPDATED_EVENT, {
      detail: { moduleId },
    }),
  );
}
