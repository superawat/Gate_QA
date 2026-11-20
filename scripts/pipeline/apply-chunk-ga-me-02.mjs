import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const CHUNK_GA_ME_02_SOLUTIONS = {
  "me:2017:ga:q3-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Number Systems & Parity of Integers)",
    markdown: `### 1. Conceptual Framework & Parity Rules
For any two integers $a, b \\in \\mathbb{Z}$, the difference $a - b$ is an even integer if and only if $a$ and $b$ possess the identical parity (that is, both $a$ and $b$ are even, or both $a$ and $b$ are odd):
$$a - b = 2k \\iff a \\equiv b \\pmod{2}$$

We evaluate the algebraic expression in each option under both possible parity assignments:
* **Parity Product Rule**:
  $$\\text{even} \\times \\text{even} = \\text{even}$$
  $$\\text{odd} \\times \\text{odd} = \\text{odd}$$
  $$\\text{even} \\times \\text{odd} = \\text{even}$$
* **Parity Sum/Difference Rule**:
  $$\\text{even} \\pm \\text{even} = \\text{even}$$
  $$\\text{odd} \\pm \\text{odd} = \\text{even}$$
  $$\\text{even} \\pm \\text{odd} = \\text{odd}$$

---

### 2. Rigorous Algebraic Analysis of Options

Let us analyze the algebraic behavior of each option:

1. **Option A: $a^2 + b^2 + 1$**
   - **Case 1 (Both Even)**: Let $a = 2m, b = 2n$.
     $$a^2 + b^2 + 1 = 4m^2 + 4n^2 + 1 = 2(2m^2 + 2n^2) + 1 = \\text{odd}$$
   - **Case 2 (Both Odd)**: Let $a = 2m + 1, b = 2n + 1$.
     $$a^2 + b^2 + 1 = (\\text{odd}) + (\\text{odd}) + 1 = \\text{even} + 1 = \\text{odd}$$
   - In both cases, $a^2 + b^2 + 1$ is strictly odd.

2. **Option B: $a^2 + b + 1$**
   - **Case 1 (Both Even)**:
     $$a^2 + b + 1 = (2m)^2 + 2n + 1 = 4m^2 + 2n + 1 = 2(2m^2 + n) + 1 = \\text{odd}$$
   - **Case 2 (Both Odd)**:
     $$a^2 + b + 1 = (\\text{odd}) + (\\text{odd}) + 1 = \\text{even} + 1 = \\text{odd}$$
   - In both cases, $a^2 + b + 1$ is strictly odd.

3. **Option C: $ab - b$**
   We factor the expression directly:
   $$ab - b = b(a - 1)$$
   - **Case 1 (Both $a, b$ are Even)**:
     Since $b$ is an even integer ($b = 2n$), the product $b(a - 1) = 2n(a - 1)$ has a factor of 2, so $ab - b$ is **even**.
   - **Case 2 (Both $a, b$ are Odd)**:
     Since $a$ is an odd integer ($a = 2m + 1$), the term $a - 1$ becomes:
     $$a - 1 = (2m + 1) - 1 = 2m \\quad (\\text{which is even})$$
     Therefore:
     $$b(a - 1) = (2n + 1)(2m) = 2m(2n + 1) = \\text{even}$$
   - In every possible case, $ab - b$ is an integer multiple of 2, and hence **must always be even**.

4. **Option D: $ab$**
   - If both $a$ and $b$ are odd (e.g., $a = 3, b = 1 \\implies a - b = 2$, which is even):
     $$ab = 3 \\times 1 = 3 \\quad (\\text{odd})$$
   - Thus, $ab$ is not necessarily even.

---

### 3. Alternative Verification via Specific Values
Let $a = 3, b = 1$ (both odd, $a - b = 2$ is even):
* $a^2 + b^2 + 1 = 9 + 1 + 1 = 11$ (odd)
* $a^2 + b + 1 = 9 + 1 + 1 = 11$ (odd)
* $ab - b = 3(1) - 1 = 2$ (**even**)
* $ab = 3(1) = 3$ (odd)

Let $a = 4, b = 2$ (both even, $a - b = 2$ is even):
* $a^2 + b^2 + 1 = 16 + 4 + 1 = 21$ (odd)
* $a^2 + b + 1 = 16 + 2 + 1 = 19$ (odd)
* $ab - b = 8 - 2 = 6$ (**even**)
* $ab = 8$ (even)

Only $ab - b$ evaluates to an even integer under all valid assignments.

---

### 4. Conclusion & Final Takeaway
The algebraic factoring $ab - b = b(a - 1)$ guarantees that when $b$ is even, $b$ provides the factor of 2; and when $b$ is odd, the equal parity condition forces $a$ to be odd, making $(a - 1)$ even and providing the factor of 2.

Therefore, the correct answer is **Option C ($ab-b$)**.`,
    images: []
  },

  "me:2017:ga:q4-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Conditional Probability & Independence)",
    markdown: `### 1. Conceptual Framework & Sample Space Formulation
Let the two children in the family be ordered chronologically by birth:
$$(C_1, C_2) = (\\text{Older Child}, \\text{Younger Child})$$

Assuming that the sex of any child is equally likely to be a Boy ($B$) or a Girl ($G$) with probability $\\frac{1}{2}$, and that successive births are mutually independent events, the unconditioned sample space $S$ consists of 4 equally likely outcomes:
$$S = \\{ (B, B), (B, G), (G, B), (G, G) \\}, \\quad P(\\omega) = \\frac{1}{4} \\quad \\forall \\omega \\in S$$

---

### 2. Definition of Given Condition and Target Event

* **Condition Event $A$**: "The older child is a boy."
  Here, $C_1 = B$. The subset of outcomes satisfying event $A$ is:
  $$A = \\{ (B, B), (B, G) \\}$$
  The number of favorable outcomes for $A$ is $|A| = 2$, and its prior probability is:
  $$P(A) = \\frac{2}{4} = \\frac{1}{2}$$

* **Target Event $E$**: "Both children are boys."
  Both $C_1 = B$ and $C_2 = B$:
  $$E = \\{ (B, B) \\}$$

Notice that $E \\subseteq A$, which implies:
$$E \\cap A = \\{ (B, B) \\}, \\quad P(E \\cap A) = \\frac{1}{4}$$

---

### 3. Conditional Probability Calculation
By Kolmogorov's definition of conditional probability:
$$P(E \\mid A) = \\frac{P(E \\cap A)}{P(A)} = \\frac{1/4}{2/4} = \\frac{1}{2}$$

---

### 4. Critical Distinction: The Boy-or-Girl Problem (Well-Known Fallacy)
It is crucial to distinguish this question from the classic conditional probability ambiguity where the condition is *"at least one child is a boy"*:
* **If the condition were "at least one child is a boy"**:
  $$A_{\\text{at least one}} = \\{ (B, B), (B, G), (G, B) \\} \\implies P(E \\mid A_{\\text{at least one}}) = \\frac{1}{3}$$
* **In this problem**:
  The older child is explicitly identified as a boy ($C_1 = B$). Because the sex of the second child ($C_2$) is completely independent of the first child:
  $$P(C_2 = B \\mid C_1 = B) = P(C_2 = B) = \\frac{1}{2}$$

---

### 5. Option Breakdown & Final Takeaway
* Option A (1/4): Incorrect; this is the unconditioned prior probability $P(B, B)$.
* Option B (1/3): Incorrect; this would be the answer only if the condition had been "at least one child is a boy" without specifying which child.
* Option C (1/2): **Correct**; since the older child is fixed as a boy, the probability that the younger child is also a boy is $\\frac{1}{2}$.
* Option D (1): Incorrect; deterministic outcome.

Therefore, the correct answer is **Option C (1/2)**.`,
    images: []
  },

  "me:2017:ga:q5-s2": {
    concept: "General Aptitude - Analytical Aptitude (Deductive Logic & Law of Excluded Middle)",
    markdown: `### 1. Problem Formulation & Given Relations
We are given three individuals, $P, Q, R$, with the following two directed looking actions:
1. $P$ looks at $Q$ ($P \\to Q$)
2. $Q$ looks at $R$ ($Q \\to R$)

The marital statuses of the endpoints are:
* $P$ is **married** (True).
* $R$ is **unmarried** (False).
* $Q$'s marital status is **unspecified** in the premise.

We are asked to determine the exact number of pairs $(X, Y)$ such that $X$ looks at $Y$, $X$ is married, and $Y$ is unmarried.

---

### 2. Case Analysis via the Law of the Excluded Middle
In classical bivalent logic, any individual's marital status is binary: $Q$ is either married or not married. We evaluate both mutually exclusive and exhaustive cases:

#### Case 1: $Q$ is married
* **Pair 1 ($P \\to Q$)**: $P$ is married, $Q$ is married.
  Does a married person look at an unmarried person? **No** (both are married).
* **Pair 2 ($Q \\to R$)**: $Q$ is married, $R$ is unmarried.
  Does a married person look at an unmarried person? **Yes** ($Q$ is married, $R$ is unmarried).
* **Total qualifying pairs in Case 1**: **1 pair** ($Q \\to R$).

#### Case 2: $Q$ is unmarried (not married)
* **Pair 1 ($P \\to Q$)**: $P$ is married, $Q$ is unmarried.
  Does a married person look at an unmarried person? **Yes** ($P$ is married, $Q$ is unmarried).
* **Pair 2 ($Q \\to R$)**: $Q$ is unmarried, $R$ is unmarried.
  Does a married person look at an unmarried person? **No** (neither is married).
* **Total qualifying pairs in Case 2**: **1 pair** ($P \\to Q$).

---

### 3. Conclusion & Invariance
Because the number of qualifying pairs equals exactly **1** in both Case 1 and Case 2, the answer is completely invariant with respect to $Q$'s marital status. Even though $Q$'s marital status cannot be determined, the number of pairs **can** be uniquely determined.

---

### 4. Option Analysis & Final Takeaway
* Option A (0): Incorrect; at least one pair always satisfies the condition.
* Option B (1): **Correct**; in all logical states of the system, exactly 1 married-looking-at-unmarried pair exists.
* Option C (2): Incorrect; both pairs cannot qualify simultaneously since that would require $Q$ to be simultaneously married and unmarried.
* Option D (Cannot be determined): Incorrect; this is a common cognitive trap. While $Q$'s status is indeterminate, the target count is invariant.

Therefore, the correct answer is **Option B (1)**.`,
    images: []
  },

  "me:2017:ga:q6-s2": {
    concept: "General Aptitude - Verbal Aptitude (Contextual Vocabulary & Semantic Equivalence)",
    markdown: `### 1. Passage Context & Etymological Definition
The excerpt states:
> *"If you are looking for a history of India, or for an account of the rise and fall of the British Raj, or for the reason of the **cleaving** of the subcontinent into two mutually antagonistic parts and the effects this mutilation will have in the respective sections... you will not find it in these pages..."*

The noun/gerund **cleaving** is derived from the verb *to cleave* (Old English *clēofan*), which means:
* To split or sever something forcefully, especially along a natural line, division, or boundary.
* To divide or separate into distinct parts.

In the historical context of the text, "cleaving of the subcontinent into two mutually antagonistic parts" directly refers to the **Partition of India in 1947**, which fractured and divided the subcontinent into India and Pakistan. The author immediately reinforces this meaning with the parallel term *"this mutilation"*, describing physical tearing apart or dismemberment.

---

### 2. Contextual Synonym Analysis
Let us examine each option in relation to the context:
1. **deteriorating**: Means becoming progressively worse in condition or quality. While the political situation deteriorated, "cleaving into two parts" specifies a physical/political partition into pieces, not merely decline.
2. **arguing**: Means verbal disputation or disagreement. A landmass cannot "argue into two parts".
3. **departing**: Means leaving, going away, or deviating. It does not mean dividing a whole entity into separate geographical segments.
4. **splitting**: Means dividing or separating something into two or more parts, factions, or pieces. "Splitting of the subcontinent into two mutually antagonistic parts" is a direct, precise semantic equivalent to "cleaving".

---

### 3. Final Conclusion
Among the given choices, **splitting** is the closest and most accurate synonym for **cleaving**.

Therefore, the correct answer is **Option D (splitting)**.`,
    images: []
  },

  "me:2017:ga:q7-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Time, Work & Linear Rate Systems)",
    markdown: `### 1. Definition of Variables & Work-Rate Formulation
Let the total work of ploughing the field be $W = 1$ unit.
Define:
* $b$ = Work done by $1$ bullock in $1$ day (work rate of one bullock).
* $t$ = Work done by $1$ tractor in $1$ day (work rate of one tractor).

Then:
* Daily work done by $X$ bullocks: $u = X \\cdot b$
* Daily work done by $Y$ tractors: $v = Y \\cdot t$

---

### 2. Setting Up the System of Linear Equations

From the first given condition:
"$X$ bullocks and $Y$ tractors take 8 days to plough a field."
$$8(X b + Y t) = 1 \\implies u + v = \\frac{1}{8} \\quad \\text{--- (Equation 1)}$$

From the second given condition:
"If we halve the number of bullocks ($\\frac{X}{2}$) and double the number of tractors ($2Y$), it takes 5 days to plough the same field."
$$5\\left(\\frac{X}{2} b + 2Y t\\right) = 1 \\implies \\frac{u}{2} + 2v = \\frac{1}{5} \\quad \\text{--- (Equation 2)}$$

---

### 3. Solving for $u$ (Daily Work of $X$ Bullocks)
We eliminate $v$ by multiplying Equation 1 by 2:
$$2(u + v) = 2\\left(\\frac{1}{8}\\right) \\implies 2u + 2v = \\frac{1}{4} \\quad \\text{--- (Equation 3)}$$

Subtract Equation 2 from Equation 3:
$$(2u + 2v) - \\left(\\frac{u}{2} + 2v\\right) = \\frac{1}{4} - \\frac{1}{5}$$
$$\\left(2 - \\frac{1}{2}\\right)u = \\frac{5 - 4}{20}$$
$$\\frac{3}{2}u = \\frac{1}{20}$$
$$u = \\frac{1}{20} \\times \\frac{2}{3} = \\frac{2}{60} = \\frac{1}{30}$$

---

### 4. Determining Time Required for $X$ Bullocks Alone
The daily work rate of $X$ bullocks alone is $u = X b = \\frac{1}{30}$ of the field per day.
Thus, the total number of days $D$ required for $X$ bullocks alone to complete 1 full unit of work is:
$$D = \\frac{W}{u} = \\frac{1}{1/30} = 30 \\text{ days}$$

---

### 5. Verification
* $u = \\frac{1}{30}$
* From Equation 1: $v = \\frac{1}{8} - \\frac{1}{30} = \\frac{15 - 4}{120} = \\frac{11}{120}$
* Check Equation 2:
  $$\\frac{u}{2} + 2v = \\frac{1}{60} + 2\\left(\\frac{11}{120}\\right) = \\frac{2}{120} + \\frac{22}{120} = \\frac{24}{120} = \\frac{1}{5}$$
  Since $\\frac{1}{5} \\times 5 = 1$, the solution is verified and exact.

Therefore, the correct answer is **Option A (30)**.`,
    images: []
  },

  "me:2017:ga:q8-s2": {
    concept: "General Aptitude - Combinatorics (Constrained Matchings & Principle of Inclusion-Exclusion)",
    markdown: `### 1. Problem Formulation & Set Specifications
We have:
* Set of 4 women: $\\mathcal{W} = \\{P, Q, R, S\\}$, with $|\\mathcal{W}| = 4$.
* Set of 5 men: $\\mathcal{M} = \\{V, W, X, Y, Z\\}$, with $|\\mathcal{M}| = 5$.

We need to form 4 disjoint heterosexual couples/pairs $(w, m)$ where each woman is paired with a distinct man. This is equivalent to:
1. Selecting a subset of 4 men from $\\mathcal{M}$ (1 man will be left unpaired).
2. Constructing a bijection (one-to-one matching) between the 4 women and the 4 chosen men.

Subject to two constraints:
* **Constraint 1**: Man $Y$ must necessarily be paired with someone (meaning $Y$ cannot be the leftover man).
* **Constraint 2**: Woman $P$ must NOT be paired with man $Z$ ($P \\neq Z$).

---

### 2. Analytical Counting Strategy
We use the subtraction principle (complementary counting):
$$\\text{Valid Pairings} = \\text{Total Pairings where } Y \\text{ is paired} - \\text{Pairings where } Y \\text{ is paired AND } P \\text{ is paired with } Z$$

---

### 3. Step-by-Step Step Computation

#### Step 3.1: Total pairings where $Y$ is included
Since $Y$ must be selected, we must choose 3 additional men from the remaining 4 men $\\{V, W, X, Z\\}$:
$$\\text{Ways to choose remaining 3 men} = \\binom{4}{3} = 4$$

For any chosen set of 4 men (which includes $Y$), the number of ways to assign them to the 4 distinct women $\\{P, Q, R, S\\}$ is:
$$4! = 24$$

Therefore:
$$N_{\\text{total}} = \\binom{4}{3} \\times 4! = 4 \\times 24 = 96$$

#### Step 3.2: Pairings where $P$ is paired with $Z$ AND $Y$ is included
Now consider the prohibited configurations:
1. $P$ is paired with $Z$ (1 way).
2. Woman $P$ and man $Z$ are now fixed.
3. The remaining 3 women to be paired are $\\{Q, R, S\\}$.
4. The remaining men must include $Y$. Since we need 3 men for the 3 remaining women and $Y$ is mandatory, we must select 2 more men from the 3 remaining men $\\{V, W, X\\}$:
   $$\\text{Ways to choose 2 men from } \\{V, W, X\\} = \\binom{3}{2} = 3$$
5. For each choice of these 3 men (which includes $Y$), the number of ways to pair them with the 3 women $\\{Q, R, S\\}$ is:
   $$3! = 6$$

Therefore:
$$N_{\\text{prohibited}} = 1 \\times \\binom{3}{2} \\times 3! = 1 \\times 3 \\times 6 = 18$$

---

### 4. Total Number of Valid Pairings
$$N_{\\text{valid}} = N_{\\text{total}} - N_{\\text{prohibited}} = 96 - 18 = 78$$

---

### 5. Alternative Verification by Conditioning on $P$'s Partner
* **Case A: $P$ is paired with $Y$**
  - $P$ takes $Y$ (1 way).
  - Now 3 women $\\{Q, R, S\\}$ must be paired with 3 men chosen from $\\{V, W, X, Z\\}$ (4 available men).
  - Ways $= \\binom{4}{3} \\times 3! = 4 \\times 6 = 24$.
* **Case B: $P$ is paired with someone other than $Y$ or $Z$**
  - $P$ must be paired with someone from $\\{V, W, X\\}$: 3 choices.
  - Suppose $P$ is paired with one of them (say $V$).
  - Now $Y$ MUST be among the men for the remaining 3 women $\\{Q, R, S\\}$.
  - The remaining pool of men consists of $Y$ plus 2 others chosen from the remaining 3 men $\\{W, X, Z\\}$: $\\binom{3}{2} = 3$ choices.
  - The 3 women can be paired with these 3 men in $3! = 6$ ways.
  - Subtotal for Case B $= 3 \\times 3 \\times 6 = 54$.

$$\\text{Total Valid Pairings} = 24 + 54 = 78$$
Both counting methods produce identically **78**.

Therefore, the correct answer is **Option C (78)**.`,
    images: []
  },

  "me:2017:ga:q9-s2": {
    concept: "General Aptitude - Logical Deduction (Knights and Knaves Island Puzzle)",
    markdown: `### 1. Conceptual Framework & Axiomatic Rules
On the island, every inhabitant belongs to one of two mutually exclusive classes:
* **Knight ($T$)**: Always speaks the absolute truth ($P \\iff \\text{Statement is True}$).
* **Knave ($F$)**: Always lies ($P \\iff \\text{Statement is False}$).

Let $P$ and $Q$ denote the propositions that person $P$ and person $Q$ are Knights, respectively:
* $P = 1$ if P is a Knight, and $P = 0$ if P is a Knave.
* $Q = 1$ if Q is a Knight, and $Q = 0$ if Q is a Knave.

---

### 2. Formalization of Statements

1. **P's Statement**: *"Both of us are Knights."*
   The truth-functional representation is:
   $$S_P \\equiv P \\land Q$$
   Since P's identity dictates the truth value of their statement:
   $$P \\iff (P \\land Q)$$

2. **Q's Statement**: *"None of us are Knaves."*
   "None of us are Knaves" means neither P nor Q is a Knave, which is logically equivalent to saying both P and Q are Knights:
   $$S_Q \\equiv (\\neg(\\text{P is Knave})) \\land (\\neg(\\text{Q is Knave})) \\equiv P \\land Q$$
   Since Q's identity dictates the truth value of their statement:
   $$Q \\iff (P \\land Q)$$

---

### 3. Truth Table Analysis Across All 4 Possibilities

We test all $2^2 = 4$ possible assignments of $(P, Q)$:

| Case | $P$ | $Q$ | Statement $(P \\land Q)$ | P's consistency: $P \\iff (P \\land Q)$ | Q's consistency: $Q \\iff (P \\land Q)$ | Valid State? |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Knight (T) | Knight (T) | **True** | $T \\iff T$ (Consistent) | $T \\iff T$ (Consistent) | **YES** |
| **2** | Knight (T) | Knave (F) | **False** | $T \\iff F$ (Contradiction!) | $F \\iff F$ (Consistent) | **NO** |
| **3** | Knave (F) | Knight (T) | **False** | $F \\iff F$ (Consistent) | $T \\iff F$ (Contradiction!) | **NO** |
| **4** | Knave (F) | Knave (F) | **False** | $F \\iff F$ (Consistent) | $F \\iff F$ (Consistent) | **YES** |

---

### 4. Interpretation of Results
* In **Case 1**: Both are Knights. Both speak truth by asserting that both are Knights. Everything is consistent.
* In **Case 4**: Both are Knaves. Both lie by falsely asserting that both are Knights. Everything is consistent.

Because there are **two distinct valid configurations** (either both are Knights, or both are Knaves), the given statements do not provide sufficient information to uniquely determine who is a Knight and who is a Knave.

---

### 5. Option Analysis & Final Takeaway
* Option A ("Both P and Q are knights"): Could be true, but cannot be inferred with certainty because Case 4 is equally valid.
* Option B ("P is a knight; Q is a Knave"): Logically impossible; generates an immediate contradiction.
* Option C ("Both P and Q are Knaves"): Could be true, but cannot be inferred with certainty because Case 1 is equally valid.
* Option D ("The identities of P, Q cannot be determined"): **Correct**; since both $(T, T)$ and $(F, F)$ satisfy all rules, the identities remain ambiguous.

Therefore, the correct answer is **Option D (The identities of P, Q cannot be determined.)**.`,
    images: []
  },

  "me:2017:ga:q10-s2": {
    concept: "General Aptitude - Data Interpretation (Line Graphs & Range Comparison)",
    markdown: `### 1. Problem Statement & Graph Overview
The line graph depicts the pollutant concentration (in ppm) measured on alternate days of a month for two distinct seasonal conditions:
* **Winter Month** (average temperature $10^\\circ\\text{C}$, plotted as solid circles/line).
* **Summer Month** (average temperature $30^\\circ\\text{C}$, plotted as open squares/line).

We are tasked with evaluating the logical validity of two assertions:
* **Statement i**: Over the given months, the difference between the maximum and the minimum pollutant concentrations is the same in both winter and summer.
* **Statement ii**: There are at least four days in the summer month such that the pollutant concentrations on those days are within $1\\text{ ppm}$ of the pollutant concentrations on the corresponding days in the winter month.

---

### 2. Evaluation of Statement i: Range Comparison
The range of concentration is defined as:
$$\\Delta C = C_{\\max} - C_{\\min}$$

From the graph values across the observation days:
* **Winter Month**:
  - The maximum concentration reaches a peak of approximately $C_{\\max, W} \\approx 10.5\\text{ ppm}$.
  - The minimum concentration drops to approximately $C_{\\min, W} \\approx 1.0\\text{ ppm}$.
  - Range in winter: $\\Delta C_W \\approx 10.5 - 1.0 = 9.5\\text{ ppm}$.
* **Summer Month**:
  - The peak concentration reaches approximately $C_{\\max, S} \\approx 8.0\\text{ ppm}$.
  - The minimum concentration is around $C_{\\min, S} \\approx 2.5\\text{ ppm}$.
  - Range in summer: $\\Delta C_S \\approx 8.0 - 2.5 = 5.5\\text{ ppm}$.

Since $\\Delta C_W \\neq \\Delta C_S$ ($9.5\\text{ ppm} \\neq 5.5\\text{ ppm}$), the difference between the maximum and minimum concentrations is **not the same**.
Thus, **Statement i is FALSE**.

---

### 3. Evaluation of Statement ii: Proximity of Daily Concentrations
Statement ii requires that on at least four corresponding measurement days:
$$|C_{\\text{summer}}(d) - C_{\\text{winter}}(d)| \\le 1\\text{ ppm}$$

Inspecting the data points on alternate days across the month:
* On multiple days (specifically around day 3, day 7, day 19, and day 27), the winter curve and summer curve intersect or come exceedingly close, with vertical separation noticeably smaller than 1 vertical unit ($1\\text{ ppm}$).
* Counting these instances confirms that there are at least 4 such days where the absolute difference is within $1\\text{ ppm}$.
Thus, **Statement ii is TRUE**.

---

### 4. Conclusion & Final Takeaway
* Statement i is False.
* Statement ii is True.
Hence, the correct assessment is "Only ii".

Therefore, the correct answer is **Option B (Only ii)**.`,
    images: ["/question-images/me/2017/me-2017-913435d65b.webp"]
  },

  "me:2016:ga:q1": {
    concept: "General Aptitude - Verbal Aptitude (Grammar: Superlative Degree & Partitive Number Agreement)",
    markdown: `### 1. Conceptual Framework & Grammatical Rules
The sentence requires the correct predicate noun phrase to complete the statement about Mount Everest:
$$\\text{Mount Everest is } \\underline{\\hspace{3cm}}$$

Two fundamental grammatical principles govern this construction:

1. **Definite Article with Superlatives**:
   A superlative adjective describes an entity that stands uniquely at the extreme of an attribute. Because Mount Everest is the unique highest peak on the globe, it requires the definite article **\"the\"**:
   $$\\text{\"the highest peak\"}$$
   Omission of the definite article (*\"highest peak\"*) is grammatically incomplete and incorrect in standard English prose.

2. **Agreement in Partitive \"One of...\" Constructions**:
   The partitive phrase *\"one of the [plural noun]\"* denotes a single item selected from a larger set:
   $$\\text{one of the } + \\text{plural noun} \\quad (\\text{e.g., \"one of the highest peak\\textbf{s}\"}) $$
   If the noun is singular (*\"one of the highest peak\"*), it violates plural number agreement.

---

### 2. Comprehensive Option Evaluation

* **Option A: \"the highest peak in the world\"**
  - Uses the obligatory definite article *\"the\"* before the superlative adjective *\"highest\"*.
  - Uses the correct singular noun *\"peak\"* directly modified by *\"the highest\"*.
  - Accurately conveys the geographical fact that Mount Everest is the single top peak.
  - **Grammatically and semantically flawless.**

* **Option B: \"highest peak in the world\"**
  - Lacks the required definite article *\"the\"*. Grammatically incorrect.

* **Option C: \"one of highest peak in the world\"**
  - Lacks the definite article *\"the\"* and uses singular *\"peak\"* instead of plural *\"peaks\"*. Grammatically doubly flawed.

* **Option D: \"one of the highest peak in the world\"**
  - Fails plural agreement after *\"one of the\"*; it must be *\"peaks\"*, not *\"peak\"*. Furthermore, Mount Everest is not merely \"one of\" the highest; it is uniquely *the* highest. Grammatically incorrect.

---

### 3. Conclusion & Final Takeaway
The only grammatically valid choice is **Option A**.

Therefore, the correct answer is **Option A (the highest peak in the world)**.`,
    images: []
  },

  "me:2016:ga:q2": {
    concept: "General Aptitude - Verbal Aptitude (Vocabulary & Homophone Distinction: Loose vs Lose vs Loss)",
    markdown: `### 1. Syntactic Context & Required Part of Speech
The sentence to complete is:
$$\\text{The policeman asked the victim of a theft, \"What did you } \\underline{\\hspace{2.5cm}} \\text{?\"}$$

Syntactic breakdown of the interrogative clause:
* **Interrogative pronoun**: *What* (direct object of the main verb)
* **Auxiliary verb**: *did* (past tense of do-support)
* **Subject**: *you*
* **Target blank**: Must be the **bare infinitive (base form)** of a transitive verb, because English syntax strictly requires the base form of the main verb following the auxiliary *did*:
  $$\\text{did} + \\text{subject} + \\mathbf{V}_{\\text{base}}$$

---

### 2. Semantic and Grammatical Analysis of the Choices

1. **loose** (Option A):
   - Primary usage: Adjective meaning not firmly fixed in place, not fitting tightly, or unfastened (e.g., *a loose screw*, *loose clothing*).
   - Verb usage: Means to untie, unleash, or set free (e.g., *to loose the hounds*).
   - In the context of a theft, the victim did not \"set free\" an object; thus *loose* is contextually and semantically invalid.

2. **lose** (Option B):
   - Pronunciation: /luːz/.
   - Part of speech: Transitive verb in base form.
   - Definition: To suffer the loss of, to be deprived of, or to cease to have or retain (especially through theft, accident, or misplacement).
   - In the context of a theft, asking *\"What did you lose?\"* is syntactically and semantically the exact appropriate question.

3. **loss** (Option C):
   - Part of speech: Noun (e.g., *the loss of property*).
   - Cannot function as the main verb after auxiliary *did*.

4. **louse** (Option D):
   - Part of speech: Singular noun referring to a parasitic insect of the order Phthiraptera (plural: *lice*).
   - Completely irrelevant and semantically absurd in this context.

---

### 3. Conclusion & Final Takeaway
The base verb required by the auxiliary construction $\\text{did} + \\text{you} + V_{\\text{base}}$ in the context of theft is **lose**.

Therefore, the correct answer is **Option B (lose)**.`,
    images: []
  },

  "me:2016:ga:q3": {
    concept: "General Aptitude - Verbal Aptitude (Concessive Coherence & Medical Vocabulary)",
    markdown: `### 1. Discourse Analysis & Sentence Structure
The sentence to be completed is:
$$\\text{\"Despite the new medicine's } \\underline{\\hspace{2.5cm}} \\text{ in treating diabetes, it is not } \\underline{\\hspace{2.5cm}} \\text{ widely.\"}$$

* **Concessive Marker (\"Despite\")**: The preposition *despite* introduces a subordinate noun phrase expressing an expectation, followed by an independent clause showing a contrasting or unexpected reality:
  $$\\text{Despite } [\\text{Positive Quality } X], \\quad [\\text{Unfavorable Outcome } Y]$$
* **First Blank**: Must be a positive medicinal virtue or therapeutic success in treating diabetes.
* **Second Blank**: Must be a standard clinical action that doctors perform with medications that, surprisingly, is *not* occurring widely.

---

### 2. Evaluation of Pair Options

1. **effectiveness --- prescribed** (Option A):
   - *Effectiveness* (noun): The capability of producing a desired therapeutic result or cure.
   - *Prescribed* (verb participle): Recommended and authorized by medical practitioners for use by patients.
   - Reading: *\"Despite the new medicine's effectiveness in treating diabetes, it is not prescribed widely.\"*
   - This perfectly captures the natural clinical paradox: although the drug works well, doctors are not prescribing it widely (perhaps due to cost, side effects, or lack of awareness). The concessive structure is flawlessly coherent.

2. **availability --- used** (Option B):
   - *Availability* denotes mere physical presence, not clinical performance. If a medicine is widely available, asserting that it is not used widely does not form the standard clinical contrast expected with *despite*.

3. **prescription --- available** (Option C):
   - *\"the medicine's prescription in treating diabetes\"* is unidiomatic and grammatically unnatural. Furthermore, medicines are prescribed, not \"a medicine's prescription\".

4. **acceptance --- proscribed** (Option D):
   - *Proscribed* means prohibited, condemned, or banned by law/authority (from Latin *proscribere*).
   - If it is *not proscribed widely*, that means it is *not banned*, which fails to form a negative contrast with *acceptance*.

---

### 3. Conclusion & Final Takeaway
The only word pair that satisfies both grammatical constraints and logical concessive meaning is **effectiveness --- prescribed**.

Therefore, the correct answer is **Option A (effectiveness --- prescribed)**.`,
    images: []
  },

  "me:2016:ga:q4": {
    concept: "General Aptitude - Quantitative Aptitude (Percentages & Hierarchical Set Partitioning)",
    markdown: `### 1. Problem Formulation & Given Data
We are given a collection of fruits with:
* Total number of fruits: $N = 5,692,000$
* Unripe percentage: $15\\%$
* Ripe percentage: $100\\% - 15\\% = 85\\%$

Sub-distribution by fruit type (apples vs. oranges):
* Among unripe fruits: $45\\%$ are apples.
* Among ripe fruits: $66\\%$ are oranges $\\implies 100\\% - 66\\% = 34\\%$ are apples.

We are required to determine the total number of apples ($A_{\\text{total}}$) in the pile.

---

### 2. Step-by-Step Mathematical Derivation

#### Step 2.1: Count of Unripe and Ripe Fruits
* **Unripe fruits ($N_{\\text{unripe}}$)**:
  $$N_{\\text{unripe}} = 0.15 \\times 5,692,000 = 853,800$$

* **Ripe fruits ($N_{\\text{ripe}}$)**:
  $$N_{\\text{ripe}} = 0.85 \\times 5,692,000 = 4,838,200$$

*(Sanity check: $853,800 + 4,838,200 = 5,692,000$.)*

#### Step 2.2: Count of Apples in Each Category
* **Unripe Apples ($A_{\\text{unripe}}$)**:
  $$A_{\\text{unripe}} = 45\\% \\text{ of } 853,800 = 0.45 \\times 853,800 = 384,210$$

* **Ripe Apples ($A_{\\text{ripe}}$)**:
  Since $66\\%$ of ripe fruits are oranges, the remaining $34\\%$ are apples:
  $$A_{\\text{ripe}} = 34\\% \\text{ of } 4,838,200 = 0.34 \\times 4,838,200 = 1,644,988$$

#### Step 2.3: Total Apples in the Pile
$$A_{\\text{total}} = A_{\\text{unripe}} + A_{\\text{ripe}} = 384,210 + 1,644,988 = 2,029,198$$

---

### 3. Alternative Unified Percentage Calculation
We can express $A_{\\text{total}}$ as an overall fraction of the total pile:
$$P(\\text{Apple}) = P(\\text{Unripe}) \\times P(\\text{Apple} \\mid \\text{Unripe}) + P(\\text{Ripe}) \\times P(\\text{Apple} \\mid \\text{Ripe})$$
$$P(\\text{Apple}) = (0.15 \\times 0.45) + (0.85 \\times 0.34)$$
$$P(\\text{Apple}) = 0.0675 + 0.2890 = 0.3565 = 35.65\\%$$

Now apply this percentage directly to the total population:
$$A_{\\text{total}} = 0.3565 \\times 5,692,000 = 2,029,198$$

Both methods yield the exact integer $2,029,198$.

---

### 4. Option Analysis & Final Takeaway
* Option A: $2,029,198$ (**Correct**)
* Option B: $2,467,482$ (Incorrect)
* Option C: $2,789,080$ (Incorrect)
* Option D: $3,577,422$ (Incorrect)

Therefore, the correct answer is **Option A (2029198)**.`,
    images: []
  },

  "me:2016:ga:q5": {
    concept: "General Aptitude - Quantitative Aptitude (1D Distance Intervals & Inequality Bounds)",
    markdown: `### 1. Problem Formulation & Coordinate System
Let my home be located at the origin of reference ($d = 0$).
The radial distances from my home to the houses of the respective individuals are given as:
* Ahmed's distance: $d(\\text{Ahmed}) = 5\\text{ km}$
* Susan's distance: $d(\\text{Susan}) = 7\\text{ km}$
* Michael's distance: $d(\\text{Michael}) = 10\\text{ km}$

We are given the relative distance relationship for Arun's house:
$$\\text{\"Arun is farther away than Ahmed but closer than Susan from where I live.\"}$$

---

### 2. Establishing the Strict Distance Inequality
Translating the given verbal statement into an algebraic double inequality:
$$d(\\text{Ahmed}) < d(\\text{Arun}) < d(\\text{Susan})$$

Substituting the numerical distances:
$$5\\text{ km} < d(\\text{Arun}) < 7\\text{ km}$$

Thus, any possible distance $d$ between my home and Arun's place must lie strictly inside the open interval:
$$d(\\text{Arun}) \\in (5, 7)$$

---

### 3. Option Evaluation Against the Admissible Interval
* **Option A ($3\\text{ km}$)**:
  $3 < 5$, which violates $d(\\text{Arun}) > 5$. Arun would be closer than Ahmed.
* **Option B ($4.99\\text{ km}$)**:
  $4.99 < 5$, which also violates the lower bound.
* **Option C ($6.02\\text{ km}$)**:
  $$5 < 6.02 < 7$$
  This value lies strictly inside the admissible open interval $(5, 7)$. Hence, $6.02\\text{ km}$ is a valid possible distance.
* **Option D ($7.01\\text{ km}$)**:
  $7.01 > 7$, which violates $d(\\text{Arun}) < 7$. Arun would be farther than Susan.

---

### 4. Conclusion & Final Takeaway
Only $6.02\\text{ km}$ satisfies the bounding inequality $5 < d < 7$.

Therefore, the correct answer is **Option C (6.02)**.`,
    images: []
  },

  "me:2016:ga:q6": {
    concept: "General Aptitude - Quantitative Aptitude (Conditional Probability & Joint Event Probability)",
    markdown: `### 1. Event Formalization & Given Probabilities
Let the random experiment be a person moving through a tuberculosis (TB) prone zone.
Define the events:
* $I$: Event that the person becomes infected with TB.
* $D$: Event that an infected person develops the disease (shows symptoms).
* $D^c$: Event that an infected person does *not* develop the disease (remains asymptomatic / does not show symptoms).

From the problem statement:
* Prior probability of infection:
  $$P(I) = 50\\% = 0.50$$
* Conditional probability of developing the disease given infection:
  $$P(D \\mid I) = 30\\% = 0.30$$

---

### 2. Mathematical Derivation of the Joint Probability
We are asked to find:
$$\\text{\"What percentage of people moving through the zone remains infected but does not show symptoms of disease?\"}$$

This corresponds to the joint probability of being infected AND being symptom-free:
$$P(I \\cap D^c)$$

By the law of complement in conditional probability:
$$P(D^c \\mid I) = 1 - P(D \\mid I) = 1 - 0.30 = 0.70 \\quad (70\\%)$$

By the multiplication rule of probability:
$$P(I \\cap D^c) = P(I) \\times P(D^c \\mid I)$$
$$P(I \\cap D^c) = 0.50 \\times 0.70 = 0.35$$

Converting to percentage:
$$\\text{Percentage} = 0.35 \\times 100\\% = 35\\%$$

---

### 3. Tree Diagram / Frequential Interpretation
Consider a sample population of 100 people moving through the zone:
1. $50\\%$ become infected $\\implies 50$ infected individuals, $50$ uninfected.
2. Among the $50$ infected individuals:
   - $30\\%$ develop symptoms: $0.30 \\times 50 = 15$ people.
   - $70\\%$ do not show symptoms: $0.70 \\times 50 = 35$ people.
3. Therefore, out of the initial 100 people, exactly $35$ people ($35\\%$) are infected and symptom-free.

---

### 4. Option Analysis & Final Takeaway
* Option A ($15\\%$): This is the percentage that becomes infected *and* develops the disease ($0.50 \\times 0.30 = 0.15$).
* Option B ($33\\%$): Incorrect calculation.
* Option C ($35\\%$): **Correct**; $0.50 \\times 0.70 = 0.35$.
* Option D ($37\\%$): Incorrect calculation.

Therefore, the correct answer is **Option C (35)**.`,
    images: []
  },

  "me:2016:ga:q7": {
    concept: "General Aptitude - Verbal Aptitude (Critical Reasoning & Logical Textual Inferences)",
    markdown: `### 1. Textual Analysis & Premise Decomposition
The passage presents the following statements:
1. *"In a world filled with uncertainty, he was glad to have many good friends."*
2. *"He had always assisted them in times of need and was confident that they would reciprocate."*
3. *"However, the events of the last week proved him wrong."*

Let us deconstruct the logical content of each premise:
* **Premise 2**: He always helped his friends when they were in need, and held the firm subjective conviction (*\"was confident\"*) that they would reciprocate (help him when he was in need).
* **Premise 3**: The adversity or events of last week contradicted his belief (*\"proved him wrong\"*). Proving him wrong about their reciprocation means that when an opportunity arose last week for his friends to assist him, they did **not** assist him.

---

### 2. Systematic Evaluation of Candidate Inferences

* **Statement (i): \"His friends were always asking him to help them.\"**
  - **Invalid**: The passage states he assisted them in times of need, but gives no indication that they were *\"always asking\"* him. This is an unjustified, extreme extrapolation.

* **Statement (ii): \"He felt that when in need of help, his friends would let him down.\"**
  - **Invalid**: The text explicitly states the exact opposite: he *\"was confident that they would reciprocate\"*. He did not anticipate being let down prior to last week's events.

* **Statement (iii): \"He was sure that his friends would help him when in need.\"**
  - **Logically Valid**: Direct paraphrase of *\"was confident that they would reciprocate\"* (reciprocate = provide reciprocal help).

* **Statement (iv): \"His friends did not help him last week.\"**
  - **Logically Valid**: The phrase *\"the events of the last week proved him wrong\"* directly entails that his expectation of reciprocal help was shattered because his friends failed to help him when the need arose last week.

---

### 3. Conclusion & Option Matching
Statements **(iii)** and **(iv)** are both logically valid and directly supported by the text.

Therefore, the correct answer is **Option B ((iii) and (iv))**.`,
    images: []
  },

  "me:2016:ga:q8": {
    concept: "General Aptitude - Analytical Aptitude (Transitive Order Relations & Deductive Logic)",
    markdown: `### 1. Formalization of Given Facts
We are provided with information regarding three cousins: Leela ($L$), Pavithra ($P$), and Shiva ($S$).

#### Information Set 1: Age Relationships
1. *"Leela is older than her cousin Pavithra."*
   $$L > P$$
2. *"Pavithra's brother Shiva is older than Leela."*
   $$S > L$$

#### Information Set 2: Chess Playing
* All three like to play chess.
* Pavithra wins more often than Leela does.

---

### 2. Deductive Analysis of Age Order
By the transitive property of strict linear orders on the set of real numbers:
$$\\text{If } S > L \\quad \\text{and} \\quad L > P, \\quad \\text{then } S > L > P$$

This establishes a unique, complete, and unambiguous descending age hierarchy:
1. **Shiva ($S$)**: Strictly the oldest of the three.
2. **Leela ($L$)**: Strictly in the middle.
3. **Pavithra ($P$)**: Strictly the youngest of the three.

Hence, the proposition **\"Pavithra is the youngest of the three\"** is necessarily and unconditionally **TRUE**.

---

### 3. Critical Analysis of Chess Assertions
* The text states only that Pavithra wins more often than Leela.
* No data is provided regarding Shiva's chess game outcomes, win/loss percentages, or comparative skill against Leela or Pavithra.
* Therefore, claims such as *\"When Shiva plays chess... he often loses\"* (Option A) or *\"Shiva is a better chess player than Pavithra\"* (Option C) cannot be deduced and may be entirely false.

---

### 4. Option Analysis & Final Takeaway
* Option A: Indeterminate based on the passage.
* Option B (\"Leela is the oldest of the three\"): False; Shiva is older than Leela ($S > L$).
* Option C: Indeterminate based on the passage.
* Option D (\"Pavithra is the youngest of the three\"): **Must be TRUE** ($S > L > P$).

Therefore, the correct answer is **Option D (Pavithra is the youngest of the three.)**.`,
    images: []
  },

  "me:2016:ga:q9": {
    concept: "General Aptitude - Quantitative Aptitude (Laws of Indices & Exponential Substitution)",
    markdown: `### 1. Problem Formulation & Given Relations
We are given three exponential relations involving positive real variables $q, r, s$ and non-zero exponents $a, b, c$:
1. $$q^{-a} = \\frac{1}{r}$$
2. $$r^{-b} = \\frac{1}{s}$$
3. $$s^{-c} = \\frac{1}{q}$$

We are required to determine the numerical value of the product of the exponents:
$$abc = ?$$

---

### 2. Algebraic Manipulation using Laws of Indices
Recall the negative exponent identity:
$$x^{-k} = \\frac{1}{x^k}$$

Applying this identity to each of the three given equations:
1. $$\\frac{1}{q^a} = \\frac{1}{r} \\implies q^a = r \\quad \\text{--- (Equation 1)}$$
2. $$\\frac{1}{r^b} = \\frac{1}{s} \\implies r^b = s \\quad \\text{--- (Equation 2)}$$
3. $$\\frac{1}{s^c} = \\frac{1}{q} \\implies s^c = q \\quad \\text{--- (Equation 3)}$$

---

### 3. Successive Cyclic Substitution
Substitute Equation 2 into Equation 3:
$$q = s^c = (r^b)^c = r^{bc}$$

Now substitute Equation 1 ($r = q^a$) into this expression:
$$q = (q^a)^{bc} = q^{a \\cdot b \\cdot c} = q^{abc}$$

Equating the powers of base $q$ (for $q > 0, q \\neq 1$):
$$q^1 = q^{abc} \\implies abc = 1$$

---

### 4. Alternative Method via Logarithms
Taking the natural logarithm (or log to any consistent base) of both sides of Equations 1, 2, and 3:
$$\\ln(q^a) = \\ln(r) \\implies a \\ln(q) = \\ln(r) \\implies a = \\frac{\\ln(r)}{\\ln(q)}$$
$$\\ln(r^b) = \\ln(s) \\implies b \\ln(r) = \\ln(s) \\implies b = \\frac{\\ln(s)}{\\ln(r)}$$
$$\\ln(s^c) = \\ln(q) \\implies c \\ln(s) = \\ln(q) \\implies c = \\frac{\\ln(q)}{\\ln(s)}$$

Multiplying the three expressions together:
$$abc = \\left(\\frac{\\ln(r)}{\\ln(q)}\\right) \\times \\left(\\frac{\\ln(s)}{\\ln(r)}\\right) \\times \\left(\\frac{\\ln(q)}{\\ln(s)}\\right)$$
All logarithmic terms cancel out pairwise:
$$abc = \\frac{\\ln(r) \\cdot \\ln(s) \\cdot \\ln(q)}{\\ln(q) \\cdot \\ln(r) \\cdot \\ln(s)} = 1$$

---

### 5. Conclusion & Final Takeaway
Both index substitution and logarithmic expansion conclusively establish that $abc = 1$.

Therefore, the correct answer is **Option C (1)**.`,
    images: []
  },

  "me:2016:ga:q10": {
    concept: "General Aptitude - Quantitative Aptitude (Time and Work: Multi-Agent Work Rates)",
    markdown: `### 1. Problem Formulation & Base Work Capacities
Let the total project task be normalized to $W = 1$ unit of work.

#### Work Rate of Q:
* $Q$ can finish the task working alone in:
  $$T_Q = 25 \\text{ days} \\times 12 \\text{ hours/day} = 300 \\text{ hours}$$
* Therefore, the hourly work rate of $Q$ is:
  $$r_Q = \\frac{1}{300} \\text{ task/hour}$$

#### Work Rate of R:
* $R$ can finish the task working alone in:
  $$T_R = 50 \\text{ days} \\times 12 \\text{ hours/day} = 600 \\text{ hours}$$
* Therefore, the hourly work rate of $R$ is:
  $$r_R = \\frac{1}{600} \\text{ task/hour}$$

---

### 2. Computing Work Done by Q and R after 7 Days

#### Work Done by Q ($W_Q$):
* Time elapsed: $7$ days from the start.
* $Q$ took sick leave for the first $2$ days, so $Q$ only worked for:
  $$d_Q = 7 - 2 = 5 \\text{ days}$$
* $Q$ worked $12$ hours per day:
  $$H_Q = 5 \\text{ days} \\times 12 \\text{ hours/day} = 60 \\text{ hours}$$
* Work completed by $Q$:
  $$W_Q = H_Q \\times r_Q = 60 \\times \\frac{1}{300} = \\frac{60}{300} = \\frac{1}{5} = \\frac{20}{100}$$

#### Work Done by R ($W_R$):
* $R$ worked on all $7$ days without any leave:
  $$d_R = 7 \\text{ days}$$
* $R$ worked $18$ hours per day:
  $$H_R = 7 \\text{ days} \\times 18 \\text{ hours/day} = 126 \\text{ hours}$$
* Work completed by $R$:
  $$W_R = H_R \\times r_R = 126 \\times \\frac{1}{600} = \\frac{126}{600} = \\frac{21}{100}$$

---

### 3. Ratio of Work Done by Q to R
We compute the ratio of work done:
$$\\frac{W_Q}{W_R} = \\frac{20 / 100}{21 / 100} = \\frac{20}{21}$$

Thus, the ratio is:
$$W_Q : W_R = 20 : 21$$

---

### 4. Option Analysis & Final Takeaway
* Option A ($10:11$): Incorrect.
* Option B ($11:10$): Incorrect.
* Option C ($20:21$): **Correct**; matches $W_Q : W_R = \\frac{60/300}{126/600} = \\frac{1/5}{21/100} = \\frac{20}{21}$.
* Option D ($21:20$): Inverted ratio.

Therefore, the correct answer is **Option C (20:21)**.`,
    images: []
  },

  "me:2016:ga:q1-s2": {
    concept: "General Aptitude - Quantitative Aptitude & Verbal Usage (Geometric Mensuration & Comparative Forms)",
    markdown: `### 1. Mathematical Evaluation of Volumes
We compute and compare the volumes of the two geometric bodies:

1. **Volume of the Sphere ($V_{\\text{sphere}}$)**:
   Given diameter $d = 1\\text{ unit} \\implies \\text{radius } r = \\frac{d}{2} = 0.5\\text{ units}$.
   $$V_{\\text{sphere}} = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi \\left(\\frac{1}{2}\\right)^3 = \\frac{4}{3}\\pi \\left(\\frac{1}{8}\\right) = \\frac{\\pi}{6}\\text{ units}^3$$
   Using $\\pi \\approx 3.14159$:
   $$V_{\\text{sphere}} \\approx \\frac{3.14159}{6} \\approx 0.5236\\text{ units}^3$$

2. **Volume of the Cube ($V_{\\text{cube}}$)**:
   Given side length $s = 1\\text{ unit}$.
   $$V_{\\text{cube}} = s^3 = 1^3 = 1.0\\text{ units}^3$$

3. **Comparison**:
   $$V_{\\text{sphere}} (\\approx 0.5236) < V_{\\text{cube}} (1.0)$$
   Thus, the volume of the sphere is strictly smaller than the volume of the cube.

---

### 2. Grammatical Analysis of Comparative Adjectives
The sentence structure is:
$$\\text{\"The volume of a sphere... is } \\underline{\\hspace{2cm}} \\text{ than the volume of a cube...\"}$$

* **than**: Functions as a comparative conjunction that requires a preceding comparative-degree adjective.
* **less** (Option B): The standard comparative adjective for uncountables/magnitudes when directly followed by \"than\" (*\"is less than\"*).
* **least** (Option A): Superlative degree; used only when comparing three or more items with the definite article (*\"the least\"*).
* **lesser** (Option C): Attributive adjective used predominantly before nouns (e.g., *\"the lesser of two evils\"*, *\"to a lesser extent\"*). In modern English grammar, *lesser* is not used as a predicate adjective with *than* (*\"X is lesser than Y\"* is grammatically non-standard).
* **low** (Option D): Positive degree adjective; its comparative form is *lower*, not *low*.

---

### 3. Conclusion & Final Takeaway
Both the quantitative fact ($0.5236 < 1.0$) and syntactic rules dictate the comparative adjective **less**.

Therefore, the correct answer is **Option B (less)**.`,
    images: []
  },

  "me:2016:ga:q2-s2": {
    concept: "General Aptitude - Verbal Aptitude (Irregular Verb Conjugation & Passive Subjunctive: Hang)",
    markdown: `### 1. Syntactic Structure & The Subjunctive Mood
The sentence is:
$$\\text{\"The unruly crowd demanded that the accused be } \\underline{\\hspace{2.5cm}} \\text{ without trial.\"}$$

This sentence employs the mandative subjunctive construction (*\"demanded that [subject] be + past participle\"*). The blank requires the **past participle** of the verb *hang*.

---

### 2. Semantic Distinction: Hanged vs. Hung
In English lexicography and legal jurisprudence, the verb *to hang* has two completely distinct principal forms depending on its meaning:

1. **Capital Punishment / Execution (Suspension by the Neck)**:
   * Base form: *hang*
   * Past tense: **hanged**
   * Past participle: **hanged**
   * Usage: Refers exclusively to judicial execution or death by strangulation via a gallows or rope (e.g., *\"The convict was hanged at dawn\"*).

2. **Suspending Objects (Inanimate Items, Clothing, Pictures)**:
   * Base form: *hang*
   * Past tense: **hung**
   * Past participle: **hung**
   * Usage: Refers to suspending an object from above (e.g., *\"The portrait was hung on the wall\"*).

---

### 3. Application to the Context
* The sentence concerns an accused person facing capital punishment (*\"demanded that the accused be... without trial\"*).
* Therefore, the correct legal and grammatical past participle is strictly **hanged**.
* The other options:
  - *hanging* is a present participle/gerund.
  - *hankering* is a completely unrelated verb meaning longing or yearning.
  - *hung* is grammatically incorrect for human execution.

---

### 4. Conclusion & Final Takeaway
The only correct past participle for execution by hanging is **hanged**.

Therefore, the correct answer is **Option A (hanged)**.`,
    images: []
  },

  "me:2016:ga:q3-s2": {
    concept: "General Aptitude - Verbal Aptitude (Lexical Semantics & Word Usage: Prone vs Prune)",
    markdown: `### 1. Semantic Definition of \"Prone\"
The word **prone** (adjective) has two primary standard definitions in the English language:
1. **Physical Posture**: Lying flat with the chest downward and face pointing to the ground (opposite of *supine*, which means lying on the back).
2. **Tendency / Susceptibility**: Having a natural inclination, vulnerability, or predisposition toward something undesirable or adverse (e.g., *prone to error*, *prone to injury*).

---

### 2. Analysis of the Given Statements

* **Statement i: \"A prone is a dried plum.\"**
  - **INCORRECT**. A dried plum is known as a **prune** (from Old French *prune*, Latin *prunum*). Confusing *prone* with *prune* is a malapropism/phonetic confusion.

* **Statement ii: \"He was lying prone on the floor.\"**
  - **CORRECT**. Directly utilizes definition (1): lying face down, horizontally on the ground.

* **Statement iii: \"People who eat a lot of fat are prone to heart disease.\"**
  - **CORRECT**. Directly utilizes definition (2): being predisposed, vulnerable, or susceptible to a pathology or medical condition.

---

### 3. Conclusion & Option Matching
Statements **(ii)** and **(iii)** represent correct, standard English usage, whereas statement **(i)** is incorrect.

Therefore, the correct answer is **Option D ((ii) and (iii) only)**.`,
    images: []
  },

  "me:2016:ga:q4-s2": {
    concept: "General Aptitude - Logical Reasoning (Propositional Calculus & Material Implication)",
    markdown: `### 1. Propositional Formulation & Given Fact
Let the atomic propositions be:
* $P$: *\"It rains.\"* (Statement i)
* $\\neg P$: *\"It did not rain.\"* (Statement iv)
* $Q$: *\"The field is wet.\"* (Statement iii)
* $\\neg Q$: *\"The field is not wet.\"* (Statement ii)

The problem provides an immutable empirical/axiomatic **Fact**:
$$\\text{Fact: } P \\implies Q \\quad (\\text{\"If it rains, then the field is wet\"})$$

---

### 2. Truth Table Analysis of Material Implication
In classical logic, the implication $P \\implies Q$ is logically equivalent to $\\neg P \\lor Q$. Its truth table is:

| $P$ (It rains) | $Q$ (Field wet) | $P \\implies Q$ | Status under given Fact |
| :---: | :---: | :---: | :---: |
| **T** | **T** | **T** | Logically Possible |
| **T** | **F** | **F** | **LOGICALLY IMPOSSIBLE (Direct Contradiction)** |
| **F** | **T** | **T** | Logically Possible |
| **F** | **F** | **T** | Logically Possible |

Notice that the **ONLY** situation that is impossible when $P \\implies Q$ holds is the second row:
$$P \\land \\neg Q = \\text{True} \\implies \\text{Contradicts Fact}$$

---

### 3. Detailed Evaluation of the Options

1. **Option A: \"If (iii), then (iv)\" ($Q \\implies \\neg P$)**:
   - Meaning: *\"If the field is wet, then it did not rain.\"*
   - Is it logically possible? **Yes**. The field could be wet for reasons other than rain (e.g., irrigation sprinklers, flooding). When $P = F$ and $Q = T$, the given fact $P \\implies Q$ is completely satisfied ($F \\implies T$ is True). Thus, this scenario is logically possible.

2. **Option B: \"If (i), then (iii)\" ($P \\implies Q$)**:
   - Meaning: *\"If it rains, then the field is wet.\"*
   - This is the exact given fact itself! Hence, perfectly valid and possible.

3. **Option C: \"If (i), then (ii)\" ($P \\implies \\neg Q$)**:
   - Meaning: *\"If it rains, then the field is not wet.\"*
   - If it rains ($P = T$), the given fact mandates that the field must be wet ($Q = T$).
   - Asserting that raining implies the field is *not wet* ($P \\implies \\neg Q$) requires that whenever $P$ is true, $\\neg Q$ is true, creating the state $(P = T, Q = F)$.
   - But $(P = T, Q = F)$ directly falsifies the given fact $P \\implies Q$!
   - Therefore, this conditional statement is strictly **NOT logically possible**.

4. **Option D: \"If (ii), then (iv)\" ($\\neg Q \\implies \\neg P$)**:
   - This is the **contrapositive** of the given fact:
     $$P \\implies Q \\iff \\neg Q \\implies \\neg P$$
   - Since an implication and its contrapositive are logically equivalent, this is unconditionally true and valid.

---

### 4. Conclusion & Final Takeaway
The only scenario that contradicts the given premise is **If (i), then (ii)**.

Therefore, the correct answer is **Option C (If (i), then (ii).)**.`,
    images: []
  },

  "me:2016:ga:q5-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Composite Geometry: Area & Perimeter)",
    markdown: `### 1. Geometric Configuration & Boundary Breakdown
The window is composed of:
1. A bottom portion: A square of side length $s$.
2. A top portion: An equilateral triangle of side length $s$, whose base is contiguous with the top horizontal edge of the square.

---

### 2. Perimeter Analysis & Side Calculation
The perimeter of the composite window is the total length of its **external boundary**:
* The square contributes $3$ outer edges (left vertical side, right vertical side, and bottom horizontal side):
  $$\\text{Square outer boundary} = 3s$$
* The equilateral triangle contributes $2$ outer edges (left sloped edge and right sloped edge):
  $$\\text{Triangle outer boundary} = 2s$$
* Note: The common interface between the square and the triangle lies strictly inside the interior of the window and does **not** contribute to the perimeter.

Therefore, the total perimeter $P$ is:
$$P = 3s + 2s = 5s$$

We are given that $P = 6\\text{ m}$:
$$5s = 6 \\implies s = \\frac{6}{5} = 1.2\\text{ m}$$

---

### 3. Step-by-Step Area Calculation
The total area $A_{\\text{window}}$ of the window is the sum of the areas of the square and the equilateral triangle:
$$A_{\\text{window}} = A_{\\text{square}} + A_{\\text{triangle}}$$

1. **Area of the Square ($A_{\\text{square}}$)**:
   $$A_{\\text{square}} = s^2 = (1.2)^2 = 1.44\\text{ m}^2$$

2. **Area of the Equilateral Triangle ($A_{\\text{triangle}}$)**:
   $$A_{\\text{triangle}} = \\frac{\\sqrt{3}}{4} s^2 = \\frac{\\sqrt{3}}{4} (1.2)^2 = \\frac{\\sqrt{3}}{4} \\times 1.44 = 0.36\\sqrt{3}\\text{ m}^2$$
   Using the numerical value $\\sqrt{3} \\approx 1.73205$:
   $$A_{\\text{triangle}} \\approx 0.36 \\times 1.73205 \\approx 0.62354\\text{ m}^2$$

3. **Total Combined Area ($A_{\\text{window}}$)**:
   $$A_{\\text{window}} = 1.44 + 0.62354 = 2.06354\\text{ m}^2 \\approx 2.06\\text{ m}^2$$

---

### 4. Option Analysis & Final Takeaway
* Option A ($1.43\\text{ m}^2$): Corresponds to the square area alone rounded down, omitting the roof.
* Option B ($2.06\\text{ m}^2$): **Correct**; matches $1.44 + 0.6235 = 2.0635\\text{ m}^2$.
* Option C ($2.68\\text{ m}^2$): Arithmetic error in side computation.
* Option D ($2.88\\text{ m}^2$): Overcounting interior edge.

Therefore, the correct answer is **Option B (2.06)**.`,
    images: []
  },

  "me:2016:ga:q6-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Normal Distribution: Variance & Dispersion Comparison)",
    markdown: `### 1. Problem Formulation & Statistical Parameters
We are given two independent cohorts of students, $P$ and $Q$, with equal sample sizes ($N_P = N_Q$) evaluated out of 200 marks.
Their performances follow normal distributions:
* **Group P**:
  - Mean: $\\mu_P = 105$
  - Standard deviation: $\\sigma_P = 25$
  - Distribution: $X_P \\sim \\mathcal{N}(105, 25^2)$
* **Group Q**:
  - Mean: $\\mu_Q = 85$
  - Standard deviation: $\\sigma_Q = 5$
  - Distribution: $X_Q \\sim \\mathcal{N}(85, 5^2)$

---

### 2. Analysis of Dispersion (Spread of Marks)
The standard deviation $\\sigma$ is the primary measure of dispersion of a Gaussian distribution around its central tendency:
* For Group Q, $\\sigma_Q = 5$ is very small compared to Group P's $\\sigma_P = 25$ (a ratio of $1 : 5$).
* By the empirical 68--95--99.7 rule for normal distributions:
  - **For Group Q**:
    $$[\\mu_Q - 2\\sigma_Q, \\mu_Q + 2\\sigma_Q] = [85 - 10, 85 + 10] = [75, 95]$$
    Approximately **$95.45\\%$** of students in Group Q score within an interval of width **$20\\text{ marks}$**.
  - **For Group P**:
    $$[\\mu_P - 2\\sigma_P, \\mu_P + 2\\sigma_P] = [105 - 50, 105 + 50] = [55, 155]$$
    Approximately **$95.45\\%$** of students in Group P score within an interval of width **$100\\text{ marks}$**.

The interval containing \"most students\" ($\\approx 95\\%$) for Group Q is five times narrower ($20$ vs $100$) than that for Group P. Thus, the statement that *\"Most students of group Q scored marks in a narrower range than students in group P\"* has the highest probability of being true (approaching certainty).

---

### 3. Critical Flaws in the Other Options
* **Option A: \"No student in group Q scored less marks than any student in group P.\"**
  - False. For a normal distribution, values span $(-\\infty, \\infty)$ in theory. Furthermore, $\\mu_Q = 85$ is significantly lower than $\\mu_P = 105$, so many students in Q score lower than students in P.
* **Option B: \"No student in group P scored less marks than any student in group Q.\"**
  - False. In Group P, a score $2\\sigma$ below the mean is $55$, whereas in Group Q, a score $2\\sigma$ above the mean is $95$. Students in P can readily score below students in Q.
* **Option D: \"The median of the marks of group P is 100100.\"**
  - False. For any normal distribution, the distribution is symmetric about its mean, so $\\text{Median} = \\text{Mean} = 105$.

---

### 4. Conclusion & Final Takeaway
Because $\\sigma_Q = 5 \\ll \\sigma_P = 25$, the marks in Group Q are tightly clustered about $\\mu_Q$, ensuring that most students in Group Q lie in a vastly narrower score range than Group P.

Therefore, the correct answer is **Option C (Most students of group Q scored marks in a narrower range than students in group P.)**.`,
    images: []
  },

  "me:2016:ga:q7-s2": {
    concept: "General Aptitude - Verbal Aptitude (Reading Comprehension & Critical Logical Deduction)",
    markdown: `### 1. Textual Premise & Structure
The passage states:
> *\"A smart city integrates all modes of transport, uses clean energy and promotes sustainable use of resources. It also uses technology to ensure safety and security of the city, something which critics argue, will lead to a surveillance state.\"*

Let us isolate the factual premises asserted by the author:
1. **Fact 1**: A smart city integrates transport, uses clean energy, and promotes sustainability.
2. **Fact 2**: A smart city uses technology to ensure safety and security.
3. **Fact 3**: Critics argue that the use of safety technology will lead to a surveillance state.

---

### 2. Systematic Evaluation of Candidate Inferences

* **Statement i: \"All smart cities encourage the formation of surveillance states.\"**
  - **Cannot be inferred**. The passage mentions that smart cities use technology for safety and security. The creation of a surveillance state is a hazard pointed out by *critics*, not an objective that smart cities *encourage*.

* **Statement ii: \"Surveillance is an integral part of a smart city.\"**
  - **Cannot be inferred**. Transport integration, clean energy, and sustainability are described as integral aspects. Surveillance is not stated to be an integral component, but rather an adverse side-effect claimed by critics.

* **Statement iii: \"Sustainability and surveillance go hand in hand in a smart city.\"**
  - **Cannot be inferred**. No causal or correlated relationship is established in the text between sustainability and surveillance.

* **Statement iv: \"There is a perception that smart cities promote surveillance.\"**
  - **Logically Inferred**. The passage states explicitly that *\"critics argue, will lead to a surveillance state\"*. An argument advanced by critics constitutes a distinct public perception or viewpoint. Therefore, the existence of such a perception is directly supported and established by the text.

---

### 3. Conclusion & Option Matching
Only statement **(iv)** is a strictly valid deduction from the passage.

Therefore, the correct answer is **Option C ((iv) only)**.`,
    images: []
  }
};

export function applyChunkGaMe02() {
  console.log("Applying CHUNK-GA-ME-02 solutions...");

  // 1. Update chunk-ga-me-02.json
  const chunkFilePath = path.resolve("data/solutions/chunks/me/chunk-ga-me-02.json");
  if (fs.existsSync(chunkFilePath)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkFilePath, "utf8"));
    for (const q of chunkData.questions) {
      if (CHUNK_GA_ME_02_SOLUTIONS[q.uid]) {
        q.status = "ACCEPTED";
        q.solution = {
          concept: CHUNK_GA_ME_02_SOLUTIONS[q.uid].concept,
          markdown: CHUNK_GA_ME_02_SOLUTIONS[q.uid].markdown,
          images: CHUNK_GA_ME_02_SOLUTIONS[q.uid].images
        };
      }
    }
    chunkData.chunkStatus = "COMPLETED";
    chunkData.completedAt = new Date().toISOString();
    fs.writeFileSync(chunkFilePath, JSON.stringify(chunkData, null, 2), "utf8");
    console.log(`Updated ${chunkFilePath}: All 25 questions marked ACCEPTED.`);
  }

  // 2. Inject solutions into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");
  const targetMarker = "export function applyAuthenticPatches() {";

  const injectionEntries = Object.entries(CHUNK_GA_ME_02_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"me:2017:ga:q3-s2": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `\n  // CHUNK-GA-ME-02\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
      fs.writeFileSync(patchFile, updatedContent, "utf8");
      console.log(`Injected 25 patches into ${patchFile}.`);
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
    manifest.chunks["CHUNK-GA-ME-02"] = {
      chunkId: "CHUNK-GA-ME-02",
      branch: "me",
      year: "all",
      section: "ga",
      file: "data/solutions/chunks/me/chunk-ga-me-02.json",
      count: 25,
      createdAt: new Date().toISOString(),
      uids: Object.keys(CHUNK_GA_ME_02_SOLUTIONS),
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    };
    for (const uid of Object.keys(CHUNK_GA_ME_02_SOLUTIONS)) {
      manifest.assignedUids[uid] = "CHUNK-GA-ME-02";
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Updated manifest.json: CHUNK-GA-ME-02 registered and marked COMPLETED.`);
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  execSync("node scripts/pipeline/patch-authentic-solutions.mjs", { stdio: "inherit" });
  console.log("CHUNK-GA-ME-02 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-ga-me-02")) {
  applyChunkGaMe02();
}

