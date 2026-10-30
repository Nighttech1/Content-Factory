# Decisions — C-settings-design-md-carousel (Frontend)

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-13 | 21st id=813 Embla → `components/ui/carousel.tsx` · element=Design library · motion=yes (Embla swipe) | Canon `21st-ui-catalog` carousel.tsx / Embla; no @appica |
| 2026-10-13 | CTA image append = FIFO (`appendDesignLibrarySlotFifo`); MD upload = block at 10 | User lock FIFO for «Добавить новый дизайн»; Architect D-sd-4 block for MD |
| 2026-10-13 | Close X sibling of drag handle (not child) | D-sd-7 pointer capture swallow |
| 2026-10-13 | Seed docs/DESIGN.md via `/api/settings/design-md` + `seedDesignLibraryFromMarkdown` after legacy migrate | D-sd-9 |
