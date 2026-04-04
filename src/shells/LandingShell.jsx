import React from "react";
import ModeSelectionPage from "../components/Landing/ModeSelectionPage";

const LandingHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <a
                href={import.meta.env.BASE_URL}
                className="shrink-0 transition-opacity hover:opacity-80"
                aria-label="Go to home page"
            >
                <img
                    src="logo.png"
                    alt="GATE QA Logo"
                    width="40"
                    height="40"
                    className="logo-icon h-8 w-8 object-contain sm:h-10 sm:w-10"
                />
            </a>
            <div className="min-w-0 text-left">
                <h1
                    className="text-lg font-bold tracking-wide text-gray-900 sm:text-xl md:text-2xl"
                    lang="en"
                >
                    GRADUATE APTITUDE TEST IN ENGINEERING
                </h1>
                <h2
                    className="mt-1 text-sm font-medium text-gray-700 sm:text-base md:text-lg"
                    lang="hi"
                    style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
                >
                    अभियांत्रिकी स्नातक अभिक्षमता परीक्षा
                </h2>
            </div>
        </div>
    </header>
);

const LandingShell = ({ onModeStart, hasPriorProgress }) => (
    <>
        <LandingHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
            <ModeSelectionPage
                onModeStart={onModeStart}
                hasPriorProgress={hasPriorProgress}
            />
        </main>
    </>
);

export default LandingShell;
