import { describe, expect, test } from "vitest";

import { resolveHorizontalSwipeNavigation } from "./mobileGestures";

describe("resolveHorizontalSwipeNavigation", () => {
  test("returns next for a strong left swipe", () => {
    expect(resolveHorizontalSwipeNavigation({
      startX: 240,
      startY: 180,
      endX: 110,
      endY: 190,
    })).toBe("next");
  });

  test("returns previous for a strong right swipe", () => {
    expect(resolveHorizontalSwipeNavigation({
      startX: 110,
      startY: 180,
      endX: 230,
      endY: 176,
    })).toBe("previous");
  });

  test("ignores short drags and mostly vertical gestures", () => {
    expect(resolveHorizontalSwipeNavigation({
      startX: 100,
      startY: 100,
      endX: 140,
      endY: 110,
    })).toBeNull();

    expect(resolveHorizontalSwipeNavigation({
      startX: 140,
      startY: 100,
      endX: 220,
      endY: 190,
    })).toBeNull();
  });
});
