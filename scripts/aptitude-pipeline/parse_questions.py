"""Parse normalized solved-paper and chapterwise text into aptitude rows."""

from __future__ import annotations

import html
import json
import re
import sys
from collections import Counter, defaultdict

from config import (
    ARTIFACT_DIR,
    DISPLAY_FORBIDDEN_RE,
    MAX_SUBTOPICS_PER_QUESTION,
    NORMALIZED_DIR,
    REVIEW_DIR,
    SOLVED_PAPER_PDFS,
    TAXONOMY,
    clean_invisible,
    ensure_dirs,
)

sys.stdout.reconfigure(encoding="utf-8")


OPTION_RE = re.compile(r"\(([a-d])\)", re.IGNORECASE)
QUESTION_RE = re.compile(r"\[\[APT_Q:(\d{1,3})\]\]|(?:\bQ\s*\.\s*(\d{1,3})\s*\.\s*)", re.IGNORECASE)
PAGE_MARKER_RE = re.compile(r"\[\[PAGE:\d+\]\]")
DIRECTION_RANGE_RE = re.compile(
    r"\b(?:Comprehension|Cloze\s+Test)?\s*:?\s*Direction\s*:-\s*\[?\s*Q\s*\.?\s*\d{1,3}.*$",
    re.IGNORECASE | re.DOTALL,
)
SET_HEADER_RE = re.compile(
    r"\[\[APT_SET_HEADER\s+year=(?P<year>20\d{2})\s+date=(?P<date>\d{1,2}[/.]\d{1,2}[/.]\d{2,4})\s+shift=(?P<shift>[^\]\s]+)\]\]",
    re.IGNORECASE,
)
ANSWER_SECTION_RE = re.compile(r"\b(?:Answer\s*Key|Solutions?)\s*:?\s*-?", re.IGNORECASE)
SOLUTION_ANSWER_RE = re.compile(r"\bSol\.?\s*(\d{1,4})\s*\.?\s*\(?\s*([a-d])\s*\)", re.IGNORECASE)
CHAPTER_SUBTOPIC_OVERRIDES = {
    "Reading Comprehension": "Comprehension",
    "Ratio": "Ratio and Proportion",
    "Proportion": "Ratio and Proportion",
    "Time and Work": "Work and Time",
    "Coding": "Coding - Decoding",
    "Direction": "Directions",
}


def compact_text(value: str) -> str:
    value = clean_invisible(value)
    value = value.replace("₹", "Rs. ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def strip_noise(value: str) -> str:
    lines = []
    for raw_line in value.splitlines():
        line = compact_text(raw_line)
        if not line:
            continue
        line = PAGE_MARKER_RE.sub(" ", line)
        if re.search(r"pinnacle|shift wise|download|ssccglpinnacle|search on tg", line, re.IGNORECASE):
            continue
        if re.fullmatch(r"[\-\s]+", line):
            continue
        lines.append(line)
    text = "\n".join(lines)
    text = PAGE_MARKER_RE.sub(" ", text)
    text = DIRECTION_RANGE_RE.sub(" ", text)
    text = re.sub(r"\bSSC\s+CGL\s+20\d{2}\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\s*\([^)]*Shift[^)]*\)", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(?:Reasoning|General Studies|General Awareness|Quantitative Aptitude|English)\b\s*$", " ", text, flags=re.IGNORECASE | re.MULTILINE)
    return text.strip()


def parse_iso_date(raw: str | None) -> str | None:
    if not raw:
        return None
    match = re.match(r"(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})", raw.strip())
    if not match:
        return None
    day = int(match.group(1))
    month = int(match.group(2))
    year = int(match.group(3))
    if year < 100:
        year += 2000
    return f"{year:04d}-{month:02d}-{day:02d}"


def subject_for_qnum(qnum: int) -> str | None:
    if 1 <= qnum <= 25:
        return "Reasoning"
    if 51 <= qnum <= 75:
        return "Mathematics"
    if 76 <= qnum <= 100:
        return "English"
    return None


def infer_subtopic(subject: str, text: str) -> str:
    lower = text.lower()
    if subject == "Reasoning":
        if re.search(r"coding|decoding|code language|coded as|code for|written as|symbolizes", lower):
            return "Coding - Decoding"
        if re.search(r"odd|different|does not belong|out of the following|not like the others", lower):
            return "Odd one out"
        if re.search(r"analogy|analogies|related word|similar relationship|same relationship|similar to the following", lower):
            return "Analogy"
        if re.search(r"arrange.*(?:word|letter)|dictionary order|alphabetical order|letter.*equal distance|in the word", lower):
            return "Word Arrangement"
        if re.search(r"\baddress(?:es)?\b|house number|street|colony|residency|pin\s*code", lower):
            return "Address"
        if re.search(r"decision making|course of action|decision should|what should you do|what would you do|best action|appropriate action", lower):
            return "Decision Making"
        if re.search(r"sitting around|seated in|parallel rows|facing the center|facing north|facing south|immediate left|immediate right|opposite to|around a circle", lower):
            return "Sitting Arrangement"
        if re.search(r"rank|ranking|order.*(?:top|bottom|left|right)|position from", lower):
            return "Order and Ranking"
        if re.search(r"mathematical operation|interchange|operators?|symbols?|evaluate|means|[@#$%&]|\bif\b.{0,20}[+\-\u00d7\u00f7]\s*=", lower):
            return "Mathematical Operations"
        if re.search(r"father|mother|sister|brother|daughter|son|husband|wife|grand|blood relation", lower):
            return "Blood Relation"
        if re.search(r"arithmetic reasoning|total number|how many|minimum number|maximum number|ratio of two numbers|sum of \d+|find x\b|probability|simple interest|find the rate|mixture|milk|water", lower):
            return "Arithmetic Reasoning"
        if re.search(r"calendar|date|day of the week|leap year", lower):
            return "Calendar"
        if re.search(r"word formation|formed from|letters.*word|meaningful word", lower):
            return "Word Formation"
        if re.search(r"series|letter-cluster|number series|comes next|next term|complete the pattern|breaks the pattern|find the number that fits|fits:", lower):
            return "Series"
        if re.search(r"missing number|replace the question mark|question mark|missing term", lower):
            return "Missing Number"
        if re.search(r"statements?.*conclusions?|statements?.*arguments?|only conclusion|statement and conclusion|assumptions? that must hold|identify the assumptions?", lower):
            return "Statement And Conclusion"
        if re.search(r"syllogism|all\s+\w+\s+are|some\s+\w+\s+are|no\s+\w+\s+(?:is|are)", lower):
            return "Syllogism"
        if re.search(r"inequality|greater than|less than|not greater|not less|[<>]=?", lower):
            return "Inequality"
        if re.search(r"direction|north|south|east|west|left|right|clockwise|anti-clockwise", lower):
            return "Directions"
        if re.search(r"sitting|seating|seated|circular arrangement|linear arrangement", lower):
            return "Sitting Arrangement"
        if re.search(r"puzzle|floor|persons?|people|boxes|days", lower):
            return "Puzzle"
        return "Miscellaneous"
    if subject == "Mathematics":
        if re.search(r"hcf|lcm|highest common|least common|least square number.*divisible|exactly divisible by|smallest number.*divided", lower):
            return "HCF and LCM"
        if re.search(r"simplify|simplification|evaluate|value of|fraction|decimal|surds?", lower):
            return "Simplification"
        if re.search(r"trigonometry|\b(?:sin|cos|tan|cot|sec|cosec)\b", lower):
            return "Trigonometry"
        if re.search(r"height|distance|elevation|depression|shadow", lower):
            return "Height and Distance"
        if re.search(r"mensuration|volume|surface area|cuboid|cube|cylinder|cone|sphere|hemisphere|frustum", lower):
            return "Mensuration"
        if re.search(r"coordinate|abscissa|ordinate|slope", lower):
            return "Coordinate Geometry"
        if re.search(r"probability|chances?|randomly", lower):
            return "Probability"
        if re.search(r"mean|median|mode", lower):
            return "Mean, Median & Mode"
        if re.search(r"average", lower):
            return "Average"
        if re.search(r"data|table|chart|graph|pie chart|bar graph|line graph", lower):
            return "Data Interpretation"
        if re.search(r"partnership|partner|share of profit", lower):
            return "Partnership"
        if re.search(r"mixture|alligation|milk|water|solution|acid", lower):
            return "Mixture and Alligation"
        if re.search(r"pipe|cistern|tank|inlet|outlet", lower):
            return "Pipe and Cistern"
        if re.search(r"boat|stream|upstream|downstream|current", lower):
            return "Boat and Stream"
        if re.search(r"race|circular track|lap", lower):
            return "Linear/Circular Race"
        if re.search(r"speed|distance|train|travels?|journey|km/h|metres? per second|time taken", lower):
            return "Time, Speed and Distance"
        if re.search(r"work|task|complete.*days|efficiency|men can|women can", lower):
            return "Work and Time"
        if re.search(r"ratio|proportion", lower):
            return "Ratio and Proportion"
        if re.search(r"profit|loss|marked price|cost price|selling price", lower):
            return "Profit and Loss"
        if re.search(r"discount", lower):
            return "Discount"
        if re.search(r"compound interest|compounded", lower):
            return "Compound Interest"
        if re.search(r"simple interest", lower):
            return "Simple Interest"
        if re.search(r"instalment|installment|emi", lower):
            return "Installment"
        if re.search(r"percent|percentage|per cent|%", lower):
            return "Percentage"
        if re.search(r"area|circle|triangle|quadrilateral|geometry|disc|ring|diameter|radius|angle|perimeter", lower):
            return "Geometry"
        if re.search(r"equation|algebra|polynomial|\bx\b|\by\b|linear", lower):
            return "Algebra"
        return "Number System"
    if subject == "English":
        if re.search(r"spot.*error|error in|grammatical error|part.*error", lower):
            return "Spot the Error"
        if re.search(r"improve|sentence improvement|correct option|better expresses|substitute|replace the highlighted|replace the underline|substitute the underline|most suitable option|scarcely|insisted on|high time|prevent industries", lower):
            return "Sentence Improvement"
        if re.search(r"narration|direct speech|indirect speech|reported speech|direct/indirect|indirect/direct|direct form|indirect form|she remarked|he said|she said|teacher asked|asked them|asked me|he urged|announced that|claimed that|said to", lower):
            return "Narration"
        if re.search(r"active voice|passive voice|active to passive|passive to active|from active|from passive", lower):
            return "Active Passive"
        if re.search(r"para jumble|rearrange|arrange.*sentence|proper sequence|jumbled", lower):
            return "Para Jumble"
        if re.search(r"cloze", lower):
            return "Cloze Test"
        if re.search(r"passage|read the following|comprehension|what does|what is|what caused|what role|according to|besides|how does|which factor|which mission|when was|which of the following is not listed|suggested solution|major consequence|primary reason|main concern|main reason", lower):
            return "Comprehension"
        if re.search(r"one word|one-word|single word", lower):
            return "One Word Substitution"
        if re.search(r"idiom|phrase", lower):
            return "Idioms"
        if re.search(r"synonym|similar meaning", lower):
            return "Synonyms"
        if re.search(r"antonym|opposite meaning|opposite in meaning", lower):
            return "Antonyms"
        if re.search(r"spelling|misspelt|misspelled|correctly spelt|correct spelt", lower):
            return "Spelling Check"
        if re.search(r"homonym|homophone|highlighted word with a different meaning|uses a different meaning|using a different meaning", lower):
            return "Homonyms"
        if re.search(r"blank|___|fill", lower):
            return "Fill in the Blanks"
        return "Miscellaneous"
    raise ValueError(f"Unknown subject: {subject}")


def parse_answer_key(block: str) -> dict[int, str]:
    before_solutions = re.split(r"\bSolutions?\s*:-", block, flags=re.IGNORECASE)[0]
    answers = {}
    for match in re.finditer(r"\b(\d{1,3})\s*\.\s*\(\s*([a-d])\s*\)", before_solutions, re.IGNORECASE):
        qnum = int(match.group(1))
        if 1 <= qnum <= 100:
            answers[qnum] = match.group(2).upper()
    return answers


def parse_answers(block: str) -> dict[int, str]:
    answers = parse_answer_key(block)
    for match in SOLUTION_ANSWER_RE.finditer(block):
        qnum = int(match.group(1))
        if qnum <= 1000:
            answers.setdefault(qnum, match.group(2).upper())
    return answers


def split_options(question_block: str) -> tuple[str, list[str]]:
    question_block = PAGE_MARKER_RE.sub(" ", question_block)
    question_block = DIRECTION_RANGE_RE.sub(" ", question_block)
    matches = list(OPTION_RE.finditer(question_block))
    if len(matches) < 4:
        return compact_text(question_block), []

    option_matches = matches[-4:]
    question_text = question_block[: option_matches[0].start()]
    options = []
    for index, marker in enumerate(option_matches):
        start = marker.end()
        end = option_matches[index + 1].start() if index + 1 < len(option_matches) else len(question_block)
        option_text = question_block[start:end]
        option_text = PAGE_MARKER_RE.sub(" ", option_text)
        option_text = DIRECTION_RANGE_RE.sub(" ", option_text)
        option_text = re.sub(r"\bGeneral\s+Awareness\b.*$", " ", option_text, flags=re.IGNORECASE | re.DOTALL)
        options.append(compact_text(option_text))

    question_text = PAGE_MARKER_RE.sub(" ", question_text)
    question_text = DIRECTION_RANGE_RE.sub(" ", question_text)
    return compact_text(question_text), options


def to_question_html(question_text: str, options: list[str]) -> str:
    paragraphs = [
        f"<p>{html.escape(part)}</p>"
        for part in re.split(r"\n{2,}", question_text)
        if compact_text(part)
    ]
    if not paragraphs:
        paragraphs = [f"<p>{html.escape(compact_text(question_text))}</p>"]
    if options:
        items = "".join(f"<li>{html.escape(option)}</li>" for option in options)
        paragraphs.append(f'<ol style="list-style-type:upper-alpha">{items}</ol>')
    return "\n".join(paragraphs)


def latest_page_marker(text: str, offset: int) -> int | None:
    markers = list(re.finditer(r"\[\[PAGE:(\d+)\]\]", text[:offset]))
    if not markers:
        return None
    return int(markers[-1].group(1))


def subtopic_from_chapter(subject: str, chapter: str | None, question_text: str) -> str:
    if chapter in TAXONOMY.get(subject, []):
        return chapter
    if chapter in CHAPTER_SUBTOPIC_OVERRIDES:
        return CHAPTER_SUBTOPIC_OVERRIDES[chapter]
    return infer_subtopic(subject, question_text)


def row_from_question(
    *,
    pdf_file: str,
    qnum: int,
    subject: str,
    subtopic: str,
    question_text: str,
    options: list[str],
    answer: str,
    source: dict,
) -> dict | None:
    if len(options) != 4 or answer not in {"A", "B", "C", "D"}:
        return None
    question_html = to_question_html(question_text, options)
    if DISPLAY_FORBIDDEN_RE.search(question_html):
        return None
    return {
        "questionHtml": question_html,
        "options": options,
        "answer": answer,
        "type": "MCQ",
        "subject": subject,
        "subtopic": subtopic,
        "year": None,
        "_source": {
            **source,
            "originalQNum": str(qnum),
            "pdfFile": pdf_file,
        },
    }


def iter_set_chunks(text: str):
    headers = list(SET_HEADER_RE.finditer(text))
    for index, header in enumerate(headers):
        start = header.start()
        end = headers[index + 1].start() if index + 1 < len(headers) else len(text)
        yield index + 1, header, text[start:end]


def parse_set(pdf_file: str, set_no: int, header, chunk: str) -> list[dict]:
    answer_split = re.split(r"\bAnswer\s*Key\s*:-", chunk, maxsplit=1, flags=re.IGNORECASE)
    if len(answer_split) < 2:
        return []

    questions_block = answer_split[0]
    answer_block = answer_split[1]
    answers = parse_answer_key(answer_block)
    q_matches = list(QUESTION_RE.finditer(questions_block))
    rows = []

    for index, q_match in enumerate(q_matches):
        qnum = int(next(group for group in q_match.groups() if group))
        subject = subject_for_qnum(qnum)
        if not subject:
            continue

        start = q_match.end()
        end = q_matches[index + 1].start() if index + 1 < len(q_matches) else len(questions_block)
        raw_body = strip_noise(questions_block[start:end])
        question_text, options = split_options(raw_body)
        answer = answers.get(qnum)
        if len(options) != 4 or answer not in {"A", "B", "C", "D"}:
            continue

        subtopic = infer_subtopic(subject, question_text)
        page = latest_page_marker(questions_block, q_match.start())
        source = {
            "examBody": "SSC",
            "examName": "CGL",
            "tier": 1,
            "set": str(set_no),
            "originalQNum": str(qnum),
            "examDate": parse_iso_date(header.group("date")),
            "shift": header.group("shift"),
            "pdfFile": pdf_file,
            "pdfPage": page,
        }
        row = row_from_question(
            pdf_file=pdf_file,
            qnum=qnum,
            subject=subject,
            subtopic=subtopic,
            question_text=question_text,
            options=options,
            answer=answer,
            source=source,
        )
        if row:
            rows.append(row)

    return rows


def parse_question_span(
    *,
    pdf_file: str,
    subject: str,
    chapter: str | None,
    questions_block: str,
    answer_block: str,
) -> list[dict]:
    answers = parse_answers(answer_block)
    q_matches = list(QUESTION_RE.finditer(questions_block))
    rows = []

    for index, q_match in enumerate(q_matches):
        qnum = int(next(group for group in q_match.groups() if group))
        answer = answers.get(qnum)
        if answer not in {"A", "B", "C", "D"}:
            continue

        start = q_match.end()
        end = q_matches[index + 1].start() if index + 1 < len(q_matches) else len(questions_block)
        raw_body = strip_noise(questions_block[start:end])
        question_text, options = split_options(raw_body)
        subtopic = subtopic_from_chapter(subject, chapter, question_text)
        page = latest_page_marker(questions_block, q_match.start())
        source = {
            "examBody": "SSC",
            "examName": "Chapterwise",
            "tier": None,
            "set": chapter or None,
            "examDate": None,
            "shift": None,
            "pdfPage": page,
            "chapter": chapter or None,
        }
        row = row_from_question(
            pdf_file=pdf_file,
            qnum=qnum,
            subject=subject,
            subtopic=subtopic,
            question_text=question_text,
            options=options,
            answer=answer,
            source=source,
        )
        if row:
            rows.append(row)

    return rows


def parse_chapterwise_text(pdf_file: str, subject: str, chapter: str | None, text: str) -> list[dict]:
    rows = []
    cursor = 0
    text_length = len(text)

    while cursor < text_length:
        marker = ANSWER_SECTION_RE.search(text, cursor)
        if not marker:
            break

        next_question = QUESTION_RE.search(text, marker.end())
        answer_end = next_question.start() if next_question else text_length
        questions_block = text[cursor : marker.start()]
        answer_block = text[marker.start() : answer_end]
        rows.extend(
            parse_question_span(
                pdf_file=pdf_file,
                subject=subject,
                chapter=chapter,
                questions_block=questions_block,
                answer_block=answer_block,
            )
        )

        cursor = answer_end

    return rows


def main() -> None:
    ensure_dirs()
    normalized_path = NORMALIZED_DIR / "all-pages.json"
    if not normalized_path.exists():
        raise SystemExit("Run normalize_text.py first.")

    pages = json.loads(normalized_path.read_text(encoding="utf-8"))
    pages_by_pdf: dict[str, list[dict]] = defaultdict(list)
    chapter_groups: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    marker_counts = Counter()
    for page in pages:
        pdf_file = page.get("pdf")
        if not pdf_file:
            continue
        marker_counts[pdf_file] += len(QUESTION_RE.findall(page.get("text") or ""))
        if pdf_file in SOLVED_PAPER_PDFS:
            pages_by_pdf[pdf_file].append(page)
            continue
        subject = page.get("subject")
        if subject in TAXONOMY:
            chapter_groups[(pdf_file, subject, page.get("chapter") or "Unknown")].append(page)

    parsed = []
    parsed_by_pdf = Counter()
    for pdf_file, pdf_pages in pages_by_pdf.items():
        pdf_pages.sort(key=lambda entry: int(entry["page"]))
        chunks = []
        for entry in pdf_pages:
            page_text = entry.get("text") or ""
            chunks.append(f"[[PAGE:{entry['page']}]]\n{page_text}")
        text = "\n\n".join(chunks)
        for set_no, header, chunk in iter_set_chunks(text):
            rows = parse_set(pdf_file, set_no, header, chunk)
            parsed.extend(rows)
            parsed_by_pdf[pdf_file] += len(rows)

    for (pdf_file, subject, chapter), group_pages in chapter_groups.items():
        group_pages.sort(key=lambda entry: int(entry["page"]))
        text = "\n\n".join(
            f"[[PAGE:{entry['page']}]]\n{entry.get('text') or ''}" for entry in group_pages
        )
        rows = parse_chapterwise_text(pdf_file, subject, chapter, text)
        parsed.extend(rows)
        parsed_by_pdf[pdf_file] += len(rows)

    for row in parsed:
        if row["subtopic"] not in TAXONOMY[row["subject"]]:
            raise RuntimeError(f"Invalid subtopic: {row['subject']} / {row['subtopic']}")
        if MAX_SUBTOPICS_PER_QUESTION != 1:
            raise RuntimeError("MAX_SUBTOPICS_PER_QUESTION invariant changed unexpectedly.")

    output_path = ARTIFACT_DIR / "parsed-questions.json"
    output_path.write_text(json.dumps(parsed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    yield_report = {
        "totalQuestionMarkers": sum(marker_counts.values()),
        "totalParsedRows": len(parsed),
        "byPdf": [
            {
                "pdf": pdf_file,
                "questionMarkers": marker_counts[pdf_file],
                "parsedRows": parsed_by_pdf[pdf_file],
            }
            for pdf_file in sorted(marker_counts)
        ],
    }
    (REVIEW_DIR / "aptitude-yield-audit.json").write_text(
        json.dumps(yield_report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"[parse_questions] wrote {len(parsed)} parsed questions")
    print(f"[parse_questions] yield audit: {REVIEW_DIR / 'aptitude-yield-audit.json'}")


if __name__ == "__main__":
    main()
