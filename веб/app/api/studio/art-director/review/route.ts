/**
 * POST /api/studio/art-director/review
 * Body: { draftId?: string, slideUrls?: string[] }
 * Runs Art Director vision/LLM critique once. NEVER triggers remake.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { getDraft, patchDraft } from "@/lib/db/drafts-repository";
import {
  formatArtDirectorReviewMarkdown,
  runArtDirectorReview,
} from "@/lib/studio/art-director-run";
import type { CarouselHandoffJson } from "@/lib/studio/carousel-json-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

type Body = {
  draftId?: string;
  slideUrls?: string[];
  model?: string;
  jobId?: string;
};

function parseHandoff(scenario: string | null | undefined): CarouselHandoffJson | null {
  if (!scenario?.trim()) return null;
  try {
    const parsed = JSON.parse(scenario) as CarouselHandoffJson;
    if (parsed && Array.isArray(parsed.slides)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function slideUrlsFromDraft(draft: {
  slides: unknown;
}): string[] {
  const slides = draft.slides;
  if (!Array.isArray(slides)) return [];
  const urls: string[] = [];
  for (const s of slides) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    if (typeof o.imageUrl === "string" && o.imageUrl.trim()) {
      urls.push(o.imageUrl.trim());
    }
  }
  return urls;
}

export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", remakeEnqueued: false },
      { status: 400 },
    );
  }

  const actor = await resolveActor(req);
  const draftId =
    typeof body.draftId === "string" && body.draftId.trim()
      ? body.draftId.trim()
      : undefined;
  let slideUrls = Array.isArray(body.slideUrls)
    ? body.slideUrls.filter(
        (u): u is string => typeof u === "string" && u.trim().length > 0,
      )
    : [];

  let handoff: CarouselHandoffJson | null = null;
  let draftPayload: Record<string, unknown> | null = null;

  if (draftId) {
    const draft = await getDraft({ userId: actor.userId, id: draftId });
    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "draft_not_found", remakeEnqueued: false },
        { status: 404 },
      );
    }
    handoff = parseHandoff(draft.scenario);
    draftPayload =
      draft.payload && typeof draft.payload === "object"
        ? { ...(draft.payload as Record<string, unknown>) }
        : {};
    if (slideUrls.length === 0) {
      slideUrls = slideUrlsFromDraft(draft);
    }
  }

  if (slideUrls.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "draftId_or_slideUrls_required",
        remakeEnqueued: false,
      },
      { status: 400 },
    );
  }

  const result = await runArtDirectorReview({
    userId: actor.userId,
    draftId,
    jobId: typeof body.jobId === "string" ? body.jobId : undefined,
    slideUrls,
    handoff,
    briefMeta: {
      idea: handoff?.idea,
      hook: handoff?.hook,
      mode: handoff?.mode,
      renderMode: "layered_html",
    },
    model: typeof body.model === "string" ? body.model : undefined,
    appendLog: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        remakeEnqueued: false,
      },
      { status: 502 },
    );
  }

  // Persist on draft payload — never remake
  if (draftId) {
    const nextPayload = {
      ...(draftPayload ?? {}),
      artDirectorReview: {
        ...result.verdict,
        model: result.model,
        source: result.source,
        reviewedAt: new Date().toISOString(),
        remakeEnqueued: false,
      },
    };
    await patchDraft({
      userId: actor.userId,
      id: draftId,
      patch: { payload: nextPayload },
    });
  }

  const markdown = formatArtDirectorReviewMarkdown(result.verdict, {
    draftId,
    model: result.model,
    source: result.source,
  });

  return NextResponse.json({
    ok: true,
    verdict: result.verdict,
    model: result.model,
    source: result.source,
    remakeEnqueued: false,
    draftId: draftId ?? null,
    markdown,
  });
}
