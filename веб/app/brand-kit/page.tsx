import { redirect } from "next/navigation";

/** C-70 — Brand Kit page removed; DESIGN.md lives in Settings. */
export default function BrandKitRedirectPage() {
  redirect("/settings");
}
