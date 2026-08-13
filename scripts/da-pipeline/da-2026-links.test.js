import { describe, expect, test } from "vitest";
import { getDa2026GateOverflowLink } from "./da-2026-links.mjs";

describe("DA 2026 GateOverflow links", () => {
  test("provides a distinct GateOverflow question URL for all 65 paper questions", () => {
    const links = Array.from({ length: 65 }, (_, index) => getDa2026GateOverflowLink(index + 1));

    expect(links).toHaveLength(65);
    expect(new Set(links).size).toBe(65);
    expect(links.every((link) => /^https:\/\/gateoverflow\.in\/\d+\/gate-da-2026-(?:ga-)?question-\d+$/.test(link))).toBe(true);
    expect(links[0]).toBe("https://gateoverflow.in/523225/gate-da-2026-ga-question-1");
    expect(links[9]).toBe("https://gateoverflow.in/523216/gate-da-2026-ga-question-10");
    expect(links[10]).toBe("https://gateoverflow.in/523214/gate-da-2026-question-1");
    expect(links[39]).toBe("https://gateoverflow.in/523185/gate-da-2026-question-30");
    expect(links[40]).toBe("https://gateoverflow.in/523184/gate-da-2026-question-31");
    expect(links[50]).toBe("https://gateoverflow.in/523173/gate-da-2026-question-41");
    expect(links[64]).toBe("https://gateoverflow.in/523159/gate-da-2026-question-55");
  });
});
