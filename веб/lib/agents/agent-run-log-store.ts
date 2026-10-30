/**
 * Append-only agent run logs for Team «Логи» tab + RED perimeter signal.
 * Path: data/local/agent-run-logs.json
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "agent-run-logs.json");
const MAX_LINES = 2000;

export type AgentLogLevel = "info" | "warn" | "error" | "red";

export type AgentRunLogLine = {
  id: string;
  userId: string;
  agentId: string;
  agentRole?: string;
  jobId?: string;
  level: AgentLogLevel;
  message: string;
  meta?: Record<string, unknown>;
  ts: string;
};

type LogFile = {
  lines: AgentRunLogLine[];
};

function empty(): LogFile {
  return { lines: [] };
}

async function readFile(): Promise<LogFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LogFile>;
    return { lines: Array.isArray(parsed.lines) ? parsed.lines : [] };
  } catch {
    return empty();
  }
}

async function writeFile(data: LogFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

function newId(): string {
  return `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function appendAgentLog(input: {
  userId: string;
  agentId: string;
  agentRole?: string;
  jobId?: string;
  level: AgentLogLevel;
  message: string;
  meta?: Record<string, unknown>;
}): Promise<AgentRunLogLine> {
  const file = await readFile();
  const line: AgentRunLogLine = {
    id: newId(),
    userId: input.userId,
    agentId: input.agentId.trim() || "unknown",
    agentRole: input.agentRole,
    jobId: input.jobId,
    level: input.level,
    message: input.message.slice(0, 4000),
    meta: input.meta,
    ts: new Date().toISOString(),
  };
  file.lines.push(line);
  if (file.lines.length > MAX_LINES) {
    file.lines = file.lines.slice(-MAX_LINES);
  }
  await writeFile(file);
  return line;
}

export async function listAgentLogs(opts: {
  userId: string;
  agentId?: string | null;
  level?: AgentLogLevel | null;
  limit?: number;
}): Promise<AgentRunLogLine[]> {
  const file = await readFile();
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  let lines = file.lines.filter((l) => l.userId === opts.userId);
  if (opts.agentId) {
    lines = lines.filter((l) => l.agentId === opts.agentId);
  }
  if (opts.level) {
    lines = lines.filter((l) => l.level === opts.level);
  }
  return lines.slice(-limit).reverse();
}

/** Last error/red for mesh RED perimeter (Frontend reads). */
export async function getAgentErrorFlag(opts: {
  userId: string;
  agentId: string;
}): Promise<{
  hasError: boolean;
  lastError: AgentRunLogLine | null;
}> {
  const lines = await listAgentLogs({
    userId: opts.userId,
    agentId: opts.agentId,
    limit: 50,
  });
  const lastError =
    lines.find((l) => l.level === "error" || l.level === "red") ?? null;
  return { hasError: Boolean(lastError), lastError };
}

/** Map of agentId → hasError for Team mesh. */
export async function listAgentErrorFlags(opts: {
  userId: string;
}): Promise<Record<string, boolean>> {
  const lines = await listAgentLogs({ userId: opts.userId, limit: 500 });
  const map: Record<string, boolean> = {};
  for (const line of lines) {
    if (line.level === "error" || line.level === "red") {
      if (map[line.agentId] === undefined) map[line.agentId] = true;
    }
  }
  return map;
}
