/**
 * Re-bake vocab pills + BR swipe arrow onto pre_vocab frames (no GPT).
 * Usage:
 *   npx tsx scripts/rebake-vocab-job.ts <jobId>
 *   npx tsx scripts/rebake-vocab-job.ts --last3
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  bakeVocabPlaqueOntoSlide,
  findOrangeVocabGuideRect,
  writeVocabBakeLog,
} from "../lib/studio/vernatun-carousel/vocab-plaque-bake";
import {
  bakeSlideArrowOntoSlide,
  writeSlideArrowBakeLog,
} from "../lib/studio/vernatun-carousel/slide-arrow-bake";

const LAST3 = [
  "d0b78592-780a-4d25-8ee0-af96ffb13029",
  "2359b8db-596a-446f-b319-8835263fbf7d",
  "d58ed23a-d7b9-4ade-9fcf-d3a86af35127",
];

async function rebakeOne(jobId: string) {
  const root = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId);
  const rendered = path.join(root, "rendered");
  const script = JSON.parse(
    await readFile(path.join(root, "script.json"), "utf8"),
  ) as {
    slides: Array<{ index: number; supporting_copy?: string }>;
  };
  const lastIndex = Math.max(...script.slides.map((s) => s.index));
  const pub = path.join(process.cwd(), "public", "vernatun-jobs", jobId);
  await mkdir(pub, { recursive: true });

  const vocabRows = [];
  const arrowRows = [];
  for (const slide of script.slides) {
    const i = slide.index;
    const hyRu = slide.supporting_copy?.trim();
    const pre = path.join(
      rendered,
      `slide_${String(i).padStart(2, "0")}_pre_vocab.png`,
    );
    const finalOut = path.join(
      rendered,
      `slide_${String(i).padStart(2, "0")}.png`,
    );

    let work = pre;
    try {
      await readFile(pre);
    } catch {
      // Fallback: rebake atop current final (less ideal)
      work = finalOut;
      console.log(`slide ${i}: no pre_vocab — using final`);
    }

    if (hyRu) {
      console.log(`slide ${i} detect`, await findOrangeVocabGuideRect(work));
      const vocabOut = path.join(
        rendered,
        `slide_${String(i).padStart(2, "0")}_vocab.png`,
      );
      const baked = await bakeVocabPlaqueOntoSlide({
        slidePath: work,
        outPath: vocabOut,
        hyRu,
        slot: "FREE",
        dashedExpected: true,
        accentHex: "#F58220",
        jobDir: root,
        slideIndex: i,
      });
      await copyFile(vocabOut, finalOut);
      vocabRows.push(baked);
      console.log(
        `  vocab detected=${baked.detected} src=${baked.detectSource} @${baked.left},${baked.top}`,
      );
    }

    if (i < lastIndex) {
      const arrowOut = path.join(
        rendered,
        `slide_${String(i).padStart(2, "0")}_arrow.png`,
      );
      const arrow = await bakeSlideArrowOntoSlide({
        slidePath: finalOut,
        outPath: arrowOut,
        jobDir: root,
        slideIndex: i,
      });
      await copyFile(arrowOut, finalOut);
      arrowRows.push(arrow);
      console.log(
        `  arrow ${arrow.arrowHex} lum=${arrow.luminance} @${arrow.left},${arrow.top} ${arrow.width}x${arrow.height} raised=${arrow.raised}`,
      );
    } else {
      // Last slide: NO swipe arrow (no next to point to; avoids CTA collision).
      if (!hyRu) await copyFile(work, finalOut);
      console.log(`  slide ${i}: LAST — no arrow`);
    }
    await copyFile(finalOut, path.join(pub, path.basename(finalOut)));
  }
  if (vocabRows.length) await writeVocabBakeLog(root, vocabRows);
  await writeSlideArrowBakeLog(root, arrowRows);
  await writeFile(
    path.join(root, "prompts", "vocab_rebake_note.md"),
    `# Re-bake ${new Date().toISOString()}\nvocab detected: ${vocabRows.filter((r) => r.detected).length}/${vocabRows.length}\narrows: ${arrowRows.length}\n`,
    "utf8",
  );
  console.log(`done ${jobId}`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error(
      "Usage: npx tsx scripts/rebake-vocab-job.ts <jobId|--last3>",
    );
    process.exit(1);
  }
  const ids = arg === "--last3" ? LAST3 : [arg];
  for (const id of ids) {
    console.log(`\n======== REBAKE ${id} ========`);
    await rebakeOne(id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
