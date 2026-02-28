import React, { useState } from "react";
import ModeCard from "./ModeCard";
import { useFilterActions } from "../../contexts/FilterContext";

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

const ModeSelectionPage = ({ onModeStart, hasPriorProgress }) => {
  const { clearFilters } = useFilterActions();

  const [selectedMode, setSelectedMode] = useState(null);

  const isStartDisabled = selectedMode === null;

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleStart = () => {
    if (!selectedMode) {
      return;
    }

    if (selectedMode === "random") {
      clearFilters();
    }

    onModeStart(selectedMode);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Practice Mode</h1>
        <p className="mt-2 text-sm text-gray-500">Select how you want to practice today</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ModeCard
          title="Random Practice"
          description="Jump into 3,418 questions in a randomised order. No setup needed."
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
          description="Full timed exam simulation. Coming in a future update."
          icon={<ClockIcon />}
          selected={selectedMode === "mock"}
          disabled={true}
          onClick={() => handleModeSelect("mock")}
          badge="Coming soon"
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-xl">
        <button
          type="button"
          onClick={handleStart}
          disabled={isStartDisabled}
          className={`w-full rounded-lg py-3 font-semibold text-white ${
            isStartDisabled
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
              onClick={() => onModeStart("random")}
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
