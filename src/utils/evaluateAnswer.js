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
    const submitted = Number(userInput);
    if (!Number.isFinite(submitted)) {
      return { status: "invalid_input", correct: false };
    }

    if (Array.isArray(record.tolerance?.ranges) && record.tolerance.ranges.length > 0) {
      const correct = record.tolerance.ranges.some((range) => {
        const rMin = Number(range.min ?? range.lower);
        const rMax = Number(range.max ?? range.upper);
        if (Number.isFinite(rMin) && Number.isFinite(rMax)) {
          return submitted >= Math.min(rMin, rMax) && submitted <= Math.max(rMin, rMax);
        }
        return false;
      });
      return { status: "evaluated", correct };
    }

    const lower = Number(record.tolerance?.lower);
    const upper = Number(record.tolerance?.upper);
    if (Number.isFinite(lower) && Number.isFinite(upper)) {
      return {
        status: "evaluated",
        correct: submitted >= Math.min(lower, upper) && submitted <= Math.max(lower, upper),
      };
    }

    const tolerance = typeof record.tolerance === "number" && Number.isFinite(record.tolerance)
      ? Math.abs(record.tolerance)
      : Number(record.tolerance?.abs ?? 0);

    if (Array.isArray(record.answer)) {
      const correct = record.answer.some((ans) => {
        const expected = Number(ans);
        return Math.abs(submitted - expected) <= tolerance;
      });
      return { status: "evaluated", correct };
    }

    const expected = Number(record.answer);
    return {
      status: "evaluated",
      correct: Math.abs(submitted - expected) <= tolerance,
    };
  }

  return { status: "unsupported_type", correct: false };
}
