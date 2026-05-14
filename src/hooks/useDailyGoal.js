import { useState, useEffect, useCallback } from "react";

const DAILY_GOAL_STORAGE_KEY = "gateqa_daily_goal_v1";
const DEFAULT_GOAL = 5;

export const useDailyGoal = () => {
  const [goal, setGoal] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_GOAL;
    try {
      const stored = window.localStorage.getItem(DAILY_GOAL_STORAGE_KEY);
      if (stored !== null) {
        return parseInt(stored, 10);
      }
    } catch {
      // ignore
    }
    return DEFAULT_GOAL;
  });

  const updateGoal = useCallback((newGoal) => {
    const validGoal = Math.max(1, parseInt(newGoal, 10) || DEFAULT_GOAL);
    setGoal(validGoal);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DAILY_GOAL_STORAGE_KEY, validGoal.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  return { goal, updateGoal };
};
