import React from "react";
import {
    FaBolt,
    FaCheckCircle,
    FaFileAlt,
    FaSlidersH,
} from "react-icons/fa";

const TYPE_OPTIONS = ["MCQ", "MSQ", "NAT"];
const COUNT_PRESETS = [15, 25, 65];

const YEAR_SCOPE_OPTIONS = [
    { id: "all", label: "All years" },
    { id: "recent", label: "Recent years" },
    { id: "custom", label: "Custom range" },
];

const KIND_META = {
    full_length: {
        icon: FaBolt,
        accent: "emerald",
        title: "Full Mock",
        description: "",
        note: "",
    },
    paper_mode: {
        icon: FaFileAlt,
        accent: "sky",
        title: "Past Paper",
        description: "",
        note: "",
    },
    custom: {
        icon: FaSlidersH,
        accent: "amber",
        title: "Custom Builder",
        description: "",
        note: "",
    },
};

const joinClasses = (...tokens) => tokens.filter(Boolean).join(" ");

const ACCENT_CLASSES = {
    emerald: {
        badge: "bg-emerald-50 text-emerald-700",
        chip: "border-emerald-300 bg-emerald-50 text-emerald-800",
        panel: "border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)]",
        icon: "bg-emerald-100 text-emerald-700",
        button: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    sky: {
        badge: "bg-sky-50 text-sky-700",
        chip: "border-sky-300 bg-sky-50 text-sky-800",
        panel: "border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]",
        icon: "bg-sky-100 text-sky-700",
        button: "bg-sky-700 text-white hover:bg-sky-800",
    },
    amber: {
        badge: "bg-amber-50 text-amber-700",
        chip: "border-amber-300 bg-amber-50 text-amber-800",
        panel: "border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)]",
        icon: "bg-amber-100 text-amber-700",
        button: "bg-slate-900 text-white hover:bg-slate-800",
    },
};

const SummaryStat = ({ label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-[var(--shadow-soft)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
        <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
    </div>
);

const FILTER_CHIP_TONE_CLASSES = {
    slate: "border-slate-400 bg-slate-100 text-slate-900 ring-2 ring-slate-200",
    sky: "border-sky-400 bg-sky-100 text-sky-900 ring-2 ring-sky-100",
    emerald: "border-emerald-400 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-100",
    violet: "border-violet-400 bg-violet-100 text-violet-900 ring-2 ring-violet-100",
};

const FilterChip = ({
    active = false,
    children,
    onClick,
    tone = "slate",
    ...rest
}) => {
    const toneClass = FILTER_CHIP_TONE_CLASSES[tone] || FILTER_CHIP_TONE_CLASSES.slate;

    return (
        <button
            type="button"
            onClick={onClick}
            className={joinClasses(
                "rounded-2xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30",
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

const PreviewCard = ({ livePreview }) => {
    if (!livePreview) {
        return null;
    }

    return (
        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Available pool</p>
                    <p className="mt-1 text-sm text-slate-600">The questions currently eligible for this attempt.</p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-[var(--shadow-soft)]">
                    <div className="text-2xl font-semibold text-slate-950" data-testid="preview-total">{livePreview.total}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total</div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryStat label="GA" value={<span data-testid="preview-ga">{livePreview.gaCount}</span>} />
                <SummaryStat label="CS" value={<span data-testid="preview-cs">{livePreview.csCount}</span>} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
                    <span data-testid="preview-mcq">{livePreview.mcqCount}</span> MCQ
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
                    <span data-testid="preview-msq">{livePreview.msqCount}</span> MSQ
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
                    <span data-testid="preview-nat">{livePreview.natCount}</span> NAT
                </span>
            </div>
        </div>
    );
};

const MockTestSetup = ({
    kind,
    setupState,
    subjects = [],
    availability,
    livePreview,
    paperOptions = [],
    selectedPaperYearSetKey = "",
    customDurationMinutes = 180,
    recentYearRangeLabel = "",
    onSelectPaper,
    onBack,
    onReset,
    onStart,
    onPatchState,
    onToggleSelection,
    backLabel = "Back",
    showBackButton = true,
}) => {
    const canStart = Boolean(availability?.canStart);
    const availableSummary = availability?.availableSummary || "0";
    const validationMessage = availability?.message || "";

    const kindMeta = KIND_META[kind.id] || KIND_META.custom;
    const accent = ACCENT_CLASSES[kindMeta.accent] || ACCENT_CLASSES.amber;
    const Icon = kindMeta.icon || FaSlidersH;
    const isFullMock = kind.id === "full_length";
    const isPaperMode = kind.id === "paper_mode";
    const isCustom = kind.id === "custom";
    const selectedPaper = paperOptions.find((paper) => paper.yearSetKey === selectedPaperYearSetKey) || null;
    const selectedSubjectSet = new Set(setupState.selectedSubjects || []);
    const selectedTypeSet = new Set(setupState.selectedTypes || []);

    const selectedPaperDuration = Number.parseInt(String(selectedPaper?.durationMinutes ?? ""), 10);
    const selectedPaperRequiredCount = Number.parseInt(String(selectedPaper?.requiredQuestionCount ?? ""), 10);
    const selectedPaperRequiredGa = Number.parseInt(String(selectedPaper?.requiredGaCount ?? selectedPaper?.gaCount ?? 0), 10);
    const selectedPaperRequiredCs = Number.parseInt(String(selectedPaper?.requiredCsCount ?? selectedPaper?.csCount ?? 0), 10);
    const durationLabel = isCustom
        ? `${customDurationMinutes} min`
        : (isPaperMode && Number.isFinite(selectedPaperDuration) && selectedPaperDuration > 0
            ? `${selectedPaperDuration} min`
            : (kind.durationLabel || "180 min"));
    const requestedCount = isCustom
        ? `${setupState.customCount} Questions`
        : (isPaperMode
            ? `${Number.isFinite(selectedPaperRequiredCount) && selectedPaperRequiredCount > 0 ? selectedPaperRequiredCount : 65} Questions`
            : "65 Questions");
    const poolTotalLabel = livePreview?.total ? `${livePreview.total} Questions` : "0 Questions";
    const summaryNote = isPaperMode
        ? (
            selectedPaper
                ? (
                    selectedPaper.paperReady
                        ? `${Number.isFinite(selectedPaperRequiredGa) ? selectedPaperRequiredGa : selectedPaper.gaCount} GA and ${Number.isFinite(selectedPaperRequiredCs) ? selectedPaperRequiredCs : selectedPaper.csCount} CS questions in paper order.`
                        : (selectedPaper.statusReason || "This paper is not release-ready yet.")
                )
                : "Select a paper to continue."
        )
        : isCustom
            ? `Will sample ${setupState.customCount} question${Number(setupState.customCount) === 1 ? "" : "s"} from the filtered pool when you start.`
            : "";
    const yearScopeLabel = setupState.yearFilterMode === "recent"
        ? `Recent years (${recentYearRangeLabel || "last 10 years"})`
        : setupState.yearFilterMode === "custom"
            ? `${setupState.yearRangeStart} - ${setupState.yearRangeEnd}`
            : `All years (${setupState.minYear} - ${setupState.maxYear})`;
    const showReset = Boolean(onReset) && (isCustom || isPaperMode);
    const showPreviewInAside = !isFullMock;

    const renderOverviewPanel = () => (
        kindMeta.description || kindMeta.note ? (
        <div className={joinClasses("rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-soft)]", accent.panel)}>
            <div className="flex items-start gap-4">
                <span className={joinClasses("inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", accent.icon)}>
                    <Icon />
                </span>
                <div>
                    <span className={joinClasses("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", accent.badge)}>
                        {kindMeta.title}
                    </span>
                    {kindMeta.description ? (
                        <h3 className="mt-3 text-xl font-semibold text-slate-950">{kindMeta.description}</h3>
                    ) : null}
                    {kindMeta.note ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{kindMeta.note}</p>
                    ) : null}
                </div>
            </div>
        </div>
        ) : null
    );

    const renderFullMockContent = () => (
        <div className="space-y-4">
            {renderOverviewPanel()}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="Attempt size" value="65 Questions" />
                <SummaryStat label="Duration" value="180 min" />
                <SummaryStat label="Section balance" value="10 GA / 55 CS" />
                <SummaryStat label="Pool total" value={poolTotalLabel} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <PreviewCard livePreview={livePreview} />

                <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <FaCheckCircle />
                        </span>
                        <div>
                            <h4 className="text-base font-semibold text-slate-950">No setup noise here</h4>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                Full Mock starts directly from the validated pool and keeps the paper split balanced automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPaperModeContent = () => (
        <div className="space-y-4">
            {renderOverviewPanel()}

            {paperOptions.length === 0 ? (
                <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    No release-ready papers are available yet.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {paperOptions.map((paper) => {
                        const isSelected = paper.yearSetKey === selectedPaperYearSetKey;
                        const blockedQuestions = Array.isArray(paper.blockedQuestions) ? paper.blockedQuestions : [];
                        const statusLabel = paper.paperReady
                            ? (paper.legacyPartial ? "Legacy-ready" : "Release-ready")
                            : `Needs ${paper.missingScorableCount || blockedQuestions.length || 0} answer${(paper.missingScorableCount || blockedQuestions.length || 0) === 1 ? "" : "s"}`;
                        return (
                            <button
                                key={paper.yearSetKey}
                                data-testid={`mock-paper-option-${paper.yearSetKey}`}
                                type="button"
                                onClick={() => onSelectPaper?.(paper.yearSetKey)}
                                className={joinClasses(
                                    "rounded-[var(--radius-card)] border p-4 text-left transition",
                                    isSelected
                                        ? "border-sky-300 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] shadow-[var(--shadow-soft)] ring-2 ring-sky-100"
                                        : (paper.paperReady
                                            ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[var(--shadow-soft)]"
                                            : "border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] hover:border-amber-300 hover:shadow-[var(--shadow-soft)]")
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-lg font-semibold text-slate-950">{paper.label}</div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {paper.gaCount} GA questions and {paper.csCount} CS questions parsed.
                                        </p>
                                        {!paper.paperReady && paper.statusReason ? (
                                            <p className="mt-2 text-sm font-medium text-amber-700">
                                                {paper.statusReason}
                                            </p>
                                        ) : null}
                                        {!paper.paperReady && blockedQuestions.length > 0 ? (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Missing:
                                                {" "}
                                                {blockedQuestions.slice(0, 3).map((question) => `${question.section} Q${question.orderIndex}`).join(", ")}
                                                {blockedQuestions.length > 3 ? "..." : ""}
                                            </p>
                                        ) : null}
                                    </div>
                                    {isSelected || !paper.paperReady ? (
                                        <span className={joinClasses(
                                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                                            isSelected
                                                ? "bg-sky-50 text-sky-700"
                                                : "bg-amber-50 text-amber-700"
                                        )}>
                                            {isSelected ? "Selected" : statusLabel}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderCustomContent = () => (
        <div className="space-y-4">
            {renderOverviewPanel()}

            <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h4 className="text-base font-semibold text-slate-950">Question count</h4>
                        <p className="mt-1 text-sm text-slate-600">Use a preset for quick practice or enter your own value.</p>
                    </div>
                    <div className="w-28">
                        <input
                            type="number"
                            min={1}
                            max={65}
                            value={setupState.customCount}
                            onChange={(event) => onPatchState({ customCount: Number(event.target.value) })}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-950 shadow-[var(--shadow-soft)] focus:border-sky-400 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {COUNT_PRESETS.map((count) => (
                        <FilterChip
                            key={count}
                            active={Number(setupState.customCount) === count}
                            tone="sky"
                            data-testid={`mock-setup-count-preset-${count}`}
                            onClick={() => onPatchState({ customCount: count })}
                        >
                            {count} Questions
                        </FilterChip>
                    ))}
                </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4">
                <h4 className="text-base font-semibold text-slate-950">Year scope</h4>
                <p className="mt-1 text-sm text-slate-600">Choose the time window for the question pool.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {YEAR_SCOPE_OPTIONS.map((option) => (
                        <FilterChip
                            key={option.id}
                            active={setupState.yearFilterMode === option.id}
                            tone="sky"
                            data-testid={`mock-setup-year-scope-${option.id}`}
                            onClick={() => onPatchState({ yearFilterMode: option.id })}
                        >
                            {option.label}
                        </FilterChip>
                    ))}
                </div>
                {setupState.yearFilterMode === "custom" ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-slate-700">
                            From
                            <input
                                type="number"
                                min={setupState.minYear}
                                max={setupState.maxYear}
                                value={setupState.yearRangeStart}
                                onChange={(event) => onPatchState({ yearRangeStart: Number(event.target.value) })}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-[var(--shadow-soft)] focus:border-sky-400 focus:outline-none"
                            />
                        </label>
                        <label className="text-sm font-semibold text-slate-700">
                            To
                            <input
                                type="number"
                                min={setupState.minYear}
                                max={setupState.maxYear}
                                value={setupState.yearRangeEnd}
                                onChange={(event) => onPatchState({ yearRangeEnd: Number(event.target.value) })}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-[var(--shadow-soft)] focus:border-sky-400 focus:outline-none"
                            />
                        </label>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-slate-600">
                        {setupState.yearFilterMode === "recent"
                            ? `Using ${recentYearRangeLabel || "the most recent years"} from the validated pool.`
                            : `Using the full validated span from ${setupState.minYear} to ${setupState.maxYear}.`}
                    </p>
                )}
            </div>

            <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4">
                <h4 className="text-base font-semibold text-slate-950">Subjects</h4>
                <p className="mt-1 text-sm text-slate-600">Leave this open for a broad mix, or narrow the mock to specific areas.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <FilterChip
                        active={selectedSubjectSet.size === 0}
                        tone="sky"
                        onClick={() => onPatchState({ selectedSubjects: [] })}
                    >
                        All subjects
                    </FilterChip>
                    {subjects.map((subject) => (
                        <FilterChip
                            key={subject.slug}
                            active={selectedSubjectSet.has(subject.slug)}
                            tone="emerald"
                            onClick={() => onToggleSelection("selectedSubjects", subject.slug)}
                        >
                            {subject.label}
                        </FilterChip>
                    ))}
                </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-4">
                <h4 className="text-base font-semibold text-slate-950">Question types</h4>
                <p className="mt-1 text-sm text-slate-600">Keep the mix broad or focus on the format you want to practice.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((type) => (
                        <FilterChip
                            key={type}
                            active={selectedTypeSet.has(type)}
                            tone="violet"
                            onClick={() => onToggleSelection("selectedTypes", type)}
                        >
                            {type}
                        </FilterChip>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mocktest-setup-wrap flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-5">
            <div className="w-full max-w-6xl rounded-[var(--radius-hero)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
                <div className="border-b border-[color:var(--color-border)] px-6 py-5 lg:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <span className={joinClasses("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", accent.badge)}>
                                {kindMeta.title}
                            </span>
                            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Mock Test Setup</h2>
                            {kindMeta.description ? (
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                    {kindMeta.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className={`grid items-start gap-4 p-5 lg:p-6 ${isFullMock
                    ? "lg:grid-cols-[minmax(0,1.2fr)_320px]"
                    : "lg:grid-cols-[minmax(0,1.35fr)_320px]"
                    }`}>
                    <section className="min-w-0 self-start">
                        {isFullMock ? renderFullMockContent() : null}
                        {isPaperMode ? renderPaperModeContent() : null}
                        {isCustom ? renderCustomContent() : null}
                    </section>

                    <aside className="space-y-4 self-start">
                        <div className="rounded-[var(--radius-card)] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[var(--shadow-soft)]">
                            <div className="flex items-start gap-3">
                                <span className={joinClasses("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", accent.icon)}>
                                    <Icon />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Attempt summary</p>
                                    <h3 className="mt-1 text-lg font-semibold text-slate-950">{kindMeta.title}</h3>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3">
                                <SummaryStat label="Requested" value={requestedCount} />
                                <SummaryStat label="Duration" value={durationLabel} />
                                <SummaryStat
                                    label={isPaperMode ? "Selected paper" : (isFullMock ? "Available split" : "Available")}
                                    value={isPaperMode ? (selectedPaper?.label || "Choose a paper") : availableSummary}
                                />
                                {isCustom ? (
                                    <SummaryStat label="Year scope" value={yearScopeLabel} />
                                ) : null}
                            </div>

                            {summaryNote ? (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                                    <p>{summaryNote}</p>
                                </div>
                            ) : null}
                        </div>

                        {showPreviewInAside ? <PreviewCard livePreview={livePreview} /> : null}

                        {!canStart && validationMessage ? (
                            <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                {validationMessage}
                            </div>
                        ) : null}
                    </aside>
                </div>

                <div className={joinClasses(
                    "flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] px-6 py-4 lg:px-8",
                    showBackButton ? "justify-between" : "justify-end"
                )}>
                    {showBackButton ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            {backLabel}
                        </button>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3">
                        {showReset ? (
                            <button
                                type="button"
                                onClick={onReset}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                Reset
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={onStart}
                            disabled={!canStart}
                            className={joinClasses(
                                "rounded-2xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300",
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
