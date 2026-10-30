"use client";

import { create } from "zustand";
import {
  TOPIC_PRESETS,
  manifestToStudioModule,
  type StudioModule,
} from "@/components/studio/modules";
import { openJobStream } from "@/hooks/useJobStream";
import {
  normalizeApiManifest,
  readCustomModulesFromStorage,
  writeCustomModulesListToStorage,
  type CustomModuleManifestLite,
} from "@/lib/custom-modules-storage";
import type { JobStreamAgent, JobStreamEvent } from "@/lib/jobs/types";
import { toCanonicalModuleId } from "@/modules/id-map";
import type { AssetRenderResult, DraftOutput } from "@/types/module";

export type AgentStepState = "pending" | "active" | "done";

export type AgentStep = {
  id: string;
  label: string;
  statusText: string;
  state: AgentStepState;
};

export type GenerateStatus = "idle" | "running" | "success" | "error";

const DEFAULT_TOPIC = "Быстрый черновик Studio";
/** Wait for SSE `completed` after generate JSON; then force steps done. */
const SSE_COMPLETE_TIMEOUT_MS = 6000;

const PIPELINE_TEMPLATE: Omit<AgentStep, "state">[] = [
  {
    id: "researching",
    label: "Исследователь",
    statusText: "Анализ 40 источников...",
  },
  {
    id: "hooking",
    label: "Автор хуков",
    statusText: "Отбор лучшего хука (3 из 10)...",
  },
  {
    id: "scripting",
    label: "Сценарист",
    statusText: "Сборка таймлайна...",
  },
  {
    id: "designing",
    label: "Дизайнер",
    statusText: "Рендеринг визуала...",
  },
  {
    id: "done",
    label: "Конвейер",
    statusText: "Черновик готов",
  },
];

/** SSE agent → drawer step id (architect-spec / C-23). */
const AGENT_TO_STEP: Record<Exclude<JobStreamAgent, "system">, string> = {
  researcher: "researching",
  hook_writer: "hooking",
  script_writer: "scripting",
  designer: "designing",
};

const AGENT_STEP_ORDER = [
  "researching",
  "hooking",
  "scripting",
  "designing",
] as const;

function createPendingSteps(): AgentStep[] {
  return PIPELINE_TEMPLATE.map((step) => ({ ...step, state: "pending" }));
}

let streamClose: (() => void) | null = null;
let streamTerminalResolve: ((status: "completed" | "failed") => void) | null =
  null;

function closeJobStreamConnection() {
  if (streamClose) {
    streamClose();
    streamClose = null;
  }
  if (streamTerminalResolve) {
    streamTerminalResolve = null;
  }
}

function waitForStreamTerminal(
  timeoutMs: number,
): Promise<"completed" | "failed" | "timeout"> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (streamTerminalResolve) {
        streamTerminalResolve = null;
      }
      resolve("timeout");
    }, timeoutMs);

    streamTerminalResolve = (status) => {
      clearTimeout(timer);
      streamTerminalResolve = null;
      resolve(status);
    };
  });
}

function humanGenerateError(code: string | undefined): string {
  switch (code) {
    case "topic_required":
      return "Укажите тему для генерации";
    case "module_not_found":
      return "Модуль не найден в реестре";
    case "invalid_json":
      return "Некорректный запрос к API";
    case "generate_failed":
      return "Не удалось создать черновик";
    default:
      return code?.trim()
        ? `Ошибка генерации: ${code}`
        : "Не удалось создать черновик";
  }
}

function stepsFromStreamEvent(event: JobStreamEvent): AgentStep[] {
  const steps = createPendingSteps();

  if (event.status === "completed") {
    return steps.map((step) => ({
      ...step,
      state: "done" as const,
      statusText:
        step.id === "done" ? event.message || step.statusText : step.statusText,
    }));
  }

  if (event.status === "failed") {
    return steps.map((step) => ({
      ...step,
      state: "done" as const,
      statusText:
        step.id === "done"
          ? event.message || "Ошибка пайплайна"
          : "Прервано",
    }));
  }

  if (event.agent === "system") {
    // queued / system noise — leave pending, maybe update done label later
    return steps.map((step) =>
      step.id === "done"
        ? { ...step, statusText: event.message || step.statusText }
        : step,
    );
  }

  const activeStepId = AGENT_TO_STEP[event.agent];
  const activeIndex = AGENT_STEP_ORDER.indexOf(
    activeStepId as (typeof AGENT_STEP_ORDER)[number],
  );

  return steps.map((step) => {
    if (step.id === "done") {
      return step;
    }
    const stepIndex = AGENT_STEP_ORDER.indexOf(
      step.id as (typeof AGENT_STEP_ORDER)[number],
    );
    if (stepIndex < 0) return step;
    if (stepIndex < activeIndex) {
      return { ...step, state: "done" as const };
    }
    if (stepIndex === activeIndex) {
      return {
        ...step,
        state: "active" as const,
        statusText: event.message || step.statusText,
      };
    }
    return step;
  });
}

function markPipelineSuccess(
  set: (partial: Partial<StudioState>) => void,
  draftId: string,
) {
  set({
    agentSteps: createPendingSteps().map((step) => ({
      ...step,
      state: "done",
      statusText:
        step.id === "done" ? `Черновик готов · ${draftId}` : step.statusText,
    })),
    progress: 100,
  });
}

function markPipelineError(
  set: (partial: Partial<StudioState>) => void,
  message: string,
) {
  closeJobStreamConnection();
  set({
    agentSteps: createPendingSteps().map((step) => ({
      ...step,
      state: "done" as const,
      statusText: step.id === "done" ? message : "Прервано",
    })),
    progress: 100,
  });
}

type StudioState = {
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;

  /** Custom Plugin Slot tiles (hydrated from GET + localStorage mirror). */
  customModules: StudioModule[];
  /** Seed from localStorage then refresh from GET `/api/modules/register`. */
  hydrateCustomModules: () => Promise<void>;
  /** Append / upsert a registered custom tile and select it. */
  appendCustomModule: (manifest: CustomModuleManifestLite) => void;

  topic: string;
  setTopic: (topic: string) => void;
  applyPreset: (presetId: string) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  closeDrawer: () => void;

  agentSteps: AgentStep[];
  progress: number;

  /** Active SSE job from last generate (`job_<uuid>`). */
  jobId: string | null;

  /** C-59 — notes from GenerationDrawer AgentChatComposer (active step). */
  drawerNotes: { id: string; stepId: string; text: string }[];
  appendDrawerNote: (text: string) => void;

  generateStatus: GenerateStatus;
  generateError: string | null;
  lastDraftId: string | null;
  lastDraft: DraftOutput | null;
  lastAssets: AssetRenderResult["assets"] | null;
  lastRenderMock: boolean | null;

  /** Apply one SSE frame to drawer steps / progress. */
  applyJobStreamEvent: (event: JobStreamEvent) => void;

  /**
   * Opens drawer, POSTs `/api/modules/{id}/generate`, then drives steps
   * from SSE `/api/jobs/{jobId}/stream` (no local pipeline timers).
   */
  startGenerate: () => void;
};

function liteToStudioModules(
  manifests: CustomModuleManifestLite[],
): StudioModule[] {
  return manifests.map(manifestToStudioModule);
}

export const useStudioStore = create<StudioState>((set, get) => ({
  selectedModuleId: null,
  /**
   * Canonical SDK ids for core; custom `custom-*` ids pass through unchanged
   * via `toCanonicalModuleId` (unknown → identity).
   */
  setSelectedModuleId: (id) =>
    set({
      selectedModuleId: id === null ? null : toCanonicalModuleId(id),
    }),

  customModules: [],
  hydrateCustomModules: async () => {
    const cached = readCustomModulesFromStorage();
    if (cached.length > 0) {
      set({ customModules: liteToStudioModules(cached) });
    }

    try {
      const res = await fetch("/api/modules/register", { method: "GET" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        manifests?: unknown[];
      };
      if (!data.ok || !Array.isArray(data.manifests)) return;

      const manifests = data.manifests
        .map(normalizeApiManifest)
        .filter((m): m is CustomModuleManifestLite => m !== null);

      writeCustomModulesListToStorage(manifests);
      set({ customModules: liteToStudioModules(manifests) });
    } catch {
      // Keep localStorage mirror if API unreachable.
    }
  },
  appendCustomModule: (manifest) => {
    const tile = manifestToStudioModule(manifest);
    set((s) => {
      const without = s.customModules.filter((m) => m.id !== tile.id);
      return {
        customModules: [...without, tile],
        selectedModuleId: toCanonicalModuleId(tile.id),
      };
    });
  },

  topic: "",
  setTopic: (topic) => set({ topic }),
  applyPreset: (presetId) => {
    const preset = TOPIC_PRESETS.find((p) => p.id === presetId);
    if (preset) set({ topic: preset.topic });
  },

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  closeDrawer: () => set({ drawerOpen: false }),

  agentSteps: createPendingSteps(),
  progress: 0,
  drawerNotes: [],
  appendDrawerNote: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const steps = get().agentSteps;
    const target =
      steps.find((s) => s.state === "active") ??
      steps.find((s) => s.state === "done" && s.id !== "done") ??
      steps[0];
    if (!target) return;
    const id = `note-${Date.now().toString(36)}-${get().drawerNotes.length}`;
    set({
      drawerNotes: [
        ...get().drawerNotes,
        { id, stepId: target.id, text: trimmed },
      ],
    });
  },

  jobId: null,

  generateStatus: "idle",
  generateError: null,
  lastDraftId: null,
  lastDraft: null,
  lastAssets: null,
  lastRenderMock: null,

  applyJobStreamEvent: (event) => {
    set({
      agentSteps: stepsFromStreamEvent(event),
      progress: event.progress,
    });
  },

  startGenerate: () => {
    const moduleId = get().selectedModuleId;
    if (!moduleId) return;

    const topic = get().topic.trim() || DEFAULT_TOPIC;

    closeJobStreamConnection();

    set({
      drawerOpen: true,
      generateStatus: "running",
      generateError: null,
      lastDraftId: null,
      lastDraft: null,
      lastAssets: null,
      lastRenderMock: null,
      jobId: null,
      agentSteps: createPendingSteps(),
      progress: 0,
      drawerNotes: [],
    });

    void (async () => {
      try {
        const res = await fetch(
          `/api/modules/${encodeURIComponent(moduleId)}/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, render: true }),
          },
        );

        let data: {
          ok?: boolean;
          error?: string;
          jobId?: string;
          draft?: DraftOutput;
          render?: AssetRenderResult;
        } = {};
        try {
          data = (await res.json()) as typeof data;
        } catch {
          data = { ok: false, error: "invalid_json" };
        }

        if (!res.ok || !data.ok || !data.draft?.draftId) {
          const message = humanGenerateError(data.error);
          markPipelineError(set, message);
          set({
            generateStatus: "error",
            generateError: message,
            lastDraftId: null,
            lastDraft: null,
            lastAssets: null,
            lastRenderMock: null,
            jobId: null,
          });
          return;
        }

        const draft = data.draft;
        const render = data.render;
        const jobId =
          typeof data.jobId === "string" && data.jobId.startsWith("job_")
            ? data.jobId
            : null;

        set({
          jobId,
          lastDraftId: draft.draftId,
          lastDraft: draft,
          lastAssets: render?.assets ?? null,
          lastRenderMock:
            typeof render?.mock === "boolean" ? render.mock : null,
        });

        if (jobId) {
          // Register waiter before EventSource so sync replay of `completed` is caught.
          const terminalPromise =
            waitForStreamTerminal(SSE_COMPLETE_TIMEOUT_MS);

          streamClose = openJobStream(jobId, {
            onEvent: (event) => {
              get().applyJobStreamEvent(event);
              if (
                event.status === "completed" ||
                event.status === "failed"
              ) {
                streamTerminalResolve?.(event.status);
              }
            },
            onError: () => {
              // Soft fail — generate draft already succeeded; force done below.
              streamTerminalResolve?.("failed");
            },
          });

          const terminal = await terminalPromise;
          closeJobStreamConnection();

          if (terminal === "failed") {
            // Stream failed but draft exists — still surface success + force steps.
            markPipelineSuccess(set, draft.draftId);
          } else if (terminal === "timeout") {
            markPipelineSuccess(set, draft.draftId);
          } else if (get().progress < 100) {
            markPipelineSuccess(set, draft.draftId);
          }
        } else {
          // No jobId from API — force local completion (should not happen post C-23).
          markPipelineSuccess(set, draft.draftId);
        }

        set({
          generateStatus: "success",
          generateError: null,
          lastDraftId: draft.draftId,
          lastDraft: draft,
          lastAssets: render?.assets ?? null,
          lastRenderMock:
            typeof render?.mock === "boolean" ? render.mock : null,
        });
      } catch {
        const message = humanGenerateError("generate_failed");
        markPipelineError(set, message);
        set({
          generateStatus: "error",
          generateError: message,
          lastDraftId: null,
          lastDraft: null,
          lastAssets: null,
          lastRenderMock: null,
          jobId: null,
        });
      }
    })();
  },
}));
