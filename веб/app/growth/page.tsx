import { GrowthCenter } from "@/components/growth-center/GrowthCenter";
import { getGrowthCenterData } from "@/lib/growth-center/server";

export const metadata = { title: "Ситуационный центр · Vernatun" };

export default function GrowthPage() {
  return <GrowthCenter dataset={getGrowthCenterData()} />;
}
