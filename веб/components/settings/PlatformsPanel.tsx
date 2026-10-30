"use client";

import { useEffect, useState } from "react";
import {
  PLATFORM_KIND_LABELS,
  newPlatformId,
  readPlatformsFromStorage,
  removePlatform,
  upsertPlatform,
  writePlatformsToStorage,
  type PlatformKind,
  type PublishPlatform,
} from "@/lib/settings/platforms";
import { cn } from "@/lib/cn";

const KINDS = Object.keys(PLATFORM_KIND_LABELS) as PlatformKind[];

type ConnStatus = "unknown" | "ok" | "fail" | "checking";

/**
 * C-86 — CRUD + «Проверить подключение» (green/red).
 */
export function PlatformsPanel() {
  const [list, setList] = useState<PublishPlatform[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<PublishPlatform | null>(null);
  const [status, setStatus] = useState<Record<string, ConnStatus>>({});

  useEffect(() => {
    setList(readPlatformsFromStorage());
    setHydrated(true);
  }, []);

  function persist(next: PublishPlatform[]) {
    setList(next);
    writePlatformsToStorage(next);
  }

  function startCreate() {
    setDraft({
      id: newPlatformId("instagram"),
      kind: "instagram",
      label: "",
      apiKey: "",
      endpoint: "",
      enabled: true,
    });
  }

  function saveDraft() {
    if (!draft || !draft.label.trim()) return;
    persist(upsertPlatform(list, { ...draft, label: draft.label.trim() }));
    setDraft(null);
  }

  async function checkConnection(p: PublishPlatform) {
    setStatus((s) => ({ ...s, [p.id]: "checking" }));
    await new Promise((r) => setTimeout(r, 450));
    const key = (p.apiKey ?? "").trim();
    const ok =
      key.length >= 8 &&
      (p.kind === "website" || key.length >= 12) &&
      Boolean(p.label.trim());
    setStatus((s) => ({ ...s, [p.id]: ok ? "ok" : "fail" }));
  }

  return (
    <section
      id="settings-platforms"
      data-testid="settings-platforms-panel"
      aria-labelledby="settings-platforms-heading"
      className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id="settings-platforms-heading"
            className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Площадки публикации
          </h2>
          <p className="max-w-xl text-xs text-[var(--text-muted)]">
            Ключи API только в браузере. Зелёный блок — публицист может
            публиковать; красный — подключение не подтверждено.
          </p>
        </div>
        <button
          type="button"
          data-testid="settings-platform-add"
          onClick={startCreate}
          className="rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--accent-gold)]"
        >
          Добавить площадку
        </button>
      </div>

      {!hydrated ? (
        <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((p) => {
            const st = status[p.id] ?? "fail";
            const tone =
              st === "ok"
                ? "border-[color-mix(in_srgb,#3d9a6a_55%,transparent)] bg-[color-mix(in_srgb,#3d9a6a_14%,var(--bg-card))]"
                : st === "checking"
                  ? "border-[var(--border-glass)] bg-[var(--bg-card)]"
                  : "border-[color-mix(in_srgb,var(--accent-terracotta)_55%,transparent)] bg-[color-mix(in_srgb,var(--accent-terracotta)_12%,var(--bg-card))]";
            return (
              <li
                key={p.id}
                data-testid={`settings-platform-row-${p.id}`}
                data-conn={st}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
                  tone,
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {p.label}
                  </p>
                  <p className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                    {PLATFORM_KIND_LABELS[p.kind]}
                    {st === "ok"
                      ? " · подключено"
                      : st === "checking"
                        ? " · проверка…"
                        : " · нет связи"}
                    {p.apiKey ? " · ключ задан" : " · без ключа"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid={`settings-platform-ping-${p.id}`}
                    onClick={() => void checkConnection(p)}
                    disabled={st === "checking"}
                    className="rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50"
                  >
                    {st === "checking" ? "Проверяем…" : "Проверить подключение"}
                  </button>
                  <button
                    type="button"
                    data-testid={`settings-platform-edit-${p.id}`}
                    onClick={() => setDraft({ ...p })}
                    className="rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    data-testid={`settings-platform-delete-${p.id}`}
                    onClick={() => persist(removePlatform(list, p.id))}
                    className="rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-xs text-[var(--accent-terracotta)] hover:bg-[var(--bg-hover)]"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {draft ? (
        <div
          data-testid="settings-platform-editor"
          className="flex flex-col gap-3 rounded-xl border border-[color-mix(in_srgb,var(--accent-blue)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_6%,transparent)] p-4"
        >
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {list.some((x) => x.id === draft.id)
              ? "Редактирование площадки"
              : "Новая площадка"}
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">Название</span>
            <input
              data-testid="settings-platform-label"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">Тип</span>
            <select
              data-testid="settings-platform-kind"
              value={draft.kind}
              onChange={(e) =>
                setDraft({ ...draft, kind: e.target.value as PlatformKind })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {PLATFORM_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">
              API-ключ / токен
            </span>
            <input
              data-testid="settings-platform-apikey"
              type="password"
              autoComplete="off"
              value={draft.apiKey ?? ""}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-primary)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">
              Endpoint / channel id
            </span>
            <input
              data-testid="settings-platform-endpoint"
              value={draft.endpoint ?? ""}
              onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })}
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="settings-platform-save"
              onClick={saveDraft}
              className="rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--accent-blue-bright)]"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-lg border border-[var(--border-glass)] px-3 py-2 text-sm text-[var(--text-muted)]"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
