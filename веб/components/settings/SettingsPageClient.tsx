"use client";

import dynamic from "next/dynamic";
import { RouteLoadingSkeleton } from "@/components/shell/RouteLoadingSkeleton";

const SettingsShell = dynamic(
  () =>
    import("@/components/settings/SettingsShell").then((m) => m.SettingsShell),
  { loading: () => <RouteLoadingSkeleton variant="settings" /> },
);

export function SettingsPageClient() {
  return <SettingsShell />;
}
