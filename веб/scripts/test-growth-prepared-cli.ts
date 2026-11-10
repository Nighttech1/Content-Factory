import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createWorkspaceStore } from "../lib/growth-center/workspace-store";
import { preparedUnitDigest, validatePreparedCatalog } from "../lib/growth-center/workspace-prepared";
import { syntheticPreparedCandidate } from "./fixtures/prepared-catalog-fixture";

async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "prepared-cli-fixture-")), source = path.join(root, "source");
  await fs.mkdir(source);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: source, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const hash = (text: string) => createHash("sha256").update(text).digest("hex");
  const write = async (repoPath: string, text: string) => { await fs.mkdir(path.dirname(path.join(source, repoPath)), { recursive: true }); await fs.writeFile(path.join(source, repoPath), text); };
  try {
    git("init", "-q"); git("config", "user.name", "Isolated QA fixture"); git("config", "user.email", "qa-only@example.org");
    const seed = await createWorkspaceStore({ directory: path.join(root, "seed") }).read(), unit = syntheticPreparedCandidate(seed.cards[0]);
    const reportPath = "projects/vernatun/departments/scout/reports/qa-only-report.md", decisionPath = "projects/vernatun/departments/reel/qa-only-decision.json";
    const report = "# Isolated fixture report\nNo actual research or department was executed.\n";
    const decision = JSON.stringify({ version: 1, unitId: unit.unitId, unitVersion: unit.version, role: unit.provenance.department.role, decision: "approved", decidedAt: unit.provenance.department.decidedAt, note: unit.provenance.department.note, research: { reportId: unit.provenance.scout.reportId, reportSha256: hash(report) } });
    await write(reportPath, report); await write(decisionPath, decision); await write(unit.card.briefPath, "# Isolated fixture brief\nNot production content.\n");
    git("add", "."); git("commit", "-qm", "isolated prepared CLI fixture artifacts");
    const sourceCommit = git("rev-parse", "HEAD"); unit.provenance.scout.sourceCommit = sourceCommit; unit.provenance.department.artifactSha256 = hash(decision);
    const unitsFile = path.join(root, "units.json"), evidenceFile = path.join(root, "evidence.json"), approvalFile = path.join(root, "director-approval.json"), output = path.join(root, "approved-output.json");
    await fs.writeFile(unitsFile, JSON.stringify({ version: 1, catalogId: "isolated-cli-catalog", sourceCommit, units: [unit] }));
    await fs.writeFile(evidenceFile, JSON.stringify({ version: 1, sourceCommit, reports: [{ reportId: unit.provenance.scout.reportId, path: reportPath, sha256: hash(report) }], departments: [{ unitId: unit.unitId, version: unit.version, role: unit.provenance.department.role, path: decisionPath, sha256: hash(decision) }] }));
    const cli = path.resolve("scripts/import-growth-prepared.ts");
    const args = ["--units", unitsFile, "--evidence", evidenceFile, "--source-root", source, "--source-commit", sourceCommit];
    const run = (...extra: string[]) => execFileSync(process.execPath, ["--import", "tsx", cli, ...args, ...extra], { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const preview = JSON.parse(run()); assert.equal(preview.status, "pending_director_approval"); assert.equal(preview.units[0].sha256, preparedUnitDigest(unit)); await assert.rejects(fs.access(output));
    assert.throws(() => run("--output", output));
    await fs.writeFile(approvalFile, JSON.stringify({ role: "content-director", decision: "approved", reviewedAt: "2026-11-09", units: preview.units, catalogSha256: preview.catalogSha256 }));
    const saved = JSON.parse(run("--approval", approvalFile, "--output", output)); assert.equal(saved.deployed, false); assert(validatePreparedCatalog(JSON.parse(await fs.readFile(output, "utf8"))).ok);
    assert.throws(() => run("--approval", approvalFile, "--output", output)); // Never overwrite a catalog implicitly.
    await write(reportPath, report + "Uncommitted tamper");
    assert.throws(() => run());
    console.log("PASS prepared CLI: pinned local artifacts/hash+role binding, preview cannot write/approve, explicit fixture approval creates validated catalog, overwrite and uncommitted tamper rejected. Only a temporary local Git repository was used; no network or real approval.");
  } finally { await fs.rm(root, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
