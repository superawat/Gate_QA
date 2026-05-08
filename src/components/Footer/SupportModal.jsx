
import React from 'react';
import { FaTimes, FaHeart, FaEnvelope } from 'react-icons/fa';
import qrCodeImage from './assets/qrcode.png';

const SupportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-[color:var(--color-text)]/30 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-center text-[color:var(--color-text)] shadow-[0_22px_70px_rgba(15,23,42,0.16)] animate-fade-in"
                role="dialog"
                aria-labelledby="support-modal-title"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-2 text-[color:var(--color-text-muted)] transition-colors hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text-muted)]"
                    aria-label="Close modal"
                >
                    <FaTimes />
                </button>

                <div className="px-5 pb-5 pt-7 sm:px-6 sm:pb-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <FaHeart className="h-5 w-5" />
                    </div>

                    <h2 id="support-modal-title" className="text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
                        Support Me
                    </h2>

                    <p className="mx-auto mt-2.5 max-w-[18rem] text-sm leading-5 text-[color:var(--color-text-muted)] dark:text-[color:var(--color-text-muted)]">
                        GATE QA has been free for everyone and has helped many along the way. If you’d like to support the journey, any contribution means a lot.
                    </p>
                    <p className="mx-auto mt-2 text-sm font-semibold text-pink-600 dark:text-pink-400">
                        ❤️ 2 people supported.
                    </p>

                    <div className="mt-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3.5 sm:p-4">
                        <div className="mx-auto max-w-[180px] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2.5 shadow-sm">
                            <img
                                src={qrCodeImage}
                                alt="QR code to support the project"
                                className="h-auto w-full rounded-xl"
                            />
                        </div>
                        <p className="mt-3 text-xs leading-5 text-[color:var(--color-text-muted)]">
                            Scan with your preferred payment app.
                        </p>
                    </div>

                    <div className="mt-5 border-t border-[color:var(--color-border)] pt-4">
                        <p className="text-sm font-medium text-[color:var(--color-text)]">
                            Feedback or suggestions
                        </p>
                        <a
                            href="mailto:rawathr01@gmail.com"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-text)]"
                        >
                            <FaEnvelope className="text-[color:var(--color-text-muted)]" />
                            rawathr01@gmail.com
                        </a>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-5 w-full rounded-2xl bg-[color:var(--color-text)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-surface)] transition-colors hover:bg-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
