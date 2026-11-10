"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceCommand, WorkspaceView } from "@/lib/growth-center/workspace-model";

type CommandInput = WorkspaceCommand extends infer C ? C extends WorkspaceCommand ? Omit<C, "requestId" | "expectedRevision"> & { expectedRevision?: number } : never : never;
const ENDPOINT = "/api/growth-workspace";

export function useGrowthWorkspace() {
  const [view, setView] = useState<WorkspaceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const readSequence = useRef(0);
  const invalidateReads = useCallback(() => { readSequence.current++; }, []);
  const unconfirmed = useRef<{ intent: string; command: WorkspaceCommand } | null>(null);

  const apply = useCallback((next: WorkspaceView) => {
    setView((previous) => !previous || next.revision >= previous.revision ? next : previous);
  }, []);

  const refresh = useCallback(async () => {
    const sequence = ++readSequence.current;
    const response = await fetch(ENDPOINT, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("Не удалось загрузить общие данные. Попробуй ещё раз.");
    const next = await response.json() as WorkspaceView;
    if (sequence === readSequence.current) apply(next);
    return next;
  }, [apply]);

  useEffect(() => {
    let alive = true;
    refresh().catch((failure: Error) => { if (alive) setError(failure.message); }).finally(() => { if (alive) setLoading(false); });
    const update = () => { if (!inFlight.current && document.visibilityState === "visible") void refresh().catch(() => {}); };
    const interval = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => { alive = false; invalidateReads(); window.clearInterval(interval); window.removeEventListener("focus", update); };
  }, [refresh, invalidateReads]);

  const run = useCallback(async (input: CommandInput): Promise<WorkspaceView | null> => {
    if (inFlight.current || !view) return null;
    if (!view.capabilities.writeEnabled || !view.capabilities.csrfToken) {
      setError("Для изменения данных нужен доступ владельца.");
      return null;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const intent = JSON.stringify(input);
    const command = unconfirmed.current?.intent === intent
      ? unconfirmed.current.command
      : { ...input, expectedRevision: input.expectedRevision ?? view.revision, requestId: crypto.randomUUID() } as WorkspaceCommand;
    unconfirmed.current = { intent, command };
    let receivedResponse = false;
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Growth-CSRF": view.capabilities.csrfToken },
        body: JSON.stringify(command),
      });
      receivedResponse = true;
      if (response.status === 409) {
        unconfirmed.current = null;
        await refresh();
        throw new Error("Данные уже изменились на другом устройстве. Загружена актуальная версия; проверь её и повтори изменение.");
      }
      if (!response.ok) {
        if (response.status < 500) unconfirmed.current = null;
        const failure = await response.json().catch(() => null) as { message?: string } | null;
        await refresh().catch(() => null);
        throw new Error(failure?.message || "Сохранение не подтверждено. При повторе этого действия используем тот же запрос.");
      }
      const next = await response.json() as WorkspaceView;
      unconfirmed.current = null;
      ++readSequence.current;
      apply(next);
      return next;
    } catch (failure) {
      if (!receivedResponse || unconfirmed.current !== null) {
        const current = await refresh().catch(() => null);
        setError(`Ответ о сохранении не получен. ${current ? "Показана актуальная серверная версия." : "Не удалось проверить общую версию."} Повтор этого действия отправит тот же запрос.`);
      } else setError(failure instanceof Error ? failure.message : "Не удалось подтвердить сохранение.");
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [view, apply, refresh]);

  const unlock = useCallback(async (secret: string) => {
    const response = await fetch(ENDPOINT + "/session", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret }) });
    if (!response.ok) {
      const failure = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(failure?.message || "Доступ не открыт. Проверь код владельца.");
    }
    const next = await refresh();
    setError(null);
    return next;
  }, [refresh]);

  const lock = useCallback(async () => {
    if (!view?.capabilities.csrfToken) return;
    try {
      const response = await fetch(ENDPOINT + "/session", { method: "DELETE", credentials: "same-origin", headers: { "X-Growth-CSRF": view.capabilities.csrfToken } });
      if (!response.ok) { setError("Не удалось закрыть доступ. Попробуй ещё раз."); return; }
      await refresh();
    } catch { setError("Обнови страницу, чтобы проверить состояние доступа."); }
  }, [view, refresh]);

  return { view, loading, busy, error, refresh, run, unlock, lock, clearError: () => setError(null) };
}
