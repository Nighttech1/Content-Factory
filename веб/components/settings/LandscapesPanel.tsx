"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/cn";

type LandscapeCharacter = {
  number: number;
  name: string;
  photoUrls: string[];
  updatedAt?: string;
};

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_ANGLES = 8;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * S55/S56 — Settings «Персонажи» below Brand (characters; API landscapes).
 * Consumes GET/POST `/api/settings/landscapes` (+ DELETE by number).
 */
export function LandscapesPanel() {
  const [characters, setCharacters] = useState<LandscapeCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/landscapes", { cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        characters?: LandscapeCharacter[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "load_failed");
      setCharacters(json.characters ?? []);
    } catch {
      setError("Не удалось загрузить персонажей.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addPhotos(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);
    const next = [...photoUrls];
    for (const file of list) {
      if (next.length >= MAX_ANGLES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`«${file.name}» больше 2 МБ — пропущен.`);
        continue;
      }
      try {
        next.push(await fileToDataUrl(file));
      } catch {
        setError("Не удалось прочитать одно из фото.");
      }
    }
    setPhotoUrls(next);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) void addPhotos(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) void addPhotos(e.dataTransfer.files);
  }

  async function onAddCharacter() {
    setError(null);
    setOkMsg(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Укажите имя персонажа.");
      return;
    }
    if (photoUrls.length === 0) {
      setError("Добавьте хотя бы одно фото ракурса.");
      return;
    }
    const n = Number.parseInt(numberInput, 10);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/landscapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          photoUrls,
          number: Number.isFinite(n) && n > 0 ? n : undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        character?: LandscapeCharacter;
        error?: string;
      };
      if (!res.ok || !json.character) {
        throw new Error(json.error ?? "save_failed");
      }
      setName("");
      setNumberInput("");
      setPhotoUrls([]);
      setOkMsg(`Добавлен персонаж №${json.character.number} «${json.character.name}».`);
      await load();
    } catch {
      setError("Не удалось сохранить персонажа.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(num: number) {
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch(`/api/settings/landscapes/${num}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete_failed");
      setOkMsg(`Персонаж №${num} удалён.`);
      await load();
    } catch {
      setError("Не удалось удалить персонажа.");
    }
  }

  return (
    <section
      id="settings-landscapes"
      data-testid="settings-landscapes-panel"
      aria-labelledby="settings-landscapes-heading"
      className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-2 py-4 sm:px-3"
    >
      <div className="w-full min-w-[min(100%,18rem)] max-w-[50%] flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id="settings-landscapes-heading"
          className="font-[family-name:var(--font-ui)] text-lg font-semibold tracking-tight text-[var(--text-primary)] text-balance"
        >
          Персонажи
        </h2>
        <p className="text-pretty text-xs text-[var(--text-muted)]">
          Каталог персонажей: имя и фото с разных ракурсов. Номер = поле{" "}
          <span className="text-[var(--text-primary)]">hero</span> в таблице.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
      ) : (
        <>
          <ul
            data-testid="settings-landscapes-list"
            className="grid gap-3 sm:grid-cols-2"
          >
            {characters.length === 0 ? (
              <li className="col-span-full rounded-lg border border-dashed border-[var(--border-glass)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                Пока пусто — добавьте первого персонажа ниже.
              </li>
            ) : (
              characters.map((c) => (
                <li
                  key={c.number}
                  data-testid={`settings-landscape-card-${c.number}`}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-[family-name:var(--font-ui)] text-sm font-bold text-[var(--text-primary)]">
                        №{c.number} · {c.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {c.photoUrls.length} ракурс
                        {c.photoUrls.length === 1 ? "" : "а"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Удалить персонажа ${c.name}`}
                      data-testid={`settings-landscape-delete-${c.number}`}
                      onClick={() => void onDelete(c.number)}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[color-mix(in_srgb,#f87171_90%,white)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.photoUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element -- catalog thumbs
                      <img
                        key={`${c.number}-${i}`}
                        src={url}
                        alt={`${c.name} ракурс ${i + 1}`}
                        className="h-14 w-14 rounded-md border border-[var(--border-glass)] object-cover"
                      />
                    ))}
                  </div>
                </li>
              ))
            )}
          </ul>

          <div
            data-testid="settings-landscapes-create"
            className="flex flex-col gap-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-3"
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Новый персонаж
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
                  Имя
                </span>
                <input
                  data-testid="settings-landscape-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Арег"
                  className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[var(--accent-blue-bright)]">
                  №
                </span>
                <input
                  data-testid="settings-landscape-number"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder="авто"
                  inputMode="numeric"
                  className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm tabular-nums text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
                />
              </label>
            </div>

            <div
              data-testid="settings-landscape-photos-dropzone"
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
                "flex flex-col items-center gap-2 rounded-xl border border-dashed px-3 py-4 text-center transition-colors",
                dragging
                  ? "border-[var(--accent-blue-bright)] bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)]"
                  : "border-[var(--border-glass)] bg-[var(--bg-elevated)]",
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                data-testid="settings-landscape-photos-file"
                onChange={onFileChange}
              />
              <ImageIcon className="h-5 w-5 text-[var(--text-muted)]" />
              <p className="text-xs text-[var(--text-muted)]">
                Несколько ракурсов (до {MAX_ANGLES})
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glass)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Фото
              </button>
            </div>

            {photoUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, i) => (
                  <div key={`draft-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Ракурс ${i + 1}`}
                      className="h-14 w-14 rounded-md border border-[var(--border-glass)] object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Убрать ракурс ${i + 1}`}
                      onClick={() =>
                        setPhotoUrls((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="absolute -right-1 -top-1 rounded-full bg-[var(--bg-canvas)] p-0.5 text-[var(--text-muted)] ring-1 ring-[var(--border-glass)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {error ? (
              <p
                data-testid="settings-landscapes-error"
                className="text-sm text-[color-mix(in_srgb,#f87171_90%,white)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {okMsg ? (
              <p
                data-testid="settings-landscapes-ok"
                className="text-sm text-[var(--accent-gold)]"
              >
                {okMsg}
              </p>
            ) : null}

            <button
              type="button"
              data-testid="settings-landscape-add"
              disabled={saving}
              onClick={() => void onAddCharacter()}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-blue-bright)] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {saving ? "Сохранение…" : "Добавить персонажа"}
            </button>
          </div>
        </>
      )}
      </div>
    </section>
  );
}
