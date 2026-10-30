/**
 * Strip solid plate (black or beige) from Vernatun lockup → transparent PNG.
 * NEVER punches pixels inside the circular emblem — only outside the circle.
 * Usage: npx tsx scripts/prepare-vernatun-logo-lockup.ts [srcPath]
 */
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

function isNonBackground(r: number, g: number, b: number, a: number): boolean {
  if (a < 12) return false;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (lum <= 22 && sat < 18) return false; // black plate
  if (
    lum >= 185 &&
    lum < 245 &&
    sat < 55 &&
    r >= 180 &&
    g >= 170 &&
    b >= 150
  ) {
    return false; // beige plate
  }
  return true;
}

/**
 * Find circular emblem in the upper portion (widest content row ≈ diameter).
 */
export function findEmblemCircle(
  px: Buffer,
  w: number,
  h: number,
): { cx: number; cy: number; r: number } {
  const yMax = Math.floor(h * 0.58);
  let bestWidth = 0;
  let bestLeft = 0;
  let bestRight = 0;
  let bestY = Math.floor(h * 0.25);

  for (let y = 0; y < yMax; y++) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (
        isNonBackground(px[o]!, px[o + 1]!, px[o + 2]!, px[o + 3]!)
      ) {
        if (left < 0) left = x;
        right = x;
      }
    }
    if (left >= 0 && right - left > bestWidth) {
      bestWidth = right - left;
      bestLeft = left;
      bestRight = right;
      bestY = y;
    }
  }

  const cx = (bestLeft + bestRight) / 2;
  const r = bestWidth / 2 + 4; // include ring + AA fringe
  // cy: topmost content in upper band, then offset by radius
  let topY = bestY;
  for (let y = 0; y < yMax; y++) {
    let hit = false;
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= w) continue;
      const o = (y * w + x) * 4;
      if (isNonBackground(px[o]!, px[o + 1]!, px[o + 2]!, px[o + 3]!)) {
        hit = true;
        break;
      }
    }
    if (hit) {
      topY = y;
      break;
    }
  }
  const cy = topY + r;
  console.log("emblem_circle", {
    cx: Math.round(cx),
    cy: Math.round(cy),
    r: Math.round(r),
    equatorY: bestY,
  });
  return { cx, cy, r };
}

function insideCircle(
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Key out black/beige plate ONLY outside the emblem circle.
 */
async function punchSolidPlateOutsideCircle(input: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const px = Buffer.from(data);
  const { cx, cy, r } = findEmblemCircle(px, w, h);
  let punched = 0;
  let protectedInside = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const a = px[o + 3]!;
      if (a < 12) continue;
      if (insideCircle(x, y, cx, cy, r)) {
        protectedInside++;
        continue; // never punch inside emblem
      }
      const red = px[o]!;
      const g = px[o + 1]!;
      const b = px[o + 2]!;
      const lum = 0.299 * red + 0.587 * g + 0.114 * b;
      const sat = Math.max(red, g, b) - Math.min(red, g, b);
      const isBlackPlate = lum <= 22 && sat < 18;
      const isNearWhiteWordmark = lum >= 240 && sat <= 20;
      const isBeigePlate =
        !isNearWhiteWordmark &&
        lum >= 185 &&
        lum < 245 &&
        sat < 55 &&
        red >= 180 &&
        g >= 170 &&
        b >= 150;
      if (isBlackPlate || isBeigePlate) {
        px[o + 3] = 0;
        punched++;
      }
    }
  }

  console.log("punched_outside_circle", punched, "protected_inside", protectedInside);
  return sharp(px, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();
}

async function main() {
  const defaultSrc = path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/e-Applications-Content-factory/assets",
    "c__Users_karahanyan_a_s_AppData_Roaming_Cursor_User_workspaceStorage_8176f3d1f8dbe02963fbf8102bd25af3_images_________VERNATUN___________________-e4886838-c11e-4439-84d8-994325172b09.png",
  );
  const src = process.argv[2] || defaultSrc;
  const brandOut = path.join(process.cwd(), "brand", "vernatun-logo-lockup.png");
  const publicOut = path.join(
    process.cwd(),
    "public",
    "brand",
    "vernatun-logo-lockup.png",
  );

  const raw = await readFile(src);
  const transparent = await punchSolidPlateOutsideCircle(raw);
  const sharp = (await import("sharp")).default;
  const trimmed = await sharp(transparent)
    .trim({ threshold: 4 })
    .extend({
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await mkdir(path.dirname(brandOut), { recursive: true });
  await writeFile(brandOut, trimmed);
  await mkdir(path.dirname(publicOut), { recursive: true });
  await copyFile(brandOut, publicOut);
  await writeFile(
    path.join(process.cwd(), "brand", "vernatun-logo-lockup-src.png"),
    raw,
  );

  const meta = await sharp(trimmed).metadata();
  console.log("wrote", brandOut);
  console.log("wrote", publicOut);
  console.log("size", meta.width, "x", meta.height, "alpha", meta.hasAlpha);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
