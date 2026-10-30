"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { FileText, UserRound } from "lucide-react";

import { CanvasTopBar } from "@/components/mesh/CanvasTopBar";
import { AgentInspectorDrawer } from "@/components/mesh/v2/AgentInspectorDrawer";
import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import { cn } from "@/lib/cn";
import { expandAgentErrorFlags } from "@/lib/mesh/agent-log-aliases";
import {
  ART_DIRECTOR_AGENT_ID,
  artDirectorReviewHasHardErrors,
  pickLatestArtDirectorReviewFromDrafts,
  type ArtDirectorReviewUi,
} from "@/lib/mesh/art-director-review-ui";
import { getStaticFlowConnections } from "@/lib/mesh/flowchart-graph";
import { useMeshAgentStore } from "@/lib/mesh/agent-store";
import { isMeshPipelineId } from "@/lib/mesh-roles";
import type { MeshAgent } from "@/types/mesh-agent";

const MESH_CANVAS_BG = "var(--bg-canvas)";
const PAN_THRESHOLD_PX = 5;

type ConnectionPath = {
  d: string;
  type: "direct" | "feedback";
  label: string | null;
  labelX?: number;
  labelY?: number;
};

function Port({
  side,
  centerY = true,
}: {
  side: "in" | "out" | "feedback" | "top";
  /** C-141 — horizontal Lane A/B ports sit mid-card. */
  centerY?: boolean;
}) {
  const y = centerY ? "top-1/2 -translate-y-1/2" : "top-10";
  const cls =
    side === "in"
      ? `absolute -left-2 ${y} h-4 w-4`
      : side === "out"
        ? `absolute -right-2 ${y} h-4 w-4`
        : side === "top"
          ? "absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2"
          : "absolute bottom-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2";
  const border =
    side === "feedback" || side === "top"
      ? "border-[var(--accent-gold-bright)]"
      : "border-[var(--accent-blue-bright)]";
  return (
    <div
      className={cn(
        "rounded-full border-2 bg-[var(--bg-elevated)]",
        cls,
        border,
      )}
      aria-hidden
    />
  );
}

type AgentCardProps = {
  agent: MeshAgent;
  nodeId: string;
  selected: boolean;
  onSelect: () => void;
  widthClass: string;
  eyebrow: string;
  subtitle: string;
  accentBorder: string;
  /** S55 — RED perimeter when agent has error/red logs */
  hasError?: boolean;
  showDesignChip?: boolean;
  /** Optional verdict chip (Art Director). */
  verdictBadge?: "approve" | "remarks" | null;
  /** Override data-testid (spec: node-art-director). */
  testId?: string;
  portIn?: boolean;
  portOut?: boolean;
  portFeedback?: boolean;
  portTop?: boolean;
};

function AgentCard({
  agent,
  nodeId,
  selected,
  onSelect,
  widthClass,
  eyebrow,
  subtitle,
  accentBorder,
  hasError,
  showDesignChip,
  verdictBadge,
  testId,
  portIn,
  portOut,
  portFeedback,
  portTop,
}: AgentCardProps) {
  return (
    <button
      type="button"
      id={nodeId}
      data-agent-id={agent.id}
      data-testid={testId ?? `mesh-agent-node-${agent.id}`}
      data-agent-error={hasError ? "true" : "false"}
      data-ad-verdict={verdictBadge ?? undefined}
      onClick={onSelect}
      className={cn(
        "agent-node group relative rounded-2xl border bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] p-4 text-left shadow-2xl transition-all",
        widthClass,
        hasError
          ? "border-[#ef4444] shadow-[0_0_0_2px_color-mix(in_srgb,#ef4444_55%,transparent),0_0_28px_color-mix(in_srgb,#ef4444_35%,transparent)]"
          : accentBorder,
        selected &&
          !hasError &&
          "node-selected border-[var(--accent-blue-bright)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent-blue-bright)_50%,transparent),0_0_30px_color-mix(in_srgb,var(--accent-blue-bright)_28%,transparent)]",
        selected &&
          hasError &&
          "node-selected border-[#ef4444] shadow-[0_0_0_2px_color-mix(in_srgb,#ef4444_60%,transparent),0_0_32px_color-mix(in_srgb,#ef4444_40%,transparent)]",
      )}
    >
      {portIn ? <Port side="in" centerY /> : null}
      {portOut ? <Port side="out" centerY /> : null}
      {portFeedback ? <Port side="feedback" /> : null}
      {portTop ? <Port side="top" /> : null}

      <div className="flex items-center gap-3">
        <AgentProfessionAvatar
          packId={agent.packId}
          label={agent.name}
          roleKind={agent.roleKind}
        />
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {eyebrow}
          </span>
          <h3 className="truncate text-sm font-bold text-[var(--text-primary)]">
            {agent.name}
          </h3>
          <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
            {subtitle}
          </span>
        </div>
      </div>

      {showDesignChip ? (
        <div
          data-testid="designer-design-md-chip"
          className="mt-3 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,#a78bfa_30%,var(--border-glass))] bg-[color-mix(in_srgb,var(--bg-canvas)_80%,transparent)] p-2.5"
        >
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#c4b5fd]" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-[family-name:var(--font-mono-jb)] text-[11px] font-bold text-[#c4b5fd]">
                📄 design.md
              </span>
              <span className="rounded bg-[color-mix(in_srgb,#a78bfa_20%,transparent)] px-1.5 text-[9px] font-semibold uppercase text-[#c4b5fd]">
                База
              </span>
            </div>
            <p className="mt-0.5 text-[10px] leading-tight text-[var(--text-muted)]">
              Опирается на файл: цветовая палитра клуба, шрифты и гайдлайн
              оформления.
            </p>
          </div>
        </div>
      ) : null}

      {verdictBadge ? (
        <div
          data-testid="art-director-verdict-chip"
          className={cn(
            "mt-3 inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
            verdictBadge === "approve"
              ? "border-[color-mix(in_srgb,#34d399_40%,transparent)] bg-[color-mix(in_srgb,#34d399_14%,transparent)] text-[#6ee7b7]"
              : "border-[color-mix(in_srgb,#f59e0b_45%,transparent)] bg-[color-mix(in_srgb,#f59e0b_16%,transparent)] text-[#fcd34d]",
          )}
        >
          {verdictBadge === "approve" ? "Принято" : "Замечания"}
        </div>
      ) : null}
    </button>
  );
}

export type ReleaseTeamFlowchartProps = {
  moduleId: string;
};

/** C-138…C-141 — static HTML/CSS/SVG «Команда выпуска» (no @xyflow/react). */
export function ReleaseTeamFlowchart({ moduleId }: ReleaseTeamFlowchartProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    dragged: false,
  });
  const suppressClickRef = useRef(false);
  const [paths, setPaths] = useState<ConnectionPath[]>([]);
  const [errorFlags, setErrorFlags] = useState<Record<string, boolean>>({});
  const [adReview, setAdReview] = useState<ArtDirectorReviewUi | null>(null);

  const pipelineId = useMeshAgentStore((s) => s.pipelineId);
  const agents = useMeshAgentStore((s) => s.agents);
  const selectedAgentId = useMeshAgentStore((s) => s.selectedAgentId);
  const setPipeline = useMeshAgentStore((s) => s.setPipeline);
  const selectAgent = useMeshAgentStore((s) => s.selectAgent);

  useEffect(() => {
    if (moduleId && isMeshPipelineId(moduleId)) {
      setPipeline(moduleId);
    } else if (moduleId) {
      setPipeline("carousel-engine");
    }
  }, [moduleId, setPipeline]);

  /** S55 — poll errorFlags for RED agent perimeter (alias scriptwriter↔copywriter) */
  useEffect(() => {
    let cancelled = false;
    async function pullFlags() {
      try {
        const res = await fetch("/api/agents/logs?limit=1", {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          ok?: boolean;
          errorFlags?: Record<string, boolean>;
        };
        if (!cancelled && json.errorFlags) {
          setErrorFlags(expandAgentErrorFlags(json.errorFlags));
        }
      } catch {
        /* soft-fail — no RED until API available */
      }
    }
    void pullFlags();
    const t = window.setInterval(() => void pullFlags(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [moduleId, pipelineId]);

  /** Variant A — last Art Director verdict from newest draft payload (badge + RED). */
  useEffect(() => {
    if (pipelineId !== "carousel-engine") {
      setAdReview(null);
      return;
    }
    let cancelled = false;
    async function pullAdReview() {
      try {
        const res = await fetch(
          "/api/studio/drafts?moduleId=carousel-engine",
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const json = (await res.json()) as { drafts?: unknown[] };
        const drafts = Array.isArray(json.drafts) ? json.drafts : [];
        const review = pickLatestArtDirectorReviewFromDrafts(
          drafts as Parameters<typeof pickLatestArtDirectorReviewFromDrafts>[0],
        );
        if (!cancelled) setAdReview(review);
      } catch {
        /* soft-fail */
      }
    }
    void pullAdReview();
    const onRefresh = () => void pullAdReview();
    window.addEventListener("cf:art-director-review", onRefresh);
    const t = window.setInterval(() => void pullAdReview(), 30_000);
    return () => {
      cancelled = true;
      window.removeEventListener("cf:art-director-review", onRefresh);
      window.clearInterval(t);
    };
  }, [moduleId, pipelineId, selectedAgentId]);

  const hasRazbor = Boolean(agents.razbor);
  const artDirector = agents[ART_DIRECTOR_AGENT_ID];
  const hasArtDirector = Boolean(artDirector);
  const connections = getStaticFlowConnections({
    hasRazbor,
    hasArtDirector,
  });

  const drawConnections = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    const contentRect = content.getBoundingClientRect();
    const next: ConnectionPath[] = [];

    for (const conn of connections) {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) continue;

      const fromR = fromEl.getBoundingClientRect();
      const toR = toEl.getBoundingClientRect();

      if (conn.type === "direct") {
        const startX = fromR.right - contentRect.left;
        const startY = fromR.top + fromR.height / 2 - contentRect.top;
        const endX = toR.left - contentRect.left;
        const endY = toR.top + toR.height / 2 - contentRect.top;
        const dx = endX - startX;
        const cp1x = startX + dx * 0.5;
        const cp2x = startX + dx * 0.5;
        next.push({
          d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
          type: "direct",
          label: conn.label,
          labelX: startX + dx * 0.5,
          labelY: (startY + endY) / 2 - 14,
        });
      } else {
        const startX = fromR.left + fromR.width / 2 - contentRect.left;
        const startY = fromR.top - contentRect.top;
        const endX = toR.left + toR.width / 2 - contentRect.left;
        const endY = toR.bottom - contentRect.top;
        const dy = startY - endY;
        next.push({
          d: `M ${startX} ${startY} C ${startX} ${startY - dy * 0.55}, ${endX} ${endY + dy * 0.55}, ${endX} ${endY}`,
          type: "feedback",
          label: null,
        });
      }
    }

    setPaths(next);
  }, [connections]);

  useEffect(() => {
    drawConnections();
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const onResize = () => drawConnections();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => drawConnections());
    ro.observe(content);
    ro.observe(container);

    const t = window.setTimeout(drawConnections, 80);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [drawConnections, selectedAgentId, hasRazbor, hasArtDirector, agents]);

  const clearSelection = useCallback(() => {
    selectAgent(null);
  }, [selectAgent]);

  const onPanPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (
      target?.closest(
        "button, textarea, input, a, [data-no-pan], [contenteditable='true']",
      )
    ) {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      dragged: false,
    };
    el.setPointerCapture(e.pointerId);
    el.classList.add("cursor-grabbing");
    el.classList.remove("cursor-grab");
  }, []);

  const onPanPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panRef.current.active) return;
    const el = containerRef.current;
    if (!el) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    if (
      Math.abs(dx) > PAN_THRESHOLD_PX ||
      Math.abs(dy) > PAN_THRESHOLD_PX
    ) {
      panRef.current.dragged = true;
    }
    if (!panRef.current.dragged) return;
    el.scrollLeft = panRef.current.scrollLeft - dx;
    el.scrollTop = panRef.current.scrollTop - dy;
  }, []);

  const onPanPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panRef.current.active) return;
    const el = containerRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");
    }
    if (panRef.current.dragged) {
      suppressClickRef.current = true;
    }
    panRef.current.active = false;
    panRef.current.dragged = false;
  }, []);

  const onContainerClickCapture = useCallback((e: React.MouseEvent) => {
    if (!suppressClickRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  const user = agents.user;
  const razbor = agents.razbor;
  const copywriter = agents.copywriter;
  const designer = agents.designer;
  const publisher = agents.publisher;
  const scout = agents.scout;
  const analyst = agents.analyst;
  const trainer = agents["team-trainer"];
  const adHasHard = artDirectorReviewHasHardErrors(adReview);
  const adNodeError =
    Boolean(artDirector && errorFlags[artDirector.id]) || adHasHard;

  return (
    <div
      data-testid="release-team-flowchart"
      data-pipeline-id={pipelineId}
      data-engine="static-svg"
      className="relative flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-[var(--border-glass)]"
      style={{ backgroundColor: MESH_CANVAS_BG }}
    >
      <CanvasTopBar pipelineId={pipelineId} />

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={containerRef}
          id="flowchart-container"
          data-testid="static-flowchart-scroll"
          className="bg-grid-canvas relative h-full flex-1 cursor-grab overflow-auto p-8 pl-12 lg:p-12 lg:pl-16"
          onPointerDown={onPanPointerDown}
          onPointerMove={onPanPointerMove}
          onPointerUp={onPanPointerUp}
          onPointerCancel={onPanPointerUp}
          onClickCapture={onContainerClickCapture}
        >
          <div
            ref={contentRef}
            className={cn(
              "relative ml-0",
              hasArtDirector
                ? "min-w-[1960px] max-w-[2200px]"
                : "min-w-[1680px] max-w-[1850px]",
            )}
          >
          <svg
            id="connections-svg"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
            aria-hidden
          >
            <defs>
              <marker
                id="arrow-blue"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-blue-bright)" />
              </marker>
              <marker
                id="arrow-orange"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-gold-bright)" />
              </marker>
            </defs>
            <g>
              {paths.map((p, i) => (
                <path
                  key={`path-${i}`}
                  d={p.d}
                  fill="none"
                  stroke={
                    p.type === "direct"
                      ? "var(--accent-blue-bright)"
                      : "var(--accent-gold-bright)"
                  }
                  strokeWidth={p.type === "direct" ? 2.5 : 1.75}
                  strokeOpacity={p.type === "direct" ? 0.85 : 0.7}
                  markerEnd={
                    p.type === "direct"
                      ? "url(#arrow-blue)"
                      : "url(#arrow-orange)"
                  }
                  className={
                    p.type === "feedback"
                      ? reduceMotion
                        ? "flow-dashed-static"
                        : "flow-dashed"
                      : undefined
                  }
                />
              ))}
            </g>
            <g>
              {paths.map((p, i) => {
                if (!p.label || p.labelX == null || p.labelY == null) {
                  return null;
                }
                const textWidth = p.label.length * 8 + 20;
                return (
                  <g
                    key={`label-${i}`}
                    transform={`translate(${p.labelX}, ${p.labelY})`}
                  >
                    <rect
                      x={-textWidth / 2}
                      y={-10}
                      width={textWidth}
                      height={20}
                      rx={6}
                      fill="var(--bg-elevated)"
                      stroke="var(--accent-blue)"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fill="#93c5fd"
                      fontSize="10.5px"
                      fontWeight={700}
                      fontFamily="var(--font-ui)"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="relative z-10 flex flex-col gap-36 py-10">
            {/* Lane A */}
            <div className="flex items-start justify-between gap-28">
              {user ? (
                <div
                  id="node-user"
                  data-testid="mesh-user-node"
                  data-no-pan
                  className="group relative w-[310px] select-none rounded-2xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] p-4 shadow-2xl transition-all hover:border-[var(--accent-blue-bright)]"
                >
                  <Port side="out" centerY />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-primary)]">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="rounded border border-[var(--border-glass)] bg-[var(--bg-card)] px-1.5 font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]">
                        Клиент
                      </span>
                      <h3
                        className="text-sm font-bold text-[var(--text-primary)]"
                        data-testid="user-brief-label"
                      >
                        User
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">
                        Тема и бриф — только в чате Create / Studio
                      </p>
                    </div>
                  </div>
                  {/* S49: basic brief field DELETED — never inject loadUserBrief / defaultCombatBrief */}
                </div>
              ) : null}

              {hasRazbor && razbor ? (
                <AgentCard
                  agent={razbor}
                  nodeId="node-razbor"
                  selected={selectedAgentId === razbor.id}
                  onSelect={() => selectAgent(razbor.id)}
                  widthClass="w-[210px]"
                  eyebrow="Декомпозиция"
                  subtitle="Структура и тезисы"
                  accentBorder="border-[color-mix(in_srgb,#f59e0b_35%,var(--border-glass))] hover:border-[#f59e0b]"
                  hasError={Boolean(errorFlags[razbor.id])}
                  portIn
                  portOut
                  portFeedback
                />
              ) : null}

              {copywriter ? (
                <AgentCard
                  agent={copywriter}
                  nodeId="node-copywriter"
                  selected={selectedAgentId === copywriter.id}
                  onSelect={() => selectAgent(copywriter.id)}
                  widthClass="w-[230px]"
                  eyebrow="Слайды & Текст"
                  subtitle="Хуки и сценарий"
                  accentBorder="border-[color-mix(in_srgb,#38bdf8_35%,var(--border-glass))] hover:border-[#38bdf8]"
                  hasError={Boolean(errorFlags[copywriter.id])}
                  portIn
                  portOut
                  portFeedback
                />
              ) : null}

              {designer ? (
                <AgentCard
                  agent={designer}
                  nodeId="node-designer"
                  selected={selectedAgentId === designer.id}
                  onSelect={() => selectAgent(designer.id)}
                  widthClass="w-[250px]"
                  eyebrow="Визуал & Сетка"
                  subtitle="Промпты и стили"
                  accentBorder="border-[color-mix(in_srgb,#a78bfa_35%,var(--border-glass))] hover:border-[#a78bfa]"
                  hasError={Boolean(errorFlags[designer.id])}
                  showDesignChip
                  portIn
                  portOut
                  portFeedback
                />
              ) : null}

              {artDirector ? (
                <AgentCard
                  agent={artDirector}
                  nodeId="node-art-director"
                  testId="node-art-director"
                  selected={selectedAgentId === artDirector.id}
                  onSelect={() => selectAgent(artDirector.id)}
                  widthClass="w-[220px]"
                  eyebrow="Ревью финалов"
                  subtitle="approve · remarks"
                  accentBorder="border-[color-mix(in_srgb,#f472b6_35%,var(--border-glass))] hover:border-[#f472b6]"
                  hasError={adNodeError}
                  verdictBadge={adReview?.verdict ?? null}
                  portIn
                  portOut
                  portFeedback
                />
              ) : null}

              {publisher ? (
                <AgentCard
                  agent={publisher}
                  nodeId="node-publisher"
                  selected={selectedAgentId === publisher.id}
                  onSelect={() => selectAgent(publisher.id)}
                  widthClass="w-[210px]"
                  eyebrow="Выгрузка & Пост"
                  subtitle="Дистрибуция каналов"
                  accentBorder="border-[color-mix(in_srgb,#34d399_35%,var(--border-glass))] hover:border-[#34d399]"
                  hasError={Boolean(errorFlags[publisher.id])}
                  portIn
                  portOut
                  portFeedback
                />
              ) : null}
            </div>

            {/* Lane B */}
            <div className="ml-28 flex items-center gap-28">
              {scout ? (
                <AgentCard
                  agent={scout}
                  nodeId="node-scout"
                  selected={selectedAgentId === scout.id}
                  onSelect={() => selectAgent(scout.id)}
                  widthClass="w-[210px]"
                  eyebrow="Мониторинг"
                  subtitle="Тренды & Референсы"
                  accentBorder="border-[color-mix(in_srgb,#eab308_35%,var(--border-glass))] hover:border-[#eab308]"
                  hasError={Boolean(errorFlags[scout.id])}
                  portOut
                />
              ) : null}

              {analyst ? (
                <AgentCard
                  agent={analyst}
                  nodeId="node-analyst"
                  selected={selectedAgentId === analyst.id}
                  onSelect={() => selectAgent(analyst.id)}
                  widthClass="w-[220px]"
                  eyebrow="Метрики"
                  subtitle="ERR & Дочитывания"
                  accentBorder="border-[color-mix(in_srgb,#22d3ee_35%,var(--border-glass))] hover:border-[#22d3ee]"
                  hasError={Boolean(errorFlags[analyst.id])}
                  portIn
                  portOut
                />
              ) : null}

              {trainer ? (
                <AgentCard
                  agent={trainer}
                  nodeId="node-trainer"
                  selected={selectedAgentId === trainer.id}
                  onSelect={() => selectAgent(trainer.id)}
                  widthClass="w-[230px]"
                  eyebrow="Обучение"
                  subtitle="RLHF & Обновление баз"
                  accentBorder="border-[color-mix(in_srgb,#34d399_35%,var(--border-glass))] hover:border-[#34d399]"
                  hasError={Boolean(errorFlags[trainer.id])}
                  portIn
                  portTop
                />
              ) : null}
            </div>
          </div>
          </div>
        </div>

        <AgentInspectorDrawer onClose={clearSelection} />
      </div>
    </div>
  );
}
