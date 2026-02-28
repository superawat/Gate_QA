import React, { useState } from 'react';
import DataPolicyModal from './DataPolicyModal';
import SupportModal from './SupportModal';
import { FaHeart, FaExclamationTriangle } from 'react-icons/fa';

const Footer = () => {
  const [isDataPolicyOpen, setIsDataPolicyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Current year or fixed year range as requested "2014-2025" (User mentioned dynamic or fixed, keeping fixed per specific text request, or dynamic end year to be safe? User text: "2014-2025". I will use dynamic end year to be smart about it, or revert to static if strict.)
  // User Text Requirement: "Copyright © GATE Overflow 2014-2025."
  // I will stick to the static text for now to be precise, or use dynamic if I want to be proactive. 
  // Let's use 2025 as requested in the text block.

  return (
    <>
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-1 px-1 sm:px-2 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between text-[10px] sm:text-xs leading-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-gray-800">
              Powered by <a href="https://gateoverflow.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold inline-block">GATE Overflow</a>
            </span>
            <button
              onClick={() => setIsDataPolicyOpen(true)}
              className="inline-flex items-center gap-1 px-1 py-0.5 bg-red-50 hover:bg-red-100 text-black rounded border border-red-500 transition-colors"
              title="Data Persistence & Policy"
            >
              <FaExclamationTriangle className="text-red-600 size-2.5 sm:size-3" />
              <span className="hidden sm:inline">Data Policy</span>
            </button>
          </div>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-gray-50 border border-gray-200 text-black rounded-full shadow-sm hover:shadow transition-all group"
          >
            <span className="hidden sm:inline font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
              Support Me
            </span>
            <FaHeart className="text-red-500 hover:scale-110 transition-transform size-2.5 sm:size-3" />
          </button>
        </div>
      </footer>

      {/* Data Policy Modal */}
      <DataPolicyModal
        isOpen={isDataPolicyOpen}
        onClose={() => setIsDataPolicyOpen(false)}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Data Policy Modal */}
      <DataPolicyModal
        isOpen={isDataPolicyOpen}
        onClose={() => setIsDataPolicyOpen(false)}
      />
    </>
  );
};

export default Footer;
