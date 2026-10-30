/**
 * Idempotent analytics fixtures for C-16 (and later C-17/C-18 local smokes).
 * Works with Prisma when DATABASE_URL is healthy; otherwise JSON fallback.
 *
 * Run: npm run db:seed
 */
import {
  getAnalyticsRepository,
  type PostAnalyticsWrite,
  type SeedJobInput,
  type SeedUserInput,
} from "../lib/db/analytics-repository";

const SEED_USER: SeedUserInput = {
  id: "user_seed_admin_c16",
  email: "admin@content-factory.local",
  name: "Studio Admin",
  role: "ADMIN",
};

const SEED_JOBS: SeedJobInput[] = [
  {
    id: "job_seed_carousel_01",
    moduleId: "carousel",
    topic: "Armenian Club weekend highlights",
    status: "PUBLISHED",
    userId: SEED_USER.id,
    rawScript: {
      slides: [
        { hook: "This weekend at the club", body: "Highlights reel outline" },
      ],
    },
    publishedAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "job_seed_heygen_02",
    moduleId: "heygen-reels",
    topic: "Member welcome avatar",
    status: "PUBLISHED",
    userId: SEED_USER.id,
    rawScript: {
      timeline: [{ t: 0, line: "Welcome to Armenian Club" }],
    },
    publishedAt: "2026-09-12T15:30:00.000Z",
  },
  {
    id: "job_seed_infographic_03",
    moduleId: "infographics",
    topic: "Season schedule at a glance",
    status: "PUBLISHED",
    userId: SEED_USER.id,
    rawScript: { blocks: [{ title: "September", items: 4 }] },
    publishedAt: "2026-09-14T09:00:00.000Z",
  },
];

const curve = (points: Array<[number, number]>) =>
  points.map(([t, value]) => ({ t, value }));

const SEED_SNAPSHOTS: PostAnalyticsWrite[] = [
  {
    id: "pa_seed_ig_carousel_d1",
    postId: "ig_ext_carousel_01",
    platform: "instagram",
    views: 4200,
    saves: 180,
    shares: 64,
    retentionCurve: curve([
      [0, 1],
      [0.5, 0.62],
      [1, 0.41],
    ]),
    capturedAt: "2026-09-15T08:00:00.000Z",
    contentJobId: "job_seed_carousel_01",
  },
  {
    id: "pa_seed_ig_carousel_d2",
    postId: "ig_ext_carousel_01",
    platform: "instagram",
    views: 6100,
    saves: 240,
    shares: 91,
    retentionCurve: curve([
      [0, 1],
      [0.5, 0.58],
      [1, 0.38],
    ]),
    capturedAt: "2026-09-16T08:00:00.000Z",
    contentJobId: "job_seed_carousel_01",
  },
  {
    id: "pa_seed_yt_heygen_d1",
    postId: "yt_ext_heygen_02",
    platform: "youtube",
    views: 12800,
    saves: 0,
    shares: 210,
    retentionCurve: curve([
      [0, 1],
      [0.25, 0.71],
      [0.75, 0.44],
      [1, 0.29],
    ]),
    capturedAt: "2026-09-16T10:00:00.000Z",
    contentJobId: "job_seed_heygen_02",
  },
  {
    id: "pa_seed_yt_heygen_d2",
    postId: "yt_ext_heygen_02",
    platform: "youtube",
    views: 15400,
    saves: 0,
    shares: 255,
    retentionCurve: curve([
      [0, 1],
      [0.25, 0.69],
      [0.75, 0.42],
      [1, 0.27],
    ]),
    capturedAt: "2026-09-17T10:00:00.000Z",
    contentJobId: "job_seed_heygen_02",
  },
  {
    id: "pa_seed_ig_info_d1",
    postId: "ig_ext_info_03",
    platform: "instagram",
    views: 2900,
    saves: 320,
    shares: 45,
    retentionCurve: curve([
      [0, 1],
      [1, 0.55],
    ]),
    capturedAt: "2026-09-17T12:00:00.000Z",
    contentJobId: "job_seed_infographic_03",
  },
  {
    id: "pa_seed_tg_carousel_d1",
    postId: "tg_ext_carousel_01",
    platform: "telegram",
    views: 1800,
    saves: 40,
    shares: 120,
    retentionCurve: null,
    capturedAt: "2026-09-18T07:00:00.000Z",
    contentJobId: "job_seed_carousel_01",
  },
];

async function main(): Promise<void> {
  const repo = await getAnalyticsRepository();
  await repo.ensureSeedFixtures({
    user: SEED_USER,
    jobs: SEED_JOBS,
    snapshots: SEED_SNAPSHOTS,
  });

  const latest = await repo.listLatest(3);
  const kpi = await repo.aggregateForKpi(new Date("2026-09-01T00:00:00.000Z"));

  // eslint-disable-next-line no-console
  console.info(
    `[seed] store=${repo.storeKind} jobs=${SEED_JOBS.length} snapshots=${SEED_SNAPSHOTS.length} latest=${latest.length} kpi.views=${kpi.views}`,
  );
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exitCode = 1;
});
