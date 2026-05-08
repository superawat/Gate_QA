/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";

import {
  getShortcutKey,
  isEditableTarget,
  shouldIgnorePlainShortcut,
} from "./keyboardShortcuts";

describe("keyboardShortcuts", () => {
  test("normalizes single-character keys to lowercase", () => {
    expect(getShortcutKey({ key: "F" })).toBe("f");
    expect(getShortcutKey({ key: "ArrowRight" })).toBe("ArrowRight");
  });

  test("detects editable shortcut targets", () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = '<label><input type="text" /></label><button>Go</button>';

    expect(isEditableTarget(wrapper.querySelector("input"))).toBe(true);
    expect(isEditableTarget(wrapper.querySelector("button"))).toBe(false);
  });

  test("ignores plain shortcuts while typing or using modified key chords", () => {
    const input = document.createElement("input");
    const button = document.createElement("button");

    expect(shouldIgnorePlainShortcut({ key: "f", target: input })).toBe(true);
    expect(shouldIgnorePlainShortcut({ key: "f", target: button, ctrlKey: true })).toBe(true);
    expect(shouldIgnorePlainShortcut({ key: "f", target: button })).toBe(false);
  });
});
