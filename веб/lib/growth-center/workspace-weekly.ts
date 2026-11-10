import { flushWorkspaceGit } from "./workspace-github";
import { getWorkspaceStore } from "./workspace-store";

let timer: ReturnType<typeof setInterval> | undefined;
let running = false;
export async function freezeGrowthWorkspace() {
  const store = getWorkspaceStore();
  const state = await store.sealDueWeeks();
  await flushWorkspaceGit(store);
  return { revision: state.revision, snapshots: state.snapshots.length };
}
export function startGrowthWorkspaceScheduler() {
  if (process.env.GROWTH_WORKSPACE_SCHEDULER !== "1" || timer) return;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await freezeGrowthWorkspace(); } catch { /* No secret/path/provider payload in logs. Next tick performs safe catch-up. */ }
    finally { running = false; }
  };
  void tick();
  timer = setInterval(() => { void tick(); }, 30000); timer.unref();
}
