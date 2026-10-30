/**
 * C-carousel-preview-black — server-side image proxy (SSRF-hardened allowlist).
 * GET ?url= encoded https URL → stream image bytes.
 * Never log secrets / Authorization / query tokens beyond host.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=120, stale-while-revalidate=60";

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  if (host === "s3.polza.ai") return true;
  if (host === "polza.ai" || host.endsWith(".polza.ai")) return true;
  return false;
}

function badRequest(message: string) {
  return NextResponse.json(
    { error: "bad_url", message },
    { status: 400 },
  );
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw || !raw.trim()) {
    return badRequest("Missing url query parameter");
  }

  let target: URL;
  try {
    target = new URL(raw.trim());
  } catch {
    return badRequest("Invalid url");
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return badRequest("Only http(s) URLs allowed");
  }

  // Block obvious SSRF tricks
  if (target.username || target.password) {
    return badRequest("Credentials in URL not allowed");
  }

  if (!isAllowedHost(target.hostname)) {
    return badRequest("Host not in allowlist");
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
      // Bounded — do not hang the route forever
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_fail", message: "Failed to fetch upstream image" },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "upstream_fail", message: `Upstream status ${upstream.status}` },
      { status: 502 },
    );
  }

  // Re-check final URL after redirects
  try {
    const finalUrl = new URL(upstream.url);
    if (!isAllowedHost(finalUrl.hostname)) {
      return badRequest("Redirect host not in allowlist");
    }
  } catch {
    return badRequest("Invalid upstream redirect URL");
  }

  const contentType =
    upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
    "application/octet-stream";

  if (
    !contentType.startsWith("image/") &&
    contentType !== "application/octet-stream"
  ) {
    return NextResponse.json(
      { error: "upstream_fail", message: "Upstream did not return an image" },
      { status: 502 },
    );
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
