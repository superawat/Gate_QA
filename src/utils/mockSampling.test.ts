import { describe, expect, it } from 'vitest';
import { sampleSubjectStratifiedQuestions, uniformShuffle } from './mockSampling';

// Seeded PRNG for 100% deterministic test execution
function createMulberry32(seed: number) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('mockSampling', () => {
  describe('uniformShuffle', () => {
    it('returns empty array when input is empty', () => {
      expect(uniformShuffle([])).toEqual([]);
    });

    it('returns a new array with all elements preserved', () => {
      const items = [1, 2, 3, 4, 5];
      const shuffled = uniformShuffle(items, createMulberry32(42));
      expect(shuffled).toHaveLength(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
      expect(shuffled).not.toBe(items);
    });
  });

  describe('sampleSubjectStratifiedQuestions boundary conditions', () => {
    it('returns empty array when pool is empty', () => {
      expect(sampleSubjectStratifiedQuestions([], 10)).toEqual([]);
    });

    it('returns empty array when targetCount is 0 or negative', () => {
      const pool = [{ question_uid: 'q1', subjectSlug: 'os' }];
      expect(sampleSubjectStratifiedQuestions(pool, 0)).toEqual([]);
      expect(sampleSubjectStratifiedQuestions(pool, -5)).toEqual([]);
    });

    it('returns all items when targetCount >= pool.length', () => {
      const pool = [
        { question_uid: 'q1', subjectSlug: 'os' },
        { question_uid: 'q2', subjectSlug: 'os' },
      ];
      const result = sampleSubjectStratifiedQuestions(pool, 5, { rng: createMulberry32(1) });
      expect(result).toHaveLength(2);
      expect(result.map((q) => q.question_uid).sort()).toEqual(['q1', 'q2']);
    });

    it('samples exactly 1 item when targetCount is 1', () => {
      const pool = [
        { question_uid: 'q1', subjectSlug: 'os' },
        { question_uid: 'q2', subjectSlug: 'algo' },
      ];
      const result = sampleSubjectStratifiedQuestions(pool, 1, { rng: createMulberry32(1) });
      expect(result).toHaveLength(1);
    });
  });

  describe('single-subject uniform sampling', () => {
    it('samples with equal probability across a single subject without subtopic bias', () => {
      const pool = Array.from({ length: 10 }, (_, i) => ({
        question_uid: `q${i + 1}`,
        subjectSlug: 'algorithms',
      }));

      const rng = createMulberry32(12345);
      const counts: Record<string, number> = {};
      pool.forEach((q) => (counts[q.question_uid] = 0));

      const RUNS = 1000;
      const SAMPLE_SIZE = 3;
      for (let i = 0; i < RUNS; i++) {
        const sample = sampleSubjectStratifiedQuestions(pool, SAMPLE_SIZE, { rng });
        expect(sample).toHaveLength(SAMPLE_SIZE);
        // Ensure no duplicates within a single sample
        const uids = new Set(sample.map((q) => q.question_uid));
        expect(uids.size).toBe(SAMPLE_SIZE);
        sample.forEach((q) => counts[q.question_uid]++);
      }

      // Expected appearances: (3 / 10) * 1000 = 300
      // With Mulberry32 over 1000 runs, all questions should be comfortably between 240 and 360
      const values = Object.values(counts);
      for (const val of values) {
        expect(val).toBeGreaterThan(240);
        expect(val).toBeLessThan(360);
      }
    });
  });

  describe('multi-subject quota allocation & small pool redistribution', () => {
    it('distributes slots equally across subjects when all have sufficient capacity', () => {
      const pool = [
        ...Array.from({ length: 20 }, (_, i) => ({ question_uid: `os_${i}`, subjectSlug: 'os' })),
        ...Array.from({ length: 20 }, (_, i) => ({ question_uid: `algo_${i}`, subjectSlug: 'algo' })),
        ...Array.from({ length: 20 }, (_, i) => ({ question_uid: `db_${i}`, subjectSlug: 'dbms' })),
      ];

      const rng = createMulberry32(42);
      const sample = sampleSubjectStratifiedQuestions(pool, 15, { rng });
      expect(sample).toHaveLength(15);

      const osCount = sample.filter((q) => q.subjectSlug === 'os').length;
      const algoCount = sample.filter((q) => q.subjectSlug === 'algo').length;
      const dbCount = sample.filter((q) => q.subjectSlug === 'dbms').length;

      // 15 slots across 3 subjects = exactly 5 each
      expect(osCount).toBe(5);
      expect(algoCount).toBe(5);
      expect(dbCount).toBe(5);
    });

    it('redistributes unfulfilled quota when a subject pool is smaller than its share', () => {
      const pool = [
        // Subject A has only 2 questions!
        { question_uid: 'a1', subjectSlug: 'subject_a' },
        { question_uid: 'a2', subjectSlug: 'subject_a' },
        // Subject B has 15 questions
        ...Array.from({ length: 15 }, (_, i) => ({ question_uid: `b_${i}`, subjectSlug: 'subject_b' })),
        // Subject C has 15 questions
        ...Array.from({ length: 15 }, (_, i) => ({ question_uid: `c_${i}`, subjectSlug: 'subject_c' })),
      ];

      // Target count = 12. Ideal equal share = 4 per subject.
      // But Subject A only has 2 questions.
      // Therefore, Subject A gets 2 questions, and the remaining 10 slots are split between B (5) and C (5).
      const rng = createMulberry32(42);
      const sample = sampleSubjectStratifiedQuestions(pool, 12, { rng });
      expect(sample).toHaveLength(12);

      const aCount = sample.filter((q) => q.subjectSlug === 'subject_a').length;
      const bCount = sample.filter((q) => q.subjectSlug === 'subject_b').length;
      const cCount = sample.filter((q) => q.subjectSlug === 'subject_c').length;

      expect(aCount).toBe(2);
      expect(bCount).toBe(5);
      expect(cCount).toBe(5);
    });

    it('respects custom getSubjectKey resolver for tracks (da:* and isro:*)', () => {
      const pool = [
        { question_uid: 'da_1', track: 'da', subject: 'math' },
        { question_uid: 'da_2', track: 'da', subject: 'math' },
        { question_uid: 'cse_1', track: 'cse', subject: 'math' },
        { question_uid: 'cse_2', track: 'cse', subject: 'math' },
      ];

      const getSubjectKey = (q: any) => `${q.track}:${q.subject}`;
      const rng = createMulberry32(10);
      const sample = sampleSubjectStratifiedQuestions(pool, 2, { getSubjectKey, rng });

      expect(sample).toHaveLength(2);
      const daCount = sample.filter((q) => q.track === 'da').length;
      const cseCount = sample.filter((q) => q.track === 'cse').length;

      expect(daCount).toBe(1);
      expect(cseCount).toBe(1);
    });

    it('supports proportional allocation mode', () => {
      const pool = [
        // 80 items in A
        ...Array.from({ length: 80 }, (_, i) => ({ question_uid: `a_${i}`, subjectSlug: 'a' })),
        // 20 items in B
        ...Array.from({ length: 20 }, (_, i) => ({ question_uid: `b_${i}`, subjectSlug: 'b' })),
      ];

      const rng = createMulberry32(99);
      // Sample 10 items proportionally: A should get ~8, B should get ~2
      const sample = sampleSubjectStratifiedQuestions(pool, 10, {
        allocationMode: 'proportional',
        rng,
      });

      expect(sample).toHaveLength(10);
      const aCount = sample.filter((q) => q.subjectSlug === 'a').length;
      const bCount = sample.filter((q) => q.subjectSlug === 'b').length;

      expect(aCount).toBe(8);
      expect(bCount).toBe(2);
    });
  });
});
