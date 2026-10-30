/**
 * C-154 — Proxy GET {aggregator}/models with Bearer.
 * Soft-fail 200 empty list when no key / upstream error.
 * Never log API key.
 */

import { NextResponse } from "next/server";

import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import { classifyAggregatorModelKind } from "@/types/mesh-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpstreamModel = {
  id?: string;
  name?: string;
  owned_by?: string;
};

function labelFor(id: string, name?: string): string {
  if (name?.trim()) return name.trim();
  const short = id.includes("/") ? id.split("/").pop()! : id;
  return short.replace(/[-_]/g, " ");
}

export async function GET(): Promise<Response> {
  const env = resolveAggregatorEnv();
  if (!env) {
    return NextResponse.json({ ok: true, models: [] });
  }

  try {
    const res = await fetch(`${env.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${env.apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ ok: true, models: [] });
    }

    const json = (await res.json()) as {
      data?: UpstreamModel[];
      models?: UpstreamModel[];
    };
    const raw = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.models)
        ? json.models
        : [];

    const models = raw
      .map((m) => {
        const id = typeof m.id === "string" ? m.id.trim() : "";
        if (!id) return null;
        return {
          id,
          label: labelFor(id, m.name),
          kind: classifyAggregatorModelKind(id),
        };
      })
      .filter((m): m is NonNullable<typeof m> => m != null);

    return NextResponse.json({ ok: true, models });
  } catch {
    return NextResponse.json({ ok: true, models: [] });
  }
}
