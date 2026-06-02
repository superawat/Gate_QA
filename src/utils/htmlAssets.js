const getBaseAssetUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
};

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeHtmlAssetUrls = (html = "", baseAssetUrl = getBaseAssetUrl()) => {
  const normalizedBase = String(baseAssetUrl || "/").endsWith("/")
    ? String(baseAssetUrl || "/")
    : `${baseAssetUrl}/`;
  const baseWithoutTrailingSlash = normalizedBase.replace(/\/+$/, "");
  const escapedBase = escapeRegExp(baseWithoutTrailingSlash);

  return String(html || "")
    .replace(
      new RegExp(`src=(["'])${escapedBase}/question-images/`, "gi"),
      `src=$1${baseWithoutTrailingSlash}/question-images/`
    )
    .replace(/src=(["'])\/Gate_QA\/question-images\//gi, `src=$1${baseWithoutTrailingSlash}/question-images/`)
    .replace(/src=(["'])\/question-images\//gi, `src=$1${baseWithoutTrailingSlash}/question-images/`)
    .replace(/src=(["'])question-images\//gi, `src=$1${baseWithoutTrailingSlash}/question-images/`)
    .replace(/src=(["'])\/images\/aptitude\//gi, `src=$1${baseWithoutTrailingSlash}/images/aptitude/`)
    .replace(/src=(["'])images\/aptitude\//gi, `src=$1${baseWithoutTrailingSlash}/images/aptitude/`);
};
