import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaBook, FaCheckCircle, FaChevronRight, FaClock } from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildWebPageSchema } from "../components/SEO/SEOHead";
import { GATE_YEARS, SUBJECT_SEO_MAP } from "../utils/landingPages";
import { PRACTICE_ROUTE, HOME_ROUTE } from "../utils/routes";

/* ── Subject link card ─────────────────────────────────────────────────── */
const SubjectCard = ({ subjectEntry, year, count }) => (
  <Link
    to={`${PRACTICE_ROUTE}?subjects=${encodeURIComponent(subjectEntry.slug)}&years=${year}`}
    className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 shadow-[var(--shadow-soft)] transition hover:border-sky-400 hover:shadow-md"
  >
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[color:var(--color-text)] group-hover:text-sky-600 transition-colors truncate">
        {subjectEntry.label}
      </p>
      {count != null && (
        <p className="text-xs text-[color:var(--color-text-muted)]">{count} questions</p>
      )}
    </div>
    <FaArrowRight className="shrink-0 text-xs text-[color:var(--color-text-muted)] group-hover:text-sky-600 transition-colors" />
  </Link>
);

/* ── Adjacent year links ────────────────────────────────────────────────── */
const YearNav = ({ year }) => {
  const yearNum = Number(year);
  const prevYear = GATE_YEARS.includes(yearNum - 1) ? yearNum - 1 : null;
  const nextYear = GATE_YEARS.includes(yearNum + 1) ? yearNum + 1 : null;

  return (
    <div className="flex items-center justify-between gap-3">
      {prevYear ? (
        <Link
          to={`/gate-${prevYear}-pyq`}
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-sky-400 hover:text-sky-600"
        >
          ← GATE {prevYear}
        </Link>
      ) : <span />}
      {nextYear ? (
        <Link
          to={`/gate-${nextYear}-pyq`}
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-sky-400 hover:text-sky-600"
        >
          GATE {nextYear} →
        </Link>
      ) : <span />}
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────── */
const YearLandingPage = ({ questionBankManifest }) => {
  const { year } = useParams();
  const navigate = useNavigate();
  const yearNum = Number(year);

  // Validate year
  if (!year || !GATE_YEARS.includes(yearNum)) {
    navigate(HOME_ROUTE, { replace: true });
    return null;
  }

  // Get year sets for this year (may be multiple sets e.g. 2024-s1, 2024-s2)
  const yearSets = useMemo(
    () => (questionBankManifest?.yearSets ?? []).filter((ys) => ys.year === yearNum),
    [questionBankManifest, yearNum]
  );

  const totalQuestionsForYear = yearSets.reduce((sum, ys) => sum + (ys.count ?? 0), 0);
  const setCount = yearSets.length;

  // Build subject list from manifest
  const manifestSubjects = questionBankManifest?.subjects ?? [];

  const practiceUrl = `${PRACTICE_ROUTE}?years=${yearNum}`;
  const mockUrl = `/mock?stage=setup`;

  const pageTitle = `GATE ${yearNum} CS Questions — PYQ with Solutions | GateQA`;
  const pageDescription = `Practice all ${totalQuestionsForYear || ""}${totalQuestionsForYear ? " " : ""}GATE ${yearNum} CS questions${setCount > 1 ? ` (${setCount} sets)` : ""} with solutions, subject-wise breakdown, and offline support. Free on GateQA.`;

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        path={`/gate-${yearNum}-pyq`}
        schemaOrg={[
          buildBreadcrumbSchema([
            { name: "Home", url: "https://gateqa.in/" },
            { name: "GATE PYQ", url: "https://gateqa.in/gate-pyq" },
            { name: `GATE ${yearNum}`, url: `https://gateqa.in/gate-${yearNum}-pyq` },
          ]),
          buildWebPageSchema({
            name: pageTitle,
            description: pageDescription,
            url: `https://gateqa.in/gate-${yearNum}-pyq`,
          })
        ]}
      />
      <PageShell>
        <article className="mx-auto max-w-4xl space-y-8 py-2">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
            <Link to={HOME_ROUTE} className="hover:text-sky-600 transition-colors">Home</Link>
            <FaChevronRight className="text-[8px]" />
            <Link to="/gate-pyq" className="hover:text-sky-600 transition-colors">GATE PYQ</Link>
            <FaChevronRight className="text-[8px]" />
            <span className="text-[color:var(--color-text)]">GATE {yearNum}</span>
          </nav>

          {/* Hero */}
          <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">GATE CS Paper</p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)] sm:text-4xl">
              GATE {yearNum} CS Questions
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[color:var(--color-text-muted)]">
              {pageDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={practiceUrl}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <FaBook className="text-xs" />
                Practice GATE {yearNum} Questions
              </Link>
              <Link
                to={mockUrl}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <FaClock className="text-xs" />
                Take Mock Test
              </Link>
            </div>
          </header>

          {/* Paper info */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-labelledby="paper-stats-heading">
            <h2 id="paper-stats-heading" className="sr-only">Paper Statistics</h2>
            {totalQuestionsForYear > 0 && (
              <div className="flex flex-col items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-4 text-center shadow-[var(--shadow-soft)]">
                <p className="text-2xl font-bold text-[color:var(--color-text)]">{totalQuestionsForYear}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">Total Questions</p>
              </div>
            )}
            {setCount > 0 && (
              <div className="flex flex-col items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-4 text-center shadow-[var(--shadow-soft)]">
                <p className="text-2xl font-bold text-[color:var(--color-text)]">{setCount}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">{setCount === 1 ? "Paper Set" : "Paper Sets"}</p>
              </div>
            )}
            <div className="flex flex-col items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-4 text-center shadow-[var(--shadow-soft)]">
              <p className="text-2xl font-bold text-[color:var(--color-text)]">100</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">Total Marks</p>
            </div>
          </section>

          {/* Subject-wise quick links */}
          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-card)]"
            aria-labelledby="subjects-heading"
          >
            <h2 id="subjects-heading" className="text-lg font-semibold text-[color:var(--color-text)]">
              Practice by Subject — GATE {yearNum}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Filter GATE {yearNum} questions for a specific subject.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {manifestSubjects
                .filter((s) => s.slug !== "ga" && s.slug !== "legacy-other")
                .map((s) => (
                  <SubjectCard key={s.slug} subjectEntry={s} year={yearNum} />
                ))}
            </div>
          </section>

          {/* Why practice here */}
          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-card)]"
            aria-labelledby="why-heading"
          >
            <h2 id="why-heading" className="text-lg font-semibold text-[color:var(--color-text)]">
              Why Practice GATE {yearNum} on GateQA?
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                `All GATE ${yearNum} CS questions with verified solutions`,
                "Works offline after first load — practice anywhere",
                "Track which questions you've solved",
                "GATE-accurate virtual calculator built in",
                `Mock test mode for timed GATE ${yearNum} simulation`,
                "Subject-wise and subtopic-wise filtering",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text)]">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* Navigate to adjacent years */}
          <YearNav year={yearNum} />

          {/* Browse all years */}
          <section aria-labelledby="all-years-heading">
            <h2 id="all-years-heading" className="mb-3 text-lg font-semibold text-[color:var(--color-text)]">
              Browse Other GATE Years
            </h2>
            <div className="flex flex-wrap gap-2">
              {GATE_YEARS.filter((y) => y !== yearNum).map((y) => (
                <Link
                  key={y}
                  to={`/gate-${y}-pyq`}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                >
                  GATE {y}
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-6 py-6 text-center shadow-[var(--shadow-soft)]">
            <p className="text-base font-semibold text-sky-900">
              Ready to practice GATE {yearNum} CS?
            </p>
            <p className="mt-1 text-sm text-sky-700">
              Free, offline-first, with solutions. No signup needed.
            </p>
            <Link
              to={practiceUrl}
              className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-sky-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Start Practicing Now <FaArrowRight className="text-xs" />
            </Link>
          </div>

        </article>
      </PageShell>
    </>
  );
};

export default YearLandingPage;
