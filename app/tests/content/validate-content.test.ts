import { describe, expect, it } from "vitest";
import { validateContentCatalog } from "../../assets/scripts/domain/content/validate-content";
import catalog from "../../assets/content/catalog.json";

describe("validateContentCatalog", () => {
  it("accepts the slice catalog", () => {
    expect(validateContentCatalog(catalog as never)).toEqual([]);
  });

  it("reports duplicate IDs, empty text and missing audio fallback", () => {
    const issues = validateContentCatalog({
      units: [
        {
          id: "3A-U1",
          title: "How do we feel?",
          items: [
            {
              contentId: "dup",
              kind: "vocab",
              en: "",
              zh: "",
              questionTypes: ["choice"]
            },
            {
              contentId: "dup",
              kind: "vocab",
              en: "x",
              zh: "y",
              questionTypes: ["choice"]
            }
          ]
        }
      ]
    });
    expect(issues.some((i) => i.code === "DUPLICATE_ID")).toBe(true);
    expect(issues.some((i) => i.code === "EMPTY_TEXT")).toBe(true);
    expect(issues.some((i) => i.code === "MISSING_AUDIO")).toBe(true);
  });
});
