export type PreviewMode = "reels_9_16" | "carousel_4_5";

export type InspectStatus = "awaiting_signoff" | "approved" | "scheduled";

export type KaraokeLine = {
  startSec: number;
  endSec: number;
  textHy: string;
  textRu: string;
  highlightHy?: string;
};

export type CarouselSlide = {
  id: string;
  order: number;
  badge: string;
  filename: string;
  imageUrl?: string;
  version: number;
};

export type HookOption = {
  id: string;
  text: string;
  retentionHint: string;
  score: number;
};

export type PersonaState = {
  avatarId: string;
  emotion: string;
  voiceId: string;
  speechRate: string;
};

export type InspectDraft = {
  id: string;
  jobLabel: string;
  pipelineName: string;
  status: InspectStatus;
  scheduledAt: string | null;
  approveModalOpen: boolean;
  previewMode: PreviewMode;
  reels: {
    durationSec: number;
    currentTimeSec: number;
    playing: boolean;
    posterUrl: string;
    captions: KaraokeLine[];
  };
  slides: CarouselSlide[];
  selectedSlideId: string;
  viralityScore: number;
  hooks: HookOption[];
  activeHookId: string;
  script: string;
  persona: PersonaState;
};

const SLIDE_SEED: Omit<CarouselSlide, "order" | "version">[] = [
  {
    id: "slide-01",
    badge: "01·HOOK",
    filename: "Cover_Hook.png",
    imageUrl:
      "linear-gradient(145deg, #1a2332 0%, #2563eb33 45%, #0d0f12 100%)",
  },
  {
    id: "slide-02",
    badge: "02·CONTEXT",
    filename: "Historical_Context.png",
    imageUrl:
      "linear-gradient(160deg, #2a1f14 0%, #d4a35933 50%, #0d0f12 100%)",
  },
  {
    id: "slide-03",
    badge: "03·QUOTE",
    filename: "Quote_Card.png",
    imageUrl:
      "linear-gradient(180deg, #1e2023 0%, #3b82f622 40%, #0d0f12 100%)",
  },
  {
    id: "slide-04",
    badge: "04·SCENE",
    filename: "Cafe_Discourse.png",
    imageUrl:
      "linear-gradient(135deg, #241816 0%, #c8644633 55%, #0d0f12 100%)",
  },
  {
    id: "slide-05",
    badge: "05·PROOF",
    filename: "Archive_Proof.png",
    imageUrl:
      "linear-gradient(150deg, #12161c 0%, #2563eb28 48%, #0d0f12 100%)",
  },
  {
    id: "slide-06",
    badge: "06·STORY",
    filename: "Diaspora_Story.png",
    imageUrl:
      "linear-gradient(170deg, #1c1810 0%, #d4a35928 52%, #0d0f12 100%)",
  },
  {
    id: "slide-07",
    badge: "07·TENSION",
    filename: "Salon_Tension.png",
    imageUrl:
      "linear-gradient(155deg, #1a1214 0%, #c8644628 50%, #0d0f12 100%)",
  },
  {
    id: "slide-08",
    badge: "08·CTA",
    filename: "CTA_Join.png",
    imageUrl:
      "linear-gradient(145deg, #141820 0%, #3b82f633 40%, #d4a35922 100%)",
  },
];

const CAPTIONS: KaraokeLine[] = [
  {
    startSec: 0,
    endSec: 8,
    textHy: "«Ի՞նչն է քեզ երջանիկ դարձնում...»",
    textRu: "«Что на самом деле зажигает огонь спора?»",
    highlightHy: "երջանիկ",
  },
  {
    startSec: 8,
    endSec: 18,
    textHy: "«Խոսքը ուժ է, երբ այն կիսում ես...»",
    textRu: "«Слово становится силой, когда им делятся...»",
    highlightHy: "ուժ",
  },
  {
    startSec: 18,
    endSec: 32,
    textHy: "«Երևանի երեկոյան սրճարաններում...»",
    textRu: "«В вечерних кафе Еревана споры длятся веками...»",
    highlightHy: "Երևանի",
  },
  {
    startSec: 32,
    endSec: 45,
    textHy: "«Միացիր Vernatun սրահին այսօր.»",
    textRu: "«Присоединяйся к салону Vernatun сегодня.»",
    highlightHy: "Vernatun",
  },
];

const HOOKS: HookOption[] = [
  {
    id: "hook-1",
    text: "«Did you know Yerevan evening cafe debates have a 100-year history?»",
    retentionHint: "+42% Expected Retention · High Emotional Resonance",
    score: 42,
  },
  {
    id: "hook-2",
    text: "«Stop studying Armenian grammar rules. Here is how people actually speak.»",
    retentionHint: "+29% Retention · Contrarian / Educational",
    score: 29,
  },
  {
    id: "hook-3",
    text: "«What happens when 12 strangers gather in an antique salon in Moscow?»",
    retentionHint: "+35% Retention · Mystery / Diaspora Story",
    score: 35,
  },
];

export function createInspectDraft(id = "demo"): InspectDraft {
  const slides: CarouselSlide[] = SLIDE_SEED.map((slide, index) => ({
    ...slide,
    order: index,
    version: 1,
  }));

  return {
    id: id || "demo",
    jobLabel: "#JOB-8842",
    pipelineName: "Vernatun_Salon_Omni_v3.4",
    status: "awaiting_signoff",
    scheduledAt: null,
    approveModalOpen: false,
    previewMode: "reels_9_16",
    reels: {
      durationSec: 45,
      currentTimeSec: 24,
      playing: false,
      posterUrl:
        "linear-gradient(165deg, #0c0e11 0%, #1a2332 35%, #2a1f14 70%, #0d0f12 100%)",
      captions: CAPTIONS,
    },
    slides,
    selectedSlideId: slides[0]?.id ?? "slide-01",
    viralityScore: 78,
    hooks: HOOKS,
    activeHookId: "hook-1",
    script:
      "[HY] Բարև ձեզ։ Այսօր կխոսենք Երևանի երեկոյան սրճարանների մասին...\n[RU] Здравствуйте. Сегодня поговорим о вечерних кафе Еревана...",
    persona: {
      avatarId: "anna",
      emotion: "warm",
      voiceId: "hy-anna-warm",
      speechRate: "natural",
    },
  };
}
