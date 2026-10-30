/**
 * Wave 2026-10-18 layout-copy-dual-char — seed 3 DesignSlots + Landscapes conductor.
 *
 *   npx tsx scripts/seed-layout-copy-dual-char.ts
 *
 * - Upserts presets 01 RE orange · 02 luma · 03 omkopa (each with layoutMap)
 * - Activates 01 (writes design-active.json)
 * - Copies sheet 04 → public/characters/anush-sheet.jpg
 * - Upserts Landscapes «Ануш» #1
 */

import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import {
  activateDesignSlot,
  deleteDesignSlot,
  listDesignSlots,
  upsertDesignSlot,
} from "../lib/db/design-slots-repository";
import {
  LAYOUT_COPY_CONDUCTOR_NAME,
  LAYOUT_COPY_CONDUCTOR_NUMBER,
  LAYOUT_COPY_SEED_PRESETS,
  SEED_RE_ORANGE_ID,
} from "../lib/settings/design-presets/layout-copy-seeds";
import { upsertLandscape } from "../lib/settings/landscapes-store";

const ETALON = path.join(
  process.cwd(),
  "generatedMedia",
  "эталон карусели",
  "layout-copy-refs-2026-10-18",
);
const SHEET_SRC = path.join(ETALON, "04-vernatun-girl-character-sheet.jpg");
const SHEET_PUBLIC_REL = "characters/anush-sheet.jpg";
const SHEET_PUBLIC_ABS = path.join(process.cwd(), "public", SHEET_PUBLIC_REL);

export async function seedLayoutCopyDualChar(userId?: string): Promise<{
  activeId: string | null;
  conductorNumber: number;
}> {
  const uid = userId?.trim() || process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
  // eslint-disable-next-line no-console -- seed
  console.log("[seed-layout-copy-dual-char] userId=", uid);

  await mkdir(path.dirname(SHEET_PUBLIC_ABS), { recursive: true });
  await copyFile(SHEET_SRC, SHEET_PUBLIC_ABS);
  const photoUrl = `/${SHEET_PUBLIC_REL}`;

  // Free slots: remove prior smoke fillers + previous layout-copy seeds (≤10 cap)
  const { slots } = await listDesignSlots(uid);
  for (const s of slots) {
    const id = s.id;
    if (
      id.startsWith("smoke_design_") ||
      id.startsWith("seed-layout-") ||
      id === "design-active-user_seed_admin_c16"
    ) {
      await deleteDesignSlot({ userId: uid, id });
      // eslint-disable-next-line no-console -- seed
      console.log("[seed] freed slot", id);
    }
  }

  for (let i = 0; i < LAYOUT_COPY_SEED_PRESETS.length; i++) {
    const preset = LAYOUT_COPY_SEED_PRESETS[i]!;
    const slot = await upsertDesignSlot(uid, {
      id: preset.id,
      name: preset.name,
      label: preset.name,
      markdown: preset.designMd,
      previewUrl: preset.referenceImageUrl
        ? `/${preset.referenceImageUrl.replace(/\\/g, "/")}`
        : undefined,
      presetFile: preset,
      colors: preset.colors,
      cssVarOverrides: preset.cssVarOverrides,
      presetId: preset.preset,
      sortOrder: i,
      isActive: preset.id === SEED_RE_ORANGE_ID,
    });
    // eslint-disable-next-line no-console -- seed
    console.log("[seed] design slot", {
      id: slot.id,
      name: slot.name,
      hasLayoutMap: Boolean(
        (slot.presetFile as { layoutMap?: unknown } | undefined)?.layoutMap,
      ),
      isActive: slot.isActive,
    });
  }

  const active = await activateDesignSlot({
    userId: uid,
    id: SEED_RE_ORANGE_ID,
  });
  // eslint-disable-next-line no-console -- seed
  console.log("[seed] active design", active?.id, active?.name);

  const character = await upsertLandscape(uid, {
    number: LAYOUT_COPY_CONDUCTOR_NUMBER,
    name: LAYOUT_COPY_CONDUCTOR_NAME,
    photoUrls: [photoUrl],
  });
  // eslint-disable-next-line no-console -- seed
  console.log("[seed] landscapes", {
    number: character.number,
    name: character.name,
    photoUrls: character.photoUrls,
  });

  // eslint-disable-next-line no-console -- seed
  console.log("[seed-layout-copy-dual-char] DONE");
  return {
    activeId: active?.id ?? null,
    conductorNumber: character.number,
  };
}

const isDirect =
  typeof process.argv[1] === "string" &&
  process.argv[1].replace(/\\/g, "/").includes("seed-layout-copy-dual-char");

if (isDirect) {
  seedLayoutCopyDualChar().catch((err) => {
    // eslint-disable-next-line no-console -- seed
    console.error("[seed-layout-copy-dual-char] fatal", err);
    process.exitCode = 1;
  });
}
