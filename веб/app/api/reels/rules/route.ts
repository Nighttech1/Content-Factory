import { NextResponse } from "next/server";
import {
  confirmRule,
  findConflicts,
  rejectRule,
} from "@/lib/studio/reels-framework/memory/style-memory";
import { listRules, upsertRule } from "@/lib/studio/reels-framework/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, rules: listRules() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    action?: "confirm" | "reject";
    ruleId?: string;
  };
  if (!body.ruleId || !body.action) {
    return NextResponse.json({ ok: false, error: "ruleId_and_action_required" }, { status: 400 });
  }
  if (body.action === "confirm") {
    const rule = confirmRule(body.ruleId);
    if (!rule) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const conflicts = findConflicts(rule);
    if (conflicts.length) {
      // keep both — surface conflicts, do not auto-delete
      upsertRule(rule);
      return NextResponse.json({
        ok: true,
        rule,
        conflicts,
        note: "conflicts_require_manual_resolution",
      });
    }
    return NextResponse.json({ ok: true, rule });
  }
  const rule = rejectRule(body.ruleId);
  if (!rule) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, rule });
}
