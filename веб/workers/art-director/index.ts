/**
 * Art Director worker entry — critique once after layered finals.
 * NEVER remakes. Backend job / API call `runArtDirectorReview`.
 */

export {
  runArtDirectorReview,
  formatArtDirectorReviewMarkdown,
  ART_DIRECTOR_VISION_MODEL,
  type RunArtDirectorReviewInput,
  type RunArtDirectorReviewResult,
} from "@/lib/studio/art-director-run";

export {
  ART_DIRECTOR_AGENT_ID,
  ART_DIRECTOR_DISPLAY_NAME,
  ART_DIRECTOR_SYSTEM_PROMPT,
} from "@/lib/studio/art-director-review";
