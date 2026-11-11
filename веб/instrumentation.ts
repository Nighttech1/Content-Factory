export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build" && process.env.GROWTH_EDITORIAL_SYNC !== "0") {
    const { startEditorialScheduler } = await import("./lib/growth-center/editorial-scheduler");
    startEditorialScheduler();
  }
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.GROWTH_WORKSPACE_SCHEDULER === "1" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { startGrowthWorkspaceScheduler } = await import("./lib/growth-center/workspace-weekly");
    startGrowthWorkspaceScheduler();
  }
}
