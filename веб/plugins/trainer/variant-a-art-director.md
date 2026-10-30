# Variant A + Art Director — trainer card

**When:** wave locks Designer **`html_layout` JSON** (template/anchor/highlights) executed by `carousel-layered-composite` **and** new pipeline agent **Art Director** (post-ready review: remarks **or** approve; **NO auto-remake**; UI on mesh/Team). Smoke = **ONE** carousel + AD text only. Orchestrator writes **VPS checklist** at end (not Trainer).

## HARD locks

| Lock | Value |
|------|-------|
| Variant A | Designer LLM → `html_layout` → composite executes (enum templates; no raw HTML from LLM) |
| S57 keep | Image bg + HTML overlay; ban letters on bg; CTA 1–4 HTML; OCR remake vision OFF |
| Art Director | After carousel ready; **Gemini vision**; virality+design+completeness; thin slides → remarks; `approve` \| `remarks`; **NO auto-remake** |
| Type scale | DESIGN `typography.scale` → Designer + composite; `html_layout` placement only |
| Logo | Settings Brand raw logo → HTML `<img>`; LLM sanitize ≠ render path |
| UI | Show AD on **mesh** + **Team**; shell_freeze AppShell |
| Smoke | **ONE 6-slide** + pretty `N / 6` + AD Gemini review **text**; no remake loop |
| VPS | Checklist at end = **Orchestrator** artifact |
| ticket_limit | default ≤3 unless user full-queue |
| secrets | never in memory/skills |

## Skills / rules

| Layer | Path |
|-------|------|
| Art Director skill | `.cursor/skills/art-director/` |
| Rule / agent | `.cursor/rules/art-director.mdc` · `.cursor/agents/art-director.md` |
| Registry | `.cursor/registry/agents.md` |
| Layout contract | `art-director/html-layout-variant-a.md` |
| Layered product | `carousel-json-contract` Phase 7 · `carousel-layered-html-pipeline.md` |
| Critique patterns | `art-director/critique-checklist.md` (public IG/AI-carousel QA adapted) |
| Mesh | `xyflow-agent-mesh` |
| Pipeline order | `content-pipeline-agents` |

## Public patterns card (brutal visual QA)

Inspiration only (AttentionClaw-style sequence QA + IG carousel craft + Canva swipe rhythm):

1. Sequence > single slide  
2. Continuity (type/color/safe/identity)  
3. Phone readability / one focal point  
4. CTA matches promise; Vernatun catalog 1–4  
5. Reject slop (purple glow, flat hooks, clutter)  
6. Reason codes → remarks (improve next **manual** wave — not auto-loop)

## Chain (proposed)

```text
Trainer ✅
  → Architect (spec: type scale → composite; logo dual-path; Gemini AD;
               rich visual_prompt; pretty N/M; smoke ONE×6; chain.md)
  → AI Bridge (Designer: scale inject + html_layout; Scriptwriter rich visual_prompt;
               AD Gemini system + completeness/thin-slide bars)
  → Backend (composite scale+logo raw; AD Gemini vision job; slide-num N/M; persist)
  → Frontend (if logo Settings UI broken — BrandPanel only; mesh/Team AD chip; shell_freeze)
  → Tester (guards: scale respect; logo img; AD gemini; no remake; 6-slide smoke)
  → Deployer (localhost)
  → smoke ONE 6-slide + AD Gemini text
  → Client optional (Playwright if UI acceptance requested)
  → Orchestrator: VPS checklist (end)
```

## Budget

ONE × **6** final PNG + one AD markdown/JSON review under `docs/карусель тест/` or `generatedMedia/…` (Architect path). Cap ≤8 finals without stop-report.

## Out of scope

Motion redesign · social publish · paid MCP · Trainer writing app code / VPS runbook body.
