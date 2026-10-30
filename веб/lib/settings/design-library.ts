/**
 * C-settings-design-md-carousel + C-visual-style-deconstructor —
 * Design library contract (AI Bridge + Frontend + Backend).
 * Keys / types / resolve active DESIGN.md + DesignPresetFile for Designer.
 * Embla UI lives in Frontend; this module is the shared read/write contract.
 */

import {
  clearDesignMdOverride,
  readDesignMdOverride,
} from "@/lib/settings/design-override";
import {
  type DesignPresetFile,
  type DeconstructStyleResponse,
  buildDesignTokensPayload,
  createBentoGlassSeedPreset,
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "@/lib/settings/design-preset";

export { buildDesignTokensPayload };
import {
  apiActivateDesignSlot,
  apiDeleteDesignSlot,
  apiListDesignSlots,
  apiPatchDesignSlot,
  apiUpsertDesignSlot,
} from "@/lib/studio/sprint8-client";
import {
  ensureSprint8Migrated,
  emitSprint8Hydrated,
} from "@/lib/studio/sprint8-migrate";

export type { DesignPresetFile, DeconstructStyleResponse };
export {
  DESIGN_PRESET_IDS,
  PNG_BUDGET_MAX,
  SEED_BENTO_GLASS_ID,
  SEED_DARK_NOTES_ID,
  createBentoGlassSeedPreset,
  createDarkNotesSeedPreset,
  createDefaultVernatunPreset,
  designPresetToCssVars,
  parseDesignPresetFile,
} from "@/lib/settings/design-preset";

/** Max Embla slots (Architect D-sd-1). */
export const DESIGN_LIBRARY_MAX = 10;

/** localStorage: DesignLibrarySlot[] */
export const DESIGN_LIBRARY_STORAGE_KEY = "cf.settings.design.library.v1";

/** localStorage: active slot id */
export const DESIGN_ACTIVE_ID_KEY = "cf.settings.design.activeId";

/** Legacy single-file override (C-70) — migrate into library on first read. */
export const DESIGN_LEGACY_OVERRIDE_KEY = "cf.settings.designMd.v1";

export type DesignLibrarySlot = {
  id: string;
  /** e.g. DESIGN.md / user filename */
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  /** C-visual-style-deconstructor — companion typed preset (optional for MD-only legacy). */
  presetFile?: DesignPresetFile;
  /** Optional mirror of presetFile.preset / presetFile.id */
  presetId?: string;
  /** Optional shorthand / Tuner cache — prefer presetFile.colors. */
  colors?: DesignPresetFile["colors"];
  /** Optional Tuner overrides — prefer presetFile.cssVarOverrides. */
  cssVarOverrides?: Partial<Record<string, string>>;
};

/** Pure resolve input — server or client snapshot. */
export type ActiveDesignResolveInput = {
  library: DesignLibrarySlot[];
  activeId: string | null | undefined;
  /** Optional filesystem / docs fallback when library empty. */
  fallbackMarkdown?: string | null;
  fallbackName?: string;
};

export type ActiveDesignResolveResult = {
  markdown: string;
  slot: DesignLibrarySlot | null;
  activeId: string | null;
  source: "library" | "fallback" | "empty";
  /** Resolved typed preset when present on the active slot. */
  presetFile?: DesignPresetFile | null;
};

/** Razbor / Settings CTA — image → MD+HTML response (Architect). */
export type DesignFromImageResponse = {
  markdown: string;
  html?: string;
  source: "live" | "mock";
  /** Optional slot name hint for Embla chip. */
  name?: string;
  /** C-visual-style-deconstructor — typed companion when deconstruct path used. */
  presetFile?: DesignPresetFile;
};

export function createDesignSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `design-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Resolve **active** DESIGN.md markdown for Designer agent-start / draw.
 * Prefers library slot by activeId; else first slot; else fallback; never silent orphan default when a slot is selected.
 */
export function resolveActiveDesignMarkdown(
  input: ActiveDesignResolveInput,
): ActiveDesignResolveResult {
  const library = Array.isArray(input.library) ? input.library : [];
  const activeId =
    typeof input.activeId === "string" && input.activeId.trim()
      ? input.activeId.trim()
      : null;

  if (library.length > 0) {
    const byId = activeId
      ? library.find((s) => s.id === activeId)
      : undefined;
    const slot = byId ?? library[0] ?? null;
    if (slot && slot.markdown.trim()) {
      return {
        markdown: slot.markdown.trim(),
        slot,
        activeId: slot.id,
        source: "library",
        presetFile: resolveSlotPresetFile(slot),
      };
    }
  }

  const fb = input.fallbackMarkdown?.trim();
  if (fb) {
    return {
      markdown: fb,
      slot: null,
      activeId: null,
      source: "fallback",
      presetFile: null,
    };
  }

  return {
    markdown: "",
    slot: null,
    activeId: null,
    source: "empty",
    presetFile: null,
  };
}

/**
 * Resolve DesignPresetFile from a library slot (presetFile preferred;
 * else rebuild from colors/cssVarOverrides + markdown).
 */
export function resolveSlotPresetFile(
  slot: DesignLibrarySlot | null | undefined,
): DesignPresetFile | null {
  if (!slot) return null;
  if (slot.presetFile) {
    return {
      ...slot.presetFile,
      designMd: slot.presetFile.designMd || slot.markdown,
      colors: slot.colors ?? slot.presetFile.colors,
      cssVarOverrides:
        slot.cssVarOverrides ?? slot.presetFile.cssVarOverrides,
    };
  }
  if (!slot.colors && !slot.presetId) return null;
  const fromMd = parseDesignPresetFile({
    id: slot.id,
    preset: slot.presetId ?? "dark_editorial",
    name: slot.name,
    designMd: slot.markdown,
    colors: slot.colors ?? {
      bg: "#111317",
      surface: "#1e2023",
      text: "#e2e2e6",
      muted: "#a48c81",
      accent: "#C25E28",
    },
    typography: {
      display: "Manrope, system-ui, sans-serif",
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: "Noto Sans Armenian, Manrope, sans-serif",
    },
    components: {},
    cssVarOverrides: slot.cssVarOverrides,
    version: 1,
  });
  return fromMd;
}

/**
 * Format active design tokens for Designer system / agent-start (not live user turns).
 * S52 D-tok-5: tokens JSON only — no COVER/BODY/CTA markup, no layout grid builder.
 */
export function formatActiveDesignMdForPrompt(
  resolved: ActiveDesignResolveResult,
): string {
  if (!resolved.markdown.trim() && !resolved.presetFile) {
    return [
      "## Active design — TOKENS ONLY (C-design-tokens-only)",
      "",
      "(нет активного пресета — Vernatun dark-luxury defaults: cognac/sun-gold, safe-zone 1080×1350)",
      "Бери только colors / typography / textBlock / smallElement. Layout free — invent composition.",
    ].join("\n");
  }

  const name =
    resolved.slot?.name?.trim() ||
    (resolved.source === "fallback" ? "docs/DESIGN.md" : "DESIGN.md");

  const lines = [
    "## Active design — FULL DESIGN TOKENS (S52 + design-inject-logo-br)",
    "",
    `Источник: **${name}** (activeId=${resolved.activeId ?? "fallback"})`,
    "Бери **roles** (family+sizePx+color per title/body/content/slideNumber/brandName/cta) · colors · typography.scale · paletteMood.",
    "Layout free — invent composition; do NOT wait for COVER/BODY/CTA kits or button markup from Settings.",
    "Не подменяй палитру Inter/stock purple. Positive scale only — do not invent parallel type sizes.",
  ];

  const preset =
    resolved.presetFile ?? resolveSlotPresetFile(resolved.slot);
  if (preset) {
    const payload = buildDesignTokensPayload(preset);
    lines.push(
      "",
      `### Active DesignPresetFile (FULL role table)`,
      `- preset: \`${preset.preset}\` · id: \`${preset.id}\``,
      `- Inject \`--cf-design-*\` from colors + cssVarOverrides before paint`,
      `- Product preview = N×4:5 sliced frames (Create/feed) — Settings prefs are tokens only`,
      `- typography.scale present: ${preset.typography.scale ? "yes" : "fallback defaults in roles"}`,
      "",
      "```json",
      JSON.stringify(payload, null, 2),
      "```",
    );
  }

  // Color + type notes only — strip role-kit / layout markup lines
  const md = resolved.markdown.trim();
  const tokenish = md
    .split("\n")
    .filter((line) => {
      if (
        /\b(cover|body_slide|cta_slide|role\s*kit|layout\s*grid|buttonCta|Primary\/Ghost)\b/i.test(
          line,
        )
      ) {
        return false;
      }
      return /color|palette|#[0-9a-fA-F]{3,8}|--cf-design|typography|font|type|accent|bg|surface|text\s*block|chip|label|cognac|gold/i.test(
        line,
      );
    })
    .slice(0, 40)
    .join("\n");
  if (tokenish) {
    lines.push(
      "",
      "### Token notes from DESIGN.md",
      "```markdown",
      tokenish,
      "```",
    );
  }
  return lines.join("\n");
}

/**
 * S52 D-tok-3 — dedupe library by id + normalized name (+ Coffee Doctrine / HY twin aliases).
 * Keeps active slot when colliding; else prefers seed ids / oldest createdAt.
 */
export function dedupeDesignLibrarySlots(
  slots: DesignLibrarySlot[],
  preferActiveId?: string | null,
): { slots: DesignLibrarySlot[]; changed: boolean; activeId: string | null } {
  if (!Array.isArray(slots) || slots.length === 0) {
    return { slots: [], changed: false, activeId: preferActiveId ?? null };
  }

  const byId = new Map<string, DesignLibrarySlot>();
  for (const s of slots) {
    if (!s?.id) continue;
    if (!byId.has(s.id)) byId.set(s.id, s);
  }
  const uniqueById = [...byId.values()];

  const groups = new Map<string, DesignLibrarySlot[]>();
  for (const s of uniqueById) {
    const key = designSlotDedupeKey(s);
    const list = groups.get(key) ?? [];
    list.push(s);
    groups.set(key, list);
  }

  const out: DesignLibrarySlot[] = [];
  let changed = uniqueById.length !== slots.length;

  for (const group of groups.values()) {
    if (group.length === 1) {
      out.push(group[0]!);
      continue;
    }
    changed = true;
    const preferred =
      (preferActiveId
        ? group.find((s) => s.id === preferActiveId)
        : undefined) ??
      group.find((s) => s.id === "seed-dark-notes" || s.id === "seed-bento-glass") ??
      [...group].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]!;
    out.push(preferred);
  }

  out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const capped = out.slice(0, DESIGN_LIBRARY_MAX);
  if (capped.length !== out.length) changed = true;

  let activeId = preferActiveId ?? null;
  if (activeId && !capped.some((s) => s.id === activeId)) {
    activeId = capped[0]?.id ?? null;
    changed = true;
  }

  return { slots: capped, changed, activeId };
}

/** Normalize name for Doctrine / HY twins → one family key. */
function designSlotDedupeKey(slot: DesignLibrarySlot): string {
  const raw = (slot.name || "").trim().toLowerCase();
  const folded = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
  const preset =
    slot.presetId ||
    slot.presetFile?.preset ||
    "";

  // Coffee Doctrine latin + Armenian HY twin aliases → one family
  if (
    /coffee\s*doctrine/.test(folded) ||
    /սուրջի\s*դոկտրինա/.test(raw)
  ) {
    return `family:coffee-doctrine:${preset || "dark_notes"}`;
  }

  if (folded) return `name:${folded}`;
  return `id:${slot.id}`;
}

function parseLibraryRaw(raw: string | null): DesignLibrarySlot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: DesignLibrarySlot[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : "";
      const name = typeof o.name === "string" ? o.name : "DESIGN.md";
      const markdown = typeof o.markdown === "string" ? o.markdown : "";
      if (!id || !markdown.trim()) continue;
      const presetFile = parseDesignPresetFile(o.presetFile);
      const presetId =
        typeof o.presetId === "string" && o.presetId.trim()
          ? o.presetId.trim()
          : presetFile?.preset;
      const colors =
        o.colors && typeof o.colors === "object"
          ? (o.colors as DesignPresetFile["colors"])
          : presetFile?.colors;
      let cssVarOverrides: DesignLibrarySlot["cssVarOverrides"];
      if (
        o.cssVarOverrides &&
        typeof o.cssVarOverrides === "object" &&
        !Array.isArray(o.cssVarOverrides)
      ) {
        const ov: Record<string, string> = {};
        for (const [k, v] of Object.entries(
          o.cssVarOverrides as Record<string, unknown>,
        )) {
          if (typeof v === "string" && v.trim()) ov[k] = v.trim();
        }
        if (Object.keys(ov).length) cssVarOverrides = ov;
      } else if (presetFile?.cssVarOverrides) {
        cssVarOverrides = presetFile.cssVarOverrides;
      }
      out.push({
        id,
        name: name.trim() || "DESIGN.md",
        markdown,
        html: typeof o.html === "string" ? o.html : undefined,
        previewUrl:
          typeof o.previewUrl === "string" ? o.previewUrl : undefined,
        createdAt:
          typeof o.createdAt === "string"
            ? o.createdAt
            : new Date().toISOString(),
        presetFile: presetFile ?? undefined,
        presetId,
        colors,
        cssVarOverrides,
      });
    }
    return out.slice(0, DESIGN_LIBRARY_MAX);
  } catch {
    return [];
  }
}

/** In-memory SoT cache (API is source of truth after hydrate). */
let memoryLibrary: DesignLibrarySlot[] | null = null;
let memoryActiveId: string | null | undefined = undefined;
let designHydratedFromApi = false;
let designHydratePromise: Promise<void> | null = null;

function readLibraryCacheFromLocalStorage(): DesignLibrarySlot[] {
  if (typeof window === "undefined") return [];
  return parseLibraryRaw(
    window.localStorage.getItem(DESIGN_LIBRARY_STORAGE_KEY),
  );
}

function writeLibraryCacheToLocalStorage(slots: DesignLibrarySlot[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DESIGN_LIBRARY_STORAGE_KEY,
      JSON.stringify(slots.slice(0, DESIGN_LIBRARY_MAX)),
    );
  } catch {
    /* quota */
  }
}

function readActiveCacheFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DESIGN_ACTIVE_ID_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

function writeActiveCacheToLocalStorage(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!id) {
      window.localStorage.removeItem(DESIGN_ACTIVE_ID_KEY);
      return;
    }
    window.localStorage.setItem(DESIGN_ACTIVE_ID_KEY, id);
  } catch {
    /* quota */
  }
}

function setMemoryLibrary(slots: DesignLibrarySlot[]): void {
  memoryLibrary = slots.slice(0, DESIGN_LIBRARY_MAX);
  writeLibraryCacheToLocalStorage(memoryLibrary);
}

function setMemoryActiveId(id: string | null): void {
  memoryActiveId = id;
  writeActiveCacheToLocalStorage(id);
}

function normalizeApiSlot(raw: {
  id: string;
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: string;
}): DesignLibrarySlot {
  const presetFile = parseDesignPresetFile(raw.presetFile);
  return {
    id: raw.id,
    name: raw.name || "DESIGN.md",
    markdown: raw.markdown || "",
    html: raw.html,
    previewUrl: raw.previewUrl,
    createdAt: raw.createdAt || new Date().toISOString(),
    presetFile: presetFile ?? undefined,
    presetId:
      typeof raw.presetId === "string"
        ? raw.presetId
        : presetFile?.preset,
    colors:
      raw.colors && typeof raw.colors === "object"
        ? (raw.colors as DesignPresetFile["colors"])
        : presetFile?.colors,
    cssVarOverrides:
      raw.cssVarOverrides && typeof raw.cssVarOverrides === "object"
        ? (raw.cssVarOverrides as DesignLibrarySlot["cssVarOverrides"])
        : presetFile?.cssVarOverrides,
  };
}

/** Load design library + activeId from API (after one-shot migrate). */
export async function hydrateDesignLibraryFromApi(): Promise<void> {
  if (typeof window === "undefined") return;
  if (designHydratePromise) return designHydratePromise;
  designHydratePromise = (async () => {
    await ensureSprint8Migrated();
    migrateLegacyDesignOverrideToLibrary();
    const listed = await apiListDesignSlots();
    if (!listed) {
      if (!memoryLibrary) {
        memoryLibrary = readLibraryCacheFromLocalStorage();
      }
      if (memoryActiveId === undefined) {
        memoryActiveId = readActiveCacheFromLocalStorage();
      }
      designHydratedFromApi = true;
      return;
    }
    if (listed.slots.length > 0) {
      setMemoryLibrary(listed.slots.map(normalizeApiSlot));
      setMemoryActiveId(listed.activeId);
    } else {
      // Keep session/cache seeds if API still empty (race with seedFactoryDesignPresets).
      const local =
        memoryLibrary && memoryLibrary.length > 0
          ? memoryLibrary
          : readLibraryCacheFromLocalStorage();
      if (local.length > 0) {
        setMemoryLibrary(local);
        for (const slot of local) {
          await apiUpsertDesignSlot(slot);
        }
        const active =
          memoryActiveId ??
          readActiveCacheFromLocalStorage() ??
          local[0]?.id ??
          null;
        if (active) {
          setMemoryActiveId(active);
          await apiActivateDesignSlot(active);
        }
      } else if (listed.activeId) {
        setMemoryActiveId(listed.activeId);
      }
    }
    designHydratedFromApi = true;
    emitSprint8Hydrated("design");
  })().finally(() => {
    designHydratePromise = null;
  });
  return designHydratePromise;
}

/**
 * D-sd-9: if library empty and legacy `designMd` override exists → seed one slot + activeId.
 * Runs against cache; API sync happens via writeDesignLibrary / writeActiveDesignId.
 */
export function migrateLegacyDesignOverrideToLibrary(): DesignLibrarySlot[] {
  if (typeof window === "undefined") return [];
  try {
    const existing =
      memoryLibrary ?? readLibraryCacheFromLocalStorage();
    if (existing.length > 0) {
      memoryLibrary = existing;
      return existing;
    }

    const legacy = readDesignMdOverride();
    if (!legacy?.trim()) return [];

    const slot: DesignLibrarySlot = {
      id: createDesignSlotId(),
      name: "DESIGN.md",
      markdown: legacy.trim(),
      createdAt: new Date().toISOString(),
    };
    writeDesignLibrary([slot]);
    writeActiveDesignId(slot.id);
    return [slot];
  } catch {
    return [];
  }
}

export function readDesignLibrary(): DesignLibrarySlot[] {
  if (typeof window === "undefined") return [];
  try {
    if (!memoryLibrary) {
      migrateLegacyDesignOverrideToLibrary();
      memoryLibrary = readLibraryCacheFromLocalStorage();
    }
    if (!designHydratedFromApi) {
      void hydrateDesignLibraryFromApi();
    }
    return memoryLibrary ?? [];
  } catch {
    return [];
  }
}

export function writeDesignLibrary(slots: DesignLibrarySlot[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    const prev = memoryLibrary ?? readLibraryCacheFromLocalStorage();
    const { slots: deduped } = dedupeDesignLibrarySlots(
      slots,
      memoryActiveId ?? readActiveCacheFromLocalStorage(),
    );
    const capped = deduped.slice(0, DESIGN_LIBRARY_MAX);
    setMemoryLibrary(capped);

    const nextIds = new Set(capped.map((s) => s.id));
    void (async () => {
      await ensureSprint8Migrated();
      for (const slot of capped) {
        await apiUpsertDesignSlot(slot);
      }
      for (const old of prev) {
        if (!nextIds.has(old.id)) {
          await apiDeleteDesignSlot(old.id);
        }
      }
    })();
    return true;
  } catch {
    return false;
  }
}

export function readActiveDesignId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (memoryActiveId === undefined) {
      memoryActiveId = readActiveCacheFromLocalStorage();
    }
    if (!designHydratedFromApi) {
      void hydrateDesignLibraryFromApi();
    }
    return memoryActiveId ?? null;
  } catch {
    return null;
  }
}

export function writeActiveDesignId(id: string | null): void {
  if (typeof window === "undefined") return;
  setMemoryActiveId(id);
  if (!id) return;
  void (async () => {
    await ensureSprint8Migrated();
    await apiActivateDesignSlot(id);
  })();
}

if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void hydrateDesignLibraryFromApi();
  });
}

/**
 * Client helper: active markdown for Designer draw / agent-start.
 * Prefer library; fallback to legacy override (then migrate).
 */
export function readActiveDesignMarkdownClient(): ActiveDesignResolveResult {
  if (typeof window === "undefined") {
    return {
      markdown: "",
      slot: null,
      activeId: null,
      source: "empty",
      presetFile: null,
    };
  }
  const library = readDesignLibrary();
  const activeId = readActiveDesignId();
  const legacy = readDesignMdOverride();
  return resolveActiveDesignMarkdown({
    library,
    activeId,
    fallbackMarkdown: legacy,
    fallbackName: "DESIGN.md (legacy override)",
  });
}

/**
 * Append slot (block at max 10). Returns null if full.
 * Sets activeId to the new slot.
 */
export function appendDesignLibrarySlot(
  partial: Omit<DesignLibrarySlot, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): DesignLibrarySlot | null {
  const library = readDesignLibrary();
  if (library.length >= DESIGN_LIBRARY_MAX) return null;

  const slot: DesignLibrarySlot = {
    id: partial.id ?? createDesignSlotId(),
    name: partial.name.trim() || "DESIGN.md",
    markdown: partial.markdown,
    html: partial.html,
    previewUrl: partial.previewUrl,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    presetFile: partial.presetFile,
    presetId: partial.presetId ?? partial.presetFile?.preset,
    colors: partial.colors ?? partial.presetFile?.colors,
    cssVarOverrides:
      partial.cssVarOverrides ?? partial.presetFile?.cssVarOverrides,
  };
  setMemoryLibrary([...library, slot]);
  writeActiveDesignId(slot.id);
  void (async () => {
    await ensureSprint8Migrated();
    await apiUpsertDesignSlot(slot, true);
  })();
  return slot;
}

/**
 * Append slot with FIFO eviction when library is full (Settings CTA
 * «Добавить новый дизайн»). Always sets activeId to the new slot.
 */
export function appendDesignLibrarySlotFifo(
  partial: Omit<DesignLibrarySlot, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): DesignLibrarySlot {
  const prev = readDesignLibrary();
  let library = prev;
  if (library.length >= DESIGN_LIBRARY_MAX) {
    library = library.slice(library.length - (DESIGN_LIBRARY_MAX - 1));
  }

  const slot: DesignLibrarySlot = {
    id: partial.id ?? createDesignSlotId(),
    name: partial.name.trim() || "DESIGN.md",
    markdown: partial.markdown,
    html: partial.html,
    previewUrl: partial.previewUrl,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    presetFile: partial.presetFile,
    presetId: partial.presetId ?? partial.presetFile?.preset,
    colors: partial.colors ?? partial.presetFile?.colors,
    cssVarOverrides:
      partial.cssVarOverrides ?? partial.presetFile?.cssVarOverrides,
  };
  const next = [...library, slot];
  const nextIds = new Set(next.map((s) => s.id));
  setMemoryLibrary(next);
  writeActiveDesignId(slot.id);
  void (async () => {
    await ensureSprint8Migrated();
    for (const old of prev) {
      if (!nextIds.has(old.id)) {
        await apiDeleteDesignSlot(old.id);
      }
    }
    await apiUpsertDesignSlot(slot, true);
  })();
  return slot;
}

/**
 * Seed golden dark_notes + bento_glass when library empty.
 * Idempotent — does not overwrite existing customized slots with same ids.
 */
export function seedFactoryDesignPresets(): DesignLibrarySlot[] {
  const existing = readDesignLibrary();
  if (existing.length > 0) return existing;

  const dark = createDarkNotesSeedPreset();
  const bento = createBentoGlassSeedPreset();
  const slots: DesignLibrarySlot[] = [
    {
      id: dark.id,
      name: dark.name,
      markdown: dark.designMd,
      createdAt: new Date().toISOString(),
      presetFile: dark,
      presetId: dark.preset,
      colors: dark.colors,
      cssVarOverrides: dark.cssVarOverrides,
    },
    {
      id: bento.id,
      name: bento.name,
      markdown: bento.designMd,
      createdAt: new Date().toISOString(),
      presetFile: bento,
      presetId: bento.preset,
      colors: bento.colors,
      cssVarOverrides: bento.cssVarOverrides,
    },
  ];
  writeDesignLibrary(slots);
  writeActiveDesignId(dark.id);
  return slots;
}

/** True after first successful/soft API hydrate (for tests / callers). */
export function isDesignLibraryHydratedFromApi(): boolean {
  return designHydratedFromApi;
}

/**
 * Seed library from docs/DESIGN.md (or any fallback MD) when empty after
 * legacy migrate. Idempotent — no-op if library already has slots.
 */
export function seedDesignLibraryFromMarkdown(
  markdown: string,
  name = "DESIGN.md",
): DesignLibrarySlot[] {
  const existing = readDesignLibrary();
  if (existing.length > 0) return existing;
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const slot = appendDesignLibrarySlot({
    name: name.trim() || "DESIGN.md",
    markdown: trimmed,
  });
  if (!slot) return [];
  clearLegacyDesignOverrideAfterMigrate();
  return [slot];
}

/** Client POST helper — sync active slot MD + preset to server for draw / Brand Kit. */
export async function syncActiveDesignToServer(opts?: {
  markdown?: string;
  name?: string;
  presetFile?: DesignPresetFile | null;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const resolved = readActiveDesignMarkdownClient();
  const markdown = (opts?.markdown ?? resolved.markdown).trim();
  const name =
    opts?.name ?? resolved.slot?.name ?? "DESIGN.md";
  const presetFile =
    opts?.presetFile !== undefined
      ? opts.presetFile
      : resolved.slot?.presetFile ?? null;
  if (!markdown) return false;
  try {
    const res = await fetch("/api/settings/design-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdown,
        name,
        ...(presetFile ? { presetFile } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Resolve active DesignPresetFile from library snapshot (server or client).
 */
export function resolveActiveDesignPreset(
  input: ActiveDesignResolveInput,
): DesignPresetFile | null {
  const resolved = resolveActiveDesignMarkdown(input);
  return (
    resolved.presetFile ??
    resolveSlotPresetFile(resolved.slot) ??
    null
  );
}

/** Clear legacy override after successful library migrate (optional FE call). */
export function clearLegacyDesignOverrideAfterMigrate(): void {
  clearDesignMdOverride();
}

/**
 * Patch an existing library slot (Tuner / rename). Returns null if id missing.
 * Merges `cssVarOverrides` + `colors` into `presetFile` when present.
 */
export function updateDesignLibrarySlot(
  id: string,
  patch: Partial<Omit<DesignLibrarySlot, "id" | "createdAt">>,
): DesignLibrarySlot | null {
  const library = readDesignLibrary();
  const idx = library.findIndex((s) => s.id === id);
  if (idx < 0) return null;

  const prev = library[idx]!;
  const next: DesignLibrarySlot = {
    ...prev,
    ...patch,
    id: prev.id,
    createdAt: prev.createdAt,
  };

  const basePreset = resolveSlotPresetFile({
    ...next,
    presetFile: patch.presetFile ?? prev.presetFile,
    colors: patch.colors ?? next.colors ?? prev.colors,
    cssVarOverrides:
      patch.cssVarOverrides ?? next.cssVarOverrides ?? prev.cssVarOverrides,
  });

  if (basePreset) {
    const mergedOverrides: Record<string, string> = {};
    for (const src of [
      basePreset.cssVarOverrides,
      patch.cssVarOverrides,
    ]) {
      if (!src) continue;
      for (const [k, v] of Object.entries(src)) {
        if (typeof v === "string" && v.trim()) mergedOverrides[k] = v.trim();
      }
    }
    next.presetFile = {
      ...basePreset,
      designMd: next.markdown || basePreset.designMd,
      colors: patch.colors ?? next.colors ?? basePreset.colors,
      cssVarOverrides:
        Object.keys(mergedOverrides).length > 0 ? mergedOverrides : undefined,
    };
    next.colors = next.presetFile.colors;
    next.cssVarOverrides = next.presetFile.cssVarOverrides;
    next.presetId = next.presetFile.preset;
  }

  const updated = [...library];
  updated[idx] = next;
  setMemoryLibrary(updated);
  void (async () => {
    await ensureSprint8Migrated();
    await apiPatchDesignSlot(id, {
      name: next.name,
      markdown: next.markdown,
      html: next.html,
      previewUrl: next.previewUrl,
      presetFile: next.presetFile,
      colors: next.colors,
      cssVarOverrides: next.cssVarOverrides,
      presetId: next.presetId,
    });
  })();
  return next;
}

/** Map CSS var key → ColorTokens field. */
const CSS_VAR_TO_COLOR: Record<string, keyof DesignPresetFile["colors"]> = {
  "--cf-design-bg": "bg",
  "--cf-design-surface": "surface",
  "--cf-design-text": "text",
  "--cf-design-muted": "muted",
  "--cf-design-accent": "accent",
  "--cf-design-accent-soft": "accentSoft",
};

/**
 * Quick Theme Tuner: write live `--cf-design-*` overrides onto slot + presetFile.
 */
export function applySlotCssVarOverrides(
  slotId: string,
  overrides: Partial<Record<string, string>>,
): DesignLibrarySlot | null {
  const library = readDesignLibrary();
  const slot = library.find((s) => s.id === slotId);
  if (!slot) return null;

  const merged: Record<string, string> = {};
  for (const src of [
    slot.presetFile?.cssVarOverrides,
    slot.cssVarOverrides,
    overrides,
  ]) {
    if (!src) continue;
    for (const [k, v] of Object.entries(src)) {
      if (typeof v !== "string" || !v.trim()) continue;
      const key = k.startsWith("--") ? k : `--cf-design-${k}`;
      merged[key] = v.trim();
    }
  }

  const baseColors =
    slot.colors ??
    slot.presetFile?.colors ??
    ({
      bg: "#111317",
      surface: "#1e2023",
      text: "#e2e2e6",
      muted: "#a48c81",
      accent: "#C25E28",
    } satisfies DesignPresetFile["colors"]);

  const colors: DesignPresetFile["colors"] = { ...baseColors };
  for (const [varName, field] of Object.entries(CSS_VAR_TO_COLOR)) {
    const val = merged[varName];
    if (val) {
      if (field === "accentSoft") {
        colors.accentSoft = val;
      } else if (field !== "danger" && field !== "success") {
        colors[field] = val;
      }
    }
  }

  return updateDesignLibrarySlot(slotId, {
    cssVarOverrides: merged,
    colors,
  });
}
