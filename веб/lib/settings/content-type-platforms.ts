/**
 * C-104 — content types for Scout settings with platform icons (lucide names).
 */

import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  FileText,
  Globe,
  Layers,
  MonitorPlay,
  Palette,
  Scissors,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import {
  MESH_PIPELINE_IDS,
  MESH_PIPELINE_LABELS,
  type MeshPipelineId,
} from "@/lib/mesh-roles";

export type ScoutContentTypeOption = {
  id: MeshPipelineId;
  label: string;
  platform: string;
  Icon: LucideIcon;
};

const ICONS: Record<MeshPipelineId, LucideIcon> = {
  "carousel-engine": Layers,
  "aesthetic-graphics": Palette,
  "cartoon-reels": Sparkles,
  "heygen-reels": Video,
  "site-articles": Globe,
  "tg-articles": Send,
  "custom-reels": Clapperboard,
  "custom-clips-to-reels": Scissors,
  "custom-info-video": MonitorPlay,
};

const PLATFORMS: Record<MeshPipelineId, string> = {
  "carousel-engine": "Instagram",
  "aesthetic-graphics": "Instagram",
  "cartoon-reels": "Instagram / TikTok",
  "heygen-reels": "Instagram / YouTube",
  "site-articles": "Сайт",
  "tg-articles": "Telegram",
  "custom-reels": "Instagram / TikTok",
  "custom-clips-to-reels": "Instagram / YouTube",
  "custom-info-video": "YouTube",
};

export const SCOUT_CONTENT_TYPE_OPTIONS: ScoutContentTypeOption[] =
  MESH_PIPELINE_IDS.map((id) => ({
    id,
    label: MESH_PIPELINE_LABELS[id],
    platform: PLATFORMS[id],
    Icon: ICONS[id] ?? FileText,
  }));
