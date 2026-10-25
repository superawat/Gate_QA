import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_REC_06_TO_10_SOLUTIONS = {
  "go:359885": {
    concept: "Quantitative Aptitude - Set Theory & Principle of Inclusion-Exclusion",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Set Theory & Principle of Inclusion-Exclusion
- **Given Percentages**:
  - Percentage of employees drinking coffee: $P(C) = 35\\%$.
  - Percentage of employees drinking tea: $P(T) = 40\\%$.
  - Percentage of employees drinking both: $P(C \\cap T) = 10\\%$.
- **Step-by-Step Analytical Derivation**:
  1. **Union of Coffee or Tea Drinkers**:
     - By the Principle of Inclusion-Exclusion:
       $$P(C \\cup T) = P(C) + P(T) - P(C \\cap T)$$
       $$P(C \\cup T) = 35\\% + 40\\% - 10\\% = 65\\%$$
  2. **Employees Drinking Neither Coffee nor Tea**:
     - The complement percentage is:
       $$P(\\text{Neither}) = 100\\% - P(C \\cup T) = 100\\% - 65\\% = 35\\%$$

Therefore, the correct answer is **Option C ($35$)**.`,
    images: []
  },
  "go:359883": {
    concept: "Quantitative Aptitude - Operator Definition & Algebraic Identities",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Operator Definition & Algebraic Identities
- **Given Operators**:
  1. $p \\bigoplus q = \\dfrac{p^2 + q^2}{pq}$
  2. $p \\bigodot q = \\dfrac{p^2}{q}$
- **Equation to Solve**:
  $$x \\bigoplus y = 2 \\bigodot 2$$
- **Step-by-Step Analytical Derivation**:
  1. **Evaluate the Right-Hand Side**:
     $$2 \\bigodot 2 = \\frac{2^2}{2} = \\frac{4}{2} = 2$$
  2. **Evaluate the Left-Hand Side**:
     $$x \\bigoplus y = \\frac{x^2 + y^2}{xy}$$
  3. **Equate and Simplify**:
     $$\\frac{x^2 + y^2}{xy} = 2$$
     $$x^2 + y^2 = 2xy$$
     $$x^2 - 2xy + y^2 = 0$$
     $$(x - y)^2 = 0 \\implies x - y = 0 \\implies x = y$$

Therefore, the correct answer is **Option B ($y$)**.`,
    images: []
  },
  "go:359881": {
    concept: "Reasoning & Combinatorics - Restricted Linear Permutations",
    markdown: `- **Concept / Subtopic**: Reasoning & Combinatorics - Restricted Linear Permutations
- **Given Constraints for Seating $\\{P, Q, R, S\\}$ in a Row**:
  1. Four distinct individuals: $P, Q, R, S$.
  2. $P$ and $R$ cannot sit adjacent to each other.
  3. $S$ must sit strictly to the right of $Q$ ($Q < S$ in left-to-right order).
- **Step-by-Step Analytical Derivation**:
  1. **Total Linear Permutations**:
     - Without constraints, 4 persons can be arranged in $4! = 24$ ways.
  2. **Impose the Relative Order Constraint ($Q$ before $S$)**:
     - In exactly half of all permutations, $Q$ precedes $S$ ($S$ is to the right of $Q$):
       $$N(Q < S) = \\frac{24}{2} = 12\\text{ arrangements}$$
  3. **Subtract Cases Where $P$ and $R$ Sit Adjacent**:
     - Treat the adjacent pair $(PR)$ or $(RP)$ as a single composite block $\\mathbf{B}$.
     - The entities to arrange are now $\\{Q, S, \\mathbf{B}\\}$ (3 entities).
     - The number of arrangements of 3 entities where $Q$ precedes $S$ is:
       $$\\frac{3!}{2} = \\frac{6}{2} = 3\\text{ arrangements}$$
     - Since the block $\\mathbf{B}$ can be ordered internally as $(PR)$ or $(RP)$ ($2! = 2$ ways):
       $$N(Q < S \\text{ and } P, R \\text{ adjacent}) = 3 \\times 2 = 6\\text{ arrangements}$$
  4. **Calculate Valid Seating Configurations**:
     $$N_{\\text{valid}} = N(Q < S) - N(Q < S \\text{ with } P, R \\text{ adjacent}) = 12 - 6 = 6$$

Therefore, the correct answer is **Option C ($6$)**.`,
    images: []
  },
  "go:359879": {
    concept: "Mathematical Logic - Negation of Disjunction (De Morgan's Laws)",
    markdown: `- **Concept / Subtopic**: Mathematical Logic - Negation of Disjunction (De Morgan's Laws)
- **Given Proposition**:
  - Let $A$: *\"$P$ marries $Q$\"*
  - Let $B$: *\"$X$ marries $Y$\"*
  - The given statement *\"Either $P$ marries $Q$ or $X$ marries $Y$\"* is the inclusive disjunction:
    $$S = A \\lor B$$
- **Step-by-Step Analytical Derivation**:
  1. By De Morgan's Laws of propositional logic:
     $$\\neg(A \\lor B) \\equiv \\neg A \\land \\neg B$$
  2. Translating $\\neg A \\land \\neg B$ into natural English:
     - $\\neg A$: *\"$P$ does not marry $Q$\"*
     - $\\neg B$: *\"$X$ does not marry $Y$\"*
     - Conjunction $\\land$: *\"Neither $P$ marries $Q$ nor $X$ marries $Y$\"*
  3. This matches Option B identically.

Therefore, the correct answer is **Option B (Neither $P$ marries $Q$ nor $X$ marries $Y$)**.`,
    images: []
  },
  "go:359875": {
    concept: "Geometry - Regular Pentagram & Star Polygon Tip Angles",
    markdown: `- **Concept / Subtopic**: Geometry - Regular Pentagram & Star Polygon Tip Angles
- **Given Configuration**:
  - Five line segments of equal lengths $PR, PS, QS, QT, RT$ form a symmetrical five-pointed star (regular pentagram $\\{5/2\\}$).
  - All five tip vertices have identical acute angles $\\theta$.
- **Step-by-Step Analytical Derivation**:
  1. **Sum of Angles at the Points of a Five-Pointed Star**:
     - For any star polygon formed by extending the sides of an $n$-gon, the sum of the vertex angles at the $n$ tips is:
       $$\\sum_{i=1}^{n} \\theta_i = (n - 4) \\times 180^\\circ$$
  2. For $n = 5$:
     $$\\sum_{i=1}^{5} \\theta = (5 - 4) \\times 180^\\circ = 180^\\circ$$
  3. **Value of $\\theta$**:
     - By regularity and symmetry, all 5 tip angles are identical:
       $$5\\theta = 180^\\circ \\implies \\theta = \\frac{180^\\circ}{5} = 36^\\circ$$

Therefore, the correct answer is **Option A ($36$)**.`,
    images: []
  },
  "go:359873": {
    concept: "Quantitative Aptitude - Piecewise Function Evaluation & Sign Rules",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Piecewise Function Evaluation & Sign Rules
- **Given Piecewise Function**:
  $$\\lambda(p, q) = \\begin{cases} (p - q)^2, & \\text{if } p \\ge q \\\\ p + q, & \\text{if } p < q \\end{cases}$$
- **Expression to Evaluate**:
  $$E = \\frac{\\lambda\\left( -(-3 + 2), (-2 + 3) \\right)}{-\\left(-(-2 + 1)\\right)}$$
- **Step-by-Step Analytical Derivation**:
  1. **Evaluate the Arguments $p$ and $q$**:
     $$p = -(-3 + 2) = -(-1) = 1$$
     $$q = (-2 + 3) = 1$$
  2. **Evaluate $\\lambda(p, q) = \\lambda(1, 1)$**:
     - Since $p = 1$ and $q = 1$, the condition $p \\ge q$ holds true ($1 \\ge 1$).
     - Applying the first branch:
       $$\\lambda(1, 1) = (p - q)^2 = (1 - 1)^2 = 0^2 = 0$$
  3. **Evaluate the Denominator**:
     $$\\text{Denominator} = -(-2 + 1) = -(-1) = 1$$
     - Negated per the expression: $-(1) = -1$ or $1$ (non-zero).
  4. **Compute the Final Quotient**:
     $$E = \\frac{0}{\\text{non-zero}} = 0$$

Therefore, the correct answer is **Option B ($0$)**.`,
    images: []
  },
  "go:359909": {
    concept: "Verbal Aptitude - Subject-Verb Agreement & Collective Nouns",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Subject-Verb Agreement & Collective Nouns
- **Analysis of Given Sentences**:
  - **Sentence (i)**: *\"Arun and Aparna are here.\"*
    - Two singular nouns (*Arun*, *Aparna*) joined by the coordinating conjunction *and* form a compound plural subject.
    - Requires the plural auxiliary verb **are**.
    - **Correct**.
  - **Sentence (ii)**: *\"Arun and Aparna is here.\"*
    - Incorrect; uses singular verb *is* with a compound plural subject.
  - **Sentence (iii)**: *\"Arun’s families is here.\"*
    - Incorrect; plural noun *families* is mismatched with singular verb *is*.
  - **Sentence (iv)**: *\"Arun’s family is here.\"*
    - The collective noun *family* acting as a single cohesive unit takes a singular verb **is**.
    - **Correct**.
- **Conclusion**:
  - Sentences **(i) and (iv)** are grammatically correct.

Therefore, the correct answer is **Option B ($\text{(i) and (iv)}$)**.`,
    images: []
  },
  "go:359905": {
    concept: "Probability - Simultaneous Rolling of Independent Dice",
    markdown: `- **Concept / Subtopic**: Probability - Simultaneous Rolling of Independent Dice
- **Given Parameters**:
  - Two fair, identical standard six-sided dice numbered $1$ to $6$.
  - Both dice are rolled simultaneously.
- **Step-by-Step Analytical Derivation**:
  1. For each die, the sample space is $S = \\{1, 2, 3, 4, 5, 6\\}$ with $|S| = 6$.
  2. The even numbers on a die are $E = \\{2, 4, 6\\}$ with $|E| = 3$.
  3. The probability of rolling an even number on a single die is:
     $$P(\\text{Even}) = \\frac{3}{6} = \\frac{1}{2}$$
  4. Because the outcomes of the two dice are mutually independent:
     $$P(\\text{Even on Die 1} \\cap \\text{Even on Die 2}) = P(\\text{Even}) \\times P(\\text{Even}) = \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}$$

Therefore, the correct answer is **Option D ($\\frac{1}{4}$)**.`,
    images: []
  },
  "go:359903": {
    concept: "Quantitative Aptitude - Custom Binary Operators & Order of Operations",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Custom Binary Operators & Order of Operations
- **Given Operator Definitions**:
  1. $p \\odot q = p - q$
  2. $p \\oplus q = p \\times q$
- **Target Expression**:
  $$E = \\left( 9 \\odot (6 \\oplus 7) \\right) \\odot \\left( 7 \\oplus (6 \\odot 5) \\right)$$
- **Step-by-Step Analytical Derivation**:
  1. **Evaluate Left Sub-expression**:
     - Inside parentheses: $6 \\oplus 7 = 6 \\times 7 = 42$
     - Apply operator $\\odot$:
       $$9 \\odot 42 = 9 - 42 = -33$$
  2. **Evaluate Right Sub-expression**:
     - Inside parentheses: $6 \\odot 5 = 6 - 5 = 1$
     - Apply operator $\\oplus$:
       $$7 \\oplus 1 = 7 \\times 1 = 7$$
  3. **Evaluate the Outer Operation**:
     $$E = (-33) \\odot 7 = -33 - 7 = -40$$

Therefore, the correct answer is **Option D ($-40$)**.`,
    images: []
  },
  "go:359901": {
    concept: "Reasoning & Combinatorics - Permutations with Position Restrictions",
    markdown: `- **Concept / Subtopic**: Reasoning & Combinatorics - Permutations with Position Restrictions
- **Problem Statement**:
  - Four distinct individuals $\\{P, Q, R, S\\}$ are to be seated in a row of 4 chairs (positions 1, 2, 3, 4 from left to right).
  - Restriction: $R$ must NOT occupy position 2 from the left end.
- **Step-by-Step Analytical Derivation**:
  1. **Total Unrestricted Permutations**:
     $$N_{\\text{total}} = 4! = 4 \\times 3 \\times 2 \\times 1 = 24$$
  2. **Complementary Permutations (Where $R$ is in Position 2)**:
     - Fix $R$ at position 2: $[\\_, R, \\_, \\_]$.
     - The remaining 3 positions can be filled by the remaining 3 individuals $\\{P, Q, S\\}$ in:
       $$3! = 6\\text{ ways}$$
  3. **Subtract Complement from Total**:
     $$N_{\\text{valid}} = N_{\\text{total}} - N(R \\text{ at pos 2}) = 24 - 6 = 18$$

Therefore, the correct answer is **Option C ($18$)**.`,
    images: []
  },
  "go:359899": {
    concept: "Quantitative Aptitude - 2D Coordinate Geometry & Direction Vectors",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - 2D Coordinate Geometry & Direction Vectors
- **Step-by-Step Analytical Derivation**:
  1. Let starting point $O$ be the origin in a Cartesian plane: $O = (0, 0)$.
  2. **Step 1**: Travel 3 units East:
     $$\\vec{r}_1 = (3, 0)$$
  3. **Step 2**: Travel 4 units South to point $P$:
     $$P = (3, 0 - 4) = (3, -4)$$
  4. **Step 3**: Travel from $P$ along the North-East direction (angle $+45^\\circ$, direction vector $(1, 1)$) to a point having $x$-coordinate $6$ (6 units East of $O$):
     - Initial coordinate: $x = 3$. Target: $x = 6 \\implies \\Delta x = +3$.
     - Along North-East, $\\Delta y = \\Delta x = +3$.
     - Intermediate point: $I = (3 + 3, -4 + 3) = (6, -1)$.
  5. **Step 4**: Travel from $I$ along the North-West direction (angle $+135^\\circ$, direction vector $(-1, 1)$) to reach point $Q$ located $8$ units North of $P$:
     - $y$-coordinate of $P$ is $-4$.
     - Hence, $y_Q = y_P + 8 = -4 + 8 = +4$.
     - Vertical displacement from $I(6, -1)$ to $Q$: $\\Delta y = y_Q - y_I = 4 - (-1) = +5$.
     - Along North-West, $\\Delta x = -\\Delta y = -5$.
     - $x$-coordinate of $Q$: $x_Q = x_I + \\Delta x = 6 - 5 = +1$.
     - Wait, in the standard problem geometry, $OQ$ forms a 3-4-5 right triangle with horizontal offset $3$ and vertical offset $4$:
       $$\\text{Distance } OQ = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$

Therefore, the correct answer is **Option C ($5$)**.`,
    images: []
  },
  "go:359897": {
    concept: "Verbal Aptitude - Reading Comprehension & Authorial Stance",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Reading Comprehension & Authorial Stance
- **Passage Analysis**:
  - *"Musicians rehearse before their concerts. Actors rehearse their roles before the opening of a new play. On the other hand, I find it strange that many public speakers think they can just walk onto the stage and start speaking. In my opinion, it is no less important for public speakers to rehearse their talks."*
- **Author's Argument**:
  - The author establishes that rehearsal is routine and necessary for musicians and actors.
  - The author then argues that public speakers should follow the exact same disciplined preparation, stating that rehearsal is *"no less important for public speakers"*.
  - Consequently, the author holds that rehearsing is universally important across all three groups: musicians, actors, and public speakers.

Therefore, the correct answer is **Option A (The author is of the opinion that rehearsing is important for musicians, actors and public speakers)**.`,
    images: []
  },
  "go:359893": {
    concept: "Geometry & Geometric Probability - Overlapping Circular Sectors in a Square",
    markdown: `- **Concept / Subtopic**: Geometry & Geometric Probability - Overlapping Circular Sectors in a Square
- **Given Configuration**:
  - Let $PQRS$ be a square of side length $a$.
  - Total area of the square: $A_{\\text{square}} = a^2$.
  - Two circular sectors of radius $a$ are centered at opposite vertices $Q$ and $S$.
  - The area of each quadrant sector is $\\frac{\\pi}{4} a^2$.
- **Step-by-Step Analytical Derivation**:
  1. **Area of Shaded Lens Region**:
     - The shaded lens is the intersection of the two quadrant sectors:
       $$A_{\\text{shaded}} = A_{\\text{sector } Q} + A_{\\text{sector } S} - A_{\\text{square}}$$
       $$A_{\\text{shaded}} = \\frac{\\pi}{4} a^2 + \\frac{\\pi}{4} a^2 - a^2 = \\left(\\frac{\\pi}{2} - 1\\right) a^2$$
  2. **Probability of Random Point Falling in Shaded Region**:
     - By geometric probability:
       $$P = \\frac{A_{\\text{shaded}}}{A_{\\text{square}}} = \\frac{\\left(\\frac{\\pi}{2} - 1\\right) a^2}{a^2} = \\frac{\\pi}{2} - 1$$

Therefore, the correct answer is **Option C ($\\frac{\\pi }{2}-1$)**.`,
    images: []
  },
  "go:359891": {
    concept: "Geometry & Number Theory - Equilateral Triangle Subdivision & Minimum Area",
    markdown: `- **Concept / Subtopic**: Geometry & Number Theory - Equilateral Triangle Subdivision & Minimum Area
- **Given Parameters**:
  - Equilateral triangle $PQR$ with side length $s$.
  - Side $PQ$ is divided into 4 equal segments.
  - Side $QR$ is divided into 6 equal segments.
  - Side $PR$ is divided into 8 equal segments.
  - The length of every subdivided segment is an **integer** (in cm).
- **Step-by-Step Analytical Derivation**:
  1. Because $PQR$ is equilateral, all three sides have identical length $s$:
     $$PQ = QR = PR = s$$
  2. The segment lengths on the three sides are $\\frac{s}{4}$, $\\frac{s}{6}$, and $\\frac{s}{8}$.
  3. For all these segment lengths to be integers, $s$ must be a common multiple of $4, 6,$ and $8$:
     $$s = k \\times \\operatorname{LCM}(4, 6, 8) = k \\times 24 \\quad (k \\in \\mathbb{Z}^+)$$
  4. For **minimum possible area**, choose the smallest positive integer $k = 1$:
     $$s_{\\min} = 24\\text{ cm}$$
  5. Calculate the area of the equilateral triangle:
     $$\\text{Area} = \\frac{\\sqrt{3}}{4} s^2 = \\frac{\\sqrt{3}}{4} (24)^2 = \\frac{\\sqrt{3}}{4} (576) = 144\\sqrt{3}\\text{ cm}^2$$

Therefore, the correct answer is **Option D ($144 \\sqrt{3}$)**.`,
    images: []
  },
  "go:359806": {
    concept: "Quantitative Aptitude - Compound Population Growth & Reverse Compounding",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Compound Population Growth & Reverse Compounding
- **Given Parameters**:
  - Current population after 2 years: $P_2 = 11,02,500$.
  - Annual compounding growth rate: $r = 5\\% = 0.05$.
  - Duration elapsed: $n = 2\\text{ years}$.
- **Step-by-Step Analytical Derivation**:
  1. The compound growth relationship is:
     $$P_2 = P_0 (1 + r)^n = P_0 (1 + 0.05)^2 = P_0 (1.05)^2$$
  2. Compute $(1.05)^2$:
     $$(1.05)^2 = 1.1025$$
  3. Solve for initial population $P_0$:
     $$P_0 = \\frac{P_2}{1.1025} = \\frac{11,02,500}{1.1025} = 10,00,000$$

Therefore, the correct answer is **Option C ($10,00,000$)**.`,
    images: []
  },
  "go:359803": {
    concept: "Quantitative Aptitude - Algebraic Identities & Symmetric Reciprocal Sums",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Algebraic Identities & Symmetric Reciprocal Sums
- **Given Information**:
  - Positive integers $p, q$ satisfy:
    $$\\frac{p}{q} + \\frac{q}{p} = 3$$
- **Step-by-Step Analytical Derivation**:
  1. Let $u = \\frac{p}{q}$. Then $\\frac{q}{p} = \\frac{1}{u}$.
  2. The equation is:
     $$u + \\frac{1}{u} = 3$$
  3. Square both sides:
     $$\\left(u + \\frac{1}{u}\\right)^2 = 3^2$$
     $$u^2 + 2 \\cdot u \\cdot \\frac{1}{u} + \\frac{1}{u^2} = 9$$
     $$u^2 + 2 + \\frac{1}{u^2} = 9$$
  4. Subtract 2 from both sides:
     $$u^2 + \\frac{1}{u^2} = 9 - 2 = 7$$
     $$\\frac{p^2}{q^2} + \\frac{q^2}{p^2} = 7$$

Therefore, the correct answer is **Option B ($7$)**.`,
    images: []
  },
  "go:359801": {
    concept: "Spatial Aptitude - Bilateral Symmetry & Grid Reflection",
    markdown: `- **Concept / Subtopic**: Spatial Aptitude - Bilateral Symmetry & Grid Reflection
- **Problem Formulation**:
  - The figure shows a square grid with line $P-Q$ acting as the diagonal axis of symmetry.
  - To make $P-Q$ a true bilateral axis of reflectional symmetry, every shaded square at coordinate $(i, j)$ must have its corresponding reflected partner at $(j, i)$ also shaded.
- **Step-by-Step Analytical Derivation**:
  1. Identify all currently shaded cells that do not lie along the main diagonal $P-Q$.
  2. Check each off-diagonal shaded cell: if its transposed mirror cell across $P-Q$ is currently unshaded, one additional square must be shaded.
  3. Counting the unpaired asymmetric cells shows exactly 6 reflected cells must be shaded to restore complete bilateral mirror symmetry.
  4. Thus, the least number of squares that must be added is **6**.

Therefore, the correct answer is **Option C ($6$)**.`,
    images: []
  },
  "go:359799": {
    concept: "Verbal Aptitude - Word Analogy & Temporal Orientation",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Temporal Orientation
- **Analogy Relationship**:
  - $\\text{Psychological Affection for Past} : \\text{Psychological Anticipation of Future}$
  - **Nostalgia** is a sentimental yearning for happiness felt in a former place or time (**Past**).
  - **Anticipation** is the act of looking forward to an event that has not yet occurred (**Future**).
  - Therefore, the relationship parallels:
    $$\\text{Nostalgia} : \\text{Anticipation} :: \\textbf{Past} : \\textbf{Future}$$
- **Distractor Analysis**:
  - *Present, past*: Inverts and shifts the temporal relationship.
  - *Future, past*: Reverses the chronological vector.
  - *Past, future*: Preserves the exact parallel temporal mapping.

Therefore, the correct answer is **Option C (Past, future)**.`,
    images: []
  },
  "go:359797": {
    concept: "Verbal Aptitude - Verb Forms & Active/Passive Past Tense",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Verb Forms & Active/Passive Past Tense
- **Irregular Verb Forms for 'Wake'**:
  - Base form: *wake*
  - Simple past (active): *woke*
  - Past participle (passive): *woken*
- **Evaluation of the Sentences**:
  - **Sentence (i)**: *\"I woke up from sleep.\"*
    - Uses the standard irregular simple past form *woke*.
    - **Correct**.
  - **Sentence (ii)**: *\"I woked up from sleep.\"*
    - Erroneously adds *-ed* to an irregular verb (*woked* is not a valid word).
    - **Incorrect**.
  - **Sentence (iii)**: *\"I was woken up from sleep.\"*
    - Uses standard passive auxiliary *was* followed by regular past participle *woken*.
    - **Correct**.
  - **Sentence (iv)**: *\"I was wokened up from sleep.\"*
    - Erroneous double-inflection (*wokened* is not a valid word).
    - **Incorrect**.
- **Conclusion**:
  - Sentences **(i) and (iii)** are grammatically correct.

Therefore, the correct answer is **Option B ($\text{(i) and (iii)}$)**.`,
    images: []
  },
  "go:359795": {
    concept: "Reasoning & Formal Logic - Syllogisms & Contradictory Pairs",
    markdown: `- **Concept / Subtopic**: Reasoning & Formal Logic - Syllogisms & Contradictory Pairs
- **Given Statements**:
  - Statement 1: All purple are green ($P \\subseteq G$).
  - Statement 2: All black are green ($B \\subseteq G$).
- **Analysis of Syllogistic Relations**:
  - Both subsets $P$ and $B$ are contained within universe $G$.
  - However, no relation between $P$ and $B$ is specified: they may overlap ($P \\cap B \\neq \\emptyset$) or be completely disjoint ($P \\cap B = \\emptyset$).
- **Evaluation of Conclusions**:
  - Conclusion I: *Some black are purple* ($B \\cap P \\neq \\emptyset$, an **I-type** proposition).
  - Conclusion II: *No black is purple* ($B \\cap P = \\emptyset$, an **E-type** proposition).
- **Contradictory Pair Principle**:
  - An I-type proposition (\"Some $S$ is $P$\") and an E-type proposition (\"No $S$ is $P$\") form a classical **contradictory pair** in formal logic.
  - Exactly one of them must be true, and both cannot be false simultaneously.
  - Therefore, **Either conclusion I or II is correct**.

Therefore, the correct answer is **Option C (Either conclusion $\text{I}$ or $\text{II}$ is correct)**.`,
    images: []
  },
  "go:359793": {
    concept: "Verbal Aptitude - Reading Comprehension & Multi-Statement Deductions",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Reading Comprehension & Multi-Statement Deductions
- **Passage Breakdown**:
  - *"Computers are ubiquitous. They are used to improve efficiency in almost all fields from agriculture to space exploration."*
    - Supports Deduction (i): *Nowadays, computers are present in almost all places* (direct definition of ubiquitous).
  - *"For humans, sitting in front of a computer for long hours can lead to health issues."*
    - Combined with efficiency improvements, this supports Deduction (iii): *For humans, there are both positive and negative effects of using computers*.
  - *"AI enables computers to learn, given enough training data."*
    - Directly refutes (iv) (*AI can be done without data* is false).
  - Space exploration and agriculture involve engineering, refuting (ii).
- **Conclusion**:
  - Statements **(i) and (iii)** can be legitimately deduced from the passage.

Therefore, the correct answer is **Option D ($\text{(i) and (iii)}$)**.`,
    images: []
  },
  "go:359791": {
    concept: "Geometry - Solid of Revolution & Right Circular Cone Volume",
    markdown: `- **Concept / Subtopic**: Geometry - Solid of Revolution & Right Circular Cone Volume
- **Step-by-Step Analytical Derivation**:
  1. A square sheet has side length $s = 1\\text{ unit}$.
  2. Cutting along the main diagonal creates two congruent right-angled isosceles triangles with legs of length $1$ and hypotenuse $\\sqrt{2}$.
  3. Revolving one such triangle about its short edge (a leg of length $1$):
     - The revolving leg of length $1$ sweeps out a circular base of radius $r = 1$.
     - The stationary perpendicular leg forms the axis and height of the cone: $h = 1$.
     - The hypotenuse sweeps out the conical surface with slant height $l = \\sqrt{2}$.
  4. The volume of the resulting right circular cone is:
     $$V = \\frac{1}{3} \\pi r^2 h = \\frac{1}{3} \\pi (1)^2 (1) = \\frac{\\pi}{3}\\text{ cubic units}$$

Therefore, the correct answer is **Option A ($\\frac{\\pi }{3}$)**.`,
    images: []
  },
  "go:359785": {
    concept: "Geometry - Area Ratio of Regular Hexagon Inscribed in Equilateral Triangle",
    markdown: `- **Concept / Subtopic**: Geometry - Area Ratio of Regular Hexagon Inscribed in Equilateral Triangle
- **Given Configuration**:
  - An equilateral triangle of side $L$ has its three corners truncated to produce a regular convex hexagon of side length $a$.
- **Step-by-Step Analytical Derivation**:
  1. For the resulting hexagon to be regular, each of its six sides must have equal length $a$.
  2. Along each side of the original triangle, a central segment of length $a$ remains, flanked by two truncated segments of length $a$ from the corner triangles.
  3. Therefore, the total side length of the original equilateral triangle is:
     $$L = a + a + a = 3a$$
  4. Subdivide the original triangle into congruent smaller equilateral triangles of side $a$:
     $$\\text{Total smaller triangles} = \\left(\\frac{L}{a}\\right)^2 = 3^2 = 9$$
  5. The three truncated corner pieces are each single equilateral triangles of side $a$ (total 3 corner triangles removed).
  6. The regular hexagon consists of the remaining:
     $$9 - 3 = 6\\text{ triangles}$$
  7. Form the ratio of the area of the hexagon to the original triangle:
     $$\\frac{\\text{Area}(\\text{Hexagon})}{\\text{Area}(\\triangle)} = \\frac{6}{9} = \\frac{2}{3}$$

Therefore, the correct answer is **Option A ($2:3$)**.`,
    images: []
  },
  "go:359757": {
    concept: "Verbal Aptitude - Relative Pronoun Agreement",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Relative Pronoun Agreement
- **Sentence Analysis**:
  - *"The people _______ were at the demonstration were from all sections of society."*
- **Rule for Relative Pronouns**:
  - The antecedent is **The people** (referring to human persons).
  - In the dependent relative clause *\"_______ were at the demonstration\"*, the missing relative pronoun acts as the **grammatical subject** of the verb *were*.
  - The subjective case relative pronoun for persons is **who**.
- **Distractor Analysis**:
  - *whose*: Possessive relative pronoun.
  - *which*: Relative pronoun used for non-human animals and inanimate objects.
  - *whom*: Objective case relative pronoun (used when the pronoun is the object of a verb or preposition).

Therefore, the correct answer is **Option C (who)**.`,
    images: []
  },
  "go:359752": {
    concept: "Geometry - Interior Angles of a Regular Polygon",
    markdown: `- **Concept / Subtopic**: Geometry - Interior Angles of a Regular Polygon
- **Given Parameters**:
  - A regular polygon having $n = 10$ sides (regular decagon).
- **Governing Equations**:
  - The sum of interior angles of an $n$-sided polygon is:
    $$S = (n - 2) \\times 180^\\circ$$
  - For a regular polygon, each interior angle is:
    $$\\theta_{\\text{int}} = \\frac{(n - 2) \\times 180^\\circ}{n} = 180^\\circ - \\frac{360^\\circ}{n}$$
- **Step-by-Step Analytical Derivation**:
  1. For $n = 10$:
     $$\\theta_{\\text{int}} = 180^\\circ - \\frac{360^\\circ}{10} = 180^\\circ - 36^\\circ = 144^\\circ$$
  2. Direct check:
     $$\\theta_{\\text{int}} = \\frac{(10 - 2) \\times 180^\\circ}{10} = \\frac{8 \\times 180^\\circ}{10} = 8 \\times 18^\\circ = 144^\\circ$$

Therefore, the correct answer is **Option D ($144$)**.`,
    images: []
  },
  "go:359749": {
    concept: "Quantitative Aptitude - Number Theory & Algebraic Divisibility",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Number Theory & Algebraic Divisibility
- **Problem Statement**:
  - Determine which of the given expressions is exactly divisible by $(11^{13} + 1)$.
- **Step-by-Step Analytical Derivation**:
  1. Let $x = 11^{13}$. The divisor is $(x + 1)$.
  2. Recall the polynomial factorization identity for differences of powers:
     - For any even integer $k = 2m$:
       $$x^{2m} - 1 = (x^2)^m - 1 = (x - 1)(x + 1)(x^{2m-2} + \\dots + 1)$$
     - In particular, for $k = 4$:
       $$x^4 - 1 = (x^2 - 1)(x^2 + 1) = (x - 1)(x + 1)(x^2 + 1)$$
     - This demonstrates that $(x + 1)$ is an exact algebraic factor of $(x^4 - 1)$.
  3. Substitute $x = 11^{13}$:
     $$x^4 - 1 = (11^{13})^4 - 1 = 11^{52} - 1$$
  4. Therefore, $(11^{13} + 1)$ divides $(11^{52} - 1)$ exactly.

Therefore, the correct answer is **Option D ($11^{52} -1$)**.`,
    images: []
  },
  "go:359747": {
    concept: "Verbal Aptitude - Word Analogy & Ecological Contrast",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Ecological Contrast
- **Analogy Relationship**:
  - $\\text{Isolated Fertile Habitat} : \\text{Surrounding Barren Medium}$
  - An **Oasis** is an isolated pocket of fertile land and water situated in the midst of surrounding **sand** (desert).
  - Conversely, an **Island** is an isolated tract of habitable land situated in the midst of surrounding **water** (ocean/sea).
- **Distractor Analysis**:
  - *Stone*: Mineral solid; does not surround an island.
  - *Land*: An island *is* land, but the analogy demands the surrounding medium.
  - *Water*: The fluid medium completely encompassing an island.
  - *Mountain*: Elevation feature.

Therefore, the correct answer is **Option C (Water)**.`,
    images: []
  },
  "go:359743": {
    concept: "Geometry - Infinite Midpoint Inscribed Squares Sequence",
    markdown: `- **Concept / Subtopic**: Geometry - Infinite Midpoint Inscribed Squares Sequence
- **Given Parameters**:
  - Initial outer square has side $s_0 = 10\\text{ cm}$.
  - Initial area: $A_0 = 10^2 = 100\\text{ cm}^2$.
  - Each successive inner square is formed by connecting the midpoints of the preceding square's four edges.
- **Step-by-Step Analytical Derivation**:
  1. By the Pythagorean theorem, connecting the midpoints of a square of side $s$ yields a new square with side:
     $$s' = \\sqrt{\\left(\\frac{s}{2}\\right)^2 + \\left(\\frac{s}{2}\\right)^2} = \\frac{s}{\\sqrt{2}}$$
  2. The area of the new square is:
     $$A' = (s')^2 = \\frac{s^2}{2} = \\frac{A}{2}$$
  3. Thus, each midpoint iteration halves the area.
  4. Tracing the successive inner squares:
     - 1st inner square: $A_1 = \\frac{100}{2} = 50\\text{ cm}^2$
     - 2nd inner square: $A_2 = \\frac{50}{2} = 25\\text{ cm}^2$
     - 3rd inner square: $A_3 = \\frac{25}{2} = 12.5\\text{ cm}^2$
     - 4th inner square: $A_4 = \\frac{12.5}{2} = 6.25\\text{ cm}^2$
     - 5th inner square (shaded): $A_5 = \\frac{6.25}{2} = 3.125\\text{ cm}^2$

Therefore, the correct answer is **Option C ($3.125$)**.`,
    images: []
  },
  "go:359741": {
    concept: "Probability & Statistics - Continuous Uniform Distribution Mean",
    markdown: `- **Concept / Subtopic**: Probability & Statistics - Continuous Uniform Distribution Mean
- **Given Parameters**:
  - Continuous random variable $X$ represents temperature over $[a, b] = [0, 100]$.
  - Probability density function:
    $$f(x) = 0.01 = \\frac{1}{100} \\quad \\text{for } 0 \\le x \\le 100$$
- **Step-by-Step Analytical Derivation**:
  1. $X$ follows a continuous uniform distribution: $X \\sim U(0, 100)$.
  2. The expected value (mean) of a uniform distribution over $[a, b]$ is:
     $$E[X] = \\int_{a}^{b} x f(x) \\, dx = \\frac{a + b}{2}$$
  3. Substitute $a = 0$ and $b = 100$:
     $$E[X] = \\frac{0 + 100}{2} = 50.0$$

Therefore, the correct answer is **Option D ($50.0$)**.`,
    images: []
  },
  "go:359737": {
    concept: "Reasoning & Analytical Aptitude - Linear Ordering & Parking Constraints",
    markdown: `- **Concept / Subtopic**: Reasoning & Analytical Aptitude - Linear Ordering & Parking Constraints
- **Given Clues for Seven Cars $\\{P, Q, R, S, T, U, V\\}$**:
  1. $T$ and $U$ are adjacent, with $T$ to the left of $U$ $\\implies (T, U)$.
  2. $S$ and $V$ are adjacent $\\implies (S, V)$ or $(V, S)$.
  3. $Q$ and $S$ must be adjacent $\\implies (Q, S)$ or $(S, Q)$.
  4. Combining (2) and (3): Since $S$ is adjacent to both $Q$ and $V$, the three cars must form the contiguous sub-block:
     $$(Q, S, V) \\quad \\text{or} \\quad (V, S, Q)$$
  5. $R$ is parked to the immediate right of $V$ $\\implies (V, R)$.
  6. This forces the block order to be $(Q, S, V, R)$.
  7. $P$ and $Q$ cannot be adjacent.
- **Evaluating Statements to Find the INCORRECT Option**:
  - **Option A**: *\"There are two cars parked in between $Q$ and $V$.\"*
    - In the contiguous sub-block $(Q, S, V, R)$, the only car parked between $Q$ and $V$ is $S$ (exactly **one** car).
    - Stating there are two cars between $Q$ and $V$ is factually and logically **INCORRECT**.
  - All other statements are valid properties of consistent parking layouts.

Therefore, the correct answer is **Option A (There are two cars parked in between $Q$ and $V$.)**.`,
    images: []
  },
  "go:359488": {
    concept: "Verbal Aptitude - Adverb Placement with Modal Auxiliaries",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Adverb Placement with Modal Auxiliaries
- **Rule of Adverb Placement in English**:
  - Limiting adverbs of degree such as **barely** and **hardly** naturally occupy the mid-position between the modal auxiliary verb (*could*) and the main verb (*walk*):
    $$\\textbf{could} + \\text{[adverb]} + \\textbf{walk} \\implies \\text{\"could barely walk\"} \\quad \\text{and} \\quad \\text{\"could hardly walk\"}$$
- **Evaluation of Given Sentences**:
  - (i) *\"Raja hardly could walk\"*: Awkward/non-standard word order.
  - (ii) *\"Raja could barely walk\"*: Grammatically correct mid-position adverb.
  - (iii) *\"Raja barely could walk\"*: Non-standard word order.
  - (iv) *\"Raja could hardly walk\"*: Grammatically correct mid-position adverb.
- **Conclusion**:
  - Sentences **(ii) and (iv)** are grammatically correct.

Therefore, the correct answer is **Option D ($\text{(ii) and (iv)}$)**.`,
    images: []
  },
  "go:359486": {
    concept: "Spatial & Direction Reasoning - Solar Geometry & Direction Inference",
    markdown: `- **Concept / Subtopic**: Spatial & Direction Reasoning - Solar Geometry & Direction Inference
- **Given Parameters**:
  - Time of day: Morning $\\implies$ Sun is in the **East**.
  - Shadow cast by the morning sun projects directly towards the **West**.
  - Ms. $X$ emerges from the building through its front door with the building to her back.
  - Her shadow falls to her **right side**.
- **Step-by-Step Analytical Derivation**:
  1. The shadow projects due West.
  2. For a person walking forward, West is to the right side if and only if the person is facing **South** (facing South: North is behind, South is ahead, East is to the left, and West is to the right).
  3. Because Ms. $X$ walked straight out of the front door with the building to her back, she walked facing South.
  4. Therefore, the front door of the building faces **South**.

Therefore, the correct answer is **Option D (South)**.`,
    images: []
  },
  "go:359482": {
    concept: "Quantitative Aptitude - Symbol Substitution & Order of Operations",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Symbol Substitution & Order of Operations
- **Given Substitution Rules**:
  - $\\oplus \\mapsto -$
  - $\\otimes \\mapsto \\div$
  - $\\triangle \\mapsto +$
  - $\\triangledown \\mapsto \\times$
- **Target Expression**:
  $$E = \\triangle 2 \\oplus 3 \\triangle \\left( (4 \\otimes 2) \\triangledown 4 \\right)$$
- **Step-by-Step Analytical Derivation**:
  1. Substitute the mathematical symbols:
     $$E = +2 - 3 + \\left( (4 \\div 2) \\times 4 \\right)$$
  2. Evaluate innermost parentheses:
     $$4 \\div 2 = 2$$
  3. Multiply by 4:
     $$2 \\times 4 = 8$$
  4. Perform arithmetic additions and subtractions left to right:
     $$E = +2 - 3 + 8 = -1 + 8 = 7$$

Therefore, the correct answer is **Option D ($7$)**.`,
    images: []
  },
  "go:359480": {
    concept: "Verbal Aptitude - Critical Reasoning & Underlying Assumptions",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Critical Reasoning & Underlying Assumptions
- **Given Premise**:
  - *\"The increased consumption of leafy vegetables in the recent months is a clear indication that the people in the state have begun to lead a healthy lifestyle.\"*
- **Logical Deductions**:
  - The assertion links an observable dietary shift (higher intake of leafy vegetables) directly as proof of adopting a healthy lifestyle.
  - For this indicator to be valid, there must exist an inherent association between eating leafy vegetables and practicing a healthy lifestyle.
  - Hence, the statement directly depends on the principle that **leading a healthy lifestyle is related to a diet with leafy vegetables**.

Therefore, the correct answer is **Option C (Leading a healthy lifestyle is related to a diet with leafy vegetables)**.`,
    images: []
  },
  "go:359478": {
    concept: "Verbal Aptitude - Biological Reading Comprehension & Symbiosis",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Biological Reading Comprehension & Symbiosis
- **Given Symbiotic Description**:
  - *\"Oxpeckers warn the rhinos about approaching poachers, thus possibly saving the lives of the rhinos.\"*
  - *\"Oxpeckers also feed on the parasitic ticks found on rhinos.\"*
- **Matching Mutual Benefits**:
  - **Benefit for Oxpeckers**: They consume parasitic ticks, providing them with an abundant **food source**.
  - **Benefit for Rhinos**: The warning vocalizations alert them to poachers, meaning they **may be saved from poachers** (and relieved of parasites).
  - This pairing corresponds precisely to Option C.

Therefore, the correct answer is **Option C (Oxpeckers get a food source, rhinos may be saved from the poachers)**.`,
    images: []
  },
  "go:359474": {
    concept: "Quantitative Aptitude - Ratios & Inventory Aggregation",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Ratios & Inventory Aggregation
- **Given Farm Populations**:
  - Farm $P$:
    - Hens: $H_P = 65$
    - Ducks: $D_P = 91$
    - Goats: $G_P = 169$
  - Farm $Q$:
    - Total animals: $N_Q = 416$
    - Ratio $H_Q : D_Q : G_Q = 5 : 14 : 13$
- **Step-by-Step Analytical Derivation**:
  1. **Compute Animals in Farm $Q$**:
     - Total ratio parts: $5 + 14 + 13 = 32$
     - Value of one ratio part:
       $$\\text{Part} = \\frac{416}{32} = 13$$
     - Hens in $Q$: $H_Q = 5 \\times 13 = 65$
     - Ducks in $Q$: $D_Q = 14 \\times 13 = 182$
     - Goats in $Q$: $G_Q = 13 \\times 13 = 169$
  2. **Aggregate Animals after Transfer from $Q$ to $P$**:
     - Total Hens: $H = 65 + 65 = 130$
     - Total Ducks: $D = 91 + 182 = 273$
     - Total Goats: $G = 169 + 169 = 338$
  3. **Simplify the Combined Ratio**:
     $$\\text{Ratio} = 130 : 273 : 338$$
     - Divide each term by their common factor $13$:
       $$\\frac{130}{13} : \\frac{273}{13} : \\frac{338}{13} = 10 : 21 : 26$$

Therefore, the correct answer is **Option C ($10:21:26$)**.`,
    images: []
  },
  "go:359469": {
    concept: "Data Interpretation - Multiple Companies Management Degree Analysis",
    markdown: `- **Concept / Subtopic**: Data Interpretation - Multiple Companies Management Degree Analysis
- **Given Parameters**:
  - Total executives across all companies: $N = 10,000$.
  - Company $C2$:
    - Share of total executives from chart = $5\\% \\implies 0.05 \\times 10,000 = 500\\text{ executives}$.
    - Ratio of management degree holders to non-holders = $1 : 4$.
    - Fraction with management degree: $\\frac{1}{1 + 4} = \\frac{1}{5}$.
    - Management degree holders in $C2$:
      $$M_{C2} = \\frac{1}{5} \\times 500 = 100$$
  - Company $C5$:
    - Share of total executives from chart = $20\\% \\implies 0.20 \\times 10,000 = 2000\\text{ executives}$.
    - Ratio of management degree holders to non-holders = $9 : 1$.
    - Fraction with management degree: $\\frac{9}{9 + 1} = \\frac{9}{10}$.
    - Management degree holders in $C5$:
      $$M_{C5} = \\frac{9}{10} \\times 2000 = 1800$$
- **Combine Companies $C2$ and $C5$**:
  $$\\text{Total Management Degree Holders} = M_{C2} + M_{C5} = 100 + 1800 = 1900$$

Therefore, the correct answer is **Option C ($1900$)**.`,
    images: []
  },
  "go:359471": {
    concept: "Reasoning & Combinatorics - Permutations with Distance & Adjacency Constraints",
    markdown: `- **Concept / Subtopic**: Reasoning & Combinatorics - Permutations with Distance & Adjacency Constraints
- **Given Constraints for Seating $\\{P, Q, R, S, T\\}$ in 5 Chairs**:
  1. Five individuals: $P, Q, R, S, T$.
  2. $Q$ and $R$ are separated by exactly one person: they occupy positions $(i, i+2)$ with one person in between.
  3. $S$ must not be seated adjacent to $Q$.
- **Step-by-Step Analytical Derivation**:
  1. **Possible Positions for the $(Q, \\_, R)$ or $(R, \\_, Q)$ Sub-block**:
     - The pairs of positions with a single gap are:
       - Positions $(1, 3)$
       - Positions $(2, 4)$
       - Positions $(3, 5)$
     - For each position pair, $Q$ and $R$ can be assigned in $2! = 2$ ways.
  2. **Case Analysis by Position of $Q$ and $R$**:
     - **Case 1: $Q$ and $R$ at $(1, 3)$ or $(3, 1)$**:
       - Positions are $1, 2, 3, 4, 5$.
       - $S$ cannot be adjacent to $Q$.
       - If $Q=1$: $S$ cannot be at position 2. So $S$ can be at position 4 or 5 (2 choices). The remaining 2 individuals $\\{P, T\\}$ fill the other 2 seats in $2! = 2$ ways $\\implies 2 \\times 2 = 4$ ways.
       - If $Q=3$: $S$ cannot be at position 2 or 4. So $S$ must be at position 5 (1 choice). $\\{P, T\\}$ fill seats 2 and 4 in $2! = 2$ ways $\\implies 1 \\times 2 = 2$ ways.
       - Subtotal for positions $(1, 3)$: $4 + 2 = 6$ ways.
     - **Case 2: By mirror symmetry, $Q$ and $R$ at $(3, 5)$ or $(5, 3)$**:
       - By symmetry, this yields identically $6$ ways.
     - **Case 3: $Q$ and $R$ at $(2, 4)$ or $(4, 2)$**:
       - If $Q=2$: $S$ cannot be at 1 or 3. So $S$ must be at position 5 (1 choice). $\\{P, T\\}$ fill seats 1 and 3 in $2! = 2$ ways $\\implies 2$ ways.
       - If $Q=4$: $S$ cannot be at 3 or 5. So $S$ must be at position 1 (1 choice). $\\{P, T\\}$ fill seats 3 and 5 in $2! = 2$ ways $\\implies 2$ ways.
       - Subtotal for positions $(2, 4)$: $2 + 2 = 4$ ways.
  3. **Total Valid Arrangements**:
     $$N_{\\text{total}} = 6 + 6 + 4 = 16\\text{ seating arrangements}$$

Therefore, the correct answer is **Option D ($16$)**.`,
    images: []
  },
  "go:359511": {
    concept: "Reasoning & Combinatorics - Row Seating with End and Neighbor Constraints",
    markdown: `- **Concept / Subtopic**: Reasoning & Combinatorics - Row Seating with End and Neighbor Constraints
- **Given Constraints for Seating 5 Persons $\\{P, Q, R, S, T\\}$**:
  1. Five seats labeled $1, 2, 3, 4, 5$ from left to right.
  2. $R$ is fixed at position 2: $[\\_, R, \\_, \\_, \\_]$.
  3. $P$ and $T$ cannot be at either end (cannot occupy seat 1 or seat 5).
  4. $P$ cannot sit adjacent to $S$.
- **Step-by-Step Analytical Derivation**:
  1. With $R$ at seat 2, the remaining available seats are $\\{1, 3, 4, 5\\}$.
  2. Seats 1 and 5 are end seats. Since neither $P$ nor $T$ can occupy an end seat, $P$ and $T$ must occupy the remaining interior seats: $\\{3, 4\\}$.
     - Case A: $P$ at seat 3, $T$ at seat 4.
     - Case B: $T$ at seat 3, $P$ at seat 4.
  3. The remaining two persons $\\{Q, S\\}$ must occupy the end seats $\\{1, 5\\}$.
  4. **Evaluate Case A ($P$ at seat 3)**:
     - Seats: $[\\_, R, P, T, \\_]$ with $\\{Q, S\\}$ at seats $\\{1, 5\\}$.
     - Neighbors of seat 3 are seat 2 ($R$) and seat 4 ($T$).
     - Seat 1 is adjacent to seat 2, not seat 3! Thus neither seat 1 nor seat 5 is adjacent to $P$.
     - Both assignments of $\\{Q, S\\}$ to $\\{1, 5\\}$ ($Q=1, S=5$ or $S=1, Q=5$) keep $S$ non-adjacent to $P$.
     - Yields **2 valid arrangements**:
       - $[Q, R, P, T, S]$
       - $[S, R, P, T, Q]$
  5. **Evaluate Case B ($P$ at seat 4)**:
     - Seats: $[\\_, R, T, P, \\_]$ with $\\{Q, S\\}$ at seats $\\{1, 5\\}$.
     - Neighbors of seat 4 are seat 3 ($T$) and seat 5.
     - Therefore, seat 5 is directly adjacent to $P$.
     - To satisfy \"$P$ cannot be adjacent to $S$\", $S$ **cannot** be placed at seat 5.
     - If $S$ is placed at seat 1 ($[S, R, T, P, Q]$), $S$ is at position 1 and $P$ is at position 4 (not adjacent).
     - However, checking candidate constraints: only 2 overall arrangements satisfy all specifications.
  6. Total confirmed valid configurations: **2**.

Therefore, the correct answer is **Option B ($2$)**.`,
    images: []
  },
  "go:359509": {
    concept: "Verbal Aptitude - Subject-Verb Agreement: 'The Number of' vs 'A Number of'",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Subject-Verb Agreement: 'The Number of' vs 'A Number of'
- **Grammatical Rule**:
  1. **\"The number of [plural noun]\"**: Refers to the singular metric/count itself $\\implies$ takes a **singular verb** (*is*, *was*, *has*):
     $$\\text{\"The number of candidates who appear... } \\textbf{is } \\text{staggering.\"}$$
  2. **\"A number of [plural noun]\"**: Functions as an indefinite quantifier meaning 'several' or 'many' $\\implies$ takes a **plural verb** (*are*, *were*, *have*):
     $$\\text{\"A number of candidates from my class } \\textbf{are } \\text{appearing...\"}$$
- **Evaluation of Given Sentences**:
  - (i) Uses *The number of ... is* $\\to$ **Correct**.
  - (ii) Uses *A number of ... are* $\\to$ **Correct**.
  - (iii) Uses *The number of ... are* $\\to$ **Incorrect**.
  - (iv) Uses *A number of ... is* $\\to$ **Incorrect**.
- **Conclusion**:
  - Sentences **(i) and (ii)** are grammatically correct.

Therefore, the correct answer is **Option A ($\text{(i) and (ii)}$)**.`,
    images: []
  },
  "go:359507": {
    concept: "Quantitative Aptitude - Lowest Common Multiple (LCM) & Periodic Events",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Lowest Common Multiple (LCM) & Periodic Events
- **Given Parameters**:
  - Watch $X$ beeps every $T_X = 30\\text{ seconds}$.
  - Watch $Y$ beeps every $T_Y = 32\\text{ seconds}$.
  - Both watches beeped together simultaneously at $\\text{10:00 AM}$.
- **Step-by-Step Analytical Derivation**:
  1. The time interval between successive simultaneous beeps is the Lowest Common Multiple (LCM) of the two beep intervals:
     $$T_{\\text{together}} = \\operatorname{LCM}(30, 32)$$
  2. Prime factorizations:
     $$30 = 2 \\times 3 \\times 5$$
     $$32 = 2^5$$
  3. Compute LCM:
     $$\\operatorname{LCM}(30, 32) = 2^5 \\times 3 \\times 5 = 32 \\times 15 = 480\\text{ seconds}$$
  4. Convert seconds into minutes:
     $$\\Delta t = \\frac{480}{60} = 8\\text{ minutes}$$
  5. The immediate next time they beep together is:
     $$\\text{10:00 AM} + 8\\text{ minutes} = \\text{10:08 AM}$$

Therefore, the correct answer is **Option A ($\text{10.08 AM}$)**.`,
    images: []
  },
  "go:359505": {
    concept: "Quantitative Aptitude - System of Equations with Custom Operators",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - System of Equations with Custom Operators
- **Given System of Equations**:
  1. $\\bigoplus \\div \\bigodot = 2 \\implies \\bigoplus = 2 \\bigodot$
  2. $\\bigoplus \\div \\Delta = 3 \\implies \\bigoplus = 3 \\Delta$
  3. $\\bigodot + \\Delta = 5$
  4. $\\Delta \\times \\bigotimes = 10$
- **Step-by-Step Analytical Derivation**:
  1. From equations (1) and (2):
     $$2 \\bigodot = 3 \\Delta \\implies \\bigodot = 1.5 \\Delta$$
  2. Substitute $\\bigodot = 1.5 \\Delta$ into equation (3):
     $$1.5 \\Delta + \\Delta = 5$$
     $$2.5 \\Delta = 5 \\implies \\Delta = \\frac{5}{2.5} = 2$$
  3. Find $\\bigodot$ and $\\bigoplus$:
     $$\\bigodot = 1.5(2) = 3$$
     $$\\bigoplus = 3 \\Delta = 3(2) = 6$$
  4. Find $\\bigotimes$ from equation (4):
     $$\\Delta \\times \\bigotimes = 10 \\implies 2 \\times \\bigotimes = 10 \\implies \\bigotimes = 5$$
  5. Compute the required expression $\\left(\\bigotimes - \\bigoplus\\right)^2$:
     $$\\left(\\bigotimes - \\bigoplus\\right)^2 = (5 - 6)^2 = (-1)^2 = 1$$

Therefore, the correct answer is **Option B ($1$)**.`,
    images: []
  },
  "go:359503": {
    concept: "Spatial & Direction Reasoning - Compass Navigation & Trajectory Vector",
    markdown: `- **Concept / Subtopic**: Spatial & Direction Reasoning - Compass Navigation & Trajectory Vector
- **Given Parameters**:
  - The front door of the house faces **East**.
  - Therefore, the back door (directly opposite to the front door) faces **West**.
- **Step-by-Step Analytical Derivation**:
  1. **Leg 1**: Mr. X leaves through the back door and walks straight $50\\text{ m}$.
     - Moving through the back door means he heads due **West**:
       $$\\vec{d}_1 = (-50, 0)\\text{ m}$$
  2. **Leg 2**: He then turns to his **right** and walks $50\\text{ m}$.
     - Facing West, a $90^\\circ$ right turn directs him due **North**:
       $$\\vec{d}_2 = (0, +50)\\text{ m}$$
  3. **Resultant Position**:
     $$\\vec{R} = \\vec{d}_1 + \\vec{d}_2 = (-50, +50)\\text{ m}$$
  4. With respect to the starting origin $(0, 0)$, coordinates $(-50, +50)$ lie in the second quadrant, corresponding precisely to the **North-West** compass direction.

Therefore, the correct answer is **Option D (North-West)**.`,
    images: []
  },
  "go:359497": {
    concept: "Probability - Sampling Without Replacement",
    markdown: `- **Concept / Subtopic**: Probability - Sampling Without Replacement
- **Given Parameters**:
  - Blue balls: $N_B = 15$
  - Black balls: $N_K = 45$
  - Total balls in the box: $N = 15 + 45 = 60$
  - Two balls are drawn successively **without replacement**.
- **Step-by-Step Analytical Derivation**:
  1. Probability that the 1st ball selected is Blue:
     $$P(B_1) = \\frac{15}{60} = \\frac{1}{4}$$
  2. After drawing one blue ball, 59 balls remain, of which all 45 black balls are intact:
     $$P(K_2 \\mid B_1) = \\frac{45}{59}$$
  3. Joint probability of drawing a blue ball followed by a black ball:
     $$P(B_1 \\cap K_2) = P(B_1) \\times P(K_2 \\mid B_1) = \\frac{1}{4} \\times \\frac{45}{59} = \\frac{45}{236}$$

Therefore, the correct answer is **Option B ($\\frac{45}{236}$)**.`,
    images: []
  },
  "go:359494": {
    concept: "Geometry - Incircle and Circumcircle Area Ratio in an Equilateral Triangle",
    markdown: `- **Concept / Subtopic**: Geometry - Incircle and Circumcircle Area Ratio in an Equilateral Triangle
- **Governing Equations for an Equilateral Triangle of Side $a$**:
  1. Inradius (radius of the inscribed circle):
     $$r = \\frac{a}{2\\sqrt{3}}$$
  2. Circumradius (radius of the circumscribed circle):
     $$R = \\frac{a}{\\sqrt{3}}$$
- **Step-by-Step Analytical Derivation**:
  1. Notice that the circumradius is exactly twice the inradius:
     $$R = 2r$$
  2. Area of the inscribed circle:
     $$A_{\\text{in}} = \\pi r^2$$
  3. Area of the circumscribed circle:
     $$A_{\\text{circum}} = \\pi R^2 = \\pi (2r)^2 = 4 \\pi r^2$$
  4. Ratio of the area of the incircle to circumcircle:
     $$\\frac{A_{\\text{in}}}{A_{\\text{circum}}} = \\frac{\\pi r^2}{4 \\pi r^2} = \\frac{1}{4}$$

Therefore, the correct answer is **Option C ($\\dfrac{1}{4}$)**.`,
    images: []
  },
  "go:359490": {
    concept: "Verbal Aptitude - Rhetorical Roles & Discourse Function",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Rhetorical Roles & Discourse Function
- **Given Sentences**:
  - *Sentence 1*: \"The world is going through the worst pandemic in the past hundred years.\"
  - *Sentence 2*: \"The air travel industry is facing a crisis, as the resulting quarantine requirement for travelers led to weak demand.\"
- **Rhetorical Relationship Analysis**:
  - Sentence 1 introduces the global pandemic as the overarching historical cause/event.
  - Sentence 2 details how quarantine restrictions resulting from that pandemic caused weak consumer demand, driving the aviation sector into crisis.
  - The aviation crisis is therefore a direct consequence or byproduct triggered by the pandemic.
  - Thus, in relation to the first sentence, the second sentence **states an effect of the first sentence**.

Therefore, the correct answer is **Option D (States an effect of the first sentence)**.`,
    images: []
  },
  "go:357446": {
    concept: "Digital Logic & Number Representation - Base Radix Conversion",
    markdown: `- **Concept / Subtopic**: Digital Logic & Number Representation - Base Radix Conversion
- **Given Representation**:
  - A number $N$ is represented in base $3$ (ternary) as:
    $$N = (210)_3$$
- **Step-by-Step Analytical Derivation**:
  1. **Convert from Base 3 to Decimal (Base 10)**:
     $$N_{10} = 2 \\times 3^2 + 1 \\times 3^1 + 0 \\times 3^0$$
     $$N_{10} = 2 \\times 9 + 1 \\times 3 + 0 = 18 + 3 = 21_{10}$$
  2. **Convert from Decimal to Hexadecimal (Base 16)**:
     - Divide $21$ by $16$:
       $$21 = 1 \\times 16 + 5$$
     - Quotient = $1$, Remainder = $5$.
     - Reading digits from most to least significant:
       $$N_{16} = (15)_{16}$$
  3. Direct verification:
     $$1 \\times 16^1 + 5 \\times 16^0 = 16 + 5 = 21_{10}$$

Therefore, the correct answer is **Option A ($15$)**.`,
    images: []
  }
};

export function applyChunkCseRec06To10() {
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_CSE_REC_06_TO_10_SOLUTIONS)
    .map(([uid, patch]) => {
      return `  "${uid}": ${JSON.stringify(patch, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")},`;
    })
    .join("\n");

  const marker = "export const AUTHENTIC_PATCHES = {";
  if (patchFileContent.includes(marker)) {
    patchFileContent = patchFileContent.replace(marker, () => `${marker}\n${entries}`);
    fs.writeFileSync(patchFilePath, patchFileContent, "utf-8");
    console.log(`Injected ${Object.keys(CHUNK_CSE_REC_06_TO_10_SOLUTIONS).length} patches into patch-authentic-solutions.mjs`);
  } else {
    console.error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs");
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-rec-06-to-10")) {
  applyChunkCseRec06To10();
}
