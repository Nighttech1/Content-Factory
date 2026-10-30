import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type ToolLogRow = {
  at: string;
  name: string;
  args?: unknown;
  ok: boolean;
  detail?: string;
};

export async function appendToolLog(
  jobDir: string,
  row: ToolLogRow,
): Promise<void> {
  await mkdir(jobDir, { recursive: true });
  const file = path.join(jobDir, "session-tools.jsonl");
  await appendFile(file, `${JSON.stringify(row)}\n`, "utf8");
}
