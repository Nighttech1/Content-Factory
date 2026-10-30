"use client";

import { useEffect, useState } from "react";
import {
  AUTOFILL_FREQUENCY_LABELS,
  newAutofillRuleId,
  readAutofillFromStorage,
  writeAutofillToStorage,
  type AutofillFrequency,
  type ScheduleAutofillRule,
} from "@/lib/settings/schedule-autofill";
import {
  PLATFORM_KIND_LABELS,
  readPlatformsFromStorage,
  type PublishPlatform,
} from "@/lib/settings/platforms";
import { CONTENT_TYPE_OPTIONS } from "@/lib/settings/agent-pack-catalog";

const FREQS = Object.keys(AUTOFILL_FREQUENCY_LABELS) as AutofillFrequency[];

/**
 * C-97 — autofill rules for publisher calendar.
 */
export function ScheduleAutofillPanel() {
  const [rules, setRules] = useState<ScheduleAutofillRule[]>([]);
  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);
  const [draft, setDraft] = useState<ScheduleAutofillRule | null>(null);

  useEffect(() => {
    setRules(readAutofillFromStorage().rules);
    setPlatforms(readPlatformsFromStorage());
  }, []);

  function persist(next: ScheduleAutofillRule[]) {
    setRules(next);
    writeAutofillToStorage({ version: 1, rules: next });
  }

  function startCreate() {
    setDraft({
      id: newAutofillRuleId(),
      contentTypeId: CONTENT_TYPE_OPTIONS[1]?.id ?? "carousel-engine",
      platformId: platforms[0]?.id ?? "",
      time: "09:00",
      frequency: "every_saturday",
      enabled: true,
    });
  }

  function saveDraft() {
    if (!draft) return;
    const rest = rules.filter((r) => r.id !== draft.id);
    persist([...rest, draft]);
    setDraft(null);
  }

  return (
    <section
      id="settings-schedule"
      data-testid="settings-schedule-panel"
      className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-[family-name:var(--font-ui)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Расписание
          </h2>
          <p className="max-w-xl text-xs text-[var(--text-muted)]">
            Правила автозаполнения календаря публициста. Готовый контент
            встаёт в слоты по правилам; ручной перенос в календаре важнее
            правила.
          </p>
        </div>
        <button
          type="button"
          data-testid="settings-autofill-add"
          onClick={startCreate}
          className="rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--accent-gold)]"
        >
          Создать правило
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {rules.length === 0 ? (
          <li className="text-sm text-[var(--text-muted)]">Правил пока нет.</li>
        ) : (
          rules.map((r) => {
            const plat = platforms.find((p) => p.id === r.platformId);
            const ctype =
              CONTENT_TYPE_OPTIONS.find((c) => c.id === r.contentTypeId)
                ?.label ?? r.contentTypeId;
            return (
              <li
                key={r.id}
                data-testid={`settings-autofill-rule-${r.id}`}
                className="flex flex-col gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {ctype} → {plat?.label ?? "площадка"} · {r.time}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {AUTOFILL_FREQUENCY_LABELS[r.frequency]}
                    {r.enabled ? "" : " · выкл"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...r })}
                    className="rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-xs"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => persist(rules.filter((x) => x.id !== r.id))}
                    className="rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-xs text-[var(--accent-terracotta)]"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {draft ? (
        <div
          data-testid="settings-autofill-editor"
          className="flex flex-col gap-3 rounded-xl border border-[color-mix(in_srgb,var(--accent-blue)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_6%,transparent)] p-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Тип контента
            </span>
            <select
              value={draft.contentTypeId}
              onChange={(e) =>
                setDraft({ ...draft, contentTypeId: e.target.value })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            >
              {CONTENT_TYPE_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Площадка
            </span>
            <select
              value={draft.platformId}
              onChange={(e) =>
                setDraft({ ...draft, platformId: e.target.value })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            >
              {platforms.length === 0 ? (
                <option value="">Сначала добавьте площадку</option>
              ) : (
                platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({PLATFORM_KIND_LABELS[p.kind]})
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Время
            </span>
            <input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Частота
            </span>
            <select
              value={draft.frequency}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  frequency: e.target.value as AutofillFrequency,
                })
              }
              className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 text-sm"
            >
              {FREQS.map((f) => (
                <option key={f} value={f}>
                  {AUTOFILL_FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="settings-autofill-save"
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
