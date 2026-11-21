import json

chunk_path = 'data/solutions/chunks/aptitude/chunk-apt-spell-03.json'
with open(chunk_path, 'r', encoding='utf-8') as f:
    chunk = json.load(f)

with open('public/data/aptitude/english/spelling-check.json', 'r', encoding='utf-8') as f:
    full_data = json.load(f)

expected_subset = full_data[100:150]
expected_uids = [q['uid'] for q in expected_subset]

print(f"Total keys in chunk: {len(chunk)}")
assert len(chunk) == 50, f"Expected 50 keys, got {len(chunk)}"

errors = []
for i, q in enumerate(expected_subset):
    uid = q['uid']
    ans = q['answer']
    if uid not in chunk:
        errors.append(f"Missing {uid}")
        continue
    sol = chunk[uid]
    if not sol or not sol.strip():
        errors.append(f"Empty solution for {uid}")
        continue
    expected_ending = f"Hence, Option {ans} is the correct answer."
    if expected_ending not in sol:
        errors.append(f"{uid}: Expected ending '{expected_ending}' not in solution: '{sol}'")

if errors:
    print("VERIFICATION FAILED with errors:")
    for e in errors:
        print("  -", e)
else:
    print("ALL 50 QUESTIONS VERIFIED PERFECTLY! All keys match APT-ENG-11437 to APT-ENG-11486, none are empty, and all conclusion statements align with official answers.")
