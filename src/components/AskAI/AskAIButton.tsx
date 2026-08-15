import React, { useState, useCallback } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SparklesIcon, ProviderIcon } from "./LLMIcons";
import { LLMProviderMenu } from "./LLMProviderMenu";
import { useLLMPreference } from "../../utils/llmPreferences";
import { openLLMForQuestion, copyPromptOnly } from "../../services/llmRedirectService";
import { LLMProvider, LLMProviderId } from "../../config/llmProviders";
import { QuestionLike } from "../../utils/llmPromptBuilder";
import "./AskAI.css";

export interface AskAIButtonProps {
  question: QuestionLike;
  onNotification?: (message: string) => void;
  className?: string;
  isMobile?: boolean;
}

export const AskAIButton: React.FC<AskAIButtonProps> = ({
  question,
  onNotification,
  className = "",
  isMobile = false,
}) => {
  const { providerId, provider, setPreference } = useLLMPreference();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notify = useCallback(
    (msg: string) => {
      if (typeof onNotification === "function") {
        onNotification(msg);
      }
    },
    [onNotification]
  );

  const handlePrimaryClick = async () => {
    setIsMenuOpen(false);
    const result = await openLLMForQuestion(question, providerId);
    if (result.message) {
      notify(result.message);
    }
  };

  const handleSelectProvider = async (selectedProvider: LLMProvider) => {
    setIsMenuOpen(false);
    const result = await openLLMForQuestion(question, selectedProvider.id);
    if (result.message) {
      notify(result.message);
    }
  };

  const handleSetDefaultProvider = (targetProviderId: LLMProviderId) => {
    setPreference(targetProviderId);
    const newProvider = LLMProviderMenu; // ensure reference
    notify(`Default AI changed to ${targetProviderId.toUpperCase()}`);
  };

  const handleCopyPrompt = async () => {
    setIsMenuOpen(false);
    const result = await copyPromptOnly(question);
    if (result.message) {
      notify(result.message);
    }
  };

  return (
    <div className={`gateqa-ask-ai-container ${isMobile ? "gateqa-ask-ai-mobile" : ""} ${className}`}>
      <div className="gateqa-ask-ai-btn-group">
        {/* Main Action: Ask preferred AI */}
        <button
          type="button"
          onClick={handlePrimaryClick}
          className="gateqa-ask-ai-primary-btn"
          title={`Ask ${provider.name} to explain this question`}
          aria-label={`Ask AI (${provider.shortName})`}
        >
          <SparklesIcon size={16} className="text-sky-500 shrink-0" />
          <span>Ask AI</span>
        </button>

        {/* Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="gateqa-ask-ai-trigger-btn"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
          title="Choose AI Provider or Change Default"
          aria-label="Choose AI Provider or Change Default"
        >
          {isMenuOpen ? (
            <FaChevronUp className="w-2.5 h-2.5" />
          ) : (
            <FaChevronDown className="w-2.5 h-2.5" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <LLMProviderMenu
          currentProviderId={providerId}
          onSelectProvider={handleSelectProvider}
          onSetDefaultProvider={handleSetDefaultProvider}
          onCopyPromptOnly={handleCopyPrompt}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default React.memo(AskAIButton);
