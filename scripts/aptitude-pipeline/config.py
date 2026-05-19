"""Shared configuration for the offline aptitude ingestion pipeline."""

from __future__ import annotations

import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
ARTIFACT_DIR = ROOT_DIR / "artifacts" / "aptitude-pipeline"
REVIEW_DIR = ROOT_DIR / "artifacts" / "review"
PUBLIC_DIR = ROOT_DIR / "public"
LEGACY_PUBLIC_OUTPUT = PUBLIC_DIR / "aptitude-questions.json"
APTITUDE_INDEX_OUTPUT = PUBLIC_DIR / "aptitude-search-index.json"
APTITUDE_DATA_DIR = PUBLIC_DIR / "data" / "aptitude"

UID_PREFIX_BY_SUBJECT = {
    "English": "APT-ENG",
    "Quant": "APT-QNT",
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
    "Quant": [
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

DISPLAY_FORBIDDEN_RE = re.compile(
    r"SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]\b|Q\s*\.\s*\d+(?:\.|\s*(?:to|-))|\[\[PAGE:|Direction\s*:-|General\s+Awareness",
    re.IGNORECASE,
)


def ensure_dirs() -> None:
    for directory in [
        ARTIFACT_DIR,
        REVIEW_DIR,
    ]:
        directory.mkdir(parents=True, exist_ok=True)


def slugify(value: str) -> str:
    value = value.strip().lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")
