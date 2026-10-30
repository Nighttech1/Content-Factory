# Deployer — S52 Scout-only Apify

- Target: **localhost:3001** only (НЕ prod)
- Dev server already running (`npm run dev -- -p 3001`); HMR picks Backend/FE changes
- Verified: GET feed 200; POST scout/run reachable (soft-fail without key OK)
- Smoke: `npx tsx scripts/smoke-s52-scout-apify-only.ts` → OK
