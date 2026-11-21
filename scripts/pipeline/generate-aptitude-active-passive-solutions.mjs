import fs from "node:fs";
import path from "node:path";

function decode(str) {
  return String(str || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—");
}

const clean = decode;

function plain(html) {
  return decode(String(html || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return text.trim().replace(/[.,!?;:\"“”]/g, " ").split(/\s+/).filter(Boolean);
}

function lcsDiff(correct, wrong) {
  const A = tokenize(correct);
  const B = tokenize(wrong);
  const m = A.length;
  const n = B.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1].toLowerCase() === B[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m, j = n;
  const diffs = [];
  let curExpected = [];
  let curFound = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && A[i - 1].toLowerCase() === B[j - 1].toLowerCase()) {
      if (curExpected.length > 0 || curFound.length > 0) {
        diffs.unshift({
          expected: curExpected.reverse().join(" "),
          found: curFound.reverse().join(" ")
        });
        curExpected = [];
        curFound = [];
      }
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      curFound.push(B[j - 1]);
      j--;
    } else {
      curExpected.push(A[i - 1]);
      i--;
    }
  }

  if (curExpected.length > 0 || curFound.length > 0) {
    diffs.unshift({
      expected: curExpected.reverse().join(" "),
      found: curFound.reverse().join(" ")
    });
  }

  return diffs;
}

function describeDiffItem(item) {
  const exp = item.expected.toLowerCase();
  const fnd = item.found.toLowerCase();

  // Modal shifts
  if ((fnd === "can" || fnd === "could") && (exp === "can" || exp === "could")) {
    return `incorrectly shifts modal '${item.found}' to '${item.expected}'`;
  }
  if ((fnd === "may" || fnd === "might") && (exp === "may" || exp === "might")) {
    return `incorrectly shifts modal '${item.found}' to '${item.expected}'`;
  }
  if ((fnd === "shall" || fnd === "should") && (exp === "shall" || exp === "should")) {
    return `incorrectly shifts modal '${item.found}' to '${item.expected}'`;
  }
  if ((fnd === "will" || fnd === "would") && (exp === "will" || exp === "would")) {
    return `incorrectly shifts modal '${item.found}' to '${item.expected}'`;
  }

  // Continuous passive
  if ((fnd === "is being" || fnd === "was being" || fnd === "are being" || fnd === "were being") && (exp === "is" || exp === "was" || exp === "are" || exp === "were")) {
    return `incorrectly uses continuous passive '${item.found}' instead of simple passive '${item.expected}'`;
  }
  if ((exp === "is being" || exp === "was being" || exp === "are being" || exp === "were being") && (fnd === "is" || fnd === "was" || fnd === "are" || fnd === "were")) {
    return `omits continuous marker 'being' required for the continuous passive form`;
  }

  // Perfect passive
  if ((exp === "has been" || exp === "have been" || exp === "had been") && (fnd === "has" || fnd === "have" || fnd === "had")) {
    return `omits 'been' in the passive perfect construction`;
  }
  if (fnd === "been" && exp === "being") {
    return `incorrectly uses perfect aspect 'been' instead of continuous 'being'`;
  }
  if (fnd === "being" && exp === "been") {
    return `incorrectly uses continuous aspect 'being' instead of perfect aspect 'been'`;
  }

  // Tense shifts
  if ((fnd === "has been" || fnd === "have been") && (exp === "was" || exp === "were")) {
    return `incorrectly shifts simple past to present perfect ('${item.found}')`;
  }
  if ((fnd === "had been") && (exp === "was" || exp === "were")) {
    return `incorrectly shifts simple past to past perfect ('had been')`;
  }
  if ((fnd === "was" || fnd === "were") && (exp === "is" || exp === "are" || exp === "am")) {
    return `incorrectly shifts present tense to past tense ('${item.found}')`;
  }
  if ((fnd === "is" || fnd === "are" || fnd === "am") && (exp === "was" || exp === "were")) {
    return `incorrectly shifts past tense to present tense ('${item.found}')`;
  }

  // Agreement
  if ((fnd === "are" || fnd === "were") && (exp === "is" || exp === "was")) {
    return `fails subject-verb agreement by using plural verb '${item.found}' with singular subject`;
  }
  if ((fnd === "is" || fnd === "was") && (exp === "are" || exp === "were")) {
    return `fails subject-verb agreement by using singular verb '${item.found}' with plural subject`;
  }
  if (fnd === "has" && exp === "have") {
    return `fails subject-verb agreement with singular 'has' for plural subject`;
  }
  if (fnd === "have" && exp === "has") {
    return `fails subject-verb agreement with plural 'have' for singular subject`;
  }

  // Auxiliaries
  if (fnd === "do" && exp === "is") {
    return `incorrectly retains auxiliary 'do' instead of passive verb 'is'`;
  }
  if (fnd === "does" && exp === "is") {
    return `incorrectly retains auxiliary 'does' instead of passive verb 'is'`;
  }
  if (fnd === "did" && (exp === "was" || exp === "were")) {
    return `incorrectly retains auxiliary 'did' instead of passive verb '${item.expected}'`;
  }

  // Negation
  if (fnd === "not" && !exp) {
    return `incorrectly introduces negation 'not'`;
  }
  if (exp === "not" && !fnd) {
    return `omits required negative particle 'not'`;
  }

  // Agent / Preposition
  if (fnd === "by" && !exp) {
    return `incorrectly introduces agent preposition 'by'`;
  }
  if (exp === "by" && !fnd) {
    return `omits required agent preposition 'by'`;
  }

  // Interrogative / Relative pronoun
  if ((fnd === "who" || fnd === "whom") && (exp === "who" || exp === "whom")) {
    return `incorrectly uses '${item.found}' instead of '${item.expected}'`;
  }

  if (!item.found) return `omits '${item.expected}'`;
  if (!item.expected) return `incorrectly adds '${item.found}'`;
  return `incorrectly uses '${item.found}' instead of '${item.expected}'`;
}

function explainDistractor(correct, wrong) {
  const diffs = lcsDiff(correct, wrong);
  if (diffs.length === 0) return "is an ungrammatical variation";
  const desc = diffs.slice(0, 2).map(describeDiffItem);
  return desc.join("; ");
}

function extractSentence(q) {
  const stemHtml = q.questionHtml.replace(/<ol\b[\s\S]*$/i, "");
  const textWithBreaks = clean(stemHtml)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<p>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const lines = textWithBreaks
    .split("\n")
    .map(l => l.replace(/\\n/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  
  let instruction = "";
  let sentence = "";

  if (lines.length >= 2) {
    instruction = lines[0];
    sentence = lines.slice(1).join(" ");
  } else if (lines.length === 1) {
    const full = lines[0];
    const match = full.match(/^(.*?(?:voice|sentence|options)[.:]?\s+)([A-Z"“‘'].*)$/i);
    if (match && match[2].trim()) {
      instruction = match[1].trim();
      sentence = match[2].trim();
    } else {
      sentence = full;
    }
  }

  sentence = sentence.replace(/^\d+\s*[.)]\s*/, "").trim();
  return { instruction, sentence };
}

const irregularPastSimple = new Set([
  "wrote", "ate", "took", "saw", "made", "drove", "gave", "spoke", "ran", "held", "kept", "told",
  "found", "left", "felt", "brought", "bought", "thought", "built", "lost", "paid", "met", "sent",
  "stood", "set", "read", "put", "cut", "shut", "hit", "cost", "hurt", "blew", "broke", "chose",
  "came", "drank", "fell", "flew", "forgot", "froze", "got", "grew", "hid", "knew", "lay", "rang",
  "rose", "shook", "shot", "sang", "sank", "sat", "slept", "spent", "swam", "threw", "wore", "won",
  "tore", "swore", "bore", "hung", "dug", "struck", "bit", "lit", "slid"
]);

function detectVoiceAndTense(sentence, correctOption, instruction) {
  const s = sentence.trim();
  const c = correctOption.trim();
  const inst = instruction.toLowerCase().replace(/\s+/g, "");

  let isA2P = true;
  if (inst.includes("inpassive") || inst.includes("correctpassive") || inst.includes("passiveform") || inst.includes("passivevoice")) {
    isA2P = true;
  } else if (inst.includes("inactive") || inst.includes("correctactive") || inst.includes("activeform") || inst.includes("activevoice")) {
    isA2P = false;
  } else {
    const optHasPassive = /\b(is|am|are|was|were|be|been|being)\s+(?:\w+\s+){0,3}\w+(ed|en|t|d|wn|ne|rn|ng|ug|ck)\b/i.test(c);
    const sentHasPassive = /\b(is|am|are|was|were|be|been|being)\s+(?:\w+\s+){0,3}\w+(ed|en|t|d|wn|ne|rn|ng|ug|ck)\b/i.test(s);
    if (optHasPassive && !sentHasPassive) isA2P = true;
    else if (!optHasPassive && sentHasPassive) isA2P = false;
    else if (optHasPassive) isA2P = true;
    else isA2P = false;
  }

  const activeText = isA2P ? s : c;
  const passiveText = isA2P ? c : s;

  const isImperative = /^(please|kindly|let\b|do not\b|don't\b)/i.test(activeText) ||
    /^(shut|open|close|take|give|bring|call|turn|switch|help|carry|clean|deliver|send|tell|show|keep|post|finish|pay|write)\b/i.test(activeText) ||
    /\blet\b.*\bbe\b/i.test(passiveText) ||
    /\byou are (requested|ordered|advised|asked) to\b/i.test(passiveText);

  let tense = "Unknown";
  let activeRule = "";
  let passiveRule = "";

  const hasIrregularPast = activeText.split(/\s+/).some(w => irregularPastSimple.has(w.toLowerCase().replace(/[^a-z]/g, "")));

  if (isImperative) {
    tense = "Imperative sentence";
    activeRule = "*Base verb ($V_1$) + Object* (or *Do not + $V_1$*)";
    passiveRule = "*Let + Object + be + past participle ($V_3$)* or *Object + should + be + $V_3$*";
  } else if (/\b(had been)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\bhad\s+(?:\w+\s+){0,2}\w+(ed|en|t|d|wn|ne|rn|ng|ug|ck)\b/i.test(activeText)) {
    tense = "Past Perfect tense";
    activeRule = "*Subject + had + past participle ($V_3$) + Object*";
    passiveRule = "*Object + had + been + past participle ($V_3$) + by + Subject*";
  } else if (/\b(has been|have been)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\b(has|have)\s+(?:\w+\s+){0,2}\w+(ed|en|t|d|wn|ne|rn|ng|ug|ck)\b/i.test(activeText)) {
    tense = "Present Perfect tense";
    activeRule = "*Subject + has/have + past participle ($V_3$) + Object*";
    passiveRule = "*Object + has/have + been + past participle ($V_3$) + by + Subject*";
  } else if (/\b(will have been|shall have been)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\b(will have|shall have)\s+\w+/i.test(activeText)) {
    tense = "Future Perfect tense";
    activeRule = "*Subject + will/shall have + past participle ($V_3$) + Object*";
    passiveRule = "*Object + will/shall have + been + past participle ($V_3$) + by + Subject*";
  } else if (/\b(was being|were being)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\b(was|were)\s+(?:\w+\s+){0,2}\w+ing\b/i.test(activeText)) {
    tense = "Past Continuous tense";
    activeRule = "*Subject + was/were + present participle ($V\\text{-ing}$) + Object*";
    passiveRule = "*Object + was/were + being + past participle ($V_3$) + by + Subject*";
  } else if (/\b(is being|are being|am being)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\b(is|are|am)\s+(?:\w+\s+){0,2}\w+ing\b/i.test(activeText)) {
    tense = "Present Continuous tense";
    activeRule = "*Subject + is/am/are + present participle ($V\\text{-ing}$) + Object*";
    passiveRule = "*Object + is/am/are + being + past participle ($V_3$) + by + Subject*";
  } else if (/\b(can|could|may|might|must|should|would|ought to)\s+(?:have\s+been|be)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) ||
             /\b(can|could|may|might|must|should|would|ought to)\s+(?:have\s+\w+|\w+)/i.test(activeText)) {
    const modalMatch = (passiveText.match(/\b(can|could|may|might|must|should|would|ought to)\b/i) || activeText.match(/\b(can|could|may|might|must|should|would|ought to)\b/i));
    const modal = modalMatch ? modalMatch[1].toLowerCase() : "modal";
    const hasModalPerfect = /\bhave\b/i.test(passiveText) && /\bhave\b/i.test(activeText);
    if (hasModalPerfect) {
      tense = `Modal Perfect ('${modal} have')`;
      activeRule = `*Subject + ${modal} + have + past participle ($V_3$) + Object*`;
      passiveRule = `*Object + ${modal} + have + been + past participle ($V_3$) + by + Subject*`;
    } else {
      tense = `Modal Auxiliary ('${modal}')`;
      activeRule = `*Subject + ${modal} + base verb ($V_1$) + Object*`;
      passiveRule = `*Object + ${modal} + be + past participle ($V_3$) + by + Subject*`;
    }
  } else if (/\b(will|shall)\s+(?:be)\s+(?:\w+\s+){0,2}\w+/i.test(passiveText) || /\b(will|shall)\s+[a-z]+/i.test(activeText)) {
    tense = "Simple Future tense";
    activeRule = "*Subject + will/shall + base verb ($V_1$) + Object*";
    passiveRule = "*Object + will/shall + be + past participle ($V_3$) + by + Subject*";
  } else if (/\b(was|were)\s+(?:\w+\s+){0,2}\w+(ed|en|t|d|wn|ne|rn|ng|ug|ck)\b/i.test(passiveText) || /\bdid\b/i.test(activeText) || hasIrregularPast || /\b\w+ed\b/i.test(activeText)) {
    tense = "Simple Past tense";
    activeRule = "*Subject + past simple ($V_2$) + Object* (or *did + $V_1$*)";
    passiveRule = "*Object + was/were + past participle ($V_3$) + by + Subject*";
  } else {
    tense = "Simple Present tense";
    activeRule = "*Subject + base/s-form ($V_1 / V_1\\text{+s/es}$) + Object*";
    passiveRule = "*Object + is/am/are + past participle ($V_3$) + by + Subject*";
  }

  return { isA2P, tense, activeRule, passiveRule, activeText, passiveText };
}

export function generateSolution(q) {
  const ansLabel = String(q.answer || "A").toUpperCase();
  const correctIdx = ansLabel.charCodeAt(0) - 65;
  const opts = (q.options || []).map(plain);
  const correctText = opts[correctIdx];
  const { instruction, sentence } = extractSentence(q);
  const info = detectVoiceAndTense(sentence, correctText, instruction);

  const distractorLines = [];
  opts.forEach((opt, idx) => {
    if (idx !== correctIdx) {
      const lbl = String.fromCharCode(65 + idx);
      const reason = explainDistractor(correctText, opt);
      distractorLines.push(`- **Option ${lbl}** ${reason}.`);
    }
  });

  const direction = info.isA2P ? "Active to Passive Voice" : "Passive to Active Voice";
  const sourceForm = info.isA2P ? "Active" : "Passive";
  const targetForm = info.isA2P ? "Passive" : "Active";
  const targetRule = info.isA2P ? info.passiveRule : info.activeRule;

  return `**Voice Transformation (${direction}):**\n- **Given sentence:** ${sourceForm} voice in ${info.tense}.\n- **Transformation rule:** ${targetRule}.\n\n**Option Evaluation:**\n- **Option ${ansLabel}** (*“${correctText}”*) correctly applies the required ${targetForm.toLowerCase()} voice construction.\n${distractorLines.join("\n")}\n\nHence, **Option ${ansLabel}** is the correct answer.`;
}

// Main execution when run directly
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("generate-aptitude-active-passive-solutions.mjs")) {
  const root = path.resolve(path.dirname(process.argv[1]), "../..");
  const shardPath = path.join(root, "public/data/aptitude/english/active-passive.json");
  const chunkPath = path.join(root, "data/solutions/chunks/aptitude/chunk-apt-active-passive-01.json");

  const questions = JSON.parse(fs.readFileSync(shardPath, "utf8"));
  const solutions = {};

  let count = 0;
  for (const q of questions) {
    const sol = generateSolution(q);
    q.detailed_solution = sol;
    solutions[q.uid] = sol;
    count++;
  }

  // Save chunk file
  fs.mkdirSync(path.dirname(chunkPath), { recursive: true });
  fs.writeFileSync(chunkPath, JSON.stringify(solutions, null, 2), "utf8");

  // Save updated shard
  fs.writeFileSync(shardPath, JSON.stringify(questions, null, 2), "utf8");

  // Also check dist/
  const distShard = path.join(root, "dist/data/aptitude/english/active-passive.json");
  if (fs.existsSync(distShard)) {
    fs.writeFileSync(distShard, JSON.stringify(questions, null, 2), "utf8");
  }

  console.log(`Generated solutions for all ${count} active-passive questions!`);
  console.log(`Saved chunk to ${chunkPath}`);
  console.log(`Updated shard ${shardPath}`);
}
