import { getWorkspaceStore, type WorkspaceOutboxItem, type WorkspaceStore } from "./workspace-store";

type Env = Record<string, string | undefined>;
type Fetcher = typeof fetch;
export function readGitConfig(env: Env = process.env) {
  const repository = env.GROWTH_GITHUB_REPOSITORY ?? "", branch = env.GROWTH_GITHUB_BRANCH ?? "", scoutBranch = env.GROWTH_SCOUT_BRANCH ?? "codex/scout-handoff-20261109", token = env.GROWTH_GITHUB_TOKEN ?? "";
  const branchValid = (value: string) => value.length > 0 && value.length <= 200 && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) && !value.includes("..") && !value.includes("//") && !value.endsWith("/") && !value.endsWith(".lock");
  return { repository, branch, scoutBranch, token, configured: /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) && branchValid(branch) && branchValid(scoutBranch) && branch !== scoutBranch && token.length > 0 };
}
class GitFailure extends Error { constructor(public status: number) { super("github_delivery_failed"); } }
const shaValid = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{40,64}$/.test(value);
const encodePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");
/** Immutable payload/path, verified exact bytes, fast-forward-only Git CAS. Never searches or runs Scout. */
export async function deliverWorkspaceItem(item: WorkspaceOutboxItem, env: Env = process.env, fetcher: Fetcher = fetch): Promise<string> {
  const config = readGitConfig(env);
  if (!config.configured) throw new GitFailure(503);
  const prefix = item.kind === "backup" ? "projects/vernatun/content-plan/workspace-history/" : "projects/vernatun/departments/scout/requests/growth/";
  if (!item.path.startsWith(prefix) || item.path.includes("..") || !/^[A-Za-z0-9_./-]+$/.test(item.path)) throw new GitFailure(400);
  const branch = item.kind === "scout" ? config.scoutBranch : config.branch;
  const root = `https://api.github.com/repos/${config.repository}`;
  async function request(route: string, method = "GET", body?: unknown, allowMissing = false): Promise<Record<string, unknown> | null> {
    const response = await fetcher(root + route, { method, headers: { Authorization: `Bearer ${config.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000), redirect: "error" });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new GitFailure(response.status);
    return await response.json() as Record<string, unknown>;
  }
  async function fileState(ref: string) {
    const file = await request(`/contents/${encodePath(item.path)}?ref=${encodeURIComponent(ref)}`, "GET", undefined, true);
    if (!file) return "absent";
    if (file.type !== "file" || file.encoding !== "base64" || typeof file.content !== "string") throw new GitFailure(502);
    return Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8") === item.payload ? "same" : "different";
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await request(`/git/ref/heads/${encodePath(branch)}`);
    const head = (ref?.object as { sha?: unknown } | undefined)?.sha;
    if (!shaValid(head)) throw new GitFailure(502);
    const existing = await fileState(head);
    if (existing === "same") return head; // Exact bytes at a confirmed commit, never the blob SHA.
    if (existing === "different") throw new GitFailure(409); // Immutable paths may never overwrite another instance/history.
    const commit = await request(`/git/commits/${head}`), tree = (commit?.tree as { sha?: unknown } | undefined)?.sha;
    if (!shaValid(tree)) throw new GitFailure(502);
    const blob = await request("/git/blobs", "POST", { content: item.payload, encoding: "utf-8" });
    if (!shaValid(blob?.sha)) throw new GitFailure(502);
    const newTree = await request("/git/trees", "POST", { base_tree: tree, tree: [{ path: item.path, mode: "100644", type: "blob", sha: blob.sha }] });
    if (!shaValid(newTree?.sha)) throw new GitFailure(502);
    const next = await request("/git/commits", "POST", { message: item.kind === "backup" ? `growth: preserve workspace revision ${item.revision}` : `growth: queue manual Scout request ${item.id}`, tree: newTree.sha, parents: [head] });
    if (!shaValid(next?.sha)) throw new GitFailure(502);
    try {
      const updated = await request(`/git/refs/heads/${encodePath(branch)}`, "PATCH", { sha: next.sha, force: false });
      if ((updated?.object as { sha?: unknown } | undefined)?.sha !== next.sha || await fileState(next.sha) !== "same") throw new GitFailure(502);
      return next.sha;
    } catch (error) { if (error instanceof GitFailure && [409, 422].includes(error.status) && attempt < 2) continue; throw error; }
  }
  throw new GitFailure(409);
}
const flushing = new WeakMap<WorkspaceStore, Promise<void>>();
export function flushWorkspaceGit(store: WorkspaceStore = getWorkspaceStore(), env: Env = process.env, fetcher: Fetcher = fetch, limit = 5): Promise<void> {
  const current = flushing.get(store); if (current) return current;
  const run = (async () => {
    if (!readGitConfig(env).configured) return;
    const pending = (await store.read()).outbox.filter(item => item.state !== "synced").slice(0, limit);
    for (const item of pending) {
      try { const commitSha = await deliverWorkspaceItem(item, env, fetcher); await store.markDelivery(item.id, { commitSha, configured: true }); }
      catch { await store.markDelivery(item.id, { error: "github_delivery_unconfirmed", configured: true }); }
    }
  })();
  flushing.set(store, run);
  void run.finally(() => { flushing.delete(store); }).catch(() => undefined);
  return run;
}
