import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const mode=process.argv[2];
const branch='refs/heads/codex/director-chatgpt-transfer';
function assert(ok,msg){if(!ok)throw Error(msg)}
assert(process.env.GITHUB_REF===branch,'Wrong release branch');
const marker=`.github/releases/growth-center-${mode==='qa'?'qa':'release'}.json`;
const m=JSON.parse(fs.readFileSync(marker,'utf8'));
const keys=mode==='qa'?['version','sourceSha']:['version','sourceSha','qaRunId','qaCommitSha','artifactId'];
const allowedKeys=mode==='deploy'?[...keys,'attempt']:keys;
assert(Object.keys(m).every(k=>allowedKeys.includes(k))&&keys.every(k=>k in m),'Invalid manifest fields');
// Retry nonce only changes the marker; it never selects code, QA run or artifact.
if('attempt' in m)assert(mode==='deploy'&&Number.isInteger(m.attempt)&&m.attempt>=1&&m.attempt<=10,'Invalid release attempt');
assert(m.version===1&&/^[a-f0-9]{40}$/.test(m.sourceSha),'Invalid source SHA');
execFileSync('git',['merge-base','--is-ancestor',m.sourceSha,process.env.GITHUB_SHA]);
assert(m.sourceSha!==process.env.GITHUB_SHA,'Marker must follow tested source');
function output(k,v){fs.appendFileSync(process.env.GITHUB_OUTPUT,`${k}=${v}\n`)}
output('source',m.sourceSha);
if(mode==='deploy'){
 for(const k of ['qaRunId','artifactId'])assert(Number.isSafeInteger(m[k])&&m[k]>0,`Invalid ${k}`);
 assert(/^[a-f0-9]{40}$/.test(m.qaCommitSha),'Invalid QA commit');
 const api=async path=>{const r=await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/${path}`,{headers:{Authorization:`Bearer ${process.env.GH_TOKEN}`,Accept:'application/vnd.github+json'}});assert(r.ok,`GitHub gate HTTP ${r.status}`);return r.json()};
 const run=await api(`actions/runs/${m.qaRunId}`);
 assert(run.status==='completed'&&run.conclusion==='success','QA run not successful');
 assert(run.event==='push'&&run.head_branch===branch.slice(11)&&run.head_sha===m.qaCommitSha,'QA run ref mismatch');
 assert(run.path==='.github/workflows/growth-center-release.yml','Wrong QA workflow');
 const a=await api(`actions/artifacts/${m.artifactId}`);
 assert(!a.expired&&a.name===`growth-center-qa-${m.qaRunId}`&&a.workflow_run?.id===m.qaRunId,'Artifact/run mismatch');
 output('run',m.qaRunId);output('artifact',m.artifactId);output('qaCommit',m.qaCommitSha);
 // Reuse the latest retained trust record from a successful release of this workflow.
 const artifacts=await api('actions/artifacts?per_page=100');
 for(const trust of artifacts.artifacts??[]){
  if(trust.expired||!/^growth-center-host-trust-\d+$/.test(trust.name))continue;
  const prior=await api(`actions/runs/${trust.workflow_run.id}`);
  if(prior.conclusion==='success'&&prior.head_branch===branch.slice(11)&&prior.path===run.path&&prior.event==='push'){
   output('trustArtifact',trust.id);output('trustRun',prior.id);break;
  }
 }
 fs.writeFileSync('release-manifest.json',JSON.stringify(m));
}
