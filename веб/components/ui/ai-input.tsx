"use client";

/**
 * S47 Marketing Director — AIInput adapted from 21st / user paste.
 * Vernatun Dark Luxury + Century Gothic. Uses project Button / Select / Textarea.
 * 21st id=28303 (structure simplified: no @base-ui; framer-motion not motion/react).
 */

import * as React from "react";
import { ArrowUp, Mic, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

export type AIInputOption = {
  value: string;
  label: string;
};

export type PromptSettingOption = {
  value: string;
  label: string;
  description?: string;
};

export type PromptSettingGroup = {
  id: string;
  label: string;
  options: PromptSettingOption[];
};

export type AIInputSendMeta = {
  agent?: string;
  settings: Record<string, string>;
};

export type AIInputProps = {
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  busy?: boolean;
  agents?: AIInputOption[];
  agent?: string;
  onAgentChange?: (value: string) => void;
  settingGroups?: PromptSettingGroup[];
  settings?: Record<string, string>;
  onSettingsChange?: (settings: Record<string, string>) => void;
  onSend?: (message: string, meta: AIInputSendMeta) => void;
  onMicClick?: () => void;
  onPlusClick?: () => void;
  /** Controlled value (optional). */
  value?: string;
  onValueChange?: (value: string) => void;
};

const MAX_TEXTAREA_HEIGHT = 132;
const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

function defaultSettings(
  groups: PromptSettingGroup[],
  defaults?: Record<string, string>,
): Record<string, string> {
  return groups.reduce<Record<string, string>>((acc, group) => {
    const preferred = defaults?.[group.id];
    const ok = group.options.some((o) => o.value === preferred);
    acc[group.id] =
      ok && preferred ? preferred : (group.options[0]?.value ?? "");
    return acc;
  }, {});
}

export function AIInput({
  className,
  placeholder = "Сообщение",
  disabled = false,
  busy = false,
  agents = [],
  agent: agentProp,
  onAgentChange,
  settingGroups = [],
  settings: settingsProp,
  onSettingsChange,
  onSend,
  onMicClick,
  onPlusClick,
  value: valueProp,
  onValueChange,
}: AIInputProps) {
  const reduceMotion = useReducedMotion();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = React.useState("");
  const [agent, setAgent] = React.useState(
    agentProp ?? agents[0]?.value ?? "",
  );
  const [internalSettings, setInternalSettings] = React.useState(() =>
    defaultSettings(settingGroups, settingsProp),
  );
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<{
    stop: () => void;
    abort: () => void;
  } | null>(null);

  const value = valueProp ?? internalValue;
  const setValue = (next: string) => {
    if (valueProp === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  React.useEffect(() => {
    if (agentProp !== undefined) setAgent(agentProp);
  }, [agentProp]);

  React.useEffect(() => {
    if (settingsProp) setInternalSettings(settingsProp);
  }, [settingsProp]);

  React.useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const syncHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, []);

  React.useLayoutEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  const hasValue = value.trim().length > 0;
  const blocked = disabled || busy;

  const handleSend = React.useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || blocked) return;
    onSend?.(trimmed, { agent, settings: internalSettings });
    setValue("");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    });
  }, [agent, blocked, internalSettings, onSend, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const startMic = () => {
    if (onMicClick) {
      onMicClick();
      return;
    }
    if (typeof window === "undefined") return;
    const SR =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognition;
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;
    if (!SR) return;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results?.[0]?.[0]?.transcript?.trim();
      if (text) setValue(value ? `${value.trim()} ${text}` : text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const modelGroup = settingGroups.find((g) => g.id === "model");

  return (
    <motion.div
      className={cn("w-full font-[family-name:var(--font-ui)]", className)}
      layout
      transition={reduceMotion ? { duration: 0 } : SPRING}
      data-testid="marketing-ai-input"
    >
      <div
        className={cn(
          "relative rounded-[28px] border border-[var(--border-glass)]",
          "bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)]",
          "shadow-[0_10px_26px_-22px_rgba(0,0,0,0.35)] backdrop-blur-sm",
        )}
      >
        <Textarea
          ref={textareaRef}
          aria-label="Сообщение директору"
          rows={1}
          disabled={blocked}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            syncHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-0 max-h-[132px] resize-none border-0 bg-transparent px-4 pt-4 pb-1",
            "shadow-none focus-visible:ring-0 sm:px-5",
            "text-base leading-6 sm:text-sm",
          )}
        />

        <div className="flex items-center gap-1.5 px-2.5 pt-1 pb-2.5 sm:gap-2 sm:px-3 sm:pb-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Добавить"
            disabled={blocked}
            onClick={onPlusClick}
            className="size-8 shrink-0 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] sm:size-9"
          >
            <Plus className="size-4" />
          </Button>

          {agents.length > 0 ? (
            <Select
              value={agent}
              onValueChange={(next) => {
                setAgent(next);
                onAgentChange?.(next);
              }}
              disabled={blocked}
            >
              <SelectTrigger
                aria-label="Агент"
                className="h-8 w-auto min-w-[7rem] rounded-full border-0 bg-[var(--bg-hover)] px-3"
              >
                <SelectValue placeholder="Агент" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {modelGroup && modelGroup.options.length > 0 ? (
            <Select
              value={internalSettings.model ?? modelGroup.options[0]?.value}
              onValueChange={(next) => {
                const merged = { ...internalSettings, model: next };
                setInternalSettings(merged);
                onSettingsChange?.(merged);
              }}
              disabled={blocked}
            >
              <SelectTrigger
                aria-label="Модель"
                className="h-8 w-auto min-w-[8rem] rounded-full border-0 bg-[var(--bg-hover)] px-3"
              >
                <SelectValue placeholder="Модель" />
              </SelectTrigger>
              <SelectContent>
                {modelGroup.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={listening ? "Стоп микрофон" : "Голосовой ввод"}
              aria-pressed={listening}
              disabled={blocked}
              onClick={startMic}
              className={cn(
                "size-8 shrink-0 rounded-full sm:size-9",
                listening
                  ? "text-[var(--accent-gold)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              <Mic className="size-[18px]" />
            </Button>

            <Button
              type="button"
              size="icon"
              aria-label="Отправить"
              disabled={!hasValue || blocked}
              onClick={handleSend}
              className={cn(
                "size-8 shrink-0 rounded-full sm:size-9",
                hasValue
                  ? "bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-bright)]"
                  : "bg-[color-mix(in_srgb,var(--text-muted)_35%,transparent)] text-[var(--bg-canvas)]",
              )}
            >
              <ArrowUp className="size-4" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AIInput;

/* Minimal SpeechRecognition typings (browser). */
type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results?: ArrayLike<ArrayLike<{ transcript?: string }>>;
};
