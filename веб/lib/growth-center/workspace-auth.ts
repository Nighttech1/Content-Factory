import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getWorkspaceStore, WorkspaceError, type WorkspaceStore } from "./workspace-store";

type Env = Record<string, string | undefined>;
export const SESSION_COOKIE = "growth_workspace_session";
export const CSRF_HEADER = "X-Growth-CSRF";
export const SESSION_TTL_MS = 8 * 3600000;
export function readAuthConfig(env: Env = process.env) {
  const secret = env.GROWTH_ADMIN_SECRET ?? "", origin = env.GROWTH_ALLOWED_ORIGIN ?? "";
  let validOrigin = false;
  try { const parsed = new URL(origin); validOrigin = parsed.origin === origin && !parsed.username && !parsed.password && (parsed.protocol === "https:" || env.NODE_ENV !== "production" && parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)); } catch { /* Fail closed. */ }
  return { configured: secret.length >= 32 && secret.length <= 1024 && validOrigin, secret, origin, secure: env.NODE_ENV === "production" || origin.startsWith("https:") };
}
function equal(a: string, b: string) { return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest()); }
function sign(value: string, secret: string) { const key = createHmac("sha256", secret).update("vernatun-growth-session-signing-v1").digest(); return createHmac("sha256", key).update(value).digest("base64url"); }
function cookieValue(request: Request) { const raw = (request.headers.get("cookie") ?? "").split(";").map(part => part.trim()).find(part => part.startsWith(SESSION_COOKIE + "=")); return raw?.slice(SESSION_COOKIE.length + 1) ?? null; }
export async function getWorkspaceAuth(request: Request, env: Env = process.env, store: WorkspaceStore = getWorkspaceStore(), now = new Date()) {
  const config = readAuthConfig(env), token = cookieValue(request);
  if (!config.configured || !token || token.length > 2048) return { configured: config.configured, authenticated: false, csrfToken: null, sessionId: null };
  const parts = token.split(".");
  if (parts.length !== 2 || !equal(sign(parts[0], config.secret), parts[1])) return { configured: true, authenticated: false, csrfToken: null, sessionId: null };
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (typeof payload.id !== "string" || !Number.isSafeInteger(payload.expiresAt) || payload.expiresAt <= now.getTime() || payload.expiresAt > now.getTime() + SESSION_TTL_MS) throw new Error("expired");
    const session = await store.findSession(payload.id);
    if (!session || Date.parse(session.expiresAt) !== payload.expiresAt) throw new Error("revoked");
    return { configured: true, authenticated: true, csrfToken: session.csrfToken, sessionId: session.id };
  } catch { return { configured: true, authenticated: false, csrfToken: null, sessionId: null }; }
}
export function requireWorkspaceOrigin(request: Request, env: Env = process.env) {
  const config = readAuthConfig(env);
  if (!config.configured) throw new WorkspaceError("workspace_auth_not_configured", 503);
  if (request.headers.get("origin") !== config.origin) throw new WorkspaceError("origin_forbidden", 403);
  return config;
}
export async function requireWorkspaceMutation(request: Request, env: Env = process.env, store: WorkspaceStore = getWorkspaceStore()) {
  requireWorkspaceOrigin(request, env);
  const auth = await getWorkspaceAuth(request, env, store);
  if (!auth.authenticated) throw new WorkspaceError("authentication_required", 401);
  const csrf = request.headers.get(CSRF_HEADER);
  if (!csrf || !auth.csrfToken || !equal(csrf, auth.csrfToken)) throw new WorkspaceError("csrf_forbidden", 403);
  return auth;
}
const loginAttempts = new Map<string, { count: number; until: number }>();
export async function issueSession(request: Request, secret: string, env: Env = process.env, store: WorkspaceStore = getWorkspaceStore(), now = new Date()) {
  const config = requireWorkspaceOrigin(request, env);
  const key = createHash("sha256").update(config.origin).digest("hex");
  let attempts = loginAttempts.get(key);
  if (!attempts || attempts.until <= now.getTime()) { attempts = { count: 0, until: now.getTime() + 5 * 60000 }; loginAttempts.set(key, attempts); }
  if (attempts.count >= 10) throw new WorkspaceError("login_rate_limited", 429);
  if (!equal(secret, config.secret)) { attempts.count++; throw new WorkspaceError("invalid_credentials", 401); }
  const session = { id: randomBytes(24).toString("base64url"), csrfToken: randomBytes(32).toString("base64url"), expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString() };
  await store.addSession(session);
  const payload = Buffer.from(JSON.stringify({ id: session.id, expiresAt: Date.parse(session.expiresAt) })).toString("base64url");
  return { csrfToken: session.csrfToken, cookie: `${SESSION_COOKIE}=${payload}.${sign(payload, config.secret)}; HttpOnly; SameSite=Strict; Path=/api/growth-workspace; Max-Age=${SESSION_TTL_MS / 1000}${config.secure ? "; Secure" : ""}` };
}
export async function revokeSession(request: Request, env: Env = process.env, store: WorkspaceStore = getWorkspaceStore()) {
  const auth = await requireWorkspaceMutation(request, env, store);
  await store.revokeSession(auth.sessionId!);
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/growth-workspace; Max-Age=0${readAuthConfig(env).secure ? "; Secure" : ""}`;
}
export async function readWorkspaceJson(request: Request): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) throw new WorkspaceError("json_required", 415);
  if (Number(request.headers.get("content-length")) > 65536) throw new WorkspaceError("body_too_large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new WorkspaceError("invalid_json");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > 65536) { await reader.cancel(); throw new WorkspaceError("body_too_large", 413); } chunks.push(value); }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) { if (error instanceof WorkspaceError) throw error; throw new WorkspaceError("invalid_json"); }
}
