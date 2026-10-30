# AI Bridge contract — C-reels-scriptwriter-upgrade

> For **Frontend** label smoke + **Tester** S44.C. Do **not** glue carousel Dramaturgy JSON.

## Defaults (mesh)

| Field | Path | Canon |
|-------|------|-------|
| `PIPELINE_COPY["custom-reels"]` | `lib/mesh/agent-defaults.ts` | Сценарист / Монтажёр; hook 0–2s HARD; beats; CTA; `promptForMontage` |
| `COMBAT_USER_BRIEFS["custom-reels"]` | same | Short mission; Team «Задание» may stay empty (C-155) |

### Verbatim intent baked into `copywriterPrompt`

1. Hook **обязан** попадать в **0–2 секунды**; иначе FAIL.  
2. Структура: hook → 2–4 value beats → CTA on-screen + caption.  
3. Тайминг субтитров / VO на каждый beat; формат 9:16 15–30с.  
4. Запрет: плоский VO без хука; тихие первые 2с; carousel slide JSON; `promptForDesigner`.  
5. Handoff = `promptForMontage` + hook/beats/cta fields.

## Artifact helper

| Symbol | Path |
|--------|------|
| `ReelsScriptArtifact`, `parseReelsScriptArtifact`, `parseReelsScriptFromReply`, `REELS_SCRIPT_SCHEMA_HINT` | `lib/studio/reels-script-contract.ts` |

```ts
type ReelsScriptArtifact = {
  contentType: "reels";
  durationSec: number;
  hook: { t0; t1; onScreen; vo }; // t1 ≤ 2
  beats: Array<{ t0; t1; label; onScreen; vo }>; // ≥2
  cta: { t0; t1; onScreen; vo; captionLine };
  promptForMontage: string;
  // optional: roles, location, caption, hashtags
};
```

`parseReelsScriptArtifact` **rejects** payloads with `slides[]` and no `hook` (`carousel_slides_forbidden`).

## C-155

Live user turns = raw composer only. Do not append Team brief into `user` role.

## Verify

1. Seed agents for `custom-reels` → copywriter name **Сценарист**, prompt contains «0–2» + `promptForMontage` + запрет carousel.  
2. Sample JSON with hook t1=2, ≥2 beats, cta, promptForMontage → `parseReelsScriptArtifact` ok.  
3. Sample with only `slides[]` → fail.
