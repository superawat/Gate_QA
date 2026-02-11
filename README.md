## GATE_QA

Random GATE CSE question practice app (React frontend + Python scraper pipeline).

## Project Structure

- `src/`: React UI and question filtering logic.
- `public/questions-filtered.json`: Main question bank used by the app.
- `scraper/`: GateOverflow scraping, cleaning, and merge scripts.
- `.github/workflows/node.js.yml`: CI/build/deploy workflow.

## Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Start app:

```bash
npm start
```

3. Build production bundle:

```bash
npm run build
```

## How to Update Question Bank

### Option A: Automated (Recommended)
This repo includes a GitHub Action `scraper.yml` that runs **automatically every 4 months**.
To trigger it manually:
1. Go to **Actions** tab in GitHub.
2. Select **Automate Scraper** workflow.
3. Click **Run workflow**.
4. Wait for it to finish -> It will create a Pull Request with new questions.
5. Merge the PR.

### Option B: Manual (Local)
1. Install dependencies:
   ```bash
   pip install -r scraper/requirements.txt
   ```
2. Run scraper:
   ```bash
   python scraper/scrape_gateoverflow.py
   ```
3. Merge & Validate:
   ```bash
   python scraper/merge_questions.py
   ```
   *(This automatically cleans data and removes duplicates)*
