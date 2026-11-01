/**
 * Seed-план расписания (владелец попросил заполнить «пока что» этим списком).
 * Один источник и для календаря (слева), и для списка (справа).
 * Заменится реальными пушами Контент-директора.
 */

export type PlanSlotType =
  | "reel"
  | "carousel"
  | "article-site"
  | "article-tg"
  | "cartoon"
  | "youtube";

export type PlanSlot = {
  type: PlanSlotType;
  title: string;
  dest: string;
  time: string;
};

export type PlanDay = { day: number; weekday: string; slots: PlanSlot[] };

/** Текущий месяц плана (0-индексный: ноябрь = 10, 2026). */
export const PLAN_YEAR = 2026;
export const PLAN_MONTH = 10;

export const SEED_PLAN: PlanDay[] = [
  {
    day: 4,
    weekday: "Вт",
    slots: [
      { type: "reel", title: "«3 места, где звучит армянский в Москве»", dest: "Instagram Reels + TG", time: "20:00" },
    ],
  },
  {
    day: 8,
    weekday: "Сб",
    slots: [
      { type: "reel", title: "«Как вернуть подзабытый армянский»", dest: "Instagram Reels", time: "19:00" },
      { type: "article-site", title: "Гид: куда пойти армянину в Москве", dest: "vernatunspeakclub.com + TG", time: "12:00" },
    ],
  },
  {
    day: 11,
    weekday: "Вт",
    slots: [
      { type: "carousel", title: "«5 фраз для первого разговора»", dest: "Instagram", time: "20:00" },
      { type: "article-tg", title: "Мини-история клуба: встреча недели", dest: "Telegram (Telegra.ph)", time: "18:00" },
    ],
  },
  {
    day: 15,
    weekday: "Сб",
    slots: [
      { type: "reel", title: "«Один вечер в разговорной комнате»", dest: "Instagram Reels", time: "15:00" },
      { type: "cartoon", title: "Мульт-история: как я заговорил", dest: "Instagram + TG", time: "19:00" },
    ],
  },
  {
    day: 18,
    weekday: "Вт",
    slots: [
      { type: "carousel", title: "«Разбор: армянский за 15 минут в день»", dest: "Instagram", time: "20:00" },
    ],
  },
  {
    day: 22,
    weekday: "Сб",
    slots: [
      { type: "youtube", title: "«История одного слова» — мультвидео", dest: "YouTube", time: "14:00" },
      { type: "reel", title: "«Армянский сленг, который все путают»", dest: "Instagram Reels", time: "19:00" },
    ],
  },
  {
    day: 25,
    weekday: "Вт",
    slots: [
      { type: "carousel", title: "«Топ-5 ошибок новичка»", dest: "Instagram", time: "20:00" },
    ],
  },
  {
    day: 29,
    weekday: "Сб",
    slots: [
      { type: "article-site", title: "Лонгрид: зачем клубу живые встречи", dest: "vernatunspeakclub.com", time: "12:00" },
      { type: "reel", title: "«Как проходит встреча Вернатун»", dest: "Instagram Reels + TG", time: "15:00" },
    ],
  },
];
