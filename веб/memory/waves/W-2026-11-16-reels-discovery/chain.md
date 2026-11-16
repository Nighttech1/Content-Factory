# Order and path locks
Trainer → Architect → Backend (budget gateway, snapshots, 72h scheduler, routes, no DB) → Frontend (reuse existing components; module entry, isolated drafts/cache, analysis/copy) → Tester → Fixer if needed → Deployer localhost → Client.
Roles executed sequentially by one assistant; no independent-agent verification claimed. Motion/AI Bridge skipped: reuse existing motion; no LLM calls or model prompts changed. Budget research: official Apify account-limits and actor-run API docs, read 2026-11-16.
Tickets: C-reels-feed-isolation, C-reels-budget-scheduler, C-reels-analysis-handoff. Further dashboard findings stay explicit backlog, not silently 'all fixed'.
