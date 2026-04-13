#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANUAL_PATCH_PATH = path.join(
  ROOT,
  "data",
  "answers",
  "manual-answers-patch-v1.json"
);
const ANSWERS_PATHS = [
  path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json"),
  path.join(ROOT, "public", "data", "answers", "answers_by_question_uid_v1.json"),
];
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const REPORT_PATH = path.join(
  ROOT,
  "artifacts",
  "review",
  "legacy-answer-resolution-report.json"
);

const CURATED_RESOLUTIONS = {
  "go:80029": {
    type: "MCQ",
    answer: "A",
    note: "Leftmost circuit is the standard TTL sink-driver configuration; TTL sinks LED current more reliably than it sources it.",
    method: "manual_hardware_reasoning",
  },
  "go:80562": {
    type: "MCQ",
    answer: "D",
    note: "None of the listed statements is generally true for Newton-Raphson convergence.",
    method: "manual_numerical_reasoning",
  },
  "go:82548": {
    type: "NAT",
    answer: 2.4785971428571423,
    tolerance: { abs: 0.001 },
    note: "Lagrange interpolation at x=301 gives approximately 2.4785971428571423.",
    method: "manual_numerical_derivation",
  },
  "go:82550": {
    type: "NAT",
    answer: 0.693,
    tolerance: { abs: 0.001 },
    note: "Composite Simpson rule with h=0.25 gives approximately 0.6932539683, so the 3-decimal answer is 0.693.",
    method: "manual_numerical_derivation",
  },
  "go:511": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Match: IEEE 488 -> R, IEEE 796 -> S, IEEE 696 -> Q, RS232-C -> P.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:529": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Short answers: (i) y := x > 5; (ii) S; while not B do S; (iii) optimal BST root stop, left if, right while; (iv) every subsystem remains consistent, but not necessarily complete.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:599": {
    type: "MSQ",
    answer: ["A", "C", "D"],
    note: "FORTRAN 77 spacing and implicit typing make (a), (c), and (d) valid, while (b) is invalid.",
    method: "manual_language_semantics",
  },
  "go:606": {
    type: "NAT",
    answer: 1 / 3,
    tolerance: { abs: 0.01 },
    note: "Using the root test on ((3m)!/(m!)^3) * x^(3m) gives radius 1/3.",
    method: "manual_series_derivation",
  },
  "go:608": {
    type: "NAT",
    answer: 0.005,
    tolerance: { abs: 0.001 },
    note: "A single second-order Runge-Kutta step with h=0.1 gives y(0.1)=0.005.",
    method: "manual_numerical_derivation",
  },
  "go:609": {
    type: "NAT",
    answer: -2,
    tolerance: { abs: 0.01 },
    note: "FORTRAN 77 gives implicit integer type for I; with integer division 3/4=0, the assigned value is -2.",
    method: "manual_language_semantics",
  },
  "go:612": {
    type: "NAT",
    answer: 1,
    tolerance: { abs: 0.01 },
    note: "By the divergence theorem, div(V)=1 over the unit cube, so the flux is 1.",
    method: "manual_vector_calculus_derivation",
  },
  "go:614": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Laplace transform: -1 / ((s^2 + 1)(e^(pi s) - 1)).",
    method: "manual_symbolic_derivation",
  },
  "go:2291": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Subanswers: 7.1 -> C, 7.2 -> B, 7.3 -> A.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2293": {
    type: "MSQ",
    answer: ["B", "D"],
    note: "The fragment causes a runtime error due to nil-pointer dereferencing.",
    method: "manual_language_semantics",
  },
  "go:2317": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Function: read 5 bytes from input port 20H and store them sequentially starting at the address loaded into HL from memory locations 5000H/5001H. Registers: B is the loop counter, A holds the input byte, HL is the destination pointer.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2439": {
    type: "MCQ",
    answer: "B",
    note: "Backward Euler uses y_(n+1) = y_n + h f(x_(n+1), y_(n+1)).",
    method: "manual_numerical_reasoning",
  },
  "go:2478": {
    type: "SUBJECTIVE",
    answer: null,
    note: "False. Address/data multiplexing reduces pin count, not instruction execution time.",
    method: "manual_hardware_reasoning",
  },
  "go:2496": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Match: ECL -> (c), GaAs -> (a), TTL -> (d), CMOS -> (b).",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2600": {
    type: "MCQ",
    answer: "C",
    note: "Only <> is definitely a complete token without inspecting the next character.",
    method: "manual_language_semantics",
  },
  "go:2623": {
    type: "MCQ",
    answer: "C",
    note: "Each record uses 4 bytes for the fixed integer plus max(8,16)=16 bytes for the variant part, so 100 records need 2000 bytes.",
    method: "manual_storage_layout_derivation",
  },
  "go:2645": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Part (a): inside 'with A do', names A and B resolve to fields of record A; inside 'with B do', names A and B resolve to fields of record B. Part (b): '2.5A' is the lexical error; the remaining issues are not lexical.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2652": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Function: search up to 10 bytes starting at 1C40H for value 05H. Initial registers: A=05H, B=0AH. Final HL points to the first matching byte, or to 1C4AH if no match is found.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2758": {
    type: "SUBJECTIVE",
    answer: null,
    note: "The loop continuously outputs an incrementing count to port 00H; the lowest three bits cycle as 000, 001, 010, 011, 100, 101, 110, 111, then repeat.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2244": {
    type: "MCQ",
    answer: "B",
    note: "Forward Euler on y'=v and v'=f(t) gives y0=0, y1=0, y2=h^2 f(0), y3=2 h^2 f(0) + h^2 f(h); option B is the intended scan despite the dropped h^2 before f(h).",
    method: "manual_numerical_reasoning",
  },
  "go:2249": {
    type: "MCQ",
    answer: "C",
    note: "In S1 the accessible variables are x of B, z, and y; in S2 they are x of A, i, and y.",
    method: "manual_scope_reasoning",
  },
  "go:2267": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Legacy design prompt preserved as subjective: derive the FFH output-port interface using D3 and generate a square wave with 7-bus-cycle on/off timing.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2268": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Legacy Pascal fill-in-the-boxes prompt preserved as subjective.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:2282": {
    type: "SUBJECTIVE",
    answer: null,
    note: "One unambiguous grammar is: S -> id := E | while E do S | begin L end; L -> S | S ; L; E -> A | A < A; A -> A + F | F; F -> id.",
    method: "manual_grammar_derivation",
  },
  "go:2284": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Legacy Pascal scope/call-visibility prompt preserved as subjective; the scanned question does not expose a single machine-readable key in the current dataset.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:1515": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Legacy runtime-stack snapshot prompt preserved as subjective.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:1517": {
    type: "SUBJECTIVE",
    answer: null,
    note: "Legacy 8085 memory-design prompt preserved as subjective: implement 2K x 8 from four 1K x 4 chips over 1000H-17FFH using two chip pairs and address decoding.",
    method: "manual_legacy_subjective_resolution",
  },
  "go:834": {
    type: "MCQ",
    answer: "C",
    note: "5DH + 6BH = C8H, so AC=1 and CY=0.",
    method: "manual_hardware_reasoning",
  },
  "go:933": {
    type: "MCQ",
    answer: "D",
    note: "From the plotted tangents: x0 converges to 1.3, x1 to 0.6, and x2 to 1.3.",
    method: "manual_graph_reasoning",
  },
  "go:958": {
    type: "MCQ",
    answer: "A",
    note: "The program corresponds to forall x (((exists y)(B(x,y) and C(y))) => A(x)) and not exists x B(x,x).",
    method: "manual_logic_semantics",
  },
  "go:1226": {
    type: "MCQ",
    answer: "A",
    note: "This is Newton-Raphson for x^2 - 9/4 = 0, so the sequence converges to the positive root 1.5.",
    method: "manual_numerical_reasoning",
  },
};

function parseArgs(argv = []) {
  return {
    write: argv.includes("--write"),
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function updateAnswerPayload(payload = {}, manualPatchPayload = {}) {
  const nextPayload = {
    ...payload,
    generated_at: new Date().toISOString(),
    records_by_question_uid: {
      ...(payload.records_by_question_uid || {}),
    },
    stats: {
      ...(payload.stats || {}),
    },
  };

  nextPayload.stats.records = Object.keys(nextPayload.records_by_question_uid).length;
  nextPayload.stats.manual_patch_applied = Object.keys(
    manualPatchPayload.records_by_question_uid || {}
  ).length;

  return nextPayload;
}

function buildManualPatchRecord(resolution, link) {
  const prefix = `curated_resolution:${resolution.method}:${link}`;
  return {
    type: resolution.type,
    answer: resolution.answer ?? null,
    ...(resolution.tolerance ? { tolerance: resolution.tolerance } : {}),
    note: resolution.note ? `${prefix} :: ${resolution.note}` : prefix,
  };
}

function buildAnswerJoinRecord(questionUid, resolution) {
  return {
    answer_uid: `manual_res:${questionUid}`,
    type: resolution.type,
    answer: resolution.answer ?? null,
    tolerance: resolution.tolerance ?? null,
    source: {
      pdf: "manual_resolution",
      notes: `${resolution.method} :: ${resolution.note}`,
      updated_at: new Date().toISOString(),
    },
    is_manual_resolution: true,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manualPatchPayload = readJson(MANUAL_PATCH_PATH, {
    records_by_question_uid: {},
  });
  const answersPayload = readJson(ANSWERS_PATHS[0], {
    version: "v1",
    stats: {},
    records_by_question_uid: {},
  });
  const questions = readJson(QUESTIONS_PATH, []);
  const questionMap = new Map(
    questions.map((question) => [String(question.question_uid || ""), question])
  );

  const report = {
    generated_at: new Date().toISOString(),
    write: args.write,
    summary: {
      total_curated: Object.keys(CURATED_RESOLUTIONS).length,
      resolved_standard: 0,
      resolved_subjective: 0,
    },
    rows: [],
  };

  for (const [questionUid, resolution] of Object.entries(CURATED_RESOLUTIONS)) {
    const question = questionMap.get(questionUid);
    if (!question) {
      throw new Error(`Missing question for ${questionUid}`);
    }

    report.rows.push({
      question_uid: questionUid,
      title: question.title || "",
      link: question.link || "",
      type: resolution.type,
      answer: resolution.answer ?? null,
      method: resolution.method,
      note: resolution.note,
    });

    if (resolution.type === "SUBJECTIVE" || resolution.type === "AMBIGUOUS") {
      report.summary.resolved_subjective += 1;
    } else {
      report.summary.resolved_standard += 1;
    }

    if (!args.write) {
      continue;
    }

    manualPatchPayload.records_by_question_uid[questionUid] =
      buildManualPatchRecord(resolution, question.link || "");
    answersPayload.records_by_question_uid[questionUid] = buildAnswerJoinRecord(
      questionUid,
      resolution
    );
  }

  if (args.write) {
    const normalizedAnswersPayload = updateAnswerPayload(
      answersPayload,
      manualPatchPayload
    );
    for (const answersPath of ANSWERS_PATHS) {
      writeJson(answersPath, normalizedAnswersPayload);
    }
    writeJson(MANUAL_PATCH_PATH, manualPatchPayload);
  }

  writeJson(REPORT_PATH, report);

  console.log(
    JSON.stringify(
      {
        write: args.write,
        report: REPORT_PATH,
        ...report.summary,
      },
      null,
      2
    )
  );
}

main();
