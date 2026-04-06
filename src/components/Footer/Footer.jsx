import React, { useState } from 'react';
import { FaExclamationTriangle, FaHeart } from 'react-icons/fa';

import DataPolicyModal from './DataPolicyModal';
import SupportModal from './SupportModal';

const Footer = () => {
  const [isDataPolicyOpen, setIsDataPolicyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto w-full border-t border-gray-200 bg-gray-50 px-1 py-0 sm:px-1.5">
        <div className="mx-auto flex max-w-7xl flex-row items-center justify-between text-[10px] leading-none sm:min-h-[24px] sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-gray-800">
              Powered by <a href="https://gateoverflow.in/" target="_blank" rel="noopener noreferrer" className="inline-block font-semibold text-blue-600 hover:underline">GATE Overflow</a>
            </span>
            <button
              onClick={() => setIsDataPolicyOpen(true)}
              className="inline-flex items-center gap-1 rounded border border-red-500 bg-red-50 px-1 py-0 text-[10px] text-black transition-colors hover:bg-red-100 sm:text-xs"
              title="Data Persistence & Policy"
            >
              <FaExclamationTriangle className="size-2 text-red-600 sm:size-2.5" />
              <span className="hidden sm:inline">Data Policy</span>
            </button>
          </div>

          <button
            onClick={() => setIsSupportOpen(true)}
            className="group inline-flex items-center gap-1 rounded-full border border-pink-500 bg-pink-500 px-1.5 py-0 text-[10px] text-white transition-all hover:border-pink-600 hover:bg-pink-600 sm:text-xs shadow-sm hover:shadow-md"
          >
            <span className="hidden font-semibold tracking-tight text-white sm:inline">
              Support Me
            </span>
            <FaHeart className="size-2 text-white transition-transform hover:scale-110 sm:size-2.5" />
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
