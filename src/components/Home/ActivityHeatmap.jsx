import React, { useMemo, useState } from "react";

const getIntensityClass = (attempts) => {
  if (attempts === 0) return "bg-[color:var(--color-surface-muted)]";
  if (attempts < 4) return "bg-emerald-200 dark:bg-emerald-900/60";
  if (attempts < 8) return "bg-emerald-400 dark:bg-emerald-700/80";
  return "bg-emerald-600 dark:bg-emerald-500";
};

const formatDuration = (ms) => {
  if (!ms) return "0m";
  const mins = Math.floor(ms / 60000);
  if (mins === 0) return "< 1m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getMonthShortName = (monthIndex) => {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
};

export const ActivityHeatmap = ({ attemptTimeline = [], now = new Date() }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { grid, monthLabels } = useMemo(() => {
    const timelineMap = new Map();
    attemptTimeline.forEach((entry) => {
      timelineMap.set(entry.date, entry);
    });

    // We want the grid to end on "today" (or the end of the current week).
    // GitHub heatmap columns are Sunday to Saturday.
    // Let's build exactly 52 weeks (364 days) ending on "today".
    // Wait, it's easier to just go back 364 days from today.
    // That's 52 weeks of 7 days.
    const days = [];
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 364);

    let currentMonth = -1;
    const monthLabels = [];

    for (let i = 0; i <= 364; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      const dateKey = d.toISOString().split("T")[0];
      const month = d.getMonth();

      // Track month boundaries for labels
      // Only place a label if we're at the start of a week (i % 7 === 0) or it's the first time we see this month
      if (month !== currentMonth) {
        if (i < 364 - 14) { // Don't add labels too close to the end
           monthLabels.push({ label: getMonthShortName(month), weekIndex: Math.floor(i / 7) });
        }
        currentMonth = month;
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

    // Group into columns of 7
    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }

    return { grid: cols, monthLabels };
  }, [attemptTimeline, now]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-[color:var(--color-text)]">Practice Activity</h3>
      
      <div className="flex select-none overflow-x-auto pb-4">
        {/* Y-axis labels (Mon, Wed, Fri) */}
        <div className="mr-2 flex flex-col justify-between pt-[1.5rem] pb-1 text-[10px] font-semibold text-[color:var(--color-text-muted)]">
          <span className="h-3 leading-3" style={{ marginTop: "1rem" }}>Mon</span>
          <span className="h-3 leading-3" style={{ marginTop: "1rem" }}>Wed</span>
          <span className="h-3 leading-3" style={{ marginTop: "1rem" }}>Fri</span>
        </div>

        <div className="flex flex-col">
          {/* X-axis Month labels */}
          <div className="relative mb-2 h-4 w-full">
            {monthLabels.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                className="absolute text-[10px] font-semibold text-[color:var(--color-text-muted)]"
                style={{ left: `${m.weekIndex * 15}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {grid.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day, dIndex) => (
                  <div
                    key={day.dateKey}
                    className={`h-3 w-3 rounded-sm transition hover:ring-2 hover:ring-sky-400 ${getIntensityClass(day.attempts)}`}
                    onMouseEnter={() => setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n${day.attempts} attempts (${Math.round(day.accuracy * 100)}%)\nTime spent: ${formatDuration(day.durationMs)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-semibold text-[color:var(--color-text-muted)]">
        <span>Less</span>
        <div className={`h-3 w-3 rounded-sm ${getIntensityClass(0)}`} />
        <div className={`h-3 w-3 rounded-sm ${getIntensityClass(1)}`} />
        <div className={`h-3 w-3 rounded-sm ${getIntensityClass(5)}`} />
        <div className={`h-3 w-3 rounded-sm ${getIntensityClass(10)}`} />
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
