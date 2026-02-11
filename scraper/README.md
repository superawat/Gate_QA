# GateOverflow Question Scraper

## Prerequisites
- Python 3.9+
- Dependencies:

```bash
pip install -r requirements.txt
```

## Scraping Flow

1. Scrape question pages:

```bash
cd scraper
python scrape_gateoverflow.py
```

2. Merge and clean into app dataset:

```bash
python merge_questions.py
```

This updates `public/questions-filtered.json`, creates a timestamped backup, and removes duplicate links.

## Configure Which Papers to Scrape

Edit `TAGS_TO_SCRAPE` in `scrape_gateoverflow.py`:

```python
TAGS_TO_SCRAPE = [
    "gatecse-2024-set1",
    "gatecse-2024-set2",
    "gatecse2025-set1",
    "gatecse2025-set2",
]
```

## Notes
- The scraper is intentionally rate-limited with randomized delay.
- Image links remain hosted on GateOverflow.
- Math remains in HTML/LaTeX and is rendered by MathJax on the frontend.
