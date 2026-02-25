import React, { forwardRef } from "react";
import { FaCalculator } from "react-icons/fa";

const CalculatorButton = forwardRef(function CalculatorButton(
  { onClick, isOpen },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-white shadow-sm transition-colors ${isOpen ? "bg-slate-700 hover:bg-slate-700" : "bg-slate-800 hover:bg-slate-700"
        }`}
      aria-label="Open calculator"
      aria-expanded={isOpen}
      title="Calculator"
    >
      <FaCalculator className="h-4 w-4" />
      <span className="sr-only">Calculator</span>
    </button>
  );
});

export default CalculatorButton;
