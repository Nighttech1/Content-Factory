# Bake portability — specification and execution chain

Before SHA: 4b4786fe1732b948978feed33b8ba63d6ca6a8ef. Authorized by owner: persist the working bake and checks in this repository and explain the next stage.

Trainer assessment: B for offline compositing; canonical browser render is blocked in this environment. Gaps: working renderer lived only in a chat ZIP, no repeatable input contract, inconsistent stage numbering and stale logo margins/arrow color rules. This wave addresses these gaps without changing the web application.

## Architecture locked before implementation

Scope: existing shared/pipelines/carousel/, links from existing entry points, brand geometry, carousel-lead memory. No new UI, service, queue, provider calls, deployment or publishing. Git stores UTF-8 code/config/docs only; image/font bytes remain in the existing repository locations or the saved media package.

Preserve the proven Cairo/Pango preview as an explicitly labelled replay tool, parameterized by a case JSON and an asset directory. It must never silently become the canonical production renderer. Add a Chromium runner for generated HTML: font readiness, DOM bounds, line count, exact dimensions and export. Failure must produce BLOCKED/FAILED, never ACCEPTED. Add a separate portable input validator and tests for rejection cases.

Every future job supplies accepted backgrounds, exact strings and coordinates. Shared defaults: logo top/right 54 px on 1080×1350 (explicit owner override of historical 7–8% for logo only); arrows black/white from local contrast, no final arrow; original logo asset only. New designs change case data, not historical accepted assets.

## Chain (sequential roles, one assistant; no independent subagents)

1. Orchestrator: audit source and scope.
2. Trainer: identify missing durable code/guards and numbering conflict.
3. Architect: this specification and path locks before code.
4. Coder: parameterized preview, input/contrast guards, canonical runner and case data.
5. Tester: negative contract tests, isolated replay, canonical blocked-state verification.
6. Fixer: only observed failures, repeat the same commands.
7. Client: read reports and inspect unchanged preview outputs. This is not independent visual review of content.

Frontend/Motion/Backend/AI Bridge: skipped, no application UI/API/provider changes. Deployer/localhost UI acceptance: skipped, offline CLI and docs only; canonical browser runtime availability remains separately reported. No web release or social publication is authorized by this change.

## Acceptance

- A second model can run from case JSON + supplied asset directory without the previous chat filesystem.
- Missing/changed asset, invalid phrase count, unsafe coordinates or unaccepted background fail before rendering.
- Seven slides, 15 cards, original alpha-cropped logos and monochrome arrows remain reproducible.
- No script can mark content/editor/owner acceptance merely from technical PASS.
- Source links unambiguously distinguish owner step 5 (post-bake review) from detailed historical Stage 5 (background QA).
- Results and limitations are added below after actual checks.


## Actual validation results

- 18 unittest guards passed; Python compile check passed.
- validate.py confirmed 11 actual input hashes; no missing assets.
- Parameterized preview replay produced seven PNGs and one contact sheet identical byte-for-byte to the previously accepted preview, using the same installed Cairo/Pango/fonts.
- canonical.py was executed with the installed Chromium and returned BLOCKED_OR_FAILED (exit 2); no technical/visual/editor/owner success was invented. Browser success path needs execution in an environment that permits Chromium.
- No application UI/API/database/provider integration changed; no web/localhost application acceptance or deployment was performed.
- Client verdict for code/docs: portable preview and guards verified; canonical production render remains blocked. Content final art/editor review is the next owner step 5, not claimed complete here.
