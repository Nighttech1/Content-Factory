/**
 * Research by primary sources — OFF by default (ТЗ §10 / этап 7).
 */

import { getGlobalSettings } from "../store";

export type ResearchFact = {
  claim: string;
  sourceUrl?: string;
  verified: boolean;
  note?: string;
};

export async function runResearchIfEnabled(opts: {
  topic: string;
  claims: string[];
}): Promise<{
  enabled: boolean;
  facts: ResearchFact[];
  skippedReason?: string;
}> {
  const settings = getGlobalSettings();
  if (!settings.researchMode) {
    return {
      enabled: false,
      facts: [],
      skippedReason: "research_mode_off",
    };
  }

  // Placeholder: do not invent sources. Real fetch via allowlisted APIs later.
  const facts: ResearchFact[] = opts.claims.map((claim) => ({
    claim,
    verified: false,
    note: "unverified_pending_source_check",
  }));

  return { enabled: true, facts };
}
