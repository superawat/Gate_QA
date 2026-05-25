"""Deduplicate parsed aptitude questions and assign stable APT UIDs."""

from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime, timezone

from config import (
    APTITUDE_DATA_DIR,
    APTITUDE_INDEX_OUTPUT,
    ARTIFACT_DIR,
    DISPLAY_FORBIDDEN_RE,
    LEGACY_PUBLIC_OUTPUT,
    PUBLIC_DIR,
    REVIEW_DIR,
    ROOT_DIR,
    TAXONOMY,
    UID_PREFIX_BY_SUBJECT,
    ensure_dirs,
    slugify,
)
from remaps import apply_remap_rules

sys.stdout.reconfigure(encoding="utf-8")


def strip_html(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]*>", " ", value or ""))


def compact_plain_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def dedupe_key(question_html: str) -> str:
    text = unicodedata.normalize("NFKC", strip_html(question_html)).lower()
    text = re.sub(r"[^a-z0-9]+", "", text)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def source_list(value):
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    if isinstance(value, dict):
        return [value]
    return []


def is_aptitude_source(row: dict) -> bool:
    return any(source.get("sourceKind") == "aptitude-web" for source in source_list(row.get("_source")))


def has_useful_source_metadata(row: dict) -> bool:
    return any(
        source.get("sourceKind")
        and (
            source.get("pageUrl")
            or source.get("sourceId")
            or source.get("examName")
            or source.get("paperTitle")
        )
        for source in source_list(row.get("_source"))
    )


def normalize_subject(value: str) -> str:
    subject = (value or "").strip()
    if subject in {"Mathematics", "Math", "Maths", "Quantitative", "Quantitative Aptitude"}:
        return "Quant"
    return subject


def valid_options(value) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 4
        and all(isinstance(option, str) and option.strip() for option in value)
    )


def merge_source(existing, incoming):
    merged = []
    seen = set()
    for source in [*source_list(existing), *source_list(incoming)]:
        token = json.dumps(source, sort_keys=True, ensure_ascii=False)
        if token in seen:
            continue
        seen.add(token)
        merged.append(source)
    return merged[0] if len(merged) == 1 else merged


def normalize_year(value):
    try:
        if value is None or value == "":
            return None
        year = int(value)
    except (TypeError, ValueError):
        return None
    return year if 1900 <= year <= 2100 else None


def clean_aptitude_title(value: str) -> str:
    title = compact_plain_text(str(value or ""))
    replacements = [
        r"\bDescription\b.*$",
        r"\bOpen\s+Test\s*\(New\s+Tab\)\b.*$",
        r"\bOpen\b\s*$",
        r"\bTotal\s*papers\s*:\s*\d+.*$",
        r"\bTotal\s*Tests?\s*:\s*\d+.*$",
        r"\bQuestions?\s*:\s*\d+.*$",
        r"Tests?\s*:\s*\d+.*$",
        r"Series\s*:\s*\d+.*$",
        r"Price\s*:\s*\d+.*$",
        r"\bQ\s*:\s*\d+.*$",
        r"\b(?:Mock|Sectional|Chapter|PYP)\s*:\s*\d+.*$",
    ]
    for pattern in replacements:
        title = re.sub(pattern, " ", title, flags=re.IGNORECASE)
    title = re.sub(r"\s+:$", "", title)
    title = compact_plain_text(title)
    return title or compact_plain_text(str(value or ""))


STALE_APTITUDE_SOURCE_LABELS = {"", "aptitude", "aptitude web", "aptitudebank", "bossxcode", "boss xcode"}


def normalize_aptitude_source(source: dict) -> dict:
    if source.get("sourceKind") != "aptitude-web":
        return source
    exam_body = clean_aptitude_title(source.get("examBody") or "")
    exam_name = clean_aptitude_title(source.get("examName") or "")
    if exam_body.lower() in STALE_APTITUDE_SOURCE_LABELS:
        exam_body = "Unknown"
    if exam_name.lower() in STALE_APTITUDE_SOURCE_LABELS:
        exam_name = clean_aptitude_title(source.get("paperTitle") or source.get("testSeries") or "Unknown Test Series")
    normalized = {
        **source,
        "sourceKind": "aptitude-web",
        "sourceProvider": "AptitudeBank",
        "examBody": exam_body,
        "examName": exam_name,
        "testSeries": clean_aptitude_title(source.get("testSeries") or ""),
        "paperTitle": clean_aptitude_title(source.get("paperTitle") or ""),
        "product": clean_aptitude_title(source.get("product") or ""),
        "tier": clean_aptitude_title(source.get("tier") or ""),
        "testType": clean_aptitude_title(source.get("testType") or ""),
    }
    normalized_year = normalize_year(source.get("year"))
    if normalized_year is not None:
        normalized["year"] = normalized_year
    return normalized


def normalize_sources(value):
    sources = [normalize_aptitude_source(source) for source in source_list(value)]
    if not sources:
        return value
    return sources[0] if len(sources) == 1 else sources


def row_text_with_options(row: dict) -> str:
    return compact_plain_text(
        f"{strip_html(row.get('questionHtml') or '')} {' '.join(str(option) for option in row.get('options') or [])}"
    )


def source_text(row: dict) -> str:
    values = []
    for source in source_list(row.get("_source")):
        values.extend(
            str(source.get(key) or "")
            for key in ["examBody", "examName", "testSeries", "paperTitle", "product", "tier", "testType", "topic"]
        )
    return compact_plain_text(" ".join(values))


def run_shared_intake_classifier(parsed_path) -> tuple[list[dict], dict]:
    classifier_script = ROOT_DIR / "scripts" / "aptitude-pipeline" / "aptitude-intake-classifier.mjs"
    temp_output = ARTIFACT_DIR / ".aptitude-intake-classifier-output.json"
    try:
        completed = subprocess.run(
            [
                "node",
                str(classifier_script),
                "--input",
                str(parsed_path),
                "--output",
                str(temp_output),
            ],
            cwd=ROOT_DIR,
            text=True,
            capture_output=True,
            check=False,
        )
        if completed.returncode != 0:
            details = (completed.stderr or completed.stdout or "").strip()
            raise RuntimeError(f"Shared AptitudeBank intake classifier failed: {details}")
        payload = json.loads(temp_output.read_text(encoding="utf-8"))
    finally:
        temp_output.unlink(missing_ok=True)

    attempted_rows = payload.get("attempted")
    if not isinstance(attempted_rows, list):
        raise RuntimeError("Shared AptitudeBank intake classifier did not return attempted rows.")
    return attempted_rows, payload


SYNTHETIC_MARKER_RE = re.compile(
    r"<!--\s*mock\s+2025\b|mock_2025_data|synthetic",
    re.IGNORECASE,
)
EXCLUDED_SOURCE_RE = re.compile(
    r"\b(?:G\.?\s*S\.?|General\s+Awareness|General\s+Studies|General\s+Science|Current\s+Affairs|Hindi)\b",
    re.IGNORECASE,
)
FULL_LENGTH_MOCK_RE = re.compile(r"\bMock\s+Tests?\s*\(\s*Full\s+Length\s*\)|\bFull\s+Length\b", re.IGNORECASE)
BROAD_LOW_SIGNAL_RE = re.compile(
    r"\b(?:Mock\s+Tests?\s*\(\s*Full\s+Length\s*\)|Full\s+Mock|Full\s+Length|Full\s+Test|Complete\s+Mock|Mega\s+Mock)\b",
    re.IGNORECASE,
)
INLINE_BASE64_IMAGE_RE = re.compile(r"<img\b[^>]+src=[\"']data:image/", re.IGNORECASE)
ENGLISH_TASK_RE = re.compile(
    r"\b(?:active(?:\s*/\s*|\s+)passive|passive voice|active voice|sentence improvement|substitute|"
    r"spot.*error|grammatical error|segment.*contains.*error|cloze test|comprehension|according to the passage|"
    r"idiom|synonym|antonym|spelling|misspelt|misspelled|one[- ]word|one which can be substituted|"
    r"group of words given|para jumble|jumbled|narration|direct speech|indirect speech)\b",
    re.IGNORECASE,
)
QUANT_TASK_RE = re.compile(
    r"\b(?:simplify|evaluate|hcf|lcm|sin|cos|tan|cosec|sec|cot|trigonometry|height of|speed|train|"
    r"km/h|profit|loss|gain|cost price|selling price|marked price|discount|percentage|per cent|ratio|proportion|"
    r"average|simple interest|compound interest|pipe|cistern|boat|stream|workman|complete.*days|circle|triangle|"
    r"area|volume|radius|diameter|perimeter|equation|algebra|polynomial|bar[ -]?graph|pie[- ]chart|table)\b|%",
    re.IGNORECASE,
)
REASONING_TASK_RE = re.compile(
    r"\b(?:code language|coded as|coding|decoding|syllogism|blood relation|letter[- ]cluster|number series|"
    r"comes next|odd one out|analogy|sitting arrangement|facing north|facing south|immediate left|immediate right|"
    r"rank|ranking|statement.*conclusion|mathematical operations?)\b",
    re.IGNORECASE,
)
GENERAL_AWARENESS_STEM_RE = re.compile(
    r"^(?:who|which|what|when|where|in which|at which|as per|according to|with reference to)\b",
    re.IGNORECASE,
)
GENERAL_AWARENESS_TERMS_RE = re.compile(
    r"\b(?:article\s+\d+|constitution|directive principles|fundamental duties|parliament|supreme court|high court|"
    r"governor|chief minister|prime minister|minister|president|election commission|census|gdp|revenue deficit|"
    r"service tax|tax|brand finance|lic|rbi|sebi|insurance|bank|scheme|budget|state|union territory|district|"
    r"festival|dance|temple|fort|museum|archaeological|civilisation|chola|khilji|satyagraha|gandhi|ibn battuta|"
    r"book|novel|author|magazine|award|olympics?|cricketer|kho[- ]?kho|padma|unesco|w\.?h\.?o\.?|malaria|acid|element|"
    r"electron|atom|cell|fatty acids?|ecosystem|soil|climate|mountains?|hills?|river|agriculture|crop|bawris?|"
    r"pietra dura|marris college|one horned rhino)\b",
    re.IGNORECASE,
)


def is_full_length_mock_source(row: dict) -> bool:
    return FULL_LENGTH_MOCK_RE.search(source_text(row)) is not None


def looks_like_general_awareness(row: dict) -> bool:
    text = row_text_with_options(row)
    if not text:
        return False
    if ENGLISH_TASK_RE.search(text) or QUANT_TASK_RE.search(text) or REASONING_TASK_RE.search(text):
        return False
    if GENERAL_AWARENESS_STEM_RE.search(text) and GENERAL_AWARENESS_TERMS_RE.search(text):
        return True
    return GENERAL_AWARENESS_TERMS_RE.search(text) is not None and is_full_length_mock_source(row)


def skip_reason(row: dict) -> str | None:
    combined = f"{row.get('questionHtml') or ''} {source_text(row)}"
    if SYNTHETIC_MARKER_RE.search(combined):
        return "synthetic_mock_marker"
    source = source_text(row)
    if EXCLUDED_SOURCE_RE.search(source):
        return "excluded_source_section"
    if BROAD_LOW_SIGNAL_RE.search(source):
        return "broad_low_signal_pack"
    if INLINE_BASE64_IMAGE_RE.search(row.get("questionHtml") or ""):
        return "inline_base64_image"
    if DISPLAY_FORBIDDEN_RE.search(strip_html(row.get("questionHtml") or "")):
        return "forbidden_display_token"
    if looks_like_general_awareness(row):
        return "general_awareness_leak"
    return None


def find_suspicious(row: dict) -> list[str]:
    reasons = []
    if len(row.get("options") or []) != 4:
        reasons.append("option_count")
    elif not valid_options(row.get("options")):
        reasons.append("option_empty")
    if row.get("answer") not in {"A", "B", "C", "D"}:
        reasons.append("answer_missing")
    if DISPLAY_FORBIDDEN_RE.search(strip_html(row.get("questionHtml") or "")):
        reasons.append("display_forbidden_token")
    if not source_list(row.get("_source")):
        reasons.append("source_missing")
    return reasons


OPTION_LIST_RE = re.compile(r"<ol\b[\s\S]*?</ol>", re.IGNORECASE)
DIRECTION_PREFIX_HTML_RE = re.compile(
    r"(<p[^>]*>\s*)(?:<(?:strong|b)[^>]*>\s*)?Direction\s*(?:</(?:strong|b)>)?\s*:-\s*",
    re.IGNORECASE,
)
BROKEN_MATH_OPERATOR_RE = re.compile(
    r"(?:^|\s)[+×÷*/]\s*(?:=|<|>)\s*[+×÷*/]?\s*\d"
    r"|\b(?:I|II|III)\.\s*[+×÷*/]\s*(?:=|<|>)",
    re.IGNORECASE,
)
LONG_GLUE_TOKEN_RE = re.compile(r"[A-Za-z]{24,}")
MID_GLUE_TOKEN_RE = re.compile(r"[A-Za-z]{18,}")
GLUE_FRAGMENT_RE = re.compile(
    r"the|and|of|to|is|in|for|with|from|that|which|what|find|then|than|before|after|amount|number|price|cost|rate|sold|sell",
    re.IGNORECASE,
)
PROVENANCE_REPLACEMENTS = [
    re.compile(
        r"\b(?:Graduate|Higher Secondary|Matriculation)(?:\s+Level)?\s+\d{1,2}/\d{1,2}/\d{4}\b",
        re.IGNORECASE,
    ),
    re.compile(r"\beduquity-based\s+pattern\s+\(ebp\)\s+Questions?\b", re.IGNORECASE),
    re.compile(r"\bDay:\s*\d+(?:st|nd|rd|th)?(?:\s*-\s*\d+(?:st|nd|rd|th)?)?", re.IGNORECASE),
    re.compile(r"\bQuestions\s+TCS\s+Previous\s+Year.*$", re.IGNORECASE),
]
MATH_TEXT_REPAIRS = [
    (re.compile(r"thenwhatisthevalueof", re.IGNORECASE), "then what is the value of"),
    (re.compile(r"thenwhatisthevalue", re.IGNORECASE), "then what is the value"),
    (re.compile(r"thenwhatisthe", re.IGNORECASE), "then what is the"),
    (re.compile(r"thenfindthevalueof", re.IGNORECASE), "then find the value of"),
    (re.compile(r"thenfindthevalue", re.IGNORECASE), "then find the value"),
    (re.compile(r"thenthevalueof", re.IGNORECASE), "then the value of"),
    (re.compile(r"whatisthevalueof", re.IGNORECASE), "what is the value of"),
    (re.compile(r"whatisthevalue", re.IGNORECASE), "what is the value"),
    (re.compile(r"Findthevalueof", re.IGNORECASE), "Find the value of"),
    (re.compile(r"Findthesumof", re.IGNORECASE), "Find the sum of"),
    (re.compile(r"Thefactorsof", re.IGNORECASE), "The factors of"),
    (re.compile(r"Theaverageof", re.IGNORECASE), "The average of"),
    (re.compile(r"averageof", re.IGNORECASE), "average of"),
    (re.compile(r"averageage", re.IGNORECASE), "average age"),
    (re.compile(r"thereare", re.IGNORECASE), "there are"),
    (re.compile(r"Inanoffice", re.IGNORECASE), "In an office"),
    (re.compile(r"Ifthenumbersofnotes", re.IGNORECASE), "If the numbers of notes"),
    (re.compile(r"numberofnotes", re.IGNORECASE), "number of notes"),
    (re.compile(r"amounttoRs", re.IGNORECASE), "amount to Rs."),
    (re.compile(r"newamountisRs", re.IGNORECASE), "new amount is Rs."),
    (re.compile(r"lessthanbefore", re.IGNORECASE), "less than before"),
    (re.compile(r"aftertwo", re.IGNORECASE), "after two"),
    (re.compile(r"\bcompoundandsimpleinterestonasum\b", re.IGNORECASE), "compound and simple interest on a sum"),
    (re.compile(r"\bsimpleinterestonasum\b", re.IGNORECASE), "simple interest on a sum"),
    (re.compile(r"cellphoneisavailablefor", re.IGNORECASE), "cellphone is available for"),
    (re.compile(r"Findtherateofinterestcharged", re.IGNORECASE), "Find the rate of interest charged"),
    (re.compile(r"\bisavailablefor\b", re.IGNORECASE), "is available for"),
    (re.compile(r"\bwiththeamounttobepaid\b", re.IGNORECASE), "with the amount to be paid"),
    (re.compile(r"\bamounttobepaid\b", re.IGNORECASE), "amount to be paid"),
    (re.compile(r"tobepaid", re.IGNORECASE), "to be paid"),
    (re.compile(r"forRs\.", re.IGNORECASE), "for Rs."),
    (re.compile(r"withRs\.", re.IGNORECASE), "with Rs."),
    (re.compile(r"\bFindthe\b", re.IGNORECASE), "Find the"),
    (re.compile(r"\bWhatisthe\b", re.IGNORECASE), "What is the"),
    (re.compile(r"\bWhichofthefollowing\b", re.IGNORECASE), "Which of the following"),
    (re.compile(r"\btypeofnumberisobtained\b", re.IGNORECASE), "type of number is obtained"),
    (re.compile(r"\btogetherwith\b", re.IGNORECASE), "together with"),
    (re.compile(r"\bcashdownpayment\b", re.IGNORECASE), "cash down payment"),
    (re.compile(r"\byearperiod\b", re.IGNORECASE), "year period"),
    (re.compile(r"\brateofinterest\b", re.IGNORECASE), "rate of interest"),
    (re.compile(r"\binterestcharged\b", re.IGNORECASE), "interest charged"),
    (re.compile(r"\bthevalueof\b", re.IGNORECASE), "the value of"),
    (re.compile(r"\bthesumof\b", re.IGNORECASE), "the sum of"),
    (re.compile(r"\bthefollowing\b", re.IGNORECASE), "the following"),
    (re.compile(r"\bdivisibleby\b", re.IGNORECASE), "divisible by"),
    (re.compile(r"\btomakethenumberdivisibleby\b", re.IGNORECASE), "to make the number divisible by"),
    (re.compile(r"forRs\s*(\d)", re.IGNORECASE), r"for Rs. \1"),
    (re.compile(r"\bRs\.\s*(\d)", re.IGNORECASE), r"Rs. \1"),
]

def clean_display_text(value: str, *, repair_math: bool = False) -> str:
    text = compact_plain_text(value)
    for pattern in PROVENANCE_REPLACEMENTS:
        text = pattern.sub(" ", text)
    if repair_math:
        text = re.sub(r"(\d)([A-Za-z]{2,})", r"\1 \2", text)
        text = re.sub(r"([A-Za-z]{2,})(\d)", r"\1 \2", text)
        for pattern, replacement in MATH_TEXT_REPAIRS:
            text = pattern.sub(replacement, text)
        text = re.sub(r"(\d)([A-Za-z]{2,})", r"\1 \2", text)
        text = re.sub(r"([A-Za-z]{2,})(\d)", r"\1 \2", text)
    text = re.sub(r"([.!?])(?=[A-Za-z])", r"\1 ", text)
    text = re.sub(r"([,;:])(?=[A-Za-z])", r"\1 ", text)
    return compact_plain_text(text)


def extract_question_text(question_html: str) -> str:
    stem_html = OPTION_LIST_RE.sub(" ", question_html or "")
    return compact_plain_text(strip_html(stem_html))


def to_question_html(question_text: str, options: list[str]) -> str:
    paragraphs = [f"<p>{html.escape(question_text)}</p>"] if question_text else []
    if options:
        items = "".join(f"<li>{html.escape(option)}</li>" for option in options)
        paragraphs.append(f'<ol style="list-style-type:upper-alpha">{items}</ol>')
    return "\n".join(paragraphs)


def clean_aptitude_display_html(question_html: str) -> str:
    cleaned = DIRECTION_PREFIX_HTML_RE.sub(r"\1", question_html or "", count=1)
    cleaned = re.sub(r"^\s*Direction\s*:-\s*", "", cleaned, flags=re.IGNORECASE)
    return cleaned


def sanitize_final_row(row: dict) -> dict:
    if is_aptitude_source(row):
        return {
            **row,
            "questionHtml": clean_aptitude_display_html(row.get("questionHtml") or ""),
        }

    repair_math = row.get("subject") in {"Quant", "Mathematics"}
    question_text = clean_display_text(extract_question_text(row.get("questionHtml") or ""), repair_math=repair_math)
    options = [
        clean_display_text(option, repair_math=repair_math)
        for option in row.get("options") or []
    ]
    return {
        **row,
        "questionHtml": to_question_html(question_text, options),
        "options": options,
    }


def math_corruption_reasons(row: dict) -> list[str]:
    if row.get("subject") not in {"Quant", "Mathematics"}:
        return []

    text = compact_plain_text(
        f"{strip_html(row.get('questionHtml') or '')} {' '.join(row.get('options') or [])}"
    )
    reasons = []
    if BROKEN_MATH_OPERATOR_RE.search(text):
        reasons.append("broken_operator_sequence")

    long_tokens = LONG_GLUE_TOKEN_RE.findall(text)
    mid_tokens = MID_GLUE_TOKEN_RE.findall(text)
    if long_tokens:
        reasons.append("glued_alpha_token")
    elif len(mid_tokens) >= 2:
        reasons.append("multiple_glued_alpha_tokens")

    glued_phrase_tokens = []
    for token in re.findall(r"[A-Za-z]{10,}", text):
        fragments = {match.group(0).lower() for match in GLUE_FRAGMENT_RE.finditer(token)}
        if (len(token) >= 16 and fragments) or (len(token) >= 12 and len(fragments) >= 2):
            glued_phrase_tokens.append(token)
    if not any(reason.endswith("glued_alpha_token") for reason in reasons):
        severe_glued_tokens = [token for token in glued_phrase_tokens if len(token) >= 20]
        if severe_glued_tokens or len(glued_phrase_tokens) >= 2:
            reasons.append("unrepaired_glued_phrase")

    return reasons


def shard_relative_path(row: dict) -> str:
    subject_slug = slugify(row.get("subject") or "unknown")
    subtopic_slug = slugify(row.get("subtopic") or "miscellaneous")
    return f"data/aptitude/{subject_slug}/{subtopic_slug}.json"


def build_index_row(row: dict) -> dict:
    preview = re.sub(r"\s+", " ", strip_html(row.get("questionHtml") or "")).strip()
    return {
        "u": row["uid"],
        "t": row["type"],
        "s": row["subject"],
        "ss": slugify(row["subject"]),
        "st": row["subtopic"],
        "sts": slugify(row["subtopic"]),
        "y": row.get("year"),
        "x": preview[:180],
        "sh": shard_relative_path(row),
    }


def main() -> None:
    ensure_dirs()
    parsed_path = ARTIFACT_DIR / "parsed-questions.json"
    if not parsed_path.exists():
        raise SystemExit("Run npm run aptitude:scrape-aptitude first.")

    parsed_input = json.loads(parsed_path.read_text(encoding="utf-8"))
    if not isinstance(parsed_input, list):
        raise RuntimeError("Parsed aptitude input must be a JSON array.")

    parsed, shared_intake = run_shared_intake_classifier(parsed_path)
    shared_row_report = (shared_intake.get("report") or {}).get("rows") or {}
    shared_ignored_by_reason = shared_row_report.get("ignoredByReason") or {}
    total_input_rows = len(parsed_input)
    attempted_after_shared_policy_count = len(parsed)
    deduped = {}
    duplicate_count = 0
    attempted_before_dedupe_count = 0
    ignored_counts = Counter(shared_ignored_by_reason)
    ignored_samples = []
    skipped_content_counts = Counter()

    for sample in shared_intake.get("ignoredSamples") or []:
        if len(ignored_samples) >= 40:
            break
        ignored_samples.append(
            {
                "stage": "shared_intake",
                "reason": sample.get("reason") or "",
                "subject": sample.get("subject") or "",
                "subtopic": sample.get("subtopic") or "",
                "source": sample.get("source") or "",
                "preview": sample.get("preview") or "",
            }
        )

    def record_ignored(reason: str, row: dict, index: int) -> None:
        ignored_counts[reason] += 1
        if len(ignored_samples) >= 40:
            return
        ignored_samples.append(
            {
                "stage": "build",
                "rowIndex": index,
                "reason": reason,
                "subject": row.get("subject") or "",
                "subtopic": row.get("subtopic") or "",
                "source": source_text(row)[:240],
                "preview": strip_html(row.get("questionHtml") or "")[:240],
            }
        )

    for row_index, row in enumerate(parsed, start=1):
        subject = normalize_subject(row.get("subject"))
        row = {**row, "subject": subject}
        reason = skip_reason(row)
        if reason:
            skipped_content_counts[reason] += 1
            record_ignored(reason, row, row_index)
            continue
        if DISPLAY_FORBIDDEN_RE.search(strip_html(row.get("questionHtml") or "")):
            record_ignored("forbidden_display_token", row, row_index)
            continue
        apply_remap_rules(row)
        subject = row.get("subject")
        subtopic = row.get("subtopic")
        if subject not in TAXONOMY:
            record_ignored("unsupported_subject", row, row_index)
            continue
        if subtopic not in TAXONOMY[subject]:
            record_ignored("unsupported_taxonomy", row, row_index)
            continue
        if not valid_options(row.get("options")):
            record_ignored("invalid_options", row, row_index)
            continue
        if row.get("answer") not in {"A", "B", "C", "D"}:
            record_ignored("invalid_answer", row, row_index)
            continue
        if not has_useful_source_metadata(row):
            record_ignored("missing_source_metadata", row, row_index)
            continue
        attempted_before_dedupe_count += 1
        key = dedupe_key(row.get("questionHtml") or "")
        if key in deduped:
            duplicate_count += 1
            record_ignored("duplicate_question", row, row_index)
            if is_aptitude_source(row) and not is_aptitude_source(deduped[key]):
                row["_source"] = merge_source(deduped[key].get("_source"), row.get("_source"))
                deduped[key] = dict(row)
                continue
            deduped[key]["_source"] = merge_source(deduped[key].get("_source"), row.get("_source"))
            deduped[key]["year"] = deduped[key].get("year") or row.get("year")
            continue
        deduped[key] = dict(row)

    rows_by_subject = defaultdict(list)
    for row in deduped.values():
        rows_by_subject[row["subject"]].append(row)

    final_rows = []
    for subject in ["English", "Quant", "Reasoning"]:
        subtopic_order = {label: index for index, label in enumerate(TAXONOMY[subject])}
        rows = sorted(
            rows_by_subject.get(subject, []),
            key=lambda item: (
                subtopic_order.get(item.get("subtopic") or "", len(subtopic_order)),
                source_list(item.get("_source"))[0].get("examDate") or "",
                int(source_list(item.get("_source"))[0].get("originalQNum") or 0),
                strip_html(item.get("questionHtml") or ""),
            ),
        )
        prefix = UID_PREFIX_BY_SUBJECT[subject]
        for index, row in enumerate(rows, start=1):
            first_source = source_list(row.get("_source"))[0] if source_list(row.get("_source")) else {}
            final_rows.append(
                {
                    "uid": f"{prefix}-{index:04d}",
                    "questionHtml": row["questionHtml"],
                    "options": row["options"],
                    "answer": row["answer"],
                    "type": "MCQ",
                    "subject": subject,
                    "subtopic": row["subtopic"],
                    "year": normalize_year(row.get("year") or first_source.get("year")),
                    "_source": normalize_sources(row["_source"]),
                }
            )

    corrupt_math_rows = []
    sanitized_rows = []
    for row in final_rows:
        sanitized_row = sanitize_final_row(row)
        corruption_reasons = [] if is_aptitude_source(sanitized_row) else math_corruption_reasons(sanitized_row)
        if corruption_reasons:
            corrupt_math_rows.append(
                {
                    "uid": sanitized_row.get("uid", ""),
                    "subject": sanitized_row.get("subject", ""),
                    "subtopic": sanitized_row.get("subtopic", ""),
                    "reasons": "|".join(corruption_reasons),
                    "preview": strip_html(sanitized_row.get("questionHtml") or "")[:260],
                }
            )
            continue
        sanitized_rows.append(sanitized_row)
    final_rows = sanitized_rows
    if corrupt_math_rows:
        ignored_counts["corrupt_math"] += len(corrupt_math_rows)

    suspicious_rows = []
    for row in final_rows:
        reasons = find_suspicious(row)
        if reasons:
            suspicious_rows.append(
                {
                    "uid": row.get("uid", ""),
                    "subject": row.get("subject", ""),
                    "subtopic": row.get("subtopic", ""),
                    "reasons": "|".join(reasons),
                    "preview": strip_html(row.get("questionHtml") or "")[:240],
                }
            )

    if any(DISPLAY_FORBIDDEN_RE.search(strip_html(row["questionHtml"])) for row in final_rows):
        raise RuntimeError("Final display grep guard failed for questionHtml.")

    coverage = Counter((row["subject"], row["subtopic"]) for row in final_rows)
    subject_counts = Counter(row["subject"] for row in final_rows)
    source_distribution = Counter()
    for row in final_rows:
        for source in source_list(row.get("_source")):
            source_distribution[(source.get("examName") or "Unknown", source.get("tier") or "Unknown")] += 1

    if APTITUDE_DATA_DIR.exists():
        shutil.rmtree(APTITUDE_DATA_DIR)
    APTITUDE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if LEGACY_PUBLIC_OUTPUT.exists():
        LEGACY_PUBLIC_OUTPUT.unlink()

    rows_by_shard = defaultdict(list)
    for row in final_rows:
        rows_by_shard[shard_relative_path(row)].append(row)

    for relative_shard, shard_rows in sorted(rows_by_shard.items()):
        shard_path = PUBLIC_DIR / relative_shard
        shard_path.parent.mkdir(parents=True, exist_ok=True)
        shard_path.write_text(
            json.dumps(shard_rows, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    index_payload = {
        "version": 1,
        "questionCount": len(final_rows),
        "shardCount": len(rows_by_shard),
        "subjects": [
            {
                "slug": slugify(subject),
                "label": subject,
                "count": subject_counts.get(subject, 0),
            }
            for subject in ["English", "Quant", "Reasoning"]
            if subject_counts.get(subject, 0) > 0
        ],
        "questions": [build_index_row(row) for row in final_rows],
    }
    APTITUDE_INDEX_OUTPUT.write_text(
        json.dumps(index_payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    suspicious_path = REVIEW_DIR / "aptitude-suspicious-lines.csv"
    with suspicious_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["uid", "subject", "subtopic", "reasons", "preview"])
        writer.writeheader()
        writer.writerows(suspicious_rows)

    corrupt_math_path = REVIEW_DIR / "aptitude-corrupt-math-filtered.csv"
    with corrupt_math_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["uid", "subject", "subtopic", "reasons", "preview"])
        writer.writeheader()
        writer.writerows(corrupt_math_rows)

    coverage_lines = [
        "# Aptitude Coverage",
        "",
        f"- Input rows: {total_input_rows}",
        f"- Attempted rows after shared policy: {attempted_after_shared_policy_count}",
        f"- Attempted rows before dedupe: {attempted_before_dedupe_count}",
        f"- Ignored rows: {sum(ignored_counts.values())}",
        f"- Total questions: {len(final_rows)}",
        f"- Deduped duplicates removed: {duplicate_count}",
        f"- Empty-option rows skipped: {ignored_counts.get('invalid_options', 0)}",
        f"- Corrupt math rows filtered: {len(corrupt_math_rows)}",
        f"- Content rows filtered: {sum(skipped_content_counts.values())}",
        f"- Suspicious rows: {len(suspicious_rows)}",
        "",
        "## Attempt / Ignore",
        "",
    ]
    for reason, count in sorted(ignored_counts.items()):
        coverage_lines.append(f"- {reason}: {count}")
    coverage_lines.extend([
        "",
        "## By Subject",
        "",
    ])
    for subject, count in sorted(subject_counts.items()):
        coverage_lines.append(f"- {subject}: {count}")
    coverage_lines.extend(["", "## By Subtopic", ""])
    for subject in ["English", "Quant", "Reasoning"]:
        for subtopic in TAXONOMY[subject]:
            coverage_lines.append(f"- {subject} / {subtopic}: {coverage.get((subject, subtopic), 0)}")

    (REVIEW_DIR / "aptitude-coverage.md").write_text("\n".join(coverage_lines) + "\n", encoding="utf-8")
    invalid_reasons = {
        "forbidden_display_token",
        "inline_base64_image",
        "unsupported_subject",
        "unsupported_taxonomy",
        "invalid_options",
        "invalid_answer",
        "missing_source_metadata",
        "corrupt_math",
    }
    intake_report = {
        "version": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "policy": "GATE-like value",
        "inputFile": str(parsed_path.relative_to(PUBLIC_DIR.parent)),
        "publicIndexFile": str(APTITUDE_INDEX_OUTPUT.relative_to(PUBLIC_DIR.parent)),
        "totalInputRows": total_input_rows,
        "sharedPolicy": {
            "attemptedRows": shared_intake.get("attemptedRows", attempted_after_shared_policy_count),
            "ignoredRows": shared_intake.get("ignoredRows", 0),
            "ignoredByReason": shared_ignored_by_reason,
        },
        "attemptedRowsAfterSharedPolicy": attempted_after_shared_policy_count,
        "attemptedRowsBeforeDedupe": attempted_before_dedupe_count,
        "ignoredRows": sum(ignored_counts.values()),
        "ignoredByReason": dict(sorted(ignored_counts.items())),
        "duplicateRows": duplicate_count,
        "invalidRows": sum(ignored_counts.get(reason, 0) for reason in invalid_reasons),
        "finalPublicRows": len(final_rows),
        "publicShardCount": len(rows_by_shard),
        "subjectCounts": dict(sorted(subject_counts.items())),
        "ignoredSamples": ignored_samples,
    }
    (REVIEW_DIR / "aptitude-intake-decision-report.json").write_text(
        json.dumps(intake_report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"[build_aptitude_db] wrote {APTITUDE_INDEX_OUTPUT} ({len(final_rows)} questions, {len(rows_by_shard)} shards)")
    if ignored_counts:
        print("[build_aptitude_db] ignored rows:")
        for reason, count in sorted(ignored_counts.items()):
            print(f"  {reason}: {count}")
    print("[build_aptitude_db] coverage by subject:")
    for subject, count in sorted(subject_counts.items()):
        print(f"  {subject}: {count}")
    print("[build_aptitude_db] source distribution:")
    for (exam_name, tier), count in sorted(source_distribution.items()):
        print(f"  {exam_name} tier {tier}: {count}")


if __name__ == "__main__":
    main()
