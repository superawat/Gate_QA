import { describe, expect, test } from "vitest";

import { getLegacyRedirectTarget } from "./routes";

describe("routes", () => {
  test("treats legacy aptitude mode as the unified practice route", () => {
    expect(getLegacyRedirectTarget({
      pathname: "/",
      search: "?mode=aptitude&q=APT-ENG-0001",
    })).toEqual({
      pathname: "/practice",
      search: "",
      kind: "practice",
    });
  });

  test("routes legacy APT question links without standalone aptitude mode", () => {
    expect(getLegacyRedirectTarget({
      pathname: "/",
      search: "?question=APT-QNT-0001",
    })).toEqual({
      pathname: "/practice/question/APT-QNT-0001",
      search: "",
      kind: "question",
    });
  });
});
