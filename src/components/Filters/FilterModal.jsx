import React, { useEffect, useRef } from 'react';
import { useFilterState } from '../../contexts/FilterContext';
import FilterSidebar from './FilterSidebar';
import { FaTimes } from 'react-icons/fa';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const FilterModal = ({ isOpen, onClose }) => {
    const { filteredQuestions } = useFilterState();
    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);

    useFocusTrap(dialogRef, isOpen, onClose);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="filter-sheet-modal fixed inset-0 z-[60] flex justify-end bg-slate-950/40 backdrop-blur-[1px]">
            <button
                type="button"
                aria-label="Close filters"
                className="flex-1 cursor-default"
                onClick={onClose}
            />

            <div
                ref={dialogRef}
                className="filter-sheet-panel flex h-full w-full max-w-md flex-col overflow-hidden border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-modal-title"
            >
                <div className="filter-sheet-drag-handle" aria-hidden="true" />
                <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
                    <h2 id="filter-modal-title" className="text-lg font-semibold text-[color:var(--color-text)]">Filters</h2>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-neutral-border)] hover:text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <FilterSidebar className="h-full w-full border-r-0 bg-[color:var(--color-surface)]" />
                </div>

                <div className="border-t border-[color:var(--color-border)] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                    <button
                        onClick={onClose}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        See {filteredQuestions.length} Matching Questions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
