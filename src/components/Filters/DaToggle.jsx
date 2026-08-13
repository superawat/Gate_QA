import React from "react";
import { useFilterActions, useFilterState } from "../../contexts/FilterContext";

export default function DaToggle() {
  const { includeDa, daLoading, daError } = useFilterState();
  const { setIncludeDa } = useFilterActions();

  return (
    <div className="rounded-xl border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] p-3">
      <label htmlFor="gate-da-toggle" className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[color:var(--color-purple-text)]">GATE DA</span>
          <span className="mt-0.5 block text-xs leading-5 text-[color:var(--color-text-muted)]">
            {daLoading ? "Loading 2024-2026 DA papers..." : "Add Data Science & AI questions to this list"}
          </span>
        </span>
        <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
          <input
            id="gate-da-toggle"
            type="checkbox"
            checked={Boolean(includeDa)}
            onChange={(event) => setIncludeDa(event.target.checked)}
            className="peer sr-only"
            aria-label="GATE DA questions"
          />
          <span className="h-6 w-11 rounded-full bg-[color:var(--color-neutral-border)] transition-colors duration-200 peer-checked:bg-[color:var(--color-purple-text)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--color-purple-text)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--color-purple-soft)]" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-surface)] shadow transition-transform duration-200 peer-checked:translate-x-5" />
        </span>
      </label>
      {daError ? <p className="mt-2 text-xs font-medium text-[color:var(--color-danger-text)]">{daError}</p> : null}
    </div>
  );
}
