"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

type BrandSettingsDto = {
  brandName: string;
  logoRef: string;
  tagline?: string;
  extras?: Record<string, string>;
  updatedAt?: string;
};

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * S55 — Settings «Бренд» after Design: name + logo URL/upload + tagline.
 * Consumes GET/PUT `/api/settings/brand` only.
 */
export function BrandPanel() {
  const [brandName, setBrandName] = useState("");
  const [logoRef, setLogoRef] = useState("");
  const [tagline, setTagline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/brand", { cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        brand?: BrandSettingsDto;
        error?: string;
      };
      if (!res.ok || !json.brand) {
        throw new Error(json.error ?? "load_failed");
      }
      setBrandName(json.brand.brandName ?? "");
      setLogoRef(json.brand.logoRef ?? "");
      setTagline(json.brand.tagline ?? "");
    } catch {
      setError("Не удалось загрузить бренд. Проверьте API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function applyLogoFile(file: File) {
    setError(null);
    setOkMsg(null);
    if (!file.type.startsWith("image/")) {
      setError("Нужен файл изображения (PNG, JPG, SVG, WebP).");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Логотип больше 1,5 МБ — укажите URL или сожмите файл.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoRef(dataUrl);
    } catch {
      setError("Не удалось прочитать файл логотипа.");
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void applyLogoFile(file);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void applyLogoFile(file);
  }

  async function onSave() {
    setError(null);
    setOkMsg(null);
    const name = brandName.trim();
    if (!name) {
      setError("Укажите название бренда.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: name,
          logoRef: logoRef.trim(),
          tagline: tagline.trim(),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        brand?: BrandSettingsDto;
        error?: string;
      };
      if (!res.ok || !json.brand) {
        throw new Error(json.error ?? "save_failed");
      }
      setBrandName(json.brand.brandName);
      setLogoRef(json.brand.logoRef);
      setTagline(json.brand.tagline ?? "");
      setOkMsg("Бренд сохранён.");
    } catch {
      setError("Не удалось сохранить бренд.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="settings-brand"
      data-testid="settings-brand-panel"
      aria-labelledby="settings-brand-heading"
      className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-2 py-4 sm:px-3"
    >
      <div className="flex w-full min-w-[min(100%,18rem)] max-w-[50%] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id="settings-brand-heading"
          className="font-[family-name:var(--font-ui)] text-lg font-semibold tracking-tight text-[var(--text-primary)] text-balance"
        >
          Бренд
        </h2>
        <p className="text-pretty text-xs text-[var(--text-muted)]">
          Название и логотип для плейсхолдеров карусели. Идут сразу после
          «Дизайн».
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Загрузка…
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
              Название бренда
            </span>
            <input
              data-testid="settings-brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Vernatun"
              className="w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
              Слоган (необязательно)
            </span>
            <input
              data-testid="settings-brand-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Клуб · сообщество · встречи"
              className="w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
              Логотип
            </span>
            <div
              data-testid="settings-brand-logo-dropzone"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragging(false);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
                dragging
                  ? "border-[var(--accent-blue-bright)] bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)]"
                  : "border-[var(--border-glass)] bg-[var(--bg-card)] hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,transparent)]",
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                data-testid="settings-brand-logo-file"
                onChange={onFileChange}
              />
              {logoRef ? (
                // eslint-disable-next-line @next/next/no-img-element -- local data URL / path
                <img
                  src={logoRef}
                  alt="Превью логотипа"
                  data-testid="settings-brand-logo-preview"
                  className="h-16 w-16 rounded-lg border border-[var(--border-glass)] object-contain bg-[var(--bg-canvas)]"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
                  <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
              )}
              <p className="text-sm text-[var(--text-primary)]">
                Перетащите логотип или выберите файл
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-blue-bright)]"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Загрузить
              </button>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)]">
                Или URL / путь
              </span>
              <input
                data-testid="settings-brand-logo-url"
                value={logoRef.startsWith("data:") ? "" : logoRef}
                onChange={(e) => setLogoRef(e.target.value)}
                placeholder="/brand/vernatun-logo.svg"
                className="w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
              />
            </label>
          </div>

          {error ? (
            <p
              data-testid="settings-brand-error"
              className="text-sm text-[color-mix(in_srgb,#f87171_90%,white)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {okMsg ? (
            <p
              data-testid="settings-brand-ok"
              className="text-sm text-[var(--accent-gold)]"
            >
              {okMsg}
            </p>
          ) : null}

          <button
            type="button"
            data-testid="settings-brand-save"
            disabled={saving}
            onClick={() => void onSave()}
            className="w-fit rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-blue-bright)] disabled:opacity-60"
          >
            {saving ? "Сохранение…" : "Сохранить бренд"}
          </button>
        </div>
      )}
      </div>
    </section>
  );
}
