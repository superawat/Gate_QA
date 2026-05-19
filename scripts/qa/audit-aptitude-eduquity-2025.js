const fs = require('fs');
const path = require('path');
const { loadAptitudeRows } = require('./load-aptitude-data');

const SYNTHETIC_MARKER_RE = /<!--\s*mock\s+2025\b|mock_2025_data|synthetic/i;

function readParsedQuestions() {
  const filePath = path.resolve(__dirname, '../../artifacts/aptitude-pipeline/parsed-questions.json');
  if (!fs.existsSync(filePath)) {
    console.error('Error: parsed-questions.json not found.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const rows = readParsedQuestions();
  let total2025 = 0;
  let excludedGS = 0;
  let syntheticRows = 0;
  
  const bySubject = {};
  const bySubtopic = {};
  
  for (const row of rows) {
    const source = row._source || {};
    const sourceText = JSON.stringify(source);
    if (SYNTHETIC_MARKER_RE.test(`${row.questionHtml || ''} ${sourceText}`)) {
      syntheticRows++;
      continue;
    }
    
    const yearMatch = source.year === 2025 || 
                      /2025|12\/09\/2025|14\/10\/2025|04\/02\/2025|25\/02\/2025|12 November|30 November/i.test(source.testSeries || '') ||
                      /2025|12\/09\/2025|14\/10\/2025|04\/02\/2025|25\/02\/2025|12 November|30 November/i.test(source.paperTitle || '');
    
    const eduquityMatch = /Eduquity|Eduquity Based|Eduquity Pattern|EBP/i.test(source.testSeries || '') ||
                          /Eduquity|Eduquity Based|Eduquity Pattern|EBP/i.test(source.paperTitle || '') ||
                          /Eduquity|Eduquity Based|Eduquity Pattern|EBP/i.test(source.product || '');
                          
    const gsMatch = /G\.S|General Awareness|Hindi/i.test(source.testSeries || '') ||
                    /G\.S|General Awareness|Hindi/i.test(source.paperTitle || '') ||
                    /G\.S|General Awareness|Hindi/i.test(row.subject || '');
                    
    if (gsMatch && (yearMatch || eduquityMatch)) {
      excludedGS++;
    }
    
    if (!gsMatch && yearMatch && eduquityMatch) {
      total2025++;
      
      bySubject[row.subject] = (bySubject[row.subject] || 0) + 1;
      
      const topicKey = `${row.subject} / ${row.subtopic}`;
      bySubtopic[topicKey] = (bySubtopic[topicKey] || 0) + 1;
    }
  }

  const publicRows = loadAptitudeRows();
  const public2025EduquityRows = publicRows.filter((row) => {
    const sources = Array.isArray(row._source) ? row._source : [row._source].filter(Boolean);
    return sources.some((source) => {
      const yearMatch = source?.year === 2025 || row.year === 2025;
      const eduquityMatch = /Eduquity|Eduquity Based|Eduquity Pattern|EBP/i.test(
        `${source?.testSeries || ''} ${source?.paperTitle || ''} ${source?.product || ''}`
      );
      return yearMatch && eduquityMatch;
    });
  });
  const publicBySubject = {};
  const publicBySubtopic = {};
  public2025EduquityRows.forEach((row) => {
    publicBySubject[row.subject] = (publicBySubject[row.subject] || 0) + 1;
    const key = `${row.subject} / ${row.subtopic}`;
    publicBySubtopic[key] = (publicBySubtopic[key] || 0) + 1;
  });
  
  console.log('--- 2025 Eduquity Audit ---');
  console.log(`Total 2025 Eduquity Rows: ${total2025}`);
  console.log(`Public 2025 Eduquity Rows: ${public2025EduquityRows.length}`);
  console.log(`Excluded GS/Hindi Rows in 2025 Eduquity: ${excludedGS}`);
  console.log(`Synthetic/mock staging rows: ${syntheticRows}`);
  console.log('\n--- By Subject ---');
  for (const [subject, count] of Object.entries(bySubject)) {
    console.log(`  ${subject}: ${count}`);
  }
  
  console.log('\n--- By Subtopic ---');
  for (const [subtopic, count] of Object.entries(bySubtopic)) {
    console.log(`  ${subtopic}: ${count}`);
  }

  console.log('\n--- Public By Subject ---');
  for (const [subject, count] of Object.entries(publicBySubject)) {
    console.log(`  ${subject}: ${count}`);
  }

  console.log('\n--- Public By Subtopic ---');
  for (const [subtopic, count] of Object.entries(publicBySubtopic)) {
    console.log(`  ${subtopic}: ${count}`);
  }
  
  if (total2025 === 0) {
    console.error('\nError: Zero 2025 Eduquity rows were found. The focused run may have failed or parsed incorrectly.');
    process.exit(1);
  }

  if (public2025EduquityRows.length === 0) {
    console.error('\nError: 2025 Eduquity rows are present in staging but absent from public aptitude shards.');
    process.exit(1);
  }

  if (syntheticRows > 0) {
    console.error('\nError: Synthetic/mock 2025 rows remain in parsed-questions.json. Remove them before accepting the pipeline output.');
    process.exit(1);
  }
  
  console.log('\nAudit Passed.');
}

main();
