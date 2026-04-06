import React from "react";
import {
    FaArrowRight,
    FaBolt,
    FaFileAlt,
    FaSlidersH,
} from "react-icons/fa";

const ICON_BY_OPTION_ID = {
    full_length: FaBolt,
    paper_mode: FaFileAlt,
    custom: FaSlidersH,
};

const MockTestPortal = ({
    options = [],
    selectedKindId = "",
    onSelectKind,
    onContinue,
    onBack,
    showBackButton = true,
}) => {
    const selectedOption = options.find((option) => option.id === selectedKindId) || null;

    return (
        <div className="mocktest-portal-wrap flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-6">
            <div className="mocktest-portal-card w-full max-w-6xl rounded-[var(--radius-hero)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
                <div className="p-6 lg:p-8">
                    <div className="mocktest-portal-grid grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {options.map((option) => {
                        const isSelected = selectedKindId === option.id;
                        const Icon = ICON_BY_OPTION_ID[option.id] || FaBolt;
                        return (
                            <button
                                key={option.id}
                                data-testid={`mock-portal-option-${option.id}`}
                                type="button"
                                onClick={() => onSelectKind(option.id)}
                                className={`mocktest-portal-option w-full rounded-[var(--radius-card)] border p-5 text-left transition-all ${isSelected
                                    ? "border-emerald-300 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] shadow-[var(--shadow-soft)] ring-2 ring-emerald-100"
                                    : "border-[color:var(--color-border)] bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[var(--shadow-soft)]"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isSelected
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-sky-50 text-sky-700"
                                        }`}>
                                        <Icon />
                                    </span>
                                    {option.badge ? (
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${isSelected
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                            }`}>
                                            {option.badge}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="mt-5 text-lg font-semibold text-slate-950">{option.title}</div>
                                <div className="mt-2 text-sm leading-6 text-slate-600">{option.subtitle}</div>
                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                        {option.facts.count}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                        {option.facts.duration}
                                    </span>
                                </div>
                                {option.helper ? (
                                    <p className="mt-4 text-sm leading-6 text-slate-500">{option.helper}</p>
                                ) : null}
                            </button>
                        );
                    })}
                    </div>
                </div>

                <div className={`flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] px-6 py-4 lg:px-8 ${showBackButton ? "justify-between" : "justify-end"}`}>
                    {showBackButton ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            Back
                        </button>
                    ) : null}
                    <button
                        data-testid="mock-portal-continue"
                        type="button"
                        onClick={onContinue}
                        disabled={!selectedKindId}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {selectedOption ? `Continue with ${selectedOption.title}` : "Continue"}
                        <FaArrowRight className="text-xs" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestPortal;
