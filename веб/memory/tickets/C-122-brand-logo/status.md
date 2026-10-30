# Status — C-122 (brand logo)

**Role:** Frontend → Fixer  
**State:** fixer pass (Client @1440 P2)

## Done

1. Copied `knowledge/logo/logo-transparent.png` → `public/brand/vernatun-logo.png`
2. Updated brand header in `components/shell/SidebarNavigation.tsx`:
   - `flex-row items-center` — PNG left, text block right
   - Primary: **VERNATUN**; secondary muted: **ARMENIAN CLUB**
   - `data-testid="nav-brand"`
   - Removed Network icon + `VERN·ATUN` / `Content Factory`
3. Chain Frontend checkbox marked `[x]`

## Fixer (Client P2-A)

PNG = full lockup; `object-contain` @32px crushed seal + duplicated VERNATUN.
- Sidebar img: `h-9 w-9` + `rounded-full` + `object-cover object-[center_top]` + light gold ring — crops seal only
- HTML VERNATUN / ARMENIAN CLUB unchanged
- `alt=""` + `aria-hidden` (text beside provides name)

No commit.
