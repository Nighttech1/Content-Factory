# Клиент-критик — LIVE-GEN Round 1 (STRICT)

**Вердикт круга 1:** **НЕ ПРИНЯТО** (качество vs эталоны пользователя)  
**Черновики в UI:** да (3 шт LIVE-GEN R1) — persist OK  
**Бюджет:** 9/9 PNG spent → Round 2 = **overwrite** тех же draft-id

## Эталоны (что требовалось)

| Ref | Качество-планка |
|-----|-----------------|
| **A** orange/white real-estate | Крупный hero-объект/фото, жирный контраст, CTA-кнопка на **каждом** кадре, воздух, «постерная» ясность |
| **B** OM GYM cinematic | Люди/метафоры, 3D-текст **в сцене**, drama light, не «иконка в плитке» |
| **C** motivation tips | Жёлтые номера tip, чёрный фон, чёткая tip-карточка, doodle/иконки, CTA save/comment |

## Что получилось у нас

| Карусель | Плюсы | Провалы vs ref |
|----------|-------|----------------|
| **LG-A** Coffee | Аккуратная типографика Vernatun, 4:5 | Один HTML-kit «night glass»; cover = линия-иконка кофе, не hero-фото; UI-шум `ESPRESSO · 4:5 PLATE` / timers; нет жирной CTA на каждом слайде как у A |
| **LG-B** Community | Киношный свет на mid/CTA | Cover снова **та же** плита+иконка кофе; нет людей/3D-слов в кадре; mid перегружен RITUAL CLOCK / TO-GO RUSH (не вирусный пост) |
| **LG-C** Heritage tips | Жёлтый блок на cover, tip-тема в тексте | Нет структуры tip **1 / 2 / 3** как у C; снова espresso-plate; mid = мрамор+таймеры, не tip-карточка; CTA есть, но визуал не «жёлтый tip-pack» |

## Корневые причины

1. **Один role-kit на все три эстетики** → карусели выглядят как siblings одного шаблона, не как три разных «пачки» уровня Claude Code.  
2. **visual_prompt** недостаточно жёстко требует full-bleed photo / no line-icon plate / no telemetry chrome.  
3. **HTML overlays** добавляют product-UI (`HOOK` pills, clocks) — у эталонов этого нет (или иначе).  
4. Нет **акцентного слова** цветом в заголовке (как Growth/Success у A).

## Задачи Round 2 (AI Bridge) — overwrite

1. Три **разных** kit/CSS / prompt packs: `clean_poster` / `cinematic_scene` / `tip_cards`.  
2. Cover: **запрет** line-art coffee plate; только сильное фото/3D-сцена.  
3. Убрать с mid: RITUAL CLOCK / TO-GO RUSH / PAPER SPRINT (или спрятать).  
4. LG-C: слайды = Tip1 / Tip2 / CTA с жёлтыми номерами.  
5. CTA pill крупнее, как marketing button.  
6. Перезаписать те же 3 draft id. **Не** создавать 4-ю карусель. Суммарно deliverable всё ещё 9 PNG.
