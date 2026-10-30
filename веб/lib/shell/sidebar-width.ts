"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** C-60 — sidebar tree width (client-only UX). No secrets. */
export const SIDEBAR_WIDTH_STORAGE_KEY = "cf.sidebar.width";
export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 360;
/** Architect canonical var; `--sidebar-width` is set as an alias. */
export const SIDEBAR_WIDTH_CSS_VAR = "--cf-sidebar-width";
export const SIDEBAR_WIDTH_CSS_VAR_ALIAS = "--sidebar-width";

const PERSIST_DEBOUNCE_MS = 150;

function parseWidthNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  return Number.NaN;
}

/** Live drag: NaN → 256; otherwise snap into [200, 360]. */
export function clampSidebarWidth(value: unknown): number {
  const n = parseWidthNumber(value);
  if (!Number.isFinite(n)) return DEFAULT_SIDEBAR_WIDTH;
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(n)));
}

/** Storage read: missing / NaN / outside clamp → default 256 (not snap). */
export function readSidebarWidthFromStorage(): number {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (raw == null || raw === "") return DEFAULT_SIDEBAR_WIDTH;
    const n = parseWidthNumber(raw);
    if (!Number.isFinite(n)) return DEFAULT_SIDEBAR_WIDTH;
    const rounded = Math.round(n);
    if (rounded < MIN_SIDEBAR_WIDTH || rounded > MAX_SIDEBAR_WIDTH) {
      return DEFAULT_SIDEBAR_WIDTH;
    }
    return rounded;
  } catch {
    return DEFAULT_SIDEBAR_WIDTH;
  }
}

export function writeSidebarWidthToStorage(n: number): void {
  if (typeof window === "undefined") return;
  const next = clampSidebarWidth(n);
  try {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(next));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function applySidebarWidthCssVar(px: number): void {
  if (typeof document === "undefined") return;
  const value = `${clampSidebarWidth(px)}px`;
  document.documentElement.style.setProperty(SIDEBAR_WIDTH_CSS_VAR, value);
  document.documentElement.style.setProperty(SIDEBAR_WIDTH_CSS_VAR_ALIAS, value);
}

/**
 * One source of truth for aside width + AppShell pad.
 * First paint = 256 (no hydration mismatch); storage applied after mount.
 */
export function useSidebarWidth() {
  const [widthPx, setWidthState] = useState(DEFAULT_SIDEBAR_WIDTH);
  const widthRef = useRef(widthPx);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = readSidebarWidthFromStorage();
    widthRef.current = stored;
    setWidthState(stored);
    applySidebarWidthCssVar(stored);
  }, []);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const setWidthPx = useCallback(
    (next: number, options?: { persist?: boolean; debouncePersist?: boolean }) => {
      const clamped = clampSidebarWidth(next);
      widthRef.current = clamped;
      setWidthState(clamped);
      applySidebarWidthCssVar(clamped);

      if (!options?.persist && !options?.debouncePersist) return;

      if (options.debouncePersist) {
        clearDebounce();
        debounceRef.current = setTimeout(() => {
          writeSidebarWidthToStorage(widthRef.current);
          debounceRef.current = null;
        }, PERSIST_DEBOUNCE_MS);
        return;
      }

      clearDebounce();
      writeSidebarWidthToStorage(clamped);
    },
    [clearDebounce],
  );

  const commitWidth = useCallback(() => {
    clearDebounce();
    writeSidebarWidthToStorage(widthRef.current);
  }, [clearDebounce]);

  useEffect(() => () => clearDebounce(), [clearDebounce]);

  return { widthPx, setWidthPx, commitWidth };
}
