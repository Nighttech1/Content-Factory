# Проверки — 2026-11-09

## Фактическое исполнение

- `python shared/pipelines/video-quality/test_pipeline.py`: **7 tests PASS**,
  последний полный прогон 6.364 s, exit 0.
- End-to-end: синтетический 320×480/30 fps/4 s H.264 с AAC → полный decode →
  5 кадров → 3 s before/after/comparison → запрет final без принятой пробы →
  принятый final, decode/звук/размеры/fps/длительность и hash исходника сохранены.
- Отрицательные gates: права, диапазон/NaN, чужой source/profile, HDR/rotation,
  перезапись исходника, сетевой allowlist/HTTPS/private IP.
- AST всех Python файлов, YAML workflow, только workflow_dispatch, 9 inputs и
  компиляция embedded Python в workflow: PASS.
- Notebook: code cells компилируются; embedded run.py/gpu.py совпадают с исходниками.
- Присланный файл: полный FFmpeg decode и техническая диагностика PASS;
  в Git только текст предварительной диагностики, без видео/кадров/аудио.

## Непроверенное и блокеры

- CUDA/model inference: **NOT RUN**, GPU в этой среде не подтверждён.
- Новый GitHub Actions run: **NOT RUN**, dispatch инструмент в коннекторе отсутствует.
- Variables/secrets/нулевой бюджет: **не настроены через чат**, capability отсутствует.
- Полный просмотр движения, прослушивание, сравнение GPU-пробы: **не выполнены**.
- Права/согласия на обработку личного видео и внешний transport: **не подтверждены**.

Не объявлять pipeline end-to-end проверенным на GPU или ролик улучшенным.
UI/browser/regression web SKIP: веб-код и UI не менялись. Production deploy SKIP.
Роли выполнял один ассистент последовательно; независимой проверки агентом не было.
Приёмка владельцем открыта до его «согласовано».
