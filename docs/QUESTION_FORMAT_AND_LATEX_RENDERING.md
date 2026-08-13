# Question Data Contract, LaTeX MathJax & HTML Rendering Guide

> **Scope**: Master reference for how question records are structured, authored, sharded, sanitized, and rendered across GATE CSE, GATE DA, and General Aptitude tracks.

---

## 1. Overview & Core Architecture

In GateQA (`gateqa.in`), question content is stored as **hybrid HTML + LaTeX strings** within static JSON shards. This design allows:
1. **Semantic HTML Layout**: Clean document flow for lists (`<ol>`, `<li>`), code snippets (`<pre><code>`), structured comparison/relational tables (`<table class="da-latex-table">`), and responsive local WebP figures (`<img src="...">`).
2. **First-Class Mathematical Typesetting**: Embedded LaTeX equations (`$...$` for inline, `$$...$$` for display block) rendered client-side by **MathJax 3** via `better-react-mathjax`.
3. **Zero Runtime Backend**: Instant, offline-capable delivery from static CDN/GitHub Pages shards.

```
+-------------------------------------------------------------------------------+
|                             Static JSON Shards                                |
|  { "title": "...", "question": "Let $T(n) = ...$<ol><li>...</li></ol>", ... }|
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                           Client Ingestion & Safety                           |
|  1. HTML Sanitization (DOMPurify / sanitizeHtmlFragment)                      |
|  2. Option Splitting & Deduplication (stripEmbeddedOptions)                   |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                           React & MathJax Renderer                            |
|  1. MathJaxContext (V3 MathJax Engine with TeX input)                         |
|  2. <MathJax dynamic inline={false}> (Typesets MathJax across DOM tree)       |
|  3. CSS Token System (Dark/Light high-contrast MathJax SVG rendering)         |
+-------------------------------------------------------------------------------+
```

---

## 2. The 6-Field Canonical Question Record Contract

Every question across all tracks (CSE, DA, Aptitude) adheres to the identical six-field JSON schema:

```json
{
  "title": "GATE DA 2026 | Question: 15",
  "link": "",
  "question": "Consider that the quick sort algorithm is used to sort an array of $n$ distinct randomly ordered elements. In every call, the pivot is chosen as the first element of the current subarray.<br />Let $T(n)$ denote the expected time to sort the array. Assume that the time to partition is linear in the size of the current subarray.<br />Which of the following recurrence relations correctly represents $T(n)$ in this scenario?<ol class=\"da-question-options\" style=\"list-style-type: upper-alpha;\"><li data-option-label=\"A\">$T(n) = T(1) + T(n - 1) + O(n)$</li><li data-option-label=\"B\">$T(n) = T\\left(\\frac{n}{4}\\right) + T\\left(\\frac{3n}{4}\\right) + O(n)$</li><li data-option-label=\"C\">$T(n) = 2T\\left(\\frac{n}{2}\\right) + O(n)$</li><li data-option-label=\"D\">$T(n) = \\frac{1}{n} \\sum_{k=0}^{n-1} [T(k) + T(n - k - 1)] + O(n)$</li></ol>",
  "tags": [
    "gateda-2026",
    "programming-data-structures-and-algorithms",
    "one-mark",
    "mcq",
    "question-15"
  ],
  "year": "gateda-2026",
  "answer": null
}
```

### Field Definitions:

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Canonical title (e.g. `GATE DA 2026 \| Question: 15`, `GATE CSE 2024 \| Question: 32`). |
| `link` | `string` | Official GateOverflow discussion URL. If no link exists, string remains blank `""` and the external Solution button is disabled. |
| `question` | `string` | The complete HTML markup containing the question stem, tables/figures, code blocks, and the `<ol>` list of options. |
| `tags` | `string[]` | Indexing and filtering tags: year tag (`gateda-2026`), subject slug (`linear-algebra`), marks tag (`one-mark` / `two-marks`), type tag (`mcq` / `msq` / `nat`), and question index (`question-15`). |
| `year` | `string` | Primary grouping year key (`gateda-2026`, `gate-2024-set1`, `aptitude-2023`). |
| `answer` | `null` | Reserved in public shards (`null` by design); answers are loaded lazily from secure/cached answer registries (`answers-by-question-uid-v1.json`). |

---

## 3. Authoring LaTeX & MathJax in JSON

### A. Inline vs. Display Math Delimiters

- **Inline Math**: Wrapped in single dollar signs: `$ ... $`  
  *Example*: `Let $x \in \mathbb{R}^n$ and $A \in \mathbb{R}^{n \times n}$ be an invertible matrix.`
- **Display (Block) Math**: Wrapped in double dollar signs: `$$ ... $$`  
  *Example*: `$$L = \lim_{n \to \infty} \sum_{k=0}^n \frac{e^{-n} n^k}{k!}$$`

### B. Standard LaTeX Macros & Patterns

| Mathematical Concept | LaTeX Pattern | Rendered Output (MathJax) |
| :--- | :--- | :--- |
| **Fractions** | `$\frac{a}{b}$` or `$\left(\frac{3n}{4}\right)$` | $\frac{a}{b}$ or $\left(\frac{3n}{4}\right)$ |
| **Summations & Limits** | `$\sum_{k=0}^{n-1} T(k)$`, `$\lim_{n \to \infty} f(n)$` | $\sum_{k=0}^{n-1} T(k)$, $\lim_{n \to \infty} f(n)$ |
| **2D Matrices** | `$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$` | $\begin{bmatrix} a & b \\ c & d \end{bmatrix}$ |
| **Vectors & Norms** | `$w = [-3.00, 4.00]^T$`, `$\|w\|_2^2$` | $w = [-3.00, 4.00]^T$, $\|w\|_2^2$ |
| **Sets & Number Spaces** | `$S = \{1, 2, \dots, n\}$`, `$\mathbb{R}^3$` | $S = \{1, 2, \dots, n\}$, $\mathbb{R}^3$ |
| **Combinatorics** | `$\binom{n}{k} = \frac{n!}{k!(n-k)!}$` | $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ |
| **Logic Predicates** | `$\forall x \exists y \; (P(x) \implies Q(y))$` | $\forall x \exists y \; (P(x) \implies Q(y))$ |
| **Greek Symbols** | `$\theta, \lambda, \mu, \sigma, \pi, \gamma$` | $\theta, \lambda, \mu, \sigma, \pi, \gamma$ |

> [!IMPORTANT]
> **JSON Escaping Rule**: In raw `.json` files, all LaTeX backslashes MUST be escaped with a double backslash (`\\`).  
> *Example*: `$\\frac{n}{4}$`, `\\begin{bmatrix}`, `\\sum_{k=0}^{n-1}`.

---

## 4. Authoring Layout: Code, Tables & Images

### A. Python Code Snippets
Code blocks must use structured `<pre><code class="language-python">...</code></pre>` tags with clear 4-space indentation:

```html
Consider the given Python program.<br />
<pre><code class="language-python">def append_to_lst(val, lst=[]):
    lst.append(val)
    return lst

print(append_to_lst(1))
print(append_to_lst(2))
print(append_to_lst(3, []))</code></pre>
<br />Which of the following is the correct output of this program?
```

### B. Relational & Comparison Tables
Tables must use the standardized `.da-latex-table` class for unified CSS styling and borders:

```html
<table class="da-latex-table">
  <thead>
    <tr><th colspan="3">X</th><th colspan="2">Y</th></tr>
    <tr><th>P</th><th>Q</th><th>R</th><th>P</th><th>S</th></tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>Q1</td><td>R1</td><td>P1</td><td>10</td></tr>
    <tr><td>P2</td><td>Q2</td><td>R2</td><td>P1</td><td>15</td></tr>
    <tr><td>P3</td><td>Q3</td><td>R2</td><td>P2</td><td>20</td></tr>
  </tbody>
</table>
```

### C. Local Optimized WebP Figures
Figures must reference local optimized `.webp` files from `/public/question-images/` (never external or remote URLs):

```html
<div style="text-align: center; margin: 12px 0;">
  <img src="/question-images/da/044f5201e42663218079.webp" alt="Circle geometry" style="max-width: 280px;" loading="lazy" />
</div>
```

---

## 5. How Frontend Renders HTML + LaTeX

The rendering pipeline in `src/components/Practice/QuestionPreview.jsx` and `src/pages/SolvePage.jsx` processes the question in three steps:

1. **Option Extraction / Stripping** (`src/utils/stripEmbeddedOptions.js`):
   - When displaying the question stem in interactive solve mode, `<ol>` and `<li>` options are cleanly split so the student can select interactive buttons (A, B, C, D) without duplicate option text.
2. **HTML Sanitization** (`DOMPurify`):
   - Strips malicious attributes (`onerror`, `onclick`, `javascript:`) while preserving mathematical tags, tables, code blocks, images, and classes (`da-latex-table`, `language-python`).
3. **MathJax Rendering** (`src/components/Common/MathRuntime.jsx`):
   - The component is wrapped with `<MathJax dynamic>` from `better-react-mathjax`.
   - MathJax parses the inner DOM tree, finds `$ ... $` and `$$ ... $$` delimiters, and translates them into crisp, accessible SVG/MathML mathematical expressions.
   - Dynamic re-typesetting occurs automatically when navigating across questions or filter views.

---

## 6. Sharding & Build Pipeline Topology

Static question shards are partitioned by exam track and year for fast, progressive loading:

```
public/data/
├── da/
│   ├── manifest.json                        # Total question counts, subject breakdown, coverage
│   ├── search-index.json                    # Compressed index for instant search & filtering
│   ├── questions-with-answers.json          # Master un-sharded published bank
│   ├── answers-by-question-uid-v1.json      # Official answer keys & NAT numerical tolerance ranges
│   └── shards/
│       ├── 2024.json                        # 65 questions for GATE DA 2024
│       ├── 2025.json                        # 65 questions for GATE DA 2025
│       └── 2026.json                        # 65 questions for GATE DA 2026
├── shards/                                  # 58 shards for GATE CSE (1990 - 2026)
└── aptitude/                                # Standalone Engineering Aptitude question bank
```

---

## 7. Quality Assurance & Validation Commands

All question data and rendering contracts are continuously enforced by automated test runners:

```bash
# 1. Validate 100% DA questions, answer keys, local WebP images, and HTML syntax
npm run qa:validate-da-data

# 2. Validate TypeScript types across services and contexts
npm run typecheck

# 3. Run full Vitest unit test suite (53 test files, 348 tests)
npm run test:unit

# 4. Build public artifacts and static production bundle with SEO pre-rendering
npm run build
```
