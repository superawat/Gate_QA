import React from "react";

const MockTestPortal = ({
    options = [],
    selectedKindId = "",
    onSelectKind,
    onContinue,
    onBack,
}) => {
    return (
        <div className="mocktest-portal-wrap flex min-h-0 flex-1 items-center justify-center p-6">
            <div className="mocktest-portal-card w-full max-w-6xl rounded-lg border border-[#b8c9d9] bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-[#1f2f40]">Mock Test Portal</h2>
                    <p className="mt-1 text-sm text-[#4f6276]">
                        Choose what kind of test you want to attempt.
                    </p>
                </div>

                <div className="mocktest-portal-grid mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {options.map((option) => {
                        const isSelected = selectedKindId === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => onSelectKind(option.id)}
                                className={`mocktest-portal-option w-full rounded-md border p-4 text-left transition-colors ${isSelected
                                    ? "border-[#0d6ea1] bg-[#e9f5fc] shadow-[inset_0_0_0_1px_#0d6ea1]"
                                    : "border-[#d2dee9] bg-[#f9fcff] hover:border-[#b4c6d8]"
                                    }`}
                            >
                                <div className="text-sm font-bold text-[#1e3144]">{option.title}</div>
                                <div className="mt-1 text-xs text-[#5d7085]">{option.subtitle}</div>
                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#254058]">
                                    <span className="rounded bg-[#e2edf7] px-2 py-1 font-semibold">
                                        {option.facts.count}
                                    </span>
                                    <span className="rounded bg-[#e2edf7] px-2 py-1 font-semibold">
                                        {option.facts.duration}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between border-t border-[#d5e1ec] pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={!selectedKindId}
                        className="rounded border border-[#0d6ea1] bg-[#0e76a8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b658f] disabled:cursor-not-allowed disabled:border-[#9db7c7] disabled:bg-[#b8c8d4]"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestPortal;
