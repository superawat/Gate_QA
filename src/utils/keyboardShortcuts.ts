const EDITABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[contenteditable='']",
  "[role='textbox']",
].join(",");

type ShortcutEventLike = {
  key?: string;
  defaultPrevented?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  target?: EventTarget | null;
} | null | undefined;

export function isEditableTarget(target: EventTarget | null | undefined): boolean {
  return target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR));
}

export function getShortcutKey(event: ShortcutEventLike): string {
  if (!event?.key) {
    return "";
  }
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

export function shouldIgnorePlainShortcut(event: ShortcutEventLike): boolean {
  if (!event || event.defaultPrevented) {
    return true;
  }

  if (event.altKey || event.ctrlKey || event.metaKey) {
    return true;
  }

  return isEditableTarget(event.target);
}
