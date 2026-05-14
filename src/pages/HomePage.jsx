import React, { useMemo } from "react";
import { FaBolt, FaChartLine, FaCompass, FaRegClock } from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import StreakBanner from "../components/Home/StreakBanner";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";
import { loadStudyActivityFast } from "../utils/weakTopicAnalyzer";

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
          className="home-action-card home-action-card--primary group text-left"
        >
          <span className="home-action-icon">
            <FaBolt size={18} />
          </span>
          <span className="home-action-copy">
            <span className="home-action-label">Practice</span>
            <span className="home-action-subtext">Start with a fresh question</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onExplorePractice}
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

      <StreakBanner />

      <section>
        <ActivityHeatmap
          attemptTimeline={activity?.attemptTimeline || []}
          streakDateKeys={activity?.streakDateKeys || []}
        />
      </section>
    </PageShell>
  );
};

export default HomePage;
