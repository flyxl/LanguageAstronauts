import { describe, expect, it } from "vitest";
import { MainPathNav } from "../../assets/scripts/presentation/main-path/main-path-nav";

describe("MainPathNav", () => {
  it("starts on profile when no child", () => {
    expect(new MainPathNav(false).screen).toBe("profile");
  });

  it("starts on starmap when child exists", () => {
    expect(new MainPathNav(true).screen).toBe("starmap");
  });

  it("profile → starmap after create", () => {
    const nav = new MainPathNav(false);
    nav.afterCreateChild();
    expect(nav.screen).toBe("starmap");
  });

  it("starmap → sortie only with selected unit", () => {
    const nav = new MainPathNav(true);
    expect(() => nav.goSortie()).toThrow();
    nav.selectUnit("3A-U1");
    nav.goSortie();
    expect(nav.screen).toBe("sortie");
    expect(nav.selectedUnitId).toBe("3A-U1");
    nav.backToStarMap();
    expect(nav.screen).toBe("starmap");
  });
});
