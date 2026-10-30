"use client";

import { useEffect, useState } from "react";

import type { JobStreamAgent, JobStreamEvent, JobStreamStatus } from "@/lib/jobs/types";

export type JobStreamSnapshot = {
  status: JobStreamStatus | null;
  agent: JobStreamAgent | null;
  message: string | null;
  progress: number;
  connected: boolean;
  error: string | null;
};

const IDLE_SNAPSHOT: JobStreamSnapshot = {
  status: null,
  agent: null,
  message: null,
  progress: 0,
  connected: false,
  error: null,
};

export type OpenJobStreamHandlers = {
  onEvent: (event: JobStreamEvent, eventId: number) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
};

function streamUrl(jobId: string, lastEventId: number): string {
  const base = `/api/jobs/${encodeURIComponent(jobId)}/stream`;
  if (lastEventId > 0) {
    return `${base}?lastEventId=${lastEventId}`;
  }
  return base;
}

function parseEventPayload(raw: string): JobStreamEvent | null {
  try {
    const data = JSON.parse(raw) as Partial<JobStreamEvent>;
    if (
      typeof data.status !== "string" ||
      typeof data.agent !== "string" ||
      typeof data.message !== "string" ||
      typeof data.progress !== "number"
    ) {
      return null;
    }
    return {
      status: data.status as JobStreamStatus,
      agent: data.agent as JobStreamAgent,
      message: data.message,
      progress: Math.max(0, Math.min(100, Math.round(data.progress))),
    };
  } catch {
    return null;
  }
}

/**
 * Imperative EventSource client (store-safe).
 * Reconnects with `?lastEventId=` when possible; cleanup closes the socket.
 */
export function openJobStream(
  jobId: string,
  handlers: OpenJobStreamHandlers,
): () => void {
  let lastEventId = 0;
  let es: EventSource | null = null;
  let disposed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let sawTerminal = false;
  let reconnectAttempts = 0;

  const clearReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const closeEs = () => {
    if (es) {
      es.onopen = null;
      es.onmessage = null;
      es.onerror = null;
      es.close();
      es = null;
    }
  };

  const connect = () => {
    if (disposed || sawTerminal) return;
    closeEs();

    const source = new EventSource(streamUrl(jobId, lastEventId));
    es = source;

    source.onopen = () => {
      reconnectAttempts = 0;
      handlers.onConnectionChange?.(true);
    };

    source.onmessage = (msg) => {
      if (disposed) return;

      const parsedId = Number.parseInt(msg.lastEventId || "", 10);
      if (Number.isFinite(parsedId) && parsedId > lastEventId) {
        lastEventId = parsedId;
      }

      const event = parseEventPayload(msg.data);
      if (!event) return;

      handlers.onEvent(event, lastEventId);

      if (event.status === "completed" || event.status === "failed") {
        sawTerminal = true;
        clearReconnect();
        handlers.onConnectionChange?.(false);
        closeEs();
      }
    };

    source.onerror = () => {
      if (disposed || sawTerminal) return;
      handlers.onConnectionChange?.(false);

      // Permanent close (e.g. 404) → readyState CLOSED; retry with Last-Event-ID query.
      if (source.readyState === EventSource.CLOSED) {
        closeEs();
        reconnectAttempts += 1;
        if (reconnectAttempts > 5) {
          handlers.onError?.("stream_unavailable");
          return;
        }
        const delay = Math.min(1000 * reconnectAttempts, 4000);
        clearReconnect();
        reconnectTimer = setTimeout(connect, delay);
      }
      // CONNECTING: browser may auto-reconnect with Last-Event-ID header — leave it.
    };
  };

  connect();

  return () => {
    disposed = true;
    clearReconnect();
    handlers.onConnectionChange?.(false);
    closeEs();
  };
}

/**
 * React hook: live job SSE → `{ status, agent, message, progress, connected, error }`.
 * `jobId == null` → no connection.
 */
export function useJobStream(jobId: string | null): JobStreamSnapshot {
  const [snapshot, setSnapshot] = useState<JobStreamSnapshot>(IDLE_SNAPSHOT);

  useEffect(() => {
    if (!jobId) {
      setSnapshot(IDLE_SNAPSHOT);
      return;
    }

    setSnapshot({
      ...IDLE_SNAPSHOT,
      error: null,
    });

    const close = openJobStream(jobId, {
      onEvent: (event) => {
        setSnapshot((prev) => ({
          ...prev,
          status: event.status,
          agent: event.agent,
          message: event.message,
          progress: event.progress,
          error: event.status === "failed" ? event.message : prev.error,
        }));
      },
      onConnectionChange: (connected) => {
        setSnapshot((prev) => ({ ...prev, connected }));
      },
      onError: (error) => {
        setSnapshot((prev) => ({
          ...prev,
          connected: false,
          error,
        }));
      },
    });

    return () => {
      close();
    };
  }, [jobId]);

  return snapshot;
}
