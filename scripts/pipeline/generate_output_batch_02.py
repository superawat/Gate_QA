import json
import re

solutions = {
  "APT-ENG-3029": """- **Introductory Sentence:** Sentence **B** sets the historical narrative in Rome and Athens, introducing the Roman senator Fulvius, who sent his young son Titus to study in Athens under the care of a host named Chremes.
- **Logical Flow & Mandatory Pairs:**
  - **B → C:** Sentence **C** directly links to **B** through the demonstrative reference "This Chremes", introducing Chremes's son Gisippus and describing how he was identical to Titus in age, stature, and features.
  - **C → A:** Sentence **A** elaborates on this striking physical resemblance ("The two children were so like..."), noting that even their own parents could scarcely distinguish one from the other.
  - **A → D:** Sentence **D** transitions from their identical outward appearance ("as they seemed to be one in form and personage") to their burgeoning mutual affection and deep spiritual friendship.

**Coherent Paragraph:**
"There was in the city of Rome a noble senator, named Fulvius, who sent his son, called Titus, being a child, to the city of Athens, in Greece (which was the fountain of all manner of doctrine), there to learn good letters : and caused him to be hosted with a worshipful mart of that city, called Chremes. This Chremes happened to have also a son named Gisippus, who not only was equal to the said young Titus in years, but also in stature, proportion of body, favour, and color of visage, countenance and speech. The two children were so like, that without much difficulty it could not be discerned of their proper parents, which was Titus from Gisippus, or Gisippus from Titus. These two young gentlemen, as they seemed to be one in form and personage, so shortly after acquaintance, the same nature wrought in their hearts such a mutual affection, and their wills and appetites daily more and more so confederated themselves, that it seemed none other, when their names were declared, but that they had only changed their places, issuing (as I might say) out of the one body, and entering into the other."

Hence, the correct logical order is **BCAD** (**Option C**).""",

  "APT-ENG-3030": """- **Introductory Sentence:** Sentence **D** introduces the exalted nature of a book by quoting John Milton's timeless definition ("A good book in the words of John Milton 'is the precious lifeblood of a master spirit...'"), establishing the core subject of the passage.
- **Logical Flow & Mandatory Pairs:**
  - **D → B:** Sentence **B** expands on Milton's concept of enduring life by illustrating how the thoughts and ideas in books achieve immortality across religious and literary classics like the Ram Charitra Manas, Mahabharata, The Bible, and Shakespeare's plays.
  - **B → C:** Sentence **C** introduces a direct contrast using "On the other hand", juxtaposing the immortal ideas of books with the mechanical nature of a computer, which merely displays text on a screen.
  - **C → A:** Sentence **A** delivers the concluding deduction: because a computer is only a display machine whereas books contain immortal thoughts, the idea that computers will replace books is "unthinkable and far-fetched".

**Coherent Paragraph:**
"A good book in the words of John Milton “is the precious lifeblood of a master spirit, embalmed and treasured up to a purpose to a life beyond life.” The thoughts and ideas contained in a book are immortal like Tulsidas’s Ram Charitra Manas, Ved Vyas’ Mahabharata, The Bible and many other religious and literary works like Shakespeare’s plays etc. On the other hand a computer is but a machine, that at best can visually display the contents of a specific book. To think that a computer would one day replace a book is indeed unthinkable and far-fetched."

Hence, the correct logical order is **DBCA** (**Option B**).""",

  "APT-ENG-3031": """- **Introductory Sentence:** Sentence **B** introduces the central theme by stating the comprehensive, worldwide disruption brought about by the pandemic ("Covid-19 changed the form and face of every field in the world. It did not leave any field untouched.").
- **Logical Flow & Mandatory Pairs:**
  - **B → C:** Sentence **C** narrows the broad impact to a specific sector ("One of the most affected areas is education..."), focusing on how millions of students could not get a proper education.
  - **C → D:** Sentence **D** continues directly within the educational sphere, highlighting the parallel financial hardship endured by teachers in private educational institutes during the pandemic.
  - **D → A:** Sentence **A** expands outward from the teaching profession to other domains using the additive connector "too" ("into the lives of the people of other professions too"), concluding the passage.

**Coherent Paragraph:**
"Covid-19 changed the form and face of every field in the world. It did not leave any field untouched. One of the most affected areas is education. Millions of students all over the world could not get a proper education. Millions of the teachers who are working, specifically in private educational institutes, were not paid full salary during the pandemic. It is unquestionably evident that this virus brought misery and grief into the lives of the people of other professions too."

Hence, the correct logical order is **BCDA** (**Option B**).""",

  "APT-ENG-3034": """- **Introductory Sentence:** Sentence **D** initiates the narrative by introducing the primary characters and core conflict: a hare fleeing from an eagle takes refuge in a beetle's nest and begs for help.
- **Logical Flow & Mandatory Pairs:**
  - **D → B:** Sentence **B** connects to the hare's plea in **D** with the causal connector "therefore" ("The beetle therefore interceded with the eagle..."), begging the eagle to spare the small suppliant.
  - **B → A:** Sentence **A** uses the adversative conjunction "But" to describe the eagle's angry response, slapping the beetle aside and devouring the hare.
  - **A → C:** Sentence **C** follows the aftermath of the eagle devouring the hare, recounting how the beetle pursued the flying eagle to discover the location of its nest.

**Coherent Paragraph:**
"A hare, being pursued by an eagle, took himself for refuge to the nest of a beetle, whom he begged to save him. The beetle therefore interceded with the eagle, begging of him not to kill the poor suppliant, and pleaded with him not to kill so small an animal. But the eagle, in wrath, gave the beetle a flap of his wing, and straightaway seized upon the hare and devoured him. When the eagle flew away, the beetle flew after him, to learn where his nest was."

Hence, the correct logical order is **DBAC** (**Option A**).""",

  "APT-ENG-3035": """- **Introductory Sentence:** Sentence **B** opens the dialogue with the customer (Mala) requesting specific party supplies ("Please give me a packet of balloons, two packets of streamers, and some candles.").
- **Logical Flow & Mandatory Pairs:**
  - **B → A:** Sentence **A** is the shopkeeper's immediate fulfillment response confirming that the items have been packed ("Here, I have packed them all.").
  - **A → D:** Sentence **D** naturally follows the packaging, as Mala asks for the billing total ("How much do I need to pay?").
  - **D → C:** Sentence **C** concludes the transaction with the shopkeeper stating the discounted payable amount ("Since we are offering some discount on the balloons, you need to pay only thirty rupees.").

**Coherent Paragraph:**
"Mala: “Please give me a packet of balloons, two packets of streamers, and some candles.” Shopkeeper: “Here, I have packed them all.” Mala: “How much do I need to pay?” Shopkeeper: “Since we are offering some discount on the balloons, you need to pay only thirty rupees.”"

Hence, the correct logical order is **BADC** (**Option D**).""",

  "APT-ENG-3036": """- **Introductory Sentence:** Sentence **b** introduces the demographic theme by citing United Nations data on India's urban and rural population growth rates ("The United Nations reports that India's urban population is growing at a rate of 1.1 percent annually...").
- **Logical Flow & Mandatory Pairs:**
  - **b → d:** Sentence **d** builds upon India's urban growth from **b**, noting that despite this growth, urban residents represent a much smaller percentage compared to the US ("It's still a considerably smaller percentage of the Indian population than it is in the US that resides in urban areas,").
  - **d → c:** Sentence **c** substantiates the comparison in **d** with concrete quantitative data ("While 82% of Americans live in urban settings, only 30% of Indians do so.").
  - **c → a:** Sentence **a** opens with the demonstrative phrase "This figure", referring directly back to the 82% urban population figure for Americans in **c**, and projects its continued climb.

**Coherent Paragraph:**
"The United Nations reports that India's urban population is growing at a rate of 1.1 percent annually, while the country's rural population is shrinking at a rate of 0.37 percent annually. It's still a considerably smaller percentage of the Indian population than it is in the US that resides in urban areas, While 82% of Americans live in urban settings, only 30% of Indians do so. This figure is predicted to climb as the percentage of Americans residing in rural areas falls by an average of 1.6% annually."

Hence, the correct logical order is **b, d, c, a** (**Option C**).""",

  "APT-ENG-3037": """- **Opening Part:** The given introductory phrase "In a recent study," modifies a main clause. Part **R** ("we showed that people on low incomes with") provides the subject ("we"), reporting verb ("showed"), and the subordinate that-clause subject ("people on low incomes with").
- **Grammatical & Logical Links:**
  - **R → P:** The preposition "with" at the end of **R** requires an object noun phrase, supplied by **P** ("little free time like a single parent nurse caring for").
  - **P → Q:** The participle/preposition "caring for" in **P** governs the object noun phrase in **Q** ("more than one child and working long hours are"). The plural verb "are" in **Q** agrees with the plural subject "people" in **R**.
  - **Q → S:** The auxiliary "are" in **Q** links to the predicate adjective/participle phrase in **S** ("set to lose out most as energy prices rise").

**Complete Sentence:**
"In a recent study, we showed that people on low incomes with little free time like a single parent nurse caring for more than one child and working long hours are set to lose out most as energy prices rise."

Hence, the correct logical order is **RPQS** (**Option B**).""",

  "APT-ENG-3038": """- **Introductory Sentence:** Sentence **A** introduces the primary subject: "Human relationships are a matter of great concern for every one of us."
- **Logical Flow & Mandatory Pairs:**
  - **A → C:** Sentence **C** gives the underlying justification for why human relationships are of great concern, opening with the explanatory conjunction "As" ("As it helps us all to have a coordinated, balanced and approachable life."), forming mandatory pair **A-C**.
  - **C → B:** Sentence **B** introduces a qualifying extension using the transitional adverb "Nevertheless" ("Nevertheless, social scientists have attached many other elements that actually help us for a good social life.").
  - **B → D:** Sentence **D** refers back to the elements mentioned in **B** through the demonstrative noun phrase "all such elements" ("The present generation fails to take cognisance of all such elements and fall prey to a lonely life risking happiness."), concluding the paragraph.

**Coherent Paragraph:**
"Human relationships are a matter of great concern for every one of us. As it helps us all to have a coordinated, balanced and approachable life. Nevertheless, social scientists have attached many other elements that actually help us for a good social life. The present generation fails to take cognisance of all such elements and fall prey to a lonely life risking happiness."

Hence, the correct logical order is **ACBD** (**Option D**).""",

  "APT-ENG-3039": """- **Opening Part:** Part **B** ("the last two years") functions as the temporal subject noun phrase of the sentence, requiring a verb to express what transpired during this period.
- **Grammatical & Logical Links:**
  - **B → A:** Part **A** provides the present perfect verb phrase ("have seen a major blow"), naturally completing the timeframe established in **B**.
  - **A → D:** The noun "blow" takes the prepositional complement "to the world's economy" in **D**, followed by the coordinating conjunction "and" ("to the world's economy and").
  - **D → C:** The conjunction "and" introduces the second coordinate clause starting with subject noun phrase **C** ("people and lower-income countries").
  - **C → E:** Part **E** supplies the plural passive verb phrase ("were hit particularly hard"), completing the predicate for the subject in **C**.

**Complete Sentence:**
"The last two years have seen a major blow to the world's economy and people and lower-income countries were hit particularly hard."

Hence, the correct logical order is **BADCE** (**Option C**).""",

  "APT-ENG-3040": """- **Opening Part:** Part **S** ("the residents of Noida can now get their pets like dogs or cats") provides the main clause subject ("the residents of Noida") and the causative modal verb construction ("can now get their pets...").
- **Grammatical & Logical Links:**
  - **S → R:** The causative construction "get their pets [noun]" requires a past participle complement, supplied by **R** ("registered with the local authority through a mobile phone").
  - **R → P:** The noun phrase "mobile phone" in **R** modifies "application" in **P** ("application, which can also be used to log complaints about"), forming the compound noun "mobile phone application" and its relative clause.
  - **P → Q:** The preposition "about" in **P** governs the coordinate objects in **Q** ("littering or caused by the animals, according to officials").

**Complete Sentence:**
"The residents of Noida can now get their pets like dogs or cats registered with the local authority through a mobile phone application, which can also be used to log complaints about littering or caused by the animals, according to officials."

Hence, the correct logical order is **SRPQ** (**Option B**).""",

  "APT-ENG-3041": """- **Introductory Sentence:** Sentence **B** introduces the "Olympic Games", defining the event and outlining its historical origins in ancient Greece and revival in the late 19th century.
- **Logical Flow & Mandatory Pairs:**
  - **B → C:** Sentence **C** traces the chronological evolution of the Games in the 20th century ("Before the 1970s... but in the 1980s..."), detailing the shift from amateur-only competitors to opening events to professional athletes.
  - **C → D:** Sentence **D** advances the timeline to the present day using the temporal adverb "Currently" ("Currently, the Games are open to all, even the top professional athletes in basketball and football (soccer)."), establishing the chronological sequence **C → D**.
  - **D → A:** Sentence **A** summarizes the outcome of this expansion, concluding with the event's stature as the world's foremost sports competition ("The Olympic Games have come to be regarded as the world's foremost sports competition.").

**Coherent Paragraph:**
"Olympic Games is an athletic festival that originated in ancient Greece and was revived in the late 19th century. Before the 1970s, the Games were officially limited to competitors with amateur status, but in the 1980s many events were opened to professional athletes. Currently, the Games are open to all, even the top professional athletes in basketball and football (soccer). The Olympic Games have come to be regarded as the world's foremost sports competition."

Hence, the correct logical order is **BCDA** (**Option B**).""",

  "APT-ENG-3042": """- **Introductory Sentence:** Sentence **B** introduces the narrator's core impulse ("In my next attempt I seem to have acted under the first instinctive impulse which later dominated me - to harness the energies of nature to the service of man.").
- **Logical Flow & Mandatory Pairs:**
  - **B → D:** Sentence **D** explains the practical medium through which he pursued this impulse ("I did this through the medium of May-bugs..."). The demonstrative pronoun "this" in **D** refers directly to harnessing nature's energy in **B**, creating mandatory pair **B-D**.
  - **D → A:** Sentence **A** describes the mechanical mechanism constructed with these insects ("I would attach as many as four of them to a crosspiece..."), where "them" refers back to the May-bugs introduced in **D**, forming mandatory pair **D-A**.
  - **A → C:** Sentence **C** refers back to the insects strapped to the spindle with "These creatures", detailing their remarkable stamina and continuous whirling motion.

**Coherent Paragraph:**
"In my next attempt I seem to have acted under the first instinctive impulse which later dominated me - to harness the energies of nature to the service of man. I did this through the medium of May-bugs -or June-bugs as they are called in America - which were a veritable pest in that country and sometimes broke the branches of trees by the sheer weight of their bodies. I would attach as many as four of them to a crosspiece, rotably arranged on a thin spindle, and transmit the motion of the same to a large disc and so derive considerable 'power'. These creatures were remarkably efficient, for once they were started they had no sense to stop and continued whirling for hours and hours and the hotter it was the harder they worked."

Hence, the correct logical order is **BDAC** (**Option C**).""",

  "APT-ENG-3043": """- **Introductory Sentence:** Sentence **C** introduces the subject by providing the formal biological definition: "An omnivore is an animal that can feed and thrive on both, plant and animal substances."
- **Logical Flow & Mandatory Pairs:**
  - **C → A:** Sentence **A** elaborates on the physiological mechanism of this definition, detailing how omnivores extract energy and nutrients by digesting and metabolising plant and animal matter.
  - **A → D:** Sentence **D** broadens the scope of their diet beyond typical plant and animal matter using the additive adverb "also" ("They also have the capacity to integrate food sources like algae, fungus and bacteria into their diet."), forming mandatory pair **A-D**.
  - **D → B:** Sentence **B** provides a logical conclusion by noting that the diverse animals categorized as omnivores can be divided into sub-categories based on these specific dietary habits.

**Coherent Paragraph:**
"An omnivore is an animal that can feed and thrive on both, plant and animal substances. Omnivores get energy and nutrients from plant and animal materials by digesting carbs, protein, fat and fibre and metabolising the nutrients and energy of the sources ingested. They also have the capacity to integrate food sources like algae, fungus and bacteria into their diet. The many diverse animals categorised as omnivores may be divided into sub- categories based on their dietary habits."

Hence, the correct logical order is **CADB** (**Option C**).""",

  "APT-ENG-3044": """- **Introductory Sentence:** Sentence **C** announces the main event and setting ("A new indoor gymnasium and swimming pool was inaugurated at APJ International School, Goa.").
- **Logical Flow & Mandatory Pairs:**
  - **C → B:** Sentence **B** identifies the dignitary who presided over the inauguration ("The Honorable Commissioner of Police inaugurated the Gymnasium and Swimming pool and appended the management...").
  - **B → D:** Sentence **D** introduces the school principal, Mr. Mercia, who briefed the attendees on the project's costs and available facilities.
  - **D → A:** Sentence **A** specifies the exact financial expenditure using the pronoun reference "According to him" ("According to him, Rupees 75 lakhs has been spent to make the gymnasium fully equipped..."), establishing the mandatory pair **D-A**.

**Coherent Paragraph:**
"A new indoor gymnasium and swimming pool was inaugurated at APJ International School, Goa. The Honorable Commissioner of Police inaugurated the Gymnasium and Swimming pool and appended the management for their efforts in providing such amenities to students. Mr. Mercia, the Principal of the school familiarised the guests about the cost incurred and the various facilities available. According to him, Rupees 75 lakhs has been spent to make the gymnasium fully equipped with state-of-the-art fitness machines."

Hence, the correct logical order is **CBDA** (**Option A**).""",

  "APT-ENG-3045": """- **Introductory Sentence:** Sentence **D** introduces the primary theme by contrasting the tranquility of nature in the country with the distressing struggle for existence in the crowded city.
- **Logical Flow & Mandatory Pairs:**
  - **D → A:** Sentence **A** develops the urban struggle mentioned at the end of **D**, recounting the narrator's visits to squalid city streets and expressing indignation at the disparity between the wealthy and the tenement dwellers.
  - **A → C:** Sentence **C** shifts focus to the impoverished inhabitants of these streets introduced in **A** ("The children who crowd these grimy alleys, half-clad and underfed, shrink away from your outstretched hand as if from a blow.").
  - **C → B:** Sentence **B** expresses deep, compassionate sorrow for these suffering children ("Dear little creatures, they crouch in my heart and haunt me with a constant sense of pain."), forming mandatory pair **C-B**.

**Coherent Paragraph:**
"In the country one sees only nature's fair works, and one's soul is not saddened by the cruel struggle for mere existence that goes on in the crowded city. Several times I have visited the narrow, dirty streets where the poor live, and I grow hot and indignant to think that good people should be content to live in fine houses and become strong and beautiful, while others are condemned to live in hideous, sunless tenements and grow ugly, withered and cringing. The children who crowd these grimy alleys, half-clad and underfed, shrink away from your outstretched hand as if from a blow. Dear little creatures, they crouch in my heart and haunt me with a constant sense of pain."

Hence, the correct logical order is **DACB** (**Option D**).""",

  "APT-ENG-3046": """- **Opening Part:** The given sentence starter is "The Ramayana is one of the largest ancient", which requires a plural noun phrase to complete the superlative construction "one of the largest ancient...". Part **C** ("epics in world literature. It consists of nearly") provides this noun phrase ("epics in world literature").
- **Grammatical & Logical Links:**
  - **Starter → C:** "The Ramayana is one of the largest ancient epics in world literature." Sentence **C** continues with "It consists of nearly", requiring a numerical quantification.
  - **C → A:** Part **A** provides this numerical complement ("24,000 verses divided into seven Khanda (parts)"), completing the second sentence.
  - **A → B:** Part **B** functions as an absolute participial clause qualifying the seven Khandas ("the first and the seventh being later additions.").
  - **B → D:** Part **D** forms a new sentence classifying the epic into its literary and philosophical tradition ("It belongs to the genre of Itihasa, narratives of past events, interspersed with teachings on the goals of human life.").

**Complete Sentence:**
"The Ramayana is one of the largest ancient epics in world literature. It consists of nearly 24,000 verses divided into seven Khanda (parts) the first and the seventh being later additions. It belongs to the genre of Itihasa, narratives of past events, interspersed with teachings on the goals of human life."

Hence, the correct logical order is **CABD** (**Option B**).""",

  "APT-ENG-3047": """- **Opening Part:** The introductory phrase "A 2007-2009 study" is a singular noun phrase acting as the subject. Part **P** ("explored forward thinking techniques") supplies the main past-tense transitive verb ("explored") and its direct object ("forward thinking techniques").
- **Grammatical & Logical Links:**
  - **P → Q:** The noun "techniques" in **P** is modified by the purpose infinitive phrase in **Q** ("to synchronise time on board deep").
  - **Q → R:** The adjective "deep" in **Q** modifies the compound noun "space probes" in **R** ("space probes for accurate navigation, in").
  - **R → S:** The preposition "in" at the end of **R** links with "particular" in **S** to form the standard adverbial phrase "in particular" ("particular looking into low-cost options").

**Complete Sentence:**
"A 2007-2009 study explored forward thinking techniques to synchronise time on board deep space probes for accurate navigation, in particular looking into low-cost options."

Hence, the correct logical order is **PQRS** (**Option D**).""",

  "APT-ENG-3048": """- **Opening Part:** The starter "The study led" contains the passive participle "led", which requires an agentive prepositional phrase introduced by "by" in **Q** ("by scientists at the University of Bath and including").
- **Grammatical & Logical Links:**
  - **Q → P:** The participle "including" in **Q** requires an object noun phrase, supplied by **P** ("collaborators from Bristol, Cambridge and Germany"), completing the extended subject noun phrase.
  - **P → R:** With the complex subject complete, the sentence requires the main finite verb phrase, supplied by **R** ("used fossils and analysed genetic differences between").
  - **R → S:** The preposition "between" at the end of **R** connects directly to its object noun phrase in **S** ("modern snakes to reconstruct snake evolution").

**Complete Sentence:**
"The study led by scientists at the University of Bath and including collaborators from Bristol, Cambridge and Germany used fossils and analysed genetic differences between modern snakes to reconstruct snake evolution."

Hence, the correct logical order is **QPRS** (**Option A**).""",

  "APT-ENG-3049": """- **Introductory Sentence:** Sentence **A** sets the initial situation and introduces the characters ("On my way to school, I met my uncle who had returned from England.").
- **Logical Flow & Mandatory Pairs:**
  - **A → C:** Sentence **C** describes the uncle's immediate reaction upon meeting the narrator ("He was very pleased to see me and asked about my parents.").
  - **C → D:** Sentence **D** responds directly to the inquiry about parents in **C** ("On he asking me about my parents, I told him my father recalls him frequently."), establishing the mandatory pair **C-D**.
  - **D → B:** Sentence **B** uses the sequence adverb "Then" to describe the natural next step in the conversation ("Then I invited him to my place."), concluding the encounter.

**Coherent Paragraph:**
"On my way to school, I met my uncle who had returned from England. He was very pleased to see me and asked about my parents. On he asking me about my parents, I told him my father recalls him frequently. Then I invited him to my place."

Hence, the correct logical order is **ACDB** (**Option C**).""",

  "APT-ENG-3050": """- **Introductory Sentence:** Sentence **R** introduces the general topic and main advice: "There are lots of ways you can protect your eyes during the day."
- **Logical Flow & Mandatory Pairs:**
  - **R → P:** Sentence **P** lists several general methods introduced in **R** ("You can use proper lighting, reduce screen glare, and take more breaks.").
  - **P → Q:** Sentence **Q** introduces a contrast with "However", highlighting a single particularly effective and simple habit ("However, one of the easiest habits to build is to follow the \\"20-20-20 rule\\"."), creating mandatory pair **P-Q**.
  - **Q → S:** Sentence **S** explains the specific rule mentioned in **Q** ("Every 20 minutes of time spent staring at a screen, look away at an option that is at least 20 feet away for 20 seconds."), completing the explanation.

**Coherent Paragraph:**
"There are lots of ways you can protect your eyes during the day. You can use proper lighting, reduce screen glare, and take more breaks. However, one of the easiest habits to build is to follow the \\"20-20-20 rule\\". Every 20 minutes of time spent staring at a screen, look away at an option that is at least 20 feet away for 20 seconds."

Hence, the correct logical order is **RPQS** (**Option C**)."""
}

with open("data/solutions/chunks/aptitude/batches_parajumble/input_batch_02.json", "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total input items: {len(items)}, total solutions: {len(solutions)}")
assert len(solutions) == len(items)

for item in items:
    uid = item["uid"]
    ans = item["answer"]
    assert uid in solutions, f"Missing {uid}"
    sol = solutions[uid]
    
    # Check rule 5
    m = re.search(r"Hence, the correct logical order is \*\*(.*?)\*\* \(\*\*Option ([A-D])\*\*\)\.", sol)
    assert m, f"Rule 5 failed for {uid}: {sol[-100:]}"
    assert m.group(2) == ans, f"Answer mismatch for {uid}: expected {ans}, got {m.group(2)}"
    
    # Check structure
    has_sent = "Complete Sentence:" in sol
    has_para = "Coherent Paragraph:" in sol
    assert has_sent or has_para, f"Missing reconstructed text for {uid}"
    print(f"Verified {uid}: Option {ans} ({m.group(1)})")

# Save output_batch_02.json
with open("data/solutions/chunks/aptitude/batches_parajumble/output_batch_02.json", "w", encoding="utf-8") as f:
    json.dump(solutions, f, indent=2, ensure_ascii=False)
print("SUCCESS: Saved output_batch_02.json cleanly!")
