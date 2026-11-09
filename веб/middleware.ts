import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_SNAPSHOT } from "@/lib/analytics-mock";
import { isContentFactoryPreview, isPreviewReadAllowed, PREVIEW_READ_ONLY_MESSAGE } from "@/lib/preview";

export function middleware(request: NextRequest) {
  if (!isContentFactoryPreview()) return NextResponse.next();
  const headers = { "x-cf-preview": "read-only", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
  const pathname = request.nextUrl.pathname.replace(/\/$/, "");
  if (!["GET", "HEAD"].includes(request.method) || !isPreviewReadAllowed(pathname)) {
    return NextResponse.json({ ok: false, error: "preview_read_only", message: PREVIEW_READ_ONLY_MESSAGE }, { status: 403, headers });
  }
  // Snapshot's regular GET also computes aggregates. Use the already labelled demo
  // source here so neither that repository nor a model can run in this environment.
  if (pathname === "/api/analytics/snapshot") {
    return NextResponse.json({ ...ANALYTICS_SNAPSHOT, cycleLabel: "Тестовый просмотр", source: "mock", filledFromMock: ["kpis", "retention", "insights"], generatedAt: new Date().toISOString() }, { headers });
  }
  if (pathname === "/api/analytics/insights") {
    return NextResponse.json({ cycleLabel: "Тестовый просмотр", insights: ANALYTICS_SNAPSHOT.insights, source: "mock", generatedAt: new Date().toISOString() }, { headers });
  }
  if (/^\/api\/studio\/[A-Za-z0-9_-]+\/feed$/.test(pathname) && request.nextUrl.searchParams.get("fast") !== "1") {
    const url = request.nextUrl.clone();
    url.searchParams.set("fast", "1");
    return NextResponse.rewrite(url, { headers });
  }
  return NextResponse.next({ headers });
}

export const config = { matcher: "/api/:path*" };
