import json

solutions = {
  "APT-ENG-3589": """- **Introductory Sentence:** Sentence **B** initiates the passage by directly addressing the reader with a practical suggestion: "Next time you meet your grandparents ask them about their lifestyle."
- **Logical Flow & Mandatory Pairs:**
  - **B → D:** Sentence **D** immediately follows **B** by specifying what questions to ask them ("Ask them what homemade remedies they use and what habits they follow").
  - **D → C:** Sentence **C** explains the practical utility of those answers ("Some of the tips may save you a run or two to the pharmacy").
  - **C → A:** Sentence **A** provides an overarching concluding reflection on the value of their wisdom ("Our elders are like living libraries").

**Coherent Paragraph:**
"Next time you meet your grandparents ask them about their lifestyle. Ask them what homemade remedies they use and what habits they follow. Some of the tips may save you a run or two to the pharmacy. Our elders are like living libraries."

Hence, the correct logical order is **B, D, C, A** (**Option A**).""",

  "APT-ENG-3590": """- **Introductory Sentence:** Sentence **D** introduces the primary subject and prevailing trend without antecedent pronouns: "Herbal medicines are a new trend these days."
- **Logical Flow & Mandatory Pairs:**
  - **D → A:** Sentence **A** directly references "Herbal medicines" using the demonstrative phrase "these medicines" and states the common belief that they heal ailments safely.
  - **A → B:** Sentence **B** links directly to the concept of "safe healing" introduced in **A**, defining it as healing that does not have side effects.
  - **B → C:** Sentence **C** concludes the paragraph by affirming that positive healing without unwanted bodily effects is precisely what drives the trend mentioned in **D**.

**Coherent Paragraph:**
"Herbal medicines are a new trend these days. There is a general belief that these medicines heal ailments safely. The 'safe healing' is actually that which doesn't have any side effects. Positive healing without any unwanted effect on the body drives the trend."

Hence, the correct logical order is **DABC** (**Option C**).""",

  "APT-ENG-3593": """- **Introductory Sentence:** Sentence **D** introduces the historical event and inventor: "Alessandro Volta discovered electric battery."
- **Logical Flow & Mandatory Pairs:**
  - **D → C:** Sentence **C** uses the pronoun "He" to refer back to Alessandro Volta, explaining the first step of his experiment ("He made two strips of different metals").
  - **C → B:** Sentence **B** connects to the two strips via the demonstrative noun phrase "These metal strips", describing their immersion in an acid solution.
  - **B → A:** Sentence **A** completes the experimental description by showing the circuit connection and electrical result ("When we connect this design with a wire, electricity flows").

**Coherent Paragraph:**
"Alessandro Volta discovered electric battery. He made two strips of different metals. These metal strips were put in a sulphuric acid solution. When we connect this design with a wire, electricity flows."

Hence, the correct logical order is **DCBA** (**Option B**).""",

  "APT-ENG-3594": """- **Introductory Sentence:** Sentence **1** introduces the broad, overarching theme: "Artificial intelligence is transforming industries worldwide."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** specifies the technological capabilities that enable AI to transform industries ("data analysis, pattern recognition, and automation").
  - **2 → 3:** Sentence **3** describes how businesses capitalize on these capabilities by investing heavily to improve efficiency and decision-making.
  - **3 → 4:** Sentence **4** concludes with a balanced critical appraisal, noting that this rapid development raises ethical and societal questions requiring careful consideration.

**Coherent Paragraph:**
"Artificial intelligence is transforming industries worldwide. AI systems can perform tasks such as data analysis, pattern recognition, and automation. Businesses are investing heavily in AI to improve efficiency and decision-making. Its development raises ethical and societal questions that need careful consideration."

Hence, the correct logical order is **1 - 2 - 3 - 4** (**Option A**).""",

  "APT-ENG-3595": """- **Introductory Sentence:** Sentence **1** introduces and defines the central subject: "Emotional intelligence enables individuals to manage their feelings and relationships effectively."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** uses the pronoun "It" to enumerate the core constituents of emotional intelligence ("empathy, self-awareness, and emotional regulation").
  - **2 → 3:** Sentence **3** contrasts emotional intelligence with conventional academic intelligence, highlighting its focus on interpersonal and self-understanding.
  - **3 → 4:** Sentence **4** provides the concluding deduction marked by "Hence", stating its crucial application in leadership and teamwork.

**Coherent Paragraph:**
"Emotional intelligence enables individuals to manage their feelings and relationships effectively. It involves empathy, self-awareness, and emotional regulation. Unlike academic intelligence, it focuses on understanding oneself and others. Hence, it plays a crucial role in leadership and teamwork."

Hence, the correct logical order is **1-2-3-4** (**Option C**).""",

  "APT-ENG-3596": """- **Introductory Sentence:** Sentence **1** establishes the baseline ecological role of forests as natural regulators absorbing carbon dioxide, releasing oxygen, and sustaining biodiversity.
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** introduces the disruptive threat using the contrastive transition "However", explaining how rapid deforestation impairs these balances.
  - **2 → 3:** Sentence **3** refers directly to the damage caused in **2** with the noun phrase "This degradation", detailing its acceleration of climate change and species extinction.
  - **3 → 4:** Sentence **4** presents the concluding imperative marked by "therefore", urging forest protection and restoration through sustainable practices.

**Coherent Paragraph:**
"Forest ecosystems act as natural regulators by absorbing carbon dioxide, releasing oxygen, and supporting diverse forms of life. However, rapid deforestation caused by urban expansion, logging, and agriculture has severely disrupted these ecological balances. This degradation not only accelerates climate change but also threatens countless species with extinction. Protecting and restoring forests through sustainable practices is therefore essential to preserve biodiversity and maintain global climate stability."

Hence, the correct logical order is **1, 2, 3, 4** (**Option C**).""",

  "APT-ENG-3597": """- **Introductory Sentence:** Sentence **1** introduces the core issue and threat: "Overfishing remains one of the greatest threats to global fish populations, disrupting marine ecosystems at an alarming rate."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** explains the causal mechanism of overfishing, describing what occurs when adult fish are extracted faster than reproduction rates.
  - **2 → 5:** Sentence **5** transitions from the crisis to the solution, emphasizing the necessity of balancing harvesting and replenishment.
  - **5 → 3:** Sentence **3** gives concrete examples of sustainable practices that restore balance (regulated catch limits and protected breeding zones).
  - **3 → 4:** Sentence **4** evaluates these solutions with the demonstrative phrase "These measures", detailing their benefits for both ecological stability and coastal livelihoods.

**Coherent Paragraph:**
"Overfishing remains one of the greatest threats to global fish populations, disrupting marine ecosystems at an alarming rate. When adult fish are removed faster than they can reproduce, entire species face long-term decline. Recognising the delicate relationship between harvesting and replenishment is crucial for maintaining healthy fish populations across the world. Sustainable fishing practices, such as regulated catch limits and protected breeding zones, help restore balance to marine environments. These measures not only support ecological stability but also ensure that coastal communities can rely on fisheries for future livelihoods."

Hence, the correct logical order is **1 - 2 - 5 - 3 - 4** (**Option C**).""",

  "APT-ENG-3598": """- **Introductory Sentence:** Sentence **1** introduces the sensory experience: "The fragrance that rises from the earth after rain is cherished by many across cultures."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** defines the fragrance mentioned in **1** with its scientific name and Greek etymology ("This pleasant smell is known as petrichor...").
  - **2 → 3:** Sentence **3** explains the biological source of "This scent", attributing it to plant oils and bacterial geosmin.
  - **3 → 4:** Sentence **4** concludes with the psychological resonance of the scent, describing the nostalgia, freshness, and renewal it evokes.

**Coherent Paragraph:**
"The fragrance that rises from the earth after rain is cherished by many across cultures. This pleasant smell is known as petrichor, a term derived from Greek words meaning “stone” and “the blood of gods.” This scent comes from plant oils and a compound called geosmin released by soil bacteria. It evokes a deep sense of nostalgia and freshness, reminding people of renewal and calm after a storm."

Hence, the correct logical order is **1, 2, 3, 4** (**Option B**).""",

  "APT-ENG-3599": """- **Introductory Sentence:** Sentence **2** introduces the primary subject: "Small-scale fisheries are often overlooked in global ocean management."
- **Logical Flow & Mandatory Pairs:**
  - **2 → 1:** Sentence **1** uses the pronoun "They" to describe their indispensable socioeconomic contribution to local economies and food security despite being overlooked.
  - **1 → 3:** Sentence **3** introduces the external challenges they confront using the adversative connector "However" ("they face increasing threats from overfishing and climate change").
  - **3 → 4:** Sentence **4** delivers the concluding call to action, affirming that recognizing their significance is critical for sustainable ocean governance.

**Coherent Paragraph:**
"Small-scale fisheries are often overlooked in global ocean management. They perform a vital role in local economies and food security. However, they face increasing threats from overfishing and climate change. Recognizing their importance is crucial for sustainable ocean governance."

Hence, the correct logical order is **2 - 1 - 3 - 4** (**Option D**).""",

  "APT-ENG-3600": """- **Introductory Sentence:** Sentence **2** introduces the fundamental catalyst that transformed modern society: "The advent of the internet fundamentally transformed global communication and commerce."
- **Logical Flow & Mandatory Pairs:**
  - **2 → 3:** Sentence **3** details the economic transformation initiated in **2** by citing the emergence of new digital industries (e-commerce, software development, and digital services).
  - **3 → 1:** Sentence **1** describes the direct consequence on the labor market using "This led to", highlighting a surge in demand for skilled computing professionals.
  - **1 → 4:** Sentence **4** uses the result marker "Consequently" to show how educational institutions responded by rapidly adapting their curricula.

**Coherent Paragraph:**
"The advent of the internet fundamentally transformed global communication and commerce. New industries emerged, centred around e-commerce, software development, and digital services. This led to a significant increase in demand for skilled workers in computing fields. Consequently, educational institutions rapidly adapted their curricula to meet these new needs."

Hence, the correct logical order is **2-3-1-4** (**Option A**).""",

  "APT-ENG-3601": """- **Introductory Sentence:** Sentence **2** initiates the hydrological cycle with solar evaporation: "The sun's energy heats water in oceans and lakes, causing it to evaporate."
- **Logical Flow & Mandatory Pairs:**
  - **2 → 1:** Sentence **1** tracks the evaporated water using the demonstrative phrase "This vapor", describing its cooling and condensation into clouds.
  - **1 → 4:** Sentence **4** explains the subsequent step when clouds accumulate moisture and release their water content.
  - **4 → 3:** Sentence **3** completes the natural cycle using the concluding adverb "Finally", describing precipitation returning water to Earth.

**Coherent Paragraph:**
"The sun's energy heats water in oceans and lakes, causing it to evaporate. This vapor then cools and condenses to form clouds. When the clouds become heavy enough, they release their water content. Finally, the water returns to Earth as precipitation, such as rain or snow."

Hence, the correct logical order is **2 - 1 - 4 - 3** (**Option A**).""",

  "APT-ENG-3602": """- **Introductory Sentence:** Sentence **C** defines the main subject without antecedent pronouns: "Online education is an amenable instructional delivery process that includes any learning that takes place via the internet."
- **Logical Flow & Mandatory Pairs:**
  - **C → D:** Sentence **D** uses the possessive pronoun "Its" to introduce the advantages of online education, highlighting increased educational access.
  - **D → A:** Sentence **A** expands on these advantages with specific details ("It provides a high-quality learning opportunity, improves student outcomes and skills...").
  - **A → B:** Sentence **B** delivers the logical conclusion marked by "Therefore", summarizing that location, time, and quality constraints are eliminated by online education.

**Coherent Paragraph:**
"Online education is an amenable instructional delivery process that includes any learning that takes place via the internet. Its potential advantages involve increased educational access. It provides a high-quality learning opportunity, improves student outcomes and skills, and expands educational choice options. Therefore, location, time, and quality are no longer considered factors in seeking degree courses or higher education because of online education."

Hence, the correct logical order is **CDAB** (**Option D**).""",

  "APT-ENG-3603": """- **Introductory Sentence:** Sentence **B** introduces the widespread modern cultural phenomenon: "Uploading photos to social networking sites has grown popular in today's society."
- **Logical Flow & Mandatory Pairs:**
  - **B → A:** Sentence **A** provides concrete examples of the content shared on these platforms (cuisine, cosmetic routines, shopping, and dance videos).
  - **A → C:** Sentence **C** explores the psychological motivation behind this sharing ("Because of the rising influence of social media on people, they want to constantly appear their best").
  - **C → D:** Sentence **D** states the resulting societal shift using "Therefore", explaining that people have become more image-conscious and focused on personal care.

**Coherent Paragraph:**
"Uploading photos to social networking sites has grown popular in today's society. People post images of their cuisine, daily cosmetic routines, shopping videos, and dance videos. Because of the rising influence of social media on people, they want to constantly appear their best. Therefore people have become more image sensors and begun to prioritize personal care."

Hence, the correct logical order is **BACD** (**Option D**).""",

  "APT-ENG-3604": """- **Introductory Sentence:** Sentence **2** introduces the general scientific process: "Naming newly discovered animals, whether terrestrial or aquatic, follows strict scientific protocols."
- **Logical Flow & Mandatory Pairs:**
  - **2 → 3:** Sentence **3** expands on the first group mentioned in **2** ("Terrestrial animals, for instance, are often classified by fur patterns, skeletal features, or vocalizations").
  - **3 → 1:** Sentence **1** provides the complementary classification features for the second group ("For aquatic species, features like fin structure or gill morphology might be key").
  - **1 → 4:** Sentence **4** concludes the passage using "Ultimately", explaining how these taxonomic names facilitate biodiversity cataloging and scientific research.

**Coherent Paragraph:**
"Naming newly discovered animals, whether terrestrial or aquatic, follows strict scientific protocols. Terrestrial animals, for instance, are often classified by fur patterns, skeletal features, or vocalizations. For aquatic species, features like fin structure or gill morphology might be key. Ultimately, these names help categorise biodiversity and facilitate further research."

Hence, the correct logical order is **2, 3, 1, 4** (**Option C**).""",

  "APT-ENG-3605": """- **Introductory Sentence:** Sentence **1** introduces the topic: "Infectious diseases pose a significant global health challenge."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 2:** Sentence **2** uses the pronoun "They" to define the biological cause of infectious diseases (pathogenic microorganisms including bacteria, viruses, fungi, or parasites).
  - **2 → 3:** Sentence **3** uses the demonstrative phrase "These pathogens" to explain how rapidly they transmit, potentially causing epidemics and pandemics.
  - **3 → 4:** Sentence **4** concludes with the imperative clinical takeaway marked by "Thus", stressing the paramount importance of early diagnosis and swift treatment.

**Coherent Paragraph:**
"Infectious diseases pose a significant global health challenge. They are caused by pathogenic microorganisms like bacteria, viruses, fungi, or parasites. These pathogens can spread rapidly, leading to widespread epidemics or even pandemics. Thus, early diagnosis and swift treatment are paramount for positive outcomes."

Hence, the correct logical order is **1 - 2 - 3 - 4** (**Option C**).""",

  "APT-ENG-3606": """- **Introductory Sentence:** Sentence **1** introduces the subject: "Machine learning, a subset of Artificial Intelligence, is rapidly gaining prominence."
- **Logical Flow & Mandatory Pairs:**
  - **1 → 4:** Sentence **4** explains how machine learning operates technologically ("Algorithms are trained on vast datasets to recognize patterns and make predictions").
  - **4 → 2:** Sentence **2** summarizes this algorithmic mechanism using the singular demonstrative "This" ("This enables machines to learn from data without explicit programming").
  - **2 → 3:** Sentence **3** concludes with the causal linker "Consequently", describing how this autonomous learning capability translates into diverse applications across healthcare and finance.

**Coherent Paragraph:**
"Machine learning, a subset of Artificial Intelligence, is rapidly gaining prominence. Algorithms are trained on vast datasets to recognize patterns and make predictions. This enables machines to learn from data without explicit programming. Consequently, it finds applications in diverse fields, from healthcare to finance."

Hence, the correct logical order is **1 - 4 - 2 - 3** (**Option B**).""",

  "APT-ENG-3607": """- **Introductory Sentence:** Sentence **2** introduces the central educational concept: "Learning by doing projects in school is very good for students."
- **Logical Flow & Mandatory Pairs:**
  - **2 → 3:** Sentence **3** explains the core pedagogical merit of project-based learning (working on real problems rather than merely memorizing facts).
  - **3 → 4:** Sentence **4** introduces an additional collaborative benefit using the additive adverb "also" ("This way of learning also makes them work and talk together with friends").
  - **4 → 1:** Sentence **1** concludes with the long-term cognitive value using the pronoun "It" ("It helps them think better for college").

**Coherent Paragraph:**
"Learning by doing projects in school is very good for students. Kids work on real problems, so they learn more than just memorizing facts. This way of learning also makes them work and talk together with friends. It helps them think better for college."

Hence, the correct logical order is **2-3-4-1** (**Option C**).""",

  "APT-ENG-3608": """- **Introductory Sentence:** Sentence **D** introduces the broader geographical context: "America has several long river systems."
- **Logical Flow & Mandatory Pairs:**
  - **D → C:** Sentence **C** narrows the discussion from America's rivers to a prominent individual river ("Although not the longest river, the Rio Grande is the most important river in America").
  - **C → B:** Sentence **B** notes a distinctive limitation using "But unlike other rivers, it is not used for shipping."
  - **B → A:** Sentence **A** resolves this functional contrast with the adversative transition "However", explaining that its primary importance lies in its geopolitical location as a border.

**Coherent Paragraph:**
"America has several long river systems. Although not the longest river, the Rio Grande is the most important river in America. But unlike other rivers, it is not used for shipping. However, its importance is primarily for its location."

Hence, the correct logical order is **DCBA** (**Option B**).""",

  "APT-ENG-3609": """- **Introductory Sentence:** Sentence **B** opens the dialogue with the boy asking for directions: "Can you please show me the way to the post office?"
- **Logical Flow & Mandatory Pairs:**
  - **B → C:** Sentence **C** is the shopkeeper's immediate answer giving navigational directions ("Go straight from here and take a right turn").
  - **C → D:** Sentence **D** follows as the boy's inquiry regarding proximity ("Is it very far off from here?").
  - **D → A:** Sentence **A** is the shopkeeper's reassuring response to the distance query ("Not at all. It is hardly a two-minute walk from here").

**Coherent Paragraph:**
"Boy: “Can you please show me the way to the post office?” Shopkeeper: “Go straight from here and take a right turn.” Boy: “Is it very far off from here?” Shopkeeper: “Not at all. It is hardly a two-minute walk from here.”"

Hence, the correct logical order is **BCDA** (**Option C**).""",

  "APT-ENG-3610": """- **Introductory Sentence:** Sentence **C** states the universal premise: "There's no relationship that does not falter."
- **Logical Flow & Mandatory Pairs:**
  - **C → D:** Sentence **D** elaborates on relationships faltering by noting that arguments and conflicts are common even in healthy relationships.
  - **D → A:** Sentence **A** introduces a crucial contrast using "But", cautioning that while conflicts seem normal to adults, children can be negatively impacted by parental disputes.
  - **A → B:** Sentence **B** elaborates on the danger highlighted in **A**, warning how quickly squabbles can escalate into ugly arguments that gravely devastate a witnessing child.

**Coherent Paragraph:**
"There's no relationship that does not falter. Arguments, disagreements and conflicts are extremely common even in a healthy relationship. But while it may seem normal to you, your child may be negatively affected by your and your partner's actions. There is no telling when a squabble between a couple may aggravate and escalate into something ugly, which when witnessed by a child, might devastate them gravely."

Hence, the correct logical order is **CDAB** (**Option D**)."""
}

# Save output batch file
with open('data/solutions/chunks/aptitude/batches_parajumble/output_batch_27.json', 'w', encoding='utf-8') as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)

print(f"Generated output_batch_27.json with {len(solutions)} solutions.")
