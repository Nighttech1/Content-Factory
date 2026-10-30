"use client";

import dynamic from "next/dynamic";
import { RouteLoadingSkeleton } from "@/components/shell/RouteLoadingSkeleton";

const ScheduleShell = dynamic(
  () =>
    import("@/components/schedule/ScheduleShell").then((m) => m.ScheduleShell),
  { loading: () => <RouteLoadingSkeleton variant="schedule" /> },
);

export function SchedulePageClient() {
  return <ScheduleShell />;
}
