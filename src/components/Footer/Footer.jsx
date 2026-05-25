import React, { useState } from 'react';
import { FaExclamationTriangle, FaHeart } from 'react-icons/fa';

import DataPolicyModal from './DataPolicyModal';
import SupportModal from './SupportModal';

const Footer = () => {
  const [isDataPolicyOpen, setIsDataPolicyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto w-full border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 text-[10px] sm:text-xs text-[color:var(--color-text-muted)]">
          <span>
            Powered by{' '}
            <a href="https://gateoverflow.in/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--color-primary-text)] hover:underline">
              GATE Overflow
            </a>
          </span>
          <span className="text-[color:var(--color-border)]">|</span>
          <button
            type="button"
            onClick={() => setIsDataPolicyOpen(true)}
            aria-label="Open data policy"
            className="hover:text-[color:var(--color-text)] transition-colors inline-flex items-center gap-1"
          >
            <FaExclamationTriangle className="size-2 sm:size-2.5 text-amber-500" /> Data Policy
          </button>
          <span className="text-[color:var(--color-border)]">|</span>
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            aria-label="Support Gate QA"
            className="hover:text-[color:var(--color-text)] transition-colors inline-flex items-center gap-1"
          >
            Support Me <FaHeart className="size-2 sm:size-2.5 text-pink-500 transition-transform hover:scale-110" />
          </button>
        </div>
      </footer>

      <DataPolicyModal
        isOpen={isDataPolicyOpen}
        onClose={() => setIsDataPolicyOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
};

export default Footer;
