// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STUDENT_QUOTES,
  getQuoteForToday,
  getNextQuote,
  parseQuote,
  getQuoteAuthor,
  QUOTE_DECK_STORAGE_KEY,
  QUOTE_DWELL_TIME_MS,
} from "./motivationalQuotes";

describe("motivationalQuotes module", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("STUDENT_QUOTES dataset integrity", () => {
    it("contains over 350 curated, depthful study quotes", () => {
      expect(STUDENT_QUOTES.length).toBeGreaterThanOrEqual(350);
    });

    it("ensures every quote has valid text and author structure", () => {
      for (const quote of STUDENT_QUOTES) {
        expect(typeof quote).toBe("string");
        expect(quote.length).toBeGreaterThan(15);
        const { text, author } = parseQuote(quote);
        expect(text).toBeTruthy();
        expect(author).toBeTruthy();
      }
    });

    it("has 100% unique quotes with zero duplicate text", () => {
      const normalized = STUDENT_QUOTES.map((q) =>
        q.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      const unique = new Set(normalized);
      expect(unique.size).toBe(STUDENT_QUOTES.length);
    });

    it("guarantees that no two consecutive quotes share the same author", () => {
      for (let i = 1; i < STUDENT_QUOTES.length; i++) {
        const prevAuthor = getQuoteAuthor(STUDENT_QUOTES[i - 1]);
        const currAuthor = getQuoteAuthor(STUDENT_QUOTES[i]);
        expect(currAuthor).not.toBe(prevAuthor);
      }
    });
  });

  describe("parseQuote helper", () => {
    it("correctly extracts text and author from quote string", () => {
      const parsed = parseQuote("Dream, dream, dream. — A. P. J. Abdul Kalam");
      expect(parsed.text).toBe("Dream, dream, dream.");
      expect(parsed.author).toBe("A. P. J. Abdul Kalam");
    });

    it("gracefully handles missing author or empty string", () => {
      expect(parseQuote("")).toEqual({ text: "", author: "" });
      expect(parseQuote(null)).toEqual({ text: "", author: "" });
      expect(parseQuote("Only text without dash")).toEqual({
        text: "Only text without dash",
        author: "",
      });
    });
  });

  describe("Zero-Repeat Shuffled Deck Algorithm", () => {
    it("returns a valid quote on first run and saves deck state in localStorage", () => {
      const quote = getQuoteForToday();
      expect(STUDENT_QUOTES).toContain(quote);

      const storedRaw = localStorage.getItem(QUOTE_DECK_STORAGE_KEY);
      expect(storedRaw).toBeTruthy();
      const state = JSON.parse(storedRaw);
      expect(state.deck.length).toBe(STUDENT_QUOTES.length);
      expect(state.pointer).toBe(0);
      expect(state.currentQuote).toBe(quote);
    });

    it("preserves the quote within the dwell time window", () => {
      const baseTime = 1000000;
      vi.spyOn(Date, "now").mockReturnValue(baseTime);

      const first = getQuoteForToday();

      // 5 minutes later (less than QUOTE_DWELL_TIME_MS which is 10 min)
      vi.spyOn(Date, "now").mockReturnValue(baseTime + 5 * 60 * 1000);
      const second = getQuoteForToday();

      expect(second).toBe(first);
    });

    it("automatically advances to next quote once dwell time expires", () => {
      const baseTime = 1000000;
      vi.spyOn(Date, "now").mockReturnValue(baseTime);

      const first = getQuoteForToday();

      // 11 minutes later (dwell time expired)
      vi.spyOn(Date, "now").mockReturnValue(baseTime + QUOTE_DWELL_TIME_MS + 1000);
      const second = getQuoteForToday();

      expect(second).not.toBe(first);
      expect(STUDENT_QUOTES).toContain(second);
    });

    it("guarantees 100% distinct quotes with zero repeats across a full deck cycle", () => {
      const totalQuotes = STUDENT_QUOTES.length;
      const seen = new Set();

      for (let i = 0; i < totalQuotes; i++) {
        const quote = getNextQuote();
        expect(STUDENT_QUOTES).toContain(quote);
        seen.add(quote);
      }

      // Exactly all unique quotes seen, meaning 0 repeats!
      expect(seen.size).toBe(totalQuotes);
    });

    it("seamlessly rolls over to a new shuffled cycle when deck is exhausted", () => {
      const totalQuotes = STUDENT_QUOTES.length;

      // Exhaust the entire deck
      for (let i = 0; i < totalQuotes; i++) {
        getNextQuote();
      }

      // The next pull should trigger a new cycle without crashing
      const nextCycleQuote = getNextQuote();
      expect(STUDENT_QUOTES).toContain(nextCycleQuote);

      const state = JSON.parse(localStorage.getItem(QUOTE_DECK_STORAGE_KEY));
      expect(state.pointer).toBe(0);
      expect(state.deck.length).toBe(totalQuotes);
    });

    it("operates gracefully when localStorage throws an exception", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("QuotaExceeded or SecurityError");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceeded or SecurityError");
      });

      // Should not throw and should still provide quotes
      const quote = getQuoteForToday();
      expect(STUDENT_QUOTES).toContain(quote);

      const nextQuote = getNextQuote();
      expect(STUDENT_QUOTES).toContain(nextQuote);
    });
  });
});
