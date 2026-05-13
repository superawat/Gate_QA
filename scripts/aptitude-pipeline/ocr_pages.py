"""OCR fallback for image-only aptitude pages."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

import fitz

from config import ARTIFACT_DIR, OCR_OUTPUT_DIR, PDF_DIR, ensure_dirs, safe_stem

sys.stdout.reconfigure(encoding="utf-8")


def main() -> None:
    ensure_dirs()
    subject_map_path = ARTIFACT_DIR / "subject-map.json"
    if not subject_map_path.exists():
        raise SystemExit("Run extract_pages.py first.")

    try:
        from paddleocr import PaddleOCR
    except Exception as error:
        print(f"[ocr_pages] PaddleOCR unavailable; skipping OCR fallback ({error}).")
        (ARTIFACT_DIR / "low-confidence.csv").write_text(
            "pdf,page,avg_confidence,status\n",
            encoding="utf-8",
        )
        return

    subject_map = json.loads(subject_map_path.read_text(encoding="utf-8"))
    image_pages = [entry for entry in subject_map if entry.get("type") == "image-only"]
    if not image_pages:
        print("[ocr_pages] no image-only pages")
        return

    ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    low_confidence_rows = []

    for entry in image_pages:
        pdf_path = PDF_DIR / entry["pdf"]
        doc = fitz.open(pdf_path)
        page_number = int(entry["page"])
        page = doc[page_number - 1]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image_path = OCR_OUTPUT_DIR / f"{safe_stem(entry['pdf'])}_{page_number:04d}.png"
        pix.save(image_path)
        doc.close()

        result = ocr.ocr(str(image_path), cls=True) or []
        lines = []
        confidences = []
        for block in result:
            for row in block or []:
                text = row[1][0] if len(row) > 1 else ""
                confidence = float(row[1][1]) if len(row) > 1 else 0.0
                if text:
                    lines.append(text)
                    confidences.append(confidence)

        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        text_path = OCR_OUTPUT_DIR / f"{safe_stem(entry['pdf'])}_{page_number:04d}.txt"
        text_path.write_text("\n".join(lines), encoding="utf-8")
        if avg_confidence < 0.7:
            low_confidence_rows.append(
                {
                    "pdf": entry["pdf"],
                    "page": page_number,
                    "avg_confidence": f"{avg_confidence:.4f}",
                    "status": "low_confidence",
                }
            )

    csv_path = ARTIFACT_DIR / "low-confidence.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["pdf", "page", "avg_confidence", "status"])
        writer.writeheader()
        writer.writerows(low_confidence_rows)
    print(f"[ocr_pages] wrote OCR text for {len(image_pages)} pages")


if __name__ == "__main__":
    main()
