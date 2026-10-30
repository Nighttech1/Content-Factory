/**
 * @deprecated Prefer AI Bridge `lib/studio/design-from-image-prompts.ts`.
 * Re-export shim so older Backend imports keep resolving.
 */
export {
  DESIGN_FROM_IMAGE_SYSTEM_PROMPT as DESIGN_FROM_IMAGE_SYSTEM,
  DESIGN_FROM_IMAGE_USER_INSTRUCTION as DESIGN_FROM_IMAGE_USER_TEXT,
  mockDesignFromImageResponse,
} from "@/lib/studio/design-from-image-prompts";

import { mockDesignFromImageResponse } from "@/lib/studio/design-from-image-prompts";

/** @deprecated use mockDesignFromImageResponse */
export function mockDesignFromImage(fileName?: string): {
  title: string;
  markdown: string;
  html: string;
} {
  const mock = mockDesignFromImageResponse(fileName || "DESIGN.md");
  return {
    title: mock.name || "DESIGN.md",
    markdown: mock.markdown,
    html: mock.html || "",
  };
}
