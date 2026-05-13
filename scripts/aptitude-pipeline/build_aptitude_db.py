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

    coverage_lines = [
        "# Aptitude Coverage",
        "",
        f"- Total questions: {len(final_rows)}",
        f"- Deduped duplicates removed: {duplicate_count}",
        f"- Empty-option rows skipped: {skipped_empty_option_count}",
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
