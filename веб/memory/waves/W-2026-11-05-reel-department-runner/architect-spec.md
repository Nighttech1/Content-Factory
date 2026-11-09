# Architect spec — Reels department runner

## Goal

Make the Reels lead follow a predictable two-mode production pipeline within one
owner request, with specialist role profiles, acceptance gates, visible progress,
review, and a persistent quality journal.

## Constraints

- This is content-factory configuration/documentation, not a web UI/API change.
- Preserve the repository's editor + human approval requirement before external
  publication.
- Do not claim separate agent execution, MCP connectivity, Remotion/FFmpeg
  availability, or successful render unless verified in the active runtime.
- Large source/output video stays out of Git.
- Single user turn means internal production without intermediate owner approval;
  missing rights, sources, facts or tools remain hard blockers.

## Design

The canonical source is `shared/skills/reel-department-runner/SKILL.md`, linked
from `reel-lead.md`, pipeline README, department README, start prompt and generic
pipeline runner. The department lead owns nine named specialist masks and ten
phase gates. Research/rationale is adjusted by intake mode; production stages are
shared. Motion over footage is a normal phase; full-frame HTML/Remotion scenes and
transitions are optional with explicit SKIP rationale. The output is considered
ready only after actual render QA, Editor acceptance, and log append.

## Acceptance scenarios

1. Director ID with scout notes: inspect plan/job/source rights, produce rationale
   and time-coded script before inspecting/assembling supplied footage.
2. Owner topic: bypass missing director/scout intake, state hypothesis without
   fabricating evidence, then use the same production and QA gates.
3. Every phase shows mask + accepted/rejected gate + iteration in chat; rejection
   returns to the same role and blocks downstream work.
4. No owner approval is requested for intermediate script/rough/motion passes.
5. Missing rights, footage, facts, or render runtime prevents publication-ready
   status and is called out as a blocker.
6. Completed run appends facts and evidence-backed improvement to reel-log; no
   claims of virality without platform metrics.
7. External publication still requires a human approval after editor acceptance.

## Scope exclusions

No web interface, scheduler, external upload, plugin/MCP installation, or social
publishing integration is implemented in this wave.
