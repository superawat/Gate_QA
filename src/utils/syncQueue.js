/**
 * syncQueue.js
 * ------------
 * Manages a persistent queue of pending changes in localStorage
 * (`gate_qa_sync_queue`).
 *
 * Ensures that if a user solves a question, saves a note, or completes a mock test
 * while offline (or during a network failure), the change is queued and synced
 * automatically as soon as internet connectivity returns.
 */

const QUEUE_KEY = "gate_qa_sync_queue";

/**
 * Reads the current sync queue from localStorage.
 * @returns {Array<{ id: string, type: string, payload: any, timestamp: string }>}
 */
export function getSyncQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[SyncQueue] Failed to read sync queue:", err);
    return [];
  }
}

/**
 * Enqueues a change operation to be synced to the cloud.
 * @param {'SOLVE' | 'BOOKMARK' | 'NOTE' | 'MOCK'} type
 * @param {any} payload
 */
export function enqueueChange(type, payload) {
  try {
    const queue = getSyncQueue();
    const newItem = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    queue.push(newItem);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gateqa:sync-request", { detail: newItem }));
    }
  } catch (err) {
    console.error("[SyncQueue] Failed to enqueue change:", err);
  }
}

/**
 * Clears the queue after a successful sync.
 */
export function clearSyncQueue() {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    console.error("[SyncQueue] Failed to clear sync queue:", err);
  }
}

/**
 * Returns the number of pending unsynced changes.
 */
export function getPendingChangesCount() {
  return getSyncQueue().length;
}
