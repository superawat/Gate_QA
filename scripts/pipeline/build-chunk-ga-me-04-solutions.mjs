import fs from 'fs';
import path from 'path';

const solutions = {
  "me:2015:ga:q3-s2": {
    "concept": "Grammar: Modal and Causative Auxiliary 'Let' & Part of Speech Selection",
    "markdown": `### **Key Concept**
In English syntax, the imperative or cohortative construction **"Let us + [bare infinitive verb]"** requires an action or state verb in its base (uninflected) form (e.g., *"Let us go"*, *"Let us discuss"*). 

---

### **Step-by-Step Analysis of Options**

1. **"introvert"**:
   - Primarily used as a **noun** denoting a shy, reticent person focused inward, or as an **adjective**. While it can rarely serve as a transitive verb meaning "to turn inward", it does not form a meaningful, idiomatic intransitive clause after *"Let us"*.

2. **"alternate"**:
   - Commonly and standardly functions as an **intransitive verb** meaning *to take turns, switch back and forth periodically, or act reciprocally* (pronounced \`/ˈɔːltərneɪt/\`).
   - In *"Let us alternate"*, it fits the bare infinitive requirement and forms a complete, grammatically sound sentence meaning *"Let us take turns"*.

3. **"atheist"**:
   - Exclusively a **noun** denoting a person who does not believe in the existence of a deity or gods. It cannot function as a verb.

4. **"altruist"**:
   - Exclusively a **noun** denoting a person who practices selfless concern for the well-being of others. It cannot function as a verb.

---

### **Conclusion**
Only **"alternate"** standardly serves as the required base verb.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q4-s2": {
    "concept": "Letter Series & Pattern Recognition",
    "markdown": `### **Key Concept**
The series is formed by consecutive groups of English alphabet letters where both the **number of letters per group** and the **number of skipped letters between consecutive groups** increase by $1$ at each successive step.

---

### **Step-by-Step Derivation**

Let us analyze the terms and the intermediate skipped letters:

1. **Term 1:** **A**
   - Number of letters: $1$
   - *Skip $1$ letter:* $\\text{B}$

2. **Term 2:** **CD**
   - Number of letters: $2$ (consecutive: $\\text{C, D}$)
   - *Skip $2$ letters:* $\\text{E, F}$

3. **Term 3:** **GHI**
   - Number of letters: $3$ (consecutive: $\\text{G, H, I}$)
   - *Skip $3$ letters:* $\\text{J, K, L}$

4. **Term 4 (Missing Term):**
   - Following the established pattern, the next term must contain **$4$ consecutive letters** starting immediately after $\\text{L}$:
     $$\\text{M, N, O, P} \\implies \\mathbf{MNOP}$$
   - *Skip $4$ letters:* $\\text{Q, R, S, T}$

5. **Term 5:** **UVWXY**
   - Number of letters: $5$ (consecutive: $\\text{U, V, W, X, Y}$)
   - Confirms the sequence completely.

---

### **Conclusion**
The missing sequence is **MNOP**.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2015:ga:q5-s2": {
    "concept": "Real Analysis: Monotonicity of Functions & Inequalities",
    "markdown": `### **Key Concept**
For any strictly increasing function $f(t)$ on an interval, $x > y \\implies f(x) > f(y)$. For functions that are non-monotonic, oscillatory, or depending on non-linear exponents, inequalities must be tested against potential counterexamples.

---

### **Evaluation of Each Statement**

Given the premise:
$$x > y > 1$$

1. **Statement (i): $\\ln x > \\ln y$**
   - The natural logarithm function $f(t) = \\ln t$ has derivative:
     $$f'(t) = \\frac{1}{t} > 0 \\quad \\forall t > 0$$
   - Because $f(t)$ is strictly monotonically increasing on $(0, \\infty)$, for $x > y > 1$, we strictly have:
     $$\\ln x > \\ln y$$
   - **Statement (i) is MUST BE TRUE.**

2. **Statement (ii): $e^x > e^y$**
   - The exponential function $g(t) = e^t$ has derivative:
     $$g'(t) = e^t > 0 \\quad \\forall t \\in \\mathbb{R}$$
   - Since $g(t)$ is strictly monotonically increasing everywhere, $x > y$ guarantees:
     $$e^x > e^y$$
   - **Statement (ii) is MUST BE TRUE.**

3. **Statement (iii): $y^x > x^y$**
   - Taking natural logarithms of both sides, $y^x > x^y$ is equivalent to:
     $$x \\ln y > y \\ln x \\iff \\frac{\\ln y}{y} > \\frac{\\ln x}{x}$$
   - Consider the function $h(t) = \\frac{\\ln t}{t}$. Its derivative is:
     $$h'(t) = \\frac{1 - \\ln t}{t^2}$$
     - $h'(t) > 0$ for $1 < t < e$ (strictly increasing)
     - $h'(t) < 0$ for $t > e$ (strictly decreasing)
   - **Counterexample:** Choose $y = 2$ and $x = 3$ (both $> 1$ with $x > y$):
     $$y^x = 2^3 = 8, \\quad x^y = 3^2 = 9$$
     Here, $y^x < x^y$ ($8 < 9$).
   - Therefore, $y^x > x^y$ does **not** always hold.
   - **Statement (iii) is FALSE in general.**

4. **Statement (iv): $\\cos x > \\cos y$**
   - The cosine function is periodic and oscillatory on $[1, \\infty)$.
   - **Counterexample:** Choose $y = \\frac{\\pi}{2} \\approx 1.57$ and $x = \\pi \\approx 3.14$ (where $x > y > 1$):
     $$\\cos y = \\cos\\left(\\frac{\\pi}{2}\\right) = 0$$
     $$\\cos x = \\cos(\\pi) = -1$$
     Here, $\\cos x = -1 < 0 = \\cos y$.
   - **Statement (iv) is FALSE in general.**

---

### **Conclusion**
Only statements **(i) and (ii)** must be true.

**Correct Option: (A)**`,
    "images": []
  },

  "me:2015:ga:q6-s2": {
    "concept": "English Grammar: Prepositions and Pronoun Case (Objective Case)",
    "markdown": `### **Key Concept**
In standard English grammar, **prepositions** (such as *between, among, with, for, to*) require their object pronouns to be in the **objective case** (e.g., *me, him, her, us, them*), never in the subjective/nominative case (*I, he, she, we, they*).

---

### **Step-by-Step Analysis**

1. In the prepositional phrase *"between [Pronoun 1] and [Pronoun 2]"*:
   - The pronoun "you" functions identically in both subjective and objective forms.
   - The first-person pronoun must be in the **objective case**: **"me"** (not the subjective *"I"*).
   - Hence, the grammatically correct formulation is:
     $$\\text{\"between you and me\"}$$

2. **Analysis of Distractors:**
   - **"It would remain between you and I"**: A classic error known as hypercorrection. *"I"* cannot act as the grammatical object of the preposition *"between"*.
   - **"It would remain between I and you"**: Incorrect because *"I"* is in the nominative case, and standard English courtesy places the second person (*you*) before the first person (*me*).
   - **"It would remain between me"**: Incorrect; *"between"* indicates a relationship involving two or more distinct entities.

---

### **Conclusion**
The correct standard English sentence is *"It would remain between you and me."*

**Correct Option: (A)**`,
    "images": []
  },

  "me:2015:ga:q7-s2": {
    "concept": "Verbal Aptitude: Parajumble & Chronological Narrative Coherence",
    "markdown": `### **Key Concept**
A coherent narrative describing a festival day follows strict **chronological progression** (morning $\\to$ daytime social activities $\\to$ evening sunset rituals $\\to$ night celebrations) and **anaphoric pronoun reference** (linking pronouns and demonstratives back to the actions they refer to).

---

### **Sentence Breakdown & Chronological Ordering**

- **Fixed Opening (1):** *"On Diwali, the family rises early in the morning"* (Sets the temporal starting point: early morning).
- **Sentence 5:** *"Father, mother and children visit relatives and exchange sweets"* (Follows morning preparations with daytime visits and gifting).
- **Sentence 2:** *"The whole family, including young and old enjoy doing this"* (The demonstrative phrase *"doing this"* directly refers back to visiting relatives and exchanging sweets described in sentence 5).
- **Sentence 4:** *"At sunset, the lamps are lit and family performs many rituals"* (Marks the transition to dusk/sunset: *"At sunset"*).
- **Sentence 3:** *"Children let off fireworks later in the night with their friends"* (Progresses logically to the night: *"later in the night"*).
- **Fixed Closing (6):** *"Houses looks so pretty with lighted lamps all around"* (Concludes the description of the night scene created by the lighted lamps).

---

### **Logical Sequence**
$$\\mathbf{1} \\to \\mathbf{5} \\to \\mathbf{2} \\to \\mathbf{4} \\to \\mathbf{3} \\to \\mathbf{6}$$

The sequence of the four intermediate parts is **5, 2, 4, 3**.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q8-s2": {
    "concept": "Mensuration: Sector of a Circle Rolled into a Right Circular Cone",
    "markdown": `### **Key Concept**
When a sector of a circular sheet of radius $R$ is rolled to form the curved surface of a cone:
1. The radius of the circular sheet becomes the **slant height** of the cone:
   $$l = R$$
2. The arc length of the sector becomes the **circumference of the base** of the cone:
   $$\\text{Arc length} = 2\\pi r$$
3. The vertical height $h$, base radius $r$, and slant height $l$ satisfy the Pythagorean relation:
   $$l^2 = r^2 + h^2 \\implies h = \\sqrt{l^2 - r^2}$$

---

### **Step-by-Step Derivation**

1. **Parameters of the Sheet:**
   - Radius of circular sheet: $R = 30\\text{ cm}$
   - Area removed $= 10\\%$
   - Remaining area fraction $= 100\\% - 10\\% = 90\\% = 0.90$

2. **Base Radius of the Formed Cone ($r$):**
   - The curved surface area (CSA) of the cone equals the area of the remaining sector:
     $$\\pi r l = 0.90 \\times (\\pi R^2)$$
   - Since slant height $l = R = 30\\text{ cm}$:
     $$\\pi r R = 0.90 \\pi R^2 \\implies r = 0.90 R = 0.90 \\times 30 = 27\\text{ cm}$$

3. **Height of the Cone ($h$):**
   - Using $l = 30\\text{ cm}$ and $r = 27\\text{ cm}$:
     $$h = \\sqrt{l^2 - r^2} = \\sqrt{30^2 - 27^2} = \\sqrt{900 - 729} = \\sqrt{171}\\text{ cm}$$
   - Evaluating the square root:
     $$\\sqrt{171} \\approx 13.0767\\text{ cm}$$

4. **Ratio of Base Radius to Height:**
   $$\\frac{r}{h} = \\frac{27}{\\sqrt{171}} = \\frac{27}{13.0767} \\approx 2.0647$$

Among the given integer options ($\\{1, 2, 3, 4\\}$), the value closest to $2.06$ is **$2$**.

---

### **Conclusion**
The ratio of radius to height is approximately **2**.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q9-s2": {
    "concept": "Trigonometry: Complementary Angles & Logarithmic Identities",
    "markdown": `### **Key Concept**
1. **Sum of Logarithms:**
   $$\\sum_{k=1}^{n} \\log(a_k) = \\log\\left(\\prod_{k=1}^{n} a_k\\right)$$
2. **Complementary Angle Identity:**
   $$\\tan(90^\\circ - \\theta) = \\cot \\theta = \\frac{1}{\\tan \\theta} \\implies \\tan \\theta \\cdot \\tan(90^\\circ - \\theta) = 1$$

---

### **Step-by-Step Derivation**

Let the given expression be $S$:
$$S = \\log \\tan 1^\\circ + \\log \\tan 2^\\circ + \\dots + \\log \\tan 89^\\circ$$

Applying the logarithmic product rule:
$$S = \\log\\left( \\tan 1^\\circ \\cdot \\tan 2^\\circ \\dots \\tan 44^\\circ \\cdot \\tan 45^\\circ \\cdot \\tan 46^\\circ \\dots \\tan 89^\\circ \\right)$$

Pair the terms equidistant from the extremities:
- $\\tan 1^\\circ \\cdot \\tan 89^\\circ = \\tan 1^\\circ \\cdot \\cot 1^\\circ = 1$
- $\\tan 2^\\circ \\cdot \\tan 88^\\circ = \\tan 2^\\circ \\cdot \\cot 2^\\circ = 1$
- $\\dots$
- $\\tan 44^\\circ \\cdot \\tan 46^\\circ = \\tan 44^\\circ \\cdot \\cot 44^\\circ = 1$

The unpaired middle term is:
$$\\tan 45^\\circ = 1$$

Therefore, the entire product inside the logarithm simplifies to:
$$P = 1 \\times 1 \\times \\dots \\times 1 = 1$$

Evaluating the logarithm:
$$S = \\log(1) = 0$$

---

### **Conclusion**
The value of the expression is **0**.

**Correct Option: (D)**`,
    "images": []
  },

  "me:2015:ga:q10-s2": {
    "concept": "Logical Deduction: Temporal Constraint Interpretation & Restrictive Adverb Placement",
    "markdown": `### **Key Concept**
In formal logic and precise English syntax, the placement of the restrictive modifier **"only"** determines the scope of what is restricted:
- Placing *"only"* before a duration (*"for only one day"*) restricts the **number of days**.
- Placing *"only"* before a month (*"only in May"*) restricts the **time period/month**.

---

### **Step-by-Step Analysis**

1. **Schedule Breakdown:**
   - May has $31$ days:
     - Days 1 to 20 ($01/05/2014$ to $20/05/2014$): In Bagdogra ($20$ days).
     - Day 21 ($21/05/2014$): Travels in the morning and reaches Kochi ($1$ day).
     - Days 22 to 31 ($22/05/2014$ to $31/05/2014$): Back in Bagdogra ($10$ days).
   - Total days accounted for:
     $$20 + 1 + 10 = 31\\text{ days}$$
   - Therefore, within the entire month of May 2014, Ms. X is in Kochi on **exactly one single day** (May 21).

2. **Evaluation of Statements:**
   - **(A)** *"Ms.X will be in Kochi for one day, only in May."* — Lacks the precise restriction on the duration (*"for only one day"*).
   - **(B)** *"Ms.X will be in Kochi for only one day, only in May."* — Correctly asserts that her presence in Kochi is limited to a single day within the scope of May.
   - **(C)** *"Ms.X will be only in Kochi for one day, only in May."* — Incorrectly suggests she was *exclusively* in Kochi on that day, whereas she traveled via Mumbai on the morning of the 21st.
   - **(D)** *"Only Ms.X will be in Kochi for one day in May."* — Restricts the person (claiming no one else was in Kochi), which cannot be inferred from the premises.

---

### **Conclusion**
Statement **(B)** is the only logically valid inference.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q1-s3": {
    "concept": "Vocabulary & Contextual Word Choice",
    "markdown": `### **Key Concept**
The verb **"harbour"** (or *harbor*), when used transitively in literary and scientific contexts, means *to keep, shelter, conceal, or contain secretly within oneself* (e.g., *"the seed harbours new life"*).

---

### **Step-by-Step Analysis**

1. **Sentence Context:**
   $$\\text{\"Apparent lifelessness _________ dormant life.\"}$$
   - *"Apparent lifelessness"* describes an outward state that seems devoid of life (e.g., winter terrain, desiccated seeds, or dormant spores).
   - *"Dormant life"* describes active vital biological processes temporarily arrested or hidden beneath that motionless exterior.

2. **Evaluation of Options:**
   - **(A) "harbours":** Perfectly captures the meaning that what appears on the surface to be dead actually conceals/shelters living potential inside.
   - **(B) "leads to":** Implies causality (that being lifeless causes dormancy), which is conceptually inaccurate.
   - **(C) "supports":** Implies providing sustenance or actively nourishing, whereas lifelessness is a state rather than an active provider.
   - **(D) "affects":** Too vague and does not convey the essential paradox between appearance and hidden reality.

---

### **Conclusion**
**"harbours"** is the most precise and contextually appropriate word.

**Correct Option: (A)**`,
    "images": []
  },

  "me:2015:ga:q2-s3": {
    "concept": "English Idioms: Contextual Fitness",
    "markdown": `### **Key Concept**
An idiom is an established figurative expression whose meaning cannot be deduced merely from the literal definitions of its individual words.

---

### **Analysis of Idiom**

1. **"fish out of water"**:
   - Standard English idiom meaning *a person who feels completely out of place, uncomfortable, or awkward in an unfamiliar environment or situation*.
   - In the sentence:
     $$\\text{\"That boy from the town was a } \\underline{\\text{fish out of water}} \\text{ in the sleepy village.\"}$$
   - The boy, accustomed to urban town life, naturally feels misfit and out of place in a quiet, rural village.

2. **Analysis of Distractors:**
   - **"dog out of heard"**: Non-existent, unidiomatic phrase (also misspelling *herd*).
   - **"sheep from the heap"**: Invented rhyming phrase with no idiomatic standing.
   - **"bird from the flock"**: While birds flock together, this is not an established idiom for feeling awkward or out of place.

---

### **Conclusion**
The correct idiom is **"fish out of water"**.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2015:ga:q3-s3": {
    "concept": "Confusable Words: 'Elusive' vs. 'Allusive' vs. 'Illusory'",
    "markdown": `### **Key Concept**
Distinction between closely sounding adjectives:
1. **Elude** (verb) $\\to$ **Elusive** (adjective): Difficult to find, catch, capture, or pin down.
2. **Allude** (verb) $\\to$ **Allusive** (adjective): Containing implicit or indirect references (*allusions*).
3. **Illusion** (noun) $\\to$ **Illusory** (adjective): Based on illusion, deceptive, unreal.

---

### **Evaluation of Options**

1. **Option (A):**
   - *"When the teacher eludes to different authors, he is being elusive."*
   - Incorrect. Referring indirectly to authors uses the verb **allude** (*"alludes to"*), making the teacher's remarks **allusive** (not elusive).

2. **Option (B):**
   - *"When the thief keeps eluding the police, he is being elusive."*
   - **Correct.** The thief is actively escaping/evading (*eluding*) the authorities; therefore, he is rightly described as **elusive**.

3. **Option (C):**
   - *"Matters that are difficult to understand, identify or remember are allusive."*
   - Incorrect. Things that are hard to grasp or define are **elusive**, not allusive.

4. **Option (D):**
   - *"Mirages can be allusive, but a better way to express them is illusory."*
   - Incorrect. A mirage is an optical illusion, so it is **illusory**; it has nothing to do with literary or indirect references (*allusive*).

---

### **Conclusion**
Statement **(B)** uses the underlined word correctly.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q4-s3": {
    "concept": "Deductive Logic & Transitive Order Relations",
    "markdown": `### **Key Concept**
A strict ordering relation (such as "older than", denoted by $>$) is **transitive**:
$$\\text{If } A > B \\text{ and } B > C, \\text{ then } A > C$$

---

### **Step-by-Step Derivation**

1. **Translate the Premise Statements:**
   - Statement 1: Tanya is older than Eric.
     $$\\text{Tanya} > \\text{Eric}$$
   - Statement 2: Cliff is older than Tanya.
     $$\\text{Cliff} > \\text{Tanya}$$

2. **Apply Transitivity:**
   - Combining the two true statements:
     $$\\text{Cliff} > \\text{Tanya} > \\text{Eric} \\implies \\text{Cliff} > \\text{Eric}$$
   - This strictly establishes that **Cliff is older than Eric**.

3. **Evaluate Statement 3:**
   - Statement 3 asserts: *"Eric is older than Cliff"* ($\\text{Eric} > \\text{Cliff}$).
   - Because we have already proved $\\text{Cliff} > \\text{Eric}$, Statement 3 directly contradicts our established truth.

---

### **Conclusion**
The third statement is definitively **FALSE**.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q5-s3": {
    "concept": "Combinatorics: Round-Robin Tournament Matches",
    "markdown": `### **Key Concept**
In a round-robin league tournament where every team plays every other team exactly once, each match is uniquely determined by choosing an unordered pair of $2$ distinct teams from the total of $n$ competing teams:
$$\\text{Total Matches} = \\binom{n}{2} = \\frac{n(n - 1)}{2}$$

---

### **Step-by-Step Derivation**

1. **Identify the Number of Teams:**
   $$n = 5$$

2. **Calculate Pairwise Combinations:**
   $$\\text{Total Matches} = \\binom{5}{2} = \\frac{5 \\times 4}{2 \\times 1} = 10$$

3. **Alternative Step-by-Step Summation:**
   - Team 1 plays against Teams 2, 3, 4, 5: **4 matches**
   - Team 2 plays against Teams 3, 4, 5: **3 matches**
   - Team 3 plays against Teams 4, 5: **2 matches**
   - Team 4 plays against Team 5: **1 match**
   - Team 5 has already played all teams: **0 remaining matches**
   $$\\text{Sum} = 4 + 3 + 2 + 1 = 10\\text{ matches}$$

---

### **Conclusion**
A total of **10** matches must be held.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2015:ga:q6-s3": {
    "concept": "Grammar: Subject-Verb Agreement & Adverbial Modification",
    "markdown": `### **Key Concept**
1. **Nominal Subject Phrase:** An abstract noun phrase such as *"Increase in productivity"* correctly functions as the third-person singular grammatical subject.
2. **Adverbial Modifier:** To modify a main verb (*"reflects"*), an **adverb of manner/modality** (*"necessarily"*) is required, rather than an adjective (*"necessary"*).

---

### **Step-by-Step Analysis**

1. **Original Sentence Defect:**
   - *"Increased productivity necessary reflects..."* contains the adjective *"necessary"* immediately preceding the verb *"reflects"*, which is ungrammatical.

2. **Evaluation of Options:**
   - **(A) "Increase in productivity necessary"**: Still leaves the adjective *"necessary"* attempting to modify the verb *"reflects"*.
   - **(B) "Increase productivity is necessary"**: Creates a comma splice / run-on clause error before *"reflects"*.
   - **(C) "Increase in productivity necessarily"**:
     - Subject: *"Increase in productivity"* (singular noun phrase).
     - Adverb: *"necessarily"* (grammatically modifies the finite verb *"reflects"*).
     - Verb: *"reflects"* (singular verb agreeing with *"Increase"*).
     - Sentence reads: *"Increase in productivity necessarily reflects greater efforts made by the employees."* (Fully grammatical).
   - **(D) "No improvement required"**: Incorrect due to the original grammatical flaw.

---

### **Conclusion**
The correct replacement is **"Increase in productivity necessarily"**.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2015:ga:q7-s3": {
    "concept": "Syllogisms & Set-Theoretic Deductive Validity",
    "markdown": `### **Key Concept**
In formal syllogistic logic, a conclusion is valid if and only if it holds true in **every possible Venn diagram representation** satisfying the premises. If even one counter-model exists where the premises are true but the conclusion is false, the conclusion does not follow.

---

### **Step-by-Step Analysis**

Let the sets be:
- $M$: Managers
- $L$: Leaders
- $E$: Executives

1. **Premise Representation:**
   - **Premise I:** *"No manager is a leader"*
     $$M \\cap L = \\emptyset$$
     (The sets $M$ and $L$ are completely disjoint).
   - **Premise II:** *"All leaders are executives"*
     $$L \\subseteq E$$
     (The set of leaders is wholly contained within executives).

2. **Evaluation of Conclusions:**
   - **Conclusion I:** *"No manager is an executive"* ($M \\cap E = \\emptyset$)
   - **Conclusion II:** *"No executive is a manager"* ($E \\cap M = \\emptyset$)

3. **Constructing a Valid Counter-Model:**
   - Consider the following universe:
     $$E = \\{1, 2\\}, \\quad L = \\{1\\}, \\quad M = \\{2\\}$$
   - **Check Premise I:** $M \\cap L = \\{2\\} \\cap \\{1\\} = \\emptyset$ (Holds).
   - **Check Premise II:** $L \\subseteq E \\iff \\{1\\} \\subseteq \\{1, 2\\}$ (Holds).
   - **Check Conclusion I:** Does $M \\cap E = \\emptyset$?
     $$M \\cap E = \\{2\\} \\cap \\{1, 2\\} = \\{2\\} \\neq \\emptyset$$
     Here, manager $2$ is an executive! Thus, Conclusion I fails.
   - **Check Conclusion II:** Similarly, executive $2$ is a manager, so Conclusion II fails.

Because managers can overlap with executives outside the leader subset, neither conclusion necessarily follows.

---

### **Conclusion**
Neither conclusion I nor II follows.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2015:ga:q8-s3": {
    "concept": "Geometry: Ratio of Areas in Similar/Right Triangles",
    "markdown": `### **Key Concept**
For a right-angled triangle with perpendicular legs $a$ and $b$, the area is:
$$\\text{Area} = \\frac{1}{2} \\times a \\times b$$
When two right-angled triangles share the same right-angled vertex, the ratio of their areas is directly proportional to the product of the ratios of their respective legs.

---

### **Step-by-Step Derivation**

1. **Given Data:**
   - $\\triangle PQR$ is right-angled at $Q$.
   - $S$ is a point on side $PQ$ such that $PS : QS = 3 : 1$.
   - $T$ is a point on side $QR$ such that $RT : QT = 5 : 2$.
   - Area of right triangle $\\triangle QTS = 20\\text{ cm}^2$.
   *(Note: The condition $PU:UR = 1:1$ refers to the hypotenuse bisector and is extraneous to the area calculation).*

2. **Express Sides in terms of Sub-segments:**
   - For side $PQ$:
     $$\\frac{PS}{QS} = \\frac{3}{1} \\implies PQ = PS + QS = 3(QS) + QS = 4(QS)$$
     $$\\implies \\frac{PQ}{QS} = 4$$
   - For side $QR$:
     $$\\frac{RT}{QT} = \\frac{5}{2} \\implies QR = RT + QT = \\frac{5}{2}(QT) + QT = \\frac{7}{2}(QT)$$
     $$\\implies \\frac{QR}{QT} = \\frac{7}{2} = 3.5$$

3. **Ratio of the Triangle Areas:**
   - Both $\\triangle QTS$ and $\\triangle PQR$ are right-angled at vertex $Q$:
     $$\\text{Area}(\\triangle QTS) = \\frac{1}{2} \\times QS \\times QT$$
     $$\\text{Area}(\\triangle PQR) = \\frac{1}{2} \\times PQ \\times QR$$
   - Dividing the two area expressions:
     $$\\frac{\\text{Area}(\\triangle PQR)}{\\text{Area}(\\triangle QTS)} = \\frac{PQ \\times QR}{QS \\times QT} = \\left(\\frac{PQ}{QS}\\right) \\times \\left(\\frac{QR}{QT}\\right)$$
     $$\\frac{\\text{Area}(\\triangle PQR)}{\\text{Area}(\\triangle QTS)} = 4 \\times \\frac{7}{2} = 14$$

4. **Compute Area of $\\triangle PQR$:**
   $$\\text{Area}(\\triangle PQR) = 14 \\times \\text{Area}(\\triangle QTS) = 14 \\times 20 = 280\\text{ cm}^2$$

---

### **Conclusion**
The area of triangle $PQR$ is **$280\\text{ cm}^2$**.

**Correct Option: (B)**`,
    "images": [
      "/question-images/me/2015/me-2015-1660c0b9e3.webp"
    ]
  },

  "me:2015:ga:q9-s3": {
    "concept": "Combinatorics & Coordinate Geometry: Integer Grid Triangles",
    "markdown": `### **Key Concept**
The total number of configurations is found by applying the **fundamental counting principle**: counting the independent integer choices for the vertex coordinates that satisfy the geometric perpendicularity and parallelism constraints.

---

### **Step-by-Step Derivation**

1. **Given Coordinate Ranges:**
   - Integer $x$-coordinates: $-4 \\leq x \\leq 5$
     $$\\text{Count of } x\\text{-values} = 5 - (-4) + 1 = 10$$
   - Integer $y$-coordinates: $6 \\leq y \\leq 16$
     $$\\text{Count of } y\\text{-values} = 16 - 6 + 1 = 11$$
   - Total available integer lattice points $= 10 \\times 11 = 110$.

2. **Geometric Constraints on Triangle $PQR$:**
   - Right angle is located at vertex $P(x_P, y_P)$.
   - Line segment $PR$ is parallel to the $x$-axis:
     - Since $PR$ is horizontal, vertex $R$ must share the same $y$-coordinate as $P$:
       $$y_R = y_P, \\quad \\text{with } x_R \\neq x_P$$
   - Because the angle at $P$ is $90^\\circ$ and $PR$ is horizontal, side $PQ$ must be vertical (parallel to the $y$-axis):
     - Vertex $Q$ must share the same $x$-coordinate as $P$:
       $$x_Q = x_P, \\quad \\text{with } y_Q \\neq y_P$$

3. **Counting the Possible Triangles:**
   - **Step 1: Choose Vertex $P(x_P, y_P)$:**
     - $x_P$ can be any of the $10$ available integers.
     - $y_P$ can be any of the $11$ available integers.
     $$\\text{Choices for } P = 10 \\times 11 = 110$$

   - **Step 2: Choose Vertex $R(x_R, y_R)$:**
     - $y_R$ is fixed ($y_R = y_P$).
     - $x_R$ can be any of the available $x$-values *except* $x_P$ (to ensure $R \\neq P$):
     $$\\text{Choices for } R = 10 - 1 = 9$$

   - **Step 3: Choose Vertex $Q(x_Q, y_Q)$:**
     - $x_Q$ is fixed ($x_Q = x_P$).
     - $y_Q$ can be any of the available $y$-values *except* $y_P$ (to ensure $Q \\neq P$):
     $$\\text{Choices for } Q = 11 - 1 = 10$$

4. **Total Distinct Triangles:**
   $$N = (\\text{Choices for } P) \\times (\\text{Choices for } R) \\times (\\text{Choices for } Q)$$
   $$N = 110 \\times 9 \\times 10 = 9{,}900$$

---

### **Conclusion**
A total of **$9{,}900$** different triangles can be constructed.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2015:ga:q10-s3": {
    "concept": "Probability: Statistical Independence & Dependent Events",
    "markdown": `### **Key Concept**
Two events $A$ and $B$ are **statistically independent** if and only if:
$$P(A \\cap B) = P(A) \\cdot P(B)$$
If $P(A \\cap B) \\neq P(A) \\cdot P(B)$, the events are **dependent**.

---

### **Step-by-Step Derivation**

1. **Sample Space ($S$):**
   Tossing a fair coin thrice yields $2^3 = 8$ equally likely outcomes:
   $$S = \\{HHH, HHT, HTH, HTT, THH, THT, TTH, TTT\\}$$
   $$|S| = 8$$

2. **Define the Events & Their Probabilities:**
   - **Event $X$:** Head occurs in each of the first two tosses.
     $$X = \\{HHH, HHT\\} \\implies |X| = 2$$
     $$P(X) = \\frac{2}{8} = \\frac{1}{4}$$

   - **Event $Y$:** Tails occurs in the third toss.
     $$Y = \\{HHT, HTT, THT, TTT\\} \\implies |Y| = 4$$
     $$P(Y) = \\frac{4}{8} = \\frac{1}{2}$$

   - **Event $Z$:** Exactly two tails occur in three tosses.
     $$Z = \\{HTT, THT, TTH\\} \\implies |Z| = 3$$
     $$P(Z) = \\frac{3}{8}$$

3. **Check Relationships Between Events:**

   - **Check Independence of $Y$ and $Z$:**
     - Intersection $Y \\cap Z$: outcomes with exactly two tails *and* a tail on the third toss:
       $$Y \\cap Z = \\{HTT, THT\\} \\implies |Y \\cap Z| = 2$$
       $$P(Y \\cap Z) = \\frac{2}{8} = \\frac{1}{4}$$
     - Product of individual probabilities:
       $$P(Y) \\cdot P(Z) = \\frac{1}{2} \\times \\frac{3}{8} = \\frac{3}{16}$$
     - Since $\\frac{1}{4} = \\frac{4}{16} \\neq \\frac{3}{16}$:
       $$P(Y \\cap Z) \\neq P(Y) \\cdot P(Z)$$
     - **Therefore, $Y$ and $Z$ are DEPENDENT.**

   - **Check Independence of $X$ and $Y$:**
     - $X \\cap Y = \\{HHT\\} \\implies P(X \\cap Y) = \\frac{1}{8}$
     - $P(X) \\cdot P(Y) = \\frac{1}{4} \\times \\frac{1}{2} = \\frac{1}{8}$
     - $P(X \\cap Y) = P(X) \\cdot P(Y) \\implies X$ and $Y$ are **independent** (making Option A false).

   - **Check Independence of $X$ and $Z$:**
     - Outcomes in $X$ have either 0 or 1 tail; none has 2 tails.
     - $X \\cap Z = \\emptyset \\implies P(X \\cap Z) = 0 \\neq P(X)P(Z) = \\frac{3}{32}$ (making Option D false).

---

### **Conclusion**
The true statement is that **$Y$ and $Z$ are dependent**.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2014:ga:q1": {
    "concept": "English Grammar: Sequence of Tenses & Passive Voice",
    "markdown": `### **Key Concept**
In English complex sentences featuring a temporal subordinate clause introduced by conjunctions such as **"as soon as"**, the tenses of the main and subordinate clauses must harmonise according to the **sequence of tenses**:
$$\\text{Past Action in Subordinate Clause } (\\text{was filed}) \\implies \\text{Past Tense in Main Clause } (\\text{was allowed})$$

---

### **Step-by-Step Analysis**

1. **Sentence Breakdown:**
   $$\\text{\"The aircraft _________ take off as soon as its flight plan was filed.\"}$$
   - The subordinate clause *\"as soon as its flight plan was filed\"* uses the simple past passive (*was filed*), denoting a completed past occurrence.
   - The main clause must express permission granted in that same past timeframe.

2. **Evaluation of Options:**
   - **(A) "is allowed to":** Simple present tense; clashes with the past tense *was filed*.
   - **(B) "will be allowed to":** Future tense; incompatible with the completed past condition.
   - **(C) "was allowed to":** Simple past passive; grammatically and temporally consistent with *was filed*.
   - **(D) "has been allowed to":** Present perfect tense; used for past actions with current relevance, inappropriate when anchored to a specific completed past event.

---

### **Conclusion**
The correct phrase is **"was allowed to"**.

**Correct Option: (C)**`,
    "images": []
  },

  "me:2014:ga:q2": {
    "concept": "Categorical Syllogisms: Immediate Deductive Inferences",
    "markdown": `### **Key Concept**
From a universal affirmative premise (*All $A$ are $B$*) and a particular affirmative premise (*Some $A$ are $C$*), the transitive set intersection guarantees that the elements in the overlap of $A$ and $C$ also belong to $B$, proving:
$$\\text{Some } B \\text{ are } C$$

---

### **Step-by-Step Derivation**

1. **Formalise Premises in Set Notation:**
   - Let $W = \\text{Set of all women}$
   - Let $E = \\text{Set of all entrepreneurs}$
   - Let $D = \\text{Set of all doctors}$
   - **Premise 1:** *"All women are entrepreneurs"*
     $$W \\subseteq E$$
   - **Premise 2:** *"Some women are doctors"*
     $$W \\cap D \\neq \\emptyset$$

2. **Deduce the Intersection:**
   - From Premise 2, there exists at least one individual $x$ such that:
     $$x \\in W \\quad \\text{and} \\quad x \\in D$$
   - From Premise 1, since $x \\in W$ and $W \\subseteq E$:
     $$x \\in E$$
   - Combining these two facts:
     $$x \\in E \\quad \\text{and} \\quad x \\in D \\implies x \\in (E \\cap D)$$
   - Therefore, the intersection of entrepreneurs and doctors is non-empty:
     $$E \\cap D \\neq \\emptyset$$
   - In standard categorical propositions, this directly translates to:
     $$\\mathbf{\\text{\"Some entrepreneurs are doctors\"}}$$

3. **Evaluation of Distractors:**
   - **(A) "All women are doctors":** Invalid conversion from *Some women are doctors*.
   - **(B) "All doctors are entrepreneurs":** Fallacy of illicit distribution; only those doctors who are women are guaranteed to be entrepreneurs.
   - **(C) "All entrepreneurs are women":** Invalid universal conversion of Premise 1 ($W \\subseteq E$ does not imply $E \\subseteq W$).

---

### **Conclusion**
**"Some entrepreneurs are doctors"** is the only logically valid inference.

**Correct Option: (D)**`,
    "images": []
  },

  "me:2014:ga:q3": {
    "concept": "Vocabulary: Contextual Word Choice (Root Words & Collocations)",
    "markdown": `### **Key Concept**
The verb **"dispel"** (derived from Latin *dis-* 'apart' + *pellere* 'to drive') standardly collocates with nouns like *notions, myths, doubts, fears, or misconceptions*, meaning *to make a doubt, feeling, or false belief disappear*.

---

### **Step-by-Step Analysis**

1. **Context Analysis:**
   $$\\text{\"Many ancient cultures attributed disease to supernatural causes. However, modern science has largely helped _________ such notions.\"}$$
   - Ancient belief: Disease caused by supernatural forces (a false or unscientific notion).
   - Modern science: Provides empirical, scientific explanations, driving away and eliminating the archaic false belief.

2. **Evaluation of Options:**
   - **(A) "impel":** Means to urge, force, or drive someone forward to do something (e.g., *"financial need impelled him to work"*).
   - **(B) "dispel":** Means to banish, eliminate, or disprove false notions and myths. Perfectly fits the semantic context.
   - **(C) "propel":** Means to drive or push physically forward (e.g., *"a rocket propelled into space"*).
   - **(D) "repel":** Means to ward off an attack, drive away an intruder, or cause physical revulsion (e.g., *"repel mosquitoes"*).

---

### **Conclusion**
The most appropriate word is **"dispel"**.

**Correct Option: (B)**`,
    "images": []
  },

  "me:2014:ga:q4": {
    "concept": "Statistics & Data Interpretation: Measures of Dispersion & Consistency",
    "markdown": `### **Key Concept**
In statistics, **consistency** reflects the stability and uniformity of scores around their mean:
- **Absolute Dispersion (Standard Deviation $\\sigma$):** A lower standard deviation indicates that the individual scores deviate less from the average, representing less variability and higher stability.
- In competitive examinations (including GATE official keys), when evaluating consistency directly from a table of standard deviations, the batsman with the **lowest standard deviation** is taken as the most consistent.

---

### **Step-by-Step Evaluation**

1. **Given Data:**
   $$\\begin{array}{|c|c|c|} 
   \\hline \\text{Batsman} & \\text{Average } (\\mu) & \\text{Standard Deviation } (\\sigma) \\\\ 
   \\hline K & 31.2 & \\mathbf{5.21} \\\\ 
   \\hline L & 46.0 & 6.35 \\\\ 
   \\hline M & 54.4 & 6.22 \\\\ 
   \\hline N & 17.9 & 5.90 \\\\ 
   \\hline 
   \\end{array}$$

2. **Comparison of Standard Deviations:**
   $$\\sigma_K = 5.21 < \\sigma_N = 5.90 < \\sigma_M = 6.22 < \\sigma_L = 6.35$$
   - Batsman **K** has the smallest standard deviation ($\\sigma = 5.21$), indicating that his match-to-match performance has the tightest spread and lowest fluctuation.

3. **Pedagogical Note on Coefficient of Variation ($CV$):**
   - Relative variability can also be evaluated via $CV = \\frac{\\sigma}{\\mu} \\times 100\\%$:
     $$CV_K = \\frac{5.21}{31.2} \\approx 16.7\\%, \\quad CV_M = \\frac{6.22}{54.4} \\approx 11.4\\%$$
   - While relative dispersion ($CV$) favors batsman $M$, the standard examination syllabus convention considers the lowest absolute variation (standard deviation $\\sigma = 5.21$), matching the official IIT answer key.

---

### **Conclusion**
Batsman **K** is the most consistent batsman.

**Correct Option: (A)**`,
    "images": []
  },

  "me:2014:ga:q5": {
    "concept": "Number Series: Linear Recurrence Relations & Second-Order Differences",
    "markdown": `### **Key Concept**
A numerical sequence can be analyzed either via an **affine recurrence relation** $a_n = 2 a_{n-1} + c$ or through **successive differences** forming a geometric progression.

---

### **Step-by-Step Derivation**

Given the series:
$$12, \\quad 35, \\quad 81, \\quad 173, \\quad 357, \\quad \\underline{\\quad ? \\quad}$$

#### **Method 1: First Differences (Geometric Progression)**
Compute the difference between consecutive terms:
$$\\Delta_1 = 35 - 12 = 23$$
$$\\Delta_2 = 81 - 35 = 46 = 23 \\times 2$$
$$\\Delta_3 = 173 - 81 = 92 = 46 \\times 2 = 23 \\times 4$$
$$\\Delta_4 = 357 - 173 = 184 = 92 \\times 2 = 23 \\times 8$$

Notice that the difference doubles at each successive step:
$$\\Delta_n = 23 \\times 2^{n-1}$$

Therefore, the next difference must be:
$$\\Delta_5 = 184 \\times 2 = 368$$

Adding this difference to the fifth term yields:
$$\\text{Next Term} = 357 + 368 = \\mathbf{725}$$

---

#### **Method 2: Linear Recurrence Formula**
Notice that each term is obtained by doubling the preceding term and adding $11$:
$$a_2 = 2(12) + 11 = 24 + 11 = 35$$
$$a_3 = 2(35) + 11 = 70 + 11 = 81$$
$$a_4 = 2(81) + 11 = 162 + 11 = 173$$
$$a_5 = 2(173) + 11 = 346 + 11 = 357$$

Applying this rule to find $a_6$:
$$a_6 = 2(357) + 11 = 714 + 11 = \\mathbf{725}$$

---

### **Conclusion**
The next number in the series is **725**.`,
    "images": []
  },

  "me:2014:ga:q6": {
    "concept": "Alphabet Series & Modular Arithmetic: Pattern Invariance",
    "markdown": `### **Key Concept**
By mapping each letter of the English alphabet to its numerical position ($A=1, B=2, \\dots, Z=26$) under arithmetic modulo $26$, letter clusters can be tested for consistent positional differences.

---

### **Step-by-Step Derivation**

Let us map each 4-letter group to its corresponding alphabetical positions:

1. **Group 1: W, E, K, O**
   - Positions: $W=23, \\; E=5, \\; K=11, \\; O=15$
   - Differences:
     $$E - W = (5 + 26) - 23 = +8$$
     $$K - E = 11 - 5 = +6$$
     $$O - K = 15 - 11 = +4$$
   - Pattern: **$(+8, +6, +4)$**

2. **Group 2: I, Q, W, A**
   - Positions: $I=9, \\; Q=17, \\; W=23, \\; A=1$
   - Differences:
     $$Q - I = 17 - 9 = +8$$
     $$W - Q = 23 - 17 = +6$$
     $$A - W = (1 + 26) - 23 = +4$$
   - Pattern: **$(+8, +6, +4)$**

3. **Group 3: F, N, T, X**
   - Positions: $F=6, \\; N=14, \\; T=20, \\; X=24$
   - Differences:
     $$N - F = 14 - 6 = +8$$
     $$T - N = 20 - 14 = +6$$
     $$X - T = 24 - 20 = +4$$
   - Pattern: **$(+8, +6, +4)$**

4. **Group 4: N, V, B, D**
   - Positions: $N=14, \\; V=22, \\; B=2, \\; D=4$
   - Differences:
     $$V - N = 22 - 14 = +8$$
     $$B - V = (2 + 26) - 22 = +6$$
     $$D - B = 4 - 2 = \\mathbf{+2} \\quad (\\neq +4)$$
   - Pattern: **$(+8, +6, +2)$**

Groups 1, 2, and 3 strictly obey the step pattern $+8, +6, +4$, whereas Group 4 deviates at the final step with $+2$.

---

### **Conclusion**
**N,V,B,D** is the odd one out.

**Correct Option: (D)**`,
    "images": []
  },

  "me:2014:ga:q7": {
    "concept": "Rule-Based Logical Deduction: Decision Trees & Tax Eligibility Criteria",
    "markdown": `### **Key Concept**
In conditional decision problems, each individual category is assigned to a specific form according to precise eligibility constraints. Any case not covered by the explicit primary rules defaults to the catch-all category (**\"All others\"**).

---

### **Step-by-Step Rule Breakdown**

Let income be $I$:

1. **Form P:** Resident male with $I < 10\\text{ lakh}$.
2. **Form Q:** Resident female with $I < 8\\text{ lakh}$.
3. **Form R:** All individuals with $I > 10\\text{ lakh}$, **except** non-residents with $I > 15\\text{ lakh}$.
4. **Form S:** Non-residents with $I > 15\\text{ lakh}$.
5. **Form T:** **\"All others\"** (any case not captured by Forms P, Q, R, or S).

---

### **Evaluation of Options**

- **Option (A): Resident male with income Rs 9 lakh**
  - Resident male with $I = 9\\text{ lakh} < 10\\text{ lakh} \\implies$ **Form P**.

- **Option (B): Resident female with income Rs 9 lakh**
  - Gender: Female; Residency: Resident; Income: $I = 9\\text{ lakh}$.
  - Does she qualify for Form Q? No, because Form Q requires $I < 8\\text{ lakh}$ (she earns $9\\text{ lakh} \\ge 8\\text{ lakh}$).
  - Does she qualify for Form R? No, because Form R requires $I > 10\\text{ lakh}$ (she earns $9\\text{ lakh} \\le 10\\text{ lakh}$).
  - Does she qualify for Form P or S? No (she is neither male nor a non-resident).
  - Therefore, she belongs to **\"All others\"** and must fill **Form T**.

- **Option (C): Non-resident male with income Rs 16 lakh**
  - Non-resident with $I = 16\\text{ lakh} > 15\\text{ lakh} \\implies$ **Form S**.

- **Option (D): Non-resident female with income Rs 16 lakh**
  - Non-resident with $I = 16\\text{ lakh} > 15\\text{ lakh} \\implies$ **Form S**.

---

### **Conclusion**
A resident female with an annual income of Rs 9 lakh must fill **Form T**.

**Correct Option: (B)**`,
    "images": []
  }
};

const outputPath = path.resolve('data/solutions/chunks/me/chunk-ga-me-04-solutions.json');
fs.writeFileSync(outputPath, JSON.stringify(solutions, null, 2), 'utf-8');
console.log(`Successfully authored and wrote 25 solutions to ${outputPath}!`);

