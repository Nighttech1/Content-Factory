/**
 * Smoke C-35: buildAnalystMessages live cites real metrics; mock keeps C-30 wording.
 * Run: npx tsx scripts/smoke-c35-ig-agents.ts
 */
import { buildAnalystMessages } from "../lib/studio/razbor-pipeline";
import type { FeedPost } from "../lib/studio/feed-types";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const livePost = {
  id: "live-1",
  source: "ours" as const,
  title: "Guest night carousel",
  thumbUrl: "https://example.com/t.jpg",
  metrics: { views: 12500, likes: 840, comments: 42 },
  topicTags: ["club", "guest"],
  sourceMode: "live" as const,
  username: "mosarmclub",
  permalink: "https://www.instagram.com/p/ABC123/",
  slideUrls: ["a", "b", "c", "d", "e"],
} satisfies FeedPost;

const mockPost = {
  id: "mock-1",
  source: "competitor" as const,
  title: "Fixture carousel",
  thumbUrl: "https://example.com/t.jpg",
  metrics: { views: 1000, likes: 50 },
  topicTags: ["club"],
  sourceMode: "mock" as const,
} satisfies FeedPost;

const liveText = buildAnalystMessages(livePost)
  .map((m) => m.text)
  .join("\n");
const mockText = buildAnalystMessages(mockPost)
  .map((m) => m.text)
  .join("\n");

// formatMetric(12500) → "13K" (≥10k uses toFixed(0)); 840/42 stay raw
assert(liveText.includes("Live-разбор"), "live header");
assert(liveText.includes("13K"), "live views from metrics via formatMetric");
assert(liveText.includes("840"), "live likes");
assert(liveText.includes("42"), "live comments");
assert(liveText.includes("Слайдов: 5"), "live slideCount from slideUrls");
assert(liveText.includes("@mosarmclub"), "live username");
assert(liveText.includes("https://www.instagram.com/p/ABC123/"), "live permalink");
assert(liveText.includes("Факт-метрики:"), "live labels metrics as facts");

assert(mockText.includes("Разбор карусели"), "mock header");
assert(!mockText.includes("Live-разбор"), "mock not live-branded");
assert(!mockText.includes("Permalink:"), "mock no permalink line");
assert(mockText.includes("1.0K") || mockText.includes("1000"), "mock still shows fixture metrics");

console.log("C-35 smoke OK: live cites metrics/slides/handle; mock keeps C-30 style");
