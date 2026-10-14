import { EXAM_TRACKS } from "../utils/examTrack";
import type { QuestionRow, StructuredTags } from "../types";

const baseUrl = () => (
  import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
);

export interface BranchPayload {
  version: string;
  generatedAt: string;
  track: string;
  questionCount: number;
  minYear: number;
  maxYear: number;
  years: number[];
  yearSets: any[];
  subjects: { slug: string; label: string }[];
  structuredSubtopics: Record<string, { slug: string; label: string }[]>;
  questions: any[];
}

export class BranchQuestionService {
  private static branchData: Map<string, BranchPayload> = new Map();
  private static questionsByBranch: Map<string, QuestionRow[]> = new Map();
  private static questionsByUid: Map<string, QuestionRow> = new Map();
  private static loadingPromises: Map<string, Promise<QuestionRow[]>> = new Map();
  private static detailShardCache: Map<string, Record<string, any>> = new Map();

  static isLoaded(branch: string): boolean {
    return this.questionsByBranch.has(branch) && (this.questionsByBranch.get(branch)?.length ?? 0) > 0;
  }

  static getQuestions(branch: string): QuestionRow[] {
    return this.questionsByBranch.get(branch) || [];
  }

  static getQuestionByUid(uid: string): QuestionRow | null {
    return this.questionsByUid.get(uid) || null;
  }

  static async init(branch: string): Promise<QuestionRow[]> {
    const track = String(branch || "").toLowerCase().trim();
    if (!["ec", "ee", "me", "ce"].includes(track)) {
      return [];
    }

    if (this.isLoaded(track)) {
      return this.questionsByBranch.get(track)!;
    }

    if (this.loadingPromises.has(track)) {
      return this.loadingPromises.get(track)!;
    }

    const loadPromise = (async () => {
      try {
        const url = `${baseUrl()}data/${track}/search-index.json`;
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) {
          throw new Error(`Failed to load ${track.toUpperCase()} questions (${res.status})`);
        }

        const payload: BranchPayload = await res.json();
        const rawQuestions = Array.isArray(payload.questions) ? payload.questions : [];

        const normalized: QuestionRow[] = rawQuestions.map((q) => ({
          ...q,
          question_uid: q.question_uid,
          uid: q.question_uid,
          id: q.question_uid,
          track,
          year: q.year,
          set: q.set || 1,
          yearSetKey: q.yearSetKey || `${track}-${q.year}-s${q.set || 1}`,
          yearSetIdentity: q.yearSetIdentity || `${track}:${q.year}:set-${q.set || 1}`,
          yearSetLabel: q.yearSetLabel || `${q.year} Set ${q.set || 1}`,
          exam: {
            paper: track.toUpperCase(),
            track,
            year: q.year,
            set: q.set || 1,
            yearSetKey: q.yearSetKey || `${track}-${q.year}-s${q.set || 1}`,
            yearSetIdentity: q.yearSetIdentity || `${track}:${q.year}:set-${q.set || 1}`,
            yearSetLabel: q.yearSetLabel || `${q.year} Set ${q.set || 1}`,
            label: `GATE ${track.toUpperCase()} ${q.year}`,
            exam_uid: q.exam_uid || q.question_uid,
          },
          detailShardKey: q.detailShardKey || `${track}-${q.year}-s${q.set || 1}`,
          subject: q.subjectLabel || q.subject || "Core Engineering",
          subjectSlug: q.subjectSlug,
          subjectLabel: q.subjectLabel,
          type: q.type || "MCQ",
          preview: q.preview || "",
          searchText: q.searchText || "",
          subtopics: q.subtopics || [],
          taxonomy: q.taxonomy || {
            primary: {
              subjectSlug: q.subjectSlug,
              subjectLabel: q.subjectLabel,
              subtopicSlug: q.subtopics?.[0]?.slug || "general",
              subtopicLabel: q.subtopics?.[0]?.label || "General",
            },
            secondary: [],
            conceptTags: [q.subjectSlug],
          },
          tags: Array.isArray(q.tags) ? q.tags : [q.subjectSlug],
        }));

        const { readBranchPreferences } = await import("../utils/branchPreference");
        const prefs = readBranchPreferences();
        if (prefs?.hasCompletedOnboarding && prefs.selectedBranches.length > 0 && !prefs.selectedBranches.includes(track)) {
          // Branch was deselected while network request was in-flight; discard without caching
          return [];
        }

        this.branchData.set(track, payload);
        this.questionsByBranch.set(track, normalized);

        for (const q of normalized) {
          if (q.question_uid) {
            this.questionsByUid.set(q.question_uid, q);
          }
        }

        return normalized;
      } catch (err: any) {
        console.warn(`[BranchQuestionService] Error loading ${track}:`, err?.message);
        throw err;
      } finally {
        this.loadingPromises.delete(track);
      }
    })();

    this.loadingPromises.set(track, loadPromise);
    return loadPromise;
  }

  static clearBranch(branch: string): void {
    const track = String(branch || "").toLowerCase().trim();
    this.branchData.delete(track);
    const questions = this.questionsByBranch.get(track) || [];
    for (const q of questions) {
      if (q?.question_uid) {
        this.questionsByUid.delete(q.question_uid);
      }
    }
    this.questionsByBranch.delete(track);
    this.loadingPromises.delete(track);

    for (const key of Array.from(this.detailShardCache.keys())) {
      if (key.startsWith(`${track}-`) || key.startsWith(`${track}:`)) {
        this.detailShardCache.delete(key);
      }
    }
  }

  static resetAll(): void {
    this.branchData.clear();
    this.questionsByBranch.clear();
    this.questionsByUid.clear();
    this.loadingPromises.clear();
    this.detailShardCache.clear();
  }

  static getStructuredTags(branch: string): StructuredTags {
    const track = String(branch || "").toLowerCase().trim();
    const data = this.branchData.get(track);
    const questions = this.questionsByBranch.get(track) || [];

    if (!data || questions.length === 0) {
      return {
        minYear: 2001,
        maxYear: 2026,
        years: [],
        yearSets: [],
        subjects: [],
        topics: [],
        structuredSubtopics: {},
        structuredTopics: {},
        questionTypes: ["MCQ", "MSQ", "NAT"],
      };
    }

    return {
      minYear: data.minYear || 2001,
      maxYear: data.maxYear || 2026,
      years: (data.years || []).map((y: any) => String(y)),
      yearSets: (data.yearSets || []).map((ys) => ({
        key: ys.key,
        identity: ys.identity,
        label: ys.label,
        year: ys.year,
        set: ys.set,
        track,
      })),
      subjects: (data.subjects || []).map((s) => ({
        slug: s.slug,
        label: s.label,
      })),
      topics: [],
      structuredSubtopics: data.structuredSubtopics || {},
      structuredTopics: {},
      questionTypes: ["MCQ", "MSQ", "NAT"],
    };
  }

  static async loadDetailShard(shardKey: string): Promise<Record<string, any>> {
    const key = String(shardKey || "").trim();
    if (this.detailShardCache.has(key)) {
      return this.detailShardCache.get(key)!;
    }

    const url = `${baseUrl()}question-detail-shards/${encodeURIComponent(key)}.json`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      throw new Error(`Failed to load shard ${key} (${res.status})`);
    }

    const payload = await res.json();
    const records = payload.recordsByQuestionUid || {};
    this.detailShardCache.set(key, records);
    return records;
  }

  static async ensureQuestionDetail(questionOrUid: any): Promise<QuestionRow | null> {
    const uid = typeof questionOrUid === "string" ? questionOrUid : questionOrUid?.question_uid;
    if (!uid) return null;

    const baseQuestion = this.questionsByUid.get(uid);
    if (!baseQuestion) return null;

    if (baseQuestion.question && baseQuestion.options && baseQuestion.detailed_solution) {
      return baseQuestion;
    }

    const shardKey = baseQuestion.detailShardKey || `${baseQuestion.track}-${baseQuestion.year}-s${baseQuestion.set || 1}`;
    try {
      const records = await this.loadDetailShard(shardKey);
      const detail = records[uid];
      if (detail) {
        const merged: QuestionRow = {
          ...baseQuestion,
          question: detail.question || baseQuestion.question,
          options: detail.options || baseQuestion.options,
          answer_meta: detail.answer_meta || baseQuestion.answer_meta,
          detailed_solution: detail.detailed_solution || null,
        };
        this.questionsByUid.set(uid, merged);
        return merged;
      }
    } catch (e: any) {
      console.warn(`[BranchQuestionService] Error fetching detail for ${uid}:`, e?.message);
    }

    return baseQuestion;
  }

  static getSubjectLabelBySlug(branch: string, slug: string): string {
    const data = this.branchData.get(branch);
    if (!data) return slug;
    const found = data.subjects.find((s) => s.slug === slug);
    return found ? found.label : slug;
  }
}
