/**
 * Composition recipes for Mode A — silhouette diversity (parity with Mode B).
 */

export const COMPOSITION_RECIPES = [
  "poster-typo",
  "photo-left-asymmetric",
  "object-metaphor",
  "quote-bleed",
  "steps-stack",
  "letter-accent",
  "door-invite",
  "map-network",
  "split-contrast",
  "cards-trio",
  "cta-diagonal",
  "photo-top-band",
] as const;

export type CompositionRecipe = (typeof COMPOSITION_RECIPES)[number];

const RECIPE_TO_TEMPLATE: Record<CompositionRecipe, string> = {
  "poster-typo": "cover",
  "photo-left-asymmetric": "split",
  "object-metaphor": "statement",
  "quote-bleed": "quote",
  "steps-stack": "cards",
  "letter-accent": "cover",
  "door-invite": "split",
  "map-network": "cards",
  "split-contrast": "split",
  "cards-trio": "cards",
  "cta-diagonal": "cta",
  "photo-top-band": "photo-top",
};

export function recipeToTemplate(recipe: string): string {
  const r = recipe as CompositionRecipe;
  return RECIPE_TO_TEMPLATE[r] ?? "split";
}

export function pickRecipeForSlide(
  index0: number,
  prev: string | null,
  hint?: string,
  _used: readonly string[] = [],
): CompositionRecipe {
  const h = (hint || "").toLowerCase();
  // Cover defaults to poster-typo unless repair forced another recipe upstream.
  if (index0 === 0) return "poster-typo";

  let pick: CompositionRecipe =
    COMPOSITION_RECIPES[index0 % COMPOSITION_RECIPES.length]!;
  if (h.includes("три") || h.includes("карточки") || h.includes("steps")) {
    pick = "cards-trio";
  } else if (h.includes("quote") || h.includes("цитат")) {
    pick = "quote-bleed";
  } else if (h.includes("cta") || h.includes("кнопк") || h.includes("диагон")) {
    pick = "cta-diagonal";
  } else if (h.includes("split") || h.includes("колонк") || h.includes("две")) {
    pick = "split-contrast";
  } else if (h.includes("poster") || h.includes("типограф")) {
    pick = "letter-accent";
  } else if (h.includes("photo-top") || h.includes("сверху")) {
    pick = "photo-top-band";
  } else if (h.includes("door") || h.includes("двер") || h.includes("вход")) {
    pick = "door-invite";
  } else if (h.includes("map") || h.includes("связ") || h.includes("network")) {
    pick = "map-network";
  } else if (h.includes("object") || h.includes("метафор")) {
    pick = "object-metaphor";
  }

  // Soft freedom: only break adjacent clones — reuse later in the series is OK.
  if (prev && pick === prev) {
    const alt = COMPOSITION_RECIPES.find((x) => x !== prev);
    if (alt) pick = alt;
  }
  return pick;
}

export type DiversityLintResult = {
  ok: boolean;
  uniqueCount: number;
  adjacentClones: number;
  errors: string[];
};

/**
 * Soft recipe fill: honour preferred AD picks; only avoid adjacent clones.
 * (Unique-on-every-slide was a narrow spot that killed improvisation.)
 */
export function forceUniqueRecipes(
  count: number,
  preferred: Array<string | undefined | null> = [],
): CompositionRecipe[] {
  const out: CompositionRecipe[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      const coverWant = preferred[0];
      out.push(
        coverWant &&
          COMPOSITION_RECIPES.includes(coverWant as CompositionRecipe)
          ? (coverWant as CompositionRecipe)
          : "poster-typo",
      );
      continue;
    }
    const prev = out[i - 1]!;
    const want = preferred[i];
    let pick: CompositionRecipe =
      want && COMPOSITION_RECIPES.includes(want as CompositionRecipe)
        ? (want as CompositionRecipe)
        : COMPOSITION_RECIPES[i % COMPOSITION_RECIPES.length]!;
    if (pick === prev) {
      pick =
        COMPOSITION_RECIPES.find((r) => r !== prev) ??
        COMPOSITION_RECIPES[(i + 1) % COMPOSITION_RECIPES.length]!;
    }
    out.push(pick);
  }
  return out;
}

export function lintRecipeDiversity(recipes: string[]): DiversityLintResult {
  const errors: string[] = [];
  let adjacentClones = 0;
  for (let i = 1; i < recipes.length; i++) {
    if (recipes[i] === recipes[i - 1]) {
      adjacentClones += 1;
      errors.push(`adjacent_clone_at_${i}:${recipes[i]}`);
    }
  }
  const unique = new Set(recipes.filter(Boolean));
  // Soft: adjacent clones are the hard fail; low unique is only a warning-level signal
  if (unique.size < 2 && recipes.length >= 3) {
    errors.push(`unique_recipes_${unique.size}_need_2`);
  }
  return {
    ok: adjacentClones === 0,
    uniqueCount: unique.size,
    adjacentClones,
    errors: adjacentClones === 0 ? [] : errors,
  };
}
