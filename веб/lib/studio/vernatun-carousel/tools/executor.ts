import { getToolSchema, listToolNames } from "./registry";

export type ToolHandler = (
  args: Record<string, unknown>,
) => Promise<unknown> | unknown;

export type ToolExecutor = {
  execute: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  register: (name: string, handler: ToolHandler) => void;
  names: () => string[];
};

export function createToolExecutor(
  handlers: Record<string, ToolHandler> = {},
): ToolExecutor {
  const map = new Map<string, ToolHandler>(Object.entries(handlers));

  return {
    register(name, handler) {
      map.set(name, handler);
    },
    names() {
      return [...new Set([...listToolNames(), ...map.keys()])];
    },
    async execute(name, args = {}) {
      if (!getToolSchema(name) && !map.has(name)) {
        throw new Error(`unknown_tool:${name}`);
      }
      const handler = map.get(name);
      if (!handler) {
        throw new Error(`tool_handler_missing:${name}`);
      }
      return handler(args);
    },
  };
}
