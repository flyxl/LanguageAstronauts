// app/assets/scripts/presentation/ui/format-stars.ts
export function formatStars(n: number): string {
  const c = Math.max(0, Math.min(3, Math.floor(n)));
  return "★".repeat(c) + "☆".repeat(3 - c);
}
