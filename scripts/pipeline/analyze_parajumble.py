import json
import re

with open('public/data/aptitude/english/para-jumble.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

instruction_patterns = [
    r'^(?:\d+\s*[\.\)]\s*)?(?:Rearrange|Given below|Sentences of a paragraph|Parts of a sentence|Examine the four|Select the option).*?(?:correct order|meaningful sentence|meaningful and coherent paragraph|logical sequence)[\.\:]?\s*'
]

empty = []
valid = []

for q in questions:
    uid = q['uid']
    html = q.get('questionHtml', '')
    stem = re.sub(r'<ol[\s\S]*?</ol>', '', html, flags=re.I)
    clean = ' '.join(re.sub(r'<[^>]+>', ' ', stem).split())
    
    remaining = clean
    for pat in instruction_patterns:
        remaining = re.sub(pat, '', remaining, flags=re.I).strip()
    
    is_word_puzzle = any(k in clean for k in ['TIGRUA', 'NAILS'])
    if len(remaining) < 20 and not is_word_puzzle:
        empty.append(uid)
    else:
        valid.append(q)

print(f"Total: {len(questions)}")
print(f"Empty: {len(empty)}")
print(f"Valid: {len(valid)}")

answers = {}
for q in valid:
    ans = q['answer']
    answers[ans] = answers.get(ans, 0) + 1

print(f"Answer distribution in valid: {answers}")

bad_opts = [q['uid'] for q in valid if len(q.get('options', [])) != 4]
print(f"Questions with != 4 options: {len(bad_opts)}")

print("\nSample 1 (PQRS sentence rearrangement):")
print(valid[0]['uid'], valid[0]['answer'])
print(valid[0]['questionHtml'][:300])

print("\nSample 2 (ABCD paragraph jumble):")
print(valid[5]['uid'], valid[5]['answer'])
print(valid[5]['questionHtml'][:300])
