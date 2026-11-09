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
`+String.raw`
if command -v python3 >/dev/null 2>&1; then
python3 - <<'GROWTH_INVENTORY'
import json, os, pathlib, pwd, grp, re, shlex, subprocess
base='/opt/content-factory'
def under(value):
 return value==base or value.startswith(base+'/')
def text(path):
 try: return pathlib.Path(path).read_text()
 except (OSError,UnicodeError): return ''
def process(pid):
 try:
  root='/proc/'+str(pid)
  status=text(root+'/status')
  uid=int(re.search(r'^Uid:\s*(\d+)',status,re.M)[1])
  parent=int(re.search(r'^PPid:\s*(\d+)',status,re.M)[1])
  cwd=os.readlink(root+'/cwd')
  exe=os.path.basename(os.readlink(root+'/exe'))
  comm=text(root+'/comm').strip()[:80]
  units=re.findall(r'(?:^|/)([A-Za-z0-9_.@-]+\.service)(?:/|$)',text(root+'/cgroup'),re.M)
  return dict(pid=int(pid),uid=uid,ppid=parent,cwd=cwd,exe=exe,comm=comm,units=units)
 except (OSError,ValueError,TypeError): return None
allp=[p for name in os.listdir('/proc') if name.isdigit() for p in [process(name)] if p]
apps=[p for p in allp if under(p['cwd'])][:32]
inodes={8088:set(),3087:set()}
for table in ['/proc/net/tcp','/proc/net/tcp6']:
 for line in text(table).splitlines()[1:]:
  cols=line.split()
  for port in inodes:
   if len(cols)>9 and cols[3]=='0A' and cols[1].split(':')[-1].upper()==format(port,'04X'): inodes[port].add(cols[9])
listenersByPort={8088:[],3087:[]}
if any(inodes.values()):
 for p in allp:
  try:
   for fd in pathlib.Path('/proc/'+str(p['pid'])+'/fd').iterdir():
    try: link=os.readlink(fd)
    except OSError: continue
    for port in inodes:
     if link.startswith('socket:[') and link[8:-1] in inodes[port] and p not in listenersByPort[port]: listenersByPort[port].append(p)
  except OSError: pass
listeners=listenersByPort[8088]+listenersByPort[3087]
try:
 stat=os.stat(base); baseuid=stat.st_uid; owner=pwd.getpwuid(baseuid).pw_name
 basedata=dict(path=base,realpath=os.path.realpath(base),uid=baseuid,owner=owner)
except (OSError,KeyError):
 baseuid=None; basedata=dict(path=base,exists=False)
owners={p['uid'] for p in apps+listeners}
if baseuid is not None: owners.add(baseuid)
managers=[]
for uid in sorted(owners):
 try:
  user=pwd.getpwuid(uid); state=user.pw_dir+'/.pm2'
  raw=text(state+'/pm2.pid').strip()
  p=next((p for p in allp if str(p['pid'])==raw and p['uid']==uid),None)
  managers.append(dict(uid=uid,user=user.pw_name,pm2Home=state,pidFile=bool(raw),daemon=p if p and p['comm'].startswith('PM2') else None))
 except KeyError: pass
storage=[]
for root in sorted({base}|{p['cwd'] for p in apps if under(p['cwd'])}):
 for relative in ['public','data','data/local','generatedMedia','public/vernatun-jobs','public/uploads','.env','.env.local','.env.production','.env.production.local']:
  path=root+'/'+relative
  item=dict(path=path,exists=os.path.exists(path),symlink=os.path.islink(path))
  if item['exists']:
   item.update(realpath=os.path.realpath(path),uid=os.stat(path).st_uid,directory=os.path.isdir(path))
  storage.append(item)
nginx=[]
for folder in ['/etc/nginx/sites-enabled','/etc/nginx/conf.d']:
 try: candidates=list(pathlib.Path(folder).iterdir())
 except OSError: candidates=[]
 for file in candidates:
  body=text(file)
  if 'content.vernatunspeakclub.com' not in body: continue
  ports=re.findall(r'proxy_pass\s+https?://(?:127\.0\.0\.1|localhost|\[::1\]):([0-9]+)',body)
  nginx.append(dict(file=str(file),localProxyPorts=sorted(set(map(int,ports))),alsoNamesAdmin='admin.vernatunspeakclub.com' in body))
current=base+'/current'
basedata['current']=dict(path=current,exists=os.path.exists(current),symlink=os.path.islink(current),realpath=os.path.realpath(current))
unit={}
properties=['User','Group','ActiveState','SubState','MainPID','WorkingDirectory','FragmentPath','DropInPaths','EnvironmentFiles','ReadWritePaths','ProtectSystem','ExecStart']
try:
 result=subprocess.run(['systemctl','show','content-factory.service','--no-pager']+['--property='+name for name in properties],capture_output=True,text=True,timeout=8)
 if result.returncode==0:
  values=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
  unit={name:values.get(name,'') for name in properties if name!='ExecStart'}
  raw=values.get('ExecStart','')
  executable=re.search(r'(?:^|[ {;])path=([^ ;}]+)',raw)
  entries=re.findall(r'/opt/content-factory/(?:current|releases/[A-Za-z0-9_.-]+)/server\.js',raw)
  unit['ExecStartIdentity']=dict(executable=executable[1] if executable else None,entrypoints=sorted(set(entries)),usesCurrent=(base+'/current/server.js') in entries)
  argmatch=re.search(r'argv\[\]=(.*?)\s*;',raw)
  try: argv=shlex.split(argmatch[1]) if argmatch else []
  except ValueError: argv=[]
  expected={'relative_server':['/usr/bin/node','server.js'],'dot_relative_server':['/usr/bin/node','./server.js'],'absolute_current_server':['/usr/bin/node',base+'/current/server.js']}
  unit['ExecStartIdentity']['classification']=next((name for name,args in expected.items() if argv==args),'other')
  try:
   account=pwd.getpwnam('content-factory'); namedgroup=grp.getgrnam('content-factory')
   unit['AccountIdentity']=dict(uid=account.pw_uid,primaryGid=account.pw_gid,namedGroupGid=namedgroup.gr_gid)
  except KeyError: unit['AccountIdentity']={}
  account=unit['AccountIdentity']; old=os.path.realpath(current)
  main=next((p for p in allp if str(p['pid'])==values.get('MainPID')),None)
  unit['DiagnosticIdentityFlags']=dict(
   userGroupNames=values.get('User')=='content-factory' and values.get('Group')=='content-factory',
   accountUid980=account.get('uid')==980,hardcodedGid980=account.get('namedGroupGid')==980,
   primaryGroupMatchesNamed=account.get('primaryGid') is not None and account.get('primaryGid')==account.get('namedGroupGid'),
   activeRunning=values.get('ActiveState')=='active' and values.get('SubState')=='running',
   workingDirectoryCurrent=values.get('WorkingDirectory')==base+'/current',noDropIns=not values.get('DropInPaths'),
   execPathNode=executable is not None and executable[1]=='/usr/bin/node',
   execArgvAllowedOld=argv in [expected['relative_server'],expected['absolute_current_server']],
   environmentFileExact=values.get('EnvironmentFiles','').strip()=='/etc/content-factory/app.env (ignore_errors=no)',
   currentUnderReleases=old.startswith(base+'/releases/'),oldServerExists=os.path.isfile(old+'/server.js'),
   mainPidNumeric=values.get('MainPID','').isdigit() and int(values['MainPID'])>1,
   mainPidUid980=bool(main and main['uid']==980),mainPidCwdMatchesCurrent=bool(main and main['cwd']==old),
   listener3087OwnedByMainPid=any(str(p['pid'])==values.get('MainPID') for p in listenersByPort[3087]),
   dataTarget=os.path.isdir('/var/lib/content-factory/data') and os.path.realpath(old+'/data')=='/var/lib/content-factory/data',
   mediaTarget=os.path.isdir('/var/lib/content-factory/generatedMedia') and os.path.realpath(old+'/generatedMedia')=='/var/lib/content-factory/generatedMedia',
   publicTarget=os.path.isdir('/var/lib/content-factory/public') and os.path.realpath(old+'/public')=='/var/lib/content-factory/public',
   envTarget=os.path.isfile('/etc/content-factory/app.env') and os.path.realpath(old+'/.env.production')=='/etc/content-factory/app.env')
 else: unit={'status':'unavailable'}
except (OSError,subprocess.TimeoutExpired): unit={'status':'unavailable'}
out=dict(status='ok',base=basedata,processes=apps,listeners8088=listenersByPort[8088][:8],listeners3087=listenersByPort[3087][:8],managers=managers[:8],storage=storage[:64],nginx=nginx[:8],unit=unit)
print('REMOTE_INVENTORY_JSON='+json.dumps(out,separators=(',',':')))
GROWTH_INVENTORY
else printf 'REMOTE_INVENTORY_STATUS=python3_unavailable\n'; fi
`;
export function readInventory(stdout){
 const line=stdout.split(/\r?\n/).find(line=>line.startsWith('REMOTE_INVENTORY_JSON='));
 if(!line)return null;
 if(line.length>24000)throw Error('Inventory exceeds bound');
 const data=JSON.parse(line.slice('REMOTE_INVENTORY_JSON='.length));
 const keys=['status','base','processes','listeners8088','listeners3087','managers','storage','nginx','unit'];
 if(!data||typeof data!=='object'||Object.keys(data).some(key=>!keys.includes(key))||data.status!=='ok')throw Error('Invalid inventory');
 for(const name of ['processes','listeners8088','listeners3087','managers','storage','nginx'])if(!Array.isArray(data[name])||data[name].length>64)throw Error('Invalid inventory collection');
 if(!data.unit||typeof data.unit!=='object'||Array.isArray(data.unit))throw Error('Invalid inventory unit');
 return data;
}
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
  const inventory=readInventory(result.stdout);
  if(inventory)log('REMOTE_INVENTORY_JSON',JSON.stringify(inventory));
  else log('REMOTE_INVENTORY_STATUS','unavailable');
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await probe(process.env)}catch{flag('AUTH_ROOT_status','internal_error');process.exitCode=1}
}
