"use client";

/**
 * S52 — Heritage / Atelier Synth brandbook board (3:5 Embla cards).
 * Tokens only: color ramps · typography · text-block · small-element.
 * No button layout kits; no COVER/BODY/CTA sliced chrome.
 */

import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import {
  createDefaultVernatunPreset,
  designPresetToCssVars,
  resolveSlotPresetFile,
  type DesignLibrarySlot,
  type DesignPresetFile,
} from "@/lib/settings/design-library";

const BOARD_BEIGE = "#E8DFD0";
const CARD_CREAM = "#F7F2EA";
const INK = "#1A1814";

export type BrandbookBoardProps = {
  slot: DesignLibrarySlot;
  compact?: boolean;
  className?: string;
};

function resolvePreset(slot: DesignLibrarySlot): DesignPresetFile {
  return (
    resolveSlotPresetFile(slot) ??
    slot.presetFile ??
    createDefaultVernatunPreset(slot.name || "Vernatun Design")
  );
}

function mixHex(hex: string, toward: "#ffffff" | "#000000", amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const tr = toward === "#ffffff" ? 255 : 0;
  const tg = toward === "#ffffff" ? 255 : 0;
  const tb = toward === "#ffffff" ? 255 : 0;
  const rr = Math.round(r + (tr - r) * amount);
  const gg = Math.round(g + (tg - g) * amount);
  const bb = Math.round(b + (tb - b) * amount);
  return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
}

function ColorScaleCard({
  label,
  base,
  compact,
}: {
  label: string;
  base: string;
  compact?: boolean;
}) {
  const steps = [0.55, 0.35, 0.15, 0, 0.2, 0.4, 0.6].map((amt, i) =>
    i < 3 ? mixHex(base, "#ffffff", amt) : i === 3 ? base : mixHex(base, "#000000", amt),
  );
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(26,24,20,0.08)] shadow-sm",
        compact ? "p-1.5" : "p-2.5",
      )}
      style={{ background: CARD_CREAM }}
      data-testid="brandbook-colors-card"
    >
      <p
        className={cn(
          "font-[family-name:var(--font-century-gothic)] text-[10px] font-semibold uppercase tracking-wide",
          compact ? "mb-1" : "mb-2",
        )}
        style={{ color: INK }}
      >
        {label}
      </p>
      <div className="flex overflow-hidden rounded-md border border-[rgba(26,24,20,0.1)]">
        {steps.map((c, i) => (
          <div
            key={`${label}-${i}`}
            className={compact ? "h-6 flex-1" : "h-8 flex-1"}
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
      <p
        className={cn(
          "font-[family-name:var(--font-mono-jb)] text-[9px] tabular-nums",
          compact ? "mt-1" : "mt-1.5",
        )}
        style={{ color: "rgba(26,24,20,0.55)" }}
      >
        {base}
      </p>
    </div>
  );
}

function TypeCard({
  title,
  family,
  sample,
  compact,
}: {
  title: string;
  family: string;
  sample: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(26,24,20,0.08)] shadow-sm",
        compact ? "p-1.5" : "p-2.5",
      )}
      style={{ background: CARD_CREAM }}
      data-testid="brandbook-type-card"
    >
      <p
        className={cn(
          "font-[family-name:var(--font-century-gothic)] text-[10px] font-semibold uppercase tracking-wide",
          compact ? "mb-0.5" : "mb-1",
        )}
        style={{ color: INK }}
      >
        {title}
      </p>
      <p
        className={cn(
          "leading-none tracking-tight",
          compact ? "text-[22px]" : "text-[28px]",
        )}
        style={{ color: INK, fontFamily: family }}
      >
        Aa
      </p>
      <p
        className={cn("truncate", compact ? "mt-0.5 text-[10px]" : "mt-1 text-[11px]")}
        style={{ color: "rgba(26,24,20,0.7)", fontFamily: family }}
      >
        {sample}
      </p>
      {!compact ? (
        <p
          className="mt-1 truncate font-[family-name:var(--font-mono-jb)] text-[8px]"
          style={{ color: "rgba(26,24,20,0.45)" }}
        >
          {family}
        </p>
      ) : null}
    </div>
  );
}

export function BrandbookBoard({
  slot,
  compact = false,
  className,
}: BrandbookBoardProps) {
  const preset = resolvePreset(slot);
  const vars = designPresetToCssVars(preset) as CSSProperties;
  const colors = preset.colors;
  const display = preset.typography.display || "Georgia, serif";
  const body = preset.typography.body || "Century Gothic, sans-serif";
  const cardRadius = preset.components.card?.radius ?? "12px";
  const tilePad = compact ? "p-1.5" : "p-2.5";
  const tileLabelMb = compact ? "mb-1" : "mb-2";
  const scale = preset.typography.scale;

  return (
    <div
      data-testid="brandbook-board"
      data-preset={preset.preset}
      className={cn(
        "relative flex h-full min-h-0 flex-col justify-start overflow-hidden rounded-2xl border border-[rgba(26,24,20,0.12)]",
        className,
      )}
      style={{
        ...vars,
        background: BOARD_BEIGE,
        backgroundImage:
          "radial-gradient(rgba(26,24,20,0.04) 1px, transparent 1px)",
        backgroundSize: "12px 12px",
      }}
    >
      <div
        className={cn(
          "grid grid-cols-2 content-start overflow-hidden",
          compact ? "gap-1.5 p-1.5" : "gap-2 p-3",
        )}
      >
        <ColorScaleCard label="Accent" base={colors.accent} compact={compact} />
        <ColorScaleCard label="Surface" base={colors.surface} compact={compact} />
        <ColorScaleCard label="Text" base={colors.text} compact={compact} />

        <TypeCard
          title="Display"
          family={display}
          sample="Heritage"
          compact={compact}
        />
        <TypeCard
          title="Body"
          family={body}
          sample="Community Aa"
          compact={compact}
        />

        {/* Text-block tokens (Atelier) — not button kits */}
        <div
          className={cn(
            "col-span-2 rounded-xl border border-[rgba(26,24,20,0.08)] shadow-sm",
            tilePad,
          )}
          style={{ background: CARD_CREAM }}
          data-testid="brandbook-textblock-card"
        >
          <p
            className={cn(
              "font-[family-name:var(--font-century-gothic)] text-[10px] font-semibold uppercase tracking-wide",
              tileLabelMb,
            )}
            style={{ color: INK }}
          >
            Text block
          </p>
          <div
            className="rounded-lg border border-[rgba(26,24,20,0.08)] px-2 py-1.5"
            style={{ background: colors.bg, borderRadius: cardRadius }}
          >
            <p
              className={cn(
                "font-semibold leading-tight",
                compact ? "text-[11px]" : "text-[13px]",
              )}
              style={{ color: colors.text, fontFamily: display }}
            >
              Hook line
            </p>
            <p
              className={cn(
                "mt-1 leading-snug",
                compact ? "text-[9px]" : "text-[10px]",
              )}
              style={{ color: colors.muted, fontFamily: body }}
            >
              Body paragraph · spacing · contrast
            </p>
            {scale ? (
              <p
                className="mt-1 font-[family-name:var(--font-mono-jb)] text-[8px] tabular-nums"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {scale.cover}/{scale.h2}/{scale.body}/{scale.caption}
              </p>
            ) : null}
          </div>
        </div>

        {/* Small-element tokens: chips, labels, progress accents */}
        <div
          className={cn(
            "rounded-xl border border-[rgba(26,24,20,0.08)] shadow-sm",
            tilePad,
          )}
          style={{ background: CARD_CREAM }}
          data-testid="brandbook-small-element-card"
        >
          <p
            className={cn(
              "font-[family-name:var(--font-century-gothic)] text-[10px] font-semibold uppercase tracking-wide",
              tileLabelMb,
            )}
            style={{ color: INK }}
          >
            Small elements
          </p>
          <div className="flex flex-wrap gap-1">
            <span
              className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide"
              style={{
                background: colors.accent,
                color: colors.bg,
                borderRadius: "999px",
              }}
            >
              chip
            </span>
            <span
              className="inline-flex items-center border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide"
              style={{
                color: colors.muted,
                borderColor: "rgba(26,24,20,0.18)",
                borderRadius: "4px",
                background: colors.bg,
              }}
            >
              label
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-semibold"
              style={{ color: colors.accent }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: colors.accent }}
              />
              meta
            </span>
          </div>
          <div className={cn("space-y-1", compact ? "mt-1.5" : "mt-2")}>
            {[0.85, 0.55, 0.35].map((w, i) => (
              <div
                key={i}
                className={cn(
                  "overflow-hidden rounded-full",
                  compact ? "h-1.5" : "h-2",
                )}
                style={{ background: "rgba(26,24,20,0.08)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${w * 100}%`,
                    background:
                      i === 0
                        ? colors.accent
                        : i === 1
                          ? colors.muted
                          : colors.surface,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border border-[rgba(26,24,20,0.08)] shadow-sm",
            tilePad,
          )}
          style={{ background: CARD_CREAM }}
          data-testid="brandbook-bars-card"
        >
          <p
            className={cn(
              "font-[family-name:var(--font-century-gothic)] text-[10px] font-semibold uppercase tracking-wide",
              tileLabelMb,
            )}
            style={{ color: INK }}
          >
            Accents
          </p>
          <div
            className={cn("flex items-end gap-1", compact ? "mt-0.5" : "mt-1")}
            style={{ height: compact ? 28 : 40 }}
          >
            {[40, 70, 55, 90, 45].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: i % 2 === 0 ? colors.accent : colors.muted,
                  borderRadius: "3px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
