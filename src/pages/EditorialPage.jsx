import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaChevronRight,
  FaChevronDown,
  FaGraduationCap,
  FaCheck,
  FaArrowRight,
  FaCalendarAlt,
  FaLightbulb,
  FaBookOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

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

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
const FaqAccordionItem = ({ faq, isOpen, onToggle }) => (
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

// ─── Infographic Card Row ─────────────────────────────────────────────────────
const InfoCard = ({ icon, title, subtitle, accent }) => {
  const accentMap = {
    blue:   { border: "border-sky-500/40",   bg: "bg-sky-500/10",   text: "text-sky-400",   dot: "bg-sky-500" },
    green:  { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    amber:  { border: "border-amber-500/40",  bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "bg-amber-500" },
    purple: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
    red:    { border: "border-red-500/40",    bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-500" },
    slate:  { border: "border-slate-500/40",  bg: "bg-slate-500/10",  text: "text-slate-400",  dot: "bg-slate-400" },
  };
  const a = accentMap[accent] || accentMap.blue;
  return (
    <div className={`flex items-start gap-4 rounded-xl border ${a.border} ${a.bg} p-4`}>
      <span className={`text-2xl ${a.text} mt-0.5 shrink-0`}>{icon}</span>
      <div className="min-w-0">
        <p className={`text-sm font-bold ${a.text} mb-0.5`}>{title}</p>
        <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

// ─── Timeline Item ────────────────────────────────────────────────────────────
const TimelineItem = ({ label, date, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-[color:var(--color-primary)] ring-4 ring-[color:var(--color-primary-soft)] mt-1 shrink-0" />
      {!isLast && <div className="w-0.5 flex-1 bg-[color:var(--color-border)] mt-1" />}
    </div>
    <div className={`pb-${isLast ? "0" : "5"} min-w-0`}>
      <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-primary-text)] mb-0.5">{date}</p>
      <p className="text-sm sm:text-base text-[color:var(--color-text)] leading-relaxed">{label}</p>
    </div>
  </div>
);

// ─── Step/Flow Track Card ─────────────────────────────────────────────────────
const TrackCard = ({ letter, color, steps }) => {
  const colorMap = {
    A: { bg: "bg-sky-500/10",    border: "border-sky-500/30",    badge: "bg-sky-600",    text: "text-sky-300" },
    B: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-600", text: "text-emerald-300" },
    C: { bg: "bg-purple-500/10", border: "border-purple-500/30", badge: "bg-purple-600", text: "text-purple-300" },
  };
  const c = colorMap[letter] || colorMap.A;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`${c.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>Track {letter}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <span className={`text-sm font-semibold ${c.text}`}>{step}</span>
            {i < steps.length - 1 && (
              <FaArrowRight size={10} className="text-[color:var(--color-text-muted)] shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Related Articles Strip ───────────────────────────────────────────────────
const RelatedArticles = ({ articles }) => (
  <section className="space-y-3">
    <h3 className="text-base font-bold text-[color:var(--color-text)] uppercase tracking-widest">
      Related Articles
    </h3>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {articles.map((art, i) => (
        <Link
          key={i}
          to={art.path}
          className="group flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-primary-soft)] transition-all"
        >
          <FaBookOpen size={16} className="shrink-0 text-[color:var(--color-primary-text)]" />
          <span className="text-sm font-medium text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary-text)] transition-colors">
            {art.label}
          </span>
          <FaArrowRight size={10} className="ml-auto shrink-0 text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary-text)] transition-colors" />
        </Link>
      ))}
    </div>
  </section>
);

// ─── RichCopy Renderer ────────────────────────────────────────────────────────
function RichCopyRenderer({ items }) {
  return (
    <div className="space-y-6">
      {items.map((item, idx) => {
        if (typeof item === "string") {
          return (
            <p
              key={idx}
              className="text-base sm:text-lg leading-8 text-[color:var(--color-text-muted)]"
              dangerouslySetInnerHTML={{ __html: item }}
            />
          );
        }

        if (item.type === "h2") {
          return (
            <h2 key={idx} className="text-2xl sm:text-3xl font-bold text-[color:var(--color-text)] mt-10 mb-2 flex items-center gap-3">
              <span className="inline-block w-1 h-7 rounded-full bg-[color:var(--color-primary)] shrink-0" />
              {item.text}
            </h2>
          );
        }

        if (item.type === "h3") {
          return (
            <h3 key={idx} className="text-xl sm:text-2xl font-bold text-[color:var(--color-text)] mt-8 mb-2">
              {item.text}
            </h3>
          );
        }

        if (item.type === "ul") {
          return (
            <ul key={idx} className="space-y-3">
              {item.items.map((li, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-[color:var(--color-text-muted)]">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: li }} />
                </li>
              ))}
            </ul>
          );
        }

        if (item.type === "table") {
          return (
            <div key={idx} className="overflow-x-auto my-6 rounded-xl border border-[color:var(--color-border)]">
              <table className="w-full min-w-max text-left border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-[color:var(--color-primary)] text-white">
                    {item.headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-border)]">
                  {item.rows.map((row, rIdx) => (
                    <tr key={rIdx} className={`${rIdx % 2 === 0 ? "bg-[color:var(--color-surface)]" : "bg-[color:var(--color-surface-muted)]"} hover:bg-[color:var(--color-primary-soft)] transition-colors`}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className={`px-4 py-3 ${cIdx === 0 ? "font-semibold text-[color:var(--color-text)]" : "text-[color:var(--color-text-muted)]"}`}>
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

        // ── New infographic types ──────────────────────────────────────────

        if (item.type === "cards") {
          return (
            <div key={idx} className="grid gap-3 sm:grid-cols-2">
              {item.items.map((card, i) => (
                <InfoCard key={i} {...card} />
              ))}
            </div>
          );
        }

        if (item.type === "timeline") {
          return (
            <div key={idx} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5 space-y-0">
              {item.items.map((t, i) => (
                <TimelineItem key={i} date={t.date} label={t.label} isLast={i === item.items.length - 1} />
              ))}
            </div>
          );
        }

        if (item.type === "tracks") {
          return (
            <div key={idx} className="space-y-3">
              {item.items.map((track, i) => (
                <TrackCard key={i} letter={track.letter} steps={track.steps} />
              ))}
            </div>
          );
        }

        if (item.type === "callout") {
          const variantMap = {
            info:    { icon: <FaLightbulb />, bg: "bg-sky-500/10",    border: "border-sky-500/40",    text: "text-sky-400" },
            warning: { icon: <FaExclamationTriangle />, bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400" },
            tip:     { icon: <FaCheck />,     bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400" },
          };
          const v = variantMap[item.variant || "info"];
          return (
            <div key={idx} className={`flex items-start gap-4 rounded-xl border ${v.border} ${v.bg} p-4`}>
              <span className={`text-xl ${v.text} shrink-0 mt-0.5`}>{v.icon}</span>
              <p
                className="text-sm sm:text-base leading-7 text-[color:var(--color-text)]"
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          );
        }

        if (item.type === "related-articles") {
          return <RelatedArticles key={idx} articles={item.articles} />;
        }

        return null;
      })}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function EditorialPage({ data }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  if (!data) return null;

  const siteUrl = "https://gateqa.in";
  const canonicalUrl = `${siteUrl}${data.path}`;

  const breadcrumbsSchema = buildBreadcrumbSchema(data.breadcrumbs);
  const webPageSchema = buildWebPageSchema({
    name: data.h1,
    description: data.description,
    url: canonicalUrl,
  });

  const faqSchema =
    data.faqs && data.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

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
          <motion.nav
            variants={fadeUp}
            aria-label="Breadcrumb"
            className="flex items-center space-x-2 text-xs sm:text-sm text-[color:var(--color-text-muted)]"
          >
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
                    <Link to={linkPath || "/"} className="hover:text-[color:var(--color-primary-text)] transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </motion.nav>

          {/* Header */}
          <motion.header variants={fadeUp} className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-text)]">
              <FaGraduationCap size={14} />
              {data.eyebrow}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--color-text)] sm:text-4xl md:text-5xl leading-tight">
              {data.h1}
            </h1>
          </motion.header>

          {/* Two-Column Layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem] items-start">
            {/* Main Content */}
            <motion.div variants={fadeUp} className="space-y-8">
              {data.richCopy && data.richCopy.length > 0 && (
                <section className="prose max-w-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)]">
                  <RichCopyRenderer items={data.richCopy} />
                </section>
              )}

              {/* Why GateQA callout */}
              <section className="rounded-2xl border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] p-4 sm:p-6 md:p-8 space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-[color:var(--color-primary-text)]">
                  Why Practice on GateQA?
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 text-sm sm:text-base text-[color:var(--color-text)]">
                  {[
                    "3,500+ Official GATE CS PYQs (1987–2026)",
                    "100% Free — No Registration Required",
                    "Interactive Virtual Calculator Widget",
                    "Offline-First Progress & History Storage",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <FaCheck className="mt-1 shrink-0 text-[color:var(--color-primary-text)]" size={14} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* FAQs */}
              {data.faqs && data.faqs.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-[color:var(--color-text)] tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)] divide-y divide-[color:var(--color-border)]">
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

            {/* Sidebar */}
            <motion.aside variants={fadeUp} className="lg:sticky lg:top-28 space-y-6">
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[color:var(--color-text)]">Boost Your Score</h3>
                  <p className="text-sm text-[color:var(--color-text-muted)] leading-6">
                    Solve actual previous exam papers in a timed environment and track your progress.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {["Category & Subject Filters", "Performance Insights", "Detailed Solutions"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3 text-sm text-[color:var(--color-text)]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-text)] text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
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

              {/* Quick navigation to other articles in sidebar */}
              {data.relatedArticles && data.relatedArticles.length > 0 && (
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-4">
                  <h3 className="text-base font-bold text-[color:var(--color-text)] flex items-center gap-2">
                    <FaBookOpen size={14} className="text-[color:var(--color-primary-text)]" />
                    More Articles
                  </h3>
                  <div className="space-y-2">
                    {data.relatedArticles.map((art, i) => (
                      <Link
                        key={i}
                        to={art.path}
                        className="group flex items-center gap-2 rounded-lg p-2 hover:bg-[color:var(--color-primary-soft)] transition-colors text-sm text-[color:var(--color-text-muted)] hover:text-[color:var(--color-primary-text)]"
                      >
                        <FaChevronRight size={9} className="shrink-0 text-[color:var(--color-border)] group-hover:text-[color:var(--color-primary-text)]" />
                        {art.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
