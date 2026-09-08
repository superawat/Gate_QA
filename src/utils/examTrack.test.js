import { describe, expect, test } from "vitest";
import {
  buildTrackYearSetKey,
  getQuestionTrack,
  getQuestionYearSetIdentity,
  isDaQuestion,
  parseTrackYearSetKey,
  toLegacyYearSetKey,
} from "./examTrack";

describe("exam track identity", () => {
  test("never classifies an explicitly CSE question as DA because of a contaminated tag", () => {
    const question = {
      question_uid: "go:523089",
      title: "GATE CSE 2026 | Set 1 | GA | Question: 1",
      tags: ["gatecse-2026-set1", "gateda-2026"],
      yearSetKey: "2026-s1",
    };

    expect(getQuestionTrack(question)).toBe("cse");
    expect(isDaQuestion(question)).toBe(false);
    expect(getQuestionYearSetIdentity(question)).toBe("cse:2026:set-1");
  });

  test("identifies DA from its own metadata", () => {
    const question = {
      question_uid: "da:2026:set1:main:q1",
      title: "GATE DA 2026 | Question: 1",
      yearSetKey: "2026-s1",
    };

    expect(getQuestionTrack(question)).toBe("da");
    expect(isDaQuestion(question)).toBe(true);
    expect(getQuestionYearSetIdentity(question)).toBe("da:2026:set-1");
  });

  test("keeps canonical CSE and DA year-set identities independent while preserving CSE URLs", () => {
    const cseKey = buildTrackYearSetKey("cse", 2026, 1);
    const daKey = buildTrackYearSetKey("da", 2026, 1);

    expect(cseKey).not.toBe(daKey);
    expect(parseTrackYearSetKey("2026-s1")).toMatchObject({ track: "cse", key: cseKey });
    expect(parseTrackYearSetKey(daKey)).toMatchObject({ track: "da", key: daKey });
    expect(toLegacyYearSetKey(cseKey)).toBe("2026-s1");
    expect(toLegacyYearSetKey(daKey)).toBe(daKey);
  });

  test("parses and formats additional questions year-set identities cleanly", () => {
    const canonicalKey = buildTrackYearSetKey("cse", 2023, null, true);
    expect(canonicalKey).toBe("cse:2023:additional");

    const parsedCanonical = parseTrackYearSetKey(canonicalKey);
    expect(parsedCanonical).toMatchObject({
      track: "cse",
      year: 2023,
      set: null,
      isAdditional: true,
      key: "cse:2023:additional",
      legacyKey: "2023-additional",
    });

    const parsedLegacy = parseTrackYearSetKey("2023-additional");
    expect(parsedLegacy).toMatchObject({
      track: "cse",
      year: 2023,
      set: null,
      isAdditional: true,
      key: "cse:2023:additional",
      legacyKey: "2023-additional",
    });

    expect(toLegacyYearSetKey(canonicalKey)).toBe("2023-additional");

    const question = {
      question_uid: "go:411907",
      title: "GATE Civil 2023 Set 1 | General Aptitude Question: 1",
      paper_scope: "additional_ga",
      year: 2023,
    };
    expect(getQuestionYearSetIdentity(question)).toBe("cse:2023:additional");
  });
});
