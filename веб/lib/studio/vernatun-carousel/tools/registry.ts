/**
 * Tool registry — name → schema + handler id.
 * Handlers execute in executor.ts / agent-loop wrappers.
 */

export type ToolJsonSchema = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export const VERNATUN_TOOL_SCHEMAS: ToolJsonSchema[] = [
  {
    name: "load_design_colors",
    description: "Load panel/ink/accent/pageBg ONLY from active Design settings.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "write_script",
    description: "Write carousel script JSON for the topic (mask scriptwriter).",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string" },
        slideCount: { type: "number" },
      },
      required: ["topic"],
    },
  },
  {
    name: "plan_images",
    description: "Plan image slots: user → web → generate fallback.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "build_and_render",
    description: "Build Mode A HTML (or B) and render PNG slides.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "vision_review",
    description: "Art-director CHECK skill: review PNGs, return findings v2.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "qa_auto",
    description: "Deterministic QA checks.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "repair_slides",
    description: "Apply findings (text/geometry/recipe) and re-render.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "finalize",
    description: "Set FINAL or BLOCKED; end agent loop.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["FINAL", "BLOCKED_WITH_REMARKS", "BLOCKED"],
        },
        summary: { type: "string" },
      },
      required: ["status"],
    },
  },
];

export function getToolSchema(name: string): ToolJsonSchema | undefined {
  return VERNATUN_TOOL_SCHEMAS.find((t) => t.name === name);
}

export function listToolNames(): string[] {
  return VERNATUN_TOOL_SCHEMAS.map((t) => t.name);
}
