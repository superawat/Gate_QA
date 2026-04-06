/**
 * stripEmbeddedOptions
 *
 * Removes option-like lines embedded in scraped question HTML when a
 * separate structured options array already exists.
 *
 * Scraped GateOverflow question bodies frequently contain the option text
 * inline — e.g. `<p>A. 1% profit</p>`, `<li>A. option text</li>`, or even
 * bare text lines like "A. …\nB. …".  When the data also carries a
 * dedicated `options` array (rendered as interactive radio/checkbox inputs),
 * showing the inline copy produces a confusing duplicate.
 *
 * This utility strips those inline option nodes so the stem can be rendered
 * cleanly alongside the interactive options panel.
 *
 * Usage:
 *   import { stripEmbeddedOptions } from '../utils/stripEmbeddedOptions';
 *   const cleanHtml = stripEmbeddedOptions(rawQuestionHtml);
 */

/**
 * Matches block-level elements (p, div, li, span used as block) whose
 * *visible text* starts with a single uppercase letter followed by a dot
 * or closing-paren — the telltale "A." / "A)" option prefix.
 *
 * The regex intentionally stays broad so it catches:
 *   <p>A. some text</p>
 *   <p>(A) some text</p>
 *   <li>B. text</li>
 *   <p><strong>C.</strong> text</p>
 *
 * It does NOT strip options mid-sentence; only when the element's content
 * starts with the option label pattern.
 */

// Matches <p>, <div>, <li> tags whose content starts with an option label
// such as "A.", "B.", "(A)", "(B)", etc. Handles optional inner tags like
// <strong>, <b>, <em> wrapping the label letter.
const OPTION_BLOCK_RE =
    /<(p|div|li)\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-D]\)?[\.\):])\s*[\s\S]*?<\/\1>/gi;

// Matches bare-text option lines not wrapped in a block element — e.g.
// standalone "A. some text<br>"
const OPTION_LINE_RE =
    /(?:^|\n|<br\s*\/?>)\s*(?:\(?[A-D]\)?[\.\):])\s+[^\n<]+(?=\s*(?:<br\s*\/?>|\n|$))/gi;

// Matches an <ol> or <ul> that contains only 2–4 <li> children whose text
// starts with A./B./C./D. — common in scraped GateOverflow HTML.
const OPTION_LIST_RE =
    /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-D]\)?[\.\):])\s*[\s\S]*?<\/li>\s*){2,4}<\/\1>/gi;

// Matches alpha-style lists used by many scraped MCQ/MSQ options, even when
// the list is nested inside a wrapping <div>.
const ALPHA_OPTION_LIST_RE =
    /<(ol|ul)\b[^>]*(?:list-style-type\s*:\s*(?:upper-alpha|lower-alpha)|\btype\s*=\s*["']?[Aa]["']?)[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>/gi;

// Matches a generic <ol> or <ul> list at the very end of the HTML that has
// exactly 2 to 5 <li> elements. Scraped questions sometimes just use 
// <ol style="list-style-type:upper-alpha"> with no visible "A." text.
const TRAILING_OPTION_LIST_RE =
    /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>\s*(?:<br\s*\/?>|\s)*$/gi;

/**
 * Remove embedded option text from question HTML.
 *
 * @param {string} html — raw question HTML (may contain inline options)
 * @returns {string} — cleaned HTML with option lines removed
 */
export function stripEmbeddedOptions(html = "") {
    if (!html || typeof html !== "string") {
        return "";
    }

    let cleaned = html;

    // 1. Strip full <ol>/<ul> blocks that are purely option lists 
    // (with explicit labels A./B., or trailing lists without labels)
    cleaned = cleaned.replace(OPTION_LIST_RE, "");
    cleaned = cleaned.replace(ALPHA_OPTION_LIST_RE, "");
    cleaned = cleaned.replace(TRAILING_OPTION_LIST_RE, "");

    // 2. Strip individual <p>/<div>/<li> option blocks
    cleaned = cleaned.replace(OPTION_BLOCK_RE, "");

    // 3. Strip bare-text option lines
    cleaned = cleaned.replace(OPTION_LINE_RE, "");

    // 4. Collapse leftover whitespace / stray <br> runs at the end
    cleaned = cleaned.replace(/(<br\s*\/?>|\s)+$/i, "");

    return cleaned.trim();
}
