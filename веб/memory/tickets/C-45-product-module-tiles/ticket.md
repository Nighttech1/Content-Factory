### [C-45] Продуктовые плитки вместо QA-плагинов
- **Зона / Экран:** Studio Launchpad `/studio` — сетка модулей
- **Факт:** На сетке висят стоковые QA-блоки «Tester Plugin C21», «Client Plugin C21», «C22 Live Plugin…», «C22 Client Recheck…» из `data/local/custom-modules.json`.
- **Ожидание:** Эти 4 плагина убрать. Вместо них — 3 реальные плитки: «Рилс», «Нарезки с видео в рилсы», «Информационное видео». CORE (карусели, инфографика, мульт-Reels, HeyGen) оставить.
- **Приоритет:** P1
- **Скрин-улика:** живой `/studio` до/после
- **Зона:** Frontend (+ лёгкий Backend только если нужен seed JSON API register)
