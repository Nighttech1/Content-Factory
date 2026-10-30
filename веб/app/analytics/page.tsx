import { redirect } from "next/navigation";

/** C-136 — legacy shim → nested module analytics. */
export default function LegacyAnalyticsRedirect() {
  redirect("/studio/carousel-engine/analytics");
}
