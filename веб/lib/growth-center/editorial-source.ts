import { promises as fs } from "node:fs";
import path from "node:path";
import bundled from "@/data/growth/editorial-plan.json";
import { editorialPlanSchema, type EditorialPlan, type EditorialView } from "./editorial-model";
import { preparedSha256 } from "./workspace-prepared";
import { writePreparedAtomic } from "./workspace-prepared-store";

export const EDITORIAL_SOURCE_URL = "https://raw.githubusercontent.com/Nighttech1/Content-Factory/refs/heads/codex/director-chatgpt-transfer/projects/vernatun/content-plan/exports/publication-plan-2026-v3.json";
const MAX_BYTES = 1500000;
type Result = Omit<EditorialView, "conflicts" | "appliedAt">;
export function createEditorialSource(directory: string, options: { fetch?: typeof fetch; now?: () => Date; bundledOnly?: boolean; seed?: unknown } = {}) {
  const cache = path.join(directory, "editorial-source.json"), clock = options.now ?? (() => new Date()), transport = options.fetch ?? fetch;
  let last: Result = { plan: editorialPlanSchema.parse(options.seed ?? bundled), status: "bundled", digest: "", checkedAt: null, message: null };
  last.digest = preparedSha256(last.plan);
  let loaded = false, nextCheck = 0, pending: Promise<Result> | null = null;
  async function update(): Promise<Result> {
    if (!loaded) {
      try { const data = JSON.parse(await fs.readFile(cache, "utf8")), plan = editorialPlanSchema.parse(data.plan); if (preparedSha256(plan) !== data.digest) throw new Error("editorial_cache_invalid"); if (plan.sequence >= last.plan.sequence) last = { plan, digest: data.digest, status: "stale", checkedAt: data.checkedAt, message: "Проверяем обновления плана." }; }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") last = { ...last, status: "stale", message: "Сохранённая копия плана недоступна; используется версия сборки." }; }
      loaded = true;
    }
    if (options.bundledOnly) return last;
    if (clock().getTime() < nextCheck) return last;
    nextCheck = clock().getTime() + 60000;
    try {
      const response = await transport(EDITORIAL_SOURCE_URL + "?minute=" + Math.floor(clock().getTime() / 60000), { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
      if (!response.ok || Number(response.headers.get("content-length") || 0) > MAX_BYTES || !response.body) throw new Error("editorial_source_unavailable");
      const reader = response.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
      try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > MAX_BYTES) throw new Error("editorial_source_too_large"); chunks.push(value); } } finally { await reader.cancel().catch(() => undefined); }
      const plan = editorialPlanSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8"))), digest = preparedSha256(plan);
      if (plan.sequence < last.plan.sequence || plan.sequence === last.plan.sequence && digest !== last.digest) throw new Error("editorial_sequence_conflict");
      const next: Result = { plan, digest, status: "synced", checkedAt: clock().toISOString(), message: null };
      await writePreparedAtomic(cache, { plan, digest, checkedAt: next.checkedAt });
      last = next;
    } catch { last = { ...last, status: "stale", checkedAt: clock().toISOString(), message: "Обновление из GitHub не подтверждено. Показан последний корректный план." }; }
    return last;
  }
  return { read(): Promise<Result> { if (!pending) pending = update().finally(() => { pending = null; }); return pending; } };
}
export type EditorialSource = ReturnType<typeof createEditorialSource>;
