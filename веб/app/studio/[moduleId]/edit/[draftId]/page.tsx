import { notFound } from "next/navigation";
import { CapCutEditorShell } from "@/components/studio/editor/CapCutEditorShell";
import { isReservedStudioSegment } from "@/components/studio/modules";
import { isCapCutModule } from "@/lib/studio/capcut-gate";

type EditorPageProps = {
  params: Promise<{ moduleId: string; draftId: string }>;
};

/**
 * C-31 — CapCut route hard gate.
 * Only cartoon-reels / heygen-reels render the shell; others → 404.
 */
export default async function CapCutEditorPage({ params }: EditorPageProps) {
  const { moduleId, draftId } = await params;

  if (!moduleId || isReservedStudioSegment(moduleId)) {
    notFound();
  }

  if (!isCapCutModule(moduleId)) {
    notFound();
  }

  if (!draftId) {
    notFound();
  }

  return <CapCutEditorShell moduleId={moduleId} draftId={draftId} />;
}
