/**
 * SSE job stream contracts (C-23 / DEV_PLAN 7.1).
 * Ephemeral mock jobs — no Redis / Prisma required.
 */

export type JobStreamStatus = "queued" | "running" | "completed" | "failed";

export type JobStreamAgent =
  | "researcher"
  | "hook_writer"
  | "script_writer"
  | "designer"
  | "system";

/** JSON payload inside each SSE `data:` frame. */
export type JobStreamEvent = {
  status: JobStreamStatus;
  agent: JobStreamAgent;
  message: string;
  progress: number;
};

/** Stored event with monotonic id for Last-Event-ID replay. */
export type StoredJobEvent = JobStreamEvent & {
  id: number;
};

export type JobRecord = {
  id: string;
  createdAt: number;
  events: StoredJobEvent[];
  /** Next monotonic id to assign (1-based). */
  nextEventId: number;
  completed: boolean;
  listeners: Set<(event: StoredJobEvent) => void>;
  /** Active mock timers — cleared on complete / dispose. */
  timers: ReturnType<typeof setTimeout>[];
};
