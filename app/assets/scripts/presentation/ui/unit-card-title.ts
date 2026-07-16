/** Strip leading "Unit N" so card title does not repeat the unit badge. */
export function unitCardTitle(rawTitle: string, maxLen = 20): string {
  const stripped = String(rawTitle ?? "")
    .replace(/^Unit\s*\d+\s*/i, "")
    .trim();
  const title = stripped || String(rawTitle ?? "").trim() || "未命名单元";
  if (title.length <= maxLen) return title;
  return `${title.slice(0, maxLen - 1)}…`;
}
