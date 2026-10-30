"use client";

import dynamic from "next/dynamic";
import { RouteLoadingSkeleton } from "@/components/shell/RouteLoadingSkeleton";

const AnalyticsShell = dynamic(
  () =>
    import("@/components/analytics/AnalyticsShell").then(
      (m) => m.AnalyticsShell,
    ),
  { loading: () => <RouteLoadingSkeleton variant="analytics" /> },
);

type AnalyticsPageClientProps = {
  /** C-136 — scope shell to studio module. */
  moduleId?: string;
};

export function AnalyticsPageClient({ moduleId }: AnalyticsPageClientProps) {
  return <AnalyticsShell initialModuleId={moduleId} />;
}
