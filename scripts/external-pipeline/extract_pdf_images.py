#!/usr/bin/env python3
"""
extract_pdf_images.py

Utility to extract embedded images and figures from ISRO examination PDFs
using PyMuPDF (fitz) and save them directly to the GateQA image directory:
    public/question-images/external/isro/

Usage:
    python scripts/external-pipeline/extract_pdf_images.py <path_to_pdf> --year <year>
Example:
    python scripts/external-pipeline/extract_pdf_images.py isro_2024_cs.pdf --year 2024
"""

import os
import sys
import argparse
import fitz  # PyMuPDF
import json

def extract_images(pdf_path: str, year: int, output_dir: str):
    if not os.path.exists(pdf_path):
        print(f"[ERROR] PDF file not found: {pdf_path}")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    print(f"[INFO] Opened PDF: {pdf_path} ({len(doc)} pages)")

    extracted_images = []
    image_count = 0

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        image_list = page.get_images(full=True)
        page_num = page_idx + 1

        for img_idx, img_info in enumerate(image_list):
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]

            # Filter out tiny icons / watermark artifacts (e.g. < 50x50 pixels)
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)
            if width < 50 or height < 50:
                continue

            filename = f"isro_{year}_p{page_num:02d}_img{img_idx+1:02d}.{image_ext}"
            filepath = os.path.join(output_dir, filename)

            with open(filepath, "wb") as f:
                f.write(image_bytes)

            image_count += 1
            record = {
                "page": page_num,
                "filename": filename,
                "public_path": f"/question-images/external/isro/{filename}",
                "dimensions": f"{width}x{height}",
                "format": image_ext
            }
            extracted_images.append(record)
            print(f"  [+] Page {page_num:02d}: Extracted {filename} ({width}x{height})")

    print(f"\n[SUCCESS] Extracted {image_count} diagram figures to {output_dir}")
    
    # Save manifest for reference
    manifest_path = os.path.join(output_dir, f"extracted_manifest_{year}.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(extracted_images, f, indent=2)
    print(f"[INFO] Manifest saved to {manifest_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract figures from ISRO PDF papers")
    parser.add_argument("pdf_path", help="Path to input ISRO PDF")
    parser.add_argument("--year", type=int, default=2024, help="Exam year (default: 2024)")
    parser.add_argument(
        "--output_dir",
        default=os.path.join("public", "question-images", "external", "isro"),
        help="Target output directory"
    )
    args = parser.parse_args()

    extract_images(args.pdf_path, args.year, args.output_dir)
