# Frontend — S50 UI pass

**Role:** Frontend · after Architect brief  
**Tickets:** C-s50-settings-design · C-s50-feed-chrome · C-s50-create-prompts (UI)

## Done

### C-s50-settings-design
- Embla = BrandbookBoard only @ `aspect-[3/5]`; no sliced/swatches/MD crumbs/slots counter
- Toolbar one row: дизайн.md · референс · новый дизайн+icon · preview Eye icon-only
- Card click selects only (no preview panel)
- Settings pad ~75% smaller (negative shell margin + wider band)
- Removed colors-only helper

### C-s50-feed-chrome
- Dual-feed `h-[calc(100dvh-11rem)]`; minimal `pb-*` (workspace/scroll/card CTA)
- No orange dots; module title without «(4:5)»
- Boards dropdown + create + rename; no count on «Доски»
- Sort+filter left of search on Ours + Competitors; Ours search on Published

### C-s50-create-prompts (UI)
- AgentPeopleIconTabs (Razbor look); start Scriptwriter
- Competitors/Ours toggle higher (+ Razbor same)
- Preview ≈29rem (1.5× of S48 19.5rem)

## Next in wave
AI Bridge (prompts) → Backend live if mock → Tester → Fixer → Deployer → Client
