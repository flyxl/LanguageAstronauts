# Web 孩子设置与拼写输入

> Status: Approved  
> Date: 2026-07-22  
> Scope: Web MVP only

## Goals

1. Per-child settings screen from main menu.
2. Toggle **enable spelling**; when off, campaign skips the spell Boss (listen → read → speak).
3. Spelling input mode: **tiles** (default) or **keyboard**.
4. Device-level **sound** toggle on the same settings page.

## Data

Per child:

```js
prefs: {
  enableSpelling: true,
  spellInputMode: "tiles", // "tiles" | "keyboard"
}
```

Root (device):

```js
settings: { sound: true }
```

Missing prefs on load → fill defaults.

## Behavior

- `enableSpelling === false`: filter out `skill === "spell"` from active monster forms; review `spell` style → `read`.
- `spellInputMode === "keyboard"`: text input + Enter/发射; still case-insensitive.
- Settings UI: spelling toggle, input mode (disabled when spelling off), sound toggle.
