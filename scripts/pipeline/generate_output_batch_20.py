import json
import os

solutions = {
  "APT-ENG-3432": """### Logical & Grammatical Analysis

1. **Introductory Context:** The given opening sentence establishes Germany's invasion of the Low Countries and northern France in May 1940 as the immediate context of the Dunkirk evacuation.
2. **Chronological Progression in the Netherlands (R $\\to$ P $\\to$ Q):**
   - **R:** Begins the timeline on May 10 with the German blitzkrieg invasion of the Netherlands by parachutists capturing key bridges.
   - **P:** Follows on May 12, as Dutch defenders fell back westward and German tanks reached the outskirts of Rotterdam.
   - **Q:** Culminates on May 13–14 with Queen Wilhelmina fleeing to England and the subsequent surrender of the Dutch army.
3. **Transition to Belgium (Q $\\to$ S):** Part **S** turns to the second Low Country (*"The invasion of Belgium also began on May 10..."*), which connects smoothly to the fixed concluding sentence describing the Belgian front breaking on May 11.

**Coherent Paragraph:**
"The immediate context of the Dunkirk evacuation was Germany’s invasion of the Low Countries and northern France in May 1940. On May 10 the German blitzkrieg attack on the Netherlands began with the capture by parachutists of key bridges deep within the country, with the aim of opening the way for mobile ground forces. The Dutch defenders fell back westward, and by noon on May 12 German tanks were on the outskirts of Rotterdam. Queen Wilhelmina and her government left the country for England on May 13, and the next day the Dutch army surrendered to the Germans. The invasion of Belgium also began on May 10, when German airborne troops landed on the fortress of Eben Emasl, immediately opposite Maastricht, and on bridges over the Albert Canal. On May 11 the Belgian front was broken, and German tanks ran on westward while Belgian, French, and British divisions fell back to a line between Antwerp and Namur."

Hence, the correct logical order is **RPQS** (**Option B**).""",

  "APT-ENG-3433": """### Logical & Grammatical Analysis

1. **Opening Independent Clause (D):** Part **D** (*"the light has gone out of our lives"*) provides the primary subject and verb phrase (*the light has gone out*), establishing the central metaphorical statement.
2. **Coordinate Clause Link (D $\\to$ B):** The coordinating conjunction *and* in **B** (*"and there is darkness everywhere"*) links directly to **D**, contrasting the departure of light with pervasive darkness.
3. **Reflective Transition (B $\\to$ C):** Part **C** (*"and I do not quite know"*) introduces the speaker's emotional state using another coordinate clause.
4. **Indirect Question Object (C $\\to$ A):** The transitive cognitive verb *know* in **C** governs the dual indirect questions in **A** (*"what to tell you and how to say it"*).

**Complete Sentence:**
"The light has gone out of our lives and there is darkness everywhere and I do not quite know what to tell you and how to say it."

Hence, the correct logical order is **DBCA** (**Option B**).""",

  "APT-ENG-3434": """### Logical & Grammatical Analysis

1. **Opening Subject & Verb (D):** Part **D** (*"now he knows"*) supplies the temporal adverb *now*, the subject pronoun *he*, and the finite verb *knows*.
2. **Direct Object (D $\\to$ A):** The transitive verb *knows* takes the direct noun phrase object in **A** (*"the importance"*).
3. **Prepositional Complement (A $\\to$ C):** The noun *importance* in **A** is complemented by the prepositional phrase in **C** (*"of treating other people"*).
4. **Comparative Clause & Infinitive (C $\\to$ E $\\to$ B):** Part **E** (*"as he would like"*) introduces a comparative clause modifying the treatment, and the catenative verb construction *would like* governs the passive infinitive complement in **B** (*"to be treated"*).

**Complete Sentence:**
"Now he knows the importance of treating other people as he would like to be treated."

Hence, the correct logical order is **D, A, C, E, B** (**Option A**).""",

  "APT-ENG-3435": """### Logical & Grammatical Analysis

1. **Opening Subject & Main Verb (S):** Part **S** (*"we recently successfully treated five patients for gallbladder"*) establishes the main clause with subject pronoun *we*, adverb *successfully*, verb *treated*, and the patient cohort.
2. **Compound Noun Link (S $\\to$ P):** The noun *gallbladder* at the end of **S** joins with the noun in **P** (*"gangrene, who had recovered from Covid-19 infection and"*) to form the diagnosis *gallbladder gangrene*. The relative pronoun *who* refers to the patients.
3. **Coordinate Predicate (P $\\to$ R):** The past perfect verb in **P** (*"had recovered... and"*) coordinates with the second past-tense verb in **R** (*"presented with severe inflammation of gallbladder without"*).
4. **Prepositional Object (R $\\to$ Q):** The preposition *without* in **R** takes the noun phrase object in **Q** (*"gallstones resulting in gangrene of gallbladder requiring urgent surgery"*).

**Complete Sentence:**
"We recently successfully treated five patients for gallbladder gangrene, who had recovered from Covid-19 infection and presented with severe inflammation of gallbladder without gallstones resulting in gangrene of gallbladder requiring urgent surgery."

Hence, the correct logical order is **SPRQ** (**Option A**).""",

  "APT-ENG-3436": """### Logical & Grammatical Analysis

1. **Opening Prepositional Complement (Q):** The sentence starter *"The nanostructures on the"* requires the locational noun phrase provided by **Q** (*"surface made of nickel selenide"*).
2. **Material Modifier (Q $\\to$ P):** Part **P** (*"with added, or \\"doped,\\" iron and phosphor"*) functions as an adjectival prepositional phrase specifying the chemical composition of the nickel selenide surface.
3. **Predicate Verb (P $\\to$ R):** Part **R** (*"offers the high performance and stability"*) supplies the main transitive verb *offers* and its compound direct object.
4. **Relative Clause (R $\\to$ S):** The relative pronoun *that* in **S** (*"that are needed for industrial-scale electrolysis"*) introduces a restrictive clause defining the exact requirements for performance and stability.

**Complete Sentence:**
"The nanostructures on the surface made of nickel selenide with added, or \\"doped,\\" iron and phosphor offers the high performance and stability that are needed for industrial-scale electrolysis."

Hence, the correct logical order is **QPRS** (**Option A**).""",

  "APT-ENG-3437": """### Logical & Grammatical Analysis

1. **Introductory Sentence (D):** Sentence **D** establishes the historical inception of the English language on the subcontinent in the early 1600s with the East India Company's settlements.
2. **Historical Depth & Cultural Spread (D $\\to$ B):** Sentence **B** expands on this timeline, noting that India has had a longer exposure to English than any other second-language nation, with idioms and grammar spreading across all spheres.
3. **Modern Reflection (B $\\to$ C):** Sentence **C** links this historical depth to contemporary communication, noting that India's historical background remains closely tied to everyday English usage.
4. **Indigenous Linguistic Context (C $\\to$ A):** Sentence **A** contextualizes English alongside the dozens of distinct regional languages in India that share grammatical structures and vocabulary.

**Coherent Paragraph:**
"Since the early 1600s, the English language has had a toehold on the Indian subcontinent, when the East India Company established settlements in Chennai, Kolkata, and Mumbai, formerly Madras, Calcutta, and Bombay, respectively. India has had a longer exposure to English than any other country which uses it as a second language, its distinctive words, idioms, grammar and rhetoric spreading gradually to affect all places, habits and culture. The historical background of India is never far away from everyday usage of English. Dozens of distinctly different regional languages are spoken in India, which share many characteristics such as grammatical structure and vocabulary."

Hence, the correct logical order is **DBCA** (**Option C**).""",

  "APT-ENG-3438": """### Logical & Grammatical Analysis

1. **Introductory Sentence (D):** Sentence **D** defines the origin of modern graphology in the early 19th century with Jean Hippolyte Michon's first catalogue.
2. **Transition to Corporate Application (D $\\to$ C):** Sentence **C** shifts from historical origins to modern industry (*"Despite public scepticism, graphology plays a covert role in British management."*).
3. **Executive Scope (C $\\to$ B):** Sentence **B** details how companies utilize it (*"Many companies use it for executive recruitment and analysis."*).
4. **Pronoun Reference & Diagnostic Function (B $\\to$ A):** Sentence **A** uses the pronoun *them* to refer back to *companies* in **B**, detailing what graphology reveals about candidates' temperaments and traits.

**Coherent Paragraph:**
"Modern graphology began early in the 19th century when French churchman Jean Hippolyte Michon created the first graphological 'catalogue'. Despite public scepticism, graphology plays a covert role in British management. Many companies use it for executive recruitment and analysis. Graphology tells them about the candidates' temperaments, highlighting both, weaknesses and strengths."

Hence, the correct logical order is **DCBA** (**Option A**).""",

  "APT-ENG-3443": """### Logical & Grammatical Analysis

1. **Introductory Sentence (C):** Sentence **C** announces the declaration of the Good Governance Index (GGI) 2021 scores, establishing the primary subject.
2. **Framework Scope (C $\\to$ B):** Sentence **B** introduces the structure of the GGI framework, covering 10 sectors and 58 industries.
3. **Sectoral Elaboration (B $\\to$ A):** Sentence **A** specifies the sectors (*"The sectors included agriculture, public health and public utilities among others."*), linking directly to the 10 sectors in **B**.
4. **Comparative Objective (A $\\to$ D):** Sentence **D** explains the benchmark objective (*"The objective was to provide quantifiable data to compare the performance of different States and Union Territories in these sectors."*), referencing *these sectors*.

**Coherent Paragraph:**
"The Good Governance Index (GGI) 2021scores have been declared. The GGI framework covered 10 sectors and 58 Industries. The sectors included agriculture, public health and public utilities among others. The objective was to provide quantifiable data to compare the performance of different States and Union Territories in these sectors."

Hence, the correct logical order is **CBAD** (**Option B**).""",

  "APT-ENG-3444": """### Logical & Grammatical Analysis

1. **Opening Subject & Verb (P):** Part **P** (*"dreams provide an escape"*) introduces the subject *dreams* and the transitive action *provide an escape*.
2. **Directional Prepositional Phrase (P $\\to$ R):** The noun *escape* naturally pairs with the destination phrase in **R** (*"into a world"*).
3. **Adjectival Qualification (R $\\to$ O):** The prepositional phrase in **O** (*"of endless possibilities"*) qualifies *world*.
4. **Relative Adverbial Clause (O $\\to$ Q):** The relative adverb *where* in **Q** (*"where reality is suspended"*) describes the condition within this world.

**Complete Sentence:**
"Dreams provide an escape into a world of endless possibilities where reality is suspended."

Hence, the correct logical order is **PROQ** (**Option B**).""",

  "APT-ENG-3445": """### Logical & Grammatical Analysis

1. **Opening Infinitive (P):** The starter *"Lighting has"* requires an infinitive to express necessity, supplied by **P** (*"to become a disrupter and"*).
2. **Parallel Bare Infinitive (P $\\to$ Q):** The conjunction *and* in **P** connects to the parallel verb in **Q** (*"become human-centric as our"*).
3. **Temporal Clause (Q $\\to$ R):** The subordinating conjunction *as our* in **Q** leads into the subject and predicate in **R** (*"requirements change during the day and"*).
4. **Coordinated Independent Clause (R $\\to$ S):** The conjunction *and* in **R** links to the independent clause in **S** (*"lighting has to adapt to our change in needs"*).

**Complete Sentence:**
"Lighting has to become a disrupter and become human-centric as our requirements change during the day and lighting has to adapt to our change in needs."

Hence, the correct logical order is **PQRS** (**Option D**).""",

  "APT-ENG-3446": """### Logical & Grammatical Analysis

1. **Introductory Locative Phrase (R):** Part **R** (*"in all advanced industrial societies the proportion of infirm"*) opens with a locative adverbial phrase followed by the initial noun phrase *the proportion of infirm*.
2. **Subject Completion & Concessive Marker (R $\\to$ P):** Part **P** (*"elderly is on the increase, and, although they constitute only"*) provides the noun *elderly*, the singular verb *is*, and introduces a concessive clause with *although*.
3. **Concessive Object (P $\\to$ Q):** The verb *constitute* in **P** takes the object in **Q** (*"a small minority of the retired population, their"*), ending with the possessive determiner *their*.
4. **Main Clause Resolution (Q $\\to$ S):** The possessive determiner *their* governs the subject in **S** (*"claim on social services is disproportionately heavy"*).

**Complete Sentence:**
"In all advanced industrial societies the proportion of infirm elderly is on the increase, and, although they constitute only a small minority of the retired population, their claim on social services is disproportionately heavy."

Hence, the correct logical order is **RPQS** (**Option D**).""",

  "APT-ENG-3447": """### Logical & Grammatical Analysis

1. **Introductory Sentence (D):** Sentence **D** introduces the personal challenge of learning how to swim (*"One of the hardest things I've had to do was to learn how to swim."*).
2. **Initial Motivation Despite Fear (D $\\to$ A):** Sentence **A** presents the author's mindset (*"Although I had a fear of water, I thought it was an important skill I should learn."*).
3. **Additional Physical Goal (A $\\to$ C):** Sentence **C** adds another anticipated benefit using *also* (*"I also thought it would be a good exercise that would make me physically stronger."*).
4. **Unexpected Psychological Outcome (C $\\to$ B):** Sentence **B** uses *However* to share the unexpected personal growth (*"However, what I didn't realize was that it would also make me a more confident person."*).

**Coherent Paragraph:**
"One of the hardest things I've had to do was to learn how to swim. Although I had a fear of water, I thought it was an important skill I should learn. I also thought it would be a good exercise that would make me physically stronger. However, what I didn't realize was that it would also make me a more confident person."

Hence, the correct logical order is **DACB** (**Option C**).""",

  "APT-ENG-3448": """### Logical & Grammatical Analysis

1. **Introductory Observation (C):** Sentence **C** makes a broad social observation about idle individuals sitting and doing nothing.
2. **Focus on Employed Persons (C $\\to$ D):** Sentence **D** narrows the focus to workplace punctuality (*"Even those who are employed often come late to office and leave early..."*).
3. **Workplace Indiscipline (D $\\to$ B):** Sentence **B** describes their actions during office hours (*"Once in office, they receive friends and relatives who call them any time without prior appointment."*).
4. **Additive Misuse of Time (B $\\to$ A):** Sentence **A** adds further personal distractions using *also* (*"They also visit ailing friends and relatives, or attend to personal matters even during office hours."*).

**Coherent Paragraph:**
"We can frequently find a large number of people sitting here and there and doing nothing. Even those who are employed often come late to office and leave early unless they are forced to be punctual. Once in office, they receive friends and relatives who call them any time without prior appointment. They also visit ailing friends and relatives, or attend to personal matters even during office hours."

Hence, the correct logical order is **CDBA** (**Option C**).""",

  "APT-ENG-3450": """### Logical & Grammatical Analysis

1. **Narrative Opening (B):** Sentence **B** opens with an empathetic remark highlighting a tragic shock (*"It must have been a terrible shock for a young girl."*).
2. **Character & Marital Context (B $\\to$ C):** Sentence **C** explains who the girl is by describing the newly married couple returning from their honeymoon.
3. **Celebratory Event (C $\\to$ A):** Sentence **A** describes the homecoming ball organized to celebrate their return.
4. **Tragic Incident (A $\\to$ D):** Sentence **D** reveals the tragic cause of the shock (*"Just as the guests were starting to arrive, Charnley locked himself into his bedroom and shot himself."*).

**Coherent Paragraph:**
"It must have been a terrible shock for a young girl. They had been married a month, just home from their honeymoon. A big fancy dress ball was arranged to celebrate their homecoming. Just as the guests were starting to arrive, Charnley locked himself into his bedroom and shot himself."

Hence, the correct logical order is **BCAD** (**Option C**).""",

  "APT-ENG-3451": """### Logical & Grammatical Analysis

1. **Introductory Definition (4):** Sentence **4** defines evaporation as a key hydrological process moving water from liquid bodies into the atmosphere.
2. **Physical Mechanism (4 $\\to$ 2):** Sentence **2** explains how evaporation occurs when surface molecules gain sufficient thermal energy to escape as vapor.
3. **Environmental Factors (2 $\\to$ 3):** Sentence **3** details the governing variables (temperature, humidity, and wind speed).
4. **Planetary Importance (3 $\\to$ 1):** Sentence **1** summarizes the macro-level significance of *\"This process, known as evaporation\"* in thermal regulation and the water cycle.

**Coherent Paragraph:**
"Evaporation is one of the key processes through which water moves from oceans, lakes, and rivers into the air. It occurs when water molecules at the surface gain enough energy to escape into the atmosphere as vapor. The rate of evaporation depends on several factors such as temperature, humidity, and wind speed. This process, known as evaporation, plays a crucial role in regulating Earth's temperature and maintaining the water cycle."

Hence, the correct logical order is **4, 2, 3, 1** (**Option A**).""",

  "APT-ENG-3452": """### Logical & Grammatical Analysis

1. **Introductory Problem (A):** Sentence **A** introduces the depletion of fossil fuels driven by sharply increasing consumption.
2. **Additive Environmental Consequence (A $\\to$ C):** Sentence **C** uses *also* to introduce the release of toxic pollutants from burning these fuels.
3. **Illustrative Analogy (C $\\to$ B):** Sentence **B** illustrates unchecked consumption through the analogy of a dripping tap that will eventually run dry.
4. **Resulting Solution (B $\\to$ D):** Sentence **D** uses *\"This has led to\"* to state the shift toward tapping cleaner non-conventional energy alternatives.

**Coherent Paragraph:**
"The sharp increase in our consumption of fossil fuels has led to their depletion at an alarming rate. The toxic pollutants released from burning these fuels are also a cause for concern. Unchecked burning of fossil fuel is like an unchecked dripping tap which will eventually run dry. This has led to the tapping of various non-conventional sources of energy that are cleaner alternatives to fossil fuels."

Hence, the correct logical order is **ACBD** (**Option C**).""",

  "APT-ENG-3453": """### Logical & Grammatical Analysis

1. **Introductory Theme (B):** Sentence **B** introduces leadership as a crucial element in management determining success or failure.
2. **Contemporary Contrast (B $\\to$ C):** Sentence **C** contrasts current scarcity of leaders with ancient times due to reluctance in accepting responsibility.
3. **Ancient Indian Heritage (C $\\to$ D):** Sentence **D** elaborates on ancient traditions, citing historical and spiritual leaders produced on Indian soil (Chandragupta Maurya, Gandhi, Buddha, Bose).
4. **Demonstrative Link & Core Quality (D $\\to$ A):** Sentence **A** refers back to the icons in **D** using *\"These great leaders\"*, explaining that they embraced responsibility to achieve greatness.

**Coherent Paragraph:**
"Leadership is one of the crucial elements in the field of management because most of the time success or failure depends on the managerial skills of a leader. There are not many leaders in the present world because, unlike ancient times, people are not ready to accept responsibilities. Ancient India produced millions of people with leadership because it is an inner part of Indian culture to create leaders in every sphere of life. Chandragupta Mourya, Gandhi, Buddha, Bose etc. were leaders on this soil. These great leaders never escaped from their responsibilities and challenges because they knew greatness would come through great responsibilities."

Hence, the correct logical order is **BCDA** (**Option D**).""",

  "APT-ENG-3454": """### Logical & Grammatical Analysis

1. **Introductory Announcement (B):** Sentence **B** establishes the core event—the Western allies' announcement of restrictive economic sanctions against Russia.
2. **First Financial Measure (B $\\to$ D):** Sentence **D** details the initial measure of blocking selected Russian banks from the SWIFT international payment messaging system.
3. **Second Sanction Measure (D $\\to$ A):** Sentence **A** uses *\"They also resolved\"* to introduce restrictions on the Russian central bank's foreign exchange reserves.
4. **Economic Fallout (A $\\to$ C):** Sentence **C** outlines the immediate domestic market consequences of *these moves*, noting the depreciation of the Rouble.

**Coherent Paragraph:**
"Saturday's announcement by the US, the UK and European allies, including France and Germany, of a raft of 'further restrictive economic measures' to increase the costs on Russia for its invasion of Ukraine has just raised the risks of a more widespread economic fallout from this war. With a view to further isolating Russia from the international financial system, the Western allies decided to block 'selected' Russian banks from the SWIFT messaging system that banks and financial institutions use to validate and complete international payment transactions. They also resolved to impose restrictions on the Russian central bank's ability to access and deploy the country's 'war chest' of an estimated $630 billion in foreign exchange reserves. The immediate impact of these moves on Russia's economy and financial markets have manifested in a sharp depreciation in the value of the Rouble."

Hence, the correct logical order is **BDAC** (**Option A**).""",

  "APT-ENG-3455": """### Logical & Grammatical Analysis

1. **Core Marketing Premise (A):** Sentence **A** states that understanding consumer behaviour is essential for marketers to make strategic decisions.
2. **Predictive Capacity (A $\\to$ D):** Sentence **D** explains that comprehensive knowledge of consumer preferences allows marketers to predict customer response.
3. **Operational Applications (D $\\to$ C):** Sentence **C** begins with *Thus*, detailing how studying consumer behaviour aids scheduling, pricing, positioning, and advertising.
4. **Broadened Application (C $\\to$ B):** Sentence **B** broadens the scope using *equally important*, highlighting its necessity for non-profit and public organizations.

**Coherent Paragraph:**
"It is essential for the marketer to study the behaviour of the consumers in order to make better strategic marketing decisions. If the marketer has complete knowledge about the consumer’s likings or disliking, then he can predict the response of the potential customers towards his offerings. Thus, by studying the consumer behaviour before and during purchase helps in production scheduling, designing, pricing, positioning, segmentation, advertising and other promotional activities. The study of consumer behaviour is equally important for the non-profit organisations such as governmental agencies, hospitals, NGOs, charitable organisations."

Hence, the correct logical order is **ADCB** (**Option A**).""",

  "APT-ENG-3456": """### Logical & Grammatical Analysis

1. **Introductory Biological Fact (C):** Sentence **C** introduces the respiratory requirement of sharks, stating that many types must remain in motion to receive oxygen.
2. **Obligate Ram Ventilators (C $\\to$ A):** Sentence **A** links to **C** via *\"These kinds of sharks\"*, defining them as *obligate ram ventilators* that force water through their gills while swimming.
3. **Alternative Mechanism (A $\\to$ B):** Sentence **B** introduces *buccal pumping*, an active muscular method of pulling in water without swimming.
4. **Stationary Adaptations (B $\\to$ D):** Sentence **D** completes the classification with *\"Other types of sharks\"*, explaining that bottom-dwelling stationary sharks use *spiracles* to pump water across gills while resting.

**Coherent Paragraph:**
"It is true that many types of sharks must keep moving in order to receive life-giving oxygen from the water passing through their gills. These kinds of sharks are known as obligate ram ventilators because they draw water in through their mouths and force it out through their gills. They use a method called buccal pumping, in which water is pulled in through the mouth and forced out through the gills by the cheek muscles. Other types of sharks are able to remain stationary because they possess special structures called  spiracles, which force water out through their gills."

Hence, the correct logical order is **CABD** (**Option D**)."""
}

out_path = "data/solutions/chunks/aptitude/batches_parajumble/output_batch_20.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {out_path} with {len(solutions)} solutions.")
