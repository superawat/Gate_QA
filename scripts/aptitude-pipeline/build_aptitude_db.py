"""Deduplicate parsed aptitude questions and assign stable APT UIDs."""

from __future__ import annotations

import csv
import hashlib
import html
import json
import re
import shutil
import sys
from collections import Counter, defaultdict

from config import (
    APTITUDE_DATA_DIR,
    APTITUDE_INDEX_OUTPUT,
    ARTIFACT_DIR,
    DISPLAY_FORBIDDEN_RE,
    LEGACY_PUBLIC_OUTPUT,
    PUBLIC_DIR,
    REVIEW_DIR,
    TAXONOMY,
    UID_PREFIX_BY_SUBJECT,
    ensure_dirs,
    slugify,
)

sys.stdout.reconfigure(encoding="utf-8")


def strip_html(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]*>", " ", value or ""))


def dedupe_key(question_html: str) -> str:
    text = strip_html(question_html).lower()
    text = re.sub(r"[^a-z0-9]+", "", text)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def source_list(value):
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    if isinstance(value, dict):
        return [value]
    return []


def is_bossxcode_source(row: dict) -> bool:
    return any(source.get("sourceKind") == "bossxcode-web" for source in source_list(row.get("_source")))


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


def find_suspicious(row: dict) -> list[str]:
    reasons = []
    if len(row.get("options") or []) != 4:
        reasons.append("option_count")
    elif not valid_options(row.get("options")):
        reasons.append("option_empty")
    if row.get("answer") not in {"A", "B", "C", "D"}:
        reasons.append("answer_missing")
    if DISPLAY_FORBIDDEN_RE.search(row.get("questionHtml") or ""):
        reasons.append("display_forbidden_token")
    if not source_list(row.get("_source")):
        reasons.append("source_missing")
    return reasons


OPTION_LIST_RE = re.compile(r"<ol\b[\s\S]*?</ol>", re.IGNORECASE)
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


def compact_plain_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


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


def sanitize_final_row(row: dict) -> dict:
    if is_bossxcode_source(row):
        return row

    repair_math = row.get("subject") == "Mathematics"
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
    if row.get("subject") != "Mathematics":
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
        "x": preview[:180],
        "sh": shard_relative_path(row),
    }


def main() -> None:
    ensure_dirs()
    parsed_path = ARTIFACT_DIR / "parsed-questions.json"
    if not parsed_path.exists():
        raise SystemExit("Run parse_questions.py first.")

    parsed = json.loads(parsed_path.read_text(encoding="utf-8"))
    deduped = {}
    duplicate_count = 0
    skipped_empty_option_count = 0

    for row in parsed:
        subject = row.get("subject")
        subtopic = row.get("subtopic")
        if subject not in TAXONOMY or subtopic not in TAXONOMY[subject]:
            continue
        if not valid_options(row.get("options")):
            skipped_empty_option_count += 1
            continue
        key = dedupe_key(row.get("questionHtml") or "")
        if key in deduped:
            duplicate_count += 1
            deduped[key]["_source"] = merge_source(deduped[key].get("_source"), row.get("_source"))
            continue
        deduped[key] = dict(row)

    rows_by_subject = defaultdict(list)
    for row in deduped.values():
        rows_by_subject[row["subject"]].append(row)

    final_rows = []
    for subject in ["English", "Mathematics", "Reasoning"]:
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
            final_rows.append(
                {
                    "uid": f"{prefix}-{index:04d}",
                    "questionHtml": row["questionHtml"],
                    "options": row["options"],
                    "answer": row["answer"],
                    "type": "MCQ",
                    "subject": subject,
                    "subtopic": row["subtopic"],
                    "year": None,
                    "_source": row["_source"],
                }
            )

    corrupt_math_rows = []
    sanitized_rows = []
    for row in final_rows:
        sanitized_row = sanitize_final_row(row)
        corruption_reasons = [] if is_bossxcode_source(sanitized_row) else math_corruption_reasons(sanitized_row)
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

    if any(DISPLAY_FORBIDDEN_RE.search(row["questionHtml"]) for row in final_rows):
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
            for subject in ["English", "Mathematics", "Reasoning"]
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
        f"- Total questions: {len(final_rows)}",
        f"- Deduped duplicates removed: {duplicate_count}",
        f"- Empty-option rows skipped: {skipped_empty_option_count}",
        f"- Corrupt math rows filtered: {len(corrupt_math_rows)}",
        f"- Suspicious rows: {len(suspicious_rows)}",
        "",
        "## By Subject",
        "",
    ]
    for subject, count in sorted(subject_counts.items()):
        coverage_lines.append(f"- {subject}: {count}")
    coverage_lines.extend(["", "## By Subtopic", ""])
    for subject in ["English", "Mathematics", "Reasoning"]:
        for subtopic in TAXONOMY[subject]:
            coverage_lines.append(f"- {subject} / {subtopic}: {coverage.get((subject, subtopic), 0)}")

    (REVIEW_DIR / "aptitude-coverage.md").write_text("\n".join(coverage_lines) + "\n", encoding="utf-8")

    print(f"[build_aptitude_db] wrote {APTITUDE_INDEX_OUTPUT} ({len(final_rows)} questions, {len(rows_by_shard)} shards)")
    print("[build_aptitude_db] coverage by subject:")
    for subject, count in sorted(subject_counts.items()):
        print(f"  {subject}: {count}")
    print("[build_aptitude_db] source distribution:")
    for (exam_name, tier), count in sorted(source_distribution.items()):
        print(f"  {exam_name} tier {tier}: {count}")


if __name__ == "__main__":
    main()
