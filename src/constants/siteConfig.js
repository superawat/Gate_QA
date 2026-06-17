/**
 * Central site configuration constants.
 * All hardcoded domain references should import from here.
 * To change the domain, update SITE_URL here only.
 */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://gateqa.in";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.png`;
