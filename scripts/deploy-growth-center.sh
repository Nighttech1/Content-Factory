#!/usr/bin/env bash
# Runs remotely; credentials never printed. No provisioning, database migration or nginx changes.
set -Eeuo pipefail
umask 077
SOURCE_SHA="${1:?source SHA}"; BUNDLE="${2:?bundle path}"; REVISION="${3:?dataset revision}"
[[ "$SOURCE_SHA" =~ ^[a-f0-9]{40}$ ]] || exit 2
BASE=/opt/content-factory
RELEASE="$BASE/releases/$SOURCE_SHA"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)-$SOURCE_SHA"
BACKUP="$BASE/backups/$STAMP"
for cmd in node pm2 curl tar; do command -v "$cmd" >/dev/null; done
[[ "$(node -p 'Number(process.versions.node.split(".")[0])>=20')" = true ]]
[[ -d "$BASE" && ! -e "$RELEASE" ]]
# Historical deploy chowned APP_DIR to SSH_USER and ran PM2 WITHOUT sudo.
# Prove that context before mkdir or a PM2 command (which could otherwise spawn a new daemon).
CURRENT_UID="$(id -u)"
[[ "$(stat -c %u "$BASE")" = "$CURRENT_UID" ]] || {
 echo 'PRECHECK_CONTEXT: SSH user does not own existing app directory; inspect original deploy user, do not sudo PM2 blindly' >&2; exit 3;
}
PM2_STATE="${PM2_HOME:-$HOME/.pm2}"
[[ -r "$PM2_STATE/pm2.pid" ]] || { echo 'PRECHECK_CONTEXT: no existing PM2 daemon for SSH user; no new manager started' >&2; exit 3; }
PM2_PID="$(cat "$PM2_STATE/pm2.pid")"
[[ "$PM2_PID" =~ ^[0-9]+$ && "$(ps -o uid= -p "$PM2_PID" | tr -d '[:space:]')" = "$CURRENT_UID" ]] || {
 echo 'PRECHECK_CONTEXT: stale or differently owned PM2 daemon; inspection required' >&2; exit 3;
}
[[ "$(ps -o args= -p "$PM2_PID")" = *"God Daemon"* ]] || { echo 'PRECHECK_CONTEXT: unexpected daemon process' >&2; exit 3; }
[[ -w "$BASE" && -x "$BASE" ]] || { echo 'PRECHECK_PERMISSION: app directory not writable; no mutation attempted' >&2; exit 3; }
pm2 jlist | node -e '
const fs=require("fs");const base="/opt/content-factory";
const matches=JSON.parse(fs.readFileSync(0,"utf8")).filter(p=>p.name==="content-factory");
if(matches.length!==1)throw Error("Expected exactly one existing content-factory process in SSH-user manager");
const p=matches[0].pm2_env,cwd=fs.realpathSync(p.pm_cwd);
if(!(cwd===base||cwd.startsWith(base+"/releases/")))throw Error("Unexpected existing content app cwd");
if(p.pm_exec_path!==cwd+"/server.js")throw Error("Unexpected content app entrypoint");
if(String(p.env?.PORT??p.PORT)!=="8088")throw Error("Existing content app is not port8088; inspect before release");
'
echo 'PRECHECK_OK: SSH-user PM2 manager, existing content app and writable app directory confirmed'
mkdir -p "$BASE/releases" "$BASE/backups" "$BASE/shared"
chmod 700 "$BASE/backups"
mkdir "$BACKUP" "$RELEASE"
pm2 jlist > "$BACKUP/processes.json"
node - "$BACKUP" "$BASE" "$RELEASE" <<'NODE'
const fs=require('fs'),path=require('path');const [backup,base,release]=process.argv.slice(2);
const proc=JSON.parse(fs.readFileSync(path.join(backup,'processes.json'))).filter(p=>p.name==='content-factory');
if(proc.length!==1)throw Error('Expected exactly one existing content-factory process');
const p=proc[0].pm2_env,cwd=fs.realpathSync(p.pm_cwd);
if(!(cwd===base||cwd.startsWith(base+'/releases/')))throw Error('Unexpected app cwd');
if(!fs.existsSync(p.pm_exec_path))throw Error('Missing old entry');
const old={apps:[{name:'content-factory',script:p.pm_exec_path,cwd,env:{...p.env,PORT:'8088',HOSTNAME:'0.0.0.0',NODE_ENV:'production'}}]};
fs.writeFileSync(path.join(backup,'rollback.config.cjs'),'module.exports='+JSON.stringify(old));
fs.writeFileSync(path.join(backup,'old-cwd'),cwd);
const next={apps:[{...old.apps[0],script:path.join(release,'server.js'),cwd:release}]};
fs.writeFileSync(path.join(backup,'next.config.cjs'),'module.exports='+JSON.stringify(next));
NODE
OLD_CWD="$(cat "$BACKUP/old-cwd")"
OLD_LINK="$(readlink "$BASE/current" || true)"
SWITCHED=0
rollback(){
 local code=$?
 trap - ERR
 if [[ "$SWITCHED" = 1 ]]; then
   if [[ -n "$OLD_LINK" ]]; then ln -sfn "$OLD_LINK" "$BASE/.rollback-current"; mv -Tf "$BASE/.rollback-current" "$BASE/current"; elif [[ -L "$BASE/current" ]]; then unlink "$BASE/current"; fi
   pm2 delete content-factory >/dev/null 2>&1 || true
   pm2 start "$BACKUP/rollback.config.cjs" --only content-factory >/dev/null
   pm2 save >/dev/null
   curl --fail --silent --max-time 20 http://127.0.0.1:8088/marketing >/dev/null || echo 'ROLLBACK_HEALTH_FAILED' >&2
 fi
 echo "Release failed; rollback attempted; backup retained" >&2
 exit "$code"
}
trap rollback ERR
# Backup before stopping; mutable directories are copied again after process stop.
tar -C "$BASE" --exclude=./releases --exclude=./backups --exclude=./shared -czf "$BACKUP/previous-app.tar.gz" .
tar -tzf "$BUNDLE" >/dev/null
# Reject archive path traversal before extraction.
node - "$BUNDLE" <<'NODE'
const{execFileSync}=require('child_process');const paths=execFileSync('tar',['-tzf',process.argv[2]],{maxBuffer:32*1024*1024}).toString().split('\n');
if(paths.some(p=>p.startsWith('/')||p.split('/').includes('..')))throw Error('Unsafe archive path');
NODE
tar -C "$RELEASE" -xzf "$BUNDLE"
[[ -f "$RELEASE/server.js" ]]
pm2 stop content-factory >/dev/null
SWITCHED=1
for relative in data generatedMedia public/vernatun-jobs public/uploads; do
 shared="$BASE/shared/$relative"; old="$OLD_CWD/$relative"; fresh="$RELEASE/$relative"
 mkdir -p "$(dirname "$shared")" "$(dirname "$fresh")"
 if [[ -e "$shared" && -e "$old" && "$(readlink -f "$old")" != "$(readlink -f "$shared")" ]]; then
   echo 'Existing shared data differs from live storage location; inspection required' >&2; false
 fi
 if [[ ! -e "$shared" ]]; then
   staged="$shared.initial-$STAMP"
   if [[ -d "$old" ]]; then cp -aL "$old" "$staged"; else mkdir -p "$staged"; fi
   mv "$staged" "$shared"
 fi
 # Old release also uses shared storage, so rollback retains writes after cutover.
 if [[ -e "$old" && "$(readlink -f "$old")" != "$(readlink -f "$shared")" ]]; then
   mv "$old" "$BACKUP/$(echo "$relative" | tr / _)-previous-live"
   ln -s "$shared" "$old"
 elif [[ ! -e "$old" && ! -L "$old" ]]; then
   mkdir -p "$(dirname "$old")"; ln -s "$shared" "$old"
 fi
 # Never replace live shared data with bundled fixtures.
 if [[ -e "$fresh" || -L "$fresh" ]]; then mv "$fresh" "$BACKUP/$(echo "$relative" | tr / _)-bundled"; fi
 ln -s "$shared" "$fresh"
done
# Preserve runtime-loaded environment files without printing their contents.
mkdir -p "$BASE/shared/env"; chmod 700 "$BASE/shared/env"
for envname in .env .env.local .env.production .env.production.local; do
 old="$OLD_CWD/$envname"; shared="$BASE/shared/env/$envname"; fresh="$RELEASE/$envname"
 if [[ -f "$old" && ! -e "$shared" ]]; then cp -pL "$old" "$shared"; chmod 600 "$shared"; fi
 if [[ -f "$shared" ]]; then
   if [[ -e "$fresh" || -L "$fresh" ]]; then mv "$fresh" "$BACKUP/$envname-bundled"; fi
   ln -s "$shared" "$fresh"
 fi
done
ln -s "$RELEASE" "$BASE/.next-current"
mv -Tf "$BASE/.next-current" "$BASE/current"
pm2 delete content-factory >/dev/null
pm2 start "$BACKUP/next.config.cjs" --only content-factory >/dev/null
for attempt in $(seq 1 30); do
 if curl --fail --silent --max-time 3 http://127.0.0.1:8088/api/growth-center -o "$BACKUP/health.json"; then break; fi
 [[ "$attempt" -lt 30 ]]; sleep 2
done
node - "$BACKUP/health.json" "$REVISION" <<'NODE'
const d=JSON.parse(require('fs').readFileSync(process.argv[2]));if(d.revision!==process.argv[3])throw Error('Deployed revision mismatch');
NODE
for route in "" growth marketing studio schedule; do
 curl --fail --silent --max-time 30 "http://127.0.0.1:8088/$route" >/dev/null
 curl --fail --silent --max-time 30 "https://content.vernatunspeakclub.com/$route" >/dev/null
done
curl --fail --silent --max-time 30 https://content.vernatunspeakclub.com/api/growth-center -o "$BACKUP/public-health.json"
node - "$BACKUP/public-health.json" "$REVISION" <<'NODE'
const d=JSON.parse(require('fs').readFileSync(process.argv[2]));if(d.revision!==process.argv[3])throw Error('Public revision mismatch');
NODE
pm2 save >/dev/null
trap - ERR
echo "DEPLOY_VERIFIED source=$SOURCE_SHA revision=$REVISION target=content.vernatunspeakclub.com"
