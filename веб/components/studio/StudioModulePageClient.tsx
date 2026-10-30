"use client";

import dynamic from "next/dynamic";
import { RouteLoadingSkeleton } from "@/components/shell/RouteLoadingSkeleton";

const StudioModuleWorkspace = dynamic(
  () =>
    import("@/components/studio/StudioModuleWorkspace").then(
      (m) => m.StudioModuleWorkspace,
    ),
  { loading: () => <RouteLoadingSkeleton variant="studio" /> },
);

export function StudioModulePageClient({ moduleId }: { moduleId: string }) {
  return <StudioModuleWorkspace moduleId={moduleId} />;
}
