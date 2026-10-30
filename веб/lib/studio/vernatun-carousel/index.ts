export type {
  ArtDirectorFinding,
  BuildMode,
  QualityStatus,
  VernatunJobBrief,
  VernatunJobResult,
  VernatunScript,
  VernatunSlideOut,
  VernatunDefect,
  VernatunReleaseStatus,
  RoleId,
  RoleModelConfig,
  UserAssetRecord,
  SlideGeometryOverride,
} from "./types";

export {
  resolveRoleModel,
  listRoleModelDefaults,
  resolveTextOrchestratorModel,
  TEXT_ORCHESTRATOR_MODEL,
  IMAGE_GEN_MODEL,
} from "./role-models";
export {
  countWords,
  assertCoverHeadline,
  isCoverHeadlineValid,
} from "./word-count";
export {
  runVernatunCarouselJob,
  runVernatunScriptPhase,
} from "./orchestrator";
export {
  normalizeFindings,
  findingToDefect,
  defectToFinding,
  findingsHaveBlocker,
} from "./findings";
export { applyRepairs, applyTextRepairs } from "./repair";
export {
  applyWordmarkOverridesToMeta,
  bakeExactEmblemOntoSlide,
  emblemCompositeOffset,
  ensureLogoBakeJobMeta,
  isLogoBakeEnabled,
  findEmblemCircleInLockup,
  pickLogoCornerForJob,
  pickWordmarkHexForLuminance,
  parseWordmarkHexFromFixText,
  resolveWordmarkHexForSlide,
  seriesLogoCorner,
  resolveLogoBakeEmblemPath,
  tintLockupWordmark,
  DEFAULT_LOGO_BAKE_SIZE_PX,
  FIXED_LOGO_CORNER,
  LOGO_CORNERS,
  WORDMARK_DARK,
  WORDMARK_WHITE,
} from "./logo-bake";
export { createJobLlmSession } from "./job-llm-session";
