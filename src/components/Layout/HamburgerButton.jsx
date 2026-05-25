import React from "react";

const HamburgerButton = ({ isOpen, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hamburger-btn inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500 ${className}`}
      aria-label={isOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={isOpen}
    >
      <span
        className="block h-[2px] w-5 rounded-full bg-[color:var(--color-text)] transition-transform duration-300 ease-out"
        style={isOpen ? { transform: "translateY(8px) rotate(45deg)" } : {}}
      />
      <span
        className="block h-[2px] w-5 rounded-full bg-[color:var(--color-text)] transition-opacity duration-300 ease-out"
        style={isOpen ? { opacity: 0 } : {}}
      />
      <span
        className="block h-[2px] w-5 rounded-full bg-[color:var(--color-text)] transition-transform duration-300 ease-out"
        style={isOpen ? { transform: "translateY(-8px) rotate(-45deg)" } : {}}
      />
    </button>
  );
};

export default HamburgerButton;
