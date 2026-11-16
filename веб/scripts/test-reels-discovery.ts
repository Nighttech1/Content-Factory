import assert from "node:assert/strict";
import { mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync } from "node:fs";
import os from "node:os";import path from "node:path";
import {budgetCanReserve,budgetedApifyDataset,apifyDataDir} from "../lib/studio/apify-budget";
import {rankReels,reelHandoff,REELS_CADENCE_MS,isPublishedReel} from "../lib/studio/reels-discovery";
import {runReelsDiscovery,readReelsState} from "../lib/studio/reels-scheduler";
import {resolveStudioFeed} from "../lib/studio/ig-live-feed";
import {bootstrapFeed} from "../lib/studio/feed-client-cache";
import {mapApifyItemToFeedPost} from "../lib/studio/ig-apify-scraper";
import {writeScoutSnapshot} from "../lib/studio/scout-snapshot-store";
import {POST as scoutPost} from "../app/api/studio/[moduleId]/scout/run/route";
import type {FeedPost} from "../lib/studio/feed-types";
const realCwd=process.cwd(),root=mkdtempSync(path.join(os.tmpdir(),"reels-guard-")),originalFetch=global.fetch,env={...process.env};let checks=0;
const ok=(value:unknown)=>{assert.ok(value);checks++;};const now=Date.now(),cycle=new Date(now-86400000).toISOString(),end=new Date(now+28*86400000).toISOString();
const base:FeedPost={id:"one",externalId:"one",source:"competitor",sourceMode:"live",username:"armenian.creator",title:"Armenian language comedy",caption:"Армянский язык",mediaType:"VIDEO",permalink:"https://www.instagram.com/reel/one/",postedAt:new Date(now-86400000).toISOString(),metrics:{views:100000,likes:1000,comments:10}};
function reset(name:string){const dir=path.join(root,name);mkdirSync(dir);process.chdir(dir);}
async function main(){try{
 ok(budgetCanReserve({cycle,reservedCents:0,runs:0},0,5));for(const [reserved,usage,cap] of [[450,0,5],[421,0,5],[0,4.8,5],[0,NaN,5],[0,0,50],[0,0,0]])ok(!budgetCanReserve({cycle,reservedCents:reserved,runs:0},usage,cap));ok(!budgetCanReserve({cycle,reservedCents:0,runs:0},0,5,31));
 const peers=[10000,12000,8000].map((views,i)=>({...base,id:`p${i}`,externalId:`p${i}`,permalink:`https://www.instagram.com/reel/p${i}/`,metrics:{views,likes:100}}));
 const ranked=rankReels([base,...peers,{...base,id:"old",externalId:"old",postedAt:new Date(now-31*86400000).toISOString()},{...base,id:"our",externalId:"our",username:"mosarmclub"},{...base,id:"stock",externalId:"stock",title:"Cats",caption:"Cats",username:"cats"},{...base,id:"carousel",externalId:"carousel",mediaType:"CAROUSEL_ALBUM"}],now);
 ok(ranked[0].id==="one"&&ranked[0].discovery?.outlier===10);ok(!ranked.some(p=>["old","our","stock","carousel"].includes(p.id)));ok(rankReels([base],now)[0].discovery?.outlier===null);ok(rankReels([{...base,postedAt:undefined}],now).length===0);ok(rankReels([base,{...base}],now).length===1);ok(!isPublishedReel({...base,mediaType:"CAROUSEL_ALBUM"}));ok(reelHandoff(ranked[0]).includes("НЕ проверены"));
 let calls:string[]=[],cap=50,active=0,usage=0,shouldFail=false;
 global.fetch=async(input,init)=>{const url=String(input);calls.push(`${init?.method||"GET"} ${url}`);if(url.endsWith("/limits")){if(init?.method==="PUT"){cap=JSON.parse(String(init.body)).maxMonthlyUsageUsd;return Response.json({});}return Response.json({data:{limits:{maxMonthlyUsageUsd:cap},current:{monthlyUsageUsd:usage,activeActorJobCount:active},monthlyUsageCycle:{startAt:cycle,endAt:end}}});}if(url.includes("run-sync")){const p=new URL(url);ok(p.searchParams.get("maxTotalChargeUsd")==="0.30");ok(p.searchParams.get("maxItems")==="60");if(shouldFail)throw Error("network");return Response.json([]);}throw Error("unexpected network");};
 reset("cap");await budgetedApifyDataset("test-only",{});ok(cap===5&&calls.some(c=>c.startsWith("PUT")));ok(JSON.parse(readFileSync(path.join(apifyDataDir(),"ledger.json"),"utf8")).reservedCents===30);
 calls=[];await assert.rejects(()=>budgetedApifyDataset("test-only",{},"https://evil.invalid/acts/x"));ok(calls.length===0);
 reset("busy");active=1;calls=[];await assert.rejects(()=>budgetedApifyDataset("test-only",{}));ok(!calls.some(c=>c.includes("run-sync")));active=0;
 reset("usage");usage=4.8;calls=[];await assert.rejects(()=>budgetedApifyDataset("test-only",{}));ok(!calls.some(c=>c.includes("run-sync")));usage=0;
 reset("exhausted");mkdirSync(apifyDataDir(),{recursive:true});writeFileSync(path.join(apifyDataDir(),"ledger.json"),JSON.stringify({cycle,reservedCents:450,runs:15}));calls=[];await assert.rejects(()=>budgetedApifyDataset("test-only",{}));ok(!calls.some(c=>c.includes("run-sync")));
 reset("timeout");shouldFail=true;await assert.rejects(()=>budgetedApifyDataset("test-only",{}));ok(JSON.parse(readFileSync(path.join(apifyDataDir(),"ledger.json"),"utf8")).reservedCents===30);shouldFail=false;
 reset("lock");mkdirSync(path.join(apifyDataDir(),"account.lock"),{recursive:true});calls=[];await assert.rejects(()=>budgetedApifyDataset("test-only",{}));ok(calls.length===0);
 reset("cycle");mkdirSync(apifyDataDir(),{recursive:true});writeFileSync(path.join(apifyDataDir(),"ledger.json"),JSON.stringify({cycle:"2020-01-01",reservedCents:450,runs:15}));await budgetedApifyDataset("test-only",{});ok(JSON.parse(readFileSync(path.join(apifyDataDir(),"ledger.json"),"utf8")).reservedCents===30);
 reset("scheduler");process.env.APIFY_TOKEN="test-only";delete process.env.IG_SCRAPER_API_KEY;delete process.env.APIFY_API_KEY;calls=[];await runReelsDiscovery(now);const first=calls.filter(c=>c.includes("run-sync")).length;await runReelsDiscovery(now+3600000);ok(first===1&&calls.filter(c=>c.includes("run-sync")).length===1);ok(Date.parse(readReelsState().nextRunAt!)-now===REELS_CADENCE_MS);
 writeScoutSnapshot("custom-reels",[base,{...base,id:"bad",mediaType:"CAROUSEL_ALBUM"}]);writeScoutSnapshot("custom-reels-ours",[{...base,source:"ours",username:"mosarmclub"},{...base,source:"ours",username:"other"}]);calls=[];
 for(const module of ["custom-reels","cartoon-reels","heygen-reels"]){const f=await resolveStudioFeed(module);ok(f?.competitors.length===1&&f.ours.length===1);ok(bootstrapFeed(module).ours.length===0);}ok(calls.length===0);
 const unauthorized=await scoutPost(new Request("http://localhost/api/studio/custom-reels/scout/run",{method:"POST"}),{params:Promise.resolve({moduleId:"custom-reels"})});ok(unauthorized.status===401);
 const mapped=mapApifyItemToFeedPost({id:"mapped",type:"Video",url:base.permalink,timestamp:base.postedAt,caption:"Հայերեն",videoViewCount:10000,ownerUsername:"armenian"});ok(mapped?.postedAt===base.postedAt&&mapped?.caption==="Հայերեն");console.log(`PASS ${checks} reels/budget/feed guards; zero real provider requests`);
 }finally{process.chdir(realCwd);global.fetch=originalFetch;process.env=env;rmSync(root,{recursive:true,force:true});}}
void main();
