---
name: reel-motion-design
description: Plans and produces polished motion inserts for short vertical reels using an art-director brief, brand tokens and available Remotion/FFmpeg tooling.
---

# Motion design for reels

Motion is a planned production step, not decoration added at random. The Art Director fills `20-art-direction.md` and the `motion-brief.md` template before rendering.

## Motion brief

For every insert specify time in/out, purpose, visual element, entrance/exit, duration/easing, text, safe-zone, brand token, asset/licence and fallback without motion. Prefer one visual idea at a time: kinetic headline, word highlight, masked reveal, punch-in, parallax/B-roll transition, progress marker or CTA emphasis.

## Production

1. Use Remotion when available for timed typography, transitions and reusable compositions.
2. Use FFmpeg for trims, compositing, subtitles, audio and final encoding; it does not replace the motion design brief.
3. Keep the hook legible in the first two seconds; use motion to direct attention and explain, not obscure speech or captions.
4. Respect 9:16 safe areas, contrast, reduced visual clutter, readable Armenian/Russian text and music rights.
5. If Remotion or a needed renderer is unavailable, return an explicit blocker or a supported static/FFmpeg treatment approved by the Art Director.

## QA gate

- [ ] Preview the rendered video, including the first 2 seconds, caption changes and CTA.
- [ ] Motion timing matches the brief and does not cover faces, captions or logo.
- [ ] No flicker, malformed text, abrupt audio, licensed-asset issue or frame outside canvas.
- [ ] `ffprobe` confirms 1080×1920 and expected codecs/duration.
- [ ] Record output link, render method and QA in the job manifest.

Never claim a polished motion render from a plan or command alone: inspect the actual rendered artifact.
