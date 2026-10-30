/**
 * Ephemeral in-memory jobs + mock SSE emitter (C-23).
 * No Redis / Prisma — localhost demo OK.
 */

export type {
  JobRecord,
  JobStreamAgent,
  JobStreamEvent,
  JobStreamStatus,
  StoredJobEvent,
} from "./types";

export {
  __resetJobRegistryForTests,
  appendJobEvent,
  clearJobTimers,
  createJob,
  createJobId,
  getEventsAfter,
  getJob,
  subscribeJob,
} from "./registry";

export {
  MOCK_JOB_TIMELINE,
  createJobWithMockStream,
  startMockJobStream,
  stopMockJobStream,
} from "./mock-emitter";
