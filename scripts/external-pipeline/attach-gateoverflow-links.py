#!/usr/bin/env python3
"""
scripts/external-pipeline/attach-gateoverflow-links.py

Matches ISRO 2023 and ISRO 2025 Set A questions with GateOverflow questions
using optimal bipartite matching on question text & options (handling set shuffling),
and updates:
  - data/isro/isro-2023.json & public/data/isro/isro-2023.json
  - data/isro/isro-2025.json & public/data/isro/isro-2025.json
  - data/isro/isro-all.json & public/data/isro/isro-all.json
  - data/isro/answers-isro.json & public/data/isro/answers-isro.json
"""

import os
import re
import json
import sys
import numpy as np
from scipy.optimize import linear_sum_assignment

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def clean_text(text):
    if not text:
        return ""
    # remove html tags
    t = re.sub(r'<[^>]+>', ' ', text)
    # remove latex commands
    t = re.sub(r'\\[a-zA-Z]+', ' ', t)
    # remove non-alphanumeric
    t = re.sub(r'[^a-zA-Z0-9\s]', ' ', t)
    t = ' '.join(t.lower().split())
    return t

def get_words(text):
    return set(w for w in clean_text(text).split() if len(w) > 2)

def compute_matches(set_a_list, go_data_list, year):
    n_a = len(set_a_list)
    n_go = len(go_data_list)
    assert n_a == n_go == 95, f"Count mismatch for {year}: {n_a} vs {n_go}"
    
    set_a_words = []
    for q in set_a_list:
        opts_text = " ".join(opt.get('text', '') for opt in q.get('options', []))
        words = get_words(q['question'] + " " + opts_text)
        set_a_words.append(words)
        
    go_words = []
    for go in go_data_list:
        words = get_words(go['snippet'])
        go_words.append(words)
        
    sim_matrix = np.zeros((n_a, n_go))
    for i in range(n_a):
        wa = set_a_words[i]
        for j in range(n_go):
            wg = go_words[j]
            common = wa.intersection(wg)
            if common:
                jaccard = len(common) / len(wa.union(wg))
                overlap = len(common) / min(len(wa), len(wg))
                sim_matrix[i, j] = 0.5 * jaccard + 0.5 * overlap
                
    row_ind, col_ind = linear_sum_assignment(-sim_matrix)
    
    matches_by_uid = {}
    for r, c in zip(row_ind, col_ind):
        score = sim_matrix[r, c]
        q = set_a_list[r]
        go = go_data_list[c]
        
        m_num = re.search(r'isro-cse-\d+-question-(\d+)', go['href'])
        go_num = int(m_num.group(1)) if m_num else None
        m_id = re.search(r'gateoverflow\.in/(\d+)', go['href'])
        go_id = int(m_id.group(1)) if m_id else None
        
        matches_by_uid[q['question_uid']] = {
            'link': go['href'],
            'gateoverflow_id': go_id,
            'go_num': go_num,
            'score': score
        }
        
    return matches_by_uid

def update_json_file(filepath, mapping):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    updated_count = 0
    if isinstance(data, list):
        for q in data:
            uid = q.get("question_uid")
            if uid in mapping:
                info = mapping[uid]
                q["link"] = info["link"]
                q["gateoverflow_id"] = info["gateoverflow_id"]
                updated_count += 1
    elif isinstance(data, dict) and "records_by_question_uid" in data:
        for uid, rec in data["records_by_question_uid"].items():
            if uid in mapping:
                rec["link"] = mapping[uid]["link"]
                updated_count += 1
                
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
        
    print(f"Updated {updated_count} records in {os.path.relpath(filepath, ROOT)}")

def main():
    print("=== Attaching GateOverflow Links to ISRO 2023 & 2025 ===")
    
    with open(os.path.join(ROOT, "data", "isro", "isro-2023.json"), encoding="utf-8") as f:
        set_a_2023 = json.load(f)
    with open(os.path.join(ROOT, "scratch", "go_isro_2023_all.json"), encoding="utf-8") as f:
        go_2023 = json.load(f)
        
    with open(os.path.join(ROOT, "data", "isro", "isro-2025.json"), encoding="utf-8") as f:
        set_a_2025 = json.load(f)
    with open(os.path.join(ROOT, "scratch", "go_isro_2025_all.json"), encoding="utf-8") as f:
        go_2025 = json.load(f)
        
    matches_2023 = compute_matches(set_a_2023, go_2023, 2023)
    matches_2025 = compute_matches(set_a_2025, go_2025, 2025)
    
    print(f"Matched {len(matches_2023)} questions for ISRO 2023")
    print(f"Matched {len(matches_2025)} questions for ISRO 2025")
    
    combined_mapping = {**matches_2023, **matches_2025}
    
    # 1. Update year files
    for base in ["data", "public/data"]:
        f2023 = os.path.join(ROOT, base, "isro", "isro-2023.json")
        f2025 = os.path.join(ROOT, base, "isro", "isro-2025.json")
        update_json_file(f2023, matches_2023)
        update_json_file(f2025, matches_2025)
        
        # 2. Update isro-all.json
        fall = os.path.join(ROOT, base, "isro", "isro-all.json")
        update_json_file(fall, combined_mapping)
        
        # 3. Update answers-isro.json
        fans = os.path.join(ROOT, base, "isro", "answers-isro.json")
        update_json_file(fans, combined_mapping)
        
    print("=== All datasets updated successfully! ===")

if __name__ == "__main__":
    main()
