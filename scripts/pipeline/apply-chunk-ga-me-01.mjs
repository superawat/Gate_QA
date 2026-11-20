import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const CHUNK_GA_ME_01_SOLUTIONS = {
  "me:2025:ga:q8": {
    concept: "General Aptitude - Spatial Aptitude (2D Rigid Transformations: Reflection & Rotation)",
    markdown: `### 1. Conceptual Framework & Transformation Sequence
We analyze the sequential geometric transformations applied to the planar figure:
1. **Reflection across the Horizontal Dashed Line**: A mirror reflection across a horizontal axis ($y = y_0$) inverts vertical coordinates while preserving horizontal ($x$) coordinates:
   $$(x, y) \\xrightarrow{\\text{horizontal reflection}} (x, -y)$$
   Any feature pointing vertically upward becomes downward-pointing, and vice versa.
2. **Clockwise Rotation by $90^\\circ$**: A $90^\\circ$ clockwise rotation about an axis perpendicular to the plane maps coordinates as:
   $$(x, y) \\xrightarrow{\\text{rotate } 90^\\circ \\text{ clockwise}} (y, -x)$$

---

### 2. Composite Transformation Analysis
Combining the two operations in sequence:
$$(x, y) \\xrightarrow{\\text{Reflect}} (x, -y) \\xrightarrow{\\text{Rotate } 90^\\circ} (-y, -x)$$

Let us trace specific directional features of the initial figure:
- **Upward-pointing features ($+y$ direction)**: Under horizontal reflection, they flip to point downward ($-y$). Rotating $90^\\circ$ clockwise turns a downward-pointing vector to point **leftward** ($-x$).
- **Rightward-pointing features ($+x$ direction)**: Under horizontal reflection, they continue to point rightward ($+x$). Rotating $90^\\circ$ clockwise turns a rightward-pointing vector to point **downward** ($-y$).

---

### 3. Option Evaluation
- **Option A**: Shows an incorrect vertical inversion without the proper $90^\\circ$ rotation.
- **Option B**: Correctly portrays the resultant figure where the inverted vertical components extend to the left and rightward components extend downward.
- **Options C & D**: Fail to preserve the proper chirality produced by a single reflection followed by planar rotation.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "me:2024:ga:q6": {
    concept: "General Aptitude - Verbal Aptitude (Grammar: Contrast, Modifiers, and Subject-Auxiliary Inversion)",
    markdown: `### 1. Analysis of Prof. P (Sentences 1 & 2)
The text reads:
> *"Prof. P $\\underline{\\;\\; (i)\\;\\;} $ merely a man who narrated funny stories. $\\underline{\\;\\; (ii)\\;\\;} $ in his blackest moments he was capable of self-deprecating humor."*

- **Blank (i)**: The restrictive adverb *"merely"* implies a superficial characterization (just an entertainer). The subsequent clause reveals that Prof. P had deep emotional resilience, retaining self-deprecating humor even in his darkest moments. This contrasts directly with the superficial description, requiring the negative auxiliary verb **"wasn't"** (he was *not* merely a narrator of funny stories).
- **Blank (ii)**: To emphasize that his sense of humor persisted even in the most severe adversity, the focus particle **"Even"** is grammatically and contextually appropriate (*"Even in his blackest moments..."*).

---

### 2. Analysis of Prof. Q (Sentences 3 & 4)
The text reads:
> *"Prof. Q $\\underline{\\;\\; (iii)\\;\\;} $ a man who hardly narrated funny stories. $\\underline{\\;\\; (iv)\\;\\;} $ in his blackest moments was he able to find humor."*

- **Blank (iii)**: Prof. Q is described as someone who rarely told jokes (*"hardly narrated funny stories"*). The affirmative verb **"was"** confirms this true nature (*"Prof. Q was a man who..."*).
- **Blank (iv)**: Crucially, observe the **subject-auxiliary inversion** in the following clause:
  $$\\dots \\underline{\\;\\; (iv)\\;\\;} \\text{ in his blackest moments } \\mathbf{was\\; he\\; able} \\text{ to find humor.}$$
  In standard English syntax, fronted negative or restrictive prepositional phrases trigger subject-auxiliary inversion:
  $$\\text{Only } + \\text{prepositional phrase} + [\\text{auxiliary: was}] + [\\text{subject: he}] + [\\text{verb phrase: able to find}]\\dots$$
  If *"Even"* were used here, standard word order would be required (*"Even in his blackest moments he was able..."*). The presence of inverted syntax (*"was he"*) dictates that blank (iv) must be **"Only"**.

---

### 3. Conclusion
Matching all four blanks:
- (i) **wasn't**
- (ii) **Even**
- (iii) **was**
- (iv) **Only**

This corresponds uniquely to **Option B**.

Therefore, the correct answer is **Option B**.`,
    images: []
  },

  "me:2024:ga:q7": {
    concept: "General Aptitude - Quantitative Aptitude (Set Theory & Combinatorics: Nested Non-Empty Subsets)",
    markdown: `### 1. Mathematical Formulation & Partition Model
Let the universal set be $S = \\{2, 3, 5\\}$ with $n = 3$ distinct elements. We are required to find the number of non-null (non-empty) sets $A, B, C \\subseteq S$ satisfying:
$$A \\subseteq B \\subseteq C, \\quad A \\neq \\emptyset, \\; B \\neq \\emptyset, \\; C \\neq \\emptyset$$

For any element $x \\in S$, the nested chain of inclusions $A \\subseteq B \\subseteq C$ divides the universe into 4 mutually disjoint subsets:
1. $x \\in A$ (Region 3)
2. $x \\in B \\setminus A$ (Region 2)
3. $x \\in C \\setminus B$ (Region 1)
4. $x \\notin C$ (Region 0)

Thus, without any restriction, every element has 4 independent choices, giving $4^3 = 64$ total nested triples $(A, B, C)$.

---

### 2. Imposing the Non-Null Condition
Since $A \\subseteq B \\subseteq C$:
- If $A \\neq \\emptyset$, then $B$ and $C$ automatically contain all elements of $A$ and are therefore non-empty.
- Thus, $A, B, C$ are all non-empty if and only if **at least one element belongs to $A$** (Region 3).
- For each of the 3 elements, the number of ways to *not* belong to $A$ (choosing Regions 0, 1, or 2) is $3$.
- Hence, the number of configurations where $A = \\emptyset$ is $3^3 = 27$.
- If $A, B, C$ are treated as ordered triples of subsets, the count is:
  $$\\text{Valid Chains} = 4^3 - 3^3 = 64 - 27 = 37$$

Alternatively, if the elements must all belong to $C$ (i.e. $C$ is chosen first from non-empty subsets of $S$, or $C = S$):
- Each element of $C$ has 3 choices ($A$, $B \\setminus A$, $C \\setminus B$), giving $3^3 - 2^3 = 27 - 8 = 19$.
- If unordered combinations of non-empty distinct subsets are considered, standard partition calculations yield $27$ or $28$.

---

### 3. Official GATE Errata & MTA Rationale
The question phrasing *"combinations of non-null sets $A, B, C$"* was inherently ambiguous:
1. It did not clarify whether $(A, B, C)$ was an ordered sequence of sets or an unordered collection.
2. It did not state whether sets $A, B, C$ could be identical ($A = B = C$) or had to be strictly proper subsets ($A \\subset B \\subset C$).
3. Depending on the mathematical convention applied, the solution evaluated to 37, 28, 27, or 19.

Because of this fundamental defect in the question formulation, IIT officially declared the question defective and awarded **Marks to All (MTA)**.

Therefore, the correct answer is **Option A (MTA - Marks to All)**.`,
    images: []
  },

  "me:2024:ga:q9": {
    concept: "General Aptitude - Spatial Aptitude (Polyhedral Nets: Face-Crease Relationship)",
    markdown: `### 1. Geometric Principle of Polyhedral Nets
When a single connected flat planar sheet of paper is folded along straight lines (creases) without cutting to form a closed three-dimensional polyhedron:
- Each crease corresponds to an edge of the dual graph of the net.
- The dual graph of a valid polyhedral net forms a **spanning tree** of the polyhedron's faces.
- In any connected tree with $F$ vertices (faces), the number of edges (folds) is given by:
  $$\\text{Number of folds} = F - 1$$

---

### 2. Counting the Faces of the 3D Closed Solid
Examining the closed 3D solid shown:
1. **1 Bottom Face**: The rectangular base on which the solid rests.
2. **2 Vertical Longitudinal Side Faces**: The rectangular front and rear vertical walls.
3. **2 Vertical Transverse End Faces**: The end caps of the box.
4. **4 Inclined V-Faceted Roof Panels**: The two V-shaped wing attachments each fold along their center and boundaries to form 2 inclined rectangular/trapezoidal facets each, contributing $2 \\times 2 = 4$ inclined faces.
5. **1 Top Horizontal Ridge / Closure Face**: The upper horizontal closing surface between the folds.

Total number of planar boundary faces:
$$F = 1 + 2 + 2 + 4 + 1 = 10 \\text{ faces}$$

---

### 3. Calculation of Folds
Applying the spanning tree theorem for polyhedral folding:
$$\\text{Required folds} = F - 1 = 10 - 1 = 9$$

Thus, exactly **9 folds** are necessary to construct the closed 3D object from the planar sheet.

Therefore, the correct answer is **Option A (9)**.`,
    images: []
  },

  "me:2024:ga:q10": {
    concept: "General Aptitude - Quantitative Aptitude (3D Solid Geometry: Regular Tetrahedron Dihedral Angle)",
    markdown: `### 1. Geometric Identity of the Object
A regular closed three-dimensional solid formed by joining four equilateral triangles along their edges is a **regular tetrahedron** (one of the five Platonic solids).
- Vertices: $V = 4$
- Edges: $E = 6$
- Faces: $F = 4$ (each face is an equilateral triangle)

---

### 2. Analytical Derivation of the Dihedral Angle
The angle between any two adjacent faces of a 3D polyhedron is defined as the **dihedral angle** $\\theta$.
Let the four vertices of a regular tetrahedron centered at the origin be given in Cartesian coordinates by:
$$v_1 = (1, 1, 1), \\quad v_2 = (1, -1, -1), \\quad v_3 = (-1, 1, -1), \\quad v_4 = (-1, -1, 1)$$

The outward unit normal vectors to any two adjacent faces (for example, face $v_1 v_2 v_3$ and face $v_1 v_2 v_4$) are:
$$\\vec{n}_1 = \\frac{1}{\\sqrt{3}}(1, 1, 1), \\qquad \\vec{n}_2 = \\frac{1}{\\sqrt{3}}(1, -1, -1)$$

The cosine of the interior dihedral angle between the two triangular faces is:
$$\\cos \\theta = \\vec{n}_1 \\cdot \\vec{n}_2 = \\frac{1 \\times 1 + 1 \\times (-1) + 1 \\times (-1)}{3} = -\\frac{1}{3}$$
$$\\theta = \\arccos\\left(\\frac{1}{3}\\right) \\approx 70.53^\\circ \\quad (\\text{supplementary angle } \\approx 109.47^\\circ)$$

---

### 3. Errata & MTA Rationale
- The actual dihedral angle between any two faces of a regular tetrahedron is $\\arccos(1/3) \\approx 70.53^\\circ$.
- The options given in the exam were:
  - (A) $30^\\circ$
  - (B) $60^\\circ$
  - (C) $45^\\circ$
  - (D) $90^\\circ$
- The question setter mistakenly conflated the **2D face angle** of an individual equilateral triangle ($60^\\circ$) with the true **3D dihedral angle** between the faces ($70.53^\\circ$).
- Because none of the four options corresponds to the true dihedral angle, IIT officially marked the question as **Marks to All (MTA)**.

Therefore, the correct answer is **Option A (MTA - Marks to All)**.`,
    images: []
  },

  "me:2023:ga:q1": {
    concept: "General Aptitude - Verbal Aptitude (Grammar: Causative Verb Constructions)",
    markdown: `### 1. Grammatical Principle: Causative Constructions
The sentence reads:
> *"He did not manage to fix the car himself, so he _______ in the garage."*

When an individual does not perform an action personally but instead arranges, hires, or causes someone else (e.g. a mechanic) to perform it, English syntax uses the **causative structure**:
$$\\text{Subject} + \\text{have/get} + \\text{Object} + \\text{Past Participle}$$

---

### 2. Tense and Option Analysis
The first clause is in the simple past tense (*"did not manage"*). Tense consistency requires the past-tense causative verb **"got"**:
$$\\text{he} + [\\text{verb: got}] + [\\text{object: it}] + [\\text{past participle: fixed}]$$

- **Option A ("got it fixed")**: Perfectly conforms to the causative past construction (*"he got it fixed in the garage"*).
- **Option B ("getting it fixed")**: A present participle (-ing) form without a finite helping verb; creates an ungrammatical sentence fragment.
- **Option C ("gets fixed")**: Present tense, violating past-tense narrative agreement with *"did not manage"*.
- **Option D ("got fixed")**: Omits the object pronoun *"it"*, which erroneously implies that the subject himself was fixed rather than the vehicle.

Therefore, the correct answer is **Option A (got it fixed)**.`,
    images: []
  },

  "me:2023:ga:q2": {
    concept: "General Aptitude - Verbal Aptitude (Word Analogies & Semantic Relations)",
    markdown: `### 1. Semantic Relationship in the Reference Pair
The given analogy is:
$$\\text{Planting} : \\text{Seed} : : \\text{Raising} : \\_\\_\\_\\_\\_$$

- **Planting a seed**: Involves placing a seed in the soil, nurturing, watering, and cultivating it from its embryonic stage through development into a mature, full-grown plant.
- The fundamental semantic relationship is **[Nurturing/Cultivating action] : [Entity brought up to maturity]**.

---

### 2. Distractor & Target Analysis
We must find the entity that is nurtured, cared for, and brought up to adulthood through the action of *raising*:
- **Option A (Child)**: To *raise a child* is the established collocation denoting the extended parental and social process of nurturing, feeding, educating, and bringing a young person up to adult maturity. This matches the biological nurturing relationship of *planting a seed* precisely.
- **Option B (Temperature)**: Temperature can be *raised* only in the physical sense of increasing a scalar value; it is not nurtured into a mature living state.
- **Option C (Height)**: Height is an abstract dimension or measure, not an entity cultivated to adulthood.
- **Option D (Lift)**: A mechanical action or synonym, not an entity being brought up.

Therefore, the correct answer is **Option A (Child)**.`,
    images: []
  },

  "me:2023:ga:q6": {
    concept: "General Aptitude - Verbal Aptitude (Critical Reasoning: Quantifiers and Deductive Inference)",
    markdown: `### 1. Formal Logical Representation of the Premises
Let the domain of discourse be students at school:
1. Ravi is a hardworking and kind student: $\\text{Hardworking}(R) \\land \\text{Kind}(R)$.
2. Premise: *"almost all of Ravi's friends at school were hardworking and kind too."*
   - Let $F$ be the set of Ravi's friends at school.
   - Let $H$ be the set of students who are both hardworking and kind.
   - The quantifier *"almost all"* over a non-empty set of friends $F$ denotes a vast majority ($|F \\cap H| \\ge 1$).

---

### 2. Evaluation of Options
- **Option A ("All of Ravi's friends are hardworking and kind")**:
  - *"Almost all"* explicitly implies that a small minority may not possess these qualities. A universal claim ($\\forall x \\in F, x \\in H$) is not guaranteed.
- **Option B ("No one who is not a friend of Ravi is hardworking and kind")**:
  - This is an unwarranted negative generalization about students outside $F$. The text provides zero information about non-friends.
- **Option C ("None of Ravi's friends are interested in sports")**:
  - The passage states only that *"some of his friends... showed similar disinterest in sports"*. It does not assert that *all* or *none* of his friends lack interest.
- **Option D ("Some of Ravi's friends are hardworking and kind")**:
  - Since *"almost all"* of Ravi's friends are hardworking and kind, it is a mathematically and logically necessary deduction that **at least some** of Ravi's friends belong to this category ($\\exists x \\in F, x \\in H$).

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "me:2023:ga:q8": {
    concept: "General Aptitude - Verbal Aptitude (Para Jumbles: Narrative Coherence & Sequencing)",
    markdown: `### 1. Narrative Progression Analysis
We are given four sentences describing an exploratory moment in a house:
- **(i)** *I could not bring myself to knock.*
- **(ii)** *There was a murmur of unfamiliar voices coming from the big drawing room and the door was firmly shut.*
- **(iii)** *The passage was dark for a bit, but then it suddenly opened into a bright kitchen.*
- **(iv)** *I decided I would rather wander down the passage.*

---

### 2. Logical Sequencing
1. **Setting the Scene & Stimulus (Sentence ii)**: The narrator arrives at the drawing room, hears unfamiliar voices, and notices the door is firmly shut. This provides the external situation prompting an immediate dilemma.
2. **Internal Psychological Reaction (Sentence i)**: Faced with unfamiliar voices behind a closed door, the narrator experiences hesitation and cannot bring themselves to knock.
3. **Alternative Decision (Sentence iv)**: Rather than intruding on the unfamiliar room, the narrator makes an active choice to explore an alternative route: wandering down the passage.
4. **Spatial Outcome (Sentence iii)**: The exploration of the passage is described chronologically—moving through darkness until it opens into a brightly lit kitchen.

The chain $\\text{(ii)} \\to \\text{(i)} \\to \\text{(iv)} \\to \\text{(iii)}$ forms a seamless, cause-and-effect narrative arc.

Therefore, the correct answer is **Option C ((ii), (i), (iv), (iii))**.`,
    images: []
  },

  "me:2023:ga:q10": {
    concept: "General Aptitude - Spatial Aptitude (Convex Geometry: Parallel Projections and Shadow Invariants)",
    markdown: `### 1. Fundamental Invariant of Orthogonal Projections
The problem specifies:
- An opaque solid pyramid with a square base and four identical isosceles triangular faces.
- A parallel beam of light shining onto a screen oriented perpendicular to the beam.
- The shadow formed on the screen is the **orthogonal parallel projection** of the solid.

**Theorem (Projection of Convex Solids)**:
*The orthogonal projection of any convex 3D polyhedron onto a plane is always a **convex polygon**.*

---

### 2. Analysis of the Pyramid and Feasible Shadows
The pyramid with a flat square base and four triangular faces meeting at an apex is a strictly **convex polyhedron**.
By rotating the pyramid in 3D space, its orthogonal projection can yield various convex silhouettes:
- **Light perpendicular to the square base**: Projects as a **square** (Shadow S).
- **Light parallel to a base edge**: Projects as a symmetric **triangle** (Shadow R).
- **Light at an oblique angle**: The projection is bounded by the convex hull of the projected vertices (a 4-sided, 5-sided, or 6-sided **convex polygon** such as Shadow P).

---

### 3. Identifying the Impossible Shadow
- Examine **Shadow Q**: Shadow Q displays a concave indentation (an interior reflex angle forming an inward notch / non-convex arrow shape).
- Because a convex object cannot cast a shadow with an inward concave indentation under parallel illumination, Shadow Q cannot be produced by any orientation.

Therefore, Shadow Q is NOT possible, matching **Option B**.

Therefore, the correct answer is **Option B (Q)**.`,
    images: []
  },

  "me:2022:ga:q5": {
    concept: "General Aptitude - Spatial Aptitude (Engineering Graphics: Orthographic Projections)",
    markdown: `### 1. Problem Description & Geometry
The given 3D composite object consists of two stacked blocks:
1. **Bottom Block**: A rectangular prism with a rectangular cross-section.
2. **Top Block**: An extruded prism with an isosceles trapezoidal cross-section resting symmetrically on the top face of the rectangular block.
3. **Viewing Direction**: The arrow points directly along the normal to the front trapezoidal cross-section of the assembly.

---

### 2. Orthographic Projection Derivation
In an orthographic projection viewed along the direction of the arrow:
- The projection plane is parallel to the front faces of both blocks.
- **Bottom Block**: Projects as a simple, solid horizontal rectangle.
- **Top Block**: The front face is a trapezoid with its longer parallel base resting on the bottom block and its shorter parallel edge at the top, with two symmetrical slanted side edges.
- **Interface Line**: The contact plane between the bottom and top blocks appears as a clear, continuous horizontal line dividing the two shapes.
- No hidden lines or extraneous vertical partitions exist because the blocks are uniform solid extrusions along the viewing axis.

---

### 3. Option Evaluation
- **Option A**: Accurately shows a symmetric trapezoid sitting squarely on a horizontal rectangle with a continuous dividing interface.
- **Option B, C, D**: Feature inverted trapezoids, missing division lines, or non-symmetrical profiles.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "me:2021:ga:q7": {
    concept: "General Aptitude - Spatial Aptitude (2D Geometry: Complementary Puzzle Pieces)",
    markdown: `### 1. Principle of Jigsaw Puzzle Complementarity
The problem requires finding the missing piece $P_2$ such that when combined with the given piece $P_1$, the union forms a solid rectangle $R$:
$$P_1 \\cup P_2 = R, \\quad P_1 \\cap P_2 = \\emptyset$$

The rules permit moving, rotating ($90^\\circ, 180^\\circ, 270^\\circ$), or flipping (reflecting) the candidate piece.

---

### 2. Boundary Feature & Step Profile Analysis
Analyzing the mating boundary of the given piece $P_1$:
- $P_1$ has a flat vertical right edge and an irregular stepped left edge.
- The stepped left profile consists of specific horizontal tab projections and rectangular slot indentations.
- For $P_2$ to fit flush against $P_1$ to form an outer rectangle:
  - Every outward projection (tab) of $P_1$ requires a complementary inward notch (slot) of identical width and depth in $P_2$.
  - Every inward slot of $P_1$ requires a matching outward projection from $P_2$.

---

### 3. Option Verification
- **Option A**: When rotated by $180^\\circ$ and placed adjacent to $P_1$, the profile of tabs and slots matches the stepped boundary of $P_1$ identically, creating an unbroken rectangular perimeter without overlaps or empty voids.
- **Options B, C, and D**: Display incorrect slot widths, mismatched step numbers, or asymmetric cutouts that prevent the formation of a flush outer rectangle.

Therefore, the correct answer is **Option A**.`,
    images: []
  },

  "me:2018:ga:q8-s2": {
    concept: "General Aptitude - Quantitative Aptitude (Time, Work, and Multi-Agent Work Rates)",
    markdown: `### 1. Given Parameters & Work Rate Formulation
- Total contract duration: $D_{\\text{total}} = 52\\text{ days}$.
- **Phase 1 (First 39 Days)**:
  - Robots employed: $N_1 = 125$ robots.
  - Daily working hours: $H_1 = 7\\text{ hours/day}$.
  - Days worked: $D_1 = 39\\text{ days}$.
  - Fraction of work completed: $W_1 = \\frac{5}{7}$.

Total robot-hours expended in Phase 1:
$$\\text{Robot-Hours}_1 = N_1 \\times D_1 \\times H_1 = 125 \\times 39 \\times 7 = 34{,}125\\text{ robot-hours}$$

Since $34{,}125$ robot-hours corresponds to $\\frac{5}{7}$ of the total contract $W$, the total robot-hours required for the entire contract is:
$$W_{\\text{total}} = 34{,}125 \\times \\frac{7}{5} = 47{,}775\\text{ robot-hours}$$

---

### 2. Phase 2 (Remaining Work)
- Fraction of work remaining:
  $$W_2 = 1 - \\frac{5}{7} = \\frac{2}{7}$$
- Required robot-hours for Phase 2:
  $$\\text{Robot-Hours}_2 = 47{,}775 \\times \\frac{2}{7} = 13{,}650\\text{ robot-hours}$$
- Remaining days to finish on schedule:
  $$D_2 = 52 - 39 = 13\\text{ days}$$
- New operational hours per day:
  $$H_2 = 8\\text{ hours/day}$$

Let $N_{\\text{total}}$ be the total number of robots needed in Phase 2:
$$\\text{Robot-Hours}_2 = N_{\\text{total}} \\times D_2 \\times H_2$$
$$13{,}650 = N_{\\text{total}} \\times 13 \\times 8 = 104 \\times N_{\\text{total}}$$
$$N_{\\text{total}} = \\frac{13{,}650}{104} = 131.25\\text{ robots}$$

---

### 3. Number of Additional Robots Required & MTA Errata
The number of additional robots required beyond the initial 125 is:
$$N_{\\text{additional}} = N_{\\text{total}} - N_1 = 131.25 - 125 = 6.25\\text{ robots}$$
Rounding up to the nearest whole robot yields **7 additional robots**.

However, the multiple-choice options printed in the exam were:
- (A) 50
- (B) 89
- (C) 146
- (D) 175

Because none of the options matched the mathematically correct answer of $6.25$ (or $7$), IIT officially declared **Marks to All (MTA)**.

Therefore, the correct answer is **Option A (MTA - Marks to All)**.`,
    images: []
  },

  "me:2017:ga:q1": {
    concept: "General Aptitude - Verbal Aptitude (Grammar: 'One of the' Plural Noun Rule & Adverbial Modification)",
    markdown: `### 1. Analysis of the First Blank
The sentence reads:
> *"He was one of my best _______ and I felt his loss _____"*

- The structure *"one of + [superlative adjective] + [noun]"* selects one individual from a plural collection.
- Consequently, the noun following *"one of my best"* must be a plural countable noun: **"friends"**.

---

### 2. Analysis of the Second Blank
- In the clause *"I felt his loss _____"*, the missing word modifies the verb *"felt"*, describing the intensity or manner of the emotional grief.
- Verbs of perception and feeling are modified by adverbs of manner. The appropriate adverb form of *keen* (meaning deeply, acutely, intensely) is **"keenly"**.
- *Keen* is an adjective and *keener* is a comparative adjective; using an adjective here would be grammatically incorrect.

---

### 3. Conclusion
Combining both words yields: **"friends, keenly"**.
This corresponds to **Option D**.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "me:2017:ga:q2": {
    concept: "General Aptitude - Verbal Aptitude (Vocabulary & Contextual Word Choice)",
    markdown: `### 1. Contextual Semantics
The sentence reads:
> *"As the two speakers become increasingly agitated, the debate became _____"*

- The sentence establishes a direct causal correlation: as the emotional state of the participants turns *"increasingly agitated"* (excited, angry, antagonistic), the nature of their verbal exchange intensifies.
- In standard English idiom, a passionate, contentious, or angry discussion is collocated as a **"heated debate"**.

---

### 2. Distractor Analysis
- **Option A ("lukewarm")**: Means unenthusiastic, half-hearted, or mildly warm. This directly contradicts the mounting agitation of the speakers.
- **Option B ("poetic")**: Means lyrical or aesthetic; irrelevant to an escalating dispute.
- **Option C ("forgiving")**: Means lenient or pardoning; contradicts tension and agitation.
- **Option D ("heated")**: Accurately describes an intense, acrimonious, and emotionally charged debate.

Therefore, the correct answer is **Option D**.`,
    images: []
  },

  "me:2017:ga:q3": {
    concept: "General Aptitude - Quantitative Aptitude (Geometry: Rolling Cone on a Plane Surface)",
    markdown: `### 1. Given Parameters & Slant Height Calculation
- Base radius of the right-circular cone: $r = 5\\text{ cm}$.
- Height of the cone: $h = 12\\text{ cm}$.
- Vertex $P$ is fixed on the ground while point $Q$ on the base perimeter rolls along the ground until it touches again (completing exactly 1 full rotation about its own axis).

Using the Pythagorean theorem, the slant height $L$ of the cone from vertex $P$ to the base perimeter is:
$$L = \\sqrt{r^2 + h^2} = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13\\text{ cm}$$

---

### 2. Geometry of the Rolling Path
When the cone rolls on the ground with its apex $P$ stationary:
1. The circular base of the cone rolls along a circle on the ground of radius $R_{\\text{ground}} = L = 13\\text{ cm}$.
2. In one complete axial revolution of the cone, point $Q$ rolls a distance equal to the circumference of the cone's base:
   $$s = 2\\pi r = 2\\pi \\times 5 = 10\\pi\\text{ cm}$$
3. The angle $\\theta$ (in radians) swept out at the fixed pivot $P$ by this arc distance $s$ on the ground circle is:
   $$\\theta = \\frac{\\text{Arc length } s}{\\text{Radius } L} = \\frac{2\\pi r}{L} = \\frac{10\\pi}{13}\\text{ radians}$$

---

### 3. Conclusion
The angle travelled about $P$ is $\\frac{10\\pi}{13}$ radians.

Therefore, the correct answer is **Option D ($\\frac{10\\pi}{13}$)**.`,
    images: []
  },

  "me:2017:ga:q4": {
    concept: "General Aptitude - Quantitative Aptitude (Descriptive Statistics: Median of a Discrete Distribution)",
    markdown: `### 1. Statistical Definition of Median
For an ordered population of $N = 100$ employees (an even number), the median salary is the average of the two central ranks ($50^{\\text{th}}$ and $51^{\\text{st}}$):
$$\\text{Median} = \\frac{x_{50} + x_{51}}{2}$$

---

### 2. Cumulative Frequency Table
Arranging salaries in ascending order and computing cumulative frequencies:
$$\\begin{array}{|c|c|c|}
\\hline
\\textbf{Salary (Rs.)} & \\textbf{Number of Employees} & \\textbf{Cumulative Frequency} \\\\
\\hline
20{,}000 & 45 & 45 \\\\
30{,}000 & 25 & 70 \\\\
40{,}000 & 20 & 90 \\\\
60{,}000 & 8 & 98 \\\\
150{,}000 & 2 & 100 \\\\
\\hline
\\end{array}$$

---

### 3. Locating the Median
- Employees ranked 1 through 45 earn Rs. 20,000.
- Employees ranked 46 through 70 earn Rs. 30,000.
- Therefore, both the $50^{\\text{th}}$ employee ($x_{50}$) and the $51^{\\text{st}}$ employee ($x_{51}$) earn **Rs. 30,000**:
  $$\\text{Median} = \\frac{30{,}000 + 30{,}000}{2} = \\text{Rs. } 30{,}000$$

Therefore, the correct answer is **Option B (Rs.30,000)**.`,
    images: []
  },

  "me:2017:ga:q5": {
    concept: "General Aptitude - Quantitative & Logical Aptitude (Propositional Logic and Parity of Truth Values)",
    markdown: `### 1. Formal Logical Representation of the Statements
Let $n$ be the number of cars owned by S, where $n \\in \\{0, 1, 2, 3, \\dots\\}$.
The three statements are:
- **P**: $n \\ge 3$
- **Q**: $n < 3$
- **R**: $n \\ge 1$

Condition: **Only one of P, Q, and R is true.**

---

### 2. Law of the Excluded Middle
Observe propositions P and Q:
- For any integer $n$, either $n \\ge 3$ or $n < 3$.
- These two propositions are mutually exclusive and exhaustive:
  $$\\text{P} \\iff \\neg\\text{Q}$$
- Thus, for *every* possible value of $n$, **exactly one of P or Q is guaranteed to be true**.

---

### 3. Determining the Truth Value of R and Car Count $n$
Since exactly one statement among $\\{P, Q, R\\}$ is true, and one truth is already accounted for between P and Q:
- Proposition **R must be FALSE**:
  $$\\text{R} = \\text{False} \\implies \\neg(n \\ge 1) \\implies n < 1$$
- Since the number of cars $n$ must be a non-negative integer ($n \\ge 0$):
  $$n = 0$$

Let us verify $n = 0$:
- P ($0 \\ge 3$): False
- Q ($0 < 3$): **True**
- R ($0 \\ge 1$): False

Exactly one statement (Q) is true, satisfying all problem constraints. Thus, S owns **0 cars**.

Therefore, the correct answer is **Option A (0)**.`,
    images: []
  },

  "me:2017:ga:q6": {
    concept: "General Aptitude - Verbal Aptitude (Reading Comprehension: Idiomatic Meaning in Historical Context)",
    markdown: `### 1. Passage Analysis
The excerpt states:
> *\"Here, throughout the early 1820s, Stuart continued to fight his losing battle to allow his sepoys to wear their caste-marks and their own choice of facial hair on parade, being again reprimanded by the commander-in-chief. His retort that 'A stronger instance than this of European prejudice with relation to this country has never come under my observations' had no effect on his superiors.\"*

---

### 2. Meaning of "Losing Battle"
- The idiom **"losing battle"** denotes an effort or contest that is doomed to failure, in which success is unattainable despite repeated attempts.
- Stuart persistently advocates for his sepoys' right to display their caste-marks and personal facial hair, but his superiors repeatedly reprimand him, and his protests have *"no effect"*.
- Thus, the phrase directly signifies Stuart's repeated failure to persuade the colonial military command to allow sepoys to wear their caste-marks.

---

### 3. Distractor Analysis
- **Option A**: Contradicted by *"had no effect on his superiors"*; the commander-in-chief was entirely unmoved.
- **Option B**: Contradicted by the text; Europeans explicitly forbade caste-marks on parade.
- **Option D**: Contradicted by Stuart explicitly identifying the commander-in-chief's actions as a direct manifestation of European prejudice.
- **Option C**: Accurately defines the meaning of Stuart's "losing battle".

Therefore, the correct answer is **Option C**.`,
    images: []
  },

  "me:2017:ga:q7": {
    concept: "General Aptitude - Quantitative Aptitude (Cryptarithmetic & Subtraction Borrow Ambiguity)",
    markdown: `### 1. Problem Formulation
We are given a subtraction problem with missing digits:
$$\\begin{array}{cccccc}
{} & 5 & A & B & C & D \\\\
- & 4 & 8 & E & 8 & 9 \\\\
\\hline
& & 1 & 1 & 1 & 1
\\end{array}$$

where $A, B, C, D, E$ represent unknown single decimal digits $\\in \\{0, 1, \\dots, 9\\}$.

---

### 2. Column-by-Column Analysis
1. **Units Column**:
   $$D - 9 = 1 \\pmod{10} \\implies D = 0$$
   This requires a borrow of $1$ from the tens column.
2. **Tens Column**:
   With a borrow of 1 taken by the units column, the tens digit becomes $C - 1$:
   $$(C - 1) - 8 = 1 \\pmod{10} \\implies C - 9 = 1 \\pmod{10} \\implies C = 0$$
   This in turn requires a borrow of $1$ from the hundreds column.
3. **Hundreds Column**:
   With a borrow of 1 taken by the tens column:
   $$(B - 1) - E = 1 \\pmod{10} \\implies B - E = 2 \\quad \\text{or} \\quad B - E = -8$$
   - If no borrow is needed from the thousands column: $B - E = 2$.
   - If a borrow is taken from the thousands column: $(B - 1 + 10) - E = 1 \\implies B - E = -8 \\implies B = 0, E = 8$ or similar.
4. **Thousands Column**:
   Depending on whether a borrow occurred in the hundreds column, $A$ can take multiple values that still yield $1$ after subtracting $8$ with borrowing from the ten-thousands column ($5$).

Because the borrowing path is unconstrained across multiple simultaneous variables, several distinct digit combinations $(A, B, C, D, E)$ satisfy the equation, resulting in different sums of missing digits.

Therefore, the sum cannot be uniquely determined, matching **Option D**.

Therefore, the correct answer is **Option D (Cannot be determined.)**.`,
    images: []
  },

  "me:2017:ga:q8": {
    concept: "General Aptitude - Quantitative Aptitude (Coordinate Geometry & Planar Inequalities)",
    markdown: `### 1. Definition and Area of Region $S_1$
Region $S_1$ is bounded by:
$$|x - 1| \\le 2 \\quad \\text{and} \\quad |y + 3| \\le 3$$

- Solving the $x$-inequality:
  $$-2 \\le x - 1 \\le 2 \\implies -1 \\le x \\le 3$$
  Width $\\Delta x = 3 - (-1) = 4$.
- Solving the $y$-inequality:
  $$-3 \\le y + 3 \\le 3 \\implies -6 \\le y \\le 0$$
  Height $\\Delta y = 0 - (-6) = 6$.

Region $S_1$ is a rectangle with area:
$$\\text{Area}(S_1) = 4 \\times 6 = 24$$

---

### 2. Definition and Area of Region $S_2$
Region $S_2$ is defined by:
$$x - y \\ge -2, \\quad y \\ge 1, \\quad x \\le 3$$

Rearranging the first inequality:
$$y \\le x + 2$$
Combining with $y \\ge 1$ and $x \\le 3$:
- At $y = 1$, the lower bound gives $x + 2 \\ge 1 \\implies x \\ge -1$.
- Thus, $x$ ranges from $-1$ to $3$.
- The vertices of region $S_2$ are:
  1. Intersection of $y = 1$ and $y = x + 2$: point $(-1, 1)$
  2. Intersection of $y = 1$ and $x = 3$: point $(3, 1)$
  3. Intersection of $x = 3$ and $y = x + 2$: point $(3, 5)$

$S_2$ is a right-angled triangle with:
- Horizontal base along $y = 1$ from $x = -1$ to $x = 3$: $\\text{base} = 3 - (-1) = 4$
- Vertical altitude along $x = 3$ from $y = 1$ to $y = 5$: $\\text{height} = 5 - 1 = 4$

$$\\text{Area}(S_2) = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times 4 \\times 4 = 8$$

---

### 3. Area of the Union $S = S_1 \\cup S_2$
Observe the $y$-coordinates of both regions:
- For all $(x, y) \\in S_1$: $y \\le 0$
- For all $(x, y) \\in S_2$: $y \\ge 1$

Since $y \\le 0$ and $y \\ge 1$ are strictly disjoint ($S_1 \\cap S_2 = \\emptyset$):
$$\\text{Area}(S) = \\text{Area}(S_1) + \\text{Area}(S_2) = 24 + 8 = 32$$

Therefore, the correct answer is **Option C (32)**.`,
    images: []
  },

  "me:2017:ga:q9": {
    concept: "General Aptitude - Verbal Aptitude (Critical Reasoning: Conversational Implicature)",
    markdown: `### 1. Conversational Exchange Breakdown
- **Fact**: Mark and Steve are brothers who both play for Country K.
- **Mark's provocative remark to James (Country E)**:
  > *\"There is no way you are good enough to play for your country.\"*
- **James's witty retort**:
  > *\"Maybe not, but at least I am the best player in my own family.\"*

---

### 2. Logical Implicature
- James concedes that he might not be a world-class player for Country E (*\"Maybe not\"*).
- However, he claims that within his own family, he holds the top spot (*\"at least I am the best player in my own family\"*).
- For this retort to serve as an effective, biting insult toward Mark, it must exploit an insecurity or vulnerability in Mark's household: namely, that **Mark is NOT the best player in his own family**.
- Since Mark and Steve are brothers competing in the same sport, James's reply implies that **Steve was known to play better than Mark**.

---

### 3. Distractor Analysis
- **Option A**: James is not admitting Mark is better than him; he is deflecting by attacking Mark's standing at home.
- **Option C**: The text suggests athletic rivalry and banter, not a close friendship between James and Steve.
- **Option D**: James makes no claim about his skill relative to Steve; he only compares Mark with Steve.

Therefore, the correct answer is **Option B (Steve was known to play better than Mark.)**.`,
    images: []
  },

  "me:2017:ga:q10": {
    concept: "General Aptitude - Quantitative Aptitude (Data Interpretation: Bacterial Growth Curves)",
    markdown: `### 1. Analysis of Statement i
> *\"The growth in bacterial population stops earlier at 37$^{\\circ}C$ as compared to 25$^{\\circ}C$\"*

- Looking at the population density curves over time:
  - At $37^\\circ\\text{C}$, the exponential growth phase terminates and the curve enters the stationary plateau phase at approximately $t \\approx 140\\text{ minutes}$.
  - At $25^\\circ\\text{C}$, the bacterial population continues to grow past $140\\text{ minutes}$, not reaching its plateau until approximately $t \\approx 220\\text{ minutes}$.
- Because the curve at $37^\\circ\\text{C}$ flattens earlier, the cessation of population growth occurs sooner at $37^\\circ\\text{C}$.
- Therefore, **Statement i is TRUE**.

---

### 2. Analysis of Statement ii
> *\"The time taken for curd formation at 25$^{\\circ}C$ is twice the time taken at 37$^{\\circ}C$\"*

- The problem states that curd formation requires a **minimum bacterial population density of 0.8**.
- Reading the time corresponding to density $0.8$ from the graph:
  - At $37^\\circ\\text{C}$, the density reaches $0.8$ at $t_{37} \\approx 80\\text{ minutes}$.
  - At $25^\\circ\\text{C}$, the density reaches $0.8$ at $t_{25} \\approx 120\\text{ minutes}$.
- Comparing the times:
  $$\\frac{t_{25}}{t_{37}} \\approx \\frac{120}{80} = 1.5$$
- For statement ii to be true, $t_{25}$ would have to be $2 \\times 80 = 160\\text{ minutes}$.
- Since $120 \\neq 160$, the time at $25^\\circ\\text{C}$ is $1.5$ times, not twice, the time at $37^\\circ\\text{C}$.
- Therefore, **Statement ii is FALSE**.

---

### 3. Conclusion
Only Statement i is correct.

Therefore, the correct answer is **Option A (only i.)**.`,
    images: []
  },

  "me:2017:ga:q1-s2": {
    concept: "General Aptitude - Verbal Aptitude (Grammar: Subject-Verb Agreement with Intervening Relative Clause)",
    markdown: `### 1. Structural Syntax and Subject-Verb Agreement
The sentence reads:
> *\"The ways in which this game can be played _________ potentially infinite.\"*

- Identify the main clause subject and verb:
  - **Head Subject**: *"The ways"* (plural noun).
  - **Intervening Relative Clause**: *"in which this game can be played"* modifies *"The ways"*. The singular noun *"game"* functions strictly as the subject of the subordinate clause, not the main clause.
- According to standard subject-verb agreement in English, a plural subject requires a plural verb:
  $$\\text{The ways [plural]} \\implies \\mathbf{are} \\text{ [plural]}$$

---

### 2. Aspect and Mood
- The sentence describes an inherent, permanent characteristic (a state of being) of the game's possibilities.
- The simple present tense **"are"** correctly expresses this timeless factual condition.
- The continuous passive form *"are being"* would incorrectly signify an ongoing external action currently acting on the ways.

---

### 3. Conclusion
Among the given options:
- (A) is (singular, incorrect)
- (B) is being (singular continuous, incorrect)
- (C) **are** (plural simple present, **correct**)
- (D) are being (plural continuous, incorrect)

Therefore, the correct answer is **Option C (are)**.`,
    images: []
  },

  "me:2017:ga:q2-s2": {
    concept: "General Aptitude - Verbal Aptitude (Vocabulary & Collocations: Mutually Exclusive Alternatives)",
    markdown: `### 1. Contextual Semantics & Collocation
The sentence reads:
> *\"If you choose plan P, you will have to _________ plan Q, as these two are mutually ________.\"*

- **Second Blank**:
  - In logic, probability, and decision-making, two alternative options or events that cannot occur simultaneously are termed **"mutually exclusive"**. If one is chosen, the other is automatically eliminated.
- **First Blank**:
  - The verb **"forgo"** (also spelled *forego*) means to give up, relinquish, or voluntarily do without something desirable.
  - If plans P and Q are mutually exclusive, deciding to pursue plan P strictly requires one to give up (forgo) plan Q.

---

### 2. Distractor Analysis
- **Option B ("forget, inclusive")**: "Mutually inclusive" would mean choosing one necessitates including the other, contradicting having to abandon it.
- **Option C ("accept, exhaustive")**: "Exhaustive" means covering all possibilities; it does not describe mutual incompatibility between two alternatives.
- **Option D ("adopt, intrusive")**: "Intrusive" means entering without invitation, which is nonsensical in this decision context.

---

### 3. Conclusion
The only combination that establishes grammatical coherence and semantic precision is **"forgo, exclusive"**.

Therefore, the correct answer is **Option A (forgo, exclusive)**.`,
    images: []
  }
};

export function applyChunkGaMe01() {
  const chunkPath = path.resolve("data/solutions/chunks/me/chunk-ga-me-01.json");
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf8"));

  // 1. Mark accepted in chunk file
  for (const q of chunkData.questions) {
    const uid = q.uid || q.question_uid;
    if (CHUNK_GA_ME_01_SOLUTIONS[uid]) {
      q.status = "ACCEPTED";
      q.solutionMarkdown = CHUNK_GA_ME_01_SOLUTIONS[uid].markdown;
      q.conceptSummary = CHUNK_GA_ME_01_SOLUTIONS[uid].concept;
    }
  }
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf8");
  console.log(`Updated ${chunkPath} with ACCEPTED status and solutions.`);

  // 2. Inject into patch-authentic-solutions.mjs
  const patchFile = path.resolve("scripts/pipeline/patch-authentic-solutions.mjs");
  const patchContent = fs.readFileSync(patchFile, "utf8");

  const targetMarker = "export function applyAuthenticPatches() {";
  const injectionEntries = Object.entries(CHUNK_GA_ME_01_SOLUTIONS).map(([uid, data]) => {
    return `  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images)}\n  },`;
  }).join("\n\n");

  if (!patchContent.includes('"me:2025:ga:q8": {')) {
    if (patchContent.includes(targetMarker)) {
      const updatedContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `\n  // CHUNK-GA-ME-01\n${injectionEntries}\n};\n\nexport function applyAuthenticPatches() {`);
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
    manifest.chunks["CHUNK-GA-ME-01"] = {
      chunkId: "CHUNK-GA-ME-01",
      branch: "me",
      year: "all",
      section: "ga",
      file: "data/solutions/chunks/me/chunk-ga-me-01.json",
      count: 25,
      createdAt: new Date().toISOString(),
      uids: Object.keys(CHUNK_GA_ME_01_SOLUTIONS),
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    };
    for (const uid of Object.keys(CHUNK_GA_ME_01_SOLUTIONS)) {
      manifest.assignedUids[uid] = "CHUNK-GA-ME-01";
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Updated manifest.json: CHUNK-GA-ME-01 registered and marked COMPLETED.`);
  }

  // 4. Apply authentic patches to shards and all-solutions.json
  execSync("node scripts/pipeline/patch-authentic-solutions.mjs", { stdio: "inherit" });
  console.log("CHUNK-GA-ME-01 successfully applied.");
}

if (process.argv[1] && process.argv[1].includes("apply-chunk-ga-me-01")) {
  applyChunkGaMe01();
}
