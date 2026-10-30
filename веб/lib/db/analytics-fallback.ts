import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  AnalyticsKpiAggregate,
  AnalyticsRepository,
  PostAnalyticsRow,
  PostAnalyticsWrite,
  PublishedJobRow,
  SeedJobInput,
  SeedUserInput,
} from "./analytics-types";
import {
  asRetentionCurve,
  dayBucketSnapshotId,
  normalizeCapturedAt,
} from "./analytics-types";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "post-analytics.json");

type FallbackUser = SeedUserInput & { createdAt: string };
type FallbackJob = SeedJobInput & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};
type FallbackSnapshot = {
  id: string;
  postId: string;
  platform: string;
  views: number;
  saves: number;
  shares: number;
  retentionCurve: PostAnalyticsRow["retentionCurve"];
  capturedAt: string;
  contentJobId: string | null;
};

type FallbackStore = {
  users: FallbackUser[];
  contentJobs: FallbackJob[];
  postAnalytics: FallbackSnapshot[];
};

function emptyStore(): FallbackStore {
  return { users: [], contentJobs: [], postAnalytics: [] };
}

function rowFromSnapshot(s: FallbackSnapshot): PostAnalyticsRow {
  return {
    id: s.id,
    postId: s.postId,
    platform: s.platform,
    views: s.views,
    saves: s.saves,
    shares: s.shares,
    retentionCurve: s.retentionCurve,
    capturedAt: new Date(s.capturedAt),
    contentJobId: s.contentJobId,
  };
}

async function readStore(): Promise<FallbackStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<FallbackStore>;
    return {
      users: parsed.users ?? [],
      contentJobs: parsed.contentJobs ?? [],
      postAnalytics: parsed.postAnalytics ?? [],
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return emptyStore();
    throw err;
  }
}

async function writeStore(store: FallbackStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

/**
 * JSON-file analytics store for localhost without Postgres.
 * Path: data/local/post-analytics.json (gitignored).
 */
export function createFallbackAnalyticsRepository(): AnalyticsRepository {
  return {
    storeKind: "fallback",

    async upsertSnapshot(input: PostAnalyticsWrite): Promise<PostAnalyticsRow> {
      const store = await readStore();
      const capturedAt = normalizeCapturedAt(input.capturedAt);
      const id =
        input.id ??
        dayBucketSnapshotId(input.postId, input.platform, capturedAt);
      const next: FallbackSnapshot = {
        id,
        postId: input.postId,
        platform: input.platform,
        views: input.views ?? 0,
        saves: input.saves ?? 0,
        shares: input.shares ?? 0,
        retentionCurve: input.retentionCurve ?? null,
        capturedAt: capturedAt.toISOString(),
        contentJobId: input.contentJobId ?? null,
      };

      const idx = store.postAnalytics.findIndex((row) => row.id === id);
      if (idx >= 0) {
        store.postAnalytics[idx] = next;
      } else {
        store.postAnalytics.push(next);
      }
      await writeStore(store);
      return rowFromSnapshot(next);
    },

    async listByPost(
      postId: string,
      platform?: string,
    ): Promise<PostAnalyticsRow[]> {
      const store = await readStore();
      return store.postAnalytics
        .filter(
          (row) =>
            row.postId === postId &&
            (platform == null || row.platform === platform),
        )
        .map(rowFromSnapshot)
        .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
    },

    async listLatest(limit: number): Promise<PostAnalyticsRow[]> {
      const store = await readStore();
      return store.postAnalytics
        .map(rowFromSnapshot)
        .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())
        .slice(0, Math.max(0, limit));
    },

    async aggregateForKpi(since: Date): Promise<AnalyticsKpiAggregate> {
      const store = await readStore();
      const sinceMs = since.getTime();
      let views = 0;
      let saves = 0;
      let shares = 0;
      let snapshotCount = 0;
      for (const row of store.postAnalytics) {
        if (new Date(row.capturedAt).getTime() < sinceMs) continue;
        views += row.views;
        saves += row.saves;
        shares += row.shares;
        snapshotCount += 1;
      }
      return { views, saves, shares, snapshotCount };
    },

    async listPublishedJobs(): Promise<PublishedJobRow[]> {
      const store = await readStore();
      return store.contentJobs
        .filter((j) => j.status === "PUBLISHED")
        .map((j) => ({
          id: j.id,
          moduleId: j.moduleId,
          topic: j.topic,
          publishedAt: j.publishedAt ? new Date(j.publishedAt) : null,
        }));
    },

    async ensureSeedFixtures(input): Promise<void> {
      const store = await readStore();
      const now = new Date().toISOString();

      if (!store.users.some((u) => u.id === input.user.id)) {
        store.users.push({ ...input.user, createdAt: now });
      }

      for (const job of input.jobs) {
        const publishedAt = normalizeCapturedAt(job.publishedAt).toISOString();
        const existing = store.contentJobs.findIndex((j) => j.id === job.id);
        const row: FallbackJob = {
          ...job,
          publishedAt,
          createdAt: now,
          updatedAt: now,
        };
        if (existing >= 0) {
          store.contentJobs[existing] = {
            ...store.contentJobs[existing],
            ...row,
            createdAt: store.contentJobs[existing].createdAt,
          };
        } else {
          store.contentJobs.push(row);
        }
      }

      for (const snap of input.snapshots) {
        const id = snap.id ?? randomUUID();
        const capturedAt = normalizeCapturedAt(snap.capturedAt).toISOString();
        const next: FallbackSnapshot = {
          id,
          postId: snap.postId,
          platform: snap.platform,
          views: snap.views ?? 0,
          saves: snap.saves ?? 0,
          shares: snap.shares ?? 0,
          retentionCurve: asRetentionCurve(snap.retentionCurve),
          capturedAt,
          contentJobId: snap.contentJobId ?? null,
        };
        const idx = store.postAnalytics.findIndex((r) => r.id === id);
        if (idx >= 0) store.postAnalytics[idx] = next;
        else store.postAnalytics.push(next);
      }

      await writeStore(store);
    },
  };
}
