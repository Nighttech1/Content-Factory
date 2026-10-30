"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { meshTeamScreenTitle } from "@/components/mesh/CanvasTopBar";
import { useSessionStore } from "@/lib/session-store";

const ReleaseTeamFlowchart = dynamic(
  () =>
    import("@/components/mesh/v2/ReleaseTeamFlowchart").then(
      (m) => m.ReleaseTeamFlowchart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        data-testid="route-loading"
        className="h-[calc(100vh-2rem)] w-full animate-pulse rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]"
        aria-busy="true"
        aria-label="Загрузка команды выпуска"
      />
    ),
  },
);

/** C-136 route + C-138/C-139 / C-147 static flowchart (no ReactFlow). OWNER only. */
export default function StudioModuleMeshPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = typeof params?.moduleId === "string" ? params.moduleId : "";
  const role = useSessionStore((s) => s.role);
  const router = useRouter();
  const resolvedModule = moduleId || "carousel-engine";
  const screenTitle = meshTeamScreenTitle(resolvedModule);

  useEffect(() => {
    if (role === "ADMIN") {
      router.replace(
        moduleId
          ? `/studio/${encodeURIComponent(moduleId)}`
          : "/studio",
      );
    }
  }, [role, router, moduleId]);

  if (role === "ADMIN") {
    return (
      <p className="text-sm text-[var(--text-muted)]">Переход в Студию…</p>
    );
  }

  return (
    <div
      data-testid="studio-module-mesh"
      data-module-id={moduleId}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      <h1 className="sr-only">{screenTitle}</h1>
      <ReleaseTeamFlowchart moduleId={resolvedModule} />
    </div>
  );
}
