import React from "react";
import { LLMProviderId } from "../../config/llmProviders";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const SparklesIcon: React.FC<IconProps> = ({ size = 16, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const ChatGPTIcon: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.966a4.4707 4.4707 0 0 1-.5346-3.0075l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-2.487zm-1.637-9.371a4.4613 4.4613 0 0 1 2.3418-1.9669v5.6726a.7854.7854 0 0 0 .3927.6813l5.8428 3.3685-2.02 1.1683a.0804.0804 0 0 1-.071 0l-4.8303-2.7913A4.4945 4.4945 0 0 1 1.963 8.0922zm16.597 3.855-5.8333-3.3685L14.7467 7.41a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4945 4.4945 0 0 1-.6765 8.1042v-5.6773a.79.79 0 0 0-.4116-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.4297V7.0973a.0804.0804 0 0 1 .0332-.0615l4.8303-2.7914a4.4992 4.4992 0 0 1 6.3059 2.7797v.0003zM8.3055 12.859l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.7029 5.4592a.7948.7948 0 0 0-.3927.6813v6.7185zm1.0366-2.6163l2.6582-1.535 2.6582 1.535v3.07l-2.6582 1.535-2.6582-1.535v-3.07z" />
  </svg>
);

export const GeminiIcon: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Authentic Google Gemini 4-point Sparkle */}
    <path d="M12 1.5C12 7.299 7.299 12 1.5 12C7.299 12 12 16.701 12 22.5C12 16.701 16.701 12 22.5 12C16.701 12 12 7.299 12 1.5Z" />
    <path
      d="M19 2C19 3.657 17.657 5 16 5C17.657 5 19 6.343 19 8C19 6.343 20.343 5 22 5C20.343 5 19 3.657 19 2Z"
      opacity="0.85"
    />
  </svg>
);

export const ClaudeIcon: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Authentic Anthropic Claude Sunburst Asterisk */}
    <path d="M13.2 2.4a1.2 1.2 0 0 0-2.4 0v2.9a1 1 0 0 1-.7.9L7.4 7.4a1.2 1.2 0 0 0 .8 2.2l2.9-.5a1 1 0 0 1 1.1.5l1.5 2.5a1.2 1.2 0 0 0 2.1-.8l-.5-2.9a1 1 0 0 1 .4-1l2.5-1.5a1.2 1.2 0 0 0-.8-2.1l-2.9.5a1 1 0 0 1-1.1-.5L13.2 2.4Z" />
    <path d="M4.6 10.8a1.2 1.2 0 0 0 .8 2.2l2.9-.5a1 1 0 0 1 1.1.5l1.5 2.5a1.2 1.2 0 0 0 2.1-.8l-.5-2.9a1 1 0 0 1 .4-1l2.5-1.5a1.2 1.2 0 0 0-.8-2.1l-2.9.5a1 1 0 0 1-1.1-.5L9.1 4.2a1.2 1.2 0 0 0-2.1.8l.5 2.9a1 1 0 0 1-.4 1L4.6 10.8Z" />
    <path d="M10.8 21.6a1.2 1.2 0 0 0 2.4 0v-2.9a1 1 0 0 1 .7-.9l2.7-1.2a1.2 1.2 0 0 0-.8-2.2l-2.9.5a1 1 0 0 1-1.1-.5l-1.5-2.5a1.2 1.2 0 0 0-2.1.8l.5 2.9a1 1 0 0 1-.4 1l-2.5 1.5a1.2 1.2 0 0 0 .8 2.1l2.9-.5a1 1 0 0 1 1.1.5l.2 2.4Z" />
    <path d="M19.4 13.2a1.2 1.2 0 0 0-.8-2.2l-2.9.5a1 1 0 0 1-1.1-.5l-1.5-2.5a1.2 1.2 0 0 0-2.1.8l.5 2.9a1 1 0 0 1-.4 1l-2.5 1.5a1.2 1.2 0 0 0 .8 2.1l2.9-.5a1 1 0 0 1 1.1.5l1.5 2.5a1.2 1.2 0 0 0 2.1-.8l-.5-2.9a1 1 0 0 1 .4-1l2.5-1.5Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const DeepSeekIcon: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Authentic DeepSeek Blue Whale / Leaping Dolphin Emblem */}
    <path d="M21.8 7.4c-.7-1.7-2.1-3-3.8-3.7-3-1.1-7.2-.3-11.4 2.1C3 7.8 0 10.9 0 14c0 2.8 2.2 4.9 5.3 5.4 3 .5 6.6-.7 10-3.3 2.8-2.2 5.2-4.8 6.4-7.2.3-.5.3-1.1.1-1.5Zm-4.6 2.8c-.8.8-2 1.8-3.4 2.8-2.8 2-5.7 3-7.9 2.6-1.8-.3-2.9-1.4-2.9-2.8 0-1.8 2.1-4 5.3-5.7 3.3-1.8 6.5-2.4 8.6-1.7.9.3 1.5.8 1.8 1.4-.4 1-1 2.2-1.5 3.4Z" />
    <path d="M21.2 3.8c-.6 1.4-.2 3 .9 4 .4.4 1.1.4 1.5 0 .4-.4.4-1.1 0-1.5-.4-.4-.6-1.1-.3-1.7.3-.6.8-1 1.4-1.1.6-.1 1-.6.9-1.2-.1-.6-.6-1-1.2-.9-1.4.2-2.6 1.1-3.2 2.4Z" />
    <circle cx="15.8" cy="8.6" r="1.1" />
  </svg>
);

export const PerplexityIcon: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Authentic Perplexity Isometric Woven Asterisk Knot */}
    <path d="M12 2.5v19" />
    <path d="M4.5 7.5L12 12l7.5-4.5" />
    <path d="M4.5 16.5L12 12l7.5 4.5" />
    <path d="M4.5 7.5v9" />
    <path d="M19.5 7.5v9" />
    <path d="M8.25 5.25L12 7.5l3.75-2.25" />
    <path d="M8.25 18.75L12 16.5l3.75 2.25" />
  </svg>
);

export const ProviderIcon: React.FC<{ providerId: LLMProviderId; size?: number; className?: string }> = ({
  providerId,
  size = 18,
  className = "",
}) => {
  switch (providerId) {
    case "chatgpt":
      return <ChatGPTIcon size={size} className={className} />;
    case "gemini":
      return <GeminiIcon size={size} className={className} />;
    case "claude":
      return <ClaudeIcon size={size} className={className} />;
    case "deepseek":
      return <DeepSeekIcon size={size} className={className} />;
    case "perplexity":
      return <PerplexityIcon size={size} className={className} />;
    default:
      return <SparklesIcon size={size} className={className} />;
  }
};
