import { notFound } from "next/navigation";
import { isReservedStudioSegment } from "@/components/studio/modules";
import { StudioModulePageClient } from "@/components/studio/StudioModulePageClient";

type StudioModulePageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function StudioModulePage({
  params,
}: StudioModulePageProps) {
  const { moduleId } = await params;

  if (!moduleId || isReservedStudioSegment(moduleId)) {
    notFound();
  }

  return <StudioModulePageClient moduleId={moduleId} />;
}
