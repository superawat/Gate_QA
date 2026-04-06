function normalizeWhitespace(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function collapseDisplayMath(preview = "") {
  return String(preview || "")
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, expr) => `$${normalizeWhitespace(expr)}$`)
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, expr) => `$${normalizeWhitespace(expr)}$`);
}

export function formatExplorePreview(question = {}) {
  const typeToken = String(question?.type || "").trim().toLowerCase();
  let preview = normalizeWhitespace(question?.preview || question?.title || "");

  if (!preview) {
    return "";
  }

  preview = collapseDisplayMath(preview);

  if ((typeToken === "mcq" || typeToken === "msq") && !preview.endsWith("…")) {
    const questionMarkIndex = preview.lastIndexOf("?");
    if (questionMarkIndex >= 0 && questionMarkIndex < preview.length - 1) {
      preview = preview.slice(0, questionMarkIndex + 1).trim();
    }
  }

  return preview;
}
