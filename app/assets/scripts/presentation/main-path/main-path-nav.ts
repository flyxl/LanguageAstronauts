export type MainPathScreen = "profile" | "starmap" | "sortie";

export class MainPathNav {
  screen: MainPathScreen;
  selectedUnitId: string | null = null;

  constructor(hasChild: boolean) {
    this.screen = hasChild ? "starmap" : "profile";
  }

  afterCreateChild(): void {
    this.screen = "starmap";
  }

  selectUnit(unitId: string): void {
    this.selectedUnitId = unitId;
  }

  goSortie(): void {
    if (!this.selectedUnitId) throw new Error("no unit selected");
    this.screen = "sortie";
  }

  backToStarMap(): void {
    this.screen = "starmap";
  }
}
