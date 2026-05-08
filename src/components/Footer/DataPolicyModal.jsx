import React from 'react';
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaExclamationTriangle,
  FaLaptop,
  FaShieldAlt,
  FaTimes,
  FaTrashAlt
} from 'react-icons/fa';

const lossScenarios = [
  {
    title: 'Private / Incognito window',
    description: 'Progress disappears when that private window is closed.',
    icon: FaExclamationTriangle,
    iconClassName: 'text-[color:var(--color-warning-text)]',
    surfaceClassName: 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)]'
  },
  {
    title: 'Browser data is cleared',
    description: 'If site data or local storage is cleared, your progress is removed too.',
    icon: FaTrashAlt,
    iconClassName: 'text-[color:var(--color-danger-text)]',
    surfaceClassName: 'border-[color:var(--color-danger-border)] bg-[color:var(--color-danger-soft)]'
  },
  {
    title: 'Different browser or device',
    description: 'Your laptop, phone, Chrome, and Safari do not share the same saved data.',
    icon: FaLaptop,
    iconClassName: 'text-[color:var(--color-info-text)]',
    surfaceClassName: 'border-[color:var(--color-info-border)] bg-[color:var(--color-info-soft)]'
  },
  {
    title: 'Storage is full',
    description: 'In rare low-space cases, the browser may stop saving new progress.',
    icon: FaExclamationTriangle,
    iconClassName: 'text-[color:var(--color-warning-text)]',
    surfaceClassName: 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)]'
  }
];

const safetySteps = [
  'Use Export JSON regularly to keep a backup file.',
  'Use Import on another device or browser to restore that backup.',
  'Avoid private / incognito mode if you want progress to stay saved.',
  'Stick to one browser on one device for the most reliable experience.',
  'Reload occasionally and confirm your bookmarks still appear.'
];

const DataPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-labelledby="data-policy-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4 sm:px-6">
          <h2 id="data-policy-title" className="flex items-center gap-2 text-lg font-semibold text-[color:var(--color-text)] sm:text-xl">
            <FaShieldAlt className="text-[color:var(--color-info-text)]" />
            Data Persistence & Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)]"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-6 text-[color:var(--color-text)]">
            <section className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-primary-soft)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-info-text)]">Quick Summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-[color:var(--color-text)]">Your progress stays on your device</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
                Solved status and bookmarks are saved in your browser using local storage. We do not store this progress on a central server, so it stays private, but it also does not sync automatically.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--color-success-border)] bg-[color:var(--color-surface)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-success-text)]">Good news</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">No account needed. No personal progress is stored on our servers.</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">Main limitation</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">If browser storage is lost, your saved progress is lost too.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-[color:var(--color-warning-text)]" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">When progress may not be saved</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {lossScenarios.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`rounded-2xl border p-4 ${item.surfaceClassName}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-surface)] shadow-sm">
                          <Icon className={item.iconClassName} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-text)]">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[color:var(--color-text)]">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5">
              <div className="flex items-center gap-2">
                <FaCloudDownloadAlt className="text-[color:var(--color-info-text)]" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">How to protect your progress</h3>
              </div>
              <ol className="mt-4 space-y-3">
                {safetySteps.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-2xl bg-[color:var(--color-surface)] px-4 py-3 shadow-sm">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-text)] text-xs font-semibold text-[color:var(--color-surface)]">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-[color:var(--color-text)]">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[24px] border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] p-5">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[color:var(--color-success-text)]" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">Backup and transfer</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                Use <strong>Export JSON</strong> to download a backup. On another browser or device, use <strong>Import</strong> to restore it. You can merge with existing progress or replace it fully.
              </p>
            </section>

            <section className="border-t border-[color:var(--color-border)] pt-4">
              <p className="text-center text-xs leading-6 text-[color:var(--color-text-muted)]">
                This app is client-side only. No personal progress data is sent to a server.
              </p>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-[color:var(--color-border)] px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[color:var(--color-text)] px-4 py-2 text-sm font-semibold text-[color:var(--color-surface)] transition hover:bg-slate-800"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPolicyModal;
