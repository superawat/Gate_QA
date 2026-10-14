import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BASE_HOST = "https://practicepaper.in";

export async function fetchQuizQuestions(pageUrl, maxPages = 13) {
  const fullBase = pageUrl.startsWith("http") ? pageUrl : `${BASE_HOST}${pageUrl}`;
  const questionsMap = {};

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? fullBase : `${fullBase}?page_no=${page}`;
    try {
      const res = await fetch(url, {
        headers: { "user-agent": USER_AGENT, referer: BASE_HOST + "/" },
      });
      if (!res.ok) {
        if (res.status === 404 && page > 1) break;
        continue;
      }
      const html = await res.text();
      const match = html.match(/<script\s+id=['"]pp-quiz-data['"][^>]*>([\s\S]*?)<\/script>/i);
      if (!match) continue;
      const quizData = JSON.parse(match[1]);
      for (const q of (quizData.questions || [])) {
        questionsMap[q.number] = q;
      }
    } catch (err) {
      console.warn(`[FETCH_WARN] ${url}: ${err.message}`);
    }
  }

  return questionsMap;
}

export function applyRemoteAnswerData(auditQuestion, remoteQ) {
  if (!remoteQ) return false;

  let changed = false;

  if (remoteQ.ansMin !== undefined && auditQuestion.ansMin === undefined) {
    auditQuestion.ansMin = remoteQ.ansMin;
    changed = true;
  }
  if (remoteQ.ansMax !== undefined && auditQuestion.ansMax === undefined) {
    auditQuestion.ansMax = remoteQ.ansMax;
    changed = true;
  }
  if (remoteQ.correctSet !== undefined && auditQuestion.correctSet === undefined) {
    auditQuestion.correctSet = remoteQ.correctSet;
    changed = true;
  }

  // Set type if missing or refined
  if (remoteQ.type && remoteQ.type !== auditQuestion.type) {
    auditQuestion.type = remoteQ.type;
    changed = true;
  }

  // Update tolerance for NAT
  if (remoteQ.ansMin !== undefined && remoteQ.ansMax !== undefined) {
    const min = Number(remoteQ.ansMin);
    const max = Number(remoteQ.ansMax);
    auditQuestion.tolerance = { lower: min, upper: max };
    if (auditQuestion.rawAnswer === null || auditQuestion.rawAnswer === undefined) {
      auditQuestion.rawAnswer = min === max ? min : Number(((min + max) / 2).toFixed(4));
      changed = true;
    }
  }

  // Update rawAnswer for MSQ
  if (Array.isArray(remoteQ.correctSet)) {
    const letters = remoteQ.correctSet.map((idx) => ["A", "B", "C", "D", "E"][idx] || String(idx));
    auditQuestion.rawAnswer = letters;
    auditQuestion.type = "MSQ";
    changed = true;
  }

  // Update rawAnswer for MCQ if null
  if (remoteQ.correct !== undefined && (auditQuestion.rawAnswer === null || auditQuestion.rawAnswer === undefined)) {
    auditQuestion.rawAnswer = remoteQ.correct;
    changed = true;
  }

  return changed;
}
