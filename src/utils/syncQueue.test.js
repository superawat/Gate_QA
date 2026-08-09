/**
 * syncQueue.test.js
 * -----------------
 * Unit tests for offline change queue management, persistence,
 * event emission, and cleanup.
 *
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  getSyncQueue,
  enqueueChange,
  clearSyncQueue,
  getPendingChangesCount,
} from "./syncQueue";

const QUEUE_KEY = "gate_qa_sync_queue";

describe("syncQueue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("returns empty array when queue is empty or uninitialized", () => {
    expect(getSyncQueue()).toEqual([]);
    expect(getPendingChangesCount()).toBe(0);
  });

  test("handles corrupted JSON gracefully without crashing", () => {
    localStorage.setItem(QUEUE_KEY, "invalid-json{{[");
    expect(getSyncQueue()).toEqual([]);
    expect(getPendingChangesCount()).toBe(0);
  });

  test("enqueues SOLVE, BOOKMARK, NOTE, and MOCK changes with unique IDs and timestamps", () => {
    const eventSpy = vi.fn();
    window.addEventListener("gateqa:sync-request", eventSpy);

    enqueueChange("SOLVE", { question_uid: "go:80298", isCorrect: true });
    enqueueChange("BOOKMARK", { question_uid: "go:3347", bookmarked: true });
    enqueueChange("NOTE", { question_uid: "go:80298", text: "Important concept" });
    enqueueChange("MOCK", { testId: "mock_123", score: 55 });

    const queue = getSyncQueue();
    expect(queue).toHaveLength(4);
    expect(getPendingChangesCount()).toBe(4);

    expect(queue[0].type).toBe("SOLVE");
    expect(queue[0].payload.question_uid).toBe("go:80298");
    expect(queue[0].id).toMatch(/^change_/);
    expect(queue[0].timestamp).toBeDefined();

    expect(queue[1].type).toBe("BOOKMARK");
    expect(queue[2].type).toBe("NOTE");
    expect(queue[3].type).toBe("MOCK");

    expect(eventSpy).toHaveBeenCalledTimes(4);
    window.removeEventListener("gateqa:sync-request", eventSpy);
  });

  test("clears the sync queue completely on clearSyncQueue", () => {
    enqueueChange("SOLVE", { question_uid: "go:100" });
    expect(getPendingChangesCount()).toBe(1);

    clearSyncQueue();
    expect(getSyncQueue()).toEqual([]);
    expect(getPendingChangesCount()).toBe(0);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  test("handles localStorage setItem failure gracefully", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => enqueueChange("SOLVE", { question_uid: "go:100" })).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
