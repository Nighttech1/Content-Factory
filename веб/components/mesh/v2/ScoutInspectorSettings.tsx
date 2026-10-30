"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MESH_PIPELINE_LABELS,
  isMeshPipelineId,
} from "@/lib/mesh-roles";
import {
  DEFAULT_SCOUT_SEARCH,
  emitScoutSnapshotUpdated,
  readScoutLastRunAt,
  readScoutSearchForAgent,
  shouldRunAutoScoutClient,
  writeScoutLastRunAt,
  writeScoutSearchForAgent,
  type ScoutSearchConfig,
} from "@/lib/settings/scout-search-config";

type ScoutInspectorSettingsProps = {
  pipelineId: string;
  agentId: string;
};

type RunStatus =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "ok"; count: number }
  | { kind: "err"; message: string };

/**
 * C-144 / C-150 / S52 — Scout search + auto-scout + «Разведать».
 * Apify only from this panel (button / schedule), never from Competitors feed.
 */
export function ScoutInspectorSettings({
  pipelineId,
  agentId,
}: ScoutInspectorSettingsProps) {
  const [cfg, setCfg] = useState<ScoutSearchConfig>(DEFAULT_SCOUT_SEARCH);
  const [saved, setSaved] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus>({ kind: "idle" });
  const [lastRunLabel, setLastRunLabel] = useState<string>("—");

  const moduleLabel = isMeshPipelineId(pipelineId)
    ? MESH_PIPELINE_LABELS[pipelineId]
    : pipelineId;

  const refreshLastRunLabel = useCallback(() => {
    const iso = readScoutLastRunAt(pipelineId, agentId);
    if (!iso) {
      setLastRunLabel("ещё не было");
      return;
    }
    try {
      setLastRunLabel(new Date(iso).toLocaleString("ru-RU"));
    } catch {
      setLastRunLabel(iso);
    }
  }, [pipelineId, agentId]);

  useEffect(() => {
    const stored = readScoutSearchForAgent(pipelineId, agentId);
    setCfg({
      ...stored,
      contentTypes: [pipelineId],
    });
    refreshLastRunLabel();
  }, [pipelineId, agentId, refreshLastRunLabel]);

  function save() {
    writeScoutSearchForAgent(pipelineId, agentId, {
      ...cfg,
      contentTypes: [pipelineId],
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  const runScout = useCallback(
    async (reason: "manual" | "auto") => {
      setRunStatus({ kind: "running" });
      writeScoutSearchForAgent(pipelineId, agentId, {
        ...cfg,
        contentTypes: [pipelineId],
      });
      try {
        const res = await fetch(
          `/api/studio/${encodeURIComponent(pipelineId)}/scout/run`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: cfg.defaultTopic.trim() || undefined,
              minViews: cfg.minViews,
              minLikes: cfg.minLikes,
              minVirality: cfg.minVirality,
              lookbackDays: cfg.lookbackDays,
            }),
          },
        );
        const data = (await res.json()) as {
          ok?: boolean;
          competitorsCount?: number;
          error?: string;
          updatedAt?: string;
        };
        const iso = data.updatedAt || new Date().toISOString();
        writeScoutLastRunAt(pipelineId, agentId, iso);
        refreshLastRunLabel();
        if (data.ok) {
          setRunStatus({
            kind: "ok",
            count: Number(data.competitorsCount) || 0,
          });
          emitScoutSnapshotUpdated(pipelineId);
        } else {
          const errMap: Record<string, string> = {
            scraper_not_configured: "Ключ Apify не настроен",
            module_unsupported: "Разведка Apify только для карусели / reels",
            apify_empty: "Apify вернул пусто (проверьте нишу / лимиты)",
            apify_failed: "Ошибка Apify (см. логи сервера)",
          };
          setRunStatus({
            kind: "err",
            message:
              errMap[data.error ?? ""] ??
              data.error ??
              (reason === "auto" ? "Авторазведка не удалась" : "Разведка не удалась"),
          });
        }
      } catch {
        setRunStatus({
          kind: "err",
          message: "Сеть недоступна — попробуйте ещё раз",
        });
      }
    },
    [agentId, cfg, pipelineId, refreshLastRunLabel],
  );

  /** Auto-scout when enabled and interval elapsed (drawer open). */
  useEffect(() => {
    if (!cfg.autoRun) return;
    const last = readScoutLastRunAt(pipelineId, agentId);
    if (!shouldRunAutoScoutClient(last, cfg.frequencyHours)) return;
    void runScout("auto");
    // intentionally once per drawer open / cfg change when due
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate by autoRun+frequency
  }, [cfg.autoRun, cfg.frequencyHours, pipelineId, agentId]);

  const platformOptions = [
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
    { id: "youtube", label: "YouTube" },
    { id: "telegram", label: "Telegram" },
  ] as const;

  function togglePlatform(id: string) {
    const has = cfg.platforms.includes(id);
    setCfg({
      ...cfg,
      platforms: has
        ? cfg.platforms.filter((p) => p !== id)
        : [...cfg.platforms, id],
    });
  }

  const statusText =
    runStatus.kind === "running"
      ? "Разведка идёт… (Apify может занять 1–3 мин)"
      : runStatus.kind === "ok"
        ? `Готово: ${runStatus.count} постов в снимке Скаута`
        : runStatus.kind === "err"
          ? runStatus.message
          : null;

  return (
    <section
      data-testid="scout-inspector-settings"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Параметры разведки
        </h3>
        <p className="text-[11px] text-[var(--text-muted)]">
          Тема, фильтры и расписание для модуля «{moduleLabel}». Apify
          вызывается только кнопкой «Разведать» или авторазведкой — не при
          открытии «Конкуренты».
        </p>
      </div>

      <fieldset data-testid="scout-inspector-platforms">
        <legend className="mb-2 font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
          Площадки
        </legend>
        <ul className="flex flex-wrap gap-2">
          {platformOptions.map((p) => {
            const on = cfg.platforms.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  data-testid={`scout-inspector-platform-${p.id}`}
                  onClick={() => togglePlatform(p.id)}
                  className={
                    on
                      ? "rounded-lg border border-[color-mix(in_srgb,var(--accent-blue)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_16%,transparent)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent-blue-bright)]"
                      : "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs text-[var(--text-muted)]"
                  }
                >
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
          Тема / ниша
        </span>
        <input
          data-testid="scout-inspector-topic"
          value={cfg.defaultTopic}
          onChange={(e) => setCfg({ ...cfg, defaultTopic: e.target.value })}
          className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
          placeholder="например: армянская кухня"
        />
      </label>

      <div
        data-testid="scout-inspector-auto-block"
        className="flex flex-col gap-3 rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_70%,transparent)] p-3"
      >
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Авторазведка — фильтры и частота
        </h4>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Глубина, дней
            </span>
            <input
              type="number"
              data-testid="scout-inspector-lookback"
              min={1}
              max={90}
              value={cfg.lookbackDays}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  lookbackDays: Number.parseInt(e.target.value, 10) || 7,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Мин. просмотры
            </span>
            <input
              type="number"
              data-testid="scout-inspector-min-views"
              min={0}
              step={1000}
              value={cfg.minViews}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  minViews: Number.parseInt(e.target.value, 10) || 0,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Мин. лайки
            </span>
            <input
              type="number"
              data-testid="scout-inspector-min-likes"
              min={0}
              step={100}
              value={cfg.minLikes}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  minLikes: Number.parseInt(e.target.value, 10) || 0,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Мин. виральность (score)
            </span>
            <input
              type="number"
              data-testid="scout-inspector-min-virality"
              min={0}
              step={1000}
              value={cfg.minVirality}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  minVirality: Number.parseInt(e.target.value, 10) || 0,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
            <span className="text-[10px] text-[var(--text-muted)]">
              Лайки + комментарии + просмотры. 0 = без порога.
            </span>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Частота авторазведки, часов
            </span>
            <input
              type="number"
              data-testid="scout-inspector-frequency-hours"
              min={1}
              max={168}
              value={cfg.frequencyHours}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  frequencyHours: Number.parseInt(e.target.value, 10) || 12,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <input
            type="checkbox"
            data-testid="scout-inspector-autorun"
            checked={cfg.autoRun}
            onChange={(e) => setCfg({ ...cfg, autoRun: e.target.checked })}
            className="h-3.5 w-3.5 accent-[var(--accent-blue-bright)]"
          />
          Включить авторазведку по расписанию (только Скаут, не экран
          Конкуренты)
        </label>

        <p
          data-testid="scout-inspector-last-run"
          className="text-[11px] text-[var(--text-muted)]"
        >
          Последний запуск: {lastRunLabel}
        </p>
      </div>

      <button
        type="button"
        data-testid="scout-inspector-save"
        onClick={save}
        className="self-start rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--accent-gold)]"
      >
        {saved ? "Сохранено" : "Сохранить параметры разведки"}
      </button>

      <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border-glass)] pt-4">
        {statusText ? (
          <p
            data-testid="scout-razvedat-status"
            className={
              runStatus.kind === "err"
                ? "text-xs text-[var(--accent-coral,#e88)]"
                : "text-xs text-[var(--text-muted)]"
            }
          >
            {statusText}
          </p>
        ) : null}
        <button
          type="button"
          data-testid="scout-razvedat"
          disabled={runStatus.kind === "running"}
          onClick={() => void runScout("manual")}
          className="w-full rounded-xl bg-[var(--accent-blue)] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--accent-blue)_30%,transparent)] transition hover:bg-[var(--accent-blue-bright)] disabled:cursor-wait disabled:opacity-70 active:scale-[0.99]"
        >
          {runStatus.kind === "running" ? "Разведываю…" : "Разведать"}
        </button>
      </div>
    </section>
  );
}
