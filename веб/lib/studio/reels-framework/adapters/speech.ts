/**
 * OpenAI-compatible Whisper adapter (WHISPER_BASE_URL).
 */

import fs from "node:fs";
import path from "node:path";

export type SpeechResult =
  | {
      ok: true;
      text: string;
      segments?: Array<{ start: number; end: number; text: string }>;
    }
  | { ok: false; error: string };

export async function transcribeAudioFile(filePath: string): Promise<SpeechResult> {
  const base = process.env.WHISPER_BASE_URL?.trim();
  if (!base) {
    return { ok: false, error: "whisper_not_configured" };
  }
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: "file_missing" };
  }

  try {
    const buf = fs.readFileSync(filePath);
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buf)], { type: "audio/mpeg" });
    form.append("file", blob, path.basename(filePath));
    form.append("model", process.env.WHISPER_MODEL || "Systran/faster-whisper-small");
    if (process.env.WHISPER_LANGUAGE) {
      form.append("language", process.env.WHISPER_LANGUAGE);
    }
    form.append("response_format", "verbose_json");

    const headers: Record<string, string> = {};
    if (process.env.WHISPER_API_KEY) {
      headers.Authorization = `Bearer ${process.env.WHISPER_API_KEY}`;
    }

    const res = await fetch(`${base.replace(/\/$/, "")}/v1/audio/transcriptions`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) {
      return { ok: false, error: `whisper_http_${res.status}` };
    }
    const data = (await res.json()) as {
      text?: string;
      segments?: Array<{ start: number; end: number; text: string }>;
    };
    return {
      ok: true,
      text: data.text || "",
      segments: data.segments,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "whisper_failed",
    };
  }
}
