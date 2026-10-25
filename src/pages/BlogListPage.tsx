import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaFire,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema } from "../components/SEO/SEOHead";
import { SUBJECT_SEO_MAP } from "../utils/landingPages";
import { SITE_URL } from "../constants/siteConfig";
import {
  formatBlogDate,
  getAllBlogArticles,
  getBlogCategories,
  getFeaturedBlogArticle,
} from "../utils/blog";
import { BLOG_ROUTE, buildBlogArticlePath, HIGH_PRIORITY_TOPICS_ROUTE } from "../utils/routes";
import type { BlogArticle } from "../types/blog";

interface SubjectGuide {
  urlSlug: string;
  label: string;
  description: string;
  topics: Array<{ label: string; pct?: number }>;
}

const ITEMS_PER_PAGE = 6;
const BLOG_ARTICLES = getAllBlogArticles();
const BLOG_CATEGORIES = getBlogCategories();
const FEATURED_ARTICLE = getFeaturedBlogArticle();
const SUBJECT_GUIDES = SUBJECT_SEO_MAP as SubjectGuide[];

type CategoryFilter = "All" | "Subject Guides" | BlogArticle["category"];

const ArticleCard = ({ article }: { article: BlogArticle }) => {
  const displayDate = article.datePublished || article.dateModified;
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors duration-150 hover:border-[color:var(--color-primary-border)] sm:p-5">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <span className="truncate text-xs font-semibold text-[color:var(--color-primary-text)]">
          {article.category}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-[color:var(--color-text-muted)]">
          <FaClock aria-hidden="true" size={11} />
          {article.readingTime} min
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-pretty font-display text-xl leading-[1.25] text-[color:var(--color-text)]">
        <Link className="hover:text-[color:var(--color-primary-text)]" to={buildBlogArticlePath(article.slug)}>
          {article.keyword}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-pretty text-sm leading-6 text-[color:var(--color-text-muted)]">
        {article.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-3">
        <time
          className="text-xs tabular-nums text-[color:var(--color-text-muted)]"
          dateTime={displayDate}
          title={article.datePublished ? "Published" : "Last updated"}
        >
          {formatBlogDate(displayDate)}
        </time>
        <Link
          to={buildBlogArticlePath(article.slug)}
          className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[color:var(--color-primary-text)] hover:underline"
        >
          Read guide <FaArrowRight aria-hidden="true" size={10} />
        </Link>
      </div>
    </article>
  );
};

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(() => BLOG_ARTICLES.filter((article) => {
    if (activeCategory === "Subject Guides") return false;
    if (activeCategory !== "All" && article.category !== activeCategory) return false;
    if (!normalizedQuery) return true;
    return [article.keyword, article.h1, article.description, article.category, ...article.tags]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  }), [activeCategory, normalizedQuery]);

  const filteredSubjects = useMemo(() => {
    if (activeCategory !== "All" && activeCategory !== "Subject Guides") return [];
    if (!normalizedQuery) return SUBJECT_GUIDES;
    return SUBJECT_GUIDES.filter((subject) => [
      subject.label,
      subject.description,
      ...subject.topics.map((topic) => topic.label),
    ].some((value) => value.toLowerCase().includes(normalizedQuery)));
  }, [activeCategory, normalizedQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, normalizedQuery]);

  const hasFeatured = activeCategory === "All"
    && !normalizedQuery
    && Boolean(FEATURED_ARTICLE);
  const gridArticles = useMemo(() => hasFeatured && FEATURED_ARTICLE
    ? filteredArticles.filter((article) => article.slug !== FEATURED_ARTICLE.slug)
    : filteredArticles, [filteredArticles, hasFeatured]);
  const totalPages = Math.max(1, Math.ceil(gridArticles.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const showFeatured = hasFeatured && validCurrentPage === 1;
  const paginatedArticles = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return gridArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [gridArticles, validCurrentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  const canonicalUrl = `${SITE_URL}${BLOG_ROUTE}`;
  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: canonicalUrl },
  ]);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: BLOG_ARTICLES.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: article.h1,
      url: `${SITE_URL}${buildBlogArticlePath(article.slug)}`,
    })),
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GateQA Guides & Insights",
    description: "GATE exam guides, syllabus updates, preparation strategy, and cutoff analysis.",
    url: canonicalUrl,
    mainEntity: itemListSchema,
  };

  const categoryOptions: CategoryFilter[] = [
    "All",
    ...BLOG_CATEGORIES.map(({ category }) => category),
    "Subject Guides",
  ];

  return (
    <>
      <SEOHead
        title="GateQA Blog — Exam Information, Syllabus & Study Guides"
        description="Browse GATE Computer Science guides covering syllabus changes, exam details, eligibility, cutoffs, preparation strategy, and subject-wise PYQs."
        path={BLOG_ROUTE}
        schemaOrg={[breadcrumbsSchema, collectionSchema, itemListSchema]}
      />

      <PageShell contentClassName="py-4 sm:py-7" fluid>
        <div className="mx-auto w-full max-w-[88rem] space-y-6 sm:space-y-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
            <Link to="/" className="hover:text-[color:var(--color-primary-text)]">Home</Link>
            <FaChevronRight aria-hidden="true" size={9} />
            <span aria-current="page" className="font-semibold text-[color:var(--color-text)]">Blog</span>
          </nav>

          <header className="grid gap-5 border-b border-[color:var(--color-border)] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary-text)]">
                <FaBookOpen aria-hidden="true" /> Preparation Hub
              </p>
              <h1 className="mt-2 text-balance font-display text-3xl leading-tight text-[color:var(--color-text)] sm:text-4xl">
                Prep Guides &amp; Exam Insights
              </h1>
              <p className="mt-3 max-w-[68ch] text-pretty text-base leading-7 text-[color:var(--color-text-muted)]">
                Practical GATE guides on syllabus updates, exam details, eligibility, cutoffs, and preparation choices.
              </p>
            </div>
            <div className="relative">
              <label htmlFor="blog-search" className="sr-only">Search articles and subject guides</label>
              <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]" size={14} />
              <input
                id="blog-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles, topics, or subjects"
                className="min-h-11 w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-2.5 pl-10 pr-11 text-base text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-primary-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-soft)] sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)]"
                >
                  <FaTimes aria-hidden="true" size={13} />
                </button>
              )}
            </div>
          </header>

          <div role="group" aria-label="Filter guides by category" className="flex gap-2 overflow-x-auto pb-1">
            {categoryOptions.map((category) => {
              const active = activeCategory === category;
              const count = category === "All"
                ? BLOG_ARTICLES.length
                : category === "Subject Guides"
                  ? SUBJECT_GUIDES.length
                  : BLOG_CATEGORIES.find((item) => item.category === category)?.count || 0;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${active
                    ? "border-[color:var(--color-primary-text)] bg-[color:var(--color-primary-text)] text-white"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"}`}
                >
                  {category}
                  <span aria-hidden="true" className="tabular-nums opacity-80">{count}</span>
                </button>
              );
            })}
          </div>

          <section aria-labelledby="featured-guide-heading" className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
            {showFeatured && FEATURED_ARTICLE && (
              <article className="flex min-w-0 flex-col justify-between rounded-xl border border-[color:var(--color-primary-border)] bg-[color:var(--color-surface)] p-5 sm:p-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[color:var(--color-primary-text)]">
                    <span>{FEATURED_ARTICLE.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums text-[color:var(--color-text-muted)]">
                      <FaClock aria-hidden="true" size={11} /> {FEATURED_ARTICLE.readingTime} min read
                    </span>
                    {(FEATURED_ARTICLE.datePublished || FEATURED_ARTICLE.dateModified) && (
                      <>
                        <span aria-hidden="true">·</span>
                        <time
                          dateTime={FEATURED_ARTICLE.datePublished || FEATURED_ARTICLE.dateModified}
                          title={FEATURED_ARTICLE.datePublished ? "Published" : "Last updated"}
                          className="tabular-nums text-[color:var(--color-text-muted)]"
                        >
                          {formatBlogDate(FEATURED_ARTICLE.datePublished || FEATURED_ARTICLE.dateModified)}
                        </time>
                      </>
                    )}
                  </div>
                  <h2 id="featured-guide-heading" className="mt-3 max-w-[28ch] text-balance font-display text-2xl leading-tight text-[color:var(--color-text)] sm:text-3xl">
                    <Link to={buildBlogArticlePath(FEATURED_ARTICLE.slug)} className="hover:text-[color:var(--color-primary-text)]">
                      {FEATURED_ARTICLE.h1}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-[68ch] text-pretty text-sm leading-6 text-[color:var(--color-text-muted)]">
                    {FEATURED_ARTICLE.description}
                  </p>
                </div>
                <Link
                  to={buildBlogArticlePath(FEATURED_ARTICLE.slug)}
                  className="mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-lg bg-[color:var(--color-primary-text)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Read the complete guide <FaArrowRight aria-hidden="true" size={12} />
                </Link>
              </article>
            )}

            <article className="flex min-w-0 flex-col justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--color-text-muted)]">
                  <FaFire aria-hidden="true" /> Practice resource
                </p>
                <h2 className="mt-2 text-balance font-display text-xl leading-snug text-[color:var(--color-text)]">
                  High Priority Topics for GATE CS
                </h2>
                <p className="mt-2 text-pretty text-sm leading-6 text-[color:var(--color-text-muted)]">
                  Subject importance, topic weightage, and recent exam trends to help focus your revision.
                </p>
              </div>
              <Link to={HIGH_PRIORITY_TOPICS_ROUTE} className="mt-4 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[color:var(--color-primary-text)] hover:underline">
                View topic guide <FaArrowRight aria-hidden="true" size={11} />
              </Link>
            </article>
          </section>

          {activeCategory !== "Subject Guides" && (filteredArticles.length > 0 || filteredSubjects.length === 0) && (
          <section aria-labelledby="articles-heading" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="articles-heading" className="text-xl font-semibold text-[color:var(--color-text)]">
                  {activeCategory === "All" ? "Latest articles" : activeCategory}
                </h2>
                <p className="mt-1 text-xs tabular-nums text-[color:var(--color-text-muted)]">
                  {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
                </p>
              </div>
              {totalPages > 1 && (
                <p className="text-xs tabular-nums text-[color:var(--color-text-muted)]">
                  Page {validCurrentPage} of {totalPages}
                </p>
              )}
            </div>

            {paginatedArticles.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-6 text-sm text-[color:var(--color-text-muted)]">
                <p>No guides match this search.</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-3 font-semibold text-[color:var(--color-primary-text)] hover:underline"
                >
                  Clear search and filters
                </button>
              </div>
            ) : null}

            {totalPages > 1 && (
              <nav aria-label="Article pages" className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-3 text-xs font-semibold text-[color:var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft aria-hidden="true" size={10} /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    aria-current={page === validCurrentPage ? "page" : undefined}
                    className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-semibold tabular-nums ${page === validCurrentPage
                      ? "border-[color:var(--color-primary-text)] bg-[color:var(--color-primary-text)] text-white"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)]"}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-3 text-xs font-semibold text-[color:var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <FaChevronRight aria-hidden="true" size={10} />
                </button>
              </nav>
            )}
          </section>
          )}

          {filteredSubjects.length > 0 && (
            <section aria-labelledby="subject-guides-heading" className="space-y-4 border-t border-[color:var(--color-border)] pt-6">
              <div>
                <h2 id="subject-guides-heading" className="text-xl font-semibold text-[color:var(--color-text)]">Subject practice guides</h2>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">Open a subject hub to practice its previous-year questions.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSubjects.map((subject) => (
                  <article key={subject.urlSlug} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                    <h3 className="font-semibold text-[color:var(--color-text)]">
                      <Link to={`/subjects/${subject.urlSlug}`} className="hover:text-[color:var(--color-primary-text)]">{subject.label}</Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 text-pretty text-sm leading-6 text-[color:var(--color-text-muted)]">{subject.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subject.topics.slice(0, 3).map((topic) => (
                        <span key={topic.label} className="rounded-md bg-[color:var(--color-surface-muted)] px-2 py-1 text-xs text-[color:var(--color-text-muted)]">{topic.label}</span>
                      ))}
                    </div>
                    <Link to={`/subjects/${subject.urlSlug}`} className="mt-4 inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-[color:var(--color-primary-text)] hover:underline">
                      Practice questions <FaArrowRight aria-hidden="true" size={10} />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageShell>
    </>
  );
}

