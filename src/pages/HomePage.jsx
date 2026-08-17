import React, { useEffect, useMemo, useRef, useState } from "react";
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
    question: "Who will conduct GATE 2027?",
    answer: "IIT Madras is highly anticipated to be the organizing institute for GATE 2027, following the rotational cycle after IIT Roorkee (2025) and IIT Guwahati (2026)."
  },
  {
    question: "How to prepare for GATE CSE?",
    answer: "The most effective preparation strategy is to thoroughly solve previous year questions (PYQs). Focus heavily on high-weightage subjects like Data Structures, Algorithms, Operating Systems, and Engineering Mathematics."
  },
  {
    question: "What is a good score in GATE CSE?",
    answer: "A GATE score above 750 (out of 1000) is generally considered excellent for securing M.Tech admissions in top-tier institutes like IIT Bombay, IIT Madras, IIT Delhi, and IISc Bangalore."
  }
];

import PageShell from "../components/Layout/PageShell";
import StreakBanner from "../components/Home/StreakBanner";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";
import { loadStudyActivityFast } from "../utils/weakTopicAnalyzer";
import { getQuoteForToday } from "../utils/motivationalQuotes";
import { FaQuoteLeft } from "react-icons/fa";
import {
  preloadExploreRoute,
  preloadInsightsRoute,
  preloadMockExperience,
  preloadPracticeStartExperience,
} from "../utils/routePreload";

const HOME_LOADER_EXIT_MS = 260;

const HOMEPAGE_ICON_BASE = "/homepage_icon/optimized";

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
  const cardRectCache = useRef(null);
  const [activity, setActivity] = useState(() => loadStudyActivityFast());

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
      return undefined;
    }

    const refreshActivity = () => {
      setActivity(loadStudyActivityFast());
    };

    // Auth sync, local question attempts, and backup imports write progress after
    // the home page is mounted. Refresh the derived streak/heatmap state immediately.
    window.addEventListener("gateqa:progress-updated", refreshActivity);
    window.addEventListener("gateqa:sync-complete", refreshActivity);
    window.addEventListener("gateqa:workspace-imported", refreshActivity);
    window.addEventListener("storage", refreshActivity);
    window.addEventListener("focus", refreshActivity);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Schedule midnight timer so date rollovers reset today's attempts seamlessly
    let midnightTimer = null;
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
      midnightTimer = setTimeout(() => {
        refreshActivity();
        scheduleMidnightRefresh();
      }, msUntilMidnight);
    };
    scheduleMidnightRefresh();

    return () => {
      window.removeEventListener("gateqa:progress-updated", refreshActivity);
      window.removeEventListener("gateqa:sync-complete", refreshActivity);
      window.removeEventListener("gateqa:workspace-imported", refreshActivity);
      window.removeEventListener("storage", refreshActivity);
      window.removeEventListener("focus", refreshActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (midnightTimer) {
        clearTimeout(midnightTimer);
      }
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
    if (!cardRectCache.current) {
      cardRectCache.current = card.getBoundingClientRect();
    }
    const box = cardRectCache.current;
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
    cardRectCache.current = null;
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
      icon: `${HOMEPAGE_ICON_BASE}/practice_no_bg.webp`,
      variant: "primary",
      onClick: onStartRandomPractice,
      preload: preloadPracticeStartExperience,
      quote: parsedQuote,
    },
    {
      key: "filter",
      label: "Filter Questions",
      subtext: "By subject and year",
      badge: "3,500+ PYQs",
      icon: `${HOMEPAGE_ICON_BASE}/filter_no_bg.webp`,
      variant: "secondary",
      onClick: onExplorePractice,
      preload: preloadExploreRoute,
    },
    {
      key: "mock",
      label: "Mock Test",
      subtext: "Full-length practice",
      badge: "1:1 CBT Simulator",
      icon: `${HOMEPAGE_ICON_BASE}/mocktest1_no_bg.webp`,
      variant: "secondary",
      disabled: !mockModeEnabled,
      onClick: onStartMockTest,
      preload: preloadMockExperience,
    },
    {
      key: "insights",
      label: "Performance Insights",
      subtext: "Track your progress",
      badge: "Analytics & Streak",
      icon: `${HOMEPAGE_ICON_BASE}/insights_no_bg.webp`,
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
                    className={`home-action-card home-action-card--${card.variant} ${isActive ? "home-action-card--active" : "home-action-card--side"} group text-center sm:text-left ${isDisabled ? "home-action-card--disabled" : ""}`}
                  >
                    <span className="home-action-icon">
                      <img
                        src={card.icon}
                        alt=""
                        width="128"
                        height="128"
                        loading="eager"
                        decoding="async"
                        aria-hidden="true"
                      />
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

                    {card.badge ? (
                      <span className="home-action-footer-badge">
                        <span className="home-action-badge-text">{card.badge}</span>
                        <span className="home-action-badge-arrow" aria-hidden="true">→</span>
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

          {parsedQuote?.text ? (
            <aside className="home-quote-banner md:hidden" aria-label="Daily inspiration">
              <FaQuoteLeft className="home-quote-icon" aria-hidden="true" />
              <p className="home-quote-body">
                <span className="home-quote-text">"{parsedQuote.text}"</span>
                {parsedQuote.author ? (
                  <span className="home-quote-author"> — {parsedQuote.author}</span>
                ) : null}
              </p>
            </aside>
          ) : null}

          <section className="home-gamification-dashboard" aria-label="Gamification stats">
            <StreakBanner activity={activity} />
            <ActivityHeatmap
              attemptTimeline={activity?.attemptTimeline || []}
              streakDateKeys={activity?.streakDateKeys || []}
              streakFreezeDates={activity?.streakFreeze?.consumedDates || []}
            />
          </section>
        </div>
      </PageShell>

      {showHomeLoader ? <HomePageLoadingOverlay exiting={isHomeReady} /> : null}
    </>
  );
};

export default HomePage;
