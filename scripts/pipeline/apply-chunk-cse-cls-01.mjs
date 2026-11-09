import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const CHUNK_CSE_CLS_01_SOLUTIONS = {
  "go:1376": {
    concept: "Theory of Computation - Finite Automata Defect Analysis and Language Recognition",
    markdown: `### 1. Conceptual Framework & Automaton Structure
We analyze the transition graph of machine $M = (Q, \\Sigma, \\delta, q_0, F)$ over alphabet $\\Sigma = \\{a, b\\}$ with states $Q = \\{q_0, q_1, q_2, q_3, q_{\\text{trap}}\\}$:
- **Initial State**: $q_0$ (which is a single-circle, **non-accepting** state).
- **Transitions from $q_0$**:
  $$\\delta(q_0, b) = q_0, \\quad \\delta(q_0, a) = q_1$$
- **Transitions from $q_1$**:
  $$\\delta(q_1, b) = q_2, \\quad \\delta(q_1, a) = q_{\\text{trap}}$$
- **Transitions from $q_2$**:
  $$\\delta(q_2, b) = q_3, \\quad \\delta(q_2, a) = q_{\\text{trap}}$$
- **Transitions from $q_3$** (the **only accepting state** $F = \\{q_3\\}$):
  $$\\delta(q_3, b) = q_3, \\quad \\delta(q_3, a) = q_1$$
- **Transitions from $q_{\\text{trap}}$** (dead state):
  $$\\delta(q_{\\text{trap}}, a) = q_{\\text{trap}}, \\quad \\delta(q_{\\text{trap}}, b) = q_{\\text{trap}}$$

---

### 2. Language Recognized by the Machine
Tracing paths from the non-accepting start state $q_0$ to the sole accepting state $q_3$:
1. Any accepted string must first traverse from $q_0$ to $q_3$. Since only an input of $a$ leaves $q_0$, every accepted string must contain at least one $a$.
2. The minimal path from $q_0$ to $q_3$ reads $b^* a b b$.
3. From $q_3$, additional $b$'s self-loop at $q_3$, and reading an $a$ transitions back to $q_1$, where exactly two subsequent $b$'s are required to return to $q_3$.
4. Thus, the exact regular language recognized by $M$ is:
   $$L(M) = b^* a b b b^* (a b b b^*)^*$$

---

### 3. Detailed Option Breakdown & Defect Identification
Let us evaluate each option against the actual language $L(M)$:
1. **Option A**: $\\{w \\in \\{a, b\\}^* \\mid \\text{every } a \\text{ in } w \\text{ is followed by exactly two } b\\text{'s}\\}$
   - **Defect 1**: Fails because $M$ accepts $abbb$ (self-loop of $b$ at $q_3$), where $a$ is followed by three $b$'s.
   - **Defect 2**: A string containing no $a$'s (e.g., $b$ or $\\epsilon$) vacuously satisfies the condition in Option A, but $b$ and $\\epsilon$ are rejected by $M$ because $q_0 \\notin F$.
2. **Option B**: $\\{w \\in \\{a, b\\}^* \\mid \\text{every } a \\text{ in } w \\text{ is followed by at least two } b\\text{'s}\\}$
   - **Defect**: In standard first-order logic, the universal proposition $\\forall x (P(x) \\implies Q(x))$ is vacuously true when no element satisfies $P(x)$. Consequently, strings with zero occurrences of $a$ (such as $\\epsilon$, $b$, $bb$) satisfy the statement \"every $a$ is followed by at least two $b$'s\".
   - However, $M$ **rejects** $\\epsilon, b, bb, b^k$ because the start state $q_0$ is non-accepting. For Option B to be correct, $q_0$ would have to be an accepting state.
3. **Option C**: $\\{w \\in \\{a, b\\}^* \\mid w \\text{ contains the substring } 'abb'\\}$
   - **Defect**: The string $abba$ contains the substring $abb$, but $\\delta(q_0, abba) = q_1 \\notin F$, so $abba$ is rejected by $M$.
4. **Option D**: $\\{w \\in \\{a, b\\}^* \\mid w \\text{ does not contain } 'aa' \\text{ as a substring}\\}$
   - **Defect**: The string $ab$ does not contain $aa$, but $\\delta(q_0, ab) = q_2 \\notin F$, so $ab$ is rejected by $M$.

---

### 4. Official GATE Errata & Evaluation Decision
Because the start state $q_0$ is not an accepting state, none of the four choices correctly matches $L(M)$. Due to this structural discrepancy in the options, IIT officially declared the question defective and awarded **Marks to All (MTA)**.`,
    images: []
  },

  "go:2365": {
    concept: "General Aptitude - Verbal Ability Synonyms: Circuitous",
    markdown: `### 1. Definition and Etymological Origin
The word **circuitous** (/sərˈkjuːɪtəs/) originates from the Medieval Latin *circuitosus*, which derives from Latin *circuitus* (\"a going around\", \"a roundabout way\"), formed from *circum-* (\"around\") and *ire* (\"to go\").

In standard English usage, **circuitous** means:
- Taking a roundabout, winding, or indirect course rather than a direct, straight route.
- Characterized by indirectness or evasiveness in language, speech, or conduct.

---

### 2. Analysis of the Target Word and Options
- **Option A (cyclic)**: Relates to a cycle, recurring in regular intervals or moving in a circle. While circular processes return to a starting point, \"cyclic\" describes periodic recurrence rather than taking a long detour.
- **Option B (indirect)**: Means not going straight to the point; deviating from a direct course; roundabout. This is the direct denotative synonym of *circuitous* (e.g., \"a circuitous explanation\" $\\equiv$ \"an indirect explanation\").
- **Option C (confusing)**: Means bewildering or hard to understand. Although a circuitous argument may lead to confusion, confusion is an effect, not the primary meaning of the word.
- **Option D (crooked)**: Means bent, twisted out of shape, or dishonest/devious. It is not synonymous with taking a meandering or indirect path.

---

### 3. Conclusion
Among the choices, **indirect** is the closest in meaning to **circuitous**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:2366": {
    concept: "General Aptitude - Verbal Ability Sentence Completion: Conserve",
    markdown: `### 1. Contextual Semantics of the Sentence
The sentence reads:
> *\"If we manage to __________ our natural resources, we would leave a better planet for our children.\"*

The sentence expresses a conditional cause-and-effect statement about environmental sustainability and stewardship: taking prudent care of the Earth's finite physical resources (minerals, water, forests, fossil fuels) ensures intergenerational prosperity.

---

### 2. Detailed Distractor Analysis
- **Option A (uphold)**: Means to support, defend, or maintain a law, standard, verdict, or moral principle (e.g., \"uphold the constitution\"). It does not collocate with physical natural resources.
- **Option B (restrain)**: Means to keep under control, prevent from acting, or physically hold back (e.g., \"restrain someone's temper\"). One does not \"restrain\" natural resources.
- **Option C (cherish)**: Means to protect and care for someone or something lovingly, or to hold dear in memory (e.g., \"cherish freedom\"). While positive, it expresses emotional attachment rather than sustainable management and preservation.
- **Option D (conserve)**: Means to prevent the wasteful overuse, depletion, or destruction of natural resources by careful management. \"Conserve natural resources\" is the established standard collocation in environmental discourse.

---

### 3. Conclusion
Thus, **conserve** is the most grammatically and contextually appropriate word.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:2367": {
    concept: "Discrete Mathematics & General Aptitude - Set Theory: Principle of Inclusion-Exclusion",
    markdown: `### 1. Problem Formulation and Set Definitions
Let the universal set $U$ represent the set of all persons in the room:
$$|U| = 25$$

Define the subsets:
- $H$: set of persons who play hockey $\\implies |H| = 15$
- $F$: set of persons who play football $\\implies |F| = 17$
- $H \\cap F$: set of persons who play both hockey and football $\\implies |H \\cap F| = 10$

We need to find the number of persons who play **neither** hockey nor football, which corresponds to the complement of the union:
$$|(H \\cup F)'| = |U| - |H \\cup F|$$

---

### 2. Principle of Inclusion-Exclusion (PIE)
By the Principle of Inclusion-Exclusion, the number of persons playing at least one of the two sports is:
$$|H \\cup F| = |H| + |F| - |H \\cap F|$$

Substituting the given numerical values:
$$|H \\cup F| = 15 + 17 - 10 = 32 - 10 = 22$$

---

### 3. Calculating Persons Playing Neither Sport
The number of persons playing neither sport is:
$$|(H \\cup F)'| = |U| - |H \\cup F| = 25 - 22 = 3$$

We can also verify via disjoint regions of a Venn diagram:
- Only Hockey: $|H \\setminus F| = |H| - |H \\cap F| = 15 - 10 = 5$
- Only Football: $|F \\setminus H| = |F| - |H \\cap F| = 17 - 10 = 7$
- Both Sports: $|H \\cap F| = 10$
- Neither Sport: $25 - (5 + 7 + 10) = 25 - 22 = 3$

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:2154": {
    concept: "Programming and Data Structures - Recursion & Radix Representation: Digit Sum",
    markdown: `### 1. Function Logic and Algorithmic Role
Consider the recursive function:
\`\`\`c
unsigned int foo(unsigned int n, unsigned int r) {
    if (n > 0) return ((n % r) + foo(n / r, r));
    else return 0;
}
\`\`\`
For any positive integers $n$ and radix $r$, the expression \`n % r\` isolates the least significant digit of $n$ in base $r$, and \`n / r\` performs integer division, discarding the least significant digit. Hence, $\\text{foo}(n, r)$ computes the **sum of the digits of $n$ when represented in base $r$**.

---

### 2. Step-by-Step Recursive Execution Trace
We are given the initial invocation \`foo(345, 10)\`:

1. **Call 1**: \`foo(345, 10)\`
   - Since $n = 345 > 0$:
   - Remainder: $345 \\pmod{10} = 5$
   - Quotient: $345 / 10 = 34$
   - Expression: $5 + \\text{foo}(34, 10)$

2. **Call 2**: \`foo(34, 10)\`
   - Since $n = 34 > 0$:
   - Remainder: $34 \\pmod{10} = 4$
   - Quotient: $34 / 10 = 3$
   - Expression: $4 + \\text{foo}(3, 10)$

3. **Call 3**: \`foo(3, 10)\`
   - Since $n = 3 > 0$:
   - Remainder: $3 \\pmod{10} = 3$
   - Quotient: $3 / 10 = 0$
   - Expression: $3 + \\text{foo}(0, 10)$

4. **Call 4 (Base Case)**: \`foo(0, 10)\`
   - Since $n = 0 \\ngtr 0$, the \`else\` branch executes:
   - Returns $0$.

---

### 3. Call Stack Unwinding
Substituting the return values back up the call stack:
- \`foo(3, 10)\` $= 3 + 0 = 3$
- \`foo(34, 10)\` $= 4 + 3 = 7$
- \`foo(345, 10)\` $= 5 + 7 = 12$

Thus, the return value is $3 + 4 + 5 = 12$.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:2170": {
    concept: "General Aptitude - Verbal Ability Antonyms: Amalgamate vs Separate",
    markdown: `### 1. Meaning of the Target Word
The verb **amalgamate** (/əˈmælɡəmeɪt/) means to combine, merge, or unite multiple distinct elements, organizations, or substances into a unified, single whole.
- Derived from *amalgam*, an alloy of mercury with other metals, historically signifying a homogenous blend.
- Example: *\"The two regional colleges amalgamated to form a comprehensive university.\"*

---

### 2. Antonym Analysis
We seek the word that is **most nearly opposite** in meaning to *amalgamate*:
- **Option A (merge)**: This is a direct synonym, meaning to blend or combine together.
- **Option B (split)**: Means to divide longitudinally into parts, typically along a natural grain or crack. While it denotes division, \"split\" is more specialized in context compared to separating joined entities.
- **Option C (collect)**: Means to gather together, which is synonymous with aggregation.
- **Option D (separate)**: Means to set apart, disunite, disconnect, or divide a previously unified entity into distinct, independent parts. In standard English lexicography, *separate* is the primary, direct antonym of *amalgamate* / *combine*.

---

### 3. Conclusion
Because *separate* is the direct opposite of bringing parts together into a unified whole, Option D is the uniquely correct choice.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "go:1577": {
    concept: "Engineering Mathematics - Probability & Statistics: Cumulative Distribution Function (CDF)",
    markdown: `### 1. Cumulative Distribution Function (CDF) Definition
For any real random variable $X$, the cumulative distribution function (CDF) $F(x)$ is formally defined as:
$$F(x) = P(X \\le x)$$

---

### 2. Given Probability Mass Function
The random variable $X$ is discrete, taking values $+1$ and $-1$ with equal probability:
$$P(X = -1) = 0.5, \\quad P(X = +1) = 0.5$$
For all $x \\notin \\{-1, +1\\}$, $P(X = x) = 0$.

---

### 3. Evaluating CDF at $x = -1$ and $x = +1$
1. At $x = -1$:
   $$F(-1) = P(X \\le -1)$$
   The only support value satisfying $X \\le -1$ is $X = -1$. Therefore:
   $$F(-1) = P(X = -1) = 0.5$$

2. At $x = +1$:
   $$F(+1) = P(X \\le +1)$$
   The support values satisfying $X \\le +1$ are both $X = -1$ and $X = +1$. Therefore:
   $$F(+1) = P(X = -1) + P(X = +1) = 0.5 + 0.5 = 1.0$$

---

### 4. Full CDF Representation
For completeness, the step function across the real line is:
$$F(x) = \\begin{cases} 
0, & x < -1 \\\\
0.5, & -1 \\le x < 1 \\\\
1.0, & x \\ge 1
\\end{cases}$$

Evaluating at the specific boundary points yields $F(-1) = 0.5$ and $F(+1) = 1$.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:2193": {
    concept: "General Aptitude & Engineering Mathematics - Optimization & Calculus: Profit Maximization",
    markdown: `### 1. Economic Formulation of Profit
Let $q$ denote the quantity produced and sold by the firm ($q \\ge 0$):
- **Total Cost Function**: $C(q) = 5q^2$
- **Selling Price per unit**: $p = \\text{₹ } 50$
- **Total Revenue Function**: $R(q) = p \\cdot q = 50q$

The total profit function $P(q)$ is the difference between total revenue and total cost:
$$P(q) = R(q) - C(q) = 50q - 5q^2$$

---

### 2. Profit Maximization via Calculus
To find the quantity $q$ that maximizes profit, we apply the first-order necessary condition:
$$\\frac{dP}{dq} = 0$$

Differentiating $P(q)$ with respect to $q$:
$$\\frac{dP}{dq} = 50 - 10q = 0 \\implies 10q = 50 \\implies q = 5$$

Equivalently, this occurs where Marginal Revenue equals Marginal Cost:
$$\\text{MR} = \\frac{dR}{dq} = 50, \\quad \\text{MC} = \\frac{dC}{dq} = 10q \\implies 10q = 50 \\implies q = 5$$

---

### 3. Verification of Second-Order Condition
Evaluating the second derivative:
$$\\frac{d^2P}{dq^2} = \\frac{d}{dq}(50 - 10q) = -10 < 0$$
Since the second derivative is strictly negative everywhere, the profit function is strictly concave, confirming that $q = 5$ is the unique global maximum.

---

### 4. Evaluation of Maximum Profit
At $q = 5$ units:
$$P(5) = 50(5) - 5(5^2) = 250 - 125 = \\text{₹ } 125$$

Therefore, the number of units to be produced is $5$.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:2195": {
    concept: "General Aptitude - Verbal Ability Sentence Completion: Setbacks",
    markdown: `### 1. Grammatical and Rhetorical Structure
The sentence is:
> *\"Despite several _________ the mission succeeded in its attempt to resolve the conflict.\"*

The sentence uses the preposition **Despite**, which introduces a concessive clause denoting adversity, unexpected difficulty, or opposition that stands in contrast to the successful resolution described in the main clause (*\"the mission succeeded\"*).

---

### 2. Evaluation of Options
- **Option A (attempts)**: Results in redundant tautology (*\"Despite several attempts the mission succeeded in its attempt\"*), and \"attempts\" does not inherently denote an adverse hindrance.
- **Option B (setbacks)**: A **setback** is an unexpected reversal or arrest in progress; a difficulty or complication. Placing *setbacks* creates a meaningful, standard rhetorical contrast: *Despite several obstacles and reversals of progress, the mission nevertheless succeeded*.
- **Option C (meetings)**: Neutral events. Holding meetings is part of diplomatic negotiation, not a hardship or obstacle.
- **Option D (delegations)**: Refers to groups of delegates or representatives; neutral and contextually inappropriate.

---

### 3. Conclusion
*Setbacks* provides the precise contrasting polarity demanded by the concessive marker *Despite*.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:2197": {
    concept: "General Aptitude - Verbal Ability Synonyms: Mitigate vs Diminish",
    markdown: `### 1. Etymology and Definition of the Target Word
The verb **mitigate** (/ˈmɪtɪɡeɪt/) comes from the Latin *mitigatus*, past participle of *mitigare* (\"to soften, make mild\"), from *mitis* (\"mild, soft\") + *agere* (\"to do, drive\").

In standard English usage, **mitigate** means:
- To make less severe, harmful, intense, or painful.
- To lessen the gravity or harshness of an offense, mistake, or adversity.
- Examples: *\"mitigate risks\"*, *\"mitigate the impact of climate change\"*.

---

### 2. Analysis of the Options
- **Option A (Diminish)**: Means to make or become less; reduce in size, extent, severity, or importance. This directly matches the core reductive meaning of *mitigate*.
- **Option B (Divulge)**: Means to reveal, disclose, or make known confidential or private information.
- **Option C (Dedicate)**: Means to devote time, effort, or oneself entirely to a specific cause, person, or purpose.
- **Option D (Denote)**: Means to indicate, be a sign of, or signify a literal meaning.

---

### 3. Conclusion
Among the choices, **Diminish** is the closest synonym to **Mitigate**.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "go:2210": {
    concept: "General Aptitude & Engineering Mathematics - Calculus & Quadratic Functions: Arch Height Maximization",
    markdown: `### 1. Profile of the Arch and Mathematical Model
The height profile of the arch is given by the quadratic equation:
$$y = 2x - 0.1x^2$$
where:
- $x$ is the horizontal distance in meters.
- $y$ is the vertical height of the arch in meters.

Since the coefficient of $x^2$ is negative ($a = -0.1 < 0$), the graph is a downward-opening parabola with a unique global maximum at its vertex.

---

### 2. Method 1: Optimization via Differential Calculus
To determine the point of maximum height, find the critical point where the first derivative equals zero:
$$\\frac{dy}{dx} = \\frac{d}{dx}(2x - 0.1x^2) = 2 - 0.2x$$

Setting $\\frac{dy}{dx} = 0$:
$$2 - 0.2x = 0 \\implies 0.2x = 2 \\implies x = \\frac{2}{0.2} = 10\\text{ meters}$$

Check the second derivative to confirm a maximum:
$$\\frac{d^2y}{dx^2} = -0.2 < 0$$
Since $\\frac{d^2y}{dx^2} < 0$, the height is strictly maximized at $x = 10\\text{ m}$.

Substitute $x = 10$ into the height equation:
$$y_{\\text{max}} = 2(10) - 0.1(10^2) = 20 - 0.1(100) = 20 - 10 = 10\\text{ meters}$$

---

### 3. Method 2: Completing the Square
Rewriting the parabola in standard vertex form $y = a(x - h)^2 + k$:
$$y = -0.1(x^2 - 20x) = -0.1\\left[(x - 10)^2 - 100\\right] = 10 - 0.1(x - 10)^2$$

Because $(x - 10)^2 \\ge 0$ for all real $x$, the term $-0.1(x - 10)^2 \\le 0$. Hence, the maximum possible value of $y$ is $10\\text{ meters}$, attained when $x = 10$.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1415": {
    concept: "Algorithms - Sorting: Selection Sort Asymptotic Swap Complexity Bound",
    markdown: `### 1. Selection Sort Algorithm Review
Selection sort sorts an array $A[0 \\dots n-1]$ of $n$ elements through $n-1$ passes:
\`\`\`text
for i = 0 to n - 2:
    min_idx = i
    for j = i + 1 to n - 1:
        if A[j] < A[min_idx]:
            min_idx = j
    swap(A[i], A[min_idx])
\`\`\`

In each pass $i$:
1. It scans the unsorted subarray $A[i \\dots n-1]$ to locate the index of the minimum element.
2. It performs **at most one swap** to place that minimum element into its correct final sorted position $A[i]$.

---

### 2. Analysis of the Number of Swaps
- The outer loop runs for $i = 0, 1, \\dots, n - 2$, which executes exactly $n - 1$ times.
- In each iteration of the outer loop, exactly one \`swap\` operation is executed (or at most one if self-swaps when \`min_idx == i\` are avoided).
- Therefore, the total number of swaps $S(n)$ performed in the worst, best, and average cases satisfies:
  $$S(n) \\le n - 1$$

---

### 3. Asymptotic Tightness
- The upper bound on the number of swaps is $O(n)$.
- In the worst case (e.g., when the minimum element is never at position $i$), exactly $n - 1$ swaps are executed, so $S(n) = \\Theta(n)$.
- Thus, the **tightest upper bound** on the number of swaps is **$O(n)$**.

---

### 4. Key Distinction: Comparisons vs. Swaps
It is essential to distinguish between comparisons and swaps in selection sort:
- **Number of key comparisons**: $\\sum_{i=0}^{n-2} (n - 1 - i) = \\frac{n(n-1)}{2} = \\Theta(n^2)$ in all cases.
- **Number of element swaps**: At most $n - 1 = O(n)$.

This makes selection sort advantageous in architectures where memory write operations (such as EEPROM / Flash writes) are substantially more expensive than read/comparison operations.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "go:1416": {
    concept: "Programming and Data Structures - Binary Search Trees: Worst-Case Insertion Time Complexity",
    markdown: `### 1. Binary Search Tree (BST) Insertion Mechanics
In a standard Binary Search Tree (BST), inserting a new node involves:
1. Starting at the root node.
2. Comparing the search key of the new node with the current node's key:
   - If smaller, branch to the left subtree.
   - If larger, branch to the right subtree.
3. Repeating this process until a \`NULL\` pointer (empty leaf position) is reached, where the new node is attached.

The time complexity of inserting a key is proportional to the length of the path from the root to the insertion point, which is bounded by the height of the tree $h$:
$$T(n) = O(h)$$

---

### 2. Worst-Case Tree Topology
For a general (unbalanced) BST containing $n$ nodes:
- In the best and average cases (balanced tree), the height is $h = \\Theta(\\log n)$, yielding an insertion time of $O(\\log n)$.
- However, without self-balancing mechanisms (such as in AVL or Red-Black trees), the tree can degenerate into a **skewed binary search tree** (effectively a singly linked list).
- A skewed tree occurs when keys are inserted in monotonically increasing or decreasing order.
- In a skewed tree of $n$ nodes, the height is:
  $$h = n$$

---

### 3. Tightest Worst-Case Upper Bound
Because the problem asks for the tightest upper bound representing the time complexity of insertion into an arbitrary binary search tree of $n$ nodes, the bound must hold across **all valid BST instances**, including the worst case:
$$T_{\\text{worst}}(n) = O(h_{\\text{worst}}) = O(n)$$

Hence, the tightest upper bound is **$O(n)$**.

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "go:1559": {
    concept: "General Aptitude - Verbal Ability Synonyms: Nadir vs Lowest",
    markdown: `### 1. Etymology and Astronomical Origin
The noun **nadir** (/ˈneɪdɪər/) entered English via Old French, originating from the Arabic phrase *naẓīr as-samt* (نظير السمت), which literally translates to \"counterpart of the zenith\" or \"opposite the zenith\" (*naẓīr* meaning \"opposite\" and *samt* meaning \"direction/zenith\").

In astronomy, the **nadir** is the point on the celestial sphere directly beneath an observer, located diametrically opposite the **zenith** (the point directly overhead).

---

### 2. Figurative Meaning and Synonymy
In general and figurative usage:
- **Nadir** represents the lowest point in a person's or organization's fortunes, career, vitality, or happiness (e.g., *\"the nadir of relations between the two countries\"*).
- Its direct synonym is **lowest point** or **lowest**.

---

### 3. Evaluation of Options
- **Option A (Highest)**: This is the antonym of nadir (synonymous with *zenith*, *apex*, *pinnacle*, or *acme*).
- **Option B (Lowest)**: Accurately and directly captures the synonymous meaning of nadir.
- **Option C (Medium)**: Denotes an intermediate or average level, not the extreme bottom.
- **Option D (Integration)**: Refers to unifying components, completely unrelated.

---

### 4. Conclusion
Among the given options, **Lowest** is the closest in meaning to **Nadir**.

Therefore, the correct answer is **Option B**.`,
    images: []
  }
};

export function applyChunkCls01() {
  const chunkPath = path.resolve("data/solutions/chunks/cse/chunk-cse-cls-01.json");
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));

  // 1. Mark accepted in chunk file
  for (const q of chunkData.questions) {
    if (CHUNK_CSE_CLS_01_SOLUTIONS[q.question_uid]) {
      q.status = "ACCEPTED";
      q.solutionMarkdown = CHUNK_CSE_CLS_01_SOLUTIONS[q.question_uid].markdown;
      q.conceptSummary = CHUNK_CSE_CLS_01_SOLUTIONS[q.question_uid].concept;
    }
  }
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
  console.log(`Updated ${chunkPath} with ACCEPTED status and solutions.`);

  // 2. Inject into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");

  const targetMarker = "export function applyAuthenticPatches() {";
  const injectionEntries = Object.entries(CHUNK_CSE_CLS_01_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"go:1415": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `\n  // CHUNK-CSE-CLS-01\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
      fs.writeFileSync(patchFile, updatedContent, "utf8");
      console.log(`Injected 14 patches into ${patchFile}.`);
    } else {
      console.error(`Marker "${targetMarker}" not found in ${patchFile}`);
    }
  } else {
    console.log("Patches already present in patch-authentic-solutions.mjs");
  }

  // 3. Update manifest.json
  const manifestPath = path.resolve("data/solutions/chunks/manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.chunks["CHUNK-CSE-CLS-01"] = {
      chunkId: "CHUNK-CSE-CLS-01",
      branch: "cse",
      year: "classic",
      section: "all",
      file: "data\\solutions\\chunks\\cse\\chunk-cse-cls-01.json",
      count: 14,
      createdAt: "2026-11-09T16:42:00.000Z",
      uids: Object.keys(CHUNK_CSE_CLS_01_SOLUTIONS),
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Updated manifest.json: CHUNK-CSE-CLS-01 registered and marked COMPLETED.`);
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  execSync("node scripts/pipeline/patch-authentic-solutions.mjs", { stdio: "inherit" });
  console.log("CHUNK-CSE-CLS-01 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-cls-01")) {
  applyChunkCls01();
}

