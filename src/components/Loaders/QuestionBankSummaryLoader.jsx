import React from "react";

const STAT_CARDS = [
  { x: 4, begin: "0s" },
  { x: 51, begin: "0.18s" },
  { x: 98, begin: "0.36s" },
];

const joinClasses = (...tokens) => tokens.filter(Boolean).join(" ");

const QuestionBankSummaryLoader = ({
  ariaLabel = "Loading question bank summary...",
  className = "",
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={ariaLabel}
    className={joinClasses("inline-flex items-center justify-center", className)}
  >
    <svg
      width="142"
      height="46"
      viewBox="0 0 142 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="bank-summary-track" x1="15" y1="38" x2="127" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbe5f0" />
          <stop offset="0.5" stopColor="#e8eff7" />
          <stop offset="1" stopColor="#dbe5f0" />
        </linearGradient>
      </defs>

      <path
        d="M15 38H127"
        stroke="url(#bank-summary-track)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {STAT_CARDS.map((card) => (
        <g key={card.x}>
          <rect
            x={card.x}
            y="4"
            width="40"
            height="24"
            rx="10"
            fill="#ffffff"
            stroke="#d8e4f2"
          >
            <animate
              attributeName="fill"
              values="#ffffff;#f3f8ff;#ffffff"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke"
              values="#d8e4f2;#93c5fd;#d8e4f2"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
          </rect>
          <rect x={card.x + 8} y="11" width="12" height="3.5" rx="1.75" fill="#c8d7e8">
            <animate
              attributeName="opacity"
              values="0.55;1;0.55"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
          </rect>
          <rect x={card.x + 8} y="17" width="20" height="5" rx="2.5" fill="#8ea8c2">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
          </rect>
          <line
            x1={card.x + 20}
            y1="28"
            x2={card.x + 20}
            y2="34"
            stroke="#d8e4f2"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={card.x + 20} cy="38" r="3.25" fill="#ffffff" stroke="#bed0e5" strokeWidth="1.75">
            <animate
              attributeName="fill"
              values="#ffffff;#dbeafe;#ffffff"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke"
              values="#bed0e5;#38bdf8;#bed0e5"
              dur="1.1s"
              begin={card.begin}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      <circle cx="15" cy="38" r="4" fill="#0f172a">
        <animateMotion
          dur="1.6s"
          repeatCount="indefinite"
          path="M15 38H127"
        />
      </circle>
      <circle cx="15" cy="38" r="2.25" fill="#7dd3fc" opacity="0.75">
        <animateMotion
          dur="1.6s"
          begin="0.22s"
          repeatCount="indefinite"
          path="M15 38H127"
        />
      </circle>
    </svg>
  </div>
);

export default QuestionBankSummaryLoader;
