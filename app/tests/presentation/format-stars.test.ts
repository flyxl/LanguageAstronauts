// app/tests/presentation/format-stars.test.ts
import { describe, expect, it } from "vitest";
import { formatStars } from "../../assets/scripts/presentation/ui/format-stars";

describe("formatStars", () => {
  it("renders zero through three filled stars", () => {
    expect(formatStars(0)).toBe("☆☆☆");
    expect(formatStars(1)).toBe("★☆☆");
    expect(formatStars(2)).toBe("★★☆");
    expect(formatStars(3)).toBe("★★★");
  });

  it("clamps out-of-range values", () => {
    expect(formatStars(-1)).toBe("☆☆☆");
    expect(formatStars(4)).toBe("★★★");
    expect(formatStars(99)).toBe("★★★");
  });

  it("floors fractional counts", () => {
    expect(formatStars(2.9)).toBe("★★☆");
  });
});
