import type { InsertCandidate } from "../types";

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function domainAllowed(urlStr: string, allowlist: string[]): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (isPrivateHost(u.hostname)) return false;
    if (!allowlist.length) return true; // open web via SearXNG proxy only
    return allowlist.some(
      (d) => u.hostname === d || u.hostname.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}

/** SearXNG + Commons fallback. Never bypass auth/CAPTCHA. */
export async function searchInsertCandidates(opts: {
  query: string;
  limit: number;
  allowedDomains: string[];
}): Promise<InsertCandidate[]> {
  const out: InsertCandidate[] = [];
  const base = process.env.SEARXNG_BASE_URL?.trim();

  if (base) {
    try {
      const u = new URL("/search", base);
      u.searchParams.set("q", opts.query);
      u.searchParams.set("format", "json");
      u.searchParams.set("categories", "images");
      const res = await fetch(u.toString(), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{ url?: string; title?: string; img_src?: string }>;
        };
        for (const r of data.results ?? []) {
          const url = r.img_src || r.url;
          if (!url || !domainAllowed(url, opts.allowedDomains)) continue;
          out.push({
            candidateId: `sx_${out.length}`,
            query: opts.query,
            source: "searxng",
            url,
            score: 0.55,
            needsReview: true,
            licenseNote: "unknown_review_required",
          });
          if (out.length >= opts.limit) return out;
        }
      }
    } catch {
      /* soft fail */
    }
  }

  // Wikimedia Commons API fallback
  try {
    const api = new URL("https://commons.wikimedia.org/w/api.php");
    api.searchParams.set("action", "query");
    api.searchParams.set("format", "json");
    api.searchParams.set("generator", "search");
    api.searchParams.set("gsrsearch", opts.query);
    api.searchParams.set("gsrlimit", String(Math.min(opts.limit, 5)));
    api.searchParams.set("prop", "imageinfo");
    api.searchParams.set("iiprop", "url|extmetadata");
    const res = await fetch(api.toString(), {
      headers: { "User-Agent": "ContentFactoryReels/0.1 (local)" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        query?: {
          pages?: Record<
            string,
            { imageinfo?: Array<{ url?: string }> }
          >;
        };
      };
      for (const page of Object.values(data.query?.pages ?? {})) {
        const url = page.imageinfo?.[0]?.url;
        if (!url) continue;
        out.push({
          candidateId: `wm_${out.length}`,
          query: opts.query,
          source: "wikimedia_commons",
          url,
          score: 0.6,
          needsReview: false,
          licenseNote: "commons_check_extmetadata",
        });
        if (out.length >= opts.limit) break;
      }
    }
  } catch {
    /* soft fail */
  }

  return out.slice(0, opts.limit);
}
