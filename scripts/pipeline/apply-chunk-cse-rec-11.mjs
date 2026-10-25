import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_REC_11_SOLUTIONS = {
  "go:2015": {
    concept: "Number Theory - Prime Factorization & Divisor Count Function",
    markdown: `- **Concept / Subtopic**: Number Theory - Prime Factorization & Divisor Count Function
- **Given Integer**:
  $$N = 2014$$
- **Step-by-Step Analytical Derivation**:
  1. **Prime Factorization of $2014$**:
     - Check smallest primes:
       - $2014$ is even:
         $$\\frac{2014}{2} = 1007$$
       - Test divisibility of $1007$:
         - $\\sqrt{1007} \\approx 31.7$
         - Not divisible by $3$ (sum of digits $1+0+0+7 = 8$).
         - Not divisible by $5, 7, 11, 13, 17$.
         - Testing $19$:
           $$\\frac{1007}{19} = 53$$
         - $53$ is a prime number.
     - Thus, the canonical prime factorization of $2014$ is:
       $$2014 = 2^1 \\times 19^1 \\times 53^1$$
  2. **Total Number of Positive Integral Divisors $d(N)$**:
     - For any positive integer $N = p_1^{a_1} p_2^{a_2} \\cdots p_k^{a_k}$, the number of distinct positive divisors is:
       $$d(N) = (a_1 + 1)(a_2 + 1) \\cdots (a_k + 1)$$
     - Substituting the prime exponents $a_1 = 1, a_2 = 1, a_3 = 1$:
       $$d(2014) = (1 + 1)(1 + 1)(1 + 1) = 2 \\times 2 \\times 2 = 8$$
  3. **Verification by Explicit Listing**:
     - The $8$ distinct positive divisors of $2014$ are:
       $$\\{1, 2, 19, 38, 53, 106, 1007, 2014\\}$$

Therefore, the correct answer is **8**.`,
    images: []
  },
  "go:2039": {
    concept: "Linear Algebra - Dimension Formula for Subspace Intersection",
    markdown: `- **Concept / Subtopic**: Linear Algebra - Dimension Formula for Subspace Intersection
- **Given Parameters**:
  - Ambient vector space $V$ with dimension:
    $$\\dim(V) = 6$$
  - Subspaces $V_1, V_2 \\subseteq V$ with dimensions:
    $$\\dim(V_1) = 4, \\quad \\dim(V_2) = 4$$
- **Governing Equations**:
  - By Grassmann's dimension formula for vector subspaces:
    $$\\dim(V_1 + V_2) = \\dim(V_1) + \\dim(V_2) - \\dim(V_1 \\cap V_2)$$
    $$\\dim(V_1 \\cap V_2) = \\dim(V_1) + \\dim(V_2) - \\dim(V_1 + V_2)$$
- **Step-by-Step Analytical Derivation**:
  1. Substitute known subspace dimensions:
     $$\\dim(V_1 \\cap V_2) = 4 + 4 - \\dim(V_1 + V_2) = 8 - \\dim(V_1 + V_2)$$
  2. **Bounds on the Sum Subspace $(V_1 + V_2)$**:
     - Because $V_1 + V_2$ is a subspace of the ambient 6-dimensional space $V$, its dimension cannot exceed $\\dim(V)$:
       $$\\dim(V_1 + V_2) \\le \\dim(V) = 6$$
  3. **Minimize $\\dim(V_1 \\cap V_2)$**:
     - To make $\\dim(V_1 \\cap V_2) = 8 - \\dim(V_1 + V_2)$ as small as possible, $\\dim(V_1 + V_2)$ must take its maximum possible value of $6$:
       $$\\dim(V_1 \\cap V_2)_{\\min} = 8 - 6 = 2$$
  4. Thus, the smallest possible dimension of $V_1 \\cap V_2$ is **2**.

Therefore, the correct answer is **2**.`,
    images: []
  },
  "go:2056": {
    concept: "Database Management Systems (DBMS) - Relational Normalization & Prime Attributes",
    markdown: `- **Concept / Subtopic**: Database Management Systems (DBMS) - Relational Normalization & Prime Attributes
- **Formal Relational Definition**:
  - In relational database theory and normalization (Codd, Date, Elmasri & Navathe):
    - A **Candidate Key** is a minimal superkey capable of uniquely identifying every tuple in a relation $R$.
    - A **Prime Attribute** (or key attribute) of a relation schema $R$ is defined as any attribute that is a member of **at least one (some) candidate key** of $R$.
    - A **Non-Prime Attribute** is an attribute that does not appear in any candidate key.
- **Distractor Analysis**:
  - **Option A**: Incorrect. An attribute does not need to appear in *all* candidate keys to be prime; appearing in just one is sufficient.
  - **Option B**: Correct. Standard textbook definition of a prime attribute.
  - **Option C**: Incorrect. Foreign keys enforce referential integrity between relations and have no bearing on the primality of an attribute.
  - **Option D**: Incorrect. If a relation has multiple candidate keys, an attribute belonging to an alternate key is still prime even if it is not selected as the primary key.

Therefore, the correct answer is **Option B (in some candidate key of $R$)**.`,
    images: []
  },
  "go:8011": {
    concept: "Verbal Aptitude - English Idiomatic Expressions",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - English Idiomatic Expressions
- **Sentence Analysis**:
  - *\"The chain snatchers took to their heels when the police party arrived.\"*
- **Idiom Definition**:
  - The idiomatic phrase **\"to take to one's heels\"** means to run away very fast, flee, or take flight to escape capture or danger.
- **Option Analysis**:
  - **Option A (Took shelter in a thick jungle)**: Too specific and inaccurate.
  - **Option B (Open indiscriminate fire)**: Irrelevant action.
  - **Option C (Took to flight)**: Exact idiomatic meaning (fled / ran away).
  - **Option D (Unconditionally surrendered)**: Opposite action.

Therefore, the correct answer is **Option C (Took to flight)**.`,
    images: []
  },
  "go:8092": {
    concept: "Discrete Mathematics - Set Theory & Power Set Cardinality",
    markdown: `- **Concept / Subtopic**: Discrete Mathematics - Set Theory & Power Set Cardinality
- **Given Set**:
  $$S = \\{0, 1, 2, \\dots, 10\\}$$
- **Step-by-Step Analytical Derivation**:
  1. **Determine the Cardinality of Set $S$**:
     - The set contains all integers from $0$ up to $10$ inclusive.
     - Number of elements:
       $$|S| = 10 - 0 + 1 = 11$$
  2. **Power Set Cardinality Formula**:
     - For any finite set $S$ with $|S| = n$ elements, the power set $\\mathcal{P}(S)$ is the set of all subsets of $S$.
     - Each of the $n$ elements has two independent choices (either included or excluded in a subset), so:
       $$|\\mathcal{P}(S)| = 2^{|S|} = 2^{11}$$
  3. **Compute $2^{11}$**:
     $$2^{10} = 1024$$
     $$2^{11} = 2 \\times 1024 = 2048$$

Therefore, the correct answer is **2048**.`,
    images: []
  },
  "go:8119": {
    concept: "Computer Organization - Memory Hierarchy & Average Memory Access Time (AMAT)",
    markdown: `- **Concept / Subtopic**: Computer Organization - Memory Hierarchy & Average Memory Access Time (AMAT)
- **Given Parameters**:
  - Cache hit time: $T_{\\text{hit}} = 5\\text{ ns}$.
  - Cache miss access time: $T_{\\text{miss}} = 50\\text{ ns}$.
  - Cache hit ratio: $h = 80\\% = 0.80$.
  - Cache miss ratio: $m = 1 - h = 1 - 0.80 = 0.20$.
- **Governing Equations**:
  - Average Read Access Time (AMAT) with simultaneous/total penalty specification:
    $$T_{\\text{avg}} = h \\cdot T_{\\text{hit}} + (1 - h) \\cdot T_{\\text{miss}}$$
- **Step-by-Step Analytical Derivation**:
  1. Substitute the known parameters:
     $$T_{\\text{avg}} = (0.80)(5\\text{ ns}) + (0.20)(50\\text{ ns})$$
  2. Compute each component:
     $$0.80 \\times 5 = 4.0\\text{ ns}$$
     $$0.20 \\times 50 = 10.0\\text{ ns}$$
  3. Sum the components:
     $$T_{\\text{avg}} = 4.0 + 10.0 = 14\\text{ ns}$$

Therefore, the correct answer is **14**.`,
    images: []
  },
  "go:8303": {
    concept: "Quantitative Aptitude - Linear Functions & Extrapolation",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Linear Functions & Extrapolation
- **Given Information**:
  - $f(x)$ is a linear function:
    $$f(x) = m x + c$$
  - Given values:
    $$f(-2) = 29 \\implies -2m + c = 29$$
    $$f(3) = 39 \\implies 3m + c = 39$$
- **Step-by-Step Analytical Derivation**:
  1. **Compute the Slope $m$**:
     $$m = \\frac{f(3) - f(-2)}{3 - (-2)} = \\frac{39 - 29}{3 + 2} = \\frac{10}{5} = 2$$
  2. **Compute the Intercept $c$**:
     $$3(2) + c = 39 \\implies 6 + c = 39 \\implies c = 33$$
     - Hence, the equation of the line is:
       $$f(x) = 2x + 33$$
  3. **Evaluate $f(x)$ at $x = 5$**:
     $$f(5) = 2(5) + 33 = 10 + 33 = 43$$

Therefore, the correct answer is **Option C ($43$)**.`,
    images: []
  },
  "go:8414": {
    concept: "Data Structures & Algorithms - Hash Table Load Factor Definition",
    markdown: `- **Concept / Subtopic**: Data Structures & Algorithms - Hash Table Load Factor Definition
- **Given Parameters**:
  - Number of slots (buckets) in hash table $T$: $m = 25$.
  - Number of elements stored in the table: $n = 2000$.
- **Governing Equations**:
  - By standard textbook definition (CLRS Chapter 11, *Hash Tables*), the load factor $\\alpha$ of a hash table is the average number of elements stored per slot:
    $$\\alpha = \\frac{n}{m}$$
- **Step-by-Step Analytical Derivation**:
  1. Substitute $n = 2000$ and $m = 25$:
     $$\\alpha = \\frac{2000}{25}$$
  2. Perform the division:
     $$\\alpha = \\frac{2000}{25} = 80$$

Therefore, the correct answer is **80**.`,
    images: []
  },
  "go:39630": {
    concept: "Calculus - Standard Trigonometric Limits",
    markdown: `- **Concept / Subtopic**: Calculus - Standard Trigonometric Limits
- **Problem Statement**:
  - Evaluate the limit:
    $$L = \\lim_{x \\to 4} \\frac{\\sin(x - 4)}{x - 4}$$
- **Step-by-Step Analytical Derivation**:
  1. Notice that directly substituting $x = 4$ yields the indeterminate form $\\frac{\\sin(0)}{0} = \\left[\\frac{0}{0}\\right]$.
  2. Introduce change of variable:
     $$u = x - 4$$
  3. As $x \\to 4$, $u \\to 0$.
  4. The limit transforms into the fundamental trigonometric limit:
     $$L = \\lim_{u \\to 0} \\frac{\\sin u}{u}$$
  5. By the standard fundamental limit theorem (or applying L'Hôpital's rule: $\\lim_{u \\to 0} \\frac{\\cos u}{1} = \\cos 0 = 1$):
     $$L = 1$$

Therefore, the correct answer is **1**.`,
    images: []
  },
  "go:39545": {
    concept: "Linear Algebra - Solvability of Systems of Linear Equations",
    markdown: `- **Concept / Subtopic**: Linear Algebra - Solvability of Systems of Linear Equations
- **Given Setup**:
  - System of $m$ linear equations in $n$ variables: $A x = b$, where $A$ is an $m \\times n$ matrix.
- **Evaluation of the Three Statements**:
  1. **Statement I: *\"If $m < n$, then all such systems have a solution.\"***
     - **FALSE**. While an underdetermined system cannot have a unique solution, it may have **no solution** (inconsistent).
     - Example: $m = 2, n = 3$:
       $$x_1 + x_2 + x_3 = 1$$
       $$x_1 + x_2 + x_3 = 2$$
       This system has $m < n$, yet $0 = 1$, yielding no solution.
  2. **Statement II: *\"If $m > n$, then none of these systems has a solution.\"***
     - **FALSE**. Overdetermined systems ($m > n$) can be consistent and possess solutions.
     - Example: Any homogeneous system $Ax = 0$ with $m > n$ always has the trivial solution $x = 0$.
  3. **Statement III: *\"If $m = n$, then there exists a system which has a solution.\"***
     - **TRUE**. It is trivial to construct a consistent $n \\times n$ system. For example, choose $A = I_n$ (identity matrix) and $b = (1, 1, \\dots, 1)^T$; then $Ix = b \\implies x = b$, which is a valid unique solution.
- **Conclusion**:
  - Only Statement **III** is true.

Therefore, the correct answer is **Option C (Only $\\text{III}$ is true)**.`,
    images: []
  },
  "go:118703": {
    concept: "Algorithms - Asymptotic Growth Rates of Functions",
    markdown: `- **Concept / Subtopic**: Algorithms - Asymptotic Growth Rates of Functions
- **Given Functions for Positive Integers $n$**:
  $$f_1(n) = 10, \\quad f_2(n) = \\sqrt{n}, \\quad f_3(n) = n, \\quad f_4(n) = \\log_2 n, \\quad f_5(n) = \\frac{100}{n}$$
- **Step-by-Step Analytical Derivation**:
  1. Analyze asymptotic behavior as $n \\to \\infty$:
     - $f_5(n) = \\frac{100}{n} \\to 0$: strictly decreasing function approaching $0$.
     - $f_1(n) = 10$: constant function, $\\Theta(1)$.
     - $f_4(n) = \\log_2 n$: logarithmic growth, $\\Theta(\\log n)$.
     - $f_2(n) = \\sqrt{n} = n^{0.5}$: sub-linear polynomial growth.
     - $f_3(n) = n = n^1$: linear polynomial growth.
  2. Standard asymptotic hierarchy:
     $$\\lim_{n \\to \\infty} \\frac{100/n}{10} = 0 \\implies \\frac{100}{n} = o(10)$$
     $$\\lim_{n \\to \\infty} \\frac{10}{\\log_2 n} = 0 \\implies 10 = o(\\log_2 n)$$
     $$\\lim_{n \\to \\infty} \\frac{\\log_2 n}{\\sqrt{n}} = 0 \\implies \\log_2 n = o(\\sqrt{n})$$
     $$\\lim_{n \\to \\infty} \\frac{\\sqrt{n}}{n} = \\lim_{n \\to \\infty} \\frac{1}{\\sqrt{n}} = 0 \\implies \\sqrt{n} = o(n)$$
  3. Arranging in strictly increasing order of asymptotic complexity:
     $$\\frac{100}{n}, \\quad 10, \\quad \\log_{2}n, \\quad \\sqrt{n}, \\quad n$$

Therefore, the correct answer is **Option B ($\frac{100}{n}$, $10$, $\log_{2}n$, $\sqrt{n}$, $n$)**.`,
    images: []
  },
  "go:118416": {
    concept: "Verbal Aptitude - Adjective and Adverb Placement with 'Enough'",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Adjective and Adverb Placement with 'Enough'
- **Grammar Rule**:
  - In standard English syntax, when **enough** modifies an adjective or an adverb, it must be placed **immediately after** the adjective/adverb:
    $$\\text{[Adjective/Adverb]} + \\textbf{enough} + \\text{[to + infinitive]}$$
    $$\\text{\"bright\" (adjective) } + \\textbf{enough} \\implies \\text{\"bright enough to be seen\"}$$
  - Placing *enough* before an adjective (*enough bright*) is ungrammatical.
- **Application to the Sentence**:
  - *\"Saturn is _______ to be seen on a clear night with the naked eye.\"*
  - The correct adjective-adverb construction is **bright enough**.

Therefore, the correct answer is **Option B (bright enough)**.`,
    images: []
  },
  "go:204084": {
    concept: "Operating Systems - Demand Paging & Effective Memory Access Time",
    markdown: `- **Concept / Subtopic**: Operating Systems - Demand Paging & Effective Memory Access Time
- **Given Parameters**:
  - Memory access time without page fault (page hit): $M$.
  - Memory access time with page fault: $D$.
  - Average (effective) memory access time: $X$.
  - Let $p$ denote the page fault rate ($0 \\le p \\le 1$).
- **Governing Equations**:
  - Effective memory access time in demand paging is given by:
    $$X = (1 - p) M + p D$$
- **Step-by-Step Analytical Derivation**:
  1. Expand the equation:
     $$X = M - p M + p D$$
     $$X = M + p (D - M)$$
  2. Isolate the term containing page fault rate $p$:
     $$X - M = p (D - M)$$
  3. Divide both sides by $(D - M)$:
     $$p = \\frac{X - M}{D - M}$$
  4. This matches Option B identically.

Therefore, the correct answer is **Option B ($(X-M) / D-M)$)**.`,
    images: []
  },
  "go:302824": {
    concept: "C Programming - Pointer Arithmetic & Array Indexing",
    markdown: `- **Concept / Subtopic**: C Programming - Pointer Arithmetic & Array Indexing
- **Given C Code Snippet**:
  \`\`\`c
  #include <stdio.h>
  int main() {
      int arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 5};
      int *ip = arr + 4;
      printf("%d\\n", ip[1]);
      return 0;
  }
  \`\`\`
- **Step-by-Step Analytical Execution**:
  1. **Array Initialization**:
     - The array elements and their 0-based indices are:
       - \`arr[0] = 1\`
       - \`arr[1] = 2\`
       - \`arr[2] = 3\`
       - \`arr[3] = 4\`
       - \`arr[4] = 5\`
       - \`arr[5] = 6\`
       - \`arr[6] = 7\`
       - ...
  2. **Pointer Arithmetic**:
     - \`arr\` decays to a pointer to its first element (\`&arr[0]\`).
     - \`ip = arr + 4\` points to \`&arr[4]\`, which holds the value \`5\`.
  3. **Array Subscripting via Pointer**:
     - By C definition, pointer indexing \`ip[i]\` is equivalent to \`*(ip + i)\`.
     - Here:
       \`\`\`c
       ip[1] == *(ip + 1) == *(arr + 4 + 1) == *(arr + 5) == arr[5]
       \`\`\`
     - The element at index 5 is **\`6\`**.
  4. Thus, \`printf(\"%d\\n\", ip[1]);\` prints **6**.

Therefore, the correct answer is **6**.`,
    images: []
  }
};

export function applyChunkCseRec11() {
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_CSE_REC_11_SOLUTIONS)
    .map(([uid, patch]) => {
      return `  "${uid}": ${JSON.stringify(patch, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")},`;
    })
    .join("\n");

  const marker = "export const AUTHENTIC_PATCHES = {";
  if (patchFileContent.includes(marker)) {
    patchFileContent = patchFileContent.replace(marker, () => `${marker}\n${entries}`);
    fs.writeFileSync(patchFilePath, patchFileContent, "utf-8");
    console.log(`Injected ${Object.keys(CHUNK_CSE_REC_11_SOLUTIONS).length} patches into patch-authentic-solutions.mjs`);
  } else {
    console.error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs");
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-rec-11")) {
  applyChunkCseRec11();
}
