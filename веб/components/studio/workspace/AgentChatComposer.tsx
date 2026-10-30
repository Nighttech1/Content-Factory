"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { ThinkingIndicator } from "@/components/ui/thinking-indicator";
import {
  HandoffRoundButton,
  type HandoffRoundButtonProps,
} from "@/components/studio/workspace/HandoffRoundButton";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type AgentChatComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** C-74 / S47 / S48 — handoff inside PromptBox chrome. */
  onHandoff?: () => void;
  handoffLabel?: string;
  handoffDisabled?: boolean;
  /** data-testid on handoff round button (smoke / Playwright). */
  handoffTestId?: string;
  /** Next-agent avatar for mic-style handoff (S47). */
  handoffNext?: Pick<
    HandoffRoundButtonProps,
    "nextPackId" | "nextLabel" | "nextRoleKind"
  >;
  /** Optional slot rendered above the input row (e.g. «Начать разбор»). */
  aboveInput?: ReactNode;
  /** C-155 D5 — show ThinkingIndicator; disable send. */
  isThinking?: boolean;
  /**
   * @deprecated C-155 — no longer glues combat brief; kept for call-site compat.
   */
  moduleId?: string;
  /** S47 — hide Plus+Tools in PromptBox. Default true (no Tools rail). */
  hideTools?: boolean;
  /** C-carousel-chrome — skip footer handoff. Default false (Razbor). */
  hideHandoff?: boolean;
};

/**
 * C-155 / C-157 / S47 / S48 — PromptBox composer: raw text only.
 * Mic = Web Speech · handoff = round arrow+next-agent logo **inside** PromptBox.
 */
export function AgentChatComposer({
  onSend,
  disabled = false,
  placeholder = "Сообщение",
  onHandoff,
  handoffLabel = "Передать задание",
  handoffDisabled = false,
  handoffTestId,
  handoffNext,
  aboveInput,
  isThinking = false,
  hideTools = true,
  hideHandoff = false,
}: AgentChatComposerProps) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const blocked = disabled || isThinking;

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionCtor()));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || blocked) return;

    recognitionRef.current?.abort();
    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript?.trim();
      if (!transcript) return;
      setValue((prev) => {
        const base = prev.trim();
        return base ? `${base} ${transcript}` : transcript;
      });
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [blocked]);

  function handleMicClick() {
    if (!speechSupported || blocked) return;
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  }

  function handleSend() {
    const text = value.trim();
    if (!text || blocked) return;
    if (listening) stopListening();
    onSend(text);
    setValue("");
  }

  const showHandoff = Boolean(onHandoff) && !hideHandoff;

  return (
    <div
      data-testid="agent-chat-composer"
      className="flex shrink-0 flex-col gap-2 border-t border-[var(--border-glass)] px-3 py-2.5 font-[family-name:var(--font-century-gothic)]"
    >
      {aboveInput ? <div className="w-full">{aboveInput}</div> : null}
      {isThinking ? <ThinkingIndicator /> : null}
      <PromptBox
        className="min-w-0 w-full"
        value={value}
        onValueChange={setValue}
        disabled={blocked}
        placeholder={placeholder}
        onSend={handleSend}
        onMicClick={handleMicClick}
        micListening={listening}
        micDisabled={blocked || !speechSupported}
        sendDisabled={blocked || !value.trim()}
        hideTools={hideTools}
        trailingActions={
          showHandoff ? (
            <HandoffRoundButton
              onClick={() => onHandoff?.()}
              disabled={blocked || handoffDisabled}
              ariaLabel={handoffLabel}
              testId={handoffTestId ?? "multi-button-handoff"}
              nextPackId={handoffNext?.nextPackId}
              nextLabel={handoffNext?.nextLabel ?? handoffLabel}
              nextRoleKind={handoffNext?.nextRoleKind}
              className="h-8 w-8"
            />
          ) : null
        }
      />
      {!speechSupported ? (
        <p className="text-[10px] text-[var(--text-mono)]">
          Голос недоступен — введите правку текстом
        </p>
      ) : listening ? (
        <p className="text-[10px] text-[var(--accent-terracotta)]">Слушаю…</p>
      ) : null}
    </div>
  );
}
