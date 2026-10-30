# Guards — C-49 Carousel workspace chrome

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | `StudioModuleWorkspace` не импортирует / не монтирует `ModuleIdeaBar` | **PASS** | Нет `import { ModuleIdeaBar`; только комментарий про замену |
| G2 | Нет subtitle «Опубликованные посты модуля» / «Актуальные карусели ниши» в workspace | **PASS** | Строк нет в `StudioModuleWorkspace.tsx`; `VerticalPostCarousel` без `subtitle` props |
| G3 | Competitors search: `data-testid="competitors-search"` + topic refetch wire | **PASS** | Search в `VerticalPostCarousel`; parent `onCompetitorsTopicSearch` → `fetchFeed(…, "competitors")` |
| G4 | `FeedPostCard`: `feed-play-btn` + нет `autoPlay` / `autoplay=` атрибутов | **PASS** | Play overlay; `<video>` без autoplay attrs; play только через toggle |
| G5 | Localhost `/studio/carousel-engine` HTTP 200, HTML содержит `competitors-search` | **PASS** | `127.0.0.1:3000/studio/carousel-engine` → 200; `competitors-search=True` |
| G6 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Executable checks

```powershell
# G1–G4 disk
Select-String -Path "components\studio\StudioModuleWorkspace.tsx" -Pattern "import \{[^}]*ModuleIdeaBar"
# must be empty (comment-only mentions OK)

Select-String -Path "components\studio\StudioModuleWorkspace.tsx" -Pattern "Опубликованные посты модуля|Актуальные карусели ниши"
# must be empty

Select-String -Path "components\studio\workspace\VerticalPostCarousel.tsx" -Pattern 'data-testid="competitors-search"'
# must match

Select-String -Path "components\studio\workspace\FeedPostCard.tsx" -Pattern 'data-testid="feed-play-btn"'
# must match

Select-String -Path "components\studio\workspace\FeedPostCard.tsx" -Pattern "\bautoPlay\b|autoplay="
# must be empty (comments mentioning "no autoplay" OK if pattern is attribute-only)

# G5 live
Invoke-WebRequest http://127.0.0.1:3000/studio/carousel-engine -UseBasicParsing | % StatusCode  # 200

# G6
python plugins/frontend/anti_slop_scan.py .
```

```bash
# Wave disk contract (tsx)
npx tsx -e "/* WAVE_DISK_CONTRACT: C-49 subset — no IdeaBar import, no banned subtitles, competitors-search, feed-play-btn, no autoPlay on FeedPostCard */"
```

## Neighbor note

`scripts/smoke-c40-competitors-by-topic-ui.ts` **FAIL** на устаревших asserts (ожидает subtitle «Актуальные…» + IdeaBar clear). Продуктовый C-40 refetch через Competitors search **жив** (`handleCompetitorsTopicSearch`). Обновить smoke-c40 отдельным патчем — не блокер приёмки C-49.

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-49**.

## Fixer?

**Нет** — acceptance C-49 на диске и live chrome зелёные.
