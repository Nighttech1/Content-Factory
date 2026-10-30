# AI Bridge — C-settings-design-md-carousel (+ C-155 prompt audit)

## Done

1. **Active DESIGN.md resolve** for Designer agent-start / draw / chat system.
2. **Разборщик design-from-image** prompts + parse + mock stub for API.
3. **C-155**: `composeTopicWithBrief` neutralized; server+client strip `---\nБриф:` glue.

## Backend contract

### A) Designer draw / agent-chat

Client (`postStudioAgentChat`) may send:

```ts
{
  activeDesignMarkdown?: string; // full MD of active Embla slot
  activeDesignId?: string;
  activeDesignName?: string;     // chip label e.g. DESIGN.md
}
```

- Inject **only** into `system` (bundle rules / designer overlay).
- **Never** append to `messages[].role=user` (C-155).
- Client resolve: `lib/settings/design-library.ts` → `readActiveDesignMarkdownClient` / `resolveActiveDesignMarkdown` / `formatActiveDesignMdForPrompt`.
- Server resolve (body → header → cookie → synced file): `lib/settings/design-active-server.ts`.
- Prompt wire: `appendActiveDesignMdToDesignerPrompt` / `resolveDesignerSystemWithActiveDesign` in `lib/studio/create-carousel-prompts.ts`.
- Draw path already passes `designMarkdown` into `runCreateCarouselDraw` / `runGenerateCarouselSlides`.

### B) Settings «Добавить новый дизайн» — image → MD+HTML

Suggested route (Backend owns): `POST /api/settings/design-from-image` (or `app/api/settings/design-*`).

**Request (multipart or JSON):**
- `image`: file / base64 (vision)
- optional `nameHint`: string

**Response:**

```ts
type DesignFromImageResponse = {
  markdown: string;
  html?: string;
  source: "live" | "mock";
  name?: string;
};
```

**Prompt exports** (`lib/studio/design-from-image-prompts.ts`):

| Export | Use |
|--------|-----|
| `DESIGN_FROM_IMAGE_SYSTEM_PROMPT` | aggregator `system` |
| `DESIGN_FROM_IMAGE_USER_INSTRUCTION` | text part beside image |
| `parseDesignFromImageReply(raw)` | extract `design-md` + `html-frame` fences |
| `toDesignFromImageResponse(raw, source, name?)` | API body |
| `mockDesignFromImageResponse(name?)` | soft-fail without key |
| `VERNATUN_SAFE_ZONE` | 1080×1350 + paddings |

After live parse: Frontend `appendDesignLibrarySlot({ name, markdown, html })` + set active (AI Bridge already exports append helper).

### C) Storage keys (FE Embla)

- `cf.settings.design.library.v1` → `DesignLibrarySlot[]` max **10**
- `cf.settings.design.activeId` → string
- Legacy `cf.settings.designMd.v1` → migrate one slot on first read (D-sd-9)

## C-155 audit

| Path | Status |
|------|--------|
| `composeTopicWithBrief` | returns topic only (no glue) |
| Create `AgentChatComposer` / `postStudioAgentChat` | raw messages; sanitize |
| `app/api/studio/agent-chat` | `sanitizeAgentChatTurnsForC155` + `stripCombatBriefGlue` on userMessage |
| Grep `Бриф:` glue callers in src | **none** (only neutralized helper) |

## Out of AI Bridge

Embla UI, `DesignPreviewPanel` Close, `next.config` — Frontend / Deployer.
