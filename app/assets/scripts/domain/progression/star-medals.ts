/** Next mission unlocks when the previous unit has any star medal (completion), not full stars. */
export function isMissionUnlocked(previousMissionCompleted: boolean): boolean {
  return previousMissionCompleted;
}

/** Unit 0 always open; later units need prior unit stars > 0. */
export function isUnitUnlocked(
  unitIndex: number,
  unitIds: readonly string[],
  unitStars: Record<string, number>
): boolean {
  if (unitIndex <= 0) return true;
  const prevId = unitIds[unitIndex - 1];
  if (!prevId) return false;
  return isMissionUnlocked((unitStars[prevId] ?? 0) > 0);
}
