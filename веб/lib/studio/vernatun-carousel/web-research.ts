/**
 * Lightweight web research for FACT_CHECK branch.
 * No paid SERP key: DuckDuckGo HTML + page fetch. Never invent URLs.
 */

export type WebSearchHit = {
  title: string;
  url: string;
  snippet: string;
};

const UA =
  "ContentFactoryVernatun/1.0 (fact-check research; educational carousel)";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHref(raw: string): string {
  try {
    const u = new URL(raw, "https://duckduckgo.com");
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    if (/^https?:\/\//i.test(raw)) return raw;
  } catch {
    /* */
  }
  return raw;
}

/** DuckDuckGo HTML results — best-effort, may return []. */
export async function searchDuckDuckGoHtml(
  query: string,
  limit = 5,
): Promise<WebSearchHit[]> {
  const url = new URL("https://html.duckduckgo.com/html/");
  url.searchParams.set("q", query);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": UA,
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`ddg_http_${res.status}`);
    const html = await res.text();
    const hits: WebSearchHit[] = [];
    const re =
      /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && hits.length < limit) {
      const href = decodeHref(m[1] ?? "");
      if (!/^https?:\/\//i.test(href)) continue;
      if (/duckduckgo\.com/i.test(href)) continue;
      hits.push({
        title: stripHtml(m[2] ?? "").slice(0, 160),
        url: href,
        snippet: stripHtml(m[3] ?? "").slice(0, 400),
      });
    }
    // Fallback simpler link scrape
    if (!hits.length) {
      const re2 = /uddg=([^&"]+)/gi;
      const seen = new Set<string>();
      while ((m = re2.exec(html)) && hits.length < limit) {
        try {
          const href = decodeURIComponent(m[1]!);
          if (!/^https?:\/\//i.test(href) || seen.has(href)) continue;
          seen.add(href);
          hits.push({ title: href, url: href, snippet: "" });
        } catch {
          /* */
        }
      }
    }
    return hits;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPageExcerpt(
  pageUrl: string,
  maxChars = 3500,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(pageUrl, {
      headers: { Accept: "text/html,*/*", "User-Agent": UA },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return { ok: false, error: `http_${res.status}` };
    const ct = res.headers.get("content-type") ?? "";
    if (/pdf|octet-stream|image\//i.test(ct)) {
      return { ok: false, error: "unsupported_content_type" };
    }
    const html = await res.text();
    const text = stripHtml(html).slice(0, maxChars);
    if (text.length < 40) return { ok: false, error: "empty_body" };
    return { ok: true, text };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "fetch_failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export type ResearchSourcePack = {
  query: string;
  hits: Array<WebSearchHit & { excerpt?: string; fetch_error?: string }>;
  available: boolean;
  error?: string;
};

/** Wikipedia opensearch → page extract (no key). */
export async function searchWikipedia(
  query: string,
  limit = 3,
): Promise<WebSearchHit[]> {
  const url = new URL("https://ru.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json", "User-Agent": UA },
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown[];
    const titles = (data[1] as string[]) ?? [];
    const descs = (data[2] as string[]) ?? [];
    const links = (data[3] as string[]) ?? [];
    const hits: WebSearchHit[] = [];
    for (let i = 0; i < links.length; i++) {
      hits.push({
        title: titles[i] ?? links[i]!,
        url: links[i]!,
        snippet: descs[i] ?? "",
      });
    }
    return hits;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Search + open top pages. If search fails → available=false (do not fake). */
export async function gatherResearchSources(
  questions: string[],
  opts?: { perQuery?: number; openTop?: number },
): Promise<ResearchSourcePack[]> {
  const perQuery = opts?.perQuery ?? 4;
  const openTop = opts?.openTop ?? 2;
  const packs: ResearchSourcePack[] = [];
  for (const q of questions.slice(0, 6)) {
    try {
      let hits = await searchDuckDuckGoHtml(q, perQuery);
      if (!hits.length) {
        hits = await searchWikipedia(q, Math.min(3, perQuery));
      }
      if (!hits.length) {
        packs.push({
          query: q,
          hits: [],
          available: false,
          error: "no_hits",
        });
        continue;
      }
      const enriched = [];
      for (const h of hits.slice(0, openTop)) {
        const page = await fetchPageExcerpt(h.url);
        enriched.push({
          ...h,
          excerpt: page.ok ? page.text : undefined,
          fetch_error: page.ok ? undefined : page.error,
        });
      }
      // keep remaining hits without body
      for (const h of hits.slice(openTop))
        enriched.push({ ...h, excerpt: undefined, fetch_error: undefined });
      const usable = enriched.some((h) => Boolean(h.excerpt || h.snippet));
      packs.push({
        query: q,
        hits: enriched,
        available: usable,
        error: usable ? undefined : "no_excerpts",
      });
    } catch (e) {
      packs.push({
        query: q,
        hits: [],
        available: false,
        error: e instanceof Error ? e.message : "search_failed",
      });
    }
  }
  return packs;
}

export function researchIsUsable(packs: ResearchSourcePack[]): boolean {
  return packs.some(
    (p) => p.available && p.hits.some((h) => Boolean(h.excerpt || h.snippet)),
  );
}
