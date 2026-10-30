"use client";

import { cn } from "@/lib/cn";
import { useInspectStore } from "@/lib/inspect-store";
import type { PersonaState } from "@/lib/inspect-mock";

const AVATARS: { value: PersonaState["avatarId"]; label: string }[] = [
  { value: "anna", label: "Anna (Literary Curator)" },
  { value: "gevorg", label: "Gevorg (Casual Yerevan)" },
  { value: "lilit", label: "Lilit (Tech Strategist)" },
  { value: "aram", label: "Aram (Historian)" },
];

const EMOTIONS: { value: PersonaState["emotion"]; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "energetic", label: "Energetic" },
  { value: "documentary", label: "Documentary" },
  { value: "soft", label: "Soft" },
];

const VOICES: { value: PersonaState["voiceId"]; label: string }[] = [
  { value: "hy-deep-baritone", label: "Deep Baritone · Eastern Armenian" },
  { value: "hy-anna-warm", label: "Warm Alto · Literary Yerevan" },
  { value: "hy-energetic-tenor", label: "Energetic Tenor · Diaspora" },
  { value: "hy-doc-soft", label: "Documentary Soft · Bilingual" },
];

const RATES: { value: PersonaState["speechRate"]; label: string }[] = [
  { value: "slow", label: "Slow" },
  { value: "natural", label: "Natural" },
  { value: "fast", label: "Fast" },
];

const selectClass = cn(
  "w-full appearance-none rounded-lg border border-[var(--border-glass)] bg-[var(--bg-hover)]",
  "px-3 py-2 pr-8 text-sm text-[var(--text-primary)]",
  "focus:border-[var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]",
);

function FieldSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[11px] font-medium text-[var(--text-muted)]"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden
        >
          ▾
        </span>
      </div>
    </div>
  );
}

export function HeyGenPersonaSwitcher() {
  const persona = useInspectStore((s) => s.persona);
  const setPersonaField = useInspectStore((s) => s.setPersonaField);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
          Synthesizer &amp; Persona Rig
        </h3>
        <span className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-blue-bright)]">
          HeyGen v2 · UI
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FieldSelect
          id="heygen-avatar"
          label="Digital Human Persona"
          value={persona.avatarId}
          options={AVATARS}
          onChange={(v) => setPersonaField("avatarId", v)}
        />
        <FieldSelect
          id="heygen-voice"
          label="Timbre & Dialect"
          value={persona.voiceId}
          options={VOICES}
          onChange={(v) => setPersonaField("voiceId", v)}
        />
        <FieldSelect
          id="heygen-emotion"
          label="Emotion"
          value={persona.emotion}
          options={EMOTIONS}
          onChange={(v) => setPersonaField("emotion", v)}
        />
        <FieldSelect
          id="heygen-rate"
          label="Speech Rate"
          value={persona.speechRate}
          options={RATES}
          onChange={(v) => setPersonaField("speechRate", v)}
        />
      </div>
    </div>
  );
}
