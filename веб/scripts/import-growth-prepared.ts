import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { z } from "zod";
import { approvePreparedCandidates, preparedCatalogDigest, preparedUnitDigest, validatePreparedCandidate } from "../lib/growth-center/workspace-prepared";

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const repositoryPath = z.string().regex(/^projects\/vernatun\/[A-Za-z0-9_./-]+$/).refine(value => !value.includes("..") && !value.includes("//"));
export const preparedEvidenceManifestSchema = z.object({ version: z.literal(1), sourceCommit: z.string().regex(/^[a-f0-9]{40}$/), reports: z.array(z.object({ reportId: z.string().min(1), path: repositoryPath, sha256: sha }).strict()).min(1), departments: z.array(z.object({ unitId: z.string().min(1), version: z.number().int().positive(), role: z.string().min(1), path: repositoryPath, sha256: sha }).strict()).min(1) }).strict();

async function main() {
  const args = new Map<string, string>();
  for (let i = 2; i < process.argv.length; i += 2) { const key = process.argv[i], value = process.argv[i + 1]; if (!key?.startsWith("--") || !value || args.has(key)) throw new Error("Invalid arguments."); args.set(key, value); }
  const allowed = new Set(["--units", "--evidence", "--source-root", "--source-commit", "--approval", "--output"]);
  if ([...args.keys()].some(key => !allowed.has(key)) || ["--units", "--evidence", "--source-root", "--source-commit"].some(key => !args.has(key))) throw new Error("Required: --units --evidence --source-root --source-commit; optional --approval --output.");
  const root = await fs.realpath(path.resolve(args.get("--source-root")!)), sourceCommit = args.get("--source-commit")!;
  if (!/^[a-f0-9]{40}$/.test(sourceCommit) || execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim() !== sourceCommit) throw new Error("Source checkout must be pinned to the declared commit.");
  const raw = JSON.parse(await fs.readFile(args.get("--units")!, "utf8"));
  const batch = z.object({ version: z.literal(1), catalogId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/), sourceCommit: z.string().regex(/^[a-f0-9]{40}$/), units: z.array(z.unknown()).min(1).max(1000) }).strict().parse(raw);
  const evidence = preparedEvidenceManifestSchema.parse(JSON.parse(await fs.readFile(args.get("--evidence")!, "utf8")));
  if (batch.sourceCommit !== sourceCommit || evidence.sourceCommit !== sourceCommit) throw new Error("Source commit mismatch.");
  const units = batch.units.map(value => { const result = validatePreparedCandidate(value); if (!result.ok) throw new Error(result.errors.join("; ")); return result.data; });
  async function artifact(repoPath: string) {
    const parsed = repositoryPath.parse(repoPath), actual = await fs.realpath(path.join(root, parsed));
    if (!actual.startsWith(root + path.sep)) throw new Error("Artifact escapes pinned source checkout.");
    const relative = path.relative(root, actual).split(path.sep).join("/");
    const committed = execFileSync("git", ["show", `${sourceCommit}:${relative}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
    const working = await fs.readFile(actual);
    if (!committed.equals(working)) throw new Error("Artifact has uncommitted changes.");
    return { sha256: createHash("sha256").update(committed).digest("hex"), content: committed.toString("utf8") };
  }
  for (const unit of units) {
    if (unit.provenance.scout.sourceCommit !== sourceCommit) throw new Error("Unit research commit mismatch.");
    await artifact(unit.card.briefPath);
    const report = evidence.reports.filter(report => report.reportId === unit.provenance.scout.reportId);
    const decisions = evidence.departments.filter(decision => decision.unitId === unit.unitId && decision.version === unit.version);
    if (report.length !== 1 || decisions.length !== 1) throw new Error("Unambiguous report and department artifacts required.");
    const reportArtifact = await artifact(report[0].path), decisionArtifact = await artifact(decisions[0].path);
    if (reportArtifact.sha256 !== report[0].sha256 || decisions[0].role !== unit.provenance.department.role || decisions[0].sha256 !== unit.provenance.department.artifactSha256 || decisionArtifact.sha256 !== decisions[0].sha256) throw new Error("Evidence artifact hash/role mismatch.");
    const department = z.object({ version: z.literal(1), unitId: z.string(), unitVersion: z.number().int().positive(), role: z.string(), decision: z.literal("approved"), decidedAt: z.string(), note: z.string().min(1), research: z.object({ reportId: z.string(), reportSha256: sha }).strict() }).strict().parse(JSON.parse(decisionArtifact.content));
    if (department.unitId !== unit.unitId || department.unitVersion !== unit.version || department.role !== unit.provenance.department.role || department.decidedAt !== unit.provenance.department.decidedAt || department.note !== unit.provenance.department.note || department.research.reportId !== unit.provenance.scout.reportId || department.research.reportSha256 !== report[0].sha256) throw new Error("Department decision does not bind this research/unit version.");
  }
  const preview = { version: 1 as const, catalogId: batch.catalogId, sourceCommit, units };
  if (!args.has("--approval")) {
    if (args.has("--output")) throw new Error("Output requires explicit director approval artifact.");
    console.log(JSON.stringify({ status: "pending_director_approval", catalogId: batch.catalogId, catalogSha256: preparedCatalogDigest(preview), units: units.map(unit => ({ unitId: unit.unitId, version: unit.version, sha256: preparedUnitDigest(unit) })) }, null, 2));
    return;
  }
  const result = approvePreparedCandidates({ ...preview, approval: JSON.parse(await fs.readFile(args.get("--approval")!, "utf8")) });
  if (!result.ok) throw new Error(result.errors.join("; "));
  const output = args.get("--output"); if (!output) throw new Error("Approved output path must be explicit.");
  await fs.writeFile(output, JSON.stringify(result.data, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ status: "approved_catalog_prepared", catalogId: result.data.catalogId, units: result.data.units.length, contentSha256: result.data.contentSha256, deployed: false }));
}
main().catch(() => { console.error("prepared_catalog_import_failed: check arguments, pinned artifacts and explicit director approval; no deployment performed."); process.exitCode = 1; });
