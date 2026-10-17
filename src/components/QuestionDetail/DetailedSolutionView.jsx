import React, { useMemo } from "react";
import { FiBookOpen, FiMessageSquare } from "react-icons/fi";
import { FaFlag } from "react-icons/fa";
import { MathContent } from "../Math/MathRuntime";
import { buildReportIssueUrl } from "../../utils/reportIssue";
import { getQuestionSolutionLink, getGateOverflowSearchUrl } from "../../utils/solutionLink";

export default function DetailedSolutionView({
  solution,
  question,
  reportIssueUrl: customReportIssueUrl,
  solutionLink: customSolutionLink,
  isVisible = true,
}) {
  if (!isVisible) {
    return null;
  }

  const concept = typeof solution === "object" ? solution?.concept : null;
  const markdown = typeof solution === "string" ? solution : (solution?.markdown || "");
  const images = Array.isArray(solution?.images) ? solution.images : [];
  const extraImages = images.filter((img) => typeof img === "string" && !markdown.includes(img));

  const reportIssueUrl = useMemo(() => {
    if (customReportIssueUrl) return customReportIssueUrl;
    return buildReportIssueUrl(question);
  }, [customReportIssueUrl, question]);

  const discussionUrl = useMemo(() => {
    if (customSolutionLink) return customSolutionLink;
    const directLink = getQuestionSolutionLink(question);
    if (directLink) return directLink;
    return getGateOverflowSearchUrl(question);
  }, [customSolutionLink, question]);

  const hasSolutionContent = Boolean(markdown && markdown.trim().length > 0);

  const renderHeader = () => (
    <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-[color:var(--color-border)]">
      <div className="flex items-center gap-2 min-w-0">
        <FiBookOpen className="w-4 h-4 text-[color:var(--color-text-muted)] shrink-0" />
        {concept ? (
          <span className="text-xs font-semibold text-[color:var(--color-text-secondary)] truncate">
            {concept}
          </span>
        ) : null}
      </div>

      {discussionUrl && (
        <a
          href={discussionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] font-semibold text-xs transition shadow-xs shrink-0 select-none"
          title="Open question discussion on GateOverflow"
        >
          <FiMessageSquare className="w-3.5 h-3.5 text-[color:var(--color-text-secondary)]" />
          <span>Discussion</span>
        </a>
      )}
    </div>
  );

  if (!hasSolutionContent) {
    return (
      <div className="w-full mt-6 rounded-xl sm:rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6 shadow-sm">
        {renderHeader()}
        <div className="text-base text-[color:var(--color-text)] leading-relaxed space-y-2">
          <p className="font-medium text-[color:var(--color-text)]">
            We are working on the solution for this question.
          </p>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            You can look at{" "}
            <a
              href={discussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]"
            >
              discussions
            </a>{" "}
            or, if you have a solution, post it by clicking on the{" "}
            <a
              href={reportIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]"
              title="Submit solution"
            >
              <FaFlag className="text-[11px] text-rose-500 dark:text-rose-400" />
              red flag
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 rounded-xl sm:rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:p-6 shadow-sm">
      {renderHeader()}

      {/* Solution Body - Font, text color, and leading matching question */}
      <div className="text-base text-[color:var(--color-text)] leading-relaxed space-y-4">
        <MathContent dynamic>
          <div
            className="solution-body whitespace-pre-line text-base leading-relaxed text-[color:var(--color-text)] [&_h4]:font-bold [&_h4]:text-base [&_h4]:text-[color:var(--color-text)] [&_h4]:mt-4 [&_h4]:mb-2 [&_li]:ml-4 [&_li]:list-disc [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3 [&_img]:bg-transparent [&_img]:border [&_img]:border-[color:var(--color-border)]"
            dangerouslySetInnerHTML={{
              __html: markdown
                .replace(/^### (.*$)/gim, '<h4 class="font-bold text-base text-[color:var(--color-text)] mt-4 mb-2">$1</h4>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>'),
            }}
          />
        </MathContent>

        {extraImages.length > 0 && (
          <div className="space-y-3 pt-2">
            {extraImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Solution diagram ${idx + 1}`}
                className="max-w-full h-auto rounded-lg bg-transparent border border-[color:var(--color-border)] shadow-sm"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Smaller font notice for submitting better solutions aligned to the right */}
      <div className="pt-3 mt-5 border-t border-[color:var(--color-border)] flex justify-end text-right text-xs text-[color:var(--color-text-muted)]">
        <span>
          If you have a better solution of this question than this, report the question by pressing the{" "}
          <a
            href={reportIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)] underline underline-offset-2 font-medium"
            title="Report question or submit a better solution"
          >
            <FaFlag className="text-[11px] text-rose-500 dark:text-rose-400" />
            red flag
          </a>{" "}
          and submit it.
        </span>
      </div>
    </div>
  );
}

