import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaBook, FaCheckCircle, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildWebPageSchema } from "../components/SEO/SEOHead";
import { getSubjectByUrlSlug, SUBJECT_SEO_MAP } from "../utils/landingPages";
import { loadHighPriorityTopicsDataset } from "../utils/highPriorityTopics";
import { PRACTICE_ROUTE, HOME_ROUTE } from "../utils/routes";

/* ── Marks-over-years chart (inline, single-subject) ───────────────────── */
const MarksTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xl">
      <p className="font-black">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1">
          <span className="font-semibold">{item.name}:</span>{" "}
          <span className="font-black">{item.value} marks</span>
        </p>
      ))}
    </div>
  );
};

const MarksPointLabel = ({ x, y, value }) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return (
    <text x={x} y={y - 10} textAnchor="middle" className="fill-slate-800 text-[12px] font-black">
      {numeric}
    </text>
  );
};

const SubjectMarksChart = ({ subjectKey, subjectLabel }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadHighPriorityTopicsDataset()
      .then((dataset) => {
        if (cancelled) return;
        // officialTechnicalSubjects uses subjectSlug as key (e.g. "os", "algorithms")
        const items = dataset?.officialTechnicalSubjects ?? dataset?.technicalSubjects ?? dataset?.officialTrendItems ?? [];
        const match = items.find(
          (item) => item.key === subjectKey || item.label?.toLowerCase() === subjectLabel?.toLowerCase()
        );
        if (match?.paperSeries?.length) {
          const data = match.paperSeries.map((entry) => ({
            label: entry.shortLabel || entry.label,
            marks: Number(entry.marks || 0),
          }));
          setChartData({ data, subjectLabel: match.label });
        } else {
          setChartData(null);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [subjectKey, subjectLabel]);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] text-sm text-[color:var(--color-text-muted)]">
        Loading chart...
      </div>
    );
  }
  if (!chartData) return null;

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-center text-lg font-black text-slate-800 sm:text-2xl">
        {chartData.subjectLabel} — Marks Over Years
      </h3>
      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
        <FaInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <span>Based on official GATE CS marks tables. Each data point is the marks allocated to this subject in that paper.</span>
      </div>
      <div className="mt-4 h-[280px] w-full sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.data}
            margin={{ top: 30, right: 20, left: -10, bottom: 60 }}
          >
            <CartesianGrid stroke="#ccc" vertical={false} strokeWidth={1} />
            <XAxis
              dataKey="label"
              interval={0}
              height={64}
              tick={{ fill: "#111827", fontSize: 10, fontWeight: 700 }}
              angle={-75}
              textAnchor="end"
              label={{ value: "Years", position: "insideBottom", offset: -44, fill: "#2f2f2f", fontSize: 14, fontWeight: 800 }}
            />
            <YAxis
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              tick={{ fill: "#111827", fontSize: 12, fontWeight: 700 }}
              label={{ value: "Marks", angle: -90, position: "insideLeft", fill: "#2f2f2f", fontSize: 14, fontWeight: 800, dy: 30 }}
            />
            <RechartsTooltip content={<MarksTooltip />} />
            <Line
              type="linear"
              dataKey="marks"
              name={chartData.subjectLabel}
              stroke="#2563eb"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#2563eb", stroke: "#2563eb" }}
              activeDot={{ r: 7, stroke: "#111827", strokeWidth: 2 }}
              isAnimationActive={false}
            >
              <LabelList dataKey="marks" content={<MarksPointLabel />} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ── Stat chip ─────────────────────────────────────────────────────────── */
const StatChip = ({ label, value }) => (
  <div className="flex flex-col items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-4 text-center shadow-[var(--shadow-soft)]">
    <p className="text-2xl font-bold text-[color:var(--color-text)]">{value}</p>
    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">{label}</p>
  </div>
);

/* ── Topic pill ────────────────────────────────────────────────────────── */
const TopicPill = ({ label, subjectSlug }) => (
  <Link
    to={`${PRACTICE_ROUTE}?subjects=${encodeURIComponent(subjectSlug)}&search=${encodeURIComponent(label)}`}
    className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3.5 py-1.5 text-sm font-medium text-[color:var(--color-text)] transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
  >
    {label}
    <FaChevronRight className="text-[9px] opacity-60" />
  </Link>
);

/* ── Related subject card ──────────────────────────────────────────────── */
const RelatedCard = ({ subject }) => (
  <Link
    to={`/subjects/${subject.urlSlug}`}
    className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 shadow-[var(--shadow-soft)] transition hover:border-sky-400 hover:shadow-md"
  >
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[color:var(--color-text)] group-hover:text-sky-600 transition-colors">{subject.label}</p>
    </div>
    <FaArrowRight className="shrink-0 text-xs text-[color:var(--color-text-muted)] group-hover:text-sky-600 transition-colors" />
  </Link>
);

/* ── Main page ─────────────────────────────────────────────────────────── */
const SubjectLandingPage = ({ questionBankManifest }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const subject = useMemo(() => getSubjectByUrlSlug(slug), [slug]);


  // Redirect unknown slugs to home
  if (!subject) {
    navigate(HOME_ROUTE, { replace: true });
    return null;
  }

  // Pull question count from the manifest if available, otherwise fall back to static map
  const manifestSubject = questionBankManifest?.subjects?.find(
    (s) => s.slug === subject.subjectSlug
  );
  const questionCount = manifestSubject?.count ?? null;

  // Year range from manifest
  const yearSets = questionBankManifest?.yearSets ?? [];
  const years = [...new Set(yearSets.map((y) => y.year))].sort((a, b) => a - b);
  const minYear = years[0] ?? 1987;
  const maxYear = years[years.length - 1] ?? 2026;

  const relatedSubjects = subject.relatedSlugs
    .map((relSlug) => SUBJECT_SEO_MAP.find((s) => s.urlSlug === relSlug))
    .filter(Boolean);

  const practiceUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(subject.subjectSlug)}`;

  return (
    <>
      <SEOHead
        title={`${subject.label} GATE CS Questions | Year-wise PYQs`}
        description={`Practice ${questionCount} GATE Computer Science questions from ${subject.label} (${minYear}–${maxYear}). Free offline practice with solutions.`}
        path={`/subjects/${encodeURIComponent(slug)}`}
        schemaOrg={[
          buildBreadcrumbSchema([
            { name: "Home", url: "https://gateqa.in/" },
            { name: "Subjects", url: "https://gateqa.in/subjects" },
            { name: subject.label, url: `https://gateqa.in/subjects/${encodeURIComponent(slug)}` },
          ]),
          buildWebPageSchema({
            name: `${subject.label} GATE CS Questions`,
            description: `Practice ${questionCount} GATE Computer Science questions from ${subject.label} (${minYear}–${maxYear}).`,
            url: `https://gateqa.in/subjects/${encodeURIComponent(slug)}`,
          })
        ]}
      />
      <PageShell>
        <article className="mx-auto max-w-4xl space-y-8 py-2">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
            <Link to={HOME_ROUTE} className="hover:text-sky-600 transition-colors">Home</Link>
            <FaChevronRight className="text-[8px]" />
            <span className="text-[color:var(--color-text)]">{subject.label}</span>
          </nav>

          {/* Hero */}
          <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">GATE CS Subject</p>
            <h1 className="text-3xl font-bold text-[color:var(--color-text)] sm:text-4xl">
              {subject.label}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[color:var(--color-text-muted)]">
              {subject.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={practiceUrl}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <FaBook className="text-xs" />
                Practice {subject.label} Questions
              </Link>
              <Link
                to={`${PRACTICE_ROUTE}?subjects=${encodeURIComponent(subject.subjectSlug)}&hideSolved=1`}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                Unsolved Only
              </Link>
            </div>
          </header>

          {/* Stats */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Question Statistics</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {questionCount !== null && (
                <StatChip label="Total Questions" value={questionCount} />
              )}
              <StatChip label="Years Covered" value={`${minYear}–${maxYear}`} />
              <StatChip label="Platform" value="Free & Offline" />
            </div>
          </section>

          {/* Marks Over Years Chart */}
          <section aria-labelledby="marks-chart-heading">
            <h2 id="marks-chart-heading" className="sr-only">Marks Over Years</h2>
            <SubjectMarksChart
              subjectKey={subject.subjectSlug}
              subjectLabel={subject.label}
            />
          </section>

          {/* Topics */}
          {subject.topics?.length > 0 && (
            <section
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-card)]"
              aria-labelledby="topics-heading"
            >
              <h2 id="topics-heading" className="text-lg font-semibold text-[color:var(--color-text)]">
                Key Topics in {subject.label}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
                Click any topic to search for questions in that area.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {subject.topics.map((topic) => (
                  <TopicPill key={topic} label={topic} subjectSlug={subject.subjectSlug} />
                ))}
              </div>
            </section>
          )}

          {/* Year-wise quick links */}
          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-card)]"
            aria-labelledby="years-heading"
          >
            <h2 id="years-heading" className="text-lg font-semibold text-[color:var(--color-text)]">
              Practice by Year
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              Filter {subject.label} questions from a specific GATE paper.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((year) => (
                <Link
                  key={year}
                  to={`${PRACTICE_ROUTE}?subjects=${encodeURIComponent(subject.subjectSlug)}&years=${year}`}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                >
                  GATE {year}
                </Link>
              ))}
            </div>
          </section>

          {/* Why practice here */}
          <section
            className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-card)]"
            aria-labelledby="features-heading"
          >
            <h2 id="features-heading" className="text-lg font-semibold text-[color:var(--color-text)]">
              Why Practice on GateQA?
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                "All questions from official GATE CS papers (1987–2026)",
                "Detailed solutions and answer explanations",
                "Track your solved/unsolved progress locally",
                "Works offline — no internet needed after first load",
                "GATE-accurate virtual calculator built in",
                "Mock test mode with timed full-paper simulations",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-[color:var(--color-text)]">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {/* Related subjects */}
          {relatedSubjects.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="mb-3 text-lg font-semibold text-[color:var(--color-text)]">
                Related Subjects
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {relatedSubjects.map((rel) => (
                  <RelatedCard key={rel.urlSlug} subject={rel} />
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-6 py-6 text-center shadow-[var(--shadow-soft)]">
            <p className="text-base font-semibold text-sky-900">
              Ready to start practicing {subject.label}?
            </p>
            <p className="mt-1 text-sm text-sky-700">
              {questionCount ? `${questionCount} questions` : "Hundreds of questions"} from 1987–2026, completely free.
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

export default SubjectLandingPage;
