import { redirect } from "next/navigation";

/** C-136 — legacy shim → nested module mesh. */
export default function LegacyAgentMeshRedirect() {
  redirect("/studio/carousel-engine/mesh");
}
