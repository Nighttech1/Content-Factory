# Decisions — C-60

- `21st=unavailable` · element=sidebar-resize-handle · motion=no (width follows pointer without spring; Motion owns hover/press later)
- Studio nav: no `children` / `nav-studio-children`; single `href=/studio` `testId=nav-studio`
- Width: `lib/shell/sidebar-width.ts` · key `cf.sidebar.width` · clamp drag 200–360 · default 256 · CSS `--cf-sidebar-width` + alias `--sidebar-width`
- AppShell `paddingLeft` === aside `width` via `useSidebarWidth` (single hook in AppShell)
