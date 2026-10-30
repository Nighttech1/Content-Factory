# Architect spec — C-drafts-always (P0)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-drafts-design-team`.  
> Shared chain: `memory/waves/W-2026-10-13-drafts-design-team/chain.md`.  
> Canon: `.cursor/skills/carousel-studio-handoff/SKILL.md`, `content-factory-ui` (drafts HARD), `carousel-json-contract`.  
> Extends: C-156 persist + C-carousel-publish publish path.

## Goal

После любого **успешного** Create-пути пользователь **всегда** видит карточку в **Ours → Черновики** без F5. Пустой rail после Create = **FAIL**.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-da-1 Draft on successful draw** | When Designer **draw** succeeds (slides with visible media / artifact OK) → `upsertDraft` into `useCarouselDraftsStore` (`cf.carousel.drafts.v1`), status `unpublished`. Same draft id reused on later publish. |
| **D-da-2 Draft on publish** | «Опубликовать» **must** still `upsertDraft` (via `publishCreateCarousel` / equivalent) + schedule slot. Publish path **never** optional for drafts. |
| **D-da-3 Rail switch** | After draw success **and** after successful publish: bump `openDraftsNonce` in `StudioModuleWorkspace` so `VerticalPostCarousel` switches Ours toggle to **Черновики** and focuses drafts rail. |
| **D-da-4 Empty copy** | Empty Черновики copy must mention **Create** and **Разбор** (not Разбор-only). RU e.g. «Пока нет черновиков — создайте карусель или сделайте Разбор у конкурента». |
| **D-da-5 Persist** | Keep zustand persist key **`cf.carousel.drafts.v1`** (C-156). No wipe on hydrate. |
| **D-da-6 Razbor freeze** | **Do not** edit `RazborModal.tsx`. Razbor upsert path stays as-is. |
| **D-da-7 Fail = no fake card** | Draw/publish **error** → no draft upsert; no nonce bump; RU error visible. |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| `lib/studio/carousel-drafts-store.ts` | Frontend |
| `lib/studio/create-carousel-publish.ts` | Frontend |
| `components/studio/StudioModuleWorkspace.tsx` | Frontend (`openDraftsNonce`) |
| `components/studio/workspace/VerticalPostCarousel.tsx` | Frontend (nonce → Черновики) |
| `components/studio/workspace/DraftsPanel.tsx` | Frontend (empty copy) |

## Out of scope

- Settings Design Embla library (C-settings-design-md-carousel)
- Team brief / next.config (C-team-brief-n-indicator)
- Prisma drafts / social publish
- Editing RazborModal

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Draft upsert + rail UX | **Frontend** | Step 1 of wave chain (P0 first) |
| LLM | — | none for this ticket alone |
| QA | Tester → Client **S43.1** | Card visible after publish (and after draw per D-da-1) |

## Contracts

```ts
// After successful draw:
upsertDraft({
  id, // stable across draw→publish
  moduleId: "carousel-engine",
  status: "unpublished",
  slides, // from designer artifact
  updatedAt: ISO,
  // …
});
bumpOpenDraftsNonce(); // parent workspace

// After successful publish (existing):
publishCreateCarousel({ draft, startsAt, platformId }); // upsertDraft + schedule
bumpOpenDraftsNonce();
```

## Acceptance criteria (язык Клиента / S43.1)

1. Create → успешный draw → закрыть/остаться → тумблер **Черновики** → **новая карточка** видна (без F5).
2. Create → **Опубликовать** → Черновики показывают ту же/обновлённую карточку + слот `/schedule` (регресс C-carousel-publish).
3. Пустой rail: текст просит **Create** и **Разбор**.
4. Razbor modal по-прежнему открывается (smoke; no regression).

## Risks

- Double upsert different ids on draw vs publish → lock **same id**.
- Nonce bump without store write → empty Черновики still FAIL.
- Touching Razbor by accident.

## Mid-flight escalation

Если drafts must move server-side — стоп → Архитектор добавляет Backend step → продолжение.
