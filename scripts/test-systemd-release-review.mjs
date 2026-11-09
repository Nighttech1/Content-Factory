/** Independent rollback failure-path review: extracted current Bash function, all ops mocked. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const source=fs.readFileSync(new URL('./deploy-growth-center.sh',import.meta.url),'utf8');
const rollback=source.match(/rollback\(\)\{[\s\S]*?\n\}\ntrap rollback ERR/)?.[0].replace(/\ntrap rollback ERR$/,'');
assert(rollback,'Rollback function not found; review extraction explicitly');
const helpers=source.slice(source.indexOf('remove_owned_dropin(){'),source.indexOf('rollback(){'));
assert(helpers.includes('wait_old_health(){'),'Rollback verification helpers missing');
const fixtures=['success','config-only','config-absent','remove','reload','ln','mv','current','main-unit','restart','health','process','foreign-content','foreign-symlink','managed-success','managed-ln','managed-mv','managed-current','managed-restart','managed-health','managed-process','managed-foreign-content','managed-foreign-symlink','managed-metadata','managed-replaced'];
for(const scenario of fixtures){
 const managed=scenario.startsWith('managed-'),failure=scenario.replace(/^managed-/,'');
 const folder=fs.mkdtempSync('/tmp/independent-systemd-review-');
 const backup=folder+'/backup';fs.mkdirSync(backup);
 const expected='[Service]\nExecStart=\nExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js\n';
 for(const name of ['standalone-dropin.conf','prior-dropin.conf'])fs.writeFileSync(backup+'/'+name,expected);
 const dropin=folder+'/owned.conf';
 fs.writeFileSync(dropin,expected);
 const original=fs.statSync(dropin);
 let metadata=[original.dev,original.ino,original.uid,original.gid,(original.mode&0o7777).toString(8)].join(':');
 if(failure==='foreign-symlink'){fs.unlinkSync(dropin);fs.writeFileSync(folder+'/foreign.conf',expected);fs.symlinkSync(folder+'/foreign.conf',dropin);}
 else if(failure==='config-absent')fs.unlinkSync(dropin);
 else if(failure==='foreign-content')fs.writeFileSync(dropin,'foreign configuration\n');
 else if(failure==='metadata')metadata='invalid-metadata';
 else if(failure==='replaced'){fs.writeFileSync(folder+'/replacement',expected);fs.renameSync(folder+'/replacement',dropin);}
 const harness=`
 set +e
 BASE=/mock/base; OLD_CWD=/mock/base/releases/old; OLD_LINK=releases/old; UNIT=content-factory.service; STAMP=qa
 UNIT_FILE=/mock/unit; UNIT_HASH=expectedhash; BACKUP=${JSON.stringify(backup)}; DROPIN=${JSON.stringify(dropin)}
 DROPIN_DIR=${JSON.stringify(folder)}; DROPIN_STATE=${JSON.stringify(metadata)}; PREVIOUS_CONFIG=${managed?1:0}
 SWITCHED=${failure==='config-only'||failure==='config-absent'?0:1}; CONFIG_CHANGED=${managed?0:1}
 FAIL=${failure}
 rm(){ printf 'MOCK:rm:%s\\n' "$*"; [[ "$FAIL" != remove ]]; }
 ln(){ printf 'MOCK:ln:%s\\n' "$*"; [[ "$2" = "$OLD_LINK" && "$FAIL" != ln ]]; }
 mv(){ printf 'MOCK:mv\\n'; [[ "$FAIL" != mv ]]; }
 readlink(){ if [[ "$FAIL" = current ]]; then printf '/mock/base/releases/new\\n'; elif [[ "$1" = -f ]]; then printf '%s\\n' "$OLD_CWD"; else printf '%s\\n' "$OLD_LINK"; fi; }
 sha256sum(){ if [[ "$FAIL" = main-unit ]]; then printf 'changedhash unit\\n'; else printf 'expectedhash unit\\n'; fi; }
 systemctl(){ printf 'MOCK:systemctl:%s\\n' "$*"; if [[ "$1" = daemon-reload ]]; then [[ "$#" = 1 && "$FAIL" != reload ]]; else [[ "$1" = restart && "$2" = "$UNIT" && "$FAIL" != restart ]]; fi; }
 curl(){ printf 'MOCK:curl\\n'; [[ "$FAIL" != health ]]; }
 python3(){ printf 'MOCK:python3\\n'; [[ "$FAIL" != process ]]; }
 seq(){ printf '1\\n'; }
 sleep(){ :; }
 ${helpers}
 ${rollback}
 false
 rollback
 `;
 const result=spawnSync('bash',['-c',harness],{encoding:'utf8'});
 const output=result.stdout+result.stderr;
 if(managed){assert(!output.includes('MOCK:rm:'),'Managed rollback attempted to delete prior config');assert(!output.includes('MOCK:systemctl:daemon-reload'),'Managed rollback needlessly reloaded preserved config');}
 fs.rmSync(folder,{recursive:true,force:true});
 assert.notEqual(result.status,0,`Rollback must retain original deployment failure: ${scenario}`);
 if(['success','config-only','config-absent'].includes(failure))assert(output.includes('ROLLBACK_VERIFIED'),`Successful restoration was not verified (${scenario}): ${output}`);
 else{
  assert(!output.includes('ROLLBACK_VERIFIED'),`False rollback verification after ${scenario} failure: ${output}`);
  assert(output.includes('ROLLBACK_HEALTH_FAILED'),`Missing explicit rollback failure: ${scenario}`);
  if(failure.startsWith('foreign-'))assert(!output.includes('MOCK:rm:'),'Rollback attempted to delete foreign configuration');
 }
 console.log(`PASS rollback branch ${scenario}`);
}
console.log(`${fixtures.length} independent mocked rollback branches passed; no production commands or network executed.`);

const preflight=source.match(/OLD_CWD="\$\(python3[^\n]*<<'PY'\n([\s\S]*?)\nPY\n\)"/)?.[1];
assert(preflight,'Actual identity gate not found');
const identityCases=['legacy-success','managed-success','exec-extra-arg','user','pid-uid','cwd','listener','storage','environment','dropin','owned-existing','cli-missing','build-missing','managed-bytes','managed-symlink','managed-owner','managed-writable','managed-argv','managed-server-missing','parent-symlink','parent-owner','parent-writable','fs-foreign-unloaded'];
for(const scenario of identityCases){
 const managed=scenario.startsWith('managed-');
 const harness=`
import os,pathlib,pwd,grp,subprocess,sys,types
scenario=${JSON.stringify(scenario)}; managed=${managed?'True':'False'}
base='/opt/content-factory';runtime='/var/lib/content-factory';envfile='/etc/content-factory/app.env';old=base+'/releases/old'
dropin='/etc/systemd/system/content-factory.service.d/90-content-factory-release.conf';parent=os.path.dirname(dropin)
template='[Service]\\nExecStart=\\nExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js\\n'
sys.argv=['qa',base,'content-factory.service',runtime,envfile,template]
execstart='{ path=/usr/bin/env ; argv[]=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js ; ignore_errors=no ; }' if managed else '{ path=/usr/bin/node ; argv[]=/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3087 ; ignore_errors=no ; }'
props={'User':'content-factory','Group':'content-factory','ActiveState':'active','SubState':'running','MainPID':'123','WorkingDirectory':base+'/current','ExecStart':execstart,'EnvironmentFiles':envfile+' (ignore_errors=no)','DropInPaths':dropin if managed else '', 'FragmentPath':'/etc/systemd/system/content-factory.service'}
if scenario in ['exec-extra-arg','managed-argv']:props['ExecStart']=execstart.replace(' ; ignore_errors=no',' --extra ; ignore_errors=no')
if scenario=='user':props['User']='other'
if scenario=='environment':props['EnvironmentFiles']=''
if scenario=='dropin':props['DropInPaths']='/unexpected/override.conf'
mock_properties=dict(props)
subprocess.check_output=lambda *a,**kw:'\\n'.join(k+'='+v for k,v in mock_properties.items())+'\\n'
pwd.getpwnam=lambda name:types.SimpleNamespace(pw_uid=980)
grp.getgrnam=lambda name:types.SimpleNamespace(gr_gid=980)
os.path.isfile=lambda path:not ((scenario=='cli-missing' and str(path).endswith('/node_modules/next/dist/bin/next')) or (scenario=='build-missing' and str(path).endswith('/.next/BUILD_ID')) or (scenario=='managed-server-missing' and str(path).endswith('/server.js')))
os.path.lexists=lambda path:path==parent or (path==dropin and (managed or scenario=='owned-existing'))
os.path.isdir=lambda path:True
os.path.islink=lambda path:(scenario=='managed-symlink' and path==dropin) or (scenario=='parent-symlink' and path==parent)
def mocked_stat(path,**kw):
 insecure=(scenario=='managed-writable' and path==dropin) or (scenario=='parent-writable' and path==parent)
 foreign=(scenario=='managed-owner' and path==dropin) or (scenario=='parent-owner' and path==parent)
 return types.SimpleNamespace(st_uid=1000 if foreign else 0,st_gid=0,st_mode=0o100666 if insecure else 0o100644)
os.stat=mocked_stat
os.listdir=lambda path:([os.path.basename(dropin)] if managed else [])+(['foreign.conf'] if scenario=='fs-foreign-unloaded' else [])
def realpath(path):
 if path==base+'/current':return old
 if path.endswith('/.env.production'):return envfile
 relative=path.rsplit('/',1)[-1]
 return '/wrong/storage' if scenario=='storage' else runtime+'/'+relative
os.path.realpath=realpath
def readlink(path):
 path=str(path)
 if path.endswith('/cwd'):return '/wrong/cwd' if scenario=='cwd' else old
 return 'socket:[9999]' if scenario=='listener' else 'socket:[4242]'
os.readlink=readlink
class FakePath:
 def __init__(self,path):self.path=str(path)
 def glob(self,pattern):return iter(([dropin] if managed else [])+([parent+'/foreign.conf'] if scenario=='fs-foreign-unloaded' else []))
 def read_bytes(self):return b'foreign configuration' if scenario=='managed-bytes' else template.encode()
 def read_text(self):
  if self.path.endswith('/status'):return 'Uid:\\t'+('0' if scenario=='pid-uid' else '980')+'\\t980\\t980\\t980\\n'
  return 'header\\n0: 00000000:0C0F 00000000:0000 0A 0 0 0 0 980 4242\\n'
 def iterdir(self):return iter(['/proc/123/fd/8'])
pathlib.Path=FakePath
exec(compile(${JSON.stringify(preflight)},'<actual-deploy-preflight>','exec'))
`;
 const result=spawnSync('python3',['-c',harness],{encoding:'utf8'});
 assert.equal(result.status===0,scenario.endsWith('-success'),`Identity branch ${scenario} unexpected: ${result.stdout+result.stderr}`);
 console.log(`PASS actual identity gate ${scenario}`);
}

// Execute the real post-preflight snapshot block: a changed config must not be adopted as prior state.
const snapshotStart=source.indexOf('if [[ "$PREVIOUS_CONFIG" = 1 ]]; then\n [[ "$(stat -c \'%u\'');
const snapshotEnd=source.indexOf('\nfi\nsystemctl show',snapshotStart);
assert(snapshotStart>=0&&snapshotEnd>snapshotStart,'Actual managed snapshot block not found');
const snapshot=source.slice(snapshotStart,snapshotEnd+3);
for(const failure of ['success','changed-bytes','nonroot-owner','writable-mode']){
 const folder=fs.mkdtempSync('/tmp/independent-config-snapshot-'),backup=folder+'/backup';fs.mkdirSync(backup);
 const expected='[Service]\nExecStart=\nExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js\n';
 const dropin=folder+'/owned.conf';fs.writeFileSync(dropin,expected);fs.writeFileSync(backup+'/standalone-dropin.conf',expected);
 const st=fs.statSync(dropin),metadata=[st.dev,st.ino,st.uid,st.gid,(st.mode&0o7777).toString(8)].join(':');
 if(failure==='changed-bytes')fs.writeFileSync(dropin,'foreign raced configuration\n');
 const harness=`set -e
 PREVIOUS_CONFIG=1; DROPIN=${JSON.stringify(dropin)}; DROPIN_DIR=${JSON.stringify(folder)}; BACKUP=${JSON.stringify(backup)}; DROPIN_STATE=${JSON.stringify(metadata)}
 stat(){ if [[ "$2" = %u ]]; then printf '${failure==='nonroot-owner'?'1000':'0'}\\n'; elif [[ "$2" = %a ]]; then printf '${failure==='writable-mode'?'666':'644'}\\n'; else command stat "$@"; fi; }
 ${helpers}
 ${snapshot}
 echo CUTOVER_ALLOWED
 `;
 const result=spawnSync('bash',['-c',harness],{encoding:'utf8'});
 fs.rmSync(folder,{recursive:true,force:true});
 assert.equal(result.status===0,failure==='success',`Managed snapshot race ${failure} unexpected: ${result.stdout+result.stderr}`);
 if(failure!=='success')assert(!result.stdout.includes('CUTOVER_ALLOWED'),'Snapshot race allowed cutover');
 console.log(`PASS actual snapshot gate ${failure}`);
}
