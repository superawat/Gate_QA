const EDITABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[contenteditable='']",
  "[role='textbox']",
].join(",");

export function isEditableTarget(target) {
  return target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR));
}

export function getShortcutKey(event) {
  if (!event?.key) {
    return "";
  }
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

export function shouldIgnorePlainShortcut(event) {
  if (!event || event.defaultPrevented) {
    return true;
  }

  if (event.altKey || event.ctrlKey || event.metaKey) {
    return true;
  }

  return isEditableTarget(event.target);
}
