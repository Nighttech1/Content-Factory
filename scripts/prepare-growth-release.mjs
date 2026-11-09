#!/usr/bin/env node
// Offline preparation only. Publishing a marker is an explicit separate operator action.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const REPOSITORY='Nighttech1/Content-Factory';
const BRANCH='codex/director-chatgpt-transfer';
const DOMAIN='content.vernatunspeakclub.com';
const MARKERS={qa:'.github/releases/growth-center-qa.json',release:'.github/releases/growth-center-release.json'};
function requireValue(ok,message){if(!ok)throw Error(message)}
const positive=value=>/^[1-9][0-9]*$/.test(value??'')&&Number.isSafeInteger(Number(value));
const sha=value=>/^[a-f0-9]{40}$/.test(value??'');
function git(args,cwd){
 try{return execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}
 catch{throw Error('Local Git validation failed; check repository, branch and source commit.')}
}
export function parseArguments(args){
 const mode=args[0];requireValue(mode==='qa'||mode==='release','Choose qa or release.');
 const values={};const booleans=new Set(['--write-marker']);
 const allowed=new Set(['--source','--output','--write-marker',...(mode==='release'?['--qa-run','--qa-commit','--artifact','--attempt','--approve-production']:[])]);
 for(let i=1;i<args.length;i++){
  const key=args[i];requireValue(allowed.has(key)&&!(key in values),'Unknown or duplicate argument.');
  if(booleans.has(key)){values[key]=true;continue}
  requireValue(i+1<args.length&&!args[i+1].startsWith('--'),'Missing argument value.');
  values[key]=args[++i];
 }
 requireValue(sha(values['--source']),'Source must be a full lowercase 40-character SHA.');
 const manifest={version:1,sourceSha:values['--source']};
 if(mode==='release'){
  requireValue(positive(values['--qa-run'])&&positive(values['--artifact']),'QA run/artifact must be positive safe integer IDs.');
  requireValue(sha(values['--qa-commit']),'QA commit must be a full lowercase SHA.');
  manifest.qaRunId=Number(values['--qa-run']);manifest.qaCommitSha=values['--qa-commit'];manifest.artifactId=Number(values['--artifact']);
  if('--attempt' in values){requireValue(positive(values['--attempt'])&&Number(values['--attempt'])<=10,'Attempt must be 1..10.');manifest.attempt=Number(values['--attempt'])}
  if('--approve-production' in values)requireValue(values['--approve-production']===DOMAIN,'Approval target must be the exact production domain.');
  if(values['--write-marker'])requireValue(values['--approve-production']===DOMAIN,'Release marker writing requires an existing human approval and --approve-production '+DOMAIN+'.');
 }
 requireValue(!(values['--write-marker']&&values['--output']),'Choose --output or --write-marker, not both.');
 return {mode,values,manifest};
}
function physicalPath(candidate){
 const rest=[];let probe=path.resolve(candidate);
 for(;;){
  try{return path.resolve(fs.realpathSync(probe),...rest)}
  catch(error){
   requireValue(error.code==='ENOENT','Output path cannot be resolved safely.');
   try{fs.lstatSync(probe);throw Error('Output path contains a dangling symlink.')}catch(e){if(e.code!=='ENOENT')throw e}
   const parent=path.dirname(probe);requireValue(parent!==probe,'Output path has no existing parent.');
   rest.unshift(path.basename(probe));probe=parent;
  }
 }
}
function atomicWrite(destination,content){
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 const temporary=destination+'.prepare-'+process.pid+'-'+Date.now();
 try{fs.writeFileSync(temporary,content,{flag:'wx',mode:0o600});fs.renameSync(temporary,destination)}
 finally{try{fs.unlinkSync(temporary)}catch(error){if(error.code!=='ENOENT')throw error}}
}
export function prepare(args,{cwd=process.cwd(),stdout=process.stdout,stderr=process.stderr}={}){
 const {mode,values,manifest}=parseArguments(args);
 const root=git(['rev-parse','--show-toplevel'],cwd);
 requireValue(git(['symbolic-ref','--short','HEAD'],root)===BRANCH,'Use branch '+BRANCH+'.');
 const origin=git(['remote','get-url','origin'],root);
 requireValue(['https://github.com/'+REPOSITORY,'https://github.com/'+REPOSITORY+'.git','git@github.com:'+REPOSITORY+'.git','ssh://git@github.com/'+REPOSITORY+'.git'].includes(origin),'Use the configured Content-Factory origin repository.');
 git(['cat-file','-e',manifest.sourceSha+'^{commit}'],root);
 git(['merge-base','--is-ancestor',manifest.sourceSha,'HEAD'],root);
 let destination=null;
 if(values['--write-marker'])destination=path.join(root,MARKERS[mode]);
 else if(values['--output']){
  destination=path.resolve(root,values['--output']);
  const resolved=physicalPath(destination);
  requireValue(!Object.values(MARKERS).some(marker=>resolved===physicalPath(path.join(root,marker))),'Trigger marker output requires explicit --write-marker.');
 }
 const content=JSON.stringify(manifest,null,2)+'\n';
 if(destination){atomicWrite(destination,content);stderr.write('Prepared local file only. No commit, push, workflow or deployment performed.\n')}
 else stdout.write(content);
 stderr.write('Remote QA status, artifact identity and expiry are NOT checked by this offline helper. The existing CI gate remains authoritative.\n');
 return {manifest,destination};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(process.argv.includes('--help')){
  console.log('node scripts/prepare-growth-release.mjs qa --source SHA [--output FILE | --write-marker]\nnode scripts/prepare-growth-release.mjs release --source SHA --qa-run ID --qa-commit SHA --artifact ID [--attempt 1..10] [--output FILE | --write-marker --approve-production '+DOMAIN+']');
 }else{
  try{prepare(process.argv.slice(2))}catch(error){console.error('Preparation failed: '+error.message);process.exitCode=1}
 }
}
