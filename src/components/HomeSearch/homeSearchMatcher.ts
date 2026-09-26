export type SearchResultType =
  | 'subject'
  | 'subtopic'
  | 'year'
  | 'question-number'
  | 'keyword'
  | 'free-text';

export interface SearchCatalogSubject {
  slug: string;
  label: string;
  count: number;
  aliases?: string[];
}

export interface SearchCatalogSubtopic {
  slug: string;
  label: string;
  parentSubject: string;
  parentLabel?: string;
  count: number;
}

export interface SearchCatalogYear {
  year: number;
  count: number;
  yearSetKeys: string[];
}

export interface SearchCatalogTag {
  tag: string;
  count: number;
}

export interface SearchCatalog {
  subjects: SearchCatalogSubject[];
  subtopics: SearchCatalogSubtopic[];
  years: SearchCatalogYear[];
  questionNumbers: {
    counts: Record<string, number>;
    maxNumber: number;
    totalQuestions: number;
  };
  tags: SearchCatalogTag[];
  generatedAt?: string;
}

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  label: string;
  subLabel?: string;
  count?: number | null;
  subjectFilter?: string;
  subtopicFilter?: string;
  yearFilter?: number;
  yearSetKeys?: string[];
  searchParam?: string;
}

/**
 * Normalizes user search input string.
 */
export function normalizeQuery(query: string): string {
  return String(query || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Classifies a user query and returns categorized match suggestions
 * from the precomputed homepage search catalog.
 */
export function classifyAndMatch(
  query: string,
  catalog: SearchCatalog | null | undefined,
  options: { maxResults?: number } = {}
): SearchResultItem[] {
  const normalized = normalizeQuery(query);
  const maxResults = options.maxResults || 8;

  if (!catalog || normalized.length < 2) {
    return [];
  }

  const results: SearchResultItem[] = [];
  const seenIds = new Set<string>();

  const addResult = (item: SearchResultItem) => {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      results.push(item);
    }
  };

  // 1. Question Number pattern: "question 30", "q30", "q 30", "#30", "question: 30"
  const qNumMatch = normalized.match(/^(?:question|ques|q|#)[.:\s]*(\d{1,3})$/i);
  if (qNumMatch) {
    const num = parseInt(qNumMatch[1], 10);
    const maxNum = catalog.questionNumbers?.maxNumber || 95;
    if (num > 0 && num <= maxNum) {
      const count = catalog.questionNumbers?.counts?.[String(num)] ?? null;
      addResult({
        id: `qnum-${num}`,
        type: 'question-number',
        label: `Question ${num}`,
        subLabel: count ? `in ${count} exam papers` : 'in all papers',
        count,
        searchParam: `question: ${num}`,
      });
    }
  }

  // 2. Year pattern: "2024", "gate 2024", "gate2024"
  const yearMatch = normalized.match(/^(?:gate\s*)?(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const yearEntry = (catalog.years || []).find((y) => y.year === year);
    if (yearEntry) {
      addResult({
        id: `year-${year}`,
        type: 'year',
        label: `GATE ${year}`,
        subLabel: `${yearEntry.count} questions across ${yearEntry.yearSetKeys?.length || 1} paper(s)`,
        count: yearEntry.count,
        yearFilter: year,
        yearSetKeys: yearEntry.yearSetKeys,
      });
    }
  }

  // 3. Subject matching: check slug, label, and aliases
  const matchedSubjects: Array<{ subject: SearchCatalogSubject; score: number }> = [];
  for (const subj of catalog.subjects || []) {
    const slug = subj.slug.toLowerCase();
    const label = subj.label.toLowerCase();
    const aliases = (subj.aliases || []).map((a) => a.toLowerCase());

    if (slug === normalized || aliases.includes(normalized)) {
      matchedSubjects.push({ subject: subj, score: 100 });
    } else if (label === normalized) {
      matchedSubjects.push({ subject: subj, score: 95 });
    } else if (label.startsWith(normalized) || slug.startsWith(normalized)) {
      matchedSubjects.push({ subject: subj, score: 80 });
    } else if (aliases.some((a) => a.startsWith(normalized))) {
      matchedSubjects.push({ subject: subj, score: 75 });
    } else if (label.includes(normalized) || aliases.some((a) => a.includes(normalized))) {
      matchedSubjects.push({ subject: subj, score: 50 });
    }
  }

  matchedSubjects
    .sort((a, b) => b.score - a.score || b.subject.count - a.subject.count)
    .slice(0, 3)
    .forEach(({ subject }) => {
      addResult({
        id: `subject-${subject.slug}`,
        type: 'subject',
        label: subject.label,
        subLabel: `${subject.count} questions`,
        count: subject.count,
        subjectFilter: subject.slug,
      });
    });

  // 4. Subtopic matching
  const matchedSubtopics: Array<{ subtopic: SearchCatalogSubtopic; score: number }> = [];
  for (const st of catalog.subtopics || []) {
    const label = st.label.toLowerCase();
    const slug = st.slug.toLowerCase();

    if (slug === normalized || label === normalized) {
      matchedSubtopics.push({ subtopic: st, score: 100 });
    } else if (label.startsWith(normalized) || slug.startsWith(normalized)) {
      matchedSubtopics.push({ subtopic: st, score: 80 });
    } else if (label.includes(` ${normalized}`) || slug.includes(`-${normalized}`)) {
      matchedSubtopics.push({ subtopic: st, score: 70 });
    } else if (label.includes(normalized) || slug.includes(normalized)) {
      matchedSubtopics.push({ subtopic: st, score: 40 });
    }
  }

  matchedSubtopics
    .sort((a, b) => b.score - a.score || b.subtopic.count - a.subtopic.count)
    .slice(0, 4)
    .forEach(({ subtopic }) => {
      addResult({
        id: `subtopic-${subtopic.parentSubject}-${subtopic.slug}`,
        type: 'subtopic',
        label: subtopic.label,
        subLabel: subtopic.parentLabel || subtopic.parentSubject,
        count: subtopic.count,
        searchParam: subtopic.label,
        subjectFilter: subtopic.parentSubject,
      });
    });

  // 5. Keyword / Tag matching (skip if tag equals already matched subject or subtopic slug)
  const matchedTags: Array<{ tag: SearchCatalogTag; score: number }> = [];
  for (const t of catalog.tags || []) {
    const tagClean = t.tag.toLowerCase();
    if (seenIds.has(`subject-${tagClean}`) || seenIds.has(`subtopic-${tagClean}`)) {
      continue;
    }

    if (tagClean === normalized) {
      matchedTags.push({ tag: t, score: 100 });
    } else if (tagClean.startsWith(normalized)) {
      matchedTags.push({ tag: t, score: 80 });
    } else if (tagClean.includes(normalized)) {
      matchedTags.push({ tag: t, score: 50 });
    }
  }

  matchedTags
    .sort((a, b) => b.score - a.score || b.tag.count - a.tag.count)
    .slice(0, 3)
    .forEach(({ tag }) => {
      addResult({
        id: `tag-${tag.tag}`,
        type: 'keyword',
        label: tag.tag.replace(/-/g, ' '),
        subLabel: 'Topic tag',
        count: tag.count,
        searchParam: tag.tag,
      });
    });

  // 6. Free-text search option (always offered as routing option for queries >= 2 chars)
  if (normalized.length >= 2) {
    addResult({
      id: `freetext-${normalized}`,
      type: 'free-text',
      label: `Search all questions for "${query.trim()}"`,
      subLabel: 'Full-text search',
      count: null,
      searchParam: query.trim(),
    });
  }

  return results.slice(0, maxResults);
}
