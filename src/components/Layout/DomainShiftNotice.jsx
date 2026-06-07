import React, { useCallback, useState } from "react";
import { FaDownload, FaExclamationTriangle, FaTimes } from "react-icons/fa";

import { trackEvent } from "../../utils/analytics";
import { saveWorkspaceFile } from "../../utils/workspaceFile";

const NEW_DOMAIN = "gateqa.in";

const DomainShiftNotice = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("");

  const handleDismiss = useCallback(() => {
    setStatus("");
    onClose?.();
    trackEvent("domain_shift_notice_dismiss", { domain: NEW_DOMAIN });
  }, [onClose]);

  const handleExport = useCallback(async () => {
    setStatus("Preparing backup...");
    trackEvent("domain_shift_export_start", { domain: NEW_DOMAIN });

    try {
      const result = await saveWorkspaceFile();
      setStatus(result.method === "native" ? "Backup saved." : "Backup downloaded.");
      trackEvent("domain_shift_export_complete", {
        domain: NEW_DOMAIN,
        method: result.method || "unknown",
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("Backup cancelled.");
        return;
      }
      setStatus("Backup could not be created. Use Export JSON from the menu.");
      trackEvent("domain_shift_export_failed", {
        domain: NEW_DOMAIN,
        reason: error?.message || "unknown",
      });
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-labelledby="domain-shift-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4 sm:px-6">
          <h2 id="domain-shift-title" className="flex items-center gap-2 text-lg font-semibold text-[color:var(--color-text)] sm:text-xl">
            <FaExclamationTriangle className="text-amber-500" aria-hidden="true" />
            GateQA is moving to {NEW_DOMAIN}
          </h2>
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Close domain migration notice"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-5 text-sm leading-7 text-[color:var(--color-text)] sm:text-base">
            <section className="rounded-[20px] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-4">
              <p className="font-semibold text-[color:var(--color-warning-text)]">
                Only our domain name is changing — nothing else!
              </p>
              <p className="mt-2 text-[color:var(--color-text)]">
                Don't worry about anything else; your study experience, layouts, and question bank will remain exactly the same. To carry over your progress, simply download your data file and keep it saved on your local system, then import it on the new domain.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-[color:var(--color-text)]">1. What to do now (Tension-Free Backup)</h3>
              <p className="mt-2 text-[color:var(--color-text-muted)]">
                Click <strong className="text-[color:var(--color-text)]">Export Progress</strong> below to download and save your latest data file (.json) to your local system. This file holds all your solved questions, bookmarks, notes, mock history, and stats.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-[color:var(--color-text)]">2. What to do on {NEW_DOMAIN}</h3>
              <p className="mt-2 text-[color:var(--color-text-muted)]">
                Once we are live on the new domain, simply open <strong className="text-[color:var(--color-text)]">{NEW_DOMAIN}</strong>, click **Import** from the menu drawer, and select your saved data file. All your progress will instantly restore!
              </p>
            </section>

            {status ? (
              <p className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text)]" aria-live="polite">
                {status}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[color:var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2 focus:ring-offset-[color:var(--color-surface)] dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
          >
            <FaDownload aria-hidden="true" />
            Export Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainShiftNotice;
