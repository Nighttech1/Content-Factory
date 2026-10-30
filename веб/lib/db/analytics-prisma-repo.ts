import type { PrismaClient } from "@prisma/client";

import type {
  AnalyticsKpiAggregate,
  AnalyticsRepository,
  PostAnalyticsRow,
  PostAnalyticsWrite,
  PublishedJobRow,
} from "./analytics-types";
import {
  asRetentionCurve,
  dayBucketSnapshotId,
  normalizeCapturedAt,
} from "./analytics-types";

function toRow(record: {
  id: string;
  postId: string;
  platform: string;
  views: number;
  saves: number;
  shares: number;
  retentionCurve: unknown;
  capturedAt: Date;
  contentJobId: string | null;
}): PostAnalyticsRow {
  return {
    id: record.id,
    postId: record.postId,
    platform: record.platform,
    views: record.views,
    saves: record.saves,
    shares: record.shares,
    retentionCurve: asRetentionCurve(record.retentionCurve),
    capturedAt: record.capturedAt,
    contentJobId: record.contentJobId,
  };
}

export function createPrismaAnalyticsRepository(
  prisma: PrismaClient,
): AnalyticsRepository {
  return {
    storeKind: "prisma",

    async upsertSnapshot(input: PostAnalyticsWrite): Promise<PostAnalyticsRow> {
      const capturedAt = normalizeCapturedAt(input.capturedAt);
      const id =
        input.id ??
        dayBucketSnapshotId(input.postId, input.platform, capturedAt);
      const data = {
        postId: input.postId,
        platform: input.platform,
        views: input.views ?? 0,
        saves: input.saves ?? 0,
        shares: input.shares ?? 0,
        retentionCurve: input.retentionCurve ?? undefined,
        capturedAt,
        contentJobId: input.contentJobId ?? null,
      };

      const row = await prisma.postAnalytics.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      return toRow(row);
    },

    async listByPost(
      postId: string,
      platform?: string,
    ): Promise<PostAnalyticsRow[]> {
      const rows = await prisma.postAnalytics.findMany({
        where: {
          postId,
          ...(platform ? { platform } : {}),
        },
        orderBy: { capturedAt: "desc" },
      });
      return rows.map(toRow);
    },

    async listLatest(limit: number): Promise<PostAnalyticsRow[]> {
      const rows = await prisma.postAnalytics.findMany({
        orderBy: { capturedAt: "desc" },
        take: Math.max(0, limit),
      });
      return rows.map(toRow);
    },

    async aggregateForKpi(since: Date): Promise<AnalyticsKpiAggregate> {
      const rows = await prisma.postAnalytics.findMany({
        where: { capturedAt: { gte: since } },
        select: { views: true, saves: true, shares: true },
      });
      return rows.reduce<AnalyticsKpiAggregate>(
        (acc, row) => {
          acc.views += row.views;
          acc.saves += row.saves;
          acc.shares += row.shares;
          acc.snapshotCount += 1;
          return acc;
        },
        { views: 0, saves: 0, shares: 0, snapshotCount: 0 },
      );
    },

    async listPublishedJobs(): Promise<PublishedJobRow[]> {
      const rows = await prisma.contentJob.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          moduleId: true,
          topic: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      });
      return rows.map((j) => ({
        id: j.id,
        moduleId: j.moduleId,
        topic: j.topic,
        publishedAt: j.publishedAt,
      }));
    },

    async ensureSeedFixtures(input): Promise<void> {
      await prisma.user.upsert({
        where: { id: input.user.id },
        create: {
          id: input.user.id,
          email: input.user.email,
          name: input.user.name,
          role: input.user.role,
        },
        update: {
          email: input.user.email,
          name: input.user.name,
          role: input.user.role,
        },
      });

      for (const job of input.jobs) {
        const publishedAt = normalizeCapturedAt(job.publishedAt);
        await prisma.contentJob.upsert({
          where: { id: job.id },
          create: {
            id: job.id,
            moduleId: job.moduleId,
            topic: job.topic,
            status: job.status,
            rawScript: job.rawScript as object,
            userId: job.userId,
            publishedAt,
          },
          update: {
            moduleId: job.moduleId,
            topic: job.topic,
            status: job.status,
            rawScript: job.rawScript as object,
            userId: job.userId,
            publishedAt,
          },
        });
      }

      for (const snap of input.snapshots) {
        await this.upsertSnapshot(snap);
      }
    },
  };
}
