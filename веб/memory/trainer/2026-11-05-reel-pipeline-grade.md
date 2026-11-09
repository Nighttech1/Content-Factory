# Trainer grade — Reels one-turn specialist pipeline

## Scope

Make the Reels department reliably run two intake modes, named specialist masks,
strict lead review after every phase, visible chat progress, one-turn production
after usable authorized inputs, motion inserts, and a durable learning log.

## Readiness grade: C before / A- after documentation changes

| Area | Before | Gap | Required reinforcement |
|---|---|---|---|
| Role instructions | C | `reel-lead` combined script/edit; no fixed per-step gate | Replace lead profile with explicit specialist chain |
| Pipeline docs | C | README described a different order and human approval as intermediate gate | Canonical chain + two modes + own gates |
| One-turn behavior | D | generic runner required manual user relay between every phase | Reels-specific exception with bounded internal revisions |
| Motion | B | motion skill existed, but interstitial/remotion and final render review were not hard-gated | motion-over-footage required; interstitial/transition optional with reasons and render inspection |
| Progress transparency | D | no mandatory in-chat checklist of active mask/gate/revisions | fixed progress format in skill/profile |
| Quality learning | C | personal lead memory only; no auditable run journal | append-only `memory/reel-log.md` and log-keeper profile |
| Tool/subagent truthfulness | C | configs mention tools without ensuring availability | separate true subagents from sequential role passes; verify runtime |

## Reinforced artifacts

- `shared/skills/reel-department-runner/SKILL.md`
- Reels lead profile and nine specialist mask profiles in `projects/vernatun/.claude/agents/`
- `shared/pipelines/reel/README.md`, department README and start prompt
- `shared/rules/agent-roster.md`, `shared/skills/pipeline-runner/SKILL.md`
- `projects/vernatun/memory/reel-log.md`

## Acceptance evidence

- Both director-assigned and owner-originated starts are defined.
- Every required active stage has a named specialist, artifact, lead gate, and
  revise path. Optional interstitial and transition phases require explicit SKIP.
- Checklist format requires current phase/mask, gate, iteration, remarks/blocker.
- Rendering is not claimed without actual file inspection; one-turn completion is
  conditional on usable sources and available tools.
- Publishing remains behind Editor and human approval.
- The generic runner includes an explicit Reels exception so the instructions do
  not contradict each other.
