import { mkdirSync, readFileSync, rmdirSync } from "node:fs";
import path from "node:path";
import { atomicJson, ApifyBudgetError, budgetedApifyDataset, readBudgetSummary } from "./apify-budget";
import { readApifyToken } from "./ig-scraper-config";
import { mapApifyDatasetToFeedPosts, type ApifyIgItem } from "./ig-apify-scraper";
import { readScoutSnapshot, writeScoutSnapshot } from "./scout-snapshot-store";
import { REELS_CADENCE_MS, REELS_TAG_SETS, isPublishedReel, rankReels } from "./reels-discovery";

type DiscoveryState = { lastAttemptAt?: string; lastSuccessAt?: string; nextRunAt?: string; sequence: number; error?: string; status: "waiting" | "running" | "ready" | "blocked" | "empty" };
function statePath() { return path.join(process.cwd(), "data", "scout-snapshots", "reels-schedule.json"); }
export function readReelsState(): DiscoveryState {
  try {
    const s=JSON.parse(readFileSync(statePath(),"utf8")) as DiscoveryState;
    if (!s || !Number.isInteger(s.sequence) || s.sequence < 0 || !["waiting","running","ready","blocked","empty"].includes(s.status)) throw Error();
    return s;
  } catch(e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { sequence:0, status:"waiting" };
    // Corrupted state must not reset cadence into a fresh paid request.
    return { sequence:0, status:"blocked", error:"schedule_state_invalid", nextRunAt:"9999-01-01T00:00:00Z" };
  }
}
export function reelsDiscoveryStatus() {
  const state = readReelsState();
  return { ...state, configured: Boolean(readApifyToken()), cadenceHours:72, budget:readBudgetSummary(),
    updatedAt:readScoutSnapshot("custom-reels")?.updatedAt ?? null,
    count:readScoutSnapshot("custom-reels")?.competitors.length ?? 0 };
}
/** Called only by server scheduler or authenticated owner; never by feed GET. */
export async function runReelsDiscovery(now = Date.now()) {
  const dir=path.dirname(statePath()); mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,"reels-schedule.lock");
  try { mkdirSync(lock); } catch { return { ok:false, error:"apify_budget_locked" }; }
  try {
    const state=readReelsState();
    if (state.nextRunAt && Date.parse(state.nextRunAt)>now) return { ok:false, error:"not_due", ...reelsDiscoveryStatus() };
    const token=readApifyToken();
    if (!token) {
      atomicJson(statePath(),{...state,status:"blocked",error:"scraper_not_configured",nextRunAt:new Date(now+3600000).toISOString()});
      return {ok:false,error:"scraper_not_configured"};
    }
    const tags=REELS_TAG_SETS[state.sequence%REELS_TAG_SETS.length];
    // Persist cadence before paid request; a failed/ambiguous call is never retried automatically inside the 72h period.
    const next:DiscoveryState={...state,sequence:state.sequence+1,lastAttemptAt:new Date(now).toISOString(),nextRunAt:new Date(now+REELS_CADENCE_MS).toISOString(),status:"running",error:undefined};
    atomicJson(statePath(),next);
    try {
      const data=await budgetedApifyDataset(token,{
        directUrls:["https://www.instagram.com/mosarmclub/",...tags.map(t=>`https://www.instagram.com/explore/tags/${encodeURIComponent(t)}/`)],
        resultsType:"reels",resultsLimit:12,onlyPostsNewerThan:"30 days",addParentData:true,
      });
      const posts=mapApifyDatasetToFeedPosts(data as ApifyIgItem[]).filter(isPublishedReel);
      const ours=posts.filter(p=>p.username?.toLowerCase()==="mosarmclub").map(p=>({...p,source:"ours" as const}));
      const prior=readScoutSnapshot("custom-reels")?.competitors ?? [];
      const ranked=rankReels([...prior,...posts],now);
      // Preserve last-good own posts if actor returned none, never fill with drafts/fixtures.
      if (ours.length) writeScoutSnapshot("custom-reels-ours",ours,"mosarmclub");
      if (ranked.length) writeScoutSnapshot("custom-reels",ranked,"Армянский язык, юмор, культура и диаспора");
      atomicJson(statePath(),{...next,status:ranked.length?"ready":"empty",lastSuccessAt:new Date(now).toISOString(),error:ranked.length?undefined:"apify_empty"});
      return {ok:true,...reelsDiscoveryStatus()};
    } catch(e) {
      const code=e instanceof ApifyBudgetError?e.code:"apify_failed";
      atomicJson(statePath(),{...next,status:"blocked",error:code});
      return {ok:false,error:code};
    }
  } finally { rmdirSync(lock); }
}
let timer:ReturnType<typeof setInterval>|undefined;
export function startReelsScheduler() {
  if(timer || process.env.NODE_ENV!=="production" || process.env.REELS_SCOUT_ENABLED==="0") return;
  const tick=()=>{void runReelsDiscovery().catch(()=>{/* Read-only status exposes persisted failure. No retry loop. */});};
  // A regular timer remains valid while standalone runs; cadence and budget survive restarts.
  timer=setInterval(tick,3600000);timer.unref();tick();
}
