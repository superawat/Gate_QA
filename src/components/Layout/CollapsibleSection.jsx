import React, { useState, useId } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const CollapsibleSection = ({
  title,
  description,
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
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between p-3.5 sm:p-5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
        <div className="ml-3 sm:ml-4 shrink-0 text-[color:var(--color-text-muted)]">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
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
