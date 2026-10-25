export type BlogCategory =
  | "Syllabus Updates"
  | "Exam Guides"
  | "Preparation Strategy"
  | "Cutoffs & Analysis";

export interface BlogBreadcrumb {
  name: string;
  url: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogRelatedArticle {
  path: string;
  label: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogArticle {
  slug: string;
  path: string;
  legacyPath?: string;
  keyword: string;
  category: BlogCategory;
  tags: string[];
  showInBlog: true;
  datePublished?: string;
  dateModified?: string;
  readingTime: number;
  author: BlogAuthor;
  h1: string;
  description: string;
  eyebrow?: string;
  ctaLabel: string;
  ctaHref: string;
  breadcrumbs: BlogBreadcrumb[];
  relatedArticles?: BlogRelatedArticle[];
  richCopy: unknown[];
  faqs?: BlogFaq[];
  [key: string]: unknown;
}

export interface BlogCategoryCount {
  category: BlogCategory;
  count: number;
}
