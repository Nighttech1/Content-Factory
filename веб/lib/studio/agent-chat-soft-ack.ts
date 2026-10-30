/**
 * C-155 AI Bridge — soft-fail ack copy per agent role (no LLM).
 * Keep in sync with app/api/studio/agent-chat soft mock.
 *
 * C-carousel-agents: Create carousel path MUST NOT use soft success.
 * Soft-ack below remains for Razbor / legacy soft-fail only.
 * When Create fails → source: "error" + createCarouselErrorMessage(code).
 */

export const AGENT_CHAT_SOFT_ACK = {
  scriptwriter: "Ок, подправлю сценарий с учётом вашего комментария.",
  designer: "Ок, подправлю макет слайдов.",
  artDirector:
    "Ок, учту замечания по сценарию и кадрам — напишите, что поправить.",
  publisher:
    "Записал для слота публикации — уточните дату/время при необходимости.",
  analyst: "Принял правку — учту в следующем проходе разбора.",
  razbor: "Принял правку — учту в следующем проходе разбора.",
} as const;

/**
 * Create carousel: never treat soft-ack / mock as success.
 * Backend + client must branch Create modes to `source: "error"`.
 */
export const CREATE_CAROUSEL_NO_MOCK = true;

const CREATE_CAROUSEL_ERROR_RU: Record<string, string> = {
  missing_key:
    "Нет доступа к AI-сервису. Проверьте настройки ключа и попробуйте снова.",
  aggregator_unavailable:
    "AI-сервис временно недоступен. Попробуйте ещё раз чуть позже.",
  upstream_fail:
    "Не удалось получить ответ от AI. Повторите запрос или упростите задание.",
  empty_reply:
    "AI вернул пустой ответ. Попробуйте переформулировать сообщение.",
  timeout: "Превышено время ожидания ответа. Попробуйте ещё раз.",
  draw_fail:
    "Не удалось нарисовать слайды. Проверьте описание и повторите «Нарисовать».",
  generate_slides_fail:
    "Ошибка генерации кадров карусели. Повторите «Нарисовать» или уточните описание.",
  handoff_fail:
    "Не удалось передать задание. Проверьте ответ сценариста и попробуйте снова.",
  invalid_mode: "Некорректный режим чата. Обновите страницу и повторите.",
  invalid_request: "Некорректный запрос. Обновите страницу и повторите.",
  carousel_json_missing:
    "Нет JSON карусели для отрисовки. Дождитесь ответа сценариста с JSON или передайте carouselJson.",
  carousel_json_invalid:
    "JSON карусели некорректный (схема или число слайдов). Исправьте JSON и нажмите «Нарисовать» снова.",
  carousel_json_count:
    "Число слайдов в JSON не совпадает с requested_slide_count. Исправьте JSON и повторите.",
};

/**
 * User-safe RU error for Create carousel (no secrets, no stack traces).
 */
export function createCarouselErrorMessage(code: string): string {
  const key = code.trim().toLowerCase();
  return (
    CREATE_CAROUSEL_ERROR_RU[key] ??
    "Не удалось выполнить шаг. Попробуйте ещё раз."
  );
}
