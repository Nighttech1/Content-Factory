import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/settings/design-md — raw docs/DESIGN.md for Settings editor (C-70). */
export async function GET(): Promise<Response> {
  try {
    const filePath = path.join(process.cwd(), "docs", "DESIGN.md");
    const markdown = await readFile(filePath, "utf8");
    return NextResponse.json({ markdown, path: "docs/DESIGN.md" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "design_md_failed";
    // eslint-disable-next-line no-console -- operational
    console.error("[api/settings/design-md]", message);
    return NextResponse.json(
      { markdown: "", path: "docs/DESIGN.md", error: message },
      { status: 200 },
    );
  }
}
