import React from "react";

const TOPIC_NODES = [
  { label: "ALG", x: 14, y: 14, width: 44, begin: "0s" },
  { label: "DBMS", x: 66, y: 14, width: 54, begin: "0.45s" },
  { label: "OS", x: 128, y: 14, width: 34, begin: "0.9s" },
  { label: "CN", x: 170, y: 14, width: 34, begin: "1.35s" },
];

const joinClasses = (...tokens) => tokens.filter(Boolean).join(" ");

const CsTopicLoader = ({
  label = "Loading...",
  ariaLabel,
  className = "",
  textClassName = "",
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={ariaLabel || label}
    className={joinClasses("flex flex-col items-center justify-center gap-4", className)}
  >
    <svg
      width="224"
      height="92"
      viewBox="0 0 224 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="mock-loader-track" x1="28" y1="64" x2="196" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c8d7e8" />
          <stop offset="0.5" stopColor="#d8e4f2" />
          <stop offset="1" stopColor="#c8d7e8" />
        </linearGradient>
        <linearGradient id="mock-loader-flow" x1="28" y1="64" x2="196" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#0f172a" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <filter id="mock-loader-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M28 64H196"
        stroke="url(#mock-loader-track)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 64H196"
        stroke="url(#mock-loader-flow)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="14 12"
        opacity="0.85"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-52"
          dur="1.35s"
          repeatCount="indefinite"
        />
      </path>

      {TOPIC_NODES.map((node) => {
        const centerX = node.x + node.width / 2;
        return (
          <g key={node.label}>
            <line
              x1={centerX}
              y1="48"
              x2={centerX}
              y2="58"
              stroke="#c8d7e8"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height="28"
              rx="14"
              fill="#ffffff"
              stroke="#d8e4f2"
            >
              <animate
                attributeName="fill"
                values="#ffffff;#eff6ff;#ffffff"
                dur="2.1s"
                begin={node.begin}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke"
                values="#d8e4f2;#7dd3fc;#d8e4f2"
                dur="2.1s"
                begin={node.begin}
                repeatCount="indefinite"
              />
            </rect>
            <text
              x={centerX}
              y="31"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.14em"
              fill="#1e3a5f"
              style={{ fontFamily: "inherit" }}
            >
              {node.label}
              <animate
                attributeName="fill"
                values="#1e3a5f;#0f172a;#1e3a5f"
                dur="2.1s"
                begin={node.begin}
                repeatCount="indefinite"
              />
            </text>
            <circle cx={centerX} cy="64" r="4.5" fill="#ffffff" stroke="#bed0e5" strokeWidth="2">
              <animate
                attributeName="fill"
                values="#ffffff;#dbeafe;#ffffff"
                dur="2.1s"
                begin={node.begin}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke"
                values="#bed0e5;#38bdf8;#bed0e5"
                dur="2.1s"
                begin={node.begin}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}

      <circle cx="28" cy="64" r="6" fill="#0f172a" filter="url(#mock-loader-glow)">
        <animateMotion
          dur="2.1s"
          repeatCount="indefinite"
          path="M28 64H196"
        />
      </circle>
      <circle cx="28" cy="64" r="3.5" fill="#38bdf8" opacity="0.65">
        <animateMotion
          dur="2.1s"
          begin="0.32s"
          repeatCount="indefinite"
          path="M28 64H196"
        />
      </circle>
    </svg>

    {label ? <p className={textClassName}>{label}</p> : null}
  </div>
);

export default CsTopicLoader;
