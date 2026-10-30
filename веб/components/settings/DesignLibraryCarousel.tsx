"use client";

/**
 * S52 — Embla library ≤10. Tokens-only brandbook cards (3:5).
 * No SlicedSlotPreview COVER/BODY/CTA strip in Settings.
 * Toolbar LEFT of «Дизайн», clear of right Settings nav (~280px).
 */

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  ImagePlus,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { BrandbookBoard } from "@/components/settings/BrandbookBoard";
import { cn } from "@/lib/cn";
import {
  appendDesignLibrarySlotFifo,
  dedupeDesignLibrarySlots,
  parseDesignPresetFile,
  readActiveDesignId,
  readDesignLibrary,
  seedFactoryDesignPresets,
  syncActiveDesignToServer,
  writeActiveDesignId,
  writeDesignLibrary,
  type DesignLibrarySlot,
  type DesignPresetFile,
} from "@/lib/settings/design-library";
import { writeDesignPreviewOpen } from "@/lib/settings/design-preview-persist";

export type DesignLibraryCarouselProps = {
  /** Called when active slot / library changes (preview MD, filename). */
  onActiveChange: (slot: DesignLibrarySlot | null) => void;
  /** Open floating MD code view (toolbar eye «код дизайн мд» only). */
  onRequestPreviewOpen: () => void;
};

type DeconstructApiResponse = {
  ok?: boolean;
  markdown?: string;
  html?: string;
  name?: string;
  title?: string;
  presetFile?: unknown;
  error?: string;
  source?: string;
};

/** Clear floating right SettingsQuickNav on xl+. */
const DESIGN_NAV_CLEARANCE =
  "xl:pr-[min(280px,calc(100vw-42rem))]";

export function DesignLibraryCarousel({
  onActiveChange,
  onRequestPreviewOpen,
}: DesignLibraryCarouselProps) {
  const [slots, setSlots] = useState<DesignLibrarySlot[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  const refreshFromStorage = useCallback(() => {
    let library = readDesignLibrary();
    const { slots: deduped, changed, activeId: keptActive } =
      dedupeDesignLibrarySlots(library, readActiveDesignId());
    if (changed) {
      writeDesignLibrary(deduped);
      if (keptActive) writeActiveDesignId(keptActive);
      library = deduped;
    }
    const id = keptActive ?? readActiveDesignId();
    setSlots(library);
    const resolvedId =
      id && library.some((s) => s.id === id) ? id : library[0]?.id ?? null;
    setActiveId(resolvedId);
    const slot =
      (resolvedId ? library.find((s) => s.id === resolvedId) : null) ??
      library[0] ??
      null;
    onActiveChange(slot);
    return { library, slot };
  }, [onActiveChange]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        let library = readDesignLibrary();
        if (library.length === 0) {
          library = seedFactoryDesignPresets();
        }
        if (cancelled) return;
        const { slot } = refreshFromStorage();
        if (slot?.markdown) {
          void syncActiveDesignToServer({
            markdown: slot.markdown,
            name: slot.name,
            presetFile: slot.presetFile ?? null,
          });
        }
      } catch {
        if (!cancelled) refreshFromStorage();
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshFromStorage]);

  useEffect(() => {
    if (!api || !activeId || slots.length === 0) return;
    const idx = slots.findIndex((s) => s.id === activeId);
    if (idx >= 0) api.scrollTo(idx);
  }, [api, activeId, slots]);

  /** S51: card click selects only — never opens edit/context popup. */
  const selectSlot = useCallback(
    (slot: DesignLibrarySlot) => {
      writeActiveDesignId(slot.id);
      setActiveId(slot.id);
      onActiveChange(slot);
      void syncActiveDesignToServer({
        markdown: slot.markdown,
        name: slot.name,
        presetFile: slot.presetFile ?? null,
      });
    },
    [onActiveChange],
  );

  const openCodeMd = useCallback(() => {
    writeDesignPreviewOpen(true);
    onRequestPreviewOpen();
  }, [onRequestPreviewOpen]);

  const onDeconstructImage = useCallback(
    async (file: File) => {
      setToast(null);
      setBusy(true);
      try {
        const form = new FormData();
        form.append("image", file);
        form.append("title", file.name.replace(/\.[^.]+$/, "") || "DESIGN.md");
        const res = await fetch("/api/settings/design-deconstruct", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as DeconstructApiResponse;
        if (!data.markdown?.trim()) {
          setToast(data.error ?? "Не удалось разобрать изображение.");
          return;
        }
        const presetFile: DesignPresetFile | undefined =
          parseDesignPresetFile(data.presetFile) ?? undefined;
        const previewUrl = URL.createObjectURL(file);
        const slot = appendDesignLibrarySlotFifo({
          name: data.name || data.title || presetFile?.name || "DESIGN.md",
          markdown: data.markdown,
          html: data.html,
          previewUrl,
          presetFile,
          presetId: presetFile?.preset,
          colors: presetFile?.colors,
          cssVarOverrides: presetFile?.cssVarOverrides,
        });
        refreshFromStorage();
        selectSlot(slot);
        if (data.source === "mock") {
          setToast("Разбор в mock-режиме (нет ключа LLM) — пресет добавлен.");
        }
      } catch {
        setToast("Ошибка загрузки. Попробуйте ещё раз.");
      } finally {
        setBusy(false);
      }
    },
    [refreshFromStorage, selectSlot],
  );

  const toolbarBtn =
    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_35%,var(--border-glass))]";

  /** S52 D-tok-4: LEFT — референс · новый дизайн · eye «код дизайн мд» */
  const toolbar = (
    <div
      className="flex max-w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto"
      data-testid="design-library-toolbar"
      data-align="left"
    >
      <label
        className={cn(
          "inline-flex shrink-0",
          busy ? "pointer-events-none opacity-40" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            toolbarBtn,
            "border-transparent bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-bright)]",
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          референс
        </span>
        <input
          data-testid="settings-design-from-ref"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onDeconstructImage(file);
            e.target.value = "";
          }}
        />
      </label>

      <label
        className={cn(
          "inline-flex shrink-0",
          busy ? "pointer-events-none opacity-40" : "cursor-pointer",
        )}
      >
        <span className={toolbarBtn}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden />
          )}
          новый дизайн
        </span>
        <input
          data-testid="settings-design-add-image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onDeconstructImage(file);
            e.target.value = "";
          }}
        />
      </label>

      <button
        type="button"
        data-testid="settings-design-preview-icon"
        aria-label="код дизайн мд"
        title="код дизайн мд"
        disabled={!activeId || !hydrated}
        onClick={openCodeMd}
        className={cn(
          toolbarBtn,
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <Eye className="h-4 w-4" aria-hidden />
        код дизайн мд
      </button>
    </div>
  );

  if (!hydrated) {
    return (
      <div
        className={cn("flex flex-col gap-3", DESIGN_NAV_CLEARANCE)}
        data-testid="design-library-root"
      >
        <div
          className="flex flex-wrap items-center justify-start gap-3"
          data-testid="design-header-row"
        >
          <h2
            id="settings-design-heading"
            className="shrink-0 text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Дизайн
          </h2>
          {toolbar}
        </div>
        <p
          className="text-sm text-[var(--text-muted)]"
          data-testid="design-library-loading"
        >
          Загрузка библиотеки дизайнов…
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-3", DESIGN_NAV_CLEARANCE)}
      data-testid="design-library-root"
    >
      {/* S52: actions LEFT of «Дизайн» — clear of right Settings nav */}
      <div
        className="flex flex-wrap items-center justify-start gap-3"
        data-testid="design-header-row"
      >
        <h2
          id="settings-design-heading"
          className="shrink-0 text-lg font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Дизайн
        </h2>
        {toolbar}
      </div>

      {slots.length === 0 ? (
        <p
          className="rounded-lg border border-dashed border-[var(--border-glass)] bg-[var(--bg-card)] px-4 py-8 text-center text-sm text-[var(--text-muted)]"
          data-testid="design-library-empty"
        >
          Библиотека пуста. Загрузите референс или новый дизайн.
        </p>
      ) : (
        <div className="relative px-10">
          <Carousel
            opts={{ align: "start", loop: false }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent>
              {slots.map((slot) => {
                const isActive = slot.id === activeId;
                return (
                  <CarouselItem
                    key={slot.id}
                    className="basis-[min(100%,22rem)] sm:basis-[20rem] md:basis-[22rem] lg:basis-[24rem]"
                    data-testid={`design-library-slide-${slot.id}`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectSlot(slot)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectSlot(slot);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                      }}
                      className={cn(
                        "relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-2 transition",
                        isActive
                          ? "border-[var(--accent-blue-bright)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-blue-bright)_70%,transparent),0_0_14px_color-mix(in_srgb,var(--accent-blue-bright)_55%,transparent),0_0_28px_color-mix(in_srgb,var(--accent-blue)_40%,transparent)]"
                          : "border-[var(--border-glass)] hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))]",
                      )}
                      data-testid="design-library-slide"
                      data-active={isActive ? "true" : "false"}
                      data-aspect="brandbook-3:5"
                      data-preview="tokens-only"
                    >
                      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-lg">
                        <BrandbookBoard
                          slot={slot}
                          compact
                          className="h-full w-full rounded-lg border-0"
                        />
                      </div>
                      {isActive ? (
                        <span
                          className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-[color-mix(in_srgb,var(--accent-blue-bright)_45%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-blue-bright)]"
                          data-testid="design-library-active-badge"
                        >
                          Активный
                        </span>
                      ) : null}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {toast ? (
        <p
          role="status"
          className="text-xs text-[var(--accent-terracotta)]"
          data-testid="design-library-toast"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
