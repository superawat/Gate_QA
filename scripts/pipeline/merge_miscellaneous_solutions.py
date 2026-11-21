import json
import os
import re

def main():
    batches_dir = "data/solutions/chunks/aptitude/batches_miscellaneous"
    target_shard_path = "public/data/aptitude/english/miscellaneous.json"
    output_chunk_path = "data/solutions/chunks/aptitude/chunk-apt-miscellaneous-01.json"
    narration_chunk_path = "data/solutions/chunks/aptitude/chunk-apt-narration-01.json"

    with open(target_shard_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    expected_uids = [q["uid"] for q in questions]
    print(f"Total expected questions in miscellaneous: {len(expected_uids)}")

    # Load existing 28 solved questions
    consolidated = {}
    if os.path.exists(narration_chunk_path):
        with open(narration_chunk_path, "r", encoding="utf-8") as f:
            narr = json.load(f)
        for q in questions:
            if q["uid"] in narr:
                consolidated[q["uid"]] = narr[q["uid"]]
    print(f"Loaded {len(consolidated)} existing solutions from narration chunk.")

    # Load batch outputs
    raw_count = 0
    missing_batches = []
    for b_idx in range(17):
        b_file = os.path.join(batches_dir, f"output_batch_{b_idx:02d}.json")
        if not os.path.exists(b_file):
            missing_batches.append(b_file)
            continue
        with open(b_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if "solutions" in data and len(data) == 1:
            val = data["solutions"]
            if isinstance(val, str):
                val = json.loads(val)
            data = val

        for k, v in data.items():
            norm_k = k.replace("_", "-").strip()
            consolidated[norm_k] = v.strip() if isinstance(v, str) else str(v)
            raw_count += 1

    print(f"Loaded {raw_count} solutions from batches. Total unique consolidated: {len(consolidated)}.")
    if missing_batches:
        print(f"WARNING: {len(missing_batches)} batch files missing: {missing_batches}")

    # Verify coverage against all 354 expected UIDs
    missing = []
    for q in questions:
        uid = q["uid"]
        if uid not in consolidated:
            missing.append(uid)
        elif not consolidated[uid] or len(consolidated[uid].strip()) == 0:
            missing.append(f"{uid} (empty)")

    if missing:
        print(f"ERROR: {len(missing)} missing or empty UIDs: {missing[:10]}")
    else:
        print("SUCCESS: 100% of 354 UIDs are present and non-empty!")

    # Check answer key mentions in solutions
    mismatches = []
    for q in questions:
        uid = q["uid"]
        sol = consolidated.get(uid, "")
        expected_ans = q["answer"]
        match = re.search(r"Option\s+([A-D])", sol, re.IGNORECASE)
        if not match:
            mismatches.append((uid, expected_ans, "No option mentioned in solution"))
        else:
            # Check last occurrence of Option X which is usually the conclusion
            all_matches = re.findall(r"Option\s+([A-D])", sol, re.IGNORECASE)
            conclusion_opt = all_matches[-1].upper() if all_matches else None
            if conclusion_opt != expected_ans.upper():
                if f"Option {expected_ans}" not in sol and f"Option **{expected_ans}**" not in sol and f"**Option {expected_ans}**" not in sol:
                    mismatches.append((uid, expected_ans, f"Last option mentioned was {conclusion_opt} instead of {expected_ans}"))

    print(f"Answer key alignment check: {len(mismatches)} discrepancies flagged.")
    if mismatches:
        for m in mismatches[:10]:
            print("  Flagged:", m)

    # Save consolidated chunk artifact
    with open(output_chunk_path, "w", encoding="utf-8") as f:
        json.dump(consolidated, f, indent=2, ensure_ascii=False)
    print(f"Successfully saved consolidated chunk to {output_chunk_path} with {len(consolidated)} solutions.")

    # Update public/data/aptitude/english/miscellaneous.json
    updated_count = 0
    for q in questions:
        uid = q["uid"]
        if uid in consolidated and consolidated[uid]:
            q["detailed_solution"] = consolidated[uid]
            updated_count += 1

    with open(target_shard_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {updated_count}/{len(questions)} in {target_shard_path}!")

if __name__ == "__main__":
    main()

