"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReactiveButton } from "@/components/ui/ReactiveButton";
import { cn } from "@/lib/cn";
import {
  isValidWorkerEndpointClient,
  normalizeApiManifest,
  UI_OUTPUT_TO_FORMAT,
  writeCustomModuleToStorage,
  type CustomModuleManifestLite,
  type UiOutputType,
} from "@/lib/custom-modules-storage";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const OUTPUT_OPTIONS: ReadonlyArray<{
  value: UiOutputType;
  hint: string;
}> = [
  { value: "Video", hint: "9:16" },
  { value: "Carousel", hint: "4:5" },
  { value: "Graphic", hint: "Image" },
];

type RegisterModuleModalProps = {
  open: boolean;
  onClose: () => void;
  onRegistered: (manifest: CustomModuleManifestLite) => void;
};

function humanRegisterError(code: string | undefined, message?: string): string {
  switch (code) {
    case "title_required":
      return "Укажите название модуля";
    case "invalid_output_format":
      return "Выберите тип вывода: Video, Carousel или Graphic";
    case "invalid_endpoint":
      return "Endpoint: http(s)://… или относительный /api/…";
    case "reserved_id":
      return "Этот id занят ядровым модулем";
    case "invalid_id":
      return message?.trim() || "Некорректный id модуля";
    case "invalid_json":
      return "Некорректный запрос";
    case "register_failed":
      return "Не удалось зарегистрировать модуль";
    default:
      return message?.trim() || code?.trim() || "Не удалось зарегистрировать модуль";
  }
}

export function RegisterModuleModal({
  open,
  onClose,
  onRegistered,
}: RegisterModuleModalProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [outputType, setOutputType] = useState<UiOutputType>("Video");
  const [workerEndpoint, setWorkerEndpoint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setOutputType("Video");
    setWorkerEndpoint("");
    setSubmitting(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    resetForm();
    const t = window.setTimeout(() => titleInputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!submitting) onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  /** Simple focus trap within the dialog panel. */
  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedTitle = title.trim();
    const trimmedEndpoint = workerEndpoint.trim();

    if (!trimmedTitle) {
      setError("Укажите название модуля");
      titleInputRef.current?.focus();
      return;
    }
    if (!isValidWorkerEndpointClient(trimmedEndpoint)) {
      setError("Endpoint: http(s)://… или относительный /api/…");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/modules/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          outputFormat: UI_OUTPUT_TO_FORMAT[outputType],
          workerEndpoint: trimmedEndpoint,
        }),
      });

      let data: {
        ok?: boolean;
        error?: string;
        message?: string;
        manifest?: unknown;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = { ok: false, error: "invalid_json" };
      }

      if (!res.ok || !data.ok) {
        setError(humanRegisterError(data.error, data.message));
        setSubmitting(false);
        return;
      }

      const manifest = normalizeApiManifest(data.manifest);
      if (!manifest) {
        setError("Сервер вернул некорректный манифест");
        setSubmitting(false);
        return;
      }

      writeCustomModuleToStorage(manifest);
      onRegistered(manifest);
      setSubmitting(false);
      onClose();
    } catch {
      setError(humanRegisterError("register_failed"));
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="register-module-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <motion.button
            type="button"
            aria-label="Закрыть регистрацию модуля"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => {
              if (!submitting) onClose();
            }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            data-testid="register-module-modal"
            onKeyDown={onPanelKeyDown}
            className={cn(
              "relative z-10 w-full max-w-md rounded-xl border border-[var(--border-glass)]",
              "bg-[var(--bg-elevated)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
              "backdrop-blur-md",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.97 }
            }
            transition={reduceMotion ? { duration: 0 } : SPRING}
          >
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.14em] text-[var(--accent-gold)]">
              Plugin Slot · C-21
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
            >
              [+ Register New Module]
            </h2>
            <p id={descId} className="mt-2 text-sm text-[var(--text-muted)]">
              Зарегистрировать модуль — название, тип вывода и URL воркера.
              Без секретов; только HTTP JSON.
            </p>

            <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Название <span className="text-[var(--accent-terracotta)]">*</span>
                </span>
                <input
                  ref={titleInputRef}
                  type="text"
                  name="title"
                  required
                  autoComplete="off"
                  data-testid="register-module-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Yerevan Hooks Worker"
                  className={cn(
                    "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2.5",
                    "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-mono)]",
                    "outline-none focus:border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))]",
                  )}
                />
              </label>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-medium text-[var(--text-muted)]">
                  Тип вывода
                </legend>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Тип вывода"
                >
                  {OUTPUT_OPTIONS.map((opt) => {
                    const selected = outputType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        data-testid={`register-output-${opt.value.toLowerCase()}`}
                        onClick={() => setOutputType(opt.value)}
                        className={cn(
                          "rounded-lg border px-2 py-2.5 text-center transition-colors",
                          selected
                            ? "border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))] bg-[color-mix(in_srgb,var(--accent-blue)_14%,var(--bg-card))] text-[var(--text-primary)]"
                            : "border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-gold)_35%,var(--border-glass))]",
                        )}
                      >
                        <span className="block text-sm font-semibold">
                          {opt.value}
                        </span>
                        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                          {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Worker API endpoint{" "}
                  <span className="text-[var(--accent-terracotta)]">*</span>
                </span>
                <input
                  type="text"
                  name="workerEndpoint"
                  required
                  autoComplete="off"
                  data-testid="register-module-endpoint"
                  value={workerEndpoint}
                  onChange={(e) => setWorkerEndpoint(e.target.value)}
                  placeholder="https://… или /api/workers/…"
                  className={cn(
                    "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2.5",
                    "font-[family-name:var(--font-mono-jb)] text-sm text-[var(--text-primary)]",
                    "placeholder:text-[var(--text-mono)]",
                    "outline-none focus:border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))]",
                  )}
                />
              </label>

              {error ? (
                <p
                  role="alert"
                  data-testid="register-module-error"
                  className="rounded-lg border border-[color-mix(in_srgb,var(--accent-terracotta)_40%,var(--border-glass))] bg-[color-mix(in_srgb,var(--accent-terracotta)_10%,transparent)] px-3 py-2 text-sm text-[var(--accent-terracotta)]"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                <motion.button
                  type="button"
                  data-testid="register-module-cancel"
                  disabled={submitting}
                  onClick={onClose}
                  whileTap={reduceMotion || submitting ? undefined : { scale: 0.97 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  className={cn(
                    "rounded-lg border border-[var(--border-glass)] px-4 py-2.5",
                    "text-sm font-medium text-[var(--text-muted)]",
                    "transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  Cancel
                </motion.button>
                <ReactiveButton
                  type="submit"
                  data-testid="register-module-submit"
                  disabled={submitting}
                  className="min-w-[120px]"
                >
                  {submitting ? "Register…" : "Register"}
                </ReactiveButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
