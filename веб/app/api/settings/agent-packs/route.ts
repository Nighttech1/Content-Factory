import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  AGENT_PACK_CATALOG,
  CONTENT_TYPE_OPTIONS,
  packScopedKey,
  type ContentTypeId,
} from "@/lib/settings/agent-pack-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readOptional(rel: string | undefined): Promise<string> {
  if (!rel) return "";
  try {
    return await readFile(path.join(process.cwd(), rel), "utf8");
  } catch {
    return "";
  }
}

/**
 * GET /api/settings/agent-packs — prompt/rules sources for Settings + Mesh (C-70/C-71/C-75).
 * Returns base packs + scoped variants `agentId::contentType` with different seed prompts.
 */
export async function GET(): Promise<Response> {
  const packs = await Promise.all(
    AGENT_PACK_CATALOG.map(async (meta) => {
      const agentMd = await readOptional(meta.agentMd);
      const skillMd = await readOptional(meta.skillMd);
      const promptMd = await readOptional(meta.promptMd);
      const basePrompt = [promptMd, agentMd].filter(Boolean).join("\n\n---\n\n");
      const base = {
        id: meta.id,
        label: meta.label,
        contentType: "default" as ContentTypeId,
        paths: {
          agentMd: meta.agentMd ?? null,
          skillMd: meta.skillMd ?? null,
          promptMd: meta.promptMd ?? null,
        },
        prompt: basePrompt,
        rules: skillMd,
      };

      const scoped = CONTENT_TYPE_OPTIONS.filter((c) => c.id !== "default")
        .map((c) => {
          const hint = meta.contentTypeDefaults?.[c.id]?.promptHint;
          if (!hint) return null;
          return {
            id: packScopedKey(meta.id, c.id),
            label: `${meta.label} · ${c.label}`,
            contentType: c.id,
            agentId: meta.id,
            paths: base.paths,
            prompt: [hint, basePrompt].filter(Boolean).join("\n\n---\n\n"),
            rules: skillMd,
          };
        })
        .filter(Boolean);

      return [base, ...scoped];
    }),
  );

  return NextResponse.json({
    packs: packs.flat(),
    contentTypes: CONTENT_TYPE_OPTIONS,
  });
}
