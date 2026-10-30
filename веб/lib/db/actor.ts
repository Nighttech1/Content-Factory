/**
 * Sprint 8 — resolve request actor before Auth (Sprint 21).
 * Priority: x-cf-user-id → cookie cf_user_id → CF_DEV_USER_ID → seed admin.
 * Never logs secrets or full cookies.
 */

import { getPrisma } from "@/lib/db/prisma";
import {
  ensureFallbackUser,
  type FallbackUserRecord,
} from "@/lib/db/sprint8-fallback";

export const SEED_ADMIN_USER_ID = "user_seed_admin_c16";
export const SEED_ADMIN_EMAIL = "admin@content-factory.local";
export const SEED_ADMIN_NAME = "Studio Admin";

export const CF_USER_ID_HEADER = "x-cf-user-id";
export const CF_USER_ID_COOKIE = "cf_user_id";

export type ActorContext = {
  userId: string;
  source: "header" | "cookie" | "env" | "seed";
};

function parseCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  if (!cookie) return null;
  const match = cookie.match(
    new RegExp(`(?:(?:^|;\\s*)${name}=([^;]*))`),
  );
  if (!match?.[1]) return null;
  try {
    const decoded = decodeURIComponent(match[1]).trim();
    return decoded || null;
  } catch {
    const raw = match[1].trim();
    return raw || null;
  }
}

function sanitizeUserId(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (!id || id.length > 128) return null;
  // Allow cuid / uuid / seed ids — reject path traversal / whitespace abuse
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return id;
}

/** Pick actor id from request / env without DB side effects. */
export function peekActorId(req: Request): ActorContext {
  const fromHeader = sanitizeUserId(req.headers.get(CF_USER_ID_HEADER));
  if (fromHeader) return { userId: fromHeader, source: "header" };

  const fromCookie = sanitizeUserId(parseCookie(req, CF_USER_ID_COOKIE));
  if (fromCookie) return { userId: fromCookie, source: "cookie" };

  const fromEnv = sanitizeUserId(process.env.CF_DEV_USER_ID);
  if (fromEnv) return { userId: fromEnv, source: "env" };

  return { userId: SEED_ADMIN_USER_ID, source: "seed" };
}

async function upsertUserPrisma(userId: string): Promise<void> {
  const prisma = getPrisma();
  const isSeed = userId === SEED_ADMIN_USER_ID;
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: isSeed ? SEED_ADMIN_EMAIL : `${userId}@content-factory.local`,
      name: isSeed ? SEED_ADMIN_NAME : userId,
      role: "ADMIN",
    },
    update: {},
  });
}

async function upsertUserFallback(userId: string): Promise<FallbackUserRecord> {
  const isSeed = userId === SEED_ADMIN_USER_ID;
  return ensureFallbackUser({
    id: userId,
    email: isSeed ? SEED_ADMIN_EMAIL : `${userId}@content-factory.local`,
    name: isSeed ? SEED_ADMIN_NAME : userId,
    role: "ADMIN",
  });
}

async function tryPrismaUpsert(userId: string): Promise<boolean> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    await upsertUserPrisma(userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve actor and ensure User row exists (Prisma or JSON fallback).
 */
export async function resolveActor(req: Request): Promise<ActorContext> {
  const actor = peekActorId(req);
  const ok = await tryPrismaUpsert(actor.userId);
  if (!ok) {
    await upsertUserFallback(actor.userId);
  }
  return actor;
}
