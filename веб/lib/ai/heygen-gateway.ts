/**
 * HeyGen gateway (C-20) — AI Bridge ownership.
 * Sole reader of `process.env.HEYGEN_API_KEY`. Never logs the key.
 * Without key → mock URL + { mock: true }. Live failures → mock + human feedback (no throw).
 */

import {
  MOCK_MP4_URL,
  MOCK_VIDEO_9_16,
} from "@/modules/_shared/mock-assets";

const HEYGEN_API_BASE = "https://api.heygen.com";

/** Public demo defaults when caller omits persona ids (override via env / input). */
const DEFAULT_AVATAR_ID = "Kristin_public_3_20240108";
const DEFAULT_VOICE_ID = "2f72ee82b83d4b00af16c4771d611752";

export interface HeyGenCreateAvatarVideoInput {
  script: string;
  avatarId?: string;
  voiceId?: string;
  /** Optional title for HeyGen dashboard. */
  title?: string;
  /** Force test mode (watermarked, no credits). Env HEYGEN_TEST_MODE=1 also enables. */
  test?: boolean;
}

export interface HeyGenCreateAvatarVideoResult {
  url: string;
  mock: boolean;
  providerJobId?: string;
  width?: number;
  height?: number;
  mime?: string;
  /** Human notes — never include API key. */
  feedbackLogs?: string[];
}

type HeyGenGenerateResponse = {
  error?: string | { message?: string; code?: string } | null;
  data?: { video_id?: string } | null;
  message?: string;
};

type HeyGenStatusResponse = {
  code?: number;
  message?: string;
  data?: {
    status?: string;
    video_url?: string;
    video_url_caption?: string;
    error?: string | null;
    failure_message?: string | null;
  } | null;
};

function mockResult(
  logs: string[],
  extras?: Partial<HeyGenCreateAvatarVideoResult>,
): HeyGenCreateAvatarVideoResult {
  return {
    url: MOCK_MP4_URL,
    mock: true,
    width: MOCK_VIDEO_9_16.width,
    height: MOCK_VIDEO_9_16.height,
    mime: MOCK_VIDEO_9_16.mime,
    feedbackLogs: logs,
    ...extras,
  };
}

/** Strip anything that looks like a bearer/api key from provider text. */
function sanitizeProviderText(raw: string): string {
  return raw
    .replace(/x-api-key\s*[:=]\s*\S+/gi, "x-api-key=[redacted]")
    .replace(/\bsk-[a-zA-Z0-9_-]{8,}\b/g, "[redacted]")
    .replace(/\b[a-f0-9]{32,}\b/gi, (m) =>
      m.length >= 40 ? "[redacted]" : m,
    )
    .slice(0, 280);
}

function humanizeHeyGenError(status: number, bodyText: string): string {
  const lower = bodyText.toLowerCase();
  if (status === 401 || status === 403 || lower.includes("unauthorized")) {
    return "HeyGen отклонил ключ (проверьте HEYGEN_API_KEY в .env).";
  }
  if (status === 429 || lower.includes("quota") || lower.includes("credit")) {
    return "HeyGen: лимит кредитов или слишком много запросов. Попробуйте позже.";
  }
  if (lower.includes("avatar")) {
    return "HeyGen: неверный или недоступный avatar id.";
  }
  if (lower.includes("voice")) {
    return "HeyGen: неверный или недоступный voice id.";
  }
  if (lower.includes("script") || lower.includes("text") || lower.includes("length")) {
    return "HeyGen: проблема со скриптом (длина или формат текста).";
  }
  if (status >= 500) {
    return "HeyGen временно недоступен (ошибка сервера).";
  }
  const cleaned = sanitizeProviderText(bodyText.trim()) || `HTTP ${status}`;
  return `HeyGen: ${cleaned}`;
}

function resolveApiKey(): string | null {
  const key = process.env.HEYGEN_API_KEY?.trim();
  return key ? key : null;
}

function resolveAvatarId(input: HeyGenCreateAvatarVideoInput): string {
  return (
    input.avatarId?.trim() ||
    process.env.HEYGEN_DEFAULT_AVATAR_ID?.trim() ||
    DEFAULT_AVATAR_ID
  );
}

function resolveVoiceId(input: HeyGenCreateAvatarVideoInput): string {
  return (
    input.voiceId?.trim() ||
    process.env.HEYGEN_DEFAULT_VOICE_ID?.trim() ||
    DEFAULT_VOICE_ID
  );
}

function isTestMode(input: HeyGenCreateAvatarVideoInput): boolean {
  if (typeof input.test === "boolean") return input.test;
  const env = process.env.HEYGEN_TEST_MODE?.trim();
  return env === "1" || env?.toLowerCase() === "true";
}

function pollBudgetMs(): number {
  const raw = Number(process.env.HEYGEN_POLL_MS);
  if (Number.isFinite(raw) && raw >= 0) return Math.min(120_000, Math.floor(raw));
  // Sync API path: keep short so Next.js /studio never hangs.
  return 12_000;
}

async function submitGenerate(
  apiKey: string,
  input: HeyGenCreateAvatarVideoInput,
): Promise<{ videoId: string } | { error: string }> {
  const script = input.script.trim();
  if (!script) {
    return { error: "Пустой скрипт для аватара — нечего озвучивать." };
  }

  const avatarId = resolveAvatarId(input);
  const voiceId = resolveVoiceId(input);
  const body = {
    caption: true,
    title: input.title?.slice(0, 120) || "Content Factory reel",
    test: isTestMode(input),
    dimension: {
      width: MOCK_VIDEO_9_16.width,
      height: MOCK_VIDEO_9_16.height,
    },
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          voice_id: voiceId,
          input_text: script.slice(0, 4500),
        },
        background: {
          type: "color",
          value: "#1a1a1a",
        },
      },
    ],
  };

  const res = await fetch(`${HEYGEN_API_BASE}/v2/video/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let json: HeyGenGenerateResponse = {};
  try {
    json = JSON.parse(rawText) as HeyGenGenerateResponse;
  } catch {
    return { error: humanizeHeyGenError(res.status, rawText || "invalid JSON") };
  }

  if (!res.ok) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error?.message || json.message || rawText;
    return { error: humanizeHeyGenError(res.status, msg || `HTTP ${res.status}`) };
  }

  if (json.error) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error.message || "unknown provider error";
    return { error: humanizeHeyGenError(res.status || 400, msg) };
  }

  const videoId = json.data?.video_id;
  if (!videoId) {
    return { error: "HeyGen не вернул video_id — генерация не стартовала." };
  }
  return { videoId };
}

async function pollVideoUrl(
  apiKey: string,
  videoId: string,
  budgetMs: number,
): Promise<
  | { status: "completed"; url: string }
  | { status: "failed"; error: string }
  | { status: "pending" }
> {
  if (budgetMs <= 0) return { status: "pending" };

  const started = Date.now();
  const intervalMs = 2_000;

  while (Date.now() - started < budgetMs) {
    const url = `${HEYGEN_API_BASE}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
    });
    const rawText = await res.text();
    let json: HeyGenStatusResponse = {};
    try {
      json = JSON.parse(rawText) as HeyGenStatusResponse;
    } catch {
      return {
        status: "failed",
        error: humanizeHeyGenError(res.status, rawText || "status parse error"),
      };
    }

    const st = (json.data?.status || "").toLowerCase();
    if (st === "completed") {
      const videoUrl = json.data?.video_url || json.data?.video_url_caption;
      if (videoUrl) return { status: "completed", url: videoUrl };
      return {
        status: "failed",
        error: "HeyGen: статус completed, но URL видео отсутствует.",
      };
    }
    if (st === "failed" || st === "error") {
      const reason =
        json.data?.failure_message ||
        json.data?.error ||
        json.message ||
        "генерация провалилась";
      return {
        status: "failed",
        error: humanizeHeyGenError(res.status || 400, String(reason)),
      };
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return { status: "pending" };
}

/**
 * Create an avatar video.
 * - No HEYGEN_API_KEY → mock (never throws).
 * - Key present → live POST /v2/video/generate (+ short poll). Errors → mock + human logs.
 */
export async function createAvatarVideo(
  input: HeyGenCreateAvatarVideoInput,
): Promise<HeyGenCreateAvatarVideoResult> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return mockResult([
      "heygen=mock",
      "reason=HEYGEN_API_KEY_absent",
      `script_len=${input.script.length}`,
    ]);
  }

  try {
    const submitted = await submitGenerate(apiKey, input);
    if ("error" in submitted) {
      return mockResult([
        "heygen=mock",
        "reason=live_submit_failed",
        `error=${sanitizeProviderText(submitted.error)}`,
        `avatarId=${resolveAvatarId(input)}`,
      ]);
    }

    const polled = await pollVideoUrl(
      apiKey,
      submitted.videoId,
      pollBudgetMs(),
    );

    if (polled.status === "completed") {
      return {
        url: polled.url,
        mock: false,
        providerJobId: submitted.videoId,
        width: MOCK_VIDEO_9_16.width,
        height: MOCK_VIDEO_9_16.height,
        mime: MOCK_VIDEO_9_16.mime,
        feedbackLogs: [
          "heygen=live",
          `providerJobId=${submitted.videoId}`,
          `avatarId=${resolveAvatarId(input)}`,
          isTestMode(input) ? "test_mode=1" : "test_mode=0",
        ],
      };
    }

    if (polled.status === "failed") {
      return mockResult(
        [
          "heygen=mock",
          "reason=live_render_failed",
          `error=${sanitizeProviderText(polled.error)}`,
          `providerJobId=${submitted.videoId}`,
        ],
        { providerJobId: submitted.videoId },
      );
    }

    // Submitted but still processing within sync budget — keep mock URL for UI.
    return mockResult(
      [
        "heygen=mock",
        "reason=live_pending_poll_timeout",
        `providerJobId=${submitted.videoId}`,
        "hint=job_submitted_check_heygen_dashboard",
      ],
      { providerJobId: submitted.videoId },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "неизвестная ошибка сети";
    return mockResult([
      "heygen=mock",
      "reason=live_exception",
      `error=${sanitizeProviderText(message)}`,
    ]);
  }
}
