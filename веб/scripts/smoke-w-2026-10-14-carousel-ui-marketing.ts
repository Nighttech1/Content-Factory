/**
 * S47 smoke — W-2026-10-14-carousel-ui-marketing
 * Tickets: C-feed-card-chrome-s47, C-razbor-create-modal-s47, C-marketing-director-chat
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks: { name: string; pass: boolean; detail?: string }[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function ok(name: string, cond: boolean, detail = "") {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

// ——— C-feed-card-chrome-s47 ———
const feedCard = read("components/studio/workspace/FeedPostCard.tsx");
ok(
  "feed username plaque testid",
  /data-testid="feed-username-plaque"/.test(feedCard),
);
ok(
  "feed engagement row on photo",
  /data-testid="feed-engagement-row"/.test(feedCard) &&
    /absolute[\s\S]{0,80}bottom-0/.test(feedCard),
);
ok(
  "feed engagement includes shares+saves",
  /key:\s*"shares"/.test(feedCard) && /key:\s*"saves"/.test(feedCard),
);
ok(
  "feed no caption chrome comment",
  /S47:\s*no caption/.test(feedCard) || /no caption \/ title \/ tags/.test(feedCard),
);
ok(
  "feed plaque black + white CG",
  /bg-black/.test(feedCard) &&
    /text-white/.test(feedCard) &&
    /FONT_CG|font-century-gothic|font-ui/.test(feedCard),
);

const workspace = read("components/studio/StudioModuleWorkspace.tsx");
ok(
  "workspace no feed-source-badge Онлайн",
  !/feed-source-badge/.test(workspace) ||
    /no feed-source-badge|S47: no feed-source-badge/.test(workspace),
);
// Comment may mention the removed badge; fail only on JSX/string literals.
const workspaceNoComments = workspace.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
ok(
  "workspace does not render Онлайн · Instagram string",
  !/Онлайн\s*·\s*Instagram/.test(workspaceNoComments) &&
    !/>\s*Онлайн/.test(workspaceNoComments),
);

// ——— C-razbor-create-modal-s47 ———
const razbor = read("components/studio/workspace/RazborModal.tsx");
ok(
  "razbor AgentPeopleIconTabs",
  /AgentPeopleIconTabs/.test(razbor) &&
    /razbor-agent-people-tabs/.test(razbor),
);
ok(
  "razbor hideTools + Сообщение placeholder",
  /hideTools/.test(razbor) && /placeholder="Сообщение"/.test(razbor),
);
ok(
  "razbor no «Карусель конкурента» banner",
  !/"Карусель конкурента"/.test(razbor) &&
    (/no banner «Карусель конкурента»|S47 — no banner/.test(razbor) ||
      !/Карусель конкурента/.test(razbor)),
);
ok(
  "razbor modal scroll lock",
  /stopModalWheel|use-modal-scroll-lock/.test(razbor),
);

const create = read("components/studio/workspace/CreateCarouselModal.tsx");
ok(
  "create Art Director + hideTools",
  /hideTools/.test(create) &&
    /Арт-директор/.test(create) &&
    /create-carousel-ad-header/.test(create),
);
ok(
  "create assemble CTA + Mode A/B",
  /Собрать карусель/.test(create) &&
    /create-draw-button/.test(create) &&
    /create-build-mode/.test(create) &&
    /cf\.carousel\.buildMode/.test(create),
);
ok(
  "create no multi-agent handoff chrome",
  !/create-handoff-designer/.test(create) &&
    !/CreateCarouselPublicationPane/.test(create) &&
    !/Сценарист/.test(create),
);
ok(
  "create segment file retained (D-icons-1)",
  /create-carousel-segment/.test(
    read("components/studio/workspace/CreateCarouselStepSegment.tsx"),
  ) &&
    /AgentProfessionAvatar/.test(
      read("components/studio/workspace/CreateCarouselStepSegment.tsx"),
    ),
);

const slides = read("components/studio/workspace/RazborSlidesCarousel.tsx");
ok(
  "razbor slide index N/M CG",
  /data-testid="razbor-slide-index"/.test(slides) &&
    /safeIndex \+ 1\}\/\{count\}/.test(slides) &&
    /font-century-gothic/.test(slides),
);

const createPreview = read("components/studio/workspace/CreateCarouselPreview.tsx");
ok(
  "create slide index N/M",
  /data-testid="create-carousel-slide-index"/.test(createPreview),
);

const welcome = read("lib/studio/razbor-pipeline.ts");
ok(
  "razbor short welcome S47",
  /Привет! Я Разборщик Vernatun/.test(welcome) &&
    /S47 — short welcome/.test(welcome),
);

const handoff = read("components/studio/workspace/HandoffRoundButton.tsx");
ok(
  "handoff arrow + next logo",
  /ArrowRight/.test(handoff) &&
    /resolveNextIcon|NextIcon/.test(handoff) &&
    /handoff-round-button/.test(handoff),
);

const people = read("components/studio/workspace/AgentPeopleIconTabs.tsx");
ok(
  "people tabs 4 rounded avatars",
  /AgentProfessionAvatar/.test(people) &&
    /rounded-full/.test(people) &&
    /C-razbor-create-modal-s47/.test(people),
);

const scrollLock = read("lib/studio/use-modal-scroll-lock.ts");
ok(
  "modal scroll lock helper",
  /useModalScrollLock|stopModalWheel/.test(scrollLock),
);

// ——— C-marketing-director-chat ———
ok("marketing page exists", exists("app/marketing/page.tsx"));
ok("marketing chat API exists", exists("app/api/marketing/chat/route.ts"));
ok("marketing search API exists", exists("app/api/marketing/search/route.ts"));

const marketingClient = read("components/marketing/MarketingDirectorClient.tsx");
ok(
  "marketing welcome + AIInput + sink",
  /marketing-welcome/.test(marketingClient) &&
    /AIInput/.test(marketingClient) &&
    /marketing-composer-sink/.test(marketingClient) &&
    /placeholder="Сообщение"/.test(marketingClient),
);

const rail = read("components/marketing/MarketingProjectsRail.tsx");
ok(
  "marketing projects rail",
  /marketing-projects-rail/.test(rail),
);

const prompt = read("lib/marketing/prompt.ts");
ok(
  "marketing Haiku model path",
  /anthropic\/claude-haiku-4\.5/.test(prompt) &&
    /MARKETING_DIRECTOR_MODEL/.test(prompt),
);

const tools = read("lib/marketing/tools.ts");
ok(
  "marketing tools app_search + app_graphql",
  /name:\s*"app_search"/.test(tools) && /name:\s*"app_graphql"/.test(tools),
);

const chat = read("lib/marketing/chat.ts");
ok(
  "marketing chat wires tools + Haiku model",
  /MARKETING_OPENAI_TOOLS/.test(chat) &&
    /MARKETING_DIRECTOR_MODEL/.test(chat),
);

const failed = checks.filter((c) => !c.pass);
console.log("\n---");
console.log(
  failed.length === 0
    ? "SMOKE_W_2026_10_14_CAROUSEL_UI_MARKETING_OK"
    : `SMOKE_W_2026_10_14_CAROUSEL_UI_MARKETING_FAIL (${failed.length})`,
);
process.exit(failed.length === 0 ? 0 : 1);
