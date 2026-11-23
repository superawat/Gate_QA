import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// 1. Define authentic solutions
const GO1019_SOLUTION = String.raw`### 1. Transmission Link Parameters
- **Baud Rate**: $9600\text{ baud}$. In standard digital serial communication (such as RS-232), binary signaling is used ($1\text{ baud} = 1\text{ bit per second}$). Thus, the link line rate is:
  $$\text{Data Rate} = 9600\text{ bits per second (bps)}$$

---

### 2. Framing Structure per Character (Asynchronous Mode)
In asynchronous serial transmission, each character frame is delimited by start and stop bits to maintain character-level synchronization:
- Start bits: $1\text{ bit}$
- Data bits: $8\text{ bits}$ (for an 8-bit character)
- Parity bit: $1\text{ bit}$
- Stop bits: $2\text{ bits}$

Total bits required to transmit a single $8$-bit character:
$$\text{Total bits per character} = 1\text{ (start)} + 8\text{ (data)} + 1\text{ (parity)} + 2\text{ (stop)} = 12\text{ bits/character}$$

---

### 3. Characters Transmitted per Second
The number of complete $8$-bit characters transmitted per second is:
$$\text{Characters per second} = \frac{\text{Total transmission rate in bits/second}}{\text{Total bits per character}} = \frac{9600\text{ bits/second}}{12\text{ bits/character}} = 800\text{ characters/second}$$

---

### 4. Conclusion & Option Matching
- Calculating $\frac{9600}{12}$ yields exactly **$800$**, which matches **Option B**.

Therefore, the correct answer is **Option B (800)**.`;

const GO399247_SOLUTION = String.raw`### 1. Functional Relation Analysis
We are given two single-variable functions $f(x)$ and $g(y)$ defined for all real values of $x$ and $y$, satisfying:
$$f(x) = g(y) \quad \text{for all } x, y \in \mathbb{R}$$

Notice that the left-hand side $f(x)$ depends strictly on the independent variable $x$ and is independent of $y$. Conversely, the right-hand side $g(y)$ depends strictly on the independent variable $y$ and is independent of $x$.

---

### 2. Mathematical Deduction
Fix any arbitrary constant value for $y$, say $y = y_0 \in \mathbb{R}$. Since $g(y)$ is a well-defined function, $g(y_0)$ evaluates to a specific real constant $C = g(y_0)$.

Substituting $y = y_0$ into the given equation:
$$f(x) = g(y_0) = C \quad \text{for all } x \in \mathbb{R}$$

This proves that $f(x)$ must be a constant function equal to $C$ for all $x$.

Similarly, fix any arbitrary value for $x$, say $x = x_0 \in \mathbb{R}$. Then $f(x_0) = C$, which implies:
$$g(y) = f(x_0) = C \quad \text{for all } y \in \mathbb{R}$$

Thus, both $f(x)$ and $g(y)$ must be identically equal to the same constant $C$:
$$f(x) = g(y) = C = \text{constant}$$

---

### 3. Evaluation of Options
- **Option A ($f(x)=0$ and $g(y)=0$):** Not necessarily true. The constant $C$ can be any real number (e.g., $f(x) = 5$ and $g(y) = 5$ satisfies the condition).
- **Option B ($f(x)=g(y)=\text{constant}$):** **Necessarily true.** As derived above, both functions must be identical constants.
- **Option C ($f(x) \neq \text{constant}$ and $g(y) \neq \text{constant}$):** False, as both functions must be constants.
- **Option D ($f(x)+g(y)=f(x)-g(y)$):** Subtracting $f(x)$ from both sides gives $g(y) = -g(y) \implies 2g(y) = 0 \implies g(y) = 0$. This forces the constant to be $0$, which is not necessarily true for general nonzero constants.

Therefore, the correct answer is **Option B ($f(x)=g(y)=\text{constant}$)**.`;

const GO411678_SOLUTION = String.raw`### 1. Problem Formulation
We are given the periodic ringing intervals of three school bells:
- Bell $P$: rings every $20\text{ minutes}$
- Bell $Q$: rings every $30\text{ minutes}$
- Bell $R$: rings every $50\text{ minutes}$

All three bells ring simultaneously at $12:00\text{ PM}$. To find the next time all three bells ring together, we must determine the Least Common Multiple ($\text{LCM}$) of their individual ringing intervals.

---

### 2. Computing the LCM
Find the prime factorizations of $20$, $30$, and $50$:
$$\begin{aligned}
20 &= 2^2 \times 5^1 \\
30 &= 2^1 \times 3^1 \times 5^1 \\
50 &= 2^1 \times 5^2
\end{aligned}$$

The LCM is obtained by taking the highest power of each prime factor present:
$$\begin{aligned}
\text{LCM}(20, 30, 50) &= 2^{\max(2, 1, 1)} \times 3^{\max(0, 1, 0)} \times 5^{\max(1, 1, 2)} \\
&= 2^2 \times 3^1 \times 5^2 \\
&= 4 \times 3 \times 25 \\
&= 300\text{ minutes}
\end{aligned}$$

---

### 3. Converting to Hours & Determining the Next Ringing Time
Convert $300\text{ minutes}$ into hours:
$$\text{Time interval} = \frac{300\text{ minutes}}{60\text{ minutes/hour}} = 5\text{ hours}$$

The bells will ring together again exactly $5\text{ hours}$ after $12:00\text{ PM}$:
$$12:00\text{ PM} + 5\text{ hours} = 5:00\text{ PM}$$

---

### 4. Conclusion & Option Matching
- The calculated time of $5:00\text{ PM}$ corresponds to **Option A**.

Therefore, the correct answer is **Option A (5:00 PM)**.`;

const GO411706_SOLUTION = String.raw`### 1. Formal Logical Representation of Premises
Let $E$ denote the set of engineers, $W$ denote the set of writers, and $A$ denote the set of actors.
The given statements are:
1. **Statement 1**: *"Some engineers are writers."*
   $$\exists x : x \in (E \cap W) \implies E \cap W \neq \emptyset$$
2. **Statement 2**: *"No writer is an actor."*
   $$W \cap A = \emptyset \quad (\text{equivalently, if } x \in W \implies x \notin A)$$
3. **Statement 3**: *"All actors are engineers."*
   $$A \subseteq E \quad (\text{equivalently, if } x \in A \implies x \in E)$$

---

### 2. Systematic Evaluation of Conclusions

- **Conclusion I: "Some writers are engineers."**
  - From Statement 1, $E \cap W \neq \emptyset$.
  - Set intersection is commutative: $E \cap W = W \cap E$.
  - Therefore, $W \cap E \neq \emptyset$, which translates directly to *"Some writers are engineers"*.
  - **Conclusion I is logically VALID.**

- **Conclusion II: "All engineers are actors."**
  - Statement 3 asserts $A \subseteq E$ (every actor is an engineer). The subset relation is not generally symmetric ($A \subseteq E \not\implies E \subseteq A$).
  - Moreover, by Statement 1, there exist engineers who are writers ($x \in E \cap W$). Since no writer is an actor ($W \cap A = \emptyset$), these engineer-writers cannot be actors ($x \notin A$).
  - Hence, not all engineers are actors.
  - **Conclusion II is INVALID.**

- **Conclusion III: "No actor is a writer."**
  - Statement 2 asserts $W \cap A = \emptyset$.
  - Set disjointness is symmetric: $W \cap A = \emptyset \iff A \cap W = \emptyset$.
  - Therefore, no actor is a writer.
  - **Conclusion III is logically VALID.**

- **Conclusion IV: "Some actors are writers."**
  - Statement 2 explicitly establishes that $W$ and $A$ are completely disjoint ($W \cap A = \emptyset$).
  - Thus, there cannot exist any actor who is a writer ($A \cap W = \emptyset$).
  - **Conclusion IV is INVALID (and directly contradicts Statement 2).**

---

### 3. Conclusion & Option Matching
- Both **Conclusion I** and **Conclusion III** are strictly valid, while Conclusions II and IV are false.
- This directly matches **Option C: "Only conclusion I and conclusion III are correct"**.

Therefore, the correct answer is **Option C**.`;

// Step A: Patch scripts/pipeline/patch-authentic-solutions.mjs
{
  const patchFile = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
  let content = fs.readFileSync(patchFile, "utf8");

  const solutionsDef = `const GO1019_SOLUTION = String.raw\`${GO1019_SOLUTION}\`;\n\n` +
    `const GO399247_SOLUTION = String.raw\`${GO399247_SOLUTION}\`;\n\n` +
    `const GO411678_SOLUTION = String.raw\`${GO411678_SOLUTION}\`;\n\n` +
    `const GO411706_SOLUTION = String.raw\`${GO411706_SOLUTION}\`;\n\n`;

  const patchEntries = `  "go:1019": {
    concept: "computer-networks: asynchronous-serial-transmission-baud-rate",
    markdown: GO1019_SOLUTION,
    images: [],
  },
  "go:399247": {
    concept: "quantitative-aptitude: functional-equations",
    markdown: GO399247_SOLUTION,
    images: [],
  },
  "go:411678": {
    concept: "quantitative-aptitude: lcm-periodic-events",
    markdown: GO411678_SOLUTION,
    images: [],
  },
  "go:411706": {
    concept: "verbal-aptitude: syllogisms-deductive-logic",
    markdown: GO411706_SOLUTION,
    images: [],
  },\n`;

  const targetExport = "export const AUTHENTIC_PATCHES = {";
  const idx = content.indexOf(targetExport);
  if (idx !== -1 && !content.includes('"go:1019": {')) {
    content = content.substring(0, idx) + solutionsDef + targetExport + "\n" + patchEntries + content.substring(idx + targetExport.length);
    fs.writeFileSync(patchFile, content, "utf8");
    console.log("Patched scripts/pipeline/patch-authentic-solutions.mjs");
  } else {
    console.log("Already patched or target not found in patch-authentic-solutions.mjs");
  }
}

// Step B: Update data/solutions/practicepaper/all-solutions.json and cse-solutions.json
{
  const ppAllPath = path.join(ROOT, "data/solutions/practicepaper/all-solutions.json");
  if (fs.existsSync(ppAllPath)) {
    const ppAll = JSON.parse(fs.readFileSync(ppAllPath, "utf8"));
    if (ppAll["go:1019"]) {
      ppAll["go:1019"].has_detailed_solution = true;
      ppAll["go:1019"].detailed_solution = GO1019_SOLUTION;
    }
    if (ppAll["go:399247"]) {
      ppAll["go:399247"].has_detailed_solution = true;
      ppAll["go:399247"].detailed_solution = GO399247_SOLUTION;
    }
    fs.writeFileSync(ppAllPath, JSON.stringify(ppAll, null, 2), "utf8");
    console.log("Updated practicepaper/all-solutions.json");
  }

  const ppCsePath = path.join(ROOT, "data/solutions/practicepaper/cse-solutions.json");
  if (fs.existsSync(ppCsePath)) {
    const ppCse = JSON.parse(fs.readFileSync(ppCsePath, "utf8"));
    if (ppCse["go:1019"]) {
      ppCse["go:1019"].has_detailed_solution = true;
      ppCse["go:1019"].detailed_solution = GO1019_SOLUTION;
    }
    if (ppCse["go:399247"]) {
      ppCse["go:399247"].has_detailed_solution = true;
      ppCse["go:399247"].detailed_solution = GO399247_SOLUTION;
    }
    fs.writeFileSync(ppCsePath, JSON.stringify(ppCse, null, 2), "utf8");
    console.log("Updated practicepaper/cse-solutions.json");
  }
}

// Step C: Update data/solutions/cse-v1.json:
// 1. Set authentic solutions for go:1019, go:399247, go:411678, go:411706
// 2. Purge the other 53 synthetic go:411... questions in 2022-additional.json
{
  const cseV1Path = path.join(ROOT, "data/solutions/cse-v1.json");
  const shard2022Path = path.join(ROOT, "public/question-detail-shards/2022-additional.json");
  const shard2022 = JSON.parse(fs.readFileSync(shard2022Path, "utf8"));
  const cseV1 = JSON.parse(fs.readFileSync(cseV1Path, "utf8"));

  cseV1["go:1019"] = {
    question_uid: "go:1019",
    verified_answer: "B",
    concept_summary: "computer-networks: asynchronous-serial-transmission-baud-rate",
    solution_markdown: GO1019_SOLUTION
  };
  cseV1["go:399247"] = {
    question_uid: "go:399247",
    verified_answer: "B",
    concept_summary: "quantitative-aptitude: functional-equations",
    solution_markdown: GO399247_SOLUTION
  };
  cseV1["go:411678"] = {
    question_uid: "go:411678",
    verified_answer: "A",
    concept_summary: "quantitative-aptitude: lcm-periodic-events",
    solution_markdown: GO411678_SOLUTION
  };
  cseV1["go:411706"] = {
    question_uid: "go:411706",
    verified_answer: "C",
    concept_summary: "verbal-aptitude: syllogisms-deductive-logic",
    solution_markdown: GO411706_SOLUTION
  };

  let purgedCount = 0;
  for (const uid of Object.keys(shard2022.recordsByQuestionUid)) {
    if (uid !== "go:411678" && uid !== "go:411706") {
      if (cseV1[uid]) {
        delete cseV1[uid];
        purgedCount++;
      }
      delete shard2022.recordsByQuestionUid[uid].detailed_solution;
      delete shard2022.recordsByQuestionUid[uid].solution_markdown;
    }
  }

  // Set authentic solutions directly in shard2022
  shard2022.recordsByQuestionUid["go:411678"].detailed_solution = {
    concept: "General Aptitude - Quantitative Aptitude (LCM & Periodic Ringing)",
    markdown: GO411678_SOLUTION,
    images: []
  };
  shard2022.recordsByQuestionUid["go:411706"].detailed_solution = {
    concept: "General Aptitude - Analytical Aptitude (Syllogisms & Deductive Logic)",
    markdown: GO411706_SOLUTION,
    images: []
  };

  fs.writeFileSync(cseV1Path, JSON.stringify(cseV1, null, 2), "utf8");
  fs.writeFileSync(shard2022Path, JSON.stringify(shard2022, null, 2), "utf8");
  console.log(`Updated cse-v1.json and 2022-additional.json (purged ${purgedCount} misassigned solutions).`);
}

// Step D: Repair question stem for go:399247 across public question banks and shards
{
  const cleanQuestionHtml = `<p>$f(x)$ and $g(y)$ are functions of $x$ and $y$, respectively, and $f(x)=g(y)$ for all real values of $x$ and $y$. Which one of the following options is necessarily $\\text{TRUE}$ for all $x$ and $y$?</p>\n<ol style="list-style-type:upper-alpha">\n<li>$f(x)=0$ and $g(y)=0$</li>\n<li>$f(x)=g(y)=\\text{constant}$</li>\n<li>$f(x) \\neq \\text{constant}$ and $g(y) \\neq \\text{constant}$</li>\n<li>$f(x)+g(y)=f(x)-g(y)$</li>\n</ol>`;

  const bankFiles = [
    "public/questions-with-answers.json",
    "public/questions-filtered.json",
    "public/questions-filtered-with-ids.json"
  ];

  for (const rel of bankFiles) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (Array.isArray(data)) {
      const q = data.find(x => x.question_uid === "go:399247");
      if (q) {
        q.question = cleanQuestionHtml;
        fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
        console.log(`Repaired go:399247 in ${rel}`);
      }
    }
  }

  // Update shards 2004-s0.json and 2023-s0.json
  const shard2004Path = path.join(ROOT, "public/question-detail-shards/2004-s0.json");
  if (fs.existsSync(shard2004Path)) {
    const s2004 = JSON.parse(fs.readFileSync(shard2004Path, "utf8"));
    if (s2004.recordsByQuestionUid?.["go:1019"]) {
      s2004.recordsByQuestionUid["go:1019"].detailed_solution = {
        concept: "Computer Networks - Asynchronous Serial Transmission & Baud Rate",
        markdown: GO1019_SOLUTION,
        images: []
      };
      fs.writeFileSync(shard2004Path, JSON.stringify(s2004, null, 2), "utf8");
      console.log("Updated go:1019 in 2004-s0.json");
    }
  }

  const shard2023Path = path.join(ROOT, "public/question-detail-shards/2023-s0.json");
  if (fs.existsSync(shard2023Path)) {
    const s2023 = JSON.parse(fs.readFileSync(shard2023Path, "utf8"));
    if (s2023.recordsByQuestionUid?.["go:399247"]) {
      s2023.recordsByQuestionUid["go:399247"].question = cleanQuestionHtml;
      s2023.recordsByQuestionUid["go:399247"].detailed_solution = {
        concept: "General Aptitude - Quantitative Aptitude (Functional Equations)",
        markdown: GO399247_SOLUTION,
        images: []
      };
      fs.writeFileSync(shard2023Path, JSON.stringify(s2023, null, 2), "utf8");
      console.log("Updated go:399247 in 2023-s0.json");
    }
  }
}

console.log("All patches and purges applied successfully.");

