# Implementation — C-marketing-director-chat

## Delivered

| Layer | Paths |
|-------|--------|
| UI primitives | `components/ui/textarea.tsx`, `select.tsx`, `ai-input.tsx` (+ existing `button.tsx`) |
| Deps | `@radix-ui/react-select` |
| Page | `app/marketing/page.tsx` |
| FE | `components/marketing/MarketingDirectorClient.tsx`, `MarketingProjectsRail.tsx` |
| Persist | `lib/marketing/projects-store.ts` → `cf.marketing.projects` |
| AI Bridge | `lib/marketing/prompt.ts`, `tools.ts`, `chat.ts` |
| Backend | `app/api/marketing/chat/route.ts`, `search/route.ts`, `lib/marketing/search.ts` |
| Studio entry | `StudioPageClient` → «Маркетинг-директор» → `/marketing` (sidebar untouched) |

## How to open

1. Localhost: http://localhost:3000/studio → кнопка **Маркетинг-директор**
2. Прямо: http://localhost:3000/marketing

## Haiku verify

See `verify-haiku.md` — live `anthropic/claude-haiku-4.5` reply OK with `AGGREGATOR_API_KEY`.
