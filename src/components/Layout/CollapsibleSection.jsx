import React, { useState, useId } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const CollapsibleSection = ({
  title,
  description,
  headerAction,
  defaultOpen = true,
  className = "border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const uid = useId();
  const buttonId = `collapsible-btn-${uid}`;
  const panelId = `collapsible-panel-${uid}`;

  return (
    <section className={`rounded-2xl sm:rounded-[var(--radius-card)] border overflow-hidden ${className}`}>
      <div className="w-full flex items-start sm:items-center justify-between p-3.5 sm:p-5 text-left transition-colors">
        <button
          id={buttonId}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div>
            {typeof title === "string" ? (
              <h2 className="text-lg sm:text-xl font-semibold text-[color:var(--color-text)]">{title}</h2>
            ) : (
              title
            )}
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-[color:var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>
        </button>
        <div className="ml-2 sm:ml-4 flex items-center gap-2 sm:gap-3 shrink-0 mt-0.5 sm:mt-0">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerAction}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? "Collapse section" : "Expand section"}
            className="p-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded cursor-pointer"
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="p-3.5 pt-0 sm:p-5 sm:pt-0"
        >
          {children}
        </div>
      )}
    </section>
  );
};

export default CollapsibleSection;
