import { describe, it, expect } from 'vitest';
import {
  classifyAndMatch,
  normalizeQuery,
  SearchCatalog,
} from './homeSearchMatcher';

const mockCatalog: SearchCatalog = {
  subjects: [
    { slug: 'algorithms', label: 'Algorithms', count: 321, aliases: ['algo', 'algos', 'algorithms'] },
    { slug: 'os', label: 'Operating System', count: 308, aliases: ['os', 'operating-system', 'operating-systems'] },
    { slug: 'dbms', label: 'Databases', count: 240, aliases: ['databases', 'dbms', 'sql', 'database'] },
    { slug: 'toc', label: 'Theory of Computation', count: 274, aliases: ['toc', 'automata'] },
  ],
  subtopics: [
    { slug: 'dijkstras-algorithm', label: "Dijkstra's Algorithm", parentSubject: 'algorithms', parentLabel: 'Algorithms', count: 25 },
    { slug: 'b-tree', label: 'B-Tree', parentSubject: 'dbms', parentLabel: 'Databases', count: 18 },
    { slug: 'deadlock', label: 'Deadlock', parentSubject: 'os', parentLabel: 'Operating System', count: 14 },
    { slug: 'paging', label: 'Paging', parentSubject: 'os', parentLabel: 'Operating System', count: 22 },
  ],
  years: [
    { year: 2026, count: 130, yearSetKeys: ['2026-s1', '2026-s2'] },
    { year: 2025, count: 130, yearSetKeys: ['2025-s1', '2025-s2'] },
    { year: 2024, count: 178, yearSetKeys: ['2024-additional', '2024-s1', '2024-s2'] },
  ],
  questionNumbers: {
    counts: { '1': 334, '30': 39, '65': 16 },
    maxNumber: 92,
    totalQuestions: 3682,
  },
  tags: [
    { tag: 'time-complexity', count: 124 },
    { tag: 'shortest-path', count: 35 },
    { tag: 'virtual-memory', count: 28 },
  ],
  generatedAt: '2026-09-26T00:00:00.000Z',
};

describe('homeSearchMatcher', () => {
  describe('normalizeQuery', () => {
    it('lowercases, trims, and collapses multiple spaces', () => {
      expect(normalizeQuery('  GATE   2024  ')).toBe('gate 2024');
      expect(normalizeQuery('Question:   30 ')).toBe('question: 30');
    });

    it('handles empty or non-string inputs safely', () => {
      expect(normalizeQuery('')).toBe('');
      // @ts-expect-error testing invalid inputs
      expect(normalizeQuery(null)).toBe('');
      // @ts-expect-error testing invalid inputs
      expect(normalizeQuery(undefined)).toBe('');
    });
  });

  describe('classifyAndMatch', () => {
    it('returns empty array when query is less than 2 characters', () => {
      expect(classifyAndMatch('a', mockCatalog)).toEqual([]);
      expect(classifyAndMatch(' ', mockCatalog)).toEqual([]);
      expect(classifyAndMatch('', mockCatalog)).toEqual([]);
    });

    it('returns empty array when catalog is missing or null', () => {
      expect(classifyAndMatch('algorithms', null)).toEqual([]);
      expect(classifyAndMatch('algorithms', undefined)).toEqual([]);
    });

    it('matches question number queries (q30, question 30, #30)', () => {
      const queries = ['q30', 'q 30', 'question 30', 'question: 30', '#30'];
      queries.forEach((q) => {
        const results = classifyAndMatch(q, mockCatalog);
        const qResult = results.find((r) => r.type === 'question-number');
        expect(qResult).toBeDefined();
        expect(qResult?.label).toBe('Question 30');
        expect(qResult?.count).toBe(39);
        expect(qResult?.searchParam).toBe('question: 30');
      });
    });

    it('does not produce question-number result for out-of-range questions', () => {
      const results = classifyAndMatch('q500', mockCatalog);
      const qResult = results.find((r) => r.type === 'question-number');
      expect(qResult).toBeUndefined();
    });

    it('matches year queries (2024, gate 2024)', () => {
      const queries = ['2024', 'gate 2024', 'gate2024'];
      queries.forEach((q) => {
        const results = classifyAndMatch(q, mockCatalog);
        const yearResult = results.find((r) => r.type === 'year');
        expect(yearResult).toBeDefined();
        expect(yearResult?.label).toBe('GATE 2024');
        expect(yearResult?.count).toBe(178);
        expect(yearResult?.yearFilter).toBe(2024);
        expect(yearResult?.yearSetKeys).toEqual(['2024-additional', '2024-s1', '2024-s2']);
      });
    });

    it('matches subject by exact alias or slug (os, dbms, toc, algo)', () => {
      const osResults = classifyAndMatch('os', mockCatalog);
      const osSubject = osResults.find((r) => r.type === 'subject');
      expect(osSubject).toBeDefined();
      expect(osSubject?.label).toBe('Operating System');
      expect(osSubject?.subjectFilter).toBe('os');

      const dbmsResults = classifyAndMatch('sql', mockCatalog);
      const dbmsSubject = dbmsResults.find((r) => r.type === 'subject');
      expect(dbmsSubject).toBeDefined();
      expect(dbmsSubject?.label).toBe('Databases');
    });

    it('matches subtopic by label or slug (dijkstra, b-tree)', () => {
      const results = classifyAndMatch('dijkstra', mockCatalog);
      const subtopic = results.find((r) => r.type === 'subtopic');
      expect(subtopic).toBeDefined();
      expect(subtopic?.label).toBe("Dijkstra's Algorithm");
      expect(subtopic?.subtopicFilter).toBe('dijkstras-algorithm');
      expect(subtopic?.subjectFilter).toBe('algorithms');
      expect(subtopic?.count).toBe(25);
    });

    it('matches keyword tags (time-complexity)', () => {
      const results = classifyAndMatch('time', mockCatalog);
      const tag = results.find((r) => r.type === 'keyword');
      expect(tag).toBeDefined();
      expect(tag?.label).toBe('time complexity');
      expect(tag?.searchParam).toBe('time-complexity');
    });

    it('always includes free-text search fallback option for valid queries', () => {
      const results = classifyAndMatch('xyznonexistent', mockCatalog);
      expect(results.length).toBe(1);
      expect(results[0].type).toBe('free-text');
      expect(results[0].searchParam).toBe('xyznonexistent');
      expect(results[0].label).toBe('Search all questions for "xyznonexistent"');
    });

    it('limits output to maxResults', () => {
      const results = classifyAndMatch('a', mockCatalog);
      expect(results.length).toBe(0);

      const multiResults = classifyAndMatch('e', mockCatalog, { maxResults: 3 });
      expect(multiResults.length).toBeLessThanOrEqual(3);
    });

    it('ensures all returned items have unique IDs', () => {
      const results = classifyAndMatch('algorithms', mockCatalog);
      const ids = results.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
