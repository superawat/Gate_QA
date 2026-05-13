import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('artifacts/aptitude-pipeline/pdf-exploration.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for pdf in data:
    fn = pdf["filename"]
    print(f"=== {fn} ===")
    print(f"  Pages: {pdf['total_pages']}, Size: {pdf['file_size_mb']} MB")
    for sp in pdf['sample_pages'][:3]:
        pg = sp["page"]
        tl = sp["text_length"]
        ic = sp["image_count"]
        print(f"  Page {pg}: {tl} chars, {ic} imgs")
        txt = sp['text_preview'][:300]
        safe = ''.join(c if ord(c) < 128 else '?' for c in txt)
        print(f"    {safe}")
    print()
