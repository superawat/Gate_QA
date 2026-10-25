import { EDITORIAL_PAGES } from "../data/editorialPages";
import type { BlogArticle, BlogCategory, BlogCategoryCount } from "../types/blog";

const CATEGORY_ORDER: BlogCategory[] = [
  "Syllabus Updates",
  "Exam Guides",
  "Preparation Strategy",
  "Cutoffs & Analysis",
];

const stripMarkup = (value: string): string => value.replace(/<[^>]*>/g, " ");

const collectText = (value: unknown): string => {
  if (typeof value === "string") return stripMarkup(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(collectText).join(" ");
  }
  return "";
};

export const calculateReadingTime = (richCopy: unknown[] = []): number => {
  const wordCount = collectText(richCopy).trim().match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const normalizeSlug = (value: string): string => {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original value when a URL contains malformed percent encoding.
  }
  return decoded.replace(/^\/+|\/+$/g, "").toLowerCase();
};

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sourceArticles = (EDITORIAL_PAGES as unknown as BlogArticle[]).filter(
  (page) => page.showInBlog === true
);

const orderedArticles = sourceArticles
  .map((article, sourceIndex) => ({
    article: {
      ...article,
      slug: article.slug || normalizeSlug(article.path.split("/").pop() || ""),
      readingTime: article.readingTime || calculateReadingTime(article.richCopy),
    },
    sourceIndex,
  }))
  .sort((left, right) => {
    const dateOrder = toTimestamp(right.article.dateModified) - toTimestamp(left.article.dateModified);
    return dateOrder || left.sourceIndex - right.sourceIndex;
  })
  .map(({ article }) => article);

const articleBySlug = new Map(orderedArticles.map((article) => [normalizeSlug(article.slug), article]));

/** Returns the build-time memoized blog set, newest updated article first. */
export const getAllBlogArticles = (): BlogArticle[] => orderedArticles;

/** Looks up a blog article by slug, accepting surrounding slashes and encoded input. */
export const getBlogArticleBySlug = (slug: string | undefined): BlogArticle | undefined => {
  if (!slug) return undefined;
  return articleBySlug.get(normalizeSlug(slug));
};

/** Returns neighboring articles in the same newest-first order as the blog list. */
export const getAdjacentBlogArticles = (
  currentSlug: string
): { prevArticle?: BlogArticle; nextArticle?: BlogArticle } => {
  const currentIndex = orderedArticles.findIndex(
    (article) => normalizeSlug(article.slug) === normalizeSlug(currentSlug)
  );
  if (currentIndex < 0) return {};
  return {
    prevArticle: orderedArticles[currentIndex - 1],
    nextArticle: orderedArticles[currentIndex + 1],
  };
};

export const getBlogCategories = (): BlogCategoryCount[] => {
  const counts = new Map<BlogCategory, number>();
  orderedArticles.forEach((article) => {
    counts.set(article.category, (counts.get(article.category) || 0) + 1);
  });
  return CATEGORY_ORDER
    .filter((category) => counts.has(category))
    .map((category) => ({ category, count: counts.get(category) || 0 }));
};

export const formatBlogDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(`${dateString.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const getFeaturedBlogArticle = (): BlogArticle | undefined =>
  getBlogArticleBySlug("gate-cse-2027-syllabus-changes") || orderedArticles[0];
