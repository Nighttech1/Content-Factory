# Art Director — brutal carousel critique checklist

Each fail → one remark with `severity` + `severity` + concrete `note`. Review the **full sequence**, not isolated pretty frames.

## 1. Hook (cover / slide 1)

- [ ] Cover stops the thumb in ≤2s (pattern interrupt, not flat label)
- [ ] Headline ≤6–8 words; not a paragraph
- [ ] Promise matches middle slides (no bait-and-switch)

## 2. Sequence & dramaturgy

- [ ] One idea per slide; order is logical
- [ ] Mid slides deliver value (not filler repetition)
- [ ] Rhythm varies layout/emphasis where meaning needs it — not random drift
- [ ] `swipe_trigger` exists as **meta only** (never painted on PNG)

## 3. Visual continuity

- [ ] Same type system + hierarchy across slides
- [ ] Same color roles / contrast behavior (DESIGN.md tokens)
- [ ] Same safe margins (~120 top / ~160 bottom / ~80 sides)
- [ ] Character / brand mark identity stable when used
- [ ] Bg plates feel one world (no random style jump)

## 4. Hierarchy & density

- [ ] One focal point per slide
- [ ] Headline > body > chrome
- [ ] No competing equal-weight blocks
- [ ] Accent/highlight words used sparingly (Variant A `highlights`) — not rainbow spam
- [ ] **Type scale:** HTML primary/body sizes follow active DESIGN.md `typography.scale` (not LLM-assumed «huge cover type» when preset is small)
- [ ] **Thin content FAIL:** mid slides that are only ~2 short sentences with no value beat / proof / ritual detail → remark (`copy` or `hierarchy`, usually P1)

## 4b. Content completeness (Gemini vision — not script-only)

AD must look at **pixels**, not only JSON copy:

- [ ] Cover sells swipe (visual pattern interrupt readable at phone size)
- [ ] Each body slide has a **complete thought** on-frame (headline + enough body OR strong single-line + visual support) — not placeholder air
- [ ] CTA slide readable + catalog intent matches promise
- [ ] Sequence tells a story a stranger can finish without the Scriptwriter chat
- [ ] Virality cues: curiosity gap, rhythm change, one sticky detail — remark if flat brochure

## 5. Layered HTML integrity (S57)

- [ ] Text/logo/CTA live on HTML layer (not baked letters in bg)
- [ ] Bg has **no** letters / logos / watermarks
- [ ] CTA on `cta_slide` only; catalog **1–4**
- [ ] Brand **name + logo image** both present when Settings Brand has `logoRef` (name-only = **P0/P1 `brand`**)
- [ ] Logo chrome: **enlarged** icon, **bottom-RIGHT**, transparent bg; name **beside** (right of icon), not under
- [ ] Fonts match **FULL** active DESIGN.md (title/body/content) — sizes **and colors** per role; bg mood not fighting type colors (e.g. purple type ≠ black mud)
- [ ] Club/brand name chrome uses DESIGN content/body family (see carousel-json-contract § Club name font)
- [ ] Slide number = **own** HTML block + pretty `N / M` **when layoutMap says present**; if map `numberingGlobal: absent` → **no** numbers on slides
- [ ] Layout: with `layoutMap` → anchors/chrome match grammar; without map → variety (not all top-left)
- [ ] Body/`secondary_copy` **MUCH wider** (not 1–3 short sentences; body ≥220 chars / ≥5 clauses bar)
- [ ] Character path: `overlay_cutout` = person OVER bg (not baked); `in_image` = in scene OK; conductor speaks text on cover/last when required

## 6. Mobile / Instagram craft

- [ ] Readable at phone size (not only 1440 desktop preview)
- [ ] Important copy not under busy photo regions
- [ ] Aspect 4:5 (1080×1350) consistent
- [ ] Alt/caption readiness if Publication step claims complete (soft P2 if smoke-only)

## 7. Anti-slop (HARD taste)

- [ ] No purple-on-white / generic AI glow as hero look
- [ ] No Inter/system as slide display default when brand fonts exist
- [ ] No stock-clipart vibe vs etalon `layered-html-refs` (#3 cut-out bar)
- [ ] No “инфобиз-вода” CTA outside catalog 1–4

## Verdict rule

| Condition | Verdict |
|-----------|---------|
| Any P0 open | `remarks` (never approve) |
| Only P1/P2 | `remarks` with list **or** Architect-locked soft-approve — default this wave: still `remarks` if any P1 |
| Zero fails | `approve` + short `summary` |

**NO AUTO-REMAKE** after remarks.
