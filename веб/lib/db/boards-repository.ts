/**
 * Sprint 8 C-s8-03 — Boards SoT (Prisma preferred, JSON fallback).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { type BoardApi, boardToApi } from "@/lib/db/sprint8-mappers";
import { resolveSprint8Db } from "@/lib/db/sprint8-db";
import {
  newFallbackId,
  readSprint8Fallback,
  writeSprint8Fallback,
  type FallbackBoardRecord,
} from "@/lib/db/sprint8-fallback";

/**
 * Disk root: public/generatedMedia/boards so Next can serve `/generatedMedia/boards/...`.
 * Also acceptable per Architect: generatedMedia/boards/{userId}/ (path refs in DB).
 */
const BOARDS_MEDIA_ROOT = path.join(
  process.cwd(),
  "public",
  "generatedMedia",
  "boards",
);

export type BoardUpsertInput = {
  id?: string;
  title?: string;
  slideUrls?: unknown;
  createdAt?: number | string;
};

function asSlideUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.length > 0);
}

function parseCreatedAt(raw: unknown, fallback: Date): Date {
  if (typeof raw === "number" && Number.isFinite(raw)) return new Date(raw);
  if (typeof raw === "string" && Number.isFinite(Date.parse(raw))) {
    return new Date(raw);
  }
  return fallback;
}

export async function listBoards(userId: string): Promise<BoardApi[]> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const rows = await prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(boardToApi);
  }
  const store = await readSprint8Fallback();
  return store.boards
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(boardToApi);
}

export async function getBoard(opts: {
  userId: string;
  id: string;
}): Promise<BoardApi | null> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.board.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    return row ? boardToApi(row) : null;
  }
  const store = await readSprint8Fallback();
  const row = store.boards.find(
    (b) => b.id === opts.id && b.userId === opts.userId,
  );
  return row ? boardToApi(row) : null;
}

export async function boardOwnedByOther(opts: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.board.findUnique({ where: { id: opts.id } });
    return Boolean(row && row.userId !== opts.userId);
  }
  const store = await readSprint8Fallback();
  const row = store.boards.find((b) => b.id === opts.id);
  return Boolean(row && row.userId !== opts.userId);
}

export async function upsertBoard(
  userId: string,
  input: BoardUpsertInput,
): Promise<BoardApi> {
  const id =
    typeof input.id === "string" && input.id.trim()
      ? input.id.trim()
      : newFallbackId("board");
  const now = new Date();
  const title =
    typeof input.title === "string" && input.title.trim()
      ? input.title.trim()
      : "Новая доска";
  const slideUrls = asSlideUrls(input.slideUrls);
  const createdAt = parseCreatedAt(input.createdAt, now);

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const existing = await prisma.board.findUnique({ where: { id } });
    if (existing && existing.userId !== userId) {
      const err = new Error("forbidden");
      (err as Error & { code: string }).code = "forbidden";
      throw err;
    }
    const row = await prisma.board.upsert({
      where: { id },
      create: {
        id,
        userId,
        title,
        slideUrls,
        createdAt,
        updatedAt: now,
      },
      update: {
        title,
        slideUrls,
        updatedAt: now,
      },
    });
    return boardToApi(row);
  }

  const store = await readSprint8Fallback();
  const idx = store.boards.findIndex((b) => b.id === id);
  if (idx >= 0 && store.boards[idx]!.userId !== userId) {
    const err = new Error("forbidden");
    (err as Error & { code: string }).code = "forbidden";
    throw err;
  }
  const prev = idx >= 0 ? store.boards[idx]! : null;
  const row: FallbackBoardRecord = {
    id,
    userId,
    title,
    slideUrls,
    createdAt: prev?.createdAt ?? createdAt.toISOString(),
    updatedAt: now.toISOString(),
  };
  if (idx >= 0) store.boards[idx] = row;
  else store.boards.unshift(row);
  await writeSprint8Fallback(store);
  return boardToApi(row);
}

export async function patchBoard(opts: {
  userId: string;
  id: string;
  patch: BoardUpsertInput;
}): Promise<BoardApi | null> {
  const existing = await getBoard({ userId: opts.userId, id: opts.id });
  if (!existing) return null;
  return upsertBoard(opts.userId, {
    id: opts.id,
    title: opts.patch.title ?? existing.title,
    slideUrls: opts.patch.slideUrls ?? existing.slideUrls,
    createdAt: existing.createdAt,
  });
}

export async function deleteBoard(opts: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.board.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    if (!row) return false;
    await prisma.board.delete({ where: { id: opts.id } });
    return true;
  }
  const store = await readSprint8Fallback();
  const before = store.boards.length;
  store.boards = store.boards.filter(
    (b) => !(b.id === opts.id && b.userId === opts.userId),
  );
  if (store.boards.length === before) return false;
  await writeSprint8Fallback(store);
  return true;
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  return "bin";
}

/**
 * Persist one image (data-URL or raw base64) under generatedMedia/boards/{userId}/.
 * Returns a public-ish relative URL path. Does not delete unrelated media.
 */
export async function uploadBoardMedia(opts: {
  userId: string;
  dataUrlOrBase64: string;
  filenameHint?: string;
}): Promise<{ url: string; path: string }> {
  const raw = opts.dataUrlOrBase64.trim();
  let mime = "application/octet-stream";
  let b64 = raw;
  const dataMatch = raw.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (dataMatch) {
    mime = dataMatch[1] || mime;
    b64 = dataMatch[2] || "";
  }
  const buf = Buffer.from(b64, "base64");
  if (!buf.length) {
    const err = new Error("empty_upload");
    (err as Error & { code: string }).code = "empty_upload";
    throw err;
  }
  // Soft cap ~8MB per file
  if (buf.length > 8 * 1024 * 1024) {
    const err = new Error("upload_too_large");
    (err as Error & { code: string }).code = "upload_too_large";
    throw err;
  }

  const safeUser = opts.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const dir = path.join(BOARDS_MEDIA_ROOT, safeUser);
  await fs.mkdir(dir, { recursive: true });
  const ext = extFromMime(mime);
  const name =
    typeof opts.filenameHint === "string" && opts.filenameHint.trim()
      ? opts.filenameHint.trim().replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 64)
      : `${Date.now()}_${randomUUID().slice(0, 8)}.${ext}`;
  const filename = name.includes(".") ? name : `${name}.${ext}`;
  const abs = path.join(dir, filename);
  await fs.writeFile(abs, buf);

  const rel = `/generatedMedia/boards/${safeUser}/${filename}`;
  return { url: rel, path: abs };
}

/**
 * Convert data:/blob: URLs in a list to stored URLs (blob: skipped as unreadable server-side).
 */
export async function materializeBoardSlideUrls(
  userId: string,
  urls: string[],
): Promise<{ urls: string[]; skippedBlob: number }> {
  const out: string[] = [];
  let skippedBlob = 0;
  for (const u of urls) {
    if (!u || typeof u !== "string") continue;
    if (u.startsWith("blob:")) {
      skippedBlob += 1;
      continue;
    }
    if (u.startsWith("data:")) {
      const uploaded = await uploadBoardMedia({
        userId,
        dataUrlOrBase64: u,
      });
      out.push(uploaded.url);
      continue;
    }
    out.push(u);
  }
  return { urls: out, skippedBlob };
}
