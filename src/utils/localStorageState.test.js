import {
  USER_STATE_STORAGE_KEYS,
  exportUserState,
  importUserState,
  isQuotaExceededError,
  readStorageJson,
  writeStorageJson,
} from "./localStorageState";

function createStorageMock(options = {}) {
  const store = new Map();
  const shouldThrowOnWrite = !!options.throwOnWrite;
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      if (shouldThrowOnWrite) {
        const error = new Error("Quota exceeded");
        error.name = "QuotaExceededError";
        error.code = 22;
        throw error;
      }
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe("localStorageState utility", () => {
  test("saves and reads state successfully", () => {
    const storage = createStorageMock();
    const state = {
      solved: ["go:1", "go:2"],
      bookmarked: ["go:2"],
      metadata: { solvedCount: 2 },
      progress: { "go:1": { attempts: 1, correct: true } },
    };

    expect(
      writeStorageJson(USER_STATE_STORAGE_KEYS.solved, state.solved, storage).ok
    ).toBe(true);
    expect(
      writeStorageJson(
        USER_STATE_STORAGE_KEYS.bookmarked,
        state.bookmarked,
        storage
      ).ok
    ).toBe(true);

    expect(readStorageJson(USER_STATE_STORAGE_KEYS.solved, [], storage)).toEqual(
      state.solved
    );
    expect(
      readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [], storage)
    ).toEqual(state.bookmarked);

    importUserState({ data: state }, storage);
    const exported = exportUserState(storage);
    expect(exported.ok).toBe(true);
    expect(exported.payload.data.solved).toEqual(state.solved);
    expect(exported.payload.data.bookmarked).toEqual(state.bookmarked);
  });

  test("handles corrupted JSON gracefully during import", () => {
    const storage = createStorageMock();
    const corruptedJson = '{"data":{"solved":["go:1"],"bookmarked":["go:2"]';

    const result = importUserState(corruptedJson, storage);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_json");
    expect(readStorageJson(USER_STATE_STORAGE_KEYS.solved, [], storage)).toEqual(
      []
    );
    expect(
      readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [], storage)
    ).toEqual([]);
  });

  test("surfaces quota exceeded errors", () => {
    const quotaStorage = createStorageMock({ throwOnWrite: true });

    const writeResult = writeStorageJson("gate_qa_test", { a: 1 }, quotaStorage);
    expect(writeResult.ok).toBe(false);
    expect(writeResult.reason).toBe("quota_exceeded");
    expect(isQuotaExceededError(writeResult.error)).toBe(true);

    const importResult = importUserState(
      JSON.stringify({
        data: { solved: ["go:9"], bookmarked: ["go:9"] },
      }),
      quotaStorage
    );
    expect(importResult.ok).toBe(false);
    expect(importResult.reason).toBe("quota_exceeded");
  });
});
