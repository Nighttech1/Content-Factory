import { NextResponse } from "next/server";
import { reelsDiscoveryStatus } from "@/lib/studio/reels-scheduler";
export const runtime="nodejs";
export const dynamic="force-dynamic";
/** Read-only health: viewing the page never starts a paid run. */
export function GET() { return NextResponse.json(reelsDiscoveryStatus(),{headers:{"Cache-Control":"no-store"}}); }
