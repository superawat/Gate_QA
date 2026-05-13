"""Extract page text and page-level metadata from aptitude source PDFs."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import fitz

from config import (
    ARTIFACT_DIR,
    IMAGE_ONLY_TEXT_THRESHOLD,
    PDF_DIR,
    RAW_PAGE_DIR,
    SOURCE_PDFS,
    TAXONOMY,
    clean_invisible,
    ensure_dirs,
    safe_stem,
)

sys.stdout.reconfigure(encoding="utf-8")


CHAPTER_HINTS = {
    subject: [*subtopics]
    for subject, subtopics in TAXONOMY.items()
}
CHAPTER_HINTS["English"].append("Reading Comprehension")
CHAPTER_HINTS["Mathematics"].extend(["Ratio", "Proportion", "Time and Work"])
CHAPTER_HINTS["Reasoning"].extend(["Coding", "Direction"])


def infer_subject(filename: str, text: str, configured_subject: str | None) -> str | None:
    if configured_subject:
        return configured_subject

    lower = f"{filename}\n{text[:1200]}".lower()
    if "reasoning" in lower:
        return "Reasoning"
    if "quantitative aptitude" in lower or "math" in lower or "maths" in lower:
        return "Mathematics"
    if "english" in lower:
        return "English"
    return None


def infer_chapter(subject: str | None, text: str) -> str | None:
    if not subject:
        return None
    normalized = re.sub(r"\s+", " ", text[:1200]).strip().lower()
    for hint in CHAPTER_HINTS.get(subject, []):
        if hint.lower() in normalized:
            return hint
    return None


def infer_page_type(text: str) -> str:
    stripped = text.strip()
    if len(stripped) < IMAGE_ONLY_TEXT_THRESHOLD:
        return "image-only"
    if re.search(r"\bAnswer\s*Key\b", stripped, re.IGNORECASE):
        return "answer-key"
    return "questions"


def extract_pdf(pdf_path: Path, configured_subject: str | None) -> list[dict]:
    doc = fitz.open(pdf_path)
    filename = pdf_path.name
    raw_stem = safe_stem(filename)
    rows = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        text = clean_invisible(page.get_text("text") or "")
        subject = infer_subject(filename, text, configured_subject)
        chapter = infer_chapter(subject, text)
        page_type = infer_page_type(text)
        raw_path = RAW_PAGE_DIR / f"{raw_stem}_{page_index + 1:04d}.txt"
        raw_path.write_text(text, encoding="utf-8")

        rows.append(
            {
                "pdf": filename,
                "page": page_index + 1,
                "subject": subject,
                "chapter": chapter,
                "type": page_type,
                "textLength": len(text),
                "rawTextFile": str(raw_path.relative_to(ARTIFACT_DIR)),
                "imageCount": len(page.get_images()),
            }
        )

    doc.close()
    return rows


def main() -> None:
    ensure_dirs()
    if not PDF_DIR.exists():
        raise SystemExit(f"Missing source PDF directory: {PDF_DIR}")

    all_rows = []
    for filename, configured_subject in SOURCE_PDFS.items():
        pdf_path = PDF_DIR / filename
        if not pdf_path.exists():
            print(f"[extract_pages] skip missing: {filename}")
            continue
        print(f"[extract_pages] extracting {filename}")
        all_rows.extend(extract_pdf(pdf_path, configured_subject))

    output_path = ARTIFACT_DIR / "subject-map.json"
    output_path.write_text(json.dumps(all_rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[extract_pages] wrote {output_path} ({len(all_rows)} pages)")


if __name__ == "__main__":
    main()
