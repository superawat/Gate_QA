import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function TrackerResetModal({
  topic,
  isOpen,
  onClose,
  onConfirmReset,
}) {
  if (!isOpen || !topic) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="reset-modal-title" className="text-base font-bold text-[color:var(--color-text)]">
              Reset Topic Annotations?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[color:var(--color-text-muted)] space-y-2 leading-relaxed">
          <p>
            You are about to reset manual tracking for: <strong className="text-[color:var(--color-text)]">{topic.label}</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[color:var(--color-text-muted)]">
            <li>Theory completion status will be unchecked.</li>
            <li>Custom topic notes &amp; manual revision logs will be cleared.</li>
          </ul>
          <div className="p-3 rounded-xl bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[11px] text-emerald-400 font-medium">
            Practice Data Protected: Your solved questions, attempt history, and scores in GateQA practice will <strong>never</strong> be deleted.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset(topic.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
}
