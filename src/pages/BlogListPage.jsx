import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronRight, FaBookOpen, FaSearch, FaArrowRight, FaFire } from "react-icons/fa";

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

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Only show pages that have real article content (showInBlog: true)
  const blogPages = EDITORIAL_PAGES.filter((page) => page.showInBlog === true);

  // Further filter based on search query
  const filteredPages = blogPages.filter((page) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      page.keyword.toLowerCase().includes(query) ||
      page.h1.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query)
    );
  });

  const canonicalUrl = `${SITE_URL}${BLOG_ROUTE}`;

  // Schemas
  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: canonicalUrl },
  ];
  
  const breadcrumbsSchema = buildBreadcrumbSchema(breadcrumbs);
  const webPageSchema = buildWebPageSchema({
    name: "GateQA Prep Blog & Exam Guides",
    description: "Access deep-dive preparation resources, syllabus topics, patterns, cutoffs, subject weightage, and subject-wise guides for GATE CS & Aptitude.",
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
          <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-[color:var(--color-text-muted)]">
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
              Comprehensive breakdowns of the GATE CS exam structure, syllabus details, eligibility, cutoff stats, and subject-wise preparation tips.
            </p>
          </motion.header>

          {/* Interactive Search Bar */}
          <motion.div variants={fadeUp} className="relative max-w-md">
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
          </motion.div>

          {/* Featured Resource: High Priority Topics */}
          <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
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

          {/* Articles Grid */}
          <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="articles-heading">
            <h2 id="articles-heading" className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
              Exam Guides & Articles
            </h2>
            {filteredPages.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPages.map((page) => (
                  <motion.article
                    key={page.path}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="flex flex-col justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:border-[color:var(--color-primary-border)] transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      <span className="inline-block rounded-lg bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider group-hover:bg-[color:var(--color-primary-soft)] group-hover:text-[color:var(--color-primary-text)] group-hover:border-[color:var(--color-primary-border)] transition-colors">
                        {page.eyebrow}
                      </span>
                      <h3 className="text-lg font-bold text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary-text)] leading-snug transition-colors">
                        <Link to={page.path}>{page.keyword}</Link>
                      </h3>
                      <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed line-clamp-3">
                        {page.description}
                      </p>
                    </div>

                    <div className="pt-4 sm:pt-6">
                      <Link
                        to={page.path}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-primary-text)] hover:opacity-80 transition-opacity"
                      >
                        <span>Read Article</span>
                        <FaArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)] italic">No articles match your search.</p>
            )}
          </motion.section>

          {/* Subject Practice Guides */}
          {(() => {
            const query = searchQuery.toLowerCase().trim();
            const filteredSubjects = SUBJECT_SEO_MAP.filter((s) =>
              !query ||
              s.label.toLowerCase().includes(query) ||
              s.description.toLowerCase().includes(query) ||
              s.topics.some((t) => t.toLowerCase().includes(query))
            );
            if (filteredSubjects.length === 0) return null;
            return (
              <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="subjects-heading">
                <h2 id="subjects-heading" className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--color-text-muted)]">
                  Subject Practice Guides
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSubjects.map((subject) => (
                    <motion.article
                      key={subject.urlSlug}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className="flex flex-col justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:border-teal-400 dark:hover:border-teal-500 transition-all duration-300 group"
                    >
                      <div className="space-y-4">
                        <span className="inline-block rounded-lg bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider group-hover:bg-teal-50 dark:group-hover:bg-teal-950 group-hover:text-teal-700 dark:group-hover:text-teal-300 group-hover:border-teal-300 transition-colors">
                          Subject PYQ
                        </span>
                        <h3 className="text-lg font-bold text-[color:var(--color-text)] group-hover:text-teal-700 dark:group-hover:text-teal-300 leading-snug transition-colors">
                          <Link to={`/subjects/${subject.urlSlug}`}>{subject.label}</Link>
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed line-clamp-3">
                          {subject.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {subject.topics.slice(0, 3).map((topic) => (
                            <span key={topic.label} className="rounded-md bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--color-text-muted)]">
                              {topic.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 sm:pt-6">
                        <Link
                          to={`/subjects/${subject.urlSlug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:opacity-80 transition-opacity"
                        >
                          <span>Practice Questions</span>
                          <FaArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            );
          })()}

          {/* Empty state when nothing matches at all */}
          {(() => {
            const query = searchQuery.toLowerCase().trim();
            if (!query) return null;
            const hasArticles = EDITORIAL_PAGES.filter((p) => p.showInBlog).some((p) =>
              p.keyword.toLowerCase().includes(query) || p.h1.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
            );
            const hasSubjects = SUBJECT_SEO_MAP.some((s) =>
              s.label.toLowerCase().includes(query) || s.description.toLowerCase().includes(query) || s.topics.some((t) => t.toLowerCase().includes(query))
            );
            if (hasArticles || hasSubjects) return null;
            return (
              <motion.div variants={fadeUp} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-6 sm:p-12 text-center">
                <p className="text-base text-[color:var(--color-text-muted)]">
                  No results found for "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-sm font-bold text-[color:var(--color-primary-text)] hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            );
          })()}
        </motion.div>
      </PageShell>
    </>
  );
}
