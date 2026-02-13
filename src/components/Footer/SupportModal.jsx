
import React from 'react';
import { FaTimes, FaHeart, FaEnvelope } from 'react-icons/fa';

const SupportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content - Force Light Glassmorphism with Dark Text */}
            <div
                className="relative bg-white/70 backdrop-blur-2xl border border-white/40 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-sm flex flex-col items-center text-center p-8 text-gray-900"
                role="dialog"
                aria-labelledby="support-modal-title"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                >
                    <FaTimes />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <FaHeart className="w-8 h-8 text-red-500 animate-pulse" />
                </div>

                {/* Content */}
                <h2 id="support-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                    Support Me
                </h2>

                <p className="text-gray-700 mb-6 font-medium">
                    Thank you for your interest in supporting this project!
                    <br />
                    <span className="font-semibold text-blue-600">other options are coming soon.</span>
                </p>

                {/* Feedback Section */}
                <div className="mb-6 w-full pt-4 border-t border-gray-200/50">
                    <p className="text-sm text-gray-700 mb-2 font-medium">
                        Have feedback or suggestions?
                    </p>
                    <a
                        href="mailto:rawathr01@gmail.com"
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-bold transition-colors"
                    >
                        <FaEnvelope />
                        rawathr01@gmail.com
                    </a>
                </div>

                {/* Footer Action */}
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg transition-colors w-full"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default SupportModal;
