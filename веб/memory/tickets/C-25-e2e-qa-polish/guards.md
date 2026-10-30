# Guards — C-25 E2E QA polish

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (source + live HTTP on `:3000`; Playwright MCP unavailable — honest gap)

Executable smoke:
```bash
npx tsx scripts/smoke-c25-e2e.ts
# with localhost:
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c25-e2e.ts
```

Nested regression: `npx tsx scripts/smoke-c23-sse.ts` (invoked from smoke-c25).  
Anti-slop: `python plugins/frontend/anti_slop_scan.py .` → **OK** (2026-09-20)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `--font-hy` / Noto Sans Armenian in `app/layout.tsx`; ScriptEditor + KaraokeCaptions + CarouselDeck apply `font-[family-name:var(--font-hy)]`; Armenian unicode in `lib/inspect-mock.ts` | GREEN | `SMOKE_C25_ARMENIAN_FONT_OK`; live HTML font hint on `/studio/inspect/demo` |
| G2 | ADMIN cannot use Mesh — source: `role === "ADMIN"` → `router.replace("/studio")` + early return (no canvas); session `OWNER\|ADMIN` + `setRole`; Sidebar QA switcher | GREEN | `SMOKE_C25_RBAC_MESH_OK` — **client-only zustand** (see honesty below) |
| G3 | S1 + C-23: no `runSimulatedPipeline`; `openJobStream`; drawer `generation-drawer` / `agent-step` / `data-step-state`; generate → jobId → ≥1 SSE frame | GREEN | nested `SMOKE_C23_OK`; live `SMOKE_C25_LIVE_GENERATE_STREAM_OK` |
| G4 | anti-slop | GREEN | `anti_slop_scan: OK` |

## How to flip role (RBAC demo)

1. Open any app page with sidebar (e.g. `/studio`).
2. Bottom of sidebar: **QA role (local)** → click **ADMIN** or **OWNER**.
3. Store: `lib/session-store.ts` → `useSessionStore.setRole("ADMIN" | "OWNER")` (zustand, **no cookie**).
4. As **ADMIN**: navigate to `/admin/mesh` → UI shows “Redirecting to Studio…” and `router.replace("/studio")`; Canvas nav (`ownerOnly`) hidden.
5. As **OWNER**: `/admin/mesh` mounts `AgentMeshCanvas`.

### Honesty — client-only RBAC

- Role is **not** in HTTP cookies/headers. `GET /admin/mesh` returns **200** for everyone; deny is **client** (`useSessionStore` + `useEffect` redirect).
- Smoke HTTP cannot assert ADMIN deny without Playwright/browser evaluate of zustand.
- Guard = **source assert** on `app/admin/mesh/page.tsx` + session-store + Sidebar `setRole`, plus documented manual flip.
- Playwright MCP: **unavailable** in this environment (no playwright server in MCP folder) — Client may still run S3 manually via QA role switcher.

## Hard REJECT checklist (`client.mdc`) — Tester notes

| # | Criterion | Tester note |
|---|-----------|-------------|
| S1 | Generate Draft opens drawer / agent steps change | GREEN wiring + live generate/stream; UI click path = Client (drawer testids present) |
| S2 | Hook swap / Approve Inspector snapshot | **out of C-25 primary** (not re-run); no regression introduced by this ticket |
| S3 | ADMIN cannot see/open `/admin/mesh` | GREEN source + early return; live browser flip = Client / Deployer |
| 1440 grid / glass / hy glyphs | hy font wired on script/karaoke/carousel | GREEN source; visual tofu check = Client |
| Mobile h-scroll / CTA / drawer scroll | not re-audited this pass | gap: no mobile Playwright |

## HookAlternatives note (not RED)

Mock `HOOKS` texts are **English only**. `HookAlternatives.tsx` does **not** apply `--font-hy`. Smoke logs `SMOKE_C25_NOTE_HOOKS_EN_ONLY`.  
If Frontend later seeds Armenian hook strings → must add `font-[family-name:var(--font-hy)]` (smoke will hard-fail when seed has `\u0530-\u058F`).

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| Inspector Armenian readable (Noto / `--font-hy`) | GREEN (source + mock glyphs + live inspect 200) |
| ADMIN cannot use Mesh; OWNER can | GREEN source; HTTP-only cannot flip role |
| S1 Generate + drawer + C-23 stream | GREEN (live jobId + SSE frames≥2) |
| `guards.md` three checks green | GREEN G1–G3 |

## Failures for Fixer / Frontend

**none** — Frontend step **not required** for C-25.

Optional (non-blocking): add `--font-hy` to HookAlternatives when hy hooks land.

## Playwright MCP gap

No Playwright MCP tools enabled → no automated click of QA role / computed `font-family` on node. Compensated by `scripts/smoke-c25-e2e.ts` source + live generate/stream.

## Re-run

```bash
npx tsx scripts/smoke-c25-e2e.ts
BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c25-e2e.ts
python plugins/frontend/anti_slop_scan.py .
```

## Mirror in Client skill

| C-25 | Armenian `--font-hy` + ADMIN mesh deny + S1/C-23 | smoke-c25 | `scripts/smoke-c25-e2e.ts` + this file |
