/**
 * Remote / plugin ContentModule factory (C-21).
 * Proxies generateDraft / renderAsset / regenerateElement to a worker HTTP endpoint.
 * On timeout or failure → mock payload with `{ mock: true }` — never throws to crash API.
 * No remote code eval — JSON HTTP only.
 */

import { z } from "zod";

import type {
  AssetRenderResult,
  ContentModuleManifest,
  DraftOutput,
  ElementOutput,
  IContentModule,
  ModuleOutputFormat,
} from "@/types/module";
import { isCanonicalModuleId } from "@/modules/id-map";

/** Default worker fetch timeout (ms). */
export const REMOTE_WORKER_TIMEOUT_MS = 8_000;

const CORE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
] as const;

export type CreateRemoteContentModuleInput = {
  title: string;
  outputFormat: ModuleOutputFormat;
  workerEndpoint: string;
  /** Override id; default `custom-{slug}` from title. */
  id?: string;
  /** Tile copy; empty/missing → RU fallback without worker URL. */
  description?: string;
  icon?: string;
};

/** RU fallback when JSON/API omit description (C-48 / C-56). Never include worker URL. */
export const CUSTOM_MODULE_DESCRIPTION_FALLBACK = "Пользовательский модуль";

export type RemoteModuleRecord = {
  id: string;
  title: string;
  description: string;
  version: string;
  outputFormat: ModuleOutputFormat;
  icon: string;
  workerEndpoint: string;
};

/** Client/API-safe manifest (no Zod). */
export type SerializableModuleManifest = Omit<
  ContentModuleManifest,
  "inputSchema"
> & {
  defaultSettings: { workerEndpoint: string };
};

export class RemoteModuleValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "RemoteModuleValidationError";
    this.code = code;
  }
}

/** Slug for `custom-{slug}` — ASCII-ish, stable, non-empty. */
export function slugFromTitle(title: string): string {
  const raw = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return raw || "module";
}

export function buildCustomModuleId(title: string, id?: string): string {
  if (id?.trim()) {
    const trimmed = id.trim();
    if (isCanonicalModuleId(trimmed) || (CORE_IDS as readonly string[]).includes(trimmed)) {
      throw new RemoteModuleValidationError(
        "reserved_id",
        `Id "${trimmed}" is reserved for a core module`,
      );
    }
    if (!trimmed.startsWith("custom-")) {
      throw new RemoteModuleValidationError(
        "invalid_id",
        'Custom module id must start with "custom-"',
      );
    }
    return trimmed;
  }
  return `custom-${slugFromTitle(title)}`;
}

export function isValidWorkerEndpoint(endpoint: string): boolean {
  const e = endpoint.trim();
  if (!e) return false;
  if (e.startsWith("/api/")) return true;
  try {
    const u = new URL(e);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveWorkerUrl(
  endpoint: string,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
): string {
  const e = endpoint.trim();
  if (e.startsWith("/")) {
    return `${baseUrl.replace(/\/$/, "")}${e}`;
  }
  return e;
}

function mockDraft(
  moduleId: string,
  topic: string,
  reason: string,
): DraftOutput {
  return {
    draftId: `${moduleId}-mock-${Date.now()}`,
    moduleId,
    topic,
    elements: [
      {
        index: 0,
        kind: "remote_mock",
        payload: { mock: true, reason, topic },
      },
    ],
    meta: { mock: true, reason, phase: "C-21" },
  };
}

function mockAssets(draftId: string, reason: string): AssetRenderResult {
  return {
    draftId,
    assets: [
      {
        url: `data:text/plain,mock-remote-${encodeURIComponent(draftId)}`,
        mime: "text/plain",
        width: 1080,
        height: 1350,
      },
    ],
    mock: true,
    feedbackLogs: [`remote_worker=${reason}`],
  };
}

function mockElement(
  draftId: string,
  elementIndex: number,
  reason: string,
): ElementOutput {
  return {
    draftId,
    elementIndex,
    payload: { mock: true, reason, elementIndex },
    asset: {
      url: `data:text/plain,mock-el-${elementIndex}`,
      mime: "text/plain",
    },
  };
}

type WorkerAction =
  | { action: "generateDraft"; topic: string; options?: Record<string, unknown> }
  | { action: "renderAsset"; draft: DraftOutput }
  | {
      action: "regenerateElement";
      draftId: string;
      elementIndex: number;
    };

async function postWorker<T>(
  workerEndpoint: string,
  body: WorkerAction,
  timeoutMs = REMOTE_WORKER_TIMEOUT_MS,
): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  const url = resolveWorkerUrl(workerEndpoint);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: `http_${res.status}` };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message.slice(0, 120)
        : "fetch_failed";
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

export function toSerializableManifest(
  manifest: ContentModuleManifest,
): SerializableModuleManifest {
  const workerEndpoint =
    typeof manifest.defaultSettings.workerEndpoint === "string"
      ? manifest.defaultSettings.workerEndpoint
      : "";
  return {
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    version: manifest.version,
    outputFormat: manifest.outputFormat,
    icon: manifest.icon,
    defaultSettings: { workerEndpoint },
  };
}

export function recordFromManifest(
  manifest: ContentModuleManifest,
): RemoteModuleRecord {
  const workerEndpoint =
    typeof manifest.defaultSettings.workerEndpoint === "string"
      ? manifest.defaultSettings.workerEndpoint
      : "";
  return {
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    version: manifest.version,
    outputFormat: manifest.outputFormat,
    icon: manifest.icon,
    workerEndpoint,
  };
}

export function createRemoteContentModule(
  input: CreateRemoteContentModuleInput,
): IContentModule {
  const title = input.title.trim();
  if (!title) {
    throw new RemoteModuleValidationError("title_required", "Title is required");
  }
  if (!isValidWorkerEndpoint(input.workerEndpoint)) {
    throw new RemoteModuleValidationError(
      "invalid_endpoint",
      "Worker endpoint must be http(s) URL or relative /api/...",
    );
  }

  const id = buildCustomModuleId(title, input.id);
  const workerEndpoint = input.workerEndpoint.trim();
  const description =
    input.description?.trim() || CUSTOM_MODULE_DESCRIPTION_FALLBACK;
  const icon = input.icon?.trim() || "Puzzle";

  const manifest: ContentModuleManifest = {
    id,
    title,
    description,
    version: "0.1.0",
    outputFormat: input.outputFormat,
    icon,
    defaultSettings: { workerEndpoint },
    inputSchema: z.object({ topic: z.string() }),
  };

  return {
    manifest,
    async generateDraft(
      topic: string,
      options?: Record<string, unknown>,
    ): Promise<DraftOutput> {
      const result = await postWorker<DraftOutput>(workerEndpoint, {
        action: "generateDraft",
        topic,
        options,
      });
      if (!result.ok) {
        return mockDraft(id, topic, result.reason);
      }
      const data = result.data;
      if (
        data &&
        typeof data === "object" &&
        typeof (data as DraftOutput).draftId === "string"
      ) {
        return {
          ...data,
          moduleId: id,
          meta: { ...((data as DraftOutput).meta ?? {}), remote: true },
        };
      }
      return mockDraft(id, topic, "invalid_worker_payload");
    },

    async renderAsset(draft: DraftOutput): Promise<AssetRenderResult> {
      const result = await postWorker<AssetRenderResult>(workerEndpoint, {
        action: "renderAsset",
        draft,
      });
      if (!result.ok) {
        return mockAssets(draft.draftId, result.reason);
      }
      const data = result.data;
      if (data && typeof data === "object" && Array.isArray(data.assets)) {
        return data;
      }
      return mockAssets(draft.draftId, "invalid_worker_payload");
    },

    async regenerateElement(
      draftId: string,
      elementIndex: number,
    ): Promise<ElementOutput> {
      const result = await postWorker<ElementOutput>(workerEndpoint, {
        action: "regenerateElement",
        draftId,
        elementIndex,
      });
      if (!result.ok) {
        return mockElement(draftId, elementIndex, result.reason);
      }
      const data = result.data;
      if (
        data &&
        typeof data === "object" &&
        typeof data.draftId === "string"
      ) {
        return data;
      }
      return mockElement(draftId, elementIndex, "invalid_worker_payload");
    },
  };
}

export function createRemoteFromRecord(record: RemoteModuleRecord): IContentModule {
  return createRemoteContentModule({
    title: record.title,
    outputFormat: record.outputFormat,
    workerEndpoint: record.workerEndpoint,
    id: record.id,
    description: record.description,
    icon: record.icon,
  });
}
