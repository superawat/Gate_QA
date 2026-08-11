/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { sanitizeProgressStorage } from './storageSanitizer';

describe('sanitizeProgressStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('repairs numeric-indexed corruption to a string array', () => {
    window.localStorage.setItem(
      'gate_qa_solved_questions',
      JSON.stringify({ '0': 'go:1', '1': 'go:2' })
    );

    sanitizeProgressStorage();

    expect(JSON.parse(window.localStorage.getItem('gate_qa_solved_questions'))).toEqual(['go:1', 'go:2']);
  });

  test('leaves valid arrays unchanged', () => {
    window.localStorage.setItem('gateqa-apt-solved-questions', JSON.stringify(['APT-1']));

    sanitizeProgressStorage();

    expect(JSON.parse(window.localStorage.getItem('gateqa-apt-solved-questions'))).toEqual(['APT-1']);
  });

  test('repairs null values without throwing', () => {
    window.localStorage.setItem('gateqa-apt-bookmarked-questions', 'null');

    expect(() => sanitizeProgressStorage()).not.toThrow();
    expect(JSON.parse(window.localStorage.getItem('gateqa-apt-bookmarked-questions'))).toEqual([]);
  });
});
