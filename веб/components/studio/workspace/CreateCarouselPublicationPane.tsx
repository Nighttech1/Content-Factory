"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LuxuryDatetimePicker } from "@/components/ui/luxury-datetime";
import { PlatformCarouselPicker } from "@/components/ui/platform-carousel-picker";
import { formatSlotLabelRu } from "@/lib/schedule/storage";
import {
  publishCreateCarousel,
  type PublishCreateCarouselResult,
} from "@/lib/studio/create-carousel-publish";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import {
  readPlatformsFromStorage,
  type PublishPlatform,
} from "@/lib/settings/platforms";

type CreateCarouselPublicationPaneProps = {
  draft: CarouselDraft | null;
  canPublish: boolean;
  onPublished?: () => void;
};

type PublicistMode = "auto" | "manual";

function computeAutoIso(hour: number, minute: number, daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

/**
 * C-carousel-publish + S55 — Publication step; auto|manual time chrome.
 * CTA «Опубликовать» → draft Ours + schedule (+ optional /api/publicist/schedule).
 */
export function CreateCarouselPublicationPane({
  draft,
  canPublish,
  onPublished,
}: CreateCarouselPublicationPaneProps) {
  const [iso, setIso] = useState<string | undefined>(undefined);
  const [platformId, setPlatformId] = useState<string | undefined>(undefined);
  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);
  const [mode, setMode] = useState<PublicistMode>("manual");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPlatforms(readPlatformsFromStorage());
    void (async () => {
      try {
        const res = await fetch("/api/settings/publicist", { cache: "no-store" });
        const json = (await res.json()) as {
          settings?: {
            mode?: PublicistMode;
            defaultPublishHour?: number;
            defaultPublishMinute?: number;
            daysAhead?: number;
            platformId?: string | null;
          };
        };
        const s = json.settings;
        if (!s) return;
        if (s.mode === "auto" || s.mode === "manual") setMode(s.mode);
        if (s.platformId) setPlatformId(s.platformId);
        if (s.mode === "auto") {
          setIso(
            computeAutoIso(
              s.defaultPublishHour ?? 18,
              s.defaultPublishMinute ?? 0,
              s.daysAhead ?? 1,
            ),
          );
        }
      } catch {
        /* keep manual defaults */
      }
    })();
  }, []);

  async function onPublish() {
    setError(null);
    setOkMsg(null);
    if (!draft || !canPublish) {
      setError("Сначала нарисуйте слайды, затем публикуйте.");
      return;
    }
    if (!iso?.trim()) {
      setError("Укажите дату и время публикации.");
      return;
    }
    setBusy(true);
    const result: PublishCreateCarouselResult = publishCreateCarousel({
      draft,
      startsAt: iso,
      platformId,
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    try {
      await fetch("/api/publicist/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: draft.id,
          publishAt: iso,
          mode,
          platformId: platformId ?? null,
        }),
      });
    } catch {
      /* local schedule already written; API soft-fail */
    }
    setBusy(false);
    setOkMsg("Сохранено в Черновиках и в Расписании.");
    onPublished?.();
  }

  return (
    <div
      data-testid="create-publication-pane"
      className="flex flex-col gap-3 px-3 py-3"
    >
      <p className="text-sm text-[var(--text-primary)]">
        Выберите день, время и площадку. «Опубликовать» ставит карточку в
        Черновики и слот в Расписании (очередь HITL, без автопубликации в
        соцсети).
      </p>
      <div
        className="inline-flex w-fit rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] p-0.5"
        data-testid="create-publication-mode"
      >
        {(
          [
            { id: "manual" as const, label: "Вручную" },
            { id: "auto" as const, label: "Авто из настроек" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            data-testid={`create-publication-mode-${opt.id}`}
            onClick={() => {
              setMode(opt.id);
              setError(null);
              if (opt.id === "auto") {
                void (async () => {
                  try {
                    const res = await fetch("/api/settings/publicist", {
                      cache: "no-store",
                    });
                    const json = (await res.json()) as {
                      settings?: {
                        defaultPublishHour?: number;
                        defaultPublishMinute?: number;
                        daysAhead?: number;
                      };
                    };
                    const s = json.settings;
                    setIso(
                      computeAutoIso(
                        s?.defaultPublishHour ?? 18,
                        s?.defaultPublishMinute ?? 0,
                        s?.daysAhead ?? 1,
                      ),
                    );
                  } catch {
                    setIso(computeAutoIso(18, 0, 1));
                  }
                })();
              }
            }}
            className={
              mode === opt.id
                ? "rounded-md bg-[color-mix(in_srgb,var(--accent-blue)_28%,transparent)] px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
      <LuxuryDatetimePicker
        valueIso={iso}
        onChangeIso={(next) => {
          setIso(next);
          setMode("manual");
          setError(null);
          setOkMsg(null);
        }}
      />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-mono)]">
          Площадка
        </span>
        <PlatformCarouselPicker
          platforms={platforms}
          value={platformId}
          onChange={(nextId) => {
            setPlatformId(nextId);
            setError(null);
            setOkMsg(null);
          }}
          testId="create-publication-platform"
        />
      </div>
      {iso ? (
        <p className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-gold)]">
          Слот: {formatSlotLabelRu(iso)}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)]">Слот не назначен</p>
      )}
      {!canPublish ? (
        <p className="text-[11px] text-[var(--text-muted)]">
          Публикация доступна после успешной отрисовки слайдов.
        </p>
      ) : null}
      {error ? (
        <p
          data-testid="create-publication-error"
          className="text-sm text-[color-mix(in_srgb,#f87171_90%,white)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p
          data-testid="create-publication-ok"
          className="text-sm text-[var(--accent-gold)]"
        >
          {okMsg}
        </p>
      ) : null}
      <Button
        type="button"
        data-testid="create-publish-button"
        variant="gold"
        disabled={busy || !canPublish}
        onClick={onPublish}
        className="w-full sm:w-auto"
      >
        Опубликовать
      </Button>
    </div>
  );
}
