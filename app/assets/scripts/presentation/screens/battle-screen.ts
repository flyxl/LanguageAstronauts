import {
  EventTouch,
  Graphics,
  Label,
  Node,
  Size,
  UITransform,
} from "cc";
import type { BattleHud, TacticalBoostOption } from "../../domain/battle/battle-session";
import type { BattleQuestion } from "../../domain/battle/question-builder";
import {
  attachStarfield,
  colorOf,
  makeChromeBar,
  makeCtaButton,
  makeFocusScrim,
  makeLabel,
  makePanel,
  makeSecondaryButton,
} from "../ui/ui-factory";
import { armorPhaseLabel } from "../ui/armor-phase-label";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";
import { contentRight, createContentRoot, measureScreen } from "../ui/layout";

type SizeLike = { width: number; height: number } | Size;

export type BattleModel = {
  hud: BattleHud;
  question: BattleQuestion | null;
  spellBuffer?: string;
  inputLocked?: boolean;
  boostOptions?: TacticalBoostOption[] | null;
  onQuit: () => void;
  onAnswer: (choice: string, opts?: { quality?: number; assisted?: boolean }) => void;
  onChooseBoost?: (id: "firepower" | "shield") => void;
  onSpellClear?: () => void;
  onSpellAppend?: (ch: string) => void;
  onSpellSubmit?: () => void;
  onReplayAudio?: () => void;
};

function makeBar(
  parent: Node,
  name: string,
  width: number,
  height: number,
  pct: number,
  fill: Rgba
): Node {
  const bar = new Node(name);
  parent.addChild(bar);
  const g = bar.addComponent(Graphics);
  const radius = 6;
  g.fillColor = colorOf(UiTheme.colors.bgDeep);
  g.roundRect(-width / 2, -height / 2, width, height, radius);
  g.fill();
  const fillW = Math.max(0, Math.min(width, width * pct));
  if (fillW > 0) {
    g.fillColor = colorOf(fill);
    g.roundRect(-width / 2, -height / 2, fillW, height, radius);
    g.fill();
  }
  bar.addComponent(UITransform).setContentSize(width, height);
  return bar;
}

function makeOptionButton(
  parent: Node,
  name: string,
  text: string,
  w: number,
  h: number,
  onTap: () => void
): Node {
  assertPlayerSafeCopy(text);
  const btn = new Node(name);
  parent.addChild(btn);
  const g = btn.addComponent(Graphics);
  const radius = 12;
  g.fillColor = colorOf(UiTheme.colors.bgPanel);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.strokeColor = colorOf(UiTheme.colors.strokePanel);
  g.lineWidth = 2;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.stroke();
  btn.addComponent(UITransform).setContentSize(w, h);

  const labelNode = new Node("Label");
  btn.addChild(labelNode);
  const lbl = labelNode.addComponent(Label);
  lbl.string = text;
  lbl.fontSize = UiTheme.font.body;
  lbl.color = colorOf(UiTheme.colors.textPrimary);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 16, h - 12);

  btn.on(Node.EventType.TOUCH_END, onTap);
  return btn;
}

function renderChoiceArea(
  parent: Node,
  q: BattleQuestion,
  onAnswer: BattleModel["onAnswer"],
  panelW: number,
  offsetY = -40
): void {
  const grid = new Node("OptionGrid");
  parent.addChild(grid);
  grid.setPosition(0, offsetY, 0);

  const optW = Math.min(300, Math.floor((panelW - 80) / 2));
  const optH = 60;
  const gapX = 20;
  const gapY = 14;
  const positions = [
    { x: -(optW + gapX) / 2, y: (optH + gapY) / 2 },
    { x: (optW + gapX) / 2, y: (optH + gapY) / 2 },
    { x: -(optW + gapX) / 2, y: -(optH + gapY) / 2 },
    { x: (optW + gapX) / 2, y: -(optH + gapY) / 2 },
  ];

  q.options.slice(0, 4).forEach((opt, i) => {
    const pos = positions[i]!;
    makeOptionButton(grid, `Opt_${i}`, opt, optW, optH, () => onAnswer(opt)).setPosition(
      pos.x,
      pos.y,
      0
    );
  });
}

function renderSpellingArea(parent: Node, model: BattleModel, panelW: number): void {
  const q = model.question;
  const buffer = model.spellBuffer ?? "";

  const spellOut = makeLabel(parent, "SpellOut", {
    string: buffer ? `已拼：${buffer}` : "已拼：…",
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    width: panelW - 80,
    height: 32,
  });
  spellOut.horizontalAlign = Label.HorizontalAlign.CENTER;
  spellOut.node.setPosition(0, 20, 0);

  const letters = new Node("Letters");
  parent.addChild(letters);
  letters.setPosition(0, -20, 0);

  const letterSize = 48;
  const gap = 8;
  const lettersList = q?.letters ?? [];
  const totalW = lettersList.length * letterSize + (lettersList.length - 1) * gap;
  let x = -totalW / 2 + letterSize / 2;

  lettersList.forEach((ch, i) => {
    makeOptionButton(letters, `Letter_${i}`, ch, letterSize, letterSize, () =>
      model.onSpellAppend?.(ch)
    ).setPosition(x, 0, 0);
    x += letterSize + gap;
  });

  const actions = new Node("SpellActions");
  parent.addChild(actions);
  actions.setPosition(0, -80, 0);

  makeSecondaryButton(actions, "SpellClear", "清空", 140, 52, () =>
    model.onSpellClear?.()
  ).setPosition(-90, 0, 0);

  makeCtaButton(actions, "SpellSubmit", "发射", 140, 52, () =>
    model.onSpellSubmit?.()
  ).setPosition(90, 0, 0);
}

function renderSpeakingArea(parent: Node, q: BattleQuestion, onAnswer: BattleModel["onAnswer"]): void {
  const readLbl = makeLabel(parent, "SpeakPrompt", {
    string: `朗读：${q.correct}`,
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    width: 560,
    height: 32,
  });
  readLbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  readLbl.node.setPosition(0, 20, 0);

  const actions = new Node("SpeakActions");
  parent.addChild(actions);
  actions.setPosition(0, -40, 0);

  makeCtaButton(actions, "SpeakOk", "我已朗读", 180, 64, () =>
    onAnswer(q.correct, { quality: 0.85 })
  ).setPosition(-110, 0, 0);

  makeSecondaryButton(actions, "SpeakSkip", "弱激光辅助", 180, 64, () =>
    onAnswer(q.correct, { assisted: true, quality: 0.55 })
  ).setPosition(110, 0, 0);
}

export class BattleScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: BattleModel): void {
    this.destroy();

    const screen = new Node("BattleScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const layout = measureScreen(this.width, this.height);
    const content = createContentRoot(screen, layout);
    const cw = layout.contentW;
    const ch = layout.contentH;
    const hud = model.hud;
    const q = model.question;
    const panelW = Math.min(cw - 64, 920);
    const panelH = 360;

    const topY = ch / 2 - 56;
    makeChromeBar(content, "TopChrome", cw, 112).setPosition(0, topY - 28, 0);

    const topBar = new Node("TopBar");
    content.addChild(topBar);
    topBar.setPosition(0, topY, 0);

    makeLabel(topBar, "BossLabel", {
      string: `${hud.bossName} · 形态 ${hud.formIndex + 1}/${hud.formTotal}`,
      fontSize: UiTheme.font.cardTitle,
      color: UiTheme.colors.accentInfo,
      width: 480,
      height: 32,
    }).node.setPosition(-cw / 2 + 24, 24, 0);

    makeSecondaryButton(topBar, "QuitBtn", "撤离", 96, 40, () => model.onQuit()).setPosition(
      contentRight(layout, 20),
      24,
      0
    );

    const barW = Math.min(cw - 120, 720);
    const bars = new Node("Bars");
    content.addChild(bars);
    bars.setPosition(0, topY - 8, 0);

    makeLabel(bars, "ShipLabel", {
      string: "飞船护盾",
      fontSize: UiTheme.font.chip,
      color: UiTheme.colors.textSecondary,
      width: 120,
      height: 22,
    }).node.setPosition(-barW / 2, 18, 0);

    makeBar(bars, "ShipBar", barW, 14, hud.shipHp / hud.shipMaxHp, UiTheme.colors.accentCta).setPosition(
      0,
      0,
      0
    );

    makeLabel(bars, "ArmorLabel", {
      string: `知识装甲 · ${armorPhaseLabel(hud.phase)}（${hud.nodesRemaining}/${hud.nodesTotal}）`,
      fontSize: UiTheme.font.chip,
      color: UiTheme.colors.textSecondary,
      width: barW,
      height: 22,
    }).node.setPosition(-barW / 2, -28, 0);

    makeBar(
      bars,
      "ArmorBar",
      barW,
      14,
      hud.nodesRemaining / hud.nodesTotal,
      UiTheme.colors.accentInfo
    ).setPosition(0, -44, 0);

    const stats = new Node("Stats");
    content.addChild(stats);
    stats.setPosition(0, topY - 56, 0);

    makeLabel(stats, "Combo", {
      string: `连击 ${hud.combo}`,
      fontSize: UiTheme.font.chip,
      width: 100,
      height: 24,
    }).node.setPosition(-160, 0, 0);

    makeLabel(stats, "Momentum", {
      string: `动量 ${hud.momentum}`,
      fontSize: UiTheme.font.chip,
      width: 100,
      height: 24,
    }).node.setPosition(0, 0, 0);

    makeLabel(stats, "Crystals", {
      string: `星晶仓 +${hud.crystals}`,
      fontSize: UiTheme.font.chip,
      width: 120,
      height: 24,
    }).node.setPosition(160, 0, 0);

    makeFocusScrim(content, layout);

    const panel = new Node("QuestionPanel");
    content.addChild(panel);
    panel.setPosition(0, -48, 0);
    makePanel(panel, "PanelBg", panelW, panelH);

    if (model.boostOptions && model.boostOptions.length >= 2) {
      makeLabel(panel, "BoostTitle", {
        string: "战术强化（二选一）",
        fontSize: UiTheme.font.screenTitle,
        width: panelW - 80,
        height: 40,
      }).node.setPosition(0, 90, 0);
      const hint = makeLabel(panel, "BoostHint", {
        string: "只影响本局战斗表现，不改题目对错",
        fontSize: UiTheme.font.body,
        color: UiTheme.colors.textSecondary,
        width: panelW - 80,
        height: 28,
      });
      hint.horizontalAlign = Label.HorizontalAlign.CENTER;
      hint.node.setPosition(0, 44, 0);
      const left = model.boostOptions[0]!;
      const right = model.boostOptions[1]!;
      makeCtaButton(panel, "BoostL", left.label, 220, 72, () =>
        model.onChooseBoost?.(left.id)
      ).setPosition(-140, -40, 0);
      makeCtaButton(panel, "BoostR", right.label, 220, 72, () =>
        model.onChooseBoost?.(right.id)
      ).setPosition(140, -40, 0);
      return;
    }

    if (!q) return;

    const locked = Boolean(model.inputLocked);
    const answer = (choice: string, opts?: { quality?: number; assisted?: boolean }) => {
      if (locked) return;
      model.onAnswer(choice, opts);
    };

    makeLabel(panel, "PromptLabel", {
      string: q.promptLabel,
      fontSize: UiTheme.font.chip,
      color: UiTheme.colors.accentInfo,
      width: panelW - 80,
      height: 24,
    }).node.setPosition(0, panelH / 2 - 56, 0);

    const promptLbl = makeLabel(panel, "Prompt", {
      string: q.prompt,
      fontSize: UiTheme.font.screenTitle,
      width: panelW - 80,
      height: 48,
    });
    promptLbl.horizontalAlign = Label.HorizontalAlign.CENTER;
    promptLbl.node.setPosition(0, panelH / 2 - 104, 0);

    const answerArea = new Node("AnswerArea");
    panel.addChild(answerArea);
    answerArea.setPosition(0, -24, 0);

    if (q.type === "listening" && model.onReplayAudio) {
      makeSecondaryButton(panel, "ReplayAudio", "再听一次", 160, 48, () => {
        if (!locked) model.onReplayAudio?.();
      }).setPosition(0, panelH / 2 - 148, 0);
      renderChoiceArea(answerArea, q, answer, panelW, -48);
    } else if (q.type === "spelling") {
      renderSpellingArea(answerArea, model, panelW);
    } else if (q.type === "speaking") {
      if (model.onReplayAudio) {
        makeSecondaryButton(panel, "ReplayAudio", "听示范", 160, 48, () => {
          if (!locked) model.onReplayAudio?.();
        }).setPosition(0, panelH / 2 - 148, 0);
      }
      renderSpeakingArea(answerArea, q, answer);
    } else {
      renderChoiceArea(answerArea, q, answer, panelW);
    }
  }

  destroy(): void {
    if (this.screenRoot) {
      this.screenRoot.destroy();
      this.screenRoot = null;
    }
  }

  getScreenRoot(): Node | null {
    return this.screenRoot;
  }
}
