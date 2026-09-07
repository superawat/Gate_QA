export interface RevisionEvent {
  id: string; // e.g. "rev_1725184800000_abc12"
  timestamp: string; // ISO datetime
  source: "practice" | "manual";
  questionCount?: number;
  accuracyRate?: number;
}

export interface SyncedRevisionSummary {
  lastRevisedAt: string | null;
  lastSessionAccuracy: number | null;
  totalRevisionCount: number;
}

export const TRACKER_ANNOUNCEMENT_SEEN_KEY = "gateqa_tracker_announcement_seen_v1";

/** Summarizes local RevisionEvent[] history into a bounded SyncedRevisionSummary */
export const summarizeRevisionEvents = (events: RevisionEvent[] = []): SyncedRevisionSummary => {
  if (!Array.isArray(events) || events.length === 0) {
    return {
      lastRevisedAt: null,
      lastSessionAccuracy: null,
      totalRevisionCount: 0,
    };
  }

  let latest = events[0];
  let latestTime = new Date(latest.timestamp).getTime();

  for (let i = 1; i < events.length; i++) {
    const time = new Date(events[i].timestamp).getTime();
    if (time > latestTime) {
      latest = events[i];
      latestTime = time;
    }
  }

  return {
    lastRevisedAt: latest.timestamp,
    lastSessionAccuracy: latest.accuracyRate !== undefined ? latest.accuracyRate : null,
    totalRevisionCount: events.length,
  };
};

/** Merges remote SyncedRevisionSummary with local RevisionEvent[] in a bounded, safe manner */
export const mergeSyncedRevisionSummary = (
  localEvents: RevisionEvent[] = [],
  cloudSummary?: SyncedRevisionSummary | null
): SyncedRevisionSummary => {
  const localSummary = summarizeRevisionEvents(localEvents);
  if (!cloudSummary) return localSummary;

  const localTime = localSummary.lastRevisedAt ? new Date(localSummary.lastRevisedAt).getTime() : 0;
  const cloudTime = cloudSummary.lastRevisedAt ? new Date(cloudSummary.lastRevisedAt).getTime() : 0;

  const newerSummary = localTime >= cloudTime ? localSummary : cloudSummary;
  const totalCount = Math.max(localSummary.totalRevisionCount, cloudSummary.totalRevisionCount || 0);

  return {
    lastRevisedAt: newerSummary.lastRevisedAt,
    lastSessionAccuracy: newerSummary.lastSessionAccuracy,
    totalRevisionCount: totalCount,
  };
};
