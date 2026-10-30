/**
 * S48/S49 — RU compact followers for feed plaque (e.g. «1564к», «12,3к»).
 */

export function formatFollowersRu(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.round(n));
  const thousands = n / 1000;
  if (thousands >= 100) {
    return `${Math.round(thousands)}к`;
  }
  const rounded = Math.round(thousands * 10) / 10;
  const text =
    Number.isInteger(rounded) || rounded >= 10
      ? String(Math.round(rounded))
      : String(rounded).replace(".", ",");
  return `${text}к`;
}

export function resolveFollowersCount(post: {
  followers?: number;
  subscribers?: number;
}): number | undefined {
  if (typeof post.followers === "number") return post.followers;
  if (typeof post.subscribers === "number") return post.subscribers;
  return undefined;
}

/**
 * S49 — plaque always needs a number for competitors.
 * Prefer API followers; else deterministic hash from id (same as fixtures).
 */
export function resolveFollowersCountOrMock(post: {
  id: string;
  followers?: number;
  subscribers?: number;
}): number {
  const known = resolveFollowersCount(post);
  if (typeof known === "number") return known;
  let h = 0;
  for (let i = 0; i < post.id.length; i++) {
    h = (h * 31 + post.id.charCodeAt(i)) >>> 0;
  }
  return 8_000 + (h % 1_200_000);
}
