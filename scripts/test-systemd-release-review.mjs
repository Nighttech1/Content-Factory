/** Independent rollback failure-path review: extracted current Bash function, all ops mocked. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const source=fs.readFileSync(new URL('./deploy-growth-center.sh',import.meta.url),'utf8');
const rollback=source.match(/rollback\(\)\{[\s\S]*?\n\}\ntrap rollback ERR/)?.[0].replace(/\ntrap rollback ERR$/,'');
assert(rollback,'Rollback function not found; review extraction explicitly');
const helpers=source.slice(source.indexOf('verify_process_cwd(){'),source.indexOf('rollback(){'));
assert(helpers.includes('wait_old_health(){'),'Rollback verification helpers missing');
const fixtures=['success','ln','mv','current','restart','health','process'];
for(const failure of fixtures){
 const harness=`
 set +e
 BASE=/mock/base; OLD_CWD=/mock/base/releases/old; UNIT=content-factory.service; STAMP=qa; SWITCHED=1
 FAIL=${failure}
 ln(){ printf 'MOCK:ln\\n'; [[ "$FAIL" != ln ]]; }
 mv(){ printf 'MOCK:mv\\n'; [[ "$FAIL" != mv ]]; }
 readlink(){ if [[ "$FAIL" = current ]]; then printf '/mock/base/releases/new\\n'; else printf '%s\\n' "$OLD_CWD"; fi; }
 systemctl(){ printf 'MOCK:systemctl:%s\\n' "$1"; [[ "$FAIL" != restart ]]; }
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
 assert.notEqual(result.status,0,`Rollback must retain original deployment failure: ${failure}`);
 if(failure==='success')assert(output.includes('ROLLBACK_VERIFIED'),`Successful restoration was not verified: ${output}`);
 else{
  assert(!output.includes('ROLLBACK_VERIFIED'),`False rollback verification after ${failure} failure: ${output}`);
  assert(output.includes('ROLLBACK_HEALTH_FAILED'),`Missing explicit rollback failure: ${failure}`);
 }
 console.log(`PASS rollback branch ${failure}`);
}
console.log(`${fixtures.length} independent mocked rollback branches passed; no real commands or network executed.`);

const preflight=source.match(/OLD_CWD="\$\(python3[^\n]*<<'PY'\n([\s\S]*?)\nPY\n\)"/)?.[1];
assert(preflight,'Actual identity gate not found');
for(const failure of ['success','exec-extra-arg','user','pid-uid','cwd','listener','storage','environment','dropin']){
 const harness=`
import os,pathlib,pwd,grp,subprocess,sys,types
failure=${JSON.stringify(failure)}
base='/opt/content-factory';runtime='/var/lib/content-factory';envfile='/etc/content-factory/app.env';old=base+'/releases/old'
sys.argv=['qa',base,'content-factory.service',runtime,envfile]
props={'User':'content-factory','Group':'content-factory','ActiveState':'active','SubState':'running','MainPID':'123','WorkingDirectory':base+'/current','ExecStart':'{ path=/usr/bin/node ; argv[]=/usr/bin/node server.js ; ignore_errors=no ; }','EnvironmentFiles':envfile+' (ignore_errors=no)','DropInPaths':''}
if failure=='exec-extra-arg':props['ExecStart']='{ path=/usr/bin/node ; argv[]=/usr/bin/node server.js --extra ; }'
if failure=='user':props['User']='other'
if failure=='environment':props['EnvironmentFiles']=''
if failure=='dropin':props['DropInPaths']='/unexpected/override.conf'
mock_properties=dict(props)
subprocess.check_output=lambda *a,**kw:'\\n'.join(k+'='+v for k,v in mock_properties.items())+'\\n'
pwd.getpwnam=lambda name:types.SimpleNamespace(pw_uid=980)
grp.getgrnam=lambda name:types.SimpleNamespace(gr_gid=980)
os.path.isfile=lambda path:True
os.path.isdir=lambda path:True
def realpath(path):
 if path==base+'/current':return old
 if path.endswith('/.env.production'):return envfile
 relative=path.rsplit('/',1)[-1]
 return '/wrong/storage' if failure=='storage' else runtime+'/'+relative
os.path.realpath=realpath
def readlink(path):
 path=str(path)
 if path.endswith('/cwd'):return '/wrong/cwd' if failure=='cwd' else old
 return 'socket:[9999]' if failure=='listener' else 'socket:[4242]'
os.readlink=readlink
class FakePath:
 def __init__(self,path):self.path=str(path)
 def read_text(self):
  if self.path.endswith('/status'):return 'Uid:\\t'+('0' if failure=='pid-uid' else '980')+'\\t980\\t980\\t980\\n'
  return 'header\\n0: 00000000:0C0F 00000000:0000 0A 0 0 0 0 980 4242\\n'
 def iterdir(self):return iter(['/proc/123/fd/8'])
pathlib.Path=FakePath
exec(compile(${JSON.stringify(preflight)},'<actual-deploy-preflight>','exec'))
`;
 const result=spawnSync('python3',['-c',harness],{encoding:'utf8'});
 assert.equal(result.status===0,failure==='success',`Identity branch ${failure} unexpected: ${result.stdout+result.stderr}`);
 console.log(`PASS actual identity gate ${failure}`);
}

