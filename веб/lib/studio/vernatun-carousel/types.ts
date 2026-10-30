/**
 * Vernatun carousel module — shared contracts (TZ v2 + product wave).
 */

export type BuildMode = "A" | "B";

export type VernatunReleaseStatus =
  | "SCRIPT_PENDING"
  | "BUILDING"
  | "FINAL"
  | "BLOCKED"
  | "BLOCKED_WITH_REMARKS";

export type DefectPriority = "BLOCKER" | "MAJOR" | "MINOR";

/** AD final finding severity (v2). */
export type FindingSeverity =
  | "blocker"
  | "major"
  | "minor"
  | "suggestion";

export type QualityStatus = "PASS" | "WARN" | "BLOCKED";

export type VernatunSlideRole =
  | "cover"
  | "body"
  | "split"
  | "photo_top"
  | "cards"
  | "quote"
  | "dialogue"
  | "statement"
  | "cta";

/** What kind of image this slide needs (scriptwriter → image tools). */
export type ImageNeedKind =
  | "none"
  | "graphic"
  | "photo_generic"
  | "photo_real_place"
  | "photo_user_required";

export type SlideImageNeed = {
  kind: ImageNeedKind;
  place_query?: string | null;
  must_be_photographic?: boolean;
  forbid_ai_if_possible?: boolean;
};

export type VernatunSlideScript = {
  index: number;
  role: VernatunSlideRole | string;
  headline: string;
  body: string;
  supporting_copy?: string;
  cta?: string;
  visual_intent: string;
  facts_to_verify?: string[];
  /** Optional AD/layout hint — freeform shape of text block. */
  composition_hint?: string;
  /** Do not repeat this silhouette on the next slide. */
  must_not_repeat?: string;
  /** Photo/graphic need for image pipeline. */
  image_need?: SlideImageNeed;
  /** Chosen composition recipe id (Mode A). */
  recipe?: string;
};

/** Series-wide typography lock (B3+) — same block fonts across all slides. */
export type VernatunTypeSystem = {
  headline: string;
  body: string;
  cta: string;
};

export type VernatunScript = {
  carousel_title: string;
  audience: string;
  central_thesis: string;
  /**
   * Slide count chosen by Art Director at script stage (product rule).
   * Clamped 4–8 unless demo FORCE via brief.slideCount.
   */
  slide_count?: number;
  /** Optional series type lock (filled in B3; may be empty early). */
  type_system?: VernatunTypeSystem;
  slides: VernatunSlideScript[];
};

export type UserAssetRecord = {
  asset_id: string;
  original_filename: string;
  mime: string;
  width?: number;
  height?: number;
  bytes: number;
  sha256: string;
  path: string;
  status: "pending" | "used" | "reference_only" | "rejected";
  required?: boolean;
};

export type AssetTransformation = {
  op: string;
  detail?: string;
  at?: string;
};

export type AssetManifestRow = {
  asset_id: string;
  filename: string;
  slide_id: string;
  role: string;
  source_type: "user" | "generated" | "web";
  source_url_or_provider: string;
  license_or_terms: string;
  original_filename: string;
  original_width: number;
  original_height: number;
  bytes: number;
  format: string;
  sha256: string;
  /** @deprecated prefer transformations[] */
  transformed: boolean;
  /** @deprecated prefer transformations[] */
  transform_log: string;
  transformations?: AssetTransformation[];
  quality_status?: QualityStatus;
  sharpness_metric?: number;
  visual_review: "pending" | "pass" | "fail" | "skipped";
  accepted: boolean;
  rejection_reason?: string;
};

/** Legacy AD defect (v1 readers). */
export type VernatunDefect = {
  priority: DefectPriority;
  slide_index: number;
  element: string;
  reason: string;
  fix: string;
};

/** Art Director finding v2 — 7 fields. */
export type ArtDirectorFinding = {
  slide_id: string;
  severity: FindingSeverity;
  element: string;
  observed_issue: string;
  recommended_change: string;
  reason: string;
  acceptance_check: string;
};

export type QaReport = {
  status: "PASS" | "FAIL";
  blockers: string[];
  warnings: string[];
  automated_checks: Record<string, boolean | string>;
  visual_review: "pending" | "done" | "skipped";
  files: string[];
};

export type VernatunJobBrief = {
  topic: string;
  audience?: string;
  platform?: string;
  /** Explicit CTA copy (overrides catalog default). */
  cta?: string;
  /**
   * CTA type from Google Sheet (`speaking_meetup` | `CTA_MEETING` | …).
   * See `cta-catalog.ts`. Default while Sheet not wired: speaking_meetup.
   */
  ctaType?: string;
  slideCount?: number;
  language?: string;
  tone?: string;
  buildMode: BuildMode;
  styleNotes?: string;
  forbidden?: string[];
  useUserAssets?: boolean;
  userAssets?: UserAssetRecord[];
  /** Skip user approval gate (internal smoke / explicit). */
  /**
   * true = не ждать согласования сценария в UI-чате; сразу писать сценарий
   * и крутить две маски (сценарист ↔ AD сценария). false = SCRIPT_PENDING для чата.
   * НЕ путать с CAROUSEL_SKIP_AD_SCRIPT (тот выключает маску AD).
   */
  skipScriptApproval?: boolean;
  /** Max repair loops. Dev default 0 (one gen → AD log). Prod: set 2 via env/brief. */
  maxRepairCycles?: number;
  /**
   * Fact-check branch from Google Sheet col `facts` / `Проверка достоверности фактов`.
   * `FACT_CHECK` | true → Research + Fact-Checker. LLM must not invent this.
   */
  factCheckMode?: "STANDARD" | "FACT_CHECK" | boolean;
  /** Raw sheet cell for logs. */
  factCheckRaw?: string;
  /** Sheet row id for logs (№ / sheetRowKey). */
  sheetRowKey?: string;
};

export type VernatunProgressFn = (
  agent: string,
  message: string,
) => void | Promise<void>;

export type VernatunSlideOut = {
  id: string;
  index: number;
  imageUrl: string;
  caption: string;
  htmlPath?: string;
  pngPath: string;
};

export type VernatunJobResult = {
  ok: boolean;
  jobId: string;
  buildMode: BuildMode;
  status: VernatunReleaseStatus;
  script: VernatunScript | null;
  slides: VernatunSlideOut[];
  remarks: string[];
  defects: VernatunDefect[];
  findings?: ArtDirectorFinding[];
  qa: QaReport | null;
  jobDir: string;
  repairCycles: number;
  error?: string;
};

export type RoleId =
  | "orchestrator"
  | "scriptwriter"
  | "artDirectorScript"
  | "researchAgent"
  | "factChecker"
  | "imagePlanner"
  | "imageGen"
  | "designer"
  | "artDirectorFinal"
  | "qa";

export type RoleModelConfig = {
  provider: string;
  model: string;
};

/** How brand sits on the slide — AD improvisation (no mandatory full-width bar). */
export type BrandChromeMode = "bare" | "float" | "bar";

/** How body copy sits relative to photo. */
export type TextSurfaceMode = "on-photo" | "scrim" | "panel";

/** Geometry overrides applied by repair from findings. */
export type SlideGeometryOverride = {
  slideIndex: number;
  counterScale?: number;
  panelWidthPct?: number;
  panelRadiusPx?: number;
  panelShape?: "rect" | "rounded" | "pill" | "ribbon" | "diagonal" | "split-band";
  logoScale?: number;
  templateForce?: string;
  /** Force composition recipe id (Mode A). */
  recipeForce?: string;
  /** Brand chrome placement hint. */
  brandPlacement?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  brandChromeMode?: BrandChromeMode;
  textSurfaceMode?: TextSurfaceMode;
};
