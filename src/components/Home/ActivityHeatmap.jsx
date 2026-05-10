import React, { useMemo, useState } from "react";

const getIntensityClass = (attempts) => {
  if (attempts === 0) return "bg-rose-50 dark:bg-rose-950/40";
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

export const ActivityHeatmap = ({ attemptTimeline = [], now = new Date(), streakDateKeys = [] }) => {
  const [selectedYear, setSelectedYear] = useState("rolling");
  const streakDateSet = useMemo(() => new Set(streakDateKeys), [streakDateKeys]);
  const yearOptions = useMemo(() => {
    const years = new Set([new Date(now).getUTCFullYear()]);
    attemptTimeline.forEach((entry) => {
      const dateText = String(entry?.date || "");
      const year = Number(dateText.slice(0, 4));
      if (/^\d{4}/.test(dateText) && Number.isFinite(year)) {
        years.add(year);
      }
    });
    return Array.from(years).sort((left, right) => right - left);
  }, [attemptTimeline, now]);

  const { grid, monthLabels } = useMemo(() => {
    const timelineMap = new Map();
    attemptTimeline.forEach((entry) => {
      timelineMap.set(entry.date, entry);
    });

    const days = [];
    const todayKey = new Date(now).toISOString().split("T")[0];
    const today = new Date(`${todayKey}T00:00:00.000Z`);
    let startDay;
    let endDay;

    if (selectedYear === "rolling") {
      startDay = new Date(today);
      startDay.setUTCDate(today.getUTCDate() - 364);
      endDay = today;
    } else {
      const year = Number(selectedYear);
      startDay = new Date(Date.UTC(year, 0, 1));
      endDay = new Date(Date.UTC(year, 11, 31));
    }

    let currentMonth = -1;
    const monthLabels = [];
    const totalDays = Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / 86400000));

    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(startDay);
      d.setUTCDate(startDay.getUTCDate() + i);
      const dateKey = d.toISOString().split("T")[0];
      const month = d.getUTCMonth();

      // Track month boundaries for labels
      if (month !== currentMonth) {
        // Avoid rendering the start month label if the start day is late in the month
        if (currentMonth !== -1 || d.getUTCDate() <= 15) {
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
  }, [attemptTimeline, now, selectedYear]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[color:var(--color-text)]">Practice Activity</h3>
        <label htmlFor="activity-year" className="sr-only">Activity year</label>
        <select
          id="activity-year"
          value={selectedYear}
          onChange={(event) => setSelectedYear(event.target.value)}
          className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1.5 text-xs font-bold text-[color:var(--color-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="rolling">Last 365 days</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
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
                style={{ left: `${m.weekIndex * 16}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {grid.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  const isStreakDay = streakDateSet.has(day.dateKey);
                  return (
                    <div
                      key={day.dateKey}
                      className={`h-3 w-3 rounded-sm transition hover:ring-2 hover:ring-sky-400 ${getIntensityClass(day.attempts)} ${
                        isStreakDay ? "ring-2 ring-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.24)] dark:ring-amber-200" : ""
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
