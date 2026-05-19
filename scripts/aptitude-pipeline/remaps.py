import html
import re

def strip_html(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]*>", " ", value or ""))

REMAP_ENGLISH_RE = [
    (re.compile(r"\b(?:direct speech|indirect speech|reported speech|direct/indirect|indirect/direct|said to|he said|she said|asked them|asked me)\b", re.IGNORECASE), "Narration"),
    (re.compile(r"\b(?:active voice|passive voice|active/passive|passive/active)\b", re.IGNORECASE), "Active Passive"),
    (re.compile(r"\b(?:para jumble|rearrange|jumbled|proper sequence|logical passage)\b", re.IGNORECASE), "Para Jumble"),
    (re.compile(r"\b(?:cloze test|fill in the passage)\b", re.IGNORECASE), "Cloze Test"),
    (re.compile(r"\b(?:comprehension|passage|according to the passage|main concern|primary argument|central idea|suggested solution)\b", re.IGNORECASE), "Comprehension"),
    (re.compile(r"\b(?:one word|one-word|single word|one which can be substituted|substituted for the given words?|group of words given)\b", re.IGNORECASE), "One Word Substitution"),
    (re.compile(r"\b(?:idiom|phrase)\b", re.IGNORECASE), "Idioms"),
    (re.compile(r"\b(?:synonym|similar meaning)\b", re.IGNORECASE), "Synonyms"),
    (re.compile(r"\b(?:antonym|opposite meaning|opposite in meaning)\b", re.IGNORECASE), "Antonyms"),
    (re.compile(r"\b(?:spelling|misspelt|misspelled|spelt|misspelt word)\b", re.IGNORECASE), "Spelling Check"),
    (re.compile(r"\b(?:homonym|homophone|highlighted word with a different meaning|different meaning of the highlighted word)\b", re.IGNORECASE), "Homonyms"),
    (re.compile(r"\b(?:blank|fill)\b|_{2,}", re.IGNORECASE), "Fill in the Blanks"),
    (re.compile(r"\b(?:spot.*error|error in|grammatical error|part.*error|segment.*contains.*error|contains the error)\b", re.IGNORECASE), "Spot the Error"),
    (re.compile(r"\b(?:improve|sentence improvement|substitute|replace the highlighted|replace the underline|no improvement required|no substitution required)\b", re.IGNORECASE), "Sentence Improvement"),
]

REMAP_QUANT_RE = [
    (re.compile(r"\b(?:hcf|lcm|highest common|least common|least square number.*divisible|exactly divisible by|smallest number.*divided)\b", re.IGNORECASE), "HCF and LCM"),
    (re.compile(r"\b(?:probability|chance of|randomly)\b", re.IGNORECASE), "Probability"),
    (re.compile(r"\b(?:simplify|simplification|evaluate|value of|fraction|decimal|surds?|expression)\b", re.IGNORECASE), "Simplification"),
    (re.compile(r"\b(?:sin|cos|tan|cot|cosec|trigonometry)\b|(?<!/)\bsec\b|(?:sin|cos|tan|cot|sec|cosec)(?:a|b|c|x|y|θ)\b|(?:sin|cos|tan|cot|sec|cosec)\s*θ", re.IGNORECASE), "Trigonometry"),
    (re.compile(r"\b(?:height|distance|elevation|depression|shadow)\b", re.IGNORECASE), "Height and Distance"),
    (re.compile(r"\b(?:volume|surface area|cuboid|cube|cylinder|cone|sphere|hemisphere|frustum)\b", re.IGNORECASE), "Mensuration"),
    (re.compile(r"\b(?:coordinate|abscissa|ordinate|slope)\b", re.IGNORECASE), "Coordinate Geometry"),
    (re.compile(r"\b(?:mean|median|mode|quartile|skewness|coefficient of skewness|data set)\b", re.IGNORECASE), "Mean, Median & Mode"),
    (re.compile(r"\baverage\b", re.IGNORECASE), "Average"),
    (re.compile(r"\b(?:given table|following table|chart|graph|pie chart|bar[ -]?graph|line graph|data interpretation)\b", re.IGNORECASE), "Data Interpretation"),
    (re.compile(r"\b(?:partnership|partner|share of profit)\b", re.IGNORECASE), "Partnership"),
    (re.compile(r"\b(?:mixture|alligation|milk|water|solution)\b", re.IGNORECASE), "Mixture and Alligation"),
    (re.compile(r"\b(?:pipe|cistern|tank|inlet|outlet)\b", re.IGNORECASE), "Pipe and Cistern"),
    (re.compile(r"\b(?:boat|stream|upstream|downstream)\b|\b(?:water|river)\s+current\b|\bcurrent\s+(?:of|in)\s+(?:water|river|stream)\b", re.IGNORECASE), "Boat and Stream"),
    (re.compile(r"\b(?:race|track|lap)\b", re.IGNORECASE), "Linear/Circular Race"),
    (re.compile(r"\b(?:speed|train|journey|km/h|m/s|metres?|meters?|time taken|acceleration|passes the slower train)\b", re.IGNORECASE), "Time, Speed and Distance"),
    (re.compile(r"\b(?:work|task|complete.*days|efficiency|workman)\b", re.IGNORECASE), "Work and Time"),
    (re.compile(r"\b(?:ratio|proportion)\b", re.IGNORECASE), "Ratio and Proportion"),
    (re.compile(r"\b(?:profit|loss|gain|marked price|cost price|selling price|shopkeeper|dishonest dealer|true weights?)\b", re.IGNORECASE), "Profit and Loss"),
    (re.compile(r"\b(?:percent|percentage|per cent)\b|%", re.IGNORECASE), "Percentage"),
    (re.compile(r"\bdiscount\b", re.IGNORECASE), "Discount"),
    (re.compile(r"\b(?:simple interest|principal|rate of interest)\b", re.IGNORECASE), "Simple Interest"),
    (re.compile(r"\b(?:compound interest|compounded)\b", re.IGNORECASE), "Compound Interest"),
    (re.compile(r"\b(?:instalment|installment|emi)\b", re.IGNORECASE), "Installment"),
    (re.compile(r"\b(?:area|circle|triangle|geometry|diameter|radius|angle|perimeter|parallel|congruent|trapezium)\b", re.IGNORECASE), "Geometry"),
    (re.compile(r"\b(?:equation|algebra|polynomial|\bx\b|\by\b|linear)\b", re.IGNORECASE), "Algebra"),
]

REMAP_REASONING_RE = [
    (re.compile(r"\b(?:sitting around|seated in|parallel rows|facing the center|facing north|facing south|immediate left|immediate right|opposite to|around a circle)\b", re.IGNORECASE), "Sitting Arrangement"),
    (re.compile(r"\b(?:address(?:es)?|identical to the address|similar address)\b|house number|street|colony|pin code|flat no|sector\b", re.IGNORECASE), "Address"),
    (re.compile(r"\b(?:mathematical operation|interchange|interchanging|operators?|symbols?)\b|\bmeans ['\"]?[+\-*/]|\bif\s*[+\-×÷*/#@]|\bif \d+\s*[$@#%&]\s*\d+\s*=", re.IGNORECASE), "Mathematical Operations"),
    (re.compile(r"\b(?:statements?.*conclusions?|arguments?|course of action|assumptions? that must hold)\b", re.IGNORECASE), "Statement And Conclusion"),
    (re.compile(r"\b(?:decision making|best course of action|what should you do)\b", re.IGNORECASE), "Decision Making"),
    (re.compile(r"\b(?:syllogism|all\s+\w+\s+are|some\s+\w+\s+are|no\s+\w+\s+(?:is|are))\b", re.IGNORECASE), "Syllogism"),
    (re.compile(r"\b(?:inequality|greater than|less than|not greater|not less)\b|\b[A-Z]\s*[<>]=?\s*[A-Z]\b", re.IGNORECASE), "Inequality"),
    (re.compile(r"\b(?:direction|north|south|east|west|clockwise|anti-clockwise|left turn|right turn)\b", re.IGNORECASE), "Directions"),
    (re.compile(r"\b(?:father|mother|sister|brother|daughter|son|husband|wife|grand|blood relation)\b", re.IGNORECASE), "Blood Relation"),
    (re.compile(r"\b(?:calendar|day of the week|leap year)\b", re.IGNORECASE), "Calendar"),
    (re.compile(r"\b(?:series|letter-cluster|number series|comes next|next term|complete the pattern)\b", re.IGNORECASE), "Series"),
    (re.compile(r"\b(?:missing number|replace the question mark|question mark|missing term)\b", re.IGNORECASE), "Missing Number"),
    (re.compile(r"\b(?:word formation|formed from|letters.*word|meaningful word)\b", re.IGNORECASE), "Word Formation"),
    (re.compile(r"\b(?:arrange.*(?:words?|letters?)|arrangement of (?:the )?given words?|english dictionary|dictionary order|alphabetical order|order in which they appear)\b", re.IGNORECASE), "Word Arrangement"),
    (re.compile(r"\b(?:related to the (?:third|fourth|fifth|following)|numbers are related|number-pairs|number pairs|same way as|following logic|certain logic|similar relationship|best classifies|classifies the following items)\b", re.IGNORECASE), "Analogy"),
    (re.compile(r"\b(?:arithmetic reasoning|total number|how many|minimum number|maximum number|sum of \d+|find x\b|number of triangles|number of quadrilaterals)\b", re.IGNORECASE), "Arithmetic Reasoning"),
    (re.compile(r"\b(?:puzzle|floor|boxes|days)\b|\b(?:persons?|people)\b.*\b(?:arranged|sitting|standing|facing)\b", re.IGNORECASE), "Puzzle"),
    (re.compile(r"\b(?:coding|decoding|code language|coded as|code for|written as|symbolizes)\b", re.IGNORECASE), "Coding - Decoding"),
    (re.compile(r"\b(?:odd|different|does not belong|out of the following)\b", re.IGNORECASE), "Odd one out"),
    (re.compile(r"\b(?:analogy|analogies|related word|similar relationship|same relationship)\b", re.IGNORECASE), "Analogy"),
]

UNCERTAIN_SUBTOPICS = {"Miscellaneous", "Inequality", "Directions", "Puzzle", "Arithmetic Reasoning", "Address"}

STRONG_REASONING_SUBTOPICS = {
    "Statement And Conclusion",
    "Decision Making",
    "Syllogism",
    "Coding - Decoding",
    "Blood Relation",
    "Directions",
    "Mathematical Operations",
}


def first_match(rules, text: str) -> str | None:
    for pattern, new_subtopic in rules:
        if pattern.search(text):
            return new_subtopic
    return None


def apply_remap_rules(row: dict) -> None:
    text = (strip_html(row.get("questionHtml") or "") + " " + " ".join(row.get("options") or [])).lower()
    subject = row.get("subject")
    subtopic = row.get("subtopic")
    uncertain = subtopic in UNCERTAIN_SUBTOPICS

    english = first_match(REMAP_ENGLISH_RE, text)
    if english and (subject != "Quant" or uncertain or subtopic not in {english, "Cloze Test", "Comprehension"}):
        row["subject"] = "English"
        row["subtopic"] = english
        return

    quant = first_match(REMAP_QUANT_RE, text)
    if quant and (subject != "English" or uncertain or quant in {"Data Interpretation", "Trigonometry"}):
        row["subject"] = "Quant"
        row["subtopic"] = quant
        return

    reasoning = first_match(REMAP_REASONING_RE, text)
    if reasoning and (subject == "Reasoning" or uncertain or reasoning in STRONG_REASONING_SUBTOPICS):
        row["subject"] = "Reasoning"
        row["subtopic"] = reasoning
