---
name: carousel-storycraft
description: Designs swipe-by-swipe Vernatun carousels in three editorial classes: attraction, useful and interactive motion.
---

# Carousel storycraft

## First choose the editorial class

Every brief must name exactly one class and one promise.

### 1. Привлечение — emotional / discovery

Purpose: make a new person stop, recognize themselves and want to join the Vernatun world.

- One human tension or desire, not a list of facts.
- Slide 1: bold truthful hook; slides 2–5: atmosphere, people, contrast or mini-story; final slide: one invitation.
- Use generated images as the visual carrier and HTML/CSS/SVG for all readable text, Armenian labels, logo and CTA.
- Default length: 5–7 slides. Keep text sparse and let the image do work.
- CTA: usually `@vernatunbot`, Telegram or «приходи как есть».

### 2. Полезная — saveable / practical

Purpose: give a concrete answer that can be saved, sent and used at a meeting.

- One audience question and one complete answer.
- Slide 1 promises the result; each middle slide contains one step, phrase, example or distinction; final slide closes the promise before CTA.
- Generated images support the idea, but never carry facts or exact text. HTML overlay owns hierarchy, examples, translations, sources and CTA.
- Default length: 6–9 slides. Every factual claim gets a source in the brief or caption.
- CTA: practice at a meeting, use the rooms, or save/share when that is the plan.

### 3. Словарь — phrase bank for live discussions

Purpose: give a newcomer three immediately usable phrases per content slide for entering and sustaining a group discussion.

- The hook slide contains one short viral-style phrase only, supported by an AI-generated atmosphere and a readable HTML overlay in the brand font.
- Each middle slide contains exactly three Armenian phrases, each with transliteration and Russian translation in the HTML layer.
- Phrases must cover discussion moves: greeting, joining a conversation, asking an opinion, expressing an opinion, agreeing, soft disagreement, asking for clarification and keeping the topic alive.
- The final slide contains one short invitation phrase only, plus the HTML logo and one CTA. It must close the emotional promise, not introduce a fourth phrase list.
- Default length: 5–7 slides. The background never contains readable copy, pseudo-text or a logo.

### 4. Интерактивная — motion HTML

Purpose: trigger a response: choose, guess, tap, count, compare or answer.

- No image generation. Build the whole scene in HTML/CSS/SVG/JS with motion tokens.
- One interaction mechanic per carousel: quiz, choice, reveal, progress, swipe-like sequence or timed prompt. Do not mix mechanics.
- The first frame explains what to do; the last frame reveals the answer and gives one CTA.
- Motion must reinforce meaning: 150–500 ms transitions, transform/opacity first, no constant decorative movement, and a `prefers-reduced-motion` fallback.
- Deliver the editable HTML motion source plus a deterministic export. For Instagram, export a 1080×1350 PNG sequence or MP4; for the web preview, keep the live HTML.
- Default length: 4–7 scenes. Keep one focal object and one action per scene.

## Shared narrative rules

1. Define one audience, one promise and one next action.
2. Slide 1 earns the next swipe with a specific, truthful hook.
3. Each middle slide advances one idea and varies visual density.
4. Deliver the promised payoff before the CTA; never hide the answer only to force swipes.
5. Use Russian as the main language; Armenian inserts get a clear translation and Noto Sans Armenian.
6. Use one CTA matching the content-plan funnel stage.
7. Separate sourced facts from creative framing. Do not promise virality or copy a competitor's distinctive execution.

## Visual handoff

The Art Director writes one visual system for the whole set, then per-slide intent. For image-backed classes, the Designer receives background prompts with no letters, logos or UI-like fake text. The Finish Artist receives a per-slide `bake-task.md` containing the exact copy, Armenian labels, logo placement, safe zone, contrast treatment and CTA.

For the interactive class, the Motion/Finish Artist receives a scene manifest: state, trigger, timing, easing, reduced-motion behavior, export frame and acceptance check.

## Validation gate

Before handoff, check the complete sequence at phone size:

- no overflow, clipping or accidental line breaks;
- contrast remains readable on the darkest and lightest frame;
- safe zone is 7–8% from all edges;
- text is selectable/HTML-rendered, never baked into generated imagery;
- the class mechanic and CTA are understandable without the caption;
- sources, font files, asset rights and export dimensions are recorded.

Read `shared/skills/marketing-methods/SKILL.md` and only `modules/carousel.md` for the carousel stage.