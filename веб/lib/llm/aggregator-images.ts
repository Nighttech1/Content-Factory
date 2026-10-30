/**
 * C-154 / C-s54-anchor-draw — Polza / OpenAI-compatible image generation via aggregator.
 * Never log apiKey or Authorization headers.
 *
 * Path A (prefer): /images/edits or generations with reference image.
 * Path B (fallback): prompt-only /images/generations + MASTER STYLE continuity in caller.
 */

import { readFile } from "node:fs/promises";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";

/** Keep in sync with vernatun `IMAGE_GEN_MODEL` / mesh carousel default. */
export const DEFAULT_CAROUSEL_IMAGE_MODEL = "openai/gpt-5.4-image-2";

/**
 * Instagram carousel frame 4:5 = 1080×1350.
 * Prefer exact product size; fallbacks keep the same aspect (not 9:16 stories).
 */
export const DEFAULT_IMAGE_SIZE = "1080x1350";

/** Try in order when aggregator rejects a size string. */
export const CAROUSEL_IMAGE_SIZE_FALLBACKS = [
  "1080x1350",
  "1024x1280", // same 4:5
] as const;

const POLL_MS = 3000;
const POLL_MAX_MS = 120_000;

export type AggregatorImageContinuity =
  | "image_edit"
  | "image_ref_generations"
  | "prompt_only";

export type GenerateAggregatorImageInput = {
  prompt: string;
  model?: string;
  size?: string;
  /** quality for GPT Image (text/logo fidelity). */
  quality?: "low" | "medium" | "high" | "auto";
  /** Local PNG/JPEG path for single reference (backward compatible). */
  referenceImagePath?: string;
  /**
   * Multiple local refs for Mode B native logo + user photo.
   * Prefer this over single referenceImagePath when length > 0.
   */
  referenceImagePaths?: string[];
  /** Remote URL of cover (alternative to path). */
  referenceImageUrl?: string;
  /**
   * Raw base64 without data: prefix (vision style-copy / multimodal).
   * Prefer path → url → base64.
   */
  referenceImageBase64?: string;
  referenceImageMime?: "image/png" | "image/jpeg";
};

export type GenerateAggregatorImageResult = {
  url: string;
  continuity: AggregatorImageContinuity;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function extractSyncUrl(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: unknown }).data;
  if (Array.isArray(data)) {
    const url = (data[0] as { url?: unknown } | undefined)?.url;
    return typeof url === "string" && url.trim() ? url.trim() : null;
  }
  return null;
}

function extractRequestId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as { requestId?: unknown; id?: unknown };
  if (typeof o.requestId === "string" && o.requestId.trim()) {
    return o.requestId.trim();
  }
  if (typeof o.id === "string" && o.id.trim()) return o.id.trim();
  return null;
}

function extractMediaUrl(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: unknown }).data;
  if (Array.isArray(data)) {
    const url = (data[0] as { url?: unknown } | undefined)?.url;
    return typeof url === "string" && url.trim() ? url.trim() : null;
  }
  if (data && typeof data === "object") {
    const url = (data as { url?: unknown }).url;
    return typeof url === "string" && url.trim() ? url.trim() : null;
  }
  return null;
}

async function pollMediaUrl(
  baseUrl: string,
  apiKey: string,
  requestId: string,
): Promise<string | null> {
  const deadline = Date.now() + POLL_MAX_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    let st: Response;
    try {
      st = await fetch(`${baseUrl}/media/${requestId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {
      continue;
    }
    if (!st.ok) continue;

    let body: unknown;
    try {
      body = await st.json();
    } catch {
      continue;
    }

    const status =
      body && typeof body === "object"
        ? String((body as { status?: unknown }).status ?? "")
        : "";

    if (status === "completed") {
      return extractMediaUrl(body);
    }
    if (status === "failed") return null;
  }
  return null;
}

async function resolveCreateResponse(
  createRes: Response,
  baseUrl: string,
  apiKey: string,
): Promise<string | null> {
  if (!createRes.ok) return null;

  let created: unknown;
  try {
    created = await createRes.json();
  } catch {
    return null;
  }

  const syncUrl = extractSyncUrl(created);
  if (syncUrl) return syncUrl;

  const requestId = extractRequestId(created);
  if (!requestId) return null;
  return pollMediaUrl(baseUrl, apiKey, requestId);
}

async function loadPathBytes(
  p: string,
): Promise<{ bytes: Buffer; mime: string; name: string } | null> {
  try {
    const bytes = await readFile(p);
    if (bytes.length < 32) return null;
    const lower = p.toLowerCase();
    const mime =
      lower.endsWith(".jpg") || lower.endsWith(".jpeg")
        ? "image/jpeg"
        : lower.endsWith(".webp")
          ? "image/webp"
          : "image/png";
    const name = lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      ? "ref.jpg"
      : lower.endsWith(".webp")
        ? "ref.webp"
        : "ref.png";
    return { bytes, mime, name };
  } catch {
    return null;
  }
}

async function loadAllReferenceBytes(
  input: GenerateAggregatorImageInput,
): Promise<Array<{ bytes: Buffer; mime: string; name: string }>> {
  const multi = (input.referenceImagePaths ?? [])
    .map((p) => p?.trim())
    .filter(Boolean) as string[];
  if (multi.length) {
    const out: Array<{ bytes: Buffer; mime: string; name: string }> = [];
    for (let i = 0; i < multi.length; i++) {
      const loaded = await loadPathBytes(multi[i]!);
      if (loaded) {
        out.push({
          ...loaded,
          name: `ref_${i + 1}_${loaded.name}`,
        });
      }
    }
    if (out.length) return out;
  }
  const single = await loadReferenceBytes(input);
  return single ? [single] : [];
}

async function loadReferenceBytes(
  input: GenerateAggregatorImageInput,
): Promise<{ bytes: Buffer; mime: string; name: string } | null> {
  // Prefer path → url → base64 (architect-spec §5.4).
  if (input.referenceImagePath?.trim()) {
    return loadPathBytes(input.referenceImagePath.trim());
  }
  if (input.referenceImageUrl?.trim()) {
    const url = input.referenceImageUrl.trim();
    try {
      if (url.startsWith("data:")) {
        const m = /^data:([^;]+);base64,(.+)$/i.exec(url);
        if (!m) return null;
        return {
          bytes: Buffer.from(m[2]!, "base64"),
          mime: m[1] || "image/png",
          name: "ref.png",
        };
      }
      const res = await fetch(url);
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 32) return null;
      const ct = res.headers.get("content-type") || "image/png";
      const mime = ct.split(";")[0]!.trim() || "image/png";
      return {
        bytes: buf,
        mime,
        name: mime.includes("jpeg") ? "ref.jpg" : "ref.png",
      };
    } catch {
      return null;
    }
  }
  if (input.referenceImageBase64?.trim()) {
    try {
      const raw = input.referenceImageBase64.trim();
      const bytes = Buffer.from(raw, "base64");
      if (bytes.length < 32) return null;
      return {
        bytes,
        mime: input.referenceImageMime ?? "image/png",
        name: "ref.png",
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Probe whether aggregator accepts reference/edit payloads (no burn of carousel budget).
 * Uses a tiny 1×1 PNG + short prompt; may still count as 1 image API call if server accepts.
 * Prefer documenting from bakeoff first follow-up attempt instead of a separate probe burn.
 */
export async function probeAggregatorImageReferenceSupport(): Promise<{
  edits: boolean;
  generationsWithImage: boolean;
  detail: string;
}> {
  const env = resolveAggregatorEnv();
  if (!env) {
    return {
      edits: false,
      generationsWithImage: false,
      detail: "no aggregator env",
    };
  }
  // Capability probe without generating a full carousel slide:
  // OPTIONS / HEAD are often unsupported — record as "unknown until live attempt".
  return {
    edits: false,
    generationsWithImage: false,
    detail:
      "deferred_to_live_attempt — first slide-2 call tries edits then generations+image then prompt_only",
  };
}

/**
 * Generate one image URL via aggregator (prompt-only).
 * Returns null when key missing, request fails, or poll times out.
 */
export async function generateAggregatorImage(
  input: GenerateAggregatorImageInput,
): Promise<string | null> {
  const rich = await generateAggregatorImageWithOptionalRef(input);
  return rich?.url ?? null;
}

/**
 * Cover-anchored generate: try /images/edits → generations with image field → prompt-only.
 */
export async function generateAggregatorImageWithOptionalRef(
  input: GenerateAggregatorImageInput,
): Promise<GenerateAggregatorImageResult | null> {
  const env = resolveAggregatorEnv();
  if (!env) return null;

  const prompt = input.prompt?.trim();
  if (!prompt) return null;

  const model =
    input.model?.trim() ||
    process.env.CAROUSEL_IMAGE_MODEL?.trim() ||
    DEFAULT_CAROUSEL_IMAGE_MODEL;
  const sizeCandidates = resolveCarouselSizeCandidates(input.size);

  const hasRef =
    Boolean(input.referenceImagePaths?.length) ||
    Boolean(input.referenceImagePath?.trim()) ||
    Boolean(input.referenceImageUrl?.trim()) ||
    Boolean(input.referenceImageBase64?.trim());
  const quality = input.quality?.trim() || undefined;

  if (hasRef) {
    const refs = await loadAllReferenceBytes(input);
    if (refs.length) {
      // Path A1 — multipart /images/edits (try each 4:5 size)
      for (const size of sizeCandidates) {
        try {
          const form = new FormData();
          for (const ref of refs) {
            form.append(
              "image",
              new Blob([new Uint8Array(ref.bytes)], { type: ref.mime }),
              ref.name,
            );
          }
          form.append("prompt", prompt);
          form.append("model", model);
          form.append("n", "1");
          form.append("size", size);
          // Some aggregators also honor aspect_ratio for portrait carousel
          form.append("aspect_ratio", "4:5");
          if (quality) form.append("quality", quality);
          const editRes = await fetch(`${env.baseUrl}/images/edits`, {
            method: "POST",
            headers: { Authorization: `Bearer ${env.apiKey}` },
            body: form,
          });
          const url = await resolveCreateResponse(
            editRes,
            env.baseUrl,
            env.apiKey,
          );
          if (url) {
            return { url, continuity: "image_edit" };
          }
        } catch {
          /* next size */
        }
      }

      // Path A2 — JSON /images/generations with image / image_url (first ref primary)
      const primary = refs[0]!;
      const dataUrl = `data:${primary.mime};base64,${primary.bytes.toString("base64")}`;
      const imagesArr = refs.map((r) => ({
        image_url: {
          url: `data:${r.mime};base64,${r.bytes.toString("base64")}`,
        },
      }));
      for (const size of sizeCandidates) {
        const payloads: Array<Record<string, unknown>> = [
          {
            model,
            prompt,
            n: 1,
            size,
            aspect_ratio: "4:5",
            ...(quality ? { quality } : {}),
            images: imagesArr,
          },
          {
            model,
            prompt,
            n: 1,
            size,
            aspect_ratio: "4:5",
            ...(quality ? { quality } : {}),
            image: dataUrl,
          },
          {
            model,
            prompt,
            n: 1,
            size,
            aspect_ratio: "4:5",
            ...(quality ? { quality } : {}),
            image_url: dataUrl,
          },
        ];
        if (input.referenceImageUrl?.trim()?.startsWith("http")) {
          payloads.unshift({
            model,
            prompt,
            n: 1,
            size,
            aspect_ratio: "4:5",
            ...(quality ? { quality } : {}),
            image_url: input.referenceImageUrl.trim(),
          });
        }
        for (const body of payloads) {
          try {
            const createRes = await fetch(`${env.baseUrl}/images/generations`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${env.apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
            const url = await resolveCreateResponse(
              createRes,
              env.baseUrl,
              env.apiKey,
            );
            if (url) {
              return { url, continuity: "image_ref_generations" };
            }
          } catch {
            /* next payload */
          }
        }
      }
    }
  }

  // Path B — prompt-only generations (try each 4:5 size)
  for (const size of sizeCandidates) {
    try {
      const createRes = await fetch(`${env.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size,
          aspect_ratio: "4:5",
          ...(quality ? { quality } : {}),
        }),
      });
      const url = await resolveCreateResponse(
        createRes,
        env.baseUrl,
        env.apiKey,
      );
      if (url) return { url, continuity: "prompt_only" };
    } catch {
      /* next size */
    }
  }
  return null;
}

function resolveCarouselSizeCandidates(preferred?: string): string[] {
  const p = preferred?.trim() || DEFAULT_IMAGE_SIZE;
  const out: string[] = [p];
  for (const s of CAROUSEL_IMAGE_SIZE_FALLBACKS) {
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/** Alias used by Architect spec naming. */
export async function generateAggregatorImageEdit(
  input: GenerateAggregatorImageInput & {
    referenceImagePath: string;
  },
): Promise<GenerateAggregatorImageResult | null> {
  return generateAggregatorImageWithOptionalRef(input);
}
