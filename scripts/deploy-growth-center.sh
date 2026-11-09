#!/usr/bin/env bash
# Existing systemd service, initial owned standalone drop-in only; no main-unit/nginx change or DB migration.
set -Eeuo pipefail
umask 077
SOURCE_SHA="$1"; BUNDLE="$2"; REVISION="$3"
[[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ && "$REVISION" =~ ^[A-Za-z0-9._-]+$ ]] || exit 2
BASE=/opt/content-factory
RUNTIME=/var/lib/content-factory
ENVFILE=/etc/content-factory/app.env
UNIT=content-factory.service
UNIT_FILE=/etc/systemd/system/content-factory.service
DROPIN_DIR=/etc/systemd/system/content-factory.service.d
DROPIN="$DROPIN_DIR/90-content-factory-release.conf"
RELEASE="$BASE/releases/$SOURCE_SHA"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)-$SOURCE_SHA"
BACKUP="$BASE/backups/$STAMP"
for cmd in node python3 systemctl curl tar gzip chown cmp; do command -v "$cmd" >/dev/null; done
[[ "$(id -u)" = 0 ]]
[[ "$(node -p 'Number(process.versions.node.split(".")[0])>=20')" = true ]]
[[ -f "$BUNDLE" && ! -e "$RELEASE" && ! -L "$RELEASE" && -L "$BASE/current" ]]

# Strict read-only identity gate. Raw ExecStart and environment values never leave this process.
OLD_CWD="$(python3 - "$BASE" "$UNIT" "$RUNTIME" "$ENVFILE" <<'PY'
import os,pathlib,pwd,grp,re,shlex,subprocess,sys
base,unit,runtime,envfile=sys.argv[1:]
def require(ok):
 if not ok: raise SystemExit('PRECHECK_CONTEXT_FAILED: existing service identity requires inspection')
props=['User','Group','ActiveState','SubState','MainPID','WorkingDirectory','ExecStart','EnvironmentFiles','DropInPaths','FragmentPath']
raw=subprocess.check_output(['systemctl','show',unit,'--no-pager']+['--property='+p for p in props],text=True)
values=dict(line.split('=',1) for line in raw.splitlines() if '=' in line)
require(values.get('User')=='content-factory' and values.get('Group')=='content-factory')
require(pwd.getpwnam('content-factory').pw_uid==980 and grp.getgrnam('content-factory').gr_gid==980)
require(values.get('ActiveState')=='active' and values.get('SubState')=='running')
require(values.get('WorkingDirectory')==base+'/current' and not values.get('DropInPaths'))
require(values.get('FragmentPath')=='/etc/systemd/system/content-factory.service')
require(not os.path.lexists('/etc/systemd/system/content-factory.service.d/90-content-factory-release.conf'))
execstart=values.get('ExecStart','')
path=re.search(r'(?:^|[ {;])path=([^ ;}]+)',execstart)
args=re.search(r'argv\[\]=(.*?)\s*;',execstart)
require(path is not None and path[1]=='/usr/bin/node' and args is not None)
argv=shlex.split(args[1])
require(argv==['/usr/bin/node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3087'])
require(values.get('EnvironmentFiles','').strip()==envfile+' (ignore_errors=no)')
old=os.path.realpath(base+'/current')
require(old.startswith(base+'/releases/') and os.path.isfile(old+'/node_modules/next/dist/bin/next') and os.path.isfile(old+'/.next/BUILD_ID'))
pid=values.get('MainPID','')
require(pid.isdigit() and int(pid)>1)
status=pathlib.Path('/proc/'+pid+'/status').read_text()
require(re.search(r'^Uid:\s*(\d+)',status,re.M)[1]=='980')
require(os.readlink('/proc/'+pid+'/cwd')==old)
inodes=set()
for table in ['/proc/net/tcp','/proc/net/tcp6']:
 for line in pathlib.Path(table).read_text().splitlines()[1:]:
  cols=line.split()
  if len(cols)>9 and cols[3]=='0A' and cols[1].split(':')[-1].upper()==format(3087,'04X'): inodes.add(cols[9])
require(bool(inodes))
owned=False
for fd in pathlib.Path('/proc/'+pid+'/fd').iterdir():
 try: link=os.readlink(fd)
 except OSError: continue
 if link.startswith('socket:[') and link[8:-1] in inodes: owned=True
require(owned)
for relative in ['data','generatedMedia','public']:
 target=runtime+'/'+relative
 require(os.path.isdir(target) and os.path.realpath(old+'/'+relative)==target)
require(os.path.isfile(envfile) and os.path.realpath(old+'/.env.production')==envfile)
print(old)
PY
)"
echo 'PRECHECK_OK: existing content-factory systemd identity and shared paths confirmed'
[[ -f "$UNIT_FILE" && ! -e "$DROPIN" && ! -L "$DROPIN" ]]
UNIT_HASH="$(sha256sum "$UNIT_FILE" | awk '{print $1}')"

# Conservative capacity includes the old release AND the external live storage backup.
OLD_BYTES="$(du -sb "$OLD_CWD" | awk '{print $1}')"
RUNTIME_BYTES="$(du -sb "$RUNTIME" | awk '{print $1}')"
RELEASE_BYTES="$(gzip -l -- "$BUNDLE" | awk 'NR==2 {print $2}')"
AVAILABLE="$(df -PB1 "$BASE" | awk 'NR==2 {print $4}')"
[[ "$OLD_BYTES" =~ ^[0-9]+$ && "$RUNTIME_BYTES" =~ ^[0-9]+$ && "$RELEASE_BYTES" =~ ^[0-9]+$ && "$AVAILABLE" =~ ^[0-9]+$ ]]
[[ "$RELEASE_BYTES" -gt 0 && "$RELEASE_BYTES" -lt 4294967296 ]]
REQUIRED=$((2 * (OLD_BYTES + RUNTIME_BYTES) + RELEASE_BYTES + 268435456))
[[ "$AVAILABLE" -ge "$REQUIRED" ]] || { echo 'DISK_PREFLIGHT_FAILED: insufficient backup/staging capacity' >&2; exit 3; }
tar -tzf "$BUNDLE" | python3 -c 'import sys; paths=sys.stdin.read().splitlines(); assert paths and not any(p.startswith("/") or ".." in p.split("/") for p in paths), "Unsafe archive paths"'

mkdir -p "$BASE/backups"
chmod 700 "$BASE/backups"
mkdir "$BACKUP" "$RELEASE"
chmod 700 "$BACKUP"
SWITCHED=0
CONFIG_CHANGED=0
remove_owned_dropin(){
 if [[ ! -e "$DROPIN" && ! -L "$DROPIN" ]]; then return 0; fi
 [[ -f "$DROPIN" && ! -L "$DROPIN" ]] \
  && cmp -s "$BACKUP/standalone-dropin.conf" "$DROPIN" \
  && rm -f -- "$DROPIN"
}
verify_process_cwd(){
 python3 - "$UNIT" "$1" <<'PY'
import os,pathlib,re,subprocess,sys
unit,expected=sys.argv[1:]
pid=subprocess.check_output(['systemctl','show',unit,'--property=MainPID','--value'],text=True).strip()
assert pid.isdigit() and os.readlink('/proc/'+pid+'/cwd')==expected
assert re.search(r'^Uid:\s*(\d+)',pathlib.Path('/proc/'+pid+'/status').read_text(),re.M)[1]=='980'
inodes=set()
for table in ['/proc/net/tcp','/proc/net/tcp6']:
 for line in pathlib.Path(table).read_text().splitlines()[1:]:
  cols=line.split()
  if len(cols)>9 and cols[3]=='0A' and cols[1].split(':')[-1].upper()==format(3087,'04X'): inodes.add(cols[9])
owned=False
for fd in pathlib.Path('/proc/'+pid+'/fd').iterdir():
 try: link=os.readlink(fd)
 except OSError: continue
 if link.startswith('socket:[') and link[8:-1] in inodes: owned=True
assert owned
PY
}
wait_old_health(){
 local attempt
 for attempt in $(seq 1 15); do
  if curl --fail --silent --max-time 3 http://127.0.0.1:3087/marketing >/dev/null; then return 0; fi
  sleep 2
 done
 return 1
}
rollback(){
 local code=$?
 trap - ERR
 set +e
 if [[ "$SWITCHED" = 1 || "$CONFIG_CHANGED" = 1 ]]; then
   if { [[ "$CONFIG_CHANGED" != 1 ]] || remove_owned_dropin; } \
      && { [[ "$CONFIG_CHANGED" != 1 ]] || systemctl daemon-reload; } \
      && ln -s "$OLD_CWD" "$BASE/.rollback-$STAMP" \
      && mv -Tf "$BASE/.rollback-$STAMP" "$BASE/current" \
      && [[ "$(readlink -f "$BASE/current")" = "$OLD_CWD" ]] \
      && [[ "$(sha256sum "$UNIT_FILE" | awk '{print $1}')" = "$UNIT_HASH" ]] \
      && systemctl restart "$UNIT" && wait_old_health && verify_process_cwd "$OLD_CWD"; then
     echo 'ROLLBACK_VERIFIED: original release restored; shared runtime not overwritten' >&2
   else
     echo 'ROLLBACK_HEALTH_FAILED: inspect existing content-factory.service; backup retained' >&2
   fi
 fi
 echo 'DEPLOY_FAILED: original backup and staged release retained; no runtime data restore performed' >&2
 exit "$code"
}
trap rollback ERR

# File-level live backups, not a transactional database snapshot. Failure leaves old app running.
tar -C "$OLD_CWD" -czf "$BACKUP/previous-release.tar.gz" .
tar -C "$RUNTIME" -czf "$BACKUP/runtime-live-copy.tar.gz" .
install -m 600 "$ENVFILE" "$BACKUP/app.env"
install -m 600 "$UNIT_FILE" "$BACKUP/original-unit.service"
printf '%s\n' "$UNIT_HASH" > "$BACKUP/original-unit.sha256"
printf '%s\n' "$OLD_CWD" > "$BACKUP/old-current"
systemctl show "$UNIT" --property=User --property=Group --property=WorkingDirectory --property=FragmentPath > "$BACKUP/unit-identity.txt"
tar -C "$RELEASE" -xzf "$BUNDLE"
[[ -f "$RELEASE/server.js" && -d "$RELEASE/.next/static" ]]
# Never follow or chown external symlink targets.
chown -hR 980:980 "$RELEASE"
chmod 750 "$RELEASE"
for relative in data generatedMedia public; do
 fresh="$RELEASE/$relative"
 if [[ -e "$fresh" || -L "$fresh" ]]; then mv "$fresh" "$BACKUP/bundled-$relative"; fi
 ln -s "$RUNTIME/$relative" "$fresh"
done
for envname in .env .env.local .env.production .env.production.local; do
 fresh="$RELEASE/$envname"
 if [[ -e "$fresh" || -L "$fresh" ]]; then mv "$fresh" "$BACKUP/bundled-$envname"; fi
done
ln -s "$ENVFILE" "$RELEASE/.env.production"
for relative in data generatedMedia public; do
 [[ "$(readlink -f "$RELEASE/$relative")" = "$RUNTIME/$relative" ]]
done
[[ "$(readlink -f "$RELEASE/.env.production")" = "$ENVFILE" ]]
[[ "$(readlink -f "$BASE/current")" = "$OLD_CWD" ]]
# Original unit uses Next CLI; the verified artifact is standalone. Only this owned initial drop-in changes.
printf '%s\n' '[Service]' 'ExecStart=' 'ExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js' > "$BACKUP/standalone-dropin.conf"
CONFIG_CHANGED=1
install -d -m 755 "$DROPIN_DIR"
[[ ! -e "$DROPIN" && ! -L "$DROPIN" ]]
install -m 644 "$BACKUP/standalone-dropin.conf" "$DROPIN"
systemctl daemon-reload
[[ "$(sha256sum "$UNIT_FILE" | awk '{print $1}')" = "$UNIT_HASH" ]]
ln -s "$RELEASE" "$BASE/.next-$STAMP"
SWITCHED=1
mv -Tf "$BASE/.next-$STAMP" "$BASE/current"
systemctl restart "$UNIT"
for attempt in $(seq 1 30); do
 if curl --fail --silent --max-time 3 http://127.0.0.1:3087/api/growth-center -o "$BACKUP/health.json"; then break; fi
 [[ "$attempt" -lt 30 ]]; sleep 2
done
node - "$BACKUP/health.json" "$REVISION" <<'NODE'
const d=JSON.parse(require('fs').readFileSync(process.argv[2]));if(d.revision!==process.argv[3])throw Error('Local revision mismatch');
NODE
for route in "" growth marketing studio schedule settings; do
 curl --fail --silent --max-time 30 "http://127.0.0.1:3087/$route" >/dev/null
 curl --fail --silent --max-time 30 "https://content.vernatunspeakclub.com/$route" >/dev/null
done
curl --fail --silent --max-time 30 https://content.vernatunspeakclub.com/api/growth-center -o "$BACKUP/public-health.json"
node - "$BACKUP/public-health.json" "$REVISION" <<'NODE'
const d=JSON.parse(require('fs').readFileSync(process.argv[2]));if(d.revision!==process.argv[3])throw Error('Public revision mismatch');
NODE
systemctl is-active --quiet "$UNIT"
[[ "$(readlink -f "$BASE/current")" = "$RELEASE" ]]
python3 - "$UNIT" "$RELEASE" <<'PY'
import os,pathlib,re,subprocess,sys
unit,release=sys.argv[1:]
pid=subprocess.check_output(['systemctl','show',unit,'--property=MainPID','--value'],text=True).strip()
assert pid.isdigit() and os.readlink('/proc/'+pid+'/cwd')==release
assert re.search(r'^Uid:\s*(\d+)',pathlib.Path('/proc/'+pid+'/status').read_text(),re.M)[1]=='980'
inodes=set()
for table in ['/proc/net/tcp','/proc/net/tcp6']:
 for line in pathlib.Path(table).read_text().splitlines()[1:]:
  cols=line.split()
  if len(cols)>9 and cols[3]=='0A' and cols[1].split(':')[-1].upper()==format(3087,'04X'): inodes.add(cols[9])
owned=False
for fd in pathlib.Path('/proc/'+pid+'/fd').iterdir():
 try: link=os.readlink(fd)
 except OSError: continue
 if link.startswith('socket:[') and link[8:-1] in inodes: owned=True
assert owned
PY
for relative in data generatedMedia public; do
 [[ "$(readlink -f "$RELEASE/$relative")" = "$RUNTIME/$relative" && "$(readlink -f "$OLD_CWD/$relative")" = "$RUNTIME/$relative" ]]
done
[[ "$(readlink -f "$RELEASE/.env.production")" = "$ENVFILE" ]]
[[ "$(sha256sum "$UNIT_FILE" | awk '{print $1}')" = "$UNIT_HASH" ]]
trap - ERR
echo "DEPLOY_VERIFIED source=$SOURCE_SHA revision=$REVISION target=content.vernatunspeakclub.com manager=content-factory.service port=3087"
