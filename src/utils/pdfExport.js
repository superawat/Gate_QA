import { loadWeakTopicInsights } from "./weakTopicAnalyzer";

const DEFAULT_FILENAME = "gateqa-progress-report.pdf";

const sanitizeFilename = (filename = DEFAULT_FILENAME) => {
  const normalized = String(filename || DEFAULT_FILENAME)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    return DEFAULT_FILENAME;
  }
  return normalized.toLowerCase().endsWith(".pdf")
    ? normalized
    : `${normalized}.pdf`;
};

const formatPercent = (value, digits = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0%";
  return `${(numeric * 100).toFixed(digits)}%`;
};

const formatDuration = (durationMs) => {
  const numeric = Number(durationMs);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "0s";
  }
  const seconds = Math.round(numeric / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

export const exportCurrentPageToPdf = async ({
  filename = DEFAULT_FILENAME,
  title = "GateQA Progress Report",
  win = typeof window !== "undefined" ? window : null,
} = {}) => {
  if (!win?.document) {
    return { ok: false, reason: "document_unavailable" };
  }

  // 1. Fetch live insights data
  let insights;
  try {
    insights = await loadWeakTopicInsights({
      fetchImpl: win.fetch,
      storage: win.localStorage,
    });
  } catch (error) {
    return { ok: false, reason: "insights_failed", error: error.message };
  }

  // 2. Load jsPDF dynamically
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title,
    subject: "GateQA Progress Report",
    creator: "GateQA PDF Compiler",
  });

  // Color Palette Constants
  const colors = {
    primary: [15, 23, 42],      // Slate 900
    secondary: [100, 116, 139], // Slate 500
    brand: [79, 70, 229],      // Indigo 600
    brandLight: [238, 242, 255], // Indigo 50
    success: [16, 185, 129],    // Emerald 500
    warning: [245, 158, 11],    // Amber 500
    danger: [239, 68, 68],      // Red 500
    neutralLight: [248, 250, 252], // Slate 50
    border: [226, 232, 240],    // Slate 200
  };

  const drawHeader = (pageNumber, totalPages) => {
    // Top border accent line
    doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.rect(0, 0, 210, 4, "F");

    // Brand Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.text("GATE QA", 15, 12);

    // Muted Page Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("STUDENT PERFORMANCE & ANALYTICS BOOKLET", 40, 12);

    // Separator line
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.line(15, 16, 195, 16);
  };

  const drawFooter = (pageNumber, totalPages) => {
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.line(15, 282, 195, 282);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text("Data stored locally. Remember to back up regularly in Tools.", 15, 288);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 180, 288);
  };

  // ----------------------------------------------------
  // PAGE 1: HERO & CORE STATS INFOGRAPHIC
  // ----------------------------------------------------
  drawHeader(1, 2);

  // Hero Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Progress Report", 15, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("GateQA CS Past Year Question Practice Dashboard Analytics", 15, 36);

  // Stats Grid Container
  doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
  doc.roundedRect(15, 42, 180, 22, 2, 2, "F");

  // Grid Stats text
  const streak = insights.studyActivity?.currentStreak || 0;
  const xp = insights.studyActivity?.xp || 0;
  const activeDays = insights.studyActivity?.activeDayCount || 0;
  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("CURRENT STREAK", 22, 50);
  doc.text("TOTAL PRACTICE XP", 66, 50);
  doc.text("ACTIVE DAYS", 112, 50);
  doc.text("DATE GENERATED", 152, 50);

  doc.setFontSize(13);
  doc.setTextColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.text(`${streak} Days`, 22, 57);
  doc.text(`${xp} XP`, 66, 57);
  doc.text(`${activeDays} Days`, 112, 57);
  doc.text(reportDate, 152, 57);

  // 4 Key Performance Metrics Cards
  const solvedCount = insights.attemptedQuestionCount || 0;
  const accuracy = insights.timeSummary?.averageSubjectAccuracy || insights.subjects.reduce((sum, s) => sum + s.accuracyRate, 0) / (insights.subjects.length || 1);
  const avgTime = insights.timeSummary?.averageDurationMs || 0;
  const reviewDueCount = insights.reviewQueue?.length || 0;

  // Row 1 Cards
  // Card 1
  doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.roundedRect(15, 72, 86, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("QUESTIONS ATTEMPTED", 22, 80);
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(String(solvedCount), 22, 90);

  // Card 2
  doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
  doc.roundedRect(109, 72, 86, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("AVERAGE ACCURACY", 116, 80);
  doc.setFontSize(16);
  doc.setTextColor(accuracy >= 0.7 ? colors.success[0] : accuracy >= 0.5 ? colors.warning[0] : colors.danger[0]);
  doc.text(formatPercent(accuracy), 116, 90);

  // Row 2 Cards
  // Card 3
  doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
  doc.roundedRect(15, 104, 86, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("AVERAGE TIMED SPEED", 22, 112);
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(formatDuration(avgTime), 22, 122);

  // Card 4
  doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
  doc.roundedRect(109, 104, 86, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text("DUE spaced REVIEWS", 116, 112);
  doc.setFontSize(16);
  doc.setTextColor(reviewDueCount > 0 ? colors.warning[0] : colors.success[0]);
  doc.text(String(reviewDueCount), 116, 122);

  // Difficulty spread infographic
  const diffCounts = insights.difficultySummary?.counts || { Light: 0, Medium: 0, Hard: 0, Unrated: 0 };
  const totalRated = diffCounts.Light + diffCounts.Medium + diffCounts.Hard || 1;
  const lightPct = diffCounts.Light / totalRated;
  const mediumPct = diffCounts.Medium / totalRated;
  const hardPct = diffCounts.Hard / totalRated;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("SOLVED DIFFICULTY SPREAD", 15, 142);

  // Draw stacked bar
  const barX = 15;
  const barY = 148;
  const barW = 180;
  const barH = 7;

  const wLight = barW * lightPct;
  const wMedium = barW * mediumPct;
  const wHard = barW * hardPct;

  // Easy / Light segment (Green)
  if (wLight > 0) {
    doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.rect(barX, barY, wLight, barH, "F");
  }
  // Medium segment (Amber)
  if (wMedium > 0) {
    doc.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.rect(barX + wLight, barY, wMedium, barH, "F");
  }
  // Hard segment (Red)
  if (wHard > 0) {
    doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.rect(barX + wLight + wMedium, barY, wHard, barH, "F");
  }

  // Labels under bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
  doc.text(`Easy: ${diffCounts.Light} Qs (${Math.round(lightPct * 100)}%)`, 15, 160);

  doc.setTextColor(colors.warning[0], colors.warning[1], colors.warning[2]);
  doc.text(`Medium: ${diffCounts.Medium} Qs (${Math.round(mediumPct * 100)}%)`, 75, 160);

  doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
  doc.text(`Hard: ${diffCounts.Hard} Qs (${Math.round(hardPct * 100)}%)`, 135, 160);

  // Focus areas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("CRITICAL TOPIC FOCUS AREAS", 15, 178);

  const weakSubtopics = insights.subtopics
    .filter((st) => st.attemptedCount > 0 && st.accuracyRate < 0.6)
    .slice(0, 3);

  if (weakSubtopics.length === 0) {
    // Perfect performance
    doc.setFillColor(colors.brandLight[0], colors.brandLight[1], colors.brandLight[2]);
    doc.roundedRect(15, 184, 180, 24, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.text("ALL CRITICAL SUBTOPICS STABLE", 22, 194);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Excellent! You maintain a strong accuracy profile (>60%) on all recently practiced subtopics.", 22, 200);
  } else {
    // Render focus subtopics list
    weakSubtopics.forEach((st, idx) => {
      const boxY = 184 + idx * 24;
      doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.roundedRect(15, boxY, 180, 20, 2, 2, "FD");

      doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.circle(22, boxY + 10, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text(st.label, 28, boxY + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(`${st.subjectLabel}  ·  ${st.attemptedCount} attempts  ·  `, 28, boxY + 14);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.text(`Accuracy: ${Math.round(st.accuracyRate * 100)}%`, 140, boxY + 12);
    });
  }

  drawFooter(1, 2);

  // ----------------------------------------------------
  // PAGE 2: SUBJECT PERFORMANCE & BACKUP LAWS
  // ----------------------------------------------------
  doc.addPage();
  drawHeader(2, 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Subject-wise Performance Breakdown", 15, 26);

  // Table Headers
  const tableY = 32;
  doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.rect(15, tableY, 180, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("SUBJECT", 18, tableY + 5.5);
  doc.text("ATTEMPTED", 82, tableY + 5.5);
  doc.text("ACCURACY", 112, tableY + 5.5);
  doc.text("COVERAGE PROGRESS", 146, tableY + 5.5);

  // Table rows
  const subjects = insights.subjects || [];
  subjects.forEach((subject, idx) => {
    const rowY = tableY + 8 + (idx * 11);
    if (rowY > 180) return; // Prevent overflow

    // Zebra striping
    if (idx % 2 === 1) {
      doc.setFillColor(colors.neutralLight[0], colors.neutralLight[1], colors.neutralLight[2]);
      doc.rect(15, rowY, 180, 11, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const cleanLabel = subject.label.length > 28 ? subject.label.substring(0, 26) + "..." : subject.label;
    doc.text(cleanLabel, 18, rowY + 7);

    // Attempted count
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`${subject.attemptedQuestions}/${subject.availableQuestions} Qs`, 82, rowY + 7);

    // Accuracy
    const acc = subject.accuracyRate || 0;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(acc >= 0.7 ? colors.success[0] : acc >= 0.5 ? colors.warning[0] : colors.danger[0]);
    doc.text(formatPercent(acc), 112, rowY + 7);

    // Coverage Progress Bar
    const cov = subject.coverageRate || 0;
    const pBarX = 146;
    const pBarY = rowY + 4;
    const pBarW = 36;
    const pBarH = 2.5;

    // Track
    doc.setFillColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.rect(pBarX, pBarY, pBarW, pBarH, "F");
    // Fill
    doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.rect(pBarX, pBarY, pBarW * cov, pBarH, "F");

    // Coverage number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(`${Math.round(cov * 100)}%`, pBarX + pBarW + 2, rowY + 6.5);
  });

  // Data Privacy & Backups section
  const backupY = 194;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("IMPORTANT: LOCAL STORAGE & DATA SECURITY", 15, backupY);

  doc.setFillColor(colors.brandLight[0], colors.brandLight[1], colors.brandLight[2]);
  doc.setDrawColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, backupY + 5, 180, 48, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(colors.brand[0], colors.brand[1], colors.brand[2]);
  doc.text("Why backups are crucial to protect your preparation:", 22, backupY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  
  const rules = [
    "No server tracking: All your answers, bookmarks, and mock test histories are 100% offline in browser cache.",
    "Data Loss Risks: Browser cleanup, private browsing sessions, or device changes will permanently clear local storage.",
    "Suggested Workflow: Periodically save progress by downloading standard JSON files inside the Tools menu.",
    "Safe Backup Folder: Save your downloaded JSON files in a dedicated Google Drive / local directory on your device.",
  ];

  rules.forEach((rule, idx) => {
    doc.setFillColor(colors.brand[0], colors.brand[1], colors.brand[2]);
    doc.circle(24, backupY + 20 + (idx * 7.5), 0.8, "F");
    doc.text(rule, 29, backupY + 22 + (idx * 7.5));
  });

  drawFooter(2, 2);

  // 3. Save Document
  const finalFilename = sanitizeFilename(filename);
  doc.save(finalFilename);

  return {
    ok: true,
    filename: finalFilename,
    pageCount: 2,
  };
};
