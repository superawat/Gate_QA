#!/usr/bin/env python3

"""Extract the tabular GATE DA 2026 answer key into JSON.

PyMuPDF is used when available in this environment, with PyPDF2 as a fallback.
"""

import json
import re
import sys
from pathlib import Path


def extract_text(pdf_path: Path) -> str:
    try:
        import fitz  # type: ignore

        document = fitz.open(str(pdf_path))
        return "\n".join(page.get_text("text") for page in document)
    except ImportError:
        from PyPDF2 import PdfReader  # type: ignore

        reader = PdfReader(str(pdf_path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)


def parse_number(value: str):
    value = value.strip()
    try:
        number = float(value)
        return int(number) if number.is_integer() else number
    except ValueError:
        return value


def parse_answer(question_type: str, key: str):
    key = re.sub(r"\s+", " ", key.strip())
    if question_type == "MCQ":
        return key, None
    if question_type == "MSQ":
        return [part.strip().upper() for part in key.split(";") if part.strip()], None

    parts = re.split(r"\s+to\s+", key, maxsplit=1, flags=re.IGNORECASE)
    lower = parse_number(parts[0])
    upper = parse_number(parts[1]) if len(parts) == 2 else lower
    if lower == upper:
        return lower, None
    return lower, {"lower": lower, "upper": upper}


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract-da-2026-answer-keys.py INPUT.pdf OUTPUT.json")

    pdf_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    text = extract_text(pdf_path)
    records = {}
    tokens = [line.strip() for line in text.splitlines() if line.strip()]
    for index in range(len(tokens) - 5):
        if not re.fullmatch(r"\d+", tokens[index]) or tokens[index + 1] != "8":
            continue
        number = int(tokens[index])
        if number < 1 or number > 65 or tokens[index + 2] not in {"MCQ", "MSQ", "NAT"}:
            continue
        question_type = tokens[index + 2]
        section = tokens[index + 3]
        key = tokens[index + 4]
        marks = tokens[index + 5]
        if section not in {"GA", "DA"} or marks not in {"1", "2"}:
            continue
        answer, tolerance = parse_answer(question_type, key)
        question_uid = f"da:2026:set1:main:q{number}"
        records[question_uid] = {
            "answer_uid": question_uid,
            "type": question_type,
            "answer": answer,
            "tolerance": tolerance,
            "marks": int(marks),
            "section": section,
            "source": {
                "kind": "official-answer-key-pdf",
                "source_file": str(pdf_path).replace("\\", "/"),
            },
        }

    if len(records) != 65:
        raise SystemExit(f"Expected 65 answer-key rows, extracted {len(records)}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(f"[extract-da-2026-answer-keys] Wrote {len(records)} answer keys to {output_path}")


if __name__ == "__main__":
    main()
