import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSave, FiTrash2, FiEdit3, FiEye, FiCheck } from "react-icons/fi";
import { saveTopicNote, loadTrackerStore } from "../../utils/trackerState";
import { MathContent } from "../Math/MathRuntime";

export default function TrackerNotesDrawer({
  topic,
  activeTrack,
  isOpen,
  onClose,
  onNoteUpdated,
}) {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [saveStatus, setSaveStatus] = useState("idle");
  const textareaRef = useRef(null);

  // Load existing note when topic opens
  useEffect(() => {
    if (!topic || !isOpen) {
      setContent("");
      return;
    }
    const store = loadTrackerStore(activeTrack);
    const existing = store.notes[topic.id];
    if (existing && !existing.isDeleted) {
      setContent(existing.content || "");
    } else {
      setContent("");
    }
    setSaveStatus("idle");
    setActiveTab("edit");
  }, [topic, activeTrack, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !topic) return null;

  const handleSave = () => {
    if (!topic) return;
    setSaveStatus("saving");
    saveTopicNote(activeTrack, topic.id, content);
    setSaveStatus("saved");
    onNoteUpdated();
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleDelete = () => {
    if (!topic) return;
    saveTopicNote(activeTrack, topic.id, "");
    setContent("");
    onNoteUpdated();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-drawer-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl h-full bg-[color:var(--color-surface)] border-l border-[color:var(--color-border)] shadow-2xl flex flex-col justify-between animate-slideLeft"
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-[color:var(--color-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <FiEdit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                Topic Notes &amp; Formulas · {topic.subjectSlug ? topic.subjectSlug.toUpperCase() : ""}
              </span>
              <h3 id="notes-drawer-title" className="text-sm sm:text-base font-bold text-[color:var(--color-text)] truncate">
                {topic.label}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] transition-colors shrink-0"
            title="Close Notes Drawer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-3.5 sm:px-4 pt-2.5 sm:pt-3 flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--color-border)] pb-2 bg-[color:var(--color-bg)]">
          <div className="flex items-center gap-1 bg-[color:var(--color-surface)] p-1 rounded-lg border border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "edit"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeTab === "preview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              <span>Preview (Math)</span>
            </button>
          </div>

          <div className="text-[10px] sm:text-[11px] text-[color:var(--color-text-muted)]">
            Supports LaTeX ($...$, $$...$$)
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto min-h-[220px] sm:min-h-[300px]">
          {activeTab === "edit" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              placeholder={`Write formulas, shortcuts, and key points for ${topic.label}...\n\nExample:\n• EMAT = $h \\cdot (t_{tlb} + t_m) + (1-h) \\cdot (t_{tlb} + 2t_m)$\n• Belady's Anomaly occurs in FIFO page replacement.`}
              className="w-full h-full min-h-[260px] sm:min-h-[350px] p-3 text-xs sm:text-sm font-mono bg-[color:var(--color-bg)] text-[color:var(--color-text)] border border-[color:var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[color:var(--color-bg)] border border-[color:var(--color-border)] min-h-[260px] sm:min-h-[350px] text-xs sm:text-sm text-[color:var(--color-text)] leading-relaxed space-y-3 prose prose-invert max-w-none">
              {content.trim() ? (
                <MathContent content={content} />
              ) : (
                <div className="text-[color:var(--color-text-muted)] italic text-xs">
                  No notes written yet. Switch to Edit tab to add formulas and key points.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] flex items-center justify-between gap-3">
          {content.trim() ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Clear Note</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
            >
              {saveStatus === "saved" ? (
                <>
                  <FiCheck className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
