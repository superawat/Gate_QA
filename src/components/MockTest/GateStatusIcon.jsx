import React from "react";

export const GATE_VISUAL_STATUS = {
    NOT_VISITED: "NOT_VISITED",
    NOT_ANSWERED: "NOT_ANSWERED",
    ANSWERED: "ANSWERED",
    MARKED: "MARKED",
    ANSWERED_MARKED: "ANSWERED_MARKED",
};

const STATUS_MODIFIER = {
    [GATE_VISUAL_STATUS.NOT_VISITED]: "not-visited",
    [GATE_VISUAL_STATUS.NOT_ANSWERED]: "not-answered",
    [GATE_VISUAL_STATUS.ANSWERED]: "answered",
    [GATE_VISUAL_STATUS.MARKED]: "marked",
    [GATE_VISUAL_STATUS.ANSWERED_MARKED]: "answered-marked",
};

const VALID_STATUSES = new Set(Object.values(GATE_VISUAL_STATUS));

const normalizeVisualStatus = (status) => {
    if (VALID_STATUSES.has(status)) {
        return status;
    }
    return GATE_VISUAL_STATUS.NOT_VISITED;
};

export const getGateVisualStatus = (state, STATUS) => {
    switch (state) {
        case STATUS?.ANSWERED:
            return GATE_VISUAL_STATUS.ANSWERED;
        case STATUS?.NOT_ANSWERED:
            return GATE_VISUAL_STATUS.NOT_ANSWERED;
        case STATUS?.MARKED_FOR_REVIEW:
            return GATE_VISUAL_STATUS.MARKED;
        case STATUS?.ANSWERED_AND_MARKED_FOR_REVIEW:
            return GATE_VISUAL_STATUS.ANSWERED_MARKED;
        case STATUS?.NOT_VISITED:
        default:
            return GATE_VISUAL_STATUS.NOT_VISITED;
    }
};

export const getGateStatusModifier = (status) => {
    const safeStatus = normalizeVisualStatus(status);
    return STATUS_MODIFIER[safeStatus];
};

export const hasGateCheckmark = (status) => {
    return normalizeVisualStatus(status) === GATE_VISUAL_STATUS.ANSWERED_MARKED;
};

const joinClassNames = (...tokens) => tokens.filter(Boolean).join(" ");

const GateStatusIcon = ({
    status,
    variant = "legend",
    value,
    className = "",
    ...rest
}) => {
    const safeStatus = normalizeVisualStatus(status);
    const statusModifier = getGateStatusModifier(safeStatus);
    const showCheck = hasGateCheckmark(safeStatus);
    const safeVariant = variant === "tile" ? "tile" : "legend";

    return (
        <span
            {...rest}
            data-status={safeStatus}
            className={joinClassNames(
                "gate-status-icon",
                `gate-status-icon--${safeVariant}`,
                `gate-status--${statusModifier}`,
                showCheck ? "gate-status--with-check" : "",
                className
            )}
        >
            <span className="gate-status-icon__value">{value}</span>
            {showCheck ? (
                <span className="gate-status-check" aria-hidden="true">
                    <svg viewBox="0 0 14 14" focusable="false" aria-hidden="true">
                        <path d="M2.1 7.2 5.5 10.7 11.9 3.8" />
                    </svg>
                </span>
            ) : null}
        </span>
    );
};

export default GateStatusIcon;
