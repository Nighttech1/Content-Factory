/**
 * Smoke: Sheet preflight (no secrets). Run: npx tsx scripts/smoke-sheet-preflight.ts
 */

import { runSheetPreflight } from "../lib/intake/sheet-client";

async function main() {
  const r = await runSheetPreflight();
  // eslint-disable-next-line no-console -- smoke
  console.log(
    JSON.stringify(
      {
        ok: r.ok,
        sheetId: r.sheetId,
        sheetUrl: r.sheetUrl,
        writeEnabled: r.writeEnabled,
        writeSkippedReason: r.writeSkippedReason,
        tabs: r.tabs.map((t) => ({
          mode: t.mode,
          ok: t.ok,
          headers: t.headers,
          sampleTopic: t.sampleTopic,
          rowCount: t.rowCount,
          pickableCount: t.pickableCount,
          sampleRow: t.sampleRow,
          error: t.error,
        })),
      },
      null,
      2,
    ),
  );
  if (!r.ok) process.exitCode = 1;
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error(err);
  process.exitCode = 1;
});
