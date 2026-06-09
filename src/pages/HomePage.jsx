import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBolt, FaChartLine, FaCompass, FaRegClock } from "react-icons/fa";

import SEOHead, { buildFAQPageSchema } from "../components/SEO/SEOHead";

const HOMEPAGE_FAQS = [
  {
    question: "What is the GATE CS exam?",
    answer: "GATE (Graduate Aptitude Test in Engineering) CS is a national-level exam testing Computer Science fundamentals for M.Tech admissions and PSU jobs."
  },
  {
    question: "How many GATE CS previous year questions are available on GateQA?",
    answer: "GateQA provides 3,500+ GATE CS previous-year questions from 1987 to 2026, spanning all 14 subjects in the official GATE CSE syllabus."
  },
  {
    question: "Is GateQA free?",
    answer: "Yes, GateQA is 100% free. No login, no payment, no subscription. All features including offline mode work without an account."
  },
  {
    question: "Which subjects does GATE CS cover?",
    answer: "GATE CS covers: Algorithms, Data Structures, Operating Systems, DBMS, Computer Networks, Theory of Computation, Compiler Design, Digital Logic, Computer Organization, Engineering Mathematics, Discrete Mathematics, and Software Engineering."
  },
  {
    question: "How can I practice GATE 2027 questions?",
    answer: "Start by practicing GATE CS previous year questions from 2024, 2025, and 2026 on GateQA to understand the current exam pattern."
  }
];

import PageShell from "../components/Layout/PageShell";
import StreakBanner from "../components/Home/StreakBanner";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";
import { loadStudyActivityFast } from "../utils/weakTopicAnalyzer";
import { getQuoteForToday } from "../utils/motivationalQuotes";
import {
  preloadExploreRoute,
  preloadInsightsRoute,
  preloadMockExperience,
  preloadPracticeStartExperience,
} from "../utils/routePreload";

const HOME_LOADER_EXIT_MS = 260;

const HomePageLoadingOverlay = ({ exiting }) => (
  <div
    className={`home-page-loader${exiting ? " home-page-loader--exit" : ""}`}
    role="status"
    aria-live="polite"
    aria-label="Preparing GateQA dashboard"
  >
    <div className="home-page-loader-mark" aria-hidden="true" />
    <p>Preparing dashboard</p>
  </div>
);

const HomePage = ({
  hasResumeRoute,
  mockModeEnabled,
  onStartRandomPractice,
  onExplorePractice,
  onOpenInsights = () => {},
  onStartMockTest,
  onResumePractice,
}) => {
  const [isHomeReady, setIsHomeReady] = useState(false);
  const [showHomeLoader, setShowHomeLoader] = useState(true);
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const activeActionIndexRef = useRef(0);
  const actionsRailRef = useRef(null);
  const activity = useMemo(() => loadStudyActivityFast(), []);

  const parsedQuote = useMemo(() => {
    const raw = getQuoteForToday();
    const [text, author = ""] = raw.split(/\s+(?:\u2014|-)\s+/);
    return {
      text: text || raw,
      author,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHomeReady(true);
      setShowHomeLoader(false);
      return undefined;
    }

    let cancelled = false;
    let firstFrame = null;
    let secondFrame = null;
    let exitTimer = null;
    let removeLoadListener = () => {};

    const requestFrame =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback) => window.setTimeout(callback, 16);
    const cancelFrame =
      typeof window.cancelAnimationFrame === "function"
        ? window.cancelAnimationFrame.bind(window)
        : window.clearTimeout.bind(window);

    const waitForWindowLoad =
      typeof document !== "undefined" && document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            const handleLoad = () => resolve();
            removeLoadListener = () => window.removeEventListener("load", handleLoad);
            window.addEventListener("load", handleLoad, { once: true });
          });

    const waitForFonts =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    Promise.all([waitForWindowLoad, waitForFonts]).then(() => {
      if (cancelled) {
        return;
      }

      firstFrame = requestFrame(() => {
        secondFrame = requestFrame(() => {
          if (cancelled) {
            return;
          }

          setIsHomeReady(true);
          exitTimer = window.setTimeout(() => {
            if (!cancelled) {
              setShowHomeLoader(false);
            }
          }, HOME_LOADER_EXIT_MS);
        });
      });
    });

    return () => {
      cancelled = true;
      removeLoadListener();
      if (firstFrame !== null) {
        cancelFrame(firstFrame);
      }
      if (secondFrame !== null) {
        cancelFrame(secondFrame);
      }
      if (exitTimer !== null) {
        window.clearTimeout(exitTimer);
      }
    };
  }, []);

  useEffect(() => {
    const rail = actionsRailRef.current;
    if (!rail || typeof window === "undefined") {
      return undefined;
    }

    let frameId = null;
    const requestFrame =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback) => window.setTimeout(callback, 16);
    const cancelFrame =
      typeof window.cancelAnimationFrame === "function"
        ? window.cancelAnimationFrame.bind(window)
        : window.clearTimeout.bind(window);

    const updateActiveCard = () => {
      frameId = null;
      const cards = Array.from(rail.querySelectorAll("[data-home-action-index]"));
      if (cards.length === 0) {
        return;
      }

      const railRect = rail.getBoundingClientRect();
      const railCenter = railRect.left + railRect.width / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - railCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex !== activeActionIndexRef.current) {
        activeActionIndexRef.current = nearestIndex;
        setActiveActionIndex(nearestIndex);
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }
      frameId = requestFrame(updateActiveCard);
    };

    scheduleUpdate();
    rail.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      rail.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) {
        cancelFrame(frameId);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rx = -(y / (box.height / 2)) * 6;
    const ry = (x / (box.width / 2)) * 6;
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  const handleActionPreload = (preload) => {
    if (typeof preload === "function") {
      void preload();
    }
  };

  const actionCards = [
    {
      key: "practice",
      label: "Practice",
      subtext: "Start with a fresh question",
      icon: FaBolt,
      variant: "primary",
      onClick: onStartRandomPractice,
      preload: preloadPracticeStartExperience,
      quote: parsedQuote,
    },
    {
      key: "filter",
      label: "Filter Questions",
      subtext: "By subject and year",
      icon: FaCompass,
      variant: "secondary",
      onClick: onExplorePractice,
      preload: preloadExploreRoute,
    },
    {
      key: "mock",
      label: "Mock Test",
      subtext: "Full-length practice",
      icon: FaRegClock,
      variant: "secondary",
      disabled: !mockModeEnabled,
      onClick: onStartMockTest,
      preload: preloadMockExperience,
    },
    {
      key: "insights",
      label: "Performance Insights",
      subtext: "Track your progress",
      icon: FaChartLine,
      variant: "secondary",
      onClick: onOpenInsights,
      preload: preloadInsightsRoute,
    },
  ];

  return (
    <>
      <SEOHead
        title="GateQA — GATE CS PYQs, Mock Tests, Aptitude Practice & Calculator"
        description="Practice 3500+ GATE CS PYQs from 1987–2026, 36000+ Aptitude questions, subject-wise mock tests, GATE calculator, insights, notes and bookmarks. Free and offline-first."
        path="/"
        schemaOrg={buildFAQPageSchema(HOMEPAGE_FAQS)}
      />
      <PageShell
        contentClassName="home-dashboard-shell"
        onResume={hasResumeRoute ? onResumePractice : null}
        resumeLabel="Continue"
      >
        <div
          className={`home-dashboard-content${isHomeReady ? " home-dashboard-content--ready" : ""}`}
          aria-busy={!isHomeReady}
        >
          <h1 className="sr-only">GateQA practice dashboard</h1>

          <div className="home-actions-wrap">
            <section
              ref={actionsRailRef}
              className="home-quick-actions"
              aria-label="Dashboard actions"
              aria-roledescription="carousel"
            >
              {actionCards.map((card, index) => {
                const Icon = card.icon;
                const isDisabled = Boolean(card.disabled);
                const isActive = index === activeActionIndex;

                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={isDisabled ? undefined : card.onClick}
                    disabled={isDisabled}
                    onPointerEnter={isDisabled ? undefined : () => handleActionPreload(card.preload)}
                    onFocus={isDisabled ? undefined : () => handleActionPreload(card.preload)}
                    onTouchStart={isDisabled ? undefined : () => handleActionPreload(card.preload)}
                    onMouseMove={isDisabled ? undefined : handleMouseMove}
                    onMouseLeave={isDisabled ? undefined : handleMouseLeave}
                    data-home-action-index={index}
                    aria-current={isActive ? "true" : undefined}
                    className={`home-action-card home-action-card--${card.variant} ${isActive ? "home-action-card--active" : "home-action-card--side"} group text-left ${isDisabled ? "home-action-card--disabled" : ""}`}
                  >
                    <span className="home-action-icon">
                      <Icon size={18} />
                    </span>
                    <span className="home-action-copy">
                      <span className="home-action-label">{card.label}</span>
                      <span className="home-action-subtext">{card.subtext}</span>
                    </span>

                    {card.quote ? (
                      <span className="home-action-quote-container">
                        <span className="home-action-quote">"{card.quote.text}"</span>
                        {card.quote.author ? (
                          <span className="home-action-quote-author">- {card.quote.author}</span>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </section>
            <div className="home-action-carousel-dots" aria-hidden="true">
              {actionCards.map((card, index) => (
                <span
                  key={card.key}
                  className={index === activeActionIndex ? "home-action-carousel-dot--active" : ""}
                />
              ))}
            </div>
          </div>

          <section className="home-gamification-dashboard" aria-label="Gamification stats">
            <StreakBanner />
            <ActivityHeatmap
              attemptTimeline={activity?.attemptTimeline || []}
              streakDateKeys={activity?.streakDateKeys || []}
            />
          </section>
        </div>
      </PageShell>

      {showHomeLoader ? <HomePageLoadingOverlay exiting={isHomeReady} /> : null}
    </>
  );
};

export default HomePage;
