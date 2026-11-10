import { freezeGrowthWorkspace } from "../lib/growth-center/workspace-weekly";

freezeGrowthWorkspace().then(result => console.log(JSON.stringify({ status: "completed", ...result }))).catch(() => { console.error("workspace_freeze_failed"); process.exitCode = 1; });
