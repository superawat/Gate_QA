import React from "react";

const ModeCard = ({
  title,
  description,
  icon,
  selected,
  disabled,
  onClick,
  badge = null,
  children = null,
}) => {
  const cardClasses = [
    "relative",
    "border-2",
    "rounded-xl",
    "h-auto",
    "min-h-[44px]",
    selected
      ? "border-blue-500 ring-2 ring-blue-400 bg-blue-50"
      : "border-gray-200 bg-white",
    disabled
      ? "opacity-40 cursor-not-allowed pointer-events-none"
      : "hover:scale-[1.01] transition-transform duration-150",
  ].join(" ");

  return (
    <div className={cardClasses}>
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
          {badge}
        </span>
      ) : null}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className="w-full p-4 pr-20 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-blue-600">{icon}</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </button>

      {children ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
};

export default ModeCard;