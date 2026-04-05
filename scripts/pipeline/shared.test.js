import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchTextWithRetry } from "./shared.mjs";

describe("pipeline shared helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("does not retry terminal 404 responses", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(
      fetchTextWithRetry("https://example.com/missing", {
        logger: { warn: vi.fn() },
      })
    ).rejects.toThrow("HTTP 404");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("retries transient server errors and eventually resolves", async () => {
    const logger = { warn: vi.fn() };

    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue("ok"),
      });

    const promise = fetchTextWithRetry("https://example.com/retry", {
      logger,
      backoffBaseMs: 1,
    });

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe("ok");

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
