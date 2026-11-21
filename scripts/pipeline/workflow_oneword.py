import json
import os

start_batch = args.get("start", 0) if "args" in globals() and args else 0
end_batch = args.get("end", 35) if "args" in globals() and args else 35
concurrency = args.get("concurrency", 5) if "args" in globals() and args else 5

batches_dir = "data/solutions/chunks/aptitude/batches_oneword"

schema = {
    "type": "object",
    "additionalProperties": {"type": "string"}
}

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
            if len(existing) == len(items):
                log(f"Batch {batch_idx:02d} already completed ({len(existing)} Qs), skipping.")
                return existing
        except Exception:
            pass

    log(f"Starting Batch {batch_idx:02d} ({len(items)} Qs)...")
    prompt = f"""You are an expert English lexicographer and verbal aptitude educator for GATE and competitive exams.
Author authentic, concise, to-the-point detailed solutions for these {len(items)} questions from the One-Word Substitution topic.

Quality rules:
1. Keep the solution strictly to the point without boilerplate or verbose filler.
2. In the first line, clearly identify and bold the correct term and show how it directly matches the definition, sentence context, or group of words from the prompt.
3. Include an "### Analysis of Options:" or bulleted breakdown that concisely defines/distinguishes the other 3 distractors so the student clearly understands why they do not fit the given definition.
   - If a question is non-standard (e.g. spelling check, idiom, or antonym), explain the specific spelling error, idiomatic meaning, or antonym accurately.
4. Conclude with: Hence, **Option <X>** is the correct answer.
5. Return a JSON object mapping each question UID to its detailed solution markdown.

Questions:
{json.dumps(items, indent=2, ensure_ascii=False)}
"""

    res = await agent(
        prompt=prompt,
        schema=schema,
        role=f"One-word Batch {batch_idx:02d}",
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

