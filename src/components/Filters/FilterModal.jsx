import React, { useEffect } from 'react';
import { useFilterState } from '../../contexts/FilterContext';
import FilterSidebar from './FilterSidebar';
import { FaTimes } from 'react-icons/fa';

const FilterModal = ({ isOpen, onClose }) => {
    const { filteredQuestions } = useFilterState();

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

            <div className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Question Filters</p>
                        <h2 className="text-lg font-semibold text-slate-900">Pick Questions</h2>
                    </div>
                    <button
                        onClick={onClose}
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
