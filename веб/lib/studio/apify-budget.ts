/** All Studio Apify calls share this fail-closed, disk-backed gate. No secrets in state. */
import { mkdirSync, readFileSync, writeFileSync, renameSync, rmdirSync } from "node:fs";
import path from "node:path";

export const APIFY_ACCOUNT_LIMIT_USD = 5;
export const APIFY_RESERVATION_LIMIT_USD = 4.5;
export const APIFY_RUN_LIMIT_USD = 0.30;
export type BudgetState = { cycle: string; reservedCents: number; runs: number; lastReservedAt?: string };
export class ApifyBudgetError extends Error { constructor(public code: string) { super(code); } }
const fail = (code: string): never => { throw new ApifyBudgetError(code); };
export function apifyDataDir() { return path.join(process.cwd(), "data", "apify-budget"); }
export function atomicJson(file: string, data: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(data, null, 2), { mode: 0o600 });
  renameSync(temp, file);
}
export function budgetCanReserve(state: BudgetState, usageUsd: number, capUsd: number, cents = 30) {
  return Number.isFinite(usageUsd) && usageUsd >= 0 && Number.isFinite(capUsd) && capUsd > 0 && capUsd <= 5
    && Number.isInteger(state.reservedCents) && state.reservedCents >= 0 && Number.isInteger(cents) && cents > 0 && cents <= 30
    && state.reservedCents + cents <= 450 && Math.ceil(usageUsd * 100) + cents <= Math.floor(capUsd * 100) - 20;
}
async function providerJson(token: string, url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(330_000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers } });
  if (!response.ok) fail(`apify_http_${response.status}`);
  return response.json();
}
async function accountLimits(token: string) {
  const data = (await providerJson(token, "https://api.apify.com/v2/users/me/limits"))?.data;
  const cap = data?.limits?.maxMonthlyUsageUsd;
  const usage = data?.current?.monthlyUsageUsd;
  const jobs = data?.current?.activeActorJobCount;
  const cycle = data?.monthlyUsageCycle;
  if (typeof cap !== "number" || !Number.isFinite(cap) || cap <= 0 || typeof usage !== "number" || !Number.isFinite(usage) || usage < 0
    || typeof jobs !== "number" || jobs < 0 || !Number.isFinite(Date.parse(cycle?.startAt)) || !Number.isFinite(Date.parse(cycle?.endAt))) fail("apify_usage_unknown");
  if (Date.now() < Date.parse(cycle.startAt) || Date.now() > Date.parse(cycle.endAt)) fail("apify_cycle_unknown");
  return { cap, usage, jobs, cycle: String(cycle.startAt) };
}
/** Only the official PPE actor. An env URL must never send a token to another host. */
export async function budgetedApifyDataset(token: string, input: Record<string, unknown>, requestedUrl?: string): Promise<unknown[]> {
  const target = new URL(requestedUrl || "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items");
  if (target.origin !== "https://api.apify.com" || target.pathname !== "/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items" || target.username || target.password) fail("apify_actor_not_allowed");
  target.search = ""; // No inherited token/query/cost override.
  target.searchParams.set("timeout", "240"); target.searchParams.set("maxTotalChargeUsd", "0.30");
  target.searchParams.set("maxItems", "60");
  const dir = apifyDataDir(); mkdirSync(dir, { recursive: true });
  const lock = path.join(dir, "account.lock");
  try { mkdirSync(lock); } catch { return fail("apify_budget_locked"); }
  try {
    let limits = await accountLimits(token);
    // Owner requested $5/month. Only reduce this account setting, never raise a lower cap.
    if (limits.cap > 5) {
      await providerJson(token, "https://api.apify.com/v2/users/me/limits", { method: "PUT", body: JSON.stringify({ maxMonthlyUsageUsd: 5 }) });
      limits = await accountLimits(token);
    }
    if (limits.cap > 5) fail("apify_account_cap_unverified");
    if (limits.jobs !== 0) fail("apify_other_run_active");
    const ledgerPath = path.join(dir, "ledger.json");
    let state: BudgetState;
    try { state = JSON.parse(readFileSync(ledgerPath, "utf8")); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") fail("apify_ledger_invalid"); state = { cycle: limits.cycle, reservedCents: 0, runs: 0 }; }
    if (!state || typeof state.cycle !== "string" || !Number.isInteger(state.reservedCents) || state.reservedCents < 0 || !Number.isInteger(state.runs) || state.runs < 0) fail("apify_ledger_invalid");
    if (state.cycle !== limits.cycle) state = { cycle: limits.cycle, reservedCents: 0, runs: 0 };
    if (!budgetCanReserve(state, limits.usage, limits.cap)) fail("apify_monthly_budget_exhausted");
    // Reserve BEFORE paid call. Timeout/crash/error never refunds this upper bound.
    atomicJson(ledgerPath, { ...state, reservedCents: state.reservedCents + 30, runs: state.runs + 1, lastReservedAt: new Date().toISOString() });
    const data = await providerJson(token, target.toString(), { method: "POST", body: JSON.stringify(input) });
    if (!Array.isArray(data) || data.length > 60) fail("apify_dataset_invalid");
    return data;
  } finally { rmdirSync(lock); }
}
export function readBudgetSummary() {
  try { const s = JSON.parse(readFileSync(path.join(apifyDataDir(), "ledger.json"), "utf8")) as BudgetState;
    return { cycle: s.cycle, reservedUsd: s.reservedCents / 100, accountLimitUsd: 5, applicationLimitUsd: 4.5, perRunLimitUsd: .3 }; }
  catch { return { reservedUsd: 0, accountLimitUsd: 5, applicationLimitUsd: 4.5, perRunLimitUsd: .3 }; }
}
