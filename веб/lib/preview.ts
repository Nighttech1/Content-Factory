/** Opt-in interface preview. This module is safe to import from client or Edge code. */
export const PREVIEW_ACTOR_ID = "content_factory_ui_preview";
export const PREVIEW_READ_ONLY_MESSAGE =
  "Тестовая версия интерфейса: сохранение, загрузка файлов, генерация и публикация отключены.";

export function isContentFactoryPreview(): boolean {
  return process.env.CONTENT_FACTORY_PREVIEW === "1" ||
    process.env.NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW === "1";
}

/** Only inspected read handlers may execute in preview. Unknown APIs fail closed. */
export function isPreviewReadAllowed(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "");
  return new Set([
    "/api/studio/drafts", "/api/studio/boards", "/api/schedule/slots",
    "/api/settings/brand", "/api/settings/landscapes", "/api/settings/publicist",
    "/api/settings/design-slots", "/api/settings/design-active",
    "/api/settings/design-md", "/api/settings/agent-packs", "/api/brand-kit",
    "/api/analytics/snapshot", "/api/analytics/insights",
  ]).has(path) || /^\/api\/studio\/[A-Za-z0-9_-]+\/feed$/.test(path) ||
    /^\/api\/studio\/(?:drafts|boards)\/[A-Za-z0-9_-]+$/.test(path) ||
    /^\/api\/settings\/design-slots\/[A-Za-z0-9_-]+$/.test(path) ||
    /^\/api\/settings\/landscapes\/\d+$/.test(path);
}

export function assertPreviewWritable(): void {
  if (isContentFactoryPreview()) {
    throw Object.assign(new Error(PREVIEW_READ_ONLY_MESSAGE), { code: "preview_read_only" });
  }
}
