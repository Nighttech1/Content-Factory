"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import { AgentChatComposer } from "@/components/studio/workspace/AgentChatComposer";
import { AgentPeopleIconTabs } from "@/components/studio/workspace/AgentPeopleIconTabs";
import { RazborCarouselToggle } from "@/components/studio/workspace/RazborCarouselToggle";
import { RazborCompetitorPickChrome } from "@/components/studio/workspace/RazborCompetitorPickChrome";
import { RazborPublisherPane } from "@/components/studio/workspace/RazborPublisherPane";
import { RazborReelPlayer } from "@/components/studio/workspace/RazborReelPlayer";
import { RazborSlidesCarousel } from "@/components/studio/workspace/RazborSlidesCarousel";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import type { FeedPost } from "@/lib/studio/feed-types";
import type {
  CarouselDraft,
  RazborAgentId,
  RazborChatMessage,
} from "@/lib/studio/carousel-draft-types";
import {
  isCarouselRazborModule,
  razborAgentsForModule,
} from "@/lib/studio/carousel-draft-types";
import { useCarouselDraftsStore } from "@/lib/studio/carousel-drafts-store";
import { shouldShowFeedPlay } from "@/lib/studio/feed-play";
import { useMeshAgentStore } from "@/lib/mesh/agent-store";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  isMeshImageModel,
} from "@/types/mesh-agent";
import {
  meshModelConfigForRole,
  meshRazborAnalystModelConfig,
  meshRazborAnalystSystemPrompt,
  meshSystemPromptForRole,
  postRazborAnalyze,
  postStudioAgentChat,
  resolvePipelineId,
  type AgentChatRole,
} from "@/lib/studio/agent-chat-client";
import {
  analysisFromApiPayload,
  buildRazborAnalysisSystemOverlay,
  buildRazborScriptwriterHandoffPayload,
  type RazborLiveAnalysis,
} from "@/lib/studio/razbor-live-shared";
import {
  buildRazborDraftCarouselContext,
  buildRazborDraftEditSystemOverlay,
  isRazborDraftEditMode,
} from "@/lib/studio/razbor-draft-context";
import {
  buildCompetitorSlides,
  getRazborWelcome,
  runRazborDesigner,
  runRazborScript,
  type CompetitorCarouselSlide,
  type RazborScript,
} from "@/lib/studio/razbor-pipeline";
import {
  stopModalWheel,
  useModalScrollLock,
} from "@/lib/studio/use-modal-scroll-lock";
import { prefetchAll } from "@/lib/image-cache";

/** S47 — release-team people pack ids for AgentProfessionAvatar. */
const RAZBOR_PACK: Record<
  RazborAgentId,
  { packId: string; roleKind?: "analyst" }
> = {
  analyst: { packId: "analyst", roleKind: "analyst" },
  scriptwriter: { packId: "scriptwriter" },
  designer: { packId: "designer" },
  publisher: { packId: "publisher" },
};

function handoffNextForTab(
  tab: RazborAgentId,
  carousel: boolean,
): { nextPackId: string; nextLabel: string } | undefined {
  if (tab === "analyst") {
    return { nextPackId: "scriptwriter", nextLabel: "Сценарист" };
  }
  if (tab === "scriptwriter") {
    return carousel
      ? { nextPackId: "designer", nextLabel: "Дизайнер" }
      : { nextPackId: "scriptwriter", nextLabel: "Сценарист" };
  }
  if (tab === "designer") {
    return { nextPackId: "publisher", nextLabel: "Публицист" };
  }
  return undefined;
}

type GenerateSlidesApiOk = {
  ok: true;
  sourceMode: "live" | "mock";
  model: string;
  slides: Array<{ id: string; caption: string; imageUrl: string }>;
};

async function fetchCarouselLiveSlides(input: {
  competitorId: string;
  title: string;
  captions: string[];
  model?: string;
}): Promise<GenerateSlidesApiOk | null> {
  try {
    const res = await fetch(
      "/api/studio/carousel-engine/generate-slides",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorId: input.competitorId,
          title: input.title,
          captions: input.captions,
          slideCount: input.captions.length,
          model: input.model,
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as GenerateSlidesApiOk & { ok?: boolean };
    if (!json?.ok || !Array.isArray(json.slides) || json.slides.length === 0) {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

const PANEL_SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const MSG_SPRING = { type: "spring" as const, damping: 30, stiffness: 380 };
const INSTANT = { duration: 0 };

type RazborModalProps = {
  open: boolean;
  post: FeedPost | null;
  onClose: () => void;
  /** Studio module workspace id — play overlay + chrome (C-53). */
  moduleId?: string;
  /** C-62 / C-razbor-draft-edit: hydrate from Черновики → RIGHT = that draft */
  previewDraft?: CarouselDraft | null;
  /** D-rb-4: competitor feed for «Выбрать» comparison picker */
  competitorPosts?: FeedPost[];
};

type AgentPaneState = {
  messages: RazborChatMessage[];
  /** C-75: ✓ only when `handed` (after MultiButton handoff), not on `done`. */
  status: "idle" | "welcome" | "running" | "done" | "handed";
};

const emptyPanes = (): Record<RazborAgentId, AgentPaneState> => ({
  analyst: { messages: [], status: "idle" },
  scriptwriter: { messages: [], status: "idle" },
  designer: { messages: [], status: "idle" },
  publisher: { messages: [], status: "idle" },
});

async function appendMessagesSequentially(
  messages: RazborChatMessage[],
  reduceMotion: boolean | null,
  onAppend: (msg: RazborChatMessage) => void,
  signal: { cancelled: boolean },
): Promise<void> {
  for (const msg of messages) {
    if (signal.cancelled) return;
    const wait = reduceMotion ? 0 : msg.delayMs;
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }
    if (signal.cancelled) return;
    onAppend(msg);
  }
}

function ScriptFieldsCard({ script }: { script: RazborScript }) {
  const isIdea = Boolean(script.ideaSlides?.length);
  if (isIdea) {
    return (
      <div
        data-testid="razbor-script-fields"
        data-brief-kind="idea"
        className={cn(
          "mb-3 rounded-xl border border-[var(--border-glass)]",
          "bg-[rgba(255,255,255,0.03)] px-3 py-2.5",
        )}
      >
        <p className="mb-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.12em] text-[var(--accent-gold)]">
          Idea-brief карусели
        </p>
        {script.handoffPayload ? (
          <p
            data-testid="razbor-idea-handoff"
            className="mb-3 text-sm leading-relaxed text-[var(--text-primary)]"
          >
            {script.handoffPayload}
          </p>
        ) : null}
        <ul className="flex flex-col gap-2.5">
          {script.ideaSlides!.map((slide) => (
            <li
              key={slide.index}
              data-testid={`razbor-idea-slide-${slide.index}`}
              className="rounded-lg border border-[var(--border-glass)] px-2.5 py-2"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                  Слайд {slide.index}
                </span>
                <span
                  className="inline-flex h-3 w-3 rounded-full ring-1 ring-[var(--border-glass)]"
                  style={{ background: slide.colors.bg }}
                  title={slide.colors.bg}
                />
                <span
                  className="inline-flex h-3 w-3 rounded-full ring-1 ring-[var(--border-glass)]"
                  style={{ background: slide.colors.accent }}
                  title={slide.colors.accent}
                />
                <span
                  className="inline-flex h-3 w-3 rounded-full ring-1 ring-[var(--border-glass)]"
                  style={{ background: slide.colors.text }}
                  title={slide.colors.text}
                />
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {slide.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      data-testid="razbor-script-fields"
      className={cn(
        "mb-3 rounded-xl border border-[var(--border-glass)]",
        "bg-[rgba(255,255,255,0.03)] px-3 py-2.5",
      )}
    >
      <p className="mb-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.12em] text-[var(--accent-gold)]">
        Полный сценарий
      </p>
      <dl className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">
        <div>
          <dt className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            roles
          </dt>
          <dd data-testid="razbor-script-roles" className="mt-0.5 leading-relaxed">
            {script.roles.join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            plot
          </dt>
          <dd
            data-testid="razbor-script-plot"
            className="mt-0.5 whitespace-pre-wrap leading-relaxed"
          >
            {script.plot}
          </dd>
        </div>
        <div>
          <dt className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            text
          </dt>
          <dd
            data-testid="razbor-script-text"
            className="mt-0.5 whitespace-pre-wrap leading-relaxed"
          >
            {script.text}
          </dd>
        </div>
        <div>
          <dt className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            location
          </dt>
          <dd data-testid="razbor-script-location" className="mt-0.5 leading-relaxed">
            {script.location}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RazborModal({
  open,
  post,
  onClose,
  moduleId,
  previewDraft,
  competitorPosts = [],
}: RazborModalProps) {
  const reduceMotion = useReducedMotion();
  useModalScrollLock(open);
  const carousel = isCarouselRazborModule(moduleId);
  const agents = useMemo(() => razborAgentsForModule(moduleId), [moduleId]);
  const upsertDraft = useCarouselDraftsStore((s) => s.upsertDraft);
  /** C-154 — Designer image model from mesh store when it looks like an image model. */
  const meshDesignerModel = useMeshAgentStore((s) =>
    s.agents.designer?.modelConfig?.model,
  );
  /** C-razbor-draft-edit: existing Черновик → edit/discuss (no «Начать разбор»). */
  const draftEditMode = isRazborDraftEditMode(previewDraft);
  /** Stable upsert key — never mint a new id on redraw (D-rb-5). */
  const draftIdRef = useRef<string | null>(previewDraft?.id ?? null);

  const [activeTab, setActiveTab] = useState<RazborAgentId>(() =>
    carousel ? "designer" : "analyst",
  );
  const [panes, setPanes] = useState(emptyPanes);
  const [competitorSlides, setCompetitorSlides] = useState<
    CompetitorCarouselSlide[]
  >([]);
  const [script, setScript] = useState<RazborScript | null>(null);
  const [draft, setDraft] = useState<CarouselDraft | null>(null);
  const [carouselSide, setCarouselSide] = useState<"competitor" | "ours">(
    "competitor",
  );
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [scriptRunning, setScriptRunning] = useState(false);
  const [designerRunning, setDesignerRunning] = useState(false);
  /** C-155 D5 — live chat in-flight. */
  const [chatThinking, setChatThinking] = useState(false);
  /** S48 — live Haiku analysis kept for follow-ups + Scriptwriter handoff. */
  const [liveAnalysis, setLiveAnalysis] = useState<RazborLiveAnalysis | null>(
    null,
  );
  const [scriptwriterHandoff, setScriptwriterHandoff] = useState<string>("");
  /** D-rb-4 — comparison pick (empty square until user selects). */
  const [comparisonPost, setComparisonPost] = useState<FeedPost | null>(null);
  const [competitorPickerOpen, setCompetitorPickerOpen] = useState(false);

  const runIdRef = useRef(0);
  const cancelRef = useRef({ cancelled: false });
  const msgSeqRef = useRef(0);
  const chatAbortRef = useRef<AbortController | null>(null);

  const resetSession = useCallback(() => {
    cancelRef.current.cancelled = true;
    cancelRef.current = { cancelled: false };
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setLiveAnalysis(null);
    setScriptwriterHandoff("");
    setPanes(emptyPanes());
    setActiveTab(carousel ? "designer" : "analyst");
    setScript(null);
    setDraft(null);
    setCarouselSide("competitor");
    setAnalysisRunning(false);
    setScriptRunning(false);
    setDesignerRunning(false);
    setChatThinking(false);
    setCompetitorSlides([]);
    setComparisonPost(null);
    setCompetitorPickerOpen(false);
    draftIdRef.current = null;
    msgSeqRef.current = 0;
  }, [carousel]);

  // C-51: on open → welcome only (NO auto-run analysis)
  // C-razbor-draft-edit: existing draft → RIGHT = ours immediately; skip start CTA
  useEffect(() => {
    if (!open || !post) {
      if (!open) resetSession();
      return;
    }

    const runId = ++runIdRef.current;
    cancelRef.current.cancelled = true;
    const signal = { cancelled: false };
    cancelRef.current = signal;

    const welcome = getRazborWelcome(post.id, post);
    if (!welcome) {
      resetSession();
      return;
    }

    const editMode = isRazborDraftEditMode(previewDraft);
    const hydrated = previewDraft ?? null;
    if (hydrated?.id) {
      draftIdRef.current = hydrated.id;
    } else {
      draftIdRef.current = null;
    }

    setCompetitorSlides(welcome.competitorSlides);
    setComparisonPost(null);
    setCompetitorPickerOpen(false);
    setScript(null);
    setDraft(hydrated);
    /* D-rb-1: draft open → RIGHT shows that draft (ours), not empty competitor */
    setCarouselSide(
      editMode && (hydrated?.slides.length ?? 0) > 0 ? "ours" : "competitor",
    );
    setAnalysisRunning(false);
    setScriptRunning(false);
    setDesignerRunning(false);
    setLiveAnalysis(null);
    setScriptwriterHandoff(
      hydrated?.scenario?.trim()
        ? [
            "## Existing draft scenario",
            hydrated.scenario.trim(),
            "",
            `draft.id=${hydrated.id}`,
          ].join("\n")
        : "",
    );
    msgSeqRef.current = 0;

    if (editMode && hydrated) {
      /* Product TZ: one Art Director chat (designer tab id) for draft edits */
      const editAgent: RazborAgentId = carousel ? "designer" : "scriptwriter";
      setActiveTab(editAgent);
      const editWelcome: RazborChatMessage = {
        id: `${hydrated.id}-draft-edit-welcome`,
        agentId: editAgent,
        delayMs: reduceMotion ? 0 : 160,
        role: "agent",
        text: carousel
          ? [
              "Черновик открыт. Я арт-директор — пишите сюда замечания по сценарию и слайдам.",
              "Справа — ваша карусель. Время публикации — на странице Расписание.",
            ].join("\n")
          : [
              "Черновик открыт для правок.",
              "Справа — ваша карусель. Пишите Сценаристу — контекст слайдов уже в чате.",
              "«Начать разбор» скрыт: это сессия редактирования, не новый разбор.",
            ].join("\n"),
      };
      setPanes({
        analyst: {
          messages: [],
          status: "handed",
        },
        scriptwriter: {
          messages: [],
          status: carousel ? "handed" : "done",
        },
        designer: {
          messages: [],
          status: (hydrated.slides.length ?? 0) > 0 ? "done" : "idle",
        },
        publisher: { messages: [], status: "idle" },
      });

      void prefetchAll([
        ...(welcome.competitorSlides ?? []).map((s) => s.imageUrl),
        ...(post.slideUrls ?? []),
        post.thumbUrl,
        ...hydrated.slides.map((s) => s.imageUrl),
      ].filter((u): u is string => Boolean(u)));

      void (async () => {
        await appendMessagesSequentially(
          [editWelcome],
          reduceMotion,
          (msg) => {
            if (signal.cancelled || runId !== runIdRef.current) return;
            setPanes((prev) => ({
              ...prev,
              [editAgent]: {
                status: "done",
                messages: [...prev[editAgent].messages, msg],
              },
            }));
          },
          signal,
        );
      })();
    } else {
      setActiveTab(carousel ? "designer" : "analyst");
      setPanes(emptyPanes());
      setPanes((prev) => ({
        ...prev,
        analyst: { messages: [], status: "welcome" },
      }));

      void prefetchAll([
        ...(welcome.competitorSlides ?? []).map((s) => s.imageUrl),
        ...(post.slideUrls ?? []),
        post.thumbUrl,
      ].filter((u): u is string => Boolean(u)));

      void (async () => {
        await appendMessagesSequentially(
          welcome.welcomeMessages,
          reduceMotion,
          (msg) => {
            if (signal.cancelled || runId !== runIdRef.current) return;
            setPanes((prev) => ({
              ...prev,
              analyst: {
                status: "welcome",
                messages: [...prev.analyst.messages, msg],
              },
            }));
          },
          signal,
        );
      })();
    }

    return () => {
      signal.cancelled = true;
    };
  }, [open, post, previewDraft, reduceMotion, resetSession]);

  const handleStartRazbor = useCallback(async () => {
    if (
      !post ||
      analysisRunning ||
      panes.analyst.status === "running" ||
      panes.analyst.status === "done" ||
      panes.analyst.status === "handed"
    ) {
      return;
    }

    setAnalysisRunning(true);
    setActiveTab("analyst");
    setLiveAnalysis(null);
    const signal = cancelRef.current;

    setPanes((prev) => ({
      ...prev,
      analyst: { messages: prev.analyst.messages, status: "running" },
    }));

    const ac = new AbortController();
    chatAbortRef.current = ac;

    const result = await postRazborAnalyze({
      post,
      moduleId: moduleId ?? "carousel-engine",
      source: "competitor",
      model: meshRazborAnalystModelConfig()?.model,
      signal: ac.signal,
    });

    if (signal.cancelled || ac.signal.aborted) {
      setAnalysisRunning(false);
      return;
    }

    if (!result.ok) {
      const errText = [
        "Не удалось выполнить live-разбор.",
        `Причина: ${result.error}`,
        "Проверьте AGGREGATOR_API_KEY / сеть и нажмите «Начать разбор» снова.",
      ].join("\n");
      const seq = ++msgSeqRef.current;
      setPanes((prev) => ({
        ...prev,
        analyst: {
          status: "welcome",
          messages: [
            ...prev.analyst.messages,
            {
              id: `analyst-err-${seq}`,
              agentId: "analyst",
              text: errText,
              delayMs: 0,
              role: "agent",
            },
          ],
        },
      }));
      setAnalysisRunning(false);
      return;
    }

    if (result.competitorSlides?.length) {
      setCompetitorSlides(result.competitorSlides);
    }

    const analysis = analysisFromApiPayload(result.analysis);
    setLiveAnalysis(analysis);

    const seq = ++msgSeqRef.current;
    const replyMsg: RazborChatMessage = {
      id: `analyst-live-${seq}`,
      agentId: "analyst",
      text: analysis.displayText,
      delayMs: reduceMotion ? 0 : 180,
      role: "agent",
    };

    await appendMessagesSequentially(
      [replyMsg],
      reduceMotion,
      (msg) => {
        if (signal.cancelled) return;
        setPanes((prev) => ({
          ...prev,
          analyst: {
            status: "running",
            messages: [...prev.analyst.messages, msg],
          },
        }));
      },
      signal,
    );
    if (signal.cancelled) return;

    setPanes((prev) => ({
      ...prev,
      analyst: { ...prev.analyst, status: "done" },
    }));
    setAnalysisRunning(false);
  }, [
    post,
    analysisRunning,
    panes.analyst.status,
    reduceMotion,
    moduleId,
  ]);

  const handleRunDesigner = useCallback(async (scriptOverride?: RazborScript | null) => {
    if (!post || !carousel || designerRunning || panes.designer.status === "done") {
      return;
    }

    setDesignerRunning(true);
    const signal = cancelRef.current;
    const activeScript = scriptOverride ?? script ?? undefined;
    const payload = runRazborDesigner(post.id, post, activeScript);
    if (!payload) {
      setDesignerRunning(false);
      return;
    }

    let nextDraft = payload.draft;
    /* D-rb-5: preserve stable draft.id on redraw (no Черновики spam) */
    const stableId =
      draftIdRef.current ||
      draft?.id ||
      previewDraft?.id ||
      nextDraft.id;
    draftIdRef.current = stableId;
    nextDraft = {
      ...nextDraft,
      id: stableId,
      createdAt: draft?.createdAt ?? previewDraft?.createdAt ?? nextDraft.createdAt,
      title: draft?.title ?? previewDraft?.title ?? nextDraft.title,
      sourceCompetitorId:
        draft?.sourceCompetitorId ??
        previewDraft?.sourceCompetitorId ??
        nextDraft.sourceCompetitorId,
      competitorId:
        draft?.competitorId ??
        previewDraft?.competitorId ??
        nextDraft.competitorId,
      brand: draft?.brand ?? previewDraft?.brand ?? nextDraft.brand,
      scenario:
        draft?.scenario ?? previewDraft?.scenario ?? nextDraft.scenario,
    };

    const captionsFromScript =
      activeScript?.ideaSlides?.map((s) => s.text).filter(Boolean) ?? [];
    const captions =
      captionsFromScript.length >= 2
        ? captionsFromScript.slice(0, 6)
        : nextDraft.slides.map(
            (s, i) => s.caption ?? `Слайд ${i + 1} · ${post.title}`,
          );
    const imageModel = isMeshImageModel(meshDesignerModel)
      ? meshDesignerModel!
      : DEFAULT_CAROUSEL_IMAGE_MODEL;

    const live = await fetchCarouselLiveSlides({
      competitorId: post.id,
      title: post.title,
      captions,
      model: imageModel,
    });

    if (live?.slides?.length) {
      const now = new Date().toISOString();
      nextDraft = {
        ...nextDraft,
        id: stableId,
        slides: live.slides.map((s, i) => ({
          id: s.id || nextDraft.slides[i]?.id || `ours-${post.id}-slide-${i}`,
          imageUrl: s.imageUrl,
          caption: s.caption || captions[i],
          brandLogoUrl: nextDraft.slides[i]?.brandLogoUrl,
        })),
        updatedAt: now,
        scenario:
          live.sourceMode === "live"
            ? `${nextDraft.scenario ?? ""}\n[C-154 live images · ${live.model}]`.trim()
            : nextDraft.scenario,
      };
    }
    // else keep mock picsum draft from runRazborDesigner (same stable id)

    if (signal.cancelled) {
      setDesignerRunning(false);
      return;
    }

    setDraft(nextDraft);
    upsertDraft(nextDraft);
    setCarouselSide("ours");
    setPanes((prev) => ({
      ...prev,
      designer: { messages: [], status: "running" },
    }));

    const designerMessages =
      live?.sourceMode === "live"
        ? payload.designerMessages.map((msg, idx) =>
            idx === payload.designerMessages.length - 1
              ? {
                  ...msg,
                  id: `${msg.id}-live`,
                  text: [
                    `Макет готов: ${nextDraft.slides.length} слайдов (live · ${live.model}).`,
                    `Справа — тумблер «Конкурент» / «Наши».`,
                    `В чате можно сократить набор или попросить визуальную правку.`,
                  ].join("\n"),
                }
              : msg,
          )
        : payload.designerMessages;

    await appendMessagesSequentially(
      designerMessages,
      reduceMotion,
      (msg) => {
        if (signal.cancelled) return;
        setPanes((prev) => ({
          ...prev,
          designer: {
            status: "running",
            messages: [...prev.designer.messages, msg],
          },
        }));
      },
      signal,
    );
    if (signal.cancelled) return;

    setPanes((prev) => ({
      ...prev,
      designer: { ...prev.designer, status: "done" },
    }));
    setDesignerRunning(false);
  }, [
    post,
    carousel,
    designerRunning,
    panes.designer.status,
    script,
    reduceMotion,
    upsertDraft,
    meshDesignerModel,
    draft,
    previewDraft,
  ]);

  const handleWriteScript = useCallback(async () => {
    const analystReady =
      panes.analyst.status === "done" || panes.analyst.status === "handed";
    const scriptDone =
      panes.scriptwriter.status === "done" ||
      panes.scriptwriter.status === "handed";
    if (!post || scriptRunning || !analystReady || scriptDone) {
      return;
    }

    setScriptRunning(true);
    setActiveTab("scriptwriter");
    const signal = cancelRef.current;

    // Ensure handoff payload exists (handoff button may have been skipped)
    const handoff =
      scriptwriterHandoff.trim() ||
      (liveAnalysis
        ? buildRazborScriptwriterHandoffPayload(liveAnalysis)
        : "");
    if (handoff && !scriptwriterHandoff.trim()) {
      setScriptwriterHandoff(handoff);
    }

    setPanes((prev) => ({
      ...prev,
      scriptwriter: { messages: [], status: "running" },
    }));

    const pipelineId = resolvePipelineId(moduleId);
    const ac = new AbortController();
    chatAbortRef.current = ac;

    const systemBase = meshSystemPromptForRole("scriptwriter") ?? "";
    const systemPrompt = handoff
      ? [
          systemBase,
          "## Razbor → Scriptwriter handoff (insights)",
          handoff,
        ]
          .filter(Boolean)
          .join("\n\n")
      : systemBase;

    const startPrompt = carousel
      ? "На основе разбора конкурента подготовь idea-brief карусели Vernatun (N слайдов, тексты, цвета, CTA). Учти hook/mid/CTA и trainer tasks."
      : "На основе разбора подготовь полный сценарий Vernatun (роли / сюжет / текст / место). Учти hook/mid/CTA и trainer tasks.";

    try {
      const result = await postStudioAgentChat({
        agentRole: "scriptwriter",
        pipelineId,
        messages: [{ role: "user", content: startPrompt }],
        moduleId: moduleId ?? pipelineId,
        systemPrompt,
        modelConfig: meshModelConfigForRole("scriptwriter"),
        surface: "razbor",
        ...(handoff ? { handoffBrief: handoff } : {}),
        signal: ac.signal,
      });

      if (signal.cancelled || ac.signal.aborted) {
        setScriptRunning(false);
        return;
      }

      if (result.source === "live" && result.reply.trim()) {
        const seq = ++msgSeqRef.current;
        setPanes((prev) => ({
          ...prev,
          scriptwriter: {
            status: "done",
            messages: [
              {
                id: `scriptwriter-live-${seq}`,
                agentId: "scriptwriter",
                text: result.reply,
                delayMs: 0,
                role: "agent",
              },
            ],
          },
        }));
        setScriptRunning(false);
        return;
      }
    } catch {
      /* fall through to mock cascade */
    }

    // Soft-fail: legacy mock cascade only if live unavailable
    const cascade = runRazborScript(
      post.id,
      post,
      carousel ? "carousel" : "script-only",
    );
    if (!cascade) {
      setScriptRunning(false);
      return;
    }

    setScript(cascade.script);
    await appendMessagesSequentially(
      cascade.scriptwriterMessages,
      reduceMotion,
      (msg) => {
        if (signal.cancelled) return;
        setPanes((prev) => ({
          ...prev,
          scriptwriter: {
            status: "running",
            messages: [...prev.scriptwriter.messages, msg],
          },
        }));
      },
      signal,
    );
    if (signal.cancelled) return;

    setPanes((prev) => ({
      ...prev,
      scriptwriter: { ...prev.scriptwriter, status: "done" },
    }));
    setScriptRunning(false);
  }, [
    post,
    scriptRunning,
    panes.analyst.status,
    panes.scriptwriter.status,
    reduceMotion,
    carousel,
    moduleId,
    liveAnalysis,
    scriptwriterHandoff,
  ]);

  /** C-74/C-75 — MultiButton handoff: mark current pane `handed`, then next tab. */
  const handleHandoff = useCallback(() => {
    if (activeTab === "analyst") {
      if (panes.analyst.status !== "done" && panes.analyst.status !== "handed") {
        return;
      }
      // S48 — pass handoffBrief + trainerTasks + analysis JSON into Scriptwriter
      if (liveAnalysis) {
        setScriptwriterHandoff(
          buildRazborScriptwriterHandoffPayload(liveAnalysis),
        );
      }
      setPanes((prev) => ({
        ...prev,
        analyst: { ...prev.analyst, status: "handed" },
      }));
      setActiveTab("scriptwriter");
      return;
    }

    if (activeTab === "scriptwriter") {
      if (
        panes.scriptwriter.status !== "done" &&
        panes.scriptwriter.status !== "handed"
      ) {
        return;
      }
      setPanes((prev) => ({
        ...prev,
        scriptwriter: { ...prev.scriptwriter, status: "handed" },
      }));
      if (carousel) {
        setActiveTab("designer");
        if (panes.designer.status === "idle" && !designerRunning) {
          void handleRunDesigner();
        }
      }
      return;
    }

    if (activeTab === "designer" && carousel) {
      if (
        panes.designer.status !== "done" &&
        panes.designer.status !== "handed" &&
        (draft?.slides.length ?? 0) === 0
      ) {
        return;
      }
      setPanes((prev) => ({
        ...prev,
        designer: { ...prev.designer, status: "handed" },
      }));
      setActiveTab("publisher");
    }
  }, [
    activeTab,
    panes.analyst.status,
    panes.scriptwriter.status,
    panes.designer.status,
    carousel,
    designerRunning,
    handleRunDesigner,
    draft?.slides.length,
    liveAnalysis,
  ]);

  const handleComposerSend = useCallback(
    async (text: string) => {
      if (!post || chatThinking) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const agentId = activeTab;
      const hasRazborMesh = Boolean(
        useMeshAgentStore.getState().agents.razbor,
      );
      const agentRole: AgentChatRole =
        agentId === "analyst"
          ? hasRazborMesh
            ? "razbor"
            : "analyst"
          : (agentId as AgentChatRole);
      const seq = ++msgSeqRef.current;
      const userMsg: RazborChatMessage = {
        id: `${agentId}-user-${seq}`,
        agentId,
        text: trimmed,
        delayMs: 0,
        role: "user",
      };

      const historyBefore = panes[agentId].messages;
      setPanes((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          messages: [...prev[agentId].messages, userMsg],
        },
      }));

      chatAbortRef.current?.abort();
      const ac = new AbortController();
      chatAbortRef.current = ac;
      setChatThinking(true);

      const pipelineId = resolvePipelineId(moduleId);
      const messages = [
        ...historyBefore
          .filter((m) => m.role === "user" || m.role === "agent")
          .map((m) => ({
            role: (m.role === "user" ? "user" : "assistant") as
              | "user"
              | "assistant",
            content: m.text,
          })),
        { role: "user" as const, content: trimmed },
      ];

      let systemPrompt =
        agentId === "analyst"
          ? meshRazborAnalystSystemPrompt()
          : meshSystemPromptForRole(agentRole);
      const modelConfig =
        agentId === "analyst"
          ? meshRazborAnalystModelConfig()
          : meshModelConfigForRole(agentRole);

      // Keep live analysis in system for Razbor follow-ups
      if (agentId === "analyst" && liveAnalysis) {
        systemPrompt = [
          systemPrompt?.trim() || "",
          buildRazborAnalysisSystemOverlay(liveAnalysis),
        ]
          .filter(Boolean)
          .join("\n\n");
      }

      // Scriptwriter: inject handoff insights into system (C-155 user stays raw)
      const handoffBrief =
        agentId === "scriptwriter" ? scriptwriterHandoff.trim() : "";
      if (agentId === "scriptwriter" && handoffBrief) {
        systemPrompt = [
          systemPrompt?.trim() || "",
          "## Razbor → Scriptwriter handoff (insights)",
          handoffBrief,
        ]
          .filter(Boolean)
          .join("\n\n");
      }

      /* D-rb-3: existing draft JSON + slide URLs into LLM context */
      const draftForContext = draft ?? previewDraft ?? null;
      const draftCarouselJson = draftForContext
        ? buildRazborDraftCarouselContext(draftForContext)
        : undefined;
      if (draftForContext) {
        systemPrompt = [
          systemPrompt?.trim() || "",
          buildRazborDraftEditSystemOverlay(draftForContext),
        ]
          .filter(Boolean)
          .join("\n\n");
      }

      try {
        const result = await postStudioAgentChat({
          agentRole,
          pipelineId,
          messages,
          moduleId: moduleId ?? pipelineId,
          systemPrompt,
          modelConfig,
          surface: "razbor",
          ...(handoffBrief ? { handoffBrief } : {}),
          ...(draftCarouselJson
            ? { carouselJson: draftCarouselJson }
            : {}),
          signal: ac.signal,
        });

        if (ac.signal.aborted) return;

        const replySeq = ++msgSeqRef.current;
        const replyMsg: RazborChatMessage = {
          id: `${agentId}-live-${replySeq}`,
          agentId,
          text: result.reply,
          delayMs: 0,
          role: "agent",
        };
        setPanes((prev) => ({
          ...prev,
          [agentId]: {
            ...prev[agentId],
            messages: [...prev[agentId].messages, replyMsg],
            status:
              agentId === "scriptwriter" && prev[agentId].status === "idle"
                ? "done"
                : prev[agentId].status,
          },
        }));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        if (chatAbortRef.current === ac) {
          chatAbortRef.current = null;
          setChatThinking(false);
        }
      }
    },
    [
      activeTab,
      post,
      panes,
      moduleId,
      chatThinking,
      liveAnalysis,
      scriptwriterHandoff,
      draft,
      previewDraft,
    ],
  );

  const handleSelectComparison = useCallback(
    (picked: FeedPost) => {
      setComparisonPost(picked);
      setCompetitorSlides(buildCompetitorSlides(picked));
      setCarouselSide("competitor");
      void prefetchAll(
        [
          ...(picked.slideUrls ?? []),
          picked.thumbUrl,
          picked.mediaUrl,
        ].filter((u): u is string => Boolean(u)),
      );
    },
    [],
  );

  const panelTransition = reduceMotion ? INSTANT : PANEL_SPRING;
  /* D-rb-2: hide «Начать разбор» when editing an existing draft */
  const showWelcomeCta =
    !draftEditMode &&
    (panes.analyst.status === "welcome" || panes.analyst.status === "idle");
  const busy = analysisRunning || scriptRunning || designerRunning;
  /* C-69: publisher also has chat (schedule pane stays above composer). */
  const showComposer = true;
  const publisherPostId =
    draft?.id ??
    draftIdRef.current ??
    previewDraft?.id ??
    (post ? `draft-razbor-${post.id}` : "");
  const previewSourcePost = comparisonPost ?? post;
  const showCompetitorVideo =
    Boolean(previewSourcePost) &&
    carouselSide === "competitor" &&
    shouldShowFeedPlay(previewSourcePost!, moduleId);
  const oursEnabled =
    (draft?.slides.length ?? 0) > 0 ||
    (previewDraft?.slides.length ?? 0) > 0;
  const oursSlides =
    (draft?.slides.length ?? 0) > 0
      ? draft!.slides
      : (previewDraft?.slides ?? []);
  const pickerPosts = useMemo(() => {
    const base = competitorPosts.length > 0 ? competitorPosts : [];
    if (post && !base.some((p) => p.id === post.id)) {
      return [post, ...base];
    }
    return base;
  }, [competitorPosts, post]);

  useEffect(() => {
    if (!oursEnabled && carouselSide === "ours") {
      setCarouselSide("competitor");
    }
  }, [oursEnabled, carouselSide]);

  return (
    <AnimatePresence>
      {open && post ? (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть разбор"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={
              reduceMotion ? INSTANT : { duration: 0.22, ease: "easeOut" }
            }
            onClick={onClose}
            onWheel={stopModalWheel}
          />
          <motion.div
            data-testid="razbor-modal"
            data-module-id={moduleId ?? ""}
            role="dialog"
            aria-modal="true"
            aria-labelledby="razbor-modal-title"
            className={cn(
              "fixed inset-3 z-[70] flex flex-col overflow-hidden overscroll-contain rounded-2xl",
              "pointer-events-auto border border-[var(--border-glass)] bg-[var(--bg-elevated)]",
              "shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
              "font-[family-name:var(--font-century-gothic)]",
              "md:inset-6 lg:inset-10",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: 12, scale: 0.97 }
            }
            transition={panelTransition}
            onWheel={stopModalWheel}
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border-glass)] px-4 py-3 md:px-5">
              <div className="min-w-0 flex-1">
                {/* S48 — no post title in chrome; eyebrow is the only header label */}
                <h2
                  id="razbor-modal-title"
                  data-testid="razbor-system-eyebrow"
                  className="cf-system-title uppercase tracking-[0.08em] text-white"
                >
                  Разбор конкурента · {moduleId ?? "studio"}
                </h2>
              </div>
              <button
                type="button"
                data-testid="razbor-modal-close"
                aria-label="Закрыть"
                onClick={onClose}
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
                  "border border-[color-mix(in_srgb,var(--accent-terracotta)_55%,transparent)]",
                  "bg-[color-mix(in_srgb,var(--accent-terracotta)_22%,transparent)]",
                  "text-[var(--accent-terracotta)]",
                  "transition-[background-color,border-color,transform] duration-150",
                  "hover:bg-[color-mix(in_srgb,var(--accent-terracotta)_34%,transparent)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-terracotta)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]",
                  "active:scale-[0.96]",
                )}
              >
                <X className="size-5 stroke-[2.5]" aria-hidden />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
              <section
                data-testid="razbor-agents"
                className="flex min-h-0 flex-col border-b border-[var(--border-glass)] lg:border-b-0 lg:border-r"
              >
                <div className="shrink-0 border-b border-[var(--border-glass)]">
                  {carousel && agents.length <= 1 ? (
                    <div
                      data-testid="razbor-agent-people-tabs"
                      className="flex items-center gap-3 px-4 py-3"
                      aria-label="Арт-директор"
                    >
                      <AgentProfessionAvatar
                        packId="designer"
                        label="Арт-директор"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          Арт-директор
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Один чат · сценарий и слайды
                        </p>
                      </div>
                    </div>
                  ) : (
                  <AgentPeopleIconTabs
                    ariaLabel="Агенты разбора"
                    testId="razbor-agent-people-tabs"
                    items={agents.map((agent) => {
                      const pane = panes[agent.id];
                      const pack = RAZBOR_PACK[agent.id];
                      const mark =
                        pane.status === "running"
                          ? "…"
                          : pane.status === "handed"
                            ? "✓"
                            : "";
                      return {
                        id: agent.id,
                        label: agent.label,
                        packId: pack.packId,
                        roleKind: pack.roleKind,
                        mark,
                        active: activeTab === agent.id,
                        testId: `razbor-tab-${agent.id}`,
                        onClick: () => {
                          setActiveTab(agent.id);
                          if (
                            agent.id === "designer" &&
                            carousel &&
                            (panes.scriptwriter.status === "done" ||
                              panes.scriptwriter.status === "handed") &&
                            panes.designer.status === "idle"
                          ) {
                            void handleRunDesigner();
                          }
                        },
                      };
                    })}
                  />
                  )}
                  {agents.map((agent) =>
                    panes[agent.id].status === "handed" ? (
                      <span
                        key={`check-${agent.id}`}
                        className="sr-only"
                        data-testid={`razbor-tab-check-${agent.id}`}
                      >
                        ✓
                      </span>
                    ) : null,
                  )}
                </div>

                <div
                  className={cn(
                    "cf-hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3",
                    "[scrollbar-width:none] [-ms-overflow-style:none]",
                    "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0",
                  )}
                  data-testid={`razbor-pane-${activeTab}`}
                  onWheel={stopModalWheel}
                >
                  {activeTab === "scriptwriter" && script ? (
                    <ScriptFieldsCard script={script} />
                  ) : null}

                  {activeTab === "publisher" && carousel ? (
                    <div className="mb-3">
                      <RazborPublisherPane
                        postId={publisherPostId}
                        draft={draft}
                        onEnsureDraft={upsertDraft}
                      />
                    </div>
                  ) : null}

                  <ul className="flex flex-col gap-2.5">
                    <AnimatePresence initial={false}>
                      {panes[activeTab].messages.map((msg) => {
                        const isUser = msg.role === "user";
                        return (
                          <motion.li
                            key={msg.id}
                            data-testid="razbor-chat-bubble"
                            data-role={isUser ? "user" : "agent"}
                            className={cn(
                              "rounded-xl border px-3 py-2.5",
                              "text-sm leading-relaxed whitespace-pre-wrap",
                              isUser
                                ? "ml-6 border-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] text-[var(--text-primary)]"
                                : "border-[var(--border-glass)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]",
                            )}
                            initial={
                              reduceMotion
                                ? false
                                : { opacity: 0, y: 8, scale: 0.98 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={reduceMotion ? INSTANT : MSG_SPRING}
                          >
                            {msg.text}
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                    {panes[activeTab].messages.length === 0 ? (
                      <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                        {draftEditMode
                          ? activeTab === "designer"
                            ? "Опишите правку макета — контекст черновика уже в чате"
                            : activeTab === "publisher"
                              ? "Слот публикации выше — напишите правку публицисту"
                              : "Напишите правку — черновик открыт для обсуждения"
                          : activeTab === "analyst"
                            ? "Нажмите «Начать разбор» ниже"
                            : activeTab === "designer"
                              ? "Сначала idea-brief — дизайнер соберёт макет"
                              : activeTab === "publisher"
                                ? "Слот публикации выше — напишите правку публицисту"
                                : "Нажмите «Написать сценарий», когда Разборщик закончит"}
                      </p>
                    ) : null}
                  </ul>
                </div>

                {showComposer ? (
                  <AgentChatComposer
                    onSend={handleComposerSend}
                    moduleId={moduleId}
                    disabled={busy || chatThinking}
                    isThinking={chatThinking}
                    hideTools
                    placeholder="Сообщение"
                    onHandoff={
                      activeTab === "publisher" ? undefined : handleHandoff
                    }
                    handoffNext={handoffNextForTab(activeTab, carousel)}
                    handoffTestId={
                      activeTab === "scriptwriter"
                        ? "razbor-send-designer"
                        : activeTab === "designer"
                          ? "razbor-send-publisher-designer"
                          : activeTab === "analyst"
                            ? "razbor-send-scriptwriter"
                            : undefined
                    }
                    handoffLabel={
                      activeTab === "analyst"
                        ? "Передать сценаристу"
                        : activeTab === "scriptwriter"
                          ? carousel
                            ? "Передать дизайнеру"
                            : "Передать задание"
                          : "Передать публицисту"
                    }
                    handoffDisabled={
                      activeTab === "analyst"
                        ? panes.analyst.status !== "done" &&
                          panes.analyst.status !== "handed"
                        : activeTab === "scriptwriter"
                          ? panes.scriptwriter.status !== "done" &&
                            panes.scriptwriter.status !== "handed"
                          : activeTab === "designer"
                            ? panes.designer.status !== "done" &&
                              panes.designer.status !== "handed" &&
                              (draft?.slides.length ?? 0) === 0
                            : true
                    }
                    aboveInput={
                      <>
                        {activeTab === "analyst" && showWelcomeCta ? (
                          <button
                            type="button"
                            data-testid="razbor-start-btn"
                            disabled={analysisRunning}
                            onClick={() => void handleStartRazbor()}
                            className={cn(
                              "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
                              "bg-[color-mix(in_srgb,var(--accent-blue)_22%,#0a0c0f)]",
                              "border border-[color-mix(in_srgb,var(--accent-blue)_40%,transparent)]",
                              "disabled:cursor-not-allowed disabled:opacity-40",
                              "hover:enabled:bg-[color-mix(in_srgb,var(--accent-blue)_30%,#0a0c0f)]",
                            )}
                          >
                            {analysisRunning ? "Разбираем…" : "Начать разбор"}
                          </button>
                        ) : null}
                        {activeTab === "scriptwriter" ? (
                          <button
                            type="button"
                            data-testid="razbor-write-script"
                            disabled={
                              scriptRunning ||
                              (panes.analyst.status !== "done" &&
                                panes.analyst.status !== "handed") ||
                              panes.scriptwriter.status === "done" ||
                              panes.scriptwriter.status === "handed"
                            }
                            onClick={() => void handleWriteScript()}
                            className={cn(
                              "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
                              "bg-[color-mix(in_srgb,var(--accent-gold)_22%,#0a0c0f)]",
                              "border border-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)]",
                              "disabled:cursor-not-allowed disabled:opacity-40",
                              "hover:enabled:bg-[color-mix(in_srgb,var(--accent-gold)_30%,#0a0c0f)]",
                            )}
                          >
                            {panes.scriptwriter.status === "done" ||
                            panes.scriptwriter.status === "handed"
                              ? carousel
                                ? "Idea-brief готов"
                                : "Сценарий готов"
                              : scriptRunning
                                ? "Пишем…"
                                : carousel
                                  ? "Написать idea-brief"
                                  : "Написать сценарий"}
                          </button>
                        ) : null}
                      </>
                    }
                  />
                ) : null}
              </section>

              <section
                data-testid="razbor-competitor-carousel"
                data-preview-side={carouselSide}
                data-draft-edit={draftEditMode ? "1" : "0"}
                className="relative flex min-h-[18rem] w-full min-w-0 flex-col items-center overflow-y-auto overscroll-contain bg-[linear-gradient(160deg,#0e1116_0%,#080a0d_100%)] p-4 lg:min-h-0"
                onWheel={stopModalWheel}
              >
                {/* D-rb-4: Выбрать + empty comparison square (top-right) */}
                {carousel && carouselSide === "competitor" ? (
                  <RazborCompetitorPickChrome
                    posts={pickerPosts}
                    selected={comparisonPost}
                    pickerOpen={competitorPickerOpen}
                    onOpenPicker={() => setCompetitorPickerOpen(true)}
                    onClosePicker={() => setCompetitorPickerOpen(false)}
                    onSelect={handleSelectComparison}
                  />
                ) : null}
                {/* S50: Competitors/Ours toggle higher — not flush on slides */}
                {carousel ? (
                  <div
                    className="mb-6 flex w-full shrink-0 justify-center pt-1"
                    data-testid="razbor-source-toggle-wrap"
                  >
                    <RazborCarouselToggle
                      value={carouselSide}
                      onChange={setCarouselSide}
                      oursEnabled={oursEnabled}
                    />
                  </div>
                ) : null}
                {/* C-razbor-right-preview-collapse: w-full breaks shrink-wrap → 0×0 aspect box */}
                <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center">
                  {/* S47 — no banner «Карусель конкурента» / source titles */}
                  {/* D-rb-1: ours = draft / previewDraft slides */}
                  {carousel && carouselSide === "ours" ? (
                    <RazborSlidesCarousel
                      slides={oursSlides}
                      testId="razbor-ours-carousel"
                    />
                  ) : carousel &&
                    carouselSide === "competitor" &&
                    !showCompetitorVideo ? (
                    <RazborSlidesCarousel
                      slides={competitorSlides}
                      testId="razbor-competitor-slides"
                    />
                  ) : (
                    <RazborReelPlayer
                      post={previewSourcePost!}
                      slides={competitorSlides}
                      moduleId={moduleId}
                    />
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
