/**
 * Backend — Marketing Director app search / GraphQL-like reads (S47).
 * Soft-fail: empty arrays / null when DB unavailable — never throw secrets.
 */

import { listManifests } from "@/modules/manifests";
import { getPrisma } from "@/lib/db/prisma";

export type MarketingSearchHit = {
  kind: "module" | "job" | "schedule" | "note";
  id: string;
  title: string;
  snippet: string;
  meta?: Record<string, string | number | null>;
};

export type MarketingSearchResult = {
  ok: true;
  query: string;
  hits: MarketingSearchHit[];
  source: "live" | "empty" | "partial";
};

function softEmpty(query: string): MarketingSearchResult {
  return { ok: true, query, hits: [], source: "empty" };
}

function matchQuery(hay: string, q: string): boolean {
  if (!q.trim()) return true;
  return hay.toLowerCase().includes(q.toLowerCase());
}

/** REST / tool: search modules + ContentJob (+ soft schedule note). */
export async function runMarketingSearch(
  query: string,
  limit = 12,
): Promise<MarketingSearchResult> {
  const q = typeof query === "string" ? query.trim() : "";
  const hits: MarketingSearchHit[] = [];

  try {
    const modules = listManifests();
    for (const m of modules) {
      const blob = `${m.id} ${m.title} ${m.description ?? ""}`;
      if (!matchQuery(blob, q)) continue;
      hits.push({
        kind: "module",
        id: m.id,
        title: m.title,
        snippet: m.description ?? m.id,
        meta: { moduleId: m.id },
      });
    }
  } catch {
    /* soft */
  }

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const prisma = getPrisma();
      const jobs = await prisma.contentJob.findMany({
        take: Math.min(40, Math.max(limit * 2, 10)),
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          moduleId: true,
          topic: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
          createdAt: true,
        },
      });
      for (const job of jobs) {
        const blob = `${job.id} ${job.moduleId} ${job.topic} ${job.status}`;
        if (!matchQuery(blob, q)) continue;
        hits.push({
          kind: "job",
          id: job.id,
          title: job.topic.slice(0, 120) || job.id,
          snippet: `status=${job.status} · module=${job.moduleId}`,
          meta: {
            moduleId: job.moduleId,
            status: job.status,
            scheduledFor: job.scheduledFor?.toISOString() ?? null,
            publishedAt: job.publishedAt?.toISOString() ?? null,
          },
        });
        if (hits.filter((h) => h.kind === "job").length >= limit) break;
      }
    } catch {
      /* soft — no DB */
    }
  }

  if (hits.length === 0 && !q) {
    hits.push({
      kind: "note",
      id: "hint-empty",
      title: "Нет локальных данных",
      snippet:
        "Черновики/джобы пусты или БД недоступна. Стратегию можно строить по брифу пользователя.",
    });
  }

  const capped = hits.slice(0, limit);
  return {
    ok: true,
    query: q,
    hits: capped,
    source: capped.length === 0 ? "empty" : "live",
  };
}

export type GraphqlQueryName =
  | "modules"
  | "drafts"
  | "schedule"
  | "jobStats";

export type MarketingGraphqlResult = {
  ok: true;
  query: GraphqlQueryName | string;
  data: unknown;
  source: "live" | "empty" | "error";
};

/** Named read-only queries (GraphQL-like). */
export async function runMarketingGraphql(
  queryName: string,
  variables?: Record<string, unknown>,
): Promise<MarketingGraphqlResult> {
  const name = (queryName || "").trim() as GraphqlQueryName | string;
  const limit =
    typeof variables?.limit === "number" && Number.isFinite(variables.limit)
      ? Math.min(50, Math.max(1, Math.round(variables.limit)))
      : 20;

  try {
    if (name === "modules") {
      const modules = listManifests().map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? null,
      }));
      return {
        ok: true,
        query: name,
        data: { modules },
        source: modules.length ? "live" : "empty",
      };
    }

    if (name === "drafts" || name === "schedule" || name === "jobStats") {
      if (!process.env.DATABASE_URL?.trim()) {
        return {
          ok: true,
          query: name,
          data: name === "jobStats" ? { total: 0, byStatus: {} } : { items: [] },
          source: "empty",
        };
      }
      const prisma = getPrisma();

      if (name === "jobStats") {
        const rows = await prisma.contentJob.groupBy({
          by: ["status"],
          _count: { _all: true },
        });
        const byStatus: Record<string, number> = {};
        let total = 0;
        for (const r of rows) {
          byStatus[r.status] = r._count._all;
          total += r._count._all;
        }
        return {
          ok: true,
          query: name,
          data: { total, byStatus },
          source: total ? "live" : "empty",
        };
      }

      const jobs = await prisma.contentJob.findMany({
        take: limit,
        orderBy:
          name === "schedule"
            ? { scheduledFor: "asc" }
            : { updatedAt: "desc" },
        where:
          name === "schedule"
            ? { scheduledFor: { not: null } }
            : undefined,
        select: {
          id: true,
          moduleId: true,
          topic: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
          updatedAt: true,
        },
      });

      return {
        ok: true,
        query: name,
        data: {
          items: jobs.map((j) => ({
            id: j.id,
            moduleId: j.moduleId,
            topic: j.topic,
            status: j.status,
            scheduledFor: j.scheduledFor?.toISOString() ?? null,
            publishedAt: j.publishedAt?.toISOString() ?? null,
            updatedAt: j.updatedAt.toISOString(),
          })),
        },
        source: jobs.length ? "live" : "empty",
      };
    }

    return {
      ok: true,
      query: name,
      data: {
        error: "unknown_query",
        allowed: ["modules", "drafts", "schedule", "jobStats"],
      },
      source: "error",
    };
  } catch {
    return {
      ok: true,
      query: name,
      data: { error: "query_failed" },
      source: "error",
    };
  }
}
