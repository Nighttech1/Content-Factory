import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { editorialCard, type EditorialView } from "./editorial-model";
import type { EditorialSource } from "./editorial-source";
import { preparedSha256 } from "./workspace-prepared";
import { preparedCardFingerprint, writePreparedAtomic } from "./workspace-prepared-store";
import type { WorkspaceState } from "./workspace-store";
const metadataSchema = z.object({ version: z.literal(1), digest: z.string().nullable(), sequence: z.number().int().nonnegative(), appliedAt: z.string().nullable(), entries: z.record(z.string(), z.string()) }).strict();
type Metadata = z.infer<typeof metadataSchema>;
const views = new WeakMap<WorkspaceState, EditorialView>();
export function editorialViewData(state: WorkspaceState) { return views.get(state); }
export function createEditorialReconciler(directory: string, now: () => Date) {
  const folder = path.join(directory, "editorial"), metadataFile = path.join(folder, "state.json"), journalFile = path.join(folder, "transaction.json");
  async function metadata(): Promise<Metadata> {
    try { return metadataSchema.parse(JSON.parse(await fs.readFile(metadataFile, "utf8"))); }
    catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, digest: null, sequence: 0, appliedAt: null, entries: {} }; throw new Error("editorial_metadata_invalid"); }
  }
  return {
    async recover(state: WorkspaceState, validate: (s: unknown) => WorkspaceState, persist: (s: WorkspaceState) => Promise<void>) {
      let j;
      try { j = JSON.parse(await fs.readFile(journalFile, "utf8")); } catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return state; throw new Error("editorial_journal_invalid"); }
      const after = validate(j.after), meta = metadataSchema.parse(j.metadata), exists = await fs.access(path.join(directory, "state.json")).then(() => true, () => false);
      if (preparedSha256(after) !== j.afterHash || !(!j.beforeExists && !exists || [j.beforeHash, j.afterHash].includes(preparedSha256(state)))) throw new Error("editorial_recovery_conflict");
      await writePreparedAtomic(metadataFile, meta); await persist(after); await fs.unlink(journalFile); return after;
    },
    async reconcile(state: WorkspaceState, source: Awaited<ReturnType<EditorialSource["read"]>>, persist: (s: WorkspaceState) => Promise<void>) {
      const prior = await metadata(), meta = structuredClone(prior), conflicts: string[] = [];
      if (source.plan.sequence < meta.sequence) throw new Error("editorial_downgrade");
      if (source.plan.sequence === meta.sequence && meta.digest && meta.digest !== source.digest) throw new Error("editorial_version_collision");
      const after = structuredClone(state); let changed = false;
      for (const [index, unit] of source.plan.units.entries()) {
        const planned = editorialCard(unit, index), card = after.cards.find(c => c.id === unit.id), baseline = prior.entries[unit.id];
        if (card && (!baseline || preparedCardFingerprint(card) !== baseline)) { conflicts.push(unit.id); continue; }
        if (!card) { after.cards.push(planned); changed = true; }
        else if (baseline !== preparedCardFingerprint(planned)) { Object.assign(card, { ...planned, column: card.column, order: card.order, publication: card.publication }); changed = true; }
        meta.entries[unit.id] = preparedCardFingerprint(planned);
      }
      if (changed) { after.revision++; after.updatedAt = now().toISOString(); }
      const target = changed ? after : state;
      if (source.digest !== prior.digest || changed) {
        meta.digest = source.digest; meta.sequence = source.plan.sequence; meta.appliedAt = now().toISOString();
        await fs.mkdir(folder, { recursive: true, mode: 0o700 });
        await writePreparedAtomic(path.join(folder, `backup-${state.revision}-${Date.now()}.json`), { state, metadata: prior });
        const beforeExists = await fs.access(path.join(directory, "state.json")).then(() => true, () => false);
        await writePreparedAtomic(journalFile, { beforeExists, beforeHash: preparedSha256(state), afterHash: preparedSha256(target), after: target, metadata: meta });
        await writePreparedAtomic(metadataFile, meta); await persist(target); await fs.unlink(journalFile);
      }
      views.set(target, { ...source, appliedAt: meta.appliedAt, conflicts });
      return target;
    },
  };
}
