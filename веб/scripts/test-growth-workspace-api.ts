import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { emptyCounts } from "../lib/growth-center/workspace-model";

async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "growth-workspace-api-"));
  const keys = ["GROWTH_ADMIN_SECRET", "GROWTH_ALLOWED_ORIGIN", "GROWTH_WORKSPACE_DATA_DIR", "GROWTH_GITHUB_REPOSITORY", "GROWTH_GITHUB_BRANCH", "GROWTH_GITHUB_TOKEN", "GROWTH_SCOUT_BRANCH", "GROWTH_WORKSPACE_SCHEDULER"];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  process.env.GROWTH_WORKSPACE_DATA_DIR = directory;
  const origin = "https://localhost:3443", secret = randomBytes(32).toString("base64url");
  try {
    const api = await import("../app/api/growth-workspace/route");
    const session = await import("../app/api/growth-workspace/session/route");
    const request = (payload?: unknown, headers: Record<string, string> = {}, method = "POST", target = "/api/growth-workspace") => new Request(origin + target, { method, headers: { Origin: origin, "Content-Type": "application/json", ...headers }, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
    let response: Response = await api.GET(request(undefined, {}, "GET"));
    assert.equal(response.status, 200);
    let view = await response.json(); assert.equal(view.cards.length, 24); assert.equal(view.capabilities.writeEnabled, false); assert.equal(view.capabilities.authConfigured, false);
    const save = { type: "save_counts", counts: { ...emptyCounts(), attendance: 5 }, source: "API fixture only", expectedRevision: 0, requestId: "api-first" };
    response = await api.POST(request(save, { "x-cf-user-id": "OWNER", Cookie: "cf_user_id=OWNER" })); assert.equal(response.status, 503);
    response = await session.POST(request({ secret }, {}, "POST", "/api/growth-workspace/session")); assert.equal(response.status, 503);
    process.env.GROWTH_ADMIN_SECRET = secret; process.env.GROWTH_ALLOWED_ORIGIN = origin;
    response = await api.POST(request(save, { "x-cf-user-id": "OWNER" })); assert.equal(response.status, 401);
    response = await session.POST(request({ secret }, { Origin: "https://untrusted.example" }, "POST", "/api/growth-workspace/session")); assert.equal(response.status, 403);
    response = await session.POST(request({ secret }, {}, "POST", "/api/growth-workspace/session")); assert.equal(response.status, 200);
    const login = await response.json(), cookie = response.headers.get("set-cookie")!.split(";")[0];
    assert(login.authenticated && login.csrfToken); assert(!JSON.stringify(login).includes(secret));
    const headers = { Cookie: cookie, "X-Growth-CSRF": login.csrfToken };
    response = await api.POST(request(save, { Cookie: cookie })); assert.equal(response.status, 403);
    response = await api.POST(request(save, headers)); assert.equal(response.status, 200);
    view = await response.json(); assert.equal(view.counts.attendance, 5); assert.equal(view.revision, 1); assert.equal(view.commandReceipt.replayed, false); assert.equal(view.git.state, "not_configured");
    response = await api.POST(request(save, headers)); assert.equal(response.status, 200); assert.equal((await response.json()).commandReceipt.replayed, true);
    response = await api.POST(request({ ...save, requestId: "api-stale" }, headers)); assert.equal(response.status, 409); assert.equal((await response.json()).revision, 1);
    response = await api.GET(request(undefined, {}, "GET")); view = await response.json(); assert.equal(view.counts.attendance, 5); assert.equal(view.capabilities.csrfToken, null);
    response = await api.POST(request({ type: "move_card", cardId: view.cards[0].id, column: "release", beforeCardId: null, expectedRevision: 1, requestId: "api-move" }, headers)); assert.equal(response.status, 200); view = await response.json(); assert.equal(view.cards[0].column, "release"); assert.equal(view.cards[0].publication, null);
    response = await api.POST(request({ ...save, requestId: "injected-owner", expectedRevision: 2, owner: "OWNER" }, headers)); assert.equal(response.status, 400);
    response = await api.POST(new Request(origin + "/api/growth-workspace", { method: "POST", headers: { Origin: origin, Cookie: cookie, "X-Growth-CSRF": login.csrfToken, "Content-Type": "application/json" }, body: JSON.stringify({ ...save, source: "x".repeat(70000) }) })); assert.equal(response.status, 413);
    response = await session.DELETE(request(undefined, headers, "DELETE", "/api/growth-workspace/session")); assert.equal(response.status, 200); assert(response.headers.get("set-cookie")!.includes("Max-Age=0"));
    response = await api.POST(request({ ...save, expectedRevision: 2, requestId: "after-logout" }, headers)); assert.equal(response.status, 401);
    const state = JSON.parse(await fs.readFile(path.join(directory, "state.json"), "utf8")); assert.equal(state.revision, 2); assert.equal(state.sessions.length, 0); assert(!JSON.stringify(state).includes(secret));
    console.log("PASS workspace API: read-only/no-config, signed session, forged OWNER denial, origin/CSRF, durable Save/replay/CAS, separate reader, release!=publication, strict body/size, logout revocation. No network was used.");
  } finally {
    for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; }
    await fs.rm(directory, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
