import { describe, expect, it } from "vitest";
import { getGateOverflowSolutionLink } from "./solutionLink";

describe("getGateOverflowSolutionLink", () => {
  it("prefers the GateOverflow reference link over a PracticePaper source link", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://practicepaper.in/gate-da/gate-da-2024?page_no=1#q1",
        reference_link: "https://gateoverflow.in/422961/gate-ds%26ai-2024-question-1#a_list",
      })
    ).toBe("https://gateoverflow.in/422961/gate-ds%26ai-2024-question-1#a_list");
  });

  it("uses a GateOverflow question link when no separate reference exists", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://gateoverflow.in/523089/gate-cse-2026-question-1",
      })
    ).toBe("https://gateoverflow.in/523089/gate-cse-2026-question-1");
  });

  it("returns blank for PracticePaper or missing solution links", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://practicepaper.in/gate-da/gate-da-2024?page_no=1#q1",
      })
    ).toBe("");
    expect(getGateOverflowSolutionLink({})).toBe("");
  });

  it("rejects GateOverflow non-question pages", () => {
    expect(
      getGateOverflowSolutionLink({
        link: "https://gateoverflow.in/marks-distribution",
      })
    ).toBe("");
  });
});
