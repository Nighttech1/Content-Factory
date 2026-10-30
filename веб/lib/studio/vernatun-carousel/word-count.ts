/**
 * Cover headline ≤4 words — programmatic (TZ §4.1 / §6).
 */

export function stripHtmlAndPunctuation(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(raw: string): number {
  const cleaned = stripHtmlAndPunctuation(raw);
  if (!cleaned) return 0;
  return cleaned.split(" ").filter(Boolean).length;
}

export function isCoverHeadlineValid(headline: string): boolean {
  return countWords(headline) <= 4 && countWords(headline) >= 1;
}

export function assertCoverHeadline(headline: string): {
  ok: boolean;
  words: number;
  message?: string;
} {
  const words = countWords(headline);
  if (words < 1) {
    return { ok: false, words, message: "cover_headline_empty" };
  }
  if (words > 4) {
    return {
      ok: false,
      words,
      message: `cover_headline_too_long:${words}`,
    };
  }
  return { ok: true, words };
}
