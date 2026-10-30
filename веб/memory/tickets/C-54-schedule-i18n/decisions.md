# Frontend decisions — C-54

- 21st search `dark glass calendar schedule agenda framer-motion react` → pick **id=5113** Glass Calendar (ravikatiyar162, glass + animated day strip)
- `get_component({ id: 5113 })` → **21st=unavailable** (free retrieval quota 2/day, locked until 2026-10-07; upgrade https://21st.dev/pricing)
- Fallback: `luxury-web-craft` + existing `NeonBadge` / Dark Luxury tokens · element=calendar · motion=yes (framer-motion spring `{ damping: 25, stiffness: 300 }`, horizontal day strip + month grid inspired by 5113)
- Persist `cf.schedule.v1` client-only; slot ≠ social publish
- RU chrome per architect inventory; model names / module ids / URLs unchanged
