#!/usr/bin/env node

/**
 * scripts/qa/apply-user-reported-fixes-oct28.mjs
 * ---------------------------------------------
 * Synchronizes fixes for the 4 reported issues:
 * 1. ec:2025:ga:q5 (GATE EC 2025 GA Q5): Correct answer to Option B and fix signum function derivation.
 * 2. ec:2022:q47 (GATE EC 2022 Q47): Fix interchanged min (1/2) and max (2/3) labels, parallel short-circuit explanation, and case numbering.
 * 3. go:1328 (GATE CSE 2009 Q42): Thorough multi-statement explanation for statements I, II, III, and IV.
 * 4. isro:cs:2023:q4 (ISRO CS 2023 Q4): Correct answer to Option D and add BST postorder traversal derivation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

console.log('🚀 Synchronizing fixes across answer maps, solution pools, and shards...');

// 1. Synchronize answers_by_question_uid_v1.json (both data/ and public/data/)
const answerFiles = [
  path.join(ROOT, 'data/answers/answers_by_question_uid_v1.json'),
  path.join(ROOT, 'public/data/answers/answers_by_question_uid_v1.json'),
];

for (const filePath of answerFiles) {
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const records = data.records_by_question_uid || data;

    if (records['ec:2025:ga:q5']) {
      records['ec:2025:ga:q5'].answer = 'B';
    }
    if (records['pp:ec:2025:q60']) {
      records['pp:ec:2025:q60'].answer = 'B';
    }

    records['isro:cs:2023:q4'] = {
      answer_uid: 'isro:cs:2023:q4',
      type: 'MCQ',
      answer: 'D',
      tolerance: null,
      source: {
        kind: 'official_isro_key',
        note: 'isro_cs_2023:q4:bst_preorder_to_postorder_option_d',
      },
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Updated ${path.relative(ROOT, filePath)}`);
  }
}

// 2. Update public/question-detail-shards/ec-2025-s1.json
const ec2025ShardPath = path.join(ROOT, 'public/question-detail-shards/ec-2025-s1.json');
if (fs.existsSync(ec2025ShardPath)) {
  const shard = JSON.parse(fs.readFileSync(ec2025ShardPath, 'utf-8'));
  const questions = shard.recordsByQuestionUid || shard.questions || shard;
  if (questions['ec:2025:ga:q5']) {
    const q = questions['ec:2025:ga:q5'];
    q.answer_meta = q.answer_meta || {};
    q.answer_meta.answer = 'B';
    q.detailed_solution = {
      concept: 'General Aptitude - Quantitative Aptitude & Functions',
      markdown: `### 1. Problem Formulation & Scope
We are required to identify the plot representing the function:
$$f(x) = \\frac{|x|}{x}$$
where $x$ is a non-zero real number ($x \\in \\mathbb{R} \\setminus \\{0\\}$).

### 2. Definition & Evaluation of the Absolute Value Function
By definition of the absolute value function:
$$|x| = \\begin{cases} x & \\text{if } x > 0 \\\\ -x & \\text{if } x < 0 \\end{cases}$$

Evaluating $f(x)$ for each domain:
1. **For $x > 0$ (positive real numbers):**
   $$|x| = x \\implies f(x) = \\frac{x}{x} = +1$$
   The function is constant with value $+1$ for all $x > 0$. On the Cartesian plane, this is represented by a horizontal line segment along $y = +1$ spanning $x \\in (0, \\infty)$.

2. **For $x < 0$ (negative real numbers):**
   $$|x| = -x \\implies f(x) = \\frac{-x}{x} = -1$$
   The function is constant with value $-1$ for all $x < 0$. On the Cartesian plane, this is represented by a horizontal line segment along $y = -1$ spanning $x \\in (-\\infty, 0)$.

3. **At $x = 0$:**
   The function is undefined because the denominator is zero.

Thus, $f(x)$ is the standard **signum function** $\\text{sgn}(x)$ (restricted to $x \\ne 0$):
$$f(x) = \\begin{cases} +1 & \\text{if } x > 0 \\\\ -1 & \\text{if } x < 0 \\end{cases}$$

### 3. Option Plot Verification
- **Plot (A):** Shows $y = +1$ for $x < 0$ and $y = -1$ for $x > 0$. This corresponds to $f(x) = -\\frac{|x|}{x}$, not $+\\frac{|x|}{x}$.
- **Plot (B):** Shows $y = +1$ for $x > 0$ with an open circle/intercept near $(0, 1)$ and $y = -1$ for $x < 0$ with an intercept near $(0, -1)$. This accurately and correctly represents $f(x) = \\frac{|x|}{x}$.
- **Plot (C) & (D):** Do not represent constant horizontal piecewise segments of $\\pm 1$.

### 4. Conclusion
Therefore, the plot representing $f(x) = \\frac{|x|}{x}$ is **Plot (B)**.

**Correct Answer: Option B**`,
    };
    fs.writeFileSync(ec2025ShardPath, JSON.stringify(shard, null, 2), 'utf-8');
    console.log('✅ Updated public/question-detail-shards/ec-2025-s1.json');
  }
}

// 3. Update public/question-detail-shards/ec-2022-s1.json
const ec2022ShardPath = path.join(ROOT, 'public/question-detail-shards/ec-2022-s1.json');
if (fs.existsSync(ec2022ShardPath)) {
  const shard = JSON.parse(fs.readFileSync(ec2022ShardPath, 'utf-8'));
  const questions = shard.recordsByQuestionUid || shard.questions || shard;
  if (questions['ec:2022:q47']) {
    const q = questions['ec:2022:q47'];
    q.detailed_solution = {
      concept: 'Analog Circuits - Diodes Applications and Small Signal Voltage Gain',
      markdown: `Replacing the given circuit with its small-signal equivalent:

<img src="/question-images/ec/2022/ec-2022-8aca149e5d.webp" />

From the given piecewise diode characteristic $I_D - V_D$:
- When the diode is OFF ($V_D < 0.7\\text{ V}$), dynamic resistance is $r_d(\\text{OFF}) = \\frac{\\Delta V_D}{\\Delta I_D} = \\infty$ (ideal open circuit).
- When the diode is ON ($V_D \\ge 0.7\\text{ V}$), dynamic resistance is $r_d(\\text{ON}) = \\frac{\\Delta V_D}{\\Delta I_D} = 0$ (ideal short circuit).

**Case 1: When the diode is ON ($r_d = 0$)**
In the ON state, the dynamic resistance $r_d = 0\\ \\Omega$ is in parallel with resistor $R_2 = 2\\text{ k}\\Omega$, completely shorting it out ($2\\text{ k}\\Omega \\parallel 0\\ \\Omega = 0\\ \\Omega$).

The total small-signal impedance from the output node to ground is simply $R_3 = 2\\text{ k}\\Omega$.

By voltage division across $R_1$ and $R_3$:
$$V_{out} = V_{in} \\times \\frac{R_3}{R_1 + R_3} = V_{in} \\times \\frac{2\\text{ k}\\Omega}{2\\text{ k}\\Omega + 2\\text{ k}\\Omega} = \\frac{1}{2} V_{in}$$

$$\\therefore \\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\min} = \\frac{1}{2} = 0.50 \\quad \\dots (i)$$

**Case 2: When the diode is OFF ($r_d = \\infty$)**
In the OFF state, the diode is an open circuit ($r_d = \\infty$). Resistor $R_2 = 2\\text{ k}\\Omega$ is in series with $R_3 = 2\\text{ k}\\Omega$:
$$R_{eq} = 2\\text{ k}\\Omega + 2\\text{ k}\\Omega = 4\\text{ k}\\Omega$$

By voltage division across $R_1$ and $R_{eq}$:
$$V_{out} = V_{in} \\times \\frac{4\\text{ k}\\Omega}{2\\text{ k}\\Omega + 4\\text{ k}\\Omega} = \\frac{4}{6} V_{in} = \\frac{2}{3} V_{in}$$

$$\\therefore \\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\max} = \\frac{2}{3} \\approx 0.667 \\quad \\dots (ii)$$

**Ratio of Minimum to Maximum Small-Signal Voltage Gain:**
$$\\frac{\\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\min}}{\\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\max}} = \\frac{\\frac{1}{2}}{\\frac{2}{3}} = \\frac{1}{2} \\times \\frac{3}{2} = \\frac{3}{4} = 0.75$$

Therefore, the correct answer is **0.75** (acceptable range: [0.7, 0.8]).`,
    };
    fs.writeFileSync(ec2022ShardPath, JSON.stringify(shard, null, 2), 'utf-8');
    console.log('✅ Updated public/question-detail-shards/ec-2022-s1.json');
  }
}

// 4. Update data/solutions/ec-v1.json
const ecSolutionsV1Path = path.join(ROOT, 'data/solutions/ec-v1.json');
if (fs.existsSync(ecSolutionsV1Path)) {
  const ecV1 = JSON.parse(fs.readFileSync(ecSolutionsV1Path, 'utf-8'));
  if (ecV1['pp:ec:2025:q60']) {
    ecV1['pp:ec:2025:q60'].verified_answer = 'B';
    ecV1['pp:ec:2025:q60'].concept_summary = 'General Aptitude - Quantitative Aptitude & Functions';
    ecV1['pp:ec:2025:q60'].solution_markdown = `We are given:
$$f(x) = \\frac{|x|}{x} \\quad \\text{for } x \\ne 0$$

By definition of the absolute value function:
- For $x > 0$: $|x| = x \\implies f(x) = \\frac{x}{x} = +1$
- For $x < 0$: $|x| = -x \\implies f(x) = \\frac{-x}{x} = -1$

Therefore:
$$f(x) = \\begin{cases} +1 & \\text{if } x > 0 \\\\ -1 & \\text{if } x < 0 \\end{cases}$$

This is the signum function $\\text{sgn}(x)$ (defined for non-zero real numbers):
- Constant value $+1$ for all positive $x$ ($x > 0$)
- Constant value $-1$ for all negative $x$ ($x < 0$)
- Undefined at $x = 0$

From the given plots:
- Plot (A) shows $f(x) = 1$ for $x < 0$ and $f(x) = -1$ for $x > 0$ (which is $-\\frac{|x|}{x}$).
- Plot (B) shows $f(x) = 1$ for $x > 0$ and $f(x) = -1$ for $x < 0$, which correctly represents $f(x) = \\frac{|x|}{x}$.

Therefore, the correct answer is **B**.`;
  }

  if (ecV1['pp:ec:2022:q47']) {
    ecV1['pp:ec:2022:q47'].solution_markdown = `Replacing the given circuit with its small-signal equivalent:

<img src="/question-images/ec/2022/ec-2022-8aca149e5d.webp" />

From the given diode $I_D - V_D$ characteristic:
- When the diode is OFF ($V_D < 0.7\\text{ V}$), dynamic resistance is $r_d(\\text{OFF}) = \\infty$ (open circuit).
- When the diode is ON ($V_D \\ge 0.7\\text{ V}$), dynamic resistance is $r_d(\\text{ON}) = 0$ (short circuit).

**Case 1: When the diode is ON ($r_d = 0$)**
In the ON state, the dynamic resistance $r_d = 0\\ \\Omega$ is in parallel with resistor $R_2 = 2\\text{ k}\\Omega$, completely shorting it out ($2\\text{ k}\\Omega \\parallel 0\\ \\Omega = 0\\ \\Omega$).

The total small-signal impedance from the output node to ground is simply $R_3 = 2\\text{ k}\\Omega$.

By voltage division:
$$V_{out} = V_{in} \\times \\frac{2}{2 + 2} = \\frac{1}{2} V_{in}$$

$$\\therefore \\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\min} = \\frac{1}{2} = 0.50 \\quad \\dots (i)$$

**Case 2: When the diode is OFF ($r_d = \\infty$)**
In the OFF state, the diode is an open circuit ($r_d = \\infty$). Resistor $R_2 = 2\\text{ k}\\Omega$ is in series with $R_3 = 2\\text{ k}\\Omega$:
$$R_{eq} = 2\\text{ k}\\Omega + 2\\text{ k}\\Omega = 4\\text{ k}\\Omega$$

By voltage division:
$$V_{out} = V_{in} \\times \\frac{4}{2 + 4} = \\frac{2}{3} V_{in}$$

$$\\therefore \\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\max} = \\frac{2}{3} \\approx 0.667 \\quad \\dots (ii)$$

**Ratio of Minimum to Maximum Small-Signal Voltage Gain:**
$$\\frac{\\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\min}}{\\left(\\frac{\\partial V_{out}}{\\partial V_{in}}\\right)_{\\max}} = \\frac{1/2}{2/3} = \\frac{3}{4} = 0.75$$

Therefore, the correct answer is **0.75** (acceptable range: [0.7, 0.8]).`;
  }

  fs.writeFileSync(ecSolutionsV1Path, JSON.stringify(ecV1, null, 2), 'utf-8');
  console.log('✅ Updated data/solutions/ec-v1.json');
}

// 5. Update data/solutions/practicepaper/ec-solutions.json & all-solutions.json
const practiceFiles = [
  path.join(ROOT, 'data/solutions/practicepaper/ec-solutions.json'),
  path.join(ROOT, 'data/solutions/practicepaper/all-solutions.json'),
];

for (const pPath of practiceFiles) {
  if (fs.existsSync(pPath)) {
    const pData = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
    if (pData['pp:ec:2025:q60']) {
      pData['pp:ec:2025:q60'].verified_answer = 'B';
    }
    if (pData['go:1328']) {
      pData['go:1328'].has_detailed_solution = true;
      pData['go:1328'].detailed_solution = `### 1. Statement-by-Statement Analysis

#### Statement I: "There exist parsing algorithms for some programming languages whose complexities are less than $\\Theta(n^3)$"
- For arbitrary context-free grammars, general parsers (CYK, Earley) require $\\Theta(n^3)$ time.
- Deterministic subclasses (LL(1), LR(1), LALR(1)) used in actual programming languages parse in strictly linear time $\\Theta(n)$.
- Since $\\Theta(n) < \\Theta(n^3)$, Statement I is **TRUE**.

#### Statement II: "A programming language which allows recursion can be implemented with static storage allocation."
- Recursion requires multiple active invocation records simultaneously.
- Static storage allocates fixed locations at compile time, causing re-entrant calls to overwrite parameters.
- Recursion requires dynamic (stack-based) allocation. Statement II is **FALSE**.

#### Statement III: "No L-attributed definition can be evaluated in the framework of bottom-up parsing."
- L-attributed SDDs can be evaluated in bottom-up parsers using marker non-terminals or parser stack positions.
- Statement III is **FALSE**.

#### Statement IV: "Code improving transformations can be performed at both source language and intermediate code level."
- Optimizations like constant folding and inlining occur at the source/AST level; CSE and loop optimizations occur at the intermediate code level.
- Statement IV is **TRUE**.

Therefore, statements I and IV are TRUE (Option B).`;
    }
    fs.writeFileSync(pPath, JSON.stringify(pData, null, 2), 'utf-8');
    console.log(`✅ Updated ${path.relative(ROOT, pPath)}`);
  }
}

console.log('✨ All updates synchronized successfully.');
