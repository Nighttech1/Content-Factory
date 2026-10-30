"use client";

import { useCallback, useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/glow-button";
import { cn } from "@/lib/cn";

type ReelRow = {
  id: string;
  topic: string;
  status: string;
  planVersion: number;
  finalPath?: string;
  lastError?: string;
  sources: unknown[];
  script?: { version: number };
};

export function ReelsFrameworkPanel() {
  const [reels, setReels] = useState<ReelRow[]>([]);
  const [topic, setTopic] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/reels");
    const data = (await res.json()) as { ok?: boolean; reels?: ReelRow[] };
    if (data.ok && data.reels) setReels(data.reels);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selected = reels.find((r) => r.id === selectedId) || null;

  async function createReel() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim() || "Новый рилс",
          generateScript: true,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; reel?: ReelRow; error?: string };
      if (!data.ok || !data.reel) {
        setMessage(data.error || "Не удалось создать");
        return;
      }
      setSelectedId(data.reel.id);
      setTopic("");
      await refresh();
      setMessage("Сценарий готов — загрузите съёмку");
    } finally {
      setBusy(false);
    }
  }

  async function uploadSource(file: File) {
    if (!selectedId) return;
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/reels/${selectedId}/sources`, {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setMessage(data.error || "Ошибка загрузки");
        return;
      }
      await refresh();
      setMessage("Материал загружен");
    } finally {
      setBusy(false);
    }
  }

  async function renderSelected() {
    if (!selectedId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/reels/${selectedId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCreativeDirector: true }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reel?: ReelRow;
      };
      await refresh();
      if (!data.ok) {
        setMessage(data.error || "Рендер не удался");
        return;
      }
      setMessage(
        data.reel?.finalPath
          ? `Готово: ${data.reel.finalPath}`
          : "Рендер завершён",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback() {
    if (!selectedId || !feedback.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/reels/${selectedId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim(), render: false }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        clarification?: string;
        proposedRuleId?: string;
      };
      await refresh();
      if (!data.ok) {
        setMessage(data.clarification || data.error || "Правка не применена");
        return;
      }
      setFeedback("");
      setMessage(
        data.proposedRuleId
          ? `Правка сохранена. Предложено правило ${data.proposedRuleId} (нужно подтверждение).`
          : "Правка сохранена в монтажный план",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      data-testid="reels-framework-panel"
      className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Reels Framework
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Тема → сценарий → загрузка съёмки → монтаж MP4 → правки обычным языком
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            data-testid="reels-topic-input"
            className="min-h-11 min-w-[14rem] rounded-md border border-[var(--border-glass)] bg-[var(--bg-primary)] px-3 text-sm"
            placeholder="Тема рилса"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <GlowButton
            data-testid="reels-create-btn"
            disabled={busy}
            onClick={() => void createReel()}
          >
            Новый рилс
          </GlowButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <ul className="flex max-h-64 flex-col gap-2 overflow-auto">
          {reels.length === 0 ? (
            <li className="text-sm text-[var(--text-muted)]">Пока нет роликов</li>
          ) : (
            reels.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  data-testid={`reels-row-${r.id}`}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    selectedId === r.id
                      ? "border-[var(--accent-blue-bright)] bg-[color-mix(in_srgb,var(--accent-blue-bright)_12%,transparent)]"
                      : "border-[var(--border-glass)] hover:border-[var(--accent-blue-bright)]",
                  )}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="font-medium text-[var(--text-primary)]">
                    {r.topic}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {r.status} · источников: {r.sources?.length ?? 0} · plan v
                    {r.planVersion}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-col gap-3">
          {!selected ? (
            <p className="text-sm text-[var(--text-muted)]">
              Выберите ролик слева или создайте новый.
            </p>
          ) : (
            <>
              <div className="text-sm text-[var(--text-muted)]">
                Статус:{" "}
                <span className="text-[var(--text-primary)]">{selected.status}</span>
                {selected.script ? ` · сценарий v${selected.script.version}` : ""}
                {selected.lastError ? (
                  <span className="ml-2 text-red-400">· {selected.lastError}</span>
                ) : null}
              </div>
              <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-dashed border-[var(--border-glass)] px-3 text-sm">
                Загрузить видео
                <input
                  data-testid="reels-upload-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadSource(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <GlowButton
                data-testid="reels-render-btn"
                disabled={busy || !selected.sources?.length}
                onClick={() => void renderSelected()}
              >
                Собрать MP4
              </GlowButton>
              <div className="flex flex-col gap-2">
                <textarea
                  data-testid="reels-feedback-input"
                  className="min-h-20 rounded-md border border-[var(--border-glass)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                  placeholder='Правка: «Сделай заголовок крупнее»'
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <GlowButton
                  data-testid="reels-feedback-btn"
                  disabled={busy || !feedback.trim()}
                  onClick={() => void sendFeedback()}
                >
                  Применить замечание
                </GlowButton>
              </div>
              {selected.finalPath ? (
                <p className="break-all text-xs text-[var(--text-muted)]">
                  Файл: {selected.finalPath}
                </p>
              ) : null}
            </>
          )}
          {message ? (
            <p
              data-testid="reels-framework-message"
              className="text-sm text-[var(--text-primary)]"
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
