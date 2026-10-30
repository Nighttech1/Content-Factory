import { NextResponse } from "next/server";

import { loadBrandKit } from "@/lib/brand/loadBrandKit";
import {
  designMarkdownFromRequestHeaders,
  resolveActiveDesignMarkdown,
} from "@/lib/settings/design-active-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/brand-kit
 * JSON BrandKit for UI + agents. No env secrets.
 * Active DESIGN.md: header / cookie / synced file → else docs/DESIGN.md.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const { headerMarkdown, cookieMarkdown } =
      designMarkdownFromRequestHeaders(req);
    const override = await resolveActiveDesignMarkdown({
      headerMarkdown,
      cookieMarkdown,
    });
    const kit = loadBrandKit({ designMarkdownOverride: override });
    return NextResponse.json(kit);
  } catch (err) {
    const message = err instanceof Error ? err.message : "brand_kit_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/brand-kit]", message);
    return NextResponse.json(
      {
        logoUrl: "/brand/vernatun-logo.svg",
        name: "Vernatun",
        palette: {},
        designMarkdown: "",
        voice: [],
        error: "brand_kit_failed",
      },
      { status: 200 },
    );
  }
}
