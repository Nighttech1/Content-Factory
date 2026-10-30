/**
 * Analytics ingest scheduler (C-17).
 * - REDIS_URL → BullMQ repeatable job (primary)
 * - else → node-cron in-process (or no-op + CLI for serverless)
 *
 * Same handler: `runAnalyticsIngest()`.
 */
import { runAnalyticsIngest } from "./ingest-post-metrics";

export const ANALYTICS_INGEST_QUEUE = "analytics-ingest";
/** Daily 06:00 UTC */
export const ANALYTICS_INGEST_CRON = "0 6 * * *";

export type SchedulerMode = "bullmq" | "node-cron" | "noop";

export type SchedulerHandle = {
  mode: SchedulerMode;
  stop: () => Promise<void>;
};

type CronTask = { stop: () => void };

let started: SchedulerHandle | null = null;

function hasRedisUrl(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

async function startBullmqQueue(): Promise<SchedulerHandle> {
  const { Queue, Worker } = await import("bullmq");
  const IORedis = (await import("ioredis")).default;

  const connection = new IORedis(process.env.REDIS_URL!.trim(), {
    maxRetriesPerRequest: null,
  });

  const queue = new Queue(ANALYTICS_INGEST_QUEUE, { connection });
  // BullMQ v6: repeat via Job Scheduler (queue.add + repeat removed)
  await queue.upsertJobScheduler(
    "analytics-ingest-daily",
    { pattern: ANALYTICS_INGEST_CRON, tz: "UTC" },
    {
      name: "daily",
      data: {},
      opts: {
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    },
  );

  const worker = new Worker(
    ANALYTICS_INGEST_QUEUE,
    async () => {
      await runAnalyticsIngest();
    },
    { connection },
  );

  worker.on("failed", (job, err) => {
    // eslint-disable-next-line no-console
    console.error(
      `[scheduler] bullmq job failed id=${job?.id ?? "?"} ${err.message}`,
    );
  });

  // eslint-disable-next-line no-console
  console.info(
    `[scheduler] mode=bullmq queue=${ANALYTICS_INGEST_QUEUE} cron=${ANALYTICS_INGEST_CRON}`,
  );

  return {
    mode: "bullmq",
    async stop() {
      await worker.close();
      await queue.close();
      await connection.quit();
    },
  };
}

async function startNodeCron(): Promise<SchedulerHandle> {
  const cron = await import("node-cron");
  const task = cron.schedule(
    ANALYTICS_INGEST_CRON,
    () => {
      void runAnalyticsIngest().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[scheduler] node-cron ingest failed", err);
      });
    },
    { timezone: "UTC" },
  ) as unknown as CronTask;

  // eslint-disable-next-line no-console
  console.info(
    `[scheduler] mode=node-cron cron=${ANALYTICS_INGEST_CRON} (also use scripts/run-analytics-ingest.ts)`,
  );

  return {
    mode: "node-cron",
    async stop() {
      task.stop();
    },
  };
}

/**
 * Start the preferred scheduler once per process.
 * Safe to call from instrumentation / long-lived Node; no-op on serverless if desired.
 */
export async function startAnalyticsScheduler(options?: {
  /** Force noop (manual CLI/API only). */
  forceNoop?: boolean;
}): Promise<SchedulerHandle> {
  if (started) return started;
  if (options?.forceNoop) {
    started = {
      mode: "noop",
      async stop() {},
    };
    // eslint-disable-next-line no-console
    console.info("[scheduler] mode=noop (manual ingest via API/CLI)");
    return started;
  }

  if (hasRedisUrl()) {
    started = await startBullmqQueue();
    return started;
  }

  // Next.js serverless may not keep cron alive — CLI remains the reliable path.
  if (process.env.ANALYTICS_ENABLE_NODE_CRON === "1") {
    started = await startNodeCron();
    return started;
  }

  started = {
    mode: "noop",
    async stop() {},
  };
  // eslint-disable-next-line no-console
  console.info(
    "[scheduler] mode=noop (set REDIS_URL or ANALYTICS_ENABLE_NODE_CRON=1; or run npm run analytics:ingest)",
  );
  return started;
}

export async function stopAnalyticsScheduler(): Promise<void> {
  if (!started) return;
  await started.stop();
  started = null;
}

/** One-shot enqueue when Redis is available (smoke / Deployer). */
export async function enqueueAnalyticsIngestOnce(): Promise<
  | { ok: true; mode: "bullmq"; jobId: string }
  | { ok: false; mode: "skipped"; reason: string }
> {
  if (!hasRedisUrl()) {
    return { ok: false, mode: "skipped", reason: "REDIS_URL not set" };
  }

  const { Queue } = await import("bullmq");
  const IORedis = (await import("ioredis")).default;
  const connection = new IORedis(process.env.REDIS_URL!.trim(), {
    maxRetriesPerRequest: null,
  });
  const queue = new Queue(ANALYTICS_INGEST_QUEUE, { connection });
  try {
    const job = await queue.add("manual", {}, { removeOnComplete: 20 });
    return { ok: true, mode: "bullmq", jobId: String(job.id ?? "unknown") };
  } finally {
    await queue.close();
    await connection.quit();
  }
}
