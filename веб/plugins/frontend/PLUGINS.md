# Плагины — frontend (luxury web)

## Реестр

| Name | Type | URL / path | When to use |
|------|------|------------|-------------|
| luxury-web-craft | Cursor skill | `.cursor/skills/luxury-web-craft/SKILL.md` | вёрстка дорогих сайтов |
| image-to-luxury-ui | Cursor skill | `.cursor/skills/image-to-luxury-ui/SKILL.md` | референс-картинка → premium UI |
| create-design-md | Cursor skill | `.cursor/skills/create-design-md/SKILL.md` | DESIGN.md из референса |
| **responsive-mobile-web** | Cursor skill | `.cursor/skills/responsive-mobile-web/SKILL.md` | **адаптив iPhone/Android** |
| **mobile-touch-scroll** | Cursor skill | `.cursor/skills/mobile-touch-scroll/SKILL.md` | **плавный скролл пальцем + Lenis/GSAP** |
| web-motion-engine | Cursor skill | `.cursor/skills/web-motion-engine/SKILL.md` | GSAP / Lenis / CSS motion |
| three-webgl-craft | Cursor skill | `.cursor/skills/three-webgl-craft/SKILL.md` | 3D-герой по chain |
| web-perf-motion | Cursor skill | `.cursor/skills/web-perf-motion/SKILL.md` | джанк, LCP, CLS |
| ui-ux-pro-max | Cursor skill | `.cursor/skills/ui-ux-pro-max/SKILL.md` | направление, не токены |
| taste-skill | Cursor skill | `.cursor/skills/taste-skill/SKILL.md` | anti-slop |
| **21st-ui-catalog** | Cursor skill | `.cursor/skills/21st-ui-catalog/SKILL.md` | **PRIMARY UI:** с 21st.dev красивее + анимации; не сток |
| emil-animate | Cursor skill | `.cursor/skills/emil-animate/SKILL.md` | сборка анимации |
| GSAP | npm | `gsap` | сцены, ScrollTrigger |
| Lenis | npm | `lenis` | гладкий скролл |
| Three | npm | `three` / `@react-three/fiber` | WebGL |
| Lottie | npm | `lottie-web` | редко, не вместо типа |
| anti_slop_scan | CLI | `plugins/frontend/anti_slop_scan.py` | перед сдачей UI |
| Prettier | extension | `esbenp.prettier-vscode` | формат |
| ESLint | extension | `dbaeumer.vscode-eslint` | JS/TS |
| Tailwind CSS IntelliSense | extension | `bradlc.vscode-tailwindcss` | только если проект на TW |
| Playwright | extension | `ms-playwright.playwright` | e2e / скрины |

## MCP каталог UI

| MCP | When |
|-----|------|
| **`21st`** | **PRIMARY:** Frontend обязан брать UI-паттерны отсюда (animated), не сток. Skill `21st-ui-catalog`. Env: `API_KEY_21ST`. |

## MCP глаза (мобилка)

| MCP | Device | When |
|-----|--------|------|
| `playwright` | 1440×900 | desktop craft |
| `playwright-iphone` | iPhone 15 | обязателен перед сдачей mobile |
| `playwright-android` | Pixel 7 | обязателен перед сдачей mobile |
| `chrome-devtools` | — | computed / network |
| `lighthouse` | — | CWV mobile |
| `image-compare` | — | before/after |

Конфиг: `.cursor/mcp.json`.

## CLI

```powershell
python plugins/frontend/anti_slop_scan.py .
```

## npm (в целевом сайте, не в этой папке)

```powershell
npm i gsap lenis
# 3D только по спеке:
npm i three
```

## Secrets

Ключи CDN/fonts не коммитить. `DESIGN.md` — канон.
