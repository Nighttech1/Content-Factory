/**
 * Sprint 9 — validate golden fixtures + critic reject paths.
 * Run: npx tsx scripts/smoke-sprint9-fixtures.ts
 */

import {
  loadSprint9CarouselFixtures,
  loadSprint9ReelsFixtures,
} from "../lib/studio/__fixtures__/sprint9-loaders";
import { critiqueCarouselHandoff } from "../lib/studio/carousel-quality-critic";
import { critiqueReelsScript } from "../lib/studio/reels-quality-critic";

function main() {
  const cars = loadSprint9CarouselFixtures();
  const reels = loadSprint9ReelsFixtures();
  console.log(
    "carousel",
    cars.map((c) => c.id).join(","),
  );
  console.log(
    "reels",
    reels.map((r) => r.id).join(","),
  );

  if (cars.length < 3) throw new Error("need ≥3 carousel fixtures");
  if (reels.length < 2) throw new Error("need ≥2 reels fixtures");

  for (const c of cars) {
    const v = critiqueCarouselHandoff(c.handoff);
    if (!v.ok) {
      console.error("FAIL carousel", c.id, v);
      process.exit(1);
    }
  }
  for (const r of reels) {
    const v = critiqueReelsScript(r.script);
    if (!v.ok) {
      console.error("FAIL reels", r.id, v);
      process.exit(1);
    }
  }

  const flat = critiqueCarouselHandoff({
    contentType: "carousel",
    requested_slide_count: 1,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: "Добро пожаловать",
        secondary_copy: "Один практичный абзац для HTML-слоя. Вторая фраза закрывает мысль.",
        swipe_trigger: "meta why",
        visual_prompt: "purple gradient abstract",
        cta_type: 4,
      },
    ],
    caption: "x",
    hashtags: [],
    cta_type: 4,
  });
  if (flat.ok) throw new Error("expected flat hook reject");
  console.log("flat_hook_reject", flat.code);

  const forbidden = critiqueReelsScript({
    contentType: "carousel",
    slides: [{ a: 1 }],
  });
  if (forbidden.ok) throw new Error("expected carousel-on-reels reject");
  console.log("carousel_on_reels_reject", forbidden.code);

  console.log("ALL_OK");
}

main();
