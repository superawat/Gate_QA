# Aptitude Pipeline

Offline ingestion for the standalone aptitude bank.

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
