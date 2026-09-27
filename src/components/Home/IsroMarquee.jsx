import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRocket } from "react-icons/fa";
import { writeIsroEnabled } from "../../utils/isroPreference";
import { PRACTICE_ROUTE } from "../../utils/routes";

/**
 * ISRO CS exam years that have question data.
 * 11 legacy papers 2007–2020, plus 2023 and 2025 (Set A).
 */
const ISRO_YEARS = [
  2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
  2015, 2016, 2017, 2018, 2019, 2020, 2023, 2025,
];

/**
 * Build the practice page URL for a given ISRO year.
 * The year set key format expected by FilterContext is `isro:YEAR:set-1`.
 */
const buildPracticeUrl = (year) => {
  const yearSetKey = `isro:${year}:set-1`;
  return `${PRACTICE_ROUTE}?years=${encodeURIComponent(yearSetKey)}`;
};

/**
 * IsroMarquee — a thin, continuously-scrolling ribbon shown directly
 * below the header on the home page. Each year chip is clickable:
 * it enables the ISRO question bank preference and navigates to
 * the Explore (practice) page pre-filtered to that exam year.
 */
export default function IsroMarquee() {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  const handleYearClick = useCallback(
    (year) => {
      // Persist ISRO preference so FilterContext loads ISRO questions.
      writeIsroEnabled(true);
      navigate(buildPracticeUrl(year));
    },
    [navigate],
  );

  const handleExploreAll = useCallback(() => {
    writeIsroEnabled(true);
    navigate(PRACTICE_ROUTE);
  }, [navigate]);

  const handleTouchStart = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Duplicate items so the seamless loop always has content visible.
  const items = [...ISRO_YEARS, ...ISRO_YEARS];

  return (
    <div
      className={`isro-marquee-strip ${isPaused ? "isro-marquee-strip--paused" : ""}`}
      role="region"
      aria-label="ISRO CS exam papers — click a year to practice"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Left fixed badge */}
      <span className="isro-marquee-label" aria-hidden="true">
        <FaRocket className="isro-marquee-rocket" aria-hidden="true" />
        <span className="isro-marquee-label-text">
          <span className="isro-marquee-label-full">ISRO CS</span>
          <span className="isro-marquee-label-short">ISRO</span>
        </span>
      </span>

      {/* Scrolling track */}
      <div className="isro-marquee-overflow">
        <ul className="isro-marquee-track" role="list">
          {items.map((year, index) => {
            const isDuplicate = index >= ISRO_YEARS.length;
            return (
              /* eslint-disable-next-line react/no-array-index-key */
              <li key={`${year}-${index}`} className="isro-marquee-item" aria-hidden={isDuplicate ? "true" : undefined}>
                <button
                  type="button"
                  className="isro-marquee-chip"
                  tabIndex={isDuplicate ? -1 : 0}
                  aria-label={`ISRO CS ${year}`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right CTA — fixed */}
      <button
        type="button"
        className="isro-marquee-cta"
        onClick={handleExploreAll}
        aria-label="Explore all ISRO CS questions"
      >
        <span className="isro-marquee-cta-label">
          <span className="isro-marquee-cta-text-full">Explore all</span>
          <span className="isro-marquee-cta-text-short">All</span>
        </span>
        <span className="isro-marquee-cta-arrow" aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}

