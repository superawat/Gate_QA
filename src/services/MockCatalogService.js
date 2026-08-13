import { getQuestionTrack, getQuestionYearSetIdentity } from "../utils/examTrack";

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

    this.pending = (async () => {
      const response = await fetch(catalogUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load mock catalog (${response.status}).`);
      }

      const payload = await response.json();
      let daPayload = null;
      try {
        const daResponse = await fetch(daCatalogUrl, { cache: "no-cache" });
        if (daResponse.ok) daPayload = await daResponse.json();
      } catch (error) {
        // DA catalog is additive; an older deployment may not have it yet.
      }
      const mergedPayload = daPayload
        ? {
          ...payload,
          papers: [...(Array.isArray(payload.papers) ? payload.papers : []), ...(Array.isArray(daPayload.papers) ? daPayload.papers : [])],
          byQuestionUid: { ...(payload.byQuestionUid || {}), ...(daPayload.byQuestionUid || {}) },
          scorableQuestionUids: [...(payload.scorableQuestionUids || []), ...(daPayload.scorableQuestionUids || [])],
        }
        : payload;
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
