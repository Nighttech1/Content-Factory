/**
 * Smoke C-32: Ours inline tabs + analyst analysis-only + agent chat composer.
 *
 * Run: npx tsx scripts/smoke-c32-ours-tabs.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getFeedForModule } from "../lib/studio/feed-fixtures";
import {
  buildAnalystMessages,
  runRazborAnalysis,
  runRazborCascade,
} from "../lib/studio/razbor-pipeline";

const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertAnalystAnalysisOnly(): void {
  const feed = getFeedForModule("carousel-engine");
  assert(feed.competitors.length > 0, "need competitors");
  const post = feed.competitors[0];

  const msgs = buildAnalystMessages(post);
  assert(msgs.length >= 3, "analyst detailed breakdown (≥3 msgs)");
  const joined = msgs.map((m) => m.text).join("\n").toLowerCase();
  assert(
    !joined.includes("предлагаю") && !joined.includes("наш сценарий"),
    "analyst must not pitch scenario",
  );
  assert(
    joined.includes("метрик") || joined.includes("swipe") || joined.includes("hook"),
    "analyst should include breakdown metrics/hooks",
  );

  const analysis = runRazborAnalysis(post.id);
  assert(analysis, "analysis payload");
  assert(analysis!.scenario.length > 0, "scenario still seeded for cascade");
  const analystJoined = analysis!.analystMessages
    .map((m) => m.text)
    .join("\n")
    .toLowerCase();
  assert(
    !analystJoined.includes("предлагаю наш сценарий"),
    "analysis payload analyst no scenario pitch",
  );

  const cascade = runRazborCascade(post.id);
  assert(cascade, "cascade intact");
  assert(cascade!.draft.status === "unpublished", "draft unpublished");
  assert(
    cascade!.scriptwriterMessages.length >= 2,
    "scriptwriter still runs on cascade",
  );

  console.log("SMOKE_C32_ANALYST_OK");
}

function assertUiSource(): void {
  const carousel = readFileSync(
    join(ROOT, "components/studio/workspace/VerticalPostCarousel.tsx"),
    "utf8",
  );
  const drafts = readFileSync(
    join(ROOT, "components/studio/workspace/DraftsPanel.tsx"),
    "utf8",
  );
  const composer = readFileSync(
    join(ROOT, "components/studio/workspace/AgentChatComposer.tsx"),
    "utf8",
  );
  const modal = readFileSync(
    join(ROOT, "components/studio/workspace/RazborModal.tsx"),
    "utf8",
  );

  assert(carousel.includes("ours-tab-published"), "ours-tab-published");
  assert(carousel.includes("ours-tab-drafts"), "ours-tab-drafts");
  assert(
    carousel.includes("data-testid={tab.testId}") ||
      carousel.includes('data-testid="ours-tab-drafts"'),
    "tabs expose data-testid",
  );
  assert(
    !drafts.includes('role="dialog"') && !drafts.includes("aria-modal"),
    "DraftsPanel must not be dialog popup",
  );
  assert(drafts.includes("ours-drafts-panel"), "inline drafts panel testid");

  assert(composer.includes('data-testid="agent-chat-input"'), "agent-chat-input");
  assert(composer.includes('data-testid="agent-chat-mic"'), "agent-chat-mic");
  assert(composer.includes('data-testid="agent-chat-send"'), "agent-chat-send");
  assert(
    composer.includes("webkitSpeechRecognition") ||
      composer.includes("SpeechRecognition"),
    "Web Speech API",
  );
  assert(
    composer.includes("speechSupported") || composer.includes("недоступен"),
    "mic graceful degrade",
  );

  assert(modal.includes("AgentChatComposer"), "composer wired in RazborModal");
  assert(modal.includes("razbor-write-script"), "cascade CTA kept");

  console.log("SMOKE_C32_UI_SOURCE_OK");
}

function main(): void {
  assertAnalystAnalysisOnly();
  assertUiSource();
  console.log("SMOKE_C32_OK");
}

main();
