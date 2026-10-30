/**
 * Vision style-copy — slice 4-frame etalon grids → cover · midA · midB · cta
 * and map slide N → reference slot (wave 2026-10-18-vision-style-copy).
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

export type StyleCopySlotId = "cover" | "midA" | "midB" | "cta";

export type StyleCopyPackId =
  | "re_orange_01"
  | "luma_02"
  | "omkopa_03"
  | "higven_01"
  | "sua_02"
  | string;

export type StyleCopyImageRef =
  | { kind: "path"; path: string }
  | { kind: "url"; url: string }
  | {
      kind: "base64";
      mime: "image/png" | "image/jpeg";
      data: string;
    };

export type StyleCopySlotPack = {
  cover: StyleCopyImageRef;
  midA: StyleCopyImageRef;
  midB: StyleCopyImageRef;
  cta: StyleCopyImageRef;
};

/** SoT etalon folder (layout-copy / vision-style-copy packs). */
export const STYLE_COPY_ETALON_DIR = path.join(
  process.cwd(),
  "generatedMedia",
  "эталон карусели",
  "layout-copy-refs-2026-10-18",
);

/** HIGVEN-3 practice etalon folder. */
export const HIGVEN_STYLE_COPY_ETALON_DIR = path.join(
  process.cwd(),
  "generatedMedia",
  "эталон карусели",
  "pipeline-practice-2026-10-18",
);

export const STYLE_COPY_PACK_FILES: Record<string, string> = {
  re_orange_01: "01-real-estate-orange-grid.png",
  luma_02: "02-luma-coffee-grid.jpg",
  omkopa_03: "03-omkopa-teal-character-grid.png",
  higven_01: "01-higven-heavy-lifting-grid.png",
  sua_02: "02-sua-logo-moto-grid.png",
};

const HIGVEN_PACK_IDS = new Set(["higven_01", "sua_02"]);

/** Smoke / product default pack = 01 RE orange grid (HIGVEN smoke overrides). */
export const DEFAULT_STYLE_COPY_PACK_ID: StyleCopyPackId = "re_orange_01";

/**
 * Map 1-based slide index → etalon slot for N-slide carousel.
 * N=6: 1→cover, 2→midA, 3→midB, 4→midA, 5→midB, 6→cta
 */
export function mapSlideToRefSlot(
  slideIndex1Based: number,
  N: number,
): StyleCopySlotId {
  const n = Math.max(1, Math.floor(N));
  const i = Math.max(1, Math.floor(slideIndex1Based));
  if (i <= 1) return "cover";
  if (i >= n) return "cta";
  const bodyOrdinal = i - 2; // 0-based among body slides
  return bodyOrdinal % 2 === 0 ? "midA" : "midB";
}

export function resolveStyleCopyPackGridPath(opts?: {
  packId?: StyleCopyPackId | null;
  packPath?: string | null;
}): string {
  const explicit = opts?.packPath?.trim();
  if (explicit) {
    return path.isAbsolute(explicit)
      ? explicit
      : path.join(process.cwd(), explicit);
  }
  const id = (opts?.packId?.trim() || DEFAULT_STYLE_COPY_PACK_ID) as string;
  const file = STYLE_COPY_PACK_FILES[id] ?? STYLE_COPY_PACK_FILES.re_orange_01!;
  const dir = HIGVEN_PACK_IDS.has(id)
    ? HIGVEN_STYLE_COPY_ETALON_DIR
    : STYLE_COPY_ETALON_DIR;
  return path.join(dir, file);
}

function cacheDirForGrid(gridPath: string): string {
  const abs = path.isAbsolute(gridPath)
    ? gridPath
    : path.join(process.cwd(), gridPath);
  const base = path.basename(abs, path.extname(abs));
  // Cache beside the grid's folder (works for layout-copy + HIGVEN dirs)
  return path.join(path.dirname(abs), "_slots", base);
}

/**
 * Slice a 2×2 etalon grid into four 4:5-ish crops (equal quadrants).
 * HIGVEN 4×2 grids: extract 4 cells (cover=0,0 · midA=1,0 · midB=0,1 · cta=3,1).
 * Cache under `…/_slots/<grid-base>/`.
 */
export async function sliceStyleCopyPackFromGrid(
  gridPath: string,
  opts?: { cols?: number; rows?: number; packId?: string | null },
): Promise<StyleCopySlotPack> {
  const abs = path.isAbsolute(gridPath)
    ? gridPath
    : path.join(process.cwd(), gridPath);
  if (!existsSync(abs)) {
    throw new Error(`style_copy_grid_missing: ${abs}`);
  }

  const base = path.basename(abs).toLowerCase();
  const isHigvenGrid =
    HIGVEN_PACK_IDS.has((opts?.packId ?? "").trim()) ||
    base.includes("higven") ||
    base.includes("sua-logo");
  const cols = opts?.cols ?? (isHigvenGrid ? 4 : 2);
  const rows = opts?.rows ?? (isHigvenGrid ? 2 : 2);

  const outDir = cacheDirForGrid(abs);
  await mkdir(outDir, { recursive: true });

  const slots: StyleCopySlotId[] = ["cover", "midA", "midB", "cta"];
  const cached = slots.every((s) =>
    existsSync(path.join(outDir, `${s}.png`)),
  );
  if (cached) {
    return {
      cover: { kind: "path", path: path.join(outDir, "cover.png") },
      midA: { kind: "path", path: path.join(outDir, "midA.png") },
      midB: { kind: "path", path: path.join(outDir, "midB.png") },
      cta: { kind: "path", path: path.join(outDir, "cta.png") },
    };
  }

  const meta = await sharp(abs).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (W < 8 || H < 8) {
    throw new Error(`style_copy_grid_bad_dims: ${W}x${H}`);
  }

  let regions: Record<
    StyleCopySlotId,
    { left: number; top: number; width: number; height: number }
  >;
  let note: string;

  if (cols === 4 && rows === 2) {
    // 4×2 panel sheet → pick representative cells for N=3 (cover/midA/cta)
    const cellW = Math.floor(W / 4);
    const cellH = Math.floor(H / 2);
    const cell = (col: number, row: number) => ({
      left: col * cellW,
      top: row * cellH,
      width: col === 3 ? W - 3 * cellW : cellW,
      height: row === 1 ? H - cellH : cellH,
    });
    regions = {
      cover: cell(0, 0),
      midA: cell(1, 0),
      midB: cell(0, 1),
      cta: cell(3, 1),
    };
    note =
      "4x2 cell extract: cover(0,0) midA(1,0) midB(0,1) cta(3,1); N=3 uses cover·midA·cta";
  } else {
    const halfW = Math.floor(W / 2);
    const halfH = Math.floor(H / 2);
    regions = {
      cover: { left: 0, top: 0, width: halfW, height: halfH },
      midA: { left: halfW, top: 0, width: W - halfW, height: halfH },
      midB: { left: 0, top: halfH, width: halfW, height: H - halfH },
      cta: {
        left: halfW,
        top: halfH,
        width: W - halfW,
        height: H - halfH,
      },
    };
    note = "2x2 equal quadrant slice; publish-ish crops from etalon grid";
  }

  for (const slot of slots) {
    const r = regions[slot];
    const buf = await sharp(abs).extract(r).png().toBuffer();
    await writeFile(path.join(outDir, `${slot}.png`), buf);
  }

  await writeFile(
    path.join(outDir, "slice-meta.json"),
    JSON.stringify(
      {
        gridPath: abs,
        gridW: W,
        gridH: H,
        cols,
        rows,
        regions,
        slicedAt: new Date().toISOString(),
        note,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    cover: { kind: "path", path: path.join(outDir, "cover.png") },
    midA: { kind: "path", path: path.join(outDir, "midA.png") },
    midB: { kind: "path", path: path.join(outDir, "midB.png") },
    cta: { kind: "path", path: path.join(outDir, "cta.png") },
  };
}

/** Resolve active pack → 4 slot ImageRefs (path preferred). */
export async function resolveStyleCopySlots(opts?: {
  packId?: StyleCopyPackId | null;
  packPath?: string | null;
  slots?: StyleCopySlotPack | null;
}): Promise<{
  packId: string;
  packPath: string;
  slots: StyleCopySlotPack;
}> {
  if (opts?.slots?.cover && opts.slots.midA && opts.slots.midB && opts.slots.cta) {
    const packPath = resolveStyleCopyPackGridPath(opts);
    return {
      packId: (opts.packId?.trim() || DEFAULT_STYLE_COPY_PACK_ID) as string,
      packPath,
      slots: opts.slots,
    };
  }
  const packId = (opts?.packId?.trim() || DEFAULT_STYLE_COPY_PACK_ID) as string;
  const packPath = resolveStyleCopyPackGridPath(opts);
  const slots = await sliceStyleCopyPackFromGrid(packPath, { packId });
  return { packId, packPath, slots };
}

export function slotRefPath(
  slots: StyleCopySlotPack,
  slot: StyleCopySlotId,
): string | undefined {
  const ref = slots[slot];
  if (ref?.kind === "path" && ref.path) return ref.path;
  return undefined;
}

export function slotRefToDrawSignal(
  slots: StyleCopySlotPack,
  slot: StyleCopySlotId,
): {
  kind: "path" | "url" | "base64";
  path?: string;
  url?: string;
  mime?: "image/png" | "image/jpeg";
  base64LengthHint?: number;
  slot: StyleCopySlotId;
} {
  const ref = slots[slot];
  if (ref.kind === "path") {
    return { kind: "path", path: ref.path, slot };
  }
  if (ref.kind === "url") {
    return { kind: "url", url: ref.url, slot };
  }
  return {
    kind: "base64",
    mime: ref.mime,
    base64LengthHint: ref.data?.length,
    slot,
  };
}

/** Absolute paths of all four slots (for Designer multimodal attach). */
export function collectSlotImagePaths(slots: StyleCopySlotPack): string[] {
  const out: string[] = [];
  for (const id of ["cover", "midA", "midB", "cta"] as StyleCopySlotId[]) {
    const p = slotRefPath(slots, id);
    if (p) out.push(p);
  }
  return out;
}
