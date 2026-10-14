#!/usr/bin/env node

/**
 * scripts/pipeline/flatten-branch-images.mjs (DEPRECATED)
 * --------------------------------------------------------
 * Images are now permanently organized hierarchically by year in:
 * public/question-images/{branch}/{year}/{filename}
 *
 * Use `scripts/pipeline/organize-branch-images-by-year.mjs` instead.
 */

console.log("ℹ️ [DEPRECATED] Images are hierarchically organized by year: public/question-images/{branch}/{year}/.");
console.log("To maintain or verify the organization, run: node scripts/pipeline/organize-branch-images-by-year.mjs");
