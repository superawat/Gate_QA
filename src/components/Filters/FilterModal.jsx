import React, { useEffect, useRef } from 'react';
import { useFilterState } from '../../contexts/FilterContext';
import FilterSidebar from './FilterSidebar';
import { FaTimes } from 'react-icons/fa';

const FilterModal = ({ isOpen, onClose }) => {
    const { filteredQuestions } = useFilterState();
    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab' || !dialogRef.current) {
                return;
            }

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
            );

            if (!focusableElements.length) {
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/40 backdrop-blur-[1px]">
            <button
                type="button"
                aria-label="Close filters"
                className="flex-1 cursor-default"
                onClick={onClose}
            />

            <div
                ref={dialogRef}
                className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-modal-title"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Question Filters</p>
                        <h2 id="filter-modal-title" className="text-lg font-semibold text-slate-900">Pick Questions</h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close filters"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden">
                    <FilterSidebar className="h-full w-full border-r-0 bg-white" />
                </div>

                <div className="border-t border-slate-200 px-4 py-4">
                    <button
                        onClick={onClose}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        See {filteredQuestions.length} Matching Questions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
