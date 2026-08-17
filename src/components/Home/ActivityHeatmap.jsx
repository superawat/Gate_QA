import React, { useMemo, useState, useEffect, useRef } from "react";
import { toDateKey, parseDateKey, addDaysToDateKey } from "../../utils/practiceProgress";

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

export const ActivityHeatmap = ({
  attemptTimeline = [],
  now = new Date(),
  streakDateKeys = [],
  streakFreezeDates = [],
}) => {
  const streakDateSet = useMemo(() => new Set(streakDateKeys), [streakDateKeys]);
  const streakFreezeSet = useMemo(() => new Set(streakFreezeDates), [streakFreezeDates]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRange, setSelectedRange] = useState("auto");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const activeRange = selectedRange === "auto" ? (isMobile ? "12w" : "52w") : selectedRange;

  const { grid, monthLabels } = useMemo(() => {
    const timelineMap = new Map();
    attemptTimeline.forEach((entry) => {
      timelineMap.set(entry.date, entry);
    });

    const todayKey = toDateKey(now);
    
    let totalDays = 83; // 12 weeks
    if (activeRange === "26w") {
      totalDays = 181; // ~6 months (26 weeks)
    } else if (activeRange === "52w") {
      totalDays = 364; // 1 year (52 weeks)
    }
    const startDayKey = addDaysToDateKey(todayKey, -totalDays);

    const days = [];
    const labels = [];
    let currentMonth = -1;

    let firstMonthChangeIndex = 0;
    const startDayDate = parseDateKey(startDayKey) || new Date(startDayKey);
    const initialMonth = startDayDate.getMonth();
    for (let i = 0; i <= totalDays; i += 1) {
      const dateKey = addDaysToDateKey(startDayKey, i);
      const d = parseDateKey(dateKey) || new Date(dateKey);
      if (d.getMonth() !== initialMonth) {
        firstMonthChangeIndex = i;
        break;
      }
    }

    for (let i = 0; i <= totalDays; i += 1) {
      const dateKey = addDaysToDateKey(startDayKey, i);
      const d = parseDateKey(dateKey) || new Date(dateKey);
      const month = d.getMonth();

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
  }, [attemptTimeline, now, activeRange]);

  useEffect(() => {
    if (scrollRef.current && isMobile && (activeRange === "26w" || activeRange === "52w")) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [grid, isMobile, activeRange]);

  return (
    <div className="home-activity-heatmap">
      <div className="home-activity-header">
        <h2>Practice Activity</h2>
        <label htmlFor="activity-year" className="sr-only">Activity range</label>
        <select
          id="activity-year"
          value={activeRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          aria-label="Activity range"
        >
          <option value="12w">Last 12 weeks</option>
          <option value="26w">Last 6 months</option>
          <option value="52w">Last 1 year</option>
        </select>
      </div>

      <div ref={scrollRef} className="home-activity-scroll" aria-label="Practice activity heatmap">
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
                  const isFrozenDay = streakFreezeSet.has(day.dateKey);
                  const isStreakDay = day.attempts > 0 && streakDateSet.has(day.dateKey);

                  let cellClass = `home-activity-cell ${getIntensityClass(day.attempts)}`;
                  if (isFrozenDay) {
                    cellClass += " home-activity-cell--frozen";
                  } else if (isStreakDay) {
                    cellClass += " home-activity-cell--streak";
                  }

                  let cellTitle = `${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n${day.attempts} attempts (${Math.round(day.accuracy * 100)}%)\nTime spent: ${formatDuration(day.durationMs)}`;
                  if (isFrozenDay) {
                    cellTitle = `${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\nStreak Protected (Freeze Used 🛡️)`;
                  } else if (isStreakDay) {
                    cellTitle += "\nCurrent streak day 🔥";
                  }

                  let cellAria = `${day.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}: ${day.attempts} attempt${day.attempts !== 1 ? "s" : ""}${day.attempts > 0 ? `, ${Math.round(day.accuracy * 100)}% accuracy` : ""}`;
                  if (isFrozenDay) {
                    cellAria = `${day.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}: Streak protected by freeze`;
                  }

                  return (
                    <div
                      key={day.dateKey}
                      role="img"
                      aria-label={cellAria}
                      className={cellClass}
                      title={cellTitle}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="home-activity-legend" aria-label="Activity legend">
        <div className="home-activity-legend-hints">
          <span className="home-activity-legend-item">
            <i className="home-activity-cell home-activity-intensity--2 home-activity-cell--streak" aria-hidden="true" />
            <span>Streak</span>
          </span>
          <span className="home-activity-legend-item">
            <i className="home-activity-cell home-activity-cell--frozen" aria-hidden="true" />
            <span>Frozen</span>
          </span>
        </div>
        <div className="home-activity-legend-scale" aria-label="Less to more activity">
          <span>Less</span>
          <i className="home-activity-cell home-activity-intensity--0" aria-hidden="true" />
          <i className="home-activity-cell home-activity-intensity--1" aria-hidden="true" />
          <i className="home-activity-cell home-activity-intensity--2" aria-hidden="true" />
          <i className="home-activity-cell home-activity-intensity--3" aria-hidden="true" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
