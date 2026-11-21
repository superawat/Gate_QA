import json
import re

with open('public/data/aptitude/english/para-jumble.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

instruction_patterns = [
    r'^(?:\d+\s*[\.\)]\s*)?(?:Rearrange|Given below|Sentences of a paragraph|Parts of a sentence|Examine the four|Select the option).*?(?:correct order|meaningful sentence|meaningful and coherent paragraph|logical sequence)[\.\:]?\s*'
]

holds = {}

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
        holds[uid] = "The question stem is missing; only the generic rearrangement instruction and permutation options remain, so the jumbled sentences cannot be rearranged from context."

with open('data/solutions/chunks/aptitude/para-jumble-holds.json', 'w', encoding='utf-8') as f:
    json.dump(holds, f, indent=2, ensure_ascii=False)

print(f"Saved {len(holds)} holds to data/solutions/chunks/aptitude/para-jumble-holds.json")

