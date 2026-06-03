export type QuestionUid = string;

export type KnownQuestionType =
  | "MCQ"
  | "MSQ"
  | "NAT"
  | "SUBJECTIVE"
  | "AMBIGUOUS"
  | "MARKS_TO_ALL"
  | "UNSUPPORTED";

export type QuestionType = KnownQuestionType | (string & {});

export type OptionLabel = "A" | "B" | "C" | "D" | "E" | (string & {});

export type AnswerValue = OptionLabel | OptionLabel[] | number | string | null;

export type AnswerTolerance =
  | {
      abs?: number;
      lower?: number;
      upper?: number;
      [key: string]: unknown;
    }
  | null;

export type AnswerSource =
  | string
  | {
      kind?: string;
      question_uid?: QuestionUid;
      [key: string]: unknown;
    };

export interface AnswerRecord {
  answer_uid?: string;
  question_uid?: QuestionUid;
  type: QuestionType;
  answer: AnswerValue;
  tolerance?: AnswerTolerance;
  source?: AnswerSource | null;
  [key: string]: unknown;
}

export type AnswerRecordMap = Record<QuestionUid, AnswerRecord>;

export interface QuestionOption {
  label?: OptionLabel;
  value?: string;
  text?: string;
  html?: string;
  image?: string;
  [key: string]: unknown;
}

export interface QuestionExamMeta {
  year?: number | null;
  set?: number | null;
  yearSetKey?: string | null;
  yearSetLabel?: string | null;
  exam_uid?: string | null;
  paper?: string | null;
  label?: string | null;
  [key: string]: unknown;
}

export interface QuestionSubtopic {
  slug: string;
  label: string;
  count?: number;
  [key: string]: unknown;
}

export interface QuestionRow {
  question_uid: QuestionUid;
  uid?: QuestionUid;
  id?: string;
  title?: string;
  question?: string;
  questionHtml?: string;
  preview?: string;
  subject?: string;
  subjectSlug?: string;
  subjectLabel?: string;
  topicSlug?: string;
  topicLabel?: string;
  type?: QuestionType;
  options?: Array<QuestionOption | string>;
  normalizedOptions?: QuestionOption[];
  answerMeta?: AnswerRecord;
  exam?: QuestionExamMeta;
  subtopics?: QuestionSubtopic[];
  tags?: string[];
  link?: string;
  canonicalExamUid?: string;
  rawExamUid?: string;
  malformed?: boolean;
  canonical?: any;
  detailShardKey?: string;
  _detailShard?: string;
  [key: string]: unknown;
}

export interface QuestionSearchIndexRow {
  question_uid: QuestionUid;
  title: string;
  subjectSlug?: string;
  subjectLabel?: string;
  year?: number | null;
  set?: number | null;
  yearSetKey?: string;
  yearSetLabel?: string;
  detailShardKey?: string;
  exam_uid?: string;
  id_str?: string | null;
  volume?: number | null;
  type?: QuestionType;
  link?: string;
  preview?: string;
  searchText?: string;
  tags?: string[];
  [key: string]: unknown;
}

export type QuestionDetailRow = QuestionRow;

export interface AptitudeSearchIndexRow {
  u: QuestionUid;
  t: QuestionType;
  s: string;
  ss: string;
  st: string;
  sts: string;
  y?: number | null;
  x?: string;
  sh: string;
  [key: string]: unknown;
}

export interface AptitudeQuestionRow extends QuestionRow {
  subjectLabel?: string;
  subjectSlug?: string;
  subtopicLabel?: string;
  subtopicSlug?: string;
}

export interface SubjectOption {
  slug: string;
  label: string;
  count?: number;
  [key: string]: unknown;
}

export interface SubtopicOption {
  slug: string;
  label: string;
  count?: number;
  [key: string]: unknown;
}

export interface YearSetOption {
  key: string;
  year: number;
  set?: number | null;
  label: string;
  count?: number;
  [key: string]: unknown;
}

export type StructuredSubtopics = Record<string, SubtopicOption[]>;
export type StructuredTopics = Record<string, string[]>;

export type ProgressFilter = "all" | "solved" | "unsolved" | "bookmarked" | (string & {});
export type DifficultyFilter = "all" | "easy" | "medium" | "hard" | (string & {});

export interface FilterSelectionState {
  selectedSubjects: string[];
  selectedTopics: string[];
  selectedYears: string[];
  selectedYearSets: string[];
  selectedTypes: QuestionType[];
  selectedSubtopics: string[];
  searchQuery: string;
  progressFilter: ProgressFilter;
  difficultyFilter: DifficultyFilter;
  yearRange: [number, number];
  hideSolved: boolean;
  showOnlySolved: boolean;
  showOnlyBookmarked: boolean;
}

export type FilterUpdate = Partial<FilterSelectionState>;

export interface StructuredTags {
  yearSets?: YearSetOption[];
  years?: string[];
  subjects?: SubjectOption[];
  topics?: string[];
  structuredSubtopics?: StructuredSubtopics;
  structuredTopics?: StructuredTopics;
  questionTypes?: QuestionType[];
  minYear?: number;
  maxYear?: number;
  hideYearFilters?: boolean;
  [key: string]: unknown;
}

export interface FilterStateShape {
  structuredTags?: StructuredTags;
  filters?: Partial<FilterSelectionState>;
  aptitudeLoading?: boolean;
  aptitudeError?: string;
  filteredQuestions?: QuestionRow[];
  totalQuestions?: number;
  solvedCount?: number;
  progressPercentage?: number;
}

export interface FilterActionsShape {
  updateFilters: (nextFilters: FilterUpdate) => void;
  clearFilters?: () => void;
  setHideSolved?: (value: boolean) => void;
  setShowOnlySolved?: (value: boolean) => void;
  setShowOnlyBookmarked?: (value: boolean) => void;
}

export interface PracticeAttemptHistoryEntry {
  submittedAt: string;
  correct: boolean;
  durationMs?: number;
  type?: QuestionType;
  [key: string]: unknown;
}

export interface PracticeProgressRecord {
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  correct: boolean;
  lastSubmittedAt: string;
  firstSubmittedAt: string;
  type?: QuestionType;
  lastInput?: unknown;
  lastDurationMs?: number;
  totalDurationMs?: number;
  timedAttemptCount?: number;
  averageDurationMs?: number;
  history?: PracticeAttemptHistoryEntry[];
  reviewLevel?: number;
  reviewIntervalDays?: number;
  reviewDueAt?: string;
  difficultyScore?: number;
  difficultyLabel?: string;
  incorrectRate?: number;
  globalDifficultyScore?: number | null;
  [key: string]: unknown;
}

export type PracticeProgressRecords = Record<QuestionUid, PracticeProgressRecord>;

export interface UserQuestionStateSnapshot {
  solvedQuestions: QuestionUid[];
  bookmarkedQuestions: QuestionUid[];
}

export interface QuestionBankManifest {
  bankVersion: string;
  generatedAt: string;
  questionCount: number;
  latestYear: number;
  yearSets: YearSetOption[];
  subjects?: SubjectOption[];
  [key: string]: unknown;
}

export interface QuestionDetailShard {
  generatedAt?: string;
  shardKey?: string;
  yearSetKey?: string;
  year?: number | null;
  questions: QuestionDetailRow[];
  [key: string]: unknown;
}

export interface AptitudeSearchIndex {
  version: number | string;
  questionCount: number;
  shardCount: number;
  subjects: SubjectOption[];
  questions: AptitudeSearchIndexRow[];
  [key: string]: unknown;
}

export interface AnswerRegistryPayload {
  version?: string;
  generated_at?: string;
  stats?: Record<string, number | string | null>;
  records_by_question_uid?: AnswerRecordMap;
  records_by_uid?: Record<string, AnswerRecord>;
  records_by_exam_uid?: Record<string, AnswerRecord>;
  question_uids?: QuestionUid[];
  [key: string]: unknown;
}
