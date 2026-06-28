import { Helmet } from "react-helmet-async";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../../constants/siteConfig";

const SITE_NAME = "GateQA";
const DEFAULT_TITLE = "GateQA — GATE CS PYQs, Mock Tests, Aptitude Practice & Calculator";
const DEFAULT_DESCRIPTION =
  "Practice 3500+ GATE CS PYQs from 1987–2026, 36000+ Aptitude questions, subject-wise mock tests, GATE calculator, insights, notes and bookmarks. Free and offline-first.";

/**
 * Normalise any URL or path to ensure it has a trailing slash (unless it is the root or a file with an extension).
 * @param {string} urlOrPath
 * @returns {string}
 */
export const normalizeUrlTrailingSlash = (urlOrPath) => {
  if (!urlOrPath) return "";
  // Check if it's a full URL
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    try {
      const url = new URL(urlOrPath);
      let pathname = url.pathname;
      if (pathname !== "/" && !pathname.endsWith("/") && !pathname.split("/").pop().includes(".")) {
        pathname += "/";
      }
      url.pathname = pathname;
      return url.toString();
    } catch {
      return urlOrPath;
    }
  }
  // Check if it's a relative path
  let cleanPath = urlOrPath;
  const hashIndex = cleanPath.indexOf("#");
  let hash = "";
  if (hashIndex !== -1) {
    hash = cleanPath.slice(hashIndex);
    cleanPath = cleanPath.slice(0, hashIndex);
  }
  const queryIndex = cleanPath.indexOf("?");
  let query = "";
  if (queryIndex !== -1) {
    query = cleanPath.slice(queryIndex);
    cleanPath = cleanPath.slice(0, queryIndex);
  }
  if (cleanPath !== "/" && !cleanPath.endsWith("/") && !cleanPath.split("/").pop().includes(".")) {
    cleanPath += "/";
  }
  return `${cleanPath}${query}${hash}`;
};

/**
 * Build a BreadcrumbList Schema.org object from a simple breadcrumb array.
 * @param {Array<{name: string, url: string}>} crumbs
 */
export const buildBreadcrumbSchema = (crumbs = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: normalizeUrlTrailingSlash(crumb.url),
  })),
});

/**
 * Build a QAPage Schema.org object for a GATE question.
 * @param {object} opts
 */
export const buildQAPageSchema = ({
  questionName = "",
  questionText = "",
  answerText = "",
  url = "",
  datePublished = "",
}) => ({
  "@context": "https://schema.org",
  "@type": "QAPage",
  name: questionName,
  url: normalizeUrlTrailingSlash(url),
  mainEntity: {
    "@type": "Question",
    name: questionName,
    text: questionText,
    answerCount: answerText ? 1 : 0,
    ...(answerText && {
      acceptedAnswer: {
        "@type": "Answer",
        text: answerText,
        upvoteCount: 0,
        ...(datePublished && { dateCreated: datePublished }),
      },
    }),
  },
});

/**
 * Build an FAQPage Schema.org object from an array of Q&A pairs.
 * @param {Array<{question: string, answer: string}>} faqs
 */
export const buildFAQPageSchema = (faqs = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

/**
 * Build a WebPage / EducationalOrganization schema for subject & year landing pages.
 */
export const buildWebPageSchema = ({ name = "", description = "", url = "" }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  url: normalizeUrlTrailingSlash(url),
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: normalizeUrlTrailingSlash(SITE_URL),
  },
});

/**
 * Centralised SEO head-tag component.
 *
 * Drop into any page to set title, description, canonical URL,
 * OpenGraph, Twitter Card meta, and Schema.org JSON-LD.
 *
 * @param {object}              props
 * @param {string}              [props.title]        Page title
 * @param {string}              [props.description]  Meta description
 * @param {string}              [props.path]         Path portion for canonical URL (e.g. "/practice")
 * @param {string}              [props.ogImage]      Absolute URL for og:image
 * @param {string}              [props.ogType]       og:type — defaults to "website"
 * @param {boolean}             [props.noIndex]      Set true to add noindex,nofollow
 * @param {object|object[]}     [props.schemaOrg]    One or more Schema.org JSON-LD objects
 */
const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  schemaOrg = null,
}) => {
  let cleanPath = normalizeUrlTrailingSlash(path);
  if (cleanPath && !cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }
  const canonicalUrl = `${SITE_URL}${cleanPath}`;

  // Normalise to array so we can render multiple schemas
  const schemas = schemaOrg
    ? (Array.isArray(schemaOrg) ? schemaOrg : [schemaOrg])
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* OpenGraph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
        />
      ))}
    </Helmet>
  );
};

export default SEOHead;



