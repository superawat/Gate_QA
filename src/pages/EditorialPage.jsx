import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronRight, FaChevronDown, FaGraduationCap, FaCheck, FaArrowRight } from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildWebPageSchema } from "../components/SEO/SEOHead";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Custom accordion for FAQs with smooth motion
const FaqAccordionItem = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border-b border-[color:var(--color-border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary-text)] focus:outline-none"
      >
        <span className="text-base sm:text-lg pr-4">{faq.question}</span>
        <span className="shrink-0 text-[color:var(--color-text-muted)]">
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            <FaChevronDown size={14} />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm sm:text-base leading-7 text-[color:var(--color-text-muted)]">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EditorialPage({ data }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  if (!data) return null;

  // Build JSON-LD schemas
  const siteUrl = "https://gateqa.in";
  const canonicalUrl = `${siteUrl}${data.path}`;
  
  const breadcrumbsSchema = buildBreadcrumbSchema(data.breadcrumbs);
  const webPageSchema = buildWebPageSchema({
    name: data.h1,
    description: data.description,
    url: canonicalUrl,
  });

  const faqSchema = data.faqs && data.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const schemas = [breadcrumbsSchema, webPageSchema, faqSchema].filter(Boolean);

  return (
    <>
      <SEOHead
        title={`${data.keyword} | GateQA`}
        description={data.description}
        path={data.path}
        schemaOrg={schemas}
      />
      
      <PageShell contentClassName="py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8 max-w-6xl mx-auto"
        >
          {/* Breadcrumbs */}
          <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-[color:var(--color-text-muted)]">
            {data.breadcrumbs.map((crumb, idx) => {
              const isLast = idx === data.breadcrumbs.length - 1;
              const linkPath = crumb.url.replace("https://gateqa.in", "");
              
              return (
                <React.Fragment key={crumb.name}>
                  {idx > 0 && <FaChevronRight size={10} className="mx-1 text-[color:var(--color-border)]" />}
                  {isLast ? (
                    <span className="font-medium text-[color:var(--color-text)] truncate max-w-[200px] sm:max-w-none">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={linkPath || "/"}
                      className="hover:text-[color:var(--color-primary-text)] transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </motion.nav>

          {/* Header Section */}
          <motion.header variants={fadeUp} className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-text)]">
              <FaGraduationCap size={14} />
              {data.eyebrow}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--color-text)] sm:text-4xl md:text-5xl leading-tight">
              {data.h1}
            </h1>
            <p className="text-lg text-[color:var(--color-text-muted)] leading-8 max-w-4xl">
              {data.description}
            </p>
          </motion.header>

          {/* Two-Column Content Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem] items-start">
            {/* Main Content */}
            <motion.div variants={fadeUp} className="space-y-8">
              {/* Rich Copy Paragraphs & Tables */}
              {data.richCopy && data.richCopy.length > 0 && (
                <section className="prose max-w-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8 shadow-[var(--shadow-soft)] space-y-6">
                  {data.richCopy.map((item, idx) => {
                    if (typeof item === "object" && item.type === "table") {
                      return (
                        <div key={idx} className="overflow-x-auto my-6 rounded-xl border border-[color:var(--color-border)]">
                          <table className="w-full text-left border-collapse text-sm sm:text-base">
                            <thead>
                              <tr className="bg-[color:var(--color-surface-muted)] border-b border-[color:var(--color-border)]">
                                {item.headers.map((h, i) => (
                                  <th key={i} className="px-4 py-3 font-semibold text-[color:var(--color-text)]">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--color-border)]">
                              {item.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[color:var(--color-surface-muted)] transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-3 text-[color:var(--color-text-muted)]">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    return (
                      <p 
                        key={idx} 
                        className="text-base sm:text-lg leading-8 text-[color:var(--color-text-muted)]"
                      >
                        {item}
                      </p>
                    );
                  })}
                </section>
              )}

              {/* Callout box / Key highlights */}
              <section className="rounded-2xl border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] p-6 sm:p-8 space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-[color:var(--color-primary-text)]">
                  Why Practice on GateQA?
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 text-sm sm:text-base text-[color:var(--color-text)]">
                  <li className="flex items-start gap-2">
                    <FaCheck className="mt-1 shrink-0 text-[color:var(--color-primary-text)]" size={14} />
                    <span>3,500+ Official GATE CS PYQs (1987-2026)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="mt-1 shrink-0 text-[color:var(--color-primary-text)]" size={14} />
                    <span>100% Free: No Registration or Login required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="mt-1 shrink-0 text-[color:var(--color-primary-text)]" size={14} />
                    <span>Interactive virtual calculator widget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheck className="mt-1 shrink-0 text-[color:var(--color-primary-text)]" size={14} />
                    <span>Offline-First progress & history storage</span>
                  </li>
                </ul>
              </section>

              {/* FAQs Section */}
              {data.faqs && data.faqs.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-[color:var(--color-text)] tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)] divide-y divide-[color:var(--color-border)]">
                    {data.faqs.map((faq, idx) => (
                      <FaqAccordionItem
                        key={idx}
                        faq={faq}
                        isOpen={openFaqIndex === idx}
                        onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>

            {/* Sidebar Sticky CTA Card */}
            <motion.aside 
              variants={fadeUp} 
              className="lg:sticky lg:top-28 space-y-6"
            >
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-card)] space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[color:var(--color-text)]">
                    Boost Your Score
                  </h3>
                  <p className="text-sm text-[color:var(--color-text-muted)] leading-6">
                    Solve actual previous exam papers in a timed environment and track your progress.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-text)] text-xs font-bold">1</span>
                    <span>Category & Subject Filters</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-text)] text-xs font-bold">2</span>
                    <span>Performance Insights</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text)]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-text)] text-xs font-bold">3</span>
                    <span>Detailed Solutions</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={data.ctaHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <span>{data.ctaLabel}</span>
                    <FaArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
