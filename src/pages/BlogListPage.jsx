import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChevronRight,
  FaChevronLeft,
  FaBookOpen,
  FaSearch,
  FaArrowRight,
  FaFire,
  FaLayerGroup,
} from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildWebPageSchema } from "../components/SEO/SEOHead";
import { EDITORIAL_PAGES } from "../data/editorialPages";
import { SUBJECT_SEO_MAP } from "../utils/landingPages";
import { BLOG_ROUTE, HIGH_PRIORITY_TOPICS_ROUTE } from "../utils/routes";
import { SITE_URL } from "../constants/siteConfig";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const CATEGORY_OPTIONS = ["All", "Exam Guides", "Syllabus Updates", "Subject Guides"];
const ITEMS_PER_PAGE = 6;

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Normalize articles and subject guides into a single structured list
  const allResources = useMemo(() => {
    const articles = EDITORIAL_PAGES.filter((p) => p.showInBlog === true).map((page) => ({
      id: page.path,
      type: "article",
      category: page.category || "Exam Guides",
      eyebrow: page.eyebrow,
      title: page.keyword,
      h1: page.h1,
      description: page.description,
      path: page.path,
      rawPage: page,
    }));

    const subjects = SUBJECT_SEO_MAP.map((subject) => ({
      id: `/subjects/${subject.urlSlug}`,
      type: "subject",
      category: "Subject Guides",
      eyebrow: "Subject PYQ",
      title: subject.label,
      h1: subject.label,
      description: subject.description,
      path: `/subjects/${subject.urlSlug}`,
      topics: subject.topics,
      rawSubject: subject,
    }));

    return [...articles, ...subjects];
  }, []);

  // Filter based on search query and category
  const filteredResources = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return allResources.filter((item) => {
      // Category match
      if (activeCategory !== "All" && item.category !== activeCategory) {
        return false;
      }

      // Search query match
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const h1Match = item.h1.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const topicsMatch =
        item.topics && item.topics.some((t) => t.label.toLowerCase().includes(query));

      return titleMatch || h1Match || descMatch || topicsMatch;
    });
  }, [allResources, searchQuery, activeCategory]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  // Pagination bounds
  const totalItems = filteredResources.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedResources = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredResources, validCurrentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canonicalUrl = `${SITE_URL}${BLOG_ROUTE}`;

  // Schemas
  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: canonicalUrl },
  ];

  const breadcrumbsSchema = buildBreadcrumbSchema(breadcrumbs);
  const webPageSchema = buildWebPageSchema({
    name: "GateQA Prep Blog & Exam Guides",
    description:
      "Access deep-dive preparation resources, syllabus topics, patterns, cutoffs, subject weightage, and subject-wise guides for GATE CS & Aptitude.",
    url: canonicalUrl,
  });

  return (
    <>
      <SEOHead
        title="GateQA Blog — Exam Information, Syllabus & Study Guides"
        description="Browse our compilation of comprehensive GATE Computer Science prep resources, syllabus breakdowns, cutoffs, mock exams, and topic-wise study guides."
        path={BLOG_ROUTE}
        schemaOrg={[breadcrumbsSchema, webPageSchema]}
      />

      <PageShell contentClassName="py-4 sm:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6 sm:space-y-8 max-w-6xl mx-auto"
        >
          {/* Breadcrumbs */}
          <motion.nav
            variants={fadeUp}
            aria-label="Breadcrumb"
            className="flex items-center space-x-2 text-xs sm:text-sm text-[color:var(--color-text-muted)]"
          >
            <Link to="/" className="hover:text-[color:var(--color-primary-text)] transition-colors">
              Home
            </Link>
            <FaChevronRight size={10} className="mx-1 text-[color:var(--color-border)]" />
            <span className="font-medium text-[color:var(--color-text)]">Blog</span>
          </motion.nav>

          {/* Header */}
          <motion.header variants={fadeUp} className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-text)]">
              <FaBookOpen size={12} />
              Preparation Hub
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--color-text)] sm:text-4xl md:text-5xl">
              Prep Guides & Exam Insights
            </h1>
            <p className="text-lg text-[color:var(--color-text-muted)] leading-8 max-w-3xl">
              Comprehensive breakdowns of the GATE CS exam structure, syllabus revisions, eligibility, cutoff stats, and subject-wise preparation guides.
            </p>
          </motion.header>

          {/* Search & Category Filter Controls */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[color:var(--color-text-muted)]">
                  <FaSearch size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Search articles, keywords, or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-3 pl-10 pr-4 text-sm font-medium text-[color:var(--color-text)] placeholder-[color:var(--color-text-muted)] transition-colors focus:border-[color:var(--color-primary-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-soft)] shadow-[var(--shadow-soft)]"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <span className="shrink-0 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)] mr-1">
                  <FaLayerGroup size={11} /> Filter:
                </span>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[color:var(--color-primary-text)] text-white shadow-sm"
                          : "bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:border-[color:var(--color-primary-border)]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Featured Resource: High Priority Topics */}
          <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="featured-heading">
            <h2
              id="featured-heading"
              className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]"
            >
              Featured Resource
            </h2>
            <motion.article
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-orange-900/40 dark:from-orange-950/30 dark:to-amber-950/20 p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                <span className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                  <FaFire size={22} />
                </span>
                <div className="min-w-0">
                  <span className="inline-block mb-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                    Study Guide
                  </span>
                  <h3 className="text-xl font-bold text-[color:var(--color-text)] group-hover:text-orange-700 dark:group-hover:text-orange-400 leading-snug transition-colors">
                    <Link to={HIGH_PRIORITY_TOPICS_ROUTE}>High Priority Topics for GATE CS</Link>
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                    Subject-wise importance rankings, high-weightage topics, recent exam trends, and GATE exam structure — everything to focus your preparation.
                  </p>
                </div>
              </div>
              <Link
                to={HIGH_PRIORITY_TOPICS_ROUTE}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
              >
                <span>View Guide</span>
                <FaArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.article>
          </motion.section>

          {/* Resources Grid & Pagination Info */}
          <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="resources-heading">
            <div className="flex items-center justify-between">
              <h2
                id="resources-heading"
                className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]"
              >
                {activeCategory === "All" ? "Exam Guides & Subject Resources" : activeCategory}
              </h2>
              {totalItems > 0 && (
                <span className="text-xs font-semibold text-[color:var(--color-text-muted)]">
                  Showing {Math.min(totalItems, (validCurrentPage - 1) * ITEMS_PER_PAGE + 1)}–
                  {Math.min(totalItems, validCurrentPage * ITEMS_PER_PAGE)} of {totalItems}
                </span>
              )}
            </div>

            {paginatedResources.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedResources.map((item) => {
                  const isSubject = item.type === "subject";
                  return (
                    <motion.article
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className={`flex flex-col justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group ${
                        isSubject
                          ? "hover:border-teal-400 dark:hover:border-teal-500"
                          : "hover:border-[color:var(--color-primary-border)]"
                      }`}
                    >
                      <div className="space-y-4">
                        <span
                          className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                            isSubject
                              ? "bg-[color:var(--color-surface-muted)] border-[color:var(--color-border)] text-[color:var(--color-text-muted)] group-hover:bg-teal-50 dark:group-hover:bg-teal-950 group-hover:text-teal-700 dark:group-hover:text-teal-300 group-hover:border-teal-300"
                              : "bg-[color:var(--color-surface-muted)] border-[color:var(--color-border)] text-[color:var(--color-text-muted)] group-hover:bg-[color:var(--color-primary-soft)] group-hover:text-[color:var(--color-primary-text)] group-hover:border-[color:var(--color-primary-border)]"
                          }`}
                        >
                          {item.eyebrow}
                        </span>
                        <h3
                          className={`text-lg font-bold leading-snug transition-colors ${
                            isSubject
                              ? "text-[color:var(--color-text)] group-hover:text-teal-700 dark:group-hover:text-teal-300"
                              : "text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary-text)]"
                          }`}
                        >
                          <Link to={item.path}>{item.title}</Link>
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        {isSubject && item.topics && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic.label}
                                className="rounded-md bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--color-text-muted)]"
                              >
                                {topic.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 sm:pt-6">
                        <Link
                          to={item.path}
                          className={`inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity ${
                            isSubject
                              ? "text-teal-700 dark:text-teal-400"
                              : "text-[color:var(--color-primary-text)]"
                          }`}
                        >
                          <span>{isSubject ? "Practice Questions" : "Read Article"}</span>
                          <FaArrowRight
                            size={10}
                            className="transform group-hover:translate-x-1 transition-transform"
                          />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-6 sm:p-12 text-center"
              >
                <p className="text-base text-[color:var(--color-text-muted)]">
                  No resources found matching your filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-3 text-sm font-bold text-[color:var(--color-primary-text)] hover:underline"
                >
                  Reset all filters
                </button>
              </motion.div>
            )}

            {/* Multi-Page Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-xs font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary-border)] disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous Page"
                >
                  <FaChevronLeft size={10} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[color:var(--color-primary-text)] text-white shadow-sm"
                            : "bg-[color:var(--color-surface)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-xs font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary-border)] disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <FaChevronRight size={10} />
                </button>
              </div>
            )}
          </motion.section>
        </motion.div>
      </PageShell>
    </>
  );
}
