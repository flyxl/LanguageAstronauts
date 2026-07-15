export type MainPathScreen =
  | "profile"
  | "starmap"
  | "base"
  | "sortie"
  | "battle"
  | "settlement";

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

  goBase(): void {
    this.screen = "base";
  }

  goSortie(): void {
    if (!this.selectedUnitId) throw new Error("no unit selected");
    this.screen = "sortie";
  }

  goBattle(): void {
    this.screen = "battle";
  }

  goSettlement(): void {
    this.screen = "settlement";
  }

  backToStarMap(): void {
    this.screen = "starmap";
  }
}
