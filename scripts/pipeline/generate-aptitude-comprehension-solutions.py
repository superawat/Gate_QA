"""
Assembly and verification script for Special Aptitude Reading Comprehension solutions.
Combines Parts 1-4, verifies all 237 questions, saves the chunk, and applies solutions to comprehension.json.
"""
import json
import os
import re
import sys

# Ensure current script dir is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from comprehension_solutions_part1 import SOLUTIONS_PART_1
from comprehension_solutions_part2 import SOLUTIONS_PART_2
from comprehension_solutions_part3 import SOLUTIONS_PART_3
from comprehension_solutions_part4 import SOLUTIONS_PART_4

def main():
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    shard_path = os.path.join(root, "public", "data", "aptitude", "english", "comprehension.json")
    chunk_dir = os.path.join(root, "data", "solutions", "chunks", "aptitude")
    os.makedirs(chunk_dir, exist_ok=True)
    out_chunk_path = os.path.join(chunk_dir, "chunk-apt-comprehension-01.json")

    with open(shard_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} questions from {shard_path}")

    # Combine all solution parts
    all_solutions = {}
    all_solutions.update(SOLUTIONS_PART_1)
    all_solutions.update(SOLUTIONS_PART_2)
    all_solutions.update(SOLUTIONS_PART_3)
    all_solutions.update(SOLUTIONS_PART_4)

    print(f"Total solutions authored across parts: {len(all_solutions)}")

    errors = []
    updated_count = 0

    for idx, q in enumerate(questions):
        uid = q["uid"]
        expected_ans = q["answer"]

        if uid not in all_solutions:
            errors.append(f"Missing solution for question [{idx}] {uid}")
            continue

        sol = all_solutions[uid]
        if not sol or not sol.strip():
            errors.append(f"Empty solution for question [{idx}] {uid}")
            continue

        # Verify that the solution explicitly concludes with the expected answer
        ans_pattern = rf"\bOption\s+{expected_ans}\b"
        if not re.search(ans_pattern, sol):
            errors.append(f"Solution for {uid} does not clearly mention 'Option {expected_ans}' (expected {expected_ans})")

        # Update question in shard
        q["detailed_solution"] = sol.strip()
        updated_count += 1

    if errors:
        print(f"\nFound {len(errors)} errors:")
        for err in errors[:20]:
            print("  -", err)
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more errors.")
        sys.exit(1)

    # Save standalone chunk JSON
    with open(out_chunk_path, "w", encoding="utf-8") as f:
        json.dump(all_solutions, f, indent=2, ensure_ascii=False)
    print(f"Successfully saved companion chunk to {out_chunk_path} ({len(all_solutions)} solutions)")

    # Save updated shard JSON
    with open(shard_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated shard {shard_path} ({updated_count} / {len(questions)} solved)")

if __name__ == "__main__":
    main()
