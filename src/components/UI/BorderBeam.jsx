import React from "react";

/**
 * BorderBeam component
 * Creates an animated beam of light traveling along the perimeter of its parent container.
 * Driven 100% via hardware-accelerated CSS keyframe motion (0% main-thread CPU overhead).
 *
 * @param {Object} props
 * @param {number} [props.size=90] - The length/size of the glowing beam in pixels.
 * @param {number} [props.duration=6] - Duration of one full orbit loop in seconds.
 * @param {number} [props.delay=0] - Initial delay in seconds.
 * @param {string} [props.colorFrom="#06b6d4"] - Starting gradient color (Electric Cyan).
 * @param {string} [props.colorTo="#3b82f6"] - Ending gradient color (Royal Blue).
 * @param {number} [props.borderWidth=1.5] - The width of the border track in pixels.
 * @param {number} [props.borderRadius=14] - The corner border-radius in pixels.
 * @param {boolean} [props.reverse=false] - Whether to reverse animation direction.
 * @param {number} [props.initialOffset=0] - Starting offset percentage (0-100).
 * @param {string} [props.className=""] - Additional class names for outer container.
 * @param {React.CSSProperties} [props.style={}] - Additional styles for outer container.
 */
export const BorderBeam = ({
  size = 90,
  duration = 6,
  delay = 0,
  colorFrom = "#06b6d4",
  colorTo = "#3b82f6",
  borderWidth = 1.5,
  borderRadius = 14,
  reverse = false,
  initialOffset = 0,
  className = "",
  style = {},
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`.trim()}
      style={{
        borderRadius: `${borderRadius}px`,
        border: `${borderWidth}px solid transparent`,
        WebkitMaskImage:
          "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
        WebkitMaskClip: "padding-box, border-box",
        WebkitMaskComposite: "xor",
        maskImage:
          "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
        maskClip: "padding-box, border-box",
        maskComposite: "exclude",
        ...style,
      }}
    >
      <div
        className="border-beam-element pointer-events-none"
        style={{
          width: `${size}px`,
          offsetPath: `rect(0 auto auto 0 round ${borderRadius}px)`,
          offsetDistance: `${initialOffset}%`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          "--border-beam-duration": `${duration}s`,
          "--border-beam-delay": `${-delay}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      />
    </div>
  );
};

export default BorderBeam;
