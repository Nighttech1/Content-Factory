import type { DraftOutput } from "@/types/module";

/** Process-local draft cache for regenerateElement without Prisma (C-20 mock). */
const drafts = new Map<string, DraftOutput>();

export function storeDraft(draft: DraftOutput): void {
  drafts.set(draft.draftId, structuredClone(draft));
}

export function getStoredDraft(draftId: string): DraftOutput | undefined {
  const d = drafts.get(draftId);
  return d ? structuredClone(d) : undefined;
}

export function updateStoredElement(
  draftId: string,
  elementIndex: number,
  payload: unknown,
): DraftOutput | undefined {
  const draft = drafts.get(draftId);
  if (!draft) return undefined;
  const el = draft.elements.find((e) => e.index === elementIndex);
  if (!el) return undefined;
  el.payload = payload;
  drafts.set(draftId, draft);
  return structuredClone(draft);
}

export function newDraftId(moduleId: string): string {
  return `${moduleId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
