import json
import os
import re
import html

def clean_html(text):
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('\xa0', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def format_stem(raw_html):
    # remove trailing options ol
    stem = re.sub(r'<ol\b[^>]*>.*?</ol>', '', raw_html, flags=re.DOTALL)
    # convert bold and strong to **
    stem = re.sub(r'<(b|strong)\b[^>]*>(.*?)</\1>', r'**\2**', stem, flags=re.DOTALL)
    # convert u to **
    stem = re.sub(r'<u\b[^>]*>(.*?)</u>', r'**\1**', stem, flags=re.DOTALL)
    # check for span with style underline or bold
    stem = re.sub(r'<span\b[^>]*style="[^"]*(underline|bold)[^"]*"[^>]*>(.*?)</span>', r'**\2**', stem, flags=re.DOTALL)
    stem = re.sub(r'<[^>]+>', ' ', stem)
    stem = html.unescape(stem)
    stem = stem.replace('\xa0', ' ')
    stem = re.sub(r'\s+', ' ', stem).strip()
    return stem

def main():
    target_shard = "public/data/aptitude/english/miscellaneous.json"
    batches_dir = "data/solutions/chunks/aptitude/batches_miscellaneous"
    os.makedirs(batches_dir, exist_ok=True)

    with open(target_shard, "r", encoding="utf-8") as f:
        questions = json.load(f)

    unsolved = [q for q in questions if not q.get("detailed_solution")]
    print(f"Total unsolved questions: {len(unsolved)}")

    batch_size = 19
    batches = []
    current_batch = []

    for q in unsolved:
        opts = {}
        labels = ["A", "B", "C", "D"]
        for idx, opt_html in enumerate(q.get("options", [])):
            opts[labels[idx]] = clean_html(opt_html)

        item = {
            "uid": q["uid"],
            "answer": q["answer"],
            "question": format_stem(q["questionHtml"]),
            "options": opts,
            "raw_html": q["questionHtml"]
        }
        current_batch.append(item)
        if len(current_batch) == batch_size and len(batches) < 16:
            batches.append(current_batch)
            current_batch = []

    if current_batch:
        batches.append(current_batch)

    print(f"Divided into {len(batches)} batches.")
    for idx, b in enumerate(batches):
        file_path = os.path.join(batches_dir, f"input_batch_{idx:02d}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(b, f, indent=2, ensure_ascii=False)
        print(f"Batch {idx:02d}: {len(b)} questions ({b[0]['uid']} to {b[-1]['uid']}) -> {file_path}")

if __name__ == "__main__":
    main()

