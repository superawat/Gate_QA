
import React from 'react';
import { FaTimes, FaHeart, FaEnvelope } from 'react-icons/fa';
import qrCodeImage from './assets/qrcode.png';

const SupportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center text-slate-900 shadow-[0_22px_70px_rgba(15,23,42,0.16)] animate-fade-in"
                role="dialog"
                aria-labelledby="support-modal-title"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close modal"
                >
                    <FaTimes />
                </button>

                <div className="px-5 pb-5 pt-7 sm:px-6 sm:pb-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <FaHeart className="h-5 w-5" />
                    </div>

                    <h2 id="support-modal-title" className="text-2xl font-semibold tracking-tight text-slate-900">
                        Support Me
                    </h2>

                    <p className="mx-auto mt-2.5 max-w-[18rem] text-sm leading-5 text-slate-600">
                        Many have benefited from this product at no cost; if you'd like to support its journey, any help would mean a lot.
                    </p>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                        <div className="mx-auto max-w-[180px] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                            <img
                                src={qrCodeImage}
                                alt="QR code to support the project"
                                className="h-auto w-full rounded-xl"
                            />
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Scan with your preferred payment app.
                        </p>
                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="text-sm font-medium text-slate-700">
                            Feedback or suggestions
                        </p>
                        <a
                            href="mailto:rawathr01@gmail.com"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
                        >
                            <FaEnvelope className="text-slate-400" />
                            rawathr01@gmail.com
                        </a>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
