/**
 * POST/GET /api/modules/register — Plugin Slot (C-21).
 * Persists custom modules to data/local/custom-modules.json and registers
 * RemoteContentModule stubs on the server registry.
 */

import { NextResponse } from "next/server";

import {
  createRemoteContentModule,
  recordFromManifest,
  toSerializableManifest,
  RemoteModuleValidationError,
  isValidWorkerEndpoint,
} from "@/modules/custom-remote/factory";
import {
  OUTPUT_FORMATS,
  upsertCustomModuleRecord,
} from "@/modules/custom-remote/persist";
import {
  ensureCustomModulesHydrated,
  listCustomManifests,
  registerModule,
} from "@/modules/registry";
import type { ModuleOutputFormat } from "@/types/module";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOutputFormat(v: unknown): v is ModuleOutputFormat {
  return (
    typeof v === "string" &&
    (OUTPUT_FORMATS as readonly string[]).includes(v)
  );
}

/**
 * GET /api/modules/register — list custom manifests for FE hydrate
 * (no node:fs on client; FE may also mirror to localStorage).
 */
export async function GET(): Promise<Response> {
  // Always re-read disk so pruned custom-* disappear without process restart.
  await ensureCustomModulesHydrated({ force: true });
  const manifests = listCustomManifests().map(toSerializableManifest);
  return NextResponse.json({
    ok: true,
    manifests,
    count: manifests.length,
  });
}

/**
 * POST /api/modules/register
 * Body: { title, outputFormat, workerEndpoint }
 * → { ok: true, manifest }
 */
export async function POST(req: Request): Promise<Response> {
  await ensureCustomModulesHydrated();

  let body: {
    title?: unknown;
    outputFormat?: unknown;
    workerEndpoint?: unknown;
    id?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "title_required" },
      { status: 400 },
    );
  }

  if (!isOutputFormat(body.outputFormat)) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_output_format",
        allowed: [...OUTPUT_FORMATS],
      },
      { status: 400 },
    );
  }

  const workerEndpoint =
    typeof body.workerEndpoint === "string" ? body.workerEndpoint.trim() : "";
  if (!isValidWorkerEndpoint(workerEndpoint)) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_endpoint",
        hint: "Use http(s)://… or relative /api/…",
      },
      { status: 400 },
    );
  }

  const idOverride =
    typeof body.id === "string" && body.id.trim() ? body.id.trim() : undefined;

  try {
    const mod = createRemoteContentModule({
      title,
      outputFormat: body.outputFormat,
      workerEndpoint,
      id: idOverride,
    });

    await upsertCustomModuleRecord(recordFromManifest(mod.manifest));
    registerModule(mod);

    return NextResponse.json({
      ok: true,
      manifest: toSerializableManifest(mod.manifest),
    });
  } catch (err) {
    if (err instanceof RemoteModuleValidationError) {
      return NextResponse.json(
        { ok: false, error: err.code, message: err.message },
        { status: 400 },
      );
    }
    const message = err instanceof Error ? err.message : "register_failed";
    // eslint-disable-next-line no-console
    console.error("[api/modules/register]", message);
    return NextResponse.json(
      { ok: false, error: "register_failed" },
      { status: 500 },
    );
  }
}
