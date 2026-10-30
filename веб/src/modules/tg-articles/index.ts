import { createStubModule } from "@/modules/_stub";
import { manifest } from "./manifest";

export { manifest };
export const contentModule = createStubModule(manifest);
export default module;
