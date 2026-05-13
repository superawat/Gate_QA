"""Shared configuration for the offline aptitude ingestion pipeline."""

from __future__ import annotations

import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
PDF_DIR = ROOT_DIR / "aptitude-ssc"
ARTIFACT_DIR = ROOT_DIR / "artifacts" / "aptitude-pipeline"
RAW_PAGE_DIR = ARTIFACT_DIR / "raw-pages"
OCR_OUTPUT_DIR = ARTIFACT_DIR / "ocr-output"
METADATA_DIR = ARTIFACT_DIR / "metadata"
NORMALIZED_DIR = ARTIFACT_DIR / "normalized"
REVIEW_DIR = ROOT_DIR / "artifacts" / "review"
PUBLIC_DIR = ROOT_DIR / "public"
LEGACY_PUBLIC_OUTPUT = PUBLIC_DIR / "aptitude-questions.json"
APTITUDE_INDEX_OUTPUT = PUBLIC_DIR / "aptitude-search-index.json"
APTITUDE_DATA_DIR = PUBLIC_DIR / "data" / "aptitude"

UID_PREFIX_BY_SUBJECT = {
    "English": "APT-ENG",
    "Mathematics": "APT-MAT",
    "Reasoning": "APT-RSN",
}

TAXONOMY = {
    "English": [
        "Spot the Error",
        "Sentence Improvement",
        "Narration",
        "Active Passive",
        "Para Jumble",
        "Fill in the Blanks",
        "Cloze Test",
        "Comprehension",
        "One Word Substitution",
        "Idioms",
        "Synonyms",
        "Antonyms",
        "Spelling Check",
        "Homonyms",
        "Miscellaneous",
    ],
    "Mathematics": [
        "Number System",
        "HCF and LCM",
        "Simplification",
        "Trigonometry",
        "Height and Distance",
        "Mensuration",
        "Geometry",
        "Algebra",
        "Ratio and Proportion",
        "Partnership",
        "Mixture and Alligation",
        "Work and Time",
        "Pipe and Cistern",
        "Time, Speed and Distance",
        "Linear/Circular Race",
        "Boat and Stream",
        "Percentage",
        "Profit and Loss",
        "Discount",
        "Simple Interest",
        "Compound Interest",
        "Installment",
        "Average",
        "Data Interpretation",
        "Mean, Median & Mode",
        "Coordinate Geometry",
        "Probability",
    ],
    "Reasoning": [
        "Coding - Decoding",
        "Odd one out",
        "Analogy",
        "Word Arrangement",
        "Address",
        "Decision Making",
        "Order and Ranking",
        "Mathematical Operations",
        "Blood Relation",
        "Arithmetic Reasoning",
        "Calendar",
        "Word Formation",
        "Series",
        "Missing Number",
        "Statement And Conclusion",
        "Syllogism",
        "Inequality",
        "Directions",
        "Sitting Arrangement",
        "Puzzle",
        "Miscellaneous",
    ],
}

MAX_SUBTOPICS_PER_QUESTION = 1
IMAGE_ONLY_TEXT_THRESHOLD = 80

SOURCE_PDFS = {
    "Pinnacle SSC English For English Medium 7th Edition.pdf": "English",
    "SSC_English_7600_TCS_MCQ_chapter_wise_5th_edition_English_medium.pdf": "English",
    "SSC_English_7600_ebp_MCQ_with_detailed_explanation_chapter_wise.pdf": "English",
    "SSC_English_7600_ebp_MCQ_with_detailed_explaination_chapter_wise.pdf": "English",
    "Pinnacle SSC Maths 7th Edition in English.pdf": "Mathematics",
    "SSC_Maths_6800_ebp_MCQ_book_2026_eduquity_based_new_pattern_chapterwise.pdf": "Mathematics",
    "Pinnacle SSC Reasoning 7th Edition in English.pdf": "Reasoning",
    "SSC_Reasoning_7200_Chapter_wise_MCQs_with_Detailed_Explanations (2).pdf": "Reasoning",
    "SSC_Reasoning_7200_Chapter_wise_MCQs_with_Detailed_Explanations.pdf": "Reasoning",
    "SSC_CGL_Tier_1_2026_4800_ebp_MCQ_Chapter_wise_with_detailed_explanation (2).pdf": None,
    "SSC_CGL_Tier_1_2026_48_ebp_Sets_Solved_Papers_with_Detailed_Explanation (2).pdf": None,
    "SSC_CGL_Tier_1_2026_48_ebp_Sets_Solved_Papers_with_Detailed_Explanation.pdf": None,
}

SOLVED_PAPER_PDFS = {
    "SSC_CGL_Tier_1_2026_48_ebp_Sets_Solved_Papers_with_Detailed_Explanation (2).pdf",
    "SSC_CGL_Tier_1_2026_48_ebp_Sets_Solved_Papers_with_Detailed_Explanation.pdf",
}

SANITIZE_PATTERNS = [
    r"SSC\s+(?:CGL|CHSL|MTS|CPO|Stenographer|Selection\s+Post)\s*(?:\(.*?\))?\s*(?:Tier[\s-]*[12I])?\s*(?:\d{1,2}[/.]\d{1,2}[/.]\d{2,4})?\s*(?:\(.*?\))?",
    r"Staff\s+Selection\s+Commission",
    r"Combined\s+Graduate\s+Level",
    r"Tier[\s-]*(?:I{1,2}|[12])",
    r"SET[\s-]*[A-Z0-9]+\.?",
    r"^\s*Q\.\s*\d+[\s.]*",
    r"\(\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\s*(?:to\s*\d{1,2}[/.]\d{1,2}[/.]\d{2,4})?\s*\)",
    r"\(\s*(?:Shift\s*-?\s*\d|\d+(?:st|nd|rd|th)\s+Shift|Morning|Evening)\s*\)",
    r"Pinnacle",
    r"www\.ssccglpinnacle\.com.*",
    r"Download\s+Pinnacle.*",
    r"Search\s+on\s+TG:.*",
]

DISPLAY_FORBIDDEN_RE = re.compile(
    r"SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]|Q\s*\.\s*\d+\.|\[\[PAGE:|Direction\s*:-|General\s+Awareness",
    re.IGNORECASE,
)

INVISIBLE_TEXT_RE = re.compile(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069\u200b\ufeff]")

MONTHS = {
    "january": "01",
    "february": "02",
    "march": "03",
    "april": "04",
    "may": "05",
    "june": "06",
    "july": "07",
    "august": "08",
    "september": "09",
    "october": "10",
    "november": "11",
    "december": "12",
}


def ensure_dirs() -> None:
    for directory in [
        ARTIFACT_DIR,
        RAW_PAGE_DIR,
        OCR_OUTPUT_DIR,
        METADATA_DIR,
        NORMALIZED_DIR,
        REVIEW_DIR,
    ]:
        directory.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    value = value.strip().lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def safe_stem(filename: str) -> str:
    stem = Path(filename).stem
    return re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("_")


def clean_invisible(value: str) -> str:
    return INVISIBLE_TEXT_RE.sub("", value or "")
