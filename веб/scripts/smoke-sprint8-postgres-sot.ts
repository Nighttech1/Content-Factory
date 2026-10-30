/**
 * C-s8-07 — Sprint 8 Postgres SoT guards (HARD).
 * Repo-level + static shell_freeze + approve no-social.
 * Optional HTTP if CF_SMOKE_BASE_URL is set (Deployer Next).
 */
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { resolveActor } from "../lib/db/actor";
import {
  upsertDraft,
  listDrafts,
  getDraft,
} from "../lib/db/drafts-repository";
import {
  upsertBoard,
  listBoards,
} from "../lib/db/boards-repository";
import {
  upsertScheduleSlot,
  approveScheduleSlot,
  listScheduleSlots,
} from "../lib/db/schedule-repository";
import {
  upsertDesignSlot,
  activateDesignSlot,
  listDesignSlots,
  DesignLibraryFullError,
  deleteDesignSlot,
} from "../lib/db/design-slots-repository";
import { migrateLocalPayload } from "../lib/db/migrate-local";
import { resetSprint8DbCache } from "../lib/db/sprint8-db";

const SEED = "user_seed_admin_c16";
const OTHER = "user_other_s8_guards";
const WAVE_DAY_START = new Date("2026-10-15T00:00:00");

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(id: string, pass: boolean, detail: string) {
  checks.push({ id, pass, detail });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${id}: ${detail}`);
}

function assert(id: string, cond: boolean, detail: string) {
  record(id, cond, detail);
  if (!cond) throw new Error(`GUARD_FAIL ${id}: ${detail}`);
}

function readSrc(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

function shellFreezeCheck() {
  const files = [
    "components/shell/AppShell.tsx",
    "components/shell/SidebarNavigation.tsx",
  ];
  const details: string[] = [];
  let ok = true;
  for (const f of files) {
    const st = statSync(resolve(process.cwd(), f));
    const mtime = st.mtime;
    const touchedThisWave = mtime >= WAVE_DAY_START;
    details.push(`${f} mtime=${mtime.toISOString()} touchedWave=${touchedThisWave}`);
    if (touchedThisWave) ok = false;
  }
  // No git in this workspace — mtime vs wave day is the freeze evidence.
  assert(
    "shell_freeze",
    ok,
    ok
      ? `AppShell/SidebarNavigation mtime before wave day (${details.join("; ")})`
      : `shell files edited on/after wave day: ${details.join("; ")}`,
  );
}

function approveNoSocialStatic() {
  const route = readSrc("app/api/schedule/slots/approve/route.ts");
  const repo = readSrc("lib/db/schedule-repository.ts");

  const routeOk =
    route.includes("SOCIAL_PUBLISH_DISABLED = true") &&
    route.includes("socialPublish: false") &&
    route.includes("published: false") &&
    !/from\s+["'][^"']*(instagram|meta|telegram|graph\.facebook)/i.test(route);

  const repoOk =
    /no Meta|No Instagram|no social|does NOT call any social/i.test(repo) &&
    !/from\s+["'][^"']*(instagram|meta|telegram|graph\.facebook|social-publish)/i.test(
      repo,
    );

  assert(
    "approve_no_social_static",
    routeOk && repoOk,
    `routeOk=${routeOk} repoOk=${repoOk}; approve path must stay SCHEDULED-only`,
  );
}

async function main() {
  resetSprint8DbCache();
  console.log("=== C-s8-07 Sprint 8 Postgres SoT guards ===");

  shellFreezeCheck();
  approveNoSocialStatic();

  const req = new Request("http://localhost/api", {
    headers: { "x-cf-user-id": SEED },
  });
  const actor = await resolveActor(req);
  assert(
    "actor_seed",
    actor.userId === SEED,
    `actor=${actor.userId} source=${actor.source}`,
  );

  const draftId = `guard_draft_${Date.now()}`;
  const boardId = `guard_board_${Date.now()}`;

  // --- Persistence: create then list ---
  await upsertDraft(actor.userId, {
    id: draftId,
    title: "Guard persist draft",
    slides: [{ id: "s1", imageUrl: "/x.png" }],
    status: "unpublished",
    brand: { logoUrl: "", name: "t", paletteNote: "", note: "" },
  });
  const listed = await listDrafts({ userId: actor.userId });
  const found = listed.find((d) => d.id === draftId);
  assert(
    "persist_draft_list",
    !!found,
    found ? `draft ${draftId} present after create+list` : `missing ${draftId}`,
  );
  const got = await getDraft({ userId: actor.userId, id: draftId });
  assert("persist_draft_get", !!got && got.id === draftId, `get=${got?.id}`);

  await upsertBoard(actor.userId, {
    id: boardId,
    title: "Guard board",
    slideUrls: ["/a.png"],
  });
  const boards = await listBoards(actor.userId);
  assert(
    "persist_board_list",
    boards.some((b) => b.id === boardId),
    `board ${boardId} in list n=${boards.length}`,
  );

  // --- Isolation: other actor must not see seed data ---
  const otherReq = new Request("http://localhost/api", {
    headers: { "x-cf-user-id": OTHER },
  });
  const other = await resolveActor(otherReq);
  assert("actor_other", other.userId === OTHER, `other=${other.userId}`);

  const otherDrafts = await listDrafts({ userId: other.userId });
  const leakDraft = otherDrafts.some(
    (d) => d.id === draftId || d.id === "smoke_draft_s8",
  );
  assert(
    "isolation_drafts",
    !leakDraft,
    leakDraft
      ? `LEAK: other sees seed drafts`
      : `other drafts empty-of-seed (n=${otherDrafts.length})`,
  );

  const otherBoards = await listBoards(other.userId);
  const leakBoard = otherBoards.some((b) => b.id === boardId);
  assert(
    "isolation_boards",
    !leakBoard,
    leakBoard
      ? `LEAK: other sees seed board`
      : `other boards empty-of-seed (n=${otherBoards.length})`,
  );

  const foreignGet = await getDraft({ userId: other.userId, id: draftId });
  assert(
    "isolation_get_foreign",
    foreignGet === null,
    foreignGet ? `LEAK getDraft returned ${foreignGet.id}` : "foreign get → null",
  );

  // --- Schedule approve → SCHEDULED, no social fields implying publish ---
  const slot = await upsertScheduleSlot(actor.userId, {
    postId: draftId,
    moduleId: "carousel-engine",
    startsAt: new Date().toISOString(),
    status: "draft",
  });
  const approved = await approveScheduleSlot({
    userId: actor.userId,
    id: slot.id,
  });
  assert(
    "approve_scheduled",
    approved?.status === "scheduled" || approved?.status === "SCHEDULED",
    `status=${approved?.status}`,
  );
  const slots = await listScheduleSlots({ userId: actor.userId });
  const apprSlot = slots.find((s) => s.id === slot.id);
  assert(
    "approve_persisted",
    !!apprSlot &&
      (apprSlot.status === "scheduled" || apprSlot.status === "SCHEDULED"),
    `slot status=${apprSlot?.status}`,
  );

  // --- Design cap ≤10 ---
  const existing = await listDesignSlots(actor.userId);
  for (const s of existing.slots) {
    if (s.id.startsWith("guard_design_")) {
      await deleteDesignSlot({ userId: actor.userId, id: s.id });
    }
  }
  // leave room: delete smoke_design_* leftovers if needed for clean cap
  const afterClean = await listDesignSlots(actor.userId);
  const room = Math.max(0, 10 - afterClean.slots.length);
  let lastId: string | null = null;
  for (let i = 0; i < room; i++) {
    const id = `guard_design_${Date.now()}_${i}`;
    lastId = id;
    await upsertDesignSlot(actor.userId, {
      id,
      name: `G${i}`,
      markdown: `# ${i}`,
    });
  }
  if (lastId) {
    await activateDesignSlot({ userId: actor.userId, id: lastId });
  }
  let capHit = false;
  try {
    await upsertDesignSlot(actor.userId, {
      id: `guard_design_overflow_${Date.now()}`,
      name: "Overflow",
      markdown: "# overflow",
    });
  } catch (e) {
    if (e instanceof DesignLibraryFullError) capHit = true;
    else throw e;
  }
  const libNow = await listDesignSlots(actor.userId);
  assert(
    "design_cap_le10",
    capHit || libNow.slots.length <= 10,
    `capHit=${capHit} count=${libNow.slots.length} active=${libNow.activeId}`,
  );

  // --- Idempotent migrate-local (twice, no dup explosion) ---
  const migDraftId = `mig_idem_${Date.now()}`;
  const migBoardId = `mig_board_${Date.now()}`;
  const payload = {
    drafts: [
      {
        id: migDraftId,
        title: "Mig once",
        slides: [{ id: "m1", imageUrl: "/m.png" }],
        status: "unpublished",
      },
    ],
    boards: [
      {
        id: migBoardId,
        title: "Mig board",
        slideUrls: ["/mb.png"],
        createdAt: Date.now(),
      },
    ],
    schedule: {
      version: 1,
      slots: [
        {
          postId: migDraftId,
          moduleId: "carousel-engine",
          startsAt: new Date().toISOString(),
        },
      ],
    },
    designLibrary: [],
    designActiveId: null as string | null,
  };

  const m1 = await migrateLocalPayload(actor.userId, payload);
  const m2 = await migrateLocalPayload(actor.userId, payload);
  assert(
    "migrate_idempotent_counts",
    m1.drafts.upserted === 1 &&
      m2.drafts.upserted === 1 &&
      m1.boards.upserted === 1 &&
      m2.boards.upserted === 1,
    `m1 drafts=${m1.drafts.upserted} boards=${m1.boards.upserted}; m2 drafts=${m2.drafts.upserted} boards=${m2.boards.upserted}`,
  );

  const afterMig = await listDrafts({ userId: actor.userId });
  const migHits = afterMig.filter((d) => d.id === migDraftId);
  assert(
    "migrate_no_dup_explosion",
    migHits.length === 1,
    `mig draft occurrences=${migHits.length} (want 1)`,
  );
  const afterBoards = await listBoards(actor.userId);
  const migBoardHits = afterBoards.filter((b) => b.id === migBoardId);
  assert(
    "migrate_board_no_dup",
    migBoardHits.length === 1,
    `mig board occurrences=${migBoardHits.length}`,
  );

  // --- Optional HTTP (Deployer Next) ---
  const base = process.env.CF_SMOKE_BASE_URL?.replace(/\/$/, "");
  if (base) {
    const headers = {
      "x-cf-user-id": SEED,
      "content-type": "application/json",
    };
    const httpDraftId = `http_guard_${Date.now()}`;
    const createRes = await fetch(`${base}/api/studio/drafts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: httpDraftId,
        title: "HTTP guard",
        slides: [],
        status: "unpublished",
      }),
    });
    const createOk = createRes.ok;
    const listRes = await fetch(`${base}/api/studio/drafts`, { headers });
    const listJson = (await listRes.json()) as { drafts?: { id: string }[] };
    const httpPresent = !!listJson.drafts?.some((d) => d.id === httpDraftId);

    const otherList = await fetch(`${base}/api/studio/drafts`, {
      headers: { "x-cf-user-id": OTHER },
    });
    const otherJson = (await otherList.json()) as { drafts?: { id: string }[] };
    const httpLeak = !!otherJson.drafts?.some((d) => d.id === httpDraftId);

    assert(
      "http_persist_isolation",
      createOk && httpPresent && !httpLeak,
      `create=${createRes.status} present=${httpPresent} leak=${httpLeak}`,
    );
  } else {
    record(
      "http_live_next",
      false,
      "SKIP/FAIL evidence: CF_SMOKE_BASE_URL unset — Next not probed (Grafana owns :3000; Deployer must start Next on free port)",
    );
    // Do not throw — repo guards are the hard PASS set; HTTP is Deployer-gated.
    console.log(
      "[NOTE] http_live_next: Deployer must start Next (PORT≠3000; infra-grafana uses 3000) then re-run with CF_SMOKE_BASE_URL",
    );
  }

  const failed = checks.filter((c) => !c.pass && c.id !== "http_live_next");
  const httpFail = checks.find((c) => c.id === "http_live_next" && !c.pass);

  console.log("--- summary ---");
  for (const c of checks) {
    console.log(`${c.pass ? "PASS" : "FAIL"} ${c.id}`);
  }

  if (failed.length > 0) {
    console.error("SMOKE_FAIL", failed.map((f) => f.id).join(","));
    process.exit(1);
  }

  if (httpFail) {
    console.log("SMOKE_OK_REPO_GUARDS");
    console.log("HTTP_PENDING_DEPLOYER");
    process.exit(0);
  }

  console.log("SMOKE_OK");
}

main().catch((e) => {
  console.error("SMOKE_FAIL", e);
  process.exit(1);
});
