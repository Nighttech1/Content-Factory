# Trainer — B5.4 Logo bake checkpoint

**Цель:** exact PNG emblem на каждом Mode B слайде (не GPT redraw, не HTML chrome bar).

## Код

- `lib/studio/vernatun-carousel/logo-bake.ts` — `bakeExactEmblemOntoSlide`
- `renderModeBCopies` — bake по умолчанию (`LOGO_BAKE=0` выкл.)
- `repair.ts` — logo major → `slidesToRerender` only (bake), не regen
- Prompt: `logo_bake` + clear TOP-RIGHT

## Smoke

```bash
npm run test:vernatun
npx tsx scripts/run-mode-b-checkpoint-b2.ts test 2026-10-23-b5-logo-bake
```

## Приёмка Тренера / Клиента

1. Один и тот же `brand/apple-touch-icon.png` в TOP-RIGHT на всех слайдах  
2. Нет «перерисованного» знака  
3. Unit B5.4 зелёные  
4. Live job в `generatedMedia/vernatun-smoke/2026-10-23-b5-logo-bake/`

## Do not

- Включать `MODE_B_HTML_CHROME=1` как «фикс» лого  
- Закрывать волну B без вердикта Клиента по визуалу
