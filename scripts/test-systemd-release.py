"""Isolated shell rollout checks. No SSH, real systemd or real runtime paths."""
import io
import json
import os
import pathlib
import subprocess
import sys
import tarfile
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = (ROOT / "scripts/deploy-growth-center.sh").read_text()
SHA = "a" * 40
REVISION = "offline-test"


def check_case(name, *, fail_preflight=False, fail_capacity=False, bad_revision=False, fail_restore=False,
               fail_config_write=False, fail_reload=False, fail_config_rollback=False,
               managed=False, relative_link=False, drift_before=False, drift_after=False):
    with tempfile.TemporaryDirectory(prefix="systemd-release-offline-") as folder:
        root = pathlib.Path(folder)
        base, runtime, envfile, fakebin = root / "app", root / "runtime", root / "app.env", root / "bin"
        old = base / "releases/old"
        old.mkdir(parents=True)
        fakebin.mkdir()
        (old / "node_modules/next/dist/bin").mkdir(parents=True)
        (old / "node_modules/next/dist/bin/next").write_text("// original Next CLI fixture")
        (old / ".next").mkdir()
        (old / ".next/BUILD_ID").write_text("original-build")
        if managed:
            (old / "server.js").write_text("// old managed standalone fixture")
        unitfile, dropindir = root / "content-factory.service", root / "content-factory.service.d"
        unitfile.write_text("[Service]\nExecStart=/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3087\n")
        original_unit = unitfile.read_text()
        expected_dropin = '[Service]\nExecStart=\nExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js\n'
        dropin = dropindir / '90-content-factory-release.conf'
        if managed:
            dropindir.mkdir(); dropin.write_text(expected_dropin); dropin.chmod(0o644)
            prior_dropin_inode = dropin.stat().st_ino
        envfile.write_text("OFFLINE_PLACEHOLDER=1\n")
        for relative in ["data", "generatedMedia", "public"]:
            target = runtime / relative
            target.mkdir(parents=True)
            (target / "sentinel").write_text(relative)
            (old / relative).symlink_to(target)
        (old / ".env.production").symlink_to(envfile)
        old_link = 'releases/old' if relative_link else str(old)
        (base / "current").symlink_to(old_link)
        source = root / "bundle"
        (source / ".next/static").mkdir(parents=True)
        (source / "server.js").write_text("// tested bundle fixture")
        (source / ".next/static/main.js").write_text("// fixture")
        (source / "public").mkdir()
        (source / "public/bundled-only").write_text("must not overwrite live public")
        bundle = root / "app.tar.gz"
        with tarfile.open(bundle, "w:gz") as archive:
            archive.add(source, arcname=".")
        executable = root / "adapter.sh"
        executable.write_text(SCRIPT.replace("BASE=/opt/content-factory", f"BASE={base}")
                              .replace("RUNTIME=/var/lib/content-factory", f"RUNTIME={runtime}")
                              .replace("ENVFILE=/etc/content-factory/app.env", f"ENVFILE={envfile}")
                              .replace("UNIT_FILE=/etc/systemd/system/content-factory.service", f"UNIT_FILE={unitfile}")
                              .replace("DROPIN_DIR=/etc/systemd/system/content-factory.service.d", f"DROPIN_DIR={dropindir}"))
        log = root / "commands.jsonl"
        mock = f"""#!{sys.executable}
import json,os,pathlib,subprocess,sys
command=pathlib.Path(sys.argv[0]).name
args=sys.argv[1:]
with open(os.environ['TEST_LOG'],'a') as f:f.write(json.dumps([command,args])+'\\n')
if command=='id':print('0');sys.exit(0)
if command=='sleep':sys.exit(0)
if command=='df':
 print('Filesystem 1B-blocks Used Available Use% Mounted on')
 print('fixture 999999999999 0 '+('0' if os.environ['FAIL_CAPACITY']=='1' else '999999999999')+' 0% /')
 sys.exit(0)
if command=='chown':
 assert args==['-hR','980:980',os.environ['TEST_RELEASE']]
 if os.environ['DRIFT_BEFORE']=='1':pathlib.Path(os.environ['TEST_DROPIN']).write_text('foreign change before cutover\\n')
 sys.exit(0)
if command=='stat':
 if args==['-c','%u',os.environ['TEST_DROPIN']]:print('0');sys.exit(0)
 sys.exit(subprocess.run(['/usr/bin/stat']+args).returncode)
if command=='python3':
 code=sys.stdin.read()
 if args and args[0]=='-' and len(args)==6:
  if os.environ['FAIL_PREFLIGHT']=='1':sys.exit(3)
  print(os.environ['TEST_OLD']);sys.exit(0)
 if args and args[0]=='-':
  assert pathlib.Path(os.environ['TEST_CURRENT']).resolve()==pathlib.Path(args[-1])
  sys.exit(0)
 result=subprocess.run([sys.executable]+args,input=code,text=True)
 sys.exit(result.returncode)
if command=='systemctl':
 assert args==['daemon-reload'] or 'content-factory.service' in args
 if args==['daemon-reload'] and os.environ['FAIL_RELOAD']=='1':
  calls=[json.loads(line) for line in pathlib.Path(os.environ['TEST_LOG']).read_text().splitlines()]
  if sum(c[0]=='systemctl' and c[1]==['daemon-reload'] for c in calls)==1:sys.exit(12)
 if args[0]=='restart':
  pathlib.Path(os.environ['TEST_WRITE']).write_text('write after cutover; retain on rollback')
  if os.environ['DRIFT_AFTER']=='1':pathlib.Path(os.environ['TEST_DROPIN']).write_text('foreign change after cutover\\n')
 sys.exit(0)
if command=='curl':
 if '-o' in args:
  pathlib.Path(args[args.index('-o')+1]).write_text(json.dumps({{'revision':'wrong' if os.environ['BAD_REVISION']=='1' else '{REVISION}'}}))
 sys.exit(0)
if command=='mv':
 if os.environ['FAIL_RESTORE']=='1' and any('.rollback-' in arg for arg in args):sys.exit(9)
 sys.exit(subprocess.run(['/usr/bin/mv']+args).returncode)
if command=='install':
 if os.environ['FAIL_CONFIG_WRITE']=='1' and args[-1]==os.environ['TEST_DROPIN']:sys.exit(10)
 sys.exit(subprocess.run(['/usr/bin/install']+args).returncode)
if command=='rm':
 assert args==['-f','--',os.environ['TEST_DROPIN']]
 if os.environ['FAIL_CONFIG_ROLLBACK']=='1':sys.exit(11)
 sys.exit(subprocess.run(['/usr/bin/rm']+args).returncode)
raise SystemExit('Unexpected mock command')
"""
        for namebin in ["id", "df", "chown", "stat", "python3", "systemctl", "curl", "sleep", "mv", "install", "rm"]:
            file = fakebin / namebin
            file.write_text(mock)
            file.chmod(0o755)
        newrelease = base / "releases" / SHA
        env = {**os.environ, "PATH": str(fakebin) + os.pathsep + os.environ["PATH"],
               "TEST_LOG": str(log), "TEST_OLD": str(old), "TEST_RELEASE": str(newrelease),
               "TEST_CURRENT": str(base / "current"), "TEST_WRITE": str(runtime / "data/post-cutover"),
               "TEST_DROPIN": str(dropindir / "90-content-factory-release.conf"),
               "FAIL_PREFLIGHT": str(int(fail_preflight)), "FAIL_CAPACITY": str(int(fail_capacity)),
               "BAD_REVISION": str(int(bad_revision)), "FAIL_RESTORE": str(int(fail_restore)),
               "FAIL_CONFIG_WRITE": str(int(fail_config_write)), "FAIL_RELOAD": str(int(fail_reload)),
               "FAIL_CONFIG_ROLLBACK": str(int(fail_config_rollback)),
               "DRIFT_BEFORE": str(int(drift_before)), "DRIFT_AFTER": str(int(drift_after))}
        run = subprocess.run(["bash", str(executable), SHA, str(bundle), REVISION],
                             env=env, capture_output=True, text=True, timeout=30)
        calls = [json.loads(line) for line in log.read_text().splitlines()]
        restarts = [call for call in calls if call[0] == "systemctl" and call[1][0] == "restart"]
        for relative in ["data", "generatedMedia", "public"]:
            assert (runtime / relative / "sentinel").read_text() == relative
            assert (old / relative).resolve() == runtime / relative
        assert envfile.read_text() == "OFFLINE_PLACEHOLDER=1\n"
        assert unitfile.read_text() == original_unit
        if managed:
            assert not any(c[0]=='install' and c[1][-1]==str(dropin) for c in calls)
            assert not any(c[0]=='systemctl' and c[1]==['daemon-reload'] for c in calls)
            assert not any(c[0]=='rm' for c in calls)
            assert dropin.stat().st_ino == prior_dropin_inode
            if not drift_before and not drift_after:
                assert dropin.read_text() == expected_dropin and dropin.stat().st_mode & 0o777 == 0o644
        if fail_preflight or fail_capacity:
            assert run.returncode != 0 and (base / "current").resolve() == old
            assert not newrelease.exists() and not restarts and not (base / "backups").exists()
        elif drift_before or drift_after:
            assert run.returncode != 0 and 'DEPLOY_VERIFIED' not in run.stdout
            assert 'foreign change' in dropin.read_text()
            assert 'ROLLBACK_VERIFIED' not in run.stderr
            if drift_before:
                assert (base / 'current').resolve() == old and not restarts
            else:
                assert 'ROLLBACK_HEALTH_FAILED' in run.stderr and len(restarts) == 1
                assert (runtime / 'data/post-cutover').is_file()
        elif fail_config_write or fail_reload:
            assert run.returncode != 0 and (base / "current").resolve() == old
            assert "DEPLOY_VERIFIED" not in run.stdout
            if fail_config_rollback:
                assert "ROLLBACK_VERIFIED" not in run.stderr and "ROLLBACK_HEALTH_FAILED" in run.stderr
                assert not restarts
            else:
                assert "ROLLBACK_VERIFIED" in run.stderr and len(restarts) == 1
                assert not pathlib.Path(env['TEST_DROPIN']).exists()
        elif bad_revision:
            assert run.returncode != 0 and "DEPLOY_VERIFIED" not in run.stdout
            assert (runtime / "data/post-cutover").is_file()
            if fail_restore:
                assert "ROLLBACK_VERIFIED" not in run.stderr and "ROLLBACK_HEALTH_FAILED" in run.stderr
                assert len(restarts) == 1, "Failed restoration must not restart or report verification"
            else:
                assert (base / "current").resolve() == old and len(restarts) == 2
                assert os.readlink(base / 'current') == old_link
                assert "ROLLBACK_VERIFIED" in run.stderr
                assert pathlib.Path(env['TEST_DROPIN']).exists() == managed
        else:
            assert run.returncode == 0, run.stderr
            assert (base / "current").resolve() == newrelease and len(restarts) == 1
            assert "DEPLOY_VERIFIED" in run.stdout
            assert pathlib.Path(env['TEST_DROPIN']).read_text() == '[Service]\nExecStart=\nExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js\n'
            for relative in ["data", "generatedMedia", "public"]:
                assert (newrelease / relative).resolve() == runtime / relative
            assert (newrelease / ".env.production").resolve() == envfile
            assert not (runtime / "public/bundled-only").exists()
            backups = list((base / "backups").iterdir())
            assert len(backups) == 1 and backups[0].stat().st_mode & 0o777 == 0o700
            assert (backups[0] / "previous-release.tar.gz").is_file()
            assert (backups[0] / "runtime-live-copy.tar.gz").is_file()
            assert (backups[0] / "app.env").stat().st_mode & 0o777 == 0o600
            assert (backups[0] / "original-unit.service").read_text() == original_unit
            if managed:
                assert (backups[0] / 'prior-dropin.conf').read_text() == expected_dropin
                assert (backups[0] / 'prior-dropin-metadata').is_file()
        print("PASS", name)


check_case("read-only identity failure leaves old release and no backups/staging", fail_preflight=True)
check_case("insufficient capacity leaves old release and no backups/staging", fail_capacity=True)
check_case("success preserves external storage/public/env and restarts only existing unit")
check_case("revision failure restores old symlink and retains shared writes", bad_revision=True)
check_case("failed rollback mv cannot report verified or restart wrong current", bad_revision=True, fail_restore=True)
check_case("config write failure before cutover restores original CLI and leaves current old", fail_config_write=True)
check_case("daemon reload failure before cutover removes only owned config and restores original CLI", fail_reload=True)
check_case("failed config rollback cannot report verified or restart", fail_reload=True, fail_config_rollback=True)
check_case("managed success preserves existing config inode/mode and skips reload/write", managed=True)
check_case("managed rollback retains previous config and exact relative current target", managed=True, bad_revision=True, relative_link=True)
check_case("managed foreign change before cutover is not overwritten", managed=True, drift_before=True)
check_case("managed foreign change after cutover is not erased or falsely verified", managed=True, drift_after=True)
