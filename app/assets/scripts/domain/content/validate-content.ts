import type { ContentCatalog, ValidationIssue } from "./content-types";

export function validateContentCatalog(input: ContentCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  input.units.forEach((unit, ui) => {
    if (!unit.id) issues.push({ path: `/units/${ui}/id`, code: "EMPTY_ID", message: "unit id required" });
    unit.items.forEach((item, ii) => {
      const base = `/units/${ui}/items/${ii}`;
      if (!item.contentId) {
        issues.push({ path: `${base}/contentId`, code: "EMPTY_ID", message: "contentId required" });
      } else if (seen.has(item.contentId)) {
        issues.push({ path: `${base}/contentId`, code: "DUPLICATE_ID", message: item.contentId });
      } else {
        seen.add(item.contentId);
      }
      if (!item.en?.trim()) issues.push({ path: `${base}/en`, code: "EMPTY_TEXT", message: "en must be non-empty" });
      if (!item.zh?.trim()) issues.push({ path: `${base}/zh`, code: "EMPTY_TEXT", message: "zh must be non-empty" });
      if (!item.audioRef && !item.ttsFallback) {
        issues.push({ path: `${base}/audioRef`, code: "MISSING_AUDIO", message: "audioRef or ttsFallback required" });
      }
      if (!item.questionTypes?.length) {
        issues.push({ path: `${base}/questionTypes`, code: "EMPTY_TYPES", message: "questionTypes required" });
      }
    });
  });
  return issues;
}
