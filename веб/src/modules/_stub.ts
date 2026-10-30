import type {
  DraftOutput,
  AssetRenderResult,
  ElementOutput,
  IContentModule,
  ContentModuleManifest,
} from "@/types/module";

/** Shared stub implementations for C-19 (real adapters → C-20). */
export function createStubModule(manifest: ContentModuleManifest): IContentModule {
  return {
    manifest,
    async generateDraft(
      topic: string,
      _options?: Record<string, unknown>,
    ): Promise<DraftOutput> {
      const draftId = `stub-${manifest.id}-${Date.now()}`;
      return {
        draftId,
        moduleId: manifest.id,
        topic,
        elements: [
          {
            index: 0,
            kind: "stub",
            payload: { topic, moduleId: manifest.id },
          },
        ],
        meta: { mock: true, phase: "C-19" },
      };
    },
    async renderAsset(_draft: DraftOutput): Promise<AssetRenderResult> {
      throw new Error("NotImplemented:C-20");
    },
    async regenerateElement(
      _draftId: string,
      _elementIndex: number,
    ): Promise<ElementOutput> {
      throw new Error("NotImplemented:C-20");
    },
  };
}
