# Architect spec — C-director-nav-marketing

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal

Primary entry to Marketing Director = left nav **«Директор»** → `/marketing`. Remove Studio Launchpad top-right «Маркетинг-директор».

## Locks

| Item | Lock |
|------|------|
| Sidebar | Add nav item after Settings (or with Studio/Schedule/Settings): label **Директор**, href `/marketing`, testId `nav-director` |
| Prefetch | Include `/marketing` in idle prefetch |
| Studio | Delete Link/`studio-entry-marketing` from `StudioPageClient` |
| Route | `/marketing` already exists (S47) — no new page required |

## Owners

Frontend only. Out of scope: Marketing chat internals.

## Acceptance

@1440: sidebar shows Директор; click → `/marketing`; Studio header has no Marketing button.
