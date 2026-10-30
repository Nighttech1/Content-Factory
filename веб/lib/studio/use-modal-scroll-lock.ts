"use client";

import { useEffect, type WheelEvent } from "react";

/**
 * C-razbor-create-modal-s47 — lock document scroll while modal is open
 * so wheel/touch/screenshot target the dialog, not the studio feed behind it.
 */
export function useModalScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [open]);
}

/** Stop wheel from bubbling to the feed behind a fixed modal. */
export function stopModalWheel(e: WheelEvent) {
  e.stopPropagation();
}
