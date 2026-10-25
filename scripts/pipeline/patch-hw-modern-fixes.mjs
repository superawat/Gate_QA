import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
let content = fs.readFileSync(patchesFile, "utf-8");

const MODERN_HW_FIXES = {
  "go:38": {
    concept: "Digital Logic - Truth Table and Boolean Function Identification",
    markdown: `### 1. Concept / Subtopic
**Boolean Functions**: Identifying switching functions directly from truth table column mappings and minterm expansions.

---

### 2. Given Truth Table
$$\\begin{array}{|c|c|c|}
\\hline
\\mathbf{X} & \\mathbf{Y} & \\mathbf{f(X, Y)} \\\\
\\hline
0 & 0 & 0 \\\\
0 & 1 & 0 \\\\
1 & 0 & 1 \\\\
1 & 1 & 1 \\\\
\\hline
\\end{array}$$

---

### 3. Step-by-Step Analytical Derivation
1. **Minterm Expansion**:
   * The function evaluates to $1$ for the row where $(X=1, Y=0)$ and the row where $(X=1, Y=1)$:
     $$f(X, Y) = m_2 + m_3 = X\\bar{Y} + XY$$
2. **Boolean Simplification**:
   * Factor out $X$:
     $$f(X, Y) = X(\\bar{Y} + Y)$$
   * By the complement law, $\\bar{Y} + Y = 1$:
     $$f(X, Y) = X \\cdot 1 = X$$
3. **Behavioral Observation**:
   * Whenever $X = 0$, $f(X, Y) = 0$ regardless of $Y$.
   * Whenever $X = 1$, $f(X, Y) = 1$ regardless of $Y$.
   * Thus, the output tracks input variable $X$ identically, representing the projection function $f(X, Y) = X$.

---

### 4. Distractor Analysis
* **Option A ($X$)**: Correct. Accurately represents the output column.
* **Option B ($X + Y$)**: Evaluates to $1$ when $(X=0, Y=1)$, whereas the table shows $0$.
* **Option C ($X \\oplus Y$)**: Evaluates to $0$ when $(X=1, Y=1)$, whereas the table shows $1$.
* **Option D ($Y$)**: Evaluates to $1$ when $(X=0, Y=1)$, whereas the table shows $0$.

---

### 5. Final Answer
Therefore, the correct choice is **Option A: $X$**.`,
    images: []
  },

  "go:1413": {
    concept: "Digital Logic - 2's Complement Dynamic Range",
    markdown: `### 1. Concept / Subtopic
**Binary Number Systems - Signed Arithmetic**: Dynamic range boundaries and representation limits of $n$-bit 2's complement integers.

---

### 2. Given Parameters
* Number of representation bits: $n = 8\\text{ bits}$.
* Encoding scheme: $2'\\text{s}$ complement representation.

---

### 3. Step-by-Step Analytical Derivation
1. **Dynamic Range Formulation for $n$-bit 2's Complement**:
   * In an $n$-bit 2's complement representation:
     * The Most Significant Bit (MSB, bit $n-1$) serves as the sign bit with negative weight $-2^{n-1}$.
     * The remaining $n-1$ bits carry positive binary weights $+2^{n-2}, \\dots, +2^0$.
   * The minimum (most negative) representable integer occurs when the sign bit is $1$ and all magnitude bits are $0$:
     $$N_{\\min} = -2^{n-1}$$
   * The maximum representable integer occurs when the sign bit is $0$ and all magnitude bits are $1$:
     $$N_{\\max} = +\\left(2^{n-1} - 1\\right)$$
   * The total integer range spans:
     $$\\left[-2^{n-1}, \\; 2^{n-1} - 1\\right]$$
2. **Evaluation for $n = 8$ Bits**:
   * Substituting $n = 8$:
     $$N_{\\min} = -2^{8-1} = -2^7 = -128$$
     $$N_{\\max} = 2^7 - 1 = 128 - 1 = +127$$
   * Bit pattern for $-128$:
     $$1000\\;0000_2 = -1 \\cdot 2^7 + 0 = -128$$
3. **Conclusion**:
   The smallest (most negative) representable integer is $-128$.

---

### 4. Distractor Analysis
* **Option A ($-256$)**: Would require 9 bits in 2's complement ($-2^8$).
* **Option B ($-128$)**: Correct. Exactly equals $-2^7$ for an 8-bit signed representation.
* **Option C ($-127$)**: The smallest integer in 8-bit sign-magnitude or 1's complement form, but 2's complement extends one value further negative to $-128$.
* **Option D ($0$)**: The smallest non-negative integer, not the smallest overall.

---

### 5. Final Answer
Therefore, the correct choice is **Option B: $-128$**.`,
    images: []
  }
};

const toAdd = [];
for (const [uid, sol] of Object.entries(MODERN_HW_FIXES)) {
  if (!content.includes(`"${uid}":`)) {
    toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
  }
}

if (toAdd.length > 0) {
  const marker = "export const AUTHENTIC_PATCHES = {";
  const markerIdx = content.indexOf(marker);
  const insertPos = markerIdx + marker.length;
  const newContent = content.slice(0, insertPos) + "\n" + toAdd.join("\n\n") + "\n\n" + content.slice(insertPos);
  fs.writeFileSync(patchesFile, newContent, "utf-8");
  console.log(`✅ Injected ${toAdd.length} modern fixes into patch-authentic-solutions.mjs`);
} else {
  console.log("Modern fixes already present.");
}
