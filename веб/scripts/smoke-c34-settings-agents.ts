/**
 * Smoke C-34: Settings LLM UI + agents pack + AGGREGATOR env placeholders.
 *
 * Run: npx tsx scripts/smoke-c34-settings-agents.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LLM_AGENT_IDS,
  LLM_AGENTS,
  LLM_AGENT_MODELS_STORAGE_KEY,
  LLM_MODEL_CATALOG,
  defaultLlmAgentModels,
  parseLlmAgentModels,
} from "../lib/settings/llm-models";

const ROOT = join(__dirname, "..");

const REQUIRED_AGENT_FILES = [
  "researcher.md",
  "hook-writer.md",
  "script-writer.md",
  "analyst.md",
  "designer.md",
  "renderer.md",
  "publisher.md",
  "router.md",
  "README.md",
] as const;

const REQUIRED_SECTIONS = [
  "## Role",
  "## Base prompt",
  "## Skills",
  "## Plugins",
  "## MCP servers",
  "## Default LLM model slot id",
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertAgentsPack(): void {
  for (const name of REQUIRED_AGENT_FILES) {
    const p = join(ROOT, "agents", name);
    assert(existsSync(p), `missing agents/${name}`);
  }
  for (const name of REQUIRED_AGENT_FILES) {
    if (name === "README.md") continue;
    const body = readFileSync(join(ROOT, "agents", name), "utf8");
    for (const section of REQUIRED_SECTIONS) {
      assert(body.includes(section), `${name} missing ${section}`);
    }
    assert(!/sk-[a-zA-Z0-9]{20,}/.test(body), `${name} must not contain API keys`);
  }
  console.log("SMOKE_C34_AGENTS_OK");
}

function assertEnvExample(): void {
  const env = readFileSync(join(ROOT, ".env.example"), "utf8");
  assert(env.includes("AGGREGATOR_API_KEY="), "AGGREGATOR_API_KEY placeholder");
  assert(
    env.includes("AGGREGATOR_BASE_URL="),
    "AGGREGATOR_BASE_URL placeholder",
  );
  assert(
    /AGGREGATOR_API_KEY=\s*$/m.test(env) ||
      env.includes("AGGREGATOR_API_KEY=\n"),
    "AGGREGATOR_API_KEY must be empty in example",
  );
  assert(!/AGGREGATOR_API_KEY=\S+/.test(env), "no real AGGREGATOR key in example");
  console.log("SMOKE_C34_ENV_OK");
}

function assertAggregatorHelper(): void {
  const p = join(ROOT, "lib/llm/aggregator.ts");
  assert(existsSync(p), "lib/llm/aggregator.ts missing");
  const src = readFileSync(p, "utf8");
  assert(src.includes("resolveAggregatorEnv"), "resolveAggregatorEnv");
  assert(src.includes("resolveAggregatorModelId"), "resolveAggregatorModelId");
  assert(src.includes("AGGREGATOR_API_KEY"), "reads AGGREGATOR_API_KEY");
  assert(src.includes("OPENAI_API_KEY"), "fallback OPENAI_API_KEY");
  console.log("SMOKE_C34_AGGREGATOR_OK");
}

function assertAnalystWire(): void {
  const src = readFileSync(join(ROOT, "lib/analyst/llm.ts"), "utf8");
  assert(src.includes("resolveAggregatorEnv"), "analyst uses aggregator");
  assert(src.includes("resolveAggregatorModelId"), "analyst resolves model id");
  assert(src.includes("chatUrl"), "analyst uses chatUrl");
  console.log("SMOKE_C34_ANALYST_OK");
}

function assertSettingsSource(): void {
  const page = readFileSync(join(ROOT, "app/settings/page.tsx"), "utf8");
  assert(page.includes("settings-llm-panel"), "testid settings-llm-panel");
  for (const id of LLM_AGENT_IDS) {
    assert(
      page.includes("settings-agent-model-") ||
        page.includes("`settings-agent-model-${"),
      "settings-agent-model testid pattern",
    );
    assert(
      LLM_AGENTS.some((a) => a.id === id),
      `agent meta ${id}`,
    );
  }
  assert(
    page.includes("settings-agent-model-${agent.id}") ||
      page.includes("settings-agent-model-"),
    "per-agent model testids",
  );
  assert(
    page.includes(LLM_AGENT_MODELS_STORAGE_KEY) ||
      readFileSync(join(ROOT, "lib/settings/llm-models.ts"), "utf8").includes(
        LLM_AGENT_MODELS_STORAGE_KEY,
      ),
    "storage key cf-llm-agent-models",
  );

  const nav = readFileSync(
    join(ROOT, "components/shell/SidebarNavigation.tsx"),
    "utf8",
  );
  assert(nav.includes('/settings'), "sidebar settings href");
  assert(nav.includes("Настройки"), "sidebar label Настройки");
  assert(nav.includes("Settings"), "gear Settings icon import");
  assert(nav.includes("adminOrOwner"), "ADMIN+OWNER visibility");

  const models = readFileSync(join(ROOT, "lib/settings/llm-models.ts"), "utf8");
  assert(models.includes("gpt-4o-mini"), "catalog gpt-4o-mini");
  assert(models.includes("claude-sonnet"), "catalog claude-sonnet");
  assert(models.includes("gemini-flash"), "catalog gemini-flash");
  assert(LLM_MODEL_CATALOG.length >= 4, "catalog size");

  const parsed = parseLlmAgentModels({ researcher: "gpt-4o", bogus: "x" });
  assert(parsed.researcher === "gpt-4o", "parse keeps valid");
  assert(parsed.analyst === defaultLlmAgentModels().analyst, "defaults fill");

  console.log("SMOKE_C34_UI_OK");
}

function main(): void {
  assertAgentsPack();
  assertEnvExample();
  assertAggregatorHelper();
  assertAnalystWire();
  assertSettingsSource();
  console.log("SMOKE_C34_PASS");
}

main();
