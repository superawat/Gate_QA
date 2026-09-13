const ALLOWED_OPTIONS = new Set(["A", "B", "C", "D", "E"]);

function normalizeMsqInput(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  const seen = new Set();
  const values = [];
  for (const value of input) {
    const upper = String(value || "").toUpperCase().trim();
    if (!ALLOWED_OPTIONS.has(upper) || seen.has(upper)) {
      continue;
    }
    seen.add(upper);
    values.push(upper);
  }
  return values.sort();
}

function evaluateNatNumericValue(submitted, expectedAnswer, tolerance) {
  if (!Number.isFinite(submitted)) {
    return false;
  }

  if (Array.isArray(tolerance?.ranges) && tolerance.ranges.length > 0) {
    return tolerance.ranges.some((range) => {
      const rMin = Number(range.min ?? range.lower);
      const rMax = Number(range.max ?? range.upper);
      if (Number.isFinite(rMin) && Number.isFinite(rMax)) {
        return submitted >= Math.min(rMin, rMax) && submitted <= Math.max(rMin, rMax);
      }
      return false;
    });
  }

  const lower = Number(tolerance?.lower);
  const upper = Number(tolerance?.upper);
  if (Number.isFinite(lower) && Number.isFinite(upper)) {
    return submitted >= Math.min(lower, upper) && submitted <= Math.max(lower, upper);
  }

  const absTol = typeof tolerance === "number" && Number.isFinite(tolerance)
    ? Math.abs(tolerance)
    : Number(tolerance?.abs ?? 0);

  if (Array.isArray(expectedAnswer)) {
    return expectedAnswer.some((ans) => {
      const expected = Number(ans);
      return Math.abs(submitted - expected) <= absTol;
    });
  }

  const expected = Number(expectedAnswer);
  return Math.abs(submitted - expected) <= absTol;
}

export function evaluateAnswer(record, userInput) {
  if (!record || !record.type) {
    return { status: "missing_answer", correct: false };
  }

  const typeUpper = String(record.type || "").toUpperCase().trim();
  const answerUpper = String(record.answer || "").toUpperCase().trim();
  if (typeUpper === "MTA" || typeUpper === "MARKS_TO_ALL" || answerUpper === "MTA") {
    return {
      status: "marks_to_all",
      correct: true,
    };
  }

  if (record.is_defective || record.status === "excluded" || record.answer == null) {
    return {
      status: "excluded",
      correct: false,
      reason: record.defective_reason || "defective_question",
    };
  }

  if (record.type === "MCQ") {
    const submitted = String(userInput || "").toUpperCase().trim();
    if (!submitted) {
      return { status: "invalid_input", correct: false };
    }
    if (Array.isArray(record.answer)) {
      const allowed = record.answer.map((ans) => String(ans || "").toUpperCase().trim());
      return {
        status: "evaluated",
        correct: allowed.includes(submitted),
      };
    }
    return {
      status: "evaluated",
      correct: submitted === String(record.answer || "").toUpperCase().trim(),
    };
  }

  if (record.type === "MSQ") {
    const submitted = normalizeMsqInput(userInput);
    const expected = normalizeMsqInput(record.answer);
    if (!submitted.length) {
      return { status: "invalid_input", correct: false };
    }
    const correct =
      submitted.length === expected.length &&
      submitted.every((value, index) => value === expected[index]);
    return { status: "evaluated", correct };
  }

  if (record.type === "NAT") {
    if (userInput === null || userInput === undefined || String(userInput).trim() === "") {
      return { status: "invalid_input", correct: false };
    }
    const submitted = Number(userInput);
    if (!Number.isFinite(submitted)) {
      return { status: "invalid_input", correct: false };
    }

    const correct = evaluateNatNumericValue(submitted, record.answer, record.tolerance);
    return { status: "evaluated", correct };
  }

  if (record.type === "MULTI_NAT" || record.type === "MULTI_BLANK_NAT") {
    if (!Array.isArray(record.answer) || record.answer.length === 0) {
      return { status: "missing_answer", correct: false };
    }

    if (!Array.isArray(userInput) || userInput.length !== record.answer.length) {
      return { status: "invalid_input", correct: false };
    }

    for (let i = 0; i < userInput.length; i++) {
      const val = userInput[i];
      if (val === null || val === undefined || String(val).trim() === "") {
        return { status: "invalid_input", correct: false };
      }
      const num = Number(val);
      if (!Number.isFinite(num)) {
        return { status: "invalid_input", correct: false };
      }
    }

    const isAllCorrect = record.answer.every((expectedVal, index) => {
      const submitted = Number(userInput[index]);
      const tolerance = Array.isArray(record.tolerance)
        ? record.tolerance[index]
        : record.tolerance;
      return evaluateNatNumericValue(submitted, expectedVal, tolerance);
    });

    return {
      status: "evaluated",
      correct: isAllCorrect,
    };
  }

  return { status: "unsupported_type", correct: false };
}
