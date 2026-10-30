import React from "react";
import {
    FaArrowRight,
    FaBolt,
    FaCheck,
    FaFileAlt,
    FaSlidersH,
} from "react-icons/fa";
import {
    FiClock,
    FiFileText,
    FiHome,
} from "react-icons/fi";

const ICON_BY_OPTION_ID = {
    paper_mode: FaFileAlt,
    custom: FaSlidersH,
};

const THEME_BY_OPTION_ID = {
    paper_mode: {
        accent: "sky",
        borderSelected: "border-sky-500",
        ringSelected: "ring-2 ring-sky-500/20",
        bgSelected: "bg-gradient-to-b from-sky-50/40 via-white to-white",
        iconSelected: "bg-sky-600 text-white shadow-sm shadow-sky-600/30",
        badgeSelected: "bg-sky-50 text-sky-800 border-sky-200",
        radioSelected: "bg-sky-600 border-sky-600 text-white",
    },
    custom: {
        accent: "purple",
        borderSelected: "border-purple-500",
        ringSelected: "ring-2 ring-purple-500/20",
        bgSelected: "bg-gradient-to-b from-purple-50/40 via-white to-white",
        iconSelected: "bg-purple-600 text-white shadow-sm shadow-purple-600/30",
        badgeSelected: "bg-purple-50 text-purple-800 border-purple-200",
        radioSelected: "bg-purple-600 border-purple-600 text-white",
    },
};

const MockTestPortal = ({
    options = [],
    selectedKindId = "",
    onSelectKind,
    onContinue,
    onBack,
    backLabel = "Back Home",
    showBackButton = true,
}) => {
    const selectedOption = options.find((option) => option.id === selectedKindId) || null;
    const SelectedIcon = selectedOption ? ICON_BY_OPTION_ID[selectedOption.id] || FaFileAlt : FaFileAlt;

    return (
        <div className="mocktest-portal-wrap flex min-h-0 flex-1 flex-col overflow-y-auto bg-[color:var(--color-bg,#f8fafc)]">
            <div className="mocktest-portal-card w-full max-w-6xl mx-auto flex flex-1 flex-col justify-between">
                {/* Header with Back to Home button at top */}
                <div className="mocktest-portal-head flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 bg-white px-4 py-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        {showBackButton ? (
                            <button
                                type="button"
                                onClick={onBack}
                                aria-label={backLabel}
                                title="Back to Home"
                                className="mocktest-secondary-btn inline-flex min-h-[36px] min-w-[36px] w-[36px] h-[36px] sm:min-h-[38px] sm:min-w-[38px] sm:w-[38px] sm:h-[38px] items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0 mt-0.5"
                            >
                                <FiHome className="text-base sm:text-lg shrink-0" />
                            </button>
                        ) : null}

                        <div>
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-800 mb-1.5 sm:mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
                                </span>
                                <span>GATE CBT Exam Simulator</span>
                            </div>
                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900">
                                Choose Attempt Type
                            </h1>
                            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
                                Practice with real GATE questions under authentic examination conditions.
                            </p>
                        </div>
                    </div>

                    <div className="mocktest-portal-selection flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2 shadow-xs">
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Mode</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                                {selectedOption ? selectedOption.title : "None"}
                            </p>
                        </div>
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm shrink-0">
                            <SelectedIcon className="text-xs sm:text-sm" />
                        </div>
                    </div>
                </div>

                {/* Option Cards Grid - exactly 2 modes: Past Papers & Custom Builder */}
                <div className="flex-1 flex flex-col justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <div className="mocktest-portal-grid grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 max-w-4xl mx-auto w-full">
                        {options.map((option) => {
                            const isSelected = selectedKindId === option.id;
                            const Icon = ICON_BY_OPTION_ID[option.id] || FaFileAlt;
                            const theme = THEME_BY_OPTION_ID[option.id] || THEME_BY_OPTION_ID.paper_mode;

                            return (
                                <button
                                    key={option.id}
                                    data-testid={`mock-portal-option-${option.id}`}
                                    type="button"
                                    onClick={() => onSelectKind(option.id)}
                                    className={`mocktest-portal-option mocktest-portal-option--${option.id} group relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                        isSelected
                                            ? `is-selected ${theme.borderSelected} ${theme.bgSelected} ${theme.ringSelected} shadow-md`
                                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                    }`}
                                >
                                    <div>
                                        {/* Card Top Row: Icon + Badge + Radio Check */}
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                className={`mocktest-portal-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg transition-all ${
                                                    isSelected
                                                        ? theme.iconSelected
                                                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200/80"
                                                }`}
                                            >
                                                <Icon />
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {option.badge ? (
                                                    <span
                                                        className={`mocktest-portal-badge inline-flex rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                                                            isSelected
                                                                ? theme.badgeSelected
                                                                : "border-slate-200 bg-slate-50 text-slate-600"
                                                        }`}
                                                    >
                                                        {option.badge}
                                                    </span>
                                                ) : null}

                                                {/* Radio indicator */}
                                                <span
                                                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                                                        isSelected
                                                            ? theme.radioSelected
                                                            : "border-slate-300 bg-white group-hover:border-slate-400"
                                                    }`}
                                                >
                                                    {isSelected ? <FaCheck className="text-[10px]" /> : null}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title & Subtitle */}
                                        <div className="mt-3 font-display text-xl sm:text-2xl font-normal tracking-tight text-slate-900 group-hover:text-slate-950">
                                            {option.title}
                                        </div>
                                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                                            {option.subtitle}
                                        </p>

                                        {/* Fact Chips */}
                                        <div className="mt-3.5 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                                            <span className="mocktest-portal-fact inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-slate-700 shadow-2xs tabular-nums">
                                                <FiFileText className="text-slate-400 text-xs shrink-0" />
                                                {option.facts.count}
                                            </span>
                                            <span className="mocktest-portal-fact inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-slate-700 shadow-2xs tabular-nums">
                                                <FiClock className="text-slate-400 text-xs shrink-0" />
                                                {option.facts.duration}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Helper Footer */}
                                    {option.helper ? (
                                        <div className="mt-3.5 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-500">
                                            {option.helper}
                                        </div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 bg-white px-4 py-3 sm:px-6 lg:px-8">
                    <button
                        data-testid="mock-portal-continue"
                        type="button"
                        onClick={onContinue}
                        disabled={!selectedKindId}
                        className="mocktest-primary-btn group inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-5 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:scale-100 shadow-sm"
                    >
                        <span>{selectedOption ? `Continue with ${selectedOption.title}` : "Continue"}</span>
                        <FaArrowRight className="text-xs transition-transform duration-150 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestPortal;
