import json
import re
import os

with open('public/data/aptitude/english/para-jumble.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('data/solutions/chunks/aptitude/para-jumble-holds.json', 'r', encoding='utf-8') as f:
    holds = json.load(f)

valid_questions = [q for q in questions if q['uid'] not in holds]
print(f"Total: {len(questions)}, Holds: {len(holds)}, Valid to solve: {len(valid_questions)}")

def clean_html(raw_html):
    if not raw_html:
        return ""
    # Replace breaks with newlines
    text = re.sub(r'<br\s*/?>', '\n', raw_html, flags=re.I)
    text = re.sub(r'</p>', '\n', text, flags=re.I)
    text = re.sub(r'</li>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    # unescape html entities
    text = text.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&apos;', "'").replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return '\n'.join(lines)

def clean_option(opt_html):
    if not opt_html:
        return ""
    text = re.sub(r'<[^>]+>', ' ', opt_html)
    text = text.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&apos;', "'").replace('&amp;', '&')
    return ' '.join(text.split())

prepared = []
for q in valid_questions:
    uid = q['uid']
    ans = q['answer']
    raw_html = q.get('questionHtml', '')
    
    # Strip <ol> options block from stem
    stem_html = re.sub(r'<ol[\s\S]*?</ol>', '', raw_html, flags=re.I)
    clean_stem = clean_html(stem_html)
    
    opts_map = {}
    letters = ['A', 'B', 'C', 'D']
    for idx, opt_html in enumerate(q.get('options', [])):
        if idx < 4:
            opts_map[letters[idx]] = clean_option(opt_html)
            
    prepared.append({
        "uid": uid,
        "answer": ans,
        "expected_sequence": opts_map.get(ans, ""),
        "question": clean_stem,
        "options": opts_map,
        "year": q.get('year')
    })

batch_size = 20
batches_dir = "data/solutions/chunks/aptitude/batches_parajumble"
os.makedirs(batches_dir, exist_ok=True)

for i in range(0, len(prepared), batch_size):
    batch = prepared[i:i + batch_size]
    batch_idx = i // batch_size
    path = os.path.join(batches_dir, f"input_batch_{batch_idx:02d}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(batch, f, indent=2, ensure_ascii=False)

print(f"Generated {(len(prepared) + batch_size - 1) // batch_size} batches in {batches_dir}")

