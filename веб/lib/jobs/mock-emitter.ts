/**
 * Deterministic mock SSE timeline (C-23).
 * Messages match DEV_PLAN §2.3 / architect-spec agent mapping.
 * Runs ~few seconds; does not block generate HTTP response.
 */

import {
  appendJobEvent,
  clearJobTimers,
  createJob,
  getJob,
} from "./registry";
import type { JobStreamEvent } from "./types";

type TimedStep = {
  /** Delay from job start (ms). */
  atMs: number;
  event: JobStreamEvent;
};

/** Researcher → Hook Writer → Script Writer → Designer → done. */
export const MOCK_JOB_TIMELINE: TimedStep[] = [
  {
    atMs: 0,
    event: {
      status: "queued",
      agent: "system",
      message: "Задача в очереди...",
      progress: 0,
    },
  },
  {
    atMs: 350,
    event: {
      status: "running",
      agent: "researcher",
      message: "Анализ 40 источников...",
      progress: 15,
    },
  },
  {
    atMs: 1100,
    event: {
      status: "running",
      agent: "hook_writer",
      message: "Отбор лучшего хука (3 из 10)...",
      progress: 40,
    },
  },
  {
    atMs: 1900,
    event: {
      status: "running",
      agent: "script_writer",
      message: "Сборка таймлайна...",
      progress: 65,
    },
  },
  {
    atMs: 2700,
    event: {
      status: "running",
      agent: "designer",
      message: "Рендеринг визуала...",
      progress: 85,
    },
  },
  {
    atMs: 3500,
    event: {
      status: "completed",
      agent: "system",
      message: "Черновик готов",
      progress: 100,
    },
  },
];

/**
 * Create a job (if needed) and schedule the mock timeline.
 * Safe to call once per jobId — re-entry no-ops if events already started.
 */
export function createJobWithMockStream(jobId?: string): string {
  const job = createJob(jobId);
  startMockJobStream(job.id);
  return job.id;
}

/** Register timers that append MOCK_JOB_TIMELINE events. */
export function startMockJobStream(jobId: string): void {
  const job = getJob(jobId);
  if (!job) return;
  // Already emitting or finished — do not double-schedule.
  if (job.events.length > 0 || job.timers.length > 0 || job.completed) {
    return;
  }

  for (const step of MOCK_JOB_TIMELINE) {
    // Emit first frame synchronously so generate→EventSource is never empty.
    if (step.atMs <= 0) {
      appendJobEvent(jobId, step.event);
      continue;
    }
    const timer = setTimeout(() => {
      appendJobEvent(jobId, step.event);
    }, step.atMs);
    job.timers.push(timer);
  }
}

/** Cancel pending mock timers (tests / abort). */
export function stopMockJobStream(jobId: string): void {
  const job = getJob(jobId);
  if (!job) return;
  clearJobTimers(job);
}
