#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "../.."
);

const PDF_CONFIG = [
  {
    set: 1,
    yearSetKey: "2026-s1",
    pdfPath: path.join(ROOT, "keys2026", "CS1_Keys.pdf"),
    pdfLabel: "keys2026/CS1_Keys.pdf",
  },
  {
    set: 2,
    yearSetKey: "2026-s2",
    pdfPath: path.join(ROOT, "keys2026", "CS2_Keys.pdf"),
    pdfLabel: "keys2026/CS2_Keys.pdf",
  },
];

const JOIN_FILE_PATHS = [
  path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json"),
  path.join(ROOT, "public", "data", "answers", "answers_by_question_uid_v1.json"),
];

const MANUAL_PATCH_PATH = path.join(
  ROOT,
  "data",
  "answers",
  "manual-answers-patch-v1.json"
);
const MOCK_CATALOG_PATH = path.join(ROOT, "public", "mock_catalog_v1.json");
const AUDIT_PATH = path.join(ROOT, "audit", "2026-answer-key-import-report.json");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

const SECTION_ORDER = {
  GA: 0,
  CS: 1,
};

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveChromeExecutable() {
  for (const candidate of CHROME_CANDIDATES) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    "Chrome executable not found. Set CHROME_PATH or install Chrome locally."
  );
}

function parseKeyTable(rawText, set) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  const ignored = [];

  for (const line of lines) {
    if (
      /^Page\s+\d+\s+of\s+\d+$/i.test(line) ||
      /^Answer Key for /i.test(line) ||
      /^Q\.\s*No\./i.test(line)
    ) {
      continue;
    }

    const match = line.match(
      /^(\d+)\s+(\d+)\s+(MCQ|MSQ|NAT)\s+([A-Z0-9-]+)\s+(.+?)\s+([12])$/i
    );

    if (!match) {
      ignored.push(line);
      continue;
    }

    rows.push({
      questionNo: Number.parseInt(match[1], 10),
      session: Number.parseInt(match[2], 10),
      type: String(match[3]).toUpperCase(),
      section: String(match[4]).toUpperCase(),
      keyRange: String(match[5]).trim(),
      marks: Number.parseInt(match[6], 10),
      set,
    });
  }

  if (rows.length !== 65) {
    throw new Error(
      `Expected 65 parsed rows for set ${set}, found ${rows.length}. Ignored lines: ${ignored.join(
        " | "
      )}`
    );
  }

  rows.sort((left, right) => left.questionNo - right.questionNo);
  return rows;
}

function parseAnswerValue(type, keyRange) {
  if (type === "MCQ") {
    const answer = String(keyRange || "").trim().toUpperCase();
    if (!/^[A-D]$/.test(answer)) {
      throw new Error(`Invalid MCQ key: ${keyRange}`);
    }
    return {
      answer,
      tolerance: null,
    };
  }

  if (type === "MSQ") {
    const answer = String(keyRange || "")
      .split(";")
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
    if (!answer.length || answer.some((value) => !/^[A-D]$/.test(value))) {
      throw new Error(`Invalid MSQ key: ${keyRange}`);
    }
    return {
      answer,
      tolerance: null,
    };
  }

  if (type === "NAT") {
    const match = String(keyRange || "").match(
      /^(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)$/i
    );
    if (!match) {
      throw new Error(`Invalid NAT range: ${keyRange}`);
    }

    let lower = Number.parseFloat(match[1]);
    let upper = Number.parseFloat(match[2]);
    if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
      throw new Error(`Invalid NAT numeric bounds: ${keyRange}`);
    }
    if (lower > upper) {
      [lower, upper] = [upper, lower];
    }

    const answer = (lower + upper) / 2;
    const absTolerance = Math.abs(upper - lower) / 2 || 0.01;

    return {
      answer,
      tolerance: {
        abs: absTolerance,
      },
    };
  }

  throw new Error(`Unsupported answer type: ${type}`);
}

function getOrderedQuestionUids(mockCatalog, yearSetKey) {
  const entries = Object.values(mockCatalog?.byQuestionUid || {})
    .filter((entry) => entry?.yearSetKey === yearSetKey)
    .sort((left, right) => {
      const sectionDiff =
        (SECTION_ORDER[left.section] ?? 99) - (SECTION_ORDER[right.section] ?? 99);
      if (sectionDiff !== 0) {
        return sectionDiff;
      }
      return (left.orderIndex || 0) - (right.orderIndex || 0);
    });

  if (entries.length !== 65) {
    throw new Error(
      `Expected 65 mock-catalog entries for ${yearSetKey}, found ${entries.length}.`
    );
  }

  return entries.map((entry) => entry.questionUid);
}

function buildImportedRecords(rows, orderedQuestionUids, pdfConfig) {
  const joinRecords = {};
  const manualPatchRecords = {};
  const auditRows = [];

  for (const row of rows) {
    const uid = orderedQuestionUids[row.questionNo - 1];
    if (!uid) {
      throw new Error(
        `Could not find question UID for set ${pdfConfig.set} row ${row.questionNo}.`
      );
    }

    const sectionLabel = row.questionNo <= 10 ? "GA" : `CS-${pdfConfig.set}`;
    if (row.section !== sectionLabel) {
      throw new Error(
        `Section mismatch for ${uid}: expected ${sectionLabel}, received ${row.section}.`
      );
    }

    const { answer, tolerance } = parseAnswerValue(row.type, row.keyRange);

    joinRecords[uid] = {
      answer_uid: `manual:${uid}`,
      type: row.type,
      answer,
      tolerance,
      source: {
        kind: "pdf_answer_key",
        year: 2026,
        set: pdfConfig.set,
        pdf: pdfConfig.pdfLabel,
        question_no: row.questionNo,
        session: row.session,
        section: row.section,
        marks: row.marks,
      },
    };

    manualPatchRecords[uid] = {
      type: row.type,
      answer,
      tolerance,
      note: `pdf_answer_key:${pdfConfig.pdfLabel}:q${row.questionNo}`,
    };

    auditRows.push({
      question_uid: uid,
      question_no: row.questionNo,
      session: row.session,
      type: row.type,
      section: row.section,
      key_range: row.keyRange,
      marks: row.marks,
      answer,
      tolerance,
      pdf: pdfConfig.pdfLabel,
    });
  }

  return {
    joinRecords,
    manualPatchRecords,
    auditRows,
  };
}

function updateJoinPayload(payload, importedRecords, manualPatchCount) {
  const nextPayload = payload && typeof payload === "object" ? payload : {};
  const records = {
    ...(nextPayload.records_by_question_uid || {}),
  };

  for (const [uid, record] of Object.entries(importedRecords)) {
    records[uid] = record;
  }

  nextPayload.generated_at = new Date().toISOString();
  nextPayload.records_by_question_uid = records;

  if (nextPayload.stats && typeof nextPayload.stats === "object") {
    nextPayload.stats.records = Object.keys(records).length;
    if (Object.prototype.hasOwnProperty.call(nextPayload.stats, "manual_patch_applied")) {
      nextPayload.stats.manual_patch_applied = manualPatchCount;
    }
  }

  return nextPayload;
}

function updateMockCatalog(mockCatalog, importedRecords) {
  const nextCatalog = mockCatalog && typeof mockCatalog === "object" ? mockCatalog : {};
  const byQuestionUid = nextCatalog.byQuestionUid || {};
  const touchedYearSetKeys = new Set();

  for (const [uid, record] of Object.entries(importedRecords)) {
    const meta = byQuestionUid[uid];
    if (!meta) {
      throw new Error(`Mock catalog is missing ${uid}.`);
    }

    meta.type = record.type;
    meta.negativeMarks =
      record.type === "MCQ"
        ? meta.marks === 1
          ? 0.3333333333
          : 0.6666666667
        : 0;

    touchedYearSetKeys.add(meta.yearSetKey);
  }

  for (const yearSetKey of touchedYearSetKeys) {
    const metas = Object.values(byQuestionUid).filter(
      (entry) => entry?.yearSetKey === yearSetKey
    );
    const paperReady =
      metas.length === 65 &&
      metas.every((entry) => ["MCQ", "MSQ", "NAT"].includes(String(entry.type || "").toUpperCase()));

    for (const meta of metas) {
      meta.paperReady = paperReady;
      meta.scorable = paperReady;
    }

    const paper = (nextCatalog.papers || []).find(
      (entry) => entry?.yearSetKey === yearSetKey
    );
    if (paper) {
      paper.paperReady = paperReady;
    }
  }

  nextCatalog.generatedAt = new Date().toISOString();
  nextCatalog.scorableQuestionUids = Object.values(byQuestionUid)
    .filter((entry) => entry?.scorable)
    .sort((left, right) => {
      if (left.yearSetKey !== right.yearSetKey) {
        return String(left.yearSetKey || "").localeCompare(
          String(right.yearSetKey || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        );
      }
      const sectionDiff =
        (SECTION_ORDER[left.section] ?? 99) - (SECTION_ORDER[right.section] ?? 99);
      if (sectionDiff !== 0) {
        return sectionDiff;
      }
      return (left.orderIndex || 0) - (right.orderIndex || 0);
    })
    .map((entry) => entry.questionUid);

  return nextCatalog;
}

async function extractSelectedText(browser, pdfPath) {
  const page = await browser.newPage();
  try {
    const target = `file:///${path.resolve(pdfPath).replace(/\\/g, "/")}`;
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60_000 });
    await delay(5_000);

    const frame = page
      .frames()
      .find((entry) => entry.url().startsWith("chrome-extension://"));

    if (!frame) {
      throw new Error(`Chrome PDF viewer frame was not found for ${pdfPath}.`);
    }

    const selectedText = await frame.evaluate(async () => {
      const viewer = document.querySelector("pdf-viewer");
      const controller = viewer?.pluginController_;
      if (!controller) {
        throw new Error("Chrome PDF plugin controller is unavailable.");
      }

      controller.selectAll();
      await new Promise((resolve) => setTimeout(resolve, 1_500));

      const response = await controller.getSelectedText();
      return response?.selectedText || "";
    });

    if (!selectedText.trim()) {
      throw new Error(`No selectable text was extracted from ${pdfPath}.`);
    }

    return selectedText;
  } finally {
    await page.close();
  }
}

async function main() {
  const chromeExecutable = resolveChromeExecutable();
  const manualPatchPayload = readJson(MANUAL_PATCH_PATH, {
    records_by_question_uid: {},
  });
  const manualPatchRecords = {
    ...(manualPatchPayload.records_by_question_uid || {}),
  };

  const mockCatalogPayload = readJson(MOCK_CATALOG_PATH);
  if (!mockCatalogPayload) {
    throw new Error(`Mock catalog not found at ${MOCK_CATALOG_PATH}.`);
  }

  const browser = await puppeteer.launch({
    executablePath: chromeExecutable,
    headless: "new",
    args: ["--allow-file-access-from-files", "--disable-gpu"],
  });

  const importedJoinRecords = {};
  const auditPayload = {
    generatedAt: new Date().toISOString(),
    importedCount: 0,
    sets: {},
  };

  try {
    for (const pdfConfig of PDF_CONFIG) {
      const selectedText = await extractSelectedText(browser, pdfConfig.pdfPath);
      const rows = parseKeyTable(selectedText, pdfConfig.set);
      const orderedQuestionUids = getOrderedQuestionUids(
        mockCatalogPayload,
        pdfConfig.yearSetKey
      );
      const imported = buildImportedRecords(rows, orderedQuestionUids, pdfConfig);

      Object.assign(importedJoinRecords, imported.joinRecords);
      Object.assign(manualPatchRecords, imported.manualPatchRecords);

      auditPayload.sets[pdfConfig.yearSetKey] = {
        pdf: pdfConfig.pdfLabel,
        extractedTextLength: selectedText.length,
        parsedRowCount: rows.length,
        rows: imported.auditRows,
      };
      auditPayload.importedCount += rows.length;
    }
  } finally {
    await browser.close();
  }

  const manualPatchCount = Object.keys(manualPatchRecords).length;

  writeJson(MANUAL_PATCH_PATH, {
    records_by_question_uid: manualPatchRecords,
  });

  for (const filePath of JOIN_FILE_PATHS) {
    const payload = readJson(filePath, {});
    const nextPayload = updateJoinPayload(
      payload,
      importedJoinRecords,
      manualPatchCount
    );
    writeJson(filePath, nextPayload);
  }

  const updatedMockCatalog = updateMockCatalog(
    mockCatalogPayload,
    importedJoinRecords
  );
  writeJson(MOCK_CATALOG_PATH, updatedMockCatalog);
  writeJson(AUDIT_PATH, auditPayload);

  console.log(
    `Imported ${Object.keys(importedJoinRecords).length} answer keys from the 2026 PDFs.`
  );
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
