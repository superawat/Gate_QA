import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaChevronRight,
  FaChevronDown,
  FaGraduationCap,
  FaCheck,
  FaArrowRight,
  FaLightbulb,
  FaBookOpen,
  FaExclamationTriangle,
  FaList,
  FaTimes,
} from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildWebPageSchema } from "../components/SEO/SEOHead";

/* ─── Motion variants ──────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/* ─── Build ToC from richCopy ──────────────────────────────────────────────── */
function buildToC(richCopy = []) {
  const toc = [];
  richCopy.forEach((item, idx) => {
    if (item?.type === "h2") {
      toc.push({ id: `section-${idx}`, label: item.text });
    }
  });
  return toc;
}

/* ─── Sticky Table of Contents ─────────────────────────────────────────────── */
function TableOfContents({ items, activeId }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Table of contents" className="ep-toc">
      <p className="ep-toc__title">On this page</p>
      <ul className="ep-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`ep-toc__link${activeId === item.id ? " ep-toc__link--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span className="ep-toc__dot" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─── Mobile ToC Drawer ─────────────────────────────────────────────────────── */
function MobileToCDrawer({ items, activeId }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <div className="ep-mob-toc">
      <button
        type="button"
        className="ep-mob-toc__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-toc-panel"
      >
        <FaList size={13} />
        <span>On this page</span>
        <FaChevronDown size={11} className={`ep-mob-toc__chevron${open ? " ep-mob-toc__chevron--open" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-toc-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="ep-mob-toc__list">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`ep-mob-toc__link${activeId === item.id ? " ep-mob-toc__link--active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      setTimeout(() => {
                        document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 200);
                    }}
                  >
                    <FaChevronRight size={8} className="shrink-0 opacity-50" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── FAQ Accordion ─────────────────────────────────────────────────────────── */
const FaqAccordionItem = ({ faq, isOpen, onToggle }) => (
  <div className="ep-faq__item">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="ep-faq__trigger"
    >
      <span className="ep-faq__question">{faq.question}</span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="ep-faq__chevron"
      >
        <FaChevronDown size={14} />
      </motion.span>
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
          <div className="ep-faq__answer">{faq.answer}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Info Card ─────────────────────────────────────────────────────────────── */
const accentMap = {
  blue:   { border: "border-sky-500/40",     bg: "bg-sky-500/8",     text: "text-sky-500",     iconBg: "bg-sky-500/15" },
  green:  { border: "border-emerald-500/40", bg: "bg-emerald-500/8", text: "text-emerald-500", iconBg: "bg-emerald-500/15" },
  amber:  { border: "border-amber-500/40",   bg: "bg-amber-500/8",   text: "text-amber-500",   iconBg: "bg-amber-500/15" },
  purple: { border: "border-purple-500/40",  bg: "bg-purple-500/8",  text: "text-purple-500",  iconBg: "bg-purple-500/15" },
  red:    { border: "border-red-500/40",     bg: "bg-red-500/8",     text: "text-red-500",     iconBg: "bg-red-500/15" },
  slate:  { border: "border-slate-400/30",   bg: "bg-slate-400/8",   text: "text-slate-400",   iconBg: "bg-slate-400/15" },
};

const InfoCard = ({ icon, title, subtitle, accent }) => {
  const a = accentMap[accent] || accentMap.blue;
  return (
    <div className={`ep-infocard ${a.border} ${a.bg}`}>
      <span className={`ep-infocard__icon ${a.iconBg} ${a.text}`}>{icon}</span>
      <div className="ep-infocard__body">
        <p className={`ep-infocard__title ${a.text}`}>{title}</p>
        <p className="ep-infocard__subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

/* ─── Timeline ──────────────────────────────────────────────────────────────── */
const TimelineItem = ({ label, date, isLast }) => (
  <div className="ep-timeline__item">
    <div className="ep-timeline__rail">
      <div className="ep-timeline__dot" />
      {!isLast && <div className="ep-timeline__line" />}
    </div>
    <div className={`ep-timeline__content${isLast ? " ep-timeline__content--last" : ""}`}>
      <p className="ep-timeline__date">{date}</p>
      <p className="ep-timeline__label">{label}</p>
    </div>
  </div>
);

/* ─── Track / Dependency Card ───────────────────────────────────────────────── */
const trackColorMap = {
  A: { bg: "bg-sky-500/10",     border: "border-sky-500/30",     badge: "bg-sky-600",     text: "text-sky-400" },
  B: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-600", text: "text-emerald-400" },
  C: { bg: "bg-purple-500/10",  border: "border-purple-500/30",  badge: "bg-purple-600",  text: "text-purple-400" },
};

const TrackCard = ({ letter, steps }) => {
  const c = trackColorMap[letter] || trackColorMap.A;
  return (
    <div className={`ep-track ${c.border} ${c.bg}`}>
      <span className={`ep-track__badge ${c.badge}`}>Track {letter}</span>
      <div className="ep-track__steps">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <span className={`ep-track__step ${c.text}`}>{step}</span>
            {i < steps.length - 1 && <FaArrowRight size={9} className="text-[color:var(--color-text-muted)] shrink-0 opacity-60" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ─── Related Articles Strip ─────────────────────────────────────────────────── */
const RelatedArticles = ({ articles }) => (
  <div className="ep-related">
    <p className="ep-related__heading">Related Articles</p>
    <div className="ep-related__grid">
      {articles.map((art, i) => (
        <Link key={i} to={art.path} className="ep-related__card">
          <FaBookOpen size={14} className="shrink-0 text-[color:var(--color-primary-text)]" />
          <span className="ep-related__label">{art.label}</span>
          <FaArrowRight size={9} className="ml-auto shrink-0 text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary-text)] transition-colors" />
        </Link>
      ))}
    </div>
  </div>
);

/* ─── Callout ────────────────────────────────────────────────────────────────── */
const calloutVariants = {
  info:    { icon: <FaLightbulb />,          bg: "bg-sky-500/10",     border: "border-sky-500/40",     text: "text-sky-500",     label: "Note" },
  warning: { icon: <FaExclamationTriangle />, bg: "bg-amber-500/10",   border: "border-amber-500/40",   text: "text-amber-500",   label: "Strategy" },
  tip:     { icon: <FaCheck />,              bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-500", label: "Tip" },
};

const Callout = ({ variant, text }) => {
  const v = calloutVariants[variant] || calloutVariants.info;
  return (
    <div className={`ep-callout ${v.border} ${v.bg}`}>
      <div className={`ep-callout__icon-wrap ${v.text}`}>{v.icon}</div>
      <div>
        <p className={`ep-callout__label ${v.text}`}>{v.label}</p>
        <p className="ep-callout__text" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  );
};

/* ─── Collapsible Section Wrapper for long sections ─────────────────────────── */
const CollapsibleSection = ({ title, id, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="ep-section">
      <button
        type="button"
        className="ep-section__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ep-section__accent-bar" />
        <span className="ep-section__title">{title}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="ep-section__toggle-icon"
        >
          <FaChevronDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ep-section__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── RichCopy Renderer ──────────────────────────────────────────────────────── */
function RichCopyRenderer({ items }) {
  /* Group items into sections delimited by h2 nodes */
  const sections = [];
  let current = null;

  items.forEach((item, idx) => {
    if (item?.type === "h2") {
      current = { id: `section-${idx}`, title: item.text, body: [] };
      sections.push(current);
    } else if (current) {
      current.body.push({ item, idx });
    } else {
      // Before first h2 — top-level prose
      if (!sections.length || sections[0].id !== "__preamble__") {
        sections.unshift({ id: "__preamble__", title: null, body: [] });
      }
      sections[0].body.push({ item, idx });
    }
  });

  return (
    <div className="ep-richcopy">
      {sections.map((section) => {
        const bodyContent = renderBodyItems(section.body);
        if (section.title === null) {
          return <div key={section.id} className="ep-richcopy__preamble">{bodyContent}</div>;
        }
        return (
          <CollapsibleSection key={section.id} id={section.id} title={section.title} defaultOpen>
            {bodyContent}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

function renderBodyItems(bodyItems) {
  return bodyItems.map(({ item, idx }) => {
    if (typeof item === "string") {
      return (
        <p key={idx} className="ep-prose" dangerouslySetInnerHTML={{ __html: item }} />
      );
    }

    if (item.type === "h3") {
      return (
        <h3 key={idx} className="ep-h3">{item.text}</h3>
      );
    }

    if (item.type === "ul") {
      return (
        <ul key={idx} className="ep-ul">
          {item.items.map((li, i) => (
            <li key={i} className="ep-ul__item">
              <span className="ep-ul__dot" />
              <span dangerouslySetInnerHTML={{ __html: li }} />
            </li>
          ))}
        </ul>
      );
    }

    if (item.type === "table") {
      return (
        <div key={idx} className="ep-table-wrap">
          <table className="ep-table">
            <thead>
              <tr>
                {item.headers.map((h, i) => (
                  <th key={i} className="ep-table__th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? "ep-table__row-even" : "ep-table__row-odd"}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={cIdx === 0 ? "ep-table__td ep-table__td--head" : "ep-table__td"}>
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

    if (item.type === "cards") {
      return (
        <div key={idx} className="ep-cards-grid">
          {item.items.map((card, i) => (
            <InfoCard key={i} {...card} />
          ))}
        </div>
      );
    }

    if (item.type === "timeline") {
      return (
        <div key={idx} className="ep-timeline">
          {item.items.map((t, i) => (
            <TimelineItem key={i} date={t.date} label={t.label} isLast={i === item.items.length - 1} />
          ))}
        </div>
      );
    }

    if (item.type === "tracks") {
      return (
        <div key={idx} className="ep-tracks">
          {item.items.map((track, i) => (
            <TrackCard key={i} letter={track.letter} steps={track.steps} />
          ))}
        </div>
      );
    }

    if (item.type === "callout") {
      return <Callout key={idx} variant={item.variant} text={item.text} />;
    }

    if (item.type === "related-articles") {
      return <RelatedArticles key={idx} articles={item.articles} />;
    }

    return null;
  });
}

/* ─── Main Export ────────────────────────────────────────────────────────────── */
export default function EditorialPage({ data }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeId, setActiveId] = useState("");
  const mainRef = useRef(null);

  const toc = buildToC(data?.richCopy);

  /* Intersection Observer for ToC highlight */
  useEffect(() => {
    if (!toc.length) return;
    const observers = [];
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [toc]);

  if (!data) return null;

  const siteUrl = "https://gateqa.in";
  const canonicalUrl = `${siteUrl}${data.path}`;
  const breadcrumbsSchema = buildBreadcrumbSchema(data.breadcrumbs);
  const webPageSchema = buildWebPageSchema({ name: data.h1, description: data.description, url: canonicalUrl });
  const faqSchema = data.faqs?.length
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

      <PageShell contentClassName="ep-shell">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="ep-root"
          ref={mainRef}
        >
          {/* Breadcrumbs */}
          <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="ep-breadcrumb">
            {data.breadcrumbs.map((crumb, idx) => {
              const isLast = idx === data.breadcrumbs.length - 1;
              const linkPath = crumb.url.replace("https://gateqa.in", "");
              return (
                <React.Fragment key={crumb.name}>
                  {idx > 0 && <FaChevronRight size={9} className="ep-breadcrumb__sep" />}
                  {isLast ? (
                    <span className="ep-breadcrumb__current">{crumb.name}</span>
                  ) : (
                    <Link to={linkPath || "/"} className="ep-breadcrumb__link">{crumb.name}</Link>
                  )}
                </React.Fragment>
              );
            })}
          </motion.nav>

          {/* Hero Header */}
          <motion.header variants={fadeUp} className="ep-hero">
            <span className="ep-hero__eyebrow">
              <FaGraduationCap size={13} />
              {data.eyebrow}
            </span>
            <h1 className="ep-hero__h1">{data.h1}</h1>
          </motion.header>

          {/* Mobile ToC */}
          <motion.div variants={fadeUp}>
            <MobileToCDrawer items={toc} activeId={activeId} />
          </motion.div>

          {/* Main 3-column grid: ToC | Content | Sidebar */}
          <div className="ep-layout">

            {/* Desktop ToC column */}
            <aside className="ep-toc-col">
              <div className="ep-toc-col__sticky">
                <TableOfContents items={toc} activeId={activeId} />
              </div>
            </aside>

            {/* Main content */}
            <motion.main variants={fadeUp} className="ep-main">
              {data.richCopy?.length > 0 && (
                <div className="ep-content-card">
                  <RichCopyRenderer items={data.richCopy} />
                </div>
              )}

              {/* Why GateQA */}
              <div className="ep-why-card">
                <div className="ep-why-card__header">
                  <span className="ep-why-card__icon">🎯</span>
                  <h3 className="ep-why-card__title">Why Practice on GateQA?</h3>
                </div>
                <ul className="ep-why-card__features">
                  {[
                    ["3,500+ Official GATE CS PYQs", "1987–2026 — fully organized"],
                    ["100% Free", "No registration required"],
                    ["Virtual Calculator", "For numerical problems"],
                    ["Offline-First", "Progress stored locally"],
                  ].map(([feat, sub]) => (
                    <li key={feat} className="ep-why-card__feature">
                      <span className="ep-why-card__check"><FaCheck size={10} /></span>
                      <span>
                        <strong className="ep-why-card__feat-title">{feat}</strong>
                        <span className="ep-why-card__feat-sub"> — {sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to={data.ctaHref} className="ep-why-card__cta">
                  {data.ctaLabel} <FaArrowRight size={12} />
                </Link>
              </div>

              {/* FAQs */}
              {data.faqs?.length > 0 && (
                <section className="ep-faqs">
                  <h2 className="ep-faqs__heading">
                    <span className="ep-section__accent-bar ep-faqs__bar" />
                    Frequently Asked Questions
                  </h2>
                  <div className="ep-faqs__list">
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
            </motion.main>

            {/* Right Sidebar */}
            <motion.aside variants={fadeUp} className="ep-sidebar">
              <div className="ep-sidebar__sticky">
                {/* CTA Card */}
                <div className="ep-sidebar__cta-card">
                  <div className="ep-sidebar__cta-icon">📚</div>
                  <h3 className="ep-sidebar__cta-title">Boost Your Score</h3>
                  <p className="ep-sidebar__cta-desc">
                    Solve actual previous exam papers in a timed environment and track your progress.
                  </p>
                  <div className="ep-sidebar__steps">
                    {["Category & Subject Filters", "Performance Insights", "Detailed Solutions"].map((step, i) => (
                      <div key={step} className="ep-sidebar__step">
                        <span className="ep-sidebar__step-num">{i + 1}</span>
                        <span className="ep-sidebar__step-label">{step}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={data.ctaHref} className="ep-sidebar__cta-btn">
                    {data.ctaLabel}
                    <FaArrowRight size={12} />
                  </Link>
                </div>

                {/* Related Articles */}
                {data.relatedArticles?.length > 0 && (
                  <div className="ep-sidebar__related">
                    <h3 className="ep-sidebar__related-title">
                      <FaBookOpen size={13} className="text-[color:var(--color-primary-text)]" />
                      More Articles
                    </h3>
                    {data.relatedArticles.map((art, i) => (
                      <Link key={i} to={art.path} className="ep-sidebar__related-link">
                        <FaChevronRight size={9} className="ep-sidebar__related-chevron" />
                        <span>{art.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
