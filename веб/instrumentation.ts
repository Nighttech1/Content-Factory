export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.GROWTH_WORKSPACE_SCHEDULER === "1" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { startGrowthWorkspaceScheduler } = await import("./lib/growth-center/workspace-weekly");
    startGrowthWorkspaceScheduler();
  }
}
