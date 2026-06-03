import { getExamUidFromQuestion } from "../utils/examUid";
import type { QuestionUid, AnswerRecord, AnswerRecordMap } from "../types";

export interface QuestionIdentity {
  rawQuestionUid: string | null;
  questionUid: string | null;
  answerUid: string | null;
  examUid: string | null;
  storageUid: string | null;
  hasIdentity: boolean;
  reason: string;
}

export class AnswerService {
  static answersByQuestionUid: AnswerRecordMap = {};
  static answersByUid: Record<string, AnswerRecord> = {};
  static answersByExamUid: Record<string, AnswerRecord> = {};
  static unsupportedQuestionUids: Set<string> = new Set();
  static loaded: boolean = false;
  static loadError: string = "";

  static extractGateOverflowId(link: string = ""): string | null {
    const raw = String(link || "").trim();
    if (!raw) {
      return null;
    }
    const absoluteMatch = raw.match(
      /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
    );
    if (absoluteMatch) {
      return absoluteMatch[1];
    }
    const relativeMatch = raw.match(/^\/?(\d+)(?:[/?#]|$)/);
    return relativeMatch ? relativeMatch[1] : null;
  }

  static getQuestionIdentity(question: any = {}): QuestionIdentity {
    if (!question || typeof question !== "object") {
      return {
        rawQuestionUid: null,
        questionUid: null,
        answerUid: null,
        examUid: null,
        storageUid: null,
        hasIdentity: false,
        reason: "question_object_missing",
      };
    }

    const rawQuestionUid = question.question_uid
      ? String(question.question_uid)
      : null;

    let questionUid: string | null = null;
    if (rawQuestionUid && !rawQuestionUid.startsWith("local:")) {
      questionUid = rawQuestionUid;
    } else {
      const goId = this.extractGateOverflowId(question.link || "");
      if (goId) {
        questionUid = `go:${goId}`;
      }
    }

    const answerUid = this.getAnswerUid(question);
    const examUid = this.getExamUid(question);
    const hasIdentity = !!(questionUid || answerUid || examUid);
    const storageUid = questionUid || answerUid || examUid || rawQuestionUid;

    return {
      rawQuestionUid,
      questionUid,
      answerUid,
      examUid,
      storageUid,
      hasIdentity,
      reason: hasIdentity ? "ok" : "missing_join_keys",
    };
  }

  static getQuestionUid(question: any = {}): string | null {
    return this.getQuestionIdentity(question).questionUid;
  }

  static getAnswerUid(question: any = {}): string | null {
    if (!question || question.id_str == null || question.volume == null) {
      return null;
    }
    return `v${Number(question.volume)}:${String(question.id_str)}`;
  }

  static getExamUid(question: any = {}): string | null {
    return question?.canonicalExamUid || getExamUidFromQuestion(question);
  }

  static getStorageKeyForQuestion(question: any = {}): string | null {
    const identity = this.getQuestionIdentity(question);
    return identity.storageUid;
  }

  static async init(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const joinUrl = `${baseUrl}data/answers/answers_by_question_uid_v1.json`;
    const masterUrl = `${baseUrl}data/answers/answers_master_v1.json`;
    const examUrl = `${baseUrl}data/answers/answers_by_exam_uid_v1.json`;
    const unsupportedUrl = `${baseUrl}data/answers/unsupported_question_uids_v1.json`;

    try {
      const joinResponse = await fetch(joinUrl, { cache: "no-cache" });
      if (joinResponse.ok) {
        const joinPayload = await joinResponse.json();
        if (joinPayload.records_by_question_uid) {
          this.answersByQuestionUid = joinPayload.records_by_question_uid || {};
        } else if (joinPayload && typeof joinPayload === "object") {
          this.answersByQuestionUid = joinPayload;
        }
      }

      const masterResponse = await fetch(masterUrl, { cache: "no-cache" });
      if (masterResponse.ok) {
        const masterPayload = await masterResponse.json();
        this.answersByUid = masterPayload.records_by_uid || {};

        for (const [uid, record] of Object.entries(this.answersByUid)) {
          if (!record) {
            continue;
          }
          const questionUid = record.question_uid;
          if (!questionUid) {
            continue;
          }
          if (!this.answersByQuestionUid[questionUid]) {
            this.answersByQuestionUid[questionUid] = {
              answer_uid: uid,
              type: record.type,
              answer: record.answer,
              tolerance: record.tolerance || null,
              source: record.source || null,
            };
          }
        }
      }

      const examResponse = await fetch(examUrl, { cache: "no-cache" });
      if (examResponse.ok) {
        const examPayload = await examResponse.json();
        if (examPayload.records_by_exam_uid) {
          this.answersByExamUid = examPayload.records_by_exam_uid || {};
        } else if (examPayload && typeof examPayload === "object") {
          this.answersByExamUid = examPayload;
        }
      }

      const unsupportedResponse = await fetch(unsupportedUrl, {
        cache: "no-cache",
      });
      if (unsupportedResponse.ok) {
        const unsupportedPayload = await unsupportedResponse.json();
        const uidList = Array.isArray(unsupportedPayload?.question_uids)
          ? unsupportedPayload.question_uids
          : [];
        this.unsupportedQuestionUids = new Set(
          uidList
            .map((value: unknown) => String(value || "").trim())
            .filter(Boolean)
        );
      } else {
        this.unsupportedQuestionUids = new Set();
      }

      this.loadError = "";
      this.loaded = true;
    } catch (error: any) {
      this.loadError = error.message || "Failed to load answers";
      this.answersByQuestionUid = {};
      this.answersByUid = {};
      this.answersByExamUid = {};
      this.unsupportedQuestionUids = new Set();
      this.loaded = true;
    }
  }

  static getAnswerForQuestion(question: any = {}): AnswerRecord | null {
    const identity = this.getQuestionIdentity(question);
    const embeddedAnswer = question?.answerMeta;
    if (
      identity.rawQuestionUid
      && String(identity.rawQuestionUid).startsWith("APT-")
      && embeddedAnswer
      && embeddedAnswer.answer != null
    ) {
      return {
        answer_uid: `apt:${identity.rawQuestionUid}`,
        type: String(embeddedAnswer.type || question.type || "MCQ").trim().toUpperCase(),
        answer: embeddedAnswer.answer,
        tolerance: embeddedAnswer.tolerance ?? null,
        source: {
          kind: embeddedAnswer.source || "aptitude_embedded",
        },
      };
    }

    const questionUid = identity.questionUid;
    if (questionUid && this.answersByQuestionUid[questionUid]) {
      return this.answersByQuestionUid[questionUid];
    }

    const answerUid = identity.answerUid;
    if (answerUid && this.answersByUid[answerUid]) {
      return this.answersByUid[answerUid];
    }

    const examUid = identity.examUid;
    if (examUid && this.answersByExamUid[examUid]) {
      return this.answersByExamUid[examUid];
    }

    const unsupportedCandidates = [
      identity.questionUid,
      identity.rawQuestionUid,
    ].filter((val): val is string => Boolean(val));
    for (const candidate of unsupportedCandidates) {
      if (this.unsupportedQuestionUids.has(candidate)) {
        return {
          answer_uid: `unsupported:${candidate}`,
          type: "UNSUPPORTED",
          answer: null,
          tolerance: null,
          source: {
            kind: "unsupported_registry",
            question_uid: candidate,
          },
        };
      }
    }
    return null;
  }

  static hasAnswer(question: any = {}): boolean {
    return !!this.getAnswerForQuestion(question);
  }
}
