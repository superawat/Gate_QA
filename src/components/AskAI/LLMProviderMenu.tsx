import React, { useEffect, useRef } from "react";
import {
  LLM_PROVIDER_LIST,
  LLMProvider,
  LLMProviderId,
} from "../../config/llmProviders";
import { ProviderIcon } from "./LLMIcons";
import { FaCheck, FaCopy, FaStar, FaRegStar } from "react-icons/fa";

interface LLMProviderMenuProps {
  currentProviderId: LLMProviderId;
  onSelectProvider: (provider: LLMProvider) => void;
  onSetDefaultProvider: (providerId: LLMProviderId) => void;
  onCopyPromptOnly: () => void;
  onClose: () => void;
  className?: string;
}

export const LLMProviderMenu: React.FC<LLMProviderMenuProps> = ({
  currentProviderId,
  onSelectProvider,
  onSetDefaultProvider,
  onCopyPromptOnly,
  onClose,
  className = "",
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`gateqa-llm-menu-popover ${className}`}
      role="menu"
      aria-label="Select AI Provider"
    >
      <div className="gateqa-llm-menu-header flex items-center justify-between">
        <span className="gateqa-llm-menu-title">Select AI Assistant</span>
        <span className="text-[10px] text-[color:var(--color-text-muted)] font-medium">
          GATE-Optimized
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {LLM_PROVIDER_LIST.map((provider) => {
          const isSelected = provider.id === currentProviderId;
          return (
            <div
              key={provider.id}
              className={`flex items-center justify-between rounded-xl px-2 py-1.5 transition ${
                isSelected
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200"
                  : "hover:bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]"
              }`}
            >
              {/* Click to ask immediately with this provider */}
              <button
                type="button"
                onClick={() => onSelectProvider(provider)}
                className="flex flex-1 items-center gap-2.5 min-w-0 text-left"
                role="menuitem"
                title={`Ask ${provider.name}`}
              >
                <div
                  className="gateqa-llm-icon-frame"
                  style={{ color: provider.accentColor }}
                >
                  <ProviderIcon providerId={provider.id} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">
                      {provider.shortName}
                    </span>
                    {provider.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {provider.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[color:var(--color-text-muted)] truncate">
                    {provider.supportsPrefill ? "Auto-prefilled prompt" : "Copies prompt to clipboard"}
                  </p>
                </div>
              </button>

              {/* Set Default Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefaultProvider(provider.id);
                }}
                className={`p-1.5 rounded-lg transition shrink-0 ${
                  isSelected
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-[color:var(--color-text-muted)] hover:text-amber-500 opacity-60 hover:opacity-100"
                }`}
                title={isSelected ? "Current default AI" : `Set ${provider.shortName} as default`}
                aria-label={isSelected ? "Current default AI" : `Set ${provider.shortName} as default`}
              >
                {isSelected ? <FaStar className="w-3.5 h-3.5" /> : <FaRegStar className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="gateqa-llm-menu-footer">
        <button
          type="button"
          onClick={onCopyPromptOnly}
          className="gateqa-llm-copy-prompt-btn"
          role="menuitem"
          title="Copy formatted GATE prompt to clipboard for local or custom LLMs"
        >
          <FaCopy className="w-3 h-3" />
          <span>Copy Prompt Only</span>
        </button>
      </div>
    </div>
  );
};
