import type { RandomSource } from "../../core/random-source";
import type { ContentItem } from "../content/content-types";
import type { LearningRecord } from "../save/save-v5";
import { dueContentIds, resolveDueContentItems } from "./mastery";

export interface CatalogUnitLike {
  items: ContentItem[];
}

const REVIEW_MAX = 8;

function shuffle<T>(arr: T[], random: RandomSource): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Collect due ContentItems for a review battle (up to 8), matched from catalog units. */
export function collectDueContentItems(
  learning: Record<string, LearningRecord>,
  childId: string,
  now: number,
  catalogUnits: CatalogUnitLike[],
  random: RandomSource
): ContentItem[] {
  const ids = dueContentIds(learning, childId, now);
  const matched = resolveDueContentItems(catalogUnits, ids);
  if (matched.length === 0) return [];

  const shuffled = shuffle(matched, random);
  if (shuffled.length <= REVIEW_MAX) return shuffled;

  const count = 4 + Math.floor(random.next() * 5); // 4–8 when >8 due
  return shuffled.slice(0, count);
}

export function hasDueReviews(
  learning: Record<string, LearningRecord>,
  childId: string,
  now: number,
  catalogUnits: CatalogUnitLike[]
): boolean {
  const ids = dueContentIds(learning, childId, now);
  return resolveDueContentItems(catalogUnits, ids).length > 0;
}
