# Decisions — C-25 E2E QA Polish

## Tester-first

**Chosen:** no Frontend/Motion kickoff until Tester proves a gap. Mesh redirect already exists in `app/admin/mesh/page.tsx`; task is verification + guards.

## RBAC depth

**Chosen:** keep client session-store gate for Sprint 7. No Prisma Role migration / NextAuth in this ticket.

## Font check method

**Chosen:** assert `--font-hy` / computed `font-family` contains `Noto Sans Armenian` on inspect hy nodes + unicode sample in DOM. Visual MCP screenshot optional, not sole acceptance.

## Ordering

**Chosen:** run after C-23 so S1 regression includes SSE. Independent of C-24 for font/RBAC; Orchestrator may run C-25 after C-24 to avoid drawer motion flakes during S1.

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec + chain + decisions | Done |
