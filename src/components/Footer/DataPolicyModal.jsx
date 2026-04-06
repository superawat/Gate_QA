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
    iconClassName: 'text-amber-600',
    surfaceClassName: 'border-amber-200 bg-amber-50'
  },
  {
    title: 'Browser data is cleared',
    description: 'If site data or local storage is cleared, your progress is removed too.',
    icon: FaTrashAlt,
    iconClassName: 'text-rose-600',
    surfaceClassName: 'border-rose-200 bg-rose-50'
  },
  {
    title: 'Different browser or device',
    description: 'Your laptop, phone, Chrome, and Safari do not share the same saved data.',
    icon: FaLaptop,
    iconClassName: 'text-sky-600',
    surfaceClassName: 'border-sky-200 bg-sky-50'
  },
  {
    title: 'Storage is full',
    description: 'In rare low-space cases, the browser may stop saving new progress.',
    icon: FaExclamationTriangle,
    iconClassName: 'text-orange-600',
    surfaceClassName: 'border-orange-200 bg-orange-50'
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
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-labelledby="data-policy-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 id="data-policy-title" className="flex items-center gap-2 text-lg font-semibold text-slate-950 sm:text-xl">
            <FaShieldAlt className="text-sky-600" />
            Data Persistence & Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-6 text-slate-700">
            <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Quick Summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Your progress stays on your device</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Solved status and bookmarks are saved in your browser using local storage. We do not store this progress on a central server, so it stays private, but it also does not sync automatically.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="text-sm font-semibold text-emerald-800">Good news</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">No account needed. No personal progress is stored on our servers.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Main limitation</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">If browser storage is lost, your saved progress is lost too.</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-950">When progress may not be saved</h3>
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
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                          <Icon className={item.iconClassName} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <FaCloudDownloadAlt className="text-sky-600" />
                <h3 className="text-lg font-semibold text-slate-950">How to protect your progress</h3>
              </div>
              <ol className="mt-4 space-y-3">
                {safetySteps.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-6 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-950">Backup and transfer</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Use <strong>Export JSON</strong> to download a backup. On another browser or device, use <strong>Import</strong> to restore it. You can merge with existing progress or replace it fully.
              </p>
            </section>

            <section className="border-t border-slate-200 pt-4">
              <p className="text-center text-xs leading-6 text-slate-500">
                This app is client-side only. No personal progress data is sent to a server.
              </p>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPolicyModal;
