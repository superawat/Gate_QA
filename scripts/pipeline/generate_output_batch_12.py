import json
import re

solutions = {
  "APT-ENG-3258": """- **Opening Part:** Part **Q** ("East Asian governments (except for Japan) Implemented") introduces the sentence subject ("East Asian governments...") and transitive verb ("Implemented"), establishing the primary grammatical clause.
- **Grammatical & Logical Links:**
  - **Q → P:** The transitive verb "Implemented" in **Q** requires a direct object, provided by the noun phrase in **P** ("more stringent mobility control and physical distancing policies").
  - **P → R:** The additive correlative phrase "as well as" in **R** ("as well as more comprehensive testing, tracing") extends the list of implemented measures.
  - **R → S:** Part **S** ("and isolation policies since the early stages") completes the coordinated series ("testing, tracing and isolation policies") and concludes with the temporal modifier ("since the early stages").

**Complete Sentence:**
"East Asian governments (except for Japan) Implemented more stringent mobility control and physical distancing policies as well as more comprehensive testing, tracing and isolation policies since the early stages."

Hence, the correct logical order is **QPRS** (**Option B**).""",

  "APT-ENG-3259": """- **Opening Part:** Part **Q** ("in the present international scenario, it is necessary and") establishes the situational context with an introductory prepositional phrase followed by the preparatory construction "it is necessary and...".
- **Grammatical & Logical Links:**
  - **Q → P:** The conjunction "and" in **Q** requires a parallel predicate adjective, provided by **P** ("useful for the Government to utilize the expertise and").
  - **P → S:** The coordinating conjunction "and" at the end of **P** links the compound noun objects "the expertise and" to **S** ("services of Members of Parliament effectively for sensitizing").
  - **S → R:** The preposition "for" in **S** governs parallel gerund phrases: "for sensitizing" in **S** coordinates directly with **R** ("and winning over the support of their counterparts in other countries").

**Complete Sentence:**
"In the present international scenario, it is necessary and useful for the Government to utilize the expertise and services of Members of Parliament effectively for sensitizing and winning over the support of their counterparts in other countries."

Hence, the correct logical order is **QPSR** (**Option B**).""",

  "APT-ENG-3260": """- **Opening Part:** Part **Q** ("after the initial development of glacial conditions, the Earth") opens the sentence with a temporal adverbial clause followed by the initial noun phrase "the Earth".
- **Grammatical & Logical Links:**
  - **Q → R:** The compound subject "the Earth" in **Q** is completed by the head noun "system" and predicate in **R** ("system alternated between two modes, one of cold").
  - **R → S:** The adjective "cold" in **R** modifies the noun phrase in **S** ("temperatures and growing glaciers and the other of").
  - **S → P:** The correlative structure "one of cold... and the other of" in **S** links directly to its parallel complement in **P** ("relatively warm temperatures and retreating glaciers").

**Complete Sentence:**
"After the initial development of glacial conditions, the Earth system alternated between two modes, one of cold temperatures and growing glaciers and the other of relatively warm temperatures and retreating glaciers."

Hence, the correct logical order is **QRSP** (**Option D**).""",

  "APT-ENG-3261": """- **Opening Part:** The given sentence starter is "In addition to", a complex preposition requiring a noun phrase complement. Part **R** ("threatened nesting habitat, accidental") seamlessly completes this prepositional phrase.
- **Grammatical & Logical Links:**
  - **R → Q:** The adjective "accidental" at the end of **R** modifies the noun "capture" in **Q** ("capture in fishing gear like shrimp"), forming the subject of the main clause.
  - **Q → S:** The noun "shrimp" in **Q** modifies the fishing gear specified in **S** ("trawls and gill nets continues to be the").
  - **S → P:** The linking verb and definite article "continues to be the" in **S** connect directly to the predicate noun phrase in **P** ("primary threat to the Kemp's ridley sea turtle").

**Complete Sentence:**
"In addition to threatened nesting habitat, accidental capture in fishing gear like shrimp trawls and gill nets continues to be the primary threat to the Kemp's ridley sea turtle."

Hence, the correct logical order is **RQSP** (**Option C**).""",

  "APT-ENG-3262": """- **Introductory Sentence:** Sentence **C** introduces the core thematic concept of "Giving" and describes its spiritual and emotional upliftment on an individual ("Giving soothes an individual with the vibration of joy.").
- **Logical Flow & Mandatory Pairs:**
  - **C → D:** Sentence **D** broadens the concept from individual emotional experience to a universal cosmic principle manifest throughout nature ("Unconditional giving is a natural principle and evident everywhere in nature which gives us solid, liquids and minerals.").
  - **D → A:** Sentence **A** provides the first tangible natural illustration, specifically exemplifying "liquids" mentioned in **D** ("Water gives itself away for our agriculture and other uses.").
  - **A → B:** Sentence **B** follows with a complementary natural example of giving, detailing trees and vegetation ("Trees give flowers, fruits and wood.").

**Coherent Paragraph:**
"Giving soothes an individual with the vibration of joy. Unconditional giving is a natural principle and evident everywhere in nature which gives us solid, liquids and minerals. Water gives itself away for our agriculture and other uses. Trees give flowers, fruits and wood."

Hence, the correct logical order is **CDAB** (**Option B**).""",

  "APT-ENG-3263": """- **Introductory Sentence:** Sentence **A** introduces the subject "Ashwagandha" by defining it as an adaptogenic herb and enumerating its primary medicinal benefits ("Ashwagandha is an adaptogenic herb that has multiple benefits like improving thyroid functioning and reducing blood sugar levels.").
- **Logical Flow & Mandatory Pairs:**
  - **A → C:** Sentence **C** elaborates on the herb's physiological mechanisms using the pronoun "It" ("It relaxes the nervous system and lowers cortisol (stress hormone) levels in the blood, thus making you feel calm and relaxed overall.").
  - **C → D:** Having established its therapeutic benefits, sentence **D** transitions to practical modes of intake ("You can consume Ashwagandha powder or Ashwagandha capsules.").
  - **D → B:** Sentence **B** delivers a necessary concluding caveat with the contrastive conjunction "But", advising professional medical consultation for dosage and duration ("But remember to consult a specialist while deciding the dosage and duration of continued intake.").

**Coherent Paragraph:**
"Ashwagandha is an adaptogenic herb that has multiple benefits like improving thyroid functioning and reducing blood sugar levels. It relaxes the nervous system and lowers cortisol (stress hormone) levels in the blood, thus making you feel calm and relaxed overall. You can consume Ashwagandha powder or Ashwagandha capsules. But remember to consult a specialist while deciding the dosage and duration of continued intake."

Hence, the correct logical order is **ACDB** (**Option C**).""",

  "APT-ENG-3264": """- **Introductory Sentence:** The fixed introductory statement is "Carts: carts have two solid wheels.", introducing the physical carts and their wheels.
- **Logical Flow & Mandatory Pairs:**
  - **Opening → D:** Sentence **D** immediately follows the mention of wheels by detailing their mechanical operation ("The wheels rotated on a fixed axle linked by a shaft to the yoke.").
  - **D → C:** Sentence **C** transitions from the wheels to the main carriage body ("The chassis of the two carts are made of wood and covered with thick copper sheets.").
  - **C → B:** Sentence **B** returns to the aesthetic details of the wheels, introducing copper decorative patterns ("The wheels are decorated with triangles made of copper.").
  - **B → A → Closing:** Sentence **B**'s mention of "triangles" directly introduces **A** ("The triangles are distributed in three concentric circles."), which in turn links seamlessly to the fixed closing sentence ("The concentric circles start from the hub flange of the wheel.").

**Coherent Paragraph:**
"Carts: carts have two solid wheels. The wheels rotated on a fixed axle linked by a shaft to the yoke. The chassis of the two carts are made of wood and covered with thick copper sheets. The wheels are decorated with triangles made of copper. The triangles are distributed in three concentric circles. The concentric circles start from the hub flange of the wheel."

Hence, the correct logical order is **DCBA** (**Option D**).""",

  "APT-ENG-3265": """- **Opening Part:** The given sentence starter is "The continued", an attributive adjective requiring a head noun. Part **Q** ("dominance of the athleisure trend") provides this head noun, completing the subject phrase.
- **Grammatical & Logical Links:**
  - **Q → S:** The singular subject "The continued dominance..." takes the singular verb phrase in **S** ("has had a significant impact on").
  - **S → P:** The preposition "on" at the end of **S** requires an object noun phrase, provided by **P** ("the growing sales of sneakers").
  - **P → R:** Part **R** ("along with the pursuit of comfort") concludes the sentence with an accompanying prepositional phrase qualifying the consumer trend.

**Complete Sentence:**
"The continued dominance of the athleisure trend has had a significant impact on the growing sales of sneakers along with the pursuit of comfort."

Hence, the correct logical order is **QSPR** (**Option D**).""",

  "APT-ENG-3266": """- **Introductory Sentence:** Sentence **B** introduces the primary subject and setting, "London", depicting its frenetic, noisy, and dusty urban environment ("London is known for its hectic face, frenzied movements, high decibels and dust kicked by the speeding vehicles.").
- **Logical Flow & Mandatory Pairs:**
  - **B → A:** Sentence **A** refers back to London using the pronoun "It" and adverb "here", explaining that its hostile conditions make it unfavorable for walking ("It is not a walker's paradise. So walking is not a fashionable pastime here.").
  - **A → D:** Sentence **D** outlines the personal consequence for Max using the causal phrase "For these reasons" ("For these reasons, Max never went out for a walk, nor did anyone ask him to accompany.").
  - **D → C:** Sentence **C** introduces a sharp contrast using "On the contrary", contrasting London's stressful environment with the peaceful walking culture of the countryside ("On the contrary, life in the countryside is laid back and easy paced. Unless it is raining, people set out for walk.").

**Coherent Paragraph:**
"London is known for its hectic face, frenzied movements, high decibels and dust kicked by the speeding vehicles. It is not a walker's paradise. So walking is not a fashionable pastime here. For these reasons, Max never went out for a walk, nor did anyone ask him to accompany. On the contrary, life in the countryside is laid back and easy paced. Unless it is raining, people set out for walk."

Hence, the correct logical order is **BADC** (**Option B**).""",

  "APT-ENG-3267": """- **Introductory Sentence:** Sentence **D** provides the historical starting point and chronological anchor of the English language in India, dating back to the early 1600s with the East India Company ("Since the early 1600s, the English language has had a toehold on the Indian subcontinent, when the East India Company established settlements in Chennai, Kolkata, and Mumbai, formerly Madras, Calcutta, and Bombay, respectively.").
- **Logical Flow & Mandatory Pairs:**
  - **D → B:** Sentence **B** builds on the timeline established in **D**, noting India's prolonged second-language exposure and the pervasive spread of English idioms and rhetoric ("India has had a longer exposure to English than any other country which uses it as a second language, its distinctive words, idioms, grammar and rhetoric spreading gradually to affect all places, habits and culture.").
  - **B → C:** Sentence **C** reflects on this enduring presence, observing that history remains ever-present in everyday English usage ("The historical background of India is never far away from everyday usage of English.").
  - **C → A:** Sentence **A** concludes by placing English in context alongside the rich tapestry of India's indigenous regional languages ("Dozens of distinctly different regional languages are spoken in India, which share many characteristics such as grammatical structure and vocabulary.").

**Coherent Paragraph:**
"Since the early 1600s, the English language has had a toehold on the Indian subcontinent, when the East India Company established settlements in Chennai, Kolkata, and Mumbai, formerly Madras, Calcutta, and Bombay, respectively. India has had a longer exposure to English than any other country which uses it as a second language, its distinctive words, idioms, grammar and rhetoric spreading gradually to affect all places, habits and culture. The historical background of India is never far away from everyday usage of English. Dozens of distinctly different regional languages are spoken in India, which share many characteristics such as grammatical structure and vocabulary."

Hence, the correct logical order is **DBCA** (**Option C**).""",

  "APT-ENG-3268": """- **Opening Part:** Part **D** ("Loki was represented as the companion of") establishes the grammatical subject "Loki" and the main passive verb construction ("was represented as the companion of").
- **Grammatical & Logical Links:**
  - **D → B:** The preposition "of" at the end of **D** requires a noun object, provided by **B** ("the great gods Odin and Thor, helping them with").
  - **B → C:** The preposition "with" in **B** connects directly to its complement in **C** ("his clever plans but sometimes causing").
  - **C → A:** The participle "causing" in **C** governs the direct object noun phrase in **A** ("embarrassment and difficulty for them and himself.").

**Complete Sentence:**
"Loki was represented as the companion of the great gods Odin and Thor, helping them with his clever plans but sometimes causing embarrassment and difficulty for them and himself."

Hence, the correct logical order is **D, B, C, A** (**Option A**).""",

  "APT-ENG-3269": """- **Introductory Sentence:** Sentence **C** introduces the subject "India", describing it as a large, multifaceted country with diverse religions, cultures, and languages achieving widespread success ("India, a very large country with many religions, many mini-cultures and many languages, has been achieving success in all fields.").
- **Logical Flow & Mandatory Pairs:**
  - **C → B:** Sentence **B** references India as "this nation", acknowledging that while its unity in diversity is unique, occasional problems inevitably occur ("The uniqueness of this nation lies in its unity in diversity due to which there are problems here and there at times.").
  - **B → D:** Sentence **D** uses the contrastive connector "But" to contextualize these challenges, pointing out that even smaller monolithic societies face greater issues ("But even small countries with monolithic societies have more problems than this second largest country.").
  - **D → A:** Sentence **A** concludes with a logical deduction introduced by "So", arguing that these challenges must not be interpreted as national failure ("So the problems of India should not be viewed as the failure of this great nation.").

**Coherent Paragraph:**
"India, a very large country with many religions, many mini-cultures and many languages, has been achieving success in all fields. The uniqueness of this nation lies in its unity in diversity due to which there are problems here and there at times. But even small countries with monolithic societies have more problems than this second largest country. So the problems of India should not be viewed as the failure of this great nation."

Hence, the correct logical order is **CBDA** (**Option C**).""",

  "APT-ENG-3270": """- **Introductory Sentence:** Sentence **C** sets the initial historical background and timeframe (February 1999), recounting the signing of the peace-oriented Lahore Declaration ("In February 1999, during the winter invasion, India and Pakistan signed the Lahore Declaration, which was predicated on peace.").
- **Logical Flow & Mandatory Pairs:**
  - **C → A:** Sentence **A** provides the chronological sequence following the peace accord, noting the eruption of the Kargil conflict just months later ("After a few months, the two countries engaged in the Kargil war,").
  - **A → B:** Sentence **B** uses the additive transition "Furthermore" to position the conflict within the broader history of wars fought between the two nations ("Furthermore, a number of violent wars were fought between India and Pakistan.").
  - **B → D:** Sentence **D** focuses on the intense operational hurdles of these military clashes on treacherous mountainous terrain ("The engagements were extremely challenging for the Indian army since they had to fight on rough rocky terrain.").

**Coherent Paragraph:**
"In February 1999, during the winter invasion, India and Pakistan signed the Lahore Declaration, which was predicated on peace. After a few months, the two countries engaged in the Kargil war, Furthermore, a number of violent wars were fought between India and Pakistan. The engagements were extremely challenging for the Indian army since they had to fight on rough rocky terrain."

Hence, the correct logical order is **CABD** (**Option B**).""",

  "APT-ENG-3271": """- **Opening Part:** The sentence stem ends with "There were two final", where the numeral and adjective require a head noun. Part **C** ("gifts the sorceress gave me") completes this introductory clause.
- **Grammatical & Logical Links:**
  - **C → B:** Part **B** ("a story and a parchment.") identifies the "two final gifts" mentioned in **C**.
  - **B → A:** Part **A** ("the story was the tale of Kunti") elaborates on the first gift named in **B** ("a story").
  - **A → D:** Part **D** ("mother of Arjun. The parchment was a map of Bharat's many kingdoms") provides an appositive modifier for Kunti ("mother of Arjun") and then specifies the second gift ("The parchment").

**Complete Sentence:**
"There were two final gifts the sorceress gave me a story and a parchment. The story was the tale of Kunti mother of Arjun. The parchment was a map of Bharat's many kingdoms."

Hence, the correct logical order is **CBAD** (**Option B**).""",

  "APT-ENG-3272": """- **Opening Part:** Part **Q** ("the problems of collective action were popularized by the") opens the sentence with the subject noun phrase ("the problems of collective action") and passive verb phrase ending with the agent preposition "by the".
- **Grammatical & Logical Links:**
  - **Q → P:** The preposition "by the" in **Q** requires an agent noun phrase, provided by **P** ("American political economist Mancur Olson, who wrote in 1965").
  - **P → R:** The reporting verb "wrote" in **P** governs the noun clause introduced by "that" in **R** ("that coercion or some other device must be present in order").
  - **R → S:** The idiom "in order" in **R** links directly to the purpose infinitive clause in **S** ("for a group of individuals to act in their common interest").

**Complete Sentence:**
"The problems of collective action were popularized by the American political economist Mancur Olson, who wrote in 1965 that coercion or some other device must be present in order for a group of individuals to act in their common interest."

Hence, the correct logical order is **QPRS** (**Option C**).""",

  "APT-ENG-3273": """- **Opening Part:** The given sentence subject is "The researchers", which requires a finite past-tense verb, provided by **Q** ("analyzed the electrical activity recorded").
- **Grammatical & Logical Links:**
  - **Q → S:** The participle "recorded" in **Q** is modified by the prepositional phrase in **S** ("from neurons in two of the brain's").
  - **S → P:** The possessive noun "brain's" in **S** modifies the noun phrase in **P** ("decision centers called the orbitofrontal").
  - **P → R:** The anatomical modifier "orbitofrontal" in **P** connects to the coordinated anatomical structures in **R** ("cortex and dorsal anterior cingulate cortex").

**Complete Sentence:**
"The researchers analyzed the electrical activity recorded from neurons in two of the brain's decision centers called the orbitofrontal cortex and dorsal anterior cingulate cortex."

Hence, the correct logical order is **QSPR** (**Option A**).""",

  "APT-ENG-3274": """- **Opening Part:** Part **Q** ("in the early 20th century it was almost universally assumed") introduces the sentence with a temporal adverbial followed by the preparatory subject and passive verb construction ("it was almost universally assumed").
- **Grammatical & Logical Links:**
  - **Q → R:** The verb "assumed" in **Q** takes the subordinate content clause introduced by "that" in **R** ("that traditional cultures would be completely assimilated").
  - **R → S:** The passive verb "assimilated" in **R** connects to the prepositional phrase in **S** ("into colonial cultures within a few decades, thus").
  - **S → P:** The connective adverb "thus" at the end of **S** introduces the participial result clause in **P** ("undermining the strict application of comparative anthropology").

**Complete Sentence:**
"In the early 20th century it was almost universally assumed that traditional cultures would be completely assimilated into colonial cultures within a few decades, thus undermining the strict application of comparative anthropology."

Hence, the correct logical order is **QRSP** (**Option D**).""",

  "APT-ENG-3275": """- **Introductory Sentence:** Sentence **B** describes the initial onset of alcohol consumption, explaining how casual social drinking gradually becomes a habit ("People begin drinking just for the sake of it and gradually make it a habit.").
- **Logical Flow & Mandatory Pairs:**
  - **B → D:** Sentence **D** links directly to **B** through the keyword "habit", explaining how easily a habit escalates into full addiction ("Once it becomes a habit, it does not require much to change into an addiction.").
  - **D → C:** Sentence **C** broadens the scope from habit formation to the all-encompassing adverse impacts of addiction on an individual's life ("Addiction of any kind, including alcoholic addiction impacts all aspects of an individual’s life.").
  - **C → A:** Sentence **A** specifies these impacts using the correlative construction "not only... but also...", citing social isolation and lost productivity ("It not only distances the addict from his/her social circles but also impacts their productivity badly.").

**Coherent Paragraph:**
"People begin drinking just for the sake of it and gradually make it a habit. Once it becomes a habit, it does not require much to change into an addiction. Addiction of any kind, including alcoholic addiction impacts all aspects of an individual’s life. It not only distances the addict from his/her social circles but also impacts their productivity badly."

Hence, the correct logical order is **BDCA** (**Option C**).""",

  "APT-ENG-3276": """- **Introductory Sentence:** Sentence **A** introduces the festival of "Diwali", defining its title as the 'festival of lights' and detailing the seasonal festivities and associated celebrations ("Diwali, referred to as the 'festival of lights', ushers in the winter season with joy, shopping, presents, and a slew of new occasions and celebrations, such as Dussehra, Dhanteras, Govardhan, Bhaidooj, and Narak Chaturdashi.").
- **Logical Flow & Mandatory Pairs:**
  - **A → C:** Sentence **C** specifies the religious timeframe and duration of Diwali according to the Hindu calendar ("The five-day festival of Diwali is observed during the Hindu month of Kartika as an event.").
  - **C → B:** Sentence **B** refers back to "the event" described in **C** to elucidate its core spiritual meaning ("In the spiritual world, the event symbolises 'the triumph of light over darkness'.").
  - **B → D:** Sentence **D** concludes with an additional cultural nomenclature detail ("In India, Diwali is also known as Deepawali.").

**Coherent Paragraph:**
"Diwali, referred to as the 'festival of lights', ushers in the winter season with joy, shopping, presents, and a slew of new occasions and celebrations, such as Dussehra, Dhanteras, Govardhan, Bhaidooj, and Narak Chaturdashi. The five-day festival of Diwali is observed during the Hindu month of Kartika as an event. In the spiritual world, the event symbolises 'the triumph of light over darkness'. In India, Diwali is also known as Deepawali."

Hence, the correct logical order is **ACBD** (**Option D**).""",

  "APT-ENG-3277": """- **Opening Part:** The given sentence starter is "I knew that the remedy lay not", which requires the correlative prepositional continuation "not in... but in...". Part **D** ("in finding a new flower but in what unfurling its secrets when it will.") completes this parallel structure.
- **Grammatical & Logical Links:**
  - **D → B:** Part **B** ("Rohan had advised me over and again") introduces the speaker's recollection of Rohan's persistent advice.
  - **B → A:** Part **A** ("let the past go. Be at ease. Allow the future") delivers the exact content of Rohan's advice.
  - **A → C:** The verbal phrase "Allow the future" in **A** takes the infinitive complement in **C** ("to arrive at its own pace").

**Complete Sentence:**
"I knew that the remedy lay not in finding a new flower but in what unfurling its secrets when it will. Rohan had advised me over and again let the past go. Be at ease. Allow the future to arrive at its own pace."

Hence, the correct logical order is **DBAC** (**Option A**)."""
}

with open("data/solutions/chunks/aptitude/batches_parajumble/input_batch_12.json", "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total input items: {len(items)}")
errors = 0
for item in items:
    uid = item["uid"]
    ans = item["answer"]
    exp = item["expected_sequence"]
    if uid not in solutions:
        print(f"MISSING UID: {uid}")
        errors += 1
        continue
    sol = solutions[uid]
    m = re.search(r"Hence, the correct logical order is \*\*(.*?)\*\* \(\*\*Option ([A-D])\*\*\)\.", sol)
    if not m:
        print(f"REGEX FAIL for {uid}: {sol[-80:]}")
        errors += 1
    else:
        seq, opt = m.group(1), m.group(2)
        if opt != ans:
            print(f"MISMATCH for {uid}: got Option {opt}, expected Option {ans}")
            errors += 1
        else:
            print(f"VERIFIED: {uid} -> Option {opt} (Seq: {seq})")

if errors == 0:
    out_path = "data/solutions/chunks/aptitude/batches_parajumble/output_batch_12.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(solutions, f, indent=2, ensure_ascii=False)
    print(f"SUCCESS: Saved {len(solutions)} verified solutions to {out_path}!")
else:
    print(f"FAILED with {errors} errors.")
