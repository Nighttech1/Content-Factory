---
name: reel-motion-research-playbook
description: Curated evidence-based video skills curriculum for Vernatun reels; hook mechanics, short-form comedy pacing, Remotion/HyperFrames implementation, technical and art review.
---

# Production-ready Reels research playbook (2026-11-21)

This is a **curated learning adapter**, NOT an installed plugin bundle, production renderer, subscription, license to reuse outside media, or proof of runtime availability. Each linked upstream source must be rechecked before installing/upgrading; never blindly execute unfamiliar shell scripts. Existing `shared/skills/reel-*` skills and 10-stage pipeline are canonical.

## Theory: find and preserve the joke
- [YouTube Shorts: hook interview](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/) (YouTube official): first-second hook, curiosity and payoff; do not treat the speaker's personal heuristic as algorithm law.
- [Claude short-form skills](https://github.com/mvpdsigner/claude-skills): `reel-edit-style` analysis of measured reference videos and beat-by-beat assembly; third-party draft, validate through own renders.
- [Video structure analyzer / retention adapters](https://github.com/F0rger123/claude-video-editing-god-mode): reference-only ideas; check licenses per included skill, quality and compatibility; do NOT wholesale install 34 plugins.
- [Claude video skills](https://github.com/MuhammadaliNazarov/claude-video-skills): hook/script/edit breakdown, J/L cut, music bed, HyperFrames option, preview-to-master ladder; use as checklist guidance, not unreviewed external service.

For each approved concept prepare **one** owner-facing story/shot table. Hook <= 2s with reason to stay; establish premise; escalate once; surprising payoff; clean ending. A funny awkward silence is not dead air. Make the source video understood with audio OFF (subtitles) and with audio ON (rhythm).

## Remotion — precision for titles, masks and transitions
- **Official docs/agent skills** https://github.com/remotion-dev/skills
- Skill router `remotion-best-practices`, targeted `remotion-markup`, `remotion-captions`, `remotion-render`. Install only in an approved isolated runtime with Node/Chrome as needed, pinned versions after code review.
- Scene structure: group video/audio/captions by scene so trim/speed stay aligned: https://github.com/remotion-dev/skills/blob/main/skills/remotion-best-practices/remotion-captions/display-captions.md .
- `TransitionSeries`: transitions overlap scene timelines while overlays don't; calculate true length and avoid surprise music slips: https://github.com/remotion-dev/skills/blob/main/skills/remotion-best-practices/remotion-markup/transitions.md .
- Use frame-index-based animations, deterministic `spring()` or `interpolate()`, local font loading (Bebas Neue must be licensed/available), subtitles aligned to spoken words. Every motion event must have semantic purpose (hook, emphasis, reveal), not decorative constant movement.

## HyperFrames — alternative (not automatically replace Remotion)
- https://github.com/heygen-com/hyperframes : free/open-source HTML/CSS seekable animation → local MP4. Official core skills `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`; on-demand `/remotion-to-hyperframes`.
- CLI docs https://github.com/heygen-com/hyperframes/blob/main/packages/cli/README.md : Node >=22, FFmpeg; `doctor`, `lint`, `preview`, `render`, `audio` and `normalize-audio`. Catalog contains many editable motion blocks, but verify licensing and every template before use.
- HyperFrames skill integration `npx hyperframes skills update` requires execution in the correct video workspace; **not run in this repo/chat**. Respect source-tool telemetry and paid-feature gates; core local rendering differs from Pro features.
- Candidate third-party course https://www.youtube.com/watch?v=GBlJEJUlUmg (HyperFrames overview), and short-form tutorial https://www.youtube.com/watch?v=ciCRH4Q8EkQ ; instructional claims from these creators are not benchmarks for our runtime.
- **Choose ONE renderer per job**: baseline FFmpeg for clean edits, Remotion for scripted React typography/captions, HyperFrames for HTML-centric motion/registry. Do not combine frameworks unnecessarily or double the pipeline.

## QA pattern adopted from community workflows
- https://github.com/ritu-dadhwal4/instagram-video-skills : cut-audit (uncut syllables and source sound), take-geometry (keep text off faces), caption-align, sfx-design, reel-review. Treat as inspiration and review any third-party scripts/models/licenses before importing.
- https://github.com/askeditor/ai-video-editing-skills : punch-in, reframe, split layout, sound mix, timestamped review patterns; not installed.
- **Final art director gate:** `shared/skills/reel-final-art-direction/SKILL.md`, `projects/vernatun/.claude/agents/reel-art-director-final.md`, after finished render and before existing editor. A timecoded `REWORK` routes back to **one named specialist** and repeats that defect and overall regression checks.

## Production and verification rules
- No guarantee any hook is viral. Use real Instagram metrics after publishing, not style scores as evidence.
- No unattributed copying of competitor music/cuts/script; license sources. Do not fetch Instagram media through prohibited bypasses.
- Preserve user requirement: **SIMPLE first** (0–2 cuts, 1 joke), optional POLISHED and SHOWCASE if requested. Design is judged at phone size, full motion and sound; contact sheets don't prove timing.
- Hard gates: user-specified script, one owner-facing table, Gemini/Veo prompt after script approval, Bebas Neue exact Reels hook font, no crude stripe over burned subtitles, user music continuous from exact offset, 4K 60 FPS delivery with non-native source honestly marked, Drive output link verified. Never call a preview publication-ready.
- Before invoking runtimes: inspect `ffmpeg -version`, `node -v`, `npx remotion --version` / `npx hyperframes doctor` **only in permitted environment**; check actual configs/lockfiles; network installer, subscriptions, VPS deploy, cloud GPU and publication require separate approval.
- Art-director verdict `ACCEPT` then existing editor verdict `ACCEPT` then owner sees final file for approval. This order is mandatory.
