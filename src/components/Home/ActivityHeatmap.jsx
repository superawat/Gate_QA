import React, { useMemo, useState, useEffect } from "react";

const getIntensityClass = (attempts) => {
  if (attempts === 0) return "home-activity-intensity--0";
  if (attempts < 4) return "home-activity-intensity--1";
  if (attempts < 8) return "home-activity-intensity--2";
  return "home-activity-intensity--3";
};

const formatDuration = (ms) => {
  if (!ms) return "0m";
  const mins = Math.floor(ms / 60000);
  if (mins === 0) return "< 1m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getMonthShortName = (monthIndex) => (
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex]
);

export const ActivityHeatmap = ({ attemptTimeline = [], now = new Date(), streakDateKeys = [] }) => {
  const streakDateSet = useMemo(() => new Set(streakDateKeys), [streakDateKeys]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const { grid, monthLabels } = useMemo(() => {
    const timelineMap = new Map();
    attemptTimeline.forEach((entry) => {
      timelineMap.set(entry.date, entry);
    });

    const todayKey = new Date(now).toISOString().split("T")[0];
    const today = new Date(`${todayKey}T00:00:00.000Z`);
    const startDay = new Date(today);
    
    // Last 12 weeks = 83 days + today = 84 days. 364 days + today = 365 days.
    const totalDays = isMobile ? 83 : 364;
    startDay.setUTCDate(today.getUTCDate() - totalDays);

    const days = [];
    const labels = [];
    let currentMonth = -1;

    let firstMonthChangeIndex = 0;
    const initialMonth = new Date(startDay).getUTCMonth();
    for (let i = 0; i <= totalDays; i += 1) {
      const d = new Date(startDay);
      d.setUTCDate(startDay.getUTCDate() + i);
      if (d.getUTCMonth() !== initialMonth) {
        firstMonthChangeIndex = i;
        break;
      }
    }

    for (let i = 0; i <= totalDays; i += 1) {
      const d = new Date(startDay);
      d.setUTCDate(startDay.getUTCDate() + i);
      const dateKey = d.toISOString().split("T")[0];
      const month = d.getUTCMonth();

      if (month !== currentMonth) {
        const weekIndex = Math.floor(i / 7);
        if (currentMonth === -1 && firstMonthChangeIndex < 12) {
          currentMonth = month;
        } else {
          labels.push({ label: getMonthShortName(month), weekIndex });
          currentMonth = month;
        }
      }

      const activity = timelineMap.get(dateKey);
      days.push({
        date: d,
        dateKey,
        attempts: activity?.attempts || 0,
        accuracy: activity?.accuracyRate || 0,
        durationMs: activity?.totalDurationMs || 0,
        correct: activity?.correct || 0,
      });
    }

    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }

    return { grid: cols, monthLabels: labels };
  }, [attemptTimeline, now, isMobile]);

  return (
    <div className="home-activity-heatmap">
      <div className="home-activity-header">
        <h3>Practice Activity</h3>
        <label htmlFor="activity-year" className="sr-only">Activity range</label>
        <select id="activity-year" value="rolling" onChange={() => {}} aria-label="Activity range">
          <option value="rolling">{isMobile ? "Last 12 weeks" : "Last 365 days"}</option>
        </select>
      </div>

      <div className="home-activity-scroll" aria-label="Practice activity heatmap">
        <div className="home-activity-y-axis" aria-hidden="true">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        <div className="home-activity-grid-wrap">
          <div className="home-activity-months" aria-hidden="true">
            {monthLabels.map((month, index) => (
              <span
                key={`${month.label}-${index}`}
                style={{ left: `calc(${month.weekIndex} * var(--home-activity-step))` }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="home-activity-grid">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="home-activity-week">
                {week.map((day) => {
                  const isStreakDay = streakDateSet.has(day.dateKey);
                  return (
                    <div
                      key={day.dateKey}
                      className={`home-activity-cell ${getIntensityClass(day.attempts)} ${
                        isStreakDay ? "home-activity-cell--streak" : ""
                      }`}
                      title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n${day.attempts} attempts (${Math.round(day.accuracy * 100)}%)\nTime spent: ${formatDuration(day.durationMs)}${isStreakDay ? "\nCurrent streak day" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-activity-legend" aria-label="Less to more activity">
        <span>Less</span>
        <i className="home-activity-cell home-activity-intensity--0" />
        <i className="home-activity-cell home-activity-intensity--1" />
        <i className="home-activity-cell home-activity-intensity--2" />
        <i className="home-activity-cell home-activity-intensity--3" />
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
