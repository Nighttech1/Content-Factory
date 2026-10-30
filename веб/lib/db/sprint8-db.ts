/**
 * Sprint 8 — prefer Prisma when DATABASE_URL works; else JSON fallback.
 * Mirrors analytics-repository dual-path pattern.
 */

import type { PrismaClient } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";

export type Sprint8StoreMode = "prisma" | "fallback";

let cachedMode: Sprint8StoreMode | null = null;
let cachedPrisma: PrismaClient | null = null;
let bootLogged = false;
let resolveInFlight: Promise<{
  mode: Sprint8StoreMode;
  prisma: PrismaClient | null;
}> | null = null;

function logStoreOnce(mode: Sprint8StoreMode): void {
  if (bootLogged) return;
  bootLogged = true;
  // eslint-disable-next-line no-console -- intentional one-shot boot signal
  console.info(`[db] sprint8-store=${mode}`);
}

async function tryPrisma(): Promise<PrismaClient | null> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

export async function resolveSprint8Db(): Promise<{
  mode: Sprint8StoreMode;
  prisma: PrismaClient | null;
}> {
  if (cachedMode === "prisma" && cachedPrisma) {
    return { mode: "prisma", prisma: cachedPrisma };
  }
  if (cachedMode === "fallback") {
    return { mode: "fallback", prisma: null };
  }
  if (resolveInFlight) return resolveInFlight;

  resolveInFlight = (async () => {
    const prisma = await tryPrisma();
    if (prisma) {
      cachedMode = "prisma";
      cachedPrisma = prisma;
      logStoreOnce("prisma");
      return { mode: "prisma" as const, prisma };
    }
    cachedMode = "fallback";
    cachedPrisma = null;
    logStoreOnce("fallback");
    return { mode: "fallback" as const, prisma: null };
  })();

  try {
    return await resolveInFlight;
  } finally {
    resolveInFlight = null;
  }
}

/** Test helper */
export function resetSprint8DbCache(): void {
  cachedMode = null;
  cachedPrisma = null;
  bootLogged = false;
  resolveInFlight = null;
}
