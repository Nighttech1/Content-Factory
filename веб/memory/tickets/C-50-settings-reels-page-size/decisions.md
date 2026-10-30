# Decisions — C-50

- 21st id=29172 considered (Input Group Glass) · element=settings reels page-size · motion=no · **reuse**=existing Settings LLM glass panel chrome (parity with C-34; catalog hits were decorative glass, not settings form)
- Persist key `cf.reels.pageSize` via `lib/settings/reels-display.ts` (mirror `llm-models` pattern)
- Feed wire: client `slice(0, pageSize)` in `StudioModuleWorkspace` for both columns after hydrate; backend `?limit=` not touched
- C-49 local title filter remains inside `VerticalPostCarousel` on the already-sliced list; API topic refetch still happens before slice
- Number input (not select) for any integer 4–48
