import json
import os

start_batch = args.get("start", 0) if "args" in globals() and args else 0
end_batch = args.get("end", 17) if "args" in globals() and args else 17
concurrency = args.get("concurrency", 4) if "args" in globals() and args else 4

batches_dir = "data/solutions/chunks/aptitude/batches_miscellaneous"

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
    prompt = f"""You are an expert English verbal aptitude educator for competitive exams (GATE, SSC).
Author authentic, concise, strictly TO-THE-POINT detailed solutions for these {len(items)} English Miscellaneous Grammar questions.

Quality and style rules:
1. KEEP THE ANSWER STRICTLY TO THE POINT. Be concise, direct, and pedagogically precise. No conversational fluff or generic padding.
2. Structure by question type:
   - Active/Passive Voice: State the tense and passive rule (e.g. Simple Past: was/were + V3), explain why the correct option fits, and briefly note why key distractors are wrong (wrong tense, missing auxiliary, etc.).
   - Direct/Indirect Speech: Note reporting verb, conjunction, tense backshift, and pronoun changes.
   - Vocabulary / Synonyms / Antonyms / Idioms / One-Word / Denotations: Concisely define the target word/idiom/highlighted term, show why the correct option matches, and briefly define the other choices so the distinction is obvious.
   - Spot the Error / Grammar / Adverbs / Articles / Prepositions: Clearly state the grammatical rule, pinpoint the exact error in the sentence, and show the correct phrasing.
   - Sentence Ordering / Para Jumbles: Identify the starting sentence and connecting logical links (pronouns, chronology) confirming the order.
3. Every solution MUST conclude with:
   Hence, **Option <X>** is the correct answer.
   (The option letter MUST strictly match the provided "answer" key for that UID).
4. Return a JSON object mapping each question UID to its detailed solution markdown string.

Questions:
{json.dumps(items, indent=2, ensure_ascii=False)}
"""

    res = await agent(
        prompt=prompt,
        schema=schema,
        role=f"Misc Batch {batch_idx:02d}",
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

