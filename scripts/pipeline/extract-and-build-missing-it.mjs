import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const ROOT = process.cwd();
const QUESTION_IMAGES_DIR = path.join(ROOT, 'public', 'question-images');

if (!fs.existsSync(QUESTION_IMAGES_DIR)) {
  fs.mkdirSync(QUESTION_IMAGES_DIR, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve(destPath);
    }
    const fullUrl = url.startsWith('http') ? url : `https://practicepaper.in${url}`;
    const client = fullUrl.startsWith('https') ? https : http;
    client.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${fullUrl}: status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function convertLatex(str) {
  if (!str) return '';
  return str.replace(/\[latex\]([\s\S]*?)\[\/latex\]/g, '$$$1$');
}

function cleanHtmlText(html) {
  if (!html) return '';
  let cleaned = html
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<ins[\s\S]*?<\/ins>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  return cleaned;
}

async function processImagesInHtml(html, qUid) {
  if (!html) return '';
  let result = html;
  const imgRegex = /<img[^>]+(?:data-src|src)=['"]([^'"]+)['"][^>]*>/gi;
  const matches = [...html.matchAll(imgRegex)];

  for (let i = 0; i < matches.length; i++) {
    const fullImgTag = matches[i][0];
    const rawSrc = matches[i][1];
    if (rawSrc.startsWith('data:image')) {
      const dataSrcMatch = fullImgTag.match(/data-src=['"]([^'"]+)['"]/i);
      if (dataSrcMatch) {
        const actualSrc = dataSrcMatch[1];
        const ext = path.extname(actualSrc.split('?')[0]) || '.jpg';
        const cleanUid = qUid.replace(/[^a-zA-Z0-9]/g, '_');
        const localFileName = `it_${cleanUid}_${i}${ext}`;
        const localFilePath = path.join(QUESTION_IMAGES_DIR, localFileName);
        try {
          await downloadImage(actualSrc, localFilePath);
          const newImgTag = `<img alt="" src="/Gate_QA/question-images/${localFileName}"/>`;
          result = result.replace(fullImgTag, newImgTag);
        } catch (e) {
          console.warn(`Failed image download for ${actualSrc}:`, e.message);
        }
      }
    } else if (rawSrc.includes('/wp-content/uploads/')) {
      const ext = path.extname(rawSrc.split('?')[0]) || '.jpg';
      const cleanUid = qUid.replace(/[^a-zA-Z0-9]/g, '_');
      const localFileName = `it_${cleanUid}_${i}${ext}`;
      const localFilePath = path.join(QUESTION_IMAGES_DIR, localFileName);
      try {
        await downloadImage(rawSrc, localFilePath);
        const newImgTag = `<img alt="" src="/Gate_QA/question-images/${localFileName}"/>`;
        result = result.replace(fullImgTag, newImgTag);
      } catch (e) {
        console.warn(`Failed image download for ${rawSrc}:`, e.message);
      }
    }
  }

  return result;
}

function mapSubjectToTag(subjectText, chapterText) {
  const combined = `${subjectText} ${chapterText}`.toLowerCase();
  if (combined.includes('software engineering') || combined.includes('software project')) return 'software-engineering';
  if (combined.includes('web technology') || combined.includes('xml') || combined.includes('html')) return 'web-technologies';
  if (combined.includes('network') || combined.includes('tcp') || combined.includes('token ring')) return 'computer-networks';
  if (combined.includes('operating system') || combined.includes('unix') || combined.includes('linux')) return 'operating-system';
  if (combined.includes('database') || combined.includes('dbms') || combined.includes('sql')) return 'databases';
  if (combined.includes('discrete') || combined.includes('graph') || combined.includes('logic')) return 'discrete-mathematics';
  if (combined.includes('calculus') || combined.includes('linear algebra') || combined.includes('numerical') || combined.includes('mathematics')) return 'engineering-mathematics';
  if (combined.includes('algorithm') || combined.includes('sorting') || combined.includes('recurrence')) return 'algorithms';
  if (combined.includes('data structure') || combined.includes('tree') || combined.includes('stack')) return 'data-structures';
  if (combined.includes('theory of computation') || combined.includes('automata') || combined.includes('grammar')) return 'theory-of-computation';
  if (combined.includes('compiler') || combined.includes('parsing')) return 'compiler-design';
  if (combined.includes('architecture') || combined.includes('organization') || combined.includes('cpu')) return 'co-and-architecture';
  if (combined.includes('digital')) return 'digital-logic';
  return 'information-technology';
}

async function extractMissingForYear(year) {
  console.log(`\n================ Processing GATE IT ${year} ================`);
  const existingFilePath = path.join(ROOT, 'data', 'it', `gateit-${year}.json`);
  const existingList = JSON.parse(fs.readFileSync(existingFilePath, 'utf8'));
  const existingUids = new Set(existingList.map(q => q.question_uid));

  const maxPages = year >= 2006 ? 17 : 18;
  const missingExtracted = [];

  for (let p = 1; p <= maxPages; p++) {
    const url = p === 1 ? `https://practicepaper.in/gate-it/gate-it-${year}` : `https://practicepaper.in/gate-it/gate-it-${year}?page_no=${p}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const text = await res.text();
    const parts = text.split("<div class='question'>");

    for (let i = 1; i < parts.length; i++) {
      const qBlock = parts[i];
      const goMatch = qBlock.match(/gateoverflow\.in\/(\d+)(?:\/([^"#\s]+))?/i);
      const goId = goMatch ? `go:${goMatch[1]}` : null;
      const goSlug = goMatch && goMatch[2] ? goMatch[2] : null;

      if (!goId || existingUids.has(goId)) {
        continue;
      }

      // Question Number & Marks
      const qNumMatch = qBlock.match(/<div class='question_lable'>Question\s*(\d+)<\/div>/i);
      const qNum = qNumMatch ? qNumMatch[1] : (goSlug && goSlug.match(/-(\d+[a-z]?)$/i) ? goSlug.match(/-(\d+[a-z]?)$/i)[1] : null);

      const marksMatch = qBlock.match(/\|\s*(\d+)\s*Mark/i);
      const marks = marksMatch ? parseInt(marksMatch[1], 10) : (parseInt(qNum, 10) > (year <= 2005 ? 30 : 20) ? 2 : 1);

      // Subject / Chapter
      const subjectMatch = qBlock.match(/class=['"]year_sub_chap_link['"][\s\S]*?<a[^>]*>([^<]+)<\/a>(?:[\s\S]*?<a[^>]*>([^<]+)<\/a>)?/i);
      const subjectText = subjectMatch && subjectMatch[1] ? subjectMatch[1].trim() : '';
      const chapterText = subjectMatch && subjectMatch[2] ? subjectMatch[2].trim() : '';
      const subjectTag = mapSubjectToTag(subjectText, chapterText);

      // Correct Option
      const correctRowMatches = [...qBlock.matchAll(/class='option_index_number'>([A-D])<\/div>[^<]*<div[^>]+class=['"]?mtq_correct_marker['"]?/gi)];
      let answerLetters = correctRowMatches.length > 0 ? correctRowMatches.map(m => m[1]) : [];
      if (answerLetters.length === 0) {
        const dataValRowMatches = [...qBlock.matchAll(/<tr[^>]+class='mtq_clickable'[^>]+data-value=1[^>]*>[\s\S]*?class='option_index_number'>([A-D])<\/div>/gi)];
        if (dataValRowMatches.length > 0) {
          answerLetters = dataValRowMatches.map(m => m[1]);
        }
      }

      const qType = answerLetters.length > 1 ? 'MSQ' : 'MCQ';
      const finalAnswer = answerLetters.length > 1 ? answerLetters : (answerLetters[0] || null);

      // Question Stem HTML
      const textMatch = qBlock.match(/<div class=['"]question_text['"][^>]*>([\s\S]*?)<\/div>\s*<table/i);
      let stemHtml = textMatch ? textMatch[1].trim() : '';
      stemHtml = cleanHtmlText(stemHtml);
      stemHtml = convertLatex(stemHtml);
      stemHtml = await processImagesInHtml(stemHtml, goId);

      // Options
      const optionsRows = [...qBlock.matchAll(/<tr[^>]+class=['"]mtq_clickable['"][^>]*>[\s\S]*?class=['"]option_index_number['"]>([A-D])<\/div>[\s\S]*?class=['"]option_data['"]>([\s\S]*?)<\/div>/gi)];
      const optionItems = [];
      for (const optRow of optionsRows) {
        let optText = optRow[2].trim();
        optText = cleanHtmlText(optText);
        optText = convertLatex(optText);
        optText = await processImagesInHtml(optText, `${goId}_opt${optRow[1]}`);
        optionItems.push(optText);
      }

      // Build complete HTML
      let fullQuestionHtml = `<p>${stemHtml}</p>`;
      if (optionItems.length > 0) {
        fullQuestionHtml += `\n<ol style="list-style-type:upper-alpha">`;
        for (const item of optionItems) {
          fullQuestionHtml += `\n<li>${item}</li>`;
        }
        fullQuestionHtml += `\n</ol>`;
      }

      // Link
      const goUrl = goSlug ? `https://gateoverflow.in/${goId.replace('go:', '')}/${goSlug}` : `https://gateoverflow.in/${goId.replace('go:', '')}`;

      const tags = [`gateit-${year}`, subjectTag, 'normal', 'it'];
      if (subjectText) tags.push(subjectText.toLowerCase().replace(/\s+/g, '-'));

      const record = {
        question_uid: goId,
        exam: "GATE",
        branch: "IT",
        year: parseInt(year, 10),
        paper: "IT",
        question_number: String(qNum),
        title: `GATE IT ${year} | Question: ${qNum}`,
        link: goUrl,
        question: fullQuestionHtml,
        tags: [...new Set(tags)],
        question_type: qType,
        answer_meta: {
          type: qType,
          answer: finalAnswer,
          tolerance: null,
          source: "reference_key"
        },
        answer: finalAnswer,
        paper_scope: "official_it",
        source_branch: "IT"
      };

      missingExtracted.push(record);
      existingUids.add(goId); // avoid duplicates if encountered again
      console.log(`  Extracted [${goId}] Q${qNum} (${marks}M) ans=${JSON.stringify(finalAnswer)} | Subj: ${subjectTag}`);
    }
  }

  console.log(`Total missing extracted for ${year}: ${missingExtracted.length}`);
  return missingExtracted;
}

async function run() {
  const years = [2004, 2005, 2006, 2007, 2008];
  const allExtracted = {};
  let totalExtracted = 0;

  for (const y of years) {
    const list = await extractMissingForYear(y);
    allExtracted[y] = list;
    totalExtracted += list.length;
  }

  console.log(`\n================ EXTRACTION COMPLETE ================`);
  console.log(`Total questions extracted across 2004-2008: ${totalExtracted}`);
  fs.writeFileSync('scratch/extracted_missing_it_69.json', JSON.stringify(allExtracted, null, 2), 'utf8');
}

run();
