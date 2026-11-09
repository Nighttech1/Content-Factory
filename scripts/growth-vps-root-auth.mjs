// One explicitly authorized root-auth check. No deployment, provisioning or PM2 invocation.
import dns from 'node:dns/promises';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isKnownSelectelAddress} from './growth-vps-connectivity.mjs';

export const CONTENT_DOMAIN='content.vernatunspeakclub.com';
export const REMOTE_COMMAND=`
printf 'REMOTE_UID0='; if [ "$(id -u)" = 0 ]; then printf 'true\\n'; else printf 'false\\n'; fi
printf 'REMOTE_APP_DIR='; if [ -d /opt/content-factory ]; then printf 'true\\n'; else printf 'false\\n'; fi
PM2_PID=''
if [ -r "$HOME/.pm2/pm2.pid" ]; then PM2_PID="$(cat "$HOME/.pm2/pm2.pid" 2>/dev/null)"; fi
PM2_ALIVE=false
case "$PM2_PID" in ''|*[!0-9]*) ;; *) if kill -0 "$PM2_PID" 2>/dev/null && [ "$(ps -o uid= -p "$PM2_PID" 2>/dev/null | tr -d '[:space:]')" = 0 ]; then case "$(ps -o args= -p "$PM2_PID" 2>/dev/null)" in *"God Daemon"*) PM2_ALIVE=true ;; esac; fi ;; esac
printf 'REMOTE_ROOT_PM2_PID_ALIVE=%s\\n' "$PM2_ALIVE"
`;
export function classifySSHFailure(stderr,timedOut){
 if(timedOut||/timed out|Operation timed out/i.test(stderr))return 'timeout';
 if(/Permission denied.*publickey/i.test(stderr))return 'publickey_denied';
 if(/Host key verification failed|REMOTE HOST IDENTIFICATION HAS CHANGED/i.test(stderr))return 'hostkey_error';
 if(/Load key|invalid format|libcrypto|bad permissions/i.test(stderr))return 'key_error';
 if(/Connection refused/i.test(stderr))return 'connection_refused';
 return 'other_error';
}
async function knownTarget(){
 const resolver=new dns.Resolver({timeout:3000,tries:1});
 const timer=setTimeout(()=>resolver.cancel(),15_000);
 try{
  const results=await Promise.allSettled([resolver.resolve4(CONTENT_DOMAIN),resolver.resolve6(CONTENT_DOMAIN)]);
  return results.flatMap(r=>r.status==='fulfilled'?r.value:[]).find(isKnownSelectelAddress)??null;
 }catch{return null}finally{clearTimeout(timer)}
}
function sshOnce(args){
 return new Promise(resolve=>{
  let stdout='',stderr='',done=false,timedOut=false;
  const child=spawn('ssh',args,{stdio:['ignore','pipe','pipe']});
  const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL')},30_000);
  const finish=code=>{if(done)return;done=true;clearTimeout(timer);resolve({code,stdout,stderr,timedOut})};
  child.stdout.on('data',buffer=>{stdout+=buffer.toString();if(stdout.length>65536)child.kill('SIGKILL')});
  child.stderr.on('data',buffer=>{stderr+=buffer.toString();if(stderr.length>65536)child.kill('SIGKILL')});
  child.on('error',()=>finish(-1));child.on('close',finish);
 });
}
const flag=(key,value)=>console.log(`${key}=${value}`);
export async function probe(env,dependencies={}){
 const log=dependencies.flag??flag;
 const resolveTarget=dependencies.knownTarget??knownTarget;
 const inspectKey=dependencies.spawnSync??spawnSync;
 const authenticate=dependencies.sshOnce??sshOnce;
 const userIsRoot=(env.VPS_USER??'').trim()==='root';
 log('USER_is_root',userIsRoot);
 if(!userIsRoot){log('AUTH_ROOT_skipped','configured_user_not_root');return}
 const target=await resolveTarget();
 log('knownSelectelDNSmatch',Boolean(target));
 if(!target){log('AUTH_ROOT_skipped','target_not_confirmed');return}
 const rawPort=env.VPS_PORT??'';
 const port=rawPort===''?22:Number(rawPort);
 if(!(rawPort===''||/^\d+$/.test(rawPort))||!Number.isInteger(port)||port<1||port>65535){log('AUTH_ROOT_skipped','invalid_port');return}
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'growth-auth-'));fs.chmodSync(temp,0o700);
 try{
  const key=path.join(temp,'key'),hosts=path.join(temp,'known_hosts');
  fs.writeFileSync(key,(env.VPS_KEY??'')+'\n',{mode:0o600});fs.writeFileSync(hosts,env.VPS_KNOWN_HOSTS??'',{mode:0o600});
  log('KEY_LOOKS_LIKE_FINGERPRINT',/^SHA256:/i.test((env.VPS_KEY??'').trim()));
  const keyCheck=inspectKey('ssh-keygen',['-y','-P','','-f',key],{stdio:['ignore','ignore','ignore'],timeout:5000});
  const keyValid=keyCheck.status===0;log('KEY_PARSE_VALID',keyValid);
  if(!keyValid){log('AUTH_ROOT_skipped','key_not_loadable_without_passphrase');return}
  const policy=(env.VPS_KNOWN_HOSTS??'').trim()?'yes':'accept-new';
  log('AUTH_ROOT_attempted',true);
  // Pin the actual connection to the DNS answer whose hash matches the owner's known server.
  // Preserve the public domain as host-key alias; no raw address is emitted.
  const args=['-F','/dev/null','-i',key,'-p',String(port),
   '-o',`HostName=${target}`,'-o',`HostKeyAlias=${CONTENT_DOMAIN}`,
   '-o','BatchMode=yes','-o','IdentitiesOnly=yes','-o','IdentityAgent=none',
   '-o','PreferredAuthentications=publickey','-o','PasswordAuthentication=no','-o','KbdInteractiveAuthentication=no',
   '-o','ConnectionAttempts=1','-o','ConnectTimeout=15','-o','ServerAliveInterval=5','-o','ServerAliveCountMax=2',
   '-o','HashKnownHosts=yes','-o',`StrictHostKeyChecking=${policy}`,'-o',`UserKnownHostsFile=${hosts}`,
   `root@${CONTENT_DOMAIN}`,REMOTE_COMMAND];
  const result=await authenticate(args);
  const uid0=result.stdout.split(/\r?\n/).includes('REMOTE_UID0=true');
  log('AUTH_ROOT_OK',result.code===0&&uid0);
  if(result.code!==0){log('AUTH_ROOT_status',classifySSHFailure(result.stderr,result.timedOut));return}
  for(const name of ['REMOTE_UID0','REMOTE_APP_DIR','REMOTE_ROOT_PM2_PID_ALIVE']){
   const line=result.stdout.split(/\r?\n/).find(line=>line===`${name}=true`||line===`${name}=false`);
   log(name,line?line.endsWith('=true'):'unknown');
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await probe(process.env)}catch{flag('AUTH_ROOT_status','internal_error');process.exitCode=1}
}
