/**
 * Barrel — AI Bridge prompt packs (C-20).
 */
export {
  HEYGEN_SCRIPT_PROMPT_VERSION,
  HEYGEN_SCRIPT_SYSTEM,
  buildHeyGenScriptUserPrompt,
  buildHeyGenScriptMockLines,
  type HeyGenScriptLineDraft,
} from "./heygen-script";

export {
  HEYGEN_AVATAR_PROMPT_VERSION,
  HEYGEN_AVATAR_SYSTEM,
  buildHeyGenAvatarUserPrompt,
} from "./heygen-avatar";

export {
  MODULE_DRAFT_PROMPT_VERSION,
  CAROUSEL_DRAFT_SYSTEM,
  GRAPHICS_DRAFT_SYSTEM,
  CARTOON_DRAFT_SYSTEM,
  buildCarouselDraftMock,
  buildGraphicsDraftMock,
  buildCartoonDraftMock,
} from "./module-drafts";
