/**
 * Ephemeral job registry on globalThis (C-23).
 * Same dual-bundle lesson as C-22 module registry — one Map across route chunks.
 */

import type { JobRecord, JobStreamEvent, StoredJobEvent } from "./types";

const GLOBAL_KEY = "__cfJobRegistry" as const;

type CfJobRegistryState = {
  jobsById: Map<string, JobRecord>;
};

type GlobalWithJobs = typeof globalThis & {
  [GLOBAL_KEY]?: CfJobRegistryState;
};

function getState(): CfJobRegistryState {
  const g = globalThis as GlobalWithJobs;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { jobsById: new Map() };
  }
  return g[GLOBAL_KEY];
}

function jobsById(): Map<string, JobRecord> {
  return getState().jobsById;
}

/** Shape: `job_<uuid>` (no secrets). */
export function createJobId(): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `job_${uuid}`;
}

/** Register a new empty job and return it. */
export function createJob(id?: string): JobRecord {
  const jobId = id ?? createJobId();
  const existing = jobsById().get(jobId);
  if (existing) return existing;

  const record: JobRecord = {
    id: jobId,
    createdAt: Date.now(),
    events: [],
    nextEventId: 1,
    completed: false,
    listeners: new Set(),
    timers: [],
  };
  jobsById().set(jobId, record);
  return record;
}

export function getJob(id: string): JobRecord | undefined {
  if (!id || typeof id !== "string") return undefined;
  return jobsById().get(id);
}

/** Append an event, notify subscribers. Marks completed on terminal status. */
export function appendJobEvent(
  jobId: string,
  event: JobStreamEvent,
): StoredJobEvent | null {
  const job = getJob(jobId);
  if (!job) return null;

  const stored: StoredJobEvent = {
    ...event,
    id: job.nextEventId++,
    progress: clampProgress(event.progress),
  };
  job.events.push(stored);

  if (stored.status === "completed" || stored.status === "failed") {
    job.completed = true;
    clearJobTimers(job);
  }

  for (const listener of job.listeners) {
    try {
      listener(stored);
    } catch {
      // Listener errors must not break the emitter.
    }
  }

  return stored;
}

/** Events with id strictly greater than `afterId` (Last-Event-ID replay). */
export function getEventsAfter(
  job: JobRecord,
  afterId: number,
): StoredJobEvent[] {
  const floor = Number.isFinite(afterId) ? afterId : 0;
  return job.events.filter((ev) => ev.id > floor);
}

/**
 * Subscribe to live appends. Returns unsubscribe.
 * Does not replay history — caller should call getEventsAfter first.
 */
export function subscribeJob(
  jobId: string,
  listener: (event: StoredJobEvent) => void,
): () => void {
  const job = getJob(jobId);
  if (!job) return () => undefined;
  job.listeners.add(listener);
  return () => {
    job.listeners.delete(listener);
  };
}

export function clearJobTimers(job: JobRecord): void {
  for (const t of job.timers) clearTimeout(t);
  job.timers = [];
}

function clampProgress(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Test helper — wipe all jobs (smokes only). */
export function __resetJobRegistryForTests(): void {
  const map = jobsById();
  for (const job of map.values()) {
    clearJobTimers(job);
    job.listeners.clear();
  }
  map.clear();
}
