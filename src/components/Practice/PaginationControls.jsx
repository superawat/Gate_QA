import React from "react";

const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="practice-pagination flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`inline-flex min-h-[44px] items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
            currentPage <= 1
              ? "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
              : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`inline-flex min-h-[44px] items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
            currentPage >= totalPages
              ? "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
