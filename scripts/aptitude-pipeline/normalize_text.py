"""Normalize extracted text and parse SSC provenance sidecars."""

from __future__ import annotations

import json
import re
import sys
from datetime import date

from config import (
    ARTIFACT_DIR,
    METADATA_DIR,
    NORMALIZED_DIR,
    OCR_OUTPUT_DIR,
    RAW_PAGE_DIR,
    SANITIZE_PATTERNS,
    clean_invisible,
    ensure_dirs,
    safe_stem,
)

sys.stdout.reconfigure(encoding="utf-8")


EXAM_NAME_PATTERNS = [
    ("Selection Post", re.compile(r"Selection\s+Post", re.IGNORECASE)),
    ("Stenographer", re.compile(r"Stenographer", re.IGNORECASE)),
    ("CGL", re.compile(r"\b(?:CGL|Combined\s+Graduate\s+Level)\b", re.IGNORECASE)),
    ("CHSL", re.compile(r"\bCHSL\b", re.IGNORECASE)),
    ("MTS", re.compile(r"\bMTS\b", re.IGNORECASE)),
    ("CPO", re.compile(r"\bCPO\b", re.IGNORECASE)),
]

SET_HEADER_RE = re.compile(
    r"\bSSC\s+CGL\s+(?P<year>20\d{2})\s*"
    r"(?:Tier\s*-?\s*(?:I|1)\s*)?"
    r"(?P<date>\d{1,2}[/.]\d{1,2}[/.]\d{2,4})\s*"
    r"\(\s*(?:Shift\s*-?\s*)?(?P<shift>\d+)(?:st|nd|rd|th)?\s*Shift\s*\)",
    re.IGNORECASE,
)

QUESTION_MARKER_RE = re.compile(r"\bQ\.\s*(\d{1,3})\.\s*", re.IGNORECASE)


def parse_exam_date(text: str) -> str | None:
    match = re.search(r"(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})", text)
    if not match:
        return None
    day = int(match.group(1))
    month = int(match.group(2))
    year = int(match.group(3))
    if year < 100:
        year += 2000
    try:
        return date(year, month, day).isoformat()
    except ValueError:
        return None


def parse_shift(text: str) -> str | None:
    match = re.search(r"\bShift\s*-?\s*(\d+)\b", text, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r"\b(\d+)(?:st|nd|rd|th)\s+Shift\b", text, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r"\b(Morning|Evening)\b", text, re.IGNORECASE)
    if match:
        return match.group(1).title()
    return None


def parse_metadata(text: str, pdf_file: str, page: int) -> dict:
    source = {
        "examBody": "SSC" if re.search(r"\bSSC\b|Staff\s+Selection", text, re.IGNORECASE) else None,
        "examName": None,
        "tier": None,
        "set": None,
        "originalQNum": None,
        "examDate": parse_exam_date(text),
        "shift": parse_shift(text),
        "pdfFile": pdf_file,
        "pdfPage": page,
    }

    for exam_name, pattern in EXAM_NAME_PATTERNS:
        if pattern.search(text):
            source["examName"] = exam_name
            break

    tier_match = re.search(r"\bTier\s*-?\s*(I{1,2}|[12])\b", text, re.IGNORECASE)
    if tier_match:
        token = tier_match.group(1).upper()
        source["tier"] = 2 if token in {"II", "2"} else 1

    set_match = re.search(r"\bSet\s*-?\s*([A-D]|\d+)\b", text, re.IGNORECASE)
    if set_match:
        source["set"] = set_match.group(1).upper()

    q_match = re.search(r"^\s*Q\.\s*\(?\s*([0-9]+(?:\s*-\s*[0-9]+)?)", text, re.IGNORECASE | re.MULTILINE)
    if q_match:
        source["originalQNum"] = re.sub(r"\s+", "", q_match.group(1))

    return source


def sanitize_text(text: str) -> str:
    cleaned = clean_invisible(text)
    cleaned = SET_HEADER_RE.sub(
        lambda match: (
            f"\n[[APT_SET_HEADER year={match.group('year')} "
            f"date={match.group('date')} shift={match.group('shift')}]]\n"
        ),
        cleaned,
    )
    cleaned = QUESTION_MARKER_RE.sub(lambda match: f"\n[[APT_Q:{match.group(1)}]] ", cleaned)
    for pattern in SANITIZE_PATTERNS:
        cleaned = re.sub(pattern, " ", cleaned, flags=re.IGNORECASE | re.MULTILINE)
    cleaned = re.sub(r"\(([a-d])\)", lambda m: f"\n({m.group(1)}) ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"(?<!\()\b([a-d])\)", lambda m: f"\n({m.group(1)}) ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    return cleaned.strip()


def load_page_text(entry: dict) -> str:
    raw_file = RAW_PAGE_DIR / f"{safe_stem(entry['pdf'])}_{int(entry['page']):04d}.txt"
    if raw_file.exists():
        return raw_file.read_text(encoding="utf-8")
    ocr_file = OCR_OUTPUT_DIR / f"{safe_stem(entry['pdf'])}_{int(entry['page']):04d}.txt"
    if ocr_file.exists():
        return ocr_file.read_text(encoding="utf-8")
    return ""


def main() -> None:
    ensure_dirs()
    subject_map_path = ARTIFACT_DIR / "subject-map.json"
    if not subject_map_path.exists():
        raise SystemExit("Run extract_pages.py first.")

    subject_map = json.loads(subject_map_path.read_text(encoding="utf-8"))
    normalized_pages = []
    grouped_text: dict[tuple[str, str, str], list[str]] = {}

    for entry in subject_map:
        raw_text = load_page_text(entry)
        source = parse_metadata(raw_text, entry["pdf"], int(entry["page"]))
        metadata_path = METADATA_DIR / f"{safe_stem(entry['pdf'])}_{int(entry['page']):04d}.json"
        metadata_path.write_text(json.dumps(source, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        clean_text = sanitize_text(raw_text)
        normalized_pages.append({**entry, "text": clean_text, "_source": source})

        key = (
            entry["pdf"],
            entry.get("subject") or "Mixed",
            entry.get("chapter") or "Unknown",
        )
        grouped_text.setdefault(key, []).append(f"[[PAGE:{entry['page']}]]\n{clean_text}")

    (NORMALIZED_DIR / "all-pages.json").write_text(
        json.dumps(normalized_pages, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    for (pdf_file, subject, chapter), chunks in grouped_text.items():
        target_name = f"{safe_stem(pdf_file)}__{safe_stem(subject)}__{safe_stem(chapter)}.txt"
        (NORMALIZED_DIR / target_name).write_text("\n\n".join(chunks), encoding="utf-8")

    print(f"[normalize_text] wrote {len(normalized_pages)} normalized pages")


if __name__ == "__main__":
    main()
