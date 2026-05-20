# Aptitude Pipeline

Ingestion for the standalone aptitude bank.

## Preferred structured web path

Use AptitudeBank as the source of truth for new Aptitude rows. The site is
password-gated, so keep credentials out of git and pass them at runtime. The
catalog scraper now scans all products and test types by default, then applies
the shared attempt/ignore classifier before downloading papers or writing
public artifacts.

```bash
cd C:\Users\himanshu\Desktop\GATE_QA
$env:APTITUDE_PASSWORD="..."
npm run aptitude:scrape-aptitude
python scripts/aptitude-pipeline/build_aptitude_db.py
npm run qa:validate-aptitude
npm run qa:verify-aptitude
```

You can also use a browser session cookie instead of a password:

```bash
$env:APTITUDE_COOKIE="session=..."
npm run aptitude:scrape-aptitude -- --max-pages 1000
```

The scraper writes `artifacts/aptitude-pipeline/parsed-questions.json`, then
`build_aptitude_db.py` dedupes, assigns stable `APT-*` UIDs, and rebuilds
`public/aptitude-search-index.json` plus `public/data/aptitude/**`.
Attempted and ignored counts are reported in
`artifacts/review/aptitude-aptitude-import-report.json` and
`artifacts/review/aptitude-intake-decision-report.json`.

Useful long-run controls:

```bash
# Resume a staged import for several hours with a polite gap between requests.
npm run aptitude:scrape-aptitude:long

# Or tune the same long-running loop manually.
npm run aptitude:scrape-aptitude -- --resume --max-runtime-minutes 180 --max-new-papers 500 --concurrency 2 --request-timeout 45000 --delay 1500 --checkpoint-every 10
```

`--resume` reuses existing AptitudeBank rows from the output JSON and skips
previously imported paper hashes. This is important because the source host can
be slow or intermittently reset long `/play` requests. Use `--delay` and lower
`--concurrency` when continuing large batches so the parser can sustain longer
runs without tripping host-side throttling.

Catalog discovery is persisted to `artifacts/aptitude-pipeline/aptitude-catalog.json`
when the selection options match. Use `--refresh-catalog` after changing product
or test-type filters, and use `--catalog <path>` for focused caches such as
chapter-wise-only runs. `--max-new-papers` caps newly downloaded papers; it does
not waste the batch on papers already present in the checkpoint.

Source metadata is web-source specific but exam-aware: `_source.sourceKind`
stays `aptitude-web`, `_source.sourceProvider` is `AptitudeBank`, while
`examBody`, `examName`, and `year` are inferred from catalog titles whenever
available.

The intake classifier attempts English, Quant, and Reasoning content with valid
options, answers, taxonomy mapping, and source metadata. It ignores GS/GK,
General Awareness, General Studies, General Science, Hindi, current affairs,
synthetic rows, duplicate parsed papers, unsupported taxonomy, invalid options,
and broad full-length packs before they enter public runtime output.

## Retired PDF/OCR path

The old local PDF/OCR intake was retired because AptitudeBank provides structured
question payloads with better metadata and lower parsing noise. Keep any source
PDFs outside the repo as a private archive if they are needed for audit work;
do not restore `aptitude-ssc/` or PDF/OCR intermediate outputs under this
project.

The display payload is sharded under `public/data/aptitude/{subject}/{subtopic}.json`, with a compact `public/aptitude-search-index.json` for filtering. The aptitude subject set is `English`, `Quant`, and `Reasoning`. Each detail row keeps source provenance in `_source`, but the rendered `questionHtml` is sanitized and must not contain SSC/CGL/Tier/Set/Q-number markers.
