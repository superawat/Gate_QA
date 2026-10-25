#!/usr/bin/env node

/**
 * scripts/qa/apply-oct-25-fixes.mjs
 * ---------------------------------
 * Executes authoritative question, answer, taxonomy, and textual fixes:
 * 1. ec:2005:q20: Correct answer key to Option B in raw-ec-2005.json and manual patches.
 * 2. go:3594: Restore 1D array brackets [] and int main() in question text.
 * 3. go:2618: Register optimal non-preemptive schedule Option A ({3, 2, 1}, 1).
 * 4. go:1371: Reclassify to Programming and DS -> Binary Search Tree.
 * 5. go:411922: Verify Option A (Cruel) and replace mismatched max-heap detailed solution.
 * 6. go:3353: Correct Radix Sort time complexity to Option C (Theta(n log n)).
 * 7. go:840: Harmonize detailed solution conclusion with verified Option A (n).
 * 8. go:460824: Fix typos (Backpatching, following).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

console.log('🚀 Starting October 25 Question Issues Resolution Script...');

// 1. GATE EC 2005 Q20 (ec:2005:q20)
const rawEc2005Path = path.join(ROOT, 'audit/ec/raw-ec-2005.json');
if (fs.existsSync(rawEc2005Path)) {
  const rawEc2005 = JSON.parse(fs.readFileSync(rawEc2005Path, 'utf-8'));
  const q20 = rawEc2005.questions?.find((q) => q.qNum === 20);
  if (q20) {
    q20.rawAnswer = 1; // 1 = Option B (was 3 = Option D)
    fs.writeFileSync(rawEc2005Path, JSON.stringify(rawEc2005, null, 2), 'utf-8');
    console.log('✅ Updated audit/ec/raw-ec-2005.json Q20 rawAnswer to 1 (Option B)');
  }
}

// 2. Patch data/answers/manual-answers-patch-v1.json
const manualPatchPath = path.join(ROOT, 'data/answers/manual-answers-patch-v1.json');
if (fs.existsSync(manualPatchPath)) {
  const patchData = JSON.parse(fs.readFileSync(manualPatchPath, 'utf-8'));
  patchData.records_by_question_uid = patchData.records_by_question_uid || {};

  // ec:2005:q20 & pp:ec:2005:q20
  patchData.records_by_question_uid['ec:2005:q20'] = {
    answer_uid: 'ec:2005:q20',
    type: 'MCQ',
    answer: 'B',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_ec_2005:q20:causal_system_impulse_response_option_b',
    },
  };
  patchData.records_by_question_uid['pp:ec:2005:q20'] = {
    answer_uid: 'ec:2005:q20',
    type: 'MCQ',
    answer: 'B',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_ec_2005:q20:causal_system_impulse_response_option_b',
    },
  };

  // go:2618 (OS optimal non-preemptive schedule)
  patchData.records_by_question_uid['go:2618'] = {
    answer_uid: 'v2:7.19.6',
    type: 'MCQ',
    answer: 'A',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_cse_1995:q2_6:optimal_non_preemptive_sjf_with_idle_time_option_a',
    },
  };

  // go:411922 (GA verbal analogy)
  patchData.records_by_question_uid['go:411922'] = {
    answer_uid: 'manual:go:411922',
    type: 'MCQ',
    answer: 'A',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_civil_2023_set2_ga_q2:antonym_analogy_kind_cruel_option_a',
    },
  };

  // go:3353 (Radix sort time complexity)
  patchData.records_by_question_uid['go:3353'] = {
    answer_uid: 'it:2008:q43',
    type: 'MCQ',
    answer: 'C',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_it_2008:q43:radix_sort_time_complexity_theta_n_log_n_option_c',
    },
  };

  // go:840 (Randomized search comparisons)
  patchData.records_by_question_uid['go:840'] = {
    answer_uid: 'manual:go:840',
    type: 'MCQ',
    answer: 'A',
    tolerance: null,
    source: {
      kind: 'official_key',
      note: 'gate_cse_2002:q2_10:randomized_search_expected_comparisons_option_a',
    },
  };

  fs.writeFileSync(manualPatchPath, JSON.stringify(patchData, null, 2), 'utf-8');
  console.log('✅ Updated data/answers/manual-answers-patch-v1.json');
}

// 3. Update data/answers/answers_by_question_uid_v1.json & public/data/answers/answers_by_question_uid_v1.json
const answerUidPaths = [
  path.join(ROOT, 'data/answers/answers_by_question_uid_v1.json'),
  path.join(ROOT, 'public/data/answers/answers_by_question_uid_v1.json'),
];

for (const p of answerUidPaths) {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    data.records_by_question_uid = data.records_by_question_uid || {};

    data.records_by_question_uid['ec:2005:q20'] = {
      answer_uid: 'ec:2005:q20',
      type: 'MCQ',
      answer: 'B',
      tolerance: null,
      source: { kind: 'question_uid' },
    };
    data.records_by_question_uid['pp:ec:2005:q20'] = {
      answer_uid: 'ec:2005:q20',
      type: 'MCQ',
      answer: 'B',
      tolerance: null,
      source: { kind: 'question_uid' },
    };
    data.records_by_question_uid['go:3353'] = {
      answer_uid: 'it:2008:q43',
      type: 'MCQ',
      answer: 'C',
      tolerance: null,
      source: { kind: 'question_uid' },
    };
    data.records_by_question_uid['go:840'] = {
      answer_uid: 'manual:go:840',
      type: 'MCQ',
      answer: 'A',
      tolerance: null,
      source: { kind: 'question_uid' },
    };
    data.records_by_question_uid['go:2618'] = {
      answer_uid: 'v2:7.19.6',
      type: 'MCQ',
      answer: 'A',
      tolerance: null,
      source: { kind: 'question_uid' },
    };
    data.records_by_question_uid['go:411922'] = {
      answer_uid: 'manual:go:411922',
      type: 'MCQ',
      answer: 'A',
      tolerance: null,
      source: { kind: 'question_uid' },
    };

    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Updated ${path.relative(ROOT, p)}`);
  }
}

// 4. Update IT answer files
const itAnswerPaths = [
  path.join(ROOT, 'public/data/it/answers-gateit.json'),
  path.join(ROOT, 'public/data/it/gateit-2008.json'),
  path.join(ROOT, 'public/data/it/gateit-all.json'),
];

for (const p of itAnswerPaths) {
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf-8');
    let data = JSON.parse(raw);
    if (Array.isArray(data)) {
      const q = data.find((item) => item.question_uid === 'go:3353');
      if (q) {
        q.answer = 'C';
        if (q.answer_meta) q.answer_meta.answer = 'C';
      }
    } else if (data['go:3353']) {
      data['go:3353'].answer = 'C';
      if (data['go:3353'].answer_meta) data['go:3353'].answer_meta.answer = 'C';
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Updated ${path.relative(ROOT, p)}`);
  }
}

// 5. Update data/taxonomy/curated-question-taxonomy-v1.json for go:1371
const curatedTaxPath = path.join(ROOT, 'data/taxonomy/curated-question-taxonomy-v1.json');
if (fs.existsSync(curatedTaxPath)) {
  const curatedData = JSON.parse(fs.readFileSync(curatedTaxPath, 'utf-8'));
  curatedData.questions = curatedData.questions || {};
  curatedData.questions['go:1371'] = {
    question_uid: 'go:1371',
    exam_uid: 'cse:2005:set1:main:q35',
    taxonomy: {
      primary: {
        subjectSlug: 'prog-ds',
        topicSlug: 'trees-heaps',
        subtopicSlug: 'binary-search-tree',
      },
      secondary: [
        {
          subjectSlug: 'discrete-math',
          topicSlug: 'combinatorics',
          subtopicSlug: 'counting',
        },
      ],
      conceptTags: ['binary-search-tree', 'catalan-number', 'counting'],
    },
    rationale:
      'Counts distinct binary search tree structures on 4 distinct keys (C_4 = 14) under Programming & Data Structures (Binary Search Tree), evaluated via Catalan numbers under Combinatorics.',
    syllabusRef: 'GATE CSE Section 2 (Programming and Data Structures / Trees)',
  };
  fs.writeFileSync(curatedTaxPath, JSON.stringify(curatedData, null, 2), 'utf-8');
  console.log('✅ Updated data/taxonomy/curated-question-taxonomy-v1.json with go:1371');
}

// 6. Update public/questions-with-answers.json
const qwaPath = path.join(ROOT, 'public/questions-with-answers.json');
if (fs.existsSync(qwaPath)) {
  const questions = JSON.parse(fs.readFileSync(qwaPath, 'utf-8'));

  for (const q of questions) {
    // go:3594: Restore 1D array brackets and int main()
    if (q.question_uid === 'go:3594') {
      q.question = q.question
        .replace(/int a1 = {/g, 'int a1[] = {')
        .replace(/int a2 = {/g, 'int a2[] = {')
        .replace(/int a3 = {/g, 'int a3[] = {')
        .replace(/int \*x = {/g, 'int *x[] = {')
        .replace(/void print\(int \*a\)/g, 'void print(int *a[])')
        .replace(/main\s*\n\s*{/g, 'int main()\n{');
      console.log('✅ Updated go:3594 code formatting in questions-with-answers.json');
    }

    // go:1371: Update taxonomy tags to Programming and DS -> Binary Search Tree
    if (q.question_uid === 'go:1371') {
      q.tags = ['gatecse-2005', 'data-structures', 'binary-search-tree', 'normal'];
      console.log('✅ Updated go:1371 tags to data-structures / binary-search-tree');
    }

    // go:3353: Update answer to C
    if (q.question_uid === 'go:3353') {
      q.answer = 'C';
      if (q.answer_meta) q.answer_meta.answer = 'C';
      console.log('✅ Updated go:3353 answer to C');
    }

    // go:460824: Fix typos Back[atching -> Backpatching, folloeing -> following
    if (q.question_uid === 'go:460824') {
      q.question = q.question
        .replace(/Back\[atching/g, 'Backpatching')
        .replace(/folloeing/g, 'following');
      console.log('✅ Corrected typos in go:460824');
    }
  }

  fs.writeFileSync(qwaPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log('✅ Saved public/questions-with-answers.json');
}

// 7. Update scripts/pipeline/patch-authentic-solutions.mjs
const patchAuthenticPath = path.join(ROOT, 'scripts/pipeline/patch-authentic-solutions.mjs');
if (fs.existsSync(patchAuthenticPath)) {
  let content = fs.readFileSync(patchAuthenticPath, 'utf-8');

  const newPatches = `  "ec:2005:q20": {
    concept: "Signals and Systems - Causal LTI Impulse Response",
    markdown: \`### 1. Definition of a Causal Continuous-Time System
A continuous-time Linear Time-Invariant (LTI) system is **causal** if and only if its impulse response $h(t)$ is strictly zero for all negative time:
$$h(t) = 0 \\\\quad \\\\text{for } t < 0$$
This means the system output cannot anticipate future inputs or respond before an input impulse is applied at $t = 0$.

### 2. Analysis of the Given Waveforms
- **Waveform (a):** The signal is non-zero for both $t < 0$ and $t > 0$. Because $h(t) \\\\neq 0$ for $t < 0$, it represents a non-causal system.
- **Waveform (b):** $h(t) = 0$ for all $t < 0$, and the pulse begins strictly at $t \\\\ge 0$. Therefore, system (b) is **causal**.
- **Waveform (c):** The pulse begins before $t = 0$ (extends into negative time $t < 0$). Thus, it is non-causal.
- **Waveform (d):** The signal exists exclusively for $t < 0$ and is zero for $t > 0$, making it an anti-causal system.

### 3. Conclusion
Only waveform (b) satisfies $h(t) = 0$ for $t < 0$.

**Therefore, the correct answer is Option B.**\`,
    images: [],
  },
  "pp:ec:2005:q20": {
    concept: "Signals and Systems - Causal LTI Impulse Response",
    markdown: \`### 1. Definition of a Causal Continuous-Time System
A continuous-time Linear Time-Invariant (LTI) system is **causal** if and only if its impulse response $h(t)$ is strictly zero for all negative time:
$$h(t) = 0 \\\\quad \\\\text{for } t < 0$$
This means the system output cannot anticipate future inputs or respond before an input impulse is applied at $t = 0$.

### 2. Analysis of the Given Waveforms
- **Waveform (a):** The signal is non-zero for both $t < 0$ and $t > 0$. Because $h(t) \\\\neq 0$ for $t < 0$, it represents a non-causal system.
- **Waveform (b):** $h(t) = 0$ for all $t < 0$, and the pulse begins strictly at $t \\\\ge 0$. Therefore, system (b) is **causal**.
- **Waveform (c):** The pulse begins before $t = 0$ (extends into negative time $t < 0$). Thus, it is non-causal.
- **Waveform (d):** The signal exists exclusively for $t < 0$ and is zero for $t > 0$, making it an anti-causal system.

### 3. Conclusion
Only waveform (b) satisfies $h(t) = 0$ for $t < 0$.

**Therefore, the correct answer is Option B.**\`,
    images: [],
  },
  "go:2618": {
    concept: "Operating System - Optimal Non-Preemptive Process Scheduling with Idle Time",
    markdown: \`### 1. Problem Formulation & Given Job Data
We are given three jobs with arrival times and burst times:
- Job 1: Arrival Time = $0.0$, Burst Time = $9$
- Job 2: Arrival Time = $0.6$, Burst Time = $5$
- Job 3: Arrival Time = $1.0$, Burst Time = $1$

We are required to determine the optimal non-preemptive scheduling sequence and the amount of CPU idle time that minimizes average turnaround time.

### 2. Evaluating Scheduling Strategies

#### Strategy 1: Work-Conserving Schedule (Zero Idle Time, \\\\{1, 3, 2\\\\})
- At $t = 0.0$, only Job 1 has arrived.
- If the CPU starts immediately at $t = 0.0$ without idling:
  - Job 1 runs from $t = 0.0$ to $9.0$ (Completion = $9.0$, Turnaround = $9.0 - 0.0 = 9.0$).
  - At $t = 9.0$, both Job 2 and Job 3 are available. Under Shortest Job First (SJF), Job 3 runs next.
  - Job 3 runs from $t = 9.0$ to $10.0$ (Completion = $10.0$, Turnaround = $10.0 - 1.0 = 9.0$).
  - Job 2 runs from $t = 10.0$ to $15.0$ (Completion = $15.0$, Turnaround = $15.0 - 0.6 = 14.4$).
- **Average Turnaround Time:**
  $$\\\\text{Avg TAT} = \\\\frac{9.0 + 9.0 + 14.4}{3} = \\\\frac{32.4}{3} = 10.8\\\\text{ units}$$

#### Strategy 2: Non-Work-Conserving Schedule with Idle Time (Sequence \\\\{3, 2, 1\\\\}, 1 Unit Idle Time)
- Suppose the scheduler intentionally leaves the CPU idle from $t = 0.0$ to $t = 1.0$ (CPU idle time = $1$ unit).
- At $t = 1.0$, all three jobs have arrived.
- Applying non-preemptive Shortest Job First among all jobs:
  - Job 3 (burst 1) runs from $t = 1.0$ to $2.0$ (Completion = $2.0$, Turnaround = $2.0 - 1.0 = 1.0$).
  - Job 2 (burst 5) runs from $t = 2.0$ to $7.0$ (Completion = $7.0$, Turnaround = $7.0 - 0.6 = 6.4$).
  - Job 1 (burst 9) runs from $t = 7.0$ to $16.0$ (Completion = $16.0$, Turnaround = $16.0 - 0.0 = 16.0$).
- **Average Turnaround Time:**
  $$\\\\text{Avg TAT} = \\\\frac{1.0 + 6.4 + 16.0}{3} = \\\\frac{23.4}{3} = 7.8\\\\text{ units}$$

### 3. Comparison & Optimality
$$\\\\text{Avg TAT with 1 unit idle time } (7.8) < \\\\text{Avg TAT without idle time } (10.8)$$
Intentionally leaving the CPU idle for $1$ unit of time allows the shorter jobs (Job 3 and Job 2) to complete dramatically earlier, reducing the overall average turnaround time by $3.0$ units.

Therefore, the optimal non-preemptive sequence is **$\\\\{3, 2, 1\\\\}$**, leaving the CPU idle for **$1$ unit** of time.

**Therefore, the correct answer is Option A ($\\\\{3, 2, 1\\\\}, 1$).**\`,
    images: [],
  },
  "go:411922": {
    concept: "General Aptitude - Verbal Aptitude: Antonym Analogy",
    markdown: \`### 1. Problem Formulation & Analogy Structure
The given verbal analogy is:
$$\\\\text{Kind} : \\\\text{_________} :: \\\\text{Often} : \\\\text{Seldom} \\\\quad \\\\text{(By word meaning)}$$

### 2. Relationship Analysis
- **Reference Pair (Often : Seldom):**
  - *Often* means happening frequently or at short intervals.
  - *Seldom* means rarely, infrequently, or almost never.
  - The relationship between *Often* and *Seldom* is strictly that of **antonyms** (words with directly opposite meanings).
- **Target Pair (Kind : ?):**
  - To maintain the exact relationship of the analogy, the missing word must be the direct **antonym** of the adjective *Kind*.
  - *Kind* denotes having or showing a friendly, generous, and considerate nature.
  - The standard antonym of *Kind* is **Cruel** (willfully causing pain or suffering to others; unfeeling).

### 3. Distractor Analysis
- **Option A (Cruel):** Exact antonym of *Kind*, matching the *Often : Seldom* relationship.
- **Option B (Variety):** Refers to diversity or a collection of different things; unrelated to antonymy.
- **Option C (Type):** Refers to a category or classification (a synonym for the noun sense of \"kind\", not an antonym).
- **Option D (Kindred):** Refers to family relation or similar nature/character; not an opposite.

**Therefore, the correct answer is Option A (Cruel).**\`,
    images: [],
  },
  "go:3353": {
    concept: "Algorithms - Radix Sort Asymptotic Time Complexity",
    markdown: \`### 1. Problem Formulation
We are given $n$ integers in the range $(n^{k/2}, n^k]$ for a fixed constant $k > 0$ independent of $n$. We are required to determine the asymptotic time complexity when these numbers are sorted using Radix Sort.

### 2. Complexity Analysis of Radix Sort
Radix Sort sorts $n$ numbers digit-by-digit using a stable intermediate sorting algorithm (Counting Sort):
$$\\\\text{Time Complexity} = \\\\Theta\\\\big(d \\\\cdot (n + b)\\\\big)$$
where:
- $n$ is the number of integers.
- $b$ is the chosen radix (base) of representation.
- $d$ is the number of digits required to represent the maximum integer $M = n^k$.

### 3. Digit Count & Number of Passes
In standard Radix Sort where a fixed constant base $b = O(1)$ (such as decimal $b = 10$ or binary $b = 2$) is used:
$$d = \\\\lceil \\\\log_b(M) \\\\rceil = \\\\lceil \\\\log_b(n^k) \\\\rceil = k \\\\cdot \\\\log_b(n) = \\\\Theta(\\\\log n)$$
Substituting $d = \\\\Theta(\\\\log n)$ and $b = O(1)$:
$$\\\\text{Total Time} = \\\\Theta\\\\big(d \\\\cdot (n + b)\\\\big) = \\\\Theta\\\\big(\\\\log n \\\\cdot (n + O(1))\\\\big) = \\\\Theta(n \\\\log n)$$

### 4. Distractor Analysis
- **Option A ($\\\\Theta(n)$):** Would require choosing a non-constant base $b = n$ with $d = k = O(1)$, but under the standard fixed-radix definition of Radix Sort on keys up to $n^k$, the examination key recognizes $\\\\Theta(n \\\\log n)$.
- **Option B ($\\\\Theta(kn)$):** Retains parameter $k$ without evaluating the logarithmic expansion of the digit length in base $b$.
- **Option C ($\\\\Theta(n \\\\log n)$):** Official verified examination key representing $d = \\\\Theta(\\\\log n)$ passes over $n$ elements.
- **Option D ($\\\\Theta(n^2)$):** Quadratic complexity of inefficient comparison sorts.

**Therefore, the correct answer is Option C ($\\\\Theta(n \\\\log n)$).**\`,
    images: [],
  },
  "go:840": {
    concept: "Algorithms - Randomized Search Expected Comparisons",
    markdown: \`### 1. Algorithm Tracing
The algorithm searches for a key $x$ in an unsorted array $A[1..n]$ having $n$ distinct elements by sampling indices uniformly at random with replacement:
1. Choose an index $i$ uniformly at random from $\\\\{1, 2, \\\\dots, n\\\\}$.
2. If $A[i] = x$, then Stop; else Goto step 1.

### 2. Mathematical Derivation of Expected Comparisons
1. **Probability of Success:** Because $x$ is present in $A$ and all $n$ values are distinct, exactly one index contains $x$. The probability of choosing this index on any trial is:
   $$p = \\\\frac{1}{n}$$
2. **Distribution of Trials:** Because indices are chosen independently with replacement, each trial is an independent Bernoulli trial with constant success probability $p$. The number of trials $N$ until the first success follows a **geometric distribution** with parameter $p = 1/n$.
3. **Expected Value:** For a geometric random variable starting at trial 1:
   $$E[N] = \\\\frac{1}{p} = \\\\frac{1}{1/n} = n$$
4. **Comparison Count:** In each trial $i$, exactly one equality comparison ($A[i] == x$) is performed. Therefore, the expected number of comparisons made by the algorithm before termination is:
   $$E[\\\\text{Comparisons}] = E[N] = n$$

### 3. Distractor Analysis
- **Option A ($n$):** Correct; the expected number of independent trials to find the unique item with probability $1/n$ is $n$.
- **Option B ($n-1$):** Underestimates; represents expected failures before success.
- **Option C ($2n$):** Overestimate; assumes multiple comparisons per iteration.
- **Option D ($n/2$):** Corresponds to deterministic linear search without replacement.

**Therefore, the correct answer is Option A ($n$).**\`,
    images: [],
  },
};`;

  if (!content.includes('"ec:2005:q20"')) {
    content = content.replace(/\};\s*export function applyAuthenticPatches\(\)/, `${newPatches}\n\nexport function applyAuthenticPatches()`);
    fs.writeFileSync(patchAuthenticPath, content, 'utf-8');
    console.log('✅ Added authentic solutions for ec:2005:q20, go:2618, go:411922, go:3353, go:840 to patch-authentic-solutions.mjs');
  }
}

console.log('✨ All authoritative JSON stores updated successfully!');
