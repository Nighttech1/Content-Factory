/**
 * C-33 — Brand Kit contract (UI + Razbor agents). No secrets.
 */

export type BrandKitTypography = {
  display?: string;
  body?: string;
  mono?: string;
};

export type BrandKit = {
  logoUrl: string;
  name: string;
  palette: Record<string, string>;
  typography?: BrandKitTypography;
  /** Full or truncated DESIGN.md body (frontmatter stripped from display body). */
  designMarkdown: string;
  voice?: string[];
};
