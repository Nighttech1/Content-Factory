import { NextResponse } from "next/server";

import { emptyFeed, resolveFeed } from "@/lib/studio/feed-fixtures";
import { resolveStudioFeed } from "@/lib/studio/ig-live-feed";
import {
  allowFeedFixtures,
  isIgScraperConfigured,
} from "@/lib/studio/ig-scraper-config";
import { isCustomModuleId, isFeedCoreModuleId } from "@/lib/studio/feed-types";
import type { FeedResponse } from "@/lib/studio/feed-types";
import { readCarouselReferences } from "@/lib/studio/carousel-references";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Карусели: образцы владельца («сделай так же») идут ПЕРВЫМИ в конкурентах. */
async function withCarouselReferences(
  moduleId: string,
  feed: FeedResponse,
): Promise<FeedResponse> {
  if (moduleId !== "carousel-engine") return feed;
  const refs = await readCarouselReferences();
  if (refs.length === 0) return feed;
  const refIds = new Set(refs.map((r) => r.id));
  return {
    ...feed,
    competitors: [
      ...refs,
      ...feed.competitors.filter((p) => !refIds.has(p.id)),
    ],
  };
}

type RouteCtx = { params: Promise<{ moduleId: string }> };

/** S50 — fast path must not paint mock competitors when live scraper is configured. */
function fastFeedForModule(
  moduleId: string,
  topic: string | undefined,
): FeedResponse | null {
  if (moduleId === "custom-reels") {
    return emptyFeed();
  }
  const base = resolveFeed(moduleId, topic);
  if (!base) return null;
  if (
    moduleId === "carousel-engine" &&
    isIgScraperConfigured() &&
    !allowFeedFixtures()
  ) {
    return {
      ours: base.ours,
      competitors: [],
      sourceMode: "mock",
    };
  }
  return base;
}

/**
 * GET /api/studio/[moduleId]/feed?topic=&fast=1
 *
 * S52 — **never** calls Apify. Competitors = last Scout snapshot (or fixtures
 * when scraper off / USE_FEED_FIXTURES). Apify only via POST .../scout/run.
 *
 * - carousel-engine: Scout snapshot competitors; Ours Graph when configured.
 * - custom-reels: Scout snapshot VIDEO or empty
 * - other core 4: fixture ours + competitors
 * - other custom-*: empty feed
 * - `?fast=1`: fixtures/empty only
 * Soft-fail never 500. Never returns tokens in JSON.
 */
export async function GET(
  req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;
  const url = new URL(req.url);
  const topicRaw = url.searchParams.get("topic");
  const topic =
    typeof topicRaw === "string" ? topicRaw.trim() : "";
  const fast = url.searchParams.get("fast") === "1";

  if (fast) {
    if (isFeedCoreModuleId(moduleId) || moduleId === "custom-reels") {
      const feed = fastFeedForModule(moduleId, topic || undefined);
      if (feed) {
        return NextResponse.json(await withCarouselReferences(moduleId, feed));
      }
    }
    if (isCustomModuleId(moduleId)) {
      return NextResponse.json(emptyFeed());
    }
    return NextResponse.json(
      { ok: false, error: "module_not_found" },
      { status: 404 },
    );
  }

  const feed = await resolveStudioFeed(moduleId, topic || undefined);
  if (feed) {
    return NextResponse.json(await withCarouselReferences(moduleId, feed));
  }

  return NextResponse.json(
    { ok: false, error: "module_not_found" },
    { status: 404 },
  );
}
