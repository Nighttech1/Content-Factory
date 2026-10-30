"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { AgentChatComposer } from "@/components/studio/workspace/AgentChatComposer";
import { AgentMarkdownBubble } from "@/components/studio/workspace/AgentMarkdownBubble";
import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import {
  CreateCarouselPreview,
  type CreateCarouselPreviewSlide,
} from "@/components/studio/workspace/CreateCarouselPreview";
import { RazborCarouselToggle } from "@/components/studio/workspace/RazborCarouselToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  stopModalWheel,
  useModalScrollLock,
} from "@/lib/studio/use-modal-scroll-lock";
import {
  meshModelConfigForRole,
  meshSystemPromptForRole,
  postStudioAgentChat,
  resolvePipelineId,
} from "@/lib/studio/agent-chat-client";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import { useCarouselDraftsStore } from "@/lib/studio/carousel-drafts-store";
import {
  parseAndAssertCarouselJson,
  type CarouselHandoffJson,
} from "@/lib/studio/carousel-json-contract";

const PANEL_SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const MSG_SPRING = { type: "spring" as const, damping: 30, stiffness: 380 };
const INSTANT = { duration: 0 };

const DEFAULT_SLIDE_COUNT = 4;

const AD_WELCOME =
  "Я арт-директор. Опишите тему карусели — подготовлю сценарий и кадры. " +
  "Режим сборки A (HTML/CSS) или B (AI-слайд) переключается сверху. " +
  "Когда тема ясна, нажмите «Собрать карусель». После результата замечания по сценарию и слайдам пишите сюда же.";

type DrawPhase = "idle" | "drawing" | "ready";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
};

type PreviewSlide = CreateCarouselPreviewSlide;

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m?.role === "user" && m.text.trim()) return m.text.trim();
  }
  return "";
}

function lastAssistantText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m?.role === "agent" && m.text.trim()) return m.text.trim();
  }
  return "";
}

function tryParseCarouselJson(text: string): CarouselHandoffJson | null {
  if (!text.trim()) return null;
  try {
    return parseAndAssertCarouselJson(text);
  } catch {
    return null;
  }
}

/** Prefer newest message that contains valid carousel JSON. */
function findCarouselJsonInMessages(
  messages: ChatMessage[],
): CarouselHandoffJson | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (!m?.text.trim()) continue;
    const parsed = tryParseCarouselJson(m.text);
    if (parsed) return parsed;
  }
  return null;
}

function topicFromChat(messages: ChatMessage[]): string {
  const user = lastUserText(messages);
  if (user) return user;
  // Fallback: first non-welcome agent reply is unlikely a topic; prefer user
  return "";
}

type CreateCarouselModalProps = {
  open: boolean;
  onClose: () => void;
  /** C-drafts-always: bump Ours → Черновики after successful draw. */
  onDraftPersisted?: () => void;
};

/**
 * Create carousel — single Art Director chat + Mode A/B + «Собрать карусель».
 * Draw → Vernatun (topic / JSON) → upsert draft for Studio Drafts + Schedule.
 * Publishing time is set on the Schedule page (no publication pane here).
 */
export function CreateCarouselModal({
  open,
  onClose,
  onDraftPersisted,
}: CreateCarouselModalProps) {
  const reduceMotion = useReducedMotion();
  useModalScrollLock(open);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "w-ad", role: "agent", text: AD_WELCOME },
  ]);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>("idle");
  const [agreedDescription, setAgreedDescription] = useState("");
  const [carouselJson, setCarouselJson] = useState<CarouselHandoffJson | null>(
    null,
  );
  const [slides, setSlides] = useState<PreviewSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [previewLoadOk, setPreviewLoadOk] = useState(false);
  const [carouselSide, setCarouselSide] = useState<"competitor" | "ours">(
    "ours",
  );
  const [chatThinking, setChatThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [draftMeta, setDraftMeta] = useState<{
    createdAt: string;
    title: string;
  } | null>(null);
  const [pendingAssets, setPendingAssets] = useState<
    Array<{ filename: string; mime?: string; data: string }>
  >([]);
  const [buildMode, setBuildMode] = useState<"A" | "B">(() => {
    if (typeof window === "undefined") return "A";
    try {
      const raw = window.localStorage.getItem("cf.carousel.buildMode");
      return raw === "B" ? "B" : "A";
    } catch {
      return "A";
    }
  });

  const seqRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatAbortRef = useRef<AbortController | null>(null);
  const draftIdRef = useRef(`draft-create-${Date.now()}`);

  const resetSession = useCallback(() => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    seqRef.current = 0;
    draftIdRef.current = `draft-create-${Date.now()}`;
    setMessages([{ id: "w-ad", role: "agent", text: AD_WELCOME }]);
    setDrawPhase("idle");
    setAgreedDescription("");
    setCarouselJson(null);
    setSlides([]);
    setSlideIndex(0);
    setPreviewLoadOk(false);
    setCarouselSide("ours");
    setChatThinking(false);
    setChatError(null);
    setDraftMeta(null);
  }, []);

  useEffect(() => {
    if (open) resetSession();
  }, [open, resetSession]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, chatThinking, chatError]);

  const appendMsg = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const buildHistory = useCallback(
    (extraUser?: string) => {
      const history = messages.map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: m.text,
      }));
      if (extraUser?.trim()) {
        history.push({ role: "user", content: extraUser.trim() });
      }
      return history;
    },
    [messages],
  );

  const onPreviewAllLoaded = useCallback((ok: boolean) => {
    setPreviewLoadOk((prev) => (prev === ok ? prev : ok));
  }, []);

  const onPreviewError = useCallback((message: string) => {
    setChatError((prev) => (prev === message ? prev : message));
  }, []);

  const onSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatThinking || drawPhase === "drawing") return;

      seqRef.current += 1;
      appendMsg({ id: `u-${seqRef.current}`, role: "user", text: trimmed });
      setChatError(null);

      // O6: после превью замечания в чате → repair draw (не тихий ignore)
      const repairAfterPreview =
        drawPhase === "ready" && slides.length > 0 && trimmed.length >= 8;

      chatAbortRef.current?.abort();
      const ac = new AbortController();
      chatAbortRef.current = ac;
      setChatThinking(true);

      const pipelineId = resolvePipelineId("carousel-engine");

      try {
        if (repairAfterPreview) {
          setDrawPhase("drawing");
          const topic =
            topicFromChat(messages) ||
            agreedDescription.trim() ||
            lastAssistantText(messages) ||
            "Карусель";
          const result = await postStudioAgentChat({
            agentRole: "artDirector",
            pipelineId,
            messages: buildHistory(trimmed),
            moduleId: "carousel-engine",
            surface: "create-carousel",
            mode: "draw",
            topic: topic.trim(),
            slideCount: slides.length || DEFAULT_SLIDE_COUNT,
            lastAgreedDescription: topic.trim(),
            systemPrompt: meshSystemPromptForRole("artDirector"),
            modelConfig: meshModelConfigForRole("artDirector"),
            buildMode,
            styleNotes: `REPAIR_FROM_CHAT:\n${trimmed}`,
            userAssetFiles: pendingAssets.length
              ? pendingAssets
              : undefined,
            signal: ac.signal,
          });
          if (ac.signal.aborted) return;
          if (result.source !== "live") {
            setDrawPhase("ready");
            setChatError(
              result.error?.message ||
                "Не удалось применить замечания. Уточните и попробуйте снова.",
            );
            return;
          }
          const nextSlides = (result.slides ?? [])
            .filter((s) => s.imageUrl?.trim())
            .map((s) => ({
              id: s.id,
              imageUrl: s.imageUrl,
              caption: s.caption,
            }));
          if (nextSlides.length) {
            setSlides(nextSlides);
            setSlideIndex(0);
            setPreviewLoadOk(false);
            setDrawPhase("ready");
            seqRef.current += 1;
            appendMsg({
              id: `a-${seqRef.current}`,
              role: "agent",
              text: "Учёл замечания и пересобрал карусель. Смотрите превью.",
            });
          } else {
            setDrawPhase("ready");
            setChatError("После ремонта слайды не получены.");
          }
          return;
        }

        const result = await postStudioAgentChat({
          agentRole: "artDirector",
          pipelineId,
          messages: buildHistory(trimmed),
          moduleId: "carousel-engine",
          surface: "create-carousel",
          mode: "chat",
          systemPrompt: meshSystemPromptForRole("artDirector"),
          modelConfig: meshModelConfigForRole("artDirector"),
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;

        if (result.source === "error") {
          setChatError(
            result.error?.message ||
              "Не удалось получить ответ. Проверьте ключи и попробуйте снова.",
          );
          return;
        }

        seqRef.current += 1;
        appendMsg({
          id: `a-${seqRef.current}`,
          role: "agent",
          text: result.reply,
        });

        if (result.reply.trim()) {
          const parsed = tryParseCarouselJson(result.reply);
          if (parsed) setCarouselJson(parsed);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setChatError("Сеть недоступна. Ответ не получен.");
        if (repairAfterPreview) setDrawPhase("ready");
      } finally {
        if (chatAbortRef.current === ac) {
          chatAbortRef.current = null;
          setChatThinking(false);
        }
      }
    },
    [
      agreedDescription,
      appendMsg,
      buildHistory,
      buildMode,
      chatThinking,
      drawPhase,
      messages,
      pendingAssets,
      slides.length,
    ],
  );

  const drawSlides = useCallback(async () => {
    if (chatThinking || drawPhase === "drawing") return;

    const topic =
      topicFromChat(messages) ||
      agreedDescription.trim() ||
      lastAssistantText(messages);

    const jsonForDraw =
      carouselJson ?? findCarouselJsonInMessages(messages) ?? null;

    if (!topic.trim() && !jsonForDraw) {
      setChatError(
        "Сначала опишите тему карусели в чате — затем нажмите «Собрать карусель».",
      );
      return;
    }

    setChatError(null);
    setDrawPhase("drawing");
    setPreviewLoadOk(false);
    chatAbortRef.current?.abort();
    const ac = new AbortController();
    chatAbortRef.current = ac;
    setChatThinking(true);

    const pipelineId = resolvePipelineId("carousel-engine");
    const slideCount =
      jsonForDraw?.requested_slide_count &&
      jsonForDraw.requested_slide_count > 0
        ? jsonForDraw.requested_slide_count
        : DEFAULT_SLIDE_COUNT;
    const description =
      agreedDescription.trim() ||
      (jsonForDraw ? JSON.stringify(jsonForDraw) : topic.trim());

    try {
      const result = await postStudioAgentChat({
        agentRole: "artDirector",
        pipelineId,
        messages: buildHistory(),
        moduleId: "carousel-engine",
        surface: "create-carousel",
        mode: "draw",
        lastAgreedDescription: description || topic.trim(),
        carouselJson: jsonForDraw ?? undefined,
        topic: topic.trim() || undefined,
        slideCount,
        systemPrompt: meshSystemPromptForRole("artDirector"),
        modelConfig: meshModelConfigForRole("artDirector"),
        buildMode,
        userAssetFiles: pendingAssets.length ? pendingAssets : undefined,
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;

      if (result.source !== "live") {
        setDrawPhase(slides.length > 0 ? "ready" : "idle");
        setChatError(
          result.error?.message ||
            "Не удалось собрать карусель. Уточните тему и попробуйте снова.",
        );
        return;
      }

      const nextSlides = (result.slides ?? [])
        .filter((s) => s.imageUrl?.trim())
        .map((s) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          caption: s.caption,
        }));

      if (nextSlides.length === 0) {
        setDrawPhase(slides.length > 0 ? "ready" : "idle");
        setChatError(
          "Слайды не получены. Описание сохранено — нажмите «Собрать карусель» снова.",
        );
        return;
      }

      seqRef.current += 1;
      appendMsg({
        id: `draw-${seqRef.current}`,
        role: "agent",
        text:
          result.reply.trim() ||
          "Готово — карусель собрана. Превью справа. Замечания пишите сюда; время публикации — на странице Расписание.",
      });
      setSlides(nextSlides);
      setSlideIndex(0);
      setPreviewLoadOk(false);
      setDrawPhase("ready");
      setAgreedDescription(description || topic.trim());
      if (jsonForDraw) setCarouselJson(jsonForDraw);

      const now = new Date().toISOString();
      const createdAt = draftMeta?.createdAt ?? now;
      const title =
        draftMeta?.title ??
        (topic.trim().slice(0, 72) || "Создать карусель");
      setDraftMeta({ createdAt, title });

      const draftAfterDraw: CarouselDraft = {
        id: draftIdRef.current,
        sourceCompetitorId: "create-carousel",
        competitorId: "create-carousel",
        title,
        slides: nextSlides.map((s) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          caption: s.caption,
        })),
        scenario: description || topic.trim() || undefined,
        status: "unpublished",
        createdAt,
        updatedAt: now,
      };
      useCarouselDraftsStore.getState().upsertDraft(draftAfterDraw);
      onDraftPersisted?.();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setDrawPhase(slides.length > 0 ? "ready" : "idle");
      setChatError("Сеть недоступна. Карусель не собрана.");
    } finally {
      if (chatAbortRef.current === ac) {
        chatAbortRef.current = null;
        setChatThinking(false);
      }
    }
  }, [
    agreedDescription,
    appendMsg,
    buildHistory,
    buildMode,
    carouselJson,
    chatThinking,
    draftMeta?.createdAt,
    draftMeta?.title,
    drawPhase,
    messages,
    onDraftPersisted,
    slides.length,
  ]);

  const stepSlide = useCallback(
    (delta: number) => {
      if (slides.length === 0) return;
      setSlideIndex((i) => (i + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  if (!open) return null;

  const hasPreview = slides.length > 0;
  const isDrawing = drawPhase === "drawing";
  const slideCountHint =
    carouselJson?.requested_slide_count ??
    (hasPreview ? slides.length : DEFAULT_SLIDE_COUNT);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          data-testid="create-carousel-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-carousel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 md:p-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={reduceMotion ? INSTANT : { duration: 0.18 }}
          onWheel={stopModalWheel}
        >
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-[rgba(0,0,0,0.62)] backdrop-blur-[2px]"
            onClick={onClose}
            onWheel={stopModalWheel}
          />
          <motion.div
            className={cn(
              "relative z-10 flex h-[min(88vh,52rem)] w-full max-w-5xl flex-col overflow-hidden overscroll-contain",
              "pointer-events-auto rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
              "font-[family-name:var(--font-century-gothic)]",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reduceMotion ? INSTANT : PANEL_SPRING}
            onWheel={stopModalWheel}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-glass)] px-5 py-3.5">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <h2
                  id="create-carousel-modal-title"
                  className="text-lg font-semibold text-[var(--text-primary)]"
                >
                  Создать карусель
                </h2>
                <span
                  data-testid="create-carousel-slide-count"
                  className="rounded-md border border-[var(--border-glass)] px-2 py-0.5 text-[10px] tabular-nums text-[var(--text-muted)]"
                  title="Число слайдов (по умолчанию 4)"
                >
                  N={slideCountHint}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex rounded-lg border border-[var(--border-glass)] p-0.5"
                  data-testid="create-build-mode"
                  role="group"
                  aria-label="Режим сборки"
                >
                  {(
                    [
                      { id: "A" as const, label: "A · HTML/CSS" },
                      { id: "B" as const, label: "B · AI-слайд" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`create-build-mode-${opt.id}`}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                        buildMode === opt.id
                          ? "bg-[var(--accent-gold)] text-black"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                      onClick={() => {
                        setBuildMode(opt.id);
                        try {
                          window.localStorage.setItem(
                            "cf.carousel.buildMode",
                            opt.id,
                          );
                        } catch {
                          /* */
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  data-testid="create-draw-button"
                  disabled={chatThinking || isDrawing}
                  onClick={() => void drawSlides()}
                  className="text-white"
                >
                  {isDrawing ? "Собираю…" : "Собрать карусель"}
                </Button>
                <button
                  type="button"
                  data-testid="create-carousel-modal-close"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
                    "border border-[color-mix(in_srgb,var(--accent-terracotta)_55%,transparent)]",
                    "bg-[color-mix(in_srgb,var(--accent-terracotta)_22%,transparent)]",
                    "text-[var(--accent-terracotta)]",
                    "transition-[background-color,border-color,transform] duration-150",
                    "hover:bg-[color-mix(in_srgb,var(--accent-terracotta)_34%,transparent)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-terracotta)]",
                    "active:scale-[0.96]",
                  )}
                >
                  <X className="size-5 stroke-[2.5]" aria-hidden />
                </button>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
              <section
                data-testid="create-carousel-chat"
                className="flex min-h-0 flex-col border-b border-[var(--border-glass)] md:border-b-0 md:border-r"
              >
                <div
                  data-testid="create-carousel-ad-header"
                  className="flex shrink-0 items-center gap-3 border-b border-[var(--border-glass)] px-4 py-2.5"
                >
                  <AgentProfessionAvatar
                    packId="art-director"
                    label="Арт-директор"
                    className="h-10 w-10 rounded-full ring-2 ring-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--accent-gold)]">
                      Арт-директор
                    </p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">
                      Сценарий и замечания по кадрам — в одном чате
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "cf-hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3",
                    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  )}
                  onWheel={stopModalWheel}
                >
                  <ul className="flex flex-col gap-2.5">
                    {messages.map((msg) => (
                      <motion.li
                        key={msg.id}
                        data-testid="create-carousel-chat-bubble"
                        className={cn(
                          "max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "ml-auto bg-[color-mix(in_srgb,var(--accent-blue)_22%,transparent)] text-[var(--text-primary)]"
                            : "mr-auto bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)]",
                        )}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reduceMotion ? INSTANT : MSG_SPRING}
                      >
                        {msg.role === "agent" ? (
                          <AgentMarkdownBubble content={msg.text} />
                        ) : (
                          msg.text
                        )}
                      </motion.li>
                    ))}
                  </ul>
                  {chatError ? (
                    <p
                      data-testid="create-carousel-chat-error"
                      className="mt-3 text-sm text-[color-mix(in_srgb,#f87171_90%,white)]"
                      role="alert"
                    >
                      {chatError}
                    </p>
                  ) : null}
                  <div ref={chatEndRef} />
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                  <label className="cursor-pointer text-xs text-[var(--text-muted)] underline-offset-2 hover:underline">
                    Прикрепить фото
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      data-testid="create-carousel-user-assets"
                      disabled={chatThinking || isDrawing}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        if (!files.length) return;
                        const next: Array<{
                          filename: string;
                          mime?: string;
                          data: string;
                        }> = [];
                        for (const f of files.slice(0, 6)) {
                          const dataUrl = await new Promise<string>(
                            (resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () =>
                                resolve(String(reader.result || ""));
                              reader.onerror = () =>
                                reject(reader.error ?? new Error("read_fail"));
                              reader.readAsDataURL(f);
                            },
                          );
                          const data = dataUrl.includes(",")
                            ? dataUrl.split(",")[1]!
                            : dataUrl;
                          next.push({
                            filename: f.name,
                            mime: f.type || "image/jpeg",
                            data,
                          });
                        }
                        setPendingAssets((prev) =>
                          [...prev, ...next].slice(0, 8),
                        );
                      }}
                    />
                  </label>
                  {pendingAssets.length ? (
                    <span
                      className="text-xs text-[var(--text-primary)]"
                      data-testid="create-carousel-user-assets-count"
                    >
                      {pendingAssets.length} фото ·{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setPendingAssets([])}
                      >
                        очистить
                      </button>
                    </span>
                  ) : null}
                </div>
                <AgentChatComposer
                  onSend={onSend}
                  moduleId="carousel-engine"
                  disabled={chatThinking || isDrawing}
                  isThinking={chatThinking}
                  hideTools
                  hideHandoff
                  placeholder="Тема или замечания по кадрам"
                />
              </section>

              <section
                data-testid="create-carousel-preview"
                className="relative flex min-h-0 flex-col items-center overflow-y-auto overscroll-contain bg-[linear-gradient(160deg,#0e1116_0%,#080a0d_100%)] p-4"
                onWheel={stopModalWheel}
              >
                <div
                  className="mb-6 flex w-full shrink-0 justify-center pt-1"
                  data-testid="create-source-toggle-wrap"
                >
                  <RazborCarouselToggle
                    value={carouselSide}
                    onChange={setCarouselSide}
                    oursEnabled={hasPreview || drawPhase === "ready"}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
                  {carouselSide === "competitor" ? (
                    <p
                      data-testid="create-carousel-preview-competitor-empty"
                      className="max-w-[18rem] text-center text-sm text-[var(--text-muted)]"
                    >
                      Референс конкурента откройте из Разбора. Здесь — ваша
                      карусель (переключите на «Наши»).
                    </p>
                  ) : isDrawing && !hasPreview ? (
                    <p
                      data-testid="create-carousel-preview-empty"
                      className="max-w-[14rem] text-center text-sm text-[var(--text-muted)]"
                    >
                      Собираю кадры…
                    </p>
                  ) : hasPreview ? (
                    <CreateCarouselPreview
                      slides={slides}
                      slideIndex={slideIndex}
                      onStep={stepSlide}
                      reduceMotion={reduceMotion}
                      onAllLoaded={onPreviewAllLoaded}
                      onPreviewError={onPreviewError}
                    />
                  ) : (
                    <p
                      data-testid="create-carousel-preview-empty"
                      className="max-w-[14rem] text-center text-sm text-[var(--text-muted)]"
                    >
                      Карусель появится после «Собрать карусель»
                    </p>
                  )}
                  {hasPreview && previewLoadOk ? (
                    <p
                      data-testid="create-carousel-draft-hint"
                      className="max-w-[18rem] text-center text-[11px] text-[var(--text-muted)]"
                    >
                      Черновик сохранён в Studio. Время публикации — на странице
                      Расписание.
                    </p>
                  ) : null}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
