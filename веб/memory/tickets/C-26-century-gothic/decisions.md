# Decisions — C-26

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary UI font | Century Gothic | Явный запрос продукта |
| Load strategy | CSS `@font-face` with `local("Century Gothic")` / `local("CenturyGothic")` + `--font-ui` stack; **no** `next/font/google` Inter; **no** shipped woff | Windows имеет `gothic.ttf`; Century Gothic — проприетарный, лицензионный woff в репо не кладём |
| Keep CSS var name | `--font-ui` | Не ломать существующие consumers |
| Armenian | Keep `Noto_Sans_Armenian` → `--font-hy` after UI font | hy glyphs |
| Mono | Keep JetBrains Mono | Ticket + mono labels |
| Inter | Remove entirely from layout | Actual state to replace |
| CI without Century Gothic installed | Assert CSS variable / `@font-face` family string, not raster match | Linux agents |
| Woff later (optional) | `public/fonts/century-gothic*.woff2` can be added later under `@font-face` `url()` if licensed | Documented; not required for Windows local resolve |

## Frontend realization (2026-09-20)

- `--font-ui: "Century Gothic", CenturyGothic, AppleGothic, sans-serif` in `:root` (`app/globals.css`).
- `@font-face` registers family via `local()` only (400 + 700).
- `app/layout.tsx`: Inter import removed; body only applies JetBrains + Noto CSS variables.
- Body stack unchanged: `var(--font-ui), var(--font-hy), system-ui, sans-serif`.
