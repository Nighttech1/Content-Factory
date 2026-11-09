# Улучшение качества видео

Отдельный pipeline для уже снятого/смонтированного файла. Не запускает генерацию
рилсов и не меняет сценарий, текст, музыку, монтаж или контент-план.

**Состояние:** CPU CLI проверен локально; GitHub Actions требует отдельного запуска;
GPU notebook подготовлен, CUDA inference в этой среде не проверен. Ни один статус
технического QA не означает визуальное улучшение или готовность к публикации.

## Вход и эстафета

- Quality ID `VQ-YYYYMM-NN` — техническая обработка, отдельная от контент-плана.
  При наличии родительского `V-YYYYMM-REL-NN` сохранить его в брифе; не переименовывать.
- Доступный оригинал ≤500 MiB и ≤180 секунд, права и согласия, разрешение на передачу
  выбранному исполнителю. Никаких секретов и закрытых URL в Git или публичных inputs.
- Пожелания: что плохо, где это видно (оригинал/экспорт/соцсеть), допустимый размер,
  кадрирование и ограничения на лица/цвет. Сначала попросить оригинал камеры, если есть.
- Ручная эстафета: ID → версия → файл/manifest → фактический статус → следующая роль
  → блокеры. Запись файла не доставляет задачу в другой чат и не запускает субагента.

## Этапы

1. **Диагностика:** FFprobe, полное декодирование видео/аудио, 5 опорных кадров,
   ручная оценка. Разделять смаз движения, промах фокуса, шум, компрессию,
   недостаток света и качество копии после соцсети. Не ставить фиктивный quality score.
2. **Метод:** baseline или осторожный CPU профиль; при необходимости — GPU trial.
   На уже Full HD файле сначала улучшать в исходном размере, не увеличивать до 4K автоматически.
3. **Проба 3–5 секунд:** движение и лица; before/after с одинаковым диапазоном,
   comparison (LEFT baseline / RIGHT candidate). Также смотреть файлы в полном размере.
4. **Принятие пробы:** визуальное улучшение, без мерцания, новых деталей лиц, ореолов,
   повреждения букв или сетки. При отсутствии выигрыша SKIP, оставить оригинал.
5. **Полная обработка:** только после принятия пробы и совпадения SHA256/профиля.
6. **QA:** декодирование, размер/SAR/fps/длительность/аудио + полный просмотр со звуком.
   После изменения повторить затронутые lead/editor gates. Соцсети не публикуются.

Применяется существующая политика `shared/skills/reel-quality-enhancement/SKILL.md`.
В этом пакете используется native FFmpeg: собственный контракт sample approval,
двойной контроль источника/настроек, синхронное сравнение и диагностика целого файла
не представлены одним вызовом typed toolkit; тот не требуется для запуска CLI.

## Что исполняется

| Исполнитель | Возможности | Честное ограничение |
|---|---|---|
| GitHub Actions / локальный CPU | Диагностика, unsharp, мягкий hqdn3d, Lanczos, H.264/AAC | Не восстанавливает гарантированно утраченные детали; GPU нет |
| Private Kaggle / интерактивный Colab | RealESRGAN x2plus, tiled inference, смешивание с оригиналом | Бесплатный GPU по доступности; temporal flicker возможен; реальный GPU test ещё нужен |
| Remotion / HyperFrames | Не нужны в этом pipeline | Генерация motion остаётся отдельным pipeline |

HDR, rotation, non-square SAR и interlace при обработке дают явный STOP. GPU путь
дополнительно требует CFR; VFR не преобразуется молча. Никакого face restoration,
интерполяции кадров или генеративной дорисовки лиц по умолчанию.

## С телефона — бесплатный GPU (рекомендованный первый шаг)

1. Скачай [`free-gpu.ipynb`](free-gpu.ipynb) через Raw/Download в GitHub.
2. Открой https://www.kaggle.com/code → New Notebook → Import Notebook, выбери файл.
   Сохрани **private**. Добавь исходник как **private input** через Add Input.
   В настройках выбери доступный бесплатный GPU и Internet. Если меню неудобно,
   включи в мобильном браузере «Версия для ПК». Подтверждение аккаунта выполняет владелец.
3. Выполни первую ячейку. Без CUDA остановись — не включай платный billing.
4. Укажи INPUT `/kaggle/input/.../reel_FINAL.mp4`, проверь ID, поставь
   RIGHTS_CONFIRMED=True только при подтверждённых правах/согласиях.
5. Запусти ячейки до sample. Просмотри before/after/comparison. Начни WIDTH=0,
   STRENGTH=0.5; при повреждении лиц/текста не принимай пробу.
6. При выигрыше выставь SAMPLE_ACCEPTED=True, выполни final. Скачай MP4 и manifest
   из Output; после просмотра всего файла передай результат сюда на приёмку.

Альтернатива: https://colab.research.google.com/ → Upload notebook, Runtime →
Change runtime type → доступный GPU; ячейка загрузки файла работает через files.upload.
Notebook самодостаточный, закрытый репозиторий клонировать и ключи передавать не нужно.
Если сессия исчезнет, исходник/параметры нужно загрузить заново. SAMPLE_ACCEPTED
не обходится автоматически. Обновлять embedded code через `build_notebook.py`.

## GitHub Actions — настройки один раз

Workflow: `.github/workflows/video-quality.yml`, имя **Улучшение качества видео**.
Он только `workflow_dispatch`; нет автоматического push/cron или платных API.

**Репозиторий Content-Factory публичный.** Кадры/MP4 из artifacts в публичном
репозитории нельзя считать приватными. Для личного видео используй private
Kaggle/Colab либо отдельный private repository. Не делай весь Content-Factory
приватным без отдельного решения владельца. `public_media_allowed=false` по
умолчанию блокирует обработку в public repo. Выставлять true можно только если
разрешено публичное распространение всех выходных кадров/видео.

В Settings → Secrets and variables → Actions:

| Тип | Имя | Значение |
|---|---|---|
| Variable | VIDEO_QUALITY_ACTIONS_ENABLED | `true` после проверки тарифа/нулевого бюджета |
| Secret | VIDEO_QUALITY_SOURCE_URL | Прямая HTTPS ссылка на файл, доступная исполнителю; не HTML-страница Drive |
| Variable | VIDEO_QUALITY_ALLOWED_HOSTS | Точный hostname хранилища; несколько через запятую, без wildcard |
| Variable | VIDEO_QUALITY_SOURCE_SHA256 | SHA256 выбранного файла |

Настройки секретов этот GitHub-коннектор менять не умеет. URL не печатается;
редиректы запрещены, размер/хэш проверяются. Для Drive нужен отдельный авторизованный
адаптер — он **не реализован**. Здесь не запрашиваем пароль/токен в чат.
Вложения чата автоматически в Actions не передаются.

Запуск с телефона: Actions → **Улучшение качества видео** → Run workflow:

1. `check` — проверить инструменты, файл не скачивается.
2. `selftest` — синтетический клип и проверки гейтов, личное медиа не используется.
3. `diagnose` — разрешённый source, права и применимые public/private ограничения.
4. `sample` — тот же ID, профиль, ширина и начало 3-секундной пробы.
5. Скачай artifact `video-quality-<ID>`, посмотри comparison и отдельные before/after.
6. `final` — укажи номер sample run и accept_sample=true, сохрани source/profile/width.
   Manifest из sample скачивается автоматически; чужой исходник/настройки отклоняются.

Artifacts истекают через **3 дня**, это не постоянная медиатека. На стандартных
публичных runners вычисления бесплатны по текущим правилам, но хранение и квоты
контролируются отдельно. Для private repo расходуется included compute. Не
выбирать larger/GPU runners. Проверить нулевой бюджет в GitHub Billing; этот
workflow сам не читает остаток и не изменяет бюджет.

В этом чате tool для workflow_dispatch не обнаружен. Запуск через кнопку делает
владелец; наличие upload/commit инструментов не означает право dispatch.

## Локальный CLI

Требования: Python 3.10+, FFmpeg с libx264/AAC/hqdn3d/unsharp/scale/hstack,
FFprobe. Файлы — вне Git. Новый output каталог на каждый запуск.

```bash
python3 shared/pipelines/video-quality/test_pipeline.py
python3 shared/pipelines/video-quality/run.py --mode diagnose --input /media/source.mp4 --output /media/diag --job-id VQ-202611-01
python3 shared/pipelines/video-quality/run.py --mode sample --input /media/source.mp4 --output /media/sample --job-id VQ-202611-01 --profile gentle --rights-confirmed
python3 shared/pipelines/video-quality/run.py --mode final --input /media/source.mp4 --output /media/final --job-id VQ-202611-01 --profile gentle --rights-confirmed --approval /media/sample/manifest.json --accept-sample
```

Профили: baseline (перекодирование без коррекции), gentle (мягкая резкость), denoise
(осторожный шумодав + резкость), lanczos (масштабирование при заданной --width).
Шумодав может уничтожать мелкие детали: не выбирать его автоматически.

## Источники и лицензии

- Политика бесплатного Colab: https://research.google.com/colaboratory/faq.html
- Kaggle GPU: https://www.kaggle.com/docs/notebooks
- GitHub billing: https://docs.github.com/en/actions/concepts/billing-and-usage
- RealESRGAN model zoo (BSD-3-Clause upstream): https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md
- Spandrel (MIT): https://pypi.org/project/spandrel/0.4.1/

Вес скачивается только с official release v0.2.1; его SHA256 фиксируется при пробе
и сверяется при final. Это fingerprint фактически скачанного файла, не проверка
по заранее опубликованному upstream checksum. Torch из GPU-среды не переустанавливается;
его версия записывается в manifest. Pip dependencies/совместимость проверить первой
GPU-пробой; синтаксическая проверка notebook не заменяет запуск модели.
