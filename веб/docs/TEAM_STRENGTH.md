# Где усилить команду (дорогие сайты)

Слабые места — не «ещё один оркестратор», а узкие скиллы. Добавлять по мере первого реального проекта.

| Агент | Чего не хватает | Зачем | Скилл (имя) |
|-------|-----------------|-------|-------------|
| **Фронтендер** | Сбор и выдача ассетов | AVIF/WebP, video poster, blurhash, не 8K PNG в герое | `asset-pipeline` |
| **Фронтендер** | Шрифты как продукт | licensing, preload, `size-adjust`, кириллица | уже частично в `luxury-web-craft` — углубить при первом бренде |
| **Motion** | Звук / haptics | редкий люкс (hover ticks) — не ставить без спеки | `sound-motion` (позже) |
| **Клиент** | A11y глубже контраста | клавиатура, focus trap, skip-link, aria на сценах | `a11y-critic` |
| **Клиент / Тестер** | SEO люкса | title/OG, indexability SPA, sitemap, не «накрутка» | `seo-qa` |
| **Тестировщик** | Playwright как код | стабильный e2e на hero/скролл/форму, не только MCP | `playwright-e2e` |
| **Бекендер** | Формы сайта | заявки, почта, антиспам, файлы — типичный CMS-хвост лендинга | `forms-mail` |
| **Бекендер** | Auth/CMS headless | если появится студийная админка | `headless-cms` |
| **AI Bridge** | Охрана промпта | jailbreak, PII, не генерить slop-копирайт | `prompt-safety` |
| **Деплоер** | Preview-среды | Vercel/Netlify/Cloudflare preview URL для Клиента | `preview-deploys` |
| **Фиксер** | WebGL/GPU | hot GPU, context lost — сейчас эскалация на `three-webgl-craft` | достаточно до первого 3D-бага |
| **Архитектор** | Контент-карта | IA лендинга (главы, CTA, proof) до вёрстки | `site-ia` |
| **Оркестратор** | — | не плодить ролей | — |

Не добавлять FinGrad-домен (ВРИ, кадастр) и Flutter-кабинет как обязательные роли. Flutter-скиллы оставлены опционально.

Приоритет на ближайший сайт: `asset-pipeline` (Frontend), `playwright-e2e` (Tester), `a11y-critic` (Клиент), `forms-mail` (Backend).
