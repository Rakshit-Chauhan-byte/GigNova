/**
 * Ranking Service for GigNova SmartMatch
 * Ranks candidates deterministically, handles sorting, filtering, and shortlisting.
 */

export interface RankedApplicantItem<T> {
  rank: number;
  data: T;
  totalScore: number;
  isEligible: boolean;
  createdAt: Date | string;
}

/**
 * Ranks eligible applicants highest to lowest score, followed by ineligible applicants
 */
export function rankApplicants<T extends { totalScore: number; isEligible: boolean; createdAt: Date | string }>(
  items: T[]
): RankedApplicantItem<T>[] {
  // Separate eligible from ineligible
  const eligible = items.filter((item) => item.isEligible);
  const ineligible = items.filter((item) => !item.isEligible);

  // Sort eligible by totalScore desc, then createdAt asc
  eligible.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  // Sort ineligible by totalScore desc
  ineligible.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  const ranked: RankedApplicantItem<T>[] = [];

  let currentRank = 1;
  for (const item of eligible) {
    ranked.push({
      rank: currentRank++,
      data: item,
      totalScore: item.totalScore,
      isEligible: true,
      createdAt: item.createdAt,
    });
  }

  // Ineligible candidates continue the ranking sequence or keep their relative index
  for (const item of ineligible) {
    ranked.push({
      rank: currentRank++,
      data: item,
      totalScore: item.totalScore,
      isEligible: false,
      createdAt: item.createdAt,
    });
  }

  return ranked;
}

/**
 * Returns top N eligible candidate IDs for bulk shortlisting
 */
export function getTopNEligible<T extends { id: string; totalScore: number; isEligible: boolean }>(
  items: T[],
  n: number
): string[] {
  const eligible = items.filter((i) => i.isEligible);
  eligible.sort((a, b) => b.totalScore - a.totalScore);
  return eligible.slice(0, Math.max(1, n)).map((i) => i.id);
}
