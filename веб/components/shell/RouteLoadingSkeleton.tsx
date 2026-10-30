/**
 * C-63 — segment `loading.tsx` glass skeleton (Dark Luxury).
 * Sidebar stays mounted above the segment; this fills main only.
 */

type RouteLoadingVariant =
  | "studio"
  | "schedule"
  | "analytics"
  | "brand-kit"
  | "settings"
  | "mesh";

type RouteLoadingSkeletonProps = {
  variant?: RouteLoadingVariant;
};

function PulseBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--bg-elevated)] ${className ?? ""}`}
    />
  );
}

function PulseCard({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] ${className ?? ""}`}
    />
  );
}

export function RouteLoadingSkeleton({
  variant = "studio",
}: RouteLoadingSkeletonProps) {
  return (
    <div
      data-testid="route-loading"
      className="flex w-full min-w-0 flex-col gap-6 pb-16"
      aria-busy="true"
      aria-label="Загрузка раздела"
    >
      <div className="flex flex-col gap-3">
        <PulseBar className="h-9 w-48 max-w-[60%]" />
        <PulseBar className="h-4 w-72 max-w-[80%]" />
      </div>

      {variant === "studio" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PulseCard key={i} className="min-h-[252px]" />
          ))}
        </div>
      ) : null}

      {variant === "schedule" ? (
        <div className="flex min-h-[28rem] flex-col gap-4 lg:flex-row">
          <PulseCard className="min-h-[28rem] w-full lg:w-[22rem] lg:shrink-0" />
          <PulseCard className="min-h-[28rem] min-w-0 flex-1" />
        </div>
      ) : null}

      {variant === "analytics" ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PulseCard key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <PulseCard className="min-h-72 xl:col-span-2" />
            <PulseCard className="min-h-72 xl:col-span-1" />
          </div>
        </>
      ) : null}

      {variant === "brand-kit" ? (
        <div className="flex flex-col gap-4">
          <PulseCard className="h-32" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <PulseCard key={i} className="h-20" />
            ))}
          </div>
        </div>
      ) : null}

      {variant === "settings" ? (
        <div className="flex max-w-2xl flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <PulseCard key={i} className="h-14" />
          ))}
        </div>
      ) : null}

      {variant === "mesh" ? (
        <PulseCard className="h-[calc(100vh-2rem)] w-full" />
      ) : null}
    </div>
  );
}
