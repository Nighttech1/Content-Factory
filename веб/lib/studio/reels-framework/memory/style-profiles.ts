export type StyleProfile = {
  id: string;
  title: string;
  description: string;
  tempo: "fast" | "medium" | "calm";
  avgSceneSec: number;
  graphicsDensity: "low" | "medium" | "high";
  subtitleStyle: "bold" | "clean" | "karaoke";
  transitions: "cut" | "soft";
  memeFrequency: "off" | "low" | "high";
  musicMood: string;
};

export const STYLE_PROFILES: StyleProfile[] = [
  {
    id: "dynamic",
    title: "Динамичный",
    description: "Короткие фрагменты, частые акценты",
    tempo: "fast",
    avgSceneSec: 2.5,
    graphicsDensity: "high",
    subtitleStyle: "bold",
    transitions: "cut",
    memeFrequency: "low",
    musicMood: "energetic",
  },
  {
    id: "professional",
    title: "Профессиональный",
    description: "Чистая композиция, сдержанная графика",
    tempo: "medium",
    avgSceneSec: 4,
    graphicsDensity: "low",
    subtitleStyle: "clean",
    transitions: "soft",
    memeFrequency: "off",
    musicMood: "neutral",
  },
  {
    id: "comedy",
    title: "Комедийный",
    description: "Реакции, контрасты, акценты на шутках",
    tempo: "fast",
    avgSceneSec: 2,
    graphicsDensity: "medium",
    subtitleStyle: "bold",
    transitions: "cut",
    memeFrequency: "high",
    musicMood: "playful",
  },
  {
    id: "explainer",
    title: "Объясняющий",
    description: "Схемы, подписи, последовательное раскрытие",
    tempo: "calm",
    avgSceneSec: 5,
    graphicsDensity: "medium",
    subtitleStyle: "clean",
    transitions: "soft",
    memeFrequency: "off",
    musicMood: "focus",
  },
];

export const DEFAULT_STYLE_PROFILE_ID = "professional";

export function getStyleProfile(id: string): StyleProfile {
  return STYLE_PROFILES.find((p) => p.id === id) || STYLE_PROFILES[1]!;
}
