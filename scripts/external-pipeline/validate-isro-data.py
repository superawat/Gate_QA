#!/usr/bin/env python3
"""
scripts/external-pipeline/validate-isro-data.py

Automated data integrity, schema, and image reference auditor
for all ISRO examination papers (2007–2025) in GateQA.
"""

import os
import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.getcwd()
DATA_ISRO = os.path.join(ROOT, "data", "isro")
PUBLIC_DATA_ISRO = os.path.join(ROOT, "public", "data", "isro")
IMAGES_DIR = os.path.join(ROOT, "public", "question-images", "external", "isro")

VALID_SUBJECTS = {
    "algorithms", "toc", "compiler", "os", "dbms", "cn", "coa",
    "digital-logic", "discrete-math", "engg-math", "general-aptitude", "other"
}

def validate_isro_store():
    print("==================================================")
    print("VALIDATING MASTER ISRO DATA STORE (2007–2025)")
    print("==================================================")

    all_path = os.path.join(DATA_ISRO, "isro-all.json")
    if not os.path.exists(all_path):
        print(f"Error: {all_path} does not exist!")
        sys.exit(1)

    with open(all_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Total questions loaded from isro-all.json: {len(questions)}")

    errors = []
    verified_images = 0
    missing_images = []

    for idx, q in enumerate(questions):
        uid = q.get("question_uid")

        # Identity
        if not uid or not uid.startswith("isro:cs:"):
            errors.append(f"#{idx+1}: invalid question_uid {uid}")
        if not q.get("exam_uid") or not q.get("exam_uid").startswith("isro-"):
            errors.append(f"#{idx+1}: invalid exam_uid {q.get('exam_uid')}")
        if q.get("exam") != "ISRO":
            errors.append(f"{uid}: exam must be ISRO")
        if q.get("paper_scope") != "external_exam":
            errors.append(f"{uid}: paper_scope must be external_exam")

        # Question & Type
        if not q.get("question", "").strip():
            errors.append(f"{uid}: empty question text")
        if q.get("type") not in ("MCQ", "MSQ", "NAT", "MTA"):
            errors.append(f"{uid}: invalid question type {q.get('type')}")

        # Options
        if q.get("type") in ("MCQ", "MSQ"):
            opts = q.get("options", [])
            if len(opts) < 2:
                errors.append(f"{uid}: expected at least 2 options, got {len(opts)}")
            for opt in opts:
                if not opt.get("label") or not opt.get("html"):
                    errors.append(f"{uid}: option missing label or html")

        # Answer
        if q.get("answer") is None or q.get("answer") == "":
            errors.append(f"{uid}: missing answer key")

        # Taxonomy
        if q.get("subject") not in VALID_SUBJECTS:
            errors.append(f"{uid}: unknown subject slug {q.get('subject')}")
        if q.get("subjectSlug") not in VALID_SUBJECTS:
            errors.append(f"{uid}: unknown subjectSlug {q.get('subjectSlug')}")

        # Image check
        img_refs = re.findall(r'/question-images/external/isro/([^\s"\'\\<>]+)', json.dumps(q))
        for ref in img_refs:
            disk_path = os.path.join(IMAGES_DIR, ref)
            if os.path.exists(disk_path):
                verified_images += 1
            else:
                missing_images.append((uid, ref))

    # Answers registry check
    ans_path = os.path.join(DATA_ISRO, "answers-isro.json")
    with open(ans_path, "r", encoding="utf-8") as f:
        ans_data = json.load(f)

    reg = ans_data.get("records_by_question_uid", {})
    missing_ans = [q["question_uid"] for q in questions if q["question_uid"] not in reg]

    print("\n--- Validation Results ---")
    print(f"Total Questions: {len(questions)}")
    print(f"Schema / Content Errors: {len(errors)}")
    print(f"Verified WebP Images: {verified_images}")
    print(f"Missing Images: {len(missing_images)}")
    print(f"Answers Registered: {len(reg)} (Missing: {len(missing_ans)})")

    if not errors and not missing_images and not missing_ans:
        print("\n🎉 ALL 1,070 ISRO QUESTIONS & ASSETS PASS 100% QUALITY GATES!")
    else:
        for e in errors[:10]:
            print(f"  [Error] {e}")
        for m in missing_images[:10]:
            print(f"  [Missing Image] {m}")
        sys.exit(1)

if __name__ == "__main__":
    validate_isro_store()
