# Architect spec — C-carousel-json-scriptwriter (P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-json-pipeline`.  
> Canon: `.cursor/skills/carousel-json-contract/SKILL.md` + `workers/script-writer/SKILL.md`.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`.  
> Depends on: AI Bridge prompts; Backend zod. FE after **P0** preview path exists.

## Goal

Сценарист Create = **Dramaturgy & Hook Engine**: отдаёт **strict JSON** handoff для Дизайнера.  
`requested_slide_count` и `slides.length` = **только N из запроса пользователя**. Если N нет — **спросить**, не угадывать.

## Zod / JSON schema lock (wave canon)

Имена полей **этой волны** (supersede skill example `headline`/`body`/`role` as product names):

```json
{
  "contentType": "carousel",
  "requested_slide_count": 7,
  "idea": "one-line concept",
  "hook": "cover/opening hook",
  "tone": "vernatun",
  "slides": [
    {
      "index": 1,
      "layout_variant": "cover",
      "primary_copy": "≤6–8 words",
      "secondary_copy": "",
      "swipe_trigger": "why swipe to next",
      "visual_prompt": "background/scene — no on-image text dump",
      "alt_text": "a11y description"
    }
  ],
  "caption": "IG/TG caption",
  "hashtags": ["#…"],
  "promptForDesigner": "human brief + pointer to slides[]"
}
```

| Field | Rule |
|-------|------|
| `requested_slide_count` | Integer = user N; **must** `=== slides.length` |
| `slides[].layout_variant` | Rhythm label (`cover` \| `point` \| `proof` \| `cta` \| …) — **not** fixed template length |
| `slides[].primary_copy` | Cover ≤ **6–8** words sense |
| `slides[].secondary_copy` | Optional body; may be `""` |
| `slides[].swipe_trigger` | **Required** every slide (last may be soft CTA/end) |
| `slides[].visual_prompt` | Background/image only; overlays via HTML Designer |
| `slides[].alt_text` | Required per slide before Publication «complete» |
| `caption` / `hashtags` | upload-post-style metadata |

**HARD dynamic N:**

- Source of truth = **user request only**.
- Forbidden: hardcode 4/5/8 as product truth in Scriptwriter system prompt, fixtures, or UI.
- Missing N → Scriptwriter **asks** for N (Architect lock: **no silent default** before question).

## Vernatun tone lock

| Нужно | Запрещено |
|-------|-----------|
| Культурные / community hooks | Инфобиз-вода: «секрет», «система на 6 фигур», «подпишись и забери» без содержания |
| Cover ≤ 6–8 слов | Простыня на обложке |
| `swipe_trigger` на каждом слайде | Слайд без причины свайпа |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-json-1 Artifact** | Handoff = fenced `json` in chat **+** machine-readable object for Designer (`priorArtifacts.carouselJson` or equivalent). Wave3 one-liner insufficient alone. |
| **D-json-2 Validate** | Backend/AI Bridge path validates with **zod** before Designer draw treats artifact as ready. Mismatch `requested_slide_count !== slides.length` → error / ask fix. |
| **D-json-3 No auto-handoff** | Keep C-carousel-agents: Scriptwriter never auto-advances; user clicks «Передать задание». |
| **D-json-4 C-155** | Live user turns = raw only; Dramaturgy rules live in **system** / agent-start bundle. |
| **D-json-5 Mesh** | Update carousel-engine Scriptwriter copy in `lib/mesh/agent-defaults.ts` + `create-carousel-prompts.ts`. |

## In scope

| Path | Owner |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` | AI Bridge / Backend (minimal) |
| **NEW** `lib/studio/carousel-json-schema.ts` (zod) | Backend (+ AI Bridge field names) |
| `app/api/studio/agent-chat/route.ts` | Backend — parse/attach artifact on handoff/describe |
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend — show JSON / ask-N UX / handoff payload |
| `workers/script-writer/SKILL.md` | Already updated by Trainer — AI Bridge must match |

## Out of scope

- Preview black wire (**C-carousel-preview-black**)
- HTML renderer / PNG (**C-carousel-html-designer**)
- Razbor Scriptwriter chat contract changes
- Silent IG publish

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| System prompts + Vernatun + ask-N | **AI Bridge** | First |
| zod schema + validation on handoff | **Backend** | After AI Bridge |
| Chat render + handoff carries JSON | **Frontend** | After P0; step 3b |

## Contracts

```ts
type CarouselHandoffJson = {
  contentType: "carousel";
  requested_slide_count: number;
  idea?: string;
  hook?: string;
  tone?: "vernatun" | string;
  slides: Array<{
    index: number;
    layout_variant: string;
    primary_copy: string;
    secondary_copy: string;
    swipe_trigger: string;
    visual_prompt: string;
    alt_text: string;
  }>;
  caption: string;
  hashtags: string[];
  promptForDesigner?: string;
};

// Invariant
// carouselJson.requested_slide_count === carouselJson.slides.length === userN
```

Agent-start Scriptwriter system **must** list these fields and forbid inventing N.

## Acceptance criteria (язык Клиента / S42)

1. User сказал N (напр. 7) → JSON `requested_slide_count === 7 === slides.length`.
2. Нет N → сценарист **спрашивает** N, не рисует «красивую пятёрку».
3. У каждого слайда есть `swipe_trigger`, `layout_variant`, `primary_copy`, `visual_prompt`, `alt_text`.
4. Есть `caption` + `hashtags` (или явный follow-up до handoff).
5. Tone Vernatun: нет инфобиз-воды в sample handoff.
6. S42 snapshot чата с JSON.

## Risks

- LLM omits fences — Backend extract JSON from reply (fenced first, then brace scan) with clear fail.
- Token limits — keep schema compact; summarize history.
- Dual schema names in old docs (`headline`) — prompts must use **this wave** names only.

## Mid-flight escalation

Если zod names conflict with Prisma/publish draft store → стоп → Architect maps DTO ↔ store keys in this spec → continue. Do not silently rename without chain update.
