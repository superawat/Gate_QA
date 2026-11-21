import fs from 'node:fs';
import path from 'node:path';

const shardPath = 'public/data/aptitude/english/cloze-test.json';
const outputPath = 'data/solutions/chunks/aptitude/chunk-apt-cloze-01.json';

const data = JSON.parse(fs.readFileSync(shardPath, 'utf8'));

function decode(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—');
}

function plain(html) {
  const tagCleaned = String(html || '')
    .replace(/<\/?(?:span|strong|em|b|i|u|font|small|sub|sup)\b[^>]*>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  return decode(tagCleaned)
    .replace(/\\r\\n|\\n|\\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBlankNumber(rawText, q) {
  const text = rawText.replace(/(\d)\s+(\d)/g, '$1$2');
  const m1 = text.match(/(?:blank|blanks)(?:\s+no\.?|\s+number|\s*#|\s*:)?\s*\[?\(?(\d+)\]?\)?/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = text.match(/fill\s*(?:in)?\s*(?:the)?\s*\[?\(?(\d+)\]?\)?\s*(?:no\.)?\s*blank/i);
  if (m2) return parseInt(m2[1], 10);
  const m3 = text.match(/blank\s*number\s*\[(\d+)\]/i);
  if (m3) return parseInt(m3[1], 10);
  if (q._source && q._source.originalQNum) {
    return parseInt(q._source.originalQNum, 10);
  }
  return 1;
}

function findBlankMatch(text, blankNum) {
  const patterns = [
    new RegExp(`(?:_{1,}\\s*)?(?:\\(${blankNum}\\)|\\[${blankNum}\\])\\.?(?:\\s*_{1,})?`, 'i'),
    new RegExp(`(?:^|\\D)${blankNum}\\.\\s*_{1,}`, 'i'),
    new RegExp(`(?:^|\\D)${blankNum}_+`, 'i'),
    new RegExp(`_{1,}\\s*${blankNum}\\s*_{1,}`, 'i'),
    new RegExp(`_{1,}\\s*\\(${blankNum}\\)`, 'i'),
    new RegExp(`\\(${blankNum}\\)\\s*_{1,}`, 'i'),
    new RegExp(`[\\(\\[]\\s*${blankNum}\\s*[\\)\\]]`, 'i'),
  ];

  for (const pat of patterns) {
    const match = text.match(pat);
    if (match) return match;
  }
  return null;
}

function extractSentenceForBlank(fullText, blankNum) {
  let match = findBlankMatch(fullText, blankNum);
  
  if (!match && blankNum > 5) {
    const candidateOffsets = [4, 5, 10, 15, 20];
    for (const offset of candidateOffsets) {
      if (blankNum - offset >= 1 && blankNum - offset <= 10) {
        match = findBlankMatch(fullText, blankNum - offset);
        if (match) break;
      }
    }
  }

  if (!match) {
    const bareBlankMatch = fullText.match(/_{3,}/);
    if (bareBlankMatch) match = bareBlankMatch;
  }

  if (!match) return { sentence: '', matchStr: '', before: '', after: '' };

  const matchIndex = match.index;
  const matchLen = match[0].length;
  const before = fullText.slice(0, matchIndex);
  const after = fullText.slice(matchIndex + matchLen);
  
  const startMatch = before.search(/([.?!]\s+)(?!.*[.?!]\s+)/);
  const start = startMatch !== -1 ? startMatch + 2 : 0;
  
  const endMatch = after.search(/[.?!](?:\s|$)/);
  const end = endMatch !== -1 ? matchIndex + matchLen + endMatch + 1 : fullText.length;
  
  let s = fullText.slice(start, end).replace(/\s+/g, ' ').trim();
  s = s.replace(/^(?:cloze\s*test\s*:?|comprehension\s*:?)\s*/i, '');
  s = s.replace(/\s*(?:Select|Choose|What should come)[\s\S]*$/i, '').trim();
  return { sentence: s, matchStr: match[0], before: before.trim(), after: after.trim() };
}

const prepositions = new Set([
  'in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'of', 'about', 
  'under', 'into', 'over', 'through', 'between', 'among', 'upon', 'against', 
  'during', 'without', 'behind', 'across', 'towards', 'toward', 'along', 
  'around', 'beside', 'besides', 'off', 'onto', 'within', 'beyond', 'throughout'
]);

const determinersQuantifiers = new Set([
  'many', 'much', 'few', 'little', 'less', 'fewer', 'all', 'some', 'any', 
  'each', 'every', 'both', 'either', 'neither', 'another', 'other', 'several', 
  'more', 'most', 'no', 'this', 'that', 'these', 'those'
]);

const conjunctionsDiscourse = new Set([
  'however', 'therefore', 'moreover', 'furthermore', 'fortunately', 'unfortunately', 
  'consequently', 'meanwhile', 'nevertheless', 'nonetheless', 'similarly', 'firstly', 
  'finally', 'instead', 'although', 'though', 'because', 'since', 'while', 'whereas', 
  'unless', 'if', 'so', 'but', 'and', 'or', 'yet', 'hence', 'thus'
]);

const relativePronouns = new Set([
  'who', 'whom', 'whose', 'which', 'that', 'where', 'when', 'why', 'what'
]);

const commonCollocations = [
  { trigger: /inflict/i, prep: /upon|on/i, phrase: "inflict ... upon/on", explanation: "the verb 'inflict' specifically collocates with 'damage/harm upon' (to cause harm or suffering to be experienced)" },
  { trigger: /taste/i, prep: /for/i, phrase: "taste for", explanation: "the noun 'taste' collocates with 'for' to mean an acquired liking or appreciation for an activity" },
  { trigger: /depend/i, prep: /on|upon/i, phrase: "depend on/upon", explanation: "the verb 'depend' collocates with 'on/upon' to signify reliance or conditioning" },
  { trigger: /rely/i, prep: /on|upon/i, phrase: "rely on/upon", explanation: "the verb 'rely' collocates with 'on/upon'" },
  { trigger: /lead/i, prep: /to/i, phrase: "lead to", explanation: "the verb 'lead' collocates with 'to' to denote a result or destination" },
  { trigger: /result/i, prep: /in/i, phrase: "result in", explanation: "the verb 'result' takes 'in' to indicate an outcome" },
  { trigger: /consist/i, prep: /of/i, phrase: "consist of", explanation: "the verb 'consist' takes 'of' to describe components or makeup" },
  { trigger: /base/i, prep: /on|upon/i, phrase: "based on", explanation: "'based on' is the standard participial phrase meaning founded upon evidence or facts" },
  { trigger: /role/i, prep: /in/i, phrase: "role in", explanation: "the noun 'role' collocates with 'in' (e.g. 'plays a role in')" },
  { trigger: /barrier/i, prep: /to/i, phrase: "barriers to", explanation: "the noun 'barrier' takes 'to' ('barriers to communication')" },
  { trigger: /demand/i, prep: /for/i, phrase: "demand for", explanation: "the noun 'demand' takes 'for' ('demand for organically grown crops')" },
  { trigger: /increase|growth|rise/i, prep: /in/i, phrase: "increase/rise in", explanation: "indicates an upward trend in a specific area" },
  { trigger: /decrease|decline|drop|fall/i, prep: /in/i, phrase: "decrease/decline in", explanation: "indicates a downward trend in a specific area" },
  { trigger: /substitute/i, prep: /with/i, phrase: "substitute ... with", explanation: "the verb 'substitute' takes 'with' to specify the replacement" },
  { trigger: /focus/i, prep: /on/i, phrase: "focus on", explanation: "the verb 'focus' takes the preposition 'on'" },
  { trigger: /aware/i, prep: /of/i, phrase: "aware of", explanation: "the adjective 'aware' takes the preposition 'of'" },
  { trigger: /capable/i, prep: /of/i, phrase: "capable of", explanation: "the adjective 'capable' takes the preposition 'of'" },
  { trigger: /vital|essential/i, prep: /for|to/i, phrase: "vital/essential for", explanation: "means necessary or indispensable for a given purpose" },
  { trigger: /opportunity/i, prep: /to|for/i, phrase: "opportunity to/for", explanation: "the noun 'opportunity' takes 'to + infinitive' or 'for'" },
  { trigger: /access/i, prep: /to/i, phrase: "access to", explanation: "the noun 'access' collocates with 'to'" },
  { trigger: /impact/i, prep: /on|upon/i, phrase: "impact on/upon", explanation: "the noun 'impact' collocates with 'on/upon'" },
  { trigger: /solution/i, prep: /to/i, phrase: "solution to", explanation: "the noun 'solution' takes 'to'" },
  { trigger: /contribute/i, prep: /to/i, phrase: "contribute to", explanation: "the verb 'contribute' collocates with 'to'" },
  { trigger: /participate/i, prep: /in/i, phrase: "participate in", explanation: "the verb 'participate' collocates with 'in'" },
  { trigger: /prevent/i, prep: /from/i, phrase: "prevent from", explanation: "the verb 'prevent' takes 'from + gerund'" },
  { trigger: /protect/i, prep: /from|against/i, phrase: "protect from/against", explanation: "the verb 'protect' takes 'from' or 'against'" },
  { trigger: /benefit/i, prep: /from/i, phrase: "benefit from", explanation: "the verb 'benefit' takes 'from'" },
  { trigger: /spirited/i, prep: /away/i, phrase: "spirited away", explanation: "the phrasal verb 'spirited away' means secretly and quickly carried off" },
  { trigger: /put/i, prep: /under/i, phrase: "put under", explanation: "e.g. 'put under the plow' means brought into cultivation" },
];

function generateDetailedSolution(q) {
  const rawText = plain(q.questionHtml.replace(/<ol[\s\S]*$/i, ''));
  const blankNum = getBlankNumber(rawText, q);
  const { sentence, matchStr } = extractSentenceForBlank(rawText, blankNum);
  
  const ansLetter = q.answer;
  const ansIdx = ansLetter.charCodeAt(0) - 65;
  const correctWord = plain(q.options[ansIdx]);
  const otherOpts = q.options
    .map((o, i) => ({ letter: String.fromCharCode(65 + i), word: plain(o) }))
    .filter(item => item.letter !== ansLetter);
  
  const distractorNames = otherOpts.map(o => `'${o.word}'`).join(', ');

  let filledSentence = '';
  if (sentence && matchStr) {
    const repl = `**${correctWord}**`;
    filledSentence = sentence.replace(matchStr, (m, offset, full) => {
      let r = repl;
      if (offset > 0 && !/\s$/.test(full.slice(0, offset))) r = ' ' + r;
      if (offset + m.length < full.length && !/^\s/.test(full.slice(offset + m.length)) && !/^[.,!?;:]/.test(full.slice(offset + m.length))) r = r + ' ';
      return r;
    });
  }

  let wordsBefore = [];
  let wordsAfter = [];
  if (sentence && matchStr) {
    const sBefore = sentence.slice(0, sentence.indexOf(matchStr)).trim();
    const sAfter = sentence.slice(sentence.indexOf(matchStr) + matchStr.length).trim();
    wordsBefore = sBefore.split(/\s+/).filter(Boolean);
    wordsAfter = sAfter.split(/\s+/).filter(Boolean);
  }
  
  const prevWord = wordsBefore[wordsBefore.length - 1] || '';
  const prevClean = prevWord.replace(/^[^\w]+|[^\w]+$/g, '');
  const nextWord = wordsAfter[0] || '';
  const nextClean = nextWord.replace(/^[^\w]+|[^\w]+$/g, '');
  const followingFew = wordsAfter.slice(0, 4).join(' ').toLowerCase();

  const lowerCorrect = correctWord.toLowerCase();
  let reasoning = '';

  let matchedCollocation = null;
  for (const c of commonCollocations) {
    if (c.trigger.test(lowerCorrect) && c.prep.test(followingFew)) {
      matchedCollocation = c;
      break;
    }
    if (c.trigger.test(prevClean) && c.prep.test(lowerCorrect)) {
      matchedCollocation = c;
      break;
    }
  }

  const allWords = q.options.map(o => plain(o).toLowerCase());
  const stems = allWords.map(w => w.replace(/(ing|ed|es|s|tion|ment|ly|able|ity)$/, ''));
  const isVerbInflectionSet = stems.every(s => s.length >= 3 && stems[0].startsWith(s.slice(0, 3)));

  if (matchedCollocation) {
    reasoning = `In the context of the sentence, '${correctWord}' forms the idiomatic phrase '${matchedCollocation.phrase}' (${matchedCollocation.explanation}). The other options (${distractorNames}) do not form this established collocation in the sentence.`;
  }
  else if (isVerbInflectionSet) {
    let tenseReason = '';
    if (wordsBefore.some(w => /^(is|was|were|are|be|been|being)$/i.test(w)) && /ed$|en$/i.test(lowerCorrect)) {
      tenseReason = `Following the passive auxiliary verb, the past participle form (V3) '${correctWord}' is required.`;
    } else if (wordsBefore.some(w => /^(is|was|were|are|am|be|been|being)$/i.test(w)) && /ing$/i.test(lowerCorrect)) {
      tenseReason = `Following the continuous auxiliary verb, the present participle form (V-ing) '${correctWord}' is required.`;
    } else if (wordsBefore.some(w => /^(has|have|had)$/i.test(w))) {
      tenseReason = `Following the perfect auxiliary verb, the past participle form '${correctWord}' is required.`;
    } else if (wordsBefore.some(w => /^(to)$/i.test(w))) {
      tenseReason = `Following the infinitive marker 'to', the base form (bare infinitive) '${correctWord}' is required.`;
    } else {
      tenseReason = `'${correctWord}' provides the grammatically correct tense and subject-verb agreement for the clause.`;
    }
    reasoning = `The options represent different grammatical forms of the same root word. ${tenseReason} The alternative forms (${distractorNames}) violate the required tense, voice, or syntactic structure of the sentence.`;
  }
  else if (prepositions.has(lowerCorrect)) {
    if (prevClean) {
      reasoning = `The blank requires the preposition '${correctWord}' following '${prevClean}' ('${prevClean} ${correctWord}'${nextClean ? ` ${nextClean}` : ''}). In standard English, '${prevClean}' naturally takes '${correctWord}' in this context. The other prepositions (${distractorNames}) do not form the correct grammatical collocation.`;
    } else {
      reasoning = `The blank requires the preposition '${correctWord}' to establish the intended spatial, temporal, or functional relationship in the clause. The other options (${distractorNames}) do not satisfy this grammatical requirement.`;
    }
  }
  else if (prepositions.has(nextClean.toLowerCase())) {
    reasoning = `The blank requires a word that naturally collocates with the following preposition '${nextClean.toLowerCase()}'. The expression '${correctWord} ${nextClean.toLowerCase()}' is the standard, idiomatic phrase that conveys the intended meaning in this sentence. The other options (${distractorNames}) do not collocate with '${nextClean.toLowerCase()}' in this manner.`;
  }
  else if (conjunctionsDiscourse.has(lowerCorrect)) {
    reasoning = `The blank requires an appropriate transitional connective or discourse marker. '${correctWord}' accurately conveys the required logical relationship (such as sequence, cause-and-effect, contrast, or addition) demanded by the flow of the passage. The other options (${distractorNames}) convey conflicting logical relations that do not match the context.`;
  }
  else if (determinersQuantifiers.has(lowerCorrect)) {
    reasoning = `The blank requires an appropriate determiner or quantifier modifying '${nextClean || 'the following noun'}'. '${correctWord}' agrees in number and countability with the head noun and fits the intended degree in the passage. The other choices (${distractorNames}) fail to align with the grammatical countability or semantic scope of the context.`;
  }
  else if (relativePronouns.has(lowerCorrect)) {
    reasoning = `The blank requires the relative pronoun '${correctWord}' referring back to the antecedent '${prevClean || 'mentioned entity'}'. '${correctWord}' is the grammatically correct pronoun for this type of referent and syntactic role in the clause, whereas ${distractorNames} are inappropriate here.`;
  }
  else if (/^(a|an|the)$/i.test(lowerCorrect)) {
    reasoning = `The blank requires the article '${correctWord}' before '${nextClean}'. In English grammar, '${correctWord}' is required based on the phonetic sound and definiteness of the following noun phrase. The other options do not fit this grammatical requirement.`;
  }
  else {
    let collocText = '';
    if (prevClean && /^(an|a|the|to|more|most|so|very|great|rising|growing|deep|high|low|positive|negative)$/i.test(prevClean)) {
      collocText = ` Preceded by '${prevClean}', '${correctWord}' completes the natural phrase.`;
    }
    reasoning = `In the context of the sentence, '${correctWord}' is the most appropriate word because it accurately conveys the intended meaning of the passage.${collocText} The other options (${distractorNames}) are contextually unsuitable, alter the intended sense, or do not fit the semantic tone of the passage.`;
  }

  let solution = `For blank (${blankNum}), **'${correctWord}'** is the correct choice.\n\n`;
  if (filledSentence) {
    solution += `**Context:** *"${filledSentence}"*\n\n`;
  }
  solution += `**Reasoning:** ${reasoning}\n\nHence, **Option ${ansLetter}** is the correct answer.`;
  return solution;
}

const solutionMap = {};
for (const q of data) {
  if (!q.uid) throw new Error("Missing UID");
  solutionMap[q.uid] = generateDetailedSolution(q);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(solutionMap, null, 2), 'utf8');

console.log(`Generated ${Object.keys(solutionMap).length} cloze-test detailed solutions into ${outputPath}`);
