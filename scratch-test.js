const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/questions-with-answers.json', 'utf8'));
const q = data.find(x => x.question_uid === 'go:80');

const { normalizeQuestionOptions } = require('./src/services/question-service/QuestionNormalizer.js');
// Wait, QuestionNormalizer is an ES module. I'll just copy the function.

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const stripHtmlToText = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();

function extractOptionsFromQuestionHtml(html) {
  const options = [];
  const liMatches = html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi);
  for (const match of liMatches) {
    if (options.length >= OPTION_LABELS.length) break;
    const optionHtml = String(match[1] || '').trim();
    const optionText = stripHtmlToText(optionHtml);
    if (!optionHtml && !optionText) continue;
    options.push({
      label: OPTION_LABELS[options.length],
      text: optionText || optionHtml,
      html: optionHtml || optionText
    });
  }
  return options;
}

console.log(extractOptionsFromQuestionHtml(q.question));
