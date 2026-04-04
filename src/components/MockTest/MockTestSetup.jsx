import React from "react";
import { QuestionService } from "../../services/QuestionService";

const TYPE_OPTIONS = ["MCQ", "MSQ", "NAT"];

const MockTestSetup = ({
    kind,
    setupState,
    yearSets = [],
    subjects = [],
    availableSubtopics = [],
    availability,
    livePreview,
    paperYearOptions = [],
    paperSetOptions = [],
    customDurationMinutes = 180,
    onBack,
    onReset,
    onStart,
    onPatchState,
    onToggleSelection,
}) => {
    const canStart = availability?.canStart;
    const requiredSummary = availability?.requiredSummary || "N/A";
    const availableSummary = availability?.availableSummary || "0";
    const validationMessage = availability?.message || "";

    return (
        <div className="mocktest-setup-wrap flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-6">
            <div className="mocktest-setup-card w-full max-w-6xl rounded-lg border border-[#b8c9d9] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1f2f40]">Mock Test Setup</h2>
                        <p className="mt-1 text-sm text-[#4f6276]">{kind.subtitle}</p>
                    </div>
                    <div className="rounded border border-[#c9d7e3] bg-[#f4f8fc] px-3 py-2 text-right text-xs text-[#2e4259]">
                        <div className="font-semibold">{kind.title}</div>
                        <div className="mt-1">
                            Required: <span className="font-bold">{requiredSummary}</span>
                        </div>
                        <div>
                            Available: <span className="font-bold">{availableSummary}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    {/* ── Left column: Filters ── */}
                    <section className="space-y-4 rounded border border-[#d1deea] bg-[#f8fbff] p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex flex-col gap-1 text-xs font-semibold text-[#33485f]">
                                Year Range Start
                                <input
                                    type="number"
                                    min={setupState.minYear}
                                    max={setupState.maxYear}
                                    value={setupState.yearRangeStart}
                                    onChange={(event) => onPatchState({ yearRangeStart: Number(event.target.value) })}
                                    className="rounded border border-[#b7c7d7] bg-white px-2 py-1.5 text-sm text-[#1f2f40]"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs font-semibold text-[#33485f]">
                                Year Range End
                                <input
                                    type="number"
                                    min={setupState.minYear}
                                    max={setupState.maxYear}
                                    value={setupState.yearRangeEnd}
                                    onChange={(event) => onPatchState({ yearRangeEnd: Number(event.target.value) })}
                                    className="rounded border border-[#b7c7d7] bg-white px-2 py-1.5 text-sm text-[#1f2f40]"
                                />
                            </label>
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-semibold text-[#33485f]">Year Sets (optional)</div>
                            <div className="mocktest-setup-checkgrid grid max-h-32 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto rounded border border-[#d3dfeb] bg-white p-2 text-xs">
                                {yearSets.map((yearSet) => (
                                    <label key={yearSet.key} className="flex cursor-pointer items-center gap-1.5 text-[#2f445a]">
                                        <input
                                            type="checkbox"
                                            checked={setupState.selectedYearSets.includes(yearSet.key)}
                                            onChange={() => onToggleSelection("selectedYearSets", yearSet.key)}
                                        />
                                        <span>{QuestionService.formatYearSetLabel(yearSet.key)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-semibold text-[#33485f]">Subjects</div>
                            <div className="mocktest-setup-checkgrid grid max-h-36 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto rounded border border-[#d3dfeb] bg-white p-2 text-xs">
                                {subjects.map((subject) => (
                                    <label key={subject.slug} className="flex cursor-pointer items-center gap-1.5 text-[#2f445a]">
                                        <input
                                            type="checkbox"
                                            checked={setupState.selectedSubjects.includes(subject.slug)}
                                            onChange={() => onToggleSelection("selectedSubjects", subject.slug)}
                                        />
                                        <span>{subject.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-semibold text-[#33485f]">Subtopics</div>
                            <div className="mocktest-setup-checkgrid grid max-h-36 grid-cols-1 gap-y-1 overflow-y-auto rounded border border-[#d3dfeb] bg-white p-2 text-xs">
                                {availableSubtopics.length === 0 ? (
                                    <p className="text-[#6a7f94]">Select subject(s) to narrow subtopics.</p>
                                ) : (
                                    availableSubtopics.map((subtopic) => (
                                        <label key={subtopic.slug} className="flex cursor-pointer items-center gap-1.5 text-[#2f445a]">
                                            <input
                                                type="checkbox"
                                                checked={setupState.selectedSubtopics.includes(subtopic.slug)}
                                                onChange={() => onToggleSelection("selectedSubtopics", subtopic.slug)}
                                            />
                                            <span>{subtopic.label}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-semibold text-[#33485f]">Question Types</div>
                            <div className="flex flex-wrap gap-3 rounded border border-[#d3dfeb] bg-white p-2 text-xs">
                                {TYPE_OPTIONS.map((type) => (
                                    <label key={type} className="flex cursor-pointer items-center gap-1.5 text-[#2f445a]">
                                        <input
                                            type="checkbox"
                                            checked={setupState.selectedTypes.includes(type)}
                                            onChange={() => onToggleSelection("selectedTypes", type)}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Right column: Settings + Live Preview ── */}
                    <section className="space-y-4 rounded border border-[#d1deea] bg-[#f8fbff] p-4">
                        <div>
                            <h3 className="text-sm font-bold text-[#22394f]">Attempt Settings</h3>
                            <p className="mt-1 text-xs text-[#60768c]">
                                {kind.id === "custom"
                                    ? "Custom duration keeps preset anchors: 15Q=40m, 25Q=70m, 65Q=180m."
                                    : "Settings below are locked for this test kind."}
                            </p>
                        </div>

                        {kind.id === "paper_mode" && (
                            <div className="space-y-3">
                                <label className="flex flex-col gap-1 text-xs font-semibold text-[#33485f]">
                                    Year
                                    <select
                                        value={setupState.paperYear}
                                        onChange={(event) => onPatchState({ paperYear: event.target.value, paperSet: "" })}
                                        className="rounded border border-[#b7c7d7] bg-white px-2 py-1.5 text-sm text-[#1f2f40]"
                                    >
                                        <option value="">Select year</option>
                                        {paperYearOptions.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {paperSetOptions.length > 1 && (
                                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#33485f]">
                                        Set
                                        <select
                                            value={setupState.paperSet}
                                            onChange={(event) => onPatchState({ paperSet: event.target.value })}
                                            className="rounded border border-[#b7c7d7] bg-white px-2 py-1.5 text-sm text-[#1f2f40]"
                                        >
                                            <option value="">Select set</option>
                                            {paperSetOptions.map((setOption) => (
                                                <option key={setOption.key} value={String(setOption.set || 0)}>
                                                    {setOption.set ? `Set ${setOption.set}` : "Default"}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                            </div>
                        )}

                        {kind.id === "custom" ? (
                            <div className="space-y-2">
                                <label className="flex flex-col gap-1 text-xs font-semibold text-[#33485f]">
                                    Question Count (max 65)
                                    <input
                                        type="range"
                                        min={1}
                                        max={65}
                                        value={setupState.customCount}
                                        onChange={(event) => onPatchState({ customCount: Number(event.target.value) })}
                                    />
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={65}
                                    value={setupState.customCount}
                                    onChange={(event) => onPatchState({ customCount: Number(event.target.value) })}
                                    className="w-24 rounded border border-[#b7c7d7] bg-white px-2 py-1.5 text-sm text-[#1f2f40]"
                                />
                                <p className="text-xs text-[#4f6276]">
                                    Estimated duration: <span className="font-semibold">{customDurationMinutes} min</span>
                                </p>
                            </div>
                        ) : (
                            <div className="rounded border border-[#d3dfeb] bg-white p-2 text-xs text-[#2f445a]">
                                <div>
                                    Question Count: <span className="font-semibold">{requiredSummary}</span>
                                </div>
                                <div className="mt-1">
                                    Duration: <span className="font-semibold">{kind.durationLabel}</span>
                                </div>
                            </div>
                        )}

                        {/* ── Issue 007: Live Preview Summary ── */}
                        {livePreview && (
                            <div className="mocktest-live-preview rounded border border-[#b8d4e8] bg-[#eaf3fb] p-3">
                                <h4 className="mb-2 text-xs font-bold text-[#1a3853]">
                                    Live Pool Preview
                                </h4>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="rounded bg-white px-2 py-1.5 shadow-sm">
                                        <div className="text-lg font-bold text-[#0e76a8]" data-testid="preview-total">{livePreview.total}</div>
                                        <div className="text-[10px] text-[#5a7089]">Total</div>
                                    </div>
                                    <div className="rounded bg-white px-2 py-1.5 shadow-sm">
                                        <div className="text-lg font-bold text-[#2e7d32]" data-testid="preview-ga">{livePreview.gaCount}</div>
                                        <div className="text-[10px] text-[#5a7089]">GA</div>
                                    </div>
                                    <div className="rounded bg-white px-2 py-1.5 shadow-sm">
                                        <div className="text-lg font-bold text-[#6a1b9a]" data-testid="preview-cs">{livePreview.csCount}</div>
                                        <div className="text-[10px] text-[#5a7089]">CS</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-[#3d5570]">
                                    <span>
                                        <span className="font-semibold" data-testid="preview-mcq">{livePreview.mcqCount}</span> MCQ
                                    </span>
                                    <span className="text-[#b0bfcc]">|</span>
                                    <span>
                                        <span className="font-semibold" data-testid="preview-msq">{livePreview.msqCount}</span> MSQ
                                    </span>
                                    <span className="text-[#b0bfcc]">|</span>
                                    <span>
                                        <span className="font-semibold" data-testid="preview-nat">{livePreview.natCount}</span> NAT
                                    </span>
                                </div>
                            </div>
                        )}

                        {!canStart && validationMessage && (
                            <div className="rounded border border-[#e3b7b7] bg-[#fff2f2] p-2 text-xs text-[#9b2a2a]">
                                {validationMessage}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#d5e1ec] pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        {onReset && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                            >
                                Reset
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onStart}
                            disabled={!canStart}
                            className="rounded border border-[#0d6ea1] bg-[#0e76a8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b658f] disabled:cursor-not-allowed disabled:border-[#9db7c7] disabled:bg-[#b8c8d4]"
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
