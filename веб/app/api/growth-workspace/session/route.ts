import { NextResponse } from "next/server";
import { z } from "zod";
import { issueSession, readWorkspaceJson, requireWorkspaceOrigin, revokeSession } from "@/lib/growth-center/workspace-auth";
import { WorkspaceError } from "@/lib/growth-center/workspace-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
function failure(error: unknown) { return NextResponse.json({ error: error instanceof WorkspaceError ? error.code : "session_unavailable", message: "Сессия владельца не подтверждена." }, { status: error instanceof WorkspaceError ? error.status : 503, headers }); }
export async function POST(request: Request) {
  try {
    requireWorkspaceOrigin(request);
    const parsed = z.object({ secret: z.string().min(1).max(1024) }).strict().safeParse(await readWorkspaceJson(request));
    if (!parsed.success) throw new WorkspaceError("invalid_credentials", 401);
    const session = await issueSession(request, parsed.data.secret);
    return NextResponse.json({ authenticated: true, csrfToken: session.csrfToken }, { headers: { ...headers, "Set-Cookie": session.cookie } });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
  try { const cookie = await revokeSession(request); return NextResponse.json({ authenticated: false }, { headers: { ...headers, "Set-Cookie": cookie } }); } catch (error) { return failure(error); }
}
