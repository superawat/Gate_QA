import json
import os

solutions = {
    "APT-ENG-12037": "Option D is incorrectly spelt; the correct spelling is **businessman** (with a single 's' in 'bus-'), which refers to a person engaged in commercial or industrial business. The other options—'bowlegged', 'palanquins', and 'urchins'—are all correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12038": "Option B is incorrectly spelt; the correct spelling is **innocuous** (with '-uous'), meaning harmless or not offensive. The other words in the sentence—'crouching', 'demolish', and 'shoddy'—are all correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12039": "Option C is incorrectly spelt; the correct spelling is **Override** (with double 'r'), which means to use one's authority to reject or cancel a decision or view. The other options—'Boasting', 'Ascetic', and 'Evidence'—are correctly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12040": "Option C is incorrectly spelt; the correct spelling is **Blizzard** (with double 'z'), which refers to a severe snowstorm with high winds and low visibility. The other options—'Brusque', 'Boisterous', and 'Blonde'—are correctly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12041": "Option B is incorrectly spelt; the correct spelling is **Necessary** (with a single 'c' and double 's'), meaning required, needed, or essential. The other options—'Connoisseur', 'Privilege', and 'Dilemma'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12042": "Option B is incorrectly spelt; the correct spelling is **Beginning** (with a single 'g' and double 'n'), meaning the initial stage or point at which something starts. The other options—'Necessary', 'Irrelevant', and 'Location'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12043": "Option B is incorrectly spelt; the correct spelling is **Venison** (with a single 'n'), which refers to the edible meat of a deer. The other options—'Nosy', 'Yearn', and 'Ruminate'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12044": "Option B is incorrectly spelt; the correct spelling is **Titillate** (with double 'l'), which means to stimulate or excite someone pleasantly. The other options—'aggravate', 'mediate', and 'initiate'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12045": "Option A is incorrectly spelt; the correct spelling is **Cashier** (with 'ie' following the 'i before e' rule), referring to an employee responsible for receiving and paying out money. The other options—'Security', 'Certain', and 'Imagery'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12046": "Option C is incorrectly spelt; the correct spelling is **Equilibrium** (with a single 'l'), which refers to a state of balance between opposing forces or actions. The other options—'Equine', 'Equilateral', and 'Equanimity'—are correctly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12047": "Option D is incorrectly spelt; the correct spelling is **Queue** (or **Queueing**), referring to a line or sequence of people or vehicles awaiting their turn. The other options—'Glamour', 'Quarantine', and 'Guarantee'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12048": "Option D is incorrectly spelt; the correct spelling is **Guidance** (ending in '-ance'), which means advice, leadership, or direction. The other options—'Soldier', 'Beginning', and 'Shining'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12049": "Option D is incorrectly spelt; the correct spelling is **Definite** (ending in '-ite'), which means clearly stated, distinct, or certain. The other options—'Stretch', 'Appraisal', and 'Genuine'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12050": "Option A is incorrectly spelt; the correct spelling is **Possessions** (with double 's' in both positions), referring to items owned or held by someone. The other options—'Irritation', 'Invitation', and 'Protection'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12051": "Option B is correctly spelt as **Malodour**, which denotes a very unpleasant, strong, or offensive smell. The distractors 'Mallodour' (A), 'Maloder' (C), and 'Malodur' (D) are all misspelled variations. Hence, Option B is the correct answer.",

    "APT-ENG-12052": "The underlined word 'tomorow' is misspelled; the correct spelling is **tomorrow** (with a single 'm' and double 'r'), meaning on the day following today. The other options—'tomoorrow', 'toomorow', and 'tomoorow'—are incorrectly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12053": "Option D is correctly spelt as **Definition**, which means a statement of the exact meaning of a word. The other options contain spelling errors: 'Competiter' should be **Competitor**, 'Proliferete' should be **Proliferate**, and 'Beneficiery' should be **Beneficiary**. Hence, Option D is the correct answer.",

    "APT-ENG-12054": "Option C is correctly spelt as **flexibility**, meaning the quality of bending easily or adapting readily to changes. The remaining options—'phlexibility' (A), 'flexebelity' (B), and 'flaxibilety' (D)—are incorrectly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12055": "Option D is correctly spelt as **reconciliation**, meaning the restoration of friendly relations or the action of making two financial accounts consistent. The other options misspell the word as 'reconcilation' (A), 'reconsiliation' (B), and 'reconsilation' (C). Hence, Option D is the correct answer.",

    "APT-ENG-12056": "Option B contains the misspelled word 'triviale'; the correct spelling is **trivial** (without the trailing 'e'), meaning of little value or importance. The remaining sentence segments in Options A, C, and D contain no spelling errors. Hence, Option B is the correct answer.",

    "APT-ENG-12057": "Option A is incorrectly spelt; the correct spelling is **religious** (ending with '-ious'), meaning relating to or believing in a religion. The other words from the sentence—'carefully', 'precious', and 'decorated'—are all correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12058": "Option D is incorrectly spelt; the correct spelling is **CONSENT** (with 's', not 'sc'), which means permission or agreement to do something. The other options—'SPLENDID', 'MEAGRE', and 'MARRIAGEABLE'—are all correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12059": "Option B is incorrectly spelt; the correct spelling is **Suggest** (with double 'g'), which means to put forward a consideration, idea, or proposal. The other options—'Healthy', 'Quantum', and 'Mechanics'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12060": "Option D is incorrectly spelt; the correct spelling is **Antarctic** (with a 'c' after the first 'r'), which relates to the south polar region. The other options—'Athlete', 'Practically', and 'Benefitted'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12061": "Option B is incorrectly spelt; the correct spelling is **Inhabitants** (ending in '-ants'), referring to persons or animals that inhabit a place. The other words from the sentence—'Hundred', 'Double', and 'Thousand'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12062": "In the given sentence, 'concesions' is incorrectly spelt, and Option D provides the correct spelling **concessions** (with double 's' in the middle), meaning price discounts or allowances. The other options misspell other words: 'whaile' (A), 'recieved' (B), and 'paurchasing' (C). Hence, Option D is the correct answer.",

    "APT-ENG-12063": "The underlined word 'implimentation' is misspelled; Option C provides the correct spelling **Implementation** (with an 'e' in 'ple-'), which refers to the execution or carrying out of a plan. The other options—'Implimentation', 'implimantation', and 'Implemantation'—are all misspelled. Hence, Option C is the correct answer.",

    "APT-ENG-12064": "Option B contains no spelling errors, correctly spelling **architecture**, which refers to the art and science of designing and constructing buildings. The other options misspell the word as 'architecchure' (A), 'archtiecture' (C), and 'architectrue' (D). Hence, Option B is the correct answer.",

    "APT-ENG-12065": "Option B is incorrectly spelt; **Sleam** is not a standard English word (likely an erroneous form of 'Seam' or 'Stream'). The other options—'Cream', 'Beam', and 'Steam'—are standard, correctly spelt English words. Hence, Option B is the correct answer.",

    "APT-ENG-12066": "Option D is incorrectly spelt; the correct spelling is **Freighter** (meaning a ship or aircraft designed to carry cargo) or **Frightener** (one that terrifies). The other options—'Practical', 'Glowing', and 'Released'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12067": "Option B is incorrectly spelt; the correct spelling is **Avaricious** (with '-ious'), meaning showing an extreme greed for wealth or material gain. The other options—'Clemency', 'Hegemony', and 'Nostalgic'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12068": "Option A is incorrectly spelt; the correct spelling is **Clover** (with a single 'v'), which is a small herbaceous plant of the pea family. The other options—'Sharpen', 'Sunrise', and 'Happen'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12069": "The underlined word 'glamming' is incorrect in context; Option C provides the correct word and spelling **gleaming**, which means shining brightly with reflected light. The other options—'glamning', 'gleaning', and 'glaming'—either do not fit the context or are misspelled. Hence, Option C is the correct answer.",

    "APT-ENG-12070": "Option C is incorrectly spelt; the correct spelling is **craftsmanship** (with an 's' after 'craft'), meaning skill in a particular trade or craft. The other words from the sentence—'artillery', 'efficient', and 'sergeant'—are correctly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12071": "Option B is incorrectly spelt; the correct spelling is **foreseeable** (with an 'e' in 'fore-'), meaning able to be anticipated or predicted. The other words in the sentence—'convoluted', 'problematic', and 'exhilarate'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12072": "Option D is incorrectly spelt; the correct spelling is **Abundance** (spelled with 'u' in 'bun-'), which means a very large quantity of something. The other options—'Astute', 'Absolute', and 'Abrupt'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12073": "Option B is incorrectly spelt; the correct spelling is **Charisma** (with a single 'h' in 'ch-'), meaning compelling charm or appeal that inspires devotion in others. The other options—'Dominate', 'Elegant', and 'Cavalier'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12074": "Option D is correctly spelt as **intentionally**, which means deliberately or on purpose. The other options—'intantienally' (A), 'intoningly' (B), and 'indentionally' (C)—are incorrectly spelt or non-existent words. Hence, Option D is the correct answer.",

    "APT-ENG-12075": "Option D is incorrectly spelt; the correct spelling is **Hierarchy** (spelled 'h-i-e-r-a-r-c-h-y'), meaning a ranking system according to status or authority. The other options—'Grateful', 'Immigrate', and 'Ignorance'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12076": "Option C is incorrectly spelt; the correct spelling is **colloquialism** (with double 'l'), which refers to an informal word or phrase. The other words in the sentence—'devoured', 'successfully', and 'trivia'—are correctly spelt. Hence, Option C is the correct answer.",

    "APT-ENG-12077": "In the sentence, 'peice' is misspelled; Option A provides the correct spelling **piece** (following 'i before e'), which forms the common idiom 'a piece of cake' meaning very easy. The other options misspell words from the sentence: 'foaund' (B), 'incrediblly' (C), and 'praject' (D). Hence, Option A is the correct answer.",

    "APT-ENG-12078": "In the sentence, 'acquiantance' is misspelled; Option B provides the correct spelling **acquaintance** (with 'ai' before 'n' and ending in '-ance'), meaning a person one knows slightly. The other options—'acuiantance', 'acquaintence', and 'aquaintance'—are incorrectly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12079": "In the sentence, 'receieved' is misspelled; Option A provides the correct spelling **received** (following the 'i except after c' rule), meaning was given or presented with something. The other options—'recived', 'recieved', and 'receaved'—are incorrectly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12080": "Option A is incorrectly spelt; the correct spelling is **Beautician** (with 'i' instead of 'y'), which refers to a person whose job is to provide beauty treatments. The other options—'Mathematician', 'Musician', and 'Technician'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12081": "Option D is incorrectly spelt; the correct spelling is **Licensed** (with an 's' for the past participle/adjective), meaning having an official license or authorization. The other options—'Chandelier', 'Haphazard', and 'Aesthetic'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12082": "Option A is incorrectly spelt; the correct spelling is **Fascinating** (spelled with 'sc' and 'a'), meaning extremely interesting or captivating. The other options—'Professional', 'Grammatical', and 'Occurrence'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12083": "Option D is incorrectly spelt; the correct spelling is **Conscientious** (with an 'i' before 'ous'), which means wishing to do what is right or doing work with thorough care. The other options—'Fulfil', 'Acknowledgment', and 'Apparent'—are correctly spelt. Hence, Option D is the correct answer.",

    "APT-ENG-12084": "Option B is incorrectly spelt; the correct spelling is **Inoculate** (with a single 'n'), which means to introduce an antigenic substance or vaccine to produce immunity. The other options—'Immaculate', 'Irreverent', and 'Immense'—are correctly spelt. Hence, Option B is the correct answer.",

    "APT-ENG-12085": "Option A is incorrectly spelt; the correct spelling is **Address** (with double 'd'), which refers to the details of the place where someone lives or works. The other options—'Astound', 'Advice', and 'Amount'—are correctly spelt. Hence, Option A is the correct answer.",

    "APT-ENG-12086": "Option D is incorrectly spelt; the correct spelling is **Pathetic** (with 'e' instead of 'a'), meaning arousing pity or being miserably inadequate. The other options—'Adventure', 'Benefit', and 'Acquire'—are correctly spelt. Hence, Option D is the correct answer."
}

# Verify count and range
expected_uids = [f"APT-ENG-{i}" for i in range(12037, 12087)]
assert len(expected_uids) == 50
assert list(solutions.keys()) == expected_uids

# Validate each entry against official question data
with open('public/data/aptitude/english/spelling-check.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

q_map = {q['uid']: q for q in raw_data if q['uid'] in solutions}
assert len(q_map) == 50

for uid in expected_uids:
    q = q_map[uid]
    ans = q['answer']
    sol = solutions[uid]
    assert sol, f"Empty solution for {uid}"
    expected_ending = f"Hence, Option {ans} is the correct answer."
    assert sol.endswith(expected_ending), f"{uid}: expected solution to end with '{expected_ending}', got '{sol[-45:]}'"

out_dir = os.path.join("data", "solutions", "chunks", "aptitude")
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "chunk-apt-spell-15.json")

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(solutions)} verified solutions to {out_file}")
