import json
import os
import re

batches_dir = "data/solutions/chunks/aptitude/batches_parajumble"
target_shard_path = "public/data/aptitude/english/para-jumble.json"
holds_path = "data/solutions/chunks/aptitude/para-jumble-holds.json"
output_chunk_path = "data/solutions/chunks/aptitude/chunk-apt-para-jumble-01.json"

with open(target_shard_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

with open(holds_path, "r", encoding="utf-8") as f:
    holds = json.load(f)

valid_questions = [q for q in questions if q["uid"] not in holds]
expected_uids = set(q["uid"] for q in valid_questions)

print(f"Total questions in shard: {len(questions)}")
print(f"Total holds: {len(holds)}")
print(f"Total expected solutions: {len(expected_uids)}")

consolidated = {}
raw_count = 0

for b_idx in range(31):
    b_file = os.path.join(batches_dir, f"output_batch_{b_idx:02d}.json")
    if not os.path.exists(b_file):
        print(f"WARNING: Batch file {b_file} not found yet.")
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
        if norm_k in expected_uids and isinstance(v, str) and len(v.strip()) > 50:
            consolidated[norm_k] = v.strip()
            raw_count += 1

print(f"Loaded {raw_count} raw solutions, {len(consolidated)} unique consolidated solutions.")

# Verify coverage against all expected UIDs
missing = []
for q in valid_questions:
    uid = q["uid"]
    if uid not in consolidated:
        missing.append(uid)
    elif not consolidated[uid] or len(consolidated[uid].strip()) == 0:
        missing.append(f"{uid} (empty)")

if missing:
    print(f"Status: {len(missing)} missing or empty UIDs: {missing[:10]}")
else:
    print("SUCCESS: 100% of 605 non-held UIDs are present and non-empty!")

# Check answer key alignment
mismatches = []
for q in valid_questions:
    uid = q["uid"]
    sol = consolidated.get(uid, "")
    expected_ans = q["answer"]
    # Look for Option X in conclusion
    match = re.search(r"Option\s+([A-D])", sol, re.IGNORECASE)
    if not match:
        mismatches.append((uid, expected_ans, "No option mentioned in solution"))
    elif match.group(1).upper() != expected_ans.upper():
        if f"Option {expected_ans}" not in sol and f"Option **{expected_ans}**" not in sol and f"**Option {expected_ans}**" not in sol:
            mismatches.append((uid, expected_ans, f"Found {match.group(1).upper()} instead of {expected_ans}"))

print(f"Answer key alignment check: {len(mismatches)} discrepancies flagged.")
if mismatches:
    for m in mismatches[:10]:
        print("  Flagged:", m)

# Save consolidated chunk
with open(output_chunk_path, "w", encoding="utf-8") as f:
    json.dump(consolidated, f, indent=2, ensure_ascii=False)
print(f"Saved chunk artifact: {output_chunk_path} with exactly {len(consolidated)} solutions.")

# Apply to target shard
updated_count = 0
for q in questions:
    uid = q["uid"]
    if uid in consolidated:
        q["detailed_solution"] = consolidated[uid]
        updated_count += 1

with open(target_shard_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Applied {updated_count} solutions directly into {target_shard_path}!")
