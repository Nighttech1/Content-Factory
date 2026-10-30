/**
 * Wave W-2026-10-13-drafts-design-team — static greps + unit/contract.
 * Tickets: C-drafts-always · C-settings-design-md-carousel · C-team-brief-n-indicator
 *
 *   npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(rel: string) {
  return readFileSync(path.join(root, rel), "utf8");
}

let failed = 0;

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("PASS:", msg);
  }
}

// —— localStorage / window mock for library + drafts store ——
const mem = new Map<string, string>();
const localStorageMock = {
  getItem(key: string) {
    return mem.has(key) ? mem.get(key)! : null;
  },
  setItem(key: string, value: string) {
    mem.set(key, String(value));
  },
  removeItem(key: string) {
    mem.delete(key);
  },
  clear() {
    mem.clear();
  },
  key() {
    return null;
  },
  get length() {
    return mem.size;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true,
});

async function main() {
  // ========== STATIC: C-drafts-always ==========
  const createModal = read("components/studio/workspace/CreateCarouselModal.tsx");
  assert(
    createModal.includes("upsertDraft(draftAfterDraw)") ||
      createModal.includes("upsertDraft(draftAfterDraw"),
    "C-drafts: Create upsertDraft after successful draw",
  );
  assert(
    createModal.includes("onDraftPersisted"),
    "C-drafts: onDraftPersisted callback wired",
  );
  assert(
    !createModal.includes("RazborModal"),
    "C-drafts: Create modal does not import RazborModal",
  );

  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    workspace.includes("bumpOpenDraftsNonce") &&
      workspace.includes("onDraftPersisted={bumpOpenDraftsNonce}"),
    "C-drafts: workspace bumps openDraftsNonce on persist",
  );

  const vertical = read("components/studio/workspace/VerticalPostCarousel.tsx");
  assert(
    vertical.includes("openDraftsNonce") &&
      vertical.includes('setOursTab("drafts")'),
    "C-drafts: nonce switches Ours → Черновики",
  );

  const draftsPanel = read("components/studio/workspace/DraftsPanel.tsx");
  assert(
    draftsPanel.includes("создайте карусель") &&
      draftsPanel.includes("Разбор"),
    "C-drafts: empty copy mentions Create + Разбор",
  );

  const publish = read("lib/studio/create-carousel-publish.ts");
  assert(
    publish.includes("upsertDraft") && publish.includes("status: \"unpublished\""),
    "C-drafts: publishCreateCarousel upserts unpublished draft",
  );

  const draftsStore = read("lib/studio/carousel-drafts-store.ts");
  assert(
    draftsStore.includes('cf.carousel.drafts.v1'),
    "C-drafts: persist key cf.carousel.drafts.v1",
  );

  // ========== STATIC: C-settings-design-md-carousel ==========
  const designLibSrc = read("lib/settings/design-library.ts");
  assert(
    designLibSrc.includes("DESIGN_LIBRARY_MAX = 10") ||
      designLibSrc.includes("DESIGN_LIBRARY_MAX=10"),
    "C-settings: DESIGN_LIBRARY_MAX = 10",
  );
  assert(
    designLibSrc.includes("cf.settings.design.library.v1") &&
      designLibSrc.includes("cf.settings.design.activeId"),
    "C-settings: library + activeId keys",
  );

  const embla = read("components/settings/DesignLibraryCarousel.tsx");
  assert(
    embla.includes("design-library") &&
      embla.includes("Добавить новый дизайн") &&
      (embla.includes("DESIGN.md") || embla.includes("design-library-md-chip")),
    "C-settings: Embla library + CTA + DESIGN.md chip",
  );
  assert(
    !embla.includes("@appica") && !read("package.json").includes("@appica"),
    "C-settings: no @appica dependency",
  );

  const preview = read("components/settings/DesignPreviewPanel.tsx");
  assert(
    preview.includes("settings-design-preview-close") &&
      preview.includes("settings-design-preview-drag") &&
      preview.includes("setPointerCapture"),
    "C-settings: preview Close + drag with capture",
  );
  assert(
    preview.includes("{open ?") || preview.includes("open ? ("),
    "C-settings: panel gated on open (unmount when closed)",
  );
  // Close must be sibling of drag, not nested under setPointerCapture target
  const closeIdx = preview.indexOf("settings-design-preview-close");
  const dragBlock = preview.indexOf("settings-design-preview-drag");
  assert(closeIdx > dragBlock && closeIdx > 0, "C-settings: Close after drag sibling");
  const dragToClose = preview.slice(dragBlock, closeIdx);
  assert(
    !dragToClose.includes("settings-design-preview-close"),
    "C-settings: Close not nested inside drag markup before close id",
  );

  // ========== STATIC: C-team-brief-n-indicator → S49 brief DELETE ==========
  const flowchart = read("components/mesh/v2/ReleaseTeamFlowchart.tsx");
  assert(
    !flowchart.includes("user-brief-textarea") &&
      !flowchart.includes(">Задание<") &&
      flowchart.includes('data-testid="mesh-user-node"') &&
      flowchart.includes("basic brief field DELETED"),
    "C-team: S49 no Задание textarea (brief deleted)",
  );

  const agentStore = read("lib/mesh/agent-store.ts");
  assert(
    /export function loadUserBrief[\s\S]*?return ""/.test(agentStore) &&
      agentStore.includes("Team basic brief gone"),
    "C-team: loadUserBrief always empty (S49)",
  );
  assert(
    agentStore.includes("return topic.trim()") &&
      agentStore.includes("composeTopicWithBrief"),
    "C-team: composeTopicWithBrief no glue",
  );
  assert(
    agentStore.includes("resetUserBrief:") &&
      /resetUserBrief:\s*\(\)\s*=>\s*\{[\s\S]*?userBrief:\s*""/.test(agentStore),
    "C-team: resetUserBrief → empty",
  );

  const nextConfig = read("next.config.ts");
  assert(
    /devIndicators:\s*false/.test(nextConfig),
    "C-team: next.config devIndicators: false",
  );

  const sanitize = read("lib/studio/agent-chat-sanitize.ts");
  assert(
    sanitize.includes("stripCombatBriefGlue") &&
      sanitize.includes("Бриф:"),
    "C-team: sanitize strips Бриф glue",
  );

  const agentChatRoute = read("app/api/studio/agent-chat/route.ts");
  assert(
    agentChatRoute.includes("sanitizeAgentChatTurnsForC155") ||
      agentChatRoute.includes("stripCombatBriefGlue"),
    "C-team: agent-chat route uses C-155 sanitize",
  );

  // composeTopicWithBrief must not be called from chat client / create paths
  const agentChatClient = read("lib/studio/agent-chat-client.ts");
  assert(
    !agentChatClient.includes("composeTopicWithBrief"),
    "C-team: agent-chat-client does not glue brief",
  );

  // ========== UNIT: design-library cap + resolve ==========
  const {
    DESIGN_LIBRARY_MAX,
    DESIGN_LIBRARY_STORAGE_KEY,
    DESIGN_ACTIVE_ID_KEY,
    appendDesignLibrarySlot,
    writeDesignLibrary,
    readDesignLibrary,
    writeActiveDesignId,
    readActiveDesignId,
    resolveActiveDesignMarkdown,
  } = await import("../lib/settings/design-library");

  mem.clear();
  assert(DESIGN_LIBRARY_MAX === 10, "unit: DESIGN_LIBRARY_MAX === 10");

  const slots = Array.from({ length: 10 }, (_, i) => ({
    id: `slot-${i}`,
    name: `DESIGN-${i}.md`,
    markdown: `# Slot ${i}`,
    createdAt: new Date().toISOString(),
  }));
  writeDesignLibrary(slots);
  writeActiveDesignId("slot-3");
  assert(readDesignLibrary().length === 10, "unit: library stores 10 slots");
  assert(readActiveDesignId() === "slot-3", "unit: activeId persisted");

  const blocked = appendDesignLibrarySlot({
    name: "overflow.md",
    markdown: "# too many",
  });
  assert(blocked === null, "unit: append blocked at cap 10");
  assert(readDesignLibrary().length === 10, "unit: still 10 after blocked append");

  const resolved = resolveActiveDesignMarkdown({
    library: slots,
    activeId: "slot-7",
  });
  assert(
    resolved.source === "library" &&
      resolved.activeId === "slot-7" &&
      resolved.markdown.includes("Slot 7"),
    "unit: resolveActiveDesignMarkdown picks active slot",
  );

  const fallback = resolveActiveDesignMarkdown({
    library: [],
    activeId: null,
    fallbackMarkdown: "# docs fallback",
  });
  assert(
    fallback.source === "fallback" && fallback.markdown.includes("docs fallback"),
    "unit: resolve falls back when library empty",
  );

  // ========== UNIT: composeTopicWithBrief + sanitize ==========
  const { composeTopicWithBrief, loadUserBrief, persistUserBrief } =
    await import("../lib/mesh/agent-store");
  const { defaultCombatBrief } = await import("../lib/mesh/agent-defaults");
  const {
    stripCombatBriefGlue,
    sanitizeAgentChatTurnsForC155,
    COMBAT_BRIEF_GLUE_MARKER,
  } = await import("../lib/studio/agent-chat-sanitize");

  const rawTopic = "unique-raw-topic-xyz";
  assert(
    composeTopicWithBrief(rawTopic, "carousel-engine") === rawTopic,
    "unit: composeTopicWithBrief returns raw only",
  );
  assert(
    composeTopicWithBrief(`  ${rawTopic}  `) === rawTopic,
    "unit: composeTopicWithBrief trims",
  );
  assert(
    !composeTopicWithBrief(rawTopic).includes("Бриф:"),
    "unit: composeTopicWithBrief has no Бриф glue",
  );

  const glued = `${rawTopic}${COMBAT_BRIEF_GLUE_MARKER}secret-brief-body`;
  assert(
    stripCombatBriefGlue(glued) === rawTopic,
    "unit: stripCombatBriefGlue removes brief suffix",
  );
  const sanitized = sanitizeAgentChatTurnsForC155([
    { role: "user", content: glued },
    { role: "assistant", content: " ok " },
  ]);
  assert(
    sanitized[0]!.content === rawTopic && sanitized[1]!.content === "ok",
    "unit: sanitizeAgentChatTurnsForC155 user=raw",
  );

  mem.clear();
  assert(
    loadUserBrief("carousel-engine") === "",
    "unit: loadUserBrief missing key → empty",
  );
  persistUserBrief("carousel-engine", defaultCombatBrief("carousel-engine"));
  assert(
    loadUserBrief("carousel-engine") === "",
    "unit: known combat seed hydrates as empty",
  );
  persistUserBrief("carousel-engine", "my custom brief");
  // S49: Team brief gone — loadUserBrief always "" (never inject custom/combat)
  assert(
    loadUserBrief("carousel-engine") === "",
    "unit: S49 loadUserBrief never returns custom brief",
  );

  // ========== UNIT: drafts upsert same id (draw → publish) ==========
  mem.clear();
  // Clear any prior zustand hydrate
  mem.delete("cf.carousel.drafts.v1");

  const { useCarouselDraftsStore, CAROUSEL_DRAFTS_STORAGE_KEY } = await import(
    "../lib/studio/carousel-drafts-store"
  );
  const { publishCreateCarousel } = await import(
    "../lib/studio/create-carousel-publish"
  );

  const draftId = "create-draft-stable-1";
  const now = new Date().toISOString();
  const drawDraft = {
    id: draftId,
    sourceCompetitorId: "create-carousel",
    competitorId: "create-carousel",
    title: "Создать карусель",
    slides: [
      { id: "s1", imageUrl: "data:image/png;base64,aaa", caption: "one" },
    ],
    status: "unpublished" as const,
    createdAt: now,
    updatedAt: now,
  };

  useCarouselDraftsStore.getState().upsertDraft(drawDraft);
  let found = useCarouselDraftsStore.getState().getDraft(draftId);
  assert(Boolean(found), "unit: upsertDraft after draw");
  assert(
    useCarouselDraftsStore.getState().drafts.filter((d) => d.id === draftId)
      .length === 1,
    "unit: single draft id after draw",
  );

  const pub = publishCreateCarousel({
    draft: {
      ...drawDraft,
      slides: [
        ...drawDraft.slides,
        { id: "s2", imageUrl: "data:image/png;base64,bbb", caption: "two" },
      ],
    },
    startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    platformId: "ig-test",
  });
  assert(pub.ok === true, "unit: publishCreateCarousel ok");
  found = useCarouselDraftsStore.getState().getDraft(draftId);
  assert(
    Boolean(found) &&
      found!.slides.length === 2 &&
      useCarouselDraftsStore.getState().drafts.filter((d) => d.id === draftId)
        .length === 1,
    "unit: publish reuses same draft id (no duplicate)",
  );

  const bad = publishCreateCarousel({
    draft: { ...drawDraft, slides: [] },
    startsAt: new Date().toISOString(),
  });
  assert(bad.ok === false, "unit: publish without slides fails (no fake card path)");

  assert(
    CAROUSEL_DRAFTS_STORAGE_KEY === "cf.carousel.drafts.v1",
    "unit: drafts storage key",
  );
  // silence unused after assert path
  void DESIGN_LIBRARY_STORAGE_KEY;
  void DESIGN_ACTIVE_ID_KEY;

  if (failed > 0) {
    console.error(`\nSMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_FAIL count=${failed}`);
    process.exit(1);
  }
  console.log("\nSMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK");
}

main().catch((e) => {
  console.error("SMOKE_ERR", e instanceof Error ? e.message : e);
  process.exit(1);
});
