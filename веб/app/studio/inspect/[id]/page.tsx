import { InspectorShell } from "@/components/inspect/InspectorShell";

type InspectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InspectPage({ params }: InspectPageProps) {
  const { id } = await params;
  return <InspectorShell draftId={id || "demo"} />;
}
