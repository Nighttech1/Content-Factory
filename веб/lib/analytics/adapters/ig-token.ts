/**
 * Shared Instagram Graph access token reader (analytics + Studio live feed).
 * Never log the returned value.
 */

export function readIgToken(): string | undefined {
  const token =
    process.env.INSTAGRAM_ACCESS_TOKEN?.trim() ||
    process.env.INSTAGRAM_GRAPH_TOKEN?.trim() ||
    process.env.IG_ACCESS_TOKEN?.trim();
  return token || undefined;
}
