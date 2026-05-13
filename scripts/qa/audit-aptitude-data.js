#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { SUBJECTS, TAXONOMY, TAXONOMY_SETS } = require("./aptitude-taxonomy");
const { loadAptitudeRows } = require("./load-aptitude-data");

const ROOT = process.cwd();
const REVIEW_DIR = path.join(ROOT, "artifacts", "review");
const REPORT_FILE = path.join(REVIEW_DIR, "aptitude_phase5_report.json");
const SAMPLE_FILE = path.join(REVIEW_DIR, "aptitude_phase5_sample.csv");

const DEFAULT_SAMPLE_SIZE = 50;
const DEFAULT_SEED = "gateqa-aptitude-phase5";
const MISC_WARNING_RATIO = 0.2;

const DISPLAY_FORBIDDEN_RE =
  /SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]|Q\s*\.\s*\d+\.|\[\[PAGE:|Direction\s*:-|General\s+Awareness/i;

const ARTIFACT_CHECKS = [
  {
    name: "forbiddenProvenance",
    severity: "error",
    pattern: DISPLAY_FORBIDDEN_RE,
  },
  {
    name: "publisherNoise",
    severity: "error",
    pattern: /Pinnacle|ssccglpinnacle|Download\s+Pinnacle|Search\s+on\s+TG/i,
  },
  {
    name: "pipelineMarkerLeak",
    severity: "error",
    pattern: /\[\[(?:PAGE|APT_Q|APT_SET_HEADER):/i,
  },
  {
    name: "answerKeyLeak",
    severity: "error",
    pattern: /\b(?:Answer\s*Key|Solutions?\s*:-)\b/i,
  },
  {
    name: "unicodeReplacement",
    severity: "error",
    pattern: /\uFFFD/,
  },
  {
    name: "mojibake",
    severity: "warning",
    pattern: /\u00c3|\u00c2|\u00e2[\u0080-\u00bf]?/,
  },
  {
    name: "repeatedQuestionMarks",
    severity: "warning",
    pattern: /\?{2,}/,
  },
  {
    name: "strayPipe",
    severity: "warning",
    pattern: /\s\|\s/,
  },
];

const HTML_TAGS_TO_BALANCE = ["p", "ol", "li", "table", "tr", "td"];
const MATH_SIGNAL_RE =
  /(?:\d+\s*[+\-*/=<>%]\s*\d+|\\frac|\\sqrt|<sup\b|<sub\b|\b(?:sin|cos|tan|cot|sec|cosec|probability|hcf|lcm|ratio|percentage|average|interest|speed|distance|geometry|algebra)\b|\u00d7|\u00f7|\u2212|\u221a|\u03c0|\u00b0)/i;

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function stripHtml(value) {
  return decodeEntities(value).replace(/<[^>]*>/g, " ");
}

function compactSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function rowText(row) {
  return compactSpaces(stripHtml(row.questionHtml || ""));
}

function rowTextWithOptions(row) {
  return compactSpaces(`${rowText(row)} ${(row.options || []).map(decodeEntities).join(" ")}`);
}

function preview(row, length = 220) {
  const text = rowText(row);
  return text.length > length ? `${text.slice(0, length - 1)}...` : text;
}

function dedupeKey(row) {
  const normalized = rowText(row)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function stableScore(seed, uid) {
  return crypto.createHash("sha256").update(`${seed}:${uid}`).digest().readUInt32BE(0);
}

function collectRandomSample(rows, sampleSize, seed) {
  return rows
    .map((row) => ({ row, score: stableScore(seed, String(row.uid || "")) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.min(sampleSize, rows.length))
    .map(({ row }) => row);
}

function countTag(html, tagName, closing = false) {
  const slash = closing ? "\\/" : "";
  const pattern = new RegExp(`<${slash}${tagName}(?:\\s|>|/)`, "gi");
  return (String(html || "").match(pattern) || []).length;
}

function pushIssue(issues, severity, name, detail) {
  issues.push({ severity, name, detail });
}

function collectRowIssues(row) {
  const issues = [];
  const label = row?.uid || "<missing uid>";
  const html = String(row?.questionHtml || "");
  const text = rowText(row);

  if (!row || typeof row !== "object") {
    pushIssue(issues, "error", "invalidRow", "row is not an object");
    return issues;
  }
  if (!text || text.length < 20) {
    pushIssue(issues, "error", "shortQuestionText", `${label} has less than 20 display characters`);
  }
  if (!Array.isArray(row.options) || row.options.length !== 4) {
    pushIssue(issues, "error", "invalidOptions", `${label} does not have exactly 4 options`);
  } else {
    const normalizedOptions = row.options.map((option) =>
      compactSpaces(decodeEntities(option)).toLowerCase()
    );
    if (normalizedOptions.some((option) => !option)) {
      pushIssue(issues, "error", "emptyOption", `${label} has an empty option`);
    }
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      pushIssue(issues, "warning", "duplicateOptions", `${label} has repeated option text`);
    }
  }
  if (!["A", "B", "C", "D"].includes(row.answer)) {
    pushIssue(issues, "error", "invalidAnswer", `${label} answer is not A/B/C/D`);
  }

  ARTIFACT_CHECKS.forEach((check) => {
    if (check.pattern.test(html) || check.pattern.test(text)) {
      pushIssue(issues, check.severity, check.name, `${label} matched ${check.name}`);
    }
  });

  HTML_TAGS_TO_BALANCE.forEach((tagName) => {
    const openCount = countTag(html, tagName, false);
    const closeCount = countTag(html, tagName, true);
    if (openCount !== closeCount) {
      pushIssue(
        issues,
        "error",
        "unbalancedHtml",
        `${label} has ${openCount} <${tagName}> and ${closeCount} </${tagName}> tags`
      );
    }
  });

  return issues;
}

function sourceSignature(source) {
  return [
    source.pdfFile || "",
    source.set || "",
    source.originalQNum || "",
    source.examDate || "",
    source.shift || "",
  ].join("|");
}

function auditDuplicates(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = dedupeKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  const exactDuplicateGroups = [];
  groups.forEach((group) => {
    if (group.length < 2) return;
    const sourceSignatures = new Set(
      group.flatMap((row) => sourceEntries(row._source).map(sourceSignature))
    );
    exactDuplicateGroups.push({
      key: dedupeKey(group[0]),
      count: group.length,
      crossSource: sourceSignatures.size > 1,
      rows: group.map((row) => ({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        sources: sourceEntries(row._source).map(sourceSignature),
        preview: preview(row, 160),
      })),
    });
  });

  const dedupedSourceMerges = rows
    .filter((row) => sourceEntries(row._source).length > 1)
    .map((row) => ({
      uid: row.uid,
      sourceCount: sourceEntries(row._source).length,
      sources: sourceEntries(row._source).map(sourceSignature),
      preview: preview(row, 160),
    }));

  return {
    exactDuplicateGroups,
    crossSourceDuplicateGroups: exactDuplicateGroups.filter((group) => group.crossSource),
    dedupedSourceMerges,
  };
}

function auditTaxonomy(rows) {
  const subjectTotals = Object.fromEntries(SUBJECTS.map((subject) => [subject, 0]));
  const coverage = Object.fromEntries(
    SUBJECTS.map((subject) => [
      subject,
      Object.fromEntries(TAXONOMY[subject].map((subtopic) => [subtopic, 0])),
    ])
  );
  const unknownRows = [];

  rows.forEach((row) => {
    if (!TAXONOMY_SETS[row.subject]) {
      unknownRows.push({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        reason: "unknown subject",
      });
      return;
    }
    subjectTotals[row.subject] += 1;
    if (!TAXONOMY_SETS[row.subject].has(row.subtopic)) {
      unknownRows.push({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        reason: "unknown subtopic",
      });
      return;
    }
    coverage[row.subject][row.subtopic] += 1;
  });

  const missingSubtopics = [];
  SUBJECTS.forEach((subject) => {
    TAXONOMY[subject].forEach((subtopic) => {
      if (coverage[subject][subtopic] === 0) {
        missingSubtopics.push({ subject, subtopic });
      }
    });
  });

  const miscellaneous = SUBJECTS.map((subject) => {
    const count = coverage[subject]?.Miscellaneous || 0;
    const total = subjectTotals[subject] || 0;
    return {
      subject,
      count,
      ratio: total === 0 ? 0 : Number((count / total).toFixed(4)),
      overWarningThreshold: total > 0 && count / total > MISC_WARNING_RATIO,
    };
  });

  return {
    subjectTotals,
    coverage,
    missingSubtopics,
    miscellaneous,
    unknownRows,
  };
}

function englishHint(text) {
  if (/\b(?:direct speech|indirect speech|reported speech|direct\/indirect|indirect\/direct|said to|he said|she said|asked them|asked me)\b/.test(text)) {
    return "Narration";
  }
  if (/\b(?:active voice|passive voice|active\/passive|passive\/active)\b/.test(text)) {
    return "Active Passive";
  }
  if (/\b(?:para jumble|rearrange|jumbled|proper sequence|logical passage)\b/.test(text)) {
    return "Para Jumble";
  }
  if (/\b(?:passage|according to the passage|main concern|primary argument|central idea|suggested solution)\b/.test(text)) {
    return "Comprehension";
  }
  if (/\b(?:one word|one-word|single word)\b/.test(text)) {
    return "One Word Substitution";
  }
  if (/\b(?:idiom|phrase)\b/.test(text)) {
    return "Idioms";
  }
  if (/\b(?:synonym|similar meaning)\b/.test(text)) {
    return "Synonyms";
  }
  if (/\b(?:antonym|opposite meaning|opposite in meaning)\b/.test(text)) {
    return "Antonyms";
  }
  if (/\b(?:spelling|misspelt|misspelled|spelt)\b/.test(text)) {
    return "Spelling Check";
  }
  if (/\b(?:homonym|homophone|highlighted word with a different meaning|different meaning of the highlighted word)\b/.test(text)) {
    return "Homonyms";
  }
  if (/\b(?:blank|fill)\b|_{2,}/.test(text)) {
    return "Fill in the Blanks";
  }
  if (/\b(?:spot.*error|error in|grammatical error|part.*error)\b/.test(text)) {
    return "Spot the Error";
  }
  if (/\b(?:improve|sentence improvement|substitute|replace the highlighted|replace the underline)\b/.test(text)) {
    return "Sentence Improvement";
  }
  return null;
}

function mathHint(text) {
  if (/\b(?:hcf|lcm|highest common|least common|least square number.*divisible|exactly divisible by|smallest number.*divided)\b/.test(text)) {
    return "HCF and LCM";
  }
  if (/\b(?:probability|chance of|randomly)\b/.test(text)) {
    return "Probability";
  }
  if (/\b(?:simplify|simplification|evaluate|value of|fraction|decimal|surds?)\b/.test(text)) {
    return "Simplification";
  }
  if (/\b(?:sin|cos|tan|cot|sec|cosec|trigonometry)\b/.test(text)) {
    return "Trigonometry";
  }
  if (/\b(?:height|distance|elevation|depression|shadow)\b/.test(text)) {
    return "Height and Distance";
  }
  if (/\b(?:volume|surface area|cuboid|cube|cylinder|cone|sphere|hemisphere|frustum)\b/.test(text)) {
    return "Mensuration";
  }
  if (/\b(?:coordinate|abscissa|ordinate|slope)\b/.test(text)) {
    return "Coordinate Geometry";
  }
  if (/\b(?:mean|median|mode)\b/.test(text)) {
    return "Mean, Median & Mode";
  }
  if (/\baverage\b/.test(text)) {
    return "Average";
  }
  if (/\b(?:data|table|chart|graph|pie chart|bar graph|line graph)\b/.test(text)) {
    return "Data Interpretation";
  }
  if (/\b(?:ratio|proportion)\b/.test(text)) {
    return "Ratio and Proportion";
  }
  if (/\b(?:profit|loss|marked price|cost price|selling price)\b/.test(text)) {
    return "Profit and Loss";
  }
  if (/\b(?:percent|percentage|per cent)\b|%/.test(text)) {
    return "Percentage";
  }
  return null;
}

function reasoningHint(text) {
  if (/\b(?:sitting around|seated in|parallel rows|facing the center|facing north|facing south|immediate left|immediate right|opposite to|around a circle)\b/.test(text)) {
    return "Sitting Arrangement";
  }
  if (/\baddresses?\b|house number|street|colony|pin code|flat no|sector\b/.test(text)) {
    return "Address";
  }
  if (/\b(?:mathematical operation|interchange|operators?|symbols?|means ['"]?[+\-*/]|if \d+\s*[$@#%&]\s*\d+\s*=)\b/.test(text)) {
    return "Mathematical Operations";
  }
  if (/\b(?:statements?.*conclusions?|arguments?|course of action|assumptions? that must hold)\b/.test(text)) {
    return "Statement And Conclusion";
  }
  if (/\b(?:decision making|best course of action|what should you do)\b/.test(text)) {
    return "Decision Making";
  }
  if (/\b(?:syllogism|all\s+\w+\s+are|some\s+\w+\s+are|no\s+\w+\s+(?:is|are))\b/.test(text)) {
    return "Syllogism";
  }
  if (/\b(?:inequality|greater than|less than|not greater|not less)\b|[<>]=?/.test(text)) {
    return "Inequality";
  }
  if (/\b(?:direction|north|south|east|west|clockwise|anti-clockwise)\b/.test(text)) {
    return "Directions";
  }
  if (/\b(?:father|mother|sister|brother|daughter|son|husband|wife|grand|blood relation)\b/.test(text)) {
    return "Blood Relation";
  }
  if (/\b(?:series|letter-cluster|number series|comes next|next term|complete the pattern)\b/.test(text)) {
    return "Series";
  }
  if (/\b(?:missing number|replace the question mark|question mark|missing term)\b/.test(text)) {
    return "Missing Number";
  }
  if (/\b(?:word formation|formed from|letters.*word|meaningful word)\b/.test(text)) {
    return "Word Formation";
  }
  if (/\b(?:arrange.*(?:word|letter)|dictionary order|alphabetical order)\b/.test(text)) {
    return "Word Arrangement";
  }
  if (/\b(?:arithmetic reasoning|total number|how many|minimum number|maximum number|sum of \d+|find x\b)\b/.test(text)) {
    return "Arithmetic Reasoning";
  }
  if (/\b(?:puzzle|floor|persons?|people|boxes|days)\b/.test(text)) {
    return "Puzzle";
  }
  if (/\b(?:coding|decoding|code language|coded as|code for|written as|symbolizes)\b/.test(text)) {
    return "Coding - Decoding";
  }
  if (/\b(?:odd|different|does not belong|out of the following)\b/.test(text)) {
    return "Odd one out";
  }
  if (/\b(?:analogy|analogies|related word|similar relationship|same relationship)\b/.test(text)) {
    return "Analogy";
  }
  return null;
}

function remapHint(row) {
  const text = rowTextWithOptions(row).toLowerCase();
  if (row.subject === "English") return englishHint(text);
  if (row.subject === "Mathematics") return mathHint(text);
  if (row.subject === "Reasoning") return reasoningHint(text);
  return null;
}

function crossSubjectHint(row) {
  if (row.subject === "Mathematics") return null;
  const hint = mathHint(rowTextWithOptions(row).toLowerCase());
  return hint ? `Potential Mathematics / ${hint}` : null;
}

function auditRemapCandidates(rows) {
  const candidates = [];
  rows
    .filter((row) => row.subtopic === "Miscellaneous")
    .forEach((row) => {
      const hint = remapHint(row);
      const migrationHint = crossSubjectHint(row);
      if (!hint && !migrationHint) return;
      candidates.push({
        uid: row.uid,
        subject: row.subject,
        currentSubtopic: row.subtopic,
        suggestedSubtopic: hint,
        crossSubjectHint: migrationHint,
        preview: preview(row, 180),
      });
    });

  const bySuggestion = {};
  candidates.forEach((candidate) => {
    const key = candidate.suggestedSubtopic || candidate.crossSubjectHint || "Unknown";
    if (!bySuggestion[key]) bySuggestion[key] = { count: 0, sampleUids: [] };
    bySuggestion[key].count += 1;
    if (bySuggestion[key].sampleUids.length < 10) {
      bySuggestion[key].sampleUids.push(candidate.uid);
    }
  });

  return {
    totalCandidates: candidates.length,
    bySuggestion,
    candidates: candidates.slice(0, 200),
  };
}

function hasMismatchedMathDelimiters(rawHtml) {
  const raw = String(rawHtml || "");
  const inlineOpen = (raw.match(/\\\(/g) || []).length;
  const inlineClose = (raw.match(/\\\)/g) || []).length;
  const displayOpen = (raw.match(/\\\[/g) || []).length;
  const displayClose = (raw.match(/\\\]/g) || []).length;
  const blockCount = (raw.match(/\$\$/g) || []).length;
  return inlineOpen !== inlineClose || displayOpen !== displayClose || blockCount % 2 !== 0;
}

function hasUnbalancedParentheses(text) {
  const opens = (text.match(/\(/g) || []).length;
  const closes = (text.match(/\)/g) || []).length;
  return opens !== closes;
}

function auditMath(rows) {
  const mathLikeRows = rows.filter((row) => row.subject === "Mathematics" || MATH_SIGNAL_RE.test(rowTextWithOptions(row)));
  const delimiterErrors = [];
  const htmlMathRows = [];
  const suspiciousOcrRows = [];

  mathLikeRows.forEach((row) => {
    const html = String(row.questionHtml || "");
    const text = rowTextWithOptions(row);
    if (hasMismatchedMathDelimiters(html)) {
      delimiterErrors.push({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        preview: preview(row),
      });
    }
    if (/<\/?(?:sup|sub)\b/i.test(html) || /\\(?:frac|sqrt)|\\\(|\\\[|\$\$/.test(html)) {
      htmlMathRows.push({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        preview: preview(row),
      });
    }
    if (
      hasUnbalancedParentheses(text) ||
      /\b[a-z]\s{2,}[a-z]\b/i.test(text) ||
      /[+\-*/=\u00d7\u00f7\u2212]\s*[+\-*/=\u00d7\u00f7\u2212]\s*[+\-*/=\u00d7\u00f7\u2212]/.test(text)
    ) {
      suspiciousOcrRows.push({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        reason: hasUnbalancedParentheses(text) ? "unbalancedParentheses" : "operatorSpacing",
        preview: preview(row),
      });
    }
  });

  return {
    mathLikeRows: mathLikeRows.length,
    delimiterErrors,
    htmlMathRows: htmlMathRows.slice(0, 50),
    suspiciousOcrRows: suspiciousOcrRows.slice(0, 100),
    suspiciousOcrRowCount: suspiciousOcrRows.length,
  };
}

function summarizeIssues(rowIssueEntries) {
  const byFlag = {};
  let errorRows = 0;
  let warningRows = 0;

  rowIssueEntries.forEach(({ issues }) => {
    const hasError = issues.some((issue) => issue.severity === "error");
    const hasWarning = issues.some((issue) => issue.severity === "warning");
    if (hasError) errorRows += 1;
    if (hasWarning) warningRows += 1;
    issues.forEach((issue) => {
      if (!byFlag[issue.name]) {
        byFlag[issue.name] = { severity: issue.severity, count: 0 };
      }
      byFlag[issue.name].count += 1;
    });
  });

  return {
    errorRows,
    warningRows,
    byFlag,
    examples: rowIssueEntries
      .filter(({ issues }) => issues.length > 0)
      .slice(0, 100)
      .map(({ row, issues }) => ({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        issues,
        preview: preview(row),
      })),
  };
}

function csvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeSampleCsv(sampleRows, rowIssueMap) {
  const rows = [
    ["uid", "subject", "subtopic", "artifact_flags", "source", "preview"],
    ...sampleRows.map((row) => {
      const issues = rowIssueMap.get(row.uid) || [];
      const sources = sourceEntries(row._source).map(sourceSignature).join("; ");
      return [
        row.uid,
        row.subject,
        row.subtopic,
        issues.map((issue) => `${issue.severity}:${issue.name}`).join("|"),
        sources,
        preview(row, 260),
      ];
    }),
  ];
  fs.writeFileSync(SAMPLE_FILE, rows.map((row) => row.map(csvValue).join(",")).join("\n") + "\n");
}

function optionValue(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function main() {
  const rows = loadAptitudeRows();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Aptitude shard data must be a non-empty array.");
  }

  fs.mkdirSync(REVIEW_DIR, { recursive: true });

  const seed = optionValue("seed", process.env.APTITUDE_AUDIT_SEED || DEFAULT_SEED);
  const requestedSampleSize = Number(optionValue("sample-size", process.env.APTITUDE_AUDIT_SAMPLE_SIZE || DEFAULT_SAMPLE_SIZE));
  const sampleSize = Number.isFinite(requestedSampleSize) && requestedSampleSize > 0 ? requestedSampleSize : DEFAULT_SAMPLE_SIZE;
  const strictCoverage = process.argv.includes("--strict-coverage") || process.env.APTITUDE_AUDIT_STRICT_COVERAGE === "1";

  const rowIssueEntries = rows.map((row) => ({ row, issues: collectRowIssues(row) }));
  const rowIssueMap = new Map(rowIssueEntries.map(({ row, issues }) => [row.uid, issues]));
  const sampleRows = collectRandomSample(rows, sampleSize, seed);

  const duplicates = auditDuplicates(rows);
  const taxonomy = auditTaxonomy(rows);
  const remapCandidates = auditRemapCandidates(rows);
  const math = auditMath(rows);
  const parsingArtifacts = summarizeIssues(rowIssueEntries);

  const errors = [];
  const warnings = [];

  if (parsingArtifacts.errorRows > 0) {
    errors.push(`${parsingArtifacts.errorRows} rows contain high-severity parsing artifacts.`);
  }
  if (duplicates.exactDuplicateGroups.length > 0) {
    errors.push(`${duplicates.exactDuplicateGroups.length} exact duplicate question groups remain.`);
  }
  if (taxonomy.unknownRows.length > 0) {
    errors.push(`${taxonomy.unknownRows.length} rows use unknown taxonomy labels.`);
  }
  if (math.delimiterErrors.length > 0) {
    errors.push(`${math.delimiterErrors.length} rows have mismatched MathJax delimiters.`);
  }
  if (strictCoverage && taxonomy.missingSubtopics.length > 0) {
    errors.push(`${taxonomy.missingSubtopics.length} taxonomy subtopics have zero coverage.`);
  }

  if (parsingArtifacts.warningRows > 0) {
    warnings.push(`${parsingArtifacts.warningRows} rows contain warning-level parsing artifacts.`);
  }
  if (taxonomy.missingSubtopics.length > 0) {
    warnings.push(`${taxonomy.missingSubtopics.length} taxonomy subtopics have zero coverage.`);
  }
  taxonomy.miscellaneous
    .filter((entry) => entry.overWarningThreshold)
    .forEach((entry) => {
      warnings.push(`${entry.subject} Miscellaneous ratio is ${(entry.ratio * 100).toFixed(1)}%.`);
    });
  if (remapCandidates.totalCandidates > 0) {
    warnings.push(`${remapCandidates.totalCandidates} Miscellaneous rows have remap hints.`);
  }
  if (math.suspiciousOcrRowCount > 0) {
    warnings.push(`${math.suspiciousOcrRowCount} math-like rows have OCR/render warning signals.`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    inputFile: "public/data/aptitude/**/*.json",
    totalQuestions: rows.length,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "pass_with_warnings" : "pass",
    strictCoverage,
    sample: {
      seed,
      requestedSize: sampleSize,
      actualSize: sampleRows.length,
      rows: sampleRows.map((row) => ({
        uid: row.uid,
        subject: row.subject,
        subtopic: row.subtopic,
        artifactFlags: (rowIssueMap.get(row.uid) || []).map((issue) => `${issue.severity}:${issue.name}`),
        sources: sourceEntries(row._source).map(sourceSignature),
        preview: preview(row),
      })),
    },
    duplicates,
    taxonomy,
    remapCandidates,
    parsingArtifacts,
    math,
    errors,
    warnings,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n", "utf8");
  writeSampleCsv(sampleRows, rowIssueMap);

  const relativeReport = path.relative(ROOT, REPORT_FILE);
  const relativeSample = path.relative(ROOT, SAMPLE_FILE);

  if (errors.length > 0) {
    console.error("[audit-aptitude-data] FAILED");
    errors.forEach((error) => console.error(`- ${error}`));
    warnings.slice(0, 8).forEach((warning) => console.error(`- warning: ${warning}`));
    console.error(`[audit-aptitude-data] report: ${relativeReport}`);
    process.exit(1);
  }

  console.log(
    `[audit-aptitude-data] OK${warnings.length ? " with warnings" : ""}: ${rows.length} rows audited, ${sampleRows.length} sampled.`
  );
  console.log(
    `[audit-aptitude-data] duplicates=${duplicates.exactDuplicateGroups.length}, missingSubtopics=${taxonomy.missingSubtopics.length}, miscRemapHints=${remapCandidates.totalCandidates}, mathWarnings=${math.suspiciousOcrRowCount}`
  );
  console.log(`[audit-aptitude-data] report: ${relativeReport}`);
  console.log(`[audit-aptitude-data] sample: ${relativeSample}`);
}

try {
  main();
} catch (error) {
  console.error(`[audit-aptitude-data] ${error.stack || error.message}`);
  process.exit(1);
}
