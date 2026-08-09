import React, { lazy, Suspense, useState } from "react";
import CalculatorButton from "../Calculator/CalculatorButton";
import { useAuth } from "../../contexts/AuthContext";

// Lazy-load auth components so they don't add to the initial bundle
const AuthModal = lazy(() => import("../Auth/AuthModal"));
const UserProfileMenu = lazy(() => import("../Auth/UserProfileMenu"));

const Header = ({
  appView,
  onGoHome,
  onOpenFilters,
  onToggleCalculator,
  isCalculatorOpen,
  calculatorButtonRef,
}) => {
  const isLandingView = appView === "landing";
  const showHomeButton = !isLandingView && !!onGoHome;
  const showCalculatorButton = !isLandingView && !!onToggleCalculator;
  const showFilterButton = !isLandingView && !!onOpenFilters;

  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <a
              href={import.meta.env.BASE_URL}
              className="app-header-logo-frame shrink-0 transition-opacity hover:opacity-80"
              aria-label="Go to home page"
            >
              <img
                src="logo.png"
                alt="GATE QA Logo"
                width="40"
                height="40"
                className="logo-icon app-header-logo h-8 w-8 object-contain sm:h-10 sm:w-10"
              />
            </a>

            <div className="hidden min-w-0 text-left sm:block">
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

          <div className="flex shrink-0 items-center gap-2">
            {showHomeButton && (
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-white shadow-sm transition-colors bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium"
                aria-label="Back to Practice Modes"
                title="Back to Practice Modes"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Back to Modes</span>
                <span className="inline sm:hidden">Modes</span>
              </button>
            )}

            {showCalculatorButton && (
              <CalculatorButton
                ref={calculatorButtonRef}
                onClick={onToggleCalculator}
                isOpen={isCalculatorOpen}
              />
            )}

            {showFilterButton && (
              <button
                onClick={onOpenFilters}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-white shadow-sm transition-colors hover:bg-gray-700"
                aria-label="Open filters"
                title="Filters"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="sr-only">Filters</span>
              </button>
            )}

            {/* ── Auth Area: shows Sign In button (guest) or avatar menu (signed in) ── */}
            {!authLoading && (
              <Suspense fallback={null}>
                {user ? (
                  <UserProfileMenu />
                ) : (
                  <button
                    id="header-signin-btn"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-400 sm:text-sm"
                    onClick={() => setShowAuthModal(true)}
                    aria-label="Sign in with Google"
                    title="Sign in to back up your progress"
                  >
                    {/* Google G logo */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    >
                      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.3C9.6 35.7 16.3 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2C36.9 40.5 44 35 44 24c0-1.3-.1-2.7-.4-3.9z"/>
                    </svg>
                    <span className="hidden sm:inline">Sign in</span>
                  </button>
                )}
              </Suspense>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal — rendered outside header to avoid z-index conflicts */}
      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal onClose={() => setShowAuthModal(false)} />
        </Suspense>
      )}
    </>
  );
};

export default Header;
