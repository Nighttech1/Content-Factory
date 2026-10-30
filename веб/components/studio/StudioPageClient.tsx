"use client";

import dynamic from "next/dynamic";
import { RouteLoadingSkeleton } from "@/components/shell/RouteLoadingSkeleton";

const ModuleSelectorGrid = dynamic(
  () =>
    import("@/components/studio/ModuleSelectorGrid").then(
      (m) => m.ModuleSelectorGrid,
    ),
  { loading: () => <RouteLoadingSkeleton variant="studio" /> },
);

export function StudioPageClient() {
  return (
    <div className="relative flex flex-col gap-8 pb-4">
      <header className="flex flex-col gap-3">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="font-[family-name:var(--font-ui)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
            Студия
          </h1>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-muted)]">
            Здесь выбираете канал выпуска — карусели, рилсы, статьи на сайт или в
            Telegram — и открываете рабочее место модуля.
          </p>
        </div>
      </header>
      <ModuleSelectorGrid />
    </div>
  );
}
