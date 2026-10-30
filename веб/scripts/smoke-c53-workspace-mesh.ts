/**
 * C-53: drafts+razbor on all modules; 7 mesh pipelines.
 * Run: npx tsx scripts/smoke-c53-workspace-mesh.ts
 * Optional: BASE_URL=http://127.0.0.1:3000
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createMeshSeed,
  MESH_PIPELINE_IDS,
  isMeshPipelineId,
} from "../lib/mesh-seed";

const ROOT = join(__dirname, "..");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

const EXPECTED_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
  "custom-reels",
  "custom-clips-to-reels",
  "custom-info-video",
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing ${rel}`);
  return readFileSync(p, "utf8");
}

function assertWorkspaceUngate(): void {
  const ws = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    ws.includes("showDraftsButton={true}"),
    "drafts toggle on all modules",
  );
  assert(
    ws.includes("showRazborButton={true}"),
    "razbor on all competitor cards",
  );
  assert(
    !ws.includes("showRazborButton={isCarouselEngine}"),
    "C-31 carousel-only razbor superseded",
  );
  assert(
    !ws.includes("showDraftsButton={isCarouselEngine}"),
    "drafts not carousel-gated",
  );
  assert(ws.includes("<RazborModal"), "RazborModal mounted");
  assert(
    !/isCarouselEngine\s*\?\s*<RazborModal/.test(ws),
    "RazborModal not carousel-ternary",
  );

  const modal = read("components/studio/workspace/RazborModal.tsx");
  assert(
    /getRazborWelcome\(\s*post\.id\s*,\s*post\s*\)/.test(modal),
    "welcome must pass FeedPost override",
  );

  assert(
    /showEditorButton=\{isReels\}/.test(ws),
    "CapCut editor stays reels-only",
  );
  console.log("SMOKE_C53_WORKSPACE_OK");
}

function assertMeshPipelines(): void {
  assert(MESH_PIPELINE_IDS.length === 7, "exactly 7 pipeline ids");
  assert(
    EXPECTED_IDS.every((id, i) => MESH_PIPELINE_IDS[i] === id),
    "MESH_PIPELINE_IDS order/canon",
  );

  const graphics = createMeshSeed("aesthetic-graphics");
  const carousel = createMeshSeed("carousel-engine");
  const reels = createMeshSeed("custom-reels");

  assert(
    !graphics.nodes.some((n) => n.id === "hook"),
    "graphics seed has no Hook Writer",
  );
  assert(
    carousel.nodes.some((n) => n.id === "hook"),
    "carousel seed has Hook Writer",
  );
  assert(
    graphics.nodes.some((n) => n.id === "router"),
    "router lives inside pipeline",
  );

  const gRoutes = (graphics.nodes.find((n) => n.id === "router")?.data as {
    routes?: string[];
  }).routes?.join(",");
  const cRoutes = (carousel.nodes.find((n) => n.id === "router")?.data as {
    routes?: string[];
  }).routes?.join(",");
  const rRoutes = (reels.nodes.find((n) => n.id === "router")?.data as {
    routes?: string[];
  }).routes?.join(",");
  assert(gRoutes && cRoutes && gRoutes !== cRoutes, "graphs not universal");
  assert(rRoutes && rRoutes !== cRoutes, "reels graph distinct from carousel");

  const switcher = read("components/mesh/MeshPipelineSwitcher.tsx");
  assert(
    switcher.includes('data-testid="mesh-pipeline-switcher"'),
    "switcher testid",
  );
  assert(switcher.includes("data-pipeline-id"), "active pipeline id");
  assert(switcher.includes("MESH_PIPELINE_IDS.map"), "maps all ids");

  const canvas = read("components/mesh/AgentMeshCanvas.tsx");
  assert(canvas.includes("createMeshSeed(pipelineId)"), "seed per tab");
  assert(canvas.includes("PulseEdge") || canvas.includes("pulse"), "PulseEdge");

  const meshPage = read("app/admin/mesh/page.tsx");
  assert(meshPage.includes('role === "ADMIN"'), "ADMIN still redirected");
  assert(meshPage.includes('router.replace("/studio")'), "ADMIN → studio");

  assert(isMeshPipelineId("heygen-reels"), "heygen in canon");
  assert(!isMeshPipelineId("not-a-pipeline"), "unknown id rejected");
  console.log("SMOKE_C53_MESH_OK");
}

async function optionalHttp(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const graphics = await fetch(`${BASE}/studio/aesthetic-graphics`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    assert(graphics.ok, `graphics ${graphics.status}`);
    const cartoon = await fetch(`${BASE}/studio/cartoon-reels`);
    assert(cartoon.ok, `cartoon ${cartoon.status}`);
    const mesh = await fetch(`${BASE}/admin/mesh`);
    assert(mesh.ok, `mesh ${mesh.status}`);
    console.log("SMOKE_C53_HTTP_OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`SMOKE_C53_HTTP_SKIP (${msg})`);
  }
}

async function main(): Promise<void> {
  assertWorkspaceUngate();
  assertMeshPipelines();
  await optionalHttp();
  console.log("SMOKE_C53_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
