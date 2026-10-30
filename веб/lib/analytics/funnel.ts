/**
 * Content → Community → Meeting funnel (KPI №1 «люди на живых встречах»).
 *
 * Источники реальных данных (подключаются при наличии ключей/ввода владельца):
 *  - stage "content": суммарный охват по модулям из PostAnalytics (reach/views).
 *  - stage "telegram": новые подписчики TG-канала (TG Bot API / ручной ввод).
 *  - stage "meeting":  пришли на встречу (регистрации в @vernatunbot / ручной ввод).
 *  - stage "retained": вернулись после первой встречи (ручной ввод / CRM).
 * До подключения — seed-демо (source: "seed"), помечается бейджем в UI.
 */

export type FunnelStageId = "content" | "telegram" | "meeting" | "retained";

export type FunnelStage = {
  id: FunnelStageId;
  label: string;
  /** Короткая расшифровка под числом. */
  hint: string;
  /** Абсолютное число людей на этом шаге. */
  value: number;
  /** Акцент-токен UI. */
  accent: "blue" | "gold" | "terracotta" | "cyan";
};

export type ContentFunnel = {
  stages: FunnelStage[];
  /** "live" — из реальных данных; "seed" — демо до подключения. */
  source: "live" | "seed";
  /** Период окна. */
  windowLabel: string;
};

/** Seed-демо воронки (до подключения реальных данных). */
export function getContentFunnelSeed(): ContentFunnel {
  return {
    source: "seed",
    windowLabel: "за 30 дней",
    stages: [
      {
        id: "content",
        label: "Контент: охват",
        hint: "посмотрели рилсы / прочитали статьи / карусели / YouTube",
        value: 52000,
        accent: "cyan",
      },
      {
        id: "telegram",
        label: "Зашли в Telegram",
        hint: "новые подписчики @mosarmclub",
        value: 1800,
        accent: "blue",
      },
      {
        id: "meeting",
        label: "Пришли на встречу",
        hint: "регистрации в @vernatunbot → были на встрече",
        value: 240,
        accent: "gold",
      },
      {
        id: "retained",
        label: "Остались после первой",
        hint: "вернулись на 2-ю+ встречу",
        value: 96,
        accent: "terracotta",
      },
    ],
  };
}

/** Конверсия между шагами, % (шаг N → шаг N+1). */
export function funnelConversions(f: ContentFunnel): number[] {
  const out: number[] = [];
  for (let i = 0; i < f.stages.length - 1; i++) {
    const a = f.stages[i]!.value;
    const b = f.stages[i + 1]!.value;
    out.push(a > 0 ? (b / a) * 100 : 0);
  }
  return out;
}

/** Компактный формат числа (52000 → «52K»). */
export function formatFunnelValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${n}`;
}
