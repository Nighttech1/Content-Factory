import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { preparedSha256 } from "../lib/growth-center/workspace-prepared";
import bundled from "../data/growth/editorial-plan.json";
import { editorialPlanSchema } from "../lib/growth-center/editorial-model";
import { createEditorialSource, EDITORIAL_SOURCE_URL } from "../lib/growth-center/editorial-source";
import { createWorkspaceStore, workspaceView } from "../lib/growth-center/workspace-store";

async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "editorial-test-"));
  let now = new Date("2026-11-11T10:00:00Z"), remote: unknown = structuredClone(bundled), requests = 0;
  const plan = editorialPlanSchema.parse(bundled);
  const transport: typeof fetch = async (url, options) => { assert(String(url).startsWith(EDITORIAL_SOURCE_URL + "?minute=")); assert.equal(options?.redirect, "error"); requests++; return new Response(JSON.stringify(remote)); };
  const source = createEditorialSource(directory, { fetch: transport, now: () => now });
  const store = createWorkspaceStore({ directory, now: () => now, editorialSource: source });
  const caps = { authConfigured: true, authenticated: true, writeEnabled: true, gitConfigured: false, schedulerEnabled: false, csrfToken: "test" };
  try {
    const state = await store.read(), view = workspaceView(state, caps, now);
    assert.equal(view.editorial?.status, "synced"); assert.equal(view.editorial?.plan.units.length, 37);
    assert.equal(new Set(state.cards.map(c => c.id)).size, state.cards.length);
    for (const u of plan.units) { assert(view.activeCardIds.includes(u.id)); const card = state.cards.find(c => c.id === u.id)!; assert.equal(card.publication, null); assert.equal(card.departmentDecision.status, "pending"); assert.equal(card.origin.evidence, "unverified"); assert(card.script?.includes(u.cta)); }
    assert.equal(Object.keys(view.preparedDetails).length, 0);
    const first = state.cards.find(c => c.id === "V-202611-REL-03")!;
    let current = await store.mutate({ type: "move_card", cardId: first.id, column: "shooting", beforeCardId: null, expectedRevision: state.revision, requestId: "move-1" });
    let s = await store.read();
    await store.mutate({ type: "update_card", cardId: first.id, patch: { title: "Правка владельца" }, expectedRevision: s.revision, requestId: "edit-1" });
    s = await store.read();
    await store.mutate({ type: "save_counts", counts: { awareness: 500, desire: 12, registration: 5, attendance: 3, return: null, membership: null }, source: "owner test", expectedRevision: s.revision, requestId: "counts-1" });
    s = await store.read(); const facts = structuredClone(s.facts), beforeCount = s.cards.length;
    const update = structuredClone(plan); update.sequence++; update.revision = "test-revision-5"; update.units[0].title = "Новая тема из Git"; update.units[1].title = "Вторая тема из Git"; remote = update; now = new Date(now.getTime() + 61000);
    s = await store.read(); assert.equal(s.cards.length, beforeCount); assert.equal(s.cards.find(c => c.id === first.id)!.title, "Правка владельца"); assert.equal(s.cards.find(c => c.id === first.id)!.column, "shooting"); assert.deepEqual(s.facts, facts);
    assert(workspaceView(s, caps, now).editorial!.conflicts.includes(first.id));
    const second = update.units.find(u => u.id !== first.id && u.title === "Вторая тема из Git")!;
    assert.equal(s.cards.find(c => c.id === second.id)!.title, "Вторая тема из Git");
    const afterRevision = s.revision; await store.read(); assert.equal((await store.read()).revision, afterRevision);
    // Invalid/duplicate/source failures retain last-good, including across restart.
    remote = { ...update, sequence: update.sequence + 1, units: [update.units[0], update.units[0]] }; now = new Date(now.getTime() + 61000);
    s = await store.read(); assert.equal(workspaceView(s, caps, now).editorial?.status, "stale"); assert.equal(workspaceView(s, caps, now).editorial?.plan.sequence, update.sequence);
    const restarted = createEditorialSource(directory, { fetch: async () => { throw Error("offline"); }, now: () => now });
    assert.equal((await restarted.read()).plan.sequence, update.sequence);
    remote = plan; now = new Date(now.getTime() + 61000); assert.equal((await source.read()).status, "stale");
    const badShoot = structuredClone(plan); badShoot.units.find(u => u.format === "REL")!.shooting_date = "2026-11-13"; assert.equal(editorialPlanSchema.safeParse(badShoot).success, false);
    const badWeek = structuredClone(plan); badWeek.weeks[0].total++; assert.equal(editorialPlanSchema.safeParse(badWeek).success, false);
    const dup = structuredClone(plan); dup.units[1].id = dup.units[0].id; assert.equal(editorialPlanSchema.safeParse(dup).success, false);
    const fakeFact = structuredClone(plan) as unknown as { units: Array<{ publication_url: unknown }> }; fakeFact.units[0].publication_url = "https://example.org/fake"; assert.equal(editorialPlanSchema.safeParse(fakeFact).success, false);
    const badBody = createEditorialSource(path.join(directory, "large"), { fetch: async () => new Response("{}", { headers: { "content-length": "2000000" } }) }); assert.equal((await badBody.read()).status, "stale");
    // Crash after journal/metadata but before state persistence completes safely; never restores over an unrelated edit.
    remote = update;
    const disk = JSON.parse(await fs.readFile(path.join(directory, "state.json"), "utf8"));
    const after = structuredClone(disk); after.revision++; after.cards.find((c: {id: string}) => c.id === first.id).title = "Recovered owner text";
    const metadata = JSON.parse(await fs.readFile(path.join(directory, "editorial/state.json"), "utf8"));
    const journal = { beforeExists: true, beforeHash: preparedSha256(disk), afterHash: preparedSha256(after), after, metadata };
    await fs.writeFile(path.join(directory, "editorial/transaction.json"), JSON.stringify(journal));
    assert.equal((await store.read()).cards.find(c => c.id === first.id)!.title, "Recovered owner text");
    await assert.rejects(fs.access(path.join(directory, "editorial/transaction.json")));
    await fs.writeFile(path.join(directory, "editorial/transaction.json"), JSON.stringify({...journal,beforeHash:"0".repeat(64),afterHash:preparedSha256(disk),after:disk}));
    await assert.rejects(store.read());
    assert.equal(JSON.parse(await fs.readFile(path.join(directory,"state.json"),"utf8")).cards.find((c: {id:string})=>c.id===first.id).title,"Recovered owner text");
    await fs.unlink(path.join(directory,"editorial/transaction.json"));
    assert(requests <= 5, "singleflight/cache bound"); assert.equal(current.receipt.replayed, false);
    console.log("PASS editorial: 37 drafts/briefs; fixed source and cache; dates/80-20; no fake approvals/fact; idempotency; Git update without rebuild; owner title/column/facts preserved; last-good restart; downgrade/invalid/oversize rejection.");
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
