import React, { useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaExclamationTriangle,
  FaFileExport,
  FaGoogle,
  FaLaptop,
  FaLock,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaTrashAlt,
  FaUserCheck
} from 'react-icons/fa';

const lossScenarios = [
  {
    title: 'Private / Incognito window',
    description: 'Browser storage is wiped when private windows close. Use regular browsing or sign in with Google to retain progress.',
    icon: FaExclamationTriangle,
    iconClassName: 'text-[color:var(--color-warning-text)]',
    surfaceClassName: 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)]'
  },
  {
    title: 'Browser data / cache is cleared',
    description: 'Clearing browser site data removes local guest progress. Sign in with Google or download a JSON export beforehand.',
    icon: FaTrashAlt,
    iconClassName: 'text-[color:var(--color-danger-text)]',
    surfaceClassName: 'border-[color:var(--color-danger-border)] bg-[color:var(--color-danger-soft)]'
  },
  {
    title: 'Multiple unlinked devices',
    description: 'In guest mode, your laptop and phone store separate local progress. Sign in with Google on both to sync automatically.',
    icon: FaLaptop,
    iconClassName: 'text-[color:var(--color-info-text)]',
    surfaceClassName: 'border-[color:var(--color-info-border)] bg-[color:var(--color-info-soft)]'
  },
  {
    title: 'Storage quota exceeded',
    description: 'If device storage is completely full, writes may fail. Cloud sync keeps your progress safely backed up on our server.',
    icon: FaExclamationTriangle,
    iconClassName: 'text-[color:var(--color-warning-text)]',
    surfaceClassName: 'border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)]'
  }
];

const protectionMethods = [
  {
    title: 'Sign in with Google (Recommended)',
    description: '1-click sign-in enables automatic, real-time cloud backup across all your laptops, phones, and tablets with zero friction.',
    icon: FaGoogle,
    badge: 'Automatic Sync',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  {
    title: 'Export JSON Workspace Backups',
    description: 'Download a portable JSON backup file at any time from the drawer or progress manager for 100% offline security.',
    icon: FaFileExport,
    badge: 'Offline Portability',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
  },
  {
    title: 'Zero Data Loss & Pre-Merge Snapshots',
    description: 'Signing in merges your local data with your cloud backup additively. Local snapshot backups are saved before any sync or restore.',
    icon: FaShieldAlt,
    badge: 'Zero Data Loss',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
  }
];

const DataPolicyModal = ({ isOpen, onClose }) => {
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, isOpen, onClose);

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
        ref={dialogRef}
        role="dialog"
        aria-labelledby="data-policy-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4 sm:px-6">
          <h2 id="data-policy-title" className="flex items-center gap-2 text-lg font-semibold text-[color:var(--color-text)] sm:text-xl">
            <FaShieldAlt className="text-sky-500" />
            Data Persistence &amp; Privacy Policy
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
            {/* Quick Summary Banner */}
            <section className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-primary-soft)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">Quick Summary</p>
              <h3 className="mt-2 text-xl font-bold text-[color:var(--color-text)] sm:text-2xl">
                Local-First by Default, Cloud Sync When You Want It
              </h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
                Your bookmarks, question notes, solved status, and mock test scores are always saved locally in your browser. You can use GateQA <strong>100% offline in Guest Mode</strong> with zero mandatory login, or sign in with Google for <strong>automatic multi-device cloud backup</strong>.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400">
                    <FaUserCheck />
                    <span>Guest Mode (Default)</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">
                    No account required. All study progress is stored safely in your browser’s local storage.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-[color:var(--color-surface)] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <FaSyncAlt />
                    <span>Google Cloud Sync (Optional)</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">
                    Sign in with Google to automatically sync and restore your progress across all laptops, phones, and tablets.
                  </p>
                </div>
              </div>
            </section>

            {/* How Progress is Stored & Synced */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FaCloudDownloadAlt className="text-sky-500" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">How Your Progress Is Protected</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {protectionMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.title}
                      className="flex flex-col justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Icon size={18} />
                          </span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${method.badgeClass}`}>
                            {method.badge}
                          </span>
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-[color:var(--color-text)]">{method.title}</h4>
                        <p className="mt-1.5 text-xs leading-5 text-[color:var(--color-text-muted)]">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* When progress may not be saved */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">When Guest Progress Is At Risk</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {lossScenarios.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`rounded-2xl border p-4 ${item.surfaceClassName}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface)] shadow-sm">
                          <Icon className={item.iconClassName} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-text)]">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-[color:var(--color-text)]">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Backup & Transfer Guidelines */}
            <section className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-[color:var(--color-text)]">Zero Data Loss Architecture</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-[color:var(--color-text)]">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>Additive Union-Merge:</strong> Signing in with Google never overwrites or deletes local study data. Local bookmarks, notes, and solved questions are merged seamlessly with your cloud backup.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>Automatic Local Snapshots:</strong> A local backup snapshot (<code className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">gate_qa_backup_*</code>) is automatically generated before every cloud merge.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>Safe Sign-Out:</strong> Signing out never clears your local progress on this device. You can smoothly continue studying in Guest Mode.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong>Manual Workspace Export:</strong> Use <strong>Export JSON</strong> from the navigation drawer to download a full offline copy of your study history anytime.
                  </span>
                </li>
              </ul>
            </section>

            {/* Privacy Commitment */}
            <section className="border-t border-[color:var(--color-border)] pt-4">
              <div className="flex items-center justify-center gap-2 text-center text-xs text-[color:var(--color-text-muted)]">
                <FaLock className="text-slate-400" />
                <span>
                  Your study data belongs to you. We never sell, share, or monetize your progress or personal notes with third-party advertisers.
                </span>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-[color:var(--color-border)] px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[color:var(--color-text)] px-5 py-2 text-sm font-semibold text-[color:var(--color-surface)] transition hover:opacity-90"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPolicyModal;
