/** Independent adversarial data checks; no files, network, production facts or fixtures are mutated. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validateGrowthCenterDataset,getStageContentMechanics,getConversion,getConversionSeries}=require('../../../lib/growth-center/model.ts');
const canonical=JSON.parse(fs.readFileSync(new URL('../../../data/growth/vernatun.json',import.meta.url),'utf8'));
const clone=value=>structuredClone(value);
let passed=0;
const test=(name,run)=>{run();passed++;console.log(`PASS ${name}`)};
const valid=d=>{const result=validateGrowthCenterDataset(d);assert.equal(result.ok,true,result.errors?.join(';'));return result.data};
const invalid=d=>assert.equal(validateGrowthCenterDataset(d).ok,false);
const measured=()=>{
 const d=clone(canonical);d.updatedAt='2026-11-10';
 const values={awareness:100,desire:30,registration:12,attendance:10,return:4,membership:2,advocacy:1,reactivation:1};
 for(const m of d.metrics.filter(m=>m.stageId||m.id==='eligible-dormant')){m.value=m.id==='eligible-dormant'?10:values[m.stageId];m.periodStart='2026-10-01';m.periodEnd='2026-10-05';m.cohortId='qa-one-cohort';m.provenance={...m.provenance,kind:'measured',observedAt:'2026-11-10'};}
 return d;
};
const history=(d,stageId,value)=>{const s=d.series.find(s=>s.stageId===stageId);s.points=[{date:'2026-11-10',value,periodStart:'2026-10-01',periodEnd:'2026-10-05',cohortId:'qa-one-cohort',evidenceKind:'measured',sourceId:d.sources[0].id,observedAt:'2026-11-10'}];};

test('canonical proposals do not inflate 24 tasks or manufacture measurements',()=>{
 const d=valid(canonical);assert.equal(d.content.length,24);assert(d.content.every(job=>job.id.startsWith('V-')));assert(d.contentMechanics.length>0);assert(d.contentMechanics.every(idea=>idea.id.startsWith('idea-')&&idea.status==='proposed'));assert(d.metrics.filter(m=>m.stageId).every(m=>m.value===null&&m.provenance.kind==='unknown'));assert.equal(d.meetings.length,0);
});
test('all eight stages have isolated proposed ideas and cold stage has humor/useful/series',()=>{
 const d=valid(canonical);for(const stage of d.stages){const ideas=getStageContentMechanics(d,stage.id);assert(ideas.length>0);assert(ideas.every(idea=>idea.stageIds.includes(stage.id)));}
 const kinds=new Set(getStageContentMechanics(d,'awareness').map(i=>i.kind));for(const kind of ['humor','useful','series'])assert(kinds.has(kind));
 const before=JSON.stringify(d);getStageContentMechanics(d,'return');assert.equal(JSON.stringify(d),before);
});
test('legacy v2 without ideas loads as empty array without changing jobs',()=>{const d=clone(canonical);delete d.contentMechanics;const parsed=valid(d);assert.deepEqual(parsed.contentMechanics,[]);assert.deepEqual(parsed.content,canonical.content)});
test('idea cannot acquire publication/job/date/person fields',()=>{for(const [field,value]of [['publishedAt','2026-11-10'],['plannedDate','2026-11-11'],['publication',{url:'https://example.org'}],['contentId','V-202611-REL-01'],['email','person@example.org']]){const d=clone(canonical);d.contentMechanics[0][field]=value;invalid(d)}});
test('unknown idea status/kind/stage/source and blank needs are rejected',()=>{for(const [key,value]of [['status','published'],['kind','other'],['stageIds',['cold']],['sourceId','missing-source'],['need','   '],['example','']]){const d=clone(canonical);d.contentMechanics[0][key]=value;invalid(d)}});
test('duplicate idea ids and duplicate/empty stage assignments are rejected',()=>{const duplicate=clone(canonical);duplicate.contentMechanics.push(clone(duplicate.contentMechanics[0]));invalid(duplicate);for(const value of [[],['awareness','awareness']]){const d=clone(canonical);d.contentMechanics[0].stageIds=value;invalid(d)}});
test('membership denominator is four returning guests, not ten first visits',()=>{const d=measured();valid(d);assert.equal(getConversion(d,'membership').denominator,4);assert.equal(getConversion(d,'membership').value,.5)});
test('membership exceeding returning guest cohort cannot produce a percentage',()=>{const d=measured();d.metrics.find(m=>m.stageId==='membership').value=5;invalid(d);assert.equal(getConversion(d,'membership').value,null)});
test('unknown, estimated or mismatched return base never becomes membership conversion',()=>{for(const patch of [{value:null,kind:'unknown'},{value:4,kind:'owner_estimate'},{cohortId:'other'},{observedAt:'2026-11-09'}]){const d=measured(),m=d.metrics.find(m=>m.stageId==='return');if('value'in patch)m.value=patch.value;if(patch.kind)m.provenance.kind=patch.kind;if(patch.cohortId)m.cohortId=patch.cohortId;if(patch.observedAt)m.provenance.observedAt=patch.observedAt;assert.equal(getConversion(d,'membership').value,null)}});
test('unmatured return window prevents both current and historical subscription rates',()=>{const d=measured();for(const m of d.metrics.filter(m=>m.stageId)){m.periodStart='2026-11-01';m.periodEnd='2026-11-05';}valid(d);assert.equal(getConversion(d,'membership').value,null);history(d,'return',4);history(d,'membership',2);for(const s of d.series.filter(s=>['return','membership'].includes(s.stageId)))for(const p of s.points){p.periodStart='2026-11-01';p.periodEnd='2026-11-05';}assert(getConversionSeries(d,'membership').points.every(p=>p.value===null))});
test('historical membership rate uses matching returning guests and keeps missing base as a gap',()=>{const d=measured();history(d,'attendance',10);history(d,'return',4);history(d,'membership',2);valid(d);assert.equal(getConversionSeries(d,'membership').points[0].value,.5);d.series.find(s=>s.stageId==='return').points=[];assert(getConversionSeries(d,'membership').points.every(p=>p.value===null))});
console.log(`${passed} independent situation-center boundary checks passed.`);
