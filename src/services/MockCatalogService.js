import { getQuestionTrack, getQuestionYearSetIdentity } from "../utils/examTrack";
import { readBranchPreferences } from "../utils/branchPreference";

export const getMockPaperYearSetIdentity = (paper = {}) => (
  String(paper?.yearSetIdentity || getQuestionYearSetIdentity(paper, paper?.track) || paper?.yearSetKey || "").trim()
);

export class MockCatalogService {
  static catalog = null;
  static loaded = false;
  static loadError = "";
  static pending = null;

  static normalizeCatalog(payload = null) {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const papers = Array.isArray(payload.papers)
      ? payload.papers.map((paper) => {
        const track = getQuestionTrack(paper);
        return {
          ...paper,
          track,
          yearSetIdentity: getQuestionYearSetIdentity(paper, track),
          blockedQuestions: Array.isArray(paper?.blockedQuestions) ? paper.blockedQuestions : [],
          statusReason: String(paper?.statusReason || ""),
        };
      })
      : [];
    const byQuestionUid = payload.byQuestionUid && typeof payload.byQuestionUid === "object"
      ? Object.fromEntries(Object.entries(payload.byQuestionUid).map(([uid, meta]) => {
        const track = getQuestionTrack({ ...meta, question_uid: uid });
        return [uid, {
          ...meta,
          track,
          yearSetIdentity: getQuestionYearSetIdentity({ ...meta, question_uid: uid }, track),
        }];
      }))
      : {};
    const scorableQuestionUids = Array.isArray(payload.scorableQuestionUids)
      ? payload.scorableQuestionUids.map((value) => String(value || "").trim()).filter(Boolean)
      : [];

    return {
      ...payload,
      papers,
      byQuestionUid,
      scorableQuestionUids,
      scorableQuestionUidSet: new Set(scorableQuestionUids),
    };
  }

  static async init() {
    if (this.loaded && this.catalog) {
      return this.catalog;
    }

    if (this.pending) {
      return this.pending;
    }

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const catalogUrl = `${baseUrl}mock_catalog_v1.json`;
    const daCatalogUrl = `${baseUrl}mock_catalog_da_v1.json`;

    const branchPrefs = readBranchPreferences();
    const selected = (branchPrefs?.selectedBranches && branchPrefs.selectedBranches.length > 0)
      ? branchPrefs.selectedBranches
      : ["cse"];

    this.pending = (async () => {
      let payload = { papers: [], byQuestionUid: {}, scorableQuestionUids: [] };
      if (selected.includes("cse")) {
        const response = await fetch(catalogUrl, { cache: "no-cache" });
        if (response.ok) {
          payload = await response.json();
        }
      }

      let daPayload = null;
      if (selected.includes("da")) {
        try {
          const daResponse = await fetch(daCatalogUrl, { cache: "no-cache" });
          if (daResponse.ok) daPayload = await daResponse.json();
        } catch (error) {
          // DA catalog is additive; an older deployment may not have it yet.
        }
      }

      const branchTracks = ["ec", "ee", "me", "ce"].filter((track) => selected.includes(track));
      const branchPapers = [];
      const branchByQuestionUid = {};
      const branchScorableQuestionUids = [];

      await Promise.all(
        branchTracks.map(async (track) => {
          try {
            const branchResponse = await fetch(`${baseUrl}data/${track}/search-index.json`, { cache: "no-cache" });
            if (branchResponse.ok) {
              const data = await branchResponse.json();
              if (data && Array.isArray(data.yearSets)) {
                const questions = Array.isArray(data.questions) ? data.questions : [];
                const questionsByYearSet = new Map();
                for (const q of questions) {
                  const ysKey = q.yearSetIdentity || q.yearSetKey || `${track}:${q.year}:set-${q.set || 1}`;
                  if (!questionsByYearSet.has(ysKey)) {
                    questionsByYearSet.set(ysKey, []);
                  }
                  questionsByYearSet.get(ysKey).push(q);
                  const uid = String(q.question_uid || "").trim();
                  if (uid) {
                    const isGa = q.subjectSlug === "ga" || q.subject === "General Aptitude";
                    branchByQuestionUid[uid] = {
                      questionUid: uid,
                      track,
                      yearSetKey: q.yearSetKey || ysKey,
                      yearSetIdentity: q.yearSetIdentity || ysKey,
                      orderIndex: q.orderIndex || 1,
                      section: isGa ? "GA" : "CS",
                      type: q.type || "MCQ",
                      marks: q.marks || 1,
                      scorable: true,
                      paperReady: true,
                    };
                    branchScorableQuestionUids.push(uid);
                  }
                }

                for (const ys of data.yearSets) {
                  const ysQuestions = questionsByYearSet.get(ys.identity) || questionsByYearSet.get(ys.key) || [];
                  const gaCount = ysQuestions.filter((q) => q.subjectSlug === "ga" || q.subject === "General Aptitude").length;
                  const csCount = ysQuestions.length - gaCount;
                  branchPapers.push({
                    yearSetKey: ys.key,
                    yearSetIdentity: ys.identity,
                    track: ys.track || track,
                    year: ys.year,
                    set: ys.set || 1,
                    label: `GATE ${(ys.track || track).toUpperCase()} ${ys.year}${ys.set && ys.set > 1 ? ` Set ${ys.set}` : ""}`,
                    paperReady: ysQuestions.length > 0,
                    gaCount: gaCount || 10,
                    csCount: csCount || 55,
                    requiredQuestionCount: ysQuestions.length || 65,
                    requiredGaCount: gaCount || 10,
                    requiredCsCount: csCount || 55,
                    durationMinutes: 180,
                    scorableCount: ysQuestions.length || 65,
                    scorableGaCount: gaCount || 10,
                    scorableCsCount: csCount || 55,
                    missingScorableCount: 0,
                    statusReason: "Release-ready.",
                    blockedQuestions: [],
                    source: `gate${track}`,
                  });
                }
              }
            }
          } catch (error) {
            // Branch catalog is additive
          }
        })
      );

      const mergedPayload = {
        ...payload,
        papers: [
          ...(Array.isArray(payload.papers) ? payload.papers : []),
          ...(daPayload && Array.isArray(daPayload.papers) ? daPayload.papers : []),
          ...branchPapers,
        ],
        byQuestionUid: {
          ...(payload.byQuestionUid || {}),
          ...(daPayload ? daPayload.byQuestionUid || {} : {}),
          ...branchByQuestionUid,
        },
        scorableQuestionUids: [
          ...(payload.scorableQuestionUids || []),
          ...(daPayload ? daPayload.scorableQuestionUids || [] : []),
          ...branchScorableQuestionUids,
        ],
      };
      const catalog = this.normalizeCatalog(mergedPayload);
      if (!catalog) {
        throw new Error("Mock catalog payload is invalid.");
      }

      this.catalog = catalog;
      this.loaded = true;
      this.loadError = "";
      return catalog;
    })()
      .catch((error) => {
        this.catalog = null;
        this.loaded = false;
        this.loadError = error.message || "Failed to load mock catalog.";
        throw error;
      })
      .finally(() => {
        this.pending = null;
      });

    return this.pending;
  }

  static reset() {
    this.catalog = null;
    this.loaded = false;
    this.loadError = "";
    this.pending = null;
  }

  static getQuestionMeta(questionOrUid = null) {
    const questionUid = typeof questionOrUid === "string"
      ? String(questionOrUid || "").trim()
      : String(questionOrUid?.question_uid || "").trim();
    if (!questionUid || !this.catalog?.byQuestionUid) {
      return null;
    }

    return this.catalog.byQuestionUid[questionUid] || null;
  }

  static getReadyPapers() {
    return Array.isArray(this.catalog?.papers)
      ? this.catalog.papers.filter((paper) => paper?.paperReady)
      : [];
  }

  static getPapers() {
    return Array.isArray(this.catalog?.papers) ? this.catalog.papers : [];
  }
}
