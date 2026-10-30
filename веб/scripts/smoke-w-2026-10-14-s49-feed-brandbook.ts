/**
 * S49 static smoke — feed plaque/toggle/Boards + Team brief gone + Design brandbook.
 * Tickets: C-feed-s49-chrome · C-boards-s49-upload · C-team-brief-gone-design-brandbook
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

let fail = 0;
function assert(cond: boolean, name: string) {
  if (cond) console.log(`PASS: ${name}`);
  else {
    fail += 1;
    console.log(`FAIL: ${name}`);
  }
}

const feedCard = read("components/studio/workspace/FeedPostCard.tsx");
assert(
  feedCard.includes('data-testid="feed-username-plaque"') &&
    feedCard.includes('data-testid="feed-followers-count"') &&
    feedCard.includes("|") &&
    feedCard.includes("showUsernamePlaque"),
  "S49.A plaque name|followers + showUsernamePlaque",
);
assert(
  feedCard.includes("showEngagement") &&
    /showUsernamePlaque !== undefined \? showUsernamePlaque : !isOurs/.test(
      feedCard,
    ),
  "S49.A Ours default no plaque",
);

const vpc = read("components/studio/workspace/VerticalPostCarousel.tsx");
assert(
  vpc.includes('data-testid="competitors-boards-switch"') &&
    vpc.includes("Загрузить") &&
    !/MultiButton/.test(vpc),
  "S49.A/B toggle+search+Загрузить, no MultiButton",
);
assert(
  /Опубликовано[\s\S]*text-white|text-white[\s\S]*Опубликовано/.test(vpc) ||
    vpc.includes("text-white"),
  "S49.A white Published/Drafts labels (text-white present)",
);

const boards = read("components/studio/workspace/BoardsPanel.tsx");
assert(
  !boards.includes("Локально · несколько кадров") &&
    boards.includes("showEngagement={false}") &&
    boards.includes("showUsernamePlaque={false}"),
  "S49.B Boards no helper + no metrics/plaque",
);

const flowchart = read("components/mesh/v2/ReleaseTeamFlowchart.tsx");
assert(
  !flowchart.includes("user-brief-textarea") &&
    flowchart.includes("basic brief field DELETED"),
  "S49.C Team brief field deleted",
);

const agentStore = read("lib/mesh/agent-store.ts");
assert(
  /export function loadUserBrief[\s\S]*?return ""/.test(agentStore),
  "S49.C loadUserBrief always empty",
);

const brandbook = read("components/settings/BrandbookBoard.tsx");
const designLib = read("components/settings/DesignLibraryCarousel.tsx");
assert(
  brandbook.includes('data-testid="brandbook-board"') &&
    brandbook.includes("brandbook-colors-card") &&
    designLib.includes("BrandbookBoard") &&
    designLib.includes("Создать из референса"),
  "S49.D Design brandbook board + upload CTA",
);

if (fail) {
  console.log(`SMOKE_W_2026_10_14_S49_FEED_BRANDBOOK_FAIL count=${fail}`);
  process.exit(1);
}
console.log("SMOKE_W_2026_10_14_S49_FEED_BRANDBOOK_OK");
