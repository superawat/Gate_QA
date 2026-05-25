import React, { useMemo } from "react";
import { FaBolt, FaChartLine, FaCompass, FaRegClock } from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import StreakBanner from "../components/Home/StreakBanner";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";
import { loadStudyActivityFast } from "../utils/weakTopicAnalyzer";
import { getQuoteForToday } from "../utils/motivationalQuotes";

const HomePage = ({
  hasResumeRoute,
  mockModeEnabled,
  onStartRandomPractice,
  onExplorePractice,
  onOpenInsights = () => {},
  onStartMockTest,
  onResumePractice,
}) => {
  const activity = useMemo(() => loadStudyActivityFast(), []);

  const parsedQuote = useMemo(() => {
    const raw = getQuoteForToday();
    const parts = raw.split(" — ");
    return {
      text: parts[0] || raw,
      author: parts[1] || "",
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

  return (
    <PageShell
      contentClassName="home-dashboard-shell"
      onResume={hasResumeRoute ? onResumePractice : null}
      resumeLabel="Continue"
    >
      <h1 className="sr-only">GateQA practice dashboard</h1>

      <section className="home-quick-actions" aria-label="Dashboard actions">
        <button
          type="button"
          onClick={onStartRandomPractice}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="home-action-card home-action-card--primary group text-left"
        >
          <span className="home-action-icon">
            <FaBolt size={18} />
          </span>
          <span className="home-action-copy">
            <span className="home-action-label">Practice</span>
            <span className="home-action-subtext">Start with a fresh question</span>
          </span>

          <span className="home-action-quote-container">
            <span className="home-action-quote">“{parsedQuote.text}”</span>
            {parsedQuote.author && (
              <span className="home-action-quote-author">— {parsedQuote.author}</span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onExplorePractice}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="home-action-card home-action-card--secondary group text-left"
        >
          <span className="home-action-icon">
            <FaCompass size={18} />
          </span>
          <span className="home-action-copy">
            <span className="home-action-label">Filter Questions</span>
            <span className="home-action-subtext">By subject and year</span>
          </span>
        </button>

        <button
          type="button"
          onClick={mockModeEnabled ? onStartMockTest : undefined}
          disabled={!mockModeEnabled}
          onMouseMove={mockModeEnabled ? handleMouseMove : undefined}
          onMouseLeave={mockModeEnabled ? handleMouseLeave : undefined}
          className={`home-action-card home-action-card--secondary group text-left ${mockModeEnabled ? "" : "home-action-card--disabled"}`}
        >
          <span className="home-action-icon">
            <FaRegClock size={18} />
          </span>
          <span className="home-action-copy">
            <span className="home-action-label">Mock Test</span>
            <span className="home-action-subtext">Full-length practice</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenInsights}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="home-action-card home-action-card--secondary group text-left"
        >
          <span className="home-action-icon">
            <FaChartLine size={18} />
          </span>
          <span className="home-action-copy">
            <span className="home-action-label">Performance Insights</span>
            <span className="home-action-subtext">Track your progress</span>
          </span>
        </button>
      </section>

      <section className="home-gamification-dashboard" aria-label="Gamification stats">
        <StreakBanner />
        <ActivityHeatmap
          attemptTimeline={activity?.attemptTimeline || []}
          streakDateKeys={activity?.streakDateKeys || []}
        />
      </section>
    </PageShell>

  );
};

export default HomePage;
