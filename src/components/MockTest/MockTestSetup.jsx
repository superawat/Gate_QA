import React from "react";
import { getMockPaperYearSetIdentity } from "../../services/MockCatalogService";
import { TOPIC_HIERARCHY } from "../../services/question-service/SubjectTaxonomy";
import { normalizeMockSubjectKey } from "../../utils/mockTest";
import { getSubjectHierarchy } from "../../utils/mockTaxonomyHierarchy";
import { getBranchSubjects, normalizeBranchId, getTrackForSubjectSlug } from "../../utils/branchPreference";
import {
    FaBolt,
    FaCheckCircle,
    FaFileAlt,
    FaSlidersH,
} from "react-icons/fa";

const slugifyToken = (value = "") => (
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
);

const getSubtopicsForSubject = (subject, rawStructuredSubtopics = {}) => {
    const slug = subject?.slug || "";
    const canonicalSlug = normalizeMockSubjectKey(slug);
    const label = subject?.label || "";

    let list = rawStructuredSubtopics[slug];
    if (!Array.isArray(list) || list.length === 0) {
        list = rawStructuredSubtopics[canonicalSlug];
    }
    if (!Array.isArray(list) || list.length === 0) {
        const matchingKey = Object.keys(rawStructuredSubtopics).find(
            (k) => normalizeMockSubjectKey(k) === canonicalSlug
        );
        if (matchingKey) list = rawStructuredSubtopics[matchingKey];
    }
    if ((!Array.isArray(list) || list.length === 0) && label && TOPIC_HIERARCHY && TOPIC_HIERARCHY[label]) {
        list = TOPIC_HIERARCHY[label].map((topicName) => ({
            slug: slugifyToken(topicName),
            label: topicName,
        }));
    }

    return (Array.isArray(list) ? list : [])
        .slice()
        .sort((a, b) => String(a?.label || a?.slug || "").localeCompare(String(b?.label || b?.slug || "")));
};

const TYPE_OPTIONS = ["MCQ", "MSQ", "NAT"];
const COUNT_PRESETS = [15, 25, 65];
const APTITUDE_SUBJECT_SLUGS = new Set(["english", "quant", "mathematics", "reasoning", "general-aptitude", "ga"]);
const LEGACY_SUBJECT_SLUG = "legacy-other";

const YEAR_SCOPE_OPTIONS = [
    { id: "all", label: "All years" },
    { id: "recent", label: "Recent years" },
    { id: "custom", label: "Custom range" },
];

const KIND_META = {
    paper_mode: {
        icon: FaFileAlt,
        accent: "sky",
        title: "Past Paper",
        description: "",
        note: "",
    },
    custom: {
        icon: FaSlidersH,
        accent: "purple",
        title: "Custom Builder",
        description: "",
        note: "",
    },
};

const BRANCH_CONFIG = {
    cse: {
        id: "cse",
        label: "Computer Science / CSE",
        shortLabel: "GATE CSE",
        badgeTrack: "GATE CSE",
        accentTone: "sky",
        borderClass: "border-sky-200",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        activePillClass: "bg-sky-700 text-white shadow-sm",
        btnSelectedClass: "border-sky-300 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] shadow-[var(--shadow-soft)] ring-2 ring-sky-100",
        switchColor: "peer-checked:bg-sky-600 peer-focus-visible:ring-sky-500",
    },
    da: {
        id: "da",
        label: "Data Science and AI",
        shortLabel: "GATE DA",
        badgeTrack: "GATE DA",
        accentTone: "indigo",
        borderClass: "border-indigo-200",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        activePillClass: "bg-indigo-700 text-white shadow-sm",
        btnSelectedClass: "border-indigo-400 bg-[linear-gradient(180deg,#ffffff_0%,#eef2ff_100%)] shadow-[var(--shadow-soft)] ring-2 ring-indigo-100",
        switchColor: "peer-checked:bg-indigo-600 peer-focus-visible:ring-indigo-500",
    },
    ec: {
        id: "ec",
        label: "Electronics & Communication (EC)",
        shortLabel: "GATE EC",
        badgeTrack: "GATE EC",
        accentTone: "purple",
        borderClass: "border-purple-200",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        activePillClass: "bg-purple-700 text-white shadow-sm",
        btnSelectedClass: "border-purple-300 bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)] shadow-[var(--shadow-soft)] ring-2 ring-purple-100",
        switchColor: "peer-checked:bg-purple-600 peer-focus-visible:ring-purple-500",
    },
    ee: {
        id: "ee",
        label: "Electrical Engineering (EE)",
        shortLabel: "GATE EE",
        badgeTrack: "GATE EE",
        accentTone: "amber",
        borderClass: "border-amber-200",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        activePillClass: "bg-amber-700 text-white shadow-sm",
        btnSelectedClass: "border-amber-300 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] shadow-[var(--shadow-soft)] ring-2 ring-amber-100",
        switchColor: "peer-checked:bg-amber-600 peer-focus-visible:ring-amber-500",
    },
    me: {
        id: "me",
        label: "Mechanical Engineering (ME)",
        shortLabel: "GATE ME",
        badgeTrack: "GATE ME",
        accentTone: "rose",
        borderClass: "border-rose-200",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        activePillClass: "bg-rose-700 text-white shadow-sm",
        btnSelectedClass: "border-rose-300 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] shadow-[var(--shadow-soft)] ring-2 ring-rose-100",
        switchColor: "peer-checked:bg-rose-600 peer-focus-visible:ring-rose-500",
    },
    ce: {
        id: "ce",
        label: "Civil Engineering (CE)",
        shortLabel: "GATE CE",
        badgeTrack: "GATE CE",
        accentTone: "emerald",
        borderClass: "border-emerald-200",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        activePillClass: "bg-emerald-700 text-white shadow-sm",
        btnSelectedClass: "border-emerald-300 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] shadow-[var(--shadow-soft)] ring-2 ring-emerald-100",
        switchColor: "peer-checked:bg-emerald-600 peer-focus-visible:ring-emerald-500",
    },
};

const joinClasses = (...tokens) => tokens.filter(Boolean).join(" ");

const ACCENT_CLASSES = {
    emerald: {
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        chip: "border-emerald-300 bg-emerald-50 text-emerald-800",
        panel: "border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)]",
        icon: "bg-emerald-100 text-emerald-700",
        button: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    sky: {
        badge: "bg-sky-50 text-sky-700 border border-sky-200",
        chip: "border-sky-300 bg-sky-50 text-sky-800",
        panel: "border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]",
        icon: "bg-sky-100 text-sky-700",
        button: "bg-sky-700 text-white hover:bg-sky-800",
    },
    purple: {
        badge: "bg-purple-50 text-purple-700 border border-purple-200",
        chip: "border-purple-300 bg-purple-50 text-purple-800",
        panel: "border-purple-200 bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]",
        icon: "bg-purple-100 text-purple-700 border border-purple-200/60",
        button: "bg-purple-600 text-white hover:bg-purple-700",
    },
    amber: {
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        chip: "border-amber-300 bg-amber-50 text-amber-800",
        panel: "border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)]",
        icon: "bg-amber-100 text-amber-700",
        button: "bg-slate-900 text-white hover:bg-slate-800",
    },
};

const SummaryStat = ({ label, value }) => (
    <div className="mocktest-stat-tile rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
        <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm sm:text-base font-semibold text-slate-950 tabular-nums truncate" title={typeof value === "string" ? value : undefined}>
            {value}
        </div>
    </div>
);

const FILTER_CHIP_TONE_CLASSES = {
    slate: "border-slate-400 bg-slate-100 text-slate-900 ring-2 ring-slate-200",
    sky: "border-sky-400 bg-sky-100 text-sky-900 ring-2 ring-sky-100",
    emerald: "border-emerald-400 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-100",
    violet: "border-purple-400 bg-purple-100 text-purple-900 ring-2 ring-purple-100",
    purple: "border-purple-400 bg-purple-100 text-purple-900 ring-2 ring-purple-100",
};

const FilterChip = ({
    active = false,
    children,
    onClick,
    tone = "slate",
    ...rest
}) => {
    const toneClass = FILTER_CHIP_TONE_CLASSES[tone] || FILTER_CHIP_TONE_CLASSES.slate;
    const focusRing = (tone === "purple" || tone === "violet")
        ? "focus:ring-purple-500/30"
        : tone === "emerald"
            ? "focus:ring-emerald-500/30"
            : "focus:ring-sky-500/30";

    return (
        <button
            type="button"
            onClick={onClick}
            className={joinClasses(
                "mocktest-filter-chip border px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold transition focus:outline-none focus:ring-2",
                focusRing,
                active
                    ? toneClass
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
            {...rest}
        >
            {children}
        </button>
    );
};

const ToggleSwitch = ({
    id,
    checked,
    onChange,
    label,
    activeColor = "peer-checked:bg-sky-600 peer-focus-visible:ring-sky-500",
    testId,
}) => (
    <label
        htmlFor={id}
        data-testid={testId || `${id}-switch`}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center select-none"
    >
        <input
            id={id}
            data-testid={id}
            type="checkbox"
            checked={Boolean(checked)}
            onChange={(e) => {
                onChange?.(e.target.checked);
            }}
            className="peer sr-only"
            aria-label={label}
        />
        <span
            className={`h-6 w-11 rounded-full bg-slate-300 transition-colors duration-200 ${activeColor} peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2`}
        />
        <span
            className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"
        />
    </label>
);

const PreviewCard = ({ livePreview }) => {
    if (!livePreview) {
        return null;
    }

    return (
        <div className="mocktest-preview-card rounded-[var(--radius-card)] border border-slate-200 bg-slate-50/80 p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="font-display text-base font-normal text-slate-950">Available pool</h4>
                    <p className="mt-0.5 text-xs text-slate-600">The questions currently eligible for this attempt.</p>
                </div>
                <div className="mocktest-mini-total bg-white px-2.5 py-1 text-right shadow-[var(--shadow-soft)]">
                    <div className="text-xl sm:text-2xl font-semibold text-slate-950 tabular-nums" data-testid="preview-total">{livePreview.total}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</div>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <SummaryStat label="GA" value={<span data-testid="preview-ga">{livePreview.gaCount}</span>} />
                <SummaryStat label="Technical" value={<span data-testid="preview-cs">{livePreview.csCount}</span>} />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold text-slate-700">
                <span className="mocktest-inline-fact bg-white px-2.5 py-1 shadow-[var(--shadow-soft)] tabular-nums">
                    <span data-testid="preview-mcq">{livePreview.mcqCount}</span> MCQ
                </span>
                <span className="mocktest-inline-fact bg-white px-2.5 py-1 shadow-[var(--shadow-soft)] tabular-nums">
                    <span data-testid="preview-msq">{livePreview.msqCount}</span> MSQ
                </span>
                <span className="mocktest-inline-fact bg-white px-2.5 py-1 shadow-[var(--shadow-soft)] tabular-nums">
                    <span data-testid="preview-nat">{livePreview.natCount}</span> NAT
                </span>
            </div>
        </div>
    );
};

const SubjectHierarchyCard = ({
    subject,
    structuredSubtopics,
    selectedSubjectSet,
    selectedSubtopicSet,
    expandedSubjectSlugs,
    expandedSubjectSlug,
    expandedTopicIds,
    onSubjectToggle,
    onToggleSubjectExpansion,
    onToggleTopicExpansion,
    onTopicToggle,
    onSubtopicToggle,
    onSubjectBulkToggle,
    tone = "sky",
}) => {
    const subjectSlug = subject.slug;
    const isSubjectSelected = selectedSubjectSet.has(subjectSlug);
    const topics = React.useMemo(
        () => getSubjectHierarchy(subject, structuredSubtopics),
        [subject, structuredSubtopics]
    );
    const hasTopics = topics.length > 0;
    const isExpanded = expandedSubjectSlugs.has(subjectSlug) || expandedSubjectSlug === subjectSlug;
    const showTopics = hasTopics && isExpanded;

    const allSubjectSubtopicSlugs = React.useMemo(
        () => topics.flatMap((tp) => tp.subtopics.map((st) => st.slug)).filter(Boolean),
        [topics]
    );
    const selectedSubtopicsCount = allSubjectSubtopicSlugs.filter((s) => selectedSubtopicSet.has(s)).length;
    const allSubtopicsSelected = showTopics && allSubjectSubtopicSlugs.length > 0 && allSubjectSubtopicSlugs.every((s) => selectedSubtopicSet.has(s));

    const styles = {
        sky: {
            cardBorder: isSubjectSelected ? "border-sky-300 ring-1 ring-sky-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-sky-600 focus:ring-sky-500",
            topicBox: "border-sky-100/80 bg-sky-50/40",
            topicLine: "border-sky-300",
            btnActive: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100",
            badge: "bg-sky-100 text-sky-800",
        },
        indigo: {
            cardBorder: isSubjectSelected ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-indigo-600 focus:ring-indigo-500",
            topicBox: "border-indigo-100/80 bg-indigo-50/40",
            topicLine: "border-indigo-300",
            btnActive: "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
            badge: "bg-indigo-100 text-indigo-800",
        },
        purple: {
            cardBorder: isSubjectSelected ? "border-purple-300 ring-1 ring-purple-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-purple-600 focus:ring-purple-500",
            topicBox: "border-purple-100/80 bg-purple-50/40",
            topicLine: "border-purple-300",
            btnActive: "border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100",
            badge: "bg-purple-100 text-purple-800",
        },
        amber: {
            cardBorder: isSubjectSelected ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-amber-600 focus:ring-amber-500",
            topicBox: "border-amber-100/80 bg-amber-50/40",
            topicLine: "border-amber-300",
            btnActive: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
            badge: "bg-amber-100 text-amber-800",
        },
        rose: {
            cardBorder: isSubjectSelected ? "border-rose-300 ring-1 ring-rose-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-rose-600 focus:ring-rose-500",
            topicBox: "border-rose-100/80 bg-rose-50/40",
            topicLine: "border-rose-300",
            btnActive: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
            badge: "bg-rose-100 text-rose-800",
        },
        emerald: {
            cardBorder: isSubjectSelected ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200/70",
            cardBg: isSubjectSelected ? "bg-white shadow-xs" : "bg-white/70",
            checkbox: "text-emerald-600 focus:ring-emerald-500",
            topicBox: "border-emerald-100/80 bg-emerald-50/40",
            topicLine: "border-emerald-300",
            btnActive: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
            badge: "bg-emerald-100 text-emerald-800",
        },
    }[tone] || styles.sky;

    return (
        <div className={`flex min-w-0 flex-col rounded-lg border ${styles.cardBorder} ${styles.cardBg} p-2.5 transition-colors`}>
            {/* Level 1: Subject Header */}
            <div className="flex items-center justify-between gap-2">
                <label className="flex min-w-0 cursor-pointer items-center gap-2.5 select-none">
                    <input
                        type="checkbox"
                        className={`h-4 w-4 rounded border-gray-300 ${styles.checkbox}`}
                        checked={isSubjectSelected}
                        onChange={() => onSubjectToggle(subjectSlug)}
                    />
                    <span className={`truncate text-sm ${isSubjectSelected ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                        {subject.label}
                    </span>
                    {selectedSubtopicsCount > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${styles.badge}`}>
                            {selectedSubtopicsCount} selected
                        </span>
                    )}
                </label>

                <div className="flex shrink-0 items-center gap-1.5">
                    {hasTopics && (
                        <button
                            type="button"
                            onClick={() => onToggleSubjectExpansion(subjectSlug)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                                isExpanded
                                    ? "border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                            aria-label={isExpanded ? `Hide ${subject.label} topics` : `Show ${subject.label} topics`}
                        >
                            {isExpanded ? "Hide" : `Topics (${topics.length})`}
                        </button>
                    )}
                    {showTopics && allSubjectSubtopicSlugs.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onSubjectBulkToggle(subjectSlug, allSubjectSubtopicSlugs)}
                            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${styles.btnActive}`}
                            aria-label={allSubtopicsSelected ? `Clear all ${subject.label} subtopics` : `Select all ${subject.label} subtopics`}
                        >
                            {allSubtopicsSelected ? "Clear All" : "Select All"}
                        </button>
                    )}
                </div>
            </div>

            {/* Level 2: Topics List (when subject is expanded) */}
            {showTopics && (
                <div className="mt-2.5 space-y-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between px-0.5 text-[11px] text-slate-500 font-medium">
                        <span className="tabular-nums">Topics ({topics.length}) &bull; {allSubjectSubtopicSlugs.length} Subtopics</span>
                        {topics.length > 1 && (
                            <button
                                type="button"
                                onClick={() => {
                                    const allTopicsExpanded = topics.every((tp) => expandedTopicIds.has(tp.id));
                                    topics.forEach((tp) => {
                                        if (allTopicsExpanded && expandedTopicIds.has(tp.id)) {
                                            onToggleTopicExpansion(tp.id);
                                        } else if (!allTopicsExpanded && !expandedTopicIds.has(tp.id)) {
                                            onToggleTopicExpansion(tp.id);
                                        }
                                    });
                                }}
                                className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 underline"
                            >
                                {topics.every((tp) => expandedTopicIds.has(tp.id)) ? "Collapse all" : "Expand all"}
                            </button>
                        )}
                    </div>
                    {topics.map((topic) => {
                        const topicSubtopicSlugs = topic.subtopics.map((st) => st.slug).filter(Boolean);
                        const hasSubtopics = topicSubtopicSlugs.length > 0;
                        const isTopicExpanded = expandedTopicIds.has(topic.id);
                        const selectedInTopic = topicSubtopicSlugs.filter((s) => selectedSubtopicSet.has(s)).length;
                        const isTopicAllSelected = hasSubtopics && selectedInTopic === topicSubtopicSlugs.length;
                        const isTopicPartial = selectedInTopic > 0 && !isTopicAllSelected;

                        return (
                            <div
                                key={topic.id}
                                className={`rounded-md border p-2 text-xs transition-colors ${styles.topicBox}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <label className="flex min-w-0 cursor-pointer items-center gap-2 select-none">
                                        <input
                                            type="checkbox"
                                            ref={(el) => {
                                                if (el) el.indeterminate = isTopicPartial;
                                            }}
                                            className={`h-3.5 w-3.5 rounded border-gray-300 ${styles.checkbox}`}
                                            checked={isTopicAllSelected}
                                            onChange={() => onTopicToggle(subjectSlug, topic)}
                                        />
                                        <span className={`truncate font-medium ${isTopicAllSelected || isTopicPartial ? "text-slate-900 font-semibold" : "text-slate-700"}`}>
                                            {topic.label}
                                        </span>
                                        {hasSubtopics && (
                                            <span className="text-[10px] text-slate-500 tabular-nums">
                                                ({selectedInTopic > 0 ? `${selectedInTopic}/${topic.subtopics.length}` : `${topic.subtopics.length}`})
                                            </span>
                                        )}
                                    </label>

                                    {hasSubtopics && (
                                        <button
                                            type="button"
                                            onClick={() => onToggleTopicExpansion(topic.id)}
                                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                                            aria-label={isTopicExpanded ? `Hide ${topic.label} subtopics` : `Show ${topic.label} subtopics`}
                                        >
                                            {isTopicExpanded ? "Hide" : `Subtopics (${topic.subtopics.length})`}
                                        </button>
                                    )}
                                </div>

                                {/* Level 3: Subtopics (when topic is expanded) */}
                                {isTopicExpanded && hasSubtopics && (
                                    <div className={`ml-5 mt-2 max-h-40 space-y-1 overflow-y-auto border-l-2 ${styles.topicLine} pl-2.5 pr-1`}>
                                        {topic.subtopics.map((subtopic) => {
                                            const isSubSelected = selectedSubtopicSet.has(subtopic.slug);
                                            return (
                                                <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5 select-none">
                                                    <input
                                                        type="checkbox"
                                                        className={`h-3 w-3 rounded border-gray-300 ${styles.checkbox}`}
                                                        checked={isSubSelected}
                                                        onChange={() => onSubtopicToggle(subtopic.slug, subjectSlug)}
                                                    />
                                                    <span className="ml-2 truncate text-xs text-slate-600 group-hover/sub:text-slate-900" title={subtopic.label}>
                                                        {subtopic.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const MockTestSetup = ({
    kind,
    setupState,
    subjects = [],
    structuredSubtopics = {},
    availability,
    livePreview,
    paperOptions = [],
    selectedBranches = null,
    selectedPaperYearSetKey = "",
    customDurationMinutes = 180,
    recentYearRangeLabel = "",
    bookmarkedCount = 0,
    onSelectPaper,
    onBack,
    onReset,
    onStart,
    onPatchState,
    onToggleSelection,
    onToggleTrack,
    onToggleGeneralAptitude,
    onBulkToggleTrackSubjects,
    onToggleSubtopic,
    onSetExpandedSubject,
    onBulkToggleSubtopics,
    backLabel = "Back",
    showBackButton = true,
    isStarting = false,
}) => {
    const canStart = Boolean(availability?.canStart);
    const availableSummary = availability?.availableSummary || "0";
    const validationMessage = availability?.message || "";

    const kindMeta = KIND_META[kind.id] || KIND_META.custom;
    const accent = ACCENT_CLASSES[kindMeta.accent] || ACCENT_CLASSES.amber;
    const Icon = kindMeta.icon || FaSlidersH;
    const isPaperMode = kind.id === "paper_mode";
    const isCustom = kind.id === "custom";
    const derivedSubjectBranches = (Array.isArray(subjects) && subjects.length > 0)
        ? Array.from(new Set(subjects.map(s => getTrackForSubjectSlug(s.slug)).filter(t => t !== "aptitude").map(t => t === "cs" ? "cse" : t)))
        : [];
    const effectiveBranches = (Array.isArray(selectedBranches) && selectedBranches.length > 0)
        ? selectedBranches.map(normalizeBranchId)
        : (derivedSubjectBranches.length > 0 ? derivedSubjectBranches : ["cse"]);
    const enabledTracks = Array.isArray(setupState.enabledTracks) ? setupState.enabledTracks : ["cse"];
    const includeGeneralAptitude = setupState.includeGeneralAptitude !== false;
    const [paperTrackFilter, setPaperTrackFilter] = React.useState("all");
    const showSolvedQuestionToggle = !isPaperMode;
    const selectedPaper = paperOptions.find((paper) => getMockPaperYearSetIdentity(paper) === selectedPaperYearSetKey) || null;
    const selectedSubjectSet = new Set(setupState.selectedSubjects || []);
    const selectedSubtopicSet = new Set(setupState.selectedSubtopics || []);
    const selectedTypeSet = new Set(setupState.selectedTypes || []);
    const [expandedSubjectSlugs, setExpandedSubjectSlugs] = React.useState(() => {
        const initial = new Set();
        if (setupState.expandedSubjectSlug) {
            initial.add(setupState.expandedSubjectSlug);
        }
        return initial;
    });

    const [expandedTopicIds, setExpandedTopicIds] = React.useState(() => new Set());

    const toggleTopicExpansion = (topicId) => {
        setExpandedTopicIds((prev) => {
            const next = new Set(prev);
            if (next.has(topicId)) {
                next.delete(topicId);
            } else {
                next.add(topicId);
            }
            return next;
        });
    };

    const handleTopicToggle = (subjectSlug, topic) => {
        const topicSubtopicSlugs = (topic?.subtopics || []).map((st) => st.slug).filter(Boolean);
        if (topicSubtopicSlugs.length === 0) return;
        const allSelected = topicSubtopicSlugs.every((s) => selectedSubtopicSet.has(s));
        if (!allSelected && !selectedSubjectSet.has(subjectSlug)) {
            onToggleSelection("selectedSubjects", subjectSlug);
        }
        onBulkToggleSubtopics(subjectSlug, topicSubtopicSlugs);
    };

    React.useEffect(() => {
        if (setupState.expandedSubjectSlug) {
            setExpandedSubjectSlugs((prev) => new Set([...prev, setupState.expandedSubjectSlug]));
        }
    }, [setupState.expandedSubjectSlug]);

    React.useEffect(() => {
        if ((setupState.selectedSubjects || []).length === 0) {
            return;
        }
        setExpandedSubjectSlugs((prev) => {
            let changed = false;
            const next = new Set(prev);
            (setupState.selectedSubjects || []).forEach((subjectSlug) => {
                const hierarchy = getSubjectHierarchy({ slug: subjectSlug, label: "" }, structuredSubtopics);
                const subtopics = hierarchy.flatMap((tp) => tp.subtopics);
                const hasActiveSubtopic = subtopics.some((st) => selectedSubtopicSet.has(st.slug));
                if (hasActiveSubtopic && !next.has(subjectSlug)) {
                    next.add(subjectSlug);
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [setupState.selectedSubjects, setupState.selectedSubtopics, structuredSubtopics]);

    React.useEffect(() => {
        if ((setupState.selectedSubtopics || []).length === 0) {
            return;
        }
        setExpandedTopicIds((prev) => {
            let changed = false;
            const next = new Set(prev);
            (setupState.selectedSubjects || []).forEach((subjectSlug) => {
                const hierarchy = getSubjectHierarchy({ slug: subjectSlug, label: "" }, structuredSubtopics);
                hierarchy.forEach((topic) => {
                    const hasActiveSubtopic = (topic.subtopics || []).some((st) => selectedSubtopicSet.has(st.slug));
                    if (hasActiveSubtopic && !next.has(topic.id)) {
                        next.add(topic.id);
                        changed = true;
                    }
                });
            });
            return changed ? next : prev;
        });
    }, [setupState.selectedSubjects, setupState.selectedSubtopics, structuredSubtopics]);

    const handleSubjectToggle = (subjectSlug) => {
        const isCurrentlySelected = selectedSubjectSet.has(subjectSlug);
        if (!isCurrentlySelected) {
            setExpandedSubjectSlugs((prev) => new Set([...prev, subjectSlug]));
        } else {
            setExpandedSubjectSlugs((prev) => {
                const next = new Set(prev);
                next.delete(subjectSlug);
                return next;
            });
        }
        if (onSetExpandedSubject) {
            onSetExpandedSubject(!isCurrentlySelected ? subjectSlug : null);
        }
        onToggleSelection("selectedSubjects", subjectSlug);
    };

    const toggleSubjectExpansion = (subjectSlug) => {
        setExpandedSubjectSlugs((prev) => {
            const next = new Set(prev);
            if (next.has(subjectSlug)) {
                next.delete(subjectSlug);
            } else {
                next.add(subjectSlug);
            }
            return next;
        });
        if (onSetExpandedSubject) {
            onSetExpandedSubject(expandedSubjectSlugs.has(subjectSlug) ? null : subjectSlug);
        }
    };

    const handleSubtopicToggle = (subtopicSlug, subjectSlug) => {
        if (!selectedSubtopicSet.has(subtopicSlug) && !selectedSubjectSet.has(subjectSlug)) {
            onToggleSelection("selectedSubjects", subjectSlug);
        }
        onToggleSubtopic(subtopicSlug, subjectSlug);
    };

    const handleSubjectBulkToggle = (subjectSlug, subjectSubtopicSlugs = []) => {
        const allSelected = subjectSubtopicSlugs.length > 0 && subjectSubtopicSlugs.every((s) => selectedSubtopicSet.has(s));
        if (!allSelected && !selectedSubjectSet.has(subjectSlug)) {
            onToggleSelection("selectedSubjects", subjectSlug);
        }
        onBulkToggleSubtopics(subjectSlug, subjectSubtopicSlugs);
    };

    const aptitudeSubjects = subjects.filter((s) => APTITUDE_SUBJECT_SLUGS.has(s.slug));
    const legacySubjects = subjects.filter((s) => s.slug === LEGACY_SUBJECT_SLUG);

    const selectedSpecialAptCount = ["english", "quant", "reasoning"].filter((slug) => selectedSubjectSet.has(slug)).length;
    const selectedEngineeringCount = (subjects || [])
        .filter((s) => !APTITUDE_SUBJECT_SLUGS.has(s.slug) && s.slug !== LEGACY_SUBJECT_SLUG)
        .filter((s) => selectedSubjectSet.has(s.slug)).length;
    const isBroadMix = selectedEngineeringCount === 0 && selectedSpecialAptCount === 0 && (selectedSubjectSet.has("ga") || selectedSubjectSet.has("general-aptitude") || selectedSubjectSet.size === 0);

    const selectedPaperDuration = Number.parseInt(String(selectedPaper?.durationMinutes ?? ""), 10);
    const selectedPaperRequiredCount = Number.parseInt(String(selectedPaper?.requiredQuestionCount ?? ""), 10);
    const selectedPaperRequiredGa = Number.parseInt(String(selectedPaper?.requiredGaCount ?? selectedPaper?.gaCount ?? 0), 10);
    const selectedPaperRequiredCs = Number.parseInt(String(selectedPaper?.requiredCsCount ?? selectedPaper?.csCount ?? 0), 10);
    const isManualDuration = isCustom && setupState.customDurationMode === "manual";
    const customMinutesValue = Number(setupState.customDurationMinutes);
    const hasValidManualDuration = Number.isFinite(customMinutesValue) && customMinutesValue >= 1;
    const durationLabel = isCustom
        ? (isManualDuration
            ? (hasValidManualDuration ? `${customMinutesValue} min` : "Invalid (< 1 min)")
            : `${customDurationMinutes} min`)
        : (isPaperMode && Number.isFinite(selectedPaperDuration) && selectedPaperDuration > 0
            ? `${selectedPaperDuration} min`
            : (kind.durationLabel || "180 min"));
    const requestedCount = isCustom
        ? `${setupState.customCount} Questions`
        : (isPaperMode
            ? `${Number.isFinite(selectedPaperRequiredCount) && selectedPaperRequiredCount > 0 ? selectedPaperRequiredCount : 65} Questions`
            : "65 Questions");
    const poolTotalLabel = livePreview?.total ? `${livePreview.total} Questions` : "0 Questions";
    const selectedSubtopicCount = (setupState.selectedSubtopics || []).length;
    const selectedPaperTrack = selectedPaper ? normalizeBranchId(selectedPaper.track || "cse") : "cse";
    const selectedPaperConfig = BRANCH_CONFIG[selectedPaperTrack] || BRANCH_CONFIG.cse;
    const selectedPaperTrackShort = selectedPaper?.track === "it" ? "IT" : selectedPaperConfig.shortLabel.replace("GATE ", "");
    const summaryNote = isPaperMode
        ? (
            selectedPaper
                ? (
                    selectedPaper.paperReady
                        ? `${Number.isFinite(selectedPaperRequiredGa) ? selectedPaperRequiredGa : selectedPaper.gaCount} GA and ${Number.isFinite(selectedPaperRequiredCs) ? selectedPaperRequiredCs : selectedPaper.csCount} ${selectedPaperTrackShort} questions in paper order.`
                        : (selectedPaper.statusReason || "This paper is not release-ready yet.")
                )
                : "Select a paper to continue."
        )
        : isCustom
            ? (selectedSubtopicCount > 0
                ? `Will sample from ${selectedSubtopicCount} subtopic${selectedSubtopicCount === 1 ? "" : "s"} in the filtered pool when you start.`
                : `Questions are balanced across your chosen subjects, with each question chosen uniformly at random within its subject.`)
            : "";
    const yearScopeLabel = setupState.yearFilterMode === "recent"
        ? `Recent years (${recentYearRangeLabel || "last 10 years"})`
        : setupState.yearFilterMode === "custom"
            ? `${setupState.yearRangeStart} - ${setupState.yearRangeEnd}`
            : `All years (${setupState.minYear} - ${setupState.maxYear})`;
    const showReset = Boolean(onReset) && (isCustom || isPaperMode);

    const renderOverviewPanel = () => (
        kindMeta.description || kindMeta.note ? (
        <div className={joinClasses("rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)]", accent.panel)}>
            <div className="flex items-start gap-4">
                <span className={joinClasses("mocktest-icon-box inline-flex h-12 w-12 shrink-0 items-center justify-center", accent.icon)}>
                    <Icon />
                </span>
                <div>
                    <span className={joinClasses("mocktest-pill inline-flex px-2.5 py-1 text-[11px] font-semibold uppercase", accent.badge)}>
                        {kindMeta.title}
                    </span>
                    {kindMeta.description ? (
                        <h3 className="mt-3 font-display text-xl font-normal text-slate-950">{kindMeta.description}</h3>
                    ) : null}
                    {kindMeta.note ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{kindMeta.note}</p>
                    ) : null}
                </div>
            </div>
        </div>
        ) : null
    );

    const renderPaperModeContent = () => {
        const displayedPapers = paperOptions.filter((paper) => {
            if (paperTrackFilter === "all") return true;
            const rawTrack = paper.track || "cse";
            return normalizeBranchId(rawTrack) === normalizeBranchId(paperTrackFilter);
        });

        return (
            <div className="space-y-2.5 sm:space-y-3">
                {renderOverviewPanel()}

                {paperOptions.length === 0 ? (
                    <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-800">
                        No release-ready papers are available yet.
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-0.5">Track:</span>
                                <button
                                    type="button"
                                    data-testid="mock-paper-filter-all"
                                    onClick={() => setPaperTrackFilter("all")}
                                    className={joinClasses(
                                        "rounded-full px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400",
                                        paperTrackFilter === "all"
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    All Papers <span className="tabular-nums">({paperOptions.length})</span>
                                </button>
                                {effectiveBranches.map((branchId) => {
                                    const conf = BRANCH_CONFIG[branchId] || { shortLabel: `GATE ${branchId.toUpperCase()}`, activePillClass: "bg-slate-900 text-white shadow-xs" };
                                    const branchPaperCount = paperOptions.filter((p) => {
                                        const raw = p.track || "cse";
                                        return normalizeBranchId(raw) === branchId;
                                    }).length;
                                    const isSelected = paperTrackFilter === branchId;
                                    return (
                                        <button
                                            key={branchId}
                                            type="button"
                                            data-testid={`mock-paper-filter-${branchId}`}
                                            onClick={() => setPaperTrackFilter(branchId)}
                                            className={joinClasses(
                                                "rounded-full px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400",
                                                isSelected
                                                    ? conf.activePillClass
                                                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            {conf.shortLabel} <span className="tabular-nums">({branchPaperCount})</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium tabular-nums hidden sm:inline">
                                Showing {displayedPapers.length} paper{displayedPapers.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className="mocktest-paper-grid max-h-[380px] sm:max-h-[460px] lg:max-h-[calc(100vh-255px)] overflow-y-auto pr-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 auto-rows-fr">
                                {displayedPapers.map((paper) => {
                                    const paperIdentity = getMockPaperYearSetIdentity(paper);
                                    const rawTrack = paper.track || "cse";
                                    const normTrack = normalizeBranchId(rawTrack);
                                    const isItPaper = paper.track === "it" || paper.paperScope === "official_it" || (paper.label && paper.label.includes("IT"));
                                    const conf = BRANCH_CONFIG[normTrack] || BRANCH_CONFIG.cse;
                                    const paperTestToken = paper.yearSetKey || paperIdentity;
                                    const isSelected = paperIdentity === selectedPaperYearSetKey;
                                    const blockedQuestions = Array.isArray(paper.blockedQuestions) ? paper.blockedQuestions : [];
                                    const statusLabel = paper.paperReady
                                        ? (paper.legacyPartial ? "Legacy-ready" : "Release-ready")
                                        : `Needs ${paper.missingScorableCount || blockedQuestions.length || 0} answer${(paper.missingScorableCount || blockedQuestions.length || 0) === 1 ? "" : "s"}`;
                                    const badgeLabel = isItPaper ? "GATE IT" : conf.badgeTrack;
                                    const badgeClass = isItPaper ? "bg-cyan-50 text-cyan-700 border-cyan-200" : conf.badgeClass;
                                    const cardSelectedClass = isItPaper
                                        ? "border-cyan-300 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] shadow-[var(--shadow-soft)] ring-2 ring-cyan-100"
                                        : conf.btnSelectedClass;
                                    const trackShort = isItPaper ? "IT" : conf.shortLabel.replace("GATE ", "");

                                    return (
                                        <button
                                            key={paperIdentity}
                                            data-testid={`mock-paper-option-${paperTestToken}`}
                                            type="button"
                                            onClick={() => onSelectPaper?.(paperIdentity)}
                                            className={joinClasses(
                                                "group relative flex w-full flex-col justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/40",
                                                isSelected
                                                    ? cardSelectedClass
                                                    : (paper.paperReady
                                                        ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                                                        : "border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] hover:border-amber-300 hover:shadow-sm")
                                            )}
                                        >
                                            <div className="flex w-full items-start justify-between gap-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                        <span className={joinClasses(
                                                            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0",
                                                            badgeClass
                                                        )}>
                                                            {badgeLabel}
                                                        </span>
                                                        <span className="text-sm sm:text-base font-semibold text-slate-950 tabular-nums truncate">
                                                            {paper.label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-600 leading-relaxed tabular-nums">
                                                        <span className="tabular-nums font-medium text-slate-700">{paper.gaCount}</span> GA and{" "}
                                                        <span className="tabular-nums font-medium text-slate-700">{paper.csCount || paper.daCount || paper.questionCount || 55}</span> {trackShort} questions in paper order.
                                                    </p>
                                                    {!paper.paperReady && paper.statusReason ? (
                                                        <p className="mt-1 text-xs font-medium text-amber-700">
                                                            {paper.statusReason}
                                                        </p>
                                                    ) : null}
                                                    {!paper.paperReady && blockedQuestions.length > 0 ? (
                                                        <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                                                            Missing:{" "}
                                                            {blockedQuestions.slice(0, 3).map((question) => `${question.section} Q${question.orderIndex}`).join(", ")}
                                                            {blockedQuestions.length > 3 ? "..." : ""}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                {isSelected || !paper.paperReady ? (
                                                    <span className={joinClasses(
                                                        "mocktest-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5",
                                                        isSelected
                                                            ? badgeClass
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    )}>
                                                        {isSelected && <FaCheckCircle className="text-[9px] shrink-0" />}
                                                        <span>{isSelected ? "Selected" : statusLabel}</span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderDurationModeCard = () => (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base font-normal text-slate-950">Duration mode</h4>
                    <div className="flex gap-1.5">
                        <FilterChip
                            active={setupState.customDurationMode === "adaptive"}
                            tone="purple"
                            data-testid="duration-mode-adaptive"
                            onClick={() => onPatchState({ customDurationMode: "adaptive" })}
                        >
                            Adaptive
                        </FilterChip>
                        <FilterChip
                            active={setupState.customDurationMode === "manual"}
                            tone="purple"
                            data-testid="duration-mode-manual"
                            onClick={() => onPatchState({ customDurationMode: "manual" })}
                        >
                            Custom
                        </FilterChip>
                    </div>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                    {setupState.customDurationMode === "adaptive"
                        ? "Auto-scaled to question count (~2.7 min/Q)."
                        : "Enter fixed minutes (1–180 min)."}
                </p>
            </div>

            {setupState.customDurationMode === "manual" && (
                <div className="mt-2.5 flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h5 className="text-xs sm:text-sm font-semibold text-slate-900">Custom minutes</h5>
                            <p className="text-[11px] text-slate-500">Duration (1–180 min).</p>
                        </div>
                        <div className="w-24 sm:w-28">
                            <input
                                type="number"
                                min={1}
                                max={180}
                                data-testid="mock-setup-custom-duration"
                                value={setupState.customDurationMinutes === "" || setupState.customDurationMinutes === null || setupState.customDurationMinutes === undefined ? "" : setupState.customDurationMinutes}
                                onChange={(event) => {
                                    const rawVal = event.target.value;
                                    if (rawVal === "") {
                                        onPatchState({ customDurationMinutes: "" });
                                        return;
                                    }
                                    const parsed = Number(rawVal);
                                    if (Number.isFinite(parsed)) {
                                        onPatchState({ customDurationMinutes: parsed > 180 ? 180 : parsed });
                                    }
                                }}
                                className={`mocktest-input w-full border bg-white px-2.5 py-1 text-sm sm:text-base font-semibold text-slate-950 tabular-nums shadow-[var(--shadow-soft)] focus:outline-none ${
                                    (!Number.isFinite(Number(setupState.customDurationMinutes)) || Number(setupState.customDurationMinutes) < 1 || setupState.customDurationMinutes === "")
                                        ? "border-rose-400 focus:border-rose-500 ring-2 ring-rose-100"
                                        : "border-slate-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                                }`}
                            />
                        </div>
                    </div>
                    {(!Number.isFinite(Number(setupState.customDurationMinutes)) || Number(setupState.customDurationMinutes) < 1 || setupState.customDurationMinutes === "") && (
                        <div className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900" data-testid="custom-duration-warning">
                            <span>⚠️</span>
                            <span>Please set duration to at least 1 minute (up to 180 minutes).</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderQuestionCountCard = () => (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base font-normal text-slate-950">Question count</h4>
                    <div className="w-24 sm:w-28">
                        <input
                            type="number"
                            min={1}
                            max={65}
                            value={setupState.customCount}
                            onChange={(event) => onPatchState({ customCount: Number(event.target.value) })}
                            className="mocktest-input w-full border border-slate-300 bg-white px-2.5 py-1 text-sm sm:text-base font-semibold text-slate-950 tabular-nums shadow-[var(--shadow-soft)] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                        />
                    </div>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Preset questions or custom value (1–65).</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {COUNT_PRESETS.map((count) => (
                    <FilterChip
                        key={count}
                        active={Number(setupState.customCount) === count}
                        tone="purple"
                        data-testid={`mock-setup-count-preset-${count}`}
                        onClick={() => onPatchState({ customCount: count })}
                    >
                        <span className="tabular-nums">{count}</span> Questions
                    </FilterChip>
                ))}
            </div>
        </div>
    );

    const renderYearScopeCard = () => (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4">
            <div>
                <h4 className="font-display text-base font-normal text-slate-950">Year scope</h4>
                <p className="mt-0.5 text-xs text-slate-500">Choose the time window for the question pool.</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {YEAR_SCOPE_OPTIONS.map((option) => (
                        <FilterChip
                            key={option.id}
                            active={setupState.yearFilterMode === option.id}
                            tone="purple"
                            data-testid={`mock-setup-year-scope-${option.id}`}
                            onClick={() => onPatchState({ yearFilterMode: option.id })}
                        >
                            {option.label}
                        </FilterChip>
                    ))}
                </div>
            </div>

            {setupState.yearFilterMode === "custom" ? (
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5 sm:max-w-md">
                    <label className="text-xs font-semibold text-slate-700">
                        From
                        <input
                            type="number"
                            min={setupState.minYear}
                            max={setupState.maxYear}
                            value={setupState.yearRangeStart}
                            onChange={(event) => onPatchState({ yearRangeStart: Number(event.target.value) })}
                            className="mocktest-input mt-1 w-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-950 tabular-nums shadow-[var(--shadow-soft)] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        To
                        <input
                            type="number"
                            min={setupState.minYear}
                            max={setupState.maxYear}
                            value={setupState.yearRangeEnd}
                            onChange={(event) => onPatchState({ yearRangeEnd: Number(event.target.value) })}
                            className="mocktest-input mt-1 w-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-950 tabular-nums shadow-[var(--shadow-soft)] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                        />
                    </label>
                </div>
            ) : (
                <p className="mt-2 text-xs text-slate-600 tabular-nums">
                    {setupState.yearFilterMode === "recent"
                        ? `Using ${recentYearRangeLabel || "the most recent years"} from the validated pool.`
                        : `Using the full validated span from ${setupState.minYear} to ${setupState.maxYear}.`}
                </p>
            )}
        </div>
    );

    const renderQuestionTypesCard = () => (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
                <h4 className="font-display text-base font-normal text-slate-950">Question types</h4>
                <p className="mt-0.5 text-xs text-slate-500">Keep the mix broad or focus on specific formats.</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {TYPE_OPTIONS.map((type) => (
                        <FilterChip
                            key={type}
                            active={selectedTypeSet.has(type)}
                            tone="purple"
                            onClick={() => onToggleSelection("selectedTypes", type)}
                        >
                            {type}
                        </FilterChip>
                    ))}
                </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
                {selectedTypeSet.size === 0 || selectedTypeSet.size === 3
                    ? "All objective formats enabled."
                    : `Active: ${Array.from(selectedTypeSet).join(", ")}.`}
            </p>
        </div>
    );

    const renderSolvedPolicyCard = () => (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
                <h4 className="font-display text-base font-normal text-slate-900">Solved Questions Policy</h4>
                <p className="mt-0.5 text-xs text-slate-500">Choose how to handle questions you have already solved.</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <FilterChip
                        active={setupState.solvedFilter === "unsolved"}
                        tone="purple"
                        data-testid="solved-filter-unsolved"
                        onClick={() => onPatchState({ solvedFilter: "unsolved" })}
                    >
                        Unsolved Only
                    </FilterChip>
                    <FilterChip
                        active={setupState.solvedFilter === "all"}
                        tone="purple"
                        data-testid="solved-filter-all"
                        onClick={() => onPatchState({ solvedFilter: "all" })}
                    >
                        Include Solved
                    </FilterChip>
                    <FilterChip
                        active={setupState.solvedFilter === "solved_only"}
                        tone="purple"
                        data-testid="solved-filter-solved-only"
                        onClick={() => onPatchState({ solvedFilter: "solved_only" })}
                    >
                        Solved Only
                    </FilterChip>
                    <FilterChip
                        active={setupState.solvedFilter === "bookmarked_only"}
                        tone="emerald"
                        data-testid="solved-filter-bookmarked-only"
                        onClick={() => onPatchState({ solvedFilter: "bookmarked_only" })}
                    >
                        Bookmarked Only
                    </FilterChip>
                </div>
            </div>
            {setupState.solvedFilter === "bookmarked_only" && (
                <p className="mt-2 text-xs text-emerald-700 tabular-nums">
                    {bookmarkedCount > 0
                        ? `Pool restricted to your ${bookmarkedCount} bookmarked question${bookmarkedCount === 1 ? "" : "s"} — other filters still apply.`
                        : "You have no bookmarked questions yet. Bookmark questions during practice to use this mode."}
                </p>
            )}
        </div>
    );

    const renderCustomContent = () => (
        <div className="space-y-3 sm:space-y-3.5">
            {renderOverviewPanel()}

            {/* 1. Left Column: Question Types */}
            {renderQuestionTypesCard()}

            {/* 2. Left Column: Solved Questions Policy */}
            {renderSolvedPolicyCard()}

            {/* 3. Left Column: Subjects & Subtopics Hierarchy */}
            <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-3.5 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                        <h4 className="font-display text-base sm:text-lg font-normal text-slate-950">Subjects &amp; subtopics</h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Configure branches, technical subjects, and Aptitude.
                        </p>
                    </div>

                    {/* All-subjects broad mix shortcut */}
                    <FilterChip
                        active={isBroadMix}
                        tone="purple"
                        onClick={() => onPatchState({ selectedSubjects: ["ga"], selectedSubtopics: [], expandedSubjectSlug: null })}
                    >
                        All Subjects (Broad Mix)
                    </FilterChip>
                </div>

                {/* Warning if all tracks are disabled */}
                {effectiveBranches.every((b) => !enabledTracks.includes(b)) && !includeGeneralAptitude && (
                    <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">
                        Please enable at least one section to create a valid test.
                    </div>
                )}

                <div className="mt-3 space-y-3">
                    {effectiveBranches.map((branchId) => {
                        const branchSubjects = getBranchSubjects(subjects, branchId);
                        if (!branchSubjects || branchSubjects.length === 0) return null;
                        const isTrackEnabled = enabledTracks.includes(branchId);
                        const branchSubjectSlugs = branchSubjects.map((s) => s.slug);
                        const selectedBranchCount = branchSubjects.filter((s) => selectedSubjectSet.has(s.slug)).length;
                        const conf = BRANCH_CONFIG[branchId] || BRANCH_CONFIG.cse;

                        return (
                            <div
                                key={branchId}
                                className={`rounded-xl border transition-all duration-200 ${
                                    isTrackEnabled
                                        ? `${conf.borderClass || "border-sky-200"} bg-white shadow-xs`
                                        : "border-slate-200 bg-slate-50/70"
                                }`}
                            >
                                <div className={`flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 ${isTrackEnabled ? "border-b border-slate-100" : ""}`}>
                                    <div
                                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 select-none"
                                        onClick={() => onToggleTrack(branchId)}
                                    >
                                        <span className="text-sm font-bold text-slate-900">
                                            {conf.label || conf.shortLabel}
                                        </span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                                            !isTrackEnabled
                                                ? "bg-slate-200 text-slate-600"
                                                : selectedBranchCount > 0
                                                    ? "bg-indigo-100 text-indigo-800 font-bold"
                                                    : "bg-emerald-100 text-emerald-800"
                                        }`}>
                                            {!isTrackEnabled
                                                ? "Disabled"
                                                : selectedBranchCount > 0
                                                    ? `${selectedBranchCount} / ${branchSubjects.length} selected`
                                                    : `All ${conf.shortLabel.replace("GATE ", "")} subjects active`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        {isTrackEnabled && (
                                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => onBulkToggleTrackSubjects(branchId, branchSubjectSlugs, true)}
                                                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onBulkToggleTrackSubjects(branchId, branchSubjectSlugs, false)}
                                                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                        <ToggleSwitch
                                            id={`mock-toggle-${branchId}`}
                                            checked={isTrackEnabled}
                                            onChange={() => onToggleTrack(branchId)}
                                            label={`Toggle ${conf.label || conf.shortLabel}`}
                                            activeColor={conf.switchColor || "peer-checked:bg-purple-600 peer-focus-visible:ring-purple-500"}
                                        />
                                    </div>
                                </div>

                                {isTrackEnabled && (
                                    <div className="p-2.5 sm:p-3">
                                        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
                                            {branchSubjects.map((subject) => (
                                                <SubjectHierarchyCard
                                                    key={subject.slug}
                                                    subject={subject}
                                                    structuredSubtopics={structuredSubtopics}
                                                    selectedSubjectSet={selectedSubjectSet}
                                                    selectedSubtopicSet={selectedSubtopicSet}
                                                    expandedSubjectSlugs={expandedSubjectSlugs}
                                                    expandedSubjectSlug={setupState.expandedSubjectSlug}
                                                    expandedTopicIds={expandedTopicIds}
                                                    onSubjectToggle={handleSubjectToggle}
                                                    onToggleSubjectExpansion={toggleSubjectExpansion}
                                                    onToggleTopicExpansion={toggleTopicExpansion}
                                                    onTopicToggle={handleTopicToggle}
                                                    onSubtopicToggle={handleSubtopicToggle}
                                                    onSubjectBulkToggle={handleSubjectBulkToggle}
                                                    tone={conf.accentTone || "sky"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Aptitude track */}
                    <div className={`rounded-xl border transition-all duration-200 ${
                        includeGeneralAptitude
                            ? "border-emerald-200 bg-white shadow-xs"
                            : "border-slate-200 bg-slate-50/70"
                    }`}>
                        <div className={`flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 ${includeGeneralAptitude && aptitudeSubjects.length > 0 ? "border-b border-slate-100" : ""}`}>
                            <div
                                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 select-none"
                                onClick={() => onToggleGeneralAptitude()}
                            >
                                <span className="text-sm font-bold text-slate-900">
                                    Aptitude
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${
                                    includeGeneralAptitude ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                }`}>
                                    {includeGeneralAptitude ? "Section 1 Active" : "Disabled"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <ToggleSwitch
                                    id="mock-toggle-ga"
                                    checked={includeGeneralAptitude}
                                    onChange={onToggleGeneralAptitude}
                                    label="Toggle Aptitude"
                                    activeColor="peer-checked:bg-emerald-600 peer-focus-visible:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {includeGeneralAptitude && aptitudeSubjects.length > 0 && (
                            <div className="bg-slate-50/50 px-3 py-2.5 sm:px-3.5 sm:py-2.5">
                                <p className="mb-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Aptitude Categories (Optional Narrowing)
                                </p>
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    {aptitudeSubjects.map((subject) => {
                                        const subjectSlug = subject.slug;
                                        const normSlug = normalizeMockSubjectKey(subjectSlug);
                                        const isSelected = selectedSubjectSet.has(subjectSlug) || selectedSubjectSet.has(normSlug);
                                        return (
                                            <label key={subjectSlug} className="flex min-w-0 cursor-pointer items-center gap-2 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    aria-label={subject.label}
                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    checked={isSelected}
                                                    onChange={() => onToggleSelection("selectedSubjects", normSlug)}
                                                />
                                                <span className={`truncate text-xs ${isSelected ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                                                    {subject.label}
                                                    {typeof subject.count === "number" && (
                                                        <span className="ml-1 text-[11px] font-normal text-slate-400 tabular-nums">
                                                            ({subject.count.toLocaleString()})
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Legacy-optional subjects */}
                    {legacySubjects.map((subject) => (
                        <div key={subject.slug} className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 sm:p-3">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700">Optional legacy topics</p>
                            <p className="mb-1.5 text-xs text-amber-700/80">Older or out-of-syllabus questions from past papers.</p>
                            <label className="flex min-w-0 cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                                    checked={selectedSubjectSet.has(subject.slug)}
                                    onChange={() => onToggleSelection("selectedSubjects", subject.slug)}
                                />
                                <span className={`truncate text-xs sm:text-sm ${selectedSubjectSet.has(subject.slug) ? "font-medium text-slate-900" : "text-slate-500"}`}>
                                    {subject.label}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mocktest-setup-wrap flex min-h-0 flex-1 flex-col overflow-y-auto bg-[color:var(--color-bg,#f8fafc)]">
            <div className="mocktest-setup-card w-full max-w-6xl mx-auto flex flex-1 flex-col justify-between">
                <div className="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                            <h2 className="font-display text-2xl sm:text-3xl font-normal text-slate-950">Mock Test Setup</h2>
                            <span className={joinClasses("mocktest-pill inline-flex items-center px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider", accent.badge)}>
                                {kindMeta.title}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`grid items-stretch gap-4 p-3.5 sm:p-4 lg:gap-6 lg:p-6 ${isCustom ? "lg:grid-cols-[minmax(0,1.15fr)_380px]" : "lg:grid-cols-[minmax(0,1.2fr)_360px]"}`} style={{minHeight: 0}}>
                    <section className="min-w-0 min-h-0">
                        <div className={joinClasses(
                            "h-full pr-1",
                            isCustom ? "lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto" : ""
                        )}>
                            {isPaperMode ? renderPaperModeContent() : null}
                            {isCustom ? renderCustomContent() : null}
                        </div>
                    </section>

                    <aside className="lg:sticky lg:top-4 space-y-3 self-start lg:overflow-y-auto lg:max-h-[calc(100vh-210px)]">
                        {isPaperMode ? (
                            <>
                                <div className="rounded-[var(--radius-card)] border border-slate-200 p-3.5 sm:p-4 shadow-[var(--shadow-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                                    <div className="flex items-start gap-2.5">
                                        <span className={joinClasses("mocktest-icon-box inline-flex h-9 w-9 shrink-0 items-center justify-center text-sm", accent.icon)}>
                                            <Icon />
                                        </span>
                                        <div>
                                            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Attempt summary</p>
                                            <h3 className="font-display text-base font-normal text-slate-950">{kindMeta.title}</h3>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <SummaryStat label="Requested" value={requestedCount} />
                                        <SummaryStat label="Duration" value={durationLabel} />
                                        <div className="col-span-2">
                                            <SummaryStat
                                                label="Selected paper"
                                                value={selectedPaper?.label || "Choose a paper"}
                                            />
                                        </div>
                                    </div>

                                    {summaryNote ? (
                                        <div className="mocktest-summary-note mt-2.5 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 rounded-md leading-relaxed tabular-nums">
                                            <p>{summaryNote}</p>
                                        </div>
                                    ) : null}
                                </div>

                                <PreviewCard livePreview={livePreview} />
                            </>
                        ) : null}

                        {isCustom ? (
                            <>
                                {/* 1. Right Column: Duration Mode - at the top */}
                                {renderDurationModeCard()}

                                {/* 2. Right Column: Question Count */}
                                {renderQuestionCountCard()}

                                {/* 3. Right Column: Year Scope */}
                                {renderYearScopeCard()}

                                {/* 4. Right Column: Available Pool - at the bottom */}
                                <PreviewCard livePreview={livePreview} />
                            </>
                        ) : null}

                        {!canStart && validationMessage ? (
                            <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-3 text-xs sm:text-sm text-rose-700">
                                {validationMessage}
                            </div>
                        ) : null}
                    </aside>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-200/80 bg-white px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
                    {showBackButton ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="mocktest-secondary-btn border border-slate-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            {backLabel}
                        </button>
                    ) : <span />}
                    <div className="flex items-center gap-2.5">
                        {showReset ? (
                            <button
                                type="button"
                                onClick={onReset}
                                className="mocktest-secondary-btn border border-slate-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                Reset
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={onStart}
                            disabled={!canStart}
                            className={joinClasses(
                                "mocktest-primary-btn px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300",
                                accent.button
                            )}
                        >
                            Start Mock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockTestSetup;
