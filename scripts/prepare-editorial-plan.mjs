/** Refresh the machine delivery and bundled bootstrap from the director-reviewed plan. No network/deploy. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root = process.cwd(), folder = 'projects/vernatun/content-plan/exports';
const file = path.join(root, folder, 'publication-plan-2026-v3.json');
let plan = JSON.parse(fs.readFileSync(file, 'utf8'));
const seq = process.argv.indexOf('--sequence');
if(seq !== -1){const value=Number(process.argv[seq+1]);if(!Number.isSafeInteger(value)||value<plan.sequence)throw Error('Sequence must not decrease');plan.sequence=value;}
// Editorial decisions remain human-authored. This checks that all active monthly table rows match the delivery.
const monthly = ['2026-11','2026-12'].map(month=>fs.readFileSync(path.join(root,'projects/vernatun/content-plan',month+'.md'),'utf8').split('<!-- PUBLICATION_V3_START -->')[1]?.split('<!-- PUBLICATION_V3_END -->')[0]||'').join('\n');
for(const unit of plan.units){
 const row=monthly.split('\n').find(line=>line.startsWith('|')&&line.includes(unit.id));
 if(!row||!row.includes(unit.date)||!row.includes(unit.title))throw Error('Monthly canon and JSON disagree: '+unit.id);
 if(!fs.existsSync(path.join(root,unit.brief_path)))throw Error('Missing brief '+unit.id);
}
fs.writeFileSync(file,JSON.stringify(plan,null,2)+'\n');
const render=spawnSync('python3',['scripts/render-editorial-report.py'],{stdio:'inherit'});if(render.status!==0)throw Error('HTML export failed');
plan=JSON.parse(fs.readFileSync(file,'utf8'));
plan.report_markdown=fs.readFileSync(path.join(root,folder,'vernatun_publication_plan_2026.md'),'utf8');
// Stable ordering digest is an integrity signal, never a substitute for editorial/owner approval.
const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
const {createHash}=await import('node:crypto');plan.content_sha256=createHash('sha256').update(canonical(plan.units)).digest('hex');
const output=JSON.stringify(plan,null,2)+'\n';fs.writeFileSync(file,output);fs.writeFileSync(path.join(root,'веб/data/growth/editorial-plan.json'),output);
console.log(`Prepared editorial sequence ${plan.sequence}: ${plan.units.length} units; no publication/deployment.`);
