import { NextResponse } from "next/server";
import { getWorkspaceAuth, readWorkspaceJson, requireWorkspaceMutation } from "@/lib/growth-center/workspace-auth";
import { validateWorkspaceCommand, type WorkspaceCapabilities } from "@/lib/growth-center/workspace-model";
import { flushWorkspaceGit, readGitConfig } from "@/lib/growth-center/workspace-github";
import { getWorkspaceStore, workspaceView, WorkspaceError } from "@/lib/growth-center/workspace-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "Vary": "Cookie" };
function failure(error: unknown) {
  if (error instanceof WorkspaceError) return NextResponse.json({ error: error.code, ...(error.revision !== undefined ? { revision: error.revision } : {}), message: error.code === "revision_conflict" ? "Данные изменились. Обнови страницу и повтори." : error.code === "week_closed" ? "Неделя закрыта в 23:59 по Москве. Сохрани факт после 00:00 новой недели или оформи исправление снимка." : "Изменение не подтверждено. Проверь доступ или повтори позже." }, { status: error.status, headers });
  return NextResponse.json({ error: "workspace_unavailable", message: "Рабочая область временно недоступна." }, { status: 503, headers });
}
async function capabilities(request: Request): Promise<WorkspaceCapabilities> {
  const auth = await getWorkspaceAuth(request);
  return { authConfigured: auth.configured, authenticated: auth.authenticated, writeEnabled: auth.configured && auth.authenticated, gitConfigured: readGitConfig().configured, schedulerEnabled: process.env.GROWTH_WORKSPACE_SCHEDULER === "1", csrfToken: auth.csrfToken };
}
export async function GET(request: Request) {
  try { const store = getWorkspaceStore(); return NextResponse.json(workspaceView(await store.read(), await capabilities(request)), { headers }); } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const store = getWorkspaceStore(); await requireWorkspaceMutation(request);
    const parsed = validateWorkspaceCommand(await readWorkspaceJson(request));
    if (!parsed.ok) throw new WorkspaceError("invalid_command");
    const result = await store.mutate(parsed.data);
    // Local durable save precedes all network work. Delivery metadata is applied under its own lock.
    void flushWorkspaceGit(store).catch(() => undefined);
    return NextResponse.json({ ...workspaceView(await store.read(), await capabilities(request)), commandReceipt: result.receipt }, { headers });
  } catch (error) { return failure(error); }
}
