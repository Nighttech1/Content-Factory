"use client";

import { useCallback, useEffect, useState } from "react";

type PublicistSettings = {
  mode: "auto" | "manual";
  defaultPublishHour: number;
  defaultPublishMinute: number;
  daysAhead: number;
  platformId?: string | null;
};

/**
 * Minimal Publicist auto|manual chrome (shell_freeze).
 * GET/PUT `/api/settings/publicist`.
 */
export function PublicistSettingsPanel() {
  const [settings, setSettings] = useState<PublicistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/publicist", { cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        settings?: PublicistSettings;
        error?: string;
      };
      if (!res.ok || !json.settings) throw new Error(json.error ?? "load_failed");
      setSettings(json.settings);
    } catch {
      setError("Не удалось загрузить настройки публициста.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch("/api/settings/publicist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        settings?: PublicistSettings;
        error?: string;
      };
      if (!res.ok || !json.settings) throw new Error(json.error ?? "save_failed");
      setSettings(json.settings);
      setOkMsg("Сохранено.");
    } catch {
      setError("Не удалось сохранить.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="settings-publicist"
      data-testid="settings-publicist-panel"
      aria-labelledby="settings-publicist-heading"
      className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-2 py-4 sm:px-3"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="settings-publicist-heading"
          className="font-[family-name:var(--font-ui)] text-lg font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Публицист
        </h2>
        <p className="max-w-xl text-pretty text-xs text-[var(--text-muted)]">
          Авто-слот по умолчанию или ручное время на черновике. Соцсети — только
          через HITL.
        </p>
      </div>

      {loading || !settings ? (
        <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="inline-flex w-fit rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] p-0.5"
            data-testid="settings-publicist-mode"
          >
            {(
              [
                { id: "manual" as const, label: "Вручную" },
                { id: "auto" as const, label: "Авто" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`settings-publicist-mode-${opt.id}`}
                onClick={() =>
                  setSettings((s) => (s ? { ...s, mode: opt.id } : s))
                }
                className={
                  settings.mode === opt.id
                    ? "rounded-md bg-[color-mix(in_srgb,var(--accent-blue)_28%,transparent)] px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {settings.mode === "auto" ? (
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
                  Час
                </span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  data-testid="settings-publicist-hour"
                  value={settings.defaultPublishHour}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            defaultPublishHour: Number.parseInt(
                              e.target.value,
                              10,
                            ),
                          }
                        : s,
                    )
                  }
                  className="w-20 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
                  Минута
                </span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  data-testid="settings-publicist-minute"
                  value={settings.defaultPublishMinute}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            defaultPublishMinute: Number.parseInt(
                              e.target.value,
                              10,
                            ),
                          }
                        : s,
                    )
                  }
                  className="w-20 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
                  Через дней
                </span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  data-testid="settings-publicist-days"
                  value={settings.daysAhead}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? {
                            ...s,
                            daysAhead: Number.parseInt(e.target.value, 10),
                          }
                        : s,
                    )
                  }
                  className="w-20 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-2 py-1.5 text-sm tabular-nums text-[var(--text-primary)]"
                />
              </label>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              В Create / Разбор укажите дату и время вручную на шаге публикации.
            </p>
          )}

          {error ? (
            <p className="text-sm text-[color-mix(in_srgb,#f87171_90%,white)]" role="alert">
              {error}
            </p>
          ) : null}
          {okMsg ? (
            <p className="text-sm text-[var(--accent-gold)]">{okMsg}</p>
          ) : null}

          <button
            type="button"
            data-testid="settings-publicist-save"
            disabled={saving}
            onClick={() => void onSave()}
            className="w-fit rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      )}
    </section>
  );
}
