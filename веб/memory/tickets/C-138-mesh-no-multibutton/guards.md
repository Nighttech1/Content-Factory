# Guards — C-138 no MultiButton

1. `/studio/*/mesh` — no `mesh-pipeline-switcher`, no channel MultiButton under title
2. Top bar has «Скопировать ТЗ для Cursor»
3. `MeshPipelineSwitcher.tsx` deleted / not imported

Evidence: Playwright evaluate `hasSwitcher: false`, Copy TZ present.
