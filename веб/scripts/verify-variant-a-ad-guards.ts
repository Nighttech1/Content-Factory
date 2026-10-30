/**
 * Tester guards — Wave 2026-10-18 Variant A html_layout + Art Director.
 * Run: npx tsx scripts/verify-variant-a-ad-guards.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  HTML_LAYOUT_TEMPLATES,
  artDirectorVerdictSchema,
  critiqueHtmlLayout,
  designerImagePromptsSchema,
  htmlLayoutSchema,
} from "../lib/studio/carousel-json-contract";
import {
  resolveHtmlLayoutForSlide,
  synthesizeFallbackHtmlLayout,
} from "../lib/studio/carousel-layered-composite";

type Row = { id: string; ok: boolean; detail: string };
const results: Row[] = [];

function push(id: string, ok: boolean, detail: string) {
  results.push({ id, ok, detail });
}

function pngSize(file: string): { w: number; h: number } | null {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// G1: html_layout in contract — closed template enum
const bad = htmlLayoutSchema.safeParse({
  template: "invented_7th",
  text_block: { anchor: "center", align: "center" },
  primary: { highlights: [] },
  secondary: { highlights: [] },
});
push("G1_unknown_template_reject", !bad.success, bad.success ? "FAIL accepted" : "rejected");

const good = htmlLayoutSchema.safeParse({
  template: "cover_center",
  text_block: { anchor: "center", align: "center" },
  primary: { highlights: [{ phrase: "Хук", style: "accent" }] },
  secondary: { highlights: [] },
  logo: { placement: "top-left" },
  character: { placement: "none" },
  cta: { placement: "none" },
  scrim: "soft",
});
push(
  "G1_valid_html_layout",
  good.success,
  good.success ? good.data.template : String(good.error),
);
push(
  "G1_catalog_size_6",
  HTML_LAYOUT_TEMPLATES.length === 6,
  String(HTML_LAYOUT_TEMPLATES.length),
);

const packMissing = designerImagePromptsSchema.safeParse({
  slides: [
    {
      slide_number: 1,
      image_prompt: "scene only coffee cup on table",
      // html_layout intentionally omitted
    },
  ],
});
push(
  "G1_designer_pack_requires_html_layout",
  !packMissing.success,
  packMissing.success ? "accepted without html_layout" : "rejected",
);

// G2: orphan highlight fail
const orphan = critiqueHtmlLayout(
  good.success ? good.data : null,
  "Другой текст",
  "secondary body",
  1,
);
push(
  "G2_orphan_highlight_fail",
  orphan.some((i) => i.code === "orphan_highlight"),
  orphan.map((i) => i.code).join(",") || "none",
);

const okHl = critiqueHtmlLayout(
  good.success ? good.data : null,
  "Хук сильный",
  "secondary body",
  1,
);
push(
  "G2_valid_highlight_pass",
  okHl.length === 0,
  okHl.map((i) => i.code).join(",") || "clean",
);

// G3: composite uses templates
const layout = synthesizeFallbackHtmlLayout("cover");
const resolved = resolveHtmlLayoutForSlide(
  {
    html_layout: layout,
    layout_variant: "cover",
    primary_copy: "A",
    secondary_copy: "B",
  } as never,
  "cover",
);
push(
  "G3_composite_template",
  resolved.layout.template === "cover_center",
  resolved.layout.template,
);

const compositeSrc = fs.readFileSync(
  "lib/studio/carousel-layered-composite.ts",
  "utf8",
);
const templatesInCss = (
  [
    "cover_center",
    "body_left",
    "body_split",
    "cta_bottom",
    "tip_card",
    "quote_band",
  ] as const
).every((t) => compositeSrc.includes(t));
const hasDataTemplate = compositeSrc.includes("data-template");
const hasAccentWrap =
  compositeSrc.includes('class="accent"') ||
  compositeSrc.includes("class='accent'");
push(
  "G3_composite_maps_templates",
  templatesInCss && hasDataTemplate && hasAccentWrap,
  `templates=${templatesInCss} data-template=${hasDataTemplate} accent=${hasAccentWrap}`,
);

// G4: AD API / runner — no remake enqueue
const adRoute = fs.readFileSync(
  "app/api/studio/art-director/review/route.ts",
  "utf8",
);
const adRun = fs.readFileSync("lib/studio/art-director-run.ts", "utf8");
/** Strip line comments so doc strings like «NEVER enqueue» do not false-fail. */
function stripLineComments(src: string): string {
  return src
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}
const adCode = stripLineComments(adRoute + "\n" + adRun);
const adEnqueueCalls =
  adCode.match(/\b(enqueue|addJob|queue\.add)\s*\(/g) || [];
const alwaysFalse =
  /remakeEnqueued:\s*false/.test(adRoute) &&
  /remakeEnqueued:\s*false/.test(adRun);
const noDesignerWire =
  !/startDesigner|runDesigner|ensureDesigner|carousel-layered-composite|drawLayered/i.test(
    adCode,
  );
push(
  "G4_ad_no_enqueue_calls",
  adEnqueueCalls.length === 0 && noDesignerWire,
  adEnqueueCalls.join(",") || (noDesignerWire ? "none" : "designer_wire"),
);
push("G4_ad_remakeEnqueued_false", alwaysFalse, "constant false in route+run");

const adVerdict = artDirectorVerdictSchema.safeParse({
  verdict: "approve",
  summary: "ok carousel look taste",
  remarks: [],
});
push(
  "G4_ad_verdict_zod",
  adVerdict.success,
  adVerdict.success ? adVerdict.data.verdict : String(adVerdict.error),
);

// G5: smoke folder — 4 PNG + art-director-review.md
const smokeDirs = [
  path.join("docs", "карусель тест", "variant-a-ad-smoke"),
  path.join("generatedMedia", "variant-a-ad-smoke"),
];
for (const dir of smokeDirs) {
  if (!fs.existsSync(dir)) {
    push(`G5_${path.basename(dir)}_exists`, false, `missing ${dir}`);
    continue;
  }
  const pngs = ["slide_01.png", "slide_02.png", "slide_03.png", "slide_04.png"].filter(
    (f) => fs.existsSync(path.join(dir, f)),
  );
  const review = fs.existsSync(path.join(dir, "art-director-review.md"));
  push(
    `G5_${path.basename(dir)}_4png_review`,
    pngs.length === 4 && review,
    `png=${pngs.length} review=${review}`,
  );
}

const sample = path.join(smokeDirs[0], "slide_01.png");
if (fs.existsSync(sample)) {
  const sz = pngSize(sample);
  push(
    "G5_png_1080x1350",
    !!sz && sz.w === 1080 && sz.h === 1350,
    JSON.stringify(sz),
  );
} else {
  push("G5_png_1080x1350", false, "sample missing");
}

// G6: mesh art-director node
const flowchart = fs.readFileSync(
  "components/mesh/v2/ReleaseTeamFlowchart.tsx",
  "utf8",
);
const hasNode =
  flowchart.includes('nodeId="node-art-director"') &&
  flowchart.includes('testId="node-art-director"');
const designerIdx = flowchart.indexOf('nodeId="node-designer"');
const adIdx = flowchart.indexOf('nodeId="node-art-director"');
const pubIdx = flowchart.indexOf('nodeId="node-publisher"');
const orderOk =
  designerIdx >= 0 && adIdx > designerIdx && pubIdx > adIdx;
push(
  "G6_mesh_art_director_node",
  hasNode && orderOk,
  `testid=${hasNode} order=${orderOk} idx=${designerIdx}/${adIdx}/${pubIdx}`,
);

const agentDefaults = fs.readFileSync("lib/mesh/agent-defaults.ts", "utf8");
const artDirectorReview = fs.readFileSync(
  "lib/studio/art-director-review.ts",
  "utf8",
);
const seedOk =
  agentDefaults.includes('packId: "art-director"') &&
  agentDefaults.includes("ART_DIRECTOR_AGENT_ID") &&
  artDirectorReview.includes('ART_DIRECTOR_AGENT_ID = "art-director"') &&
  artDirectorReview.includes('ART_DIRECTOR_DISPLAY_NAME = "Арт-директор"');
push("G6_agent_defaults_seed", seedOk, "seed + display name constants");

let fail = 0;
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.id} — ${r.detail}`);
  if (!r.ok) fail += 1;
}
console.log(`\nTOTAL ${results.length} FAIL ${fail}`);
process.exit(fail ? 1 : 0);
