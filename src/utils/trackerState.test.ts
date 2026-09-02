/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTrackerStore,
  saveTrackerStore,
  toggleTheoryStatus,
  setSubjectTheoryStatus,
  setRevisionStatus,
  incrementRevisionCount,
  setCustomField,
  saveTopicNote,
  recordRevisionEvent,
  resetTopicManualProgress,
  loadTrackerPreferences,
  saveTrackerPreferences,
  summarizeRevisionEvents,
  mergeSyncedRevisionSummary,
  deriveTopicMetrics,
  deriveSubjectMetrics,
  computeTopicPriority,
  deriveOverallTrackMetrics,
  getContinueTopic,
  createEmptyTrackerStore,
  loadCanonicalPracticeRecords,
  isQuestionInSubject,
  isQuestionInTrack,
  RevisionEvent,
  UserTrackerStore,
} from "./trackerState";
import { TopicNode, CSE_SUBJECTS, DA_SUBJECTS } from "../data/trackerTaxonomy";

describe("trackerState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("LocalStorage Store CRUD Operations", () => {
    it("loads default empty store when localStorage is empty", () => {
      const store = loadTrackerStore("cse");
      expect(store.theory).toEqual({});
      expect(store.revisions).toEqual({});
      expect(store.notes).toEqual({});
      expect(store.customFields).toEqual({});
      expect(store.dataVersion).toBe(1);
    });

    it("toggles theory status and records completion timestamp", () => {
      const topicId = "cse-os-virtual-memory-paging";
      const s1 = toggleTheoryStatus("cse", topicId);
      expect(s1.theory[topicId]?.isCompleted).toBe(true);
      expect(s1.theory[topicId]?.completedAt).toBeTruthy();

      const s2 = toggleTheoryStatus("cse", topicId);
      expect(s2.theory[topicId]?.isCompleted).toBe(false);
      expect(s2.theory[topicId]?.completedAt).toBeNull();
    });

    it("bulk marks subject topics as theory complete", () => {
      const topicIds = ["cse-os-processes-threads-scheduling", "cse-os-deadlocks"];
      const store = setSubjectTheoryStatus("cse", topicIds, true);
      expect(store.theory[topicIds[0]]?.isCompleted).toBe(true);
      expect(store.theory[topicIds[1]]?.isCompleted).toBe(true);
    });

    it("automatically ticks parent topic when all subtopics are completed", () => {
      const parentTopicId = "test-parent-topic";
      const subtopics = ["subtopic-1", "subtopic-2"];
      const parentInfo = { topicId: parentTopicId, subtopicIds: subtopics };

      // Complete subtopic 1 -> parent should still be false
      const s1 = toggleTheoryStatus("cse", subtopics[0], true, undefined, parentInfo);
      expect(s1.theory[subtopics[0]]?.isCompleted).toBe(true);
      expect(s1.theory[parentTopicId]?.isCompleted).toBe(false);

      // Complete subtopic 2 -> all subtopics done -> parent should automatically be true
      const s2 = toggleTheoryStatus("cse", subtopics[1], true, undefined, parentInfo);
      expect(s2.theory[subtopics[1]]?.isCompleted).toBe(true);
      expect(s2.theory[parentTopicId]?.isCompleted).toBe(true);

      // Uncheck subtopic 1 -> parent should automatically become false
      const s3 = toggleTheoryStatus("cse", subtopics[0], false, undefined, parentInfo);
      expect(s3.theory[subtopics[0]]?.isCompleted).toBe(false);
      expect(s3.theory[parentTopicId]?.isCompleted).toBe(false);
    });

    it("manages revision counters and revised status toggles with subtopic synchronization", () => {
      const parentTopicId = "cse-em-discrete-math-logic";
      const subtopics = ["cse-em-logic-prop", "cse-em-logic-fol"];
      const parentInfo = { topicId: parentTopicId, subtopicIds: subtopics };

      // Toggling topic revision to true marks all child subtopics as revised
      const s1 = setRevisionStatus("cse", parentTopicId, true, subtopics);
      expect(s1.revisions[parentTopicId]?.length).toBe(1);
      expect(s1.revisions[subtopics[0]]?.length).toBe(1);
      expect(s1.revisions[subtopics[1]]?.length).toBe(1);

      // Toggling topic revision to false clears all child subtopics revisions
      const s2 = setRevisionStatus("cse", parentTopicId, false, subtopics);
      expect(s2.revisions[parentTopicId]?.length).toBe(0);
      expect(s2.revisions[subtopics[0]]?.length).toBe(0);
      expect(s2.revisions[subtopics[1]]?.length).toBe(0);

      // Revising subtopic 1 -> parent should still not be revised
      const s3 = setRevisionStatus("cse", subtopics[0], true, undefined, parentInfo);
      expect(s3.revisions[subtopics[0]]?.length).toBe(1);
      expect(s3.revisions[parentTopicId]?.length || 0).toBe(0);

      // Revising subtopic 2 -> all subtopics revised -> parent automatically becomes revised
      const s4 = setRevisionStatus("cse", subtopics[1], true, undefined, parentInfo);
      expect(s4.revisions[subtopics[1]]?.length).toBe(1);
      expect(s4.revisions[parentTopicId]?.length).toBe(1);

      // Un-revising subtopic 1 -> parent automatically becomes un-revised
      const s5 = setRevisionStatus("cse", subtopics[0], false, undefined, parentInfo);
      expect(s5.revisions[subtopics[0]]?.length).toBe(0);
      expect(s5.revisions[parentTopicId]?.length).toBe(0);
    });

    it("sets and persists custom column fields", () => {
      const topicId = "cse-em-discrete-math-logic";
      const s1 = setCustomField("cse", topicId, "target", "2026-10-15");
      expect(s1.customFields[topicId]?.target).toBe("2026-10-15");

      const s2 = setCustomField("cse", topicId, "priority", "High");
      expect(s2.customFields[topicId]?.target).toBe("2026-10-15");
      expect(s2.customFields[topicId]?.priority).toBe("High");
    });

    it("saves topic notes with LWW timestamp and handles deletion tombstone", () => {
      const topicId = "cse-os-deadlocks";
      const s1 = saveTopicNote("cse", topicId, "Banker's algorithm safety test: Need <= Available");
      expect(s1.notes[topicId]?.content).toBe("Banker's algorithm safety test: Need <= Available");
      expect(s1.notes[topicId]?.isDeleted).toBe(false);
      expect(s1.notes[topicId]?.updatedAt).toBeTruthy();

      // Deleting note creates tombstone
      const s2 = saveTopicNote("cse", topicId, "");
      expect(s2.notes[topicId]?.content).toBe("");
      expect(s2.notes[topicId]?.isDeleted).toBe(true);
    });

    it("records revision events into append-only local history", () => {
      const topicId = "cse-algo-greedy-dynamic-programming";
      recordRevisionEvent("cse", topicId, { source: "practice", questionCount: 10, accuracyRate: 0.8 });
      recordRevisionEvent("cse", topicId, { source: "manual" });

      const store = loadTrackerStore("cse");
      expect(store.revisions[topicId]?.length).toBe(2);
      expect(store.revisions[topicId][0].source).toBe("manual");
      expect(store.revisions[topicId][1].source).toBe("practice");
    });

    it("resets manual topic progress without corrupting other state", () => {
      const topicId = "cse-coa-pipelining";
      toggleTheoryStatus("cse", topicId, true);
      saveTopicNote("cse", topicId, "Hazard formulas");
      recordRevisionEvent("cse", topicId, { source: "manual" });
      setCustomField("cse", topicId, "priority", "High");

      const resetStore = resetTopicManualProgress("cse", topicId);
      expect(resetStore.theory[topicId]).toBeUndefined();
      expect(resetStore.revisions[topicId]).toBeUndefined();
      expect(resetStore.customFields[topicId]).toBeUndefined();
      expect(resetStore.notes[topicId]?.isDeleted).toBe(true);
      expect(resetStore.notes[topicId]?.content).toBe("");
    });

    it("persists and loads tracker preferences", () => {
      const prefs = saveTrackerPreferences({
        countdownDisplayMode: "compact",
        showCountdownWidget: false,
        visibleColumns: ["marks", "target", "priority"],
      });
      expect(prefs.countdownDisplayMode).toBe("compact");
      expect(prefs.showCountdownWidget).toBe(false);
      expect(prefs.visibleColumns).toEqual(["marks", "target", "priority"]);

      const loaded = loadTrackerPreferences();
      expect(loaded.countdownDisplayMode).toBe("compact");
      expect(loaded.showCountdownWidget).toBe(false);
      expect(loaded.visibleColumns).toEqual(["marks", "target", "priority"]);
    });
  });

  describe("Deterministic Local -> Cloud Revision Summary Mapping", () => {
    it("summarizes empty events array into null summary", () => {
      const summary = summarizeRevisionEvents([]);
      expect(summary).toEqual({
        lastRevisedAt: null,
        lastSessionAccuracy: null,
        totalRevisionCount: 0,
      });
    });

    it("summarizes multi-event history into a bounded summary object", () => {
      const events: RevisionEvent[] = [
        { id: "rev_1", timestamp: "2026-08-01T10:00:00Z", source: "practice", accuracyRate: 0.6 },
        { id: "rev_2", timestamp: "2026-08-15T12:00:00Z", source: "practice", accuracyRate: 0.85 },
        { id: "rev_3", timestamp: "2026-08-10T09:00:00Z", source: "manual" },
      ];

      const summary = summarizeRevisionEvents(events);
      expect(summary.lastRevisedAt).toBe("2026-08-15T12:00:00Z");
      expect(summary.lastSessionAccuracy).toBe(0.85);
      expect(summary.totalRevisionCount).toBe(3);
    });

    it("merges remote SyncedRevisionSummary boundedly with local events", () => {
      const localEvents: RevisionEvent[] = [
        { id: "rev_1", timestamp: "2026-08-01T10:00:00Z", source: "practice", accuracyRate: 0.7 },
      ];
      const cloudSummary = {
        lastRevisedAt: "2026-08-20T10:00:00Z",
        lastSessionAccuracy: 0.9,
        totalRevisionCount: 4,
      };

      const merged = mergeSyncedRevisionSummary(localEvents, cloudSummary);
      expect(merged.lastRevisedAt).toBe("2026-08-20T10:00:00Z");
      expect(merged.lastSessionAccuracy).toBe(0.9);
      expect(merged.totalRevisionCount).toBe(4);
    });
  });

  describe("Canonical PYQ Mapping & Engineering Mathematics Fix", () => {
    const emSubject = CSE_SUBJECTS.find((s) => s.id === "cse-em")!;
    const mathLogicTopic = emSubject.topics.find((t) => t.id === "cse-em-discrete-math" || t.primaryTopicTag === "discrete-math")!;

    it("correctly maps Discrete Mathematics / Mathematical Logic questions to Engineering Mathematics", () => {
      const mockQuestions = [
        {
          uid: "go:2020-math-1",
          subjectSlug: "discrete-math",
          subject: "Discrete Mathematics",
          tags: ["discrete-mathematics", "propositional-logic", "first-order-logic"],
          subtopics: [{ slug: "propositional-logic", label: "Propositional Logic" }],
          track: "cse" as const,
        },
        {
          uid: "go:2021-math-2",
          subjectSlug: "discrete-math",
          subject: "Discrete Mathematics",
          tags: ["mathematical-logic", "first-order-logic"],
          subtopics: [{ slug: "first-order-logic", label: "First Order Logic" }],
          track: "cse" as const,
        },
        {
          uid: "go:2022-la-1",
          subjectSlug: "engg-math",
          subject: "Engineering Mathematics",
          tags: ["linear-algebra", "matrix", "eigen-value"],
          subtopics: [{ slug: "linear-algebra", label: "Linear Algebra" }],
          track: "cse" as const,
        },
      ];

      const store = createEmptyTrackerStore();
      const solvedSet = new Set(["go:2020-math-1"]);
      const progressMap = {
        "go:2020-math-1": { attemptsCount: 1, correctCount: 1, lastSubmittedAt: new Date().toISOString() },
      };

      // Derive topic metrics for Mathematical Logic
      const topicMetrics = deriveTopicMetrics(
        mathLogicTopic,
        store,
        mockQuestions,
        solvedSet,
        progressMap,
        "cse"
      );

      expect(topicMetrics.totalAvailablePyqs).toBe(2);
      expect(topicMetrics.attemptedPyqs).toBe(1);
      expect(topicMetrics.solvedPyqs).toBe(1);
      expect(topicMetrics.practiceCoverage).toBe(0.5);

      // Derive subject metrics for Engineering Mathematics (includes both engg-math and discrete-math)
      const subjectMetrics = deriveSubjectMetrics(
        emSubject,
        store,
        [topicMetrics],
        mockQuestions,
        solvedSet,
        progressMap,
        "cse"
      );

      expect(subjectMetrics.totalAvailablePyqs).toBe(3);
      expect(subjectMetrics.totalAttemptedPyqs).toBe(1);
      expect(subjectMetrics.totalSolvedPyqs).toBe(1);
    });

    it("enforces strict CSE and DA track isolation", () => {
      const mockQuestions = [
        {
          uid: "cse:os-1",
          subjectSlug: "os",
          tags: ["virtual-memory"],
          track: "cse" as const,
        },
        {
          uid: "da:ml-1",
          subjectSlug: "da:machine-learning",
          tags: ["supervised-learning"],
          track: "da" as const,
        },
      ];

      const store = createEmptyTrackerStore();
      const cseTopic = CSE_SUBJECTS.find((s) => s.id === "cse-os")!.topics.find((t) => t.primaryTopicTag === "virtual-memory")!;
      const daSubject = DA_SUBJECTS.find((s) => s.id === "da-ml")!;
      const daTopic = daSubject.topics[0]; // supervised learning

      // CSE track does not pick up DA question
      const cseMetrics = deriveTopicMetrics(cseTopic, store, mockQuestions, new Set(), {}, "cse");
      expect(cseMetrics.totalAvailablePyqs).toBe(1);

      // DA track does not pick up CSE question
      const daMetrics = deriveTopicMetrics(daTopic, store, mockQuestions, new Set(), {}, "da");
      expect(daMetrics.totalAvailablePyqs).toBe(1);
    });
  });

  describe("Derived Topic Metrics & Status Classifications", () => {
    const mockTopic: TopicNode = {
      id: "cse-os-virtual-memory-paging",
      label: "Memory Management & Virtual Memory",
      subjectSlug: "os",
      primaryTopicTag: "virtual-memory",
      secondaryTopicTags: ["paging", "tlb", "page-replacement"],
      estimatedHours: 11,
      weightageTier: "tier-1-high",
      marksRange: "3–5 Marks",
      keyConcepts: ["Paging", "TLB"],
    };

    const mockQuestions = [
      { uid: "q_vm_1", subjectSlug: "os", primaryTopic: "virtual-memory", tags: "gate2020 virtual-memory paging", track: "cse" as const },
      { uid: "q_vm_2", subjectSlug: "os", primaryTopic: "virtual-memory", tags: "gate2021 virtual-memory tlb", track: "cse" as const },
      { uid: "q_vm_3", subjectSlug: "os", primaryTopic: "virtual-memory", tags: "gate2022 virtual-memory", track: "cse" as const },
      { uid: "q_vm_4", subjectSlug: "os", primaryTopic: "virtual-memory", tags: "gate2023 virtual-memory", track: "cse" as const },
      { uid: "q_other", subjectSlug: "os", primaryTopic: "cpu-scheduling", tags: "gate2020 cpu-scheduling", track: "cse" as const },
    ];

    it("calculates NOT_STARTED when untouched", () => {
      const store = createEmptyTrackerStore();
      const metrics = deriveTopicMetrics(
        mockTopic,
        store,
        mockQuestions,
        new Set(),
        {}
      );

      expect(metrics.totalAvailablePyqs).toBe(4);
      expect(metrics.attemptedPyqs).toBe(0);
      expect(metrics.solvedPyqs).toBe(0);
      expect(metrics.status).toBe("NOT_STARTED");
    });

    it("calculates THEORY_ONLY when theory complete but 0 attempts", () => {
      const store = createEmptyTrackerStore();
      store.theory[mockTopic.id] = { isCompleted: true, completedAt: "2026-08-01T00:00:00Z" };

      const metrics = deriveTopicMetrics(
        mockTopic,
        store,
        mockQuestions,
        new Set(),
        {}
      );

      expect(metrics.theoryCompleted).toBe(true);
      expect(metrics.status).toBe("THEORY_ONLY");
      expect(metrics.needsPractice).toBe(true);
    });

    it("calculates WELL_PRACTICED when theory complete, >=75% attempted, and >=70% accuracy", () => {
      const store = createEmptyTrackerStore();
      store.theory[mockTopic.id] = { isCompleted: true, completedAt: "2026-08-01T00:00:00Z" };

      const solvedUids = new Set(["q_vm_1", "q_vm_2", "q_vm_3"]);
      const progressMap = {
        q_vm_1: { attemptsCount: 1, correctCount: 1, incorrectCount: 0, lastSubmittedAt: new Date().toISOString() },
        q_vm_2: { attemptsCount: 1, correctCount: 1, incorrectCount: 0, lastSubmittedAt: new Date().toISOString() },
        q_vm_3: { attemptsCount: 1, correctCount: 1, incorrectCount: 0, lastSubmittedAt: new Date().toISOString() },
        q_vm_4: { attemptsCount: 1, correctCount: 0, incorrectCount: 1, lastSubmittedAt: new Date().toISOString() },
      };

      const metrics = deriveTopicMetrics(
        mockTopic,
        store,
        mockQuestions,
        solvedUids,
        progressMap
      );

      expect(metrics.practiceCoverage).toBe(1.0); // 4 / 4
      expect(metrics.accuracyRate).toBe(0.75);     // 3 / 4 = 75%
      expect(metrics.status).toBe("WELL_PRACTICED");
    });

    it("flags REVISION_DUE when inactive > 21 days with prior practice", () => {
      const store = createEmptyTrackerStore();
      store.theory[mockTopic.id] = { isCompleted: true, completedAt: "2026-07-01T00:00:00Z" };

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 25); // 25 days ago

      const solvedUids = new Set(["q_vm_1", "q_vm_2", "q_vm_3"]);
      const progressMap = {
        q_vm_1: { attemptsCount: 1, correctCount: 1, lastSubmittedAt: oldDate.toISOString() },
        q_vm_2: { attemptsCount: 1, correctCount: 1, lastSubmittedAt: oldDate.toISOString() },
        q_vm_3: { attemptsCount: 1, correctCount: 1, lastSubmittedAt: oldDate.toISOString() },
      };

      const metrics = deriveTopicMetrics(
        mockTopic,
        store,
        mockQuestions,
        solvedUids,
        progressMap
      );

      expect(metrics.isRevisionDue).toBe(true);
      expect(metrics.status).toBe("REVISION_DUE");
    });
  });

  describe("Minimum Evidence Guard in Priority Scoring", () => {
    const mockTopic: TopicNode = {
      id: "cse-os-deadlocks",
      label: "Deadlocks",
      subjectSlug: "os",
      primaryTopicTag: "deadlocks",
      secondaryTopicTags: ["bankers-algorithm"],
      estimatedHours: 6,
      weightageTier: "tier-1-high",
      marksRange: "2–3 Marks",
      keyConcepts: ["Banker's algorithm"],
    };

    it("DOES NOT flag topic as weak when only 1 incorrect attempt is made (insufficient evidence)", () => {
      const score = computeTopicPriority(
        mockTopic,
        { isRevisionDue: false, attemptedPyqs: 1, accuracyRate: 0.0, practiceCoverage: 0.2 },
        false
      );

      expect(score).toBe(10);
    });

    it("flags verified weakness (+30) when attempts >= 5 and accuracy < 60%", () => {
      const score = computeTopicPriority(
        mockTopic,
        { isRevisionDue: false, attemptedPyqs: 8, accuracyRate: 0.50, practiceCoverage: 0.4 },
        false
      );

      expect(score).toBe(40);
    });

    it("awards revision urgency (+40) when revision is due and attempts >= 3", () => {
      const score = computeTopicPriority(
        mockTopic,
        { isRevisionDue: true, attemptedPyqs: 5, accuracyRate: 0.85, practiceCoverage: 0.8 },
        true
      );

      expect(score).toBe(50);
    });
  });

  describe("Continue Where You Left Off Detection", () => {
    it("detects the most recently practiced topic", () => {
      const t1: TopicNode = {
        id: "cse-os-cpu-scheduling",
        label: "CPU Scheduling",
        subjectSlug: "os",
        primaryTopicTag: "cpu-scheduling",
        secondaryTopicTags: [],
        estimatedHours: 8,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [],
      };
      const t2: TopicNode = {
        id: "cse-os-deadlocks",
        label: "Deadlocks",
        subjectSlug: "os",
        primaryTopicTag: "deadlocks",
        secondaryTopicTags: [],
        estimatedHours: 6,
        weightageTier: "tier-1-high",
        marksRange: "2–3 Marks",
        keyConcepts: [],
      };

      const m1 = {
        topicId: t1.id,
        lastPracticedAt: "2026-09-01T10:00:00Z",
      } as any;
      const m2 = {
        topicId: t2.id,
        lastPracticedAt: "2026-09-01T15:30:00Z", // Newer
      } as any;

      const continueItem = getContinueTopic([m1, m2], [t1, t2]);
      expect(continueItem?.topic.id).toBe("cse-os-deadlocks");
    });
  });

  describe("Scale Stress Test: Bounded Payload Check", () => {
    it("maintains bounded Supabase payload under 5,200 synthetic revision events (52 topics x 100 revisions)", () => {
      const syntheticRevisions: Record<string, RevisionEvent[]> = {};

      for (let topicIdx = 0; topicIdx < 52; topicIdx++) {
        const topicId = `topic_${topicIdx}`;
        syntheticRevisions[topicId] = [];
        for (let revIdx = 0; revIdx < 100; revIdx++) {
          syntheticRevisions[topicId].push({
            id: `rev_${topicIdx}_${revIdx}`,
            timestamp: new Date(Date.now() - revIdx * 86400000).toISOString(),
            source: "practice",
            questionCount: 10,
            accuracyRate: 0.75 + (revIdx % 20) * 0.01,
          });
        }
      }

      const syncedSummaries: Record<string, any> = {};
      for (const [topicId, events] of Object.entries(syntheticRevisions)) {
        syncedSummaries[topicId] = summarizeRevisionEvents(events);
      }

      const rawCloudJson = JSON.stringify(syncedSummaries);
      const payloadSizeBytes = new TextEncoder().encode(rawCloudJson).length;

      expect(payloadSizeBytes).toBeLessThan(8000);
      expect(Object.keys(syncedSummaries).length).toBe(52);
      expect(syncedSummaries["topic_0"].totalRevisionCount).toBe(100);
      expect(syncedSummaries["topic_0"].lastRevisedAt).toBeTruthy();
    });
  });

  describe("Canonical Practice & Question Bank Ingestion", () => {
    it("loads practice history and merges mock test sessions correctly", () => {
      window.localStorage.setItem(
        "gateqa_progress_v1",
        JSON.stringify({
          "go:1001": { attempts: 2, correctAttempts: 2, isSolved: true, correct: true },
          "go:1002": { attempts: 1, correctAttempts: 0, isSolved: false, correct: false },
        })
      );
      window.localStorage.setItem(
        "gate_qa_solved_questions",
        JSON.stringify(["go:1001", "go:1003"])
      );
      window.localStorage.setItem(
        "gateqa_mock_history_v1",
        JSON.stringify([
          {
            submittedAt: "2026-09-01T12:00:00Z",
            correctQuestions: [{ questionUid: "go:1004", timeSpentSeconds: 60 }],
            incorrectQuestions: [{ questionUid: "go:1005", timeSpentSeconds: 90 }],
            bonusQuestions: [],
          },
        ])
      );

      const canonical = loadCanonicalPracticeRecords("cse", window.localStorage);
      expect(canonical.solvedSet.has("go:1001")).toBe(true);
      expect(canonical.solvedSet.has("go:1003")).toBe(true);
      expect(canonical.solvedSet.has("go:1004")).toBe(true); // From mock history
      expect(canonical.progressMap["go:1004"]?.correctAttempts).toBe(1);
      expect(canonical.progressMap["go:1005"]?.incorrectAttempts).toBe(1);
    });

    it("isolates CSE and DA practice progress strictly", () => {
      window.localStorage.setItem(
        "gateqa_progress_v1",
        JSON.stringify({ "go:cse1": { attempts: 3, correctAttempts: 3 } })
      );
      window.localStorage.setItem(
        "gateqa_da_progress_v1",
        JSON.stringify({ "da:2024:set1:main:q1": { attempts: 1, correctAttempts: 1 } })
      );

      const cseCanonical = loadCanonicalPracticeRecords("cse", window.localStorage);
      const daCanonical = loadCanonicalPracticeRecords("da", window.localStorage);

      expect(cseCanonical.progressMap["go:cse1"]).toBeDefined();
      expect(cseCanonical.progressMap["da:2024:set1:main:q1"]).toBeUndefined();

      expect(daCanonical.progressMap["da:2024:set1:main:q1"]).toBeDefined();
      expect(daCanonical.progressMap["go:cse1"]).toBeUndefined();
    });

    it("derives non-zero authoritative PYQs for CSE subjects even if topic tags are unmapped", () => {
      const emSubject = CSE_SUBJECTS.find((s) => s.slug === "engg-math")!;
      const store = createEmptyTrackerStore();
      const mockQuestions = [
        { uid: "go:1", question_uid: "go:1", subjectSlug: "engg-math", tags: ["random-untagged-concept"], track: "cse" as const },
        { uid: "go:2", question_uid: "go:2", subjectSlug: "discrete-math", tags: [], track: "cse" as const },
        { uid: "go:3", question_uid: "go:3", subjectSlug: "os", tags: [], track: "cse" as const },
      ];
      const solvedSet = new Set(["go:1"]);
      const progressMap = {
        "go:1": { attempts: 1, correctAttempts: 1, isSolved: true },
      };

      const sMetrics = deriveSubjectMetrics(
        emSubject,
        store,
        [],
        mockQuestions,
        solvedSet,
        progressMap,
        "cse"
      );

      expect(sMetrics.totalAvailablePyqs).toBe(2); // Matches both engg-math and discrete-math
      expect(sMetrics.totalAttemptedPyqs).toBe(1);
      expect(sMetrics.totalSolvedPyqs).toBe(1);
      expect(sMetrics.accuracyRate).toBe(1);
    });

    it("verifies CSE and DA questions isolation in subject derivations", () => {
      const mlSubject = DA_SUBJECTS.find((s) => s.slug === "machine-learning")!;
      const store = createEmptyTrackerStore();
      const mockQuestions = [
        { uid: "da:2024:set1:main:q10", question_uid: "da:2024:set1:main:q10", subjectSlug: "machine-learning", track: "da" as const },
        { uid: "go:200", question_uid: "go:200", subjectSlug: "machine-learning", track: "cse" as const }, // Wrong track
      ];

      const daMetrics = deriveSubjectMetrics(
        mlSubject,
        store,
        [],
        mockQuestions,
        new Set(),
        {},
        "da"
      );

      expect(daMetrics.totalAvailablePyqs).toBe(1);
    });

    it("links mock checkbox and mockCount bidirectionally for that node independently", () => {
      // 1. Ticking mock when count is 0 -> mockCount becomes 1
      let store = setCustomField("cse", "topic-1", "mock", "true");
      expect(store.customFields["topic-1"]?.mock).toBe("true");
      expect(store.customFields["topic-1"]?.mockCount).toBe("1");

      // 2. Unticking mock -> mockCount becomes 0
      store = setCustomField("cse", "topic-1", "mock", "false");
      expect(store.customFields["topic-1"]?.mock).toBe("false");
      expect(store.customFields["topic-1"]?.mockCount).toBe("0");

      // 3. Setting mockCount > 0 -> mock becomes "true"
      store = setCustomField("cse", "topic-1", "mockCount", "3");
      expect(store.customFields["topic-1"]?.mock).toBe("true");
      expect(store.customFields["topic-1"]?.mockCount).toBe("3");

      // 4. Setting mockCount to 0 -> mock becomes "false"
      store = setCustomField("cse", "topic-1", "mockCount", "0");
      expect(store.customFields["topic-1"]?.mock).toBe("false");
      expect(store.customFields["topic-1"]?.mockCount).toBe("0");

      // 5. Verifies independence: Updating a subtopic or topic does not overwrite or cascade to others
      store = setCustomField("cse", "sub-1", "mock", "true");
      expect(store.customFields["sub-1"]?.mock).toBe("true");
      expect(store.customFields["sub-1"]?.mockCount).toBe("1");
      expect(store.customFields["topic-1"]?.mock).toBe("false"); // topic-1 unchanged
      expect(store.customFields["topic-1"]?.mockCount).toBe("0");

      store = setCustomField("cse", "subject-1", "mockCount", "5");
      expect(store.customFields["subject-1"]?.mock).toBe("true");
      expect(store.customFields["subject-1"]?.mockCount).toBe("5");
      expect(store.customFields["sub-1"]?.mockCount).toBe("1"); // sub-1 independent
    });
  });
});
