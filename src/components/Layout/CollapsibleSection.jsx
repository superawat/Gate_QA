import React, { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const CollapsibleSection = ({
  title,
  description,
  defaultOpen = true,
  className = "border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`rounded-[var(--radius-card)] border overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div>
          {typeof title === "string" ? (
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">{title}</h2>
          ) : (
            title
          )}
          {description && (
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 shrink-0 text-[color:var(--color-text-muted)]">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>
      {isOpen && (
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {children}
        </div>
      )}
    </section>
  );
};

export default CollapsibleSection;
