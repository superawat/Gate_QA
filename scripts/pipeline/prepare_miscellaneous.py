import json
import re
import html
import os

def clean_html(text):
    if not text:
        return ""
    text = html.unescape(text)
    # Remove script and style tags
    text = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', text, flags=re.DOTALL)
    # Remove tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse multiple whitespaces and non-breaking spaces
    text = text.replace('\xa0', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_stem(raw_html):
    # Some questionHtml includes the trailing <ol> list of options
    stem_without_ol = re.sub(r'<ol\b[^>]*>.*?</ol>', '', raw_html, flags=re.DOTALL)
    return clean_html(stem_without_ol)

def main():
    target_shard = "public/data/aptitude/english/miscellaneous.json"
    with open(target_shard, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Total questions loaded: {len(questions)}")
    solved = [q for q in questions if q.get("detailed_solution")]
    unsolved = [q for q in questions if not q.get("detailed_solution")]

    print(f"Solved: {len(solved)}")
    print(f"Unsolved: {len(unsolved)}")

    # Let's inspect first 5 unsolved
    labels = ["A", "B", "C", "D"]
    for q in unsolved[:5]:
        print("=" * 60)
        print(f"UID: {q['uid']} | Official Answer: {q['answer']}")
        print("Stem:", clean_stem(q['questionHtml']))
        for i, opt in enumerate(q.get("options", [])):
            print(f"  Option {labels[i]}: {clean_html(opt)}")

if __name__ == "__main__":
    main()

