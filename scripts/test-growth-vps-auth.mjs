// Offline control-flow checks: no DNS resolution, SSH connection or real credential.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {probe,CONTENT_DOMAIN,REMOTE_COMMAND} from './growth-vps-root-auth.mjs';

async function run(env,overrides={}){
 const flags={},calls=[];
 let keyPath;
 const dependencies={
  flag:(name,value)=>{flags[name]=value},
  knownTarget:async()=>{calls.push('resolve');return '192.0.2.1'},
  spawnSync:(command,args)=>{
   calls.push('parse');assert.equal(command,'ssh-keygen');
   keyPath=args.at(-1);assert.equal(fs.statSync(keyPath).mode&0o777,0o600);
   return {status:0};
  },
  sshOnce:async args=>{
   calls.push('authenticate');
   assert(args.includes(`root@${CONTENT_DOMAIN}`));
   assert(args.includes('HostName=192.0.2.1'));
   assert(args.includes(`HostKeyAlias=${CONTENT_DOMAIN}`));
   assert(args.includes('PasswordAuthentication=no'));
   assert(args.includes('ConnectionAttempts=1'));
   assert(args.some(arg=>arg==='StrictHostKeyChecking=yes'||arg==='StrictHostKeyChecking=accept-new'));
   assert.equal(args.at(-1),REMOTE_COMMAND);
   return {code:0,stdout:'REMOTE_UID0=true\nREMOTE_APP_DIR=true\nREMOTE_ROOT_PM2_PID_ALIVE=false\n',stderr:'',timedOut:false};
  },
  ...overrides,
 };
 await probe(env,dependencies);
 if(keyPath)assert.equal(fs.existsSync(keyPath),false,'Temporary credential file must be cleaned');
 return {flags,calls};
}

const root=await run({VPS_USER:' root ',VPS_KEY:'offline-placeholder'});
assert.deepEqual(root.calls,['resolve','parse','authenticate']);
assert.equal(root.flags.AUTH_ROOT_attempted,true);
assert.equal(root.flags.AUTH_ROOT_OK,true);
assert.equal(root.flags.KEY_LOOKS_LIKE_FINGERPRINT,false);
console.log('PASS configured root reaches exactly one read-only authentication probe');

for(const user of ['deploy','','administrator']){
 const result=await run({VPS_USER:user,VPS_KEY:'offline-placeholder'});
 assert.deepEqual(result.calls,[]);
 assert.equal(result.flags.AUTH_ROOT_skipped,'configured_user_not_root');
}
console.log('PASS non-root or missing user never triggers root fallback or key parsing');

const unknown=await run({VPS_USER:'root',VPS_KEY:'offline-placeholder'},{knownTarget:async()=>null});
assert.equal(unknown.flags.AUTH_ROOT_skipped,'target_not_confirmed');
assert.equal(unknown.flags.AUTH_ROOT_attempted,undefined);
console.log('PASS unconfirmed target cannot authenticate');

// Use the real local parser on a dummy fingerprint, still with DNS/SSH mocked.
const {spawnSync}=await import('node:child_process');
const fingerprint=await run({VPS_USER:'root',VPS_KEY:'SHA256:offline-example'},{spawnSync});
assert.equal(fingerprint.flags.KEY_LOOKS_LIKE_FINGERPRINT,true);
assert.equal(fingerprint.flags.KEY_PARSE_VALID,false);
assert.equal(fingerprint.flags.AUTH_ROOT_skipped,'key_not_loadable_without_passphrase');
assert.equal(fingerprint.flags.AUTH_ROOT_attempted,undefined);
assert(!fingerprint.calls.includes('authenticate'));
console.log('PASS fingerprint is identified and rejected without authentication');
