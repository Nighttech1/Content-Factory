/**
 * C-80 — mock snapshot for Self-learning diagnostics (no secrets).
 * C-127 — Trainer RL proposals + HITL status.
 * C-128 — retention cohort at3 / at15.
 */

import type {
  AnalyticsDashboard,
  RetentionPoint,
  RetentionSummary,
} from "@/types/analytics";

const RETENTION_COHORT_TOTAL = 50;

function buildRetentionSeries(): RetentionPoint[] {
  return Array.from({ length: 16 }, (_, i) => {
    const second = i;
    const ideal = Math.max(18, 100 - second * 4.2);
    const ours = Math.max(
      12,
      ideal - 6 - (second > 8 ? (second - 8) * 1.4 : 0),
    );
    const bench = Math.max(20, ideal + 2 - second * 0.4);
    return {
      second,
      ourAssetRetention: Math.round(ours * 10) / 10,
      competitorOutlierBenchmark: Math.round(bench * 10) / 10,
      idealRetentionCurve: Math.round(ideal * 10) / 10,
    };
  });
}

/** Cohort snapshot from series %; example-friendly at15 = 62% (31/50). */
function buildRetentionSummary(series: RetentionPoint[]): RetentionSummary {
  const at3Pct =
    series.find((p) => p.second === 3)?.ourAssetRetention ?? 0;
  // Spec example format: 62% (31/50) — pin at15 for readable demo callout
  return {
    at3: {
      pct: Math.round(at3Pct),
      total: RETENTION_COHORT_TOTAL,
      retained: Math.floor((at3Pct / 100) * RETENTION_COHORT_TOTAL),
    },
    at15: {
      pct: 62,
      total: RETENTION_COHORT_TOTAL,
      retained: 31,
    },
  };
}

export function getSelfLearningDashboard(): AnalyticsDashboard {
  const retention = buildRetentionSeries();
  // Align series point @15 with summary callout for chart consistency
  const idx15 = retention.findIndex((p) => p.second === 15);
  if (idx15 >= 0) {
    retention[idx15] = {
      ...retention[idx15]!,
      ourAssetRetention: 62,
    };
  }
  const retentionSummary = buildRetentionSummary(retention);

  return {
    kpis: [
      {
        id: "scout-volume",
        label: "Разведка за 7 дней",
        value: "1 284",
        delta: "+18%",
        isPositive: true,
        subtext: "постов конкурентов по столбам",
        accentColor: "cyan",
      },
      {
        id: "outliers",
        label: "Аномалии 5×+",
        value: "37",
        delta: "+6",
        isPositive: true,
        subtext: "готовы к разбору Разборщиком",
        accentColor: "amber",
      },
      {
        id: "retention",
        label: "Удержание 3с",
        value: "71%",
        delta: "−2п.п.",
        isPositive: false,
        benchmark: "outlier 79%",
        subtext: "наши live vs бенчмарк",
        accentColor: "rose",
      },
      {
        id: "rl-cycles",
        label: "Циклы обучения",
        value: "12",
        delta: "журнал",
        isPositive: true,
        subtext: "записи эвристик (мок, без обучения модели)",
        accentColor: "emerald",
      },
    ],
    scout: [
      {
        pillar: "Linguistic Slang",
        pillarRu: "Сленг и речь",
        scoutedUnits: 412,
        qualifiedUnits: 188,
        outliersDetected: 11,
        formatDistribution: { reels: 220, carousels: 140, shorts: 52 },
        fatigueIndex: 34,
      },
      {
        pillar: "Cultural History",
        pillarRu: "Культура и история",
        scoutedUnits: 298,
        qualifiedUnits: 121,
        outliersDetected: 8,
        formatDistribution: { reels: 160, carousels: 90, shorts: 48 },
        fatigueIndex: 41,
      },
      {
        pillar: "Diaspora Bohemia",
        pillarRu: "Диаспора / богема",
        scoutedUnits: 356,
        qualifiedUnits: 154,
        outliersDetected: 12,
        formatDistribution: { reels: 190, carousels: 110, shorts: 56 },
        fatigueIndex: 28,
      },
      {
        pillar: "Humor & Memes",
        pillarRu: "Юмор и мемы",
        scoutedUnits: 218,
        qualifiedUnits: 97,
        outliersDetected: 6,
        formatDistribution: { reels: 150, carousels: 40, shorts: 28 },
        fatigueIndex: 62,
      },
    ],
    outliers: Array.from({ length: 15 }, (_, i) => {
      const platforms = ["instagram", "tiktok", "youtube"] as const;
      const hooks = [
        "Open Loop Curiosity",
        "Pattern Interrupt",
        "Visual Shock",
        "Contrarian Statement",
      ] as const;
      const hooksRu = [
        "Открытый цикл любопытства",
        "Слом паттерна",
        "Визуальный шок",
        "Контринтуитивный тезис",
      ] as const;
      const triggers = [
        "Save (High Utility)",
        "Share (Identity)",
        "Comment (Provocation)",
      ] as const;
      const triggersRu = [
        "Сохранения (польза)",
        "Репосты (идентичность)",
        "Комменты (провокация)",
      ] as const;
      const statuses = [
        "BLUEPRINT_READY",
        "DECONSTRUCTED",
        "SYNTHESIZED",
      ] as const;
      const statusesRu = ["Чертёж готов", "Разобран", "Синтезирован"] as const;
      const p = platforms[i % 3]!;
      const h = i % 4;
      const t = i % 3;
      const s = i % 3;
      return {
        id: `out-${i + 1}`,
        title: [
          "Гостевой вечер: 3 фразы, которые заходят",
          "Почему «гость» звучит иначе в клубе",
          "Мем про барную очередь — 15с",
          "Рецепт тоста на hy + punchline",
          "До/после: свет в зале за 20с",
          "Секрет длинной очереди у входа",
          "Как сказать «ещё бокал» без пафоса",
          "Карта столиков глазами гостя",
          "История одного плейлиста пятницы",
          "Тихие сигналы хорошего сервиса",
          "Армянский breakfast hack",
          "Что снимать, когда зал пустой",
          "Хук на сленг диаспоры",
          "Контраст: шум улицы / тишина VIP",
          "Финал рилса с вопросом в камеру",
        ][i]!,
        creatorHandle: `@club.scout${i + 1}`,
        platform: p,
        originalUrl: `https://example.com/out/${i + 1}`,
        thumbnailUrl: `https://picsum.photos/seed/cf-out-${i + 1}/320/560`,
        multiplier: Math.round((14.2 - i * 0.55) * 10) / 10,
        views: `${Math.max(40, 480 - i * 28)}K`,
        saveRate: `${Math.max(2, 9.4 - i * 0.4).toFixed(1)}%`,
        hookType: hooks[h]!,
        hookTypeRu: hooksRu[h]!,
        primaryTrigger: triggers[t]!,
        primaryTriggerRu: triggersRu[t]!,
        status: statuses[s]!,
        statusRu: statusesRu[s]!,
        scoutedAt: `2026-10-${String(8 - (i % 7)).padStart(2, "0")}T12:00:00.000Z`,
      };
    }),
    retention,
    retentionSummary,
    rlFeed: [
      {
        id: "rl-1",
        cycle: 12,
        timestamp: "2026-10-08T08:10:00.000Z",
        category: "HOOK",
        categoryRu: "Хук",
        badge: "вес +0.12",
        actionText:
          "Усилить открытый вопрос в первые 1.5с карусели (cover text).",
        deltaImpact: "saves +1.8п.п. на тесте",
        lossConvergence: 78,
        author: "trainer",
        status: "pending",
      },
      {
        id: "rl-2",
        cycle: 11,
        timestamp: "2026-10-07T21:00:00.000Z",
        category: "PACING",
        categoryRu: "Темп",
        badge: "эвристика",
        actionText: "Сократить beat 3 в HeyGen-скрипте до 2.2с.",
        deltaImpact: "retention@5с +3.1п.п.",
        lossConvergence: 71,
        author: "trainer",
        status: "pending",
      },
      {
        id: "rl-3",
        cycle: 10,
        timestamp: "2026-10-07T14:30:00.000Z",
        category: "VISUAL_BROLL",
        categoryRu: "Визуал",
        badge: "мутация",
        actionText: "Glass-карточка на слайде 2 вместо плоского фона.",
        deltaImpact: "CTR превью +0.6п.п.",
        lossConvergence: 66,
        author: "trainer",
        status: "pending",
      },
    ],
    telemetry: [
      {
        id: "tel-1",
        title: "Guest night · карусель Vernatun",
        categoryTag: "гость",
        module: "Carousel",
        moduleRu: "Карусель",
        channels: ["Instagram", "Сайт"],
        reach: "28.4K",
        engagementRate: "6.8%",
        saveRate: "4.9%",
        status: "LIVE",
        statusRu: "В эфире",
      },
      {
        id: "tel-2",
        title: "Сленг зала · avatar",
        categoryTag: "сленг",
        module: "HeyGen",
        moduleRu: "HeyGen",
        channels: ["Instagram", "TikTok"],
        reach: "51.2K",
        engagementRate: "8.1%",
        saveRate: "5.4%",
        status: "OPTIMIZING",
        statusRu: "Оптимизация",
      },
      {
        id: "tel-3",
        title: "Мем-очередь · 2D",
        categoryTag: "юмор",
        module: "Cartoon",
        moduleRu: "Мульт",
        channels: ["YouTube Shorts"],
        reach: "12.0K",
        engagementRate: "5.2%",
        saveRate: "2.1%",
        status: "MUTATING",
        statusRu: "Мутация",
      },
    ],
  };
}
