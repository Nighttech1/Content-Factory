---
name: reel-final-art-direction
description: Mandatory visual acceptance of actually rendered Vernatun Reels. Independent role pass before editorial review. Diagnose defects with timecode and return them to the responsible specialist; do not auto-approve previews.
---

# Final Reel Art Director — visual acceptance gate

## Purpose
An additional **mandatory** gate after reel-finisher produced a real MP4, before the existing editor and before owner review. No parallel reel team. The head `reel-lead` enforces this gate while `reel-art-director-final` evaluates the film as an exacting mobile viewer and brand creative director.

**Independent review only when a real separate agent/runtime is available.** Otherwise a separate documented role-pass, not an independent subagent. Do not pretend a static contact sheet constitutes full-video or audio review.

## Required evidence
- Actual playable render, selected visual reference/design profile, accepted script/one-table storyboard, owner remarks, brand tokens and current source/audio rights.
- ffprobe metadata and decode check, at least three mobile-sized frame screenshots (hook, transition, ending), **full-duration playback with sound**, spot checks on every subtitle/graphic change and every cut, safe-zone assessment.
- Compare `simple/polished/showcase` level selected in brief, not number of effects. If unavailable media or runtime, verdict is `BLOCKED_NOT_REVIEWED` and result is not ready for owner.

## 10-point scorecard (each PASS / FAIL / N/A with evidence)
1. Hook in 0–2 seconds and readable without sound; first second carries context, curiosity or visual surprise.
2. Single central joke, comprehensible to someone outside Vernatun, culturally respectful and not over-explained.
3. Comedy rhythm: setup → escalation → contrast/twist → reaction → hard stop. Preserve deliberate awkward pause; delete dead time that doesn't build expectation.
4. Typography exactly approved: **Bebas Neue for Reels**, verified actual font file/runtime, not merely visual similarity. Hook/captions hierarchy, orthography, Cyrillic/Armenian glyphs, flag/emoji and safe areas.
5. Overlays do not obscure faces, hands, joke, dance or play. No opaque stripe covering embedded captions; clean source or properly temporally reviewed removal.
6. Motion has a purpose; start/end/easing/anchor are consistent. No unmotivated whip/zoom, stutter, flash, warped masks, discontinuity, fake 3D or busy transitions.
7. Sound: owner-supplied track starts at exact requested offset, remains ONE continuous musical bed across picture cuts; spoken dialogue audible, no clipping and no abruptly missing/restarted beat.
8. Frame integrity: logical vertical composition, no unintended black bars, cropping keeps subjects visible, no source app UI, watermarks or illegal reused media.
9. Master and honesty: target **2160×3840 / constant 60fps / MP4 H.264+AAC**, report any upscaling/frame interpolation from lower native source; playback on phone checked.
10. Brand/rights/CTA: the club feels contemporary and welcoming, logo/CTA never harms the joke; no unapproved music footage or asset licenses.

## Verdict and defect routing
Every gate writes `55-final-art-director-verdict.md` inside the job (between 40-output-manifest and 50-editor-verdict conceptually; filename number 45 recommended when job already uses 50 for editor). Required content:
- reviewer mode: separate agent / sequential mask;
- asset + source version and SHA/drive URL, evidence and review method;
- overall `ACCEPT | REWORK | BLOCKED_NOT_REVIEWED`;
- scorecard with concrete timestamps/frames;
- **defect tickets**: `QA-001 | 00:03.2–00:03.8 | severity BLOCKER | visible text covers face | owner reel-motion-designer | expected correction ... | evidence screenshot ... | verification ...`.
Each BLOCKER routes ONLY to its responsible phase: scriptwriter (weak hook/punch), footage-editor (source/copyright), rough-cutter (cuts/subtitles), motion-designer (font/graphic/masks), transition-editor (bad join), finisher (codec/audio/export). If source itself has burned captions and no clean layer, report as blocked by clean source rather than hide under a rectangle. After fix: rerender; recheck the defect AND regressions in all changed sections, and repeat art director pass. Max two fix rounds per phase before block/escalate.

**No owner-facing final 'ready' / Drive final upload before art ACCEPT and existing editor ACCEPT.** Draft preview may be shared as DRAFT only with clearly stated defects. Do not take approval of a design card or Gemini reference as approval of the rendered MP4.

## Reference sources — inspiration, not installed dependencies
- Remotion official https://github.com/remotion-dev/skills (captions, markup, timing, spring/easing, render).
- HyperFrames https://github.com/heygen-com/hyperframes (HTML/CSS seekable video, local lint/preview/render, editable registry).
- Claude third-party assessment patterns: https://github.com/ritu-dadhwal4/instagram-video-skills (cut audit, geometry, captions, reviewer).
- YouTube creator guidance https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/ (first-second hook).
- Licensed music and user-supplied sources only. Never copy a complete edit from a competitor.

## Definition of Done
Actual entire MP4 watched and listened to, scorecard PASS, art director ACCEPT; editor independently reviews; owner sees approved file/Drive link only after both gates. Inaccessible video or unverified tools means NOT DONE.
