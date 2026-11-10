/** Disposable production-browser history fixture, never an application API clock override. */
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createWorkspaceStore} from '../lib/growth-center/workspace-store';
import {emptyCounts,moscowWeekKey} from '../lib/growth-center/workspace-model';
async function main(){
 const directory=process.env.GROWTH_WORKSPACE_DATA_DIR;if(!directory||!path.isAbsolute(directory))throw Error('Explicit temporary QA storage required');
 const resolved=path.resolve(directory),roots=[os.tmpdir(),process.env.RUNNER_TEMP].filter((v):v is string=>Boolean(v)).map(p=>path.resolve(p));
 if(!roots.some(root=>resolved.startsWith(root+path.sep)))throw Error('QA seed refuses non-temporary storage');
 await fs.mkdir(directory,{recursive:true,mode:0o700});
 const real=await fs.realpath(directory);if(!roots.some(root=>real.startsWith(root+path.sep)))throw Error('QA seed refuses storage symlink escape');
 try{await fs.access(path.join(directory,'state.json'));throw Error('QA seed refuses existing workspace state')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
 const current=new Date(),key=moscowWeekKey(current),monday=Date.parse(key+'T09:00:00Z');let now=new Date(monday-21*86400000);
 const store=createWorkspaceStore({directory,now:()=>now});
 await store.mutate({type:'save_counts',expectedRevision:0,requestId:'qa-history-week-one',counts:{...emptyCounts(),awareness:12,desire:4,registration:2,attendance:1,return:0},source:'Изолированная QA fixture: не показатели клуба'});
 now=new Date(monday-14*86400000);const revision=(await store.read()).revision;
 await store.mutate({type:'save_counts',expectedRevision:revision,requestId:'qa-history-week-two',counts:{...emptyCounts(),awareness:18,desire:9,registration:4,attendance:3,return:1},source:'Изолированная QA fixture: не показатели клуба'});
 const firstWeek=moscowWeekKey(new Date(monday-21*86400000));
 await store.mutate({type:'correct_snapshot',expectedRevision:(await store.read()).revision,requestId:'qa-history-correction',weekKey:firstWeek,counts:{...emptyCounts(),awareness:10,desire:4,registration:2,attendance:1,return:0},source:'Изолированная QA fixture: исправление, не данные клуба',reason:'QA проверяет видимый маркер immutable correction'});
 now=current;const state=await store.sealDueWeeks();
 if(state.cards.length!==24||state.snapshots.length<3)throw Error('Incomplete isolated history fixture');
 console.log('PASS isolated workspace QA history seed: known weeks and null gap; no Git/network calls');
}
main().catch(error=>{console.error(error instanceof Error?error.message:'QA seed failed');process.exitCode=1});
