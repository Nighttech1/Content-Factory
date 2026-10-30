import { NextResponse } from "next/server";

import {
  getEventsAfter,
  getJob,
  subscribeJob,
  type StoredJobEvent,
} from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

function parseLastEventId(req: Request): number {
  const header = req.headers.get("last-event-id");
  const url = new URL(req.url);
  const query =
    url.searchParams.get("lastEventId") ??
    url.searchParams.get("last-event-id");
  const raw = header ?? query ?? "0";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatSseFrame(event: StoredJobEvent): string {
  const data = JSON.stringify({
    status: event.status,
    agent: event.agent,
    message: event.message,
    progress: event.progress,
  });
  return `id: ${event.id}\ndata: ${data}\n\n`;
}

/**
 * GET /api/jobs/[id]/stream
 * text/event-stream with monotonic id + Last-Event-ID replay.
 * Unknown job → 404 JSON before opening the stream (Architect preference).
 */
export async function GET(
  req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { id: jobId } = await ctx.params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { ok: false, error: "job_not_found" },
      { status: 404 },
    );
  }

  const afterId = parseLastEventId(req);
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let closed = false;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeClose = () => {
        if (closed) return;
        closed = true;
        unsubscribe?.();
        unsubscribe = null;
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed by cancel/client disconnect.
        }
      };

      const enqueue = (event: StoredJobEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(formatSseFrame(event)));
        } catch {
          safeClose();
          return;
        }
        if (event.status === "completed" || event.status === "failed") {
          // Tiny defer so the last frame flushes before close.
          closeTimer = setTimeout(safeClose, 10);
        }
      };

      // Replay history after Last-Event-ID.
      for (const ev of getEventsAfter(job, afterId)) {
        enqueue(ev);
        if (closed) return;
      }

      if (job.completed) {
        safeClose();
        return;
      }

      unsubscribe = subscribeJob(jobId, (ev) => {
        if (ev.id <= afterId) return;
        enqueue(ev);
      });

      // Race: completed between replay and subscribe.
      if (job.completed) {
        const remaining = getEventsAfter(job, afterId);
        for (const ev of remaining) {
          enqueue(ev);
          if (closed) return;
        }
        if (!closed) safeClose();
      }
    },
    cancel() {
      closed = true;
      unsubscribe?.();
      unsubscribe = null;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
