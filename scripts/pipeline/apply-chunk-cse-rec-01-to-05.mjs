import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export const CHUNK_CSE_REC_01_TO_05_SOLUTIONS = {
  "go:359820": {
    concept: "Verbal Aptitude - Reading Comprehension & Logical Inference",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Reading Comprehension & Logical Inference
- **Passage Analysis**:
  - The passage states: *"Officials believe that the loss in production of the kharif crops can be recovered in the output of the rabi (winter sown) crops so that the country can achieve its food-grain production target of 291 million tons in the crop year 2019-20... They are hopeful that good rains in July-August will help the soil retain moisture for a longer period, helping winter sown crops..."*
  - The key sentiment expressed by officials is hope and belief: they *hope* that favourable soil moisture from summer rains will boost rabi crop yields and thereby compensate for earlier kharif flood losses.
- **Option Analysis**:
  - **Option A**: Incorrect. The passage states officials "believe" and are "hopeful", not that they have definitively "declared" the target *will* be met.
  - **Option B**: Incorrect. The November–February period is when winter crops are sown and grown, whereas the crop year runs through July–June.
  - **Option C**: Incorrect. Officials believe the loss *can* be recovered, which directly contradicts the claim that the target cannot be met.
  - **Option D**: Correct. Officials express reasoned optimism ("believe" / "hopeful") that the national food-grain target can still be achieved through a compensating bumper rabi harvest.

Therefore, the correct answer is **Option D (Officials hope that the food-grain production target will be met due to a good rabi produce)**.`,
    images: []
  },
  "go:359816": {
    concept: "Economics & Monetary Policy - Central Bank Repo Rate Mechanism",
    markdown: `- **Concept / Subtopic**: Economics & Monetary Policy - Central Bank Repo Rate Mechanism
- **Given Definitions**:
  - Repo rate is the rate of interest at which the central bank (RBI) lends short-term liquidity to commercial banks.
  - Reverse repo rate is the rate at which the central bank borrows money from commercial banks.
- **Analytical Step-by-Step Derivation**:
  1. When the central bank **decreases the repo rate**, borrowing funds from the RBI becomes cheaper for commercial banks.
  2. Because the cost of funds to banks decreases, commercial banks pass on this benefit by reducing interest rates charged to their borrowers (cost of borrowing decreases).
  3. Lower lending rates stimulate consumer credit and business investment, which **increases overall lending** by commercial banks.
  4. Conversely, an increase in repo rate raises the cost of funds, increasing the cost of borrowing and dampening lending.
  5. Therefore, a decrease in repo rate decreases the cost of borrowing and increases bank lending.

Therefore, the correct answer is **Option D (Decrease in repo rate will decrease cost of borrowing and increase lending by commercial banks)**.`,
    images: []
  },
  "go:359812": {
    concept: "Quantitative Aptitude - Relative Speed & Motion in Opposite Directions",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Relative Speed & Motion in Opposite Directions
- **Given Parameters**:
  - Total distance between Delhi and Agra: $D = 233\\text{ km}$.
  - Car $P$ departs Delhi towards Agra at constant speed $v_P$.
  - Car $Q$ departs Agra towards Delhi at constant speed $v_Q$ along the same route, starting $t_{\\text{delay}} = 1\\text{ hour}$ after Car $P$.
  - Speed relationship: $v_P = v_Q + 10\\text{ km/h}$.
  - The two cars cross each other $t_Q = 75\\text{ minutes} = \\frac{75}{60} = 1.25\\text{ hours}$ after Car $Q$ starts.
- **Step-by-Step Analytical Derivation**:
  1. **Total Travel Time for Each Car at Crossing**:
     - Time traveled by Car $Q$: $t_Q = 1.25\\text{ hours}$.
     - Time traveled by Car $P$: $t_P = 1 + 1.25 = 2.25\\text{ hours}$.
  2. **Total Distance Equation**:
     - Since the cars move towards each other between Delhi and Agra, the sum of their distances equals the total separation $D$:
       $$d_P + d_Q = D$$
       $$v_P \\cdot t_P + v_Q \\cdot t_Q = 233$$
  3. **Substitute $v_P = v_Q + 10$**:
     $$(v_Q + 10)(2.25) + v_Q(1.25) = 233$$
     $$2.25 v_Q + 22.5 + 1.25 v_Q = 233$$
     $$3.5 v_Q + 22.5 = 233$$
     $$3.5 v_Q = 233 - 22.5 = 210.5$$
     $$v_Q = \\frac{210.5}{3.5} = \\frac{2105}{35} = \\frac{421}{7} \\approx 60.142857\\text{ km/h}$$
  4. **Calculate Distance Traveled by Car $Q$**:
     $$d_Q = v_Q \\cdot t_Q = \\left(\\frac{421}{7}\\right) \\cdot 1.25 = \\frac{526.25}{7} \\approx 75.17857\\text{ km} \\approx 75.2\\text{ km}$$

Therefore, the correct answer is **Option B ($75.2$)**.`,
    images: []
  },
  "go:359864": {
    concept: "Verbal Aptitude - Word Analogy & Nominal Suffixation",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Nominal Suffixation
- **Analogy Structure**:
  - $\\text{Verb} : \\text{Noun}$
  - The base verb **Fuse** forms its corresponding abstract action/state noun as **Fusion** (addition of suffix *-ion* with stem modification).
  - Similarly, the base verb **Use** forms its corresponding standard noun denoting the act, manner, or amount of using as **Usage** (addition of suffix *-age*).
- **Distractor Analysis**:
  - **Option A (Usage)**: Correct noun form denoting the act, custom, or ongoing practice of using.
  - **Option B (User)**: Denotes an agent (the person who uses), not the abstract action/process noun.
  - **Option C (Uses)**: Third-person singular present tense of the verb or plural noun, not a derived nominal form.
  - **Option D (Usion)**: Non-existent, ungrammatical English coinage.

Therefore, the correct answer is **Option A (Usage)**.`,
    images: []
  },
  "go:359861": {
    concept: "Reasoning & Coding - Alphabetic Cipher Mapping",
    markdown: `- **Concept / Subtopic**: Reasoning & Coding - Alphabetic Cipher Mapping
- **Given Mapping**:
  - The decimal digits $0, 1, 2, \\dots, 9$ are mapped sequentially to consecutive English uppercase letters starting at $O$:
    $$\\begin{aligned}
    0 &\\mapsto O \\\\
    1 &\\mapsto P \\\\
    2 &\\mapsto Q \\\\
    3 &\\mapsto R \\\\
    4 &\\mapsto S \\\\
    5 &\\mapsto T \\\\
    6 &\\mapsto U \\\\
    7 &\\mapsto V \\\\
    8 &\\mapsto W \\\\
    9 &\\mapsto X
    \\end{aligned}$$
- **Encoding Target Number $45$**:
  - The tens digit $4$ maps to letter **$S$**.
  - The units digit $5$ maps to letter **$T$**.
  - Combining both digits gives the encoded string **$ST$**.

Therefore, the correct answer is **Option B ($ST$)**.`,
    images: []
  },
  "go:359858": {
    concept: "Quantitative Aptitude - Algebraic System of Equations",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Algebraic System of Equations
- **Given Information**:
  - Let the two positive numbers be $x$ and $y$ ($x, y > 0$).
  - Their sum is:
    $$x + y = 100$$
  - Subtracting $5$ from each number yields $(x - 5)$ and $(y - 5)$.
  - The product of these resulting numbers is zero:
    $$(x - 5)(y - 5) = 0$$
- **Analytical Step-by-Step Derivation**:
  1. A product of two real factors equals zero if and only if at least one factor is zero:
     $$x - 5 = 0 \\quad \\text{or} \\quad y - 5 = 0$$
     $$x = 5 \\quad \\text{or} \\quad y = 5$$
  2. If $x = 5$, substitute into the sum equation:
     $$5 + y = 100 \\implies y = 95$$
  3. If $y = 5$, by symmetry $x = 95$.
  4. Thus, the original pair of numbers is $\\{5, 95\\}$.
  5. Among the given options $\\{80, 85, 90, 95\\}$, the number **$95$** is present.

Therefore, the correct answer is **Option D ($95$)**.`,
    images: []
  },
  "go:359856": {
    concept: "Verbal Aptitude - Reading Comprehension & Theory-to-Practice Inference",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Reading Comprehension & Theory-to-Practice Inference
- **Passage Analysis**:
  - Sentence 1: *"Howard Gardner expounds that human intelligence can be subcategorized into multiple kinds, in such a way that individuals differ with respect to their relative competence in each kind."* (Gardner's psychological formulation).
  - Sentence 2: *"Based on this theory, modern educationists insist on prescribing multi-dimensional curriculum and evaluation parameters that enable development and assessment of multiple intelligences."* (The practical instructional policy advocated by modern educationists).
- **Option Analysis**:
  - **Option A**: Incorrect. The passage explicitly attributes the insistence on curriculum and evaluation reform to **modern educationists**, not Gardner himself.
  - **Option B**: Incorrect. Gardner expounds the theory; the text does not say he wants to develop and assess educational curricula.
  - **Option C**: Incorrect. Modern educationists apply the theory to design curricula, rather than seeking to develop the psychological theory itself.
  - **Option D**: Correct. The text directly states that modern educationists insist on prescribing a multi-dimensional curriculum and evaluation parameters based on Gardner's model.

Therefore, the correct answer is **Option D (Modern educationists insist that the teaching curriculum and evaluation needs to be multi-dimensional)**.`,
    images: []
  },
  "go:359852": {
    concept: "Quantitative Aptitude - Arithmetic Progression & Arithmetic Means",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Arithmetic Progression & Arithmetic Means
- **Given Parameters**:
  - Initial boundary term: $a = T_1 = 2$.
  - Final boundary term: $T_9 = 34$.
  - Seven arithmetic means $A_1, A_2, \\dots, A_7$ are inserted between $2$ and $34$, producing a total of $n = 9$ terms in Arithmetic Progression (AP).
- **Step-by-Step Analytical Derivation**:
  1. **Common Difference $d$**:
     $$T_9 = a + (9 - 1)d = 2 + 8d = 34$$
     $$8d = 32 \\implies d = 4$$
  2. **Values of the 7 Inserted Numbers**:
     - $A_1 = 2 + 4 = 6$
     - $A_2 = 6 + 4 = 10$
     - $A_3 = 10 + 4 = 14$
     - $A_4 = 14 + 4 = 18$
     - $A_5 = 18 + 4 = 22$
     - $A_6 = 22 + 4 = 26$
     - $A_7 = 26 + 4 = 30$
  3. **Sum of the 7 Inserted Arithmetic Means**:
     - By standard AP property, the sum of $k$ arithmetic means between $a$ and $b$ equals $k$ times the average of the two endpoints:
       $$\\sum_{i=1}^{7} A_i = 7 \\times \\left(\\frac{a + b}{2}\\right) = 7 \\times \\left(\\frac{2 + 34}{2}\\right) = 7 \\times 18 = 126$$
     - Direct verification: $6 + 10 + 14 + 18 + 22 + 26 + 30 = 126$.

Therefore, the correct answer is **Option C ($126$)**.`,
    images: []
  },
  "go:359850": {
    concept: "Quantitative Aptitude - Cyclicity of Units Digits & Modular Arithmetic",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Cyclicity of Units Digits & Modular Arithmetic
- **Problem Statement**:
  - Determine the unit's digit in the large power expression:
    $$E = 26591749^{110016}$$
- **Step-by-Step Analytical Derivation**:
  1. The unit's digit of any integer power $A^B$ depends strictly on the unit's digit of the base $A$ modulo $10$:
     $$26591749 \\equiv 9 \\pmod{10}$$
     $$E \\equiv 9^{110016} \\pmod{10}$$
  2. **Cyclicity of Powers of 9**:
     - $9^1 = 9 \\equiv 9 \\pmod{10}$ (odd exponent)
     - $9^2 = 81 \\equiv 1 \\pmod{10}$ (even exponent)
     - $9^3 = 729 \\equiv 9 \\pmod{10}$
     - $9^4 = 6561 \\equiv 1 \\pmod{10}$
     - In general:
       $$9^k \\pmod{10} = \\begin{cases} 9, & \\text{if } k \\text{ is odd} \\\\ 1, & \\text{if } k \\text{ is even} \\end{cases}$$
  3. **Evaluate the Given Exponent**:
     - The exponent is $k = 110016$, which is an even integer ($110016 \\equiv 0 \\pmod 2$).
     - Therefore:
       $$9^{110016} \\equiv 1 \\pmod{10}$$
  4. Thus, the unit's place is **$1$**.

Therefore, the correct answer is **Option A ($1$)**.`,
    images: []
  },
  "go:359848": {
    concept: "Data Interpretation - Pie Chart Percentage Comparison",
    markdown: `- **Concept / Subtopic**: Data Interpretation - Pie Chart Percentage Comparison
- **Given Data from Expenditure Pie-Chart**:
  - The family's monthly budget allocations are:
    - Education: $15\\%$
    - Transport: $10\\%$
- **Problem Statement**:
  - Find the percentage extra money spent on education **as compared to transport**:
    $$\\text{Percentage Extra} = \\frac{\\text{Expenditure}_{\\text{Education}} - \\text{Expenditure}_{\\text{Transport}}}{\\text{Expenditure}_{\\text{Transport}}} \\times 100\\%$$
- **Step-by-Step Analytical Derivation**:
  1. Let the total monthly expenditure be $E_{\\text{total}}$.
  2. Expenditure on Education: $E_{\\text{edu}} = 0.15 E_{\\text{total}}$.
  3. Expenditure on Transport: $E_{\\text{trans}} = 0.10 E_{\\text{total}}$.
  4. Extra amount spent on education:
     $$\\Delta E = 0.15 E_{\\text{total}} - 0.10 E_{\\text{total}} = 0.05 E_{\\text{total}}$$
  5. Compute percentage relative to transport baseline:
     $$\\text{Relative Percentage} = \\frac{0.05 E_{\\text{total}}}{0.10 E_{\\text{total}}} \\times 100\\% = \\frac{5}{10} \\times 100\\% = 50\\%$$

Therefore, the correct answer is **Option C ($50$)**.`,
    images: []
  },
  "go:359846": {
    concept: "Verbal Aptitude - Preposition Collocations",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Preposition Collocations
- **Sentence Analysis**:
  - *"Rescue teams deployed _______ disaster hit areas combat _______ a lot of difficulties to save the people."*
  - **First Blank**: Rescue teams are sent into or positioned within a geographical territory: the standard preposition for spatial presence within an area or region is **in** (*deployed in disaster hit areas*).
  - **Second Blank**: The verb *combat* when used intransitively with adversities/struggles takes the prepositional phrase **with** (*combat with a lot of difficulties*, meaning contend or grapple with).
  - Combining both prepositions yields the grammatically sound pair **in, with**.

Therefore, the correct answer is **Option B (in, with)**.`,
    images: []
  },
  "go:359844": {
    concept: "Verbal Aptitude - Synonyms & Contextual Meaning",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Synonyms & Contextual Meaning
- **Sentence Context**:
  - *"Now-a-days, most children have a tendency to belittle the legitimate concerns of their parents."*
  - The verb **belittle** means to dismiss, run down, disparage, or treat something as unimportant or of little worth.
- **Option Analysis**:
  - **Option A (disparage)**: Directly means to regard or represent as being of little worth; exact synonym of belittle.
  - **Option B (applaud)**: Antonym; means to praise or express strong approval.
  - **Option C (reduce)**: Means to decrease in size, amount, or degree, but does not capture the psychological deprecation of concerns.
  - **Option D (begrudge)**: Means to give or concede reluctantly or to envy someone the possession of something.

Therefore, the correct answer is **Option A (disparage)**.`,
    images: []
  },
  "go:359842": {
    concept: "Verbal Aptitude - Word Analogy & Negative Prefixes",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Negative Prefixes
- **Analogy Structure**:
  - $\\text{Adjective} : \\text{Antonym (formed via prefix)}$
  - The adjective **Partial** forms its direct antonym with the negative prefix *im-* $\\to$ **Impartial**.
  - Similarly, the adjective **Popular** forms its conventional antonym with the negative prefix *un-* $\\to$ **Unpopular**.
- **Distractor Analysis**:
  - *Impopular*, *Dispopular*, and *Mispopular* are incorrect morphological formations in standard English.
  - The recognized standard antonym is **Unpopular**.

Therefore, the correct answer is **Option D (Unpopular)**.`,
    images: []
  },
  "go:359840": {
    concept: "Analytical Aptitude - Spatial Constraints & Office Space Allocation",
    markdown: `- **Concept / Subtopic**: Analytical Aptitude - Spatial Constraints & Office Space Allocation
- **Given Constraints**:
  1. $P$ wanted a room adjacent to the lab.
  2. $Q$ wanted to be close to the lift.
  3. $R$ wanted a view of the playground.
  4. $S$ wanted a corner office.
- **Floor Plan Evaluation**:
  - Examining the four floor layouts:
    - In **Option C**:
      - $P$ is placed directly adjacent to the laboratory room.
      - $Q$ is located right next to the elevator/lift lobby.
      - $R$'s office window opens directly towards the playground outside.
      - $S$ occupies one of the outer corner perimeter suites.
    - Other options violate one or more specific preferences (e.g., placing $P$ away from the lab, or placing $S$ in a non-corner central suite).
  - Therefore, layout C satisfies every faculty preference simultaneously.

Therefore, the correct answer is **Option C**.`,
    images: []
  },
  "go:359838": {
    concept: "Quantitative Aptitude - Function Composition & Exponentiation",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Function Composition & Exponentiation
- **Given Function**:
  - $f(x) = x^2$ for all $x \\in (-\\infty, \\infty)$.
- **Step-by-Step Analytical Derivation**:
  1. **First Composition**:
     $$f(f(x)) = f\\left(x^2\\right) = \\left(x^2\\right)^2 = x^4$$
  2. **Second Composition**:
     $$f(f(f(x))) = f\\left(x^4\\right) = \\left(x^4\\right)^2 = x^8$$
  3. **Divide by $f(x)$**:
     $$\\frac{f(f(f(x)))}{f(x)} = \\frac{x^8}{x^2} = x^{8 - 2} = x^6$$
  4. **Express in Terms of $f(x)$**:
     - Since $f(x) = x^2$:
       $$(f(x))^1 = x^2$$
       $$(f(x))^2 = (x^2)^2 = x^4$$
       $$(f(x))^3 = (x^2)^3 = x^6$$
       $$(f(x))^4 = (x^2)^4 = x^8$$
     - Therefore:
       $$\\frac{f(f(f(x)))}{f(x)} = x^6 = (f(x))^3$$

Therefore, the correct answer is **Option C ($(f(x))^3$)**.`,
    images: []
  },
  "go:359836": {
    concept: "Economics & Finance - Fisher Equation & Real vs Nominal Interest Rates",
    markdown: `- **Concept / Subtopic**: Economics & Finance - Fisher Equation & Real vs Nominal Interest Rates
- **Governing Principle**:
  - The real interest rate $r$ is approximated by the Fisher relation:
    $$r \\approx i - \\pi^e$$
    where $i$ is the nominal interest rate and $\\pi^e$ is the expected rate of inflation.
- **Analytical Step-by-Step Derivation**:
  1. Under conditions of **high inflation** (large $\\pi^e$), the subtracted inflation component increases significantly, driving down the real cost of debt $r$.
  2. A borrower repays loans with currency that has depreciated substantially in purchasing power relative to when the principal was borrowed.
  3. Consequently, the borrower enjoys a lower real interest burden and gains a net financial transfer (the borrower is benefited).
  4. Lenders, conversely, suffer because the real purchasing power of their received interest and principal payments is eroded by inflation.
  5. Thus, under high inflation, real interest rates are low and borrowers get benefited.

Therefore, the correct answer is **Option A (Under high inflation, real interest rate is low and borrowers get benefited)**.`,
    images: []
  },
  "go:359832": {
    concept: "Quantitative Aptitude - Arithmetic Progressions & Sum Ratios",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Arithmetic Progressions & Sum Ratios
- **Given Quantities**:
  - $S_1$: Sum of the odd positive integers from $1$ to $100$.
  - $S_2$: Sum of the even positive integers from $150$ to $200$.
- **Step-by-Step Analytical Derivation**:
  1. **Compute $S_1$ (Odd Integers from $1$ to $100$)**:
     - The sequence is $1, 3, 5, \\dots, 99$.
     - Number of terms: $n_1 = 50$.
     - By standard formula, the sum of the first $n$ odd positive integers is $n^2$:
       $$S_1 = 50^2 = 2500$$
  2. **Compute $S_2$ (Even Integers from $150$ to $200$)**:
     - The sequence is $150, 152, 154, \\dots, 200$.
     - First term $a = 150$, last term $l = 200$, common difference $d = 2$.
     - Number of terms:
       $$n_2 = \\frac{200 - 150}{2} + 1 = \\frac{50}{2} + 1 = 25 + 1 = 26$$
     - Sum of the AP:
       $$S_2 = \\frac{n_2}{2}(a + l) = \\frac{26}{2}(150 + 200) = 13 \\times 350 = 4550$$
  3. **Calculate the Ratio $\\frac{S_1}{S_2}$**:
     $$\\frac{S_1}{S_2} = \\frac{2500}{4550} = \\frac{250}{455} = \\frac{50}{91}$$

Therefore, the correct answer is **Option C ($50:91$)**.`,
    images: []
  },
  "go:359830": {
    concept: "Quantitative Aptitude - Set Theory & Principle of Inclusion-Exclusion",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Set Theory & Principle of Inclusion-Exclusion
- **Given Parameters**:
  - Total number of students in school: $|U| = 1000$.
  - Number of students playing chess: $|C| = 300$.
  - Number of students playing football: $|F| = 600$.
  - Number of students playing both sports: $|C \\cap F| = 50$.
- **Step-by-Step Analytical Derivation**:
  1. **Union of Chess and Football Players**:
     - By the Principle of Inclusion-Exclusion:
       $$|C \\cup F| = |C| + |F| - |C \\cap F|$$
       $$|C \\cup F| = 300 + 600 - 50 = 850$$
  2. **Students Playing Neither Sport**:
     - The number of students who play neither chess nor football is the size of the complement $(C \\cup F)^c$:
       $$|\\text{Neither}| = |U| - |C \\cup F| = 1000 - 850 = 150$$

Therefore, the correct answer is **Option B ($150$)**.`,
    images: []
  },
  "go:359783": {
    concept: "Verbal Aptitude - Preposition Usage with Causes of Death",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Preposition Usage with Causes of Death
- **Sentence Structure**:
  - *"The untimely loss of life is a cause of serious global concern as thousands of people get killed _______ accidents every year while many others die _______ diseases like cardiovascular disease, cancer, etc."*
- **Collocational Rules in English Grammar**:
  1. **Killed in accidents**: Violent, sudden, or external traumatic events take the preposition **in** (*killed in an accident*, *killed in a crash*, *killed in action*).
  2. **Die of a disease**: Natural internal mortality caused by an illness or pathogen takes the preposition **of** (*die of cancer*, *die of malaria*, *die of heart failure*).
  3. Combining both clauses gives the preposition pair **in, of**.

Therefore, the correct answer is **Option A (in, of)**.`,
    images: []
  },
  "go:359780": {
    concept: "Verbal Aptitude - Correlative Conjunctions",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Correlative Conjunctions
- **Sentence Structure**:
  - *"He was not only accused of theft _______ of conspiracy."*
- **Grammar Rule**:
  - The correlative conjunction **not only** must be paired with **but also** to join parallel grammatical structures.
  - In this sentence, the parallel prepositional phrases are:
    $$\\text{not only [accused of theft]} \\quad \\textbf{but also} \\quad \\text{[of conspiracy]}$$
  - The other alternatives (*rather*, *but even*, *rather than*) violate the required correlative syntax.

Therefore, the correct answer is **Option B (but also)**.`,
    images: []
  },
  "go:359778": {
    concept: "Verbal Aptitude - Word Analogy & Antonyms",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Antonyms
- **Analogy Relationship**:
  - $\\text{Word} : \\text{Antonym}$
  - **Explicit** (clearly stated and outwardly expressed) is the direct antonym of **Implicit** (implied or hidden without being plainly expressed).
  - Similarly, the verb **Express** (to put thoughts, feelings, or impulses outward into words or action) has as its direct antonym **Repress** (to restrain, inhibit, or force feelings inward).
- **Distractor Analysis**:
  - *Impress*: To make an impact on someone; not an antonym of express.
  - *Compress*: To squeeze or flatten; relates to physical volume.
  - *Suppress*: Means to forcefully put an end to something, but *repress* specifically mirrors the inward psychological counterpart of *express*.

Therefore, the correct answer is **Option B (Repress)**.`,
    images: []
  },
  "go:359775": {
    concept: "Verbal Aptitude - Reading Comprehension & Grievance Identification",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Reading Comprehension & Grievance Identification
- **Passage Analysis**:
  - *"The Canadian constitution requires that equal importance be given to English and French. Last year, Air Canada lost a lawsuit... after they filed complaints about formal in-flight announcements in English lasting 15 seconds, as opposed to informal 5 second messages in French."*
- **Deduction of the Core Grievance**:
  - The disparity cited in the complaint was the duration and formality of the messages: English announcements lasted 15 seconds, whereas French ones were truncated to just 5 seconds.
  - Thus, the French announcements received unequal, diminished treatment compared to the significantly longer English announcements.
  - The couple's complaint was grounded specifically on the English announcements being **longer** than the French ones, violating equal constitutional status.

Therefore, the correct answer is **Option C (the English announcements being longer than the French ones)**.`,
    images: []
  },
  "go:359771": {
    concept: "Calculus & Real Analysis - Superadditive Functions",
    markdown: `- **Concept / Subtopic**: Calculus & Real Analysis - Superadditive Functions
- **Definition of Superadditivity**:
  - A real-valued function $f(x)$ is **superadditive** over domain $D$ if for all $x_1, x_2 \\in D$:
    $$f(x_1 + x_2) \\ge f(x_1) + f(x_2)$$
- **Testing the Given Candidate Functions for $x_1, x_2 > 1$**:
  1. **For $f(x) = e^x$**:
     $$f(x_1 + x_2) = e^{x_1 + x_2} = e^{x_1} \\cdot e^{x_2}$$
     - Since $x_1, x_2 > 1$, we know $e^{x_1} > e^1 \\approx 2.718 > 2$ and $e^{x_2} > e^1 > 2$.
     - For any real numbers $u, v > 2$:
       $$(u - 1)(v - 1) > 1 \\implies uv - u - v + 1 > 1 \\implies uv > u + v$$
     - Setting $u = e^{x_1}$ and $v = e^{x_2}$, we have:
       $$e^{x_1 + x_2} = e^{x_1} \\cdot e^{x_2} > e^{x_1} + e^{x_2}$$
     - Thus, $f(x_1 + x_2) > f(x_1) + f(x_2)$, confirming **$e^x$ is superadditive**.
  2. **Distractor Analysis**:
     - $\\sqrt{x}$: Subadditive because $\\sqrt{x_1 + x_2} < \\sqrt{x_1} + \\sqrt{x_2}$ for all positive numbers.
     - $1/x$: Subadditive because $\\frac{1}{x_1 + x_2} < \\frac{1}{x_1} + \\frac{1}{x_2}$.
     - $e^{-x}$: Subadditive because $e^{-(x_1 + x_2)} = e^{-x_1} e^{-x_2} < e^{-x_1} + e^{-x_2}$.

Therefore, the correct answer is **Option A ($e^{x}$)**.`,
    images: []
  },
  "go:359768": {
    concept: "Verbal Aptitude - Chronological Ordering & Causal Precedence",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Chronological Ordering & Causal Precedence
- **Passage Analysis**:
  - *"The global financial crisis in 2008 is considered to be the most serious... which started with the sub-prime lending crisis in USA in 2007."*
  - *"The sub-prime lending crisis led to the banking crisis in 2008 with the collapse of Lehman Brothers in 2008."*
  - *"The sub-prime lending refers to the provision of loans... and it arises because of excess liquidity following the East Asian crisis."*
- **Reconstructing the Temporal and Causal Sequence**:
  1. **Root Origin**: Excess liquidity arose following the **East Asian crisis** (late 1990s).
  2. **Second Stage**: Excess liquidity encouraged lax lending, culminating in the **subprime lending crisis** (2007).
  3. **Third Stage**: Subprime defaults triggered a systemic **banking crisis** (collapse of Lehman Brothers, 2008).
  4. **Final Culmination**: The banking collapse expanded into the worldwide **global financial crisis** (2008).
- **Correct Sequence**:
  $$\\text{East Asian crisis} \\to \\text{subprime lending crisis} \\to \\text{banking crisis} \\to \\text{global financial crisis}$$

Therefore, the correct answer is **Option A (East Asain crisis$\\rightarrow$ subprime lending crisis$\\rightarrow$banking crisis$\\rightarrow$global financial crisis)**.`,
    images: []
  },
  "go:359762": {
    concept: "Algebra - Quadratic Equation with Equal Roots",
    markdown: `- **Concept / Subtopic**: Algebra - Quadratic Equation with Equal Roots
- **Given Quadratic Equation**:
  $$a x^2 - b x + c = 0 \\quad (a \\neq 0)$$
  with real coefficients $a, b, c$.
- **Equal Roots Condition**:
  - The equation has two equal roots, both equal to $\\beta$.
  - The discriminant must be zero:
    $$\\Delta = (-b)^2 - 4ac = 0 \\implies b^2 = 4ac$$
- **Step-by-Step Analytical Derivation**:
  1. The value of the repeated root is:
     $$\\beta = \\frac{-(-b)}{2a} = \\frac{b}{2a}$$
  2. Square both sides:
     $$\\beta^2 = \\left(\\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2}$$
  3. Substitute $b^2 = 4ac$:
     $$\\beta^2 = \\frac{4ac}{4a^2} = \\frac{c}{a}$$
  4. Compute $\\beta^3 = \\beta \\cdot \\beta^2$:
     $$\\beta^3 = \\left(\\frac{b}{2a}\\right) \\cdot \\left(\\frac{c}{a}\\right) = \\frac{bc}{2a^2}$$
  5. This matches option C identically.

Therefore, the correct answer is **Option C ($\\beta^{3} =bc/\\left ( 2a^{2} \\right )$)**.`,
    images: []
  },
  "go:359733": {
    concept: "Verbal Aptitude - Subject-Verb Agreement with Intervening Phrases",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Subject-Verb Agreement with Intervening Phrases
- **Sentence 1 Analysis**:
  - *"This book, including all its chapters, _______ interesting."*
  - The true subject is the singular noun **This book**.
  - The parenthetical prepositional phrase *including all its chapters* set off by commas does not alter the grammatical number of the subject.
  - Hence, the singular verb **is** must be used.
- **Sentence 2 Analysis**:
  - *"The students as well as the instructor _______ in agreement about it."*
  - In standard English syntax with the correlative phrase *as well as*, the verb agrees in number with the **first (primary) subject**.
  - Here, the first subject is plural: **The students**.
  - Hence, the plural verb **are** must be used.
- **Combining Both Clauses**:
  - The correct pair of verbs is **is, are**.

Therefore, the correct answer is **Option C (is, are)**.`,
    images: []
  },
  "go:359730": {
    concept: "Verbal Aptitude - Verb Complementation & Preposition Selection",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Verb Complementation & Preposition Selection
- **Grammar Rule**:
  - The verb **prohibit** takes the fixed preposition **from** followed by a gerund (verb + *-ing*):
    $$\\text{prohibit } [\\text{someone}] \\textbf{ from } [\\text{doing something}]$$
  - In passive voice:
    $$\\text{be prohibited } \\textbf{from } [\\text{gerund}]$$
- **Application to the Sentence**:
  - *"People were prohibited _______ their vehicles near the entrance of the main administrative building."*
  - Applying the rule yields:
    $$\\text{prohibited } \\textbf{from parking } \\text{their vehicles}$$
  - The infinitive constructions (*to park*, *to have parked*) and bare participle (*parking*) are ungrammatical following *prohibited*.

Therefore, the correct answer is **Option B (from parking)**.`,
    images: []
  },
  "go:359728": {
    concept: "Verbal Aptitude - Word Analogy & Reversal Prefixes",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Reversal Prefixes
- **Analogy Relationship**:
  - $\\text{Action} : \\text{Reversal / Negative Form}$
  - The base verb **Do** forms its reversal/antonym by prefixing *un-* $\\to$ **Undo**.
  - For the verb/noun **Trust**, the standard antonym denoting lack of trust or skepticism is **Distrust** (formed using the recognized negative prefix *dis-*).
- **Distractor Analysis**:
  - *Entrust*: Means to assign the responsibility for doing something to someone; a synonym/derivative, not an antonym.
  - *Intrust*: Archaic spelling of entrust.
  - *Untrust*: Non-standard, obsolete form; standard modern English exclusively uses *distrust*.

Therefore, the correct answer is **Option C (Distrust)**.`,
    images: []
  },
  "go:359726": {
    concept: "Verbal Aptitude - Vocabulary & Financial Metaphors",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Vocabulary & Financial Metaphors
- **Sentence Context**:
  - *"Stock markets _______ at the news of the coup."*
  - A political coup d'état creates acute instability, triggering panic selling in financial markets and causing equity indices to fall rapidly and precipitously.
- **Option Analysis**:
  - **Option A (poised)**: Means composed, balanced, or suspended; contradicts the violent disruption of a coup.
  - **Option B (plunged)**: Means fell suddenly and uncontrollably; standard financial terminology for a sharp market crash.
  - **Option C (plugged)**: Means blocked or stopped up.
  - **Option D (probed)**: Means investigated or explored physically.

Therefore, the correct answer is **Option B (plunged)**.`,
    images: []
  },
  "go:359724": {
    concept: "Quantitative Aptitude - Combinatorics & Team Selection",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Combinatorics & Team Selection
- **Problem Statement**:
  - Given four individuals: $\\{P, Q, R, S\\}$.
  - We wish to form teams containing $Q$ as a mandatory member, such that the team size strictly exceeds $1$ (team size $k \\ge 2$).
- **Step-by-Step Analytical Derivation**:
  1. Since $Q$ must belong to every team, selecting a team corresponds to choosing a non-empty subset of the remaining 3 individuals $\\{P, R, S\\}$ to join $Q$.
  2. If we choose $m$ additional members from $\\{P, R, S\\}$, the total team size becomes $1 + m$.
  3. The condition "size exceeding one" requires $1 + m > 1 \\implies m \\ge 1$.
  4. The number of non-empty subsets of a 3-element set is:
     $$2^3 - 1 = 8 - 1 = 7$$
  5. **Explicit Enumeration of the 7 Teams**:
     - Teams of size 2 ($m=1$): $\\{Q, P\\}, \\{Q, R\\}, \\{Q, S\\}$ (3 teams)
     - Teams of size 3 ($m=2$): $\\{Q, P, R\\}, \\{Q, P, S\\}, \\{Q, R, S\\}$ (3 teams)
     - Team of size 4 ($m=3$): $\\{Q, P, R, S\\}$ (1 team)
     - Total valid teams: $3 + 3 + 1 = 7$.

Therefore, the correct answer is **Option C ($7$)**.`,
    images: []
  },
  "go:359722": {
    concept: "General Aptitude - Banking Regulations & NPA Holding Period",
    markdown: `- **Concept / Subtopic**: General Aptitude - Banking Regulations & NPA Holding Period
- **Given Information**:
  - Initial holding period of loans in $1993$: $4\\text{ quarters} = 360\\text{ days}$.
  - Duration of one calendar/financial quarter: $\\frac{360}{4} = 90\\text{ days}$.
  - The definition of NPA was revised **thrice** between $1993$ and $2004$.
  - At each revision, the holding period was reduced by **one quarter**.
- **Step-by-Step Analytical Derivation**:
  1. Initial period ($1993$): $4\\text{ quarters} = 360\\text{ days}$.
  2. After 1st revision: $4 - 1 = 3\\text{ quarters} = 270\\text{ days}$.
  3. After 2nd revision: $3 - 1 = 2\\text{ quarters} = 180\\text{ days}$.
  4. After 3rd revision ($2004$): $2 - 1 = 1\\text{ quarter} = 90\\text{ days}$.
  5. Thus, following the third revision, the NPA recognition window became $90\\text{ days}$.

Therefore, the correct answer is **Option B ($90$)**.`,
    images: []
  },
  "go:359715": {
    concept: "Quantitative Aptitude - Number Theory & String Pattern Frequency",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Number Theory & String Pattern Frequency
- **Problem Statement**:
  - Count the total number of times the digit sequence **\"37\"** appears across all 4-digit integers from $1001$ to $9999$.
  - Note: The question asks how many times the group \"37\" appears, which is the total count of pattern occurrences across the integer range.
- **Step-by-Step Analytical Derivation**:
  - A 4-digit integer has four digit positions: $d_1 d_2 d_3 d_4$, where $d_1 \\in \\{1, 2, \\dots, 9\\}$ and $d_2, d_3, d_4 \\in \\{0, 1, \\dots, 9\\}$.
  - The two-digit string \"37\" can appear in three disjoint position windows:
    1. **Window 1: First two digits ($d_1 d_2 = 37$)**:
       - The numbers are of the form $37 d_3 d_4$.
       - $d_3$ can take any of the 10 values $\\{0, 1, \\dots, 9\\}$.
       - $d_4$ can take any of the 10 values $\\{0, 1, \\dots, 9\\}$.
       - Number of occurrences: $10 \\times 10 = 100$.
       - All these numbers (from $3700$ to $3799$) lie strictly inside the range $[1001, 9999]$.
    2. **Window 2: Middle two digits ($d_2 d_3 = 37$)**:
       - The numbers are of the form $d_1 3 7 d_4$.
       - $d_1$ can take any of the 9 non-zero values $\\{1, 2, \\dots, 9\\}$.
       - $d_4$ can take any of the 10 values $\\{0, 1, \\dots, 9\\}$.
       - Number of occurrences: $9 \\times 10 = 90$.
    3. **Window 3: Last two digits ($d_3 d_4 = 37$)**:
       - The numbers are of the form $d_1 d_2 3 7$.
       - $d_1$ can take any of the 9 values $\\{1, 2, \\dots, 9\\}$.
       - $d_2$ can take any of the 10 values $\\{0, 1, \\dots, 9\\}$.
       - Number of occurrences: $9 \\times 10 = 90$.
  - **Total Occurrences of the String \"37\"**:
    $$\\text{Total appearances} = 100 + 90 + 90 = 280$$
  - *(Note: In the number $3737$, the group \"37\" appears twice—once in Window 1 and once in Window 3—contributing 2 distinct occurrences to the total count of 280).*

Therefore, the correct answer is **Option C ($280$)**.`,
    images: []
  },
  "go:359713": {
    concept: "Geometry - Right Triangle in Semicircle & Thales's Theorem",
    markdown: `- **Concept / Subtopic**: Geometry - Right Triangle in Semicircle & Thales's Theorem
- **Given Configuration**:
  - A semicircle with center $O$ has diameter $AB$ (which is chord $\\overline{AB}$).
  - Let the radius of the semicircle be $R$, so the length of the diameter is $\\overline{AB} = 2R$.
  - $C$ is a point on the circular arc of the semicircle.
  - By Thales's Theorem, the inscribed angle subtended by the diameter is a right angle:
    $$\\angle ACB = 90^\\circ$$
- **Step-by-Step Analytical Derivation**:
  1. Let $\\angle CAB = \\theta$. Since $\\angle ACB = 90^\\circ$:
     $$\\overline{AC} = \\overline{AB} \\cos \\theta = 2R \\cos \\theta$$
     $$\\overline{CB} = \\overline{AB} \\sin \\theta = 2R \\sin \\theta$$
  2. Form the ratio:
     $$F(\\theta) = \\frac{\\overline{AC} + \\overline{CB}}{\\overline{AB}} = \\frac{2R(\\cos \\theta + \\sin \\theta)}{2R} = \\cos \\theta + \\sin \\theta$$
  3. Maximize $F(\\theta)$ over the domain $0 < \\theta < 90^\\circ$:
     $$F(\\theta) = \\sqrt{2} \\sin\\left(\\theta + 45^\\circ\\right)$$
     - The maximum occurs when $\\theta = 45^\\circ$ (i.e. $C$ is the midpoint of the semicircle arc, making $\\triangle ABC$ an isosceles right-angled triangle):
     $$F_{\\max} = \\sqrt{2} \\sin(90^\\circ) = \\sqrt{2}$$
  4. Thus, the maximum ratio is $\\sqrt{2}$.

Therefore, the correct answer is **Option A ($\\sqrt{2}$)**.`,
    images: []
  },
  "go:359710": {
    concept: "Data Interpretation - Revenue, Expenditure & Profit Percentage",
    markdown: `- **Concept / Subtopic**: Data Interpretation - Revenue, Expenditure & Profit Percentage
- **Given Parameters**:
  - In $2015$, Company $Q$'s revenue from the chart is $R_{2015} = 45\\text{ million rupees}$.
  - Company $Q$'s revenue in $2015$ was $20\\%$ higher than its revenue in $2014$:
    $$R_{2015} = 1.20 \\times R_{2014}$$
  - In $2014$, Company $Q$ earned a profit of $10\\%$ on expenditure:
    $$R_{2014} = 1.10 \\times E_{2014}$$
- **Step-by-Step Analytical Derivation**:
  1. **Calculate $2014$ Revenue**:
     $$R_{2014} = \\frac{R_{2015}}{1.20} = \\frac{45}{1.2} = 37.5\\text{ million rupees}$$
  2. **Calculate $2014$ Expenditure**:
     $$E_{2014} = \\frac{R_{2014}}{1.10} = \\frac{37.5}{1.1} = \\frac{375}{11} \\approx 34.0909\\text{ million rupees}$$
  3. Rounding to one decimal place gives **$34.1\\text{ million rupees}$**.

Therefore, the correct answer is **Option C ($34.1$)**.`,
    images: []
  },
  "go:359536": {
    concept: "Verbal Aptitude - English Idiomatic Expressions",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - English Idiomatic Expressions
- **Idiom Identification**:
  - The standard English idiom for displaying insincere or false remorse to deceive onlookers is to shed **crocodile tears**.
  - In this compound noun idiom, the word *crocodile* functions attributively as a noun adjunct qualifying *tears* (without any apostrophe or possessive suffix):
    $$\\text{\"sheds crocodile tears\"}$$
- **Distractor Analysis**:
  - *fox's*: Incorrect idiom; the English language uses "crocodile tears", not "fox tears".
  - *crocodile's*: Incorrect grammatical form; the idiom does not take a possessive apostrophe.
  - *fox*: Incorrect noun.

Therefore, the correct answer is **Option C (crocodile)**.`,
    images: []
  },
  "go:359534": {
    concept: "Verbal Aptitude - Comparison of Two Adjectives in One Subject",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Comparison of Two Adjectives in One Subject
- **Grammar Rule for Comparing Two Qualities of the Same Person**:
  - When comparing two different qualities/adjectives belonging to the same entity (rather than comparing the same quality across two different entities), standard English uses:
    $$\\textbf{more} + [\\text{positive degree adjective}] + \\textbf{than} + [\\text{second positive degree adjective}]$$
  - The inflected comparative form ending in *-er* (e.g., *faster*) is used strictly when comparing two different entities on the same attribute (e.g., *Jofra is faster than Stuart*).
- **Application to the Sentence**:
  - Here, the bowler's own speed is being compared with his own accuracy:
    $$\\text{\"Jofra Archer is } \\textbf{more fast } \\text{than accurate.\"}$$
  - Therefore, *more fast* is the grammatically correct construction.

Therefore, the correct answer is **Option A (more fast)**.`,
    images: []
  },
  "go:359532": {
    concept: "Verbal Aptitude - Word Analogy & Verb-to-Noun Derivation",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Verb-to-Noun Derivation
- **Analogy Relationship**:
  - $\\text{Base Verb} : \\text{Derived Action/Result Noun}$
  - **Build** (verb) forms its noun denoting an edifice or physical creation as **Building**.
  - **Grow** (verb) forms its primary abstract noun denoting the process or result of developing as **Growth**.
- **Distractor Analysis**:
  - *Grown*: Past participle of grow.
  - *Grew*: Simple past tense of grow.
  - *Growed*: Ungrammatical non-word (grow is an irregular verb).
  - *Growth*: The correct, standard English noun.

Therefore, the correct answer is **Option C (Growth)**.`,
    images: []
  },
  "go:359530": {
    concept: "Verbal Aptitude - Idiomatic Discourse Markers",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Idiomatic Discourse Markers
- **Sentence Analysis**:
  - *\"I do not think you know the case well enough to have opinions. Having said that, I agree with your other point.\"*
- **Meaning of the Discourse Marker \"Having said that\"**:
  - The transitional phrase **\"having said that\"** is used in English discourse to signal a concession or contrast that qualifies or balances a preceding assertion.
  - It functions identically to *nevertheless*, *nonetheless*, or **despite what I have said**.
  - It acknowledges the speaker's initial criticism while proceeding to validate a separate, contrasting point.

Therefore, the correct answer is **Option B (despite what I have said)**.`,
    images: []
  },
  "go:359528": {
    concept: "Calculus - Definite Integral of Step Function (Floor Function)",
    markdown: `- **Concept / Subtopic**: Calculus - Definite Integral of Step Function (Floor Function)
- **Problem Statement**:
  - Let $[x]$ denote the greatest integer less than or equal to $x$ (floor function $\\lfloor x \\rfloor$).
  - Calculate the area under the curve $y = [x]$ on the interval $x \\in [1, 4]$:
    $$\\text{Area} = \\int_{1}^{4} [x] \\, dx$$
- **Step-by-Step Analytical Derivation**:
  1. Split the integral into unit intervals where $[x]$ is piecewise constant:
     - For $x \\in [1, 2)$: $[x] = 1$
     - For $x \\in [2, 3)$: $[x] = 2$
     - For $x \\in [3, 4)$: $[x] = 3$
  2. The single boundary point $x = 4$ has measure zero and does not affect the integral.
  3. Evaluate each rectangular region:
     $$\\int_{1}^{4} [x] \\, dx = \\int_{1}^{2} 1 \\, dx + \\int_{2}^{3} 2 \\, dx + \\int_{3}^{4} 3 \\, dx$$
     $$= 1 \\cdot (2 - 1) + 2 \\cdot (3 - 2) + 3 \\cdot (4 - 3)$$
     $$= 1(1) + 2(1) + 3(1) = 1 + 2 + 3 = 6$$

Therefore, the correct answer is **Option D ($6$)**.`,
    images: []
  },
  "go:359526": {
    concept: "Verbal Aptitude - Business Terminology & Logical Comprehension",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Business Terminology & Logical Comprehension
- **Passage Analysis**:
  - *"Crowd funding deals with mobilisation of funds for a project from a large number of people, who would be willing to invest smaller amounts through web-based platforms in the project."*
- **Key Phrase Deductions**:
  - The text explicitly states that participants are *"willing to invest"* smaller amounts.
  - Willing participation represents **voluntary** contribution.
  - This directly refutes choices involving "unwilling" or "coerced" investments.
  - Furthermore, the passage specifies that individual investors contribute "smaller amounts" rather than "large contributions".
  - Thus, the correct definition is funds raised through **voluntary contributions** on web-based platforms.

Therefore, the correct answer is **Option D (Funds raised through voluntary contributions on web-based platforms)**.`,
    images: []
  },
  "go:359522": {
    concept: "Quantitative Aptitude - Sequences & Series (Sum of Repdigits)",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Sequences & Series (Sum of Repdigits)
- **Problem Statement**:
  - Find the sum of the first $n$ terms of the sequence:
    $$S_n = 8 + 88 + 888 + 8888 + \\dots + \\underbrace{888\\dots 8}_{n \\text{ times}}$$
- **Step-by-Step Analytical Derivation**:
  1. Factor out $8$:
     $$S_n = 8 (1 + 11 + 111 + \\dots + \\underbrace{111\\dots 1}_{n})$$
  2. Multiply and divide by $9$:
     $$S_n = \\frac{8}{9} (9 + 99 + 999 + \\dots + \\underbrace{999\\dots 9}_{n})$$
  3. Express each term as powers of 10:
     $$9 = 10^1 - 1$$
     $$99 = 10^2 - 1$$
     $$999 = 10^3 - 1$$
     $$\\vdots$$
     $$\\underbrace{999\\dots 9}_{n} = 10^n - 1$$
  4. Sum the geometric progression and constant terms:
     $$S_n = \\frac{8}{9} \\left[ (10^1 + 10^2 + 10^3 + \\dots + 10^n) - \\underbrace{(1 + 1 + \\dots + 1)}_{n \\text{ terms}} \\right]$$
     $$S_n = \\frac{8}{9} \\left[ \\frac{10(10^n - 1)}{10 - 1} - n \\right] = \\frac{8}{9} \\left[ \\frac{10(10^n - 1)}{9} - n \\right]$$
  5. Expand the brackets:
     $$S_n = \\frac{80}{81} (10^n - 1) - \\frac{8}{9} n$$

Therefore, the correct answer is **Option D ($\\dfrac{80}{81}\\left ( 10^{n}-1 \\right )-\\dfrac{8}{9}n$)**.`,
    images: []
  },
  "go:359520": {
    concept: "Calculus - Curve Sketching & Inverse Power Functions",
    markdown: `- **Concept / Subtopic**: Calculus - Curve Sketching & Inverse Power Functions
- **Curves to Sketch on the Interval $0 \\le x \\le 1$ ($m \\in \\mathbb{Z}, m > 1$)**:
  1. $y_1 = x^m$
  2. $y_2 = x^{1/m}$
- **Mathematical Properties**:
  - **Shared Boundary Coordinates**: Both curves pass through $(0, 0)$ and $(1, 1)$.
  - **Derivative Behavior**:
    - For $y_1 = x^m$: $\\frac{dy_1}{dx} = m x^{m-1} \\ge 0$ with $\\frac{d^2 y_1}{dx^2} = m(m-1)x^{m-2} > 0$ for $x > 0$. The curve is strictly **convex downwards**, remaining strictly below the line $y = x$.
    - For $y_2 = x^{1/m}$: $\\frac{dy_2}{dx} = \\frac{1}{m} x^{(1-m)/m} > 0$ with $\\frac{d^2 y_2}{dx^2} < 0$. The curve is strictly **concave downwards**, remaining strictly above the line $y = x$.
  - **Symmetry**: The two functions are mutual inverses ($y_1 = f(x) \\iff y_2 = f^{-1}(x)$), so their graphs are mirror reflections of each other across the diagonal line $y = x$.
  - Schematically, $y = x^{1/m}$ arches upward above the diagonal while $y = x^m$ stays below the diagonal, creating a symmetric lens anchored at $(0, 0)$ and $(1, 1)$. Graph A portrays this relationship correctly.

Therefore, the correct answer is **Option A**.`,
    images: []
  },
  "go:359518": {
    concept: "Data Interpretation - Bar Chart Success Rates Calculation",
    markdown: `- **Concept / Subtopic**: Data Interpretation - Bar Chart Success Rates Calculation
- **Given Bar Chart Data for Schools $P, Q, R, S$**:
  - School $P$: Appeared = $280$, Passed = $210$ $\\implies \\text{Success Rate} = \\frac{210}{280} \\times 100\\% = 75.0\\%$
  - School $Q$: Appeared = $350$, Passed = $175$ $\\implies \\text{Success Rate} = \\frac{175}{350} \\times 100\\% = 50.0\\%$
  - School $R$: Appeared = $300$, Passed = $180$ $\\implies \\text{Success Rate} = \\frac{180}{300} \\times 100\\% = 60.0\\%$
  - School $S$: Appeared = $240$, Passed = $122.4$ (or $122$) $\\implies \\text{Success Rate} = 51.0\\%$
- **Step-by-Step Analytical Derivation**:
  1. The success rates of the four schools are:
     $$\\text{Rate}_P = 75.0\\%$$
     $$\\text{Rate}_Q = 50.0\\%$$
     $$\\text{Rate}_R = 60.0\\%$$
     $$\\text{Rate}_S = 51.0\\%$$
  2. Compute the arithmetic mean of the four success rate percentages:
     $$\\text{Average Success Rate} = \\frac{75.0 + 50.0 + 60.0 + 51.0}{4} = \\frac{236.0}{4} = 59.0\\%$$

Therefore, the correct answer is **Option C ($59.0\\%$)**.`,
    images: []
  },
  "go:359557": {
    concept: "Verbal Aptitude - Preposition Collocations with 'Agree'",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Preposition Collocations with 'Agree'
- **Grammatical Rules for Prepositions following 'Agree'**:
  1. **Agree to**: Used when assenting to a plan, idea, term, or proposal put forward by someone else:
     $$\\text{\"agree } \\textbf{to} \\text{ a proposal / suggestion / plan\"}$$
  2. **Agree with**: Used when expressing consensus with a person or in harmony with an opinion:
     $$\\text{\"agree } \\textbf{with} \\text{ someone / with a person\"}$$
- **Application to the Sentence**:
  - *"While I agree _______ his proposal this time, I do not often agree _______ him."*
  - First blank: *agree to his proposal* (assenting to the proposal).
  - Second blank: *agree with him* (sharing consensus with the person).
  - Combining both gives **to, with**.

Therefore, the correct answer is **Option A (to, with)**.`,
    images: []
  },
  "go:359555": {
    concept: "Verbal Aptitude - Vocabulary & Positive Output Collocations",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Vocabulary & Positive Output Collocations
- **Sentence Context**:
  - *"The recent measures to improve the output would _______ the level of production to our satisfaction."*
  - The sentence discusses "measures to improve output" leading to an outcome "to our satisfaction".
  - A positive measure aimed at improvement naturally aims to **increase** production.
- **Option Analysis**:
  - **Option A (increase)**: Directly fits the semantic intent of elevating output.
  - **Option B (decrease)**: Contradicts "improve the output".
  - **Option C (speed)**: Requires a preposition ("speed up") to function transitively with "the level of production".
  - **Option D (equalise)**: Does not fit the objective of expanding production capacity.

Therefore, the correct answer is **Option A (increase)**.`,
    images: []
  },
  "go:359553": {
    concept: "Verbal Aptitude - Word Analogy & Participial Suffixation",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Word Analogy & Participial Suffixation
- **Analogy Relationship**:
  - $\\text{Adjective} : \\text{Derived Verb Present Participle}$
  - **White** (adjective) $\\to$ **Whiten** (verb, meaning to make white) $\\to$ **Whitening** (present participle).
  - Similarly:
  - **Light** (adjective, not heavy / pale) $\\to$ **Lighten** (verb, meaning to make lighter or less burdensome) $\\to$ **Lightening** (present participle).
- **Distractor Analysis**:
  - **Lightning**: Atmospheric electrical discharge; a noun with distinct spelling.
  - **Lighting**: Illumination equipment or setup.
  - **Enlightening**: Giving spiritual or intellectual insight.
  - **Lightening**: The exact morphological counterpart to *whitening*.

Therefore, the correct answer is **Option B (Lightening)**.`,
    images: []
  },
  "go:359550": {
    concept: "Verbal Aptitude - Idiomatic Phrasing in Sports Reporting",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Idiomatic Phrasing in Sports Reporting
- **Passage Context**:
  - *"Ben Stokes upped the tempo in a five-and-a-half hour long stay... that saw him finish on a 135 not out as England squared the five-match series."*
- **Evaluation of Connotations**:
  - **upped = increased**: Accurate; to "up the tempo" means to accelerate the scoring rate.
  - **tempo = enthusiasm / pace**: Accurate; denotes speed and energy of play.
  - **saw = resulted in**: Accurate; idiomatic use of see meaning witnessed or led to an outcome.
  - **squared = lost**: **DOES NOT MATCH**. In cricket and sports terminology, to **square a series** means to level or equalize the series score (e.g., drawing level at 2–2), which is the exact opposite of losing.

Therefore, the correct answer is **Option B (squared = lost)**.`,
    images: []
  },
  "go:359548": {
    concept: "Quantitative Aptitude - Successive Percentage Increases (Compounding)",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Successive Percentage Increases (Compounding)
- **Given Parameters**:
  - Linear supply chain with 5 successive tiers: $\\{P, Q, R, S, T\\}$.
  - Initial manufacturing cost at level $P$: $C_0 = \\text{Rs. } 120$.
  - At each of the 5 tiers, the product price increases by $25\\%$ ($r = 0.25$).
  - Multiplier at each tier: $1 + r = 1 + 0.25 = 1.25 = \\frac{5}{4}$.
- **Step-by-Step Analytical Derivation**:
  1. Compounding through 5 successive price increases:
     $$P_{\\text{customer}} = C_0 \\times (1.25)^5$$
  2. Compute $(1.25)^5$:
     $$(1.25)^2 = 1.5625$$
     $$(1.25)^4 = (1.5625)^2 = 2.44140625$$
     $$(1.25)^5 = 2.44140625 \\times 1.25 = 3.0517578125$$
  3. Multiply by initial cost $120$:
     $$P_{\\text{customer}} = 120 \\times 3.0517578125 = 366.2109375 \\approx 366.21\\text{ rupees}$$

Therefore, the correct answer is **Option D ($366.21$)**.`,
    images: []
  },
  "go:359546": {
    concept: "Verbal Aptitude - Technical Definitions & Paired Terms",
    markdown: `- **Concept / Subtopic**: Verbal Aptitude - Technical Definitions & Paired Terms
- **Given Technical Definitions**:
  - The passage states:
    1. *Aspect 1*: \"reduction of sources of non-renewable energy resources\" $\\to$ referred to as **'mitigation'**.
    2. *Aspect 2*: \"reducing vulnerability of climate change aspects\" $\\to$ referred to as **'adaptation'**.
- **Evaluating Assertions**:
  - Non-renewable energy resources are fossil fuels (coal, petroleum, natural gas).
  - Therefore, \"reduction of sources of non-renewable energy resources\" corresponds directly to **actions taken to reduce the use of fossil fuels**.
  - Since this aspect is defined as mitigation, the assertion that **Mitigation deals with actions taken to reduce the use of fossil fuels** is directly supported by the passage.

Therefore, the correct answer is **Option C (Mitigation deals with actions taken to reduce the use of fossil fuels.)**.`,
    images: []
  },
  "go:359542": {
    concept: "Quantitative Aptitude - Work and Time & Man-Days Equivalence",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Work and Time & Man-Days Equivalence
- **Given Parameters**:
  - Initial estimated workforce: $M_1 = 52\\text{ men}$.
  - Estimated duration to complete the highway strip: $D_1 = 10\\text{ days}$.
  - Total work quantity in man-days:
    $$W = M_1 \\times D_1 = 52 \\times 10 = 520\\text{ man-days}$$
- **Step-by-Step Analytical Derivation**:
  1. Due to an emergency, 12 men were diverted:
     $$M_2 = 52 - 12 = 40\\text{ men remaining}$$
  2. Duration $D_2$ required for 40 men to finish the 520 man-days of work:
     $$D_2 = \\frac{W}{M_2} = \\frac{520}{40} = 13\\text{ days}$$
  3. Additional days required beyond the original 10-day estimate:
     $$\\Delta D = D_2 - D_1 = 13 - 10 = 3\\text{ days}$$

Therefore, the correct answer is **Option A ($3$ days)**.`,
    images: []
  },
  "go:359540": {
    concept: "Quantitative Aptitude - Proportionality Relations",
    markdown: `- **Concept / Subtopic**: Quantitative Aptitude - Proportionality Relations
- **Given Relationship**:
  - The problem states: *\"the product of $X$ and $Y$ linearly varies with $Z$\"*.
  - Mathematically, this linear variation through the origin is expressed as:
    $$X \\cdot Y = k Z \\quad (k \\text{ is a non-zero constant})$$
    $$\\frac{XY}{Z} = k$$
- **Step-by-Step Evaluation of Statements**:
  - **Statement 1**: *\"For fixed $Z$; $X$ is proportional to $Y$\"*
    - If $Z$ is fixed ($Z = Z_0$), then $X \\cdot Y = k Z_0 = \\text{constant} \\implies X \\propto \\frac{1}{Y}$.
    - This means $X$ is **inversely proportional** to $Y$, NOT directly proportional.
    - Hence, this statement is **FALSE**.
  - **Statement 2**: *\"For fixed $Y$; $X$ is proportional to $Z$\"* $\\implies X = \\left(\\frac{k}{Y_0}\\right) Z \\implies X \\propto Z$ (TRUE).
  - **Statement 3**: *\"For fixed $X$; $Z$ is proportional to $Y$\"* $\\implies Z = \\left(\\frac{X_0}{k}\\right) Y \\implies Z \\propto Y$ (TRUE).
  - **Statement 4**: *\"$XY/Z$ is constant\"* $\\implies \\frac{XY}{Z} = k$ (TRUE).

Therefore, the correct answer is **Option A (For fixed $Z$; $X$ is proportional to $Y$)**.`,
    images: []
  },
  "go:359538": {
    concept: "Data Interpretation - Two Pie Charts Ratio Analysis",
    markdown: `- **Concept / Subtopic**: Data Interpretation - Two Pie Charts Ratio Analysis
- **Given Parameters**:
  - Total students registered in university: $N_{\\text{total}} = 5000$.
  - Total registered girls: $G_{\\text{total}} = 1500$.
  - Number of registered boys:
    $$B_{\\text{total}} = 5000 - 1500 = 3500$$
- **Data from Pie Charts**:
  - Arts stream:
    - Total students enrolled in Arts = $20\\%$ of $5000 = 0.20 \\times 5000 = 1000$.
    - Girls enrolled in Arts = $30\\%$ of $1500 = 0.30 \\times 1500 = 450$.
    - Therefore, boys enrolled in Arts:
      $$B_{\\text{Arts}} = \\text{Total}_{\\text{Arts}} - G_{\\text{Arts}} = 1000 - 450 = 550$$
  - Management stream:
    - Girls enrolled in Management = $15\\%$ of $1500 = 0.15 \\times 1500 = 225$.
- **Compute the Required Ratio**:
  $$\\text{Ratio} = \\frac{B_{\\text{Arts}}}{G_{\\text{Management}}} = \\frac{550}{225}$$
  - Divide numerator and denominator by 25:
    $$\\frac{550 \\div 25}{225 \\div 25} = \\frac{22}{9}$$

Therefore, the correct answer is **Option D ($22:9$)**.`,
    images: []
  },
  "go:333212": {
    concept: "Digital Logic & Computer Organization - Multiplexer Select Lines",
    markdown: `- **Concept / Subtopic**: Digital Logic & Computer Organization - Multiplexer Select Lines
- **Given Architecture**:
  - Number of source registers: $N = 32$.
  - An accumulator register receives data from exactly one register at any given instant.
  - A multiplexer (MUX) routes data from one of the $N$ registers to the accumulator.
- **Governing Equations**:
  - A multiplexer with $N$ data inputs requires $k$ select lines such that:
    $$2^k \\ge N$$
    $$k = \\lceil \\log_2 N \\rceil$$
- **Step-by-Step Analytical Derivation**:
  1. We are selecting among $N = 32$ input lines.
  2. Express 32 as a power of 2:
     $$32 = 2^5$$
  3. Therefore, the minimum number of select control lines is:
     $$k = \\log_2(32) = 5$$
  4. The 5 select lines provide $2^5 = 32$ distinct binary code combinations ($00000_2$ to $11111_2$), each uniquely addressing one of the 32 registers.

Therefore, the correct answer is **5**.`,
    images: []
  }
};

export function applyChunkCseRec01To05() {
  const patchFilePath = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
  let patchFileContent = fs.readFileSync(patchFilePath, "utf-8");

  const entries = Object.entries(CHUNK_CSE_REC_01_TO_05_SOLUTIONS)
    .map(([uid, patch]) => {
      return `  "${uid}": ${JSON.stringify(patch, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")},`;
    })
    .join("\n");

  const marker = "export const AUTHENTIC_PATCHES = {";
  if (patchFileContent.includes(marker)) {
    patchFileContent = patchFileContent.replace(marker, () => `${marker}\n${entries}`);
    fs.writeFileSync(patchFilePath, patchFileContent, "utf-8");
    console.log(`Injected ${Object.keys(CHUNK_CSE_REC_01_TO_05_SOLUTIONS).length} patches into patch-authentic-solutions.mjs`);
  } else {
    console.error("Could not find AUTHENTIC_PATCHES marker in patch-authentic-solutions.mjs");
  }
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-cse-rec-01-to-05")) {
  applyChunkCseRec01To05();
}
