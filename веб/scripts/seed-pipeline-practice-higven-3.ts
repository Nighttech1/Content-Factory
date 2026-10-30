/**
 * Wave 2026-10-18 pipeline-practice-higven-3 — seed Design + Brand.
 *
 *   npx tsx scripts/seed-pipeline-practice-higven-3.ts
 *
 * - Mirror etalon PNGs → generatedMedia/…/pipeline-practice-2026-10-18/
 * - Clear layout-copy / RE-orange / prior etalon presets from library
 * - Upsert 01 HIGVEN (ACTIVE) + 02 SUA (inactive)
 * - Force Brand logoRef = /brand/vernatun-logo.png (full PNG)
 */

import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import {
  activateDesignSlot,
  deleteDesignSlot,
  listDesignSlots,
  upsertDesignSlot,
} from "../lib/db/design-slots-repository";
import {
  HIGVEN_GRID_FILE,
  HIGVEN_SEED_PRESETS,
  SEED_HIGVEN_01_ID,
  SEED_SUA_02_ID,
  SUA_GRID_FILE,
} from "../lib/settings/design-presets/higven-seeds";
import { putBrandSettings } from "../lib/settings/brand-store";

const SRC_ETALON = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "эталон",
  "pipeline-practice-2026-10-18",
);
const DEST_ETALON = path.join(
  process.cwd(),
  "generatedMedia",
  "эталон карусели",
  "pipeline-practice-2026-10-18",
);

const FULL_LOGO = "/brand/vernatun-logo.png";

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function mirrorEtalons(): Promise<void> {
  await mkdir(DEST_ETALON, { recursive: true });
  for (const file of [HIGVEN_GRID_FILE, SUA_GRID_FILE]) {
    const src = path.join(SRC_ETALON, file);
    const dest = path.join(DEST_ETALON, file);
    if (!(await fileExists(src))) {
      throw new Error(`etalon_missing: ${src}`);
    }
    await copyFile(src, dest);
    // eslint-disable-next-line no-console -- seed
    console.log("[seed-higven-3] mirrored", file);
  }
}

/** Prior wave / layout-copy / RE-orange ids to clear from active library. */
function shouldClearSlot(id: string): boolean {
  return (
    id.startsWith("smoke_design_") ||
    id.startsWith("seed-layout-") ||
    id.startsWith("seed-re-") ||
    id.startsWith("seed-luma-") ||
    id.startsWith("seed-omkopa-") ||
    id.startsWith("seed-bento-") ||
    id.startsWith("seed-dark-") ||
    id === "design-active-user_seed_admin_c16" ||
    // Clear prior HIGVEN/SUA so re-seed is idempotent
    id === SEED_HIGVEN_01_ID ||
    id === SEED_SUA_02_ID
  );
}

export async function seedPipelinePracticeHigven3(userId?: string): Promise<{
  activeId: string | null;
  logoRef: string;
  cleared: string[];
}> {
  const uid =
    userId?.trim() ||
    process.env.CF_DEV_USER_ID?.trim() ||
    SEED_ADMIN_USER_ID;
  // eslint-disable-next-line no-console -- seed
  console.log("[seed-pipeline-practice-higven-3] userId=", uid);

  await mirrorEtalons();

  const cleared: string[] = [];
  const { slots } = await listDesignSlots(uid);
  for (const s of slots) {
    if (shouldClearSlot(s.id)) {
      await deleteDesignSlot({ userId: uid, id: s.id });
      cleared.push(s.id);
      // eslint-disable-next-line no-console -- seed
      console.log("[seed] cleared slot", s.id);
    }
  }

  for (let i = 0; i < HIGVEN_SEED_PRESETS.length; i++) {
    const preset = HIGVEN_SEED_PRESETS[i]!;
    const isActive = preset.id === SEED_HIGVEN_01_ID;
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
      isActive,
    });
    // eslint-disable-next-line no-console -- seed
    console.log("[seed] design slot", {
      id: slot.id,
      name: slot.name,
      isActive: slot.isActive,
    });
  }

  const active = await activateDesignSlot({
    userId: uid,
    id: SEED_HIGVEN_01_ID,
  });
  // eslint-disable-next-line no-console -- seed
  console.log("[seed] active design", active?.id, active?.name);

  const brand = await putBrandSettings(uid, {
    logoRef: FULL_LOGO,
    brandName: "Vernatun",
  });
  // eslint-disable-next-line no-console -- seed
  console.log("[seed] brand logoRef", brand.logoRef);

  // eslint-disable-next-line no-console -- seed
  console.log("[seed-pipeline-practice-higven-3] DONE");
  return {
    activeId: active?.id ?? null,
    logoRef: brand.logoRef,
    cleared,
  };
}

const isDirect =
  typeof process.argv[1] === "string" &&
  process.argv[1]
    .replace(/\\/g, "/")
    .includes("seed-pipeline-practice-higven-3");

if (isDirect) {
  seedPipelinePracticeHigven3().catch((err) => {
    // eslint-disable-next-line no-console -- seed
    console.error("[seed-pipeline-practice-higven-3] fatal", err);
    process.exitCode = 1;
  });
}
