# Тренер — Клиент перед приёмкой карусели (HARD)

Платящий клиент **не** принимает по одному PNG в чате.

## Обязательный прогон до вердикта ПРИНЯТО

1. **Слайды глазами (naked-eye):** нет пунктира VOCAB_SLOT; oval HY—RU pill; лого TR; стрелка = **изогнутый swoosh**, цвет только white/dark, не orange.  
2. **Сценарии поведения (Studio UI):** открыть draft → клики вкладок AD → Generate/Preview если есть → Download zip. Скрипт: `tsx scripts/client-playwright-carousel-accept.ts` или Playwright MCP @1440.  
3. **Хореография / motion:** если в волне есть Remotion/видео/переходы — смотреть ролик целиком (не стоп-кадр). Нет ролика → в вердикте явно «motion N/A».  
4. **Логи job:** `AD_VERDICT.md` + `AD_FINDINGS.json` + `vocab_bake.json` (`detectSource`) + `slide_arrow_bake.json`.  
5. Полуфабрикат / major guide leftover / стрелка не как swoosh → **НЕ ПРИНЯТО**, тикет назад команде.

## Усиление команды
- Оркестратор: всегда писать **какой агент сейчас**.  
- После REJECT — Тренер дописывает findings в `promts` (не повторять).
