import json
import os
import re

batches_dir = "data/solutions/chunks/aptitude/batches_oneword"
target_shard_path = "public/data/aptitude/english/one-word-substitution.json"
output_chunk_path = "data/solutions/chunks/aptitude/chunk-apt-one-word-01.json"

with open(target_shard_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

expected_uids = [q["uid"] for q in questions]
print(f"Total expected questions: {len(expected_uids)}")

consolidated = {}
raw_count = 0

for b_idx in range(35):
    b_file = os.path.join(batches_dir, f"output_batch_{b_idx:02d}.json")
    if not os.path.exists(b_file):
        print(f"ERROR: Missing batch file {b_file}")
        continue
    with open(b_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle nested {"solutions": "..."}
    if "solutions" in data and len(data) == 1:
        val = data["solutions"]
        if isinstance(val, str):
            val = json.loads(val)
        data = val

    for k, v in data.items():
        norm_k = k.replace("_", "-").strip()
        consolidated[norm_k] = v.strip() if isinstance(v, str) else str(v)
        raw_count += 1

print(f"Loaded {raw_count} raw solutions, {len(consolidated)} unique consolidated solutions.")

# Verify coverage against all expected UIDs
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
    print("SUCCESS: 100% of 692 UIDs are present and non-empty!")

# Check answer key mentions in solutions
mismatches = []
for q in questions:
    uid = q["uid"]
    sol = consolidated.get(uid, "")
    expected_ans = q["answer"]
    # Look for Option X in conclusion
    match = re.search(r"Option\s+([A-D])", sol, re.IGNORECASE)
    if not match:
        mismatches.append((uid, expected_ans, "No option mentioned in solution"))
    elif match.group(1).upper() != expected_ans.upper():
        # Check if the expected answer appears in conclusion
        if f"Option {expected_ans}" not in sol and f"Option **{expected_ans}**" not in sol and f"**Option {expected_ans}**" not in sol:
            mismatches.append((uid, expected_ans, f"Found {match.group(1).upper()} instead of {expected_ans}"))

print(f"Answer key alignment check: {len(mismatches)} discrepancies flagged.")
if mismatches:
    for m in mismatches[:10]:
        print("  Flagged:", m)

# Save consolidated chunk
with open(output_chunk_path, "w", encoding="utf-8") as f:
    json.dump(consolidated, f, indent=2, ensure_ascii=False)

print(f"Successfully saved consolidated chunk to {output_chunk_path} with {len(consolidated)} solutions!")

