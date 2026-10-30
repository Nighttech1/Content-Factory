---
name: Atelier Synth
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#ddc1b5'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#a48c81'
  outline-variant: '#56423a'
  surface-tint: '#ffb694'
  primary: '#ffb694'
  on-primary: '#561f00'
  primary-container: '#de733c'
  on-primary-container: '#4c1a00'
  inverse-primary: '#9d430c'
  secondary: '#f3be64'
  on-secondary: '#432c00'
  secondary-container: '#7e5700'
  on-secondary-container: '#ffd28a'
  tertiary: '#9ecbfb'
  on-tertiary: '#003355'
  tertiary-container: '#6894c2'
  on-tertiary-container: '#002c4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb694'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7b2f00'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#f3be64'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#9ecbfb'
  on-tertiary-fixed: '#001d34'
  on-tertiary-fixed-variant: '#154a73'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-density, technical-atelier environment for generative pipelines, multi-modal workflows, and prompt engineering networks. The aesthetic synthesizes the structured rigor of developer toolchains (Raycast, Linear) with the cinematic restraint and spatial discipline of luxury editorial publications and high-end hardware interfaces.

### Brand Personality & Core Audience
- **The Audience:** Technical creatives, lead AI strategists, prompt architects, and content engineering teams orchestrating multi-agent media pipelines.
- **The Impression:** Sovereign, razor-sharp, disciplined, and deliberately bespoke. It discards playful consumer-AI clichés in favor of instrument-grade precision, deep obsidian negative space, and warm tactile illumination.

### Visual Architecture
- **Obsidian Architectural Base:** A foundational spectrum of calibrated charcoal, carbon, and slate-black planes that isolate content and generative nodes without muddy visual noise.
- **Cognac & Sun Gold Embers:** Focal energy is directed strictly via an incandescent terracotta/cognac core (`#C25E28`), activated by microscopic amber highlights (`#E6B25A`) to denote real-time synthesis, pipeline velocity, and active tokens.
- **Technical Azure Utility:** Subdued cold slate-azure tones (`#2A5A84`) govern telemetry, data ingress/egress, branch states, and node connections, balancing warm creative drivers with mechanical clarity.
- **Crisp Structural Grid:** Sharp 1px hairline borders (`rgba(255, 255, 255, 0.08)`) frame the canvas, creating modular bays and dockable inspector panels with absolute geometric certainty.

## Colors

The system uses a dark palette defined by an obsidian-to-slate continuum, balanced against high-chroma terracotta, ambient amber, and technical cold azure.

### Palette Architecture
- **Primary (`#C25E28` - Cognac / Terracotta):** Represents pipeline catalysts, execution triggers, active node states, and dominant calls to action.
- **Secondary (`#E6B25A` - Sun Gold / Amber):** Reserved for telemetry alerts, node activity indicators, token burn rates, and selective micro-focus indicators.
- **Tertiary (`#2A5A84` - Deep Slate Azure):** Governs system signals, payload status, cold metadata tags, model routing nodes, and syntax identifiers.
- **Neutral (`#0D0F12` - Raw Obsidian Canvas):** Provides the foundational canvas depth, stepping up through neutral slate tonal stops to construct layer stratification.

### Surface Tiers & Token Relationships
- **Surface Canvas (`#08090B`):** Global viewport background, workspace matrix, and infinite canvas backing.
- **Surface Layer 1 (`#0D0F12`):** Primary dock panels, pinned lateral rails, and utility bars.
- **Surface Layer 2 (`#14171C`):** Cards, pipeline module containers, contextual inspectors, and dialog wrappers.
- **Surface Layer 3 (`#1C2027`):** Elevated dropdowns, active item selections, hover states, and floating command palettes.
- **Hairline Strokes (`rgba(255, 255, 255, 0.08)`): Global structural boundary for all panes, card frames, and cell delimiters.
- **Hairline Active (`rgba(194, 94, 40, 0.40)`): Focused containers and running pipeline runs.

## Typography

The typography strategy pairs a geometric neo-grotesque with an engineer-grade monospace typeface, establishing clear separation between creative workflow controls and system execution telemetry.

### Typographic Roles
- **Headlines & Editorial Context (Plus Jakarta Sans):** Crafted with tight tracking (`-0.03em` to `-0.015em`) and deliberate line heights to provide the punchy authority of a high-end technical publication.
- **Interface & Operational Text (Plus Jakarta Sans):** Delivers clean readability inside data grids, attribute forms, prompt configurations, and property sheets.
- **Telemetry, System Metrics & Node Logs (JetBrains Mono):** Dedicated to technical metadata: execution timestamps, token consumption rates, model latency (`ms`), vector dimensions, schema definitions, and input/output payload buffers. Always rendered with micro letter-spacing (`0.02em` to `0.04em`) to maintain legibility at compact display sizes.

## Layout & Spacing

The canvas is driven by an instrument-dense workbench methodology: high information availability, collapsible side rails, contextual inspectors, and fluid workflow bays.

### Grid & Workbench Model
- **The Master Workbench:** Structured around an edge-to-edge modular layout anchored by fixed top utility navigation (48px height), dynamic secondary toolbars (40px height), and collapsible lateral sidebars (280px left asset rail, 340px right parameter inspector).
- **Workspace Canvases:** The node graph, orchestration timelines, and run consoles utilize fluid container grids that adapt to custom split-pane ratios.
- **Standard Layout Mode:** For tabular records, analytics dashboards, and prompt libraries, a 12-column fluid grid system operates inside bounds using 16px (`1rem`) gutters and 24px (`1.5rem`) outer canvas margins.

### Breakpoints & Adaptability
- **Desktop (>= 1280px):** Full multi-pane workflow visible simultaneously (Navigation, Flow Canvas, Inspector Deck, System Log Console).
- **Tablet (768px - 1279px):** Lateral rails collapse into sliding side drawers triggered by shortcut icons; the primary canvas retains priority with an overlay inspector.
- **Mobile (< 768px):** Structural panels transform into stacked sheet interfaces. Workspaces default to sequential card lists with full-width bottom action sheets for prompt runs and node edits.

## Elevation & Depth

Visual hierarchy uses crisp surface-layer tiering and razor-thin borders rather than diffuse drop shadows, preserving clarity on high-resolution displays.

### Layer Stacking Structure
- **Level 0 (Canvas Matrix - `#08090B`):** The infinite plane beneath graphs, pipelines, and grid backdrops.
- **Level 1 (Grounded Architecture - `#0D0F12`):** Primary docks, static sidebars, and structural splitters. Bound by hairline edge strokes: `1px solid rgba(255, 255, 255, 0.07)`.
- **Level 2 (Active Modules & Workspace Cards - `#14171C`):** Pipeline nodes, content generation blocks, parameter tables. Outlined by `1px solid rgba(255, 255, 255, 0.09)`.
- **Level 3 (Overlays & Command Flyouts - `#1C2027`):** Command bars (`Cmd+K`), dropdown menus, contextual node connectors, and toast dialogs. Framed by `1px solid rgba(255, 255, 255, 0.14)` and a concentrated directional shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 2px 6px 0 rgba(0, 0, 0, 0.40)`.

### Technical Glow & State Illumination
- Hovering interactive nodes or engaged focus rings triggers an ambient cognac perimeter highlight (`0 0 0 1px #C25E28, 0 0 16px -2px rgba(194, 94, 40, 0.25)`).
- Critical system alerts and processing queues utilize an amber back-glow (`0 0 12px -2px rgba(230, 178, 90, 0.20)`).

## Shapes

The design system maintains a refined, mechanical geometry. Roundedness is kept disciplined (`0.25rem` / `4px` base) to avoid childish softness and ensure dense data grids snap cleanly along structural 1px guidelines.

### Corner Curvature Scale
- **Micro UI & Form Controls (`0.25rem` / `4px`):** Input fields, inline code snippets, contextual action buttons, status pills, and list row selectors.
- **Containers & Modules (`rounded-lg` - `0.5rem` / `8px`):** Node canvas containers, configuration cards, modal surfaces, preview panels, and prompt edit zones.
- **Flyouts & Command Decks (`rounded-xl` - `0.75rem` / `12px`):** Quick-switcher dialogs, master search dialogs, and workspace creation overlays.
- **Strict Exceptions:** Circular components (`9999px`) are restricted exclusively to user avatars, active pipeline execution spinner tracks, and micro status pips.

## Components

### Buttons & Trigger Controls
- **Primary Catalyst Button:** Solid cognac background (`#C25E28`), crisp `1px solid rgba(255, 255, 255, 0.15)` border, text in absolute white, font-weight 600. Active state shifts to `#A94E1E`. Focused state adds an amber ambient ring (`#E6B25A`).
- **Secondary Ghost Button:** Translucent background (`rgba(255, 255, 255, 0.03)`), border `1px solid rgba(255, 255, 255, 0.10)`, text in slate-100 (`#E2E8F0`). On hover, background elevates to `rgba(255, 255, 255, 0.07)` with border `rgba(255, 255, 255, 0.18)`.
- **Destructive/Abort Button:** Translucent crimson wash (`rgba(220, 38, 38, 0.08)`), border `1px solid rgba(220, 38, 38, 0.30)`, label in `#FCA5A5`.

### Chips & Telemetry Badges
- Constructed exclusively with `JetBrains Mono` at `label-sm` (`11px`).
- **Model Node Chip:** Azure tone (`rgba(42, 90, 132, 0.18)`), border `1px solid rgba(42, 90, 132, 0.40)`, text `#89B4DB`.
- **Execution / Cost Chip:** Obsidian tint (`#14171C`), border `1px solid rgba(255, 255, 255, 0.08)`, text in slate-400 (`#94A3B8`). Contains monospaced token counts (`"420 t/s"`).
- **Amber Warning / Queue Chip:** Amber tint (`rgba(230, 178, 90, 0.12)`), border `1px solid rgba(230, 178, 90, 0.35)`, text `#F4D38C`.

### Cards & Pipeline Node Containers
- **Default State:** Background `#14171C`, border `1px solid rgba(255, 255, 255, 0.08)`, corner radius `0.5rem`. Header features a dedicated metadata line with mono labels and execution drag handles.
- **Node Active / Synthesizing:** Border switches to `1px solid #C25E28`, anchored by an ambient corner glow.
- **Node Selected:** Border `1px solid #E6B25A`, displaying real-time parameter handles at input/output connection edges.

### Inputs & Prompt Editor Fields
- **Background:** Inset charcoal (`#090B0D`), hairline border `1px solid rgba(255, 255, 255, 0.08)`, border radius `0.25rem`.
- **Typographic Treatment:** Large prompt entry fields use `Plus Jakarta Sans` regular; code parameters, regex filters, and system directives run `JetBrains Mono`.
- **Focus State:** Background remains `#090B0D`, border illuminates to `#C25E28` with zero blur, accompanied by an absolute high-contrast caret in `#E6B25A`.

### Lists & Key-Value Inspection Tables
- Dense tabular rows with height fixed at `32px` or `36px`.
- Alternating subtle rows (`rgba(255, 255, 255, 0.01)`) with hairline bottom separators (`rgba(255, 255, 255, 0.04)`).
- Keys styled in muted slate (`#64748B`), values right-aligned in `JetBrains Mono` (`#E2E8F0`).

### Checkboxes & Toggle Switches
- **Checkboxes:** Square with `2px` micro-radius, `14px x 14px` boundary, background `#0D0F12`, border `1px solid rgba(255, 255, 255, 0.18)`. When checked: background `#C25E28`, checkmark rendered in pure white.
- **Toggle Switches:** Segmented pill track (`32px x 18px`), background `#1C2027`, hairline border `1px solid rgba(255, 255, 255, 0.10)`. Actuated knob (`14px x 14px`) shifts to pure white on active states with track tint transitioning to `#C25E28`.

### Specialized Domain Components
- **Token Velocity Meter:** Linear progress bar (height `2px`) built on `#1C2027` track with a segmented glowing fill in `#E6B25A` to visualize real-time context window capacity.
- **Agent Connection Wire:** High-precision canvas vectors (`1.5px`), color-coded according to payload: Stream (`#C25E28`), Condition (`#2A5A84`), Complete/Verified (`#E6B25A`).