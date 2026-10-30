import { findAnyMagentaInkRect } from "../lib/studio/vernatun-carousel/vocab-plaque-bake";

async function main() {
  const dir = "public/vernatun-preview-final-ready";
  for (const i of [1, 2, 3, 4]) {
    const p = `${dir}/slide_0${i}.png`;
    const ink = await findAnyMagentaInkRect(p);
    console.log(`slide ${i} leftover`, ink);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
