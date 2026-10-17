export function buildReportIssueUrl(question = {}, questionProgressId = "") {
  const questionUid = String(question?.question_uid || questionProgressId || question?.id || "").trim() || "unknown-question";
  const yearLabel = String(question?.exam?.label || question?.yearSetLabel || question?.year || "Unknown").trim();
  const subjectLabel = String(question?.subjectLabel || question?.subject || "Unknown").trim();
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const issueBody = [
    `Question UID: ${questionUid}`,
    `Year/Set: ${yearLabel}`,
    `Subject: ${subjectLabel}`,
    `Page: ${pageUrl}`,
  ].join("\n");
  const params = new URLSearchParams({
    "entry.176806537": issueBody,
  });
  return `https://docs.google.com/forms/d/e/1FAIpQLSdSuxChEW-ndNaochXNbSj6FZ02xcxTkjTAECc-Ggeqn6ddkg/viewform?usp=pp_url&${params.toString()}`;
}
