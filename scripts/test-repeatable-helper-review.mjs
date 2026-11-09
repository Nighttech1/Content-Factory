/** Independent CLI checks in a disposable local Git repo. No remote service or production marker is used. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const helper=path.resolve(new URL('./prepare-growth-release.mjs',import.meta.url).pathname);
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'repeatable-helper-review-'));
const env={...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_TERMINAL_PROMPT:'0'};
const git=(...args)=>{const p=spawnSync('git',args,{cwd:folder,env,encoding:'utf8'});assert.equal(p.status,0,p.stderr);return p.stdout.trim()};
const run=args=>spawnSync(process.execPath,[helper,...args],{cwd:folder,env,encoding:'utf8'});
let passed=0;
try{
 git('init','--initial-branch=codex/director-chatgpt-transfer');
 git('remote','add','origin','https://github.com/Nighttech1/Content-Factory.git');
 fs.writeFileSync(path.join(folder,'fixture.txt'),'offline source\n');git('add','fixture.txt');git('-c','user.name=Offline QA','-c','user.email=qa@example.invalid','commit','-m','fixture');
 const sha=git('rev-parse','HEAD');
 const markerDir=path.join(folder,'.github/releases');fs.mkdirSync(markerDir,{recursive:true});
 const markerNames=['growth-center-qa.json','growth-center-release.json'];
 const before=markerNames.map((name,index)=>{const text=JSON.stringify({sentinel:index})+'\n';fs.writeFileSync(path.join(markerDir,name),text);return text});
 const unchanged=()=>markerNames.forEach((name,index)=>assert.equal(fs.readFileSync(path.join(markerDir,name),'utf8'),before[index],`Unexpected real trigger marker write: ${name}`));
 const check=(name,args,valid=false)=>{const result=run(args);assert.equal(result.status===0,valid,`${name}: ${result.stdout}\n${result.stderr}`);unchanged();passed++;console.log('PASS',name);return result};
 const qa=['qa','--source',sha];
 const release=['release','--source',sha,'--qa-run','123','--qa-commit',sha,'--artifact','456'];
 const planned=check('QA default emits JSON without trigger writes',qa,true);assert.deepEqual(JSON.parse(planned.stdout),{version:1,sourceSha:sha});
 assert(planned.stderr.includes('NOT checked'),'Preparation must disclose missing remote verification');
 const proposed=check('release default prepares only, without implicit production',release,true);assert.deepEqual(JSON.parse(proposed.stdout),{version:1,sourceSha:sha,qaRunId:123,qaCommitSha:sha,artifactId:456});
 for(const [name,args]of [
  ['unknown dispatch command',[...qa,'--dispatch']],
  ['missing source',['qa']],
  ['duplicate source',[...qa,'--source',sha]],
  ['partial SHA',['qa','--source',sha.slice(0,7)]],
  ['nonexistent source cannot write',['qa','--source','0'.repeat(40),'--write-marker']],
  ['zero QA run',['release','--source',sha,'--qa-run','0','--qa-commit',sha,'--artifact','456']],
  ['unsafe artifact ID',['release','--source',sha,'--qa-run','123','--qa-commit',sha,'--artifact','9007199254740992']],
  ['invalid attempt zero',[...release,'--attempt','0']],
  ['invalid attempt eleven',[...release,'--attempt','11']],
  ['release write without approval',[...release,'--write-marker']],
  ['release write wrong target',[...release,'--write-marker','--approve-production','admin.vernatunspeakclub.com']],
  ['trigger output alias without explicit marker mode',[...qa,'--output','.github/releases/../releases/growth-center-release.json']],
  ['trigger output same QA path',[...qa,'--output','.github/releases/growth-center-qa.json']],
 ])check(name,args);
 fs.symlinkSync(markerDir,path.join(folder,'trigger-alias'),'dir');check('symlink-parent output cannot bypass trigger guard',[...qa,'--output','trigger-alias/growth-center-release.json']);
 fs.symlinkSync(path.join(markerDir,markerNames[1]),path.join(folder,'marker-alias.json'));check('symlink-file output cannot bypass trigger guard',[...qa,'--output','marker-alias.json']);
 const orphan=git('-c','user.name=Offline QA','-c','user.email=qa@example.invalid','commit-tree',git('rev-parse','HEAD^{tree}'),'-m','unrelated fixture');check('nonancestor source cannot write marker',['qa','--source',orphan,'--write-marker']);
 git('switch','-c','qa-wrong-branch');check('wrong branch cannot write marker',[...qa,'--write-marker']);git('switch','codex/director-chatgpt-transfer');
 git('remote','set-url','origin','https://github.com/example/wrong.git');check('wrong repository cannot write marker',[...qa,'--write-marker']);git('remote','set-url','origin','https://github.com/Nighttech1/Content-Factory.git');
 const offTrigger=path.join(folder,'prepared/release-review.json');fs.mkdirSync(path.dirname(offTrigger),{recursive:true});check('explicit off-trigger output is preparation only',[...release,'--output',offTrigger],true);assert.deepEqual(JSON.parse(fs.readFileSync(offTrigger,'utf8')),JSON.parse(proposed.stdout));
 const write=run([...release,'--write-marker','--approve-production','content.vernatunspeakclub.com']);assert.equal(write.status,0,write.stderr);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(markerDir,markerNames[1]),'utf8')),JSON.parse(proposed.stdout));assert.equal(fs.readFileSync(path.join(markerDir,markerNames[0]),'utf8'),before[0]);passed++;console.log('PASS explicit approved release writes only selected local marker');
 console.log(`${passed} independent helper scenarios passed; no remote calls or production files used.`);
}finally{fs.rmSync(folder,{recursive:true,force:true})}
