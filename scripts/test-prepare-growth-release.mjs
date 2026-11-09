// All writes and Git commands stay inside a temporary fixture; no remote API or VPS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {prepare} from './prepare-growth-release.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'prepare-growth-release-'));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try{
 git('init','-b','codex/director-chatgpt-transfer');
 git('remote','add','origin','https://github.com/Nighttech1/Content-Factory.git');
 git('-c','user.name=Offline Fixture','-c','user.email=offline@example.invalid','commit','--allow-empty','-m','fixture');
 const source=git('rev-parse','HEAD');
 const qa=path.join(root,'.github/releases/growth-center-qa.json');
 const release=path.join(root,'.github/releases/growth-center-release.json');
 fs.mkdirSync(path.dirname(qa),{recursive:true});fs.writeFileSync(qa,'original QA\n');fs.writeFileSync(release,'original release\n');
 const snapshot=()=>[fs.readFileSync(qa,'utf8'),fs.readFileSync(release,'utf8')];
 function run(args){let out='',err='';const result=prepare(args,{cwd:root,stdout:{write:s=>{out+=s}},stderr:{write:s=>{err+=s}}});return {...result,out,err}}
 function reject(args){const before=snapshot();assert.throws(()=>run(args));assert.deepEqual(snapshot(),before)}
 const qaArgs=['qa','--source',source];
 const releaseArgs=['release','--source',source,'--qa-run','123','--qa-commit',source,'--artifact','456','--attempt','2'];
 const before=snapshot();const q=run(qaArgs);const r=run(releaseArgs);
 assert.deepEqual(JSON.parse(q.out),{version:1,sourceSha:source});
 assert.deepEqual(JSON.parse(r.out),{version:1,sourceSha:source,qaRunId:123,qaCommitSha:source,artifactId:456,attempt:2});
 assert.deepEqual(snapshot(),before);assert(r.err.includes('NOT checked'));assert.equal(r.destination,null);
 console.log('PASS default QA/release preparation has no marker writes or remote verification claim');
 for(const args of [
  ['qa','--source','bad'],[...qaArgs,'--source',source],[...qaArgs,'--dispatch'],
  [...releaseArgs,'--artifact','789'],releaseArgs.map(v=>v==='123'?'0':v),
  releaseArgs.map(v=>v==='456'?'9007199254740992':v),
  releaseArgs.map(v=>v==='2'?'11':v),[...qaArgs,'--output'],
  ['qa','--source','f'.repeat(40)]
 ])reject(args);
 console.log('PASS invalid, duplicate, unknown, unsafe ID and unknown source inputs preserve both markers');
 reject([...releaseArgs,'--write-marker']);
 reject([...releaseArgs,'--write-marker','--approve-production','admin.vernatunspeakclub.com']);
 reject([...qaArgs,'--output','.github/releases/../releases/growth-center-release.json']);
 reject([...qaArgs,'--output','.github/releases/growth-center-qa.json']);
 fs.symlinkSync(release,path.join(root,'alias.json'));
 reject([...qaArgs,'--output','alias.json']);
 reject([...qaArgs,'--write-marker','--output','draft.json']);
 console.log('PASS exact production approval and trigger-path/alias protections are required before writes');
 const output=run([...qaArgs,'--output','drafts/qa.json']);
 assert.equal(JSON.parse(fs.readFileSync(output.destination,'utf8')).sourceSha,source);
 assert.deepEqual(snapshot(),before);
 run([...qaArgs,'--write-marker']);
 assert.equal(JSON.parse(fs.readFileSync(qa,'utf8')).sourceSha,source);
 assert.equal(fs.readFileSync(release,'utf8'),before[1]);
 run([...releaseArgs,'--write-marker','--approve-production','content.vernatunspeakclub.com']);
 assert.equal(JSON.parse(fs.readFileSync(release,'utf8')).artifactId,456);
 console.log('PASS explicit off-trigger output and separately approved local marker writes use strict schemas');
 git('switch','-c','wrong-branch');reject(qaArgs);git('switch','codex/director-chatgpt-transfer');
 git('remote','set-url','origin','https://github.com/example/other.git');reject(qaArgs);
 console.log('PASS wrong branch/repository cannot write markers');
}finally{fs.rmSync(root,{recursive:true,force:true})}
