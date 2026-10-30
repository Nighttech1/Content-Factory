"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AIInput } from "@/components/ui/ai-input";
import { MarketingProjectsRail } from "@/components/marketing/MarketingProjectsRail";
import { cn } from "@/lib/cn";
import { DEFAULT_SCRIPTWRITER_MODEL } from "@/types/mesh-agent";
import {
  appendMessages,
  createChat,
  createProject,
  deleteProject,
  emptyProjectsFile,
  getActiveChat,
  readProjectsFromStorage,
  renameProject,
  writeProjectsToStorage,
  type MarketingChatMessage,
  type MarketingProjectsFile,
} from "@/lib/marketing/projects-store";

const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };
const SINK_MS = 160;

const MODEL_GROUPS = [
  {
    id: "model",
    label: "Модель",
    options: [
      {
        value: DEFAULT_SCRIPTWRITER_MODEL,
        label: "Claude Haiku 4.5",
        description: "Маркетинг-директор",
      },
    ],
  },
];

function msgId() {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export function MarketingDirectorClient() {
  const reduceMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const [file, setFile] = useState<MarketingProjectsFile>(() =>
    emptyProjectsFile(),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readProjectsFromStorage();
    setFile(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeProjectsToStorage(file);
  }, [file, hydrated]);

  const activeChat = getActiveChat(file);
  const hasMessages = (activeChat?.messages.length ?? 0) > 0;

  useEffect(() => {
    if (!hasMessages) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeChat?.messages.length, hasMessages, reduceMotion]);

  const persist = (next: MarketingProjectsFile) => {
    startTransition(() => setFile(next));
  };

  const handleSend = async (text: string) => {
    const projectId = file.activeProjectId;
    const chatId = file.activeChatId;
    if (!projectId || !chatId) return;

    const userMsg: MarketingChatMessage = {
      id: msgId(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const withUser = appendMessages(file, projectId, chatId, [userMsg]);
    setFile(withUser);
    setBusy(true);
    setError(null);

    const history = (getActiveChat(withUser)?.messages ?? [])
      .filter((m) => m.id !== userMsg.id)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/marketing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: text,
          history,
          model: DEFAULT_SCRIPTWRITER_MODEL,
          thinking: true,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string | null;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.reply) {
        setError(
          data.error === "aggregator_key_missing"
            ? "Нет ключа агрегатора — ответить нельзя."
            : `Ошибка ответа: ${data.error ?? res.status}`,
        );
        setBusy(false);
        return;
      }

      const assistantMsg: MarketingChatMessage = {
        id: msgId(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setFile((prev) =>
        appendMessages(prev, projectId, chatId, [assistantMsg]),
      );
    } catch {
      setError("Сеть недоступна — попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] min-h-[520px] overflow-hidden rounded-2xl border border-[var(--border-glass)]",
        "bg-[var(--bg-canvas)] font-[family-name:var(--font-ui)]",
      )}
      data-testid="marketing-director-root"
    >
      <MarketingProjectsRail
        file={file}
        onSelectProject={(projectId) => {
          const p = file.projects.find((x) => x.id === projectId);
          persist({
            ...file,
            activeProjectId: projectId,
            activeChatId: p?.chats[0]?.id ?? null,
          });
        }}
        onSelectChat={(projectId, chatId) =>
          persist({
            ...file,
            activeProjectId: projectId,
            activeChatId: chatId,
          })
        }
        onCreateProject={() => {
          const name =
            typeof window !== "undefined"
              ? window.prompt("Название проекта", "Новый проект")
              : "Новый проект";
          if (name == null) return;
          persist(createProject(file, name));
        }}
        onRenameProject={(projectId) => {
          const current = file.projects.find((p) => p.id === projectId)?.name;
          const name =
            typeof window !== "undefined"
              ? window.prompt("Переименовать проект", current ?? "")
              : null;
          if (name == null) return;
          persist(renameProject(file, projectId, name));
        }}
        onDeleteProject={(projectId) => {
          if (
            typeof window !== "undefined" &&
            !window.confirm("Удалить проект и его чаты?")
          ) {
            return;
          }
          persist(deleteProject(file, projectId));
        }}
        onCreateChat={(projectId) => persist(createChat(file, projectId))}
      />

      <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--border-glass)] px-5 py-3">
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            Маркетинг-директор
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Стратегия контента · календарь · порядок публикаций · Haiku 4.5
          </p>
        </header>

        <div
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8",
            !hasMessages && "flex flex-col",
          )}
        >
          {!hasMessages ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <div
                className="max-w-lg text-center"
                data-testid="marketing-welcome"
              >
                <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
                  Чем займёмся сегодня?
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  Стратегия ниши, карусели и рилсы, хуки, CTA, календарь идей и
                  порядок постинга Vernatun. Спросите — при необходимости я
                  поищу черновики и модули в фабрике.
                </p>
              </div>
              <div className="w-full max-w-2xl">
                <AIInput
                  busy={busy}
                  placeholder="Сообщение"
                  settingGroups={MODEL_GROUPS}
                  settings={{ model: DEFAULT_SCRIPTWRITER_MODEL }}
                  onSend={(message) => void handleSend(message)}
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-4">
              {activeChat?.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto rounded-br-md bg-[color-mix(in_srgb,var(--accent-blue)_22%,transparent)] text-[var(--text-primary)]"
                      : "mr-auto rounded-bl-md border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] text-[var(--text-primary)]",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert max-w-none font-[family-name:var(--font-ui)] prose-p:my-2 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              ))}
              {busy ? (
                <p className="text-xs text-[var(--text-muted)]">Думаю…</p>
              ) : null}
              {error ? (
                <p className="text-xs text-[#f87171]" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasMessages ? (
            <motion.div
              key="composer-bottom"
              className="border-t border-[var(--border-glass)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...SPRING, duration: SINK_MS / 1000 }
              }
              data-testid="marketing-composer-sink"
            >
              <div className="mx-auto w-full max-w-3xl">
                <AIInput
                  busy={busy}
                  placeholder="Сообщение"
                  settingGroups={MODEL_GROUPS}
                  settings={{ model: DEFAULT_SCRIPTWRITER_MODEL }}
                  onSend={(message) => void handleSend(message)}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}
