import { describe, expect, test } from "vitest";
import {
  calculateReadingTime,
  formatBlogDate,
  getAdjacentBlogArticles,
  getAllBlogArticles,
  getBlogArticleBySlug,
  getBlogCategories,
} from "./blog";

describe("blog utilities", () => {
  test("getAllBlogArticles returns only showInBlog articles sorted newest first", () => {
    const articles = getAllBlogArticles();
    expect(articles.length).toBe(11);
    expect(articles.every((a) => a.showInBlog === true)).toBe(true);
    expect(articles.every((a) => Boolean(a.slug))).toBe(true);
    expect(articles.every((a) => a.path.startsWith("/blog/"))).toBe(true);
  });

  test("getBlogArticleBySlug resolves exact slug and handles surrounding slashes or case", () => {
    const article = getBlogArticleBySlug("gate-cse-2027-syllabus-changes");
    expect(article).toBeDefined();
    expect(article?.keyword).toBe("GATE 2027 Syllabus Changes");

    const withSlashes = getBlogArticleBySlug("/gate-cse-2027-syllabus-changes/");
    expect(withSlashes?.slug).toBe("gate-cse-2027-syllabus-changes");

    const undefinedSlug = getBlogArticleBySlug("non-existent-slug-12345");
    expect(undefinedSlug).toBeUndefined();
  });

  test("getAdjacentBlogArticles returns previous and next articles in sequence", () => {
    const articles = getAllBlogArticles();
    if (articles.length >= 3) {
      const middleSlug = articles[1].slug;
      const { prevArticle, nextArticle } = getAdjacentBlogArticles(middleSlug);
      expect(prevArticle?.slug).toBe(articles[0].slug);
      expect(nextArticle?.slug).toBe(articles[2].slug);
    }
  });

  test("calculateReadingTime computes reasonable reading minutes", () => {
    expect(calculateReadingTime([])).toBe(1);
    const longCopy = [Array(500).fill("word").join(" ")];
    expect(calculateReadingTime(longCopy)).toBe(3);
  });

  test("formatBlogDate formats ISO date cleanly", () => {
    expect(formatBlogDate("2026-07-25")).toBe("Jul 25, 2026");
    expect(formatBlogDate("")).toBe("");
  });

  test("getBlogCategories returns unique categories with positive counts", () => {
    const categories = getBlogCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((c) => c.count > 0)).toBe(true);
  });
});
