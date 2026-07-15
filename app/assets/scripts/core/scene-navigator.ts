export type SceneId = "Boot" | "Profile" | "Base" | "StarMap" | "Battle" | "Report";

export interface SceneNavigator {
  go(sceneId: SceneId, params?: Record<string, string>): void;
  current(): SceneId;
}
