/**
 * mockSampling.ts
 *
 * High-performance, mathematically unbiased stratified question sampler
 * for GateQA Custom Mock Builder.
 *
 * Implements Subject-Stratified Uniform Sampling to eliminate the subtopic
 * starvation and 50x frequency skew inherent in hierarchical round-robin queues.
 */

export interface SubjectStratifiedOptions<T> {
  /**
   * Resolver function to extract canonical subject key from a question item.
   * Defaults to item.subjectSlug || "unknown".
   */
  getSubjectKey?: (item: T) => string;

  /**
   * Injected PRNG returning [0, 1). Defaults to Math.random.
   */
  rng?: () => number;

  /**
   * Subject allocation mode:
   * - "balanced": equal distribution across selected subjects, bounded by pool availability (default).
   * - "proportional": distribution proportional to subject pool sizes.
   */
  allocationMode?: "balanced" | "proportional";
}

/**
 * Pure Fisher-Yates uniform shuffle with optional injected PRNG.
 */
export function uniformShuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const swapIdx = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[swapIdx];
    result[swapIdx] = temp;
  }
  return result;
}

/**
 * Samples targetCount questions from pool using Subject-Stratified Uniform Sampling.
 *
 * Guarantees:
 * 1. Single subject: 100% pure uniform random sampling across the pool (P(q_i) = targetCount / |Pool|).
 * 2. Multi-subject: Balanced representation across chosen subjects, with 100% uniform random
 *    selection within each subject stratum (P(q_i | q_i in S) = quota(S) / |Pool_S|).
 * 3. Small/exhausted subject pools gracefully cap at pool size and unfulfilled quotas
 *    are redistributed across remaining active subjects.
 */
export function sampleSubjectStratifiedQuestions<T>(
  pool: readonly T[],
  targetCount: number,
  options: SubjectStratifiedOptions<T> = {}
): T[] {
  const count = Math.max(0, Math.min(pool.length, Math.floor(Number(targetCount) || 0)));
  if (count === 0 || pool.length === 0) {
    return [];
  }

  const {
    getSubjectKey = (item: any) => String(item?.subjectSlug || item?.subject || "unknown").trim().toLowerCase(),
    rng = Math.random,
    allocationMode = "balanced",
  } = options;

  if (count >= pool.length) {
    return uniformShuffle(pool, rng);
  }

  // 1. Group pool by canonical subject key
  const poolBySubject = new Map<string, T[]>();
  for (const item of pool) {
    const key = getSubjectKey(item) || "unknown";
    let group = poolBySubject.get(key);
    if (!group) {
      group = [];
      poolBySubject.set(key, group);
    }
    group.push(item);
  }

  const subjects = Array.from(poolBySubject.keys());
  if (subjects.length <= 1) {
    // Single subject: Pure uniform random selection!
    return uniformShuffle(pool, rng).slice(0, count);
  }

  // 2. Allocate quotas across subjects
  const quotas = new Map<string, number>();
  const available = new Map<string, number>();
  for (const s of subjects) {
    quotas.set(s, 0);
    available.set(s, poolBySubject.get(s)!.length);
  }

  let allocated = 0;
  // Shuffle subject order to avoid alphabetical or insertion bias when distributing remainder slots
  const shuffledSubjects = uniformShuffle(subjects, rng);

  if (allocationMode === "balanced") {
    // Dynamic round-robin quota allocation with availability capping & redistribution
    let active = shuffledSubjects.filter((s) => available.get(s)! > 0);

    while (allocated < count && active.length > 0) {
      for (const s of active) {
        if (allocated >= count) break;
        const current = quotas.get(s)!;
        if (current < available.get(s)!) {
          quotas.set(s, current + 1);
          allocated += 1;
        }
      }
      active = active.filter((s) => quotas.get(s)! < available.get(s)!);
    }
  } else {
    // Proportional allocation mode
    for (const s of subjects) {
      const subPoolSize = available.get(s)!;
      const share = Math.floor((subPoolSize / pool.length) * count);
      quotas.set(s, share);
      allocated += share;
    }
    // Distribute remaining slots to subjects with capacity
    let remaining = count - allocated;
    for (const s of shuffledSubjects) {
      if (remaining <= 0) break;
      const current = quotas.get(s)!;
      if (current < available.get(s)!) {
        quotas.set(s, current + 1);
        remaining -= 1;
      }
    }
  }

  // 3. Intra-subject sampling: 100% UNIFORM RANDOM
  const sampled: T[] = [];
  for (const [s, quota] of quotas.entries()) {
    if (quota <= 0) continue;
    const subPool = poolBySubject.get(s)!;
    const shuffledSubPool = uniformShuffle(subPool, rng);
    sampled.push(...shuffledSubPool.slice(0, quota));
  }

  // 4. Final shuffle so questions from the same subject aren't clustered together
  return uniformShuffle(sampled, rng);
}
