import { NextResponse } from "next/server";
import { getGrowthCenterData } from "@/lib/growth-center/server";

export const dynamic = "force-dynamic";
export function GET() {
  try {
    return NextResponse.json(getGrowthCenterData(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "growth_dataset_invalid", message: "Данные центра роста требуют проверки." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
