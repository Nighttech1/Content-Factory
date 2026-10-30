import type {
  ArtDirectorFinding,
  SlideGeometryOverride,
  VernatunDefect,
  VernatunScript,
} from "./types";
import { findingToDefect, normalizeFindings } from "./findings";
import { parseWordmarkHexFromFixText } from "./logo-bake";
import { COMPOSITION_RECIPES } from "./recipes";

export type RepairPlan = {
  script: VernatunScript;
  slidesToRegen: number[];
  slidesToRerender: number[];
  geometry: SlideGeometryOverride[];
  /** AD asked to recolor lockup wordmark per slide. */
  logoWordmarkBySlide?: Record<number, string>;
};

function repairSalt(slideIndex: number): number {
  return 3 + (slideIndex % 5);
}

/**
 * Apply text + geometry repairs from AD defects/findings.
 */
export function applyRepairs(
  script: VernatunScript,
  defectsOrFindings: VernatunDefect[] | ArtDirectorFinding[],
): RepairPlan {
  const defects: VernatunDefect[] =
    defectsOrFindings.length && "slide_id" in (defectsOrFindings[0] as object)
      ? normalizeFindings(defectsOrFindings).map(findingToDefect)
      : (defectsOrFindings as VernatunDefect[]);

  const next: VernatunScript = {
    ...script,
    slides: script.slides.map((s) => ({ ...s })),
  };
  const slidesToRegen = new Set<number>();
  const slidesToRerender = new Set<number>();
  const geometryBySlide = new Map<number, SlideGeometryOverride>();
  const logoWordmarkBySlide: Record<number, string> = {};

  function geo(slideIndex: number): SlideGeometryOverride {
    let g = geometryBySlide.get(slideIndex);
    if (!g) {
      g = { slideIndex };
      geometryBySlide.set(slideIndex, g);
    }
    return g;
  }

  for (const d of defects) {
    if (d.priority === "MINOR") continue;
    const slide = next.slides.find((s) => s.index === d.slide_index);
    if (!slide) {
      if (d.slide_index === 0) {
        next.slides.forEach((s) => slidesToRerender.add(s.index));
      }
      continue;
    }
    const el = d.element.toLowerCase();
    const fix = `${d.fix} ${d.reason}`.toLowerCase();

    // Layout collisions / edge / guide trash → full GPT Image regen
    const isLayoutRegen =
      el.includes("logo_collision") ||
      el.includes("edge_margin") ||
      el.includes("guide_artifact") ||
      /logo_collision|edge_margin|guide_artifact|safe zone|наезд|пунктир|направляющ/.test(
        fix,
      );
    if (isLayoutRegen) {
      slidesToRegen.add(slide.index);
      slidesToRerender.add(slide.index);
      continue;
    }

    // B4: Armenian spelling / glyph errors → full GPT Image regen (exact text)
    const isHySpelling =
      el.includes("hy_spelling") ||
      el.includes("armenian") ||
      el.includes("армян") ||
      /hy_spelling|армянск|орфограф|glyph|буква/.test(fix);
    if (isHySpelling) {
      slidesToRegen.add(slide.index);
      slidesToRerender.add(slide.index);
      continue;
    }

    // B5.4: logo/emblem drift / contrast → re-render with exact PNG bake (no GPT redraw).
    const isLogoDefect =
      el.includes("logo") ||
      el.includes("лого") ||
      el.includes("emblem") ||
      /logo|emblem|логотип|брендинг/.test(fix);
    const isPaginationDefect =
      el.includes("pagination") ||
      el.includes("пагинац") ||
      el.includes("счётчик") ||
      el.includes("счетчик") ||
      /пагинац|2\/\d|page.?count/.test(fix);
    if (isLogoDefect && !isPaginationDefect) {
      slidesToRerender.add(slide.index);
      // AD may request wordmark tint for THIS slide (contrast vs bg).
      const tint = parseWordmarkHexFromFixText(
        `${d.fix} ${d.reason} ${d.element}`,
      );
      if (tint) logoWordmarkBySlide[slide.index] = tint;
      continue;
    }
    // Pagination / other brand layout → full slide re-generate
    if (
      isPaginationDefect ||
      el.includes("brand") ||
      /page.?count|брендинг/.test(fix)
    ) {
      slidesToRegen.add(slide.index);
      slidesToRerender.add(slide.index);
      continue;
    }

    if (
      el.includes("photo") ||
      el.includes("image") ||
      el.includes("фото") ||
      el.includes("background") ||
      el.includes("visual") ||
      el.includes("фон")
    ) {
      slidesToRegen.add(slide.index);
      slidesToRerender.add(slide.index);
      const blob = `${d.reason} ${d.fix}`.toLowerCase();
      const badStock =
        /concert|концерт|барабан|djembe|джембе|\bstage\b|сцен|чужерод|лужайн|парк|curtain|занавес|перкусс|гитар|microphone|микрофон|спорт.?арен/.test(
          blob,
        );
      // Bad stock (concert/drums): force REGEN of a clean community photo — not gradient.
      slide.image_need = {
        kind: "photo_generic",
        must_be_photographic: true,
        forbid_ai_if_possible: false,
      };
      slide.visual_intent = badStock
        ? "cozy friends talking tea coffee warm indoor living room community candid natural light NO concert NO drums NO stage NO curtain"
        : "cozy friends talking over tea coffee warm kitchen living room community candid natural light no concert no stage";
      continue;
    }

    if (el.includes("headline") || el.includes("заголов")) {
      const words = slide.headline.split(/\s+/).filter(Boolean);
      if (words.length > 4) slide.headline = words.slice(0, 4).join(" ");
      slidesToRerender.add(slide.index);
    }

    if (
      el.includes("counter") ||
      el.includes("нумерац") ||
      el.includes("pagination")
    ) {
      const g = geo(slide.index);
      if (fix.includes("крупн") || fix.includes("больше") || fix.includes("larger")) {
        g.counterScale = Math.min(1.6, (g.counterScale ?? 1) * 1.25);
      } else if (fix.includes("мельч") || fix.includes("меньше") || fix.includes("smaller")) {
        g.counterScale = Math.max(0.7, (g.counterScale ?? 1) * 0.85);
      } else {
        g.counterScale = 1.2;
      }
      slidesToRerender.add(slide.index);
    }

    if (el.includes("logo") || el.includes("бренд") || el.includes("brand") || el.includes("footer")) {
      const g = geo(slide.index);
      g.logoScale = Math.min(1.5, (g.logoScale ?? 1) * 1.2);
      // Freedom repairs: strip full-width bar / float logo on photo
      if (
        /убер.*(плаш|полос|бар|bar)|без (плаш|полос)|bare|float|на фото|glass|pill/.test(
          fix,
        )
      ) {
        g.brandChromeMode = /float|glass|pill/.test(fix) ? "float" : "bare";
      }
      slidesToRerender.add(slide.index);
    }

    if (
      /пустот|пустой|серой дыр|на фото|убер.*плаш|убер.*карточ|poster-typo|on-photo|scrim|сливает|контраст|нечитаем|белом фон|по почти бел/.test(
        fix,
      ) ||
      el.includes("hierarchy") ||
      el.includes("contrast") ||
      el.includes("контраст") ||
      el.includes("layout_composition") ||
      el.includes("layout_cover")
    ) {
      const g = geo(slide.index);
      if (/контраст|нечитаем|белом фон|по почти бел|светлый шрифт/.test(fix)) {
        // Light photo + white type → force scrim glass, not bare on-photo
        g.textSurfaceMode = "scrim";
      } else if (/scrim|стекл|glass/.test(fix)) {
        g.textSurfaceMode = "scrim";
      } else if (
        /panel|карточ|плашк/.test(fix) &&
        !/убер|без|на фото|poster/.test(fix)
      ) {
        g.textSurfaceMode = "panel";
      } else {
        g.textSurfaceMode = "on-photo";
      }
      if (!g.brandChromeMode) g.brandChromeMode = "bare";
      slidesToRerender.add(slide.index);
    }

    if (
      el.includes("template") ||
      el.includes("recipe") ||
      el.includes("clone") ||
      el.includes("силуэт") ||
      el.includes("шаблон") ||
      el.includes("composition") ||
      el.includes("сценари") ||
      el.includes("layout_cover") ||
      el.includes("cover") ||
      fix.includes("template_clone") ||
      (fix.includes("смен") && fix.includes("recipe")) ||
      fix.includes("composition_hint")
    ) {
      const g = geo(slide.index);
      // Cover must stay poster-typo / cover — never quote-bleed clone.
      if (slide.index === 1 || slide.role === "cover") {
        g.recipeForce = "poster-typo";
        g.templateForce = "cover";
        g.panelWidthPct = Math.min(78, (g.panelWidthPct ?? 53) + 12);
        slide.recipe = "poster-typo";
      } else {
        const idx = (slide.index - 1) % COMPOSITION_RECIPES.length;
        const alt =
          COMPOSITION_RECIPES[
            (idx + repairSalt(slide.index)) % COMPOSITION_RECIPES.length
          ]!;
        g.recipeForce = alt === "poster-typo" ? "split-contrast" : alt;
        g.templateForce = undefined;
        slide.recipe = g.recipeForce;
      }
      slidesToRerender.add(slide.index);
    }

    if (
      el.includes("card") ||
      el.includes("карточ") ||
      el.includes("layout") ||
      el.includes("panel") ||
      el.includes("форм") ||
      el.includes("shape")
    ) {
      const g = geo(slide.index);
      if (fix.includes("pill") || fix.includes("капсул")) g.panelShape = "pill";
      else if (fix.includes("round") || fix.includes("скругл")) g.panelShape = "rounded";
      else if (fix.includes("ribbon") || fix.includes("лент")) g.panelShape = "ribbon";
      else if (fix.includes("diagonal") || fix.includes("диагон")) g.panelShape = "diagonal";
      else if (fix.includes("split") || fix.includes("полос")) g.panelShape = "split-band";
      else if (fix.includes("шире") || fix.includes("wider")) {
        g.panelWidthPct = Math.min(85, (g.panelWidthPct ?? 53) + 10);
      } else if (fix.includes("уже") || fix.includes("narrow")) {
        g.panelWidthPct = Math.max(35, (g.panelWidthPct ?? 53) - 8);
      } else {
        // Force layout diversity via recipe change
        const shapes = ["rounded", "pill", "ribbon", "diagonal", "split-band"] as const;
        g.panelShape = shapes[(slide.index - 1) % shapes.length]!;
        const alt =
          COMPOSITION_RECIPES[
            (slide.index + 2) % COMPOSITION_RECIPES.length
          ]!;
        g.recipeForce = alt;
        slide.recipe = alt;
      }
      slidesToRerender.add(slide.index);
    }

    if (!slidesToRerender.has(slide.index) && !slidesToRegen.has(slide.index)) {
      slidesToRerender.add(slide.index);
    }
  }

  return {
    script: next,
    slidesToRegen: [...slidesToRegen],
    slidesToRerender: [...slidesToRerender],
    geometry: [...geometryBySlide.values()],
    logoWordmarkBySlide: Object.keys(logoWordmarkBySlide).length
      ? logoWordmarkBySlide
      : undefined,
  };
}

/** @deprecated use applyRepairs */
export function applyTextRepairs(
  script: VernatunScript,
  defects: VernatunDefect[],
): { script: VernatunScript; slidesToRegen: number[]; slidesToRerender: number[] } {
  const r = applyRepairs(script, defects);
  return {
    script: r.script,
    slidesToRegen: r.slidesToRegen,
    slidesToRerender: r.slidesToRerender,
  };
}
