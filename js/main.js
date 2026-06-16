/**
 * 启动入口
 * - 初始化存档与 UI
 * - 后台轮询艾宾浩斯队列：到期即在基地界面提示「红色警报突袭」
 */

(function bootstrap() {
  Storage.load();

  document.addEventListener("DOMContentLoaded", () => {
    UI.init();

    // 隐形算法：后台每 5 秒检查复习队列，到期时若停留在主菜单则刷新提示
    let lastDue = 0;
    setInterval(() => {
      const due = ReviewQueue.getDue().length;
      // 仅当处于战斗外（无 finished=false 的进行中战斗）且数量变化时刷新菜单红点
      const inBattle = UI.battle && !UI.battle.finished;
      if (inBattle) return;
      if (due !== lastDue) {
        lastDue = due;
        const app = document.getElementById("app");
        // 仅在主菜单/星图等含 topBar 的非战斗界面时温和刷新
        if (app && app.querySelector(".screen") && document.querySelector(".battle-stage") === null) {
          const onMenu = !!app.querySelector(".ship-hero");
          if (onMenu) UI.showMenu();
        }
      }
    }, 5000);
  });

  // 首次交互时解锁音频上下文（移动端策略）
  const unlock = () => {
    Sound._ensure();
    if (Sound.ctx && Sound.ctx.state === "suspended") Sound.ctx.resume();
    window.removeEventListener("pointerdown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
})();
