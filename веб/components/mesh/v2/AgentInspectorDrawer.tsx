"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import { ScoutInspectorSettings } from "@/components/mesh/v2/ScoutInspectorSettings";
import { cn } from "@/lib/cn";
import { agentLogAliasIds } from "@/lib/mesh/agent-log-aliases";
import {
  ART_DIRECTOR_AGENT_ID,
  parseArtDirectorReviewUi,
  pickLatestArtDirectorReviewFromDrafts,
  type ArtDirectorReviewUi,
} from "@/lib/mesh/art-director-review-ui";
import { useMeshAgentStore } from "@/lib/mesh/agent-store";
import {
  MESH_MODEL_OPTIONS,
  type AggregatorModelKind,
  type MeshAgent,
  type MeshModelOption,
} from "@/types/mesh-agent";

/** C-139 Motion: translateX open/close 160ms ease-out; reduceMotion → instant. */
const DRAWER_MS = 0.16;
const DRAWER_EASE = { duration: DRAWER_MS, ease: "easeOut" as const };
const INSTANT = { duration: 0 };

const WIDTH_KEY = "cf.mesh.inspector.width";
const WIDTH_KEY_LEGACY = "cf.mesh.agent-panel.width";
const MIN_W = 320;
const MAX_W = 520;
const DEFAULT_W = 420;

/** C-148 — static suggest chips from plugins role PLUGINS.md titles (FileReader MVP). */
const TRAINER_PLUGIN_SUGGESTIONS = [
  "trainer-gap-playbook",
  "21st-ui-catalog",
  "content-factory-ui",
] as const;

type DrawerTab =
  | "instruction"
  | "skills"
  | "model"
  | "scout"
  | "logs"
  | "review";

type AgentLogLine = {
  id: string;
  agentId: string;
  level: "info" | "warn" | "error" | "red";
  message: string;
  ts: string;
  jobId?: string;
  agentRole?: string;
};

function clampWidth(n: number) {
  return Math.min(MAX_W, Math.max(MIN_W, Math.round(n)));
}

function readWidth(): number {
  if (typeof window === "undefined") return DEFAULT_W;
  try {
    const raw =
      window.localStorage.getItem(WIDTH_KEY) ??
      window.localStorage.getItem(WIDTH_KEY_LEGACY);
    if (!raw) return DEFAULT_W;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? clampWidth(n) : DEFAULT_W;
  } catch {
    return DEFAULT_W;
  }
}

function draftFrom(agent: MeshAgent): MeshAgent {
  return JSON.parse(JSON.stringify(agent)) as MeshAgent;
}

function isTrainerAgent(agent: MeshAgent): boolean {
  return (
    agent.roleKind === "trainer" ||
    agent.packId === "team-trainer" ||
    agent.avatarIcon === "trainer"
  );
}

/** C-149 — encode MCP as website|tools|desc; keep legacy mcp:// strings readable. */
function encodeMcpEntry(website: string, tools: string, desc: string): string {
  const w = website.trim();
  const t = tools.trim();
  const d = desc.trim();
  if (!t && !d) return w;
  return `${w}|${t}|${d}`;
}

function parseMcpEntry(raw: string): {
  website: string;
  tools: string;
  desc: string;
} {
  if (!raw.includes("|")) {
    return { website: raw, tools: "", desc: "" };
  }
  const [website = "", tools = "", ...rest] = raw.split("|");
  return { website, tools, desc: rest.join("|") };
}

function mcpChipLabel(raw: string): string {
  const { website, tools, desc } = parseMcpEntry(raw);
  if (!tools && !desc) return website;
  const bits = [website];
  if (tools) bits.push(tools);
  if (desc) bits.push(desc);
  return bits.join(" · ");
}

type ChipGroupProps = {
  title: string;
  hint: string;
  items: string[];
  accent: "blue" | "purple" | "emerald";
  testId: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder: string;
  /** C-148 — optional file upload next to text add. */
  uploadAccept?: string;
  uploadTestId?: string;
  onUploadFiles?: (files: FileList) => void;
  chipLabel?: (item: string) => string;
};

function ChipGroup({
  title,
  hint,
  items,
  accent,
  testId,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
  uploadAccept,
  uploadTestId,
  onUploadFiles,
  chipLabel,
}: ChipGroupProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const colors = {
    blue: {
      dot: "bg-[var(--accent-blue-bright)]",
      chip: "border-[color-mix(in_srgb,var(--accent-blue-bright)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] text-[#93c5fd]",
      btn: "bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-bright)]",
    },
    purple: {
      dot: "bg-[#c084fc]",
      chip: "border-[color-mix(in_srgb,#a78bfa_30%,transparent)] bg-[color-mix(in_srgb,#a78bfa_12%,transparent)] text-[#d8b4fe]",
      btn: "bg-[#7c3aed] hover:bg-[#8b5cf6]",
    },
    emerald: {
      dot: "bg-[#34d399]",
      chip: "border-[color-mix(in_srgb,#34d399_30%,transparent)] bg-[color-mix(in_srgb,#34d399_12%,transparent)] text-[#6ee7b7]",
      btn: "bg-[#059669] hover:bg-[#10b981]",
    },
  }[accent];

  return (
    <div
      data-testid={testId}
      className="rounded-2xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {title}
          </h4>
        </div>
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
          {items.length} подключено
        </span>
      </div>
      <p className="mb-3 text-[11px] text-[var(--text-muted)]">{hint}</p>
      <ul className="mb-3 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <li className="text-[11px] italic text-[var(--text-muted)]">
            Элементы пока не добавлены
          </li>
        ) : (
          items.map((item, idx) => (
            <li
              key={`${item}-${idx}`}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                colors.chip,
              )}
              title={item}
            >
              <span className="truncate">{chipLabel ? chipLabel(item) : item}</span>
              <button
                type="button"
                aria-label={`Удалить ${item}`}
                onClick={() => onRemove(idx)}
                className="shrink-0 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent-blue-bright)]"
        />
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-bold text-white transition",
            colors.btn,
          )}
        >
          + Добавить
        </button>
        {uploadAccept && onUploadFiles && uploadTestId ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={uploadAccept}
              data-testid={uploadTestId}
              className="sr-only"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files?.length) {
                  onUploadFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-blue-bright)]"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden />
              Загрузить файл
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

type AgentInspectorDrawerProps = {
  onClose: () => void;
};

/**
 * C-139 / C-148 / C-149 + S55 — tabs: Инструкция | Скиллы | Модель | Логи (+ Разведка for Scout).
 */
export function AgentInspectorDrawer({ onClose }: AgentInspectorDrawerProps) {
  const reduceMotion = useReducedMotion();
  const selectedAgentId = useMeshAgentStore((s) => s.selectedAgentId);
  const pipelineId = useMeshAgentStore((s) => s.pipelineId);
  const agent = useMeshAgentStore((s) =>
    s.selectedAgentId ? (s.agents[s.selectedAgentId] ?? null) : null,
  );
  const updateAgent = useMeshAgentStore((s) => s.updateAgent);
  const saveAgent = useMeshAgentStore((s) => s.saveAgent);
  const resetAgent = useMeshAgentStore((s) => s.resetAgent);
  const open = agent !== null && agent.roleKind !== "user";
  const [draft, setDraft] = useState<MeshAgent | null>(null);
  const [tab, setTab] = useState<DrawerTab>("instruction");
  const isScout = draft?.roleKind === "scout";
  const isArtDirector = draft?.id === ART_DIRECTOR_AGENT_ID;
  const [skillInput, setSkillInput] = useState("");
  const [pluginInput, setPluginInput] = useState("");
  const [mcpWebsite, setMcpWebsite] = useState("");
  const [mcpTools, setMcpTools] = useState("");
  const [mcpDesc, setMcpDesc] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [widthPx, setWidthPx] = useState(DEFAULT_W);
  const [modelOptions, setModelOptions] = useState<MeshModelOption[]>(() =>
    MESH_MODEL_OPTIONS.map((m) => ({ value: m.value, label: m.label })),
  );
  const [logs, setLogs] = useState<AgentLogLine[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsHasError, setLogsHasError] = useState(false);
  const [adReview, setAdReview] = useState<ArtDirectorReviewUi | null>(null);
  const [adReviewLoading, setAdReviewLoading] = useState(false);
  const [adReviewBusy, setAdReviewBusy] = useState(false);
  const [adDraftId, setAdDraftId] = useState("");
  const [adReviewError, setAdReviewError] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setWidthPx(readWidth());
  }, []);

  /** Variant A — Ревью tab: load last artDirectorReview from draft payload. */
  useEffect(() => {
    if (!open || !isArtDirector) return;
    if (tab !== "review" && tab !== "logs") return;
    let cancelled = false;
    setAdReviewLoading(true);
    setAdReviewError(null);
    void (async () => {
      try {
        const res = await fetch(
          "/api/studio/drafts?moduleId=carousel-engine",
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (!cancelled) setAdReview(null);
          return;
        }
        const json = (await res.json()) as { drafts?: unknown[] };
        const drafts = Array.isArray(json.drafts) ? json.drafts : [];
        const review = pickLatestArtDirectorReviewFromDrafts(
          drafts as Parameters<typeof pickLatestArtDirectorReviewFromDrafts>[0],
        );
        if (cancelled) return;
        setAdReview(review);
        if (review?.draftId && !adDraftId.trim()) {
          setAdDraftId(review.draftId);
        }
      } catch {
        if (!cancelled) setAdReview(null);
      } finally {
        if (!cancelled) setAdReviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on tab/agent; draftId typed by user
  }, [open, isArtDirector, tab, draft?.id]);

  /** S55 — Логи tab: GET /api/agents/:id/logs (+ aliases e.g. scriptwriter↔copywriter) */
  useEffect(() => {
    if (!open || tab !== "logs" || !draft?.id) return;
    let cancelled = false;
    setLogsLoading(true);
    void (async () => {
      try {
        const ids = agentLogAliasIds(draft.id);
        const batches = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(
              `/api/agents/${encodeURIComponent(id)}/logs?limit=80`,
              { cache: "no-store" },
            );
            const json = (await res.json()) as {
              ok?: boolean;
              logs?: AgentLogLine[];
              hasError?: boolean;
            };
            return {
              logs: json.logs ?? [],
              hasError: Boolean(json.hasError),
            };
          }),
        );
        if (cancelled) return;
        const byId = new Map<string, AgentLogLine>();
        for (const batch of batches) {
          for (const line of batch.logs) byId.set(line.id, line);
        }
        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
        );
        setLogs(merged.slice(0, 80));
        setLogsHasError(batches.some((b) => b.hasError));
      } catch {
        if (!cancelled) {
          setLogs([]);
          setLogsHasError(false);
        }
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tab, draft?.id]);

  /** C-154 — prefer live aggregator model list; fallback to static MESH_MODEL_OPTIONS. */
  useEffect(() => {
    if (!open || tab !== "model") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/aggregator/models", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          ok?: boolean;
          models?: Array<{ id?: string; label?: string; kind?: AggregatorModelKind }>;
        };
        const remote: MeshModelOption[] = [];
        for (const m of json.models ?? []) {
          const value = typeof m.id === "string" ? m.id.trim() : "";
          if (!value) continue;
          remote.push({
            value,
            label:
              (m.label?.trim() || value) +
              (m.kind === "image" ? " · image" : ""),
            kind: m.kind,
          });
        }
        if (cancelled || remote.length === 0) return;
        const staticFallback: MeshModelOption[] = MESH_MODEL_OPTIONS.map(
          (m) => ({
            value: m.value,
            label: m.label,
          }),
        );
        const byId = new Map<string, MeshModelOption>();
        for (const m of [...staticFallback, ...remote]) {
          byId.set(m.value, m);
        }
        setModelOptions(Array.from(byId.values()));
      } catch {
        /* keep static */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tab]);

  useEffect(() => {
    if (!agent || agent.roleKind === "user") {
      setDraft(null);
      return;
    }
    setDraft(draftFrom(agent));
    setSkillInput("");
    setPluginInput("");
    setMcpWebsite("");
    setMcpTools("");
    setMcpDesc("");
    setAdReviewError(null);
    setTab(
      agent.id === ART_DIRECTOR_AGENT_ID
        ? "review"
        : agent.roleKind === "scout"
          ? "scout"
          : "instruction",
    );
    setToast(null);
  }, [agent?.id, selectedAgentId]);

  async function runArtDirectorCheck() {
    const id = adDraftId.trim();
    if (!id) {
      setAdReviewError("Укажите id черновика (draftId)");
      return;
    }
    setAdReviewBusy(true);
    setAdReviewError(null);
    try {
      const res = await fetch("/api/studio/art-director/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: id }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        verdict?: unknown;
        remakeEnqueued?: boolean;
        draftId?: string | null;
      };
      if (!res.ok || !json.ok) {
        setAdReviewError(json.error ?? `Ошибка ${res.status}`);
        return;
      }
      const review = parseArtDirectorReviewUi(json.verdict, {
        draftId: typeof json.draftId === "string" ? json.draftId : id,
      });
      if (review) setAdReview(review);
      setToast("Ревью готово — перерисовка не запускалась");
      window.setTimeout(() => setToast(null), 2400);
      window.dispatchEvent(new Event("cf:art-director-review"));
    } catch {
      setAdReviewError("Сеть / сервер недоступны");
    } finally {
      setAdReviewBusy(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const el = panelRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-testid^='mesh-agent-node']")) return;
      onClose();
    };
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose]);

  const onResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startW: widthPx };
    },
    [widthPx],
  );

  const onResizePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      setWidthPx(clampWidth(dragRef.current.startW + delta));
    },
    [],
  );

  const onResizePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      try {
        window.localStorage.setItem(WIDTH_KEY, String(widthPx));
      } catch {
        /* */
      }
    },
    [widthPx],
  );

  function patchDraft(patch: Partial<MeshAgent>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  function addToList(
    key: "skills" | "plugins",
    value: string,
    clear: () => void,
  ) {
    const v = value.trim();
    if (!v || !draft) return;
    const list = draft[key];
    if (list.includes(v)) {
      clear();
      return;
    }
    patchDraft({ [key]: [...list, v] });
    clear();
  }

  function appendUnique(key: "skills" | "plugins", entries: string[]) {
    if (!draft || entries.length === 0) return;
    const list = [...draft[key]];
    for (const entry of entries) {
      if (!list.includes(entry)) list.push(entry);
    }
    patchDraft({ [key]: list });
  }

  async function onUploadSkillFiles(files: FileList) {
    const names: string[] = [];
    for (const file of Array.from(files)) {
      const base = file.name.trim();
      if (!base) continue;
      names.push(base.endsWith(".md") ? `skill:${base}` : base);
      // FileReader read optional — metadata only; never persist file body secrets.
      if (file.name.toLowerCase().endsWith(".md")) {
        try {
          await file.text();
        } catch {
          /* ignore read errors */
        }
      }
    }
    appendUnique("skills", names);
  }

  async function onUploadPluginFiles(files: FileList) {
    const names: string[] = [];
    for (const file of Array.from(files)) {
      const base = file.name.trim();
      if (!base) continue;
      names.push(base);
    }
    appendUnique("plugins", names);
  }

  function addMcpBinding() {
    if (!draft) return;
    const website = mcpWebsite.trim();
    if (!website) {
      setToast("Укажите сайт MCP (обязательно)");
      window.setTimeout(() => setToast(null), 2000);
      return;
    }
    const entry = encodeMcpEntry(website, mcpTools, mcpDesc);
    if (draft.mcp.includes(entry)) {
      setMcpWebsite("");
      setMcpTools("");
      setMcpDesc("");
      return;
    }
    patchDraft({ mcp: [...draft.mcp, entry] });
    setMcpWebsite("");
    setMcpTools("");
    setMcpDesc("");
  }

  function onSave() {
    if (!draft) return;
    updateAgent(draft.id, draft);
    saveAgent(draft.id);
    setToast(`Настройки агента «${draft.name}» сохранены`);
    window.setTimeout(() => setToast(null), 2200);
  }

  function onReset() {
    if (!draft) return;
    resetAgent(draft.id);
    const refreshed = useMeshAgentStore.getState().agents[draft.id];
    if (refreshed) setDraft(draftFrom(refreshed));
    setToast("Сброшено");
    window.setTimeout(() => setToast(null), 1600);
  }

  const tabBtn = (id: DrawerTab, label: string) => (
    <button
      type="button"
      key={id}
      data-testid={`agent-inspector-tab-${id}`}
      onClick={() => setTab(id)}
      className={cn(
        "border-b-2 px-3 py-3.5 text-xs font-semibold transition",
        tab === id
          ? "border-[var(--accent-blue-bright)] text-[var(--accent-blue-bright)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]",
      )}
    >
      {label}
    </button>
  );

  const showTrainerSuggests = draft ? isTrainerAgent(draft) : false;

  return (
    <AnimatePresence>
      {open && draft ? (
        <motion.aside
          ref={panelRef}
          data-testid="agent-inspector-drawer"
          aria-label={`Инспектор: ${draft.name}`}
          className={cn(
            "pointer-events-auto absolute bottom-0 right-0 top-0 z-30 flex flex-col",
            "border-l border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_98%,transparent)]",
            "shadow-[-12px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
          )}
          style={{ width: `min(100%, ${widthPx}px)` }}
          initial={reduceMotion ? false : { x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={reduceMotion ? INSTANT : DRAWER_EASE}
        >
          <div
            data-testid="agent-inspector-resize"
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину инспектора"
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
            className="absolute left-0 top-0 z-30 h-full w-1.5 -translate-x-1/2 cursor-col-resize touch-none rounded-full bg-transparent hover:bg-[color-mix(in_srgb,var(--accent-blue-bright)_45%,transparent)]"
          />

          <header className="flex items-start justify-between gap-3 border-b border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_100%,transparent)] px-5 py-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <AgentProfessionAvatar
                packId={draft.packId}
                label={draft.name}
                roleKind={draft.roleKind}
              />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-extrabold text-[var(--text-primary)]">
                    {draft.name}
                  </h2>
                  <NeonBadge tone="blue">{draft.role}</NeonBadge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Назначение агента в пайплайне
                </p>
                <label className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    data-testid="agent-inspector-active"
                    checked={draft.isActive}
                    onChange={(e) =>
                      patchDraft({ isActive: e.target.checked })
                    }
                    className="h-3.5 w-3.5 accent-[var(--accent-blue-bright)]"
                  />
                  Активен
                </label>
              </div>
            </div>
            <button
              type="button"
              data-testid="agent-inspector-close"
              onClick={onClose}
              aria-label="Закрыть инспектор"
              className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div
            data-testid="agent-inspector-tabs"
            className="flex gap-0 overflow-x-auto border-b border-[var(--border-glass)] bg-[var(--bg-canvas)] px-5"
          >
            {tabBtn("instruction", "Инструкция")}
            {tabBtn("skills", "Скиллы & Инструменты")}
            {tabBtn("model", "Модель & Параметры")}
            {tabBtn("logs", "Логи")}
            {isArtDirector ? tabBtn("review", "Ревью") : null}
            {isScout ? tabBtn("scout", "Разведка") : null}
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
            {tab === "instruction" ? (
              <section data-testid="agent-inspector-pane-instruction">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Системная инструкция (System Prompt)
                  </label>
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--accent-blue-bright)]">
                    Markdown supported
                  </span>
                </div>
                <p className="mb-2 text-xs text-[var(--text-muted)]">
                  Определяет логику, формат ответов, tone of voice и жёсткие
                  правила работы агента.
                </p>
                <textarea
                  data-testid="agent-inspector-prompt"
                  value={draft.systemPrompt}
                  onChange={(e) =>
                    patchDraft({ systemPrompt: e.target.value })
                  }
                  rows={16}
                  className="w-full resize-none rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] p-3.5 font-[family-name:var(--font-mono-jb)] text-xs leading-relaxed text-[var(--text-primary)] outline-none focus-visible:border-[var(--accent-blue-bright)]"
                />
              </section>
            ) : null}

            {tab === "skills" ? (
              <section
                data-testid="agent-inspector-pane-skills"
                className="space-y-6"
              >
                <ChipGroup
                  title="1. Скиллы (Skills)"
                  hint="Внутренние навыки и сценарии. Можно ввести имя или загрузить файл .md / .json / .zip / .txt."
                  items={draft.skills}
                  accent="blue"
                  testId="agent-inspector-skills"
                  inputValue={skillInput}
                  onInputChange={setSkillInput}
                  onAdd={() =>
                    addToList("skills", skillInput, () => setSkillInput(""))
                  }
                  onRemove={(idx) =>
                    patchDraft({
                      skills: draft.skills.filter((_, i) => i !== idx),
                    })
                  }
                  placeholder="Новый скилл (Enter)..."
                  uploadAccept=".md,.json,.zip,.txt"
                  uploadTestId="agent-inspector-skills-upload"
                  onUploadFiles={onUploadSkillFiles}
                />
                <ChipGroup
                  title="2. Плагины (Plugins)"
                  hint="Внешние модули расширения. Имя папки или файл .md / .json / .zip / .txt."
                  items={draft.plugins}
                  accent="purple"
                  testId="agent-inspector-plugins"
                  inputValue={pluginInput}
                  onInputChange={setPluginInput}
                  onAdd={() =>
                    addToList("plugins", pluginInput, () => setPluginInput(""))
                  }
                  onRemove={(idx) =>
                    patchDraft({
                      plugins: draft.plugins.filter((_, i) => i !== idx),
                    })
                  }
                  placeholder="Новый плагин (Enter)..."
                  uploadAccept=".md,.json,.zip,.txt"
                  uploadTestId="agent-inspector-plugins-upload"
                  onUploadFiles={onUploadPluginFiles}
                />

                {showTrainerSuggests ? (
                  <div
                    data-testid="agent-inspector-trainer-plugin-suggest"
                    className="rounded-2xl border border-[color-mix(in_srgb,#a78bfa_28%,var(--border-glass))] bg-[color-mix(in_srgb,#a78bfa_8%,transparent)] p-4"
                  >
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-[#d8b4fe]">
                      Найти / добавить плагин
                    </h4>
                    <p className="mb-3 text-[11px] text-[var(--text-muted)]">
                      Подсказки из каталога plugins (trainer / frontend /
                      backend). Нажмите — имя добавится в список плагинов.
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {TRAINER_PLUGIN_SUGGESTIONS.map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            data-testid={`agent-inspector-plugin-suggest-${name}`}
                            onClick={() => appendUnique("plugins", [name])}
                            className="rounded-lg border border-[color-mix(in_srgb,#a78bfa_35%,transparent)] bg-[color-mix(in_srgb,#a78bfa_14%,transparent)] px-2.5 py-1.5 text-xs font-medium text-[#d8b4fe] transition hover:bg-[color-mix(in_srgb,#a78bfa_24%,transparent)]"
                          >
                            + {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* C-149 — MCP binding form (string[] backward compat: website|tools|desc) */}
                <div
                  data-testid="agent-inspector-mcp"
                  className="rounded-2xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        3. MCP (Model Context Protocol)
                      </h4>
                    </div>
                    <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                      {draft.mcp.length} подключено
                    </span>
                  </div>
                  <p className="mb-3 text-[11px] text-[var(--text-muted)]">
                    Сайт обязателен; дополнительно tools и описание. Секреты и
                    ключи сюда не вставляйте.
                  </p>
                  <ul className="mb-3 flex flex-col gap-2">
                    {draft.mcp.length === 0 ? (
                      <li className="text-[11px] italic text-[var(--text-muted)]">
                        MCP пока не добавлены
                      </li>
                    ) : (
                      draft.mcp.map((item, idx) => {
                        const parsed = parseMcpEntry(item);
                        return (
                          <li
                            key={`${item}-${idx}`}
                            className="flex items-start justify-between gap-2 rounded-xl border border-[color-mix(in_srgb,#34d399_30%,transparent)] bg-[color-mix(in_srgb,#34d399_12%,transparent)] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#6ee7b7]">
                                {parsed.website}
                              </p>
                              {parsed.tools ? (
                                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                  tools: {parsed.tools}
                                </p>
                              ) : null}
                              {parsed.desc ? (
                                <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-muted)]">
                                  {parsed.desc}
                                </p>
                              ) : null}
                              {!parsed.tools && !parsed.desc ? (
                                <p className="sr-only">{mcpChipLabel(item)}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              aria-label={`Удалить MCP ${parsed.website}`}
                              onClick={() =>
                                patchDraft({
                                  mcp: draft.mcp.filter((_, i) => i !== idx),
                                })
                              }
                              className="shrink-0 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6ee7b7]">
                        Сайт MCP *
                      </span>
                      <input
                        data-testid="agent-inspector-mcp-website"
                        value={mcpWebsite}
                        onChange={(e) => setMcpWebsite(e.target.value)}
                        placeholder="https://example.com/mcp или mcp://server"
                        className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent-blue-bright)]"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Tools (необязательно)
                      </span>
                      <input
                        data-testid="agent-inspector-mcp-tools"
                        value={mcpTools}
                        onChange={(e) => setMcpTools(e.target.value)}
                        placeholder="search, read_file, …"
                        className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent-blue-bright)]"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Описание (необязательно)
                      </span>
                      <input
                        data-testid="agent-inspector-mcp-desc"
                        value={mcpDesc}
                        onChange={(e) => setMcpDesc(e.target.value)}
                        placeholder="Зачем этот MCP агенту"
                        className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent-blue-bright)]"
                      />
                    </label>
                    <button
                      type="button"
                      data-testid="agent-inspector-mcp-add"
                      onClick={addMcpBinding}
                      className="self-start rounded-xl bg-[#059669] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#10b981]"
                    >
                      Добавить MCP
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "logs" ? (
              <section
                data-testid="agent-inspector-pane-logs"
                className="flex flex-col gap-3"
              >
                {isArtDirector && adReview ? (
                  <div
                    data-testid="agent-inspector-logs-ad-pin"
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      adReview.verdict === "approve"
                        ? "border-[color-mix(in_srgb,#34d399_35%,transparent)] bg-[color-mix(in_srgb,#34d399_10%,transparent)]"
                        : "border-[color-mix(in_srgb,#f59e0b_40%,transparent)] bg-[color-mix(in_srgb,#f59e0b_12%,transparent)]",
                    )}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Последнее ревью
                      </span>
                      <NeonBadge
                        tone={adReview.verdict === "approve" ? "cobalt" : "gold"}
                      >
                        {adReview.verdict === "approve"
                          ? "Принято"
                          : "Замечания"}
                      </NeonBadge>
                    </div>
                    <p className="text-pretty text-xs text-[var(--text-primary)]">
                      {adReview.summary}
                    </p>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Журнал запусков
                  </h4>
                  {logsHasError ? (
                    <span
                      data-testid="agent-inspector-logs-error-flag"
                      className="rounded-md border border-[color-mix(in_srgb,#f87171_45%,transparent)] bg-[color-mix(in_srgb,#f87171_14%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#fca5a5]"
                    >
                      Есть ошибки
                    </span>
                  ) : null}
                </div>
                {logsLoading ? (
                  <p className="text-xs text-[var(--text-muted)]">Загрузка…</p>
                ) : logs.length === 0 ? (
                  <p
                    data-testid="agent-inspector-logs-empty"
                    className="rounded-xl border border-dashed border-[var(--border-glass)] px-3 py-6 text-center text-xs text-[var(--text-muted)]"
                  >
                    Пока нет записей. Ошибки пайплайна появятся здесь.
                  </p>
                ) : (
                  <ul
                    data-testid="agent-inspector-logs-list"
                    className="flex max-h-[min(52vh,420px)] flex-col gap-2 overflow-y-auto"
                  >
                    {logs.map((line) => {
                      const isErr =
                        line.level === "error" || line.level === "red";
                      return (
                        <li
                          key={line.id}
                          data-testid={`agent-log-${line.id}`}
                          className={cn(
                            "rounded-xl border px-3 py-2",
                            isErr
                              ? "border-[color-mix(in_srgb,#f87171_40%,transparent)] bg-[color-mix(in_srgb,#f87171_10%,transparent)]"
                              : "border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)]",
                          )}
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[9px] uppercase",
                                isErr
                                  ? "bg-[color-mix(in_srgb,#f87171_25%,transparent)] text-[#fecaca]"
                                  : line.level === "warn"
                                    ? "bg-[color-mix(in_srgb,#f59e0b_20%,transparent)] text-[#fcd34d]"
                                    : "bg-[var(--bg-card)] text-[var(--text-muted)]",
                              )}
                            >
                              {line.level}
                            </span>
                            <time className="font-[family-name:var(--font-mono-jb)] text-[10px] tabular-nums text-[var(--text-muted)]">
                              {new Date(line.ts).toLocaleString("ru-RU")}
                            </time>
                          </div>
                          <p className="text-pretty text-xs text-[var(--text-primary)]">
                            {line.message}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : null}

            {tab === "review" && isArtDirector ? (
              <section
                data-testid="agent-inspector-pane-review"
                className="flex flex-col gap-4"
              >
                <div className="rounded-2xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] p-4">
                  <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Проверить карусель
                  </h4>
                  <p className="mb-3 text-[11px] leading-snug text-[var(--text-muted)]">
                    Запускает Арт-директора один раз. Перерисовка и remake не
                    стартуют — только вердикт.
                  </p>
                  <label className="mb-2 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      ID черновика
                    </span>
                    <input
                      data-testid="art-director-draft-id"
                      value={adDraftId}
                      onChange={(e) => setAdDraftId(e.target.value)}
                      placeholder="draft_correct_…"
                      className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-3 py-1.5 font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent-blue-bright)]"
                    />
                  </label>
                  <button
                    type="button"
                    data-testid="art-director-check-btn"
                    disabled={adReviewBusy}
                    onClick={() => void runArtDirectorCheck()}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-xs font-bold text-white transition",
                      adReviewBusy
                        ? "cursor-wait bg-[var(--text-muted)]"
                        : "bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-bright)]",
                    )}
                  >
                    {adReviewBusy ? "Проверяем…" : "Проверить"}
                  </button>
                  {adReviewError ? (
                    <p
                      data-testid="art-director-review-error"
                      className="mt-2 text-xs text-[#fca5a5]"
                    >
                      {adReviewError}
                    </p>
                  ) : null}
                </div>

                {adReviewLoading ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    Загрузка ревью…
                  </p>
                ) : !adReview ? (
                  <p
                    data-testid="art-director-review-empty"
                    className="rounded-xl border border-dashed border-[var(--border-glass)] px-3 py-8 text-center text-xs text-[var(--text-muted)]"
                  >
                    Пока нет вердикта. После генерации карусели или кнопки
                    «Проверить» здесь появятся summary и замечания.
                  </p>
                ) : (
                  <div
                    data-testid="art-director-review-card"
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <NeonBadge
                        tone={
                          adReview.verdict === "approve" ? "cobalt" : "gold"
                        }
                      >
                        {adReview.verdict === "approve"
                          ? "Принято"
                          : "Замечания"}
                      </NeonBadge>
                      {typeof adReview.score === "number" ? (
                        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                          score {Math.round(adReview.score)}
                        </span>
                      ) : null}
                      {adReview.draftId ? (
                        <span className="truncate font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                          {adReview.draftTitle
                            ? `${adReview.draftTitle} · `
                            : ""}
                          {adReview.draftId}
                        </span>
                      ) : null}
                    </div>
                    <p
                      data-testid="art-director-review-summary"
                      className="text-pretty text-sm leading-relaxed text-[var(--text-primary)]"
                    >
                      {adReview.summary}
                    </p>
                    {adReview.sequenceNotes ? (
                      <p className="text-pretty text-xs text-[var(--text-muted)]">
                        {adReview.sequenceNotes}
                      </p>
                    ) : null}
                    {adReview.remarks.length > 0 ? (
                      <ul
                        data-testid="art-director-review-issues"
                        className="flex flex-col gap-2"
                      >
                        {adReview.remarks.map((r, idx) => (
                          <li
                            key={`${r.slideIndex}-${r.category}-${idx}`}
                            className={cn(
                              "rounded-xl border px-3 py-2",
                              r.severity === "P0" || r.severity === "P1"
                                ? "border-[color-mix(in_srgb,#f87171_40%,transparent)] bg-[color-mix(in_srgb,#f87171_10%,transparent)]"
                                : "border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-canvas)_70%,transparent)]",
                            )}
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[9px] uppercase text-[var(--text-muted)]">
                                {r.severity}
                              </span>
                              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                слайд {r.slideIndex} · {r.category}
                              </span>
                            </div>
                            <p className="text-pretty text-xs text-[var(--text-primary)]">
                              {r.note}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Замечаний нет · remakeEnqueued: false
                      </p>
                    )}
                  </div>
                )}
              </section>
            ) : null}

            {tab === "scout" && isScout ? (
              <ScoutInspectorSettings
                pipelineId={pipelineId}
                agentId={draft.id}
              />
            ) : null}

            {tab === "model" ? (
              <section
                data-testid="agent-inspector-pane-model"
                className="space-y-5"
              >
                {draft.id === "designer" ? (
                  <div data-testid="agent-inspector-build-mode">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Режим сборки карусели (Vernatun)
                    </label>
                    <select
                      data-testid="agent-inspector-build-mode-select"
                      defaultValue={
                        typeof window !== "undefined"
                          ? window.localStorage.getItem(
                              "cf.carousel.buildMode",
                            ) === "B"
                            ? "B"
                            : "A"
                          : "A"
                      }
                      onChange={(e) => {
                        const v = e.target.value === "B" ? "B" : "A";
                        try {
                          window.localStorage.setItem(
                            "cf.carousel.buildMode",
                            v,
                          );
                        } catch {
                          /* */
                        }
                      }}
                      className="w-full rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus-visible:border-[var(--accent-blue-bright)]"
                    >
                      <option value="A">A — HTML/CSS слои (рекомендуется)</option>
                      <option value="B">B — цельный AI-слайд</option>
                    </select>
                    <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                      Сохраняется в настройках задания (local). Не смешивайте режимы
                      незаметно — переключайте явно.
                    </p>
                  </div>
                ) : null}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Языковая модель (LLM)
                  </label>
                  <select
                    data-testid="agent-inspector-model"
                    value={draft.modelConfig.model}
                    onChange={(e) =>
                      patchDraft({
                        modelConfig: {
                          ...draft.modelConfig,
                          model: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus-visible:border-[var(--accent-blue-bright)]"
                  >
                    {(() => {
                      const current = draft.modelConfig.model;
                      const opts = modelOptions.some((m) => m.value === current)
                        ? modelOptions
                        : [
                            ...modelOptions,
                            { value: current, label: current },
                          ];
                      return opts.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Температура (Temperature)
                    </label>
                    <span
                      data-testid="agent-inspector-temp-badge"
                      className="rounded border border-[color-mix(in_srgb,var(--accent-blue-bright)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-xs font-bold text-[var(--accent-blue-bright)]"
                    >
                      {draft.modelConfig.temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    data-testid="agent-inspector-temperature"
                    min={0}
                    max={1}
                    step={0.05}
                    value={draft.modelConfig.temperature}
                    onChange={(e) =>
                      patchDraft({
                        modelConfig: {
                          ...draft.modelConfig,
                          temperature: Number.parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-[var(--accent-blue-bright)]"
                  />
                  <div className="mt-1 flex justify-between font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                    <span>0.0 (Детерминированный)</span>
                    <span>1.0 (Креативный)</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Max Tokens (Лимит генерации)
                  </label>
                  <input
                    type="number"
                    data-testid="agent-inspector-max-tokens"
                    value={draft.modelConfig.maxTokens}
                    step={256}
                    min={256}
                    onChange={(e) =>
                      patchDraft({
                        modelConfig: {
                          ...draft.modelConfig,
                          maxTokens: Number.parseInt(e.target.value, 10) || 4096,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-3.5 py-2 font-[family-name:var(--font-mono-jb)] text-sm text-[var(--text-primary)] outline-none focus-visible:border-[var(--accent-blue-bright)]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_70%,transparent)] px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Thinking / reasoning
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">
                      Для Сценариста (Haiku) — сильный hook. Best-effort на
                      агрегаторе.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <span className="sr-only">Thinking</span>
                    <input
                      type="checkbox"
                      data-testid="agent-inspector-thinking"
                      checked={draft.modelConfig.thinking === true}
                      onChange={(e) =>
                        patchDraft({
                          modelConfig: {
                            ...draft.modelConfig,
                            thinking: e.target.checked,
                            reasoningEffort: e.target.checked
                              ? draft.modelConfig.reasoningEffort ?? "high"
                              : undefined,
                          },
                        })
                      }
                      className="h-4 w-4 accent-[var(--accent-blue-bright)]"
                    />
                  </label>
                </div>
              </section>
            ) : null}
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_100%,transparent)] px-4 py-3">
            <button
              type="button"
              data-testid="agent-inspector-reset"
              onClick={onReset}
              className="rounded-xl bg-[var(--bg-hover)] px-4 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
            >
              Сбросить
            </button>
            <div className="flex flex-1 items-center justify-end gap-2">
              <AnimatePresence>
                {toast ? (
                  <motion.span
                    data-testid="agent-inspector-toast"
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={
                      reduceMotion ? INSTANT : { duration: 0.12, ease: "easeOut" }
                    }
                    className="text-xs font-medium text-[var(--accent-gold)]"
                  >
                    {toast}
                  </motion.span>
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                data-testid="agent-inspector-save"
                onClick={onSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--accent-blue)_30%,transparent)] transition hover:bg-[var(--accent-blue-bright)] active:scale-[0.98]"
              >
                Сохранить изменения
              </button>
            </div>
          </footer>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
