import { extractQuestionIdArray } from './cloudSyncManager';

const ARRAY_KEYS_TO_SANITIZE = [
  'gate_qa_solved_questions',
  'gate_qa_bookmarked_questions',
  'gateqa-apt-solved-questions',
  'gateqa-apt-bookmarked-questions',
  'gate_qa_da_solved_questions',
  'gate_qa_da_bookmarked_questions',
];

/**
 * Repairs ID collections persisted by older cloud-sync versions before React
 * hydrates its in-memory progress state.
 */
export function sanitizeProgressStorage(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) {
    return;
  }

  ARRAY_KEYS_TO_SANITIZE.forEach((key) => {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        const repaired = extractQuestionIdArray(parsed);
        storage.setItem(key, JSON.stringify(repaired));
        console.info(`[Sanitizer] Repaired ${key}: ${repaired.length} IDs recovered.`);
      }
    } catch {
      storage.setItem(key, JSON.stringify([]));
    }
  });
}

export { ARRAY_KEYS_TO_SANITIZE };
