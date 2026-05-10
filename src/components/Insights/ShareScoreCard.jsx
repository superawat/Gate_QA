import React, { useCallback, useRef, useState } from "react";
import { FaDownload, FaShareAlt } from "react-icons/fa";

const CARD_WIDTH = 600;
const CARD_HEIGHT = 340;

const GRADIENT_START = "#0f172a";
const GRADIENT_END = "#1e293b";
const ACCENT = "#38bdf8";
const ACCENT_GREEN = "#34d399";
const ACCENT_AMBER = "#fbbf24";
const TEXT_WHITE = "#f8fafc";
const TEXT_MUTED = "#94a3b8";

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderCard(canvas, {
  attempted = 0,
  accuracy = 0,
  correct = 0,
  incorrect = 0,
  streak = 0,
  avgTime = "0m",
  dueReview = 0,
  subjects = [],
}) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 2;
  canvas.width = CARD_WIDTH * dpr;
  canvas.height = CARD_HEIGHT * dpr;
  canvas.style.width = `${CARD_WIDTH}px`;
  canvas.style.height = `${CARD_HEIGHT}px`;
  ctx.scale(dpr, dpr);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  grad.addColorStop(0, GRADIENT_START);
  grad.addColorStop(1, GRADIENT_END);
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.fillStyle = grad;
  ctx.fill();

  // Decorative accent circle
  ctx.beginPath();
  ctx.arc(CARD_WIDTH - 60, 60, 120, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(56, 189, 248, 0.06)";
  ctx.fill();

  // Title
  ctx.font = "bold 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = TEXT_WHITE;
  ctx.fillText("GATE QA — My Progress", 32, 44);

  // Accent line
  ctx.fillStyle = ACCENT;
  drawRoundedRect(ctx, 32, 56, 80, 3, 1.5);
  ctx.fill();

  // Date
  ctx.font = "500 11px Inter, system-ui, sans-serif";
  ctx.fillStyle = TEXT_MUTED;
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(dateStr, CARD_WIDTH - ctx.measureText(dateStr).width - 32, 44);

  // ── Stat boxes ──────────────────────────────────────────────────────────
  const statY = 80;
  const statH = 72;
  const statGap = 12;
  const statW = (CARD_WIDTH - 64 - statGap * 3) / 4;

  const stats = [
    { label: "Attempted", value: String(attempted), color: ACCENT },
    { label: "Accuracy", value: `${Math.round(accuracy)}%`, color: accuracy >= 70 ? ACCENT_GREEN : accuracy >= 50 ? ACCENT_AMBER : "#f87171" },
    { label: "Correct", value: String(correct), color: ACCENT_GREEN },
    { label: "Streak", value: `${streak} day${streak !== 1 ? "s" : ""}`, color: ACCENT_AMBER },
  ];

  stats.forEach((stat, i) => {
    const sx = 32 + i * (statW + statGap);
    drawRoundedRect(ctx, sx, statY, statW, statH, 12);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 24px Inter, system-ui, sans-serif";
    ctx.fillStyle = stat.color;
    ctx.fillText(stat.value, sx + 14, statY + 36);

    ctx.font = "600 10px Inter, system-ui, sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(stat.label.toUpperCase(), sx + 14, statY + 56);
  });

  // ── Subject bars ────────────────────────────────────────────────────────
  const barY = statY + statH + 24;
  ctx.font = "600 10px Inter, system-ui, sans-serif";
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText("SUBJECT ACCURACY", 32, barY);

  const barAreaY = barY + 14;
  const barMaxW = CARD_WIDTH - 64;
  const barH = 16;
  const barGapV = 6;

  const topSubjects = subjects
    .filter((s) => s.attemptedCount > 0)
    .sort((a, b) => b.attemptedCount - a.attemptedCount)
    .slice(0, 5);

  topSubjects.forEach((subj, i) => {
    const by = barAreaY + i * (barH + barGapV);
    const acc = subj.accuracyRate || 0;
    const filledW = Math.max(2, barMaxW * acc);

    // Background bar
    drawRoundedRect(ctx, 32, by, barMaxW, barH, 4);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();

    // Filled bar
    drawRoundedRect(ctx, 32, by, filledW, barH, 4);
    ctx.fillStyle = acc >= 0.7 ? ACCENT_GREEN : acc >= 0.5 ? ACCENT_AMBER : "#f87171";
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.font = "600 9px Inter, system-ui, sans-serif";
    ctx.fillStyle = TEXT_WHITE;
    const label = `${subj.subjectLabel || subj.subjectSlug} — ${Math.round(acc * 100)}%`;
    ctx.fillText(label, 38, by + 11.5);
  });

  // Footer
  ctx.font = "500 10px Inter, system-ui, sans-serif";
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText("gateqa.pages.dev", 32, CARD_HEIGHT - 16);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillText(`${avgTime} avg • ${dueReview} due for review`, CARD_WIDTH - ctx.measureText(`${avgTime} avg • ${dueReview} due for review`).width - 32, CARD_HEIGHT - 16);
}

const ShareScoreCard = ({ summary = {}, insights = {} }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  const totalCorrect = (insights.subjects || []).reduce((s, sub) => s + (sub.correctAttempts || 0), 0);
  const totalIncorrect = (insights.subjects || []).reduce((s, sub) => s + (sub.incorrectAttempts || 0), 0);

  const cardData = {
    attempted: summary.attemptedQuestionCount || 0,
    accuracy: (summary.averageSubjectAccuracy || 0) * 100,
    correct: totalCorrect,
    incorrect: totalIncorrect,
    streak: summary.currentStreak || 0,
    avgTime: summary.averageDurationMs > 0
      ? (summary.averageDurationMs < 60000 ? "<1m" : `${Math.round(summary.averageDurationMs / 60000)}m`)
      : "0m",
    dueReview: summary.dueReviewCount || 0,
    subjects: insights.subjects || [],
  };

  const handleGenerate = useCallback(() => {
    if (!canvasRef.current) return;
    renderCard(canvasRef.current, cardData);
    setRendered(true);
  }, [cardData]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `gateqa-scorecard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png"));
      if (navigator.share && blob) {
        const file = new File([blob], "gateqa-scorecard.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "My GATE QA Progress" });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [handleDownload]);

  if (summary.attemptedQuestionCount <= 0) return null;

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        {!rendered ? (
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 active:scale-95"
          >
            Generate Card
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 active:scale-95"
            >
              <FaDownload className="text-[10px]" /> Download
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] active:scale-95"
            >
              <FaShareAlt className="text-[10px]" /> Share
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center overflow-x-auto rounded-xl bg-slate-900/5 p-4">
        <canvas
          ref={canvasRef}
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20 }}
        />
      </div>
    </div>
  );
};

export default ShareScoreCard;
