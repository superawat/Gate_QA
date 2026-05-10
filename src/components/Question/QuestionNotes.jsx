import React, { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaStickyNote, FaTrash } from "react-icons/fa";

const STORAGE_KEY = "gate_qa_user_notes";

const readAllNotes = () => {
  try {
    if (typeof window === "undefined") {
      return {};
    }
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeAllNotes = (notes) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Notes are a local convenience; keep the question page usable if storage fails.
  }
};

function QuestionNotes({ storageKey }) {
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setNote("");
      setHasNote(false);
      setIsEditing(false);
      return;
    }

    const existingNote = String(readAllNotes()[storageKey] || "");
    setNote(existingNote);
    setHasNote(Boolean(existingNote));
    setIsEditing(false);
  }, [storageKey]);

  const saveNote = () => {
    const notes = readAllNotes();
    const trimmedNote = note.trim();

    if (trimmedNote) {
      notes[storageKey] = trimmedNote;
      setHasNote(true);
    } else {
      delete notes[storageKey];
      setHasNote(false);
    }

    writeAllNotes(notes);
    setNote(trimmedNote);
    setIsEditing(false);
  };

  const deleteNote = () => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    const notes = readAllNotes();
    delete notes[storageKey];
    writeAllNotes(notes);
    setNote("");
    setHasNote(false);
    setIsEditing(false);
  };

  if (!storageKey) {
    return null;
  }

  if (!hasNote && !isEditing) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
        >
          <FaPlus /> Add Personal Note
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3">
        <div className="flex items-center gap-2 text-[color:var(--color-text)]">
          <FaStickyNote className="text-[color:var(--color-primary)]" />
          <h3 className="text-sm font-bold tracking-wide">Personal Note</h3>
        </div>

        {!isEditing && hasNote && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-primary)]"
              title="Edit note"
            >
              <FaEdit />
            </button>
            <button
              type="button"
              onClick={deleteNote}
              className="text-[color:var(--color-text-muted)] transition hover:text-rose-500"
              title="Delete note"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {isEditing ? (
          <div>
            <textarea
              className="w-full resize-y rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              rows={4}
              placeholder="Add your personal notes, mnemonics, or explanations here..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!hasNote) {
                    setNote("");
                  }
                  setIsEditing(false);
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[color:var(--color-text-muted)] transition hover:bg-[color:var(--color-surface-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                <FaSave /> Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-[color:var(--color-text)]">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(QuestionNotes);
