#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT, 'public/data/aptitude');

async function main() {
  const subjects = await fs.readdir(DATA_DIR);
  let errorCount = 0;
  
  const imgRegex = /<img[^>]+src=["'](http[^"']+)["'][^>]*>/gi;
  const absoluteImgRegex = /<img[^>]+src=["'](\/images\/aptitude\/[^"']+)["'][^>]*>/gi;
  const localImgRegex = /<img[^>]+src=["'](images\/aptitude\/[^"']+)["'][^>]*>/gi;

  for (const subject of subjects) {
    const subjectPath = path.join(DATA_DIR, subject);
    const stat = await fs.stat(subjectPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(subjectPath);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(subjectPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      const rows = JSON.parse(content);
      
      for (const row of rows) {
        if (!row.questionHtml) continue;
        
        let match;
        // Check for remote images
        while ((match = imgRegex.exec(row.questionHtml)) !== null) {
          console.error(`[ERROR] Remote image found in ${row.uid}: ${match[1]}`);
          errorCount++;
        }

        while ((match = absoluteImgRegex.exec(row.questionHtml)) !== null) {
          console.error(`[ERROR] Root-absolute aptitude image path found in ${row.uid}: ${match[1]}`);
          errorCount++;
        }
        
        // Check for broken local images
        while ((match = localImgRegex.exec(row.questionHtml)) !== null) {
          const imgPath = path.join(ROOT, 'public', match[1]);
          try {
            await fs.access(imgPath);
          } catch (e) {
            console.error(`[ERROR] Broken local image link in ${row.uid}: ${match[1]}`);
            errorCount++;
          }
        }
      }
    }
  }
  
  if (errorCount > 0) {
    console.error(`\nValidation failed: ${errorCount} image errors found.`);
    process.exit(1);
  } else {
    console.log('Image validation passed. No remote or broken images found.');
  }
}

main().catch(console.error);
