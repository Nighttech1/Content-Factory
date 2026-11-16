# Reels discovery and dashboard audit · 2026-11-16

Owner: Alik. Account: @mosarmclub. Existing app only; no shell redesign.

## Scope and acceptance
1. C-reels-feed-isolation P1: expose existing custom-reels workspace from Studio; no carousel drafts in any non-carousel module, no demo content presented as published. Preserve all stored drafts. Empty states must be honest. Video-only typed server/client feed; own published posts verified by owner/permalink/source.
2. C-reels-budget-scheduler P1: 72h server cadence independent of browser; single actor call per round, rotating Armenian-language/culture/diaspora/humour tags plus our profile. All Studio Apify execution uses one persistent budget gateway. Provider account ceiling reduced to <=$5 before paid requests, read-back verified; fail closed on absent/unknown usage, unsupported actor/origin, active provider runs, unknown pricing. Reserve maximum $0.30 before request; account-wide preflight, $4.50 application reservation ceiling, immutable reservation after timeout/failure, disk lock across processes. Do not claim protection for external/manual API clients that modify account limits.
3. C-reels-analysis-handoff P1: video preview/source link; rank eligible recent reels by verified metrics, relevance, age, and creator outlier where a sufficient sample exists. Missing metrics remain unknown, no global 'best on Instagram' claim. Analysis uses observable metadata only, labels hypotheses and unavailable video/transcript. Copy a standalone Russian adaptation brief for the existing reelmaker; no additional LLM spend, no messages to other chats.

## Constraints
Next standalone/systemd; persistent data under existing data/ symlink. No schema migration, social publishing, deletion, paid LLM, or new service. Runtime secrets reused through existing env aliases; never included in artifacts. Scheduler starts only production runtime; CI and development never collect automatically. UI changes reuse existing GlassCard/GlowButton/Dialog. 21st unavailable; no new dependency. Provider cap is account-wide and can be reduced, never raised. A missing runtime credential is a reported blocker, not fake success.

## Audit
Live Studio/cartoon-reels: demo stock posts and rival_r-01…04 with fabricated metrics; carousel Drafts48 in video module; ordinary reels absent from Studio. Global QA role selector visible on public VPS: record as security concern; real auth is separate existing backlog, do not pretend UI selector provides authorization. Audit Schedule/Settings/Growth and register further observed issues before prioritizing.

## Checks
Budget and concurrent lock/timeout/month boundary/fail-closed tests without external calls; feed/drafts/cache isolation; ranking/dedup/topic/age/missing-metric tests; typecheck, build, targeted regressions; actual UI clicks through preview/analysis/copy. Deployment uses existing QA artifact mechanism only; no release claim without successful runtime verification.
