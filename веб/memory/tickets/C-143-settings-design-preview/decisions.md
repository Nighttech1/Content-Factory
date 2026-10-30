# Decisions — C-143

- 21st id=6326 · element=DesignPreviewPanel · motion=yes (160ms ease-out enter; drag handle only)
- No `@ark-ui/react/floating-panel` dep — pointer drag/resize adapted under CF tokens
- Persist: `cf.settings.design-preview.open|x|y|width`
- Esc closes; closed state leaves no overlay
- Upload → `writeDesignMdOverride` still updates preview body via parent `designMd` state
