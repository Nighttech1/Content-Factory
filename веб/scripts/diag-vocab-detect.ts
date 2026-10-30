import {
  findAnyMagentaInkRect,
  findOrangeVocabGuideRect,
} from "../lib/studio/vernatun-carousel/vocab-plaque-bake";

async function main() {
  const job = "d0b78592-780a-4d25-8ee0-af96ffb13029";
  const root = `generatedMedia/vernatun-jobs/${job}/rendered`;

  for (const i of [1, 2, 3, 4]) {
    const pre = `${root}/slide_0${i}_pre_vocab.png`;
    const chip = await findOrangeVocabGuideRect(pre);
    const ink = await findAnyMagentaInkRect(pre);
    console.log(`slide ${i}`);
    console.log("  chip", chip);
    console.log("  ink", ink);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
