import {
  EventTouch,
  Graphics,
  Label,
  Node,
  Size,
  UITransform,
} from "cc";
import { PETS, type PetId } from "../../domain/progression/pets";
import { formatPetBond } from "../../domain/progression/pet-bond";
import { SHIP_SKINS, type ShipSkinId } from "../../domain/progression/ship-skins";
import { WEAPONS, weaponUpgradeCost, type WeaponId } from "../../domain/weapons/weapons";
import {
  attachStarfield,
  colorOf,
  makeCtaButton,
  makeLabel,
  makePanel,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";

type SizeLike = { width: number; height: number } | Size;

const WEAPON_ALLOY_PRICES: Record<WeaponId, number> = {
  pulse: 0,
  plasma: 80,
  flame: 120,
  frost: 160,
  thunder: 220,
};

const MAX_DEPLOYED_PETS = 2;
const MAX_WEAPON_LEVEL = 10;
const PANEL_W = 380;
const PANEL_H = 520;
const ROW_H = 44;

export type BaseSettings = {
  soundEnabled: boolean;
  ttsEnabled: boolean;
  reduceMotion: boolean;
};

export type BaseProgression = {
  weaponId: string;
  ownedWeapons: string[];
  weaponLevels: Record<string, number>;
  shipSkinId: string;
  ownedShipSkins: string[];
  petIds: string[];
  deployedPets: string[];
  petBond: Record<string, number>;
};

export type BaseModel = {
  child: { name: string; level: number; alloy: number; starCrystals: number };
  progression: BaseProgression;
  settings: BaseSettings;
  deployCapHint?: boolean;
  onBack: () => void;
  onEquipWeapon: (id: WeaponId) => void;
  onBuyWeapon: (id: WeaponId) => void;
  onUpgradeWeapon: (id: WeaponId) => void;
  onBuyPet: (id: PetId) => void;
  onTogglePetDeploy: (id: PetId) => void;
  onSelectShipSkin: (id: ShipSkinId) => void;
  onBuyShipSkin: (id: ShipSkinId) => void;
  onToggleSetting: (key: keyof BaseSettings) => void;
};

function makeChip(
  parent: Node,
  name: string,
  text: string,
  w: number,
  h: number,
  fill: Rgba,
  stroke: Rgba,
  onTap?: (event?: EventTouch) => void
): Node {
  assertPlayerSafeCopy(text);
  const chip = new Node(name);
  parent.addChild(chip);
  const g = chip.addComponent(Graphics);
  const radius = 10;
  g.fillColor = colorOf(fill);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.strokeColor = colorOf(stroke);
  g.lineWidth = 2;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.stroke();
  chip.addComponent(UITransform).setContentSize(w, h);

  const labelNode = new Node("Label");
  chip.addChild(labelNode);
  const lbl = labelNode.addComponent(Label);
  lbl.string = text;
  lbl.fontSize = UiTheme.font.chip;
  lbl.color = colorOf(UiTheme.colors.textPrimary);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 16, h - 8);

  if (onTap) {
    chip.on(Node.EventType.TOUCH_END, onTap);
  }
  return chip;
}

function makeSecondaryButton(
  parent: Node,
  name: string,
  label: string,
  w: number,
  h: number,
  onTap: (event?: EventTouch) => void
): Node {
  assertPlayerSafeCopy(label);
  const btn = new Node(name);
  parent.addChild(btn);
  const g = btn.addComponent(Graphics);
  const radius = 10;
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
  lbl.string = label;
  lbl.fontSize = UiTheme.font.chip;
  lbl.color = colorOf(UiTheme.colors.textPrimary);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 12, h - 8);

  btn.on(Node.EventType.TOUCH_END, onTap);
  return btn;
}

function makeStatusChip(parent: Node, name: string, text: string, w: number): Node {
  return makeChip(
    parent,
    name,
    text,
    w,
    32,
    UiTheme.colors.bgDeep,
    UiTheme.colors.accentInfo
  );
}

function makePanelTitle(parent: Node, text: string, y: number): void {
  const title = makeLabel(parent, "PanelTitle", {
    string: text,
    fontSize: UiTheme.font.cardTitle,
    width: PANEL_W - 32,
    height: 28,
  });
  title.horizontalAlign = Label.HorizontalAlign.LEFT;
  title.node.setPosition(-PANEL_W / 2 + 16, y, 0);
}

export class BaseScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: BaseModel): void {
    this.destroy();

    const screen = new Node("BaseScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const topBar = new Node("TopBar");
    screen.addChild(topBar);
    topBar.setPosition(0, this.height / 2 - 52, 0);

    const chips: Array<{ text: string; w: number }> = [
      { text: model.child.name, w: 120 },
      { text: `Lv.${model.child.level}`, w: 72 },
      { text: `合金 ${model.child.alloy}`, w: 100 },
      { text: `星晶 ${model.child.starCrystals}`, w: 100 },
    ];

    let chipX = -chips.reduce((sum, c) => sum + c.w, 0) / 2;
    for (const chip of chips) {
      const node = makeChip(
        topBar,
        chip.text,
        chip.text,
        chip.w,
        36,
        UiTheme.colors.bgDeep,
        UiTheme.colors.accentInfo
      );
      node.setPosition(chipX + chip.w / 2, 0, 0);
      chipX += chip.w + 12;
    }

    makeSecondaryButton(topBar, "BackBtn", "返回星图", 120, 36, () =>
      model.onBack()
    ).setPosition(this.width / 2 - 100, 0, 0);

    const columns = new Node("Columns");
    screen.addChild(columns);
    columns.setPosition(0, -24, 0);

    const colGap = 24;
    const totalW = PANEL_W * 3 + colGap * 2;
    const startX = -totalW / 2 + PANEL_W / 2;

    this.renderWeaponsPanel(
      columns,
      startX,
      model.progression,
      model.onEquipWeapon,
      model.onBuyWeapon,
      model.onUpgradeWeapon
    );
    this.renderPetsPanel(
      columns,
      startX + PANEL_W + colGap,
      model.progression,
      model.deployCapHint ?? false,
      model.onBuyPet,
      model.onTogglePetDeploy
    );
    this.renderSettingsPanel(
      columns,
      startX + (PANEL_W + colGap) * 2,
      model.progression,
      model.settings,
      model.onSelectShipSkin,
      model.onBuyShipSkin,
      model.onToggleSetting
    );
  }

  private renderWeaponsPanel(
    parent: Node,
    x: number,
    prog: BaseProgression,
    onEquip: (id: WeaponId) => void,
    onBuy: (id: WeaponId) => void,
    onUpgrade: (id: WeaponId) => void
  ): void {
    const panel = new Node("WeaponsPanel");
    parent.addChild(panel);
    panel.setPosition(x, 0, 0);
    makePanel(panel, "Bg", PANEL_W, PANEL_H);
    makePanelTitle(panel, "武器库", PANEL_H / 2 - 36);

    const weapons = Object.values(WEAPONS);
    const rowPitch = 72;
    let y = PANEL_H / 2 - 84;
    const leftX = -PANEL_W / 2 + 20;
    const actionX = PANEL_W / 2 - 56;

    weapons.forEach((w) => {
      const row = new Node(`Weapon_${w.id}`);
      panel.addChild(row);
      row.setPosition(0, y, 0);

      const owned = prog.ownedWeapons.includes(w.id);
      const equipped = prog.weaponId === w.id;
      const level = Math.max(1, prog.weaponLevels[w.id] ?? 1);

      const nameLbl = makeLabel(row, "Name", {
        string: `${w.name}  Lv.${level}`,
        fontSize: UiTheme.font.body,
        width: 210,
        height: 28,
      });
      nameLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      nameLbl.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
      nameLbl.node.setPosition(leftX, 12, 0);

      const tagLbl = makeLabel(row, "Tag", {
        string: w.label,
        fontSize: UiTheme.font.chip,
        color: UiTheme.colors.textSecondary,
        width: 80,
        height: 22,
      });
      tagLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      tagLbl.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
      tagLbl.node.setPosition(leftX, -14, 0);

      if (owned && level < MAX_WEAPON_LEVEL) {
        const cost = weaponUpgradeCost(level);
        makeSecondaryButton(row, "Upgrade", `升级 ${cost}`, 88, 28, () =>
          onUpgrade(w.id)
        ).setPosition(actionX - 92, 0, 0);
      } else if (owned && level >= MAX_WEAPON_LEVEL) {
        const maxLbl = makeLabel(row, "MaxLv", {
          string: "满级",
          fontSize: UiTheme.font.chip,
          color: UiTheme.colors.accentCta,
          width: 48,
          height: 22,
        });
        maxLbl.horizontalAlign = Label.HorizontalAlign.CENTER;
        maxLbl.node.setPosition(actionX - 92, 0, 0);
      }

      if (equipped) {
        makeStatusChip(row, "Equipped", "已装备", 72).setPosition(actionX, 0, 0);
      } else if (owned) {
        makeSecondaryButton(row, "Equip", "装备", 72, 28, () => onEquip(w.id)).setPosition(
          actionX,
          0,
          0
        );
      } else {
        const price = WEAPON_ALLOY_PRICES[w.id];
        makeSecondaryButton(row, "Buy", `合金 ${price}`, 88, 28, () => onBuy(w.id)).setPosition(
          actionX,
          0,
          0
        );
      }

      y -= rowPitch;
    });
  }

  private renderPetsPanel(
    parent: Node,
    x: number,
    prog: BaseProgression,
    deployCapHint: boolean,
    onBuy: (id: PetId) => void,
    onToggleDeploy: (id: PetId) => void
  ): void {
    const panel = new Node("PetsPanel");
    parent.addChild(panel);
    panel.setPosition(x, 0, 0);
    makePanel(panel, "Bg", PANEL_W, PANEL_H);
    makePanelTitle(panel, "宠物舱", PANEL_H / 2 - 36);

    const sub = makeLabel(panel, "SubTitle", {
      string: `出战最多 ${MAX_DEPLOYED_PETS} 只`,
      fontSize: UiTheme.font.chip,
      color: UiTheme.colors.textSecondary,
      width: PANEL_W - 32,
      height: 22,
    });
    sub.horizontalAlign = Label.HorizontalAlign.LEFT;
    sub.node.setPosition(-PANEL_W / 2 + 16, PANEL_H / 2 - 58, 0);

    if (deployCapHint) {
      const alert = makeLabel(panel, "DeployCapAlert", {
        string: "出战位已满，请先撤下一只",
        fontSize: UiTheme.font.chip,
        color: UiTheme.colors.accentCta,
        width: PANEL_W - 32,
        height: 22,
      });
      alert.horizontalAlign = Label.HorizontalAlign.LEFT;
      alert.node.setPosition(-PANEL_W / 2 + 16, PANEL_H / 2 - 80, 0);
    }

    const pets = Object.values(PETS);
    let y = PANEL_H / 2 - 96;

    pets.forEach((pet) => {
      const row = new Node(`Pet_${pet.id}`);
      panel.addChild(row);
      row.setPosition(0, y, 0);

      const owned = prog.petIds.includes(pet.id);
      const deployed = prog.deployedPets.includes(pet.id);
      const bond = prog.petBond[pet.id] ?? 1;

      const nameLbl = makeLabel(row, "Name", {
        string: pet.name,
        fontSize: UiTheme.font.body,
        width: 100,
        height: ROW_H,
      });
      nameLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      nameLbl.node.setPosition(-PANEL_W / 2 + 16, 8, 0);

      const descLbl = makeLabel(row, "Desc", {
        string: `${pet.describe(bond).split(" · ")[0]} · ${formatPetBond(bond)}`,
        fontSize: UiTheme.font.chip,
        color: UiTheme.colors.textSecondary,
        width: PANEL_W - 120,
        height: 22,
      });
      descLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      descLbl.node.setPosition(-PANEL_W / 2 + 16, -12, 0);

      const actionX = PANEL_W / 2 - 72;
      if (!owned) {
        makeSecondaryButton(
          row,
          "Buy",
          `星晶 ${pet.priceCrystal}`,
          88,
          32,
          () => onBuy(pet.id)
        ).setPosition(actionX + 8, 0, 0);
      } else {
        makeSecondaryButton(
          row,
          "Deploy",
          deployed ? "撤下" : "出战",
          72,
          32,
          () => onToggleDeploy(pet.id)
        ).setPosition(actionX, 0, 0);
      }

      y -= ROW_H + 16;
    });
  }

  private renderSettingsPanel(
    parent: Node,
    x: number,
    prog: BaseProgression,
    settings: BaseSettings,
    onSelectSkin: (id: ShipSkinId) => void,
    onBuySkin: (id: ShipSkinId) => void,
    onToggle: (key: keyof BaseSettings) => void
  ): void {
    const panel = new Node("SettingsPanel");
    parent.addChild(panel);
    panel.setPosition(x, 0, 0);
    makePanel(panel, "Bg", PANEL_W, PANEL_H);
    makePanelTitle(panel, "舰体与设置", PANEL_H / 2 - 36);

    const skinTitle = makeLabel(panel, "SkinTitle", {
      string: "飞船涂装",
      fontSize: UiTheme.font.chip,
      color: UiTheme.colors.textSecondary,
      width: PANEL_W - 32,
      height: 22,
    });
    skinTitle.horizontalAlign = Label.HorizontalAlign.LEFT;
    skinTitle.node.setPosition(-PANEL_W / 2 + 16, PANEL_H / 2 - 68, 0);

    let y = PANEL_H / 2 - 100;
    for (const skin of Object.values(SHIP_SKINS)) {
      const row = new Node(`Skin_${skin.id}`);
      panel.addChild(row);
      row.setPosition(0, y, 0);

      const owned = prog.ownedShipSkins.includes(skin.id);
      const selected = prog.shipSkinId === skin.id;

      const nameLbl = makeLabel(row, "Name", {
        string: skin.name,
        fontSize: UiTheme.font.body,
        width: 160,
        height: 28,
      });
      nameLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      nameLbl.node.setPosition(-PANEL_W / 2 + 16, 6, 0);

      const blurb = makeLabel(row, "Blurb", {
        string: skin.blurb,
        fontSize: UiTheme.font.chip,
        color: UiTheme.colors.textSecondary,
        width: 160,
        height: 20,
      });
      blurb.horizontalAlign = Label.HorizontalAlign.LEFT;
      blurb.node.setPosition(-PANEL_W / 2 + 16, -12, 0);

      const actionX = PANEL_W / 2 - 72;
      if (selected) {
        makeStatusChip(row, "Selected", "航行中", 72).setPosition(actionX, 0, 0);
      } else if (owned) {
        makeSecondaryButton(row, "Select", "换装", 72, 28, () =>
          onSelectSkin(skin.id)
        ).setPosition(actionX, 0, 0);
      } else {
        makeSecondaryButton(
          row,
          "BuySkin",
          `星晶 ${skin.priceCrystal}`,
          88,
          28,
          () => onBuySkin(skin.id)
        ).setPosition(actionX + 8, 0, 0);
      }

      y -= 52;
    }

    const toggles: Array<{ key: keyof BaseSettings; label: string; on: boolean }> = [
      { key: "soundEnabled", label: "音效", on: settings.soundEnabled },
      { key: "ttsEnabled", label: "朗读", on: settings.ttsEnabled },
      { key: "reduceMotion", label: "减少动效", on: settings.reduceMotion },
    ];

    y -= 8;
    toggles.forEach((t) => {
      const row = new Node(`Setting_${t.key}`);
      panel.addChild(row);
      row.setPosition(0, y, 0);

      const nameLbl = makeLabel(row, "Name", {
        string: t.label,
        fontSize: UiTheme.font.body,
        width: 120,
        height: ROW_H,
      });
      nameLbl.horizontalAlign = Label.HorizontalAlign.LEFT;
      nameLbl.node.setPosition(-PANEL_W / 2 + 16, 0, 0);

      const stateText = t.on ? "开" : "关";
      makeChip(
        row,
        "Toggle",
        stateText,
        56,
        36,
        t.on ? UiTheme.colors.accentInfo : UiTheme.colors.bgDeep,
        t.on ? UiTheme.colors.accentInfo : UiTheme.colors.strokePanel,
        () => onToggle(t.key)
      ).setPosition(PANEL_W / 2 - 52, 0, 0);

      y -= ROW_H + 8;
    });
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
