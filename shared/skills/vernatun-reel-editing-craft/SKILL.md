---
name: vernatun-reel-editing-craft
description: Editing craft playbook for Vernatun short-form comedy; FFmpeg-first, optional Remotion kinetic typography, captions, punchline timing and phone QA. Reference review 2026-11-19.
---
# Vernatun Reels — монтажный стандарт

## Контекст и маршрут
Читать вместе с `shared/skills/reel-department-runner/SKILL.md`, `shared/skills/reel-reference-analysis/SKILL.md`, `shared/skills/reel-motion-design/SKILL.md`, `projects/vernatun/brand/design.md` и утверждённым `00-brief.md`. Это **дополнение к существующему производству**, не параллельный конвейер и не новая команда.

## Референс владельца (19.11.2026)
Загруженный 34.71-секундный MP4 (576×1280, H.264, около 24 fps) — экранная запись Instagram Reels с говорящим за столом, крупными белыми заголовками на тёмном фоне, синими акцентами, светлыми полноэкранными вставками, круглой маской говорящего, прямоугольным cutout и сменами текстовых композиций. Выводы основаны на просмотре выборки кадров, НЕ на покадровом измерении всей анимации; точные шрифт, easing и параметры эффектов не установлены. Звук по кадрам не анализировался. Не импортировать чужие медиа, тексты, музыку или UI Instagram.

## Обязательная эстетика при минимальном монтаже
1. **Comedy-first:** шутка, лица и пауза важнее motion. По умолчанию `SIMPLE`: 0–2 склейки, один hook и один финальный панч, 1–5 участников. `POLISHED`: дополнительно 1–3 текстовых акцента; `SHOWCASE`: композиции с масками только по явному брифу и фактическому рендеру. Не назначать SHOWCASE автоматически из референса.
2. **Титры:** максимум одна ключевая фраза на экране; 1–2 строки в одной зоне, акцентировать не больше одного смыслового слова за раз. Большой, читаемый в масштабе телефона текст. Слова появляются на смысловом ударении, а не бессистемно каждую долю. Русские диалоги — корректная кириллица; армянские фразы — выверенный текст плюс русский перевод.
3. **Brand:** использовать токены `brand/design.md`, главный шрифт Noto Serif Display 900 для брендовых hook/CTA. Референсный синий не становится новым brand token; брендовый `azure` уже определён. Логотип — только канонический asset, не перерисовывать, не закрывать лица.
4. **Визуальные формы:** при необходимости 1 полноэкранная смысловая вставка, 1 круглая/прямоугольная маска или карточка — только когда проясняет идею; не копировать композицию и не превышать 2–3 графических событий в десятисекундном скетче.
5. **Звук/пауза:** в начале естественная речь и clear hook; не срезать последнюю согласную и вдох перед шуткой. За 0.2–0.6 с до панчлайна допустима осмысленная пауза, после реакции — 0.3–1.0 с тишины, если она смешнее музыки. Это ориентиры, не жёсткий пресет.
6. **Планы:** лицо остаётся видимым, текст не перекрывает глаза/важные жесты; не размещать критические титры у верхней/нижней кромки, где UI Reels. Safe zones проверять в реальном мобильном предпросмотре.
7. **Технический baseline:** мастер 1080×1920 9:16 при достаточном качестве исходников; H.264 + AAC; fps согласовать с исходником, не выдавать искусственный апскейл за новые детали. Контролировать пик аудио, клиппинг, воспроизводимость, потерянные кадры, орфографию субтитров и конец без чёрной вспышки.

## Рекомендуемый инструментальный порядок
- **FFmpeg/ffprobe** — baseline для чтения параметров, нарезки, кадрирования, звука, 9:16 экспорта; без браузера.
- **WyattBlue/auto-editor** https://github.com/WyattBlue/auto-editor — опциональное предложение черновых cut-поинтов по звуку; preview/dry run обязателен, не удалять неловкие комедийные паузы автоматически.
- **Remotion official skills** https://github.com/remotion-dev/skills — предпочтительный источник для титров и shape masks: `remotion-best-practices`, `remotion-captions`, `remotion-render`. Установка и runtime проверяются отдельно; не считать доступными по записи в Git. Браузерный render только там, где Chromium поддерживается; без него FFmpeg overlay fallback.
- **Hugging Face multilingual ASR candidate:** https://huggingface.co/Systran/faster-whisper-large-v3 (CTranslate2 Whisper large-v3; for Russian/Armenian clips test language accuracy, never assume perfect Armenian transcription). English-only Distil-Whisper is not the default for our languages. Model weights and runtime must be provisioned in an authorized environment; avoid paid inference without approval.
- **WhisperX** https://github.com/m-bain/whisperX — необязательное ASR с word timestamps для субтитров; хранить аудио вне Git, проверять лицензии моделей и соответствие русской/армянской речи. Без GPU — ручная разметка субтитров. Не подтягивать pyannote gated модели без разрешения.
- **Claude video editing guidance** https://github.com/appariciojunior/video-editor-skills — использовать идеи по pacing/review; это дополнительная методика, не обязательная установка DaVinci Studio. **salomonMuriel/media-production-skills** https://github.com/salomonMuriel/media-production-skills — опциональный reference для director QA/shot design; не копировать зависимости или код без отдельного review.

## Контроль и acceptance
Сначала одна сценарная таблица владельцу (таймкод, кадр/ракурс, действие, точная речь, графика/монтаж/звук). После апрува — подробный Gemini/Veo prompt для референсного шаблона. Референсное AI-видео ≠ готовый выпуск.
При монтаже создать EDL (in/out + reason), subtitle transcript, motion brief с исходными и финальными таймкодами и трёхсекундный тест сложного эффекта; предосмотр в масштабе 360px и полный просмотр финального файла. Проверять: хук ≤2 с, сохранена пауза перед панчем, одна шутка, safe zones, читаемая кириллица и армянский, звуковой баланс, нет watermark/чужих кадров без прав.
Готовность: `reel-lead` принимает каждый активный этап, editor ACCEPT, явный owner approval перед публикацией. Никакого автодеплоя, платных API, загрузки видео на внешние сервисы без отдельного разрешения.

## Mandatory owner output spec (2026-11-20)
For each final Vernatun reel: master 2160x3840 vertical, 60fps, H.264/AAC MP4, verify resolution, constant frame rate, duration and successful decoding with ffprobe/ffmpeg. Render from best available source; if source is lower than 4K/60, report an upscaled/interpolated delivery, not native capture. Upload to Google Drive output folder ID `1c11_x2x6OgU2x0Vjm0cMhA3MsKf9P0-9` (https://drive.google.com/drive/folders/1c11_x2x6OgU2x0Vjm0cMhA3MsKf9P0-9), read back Drive metadata and give owner the uploaded file link. The folder is for output delivery, **not permission to automatically post**. Never put heavy MP4 in Git.

## Отказоустойчивость титров и музыкальной дорожки (20.11.2026)
1. Reels hook font = **Bebas Neue, exactly**, NOT a similar substitute. Distinguish this Reel-specific choice from carousel's Noto Serif Display Black. A missing font file is a blocked acceptance gate `FONT_BEBAS_NEUE_MISSING`, even if a visual approximation was rendered for preview. Never commit or send proprietary font binaries; obtain a licensed asset through approved sources at runtime.
2. Audio replacement: explicitly map only the desired user-supplied track, starting at source 04:04 (244s) where specified, one seamless audio segment underneath all video cuts; do not splice/restart the track across cuts. Confirm with listening and waveform checks.
3. Embedded subtitle cleaning: do NOT place opaque stripes across people's bodies, do NOT call blurred rectangles 'removal'. Only accept a clean master or well-reviewed temporally consistent inpainting; inspect moving silhouettes in multiple frames. Remaining halos/ghost glyphs fail editorial QA.
4. Specific Reel copy: first hook pairs 🇦🇲💃 with the main phrase; no corner flag. Second hook copy «ОНА ЖЕ: СПУСТЯ 3 ЧАСА». Do not append horizontal footage after the final vertical sequence.
5. For each edit, record owner feedback as a concrete QA failure and assert all previous requirements before export. Send updated MP4 to verified Drive output folder only when QA gate passes; otherwise label as non-final review preview and explain precisely what remains.

## Update 2026-11-21: two-font system supersedes previous single Bebas Neue requirement
For Vernatun Reels, primary colored emphasized words = **Measure Regular (Measure by Iomaio; provided Measure.ttf/Measure.otf)**. Secondary non-emphasized words = **AA Logotyper Regular (AA Logotyper.otf)**. The previous mandatory Bebas Neue font gate is superseded. One colored emphasis per hook unless the owner explicitly approves otherwise. Keep flags/dancing emoji inline within the initial text line, not as a separate corner badge. Verify actual font metadata, Cyrillic coverage and rendered subtitles in the MP4. Reject substitution. The owner-provided AA Logotyper archive contains a free personal/commercial license; Measure archive has no redistributable license file, so do not commit its binary to Git or circulate it as an asset before licensing verification. The new two-font rule is Reels-only, not carousel typography.

## 2026-11-21 owner typography experiment + entrance-action gate
For this specific dance Reels version, colored primary is trial MV-WEEKEND (uploaded MV-WEEKEND.otf); white secondary stays AA Logotyper Regular. Treat as a pending visual preference test, not an automatic global replacement of Measure. Font family metadata must match and the rendered Cyrillic must be legible. Archive notes 'Freeware', not confirmed Git redistribution rights: do not commit font binaries.
Hook footage gate: do not cut the entrant off before she fully exits the visible frame. The first shot should show her meaningful entrance, departure and readable initial hook (target ~3 or more seconds), and should not waste several seconds on an empty doorway. Swap headline on the exact first frame of the dance cut; no lag or blank interval. Inspect last hook frame and first dance frame and watch all cuts in real-time on a phone-sized player.
