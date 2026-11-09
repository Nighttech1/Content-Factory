import type { Sprint8FallbackStore } from "@/lib/db/sprint8-fallback";
import { PREVIEW_ACTOR_ID } from "@/lib/preview";

const at = "2026-11-09T00:00:00.000Z";
const image = "/brand/vernatun-emblem.png";
const fixture: Sprint8FallbackStore = {
  users: [{ id: PREVIEW_ACTOR_ID, email: "preview@example.invalid", name: "Тестовый просмотр", role: "ADMIN", createdAt: at }],
  drafts: ["Разговор начинается с вопроса", "Один вечер — разные мнения", "Идеи для следующей встречи"].map((title, index) => ({
    id: `preview_draft_${index + 1}`, userId: PREVIEW_ACTOR_ID, moduleId: "carousel-engine",
    status: "UNPUBLISHED" as const, title: `[Тест] ${title}`,
    slides: [{ id: `preview_slide_${index + 1}`, imageUrl: image, caption: "Тестовый слайд для проверки интерфейса" }],
    scenario: "Пример для проверки карточек и редактора. Это тестовый материал, он не публикуется.",
    payload: { preview: true }, contentJobId: null, createdAt: at, updatedAt: at,
  })),
  boards: [{ id: "preview_board", userId: PREVIEW_ACTOR_ID, title: "[Тест] Референсы интерфейса", slideUrls: [image], createdAt: at, updatedAt: at }],
  scheduleSlots: [],
  designSlots: [{ id: "preview_design", userId: PREVIEW_ACTOR_ID, label: "[Тест] Вернатун", markdown: "# Тестовый стиль\n\nПример для просмотра интерфейса. Рабочие настройки не подключены.", html: null, previewUrl: image, brandbook: null, isActive: true, sortOrder: 0, createdAt: at, updatedAt: at }],
};

/** Every caller gets an isolated copy; mutations cannot change later preview reads. */
export function readPreviewFixture(): Sprint8FallbackStore {
  return structuredClone(fixture);
}
