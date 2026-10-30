/**
 * Local smoke for Sprint 8 SoT repos (C-s8-02…06). No secrets logged.
 */
import { resolveActor } from "../lib/db/actor";
import {
  upsertDraft,
  listDrafts,
} from "../lib/db/drafts-repository";
import {
  upsertBoard,
  uploadBoardMedia,
} from "../lib/db/boards-repository";
import {
  upsertScheduleSlot,
  approveScheduleSlot,
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

async function main() {
  resetSprint8DbCache();
  const req = new Request("http://localhost/api", {
    headers: { "x-cf-user-id": "user_seed_admin_c16" },
  });
  const actor = await resolveActor(req);
  console.log("actor", actor.userId, actor.source);

  const draft = await upsertDraft(actor.userId, {
    id: "smoke_draft_s8",
    title: "Smoke draft",
    slides: [{ id: "s1", imageUrl: "/x.png" }],
    status: "unpublished",
    brand: { logoUrl: "", name: "t", paletteNote: "", note: "" },
  });
  console.log("draft", draft.id, draft.status);

  const board = await upsertBoard(actor.userId, {
    id: "smoke_board_s8",
    title: "Board",
    slideUrls: ["/a.png"],
  });
  console.log("board", board.id, board.slideUrls.length);

  const tiny =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const up = await uploadBoardMedia({
    userId: actor.userId,
    dataUrlOrBase64: tiny,
  });
  console.log("upload_ok", up.url.startsWith("/generatedMedia/boards/"));

  const slot = await upsertScheduleSlot(actor.userId, {
    postId: draft.id,
    moduleId: "carousel-engine",
    startsAt: new Date().toISOString(),
    status: "draft",
  });
  const approved = await approveScheduleSlot({
    userId: actor.userId,
    id: slot.id,
  });
  console.log("approve", approved?.status);

  // Clean prior smoke design slots beyond 1 for cap test
  const existing = await listDesignSlots(actor.userId);
  for (const s of existing.slots) {
    if (s.id.startsWith("smoke_design_")) {
      await deleteDesignSlot({ userId: actor.userId, id: s.id });
    }
  }

  const d1 = await upsertDesignSlot(actor.userId, {
    id: "smoke_design_1",
    name: "D1",
    markdown: "# hi",
  });
  await activateDesignSlot({ userId: actor.userId, id: d1.id });
  const lib = await listDesignSlots(actor.userId);
  console.log("design_active", lib.activeId);

  let full = false;
  for (let i = 2; i <= 12; i++) {
    try {
      await upsertDesignSlot(actor.userId, {
        id: `smoke_design_${i}`,
        name: `D${i}`,
        markdown: `# ${i}`,
      });
    } catch (e) {
      if (e instanceof DesignLibraryFullError) {
        full = true;
        break;
      }
      throw e;
    }
  }
  console.log("design_cap_hit", full);

  const mig = await migrateLocalPayload(actor.userId, {
    drafts: [
      {
        id: "smoke_draft_s8",
        title: "Smoke draft 2",
        slides: [],
        status: "unpublished",
      },
    ],
    boards: [
      {
        id: "smoke_board_s8",
        title: "Board 2",
        slideUrls: ["/b.png"],
        createdAt: Date.now(),
      },
    ],
    schedule: {
      version: 1,
      slots: [
        {
          postId: "smoke_draft_s8",
          moduleId: "carousel-engine",
          startsAt: new Date().toISOString(),
        },
      ],
    },
    designLibrary: [{ id: "smoke_design_1", name: "D1b", markdown: "# hi2" }],
    designActiveId: "smoke_design_1",
  });
  console.log(
    "migrate",
    mig.drafts.upserted,
    mig.boards.upserted,
    mig.schedule.upserted,
    mig.designLibrary.upserted,
  );

  const other = await listDrafts({ userId: "user_other_smoke" });
  console.log("isolation_empty", other.length === 0);
  console.log("SMOKE_OK");
}

main().catch((e) => {
  console.error("SMOKE_FAIL", e);
  process.exit(1);
});
