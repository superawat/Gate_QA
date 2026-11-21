import json
import os

start_batch = args.get("start", 0) if "args" in globals() and args else 0
end_batch = args.get("end", 31) if "args" in globals() and args else 31
concurrency = args.get("concurrency", 3) if "args" in globals() and args else 3

batches_dir = "data/solutions/chunks/aptitude/batches_parajumble"

async def process_batch(batch_idx):
    in_path = os.path.join(batches_dir, f"input_batch_{batch_idx:02d}.json")
    out_path = os.path.join(batches_dir, f"output_batch_{batch_idx:02d}.json")

    if not os.path.exists(in_path):
        log(f"Input file not found: {in_path}")
        return {}

    with open(in_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    if os.path.exists(out_path):
        try:
            with open(out_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
            # Normalize keys to check coverage
            norm_existing = {k.replace("_", "-"): v for k, v in existing.items()}
            all_valid = all(
                item["uid"] in norm_existing and isinstance(norm_existing[item["uid"]], str) and len(norm_existing[item["uid"]].strip()) > 50
                for item in items
            )
            if all_valid:
                log(f"Batch {batch_idx:02d} already valid and complete ({len(items)} Qs), skipping.")
                return existing
        except Exception:
            pass

    log(f"Starting Batch {batch_idx:02d} ({len(items)} Qs)...")

    # Build schema requiring every UID
    properties = {item["uid"]: {"type": "string"} for item in items}
    schema = {
        "type": "object",
        "properties": properties,
        "required": [item["uid"] for item in items]
    }

    prompt = f"""You are an expert English verbal ability and verbal logic educator for GATE and competitive examinations.
Author authentic, concise, strictly to-the-point detailed solutions for these {len(items)} Para Jumble / Sentence Rearrangement questions.

CRITICAL QUALITY RULES:
1. Keep each solution strictly to the point without filler or conversational preambles.
2. Structure for Sentence Rearrangements (P, Q, R, S):
   - Explain the opening part and key grammatical/logical links (prepositions, conjunctions, noun-pronoun references) connecting adjacent parts.
   - Provide the complete reconstructed sentence under '**Complete Sentence:**' in quotation marks.
3. Structure for Paragraph Jumbles (A, B, C, D):
   - Identify the introductory sentence (introduces the main theme/entity without antecedent pronouns).
   - Trace the logical/causal flow and mandatory pairs connecting subsequent sentences.
   - Provide the coherent reconstructed paragraph under '**Coherent Paragraph:**' in quotation marks.
4. For word/anagram puzzles (e.g. TIGRUA, NAILS):
   - State the unscrambled word and confirm it matches the clue.
5. Conclude EVERY solution with:
   Hence, the correct logical order is **<EXPECTED_SEQUENCE>** (**Option <ANSWER>**).
   (Ensure <ANSWER> matches the provided answer key: A, B, C, or D).
6. Return a JSON object with EXACT keys for each question UID mapping to its detailed solution markdown string.

Questions:
{json.dumps(items, indent=2, ensure_ascii=False)}
"""

    res = await agent(
        prompt=prompt,
        schema=schema,
        role=f"ParaJumble Batch {batch_idx:02d}",
        model="flash"
    )

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, ensure_ascii=False)

    log(f"Batch {batch_idx:02d} completed and saved: {len(res)}/{len(items)} solutions.")
    return res

all_batch_indices = list(range(start_batch, end_batch))
log(f"Processing batches {start_batch} to {end_batch - 1} in waves of {concurrency}...")

for i in range(0, len(all_batch_indices), concurrency):
    wave = all_batch_indices[i:i + concurrency]
    phase_name = f"Wave: Batches {wave[0]:02d}-{wave[-1]:02d}"
    phase(phase_name)
    log(f"--- Running {phase_name} ---")
    await parallel(wave, process_batch)

log("All requested batches finished!")
