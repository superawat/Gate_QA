# Aptitude Pipeline

Ingestion for the standalone aptitude bank.

## Preferred structured web path

Use BossXCode as the source of truth for new Aptitude rows. The site is
password-gated, so keep credentials out of git and pass them at runtime.

```bash
cd C:\Users\himanshu\Desktop\GATE_QA
$env:BOSSXCODE_PASSWORD="..."
npm run aptitude:scrape-bossxcode
python scripts/aptitude-pipeline/build_aptitude_db.py
npm run qa:validate-aptitude
npm run qa:verify-aptitude
```

You can also use a browser session cookie instead of a password:

```bash
$env:BOSSXCODE_COOKIE="session=..."
npm run aptitude:scrape-bossxcode -- --max-pages 1000
```

The scraper writes `artifacts/aptitude-pipeline/parsed-questions.json`, then
`build_aptitude_db.py` dedupes, assigns stable `APT-*` UIDs, and rebuilds
`public/aptitude-search-index.json` plus `public/data/aptitude/**`.

Useful long-run controls:

```bash
# Resume a staged import, cap the paper count, and fail slow requests quickly.
npm run aptitude:scrape-bossxcode -- --resume --max-papers 150 --concurrency 8 --request-timeout 25000
```

`--resume` reuses existing BossXCode rows from the output JSON and skips
previously imported paper hashes. This is important because the source host can
be slow or intermittently reset long `/play` requests.

## Legacy PDF/OCR path

```bash
cd C:\Users\himanshu\Desktop\GATE_QA
python -m pip install -r scripts/aptitude-pipeline/requirements.txt
python scripts/aptitude-pipeline/extract_pages.py
python scripts/aptitude-pipeline/ocr_pages.py
python scripts/aptitude-pipeline/normalize_text.py
python scripts/aptitude-pipeline/parse_questions.py
python scripts/aptitude-pipeline/build_aptitude_db.py
npm run qa:validate-aptitude
```

The display payload is sharded under `public/data/aptitude/{subject}/{subtopic}.json`, with a compact `public/aptitude-search-index.json` for filtering. Each detail row keeps SSC provenance in `_source`, but the rendered `questionHtml` is sanitized and must not contain SSC/CGL/Tier/Set/Q-number markers.

The current parser path is optimized for the English solved-paper PDF in `aptitude-ssc/`; chapter-wise PDFs are mapped and normalized for future parser expansion.
