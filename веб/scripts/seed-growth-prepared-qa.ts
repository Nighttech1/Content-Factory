/** Isolated, explicitly synthetic prepared-catalog fixture; never a production import. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createWorkspaceStore,workspaceView} from '../lib/growth-center/workspace-store';
import {syntheticPreparedCatalog} from './fixtures/prepared-catalog-fixture';
async function main(){
 const directory=process.env.GROWTH_WORKSPACE_DATA_DIR;
 if(!directory||!path.isAbsolute(directory))throw Error('Explicit temporary storage required');
 const real=await fs.realpath(directory),roots=await Promise.all([os.tmpdir(),process.env.RUNNER_TEMP].filter((s):s is string=>!!s).map(s=>fs.realpath(s)));
 if(!roots.some(root=>real.startsWith(root+path.sep)))throw Error('Prepared QA seed refuses non-temporary storage');
 try{await fs.access(path.join(directory,'prepared','state.json'));throw Error('Prepared seed refuses existing metadata')}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
 const before=await createWorkspaceStore({directory}).read();
 const representatives=[...new Map(before.cards.map(card=>[card.format,card])).values()];
 const selected=[...new Map([...representatives,...before.cards.slice(0,3)].map(card=>[card.id,{...card,stageIds:['awareness','desire'] as typeof card.stageIds}])).values()];
 const state=await createWorkspaceStore({directory,catalog:syntheticPreparedCatalog(selected)}).read();
 const view=workspaceView(state,{authConfigured:false,authenticated:false,writeEnabled:false,gitConfigured:false,schedulerEnabled:false,csrfToken:null});
 if(state.cards.length!==24||view.activeCardIds.length!==selected.length||view.archivedCardCount!==24-selected.length)throw Error('Prepared QA reconciliation incomplete');
 console.log(`PASS isolated synthetic prepared fixture: ${selected.length} active units; all24 IDs preserved; no research/network`);
}
main().catch(e=>{console.error(e instanceof Error?e.message:'Prepared fixture failed');process.exitCode=1});
