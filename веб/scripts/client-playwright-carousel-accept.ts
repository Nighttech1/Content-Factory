/**
 * Клиент: Playwright-приёмка всех Vernatun-каруселей (A+B) без участия пользователя.
 * Usage: tsx scripts/client-playwright-carousel-accept.ts
 * Env: CLIENT_ACCEPT_BASE_URL=http://127.0.0.1:3000  CLIENT_ACCEPT_MAX_JOBS=8
 */

import { runClientPlaywrightAccept } from "../lib/studio/vernatun-carousel/client-playwright-accept";

async function main() {
  const maxJobs = Number(process.env.CLIENT_ACCEPT_MAX_JOBS ?? 12) || 12;
  const baseUrl =
    process.env.CLIENT_ACCEPT_BASE_URL?.trim() || "http://127.0.0.1:3000";

  console.log(`[Клиент] Playwright приёмка @ ${baseUrl}, maxJobs=${maxJobs}`);
  const report = await runClientPlaywrightAccept({ baseUrl, maxJobs });
  console.log(`[Клиент] Вердикт: ${report.verdict}`);
  console.log(report.summary);
  if (report.verdict === "НЕ ПРИНЯТО") process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
