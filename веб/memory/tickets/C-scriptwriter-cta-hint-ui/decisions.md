# Decisions — C-scriptwriter-cta-hint-ui

| Decision | Choice |
|----------|--------|
| Placement | Thin chrome bar top of chat pane (above messages), justify-end — not modal «Передать задание» |
| Component | `ScriptwriterCtaHint.tsx` + Radix Popover |
| Visibility | Only `activeStep === "scriptwriter"` |
| 21st | Reuse Radix popover already in tree (`chatgpt-prompt-input`); Vernatun retokenize — no new stock dialog |
