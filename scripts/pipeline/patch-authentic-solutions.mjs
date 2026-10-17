import fs from "fs";
import path from "path";

export const AUTHENTIC_PATCHES = {
  // --- GATE ME 2018 Set 1 General Aptitude ---
  "pp:me:2018:q56": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Going by the _____ that many hands make light work, the school ____ involved all the students in the task."*
- **Principle** refers to a fundamental truth, proposition, rule, or guiding moral doctrine (such as the proverb *"many hands make light work"*).
- **Principal** refers to the head of a school, college, or chief administrative executive.
- Therefore, the first blank requires **principle** (guiding rule) and the second blank requires **principal** (head of the school).

Therefore, the correct answer is **Option A (principle, principal)**.`,
    images: [],
  },
  "pp:me:2018:q57": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Miserliness** refers to extreme stinginess or an unwillingness to spend money, even when necessary or to help others.
- The sentence presents an explicit contrast: *"Her _____ should not be confused with miserliness; she is ever willing to assist those in need."*
- The second clause explains that she is generous and ready to help people in need, so her careful spending must not be misconstrued as stinginess.
- **Frugality** means being prudent and economical in consumption and spending without being ungenerous.
- The other options (**cleanliness**, **punctuality**, **greatness**) do not relate to financial prudence, spending habits, or miserliness.

Therefore, the correct answer is **Option C (frugality)**.`,
    images: [],
  },
  "pp:me:2018:q58": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Unit Rate Analysis:**
  - 7 machines take 7 minutes to make 7 identical toys.
  - This means 1 machine takes 7 minutes to make 1 toy (since $7 \\text{ machines} \\times 7 \\text{ minutes} = 49 \\text{ machine-minutes}$ for 7 toys, or $7 \\text{ machine-minutes per toy}$).
- **Evaluating 100 Machines:**
  - Each individual machine works independently in parallel.
  - In 7 minutes, each of the 100 machines will produce exactly 1 toy.
  - Therefore, all 100 machines working together will produce $100 \\times 1 = 100$ toys in exactly **7 minutes**.

Therefore, the correct answer is **Option B (7)**.`,
    images: [],
  },
  "pp:me:2018:q59": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let the side of the resulting square be $s$.
- The length and breadth of the original rectangle are:
  $$L = s + 10, \\quad B = s + 5$$
- The area of the original rectangle is:
  $$A_1 = L \\times B = (s + 10)(s + 5) = s^2 + 15s + 50$$
- The area of the square is $A_2 = s^2$.
- The reduction in area is given as $650 \\text{ m}^2$:
  $$A_1 - A_2 = 650 \\implies (s^2 + 15s + 50) - s^2 = 650$$
  $$15s + 50 = 650 \\implies 15s = 600 \\implies s = 40\\text{ m}$$
- Original dimensions:
  $$L = 40 + 10 = 50\\text{ m}, \\quad B = 40 + 5 = 45\\text{ m}$$
- Area of the original rectangle:
  $$\\text{Area} = 50 \\times 45 = 2250\\text{ m}^2$$

Therefore, the correct answer is **Option B (2250)**.`,
    images: [],
  },
  "pp:me:2018:q60": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let the two-digit number be represented as $10x + y$, where $x$ is the tens digit and $y$ is the units digit.
- **Condition 1 (Sum of digits is 9):**
  $$x + y = 9 \\quad \\text{--- (Equation 1)}$$
- **Condition 2 (Subtracting 45 reverses digits):**
  $$(10x + y) - 45 = 10y + x$$
  $$9x - 9y = 45 \\implies x - y = 5 \\quad \\text{--- (Equation 2)}$$
- **Solving the system:**
  - Adding (1) and (2): $2x = 14 \\implies x = 7$.
  - Substituting $x = 7$ into (1): $y = 9 - 7 = 2$.
- The original number is $10(7) + 2 = 72$.
- Verification: $72 - 45 = 27$, whose digits are the reverse of $72$.

Therefore, the correct answer is **Option B (72)**.`,
    images: [],
  },
  "pp:me:2018:q61": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Given logarithmic condition:
  $$\\log a + \\log b + \\log c = 0 \\implies \\log(|a| \\cdot |b| \\cdot |c|) = 0$$
  $$|a| \\cdot |b| \\cdot |c| = 1$$
- Since $a, b, c$ are integers, their magnitudes must satisfy $|a| = 1, |b| = 1, |c| = 1$.
- Thus, each variable can take values from $\\{-1, 1\\}$.
- **Minimum Value:**
  $$a + b + c = (-1) + (-1) + (-1) = -3$$
- **Maximum Value:**
  $$a + b + c = 1 + 1 + 1 = 3$$
- Thus, the minimum and maximum values respectively are **-3 and 3**.

Therefore, the correct answer is **Option A (-3 and 3)**.`,
    images: [],
  },
  "pp:me:2018:q62": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Given expression:
  $$E = a + a^2 b^3 = a(1 + a b^3)$$
- We are given that $E$ is **odd**.
- For the product of two integers to be odd, **both factors must be odd**:
  1. $a$ must be **odd**.
  2. $(1 + a b^3)$ must be **odd**.
- For $(1 + a b^3)$ to be odd, the term $a b^3$ must be **even** (since $\\text{even} + 1 = \\text{odd}$).
- Since $a$ is already established to be odd:
  $$\\text{odd} \\times b^3 = \\text{even} \\implies b^3 \\text{ must be even} \\implies b \\text{ must be even}.$$
- Thus, $a$ is odd and $b$ is even.

Therefore, the correct answer is **Option D (a is odd and b is even)**.`,
    images: [],
  },
  "pp:me:2018:q63": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Speed Conversions:**
  - Train speed $v_T = 54\\text{ km/h} = 54 \\times \\frac{5}{18} = 15\\text{ m/s}$.
  - Man's running speed $v_M = 9\\text{ km/h} = 9 \\times \\frac{5}{18} = 2.5\\text{ m/s}$.
- **Finding Train Length ($L_T$):**
  - Relative speed when train passes the man in the same direction:
    $$v_{\\text{rel}} = v_T - v_M = 15 - 2.5 = 12.5\\text{ m/s}$$
  - The train completely passes the man in 14 seconds:
    $$L_T = v_{\\text{rel}} \\times t = 12.5 \\times 14 = 175\\text{ meters}$$
- **Finding Platform Length ($L_P$):**
  - From the front entering until the back leaves, total distance traversed is $L_T + L_P$:
    $$L_T + L_P = v_T \\times 25\\text{ s} = 15 \\times 25 = 375\\text{ meters}$$
    $$L_P = 375 - 175 = 200\\text{ meters}$$
- Thus, train length is $175\\text{ m}$ and platform length is $200\\text{ m}$.

Therefore, the correct answer is **Option D (175 and 200)**.`,
    images: [],
  },
  "pp:me:2018:q64": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- We test the function $y = ||x| - 1| - 1$ at key critical points:
  - At $x = 0$:
    $$y = ||0| - 1| - 1 = |-1| - 1 = 1 - 1 = 0$$
  - At $x = 1$ and $x = -1$:
    $$y = ||\\pm 1| - 1| - 1 = |0| - 1 = -1$$
    This yields local minima at $(1, -1)$ and $(-1, -1)$.
  - At $x = 2$ and $x = -2$:
    $$y = ||\\pm 2| - 1| - 1 = |1| - 1 = 0$$
    These are the roots where the graph crosses the x-axis.
  - For $|x| > 2$:
    $$y = (|x| - 1) - 1 = |x| - 2$$
    This produces linear rays of slope $\\pm 1$.
- This describes the symmetric double-V (W-shaped) curve passing through $(0,0)$ with minima at $(\\pm 1, -1)$ and roots at $\\pm 2$.

Therefore, the correct answer is **Option B ($y=||x|-1|-1$)**.`,
    images: [],
  },
  "pp:me:2018:q65": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Given Statements:**
  - (i) *Some roses are red.* $\\implies \\{ \\text{roses} \\} \\cap \\{ \\text{red flowers} \\} \\neq \\emptyset$.
  - (ii) *All red flowers fade quickly.* $\\implies \\{ \\text{red flowers} \\} \\subseteq \\{ \\text{things that fade quickly} \\}$.
  - (iii) *Some roses fade quickly.*
- **Logical Deduction:**
  - Since some roses belong to the set of red flowers (from i), and all red flowers belong to the set of things that fade quickly (from ii), those particular roses must also fade quickly.
  - Therefore, whenever both (i) and (ii) are true, statement (iii) is guaranteed to be true.

Therefore, the correct answer is **Option C (If (i) and (ii) are true, then (iii) is true.)**.`,
    images: [],
  },

  // --- GATE ME 2018 Set 2 General Aptitude ---
  "pp:me:2018:q56-s2": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Complement vs Compliment:**
  - **Complement** (spelled with an **e**): Means to enhance, complete, or harmonize well with something (*"the dress complemented her appearance"*).
  - **Compliment** (spelled with an **i**): Means to express praise, admiration, or congratulation (*"they all complimented her on her appearance"*).
- The first blank requires **complemented** (the dress suited her well) and the second blank requires **complimented** (people praised her).

Therefore, the correct answer is **Option D (complemented, complimented)**.`,
    images: [],
  },
  "pp:me:2018:q57-s2": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Structure:** *"The judge's standing in the legal community, though shaken by false allegations of wrongdoing, remained ______."*
- The concessive conjunction **"though shaken by false allegations"** sets up a contrast between the attempt to tarnish reputation and the eventual result.
- Despite the severity of the false allegations, the judge's respected standing remained intact and **undiminished**.
- Alternative words like *damaged*, *illegal*, or *uncertain* negate the contrast established by *"though"*.

Therefore, the correct answer is **Option A (undiminished)**.`,
    images: [],
  },
  "pp:me:2018:q58-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Letter Sequence Analysis:**
  - Group 1: **BC** (2 letters, positions 2, 3).
  - Skips 2 letters: D, E (positions 4, 5).
  - Group 2: **FGH** (3 letters, positions 6, 7, 8).
  - Skips 3 letters: I, J, K (positions 9, 10, 11).
  - Group 3: **LMNO** (4 letters, positions 12, 13, 14, 15).
  - Following the pattern, the next skip is 4 letters: P, Q, R, S (positions 16, 17, 18, 19).
  - Group 4 must contain 5 consecutive letters starting from position 20:
    $$\\text{Position 20: T, 21: U, 22: V, 23: W, 24: X} \\implies \\textbf{TUVWX}$$

Therefore, the correct answer is **Option B (TUVWX)**.`,
    images: [],
  },
  "pp:me:2018:q59-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Isoperimetric Theorem:** For any fixed perimeter $P$, a regular polygon with more sides encloses greater area than one with fewer sides, and a circle (infinite sides) encloses the maximum area of all planar geometric figures.
- **Direct Mathematical Comparison for perimeter $P$:**
  - **Circle:** $2\\pi r = P \\implies r = \\frac{P}{2\\pi}$.
    $$\\text{Area}_{\\text{circle}} = \\pi r^2 = \\frac{P^2}{4\\pi} \\approx \\frac{P^2}{12.57}$$
  - **Square:** $4s = P \\implies s = \\frac{P}{4}$.
    $$\\text{Area}_{\\text{square}} = s^2 = \\frac{P^2}{16} = \\frac{P^2}{16}$$
  - **Equilateral Triangle:** $3a = P \\implies a = \\frac{P}{3}$.
    $$\\text{Area}_{\\text{triangle}} = \\frac{\\sqrt{3}}{4} a^2 = \\frac{\\sqrt{3}}{36} P^2 \\approx \\frac{P^2}{20.78}$$
- Since $\\frac{P^2}{12.57} > \\frac{P^2}{16} > \\frac{P^2}{20.78}$, the circle encloses the greatest area.

Therefore, the correct answer is **Option A (The circle has the largest area)**.`,
    images: [],
  },
  "pp:me:2018:q60-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Using logarithm properties and base identity $\\log_x x = 1$:
  $$1 + \\log_u(vw) = \\log_u u + \\log_u(vw) = \\log_u(uvw)$$
- Applying the change of base reciprocal identity $\\frac{1}{\\log_a b} = \\log_b a$:
  $$\\frac{1}{1 + \\log_u(vw)} = \\frac{1}{\\log_u(uvw)} = \\log_{uvw} u$$
- Applying the exact same transformation to the other two terms:
  $$\\frac{1}{1 + \\log_v(wu)} = \\log_{uvw} v$$
  $$\\frac{1}{1 + \\log_w(uv)} = \\log_{uvw} w$$
- Summing the three terms:
  $$\\log_{uvw} u + \\log_{uvw} v + \\log_{uvw} w = \\log_{uvw}(u \\cdot v \\cdot w) = 1$$

Therefore, the correct answer is **Option C (1)**.`,
    images: [],
  },
  "pp:me:2018:q61-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Let:
  - $x, y, z$ be the number of students who watched *only* film A, B, and C respectively.
  - $k$ be the number of students who watched *all three* films.
  - The problem states each student watched either only one film or all three, so the number of students watching exactly two films is 0.
- **Total Students:**
  $$(x + y + z) + k = 40 \\quad \\text{--- (Equation 1)}$$
- **Sum of Individual Film Watchers:**
  - Film A: $x + k = 13$
  - Film B: $y + k = 16$
  - Film C: $z + k = 19$
  - Summing all three:
    $$(x + y + z) + 3k = 13 + 16 + 19 = 48 \\quad \\text{--- (Equation 2)}$$
- Subtracting Equation 1 from Equation 2:
  $$[(x + y + z) + 3k] - [(x + y + z) + k] = 48 - 40$$
  $$2k = 8 \\implies k = 4$$

Therefore, the correct answer is **Option C (4)**.`,
    images: [],
  },
  "pp:me:2018:q62-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Original Wire Length:**
  - Area of original square $= 1936\\text{ m}^2 \\implies \\text{side } s = \\sqrt{1936} = 44\\text{ m}$.
  - Total length of the wire $L = 4 \\times 44 = 176\\text{ m}$.
- **Dividing the Wire in Ratio $3 : 1$:**
  - Longer piece $L_1 = \\frac{3}{4} \\times 176 = 132\\text{ m}$.
  - Shorter piece $L_2 = \\frac{1}{4} \\times 176 = 44\\text{ m}$.
- **Area of New Square (from longer piece):**
  - Side $s' = \\frac{132}{4} = 33\\text{ m}$.
  - Area $A_1 = 33^2 = 1089\\text{ m}^2$.
- **Area of Circle (from shorter piece):**
  - Circumference $2\\pi r = 44 \\implies 2 \\times \\frac{22}{7} \\times r = 44 \\implies r = 7\\text{ m}$.
  - Area $A_2 = \\pi r^2 = \\frac{22}{7} \\times 7^2 = 154\\text{ m}^2$.
- **Total Combined Area:**
  $$A_{\\text{total}} = A_1 + A_2 = 1089 + 154 = 1243\\text{ m}^2$$

Therefore, the correct answer is **Option C (1243)**.`,
    images: [],
  },
  "pp:me:2018:q64-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Testing Candidate Options against the Given Conditional Rules:**
  - Statement (i): *If house number is a multiple of 3, then it is in [50, 59].*
  - Statement (ii): *If house number is NOT a multiple of 4, then it is in [60, 69].*
  - Statement (iii): *If house number is NOT a multiple of 6, then it is in [70, 79].*
- **Option Testing:**
  - **Option 54:** Multiple of 3 (in 50-59, valid for i). NOT a multiple of 4 ($54/4 = 13.5$), but not in [60,69]. Violates (ii).
  - **Option 65:** NOT a multiple of 4 (in 60-69, valid for ii). NOT a multiple of 6, but not in [70,79]. Violates (iii).
  - **Option 66:** Multiple of 3, but not in [50,59]. Violates (i).
  - **Option 76:**
    - Not a multiple of 3 $\\implies$ premise of (i) is false, so (i) is satisfied.
    - Multiple of 4 ($76 = 4 \\times 19$) $\\implies$ premise of (ii) is false, so (ii) is satisfied.
    - Not a multiple of 6 ($76/6 = 12.67$) $\\implies$ must be in [70, 79], which 76 is! Satisfies (iii).

Therefore, the correct answer is **Option D (76)**.`,
    images: [],
  },
  "pp:me:2018:q65-s2": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Each coin toss is an **independent event**; past outcomes have zero impact on future coin tosses.
- For the two remaining tosses in the 4th trial, the sample space of equally likely outcomes is:
  $$S = \\{ HH, HT, TH, TT \\}, \\quad P(\\text{each outcome}) = \\frac{1}{4} = 0.25$$
- Evaluating options:
  - Two T occur ($TT$): $P = 0.25$.
  - Two H occur ($HH$): $P = 0.25$.
  - One H followed by one T ($HT$): $P = 0.25$.
  - One H and one T in any order ($HT$ or $TH$): $P = 0.25 + 0.25 = 0.50$.
- Since $0.50$ is the greatest probability, the statement *"One H and one T will occur"* has the highest likelihood.

Therefore, the correct answer is **Option B (One H and one T will occur.)**.`,
    images: [],
  },

  // --- GATE ME 2012 Set 1 General Aptitude ---
  "pp:me:2012:q56": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Suresh's dog is the one ______ was hurt in stampede"*
- This sentence requires a **restrictive relative pronoun** to uniquely identify and define the subject (*"the one that..."*).
- **"That" (Option A)** is the standard relative pronoun used for animals and inanimate objects in defining restrictive clauses.
- **"Who"** and **"Whom"** (Options C and D) are subjective and objective pronouns reserved strictly for human beings, not animals.
- **"Which"** (Option B) is primarily used for non-restrictive clauses (clauses providing supplementary information, usually set off by commas) rather than identifying restrictive clauses after *"the one"*.

Therefore, the correct answer is **Option A (that)**.`,
    images: [],
  },
  "pp:me:2012:q57": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Cost function: $C(q) = 5q^2$.
- Market selling price per unit: $P = 50$.
- Total revenue function: $R(q) = P \\times q = 50q$.
- Profit function $\\Pi(q) = R(q) - C(q)$:
  $$\\Pi(q) = 50q - 5q^2$$
- To find the production quantity $q$ that maximizes profit, take the first derivative and set to 0:
  $$\\frac{d\\Pi}{dq} = 50 - 10q = 0 \\implies 10q = 50 \\implies q = 5$$
- Verification via second derivative: $\\frac{d^2\\Pi}{dq^2} = -10 < 0$ (confirms maximum).

Therefore, the correct answer is **Option A (5)**.`,
    images: [],
  },
  "pp:me:2012:q58": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Despite several _______, the mission succeeded in its attempt to resolve the conflict."*
- The preposition **"Despite"** signals a contrast with the positive outcome (*"the mission succeeded"*).
- The missing word must denote difficulties, hindrances, or obstacles encountered along the way.
- **Setbacks** means reversals, obstacles, or temporary checks in progress.
- Alternatives like *attempts*, *meetings*, or *delegations* do not present the requisite semantic contrast.

Therefore, the correct answer is **Option B (setbacks)**.`,
    images: [],
  },
  "pp:me:2012:q59": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Mitigate** means to make something bad, painful, or severe less intense, or to lessen and **diminish** its impact.
- Distractor meanings:
  - *Divulge:* to reveal or disclose secret information.
  - *Dedicate:* to devote time or resources to a cause.
  - *Denote:* to be a mark, sign, or symbol of something.
- Thus, **Diminish** is closest in meaning.

Therefore, the correct answer is **Option A (Diminish)**.`,
    images: [],
  },
  "pp:me:2012:q60": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- In standard English grammar, **"less"** is already a comparative adjective and cannot be modified by the intensifier **"very"**.
- Sentence D states: *"This country's expenditure on educational reforms is very less."*
- Grammatically correct alternatives include *"very low"*, *"much less"*, or *"very small"*.
- The remaining sentences A, B, and C adhere to standard English usage.

Therefore, the incorrect sentence is **Option D**.`,
    images: [],
  },
  "pp:me:2012:q61": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Analyzing the letter sequence: **AD, CG, FK, JP, ...**
  - **First Letter Pattern:**
    - A (1) $\\xrightarrow{+2}$ C (3) $\\xrightarrow{+3}$ F (6) $\\xrightarrow{+4}$ J (10) $\\xrightarrow{+5}$ **O (15)**
  - **Second Letter Pattern:**
    - D (4) $\\xrightarrow{+3}$ G (7) $\\xrightarrow{+4}$ K (11) $\\xrightarrow{+5}$ P (16) $\\xrightarrow{+6}$ **V (22)**
- Combining both letters yields **OV**.

Therefore, the correct answer is **Option A (OV)**.`,
    images: [],
  },
  "pp:me:2012:q63": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- Profile of the arch:
  $$y = 2x - 0.1x^2$$
- To determine the maximum height, differentiate with respect to $x$ and set to zero:
  $$\\frac{dy}{dx} = 2 - 0.2x = 0 \\implies 0.2x = 2 \\implies x = 10\\text{ meters}$$
- Substituting $x = 10$ back into the height equation:
  $$y_{\\text{max}} = 2(10) - 0.1(10)^2 = 20 - 0.1(100) = 20 - 10 = 10\\text{ meters}$$

Therefore, the correct answer is **Option B (10 meters)**.`,
    images: [],
  },
  "pp:me:2012:q64": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Given Probabilities:**
  - $P(X) = 0.60, \\quad P(Y) = 0.40$
  - Probability of being reliable given supplier:
    $$P(R | X) = 0.96, \\quad P(R | Y) = 0.72$$
- **Total Probability of a Reliable Shock Absorber $P(R)$:**
  $$P(R) = P(X)P(R|X) + P(Y)P(R|Y) = (0.60 \\times 0.96) + (0.40 \\times 0.72)$$
  $$P(R) = 0.576 + 0.288 = 0.864$$
- **Applying Bayes' Theorem for $P(Y | R)$:**
  $$P(Y | R) = \\frac{P(Y)P(R|Y)}{P(R)} = \\frac{0.288}{0.864} = \\frac{1}{3} \\approx 0.3333 \\dots \\approx 0.334$$

Therefore, the correct answer is **Option B (0.334)**.`,
    images: [],
  },
  "pp:me:2012:q65": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Evaluation of Statistical Assertions:**
  - **Assertion P:** Adding a constant $c = 7$ to each value shifts the mean by $c$: $\\mu' = \\mu + 7$. (Correct)
  - **Assertion Q:** Adding a constant shifts all points equally and leaves dispersion/standard deviation unchanged ($\\sigma' = \\sigma$). Stating it adds 7 to standard deviation is incorrect.
  - **Assertion R:** Multiplying each value by a factor $k = 2$ scales the mean by $k$: $\\mu' = 2\\mu$. (Correct)
  - **Assertion S:** Multiplying each value by $k = 2$ scales the standard deviation by $|k| = 2$: $\\sigma' = 2\\sigma$. Leaving it unchanged is incorrect.
- Thus, assertions **P and R** are correct.

Therefore, the correct answer is **Option C (P,R)**.`,
    images: [],
  },

  // --- GATE 2020 General Aptitude Additional Questions ---
  "go:359826": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Preposition Usage:**
  - The verb **confer** when bestowing an honor, degree, or award upon a person requires the preposition **on** (or *upon*): *"conferred on Mary Kom"*.
  - When specifying a location or building, **at** is the appropriate preposition for a landmark: *"at the Rashtrapati Bhawan"*.
- Combining both correct prepositions yields **on, at**.

Therefore, the correct answer is **Option C (on, at)**.`,
    images: [],
  },
  "go:359824": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Sentence Analysis:** *"Despite a string of poor performances, the chances of K.L. Rahul’s selection in the team are ______"*
- The introductory word **"Despite"** signals a concessive contrast with *"a string of poor performances"*.
- Even though poor form usually hurts selection chances, here his chances surprisingly remain favorable and **bright**.
- *Slim* or *uncertain* would represent the expected outcome rather than the contrast necessitated by *"Despite"*.

Therefore, the correct answer is **Option B (bright)**.`,
    images: [],
  },
  "go:359822": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Analogy Structure:** $\\text{Cover : Uncover :: Associate : ?}$
  - *Uncover* is the direct antonym of *cover*, formed by adding the negative prefix *un-*.
  - For the word *associate*, the established standard negative prefix forming its antonym is *dis-*, yielding **dissociate**.
  - Words like *Unassociate*, *Inassociate*, and *Misassociate* are not valid English words.

Therefore, the correct answer is **Option D (Dissociate)**.`,
    images: [],
  },
  "go:359818": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Sum of First $2n$ Natural Numbers ($S_1$):**
  $$S_1 = \\sum_{k=1}^{2n} k = \\frac{2n(2n + 1)}{2} = n(2n + 1) = 2n^2 + n$$
- **Sum of First $n$ Odd Natural Numbers ($S_2$):**
  $$S_2 = \\sum_{k=1}^{n} (2k - 1) = n^2$$
- **Difference:**
  $$\\text{Difference} = S_1 - S_2 = (2n^2 + n) - n^2 = n^2 + n$$

Therefore, the correct answer is **Option B ($n^2 + n$)**.`,
    images: [],
  },
  "go:359810": {
    concept: "General Aptitude - Quantitative Aptitude",
    markdown: `- **Properties of Skew-Symmetric Matrices:**
  - Given $M = [m_{ij}]$ is a $4 \\times 4$ skew-symmetric matrix ($m_{ij} = -m_{ji}$ and $m_{ii} = 0$).
  - All 4 diagonal entries are fixed to zero ($m_{11} = m_{22} = m_{33} = m_{44} = 0$).
  - Every entry below the main diagonal is uniquely determined by the corresponding entry above the diagonal ($m_{ji} = -m_{ij}$).
  - Thus, to fully specify the matrix, we only need to specify the strictly upper triangular elements:
    $$\\frac{n(n - 1)}{2} = \\frac{4(4 - 1)}{2} = \\frac{12}{2} = 6$$

Therefore, the correct answer is **Option B (6)**.`,
    images: [],
  },
  "go:359868": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Idiom Meaning:**
  - An **ivory tower** is a well-established English idiom referring to a state of privileged seclusion or aloof disconnection from the practical realities and challenges of everyday life.
  - The sentence directly explains the idiom: *"...so, they are not aware of their real life challenges."*

Therefore, the correct answer is **Option B (ivory towers)**.`,
    images: [],
  },
  "go:359866": {
    concept: "General Aptitude - Verbal Aptitude",
    markdown: `- **Vocabulary Evaluation:**
  - The prompt states his hunger for reading is *insatiable* (cannot be satisfied) and he reads *indiscriminately*.
  - **Voracious** describes having an exceedingly eager or insatiable appetite for an activity, specifically reading (*a voracious reader*).
  - *Precocious* refers to having developed abilities at an earlier age than usual.
  - *All-round* and *wise* do not convey an insatiable hunger for reading.

Therefore, the correct answer is **Option C (voracious)**.`,
    images: [],
  },
};

export function applyAuthenticPatches() {
  const shardsDir = path.resolve("public/question-detail-shards");
  const ppAllPath = path.resolve("data/solutions/practicepaper/all-solutions.json");
  const ppAll = fs.existsSync(ppAllPath) ? JSON.parse(fs.readFileSync(ppAllPath, "utf8")) : {};

  let patchedCount = 0;

  for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
    // 1. Update all-solutions.json
    if (ppAll[uid]) {
      ppAll[uid].has_detailed_solution = true;
      ppAll[uid].detailed_solution = patch.markdown;
      ppAll[uid].images = patch.images;
    } else {
      ppAll[uid] = {
        question_uid: uid,
        has_detailed_solution: true,
        detailed_solution: patch.markdown,
        images: patch.images,
      };
    }

    // 2. Update Shards
    const files = fs.readdirSync(shardsDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(shardsDir, file);
      const shard = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (shard.recordsByQuestionUid && shard.recordsByQuestionUid[uid]) {
        shard.recordsByQuestionUid[uid].detailed_solution = {
          concept: patch.concept,
          markdown: patch.markdown,
          images: patch.images,
        };
        fs.writeFileSync(filePath, JSON.stringify(shard, null, 2), "utf8");
        patchedCount++;
      }
    }

    // 3. Update data/solutions/*-v1.json
    const v1Files = ["ce-v1.json", "ec-v1.json", "ee-v1.json", "me-v1.json", "cse-v1.json", "da-v1.json"];
    for (const v1File of v1Files) {
      const v1Path = path.resolve("data/solutions", v1File);
      if (!fs.existsSync(v1Path)) continue;
      const v1Data = JSON.parse(fs.readFileSync(v1Path, "utf8"));
      if (v1Data[uid]) {
        v1Data[uid].solution_markdown = patch.markdown;
        v1Data[uid].concept_summary = patch.concept;
        fs.writeFileSync(v1Path, JSON.stringify(v1Data, null, 2), "utf8");
      }
    }
  }

  fs.writeFileSync(ppAllPath, JSON.stringify(ppAll, null, 2), "utf8");
  console.log(`Applied ${Object.keys(AUTHENTIC_PATCHES).length} authentic patches across ${patchedCount} shards and v1 registries.`);
}

if (process.argv[1] && process.argv[1].includes("patch-authentic-solutions")) {
  applyAuthenticPatches();
}
