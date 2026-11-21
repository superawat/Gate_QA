import json
import os

solutions = {
  "APT-ENG-3412": """### Logical & Grammatical Analysis

1. **Introductory Sentence (D):** Sentence **D** (*"Two brothers lived on adjoining farms in a small village"*) introduces the primary subjects (the two brothers) and the setting without antecedent pronouns.
2. **Elaboration of Cooperation (D $\\to$ A):** Sentence **A** (*"They always shared machinery and goods as needed without a hitch."*) uses the pronoun *They* referring back to the two brothers, describing their longstanding harmonious relationship.
3. **Narrative Shift / Conflict (A $\\to$ B):** Sentence **B** (*"Then they had the first serious quarrel in 40 years of farming side by side."*) introduces the turning point using *Then*, disrupting their 40-year partnership.
4. **Consequence / Resolution (B $\\to$ C):** Sentence **C** (*"And unfortunately, the long collaboration fell apart."*) begins with the conjunction *And* to state the final unfortunate result of the quarrel.

**Coherent Paragraph:**
"Two brothers lived on adjoining farms in a small village. They always shared machinery and goods as needed without a hitch. Then they had the first serious quarrel in 40 years of farming side by side. And unfortunately, the long collaboration fell apart."

Hence, the correct logical order is **DABC** (**Option B**).""",

  "APT-ENG-3413": """### Logical & Grammatical Analysis

1. **Introductory Sentence (2):** Sentence **2** (*"Respiration is a complex physiological process vital for sustaining human life."*) introduces and defines the central biological process.
2. **Initiation of the Process (2 $\\to$ 4):** Sentence **4** (*"It begins with the inhalation of air, where oxygen travels through the airways to tiny air sacs called alveoli in the lungs."*) uses *It* to refer back to respiration, tracing the first step of inhalation and introducing *oxygen* and *alveoli*.
3. **Gas Diffusion into Blood (4 $\\to$ 1):** Sentence **1** (*"This essential gas then diffuses into the bloodstream, binding with haemoglobin in red blood cells."*) refers directly to oxygen via the demonstrative noun phrase *This essential gas* and describes its transport.
4. **Simultaneous Waste Removal (1 $\\to$ 3):** Sentence **3** (*"Simultaneously, carbon dioxide, a waste product, moves from the blood into the alveoli to be exhaled."*) uses *Simultaneously* to describe the reciprocal exchange of carbon dioxide back into the alveoli.

**Coherent Paragraph:**
"Respiration is a complex physiological process vital for sustaining human life. It begins with the inhalation of air, where oxygen travels through the airways to tiny air sacs called alveoli in the lungs. This essential gas then diffuses into the bloodstream, binding with haemoglobin in red blood cells. Simultaneously, carbon dioxide, a waste product, moves from the blood into the alveoli to be exhaled."

Hence, the correct logical order is **2, 4, 1, 3** (**Option A**).""",

  "APT-ENG-3414": """### Logical & Grammatical Analysis

1. **Introductory Sentence (2):** Sentence **2** (*"The Neolithic period marked a decisive shift from nomadic life to settled farming."*) introduces the historical era and its central development (a decisive shift).
2. **Demonstrative Reference (2 $\\to$ 1):** Sentence **1** (*"This transition allowed communities to cultivate crops and domesticate animals."*) links to the shift using the demonstrative phrase *This transition*, detailing the agricultural practices.
3. **Causal Progression (1 $\\to$ 3):** Sentence **3** (*"As food production became stable, populations expanded and villages began to form."*) details the social outcome of settled farming—food security leading to demographic growth and village formation.
4. **Historical Culmination (3 $\\to$ 4):** Sentence **4** (*"These early settlements eventually laid the groundwork for complex human civilisations."*) uses *These early settlements* to refer back to the *villages* formed in **3**, concluding with the emergence of civilization.

**Coherent Paragraph:**
"The Neolithic period marked a decisive shift from nomadic life to settled farming. This transition allowed communities to cultivate crops and domesticate animals. As food production became stable, populations expanded and villages began to form. These early settlements eventually laid the groundwork for complex human civilisations."

Hence, the correct logical order is **2 - 1 - 3 - 4** (**Option B**).""",

  "APT-ENG-3415": """### Logical & Grammatical Analysis

1. **Introductory Sentence (B):** Sentence **B** (*"Since ancient times, India has been known for its great educational system."*) establishes the broad historical theme of education in India.
2. **Historical Evidence (B $\\to$ D):** Sentence **D** (*"The country's first university, Nalanda, was founded over 1,000 years ago."*) provides concrete historical evidence supporting the ancient heritage mentioned in **B**.
3. **Chronological Shift to the Present (D $\\to$ C):** Sentence **C** (*"Today, there are thousands of schools in India, many of which are among the best in the world."*) shifts the timeline to modern times using *Today*.
4. **Logical Deduction / Conclusion (C $\\to$ A):** Sentence **A** (*"Thus, children in India have the unique opportunity to receive a world-class education."*) opens with the conclusive adverb *Thus*, summarizing the benefit derived from these world-class institutions.

**Coherent Paragraph:**
"Since ancient times, India has been known for its great educational system. The country's first university, Nalanda, was founded over 1,000 years ago. Today, there are thousands of schools in India, many of which are among the best in the world. Thus, children in India have the unique opportunity to receive a world-class education."

Hence, the correct logical order is **BDCA** (**Option C**).""",

  "APT-ENG-3416": """### Logical & Grammatical Analysis

1. **Introductory Sentence (D):** Sentence **D** (*"There are many popular theories about the solar system. Ancient People believed that the sun moved around the earth and the earth was static."*) introduces solar system theories and outlines the early geocentric view.
2. **Introduction of the Heliocentric Model (D $\\to$ C):** Sentence **C** (*"Nicholas Copernicus, a Polish priest, proposed a model in 1514."*) introduces Nicholas Copernicus and the historical proposal of an alternative model.
3. **Elaboration of the Model (C $\\to$ B):** Sentence **B** (*"Copernicus’ view was that the sun was stationary and the earth and the planets moved in orbits around the sun."*) explains the core tenet of Copernicus' view.
4. **Subsequent Scientific Validation (B $\\to$ A):** Sentence **A** (*"Two astronomers – Johannes Kepler from Germany and Galileo from Italy – supported the Copernicus theory after nearly a century passed by."*) concludes the historical chronology with later endorsement by Kepler and Galileo.

**Coherent Paragraph:**
"There are many popular theories about the solar system. Ancient People believed that the sun moved around the earth and the earth was static. Nicholas Copernicus, a Polish priest, proposed a model in 1514. Copernicus’ view was that the sun was stationary and the earth and the planets moved in orbits around the sun. Two astronomers – Johannes Kepler from Germany and Galileo from Italy – supported the Copernicus theory after nearly a century passed by."

Hence, the correct logical order is **DCBA** (**Option C**).""",

  "APT-ENG-3417": """### Logical & Grammatical Analysis

1. **Introductory Sentence (C):** Sentence **C** (*"The coconut is a very useful plant with a wide range of products being sourced from it."*) introduces the central subject (the coconut) and states its versatility.
2. **Broad Product Categories (C $\\to$ B):** Sentence **B** (*"Coconut products are used to make everything from clothing to animal feed to beauty creams."*) elaborates on the wide range of commercial applications.
3. **Specific Anatomical Components (B $\\to$ D):** Sentence **D** (*"Its kernel is harvested for its edible flesh and delicious water, while its husk is used for its strong fibres."*) details how individual parts of the plant (kernel and husk) are utilized.
4. **Climax / Primary Value (D $\\to$ A):** Sentence **A** (*"Most important, however, are its oils, which are extracted, processed, and marketed for culinary, medicinal, and cosmetic uses alike."*) uses *Most important, however* to single out oils as the most significant derivative.

**Coherent Paragraph:**
"The coconut is a very useful plant with a wide range of products being sourced from it. Coconut products are used to make everything from clothing to animal feed to beauty creams. Its kernel is harvested for its edible flesh and delicious water, while its husk is used for its strong fibres. Most important, however, are its oils, which are extracted, processed, and marketed for culinary, medicinal, and cosmetic uses alike."

Hence, the correct logical order is **CBDA** (**Option A**).""",

  "APT-ENG-3418": """### Logical & Grammatical Analysis

1. **Introductory Sentence (C):** Sentence **C** (*"Subha did really have a close circle of friends and companions; they were Sarbasi and Panguli, the two cows living in their cow-shed."*) establishes the protagonist Subha, her animal companions, and the cow-shed setting.
2. **Sensory Familiarity (C $\\to$ A):** Sentence **A** (*"Though they had never ever heard Subha utter their names, they unfailingly recognized her footsteps as she came into their shed."*) explains how the cows recognize Subha despite her muteness.
3. **Intuitive Comprehension (A $\\to$ D):** Sentence **D** (*"They understood the silent, melancholy tune of her unspoken words during those moments, and the intensity of her expressions more easily than the spoken language of other humans."*) expands upon how they grasp her unspoken emotions during their time together.
4. **Intimacy and Affection (D $\\to$ B):** Sentence **B** (*"They even understood the precious moments between them as she loved and cuddled them, scolded them, and pleaded to them."*) uses the additive adverb *even* to deepen the depiction of their mutual emotional bond.

**Coherent Paragraph:**
"Subha did really have a close circle of friends and companions; they were Sarbasi and Panguli, the two cows living in their cow-shed. Though they had never ever heard Subha utter their names, they unfailingly recognized her footsteps as she came into their shed. They understood the silent, melancholy tune of her unspoken words during those moments, and the intensity of her expressions more easily than the spoken language of other humans. They even understood the precious moments between them as she loved and cuddled them, scolded them, and pleaded to them."

Hence, the correct logical order is **CADB** (**Option C**).""",

  "APT-ENG-3419": """### Logical & Grammatical Analysis

1. **Introductory Sentence (A):** Sentence **A** (*"One morning the Giant was lying awake in bed when he heard some lovely music."*) sets the scene with the Giant in bed and introduces the initiating event (*lovely music*).
2. **Auditory Perception & Misinterpretation (A $\\to$ D):** Sentence **D** (*"It sounded so sweet to his ears that he thought it must be the King’s musicians passing by."*) uses *It* referring back to the music, describing how sweet it sounded and his initial conjecture.
3. **Discovery of the Source (D $\\to$ C):** Sentence **C** (*"It was really only a little linnet singing outside his window, but it was so long since he had heard a bird sing in his garden that it seemed to him to be the most beautiful music in the world."*) reveals the actual source of the sound—a little linnet—explaining why it seemed so extraordinary after winter.
4. **Arrival of Spring & Action (C $\\to$ B):** Sentence **B** (*"Then the Hail stopped dancing over his head, and the North Wind ceased roaring, and a delicious perfume came to him through the open casement. “I believe the Spring has come at last,” said the Giant; and he jumped out of bed and looked out."*) begins with *Then* to describe winter's departure and the Giant leaping out of bed.

**Coherent Paragraph:**
"One morning the Giant was lying awake in bed when he heard some lovely music. It sounded so sweet to his ears that he thought it must be the King’s musicians passing by. It was really only a little linnet singing outside his window, but it was so long since he had heard a bird sing in his garden that it seemed to him to be the most beautiful music in the world. Then the Hail stopped dancing over his head, and the North Wind ceased roaring, and a delicious perfume came to him through the open casement. “I believe the Spring has come at last,” said the Giant; and he jumped out of bed and looked out."

Hence, the correct logical order is **ADCB** (**Option A**).""",

  "APT-ENG-3420": """### Logical & Grammatical Analysis

1. **Introductory Sentence (P):** Sentence **P** (*"Many years ago, Paul Bunyan was born in the north-eastern American state of Maine."*) introduces the legendary protagonist Paul Bunyan and the circumstance of his birth.
2. **Parents' Initial Reaction (P $\\to$ Q):** Sentence **Q** (*"His mother and father were shocked when they first saw the boy."*) describes the parents' immediate reaction upon seeing the newborn.
3. **Reason for Shock (Q $\\to$ R):** Sentence **R** (*"Paul was so large at birth that five large birds had to carry him to his parents."*) explains the cause of their shock—his colossal size at birth.
4. **Growth in Infancy (R $\\to$ S):** Sentence **S** (*"When the boy was only a few weeks old, he weighed more than forty-five kilograms."*) chronologically progresses from birth to infancy a few weeks later.

**Coherent Paragraph:**
"Many years ago, Paul Bunyan was born in the north-eastern American state of Maine. His mother and father were shocked when they first saw the boy. Paul was so large at birth that five large birds had to carry him to his parents. When the boy was only a few weeks old, he weighed more than forty-five kilograms."

Hence, the correct logical order is **PQRS** (**Option B**).""",

  "APT-ENG-3421": """### Logical & Grammatical Analysis

1. **Opening Comparative Subject (C):** Part **C** (*"The principal difference between Indian and"*) sets up the subject comparison with the correlative construction *between ... and*.
2. **Coordinated Object & Verb (C $\\to$ B):** The conjunction *and* in **C** connects to the parallel noun phrase in **B** (*"other types of feudalism was the relation"*), which provides the linking verb *was* and the predicate noun *the relation*.
3. **Prepositional Complement (B $\\to$ D):** The noun *relation* in **B** takes the prepositional phrase in **D** (*"between lord and vassal, established in this case"*), identifying the parties involved in the feudal relationship.
4. **Manner / Agency of Establishment (D $\\to$ A):** The past participle *established* in **D** is modified by the contrasting prepositional phrases in **A** (*"by conquest, rather than by economic contract"*).

**Complete Sentence:**
"The principal difference between Indian and other types of feudalism was the relation between lord and vassal, established in this case by conquest, rather than by economic contract."

Hence, the correct logical order is **C, B, D, A** (**Option B**).""",

  "APT-ENG-3422": """### Logical & Grammatical Analysis

1. **Introductory Sentence (P):** Sentence **P** (*"The Spanish flu, also known as the 1918 flu pandemic, was a deadly pandemic in recent history."*) introduces the subject and its historical designation.
2. **Geographical & Temporal Spread (P $\\to$ Q):** Sentence **Q** (*"It spread worldwide during the year 1918-1919."*) uses the pronoun *It* to refer back to the Spanish flu, specifying the timeline and worldwide distribution.
3. **Infection Statistics (Q $\\to$ R):** Sentence **R** (*"The virus infected 500 million people — about a third of the world's population at the time."*) quantifies the global reach with infection numbers.
4. **Mortality & Historic Impact (R $\\to$ S):** Sentence **S** (*"The death toll was estimated to be at least 50 million worldwide, possibly as high as 100 million this makes it the severest pandemic in human history."*) provides estimated fatalities and concludes its historic severity.

**Coherent Paragraph:**
"The Spanish flu, also known as the 1918 flu pandemic, was a deadly pandemic in recent history. It spread worldwide during the year 1918-1919. The virus infected 500 million people — about a third of the world's population at the time. The death toll was estimated to be at least 50 million worldwide, possibly as high as 100 million this makes it the severest pandemic in human history."

Hence, the correct logical order is **PQRS** (**Option A**).""",

  "APT-ENG-3423": """### Logical & Grammatical Analysis

1. **Opening Gerund Subject (P):** Part **P** (*"engaging in physical activity"*) provides the gerund phrase functioning as the subject of the sentence.
2. **Frequency Adverbial & Modal Verb (P $\\to$ O):** Part **O** (*"on a regular basis can improve"*) modifies the gerund activity (*on a regular basis*) and introduces the modal auxiliary verb *can* with base verb *improve*.
3. **First Object & Coordinated Verb (O $\\to$ R):** The verb *improve* in **O** governs the direct object *cardiovascular health* in **R** (*"cardiovascular health, reduce"*), which ends with the parallel base verb *reduce*.
4. **Second Object & Final Predicate (R $\\to$ Q):** The transitive verb *reduce* in **R** takes the object *the risk of chronic diseases* in **Q** (*"the risk of chronic diseases, and boost mental health"*) and completes the series with a coordinated third predicate.

**Complete Sentence:**
"Engaging in physical activity on a regular basis can improve cardiovascular health, reduce the risk of chronic diseases, and boost mental health."

Hence, the correct logical order is **PORQ** (**Option C**).""",

  "APT-ENG-3424": """### Logical & Grammatical Analysis

1. **Opening Concessive Subordinate Clause (A):** Part **A** (*"although many scholars believe that"*) introduces a subordinate clause of concession that requires a declarative complement clause after *that*.
2. **Complement Proposition (A $\\to$ C):** The complementizer *that* in **A** connects to the clause in **C** (*"the painting depicts Lisa Gherardini, wife of the Florentine merchant Francesco del Giocondo,"*), ending the dependent clause with a comma.
3. **Main Independent Clause (C $\\to$ B):** Part **B** (*"no records of such a commission from Francesco exist,"*) supplies the main clause predicate, logically connecting to *Francesco* introduced in **C**.
4. **Coordinated Independent Clause (B $\\to$ D):** Part **D** (*"and the sitter has never been conclusively identified."*) joins a second independent clause with the conjunction *and*, completing the contrast.

**Complete Sentence:**
"Although many scholars believe that the painting depicts Lisa Gherardini, wife of the Florentine merchant Francesco del Giocondo, no records of such a commission from Francesco exist, and the sitter has never been conclusively identified."

Hence, the correct logical order is **A, C, B, D** (**Option D**).""",

  "APT-ENG-3425": """### Logical & Grammatical Analysis

1. **Introductory Sentence (B):** Sentence **B** (*"It is very likely for youngsters to seek advice from their elders."*) introduces the social norm of youngsters seeking elder counsel.
2. **Reciprocal Expectation (B $\\to$ D):** Sentence **D** (*"In the similar context even the elders are, in most likelihood, expected to give their advice as a word of guidance."*) balances the dynamic using *In the similar context even the elders*, describing elders' complementary role.
3. **Practical Transmission of Guidance (D $\\to$ C):** Sentence **C** (*"Emphasising upon the times that prevailed, the youth very much get their queries answered systematically."*) describes the systematic answering of queries grounded in generational experience.
4. **Underlying Cultural Rationale (C $\\to$ A):** Sentence **A** (*"It's because the 'practical people' in society boast of having a practical approach to life."*) provides the causal explanation (*It's because...*) for this societal preference for practical experience.

**Coherent Paragraph:**
"It is very likely for youngsters to seek advice from their elders. In the similar context even the elders are, in most likelihood, expected to give their advice as a word of guidance. Emphasising upon the times that prevailed, the youth very much get their queries answered systematically. It's because the 'practical people' in society boast of having a practical approach to life."

Hence, the correct logical order is **BDCA** (**Option A**).""",

  "APT-ENG-3426": """### Logical & Grammatical Analysis

1. **Subject Stem to Conditional Auxiliary (Stem $\\to$ A):** The stem *"My years in my father's house"* acts as the subject noun phrase, which is directly completed by the conditional predicate in **A** (*"would have been unbearable had"*).
2. **Inverted Conditional Clause (A $\\to$ C):** The auxiliary verb *had* in **A** leads into the inverted conditional construction in **C** (*"I not had my brother."*), followed by the new clause (*"I never forgot"*), which requires a direct object.
3. **Direct Object of Memory (C $\\to$ B):** The verb *forgot* in **C** takes the noun phrase in **B** (*"the feel of his hand clutching mine, his"*).
4. **Possessive Modifier & Concluding Sentence (B $\\to$ D):** The possessive determiner *his* at the end of **B** qualifies *refusal* in **D** (*"refusal to abandon me."*), followed by the reflective conclusion (*"Perhaps he and I would have been close even otherwise."*).

**Complete Sentence:**
"My years in my father's house would have been unbearable had I not had my brother. I never forgot the feel of his hand clutching mine, his refusal to abandon me. Perhaps he and I would have been close even otherwise."

Hence, the correct logical order is **ACBD** (**Option A**).""",

  "APT-ENG-3427": """### Logical & Grammatical Analysis

1. **Introductory Adverbial to Main Clause (Stem $\\to$ R):** The introductory temporal phrase *"Back in April"* connects directly to the independent clause in **R** (*"I was visiting family in South Carolina"*).
2. **Compound Independent Clause (R $\\to$ S):** The coordinating conjunction *and* in **S** (*"and my brother and I spent"*) introduces the second clause with the compound subject *my brother and I* and transitive verb *spent*.
3. **Object of Time & Activity (S $\\to$ P):** The verb *spent* in **S** requires a time object, provided by **P** (*"an afternoon walking around"*).
4. **Prepositional Object of Place (P $\\to$ Q):** The preposition *around* in **P** governs the proper noun location in **Q** (*"the Tillman Sand Ridge Heritage Preserve"*).

**Complete Sentence:**
"Back in April I was visiting family in South Carolina and my brother and I spent an afternoon walking around the Tillman Sand Ridge Heritage Preserve."

Hence, the correct logical order is **RSPQ** (**Option A**).""",

  "APT-ENG-3428": """### Logical & Grammatical Analysis

1. **Subject and Copula to Passive Predicate (Stem $\\to$ P):** The opening subject and verb *"Kemp's ridleys are"* connects to the adverb and participle in **P** (*"usually found in nearshore and"*).
2. **Coordinated Adjectives (P $\\to$ Q):** The conjunction *and* in **P** links the coordinated adjective *inshore* in **Q** (*"inshore waters of the northern"*).
3. **Geographical Specifics (Q $\\to$ R):** The modifier *northern* in **Q** completes the proper noun in **R** (*"Gulf of Mexico, especially in Louisiana waters,"*).
4. **Non-Restrictive Relative Clause (R $\\to$ S):** The relative pronoun *which* in **S** (*"which are their primary feeding grounds"*) refers back to the waters mentioned in **R**, defining their ecological role.

**Complete Sentence:**
"Kemp's ridleys are usually found in nearshore and inshore waters of the northern Gulf of Mexico, especially in Louisiana waters, which are their primary feeding grounds."

Hence, the correct logical order is **PQRS** (**Option C**).""",

  "APT-ENG-3429": """### Logical & Grammatical Analysis

1. **Passive Predicate to Prepositional Phrase (Stem $\\to$ Q):** The opening passive construction *"We are encouraged"* is complemented by the prepositional phrase of agency in **Q** (*"by how women are embracing online"*).
2. **Adjective to Noun Complement (Q $\\to$ S):** The adjective *online* in **Q** modifies *learning* in **S** (*"learning to develop new skills that can"*).
3. **Relative Clause Modal Verb (S $\\to$ P):** The modal auxiliary *can* at the end of **S** requires the base verb in **P** (*"help accelerate their return to"*).
4. **Prepositional Object & Compound Predicate (P $\\to$ R):** The preposition *to* in **P** connects to *work* in **R** (*"work and promote economic mobility"*), completing the parallel predicates *accelerate* and *promote*.

**Complete Sentence:**
"We are encouraged by how women are embracing online learning to develop new skills that can help accelerate their return to work and promote economic mobility."

Hence, the correct logical order is **QSPR** (**Option A**).""",

  "APT-ENG-3430": """### Logical & Grammatical Analysis

1. **Negative Infinitive Complement (Stem $\\to$ P):** The subject noun phrase *"The decision not"* requires the negative infinitive verb phrase in **P** (*"to include any kind of wealth or"*).
2. **Coordinated Tax Noun (P $\\to$ R):** The conjunction *or* in **P** coordinates *wealth* with *income tax* in **R** (*"income tax, which would be the fairer option"*).
3. **Prepositional Purpose Phrase (R $\\to$ S):** The clause complement in **R** is followed by the purpose prepositional phrase in **S** (*"for solving the social care funding"*).
4. **Noun Compound & Main Predicate (S $\\to$ Q):** The noun adjunct *funding* in **S** combines with *crisis* in **Q** (*"crisis, has proven controversial"*), which provides the main predicate verb *has proven controversial*.

**Complete Sentence:**
"The decision not to include any kind of wealth or income tax, which would be the fairer option for solving the social care funding crisis, has proven controversial."

Hence, the correct logical order is **PRSQ** (**Option B**).""",

  "APT-ENG-3431": """### Logical & Grammatical Analysis

1. **Introductory Sentence (B):** Sentence **B** (*"Colonel Harland Sanders' real-life story of being disappointed numerous times in his life and still making his ambition come true late in life is truly motivating."*) introduces Colonel Sanders and the central theme of overcoming failure late in life.
2. **Early Background & Failures (B $\\to$ D):** Sentence **D** (*"He is a seventh-grade dropout who tried many things in life but found them bitter."*) uses the pronoun *He* to trace his early struggles and lack of formal education.
3. **Mid-Life Endeavour (D $\\to$ C):** Sentence **C** (*"He began selling chicken at the age of 40, but his dream of opening a restaurant was repeatedly denied owing to conflicts and wars."*) moves the biography to age 40 and his repeated restaurant setbacks.
4. **Subsequent Expansion (C $\\to$ A):** Sentence **A** (*"He later tried to franchise his restaurant."*) uses *later* to denote the eventual breakthrough step of franchising following the earlier restaurant difficulties.

**Coherent Paragraph:**
"Colonel Harland Sanders' real-life story of being disappointed numerous times in his life and still making his ambition come true late in life is truly motivating. He is a seventh-grade dropout who tried many things in life but found them bitter. He began selling chicken at the age of 40, but his dream of opening a restaurant was repeatedly denied owing to conflicts and wars. He later tried to franchise his restaurant."

Hence, the correct logical order is **BDCA** (**Option B**)."""
}

out_path = "data/solutions/chunks/aptitude/batches_parajumble/output_batch_19.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {out_path} with {len(solutions)} solutions.")
