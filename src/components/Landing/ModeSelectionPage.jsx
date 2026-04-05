import React, { useState } from "react";
import ModeCard from "./ModeCard";
import LoadingState from "../Loaders/LoadingState";
import { MOCK_TEST_MODE_ENABLED } from "../../constants/featureFlags";

const DiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" />
    <circle cx="15" cy="9" r="1.2" fill="currentColor" />
    <circle cx="9" cy="15" r="1.2" fill="currentColor" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return new Intl.NumberFormat("en-IN").format(numeric);
};

const ModeSelectionPage = ({
  onModeStart,
  onResumePractice,
  hasPriorProgress,
  questionBankManifest,
  manifestLoading,
  manifestError,
}) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const isStartDisabled = selectedMode === null;
  const questionCountLabel = formatNumber(questionBankManifest?.questionCount);
  const latestYear = Number(questionBankManifest?.latestYear);
  const yearSetCount = Array.isArray(questionBankManifest?.yearSets)
    ? questionBankManifest.yearSets.length
    : 0;

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleStart = () => {
    if (!selectedMode) {
      return;
    }

    onModeStart(selectedMode);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Practice Mode</h1>
        <p className="mt-2 text-sm text-gray-500">Select how you want to practice today</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {manifestLoading ? (
            <LoadingState
              label="Loading question bank summary..."
              size="sm"
              layout="inline"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
              textClassName="text-xs font-semibold text-slate-700"
              loaderProps={{
                trackColor: "#e2e8f0",
                barColor: "#475569",
              }}
            />
          ) : null}

          {!manifestLoading && manifestError ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Question bank summary unavailable
            </div>
          ) : null}

          {!manifestLoading && !manifestError && questionCountLabel ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {questionCountLabel} questions ready
            </div>
          ) : null}

          {!manifestLoading && !manifestError && Number.isFinite(latestYear) ? (
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Through {latestYear}
            </div>
          ) : null}

          {!manifestLoading && !manifestError && yearSetCount > 0 ? (
            <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {yearSetCount} year sets
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ModeCard
          title="Random Practice"
          description="Jump straight into question solving with a randomised mix. No setup needed."
          icon={<DiceIcon />}
          selected={selectedMode === "random"}
          disabled={false}
          onClick={() => handleModeSelect("random")}
        />

        <ModeCard
          title="Targeted Practice"
          description="Choose subjects, topics, or question types and focus your session."
          icon={<TargetIcon />}
          selected={selectedMode === "targeted"}
          disabled={false}
          onClick={() => handleModeSelect("targeted")}
        />

        <ModeCard
          title="Mock Test"
          description="Full timed exam simulation replicating the GATE 2026 UI."
          badge="Coming Soon"
          icon={<ClockIcon />}
          selected={selectedMode === "mock"}
          disabled={!MOCK_TEST_MODE_ENABLED}
          onClick={() => handleModeSelect("mock")}
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-xl">
        <button
          type="button"
          onClick={handleStart}
          disabled={isStartDisabled}
          className={`w-full rounded-lg py-3 font-semibold text-white ${isStartDisabled
            ? "cursor-not-allowed bg-blue-600 opacity-50"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          Start &rarr;
        </button>

        {hasPriorProgress ? (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onResumePractice}
              className="cursor-pointer text-sm text-gray-500 underline hover:text-gray-700"
            >
              Continue where you left off &rarr;
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ModeSelectionPage;
