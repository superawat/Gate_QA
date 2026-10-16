import React, { useState } from "react";
import { FiBookOpen, FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";
import { MathContent } from "../Math/MathRuntime";

export default function DetailedSolutionView({ solution, isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible || !solution) {
    return null;
  }

  const { concept, markdown = "" } = solution;

  return (
    <div className="w-full mt-6 rounded-2xl border border-primary-200 dark:border-primary-800/60 bg-gradient-to-b from-primary-50/40 via-white to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-md overflow-hidden transition-all duration-200">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left border-b border-primary-100 dark:border-primary-900/40 bg-primary-50/60 dark:bg-primary-950/40 hover:bg-primary-100/50 dark:hover:bg-primary-900/40 transition select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500 text-white shadow-sm">
            <FiBookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                Detailed Solution
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                Verified
              </span>
            </div>
            {concept && (
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {concept}
              </h3>
            )}
          </div>
        </div>
        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed animate-fade-in">
          {/* Solution Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3 [&_img]:bg-white [&_img]:p-1.5 [&_img]:border [&_img]:border-slate-200 dark:[&_img]:border-slate-700">
            <MathContent>
              <div
                className="whitespace-pre-line font-sans"
                dangerouslySetInnerHTML={{
                  __html: markdown
                    .replace(/^### (.*$)/gim, '<h4 class="font-bold text-base text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>'),
                }}
              />
            </MathContent>
          </div>
        </div>
      )}
    </div>
  );
}
