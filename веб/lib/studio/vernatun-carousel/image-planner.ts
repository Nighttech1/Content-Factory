import { createHash } from "node:crypto";
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { PROMPT_IMAGE_PLANNER } from "./prompts";
import { resolveRoleModel } from "./role-models";
import { extractJsonObject } from "./json-parse";
import type { JobLlmSession } from "./job-llm-session";
import type {
  UserAssetRecord,
  VernatunScript,
  VernatunJobBrief,
} from "./types";

export type ImageSlotPlan = {
  slide_index: number;
  action: "use_user" | "generate" | "web";
  user_asset_id: string | null;
  visual_prompt: string;
  web_query?: string;
  composition_and_crop: string;
  text_safe_area: string;
  notes: string;
};

export type ImagePlan = {
  slots: ImageSlotPlan[];
  web_search_available: boolean;
};

export function sha256OfBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export async function runImagePlanner(input: {
  brief: VernatunJobBrief;
  script: VernatunScript;
  session?: JobLlmSession;
}): Promise<ImagePlan> {
  const assets = input.brief.userAssets ?? [];
  const useUser = input.brief.useUserAssets !== false && assets.length > 0;
  const model = resolveRoleModel("imagePlanner");

  const userPayload = JSON.stringify(
    {
      topic: input.brief.topic,
      build_mode: input.brief.buildMode,
      use_user_assets: useUser,
      user_assets: assets.map((a) => ({
        asset_id: a.asset_id,
        original_filename: a.original_filename,
        status: a.status,
        required: a.required,
      })),
      slides: input.script.slides.map((s) => ({
        index: s.index,
        role: s.role,
        visual_intent: s.visual_intent,
        headline: s.headline,
        composition_hint: s.composition_hint,
        image_need: s.image_need ?? null,
      })),
      web_search_note: "Mode B: action=generate для целых слайдов.",
    },
    null,
    2,
  );

  const res = input.session
    ? await input.session.callMask({
        role: "imagePlanner",
        system: PROMPT_IMAGE_PLANNER,
        user: userPayload,
        temperature: 0.3,
        maxTokens: 3000,
      })
    : await callAggregatorChat({
        system: PROMPT_IMAGE_PLANNER,
        user: userPayload,
        model: model.model,
        temperature: 0.3,
        maxTokens: 3000,
      });

  if (!res.ok) {
    return enforceUserAssets(
      fallbackPlan(input.script, assets, useUser),
      assets,
      useUser,
    );
  }

  try {
    const parsed = extractJsonObject(res.text) as Record<string, unknown>;
    const slotsRaw = Array.isArray(parsed.slots) ? parsed.slots : [];
    const slots: ImageSlotPlan[] = input.script.slides.map((slide, i) => {
      const row = (slotsRaw[i] ?? {}) as Record<string, unknown>;
      const need = slide.image_need;
      // Mode B: whole-slide AI. Every slot is "generate" unless a required user photo.
      let action = String(row.action ?? "generate") as ImageSlotPlan["action"];
      if (need?.kind === "graphic" || need?.kind === "none") {
        action = "generate";
      }
      if (need?.kind === "photo_user_required" && useUser) {
        action = "use_user";
      }
      if (action === "web") action = "generate";
      if (!useUser && action === "use_user") action = "generate";
      const placeQ =
        need?.place_query ||
        (typeof row.web_query === "string" ? row.web_query : null);
      return {
        slide_index: slide.index,
        action,
        user_asset_id:
          typeof row.user_asset_id === "string" ? row.user_asset_id : null,
        visual_prompt: String(
          row.visual_prompt ?? slide.visual_intent ?? "photo scene",
        ),
        web_query: String(
          placeQ ??
            row.web_query ??
            row.visual_prompt ??
            slide.visual_intent ??
            input.brief.topic,
        ),
        composition_and_crop: String(
          row.composition_and_crop ?? "medium shot, leave left third clear",
        ),
        text_safe_area: String(row.text_safe_area ?? "left panel / lower third"),
        notes: [
          String(row.notes ?? ""),
          need?.kind === "photo_real_place" ? "real_place" : "",
          need?.kind === "graphic" || need?.kind === "none"
            ? "graphic_only"
            : "",
        ]
          .filter(Boolean)
          .join("; "),
      };
    });
    return enforceUserAssets(
      { slots, web_search_available: false },
      assets,
      useUser,
    );
  } catch {
    return enforceUserAssets(
      fallbackPlan(input.script, assets, useUser),
      assets,
      useUser,
    );
  }
}

/**
 * Hard gate (Mode B): every pending/required user asset must appear in the plan.
 * Keep action=generate, but pin asset_id on cover (+ spread) as AI reference.
 */
export function enforceUserAssets(
  plan: ImagePlan,
  assets: UserAssetRecord[],
  useUser: boolean,
): ImagePlan {
  if (!useUser || !assets.length) return plan;
  const required = assets.filter((a) => a.status !== "rejected");
  if (!required.length) return plan;

  // Mode B: distribute EVERY user photo across slides (round-robin).
  // Logo is always native ref at generate time (notes flag). Cover preserves faces.
  const slots = plan.slots.map((s, i) => {
    const asset = required[i % required.length]!;
    const isCover = s.slide_index === 1 || i === 0;
    return {
      ...s,
      action: "generate" as const,
      user_asset_id: asset.asset_id,
      notes: [
        s.notes,
        "mode_b_native_logo",
        isCover
          ? "mode_b_cover_preserve_user_photo_add_type"
          : `mode_b_user_photo_ref:${asset.asset_id}`,
      ]
        .filter(Boolean)
        .join("; ")
        .replace(/^; /, ""),
    };
  });
  return { ...plan, slots };
}

function fallbackPlan(
  script: VernatunScript,
  assets: UserAssetRecord[],
  useUser: boolean,
): ImagePlan {
  const required = assets.filter((a) => a.required && a.status !== "rejected");
  const pool = useUser
    ? [...required, ...assets.filter((a) => !a.required)]
    : [];
  return {
    web_search_available: false,
    slots: script.slides.map((slide, i) => {
      // Mode B: always generate; a user photo (if any) rides along as edit/ref.
      const asset = pool[i] ?? pool[0];
      const need = slide.image_need;
      return {
        slide_index: slide.index,
        action: "generate" as const,
        user_asset_id: asset?.asset_id ?? null,
        visual_prompt: slide.visual_intent || "natural documentary photo",
        web_query:
          need?.place_query ||
          slide.visual_intent ||
          "community people talking",
        composition_and_crop: "medium shot, text-safe left",
        text_safe_area: "left 50%",
        notes: [
          asset ? "fallback_assign_user" : "fallback_generate",
          need?.kind === "photo_real_place" ? "real_place" : "",
          need?.kind === "graphic" || need?.kind === "none"
            ? "graphic_only"
            : "",
        ]
          .filter(Boolean)
          .join("; "),
      };
    }),
  };
}
