/**
 * C-54 — mock “ready to publish” queue from feed fixtures (ours).
 * No Prisma. Custom/product modules without fixtures → empty list.
 */

import { getFeedForModule } from "@/lib/studio/feed-fixtures";
import { isFeedCoreModuleId } from "@/lib/studio/feed-types";

export type ReadyPost = {
  id: string;
  moduleId: string;
  title: string;
  thumbUrl?: string;
};

const READY_CAP_PER_MODULE = 5;

export function listReadyPostsForModule(moduleId: string): ReadyPost[] {
  if (!isFeedCoreModuleId(moduleId)) return [];
  return getFeedForModule(moduleId)
    .ours.slice(0, READY_CAP_PER_MODULE)
    .map((p) => ({
      id: p.id,
      moduleId,
      title: p.title,
      thumbUrl: p.thumbUrl,
    }));
}
