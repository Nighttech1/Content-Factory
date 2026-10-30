import { NextResponse } from "next/server";
import {
  createReel,
  findReelBySheetKey,
  listReels,
} from "@/lib/studio/reels-framework/manager";
import { getGlobalSettings, setGlobalSettings } from "@/lib/studio/reels-framework/store";
import { STYLE_PROFILES } from "@/lib/studio/reels-framework/memory/style-profiles";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    reels: listReels(),
    settings: getGlobalSettings(),
    styleProfiles: STYLE_PROFILES,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      sheetRowKey?: string;
      styleProfileId?: string;
      generateScript?: boolean;
    };
    const topic = (body.topic || "").trim();
    if (!topic) {
      return NextResponse.json({ ok: false, error: "topic_required" }, { status: 400 });
    }
    if (body.sheetRowKey) {
      const existing = findReelBySheetKey(body.sheetRowKey);
      if (existing) {
        return NextResponse.json({ ok: true, reel: existing, deduped: true });
      }
    }
    let reel = createReel({
      topic,
      sheetRowKey: body.sheetRowKey,
      styleProfileId: body.styleProfileId,
    });
    if (body.generateScript !== false) {
      const { generateScriptAndStoryboard } = await import(
        "@/lib/studio/reels-framework/agents/script-storyboard"
      );
      const s = generateScriptAndStoryboard(reel.id);
      if (s.ok) reel = s.reel;
    }
    return NextResponse.json({ ok: true, reel });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "create_failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as { settings?: Record<string, unknown> };
    if (!body.settings) {
      return NextResponse.json({ ok: false, error: "settings_required" }, { status: 400 });
    }
    const settings = setGlobalSettings(body.settings);
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "patch_failed" },
      { status: 500 },
    );
  }
}
