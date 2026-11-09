import canonical from "@/data/growth/vernatun.json";
import { validateGrowthCenterDataset, type GrowthCenterDataset } from "./model";

/** Bundled shared plan/fact. No cwd lookup, localStorage or mutable write endpoint. */
export function getGrowthCenterData(): GrowthCenterDataset {
  const parsed = validateGrowthCenterDataset(canonical);
  if (!parsed.ok) throw new Error("Growth center dataset invalid: " + parsed.errors.join("; "));
  return parsed.data;
}
