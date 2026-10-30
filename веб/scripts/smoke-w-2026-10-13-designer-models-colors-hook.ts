/**
 * S45 smoke — W-2026-10-13-designer-models-colors-hook
 * Tickets: C-agent-model-defaults, C-design-colors-only, C-designer-panorama-slice
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks: { name: string; pass: boolean; detail?: string }[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function ok(name: string, cond: boolean, detail = "") {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

const mesh = read("types/mesh-agent.ts");
ok(
  "DEFAULT_CAROUSEL_IMAGE_MODEL",
  /DEFAULT_CAROUSEL_IMAGE_MODEL\s*=\s*["']openai\/gpt-5\.4-image-2["']/.test(mesh),
);
ok(
  "DEFAULT_SCRIPTWRITER_MODEL",
  /DEFAULT_SCRIPTWRITER_MODEL\s*=\s*["']anthropic\/claude-3\.7-sonnet["']/.test(
    mesh,
  ),
);
ok(
  "DEFAULT_DESIGNER_TEXT_MODEL",
  /DEFAULT_DESIGNER_TEXT_MODEL\s*=\s*["']anthropic\/claude-3\.7-sonnet["']/.test(
    mesh,
  ),
);
ok(
  "MESH option gpt-5.4-image-2",
  /value:\s*["']openai\/gpt-5\.4-image-2["']/.test(mesh),
);
ok(
  "MESH option claude-3.7-sonnet",
  /value:\s*["']anthropic\/claude-3\.7-sonnet["']/.test(mesh),
);
ok(
  "MESH option haiku-4.5 (Razbor catalog)",
  /value:\s*["']anthropic\/claude-haiku-4\.5["']/.test(mesh),
);

const llm = read("lib/settings/llm-models.ts");
ok(
  "catalog gpt-5.4-image-2",
  /id:\s*["']openai\/gpt-5\.4-image-2["']/.test(llm),
);
ok(
  "catalog haiku-4.5",
  /id:\s*["']anthropic\/claude-haiku-4\.5["']/.test(llm),
);
ok(
  "catalog claude-3.7-sonnet",
  /id:\s*["']anthropic\/claude-3\.7-sonnet["']/.test(llm),
);
ok(
  "designer default",
  /id:\s*["']designer["'][\s\S]*?defaultModelId:\s*["']openai\/gpt-5\.4-image-2["']/.test(
    llm,
  ),
);
ok(
  "script-writer default",
  /id:\s*["']script-writer["'][\s\S]*?defaultModelId:\s*["']anthropic\/claude-3\.7-sonnet["']/.test(
    llm,
  ),
);

const imgs = read("lib/llm/aggregator-images.ts");
ok(
  "aggregator-images DEFAULT sync",
  /DEFAULT_CAROUSEL_IMAGE_MODEL\s*=\s*["']openai\/gpt-5\.4-image-2["']/.test(imgs),
);

const defaults = read("lib/mesh/agent-defaults.ts");
ok(
  "scriptwriter thinking true",
  /thinking:\s*true/.test(defaults) &&
    /reasoningEffort:\s*["']high["']/.test(defaults) &&
    /DEFAULT_SCRIPTWRITER_MODEL/.test(defaults),
);
ok(
  "designer uses DEFAULT_CAROUSEL_IMAGE_MODEL",
  /DEFAULT_CAROUSEL_IMAGE_MODEL/.test(defaults),
);

const settings = read("components/settings/SettingsShell.tsx");
ok(
  "Settings colors-only caption",
  /Только цвета — разметку придумает Дизайнер/.test(settings),
);
const tuner = read("components/settings/QuickThemeTuner.tsx");
ok(
  "Tuner colors-only caption",
  /Только цвета — разметку придумает Дизайнер/.test(tuner),
);

const prompts = read("lib/studio/create-carousel-prompts.ts");
ok(
  "prompts HTML/CSS-first",
  /HTML\/CSS-first|HTML\/CSS \+ Playwright/i.test(prompts),
);
ok(
  "prompts NEVER panorama-only sole truth",
  /NEVER[\s\S]{0,100}panorama|not[\s\S]{0,40}sole|не обещай panorama/i.test(
    prompts,
  ),
);
ok(
  "prompts hook language",
  /curiosity gap|FAIL flat|цепляющ|paired invariants/i.test(prompts),
);
ok(
  "colors-only inject",
  /Только цвета|layout free|colors only/i.test(prompts),
);
ok(
  "paired invariants export",
  /CREATE_CAROUSEL_PAIRED_INVARIANTS/.test(prompts),
);

const media = read("lib/studio/carousel-media-urls.ts");
ok(
  "assertSlicedCreatePreview exists",
  /export function assertSlicedCreatePreview/.test(media),
);

const route = read("app/api/studio/agent-chat/route.ts");
ok(
  "route imports assertSlicedCreatePreview",
  /assertSlicedCreatePreview/.test(route),
);
ok(
  "route panorama_preview_rejected",
  /panorama_preview_rejected/.test(route),
);
ok(
  "route textModel when image-class chat",
  /isMeshImageModel/.test(route) &&
    /DEFAULT_DESIGNER_TEXT_MODEL/.test(route) &&
    /mode !== ["']draw["']/.test(route),
);
ok(
  "defaults designer textModel seed",
  /textModel:\s*DEFAULT_DESIGNER_TEXT_MODEL/.test(defaults),
);

const preview = read("components/studio/workspace/CreateCarouselPreview.tsx");
ok(
  "CreateCarouselPreview sliced note",
  /C-designer-panorama-slice|Never render a panorama/i.test(preview),
);

async function runtimeAsserts() {
  const { assertSlicedCreatePreview } = await import(
    "../lib/studio/carousel-media-urls"
  );

  const ok3 = assertSlicedCreatePreview(
    [
      { imageUrl: "/a.png" },
      { imageUrl: "/b.png" },
      { imageUrl: "/c.png" },
    ],
    3,
  );
  ok("assertSlicedCreatePreview accepts 3 URLs", ok3.ok === true);

  const badPanorama = assertSlicedCreatePreview(
    [
      { imageUrl: "/same.png" },
      { imageUrl: "/same.png" },
      { imageUrl: "/same.png" },
    ],
    3,
  );
  ok(
    "assertSlicedCreatePreview rejects shared URL",
    badPanorama.ok === false,
  );

  const badCount = assertSlicedCreatePreview([{ imageUrl: "/only.png" }], 3);
  ok(
    "assertSlicedCreatePreview rejects count mismatch",
    badCount.ok === false,
  );
}

runtimeAsserts()
  .then(() => {
    const failed = checks.filter((c) => !c.pass);
    console.log(
      `\n--- SUMMARY: ${checks.filter((c) => c.pass).length}/${checks.length} PASS ---`,
    );
    if (failed.length) {
      console.log("FAILED:");
      for (const f of failed) console.log(` - ${f.name}`);
      process.exit(1);
    }
    console.log("SMOKE_W_2026_10_13_DESIGNER_MODELS_COLORS_HOOK_OK");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
