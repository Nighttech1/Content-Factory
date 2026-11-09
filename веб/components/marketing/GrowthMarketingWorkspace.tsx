"use client";

import { GrowthDashboard } from "./GrowthDashboard";
import { MarketingDirectorClient } from "./MarketingDirectorClient";

/** A new view of the existing director workspace; chat storage is unchanged. */
export function GrowthMarketingWorkspace() {
  return <GrowthDashboard chat={<MarketingDirectorClient />} />;
}
