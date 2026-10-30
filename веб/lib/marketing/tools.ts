/**
 * AI Bridge — Marketing Director tool schemas + executors (S47).
 * Names locked by Architect: app_search / app_graphql. Read-only.
 */

import {
  runMarketingGraphql,
  runMarketingSearch,
} from "@/lib/marketing/search";

export const MARKETING_OPENAI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "app_search",
      description:
        "Search Content Factory drafts/jobs/modules by free-text query. Returns JSON snippets. Soft-empty if nothing found.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (topic, module id, status…)",
          },
          limit: {
            type: "number",
            description: "Max hits (default 12)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "app_graphql",
      description:
        "Named read-only app queries: modules | drafts | schedule | jobStats.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            enum: ["modules", "drafts", "schedule", "jobStats"],
            description: "Named query",
          },
          variables: {
            type: "object",
            description: "Optional variables (e.g. { limit: 20 })",
          },
        },
        required: ["query"],
      },
    },
  },
];

export type ToolCallName = "app_search" | "app_graphql";

export async function executeMarketingTool(
  name: string,
  argsJson: string,
): Promise<string> {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(argsJson || "{}") as Record<string, unknown>;
  } catch {
    args = {};
  }

  if (name === "app_search") {
    const query = typeof args.query === "string" ? args.query : "";
    const limit =
      typeof args.limit === "number" && Number.isFinite(args.limit)
        ? args.limit
        : 12;
    const result = await runMarketingSearch(query, limit);
    return JSON.stringify(result);
  }

  if (name === "app_graphql") {
    const query = typeof args.query === "string" ? args.query : "modules";
    const variables =
      args.variables && typeof args.variables === "object"
        ? (args.variables as Record<string, unknown>)
        : undefined;
    const result = await runMarketingGraphql(query, variables);
    return JSON.stringify(result);
  }

  return JSON.stringify({ ok: false, error: "unknown_tool", name });
}
