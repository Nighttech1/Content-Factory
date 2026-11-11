import { getWorkspaceStore } from "./workspace-store";
let timer: ReturnType<typeof setInterval> | undefined;
let running = false;
/** Long-lived standalone VPS: data refresh only, never runs content agents or publishes. */
export function startEditorialScheduler() {
  if (timer || process.env.GROWTH_EDITORIAL_SYNC === "0") return;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await getWorkspaceStore().read(); } catch { /* Persistent last-good/error is read by API; never reset runtime state. */ }
    finally { running = false; }
  };
  void tick(); timer = setInterval(() => { void tick(); }, 60000); timer.unref();
}
