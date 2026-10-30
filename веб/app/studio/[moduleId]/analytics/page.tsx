import { AnalyticsPageClient } from "@/components/analytics/AnalyticsPageClient";

type StudioModuleAnalyticsPageProps = {
  params: Promise<{ moduleId: string }>;
};

/** C-136 — nested analytics under module; reuses AnalyticsShell. */
export default async function StudioModuleAnalyticsPage({
  params,
}: StudioModuleAnalyticsPageProps) {
  const { moduleId } = await params;

  return (
    <div data-testid="studio-module-analytics" data-module-id={moduleId}>
      <AnalyticsPageClient moduleId={moduleId} />
    </div>
  );
}
