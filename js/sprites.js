/**
 * SVG 美术素材库
 * 像素风 Q 版太空主题，全部内联 SVG（0 外部请求）
 */

const SPRITES = {
  // ======== 飞船皮肤 ========
  ships: {
    classic: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sh1" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#67e8f9"/><stop offset="1" stop-color="#0891b2"/></linearGradient></defs>
      <path d="M32 4 L44 28 L46 50 L40 56 L36 48 L28 48 L24 56 L18 50 L20 28 Z" fill="url(#sh1)" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="28" y="20" width="8" height="10" rx="3" fill="#0f172a" stroke="#67e8f9" stroke-width="1"/>
      <circle cx="32" cy="25" r="2" fill="#67e8f9"/>
      <path d="M24 56 L20 62 L18 50 Z" fill="#f97316" opacity="0.85"/>
      <path d="M40 56 L44 62 L46 50 Z" fill="#f97316" opacity="0.85"/>
      <path d="M30 48 L34 48 L33 60 L31 60 Z" fill="#fbbf24" opacity="0.9"/>
    </svg>`,
    star: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sh2" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#c4b5fd"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs>
      <path d="M32 2 L42 22 L50 44 L44 54 L38 46 L26 46 L20 54 L14 44 L22 22 Z" fill="url(#sh2)" stroke="#a78bfa" stroke-width="1.5"/>
      <polygon points="32,10 34,16 40,16 35,20 37,26 32,22 27,26 29,20 24,16 30,16" fill="#fbbf24"/>
      <rect x="28" y="26" width="8" height="8" rx="4" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1"/>
      <path d="M20 54 L16 62 L14 44 Z" fill="#e879f9" opacity="0.8"/>
      <path d="M44 54 L48 62 L50 44 Z" fill="#e879f9" opacity="0.8"/>
      <path d="M30 46 L34 46 L33 58 L31 58 Z" fill="#f0abfc" opacity="0.9"/>
    </svg>`,
    school: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sh3" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#86efac"/><stop offset="1" stop-color="#059669"/></linearGradient></defs>
      <ellipse cx="32" cy="30" rx="16" ry="24" fill="url(#sh3)" stroke="#34d399" stroke-width="1.5"/>
      <ellipse cx="32" cy="26" rx="8" ry="6" fill="#064e3b" stroke="#34d399" stroke-width="1"/>
      <circle cx="32" cy="26" r="2.5" fill="#4ade80"/>
      <rect x="16" y="38" width="4" height="14" rx="2" fill="#059669" transform="rotate(-15 18 44)"/>
      <rect x="44" y="38" width="4" height="14" rx="2" fill="#059669" transform="rotate(15 46 44)"/>
      <path d="M28 54 L36 54 L34 62 L30 62 Z" fill="#fbbf24" opacity="0.9"/>
      <path d="M22 52 L18 60 Z" stroke="#f97316" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      <path d="M42 52 L46 60 Z" stroke="#f97316" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
    dragon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sh4" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#fca5a5"/><stop offset="1" stop-color="#b91c1c"/></linearGradient></defs>
      <path d="M32 4 L46 24 L50 48 L44 56 L36 46 L28 46 L20 56 L14 48 L18 24 Z" fill="url(#sh4)" stroke="#ef4444" stroke-width="1.5"/>
      <path d="M18 24 L8 20 L14 30 Z" fill="#fca5a5" stroke="#ef4444" stroke-width="1"/>
      <path d="M46 24 L56 20 L50 30 Z" fill="#fca5a5" stroke="#ef4444" stroke-width="1"/>
      <ellipse cx="32" cy="24" rx="7" ry="5" fill="#450a0a" stroke="#f87171" stroke-width="1"/>
      <circle cx="29" cy="23" r="1.5" fill="#f87171"/><circle cx="35" cy="23" r="1.5" fill="#f87171"/>
      <path d="M20 56 L16 64 Z" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 56 L48 64 Z" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 46 L34 46 L33 60 L31 60 Z" fill="#fbbf24"/>
    </svg>`,
  },

  // ======== 怪兽三形态 ========
  monsters: {
    word: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="m1" x1="40" y1="8" x2="40" y2="72" gradientUnits="userSpaceOnUse"><stop stop-color="#c4b5fd"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
      <ellipse cx="40" cy="42" rx="24" ry="28" fill="url(#m1)" stroke="#a78bfa" stroke-width="2"/>
      <ellipse cx="32" cy="34" rx="6" ry="7" fill="#1e1b4b"/><ellipse cx="48" cy="34" rx="6" ry="7" fill="#1e1b4b"/>
      <circle cx="33" cy="33" r="2.5" fill="#f0abfc"/><circle cx="49" cy="33" r="2.5" fill="#f0abfc"/>
      <path d="M30 52 Q40 60 50 52" stroke="#1e1b4b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="34" y="52" width="4" height="6" rx="1" fill="#f0abfc" opacity="0.7"/>
      <rect x="42" y="52" width="4" height="6" rx="1" fill="#f0abfc" opacity="0.7"/>
      <ellipse cx="18" cy="32" rx="4" ry="8" fill="#a78bfa" opacity="0.6"/>
      <ellipse cx="62" cy="32" rx="4" ry="8" fill="#a78bfa" opacity="0.6"/>
      <text x="40" y="76" text-anchor="middle" font-size="8" fill="#c4b5fd" font-weight="bold">ABC</text>
    </svg>`,
    dialogue: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="m2" x1="40" y1="4" x2="40" y2="76" gradientUnits="userSpaceOnUse"><stop stop-color="#fda4af"/><stop offset="1" stop-color="#be123c"/></linearGradient></defs>
      <path d="M40 6 L56 18 L62 40 L56 62 L40 72 L24 62 L18 40 L24 18 Z" fill="url(#m2)" stroke="#f43f5e" stroke-width="2"/>
      <circle cx="32" cy="32" r="7" fill="#4c0519"/><circle cx="48" cy="32" r="7" fill="#4c0519"/>
      <circle cx="33" cy="31" r="3" fill="#fda4af"/><circle cx="49" cy="31" r="3" fill="#fda4af"/>
      <path d="M30 50 L34 46 L38 50 L42 46 L46 50 L50 46" stroke="#4c0519" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M16 22 L10 14 L8 24 Z" fill="#f43f5e"/><path d="M64 22 L70 14 L72 24 Z" fill="#f43f5e"/>
      <path d="M40 6 L40 0" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="0" r="3" fill="#fbbf24"/>
      <path d="M22 64 L18 72 M40 72 L40 78 M58 64 L62 72" stroke="#be123c" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    reading: `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m3" x1="48" y1="4" x2="48" y2="92" gradientUnits="userSpaceOnUse"><stop stop-color="#fecaca"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient>
        <filter id="glow3"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="48" cy="50" rx="30" ry="36" fill="url(#m3)" stroke="#f87171" stroke-width="2" filter="url(#glow3)"/>
      <path d="M20 28 L10 16 L18 30 Z" fill="#fbbf24"/><path d="M76 28 L86 16 L78 30 Z" fill="#fbbf24"/>
      <circle cx="38" cy="38" r="9" fill="#450a0a"/><circle cx="58" cy="38" r="9" fill="#450a0a"/>
      <circle cx="39" cy="36" r="4" fill="#fca5a5"/><circle cx="59" cy="36" r="4" fill="#fca5a5"/>
      <circle cx="40" cy="37" r="1.5" fill="#fff"/><circle cx="60" cy="37" r="1.5" fill="#fff"/>
      <path d="M34 60 Q48 74 62 60" stroke="#450a0a" stroke-width="3" fill="none"/>
      <path d="M38 62 L40 68 M44 64 L44 70 M50 64 L50 70 M56 62 L58 68" stroke="#fca5a5" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 50 Q8 48 12 40" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M78 50 Q88 48 84 40" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="48" y="90" text-anchor="middle" font-size="10" fill="#fbbf24" font-weight="900">BOSS</text>
    </svg>`,
  },

  // ======== NPC 角色 ========
  npcs: {
    Kitty: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
      <path d="M12 14 L16 6 L20 14 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
      <path d="M28 14 L32 6 L36 14 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
      <circle cx="19" cy="24" r="3" fill="#1e293b"/><circle cx="29" cy="24" r="3" fill="#1e293b"/>
      <circle cx="20" cy="23" r="1" fill="#fff"/><circle cx="30" cy="23" r="1" fill="#fff"/>
      <ellipse cx="24" cy="30" rx="2" ry="1.5" fill="#fb923c"/>
      <path d="M20 33 Q24 37 28 33" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M14 28 L6 27 M14 30 L6 31 M34 28 L42 27 M34 30 L42 31" stroke="#f59e0b" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
    Peter: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
      <path d="M12 18 Q16 6 24 10 Q32 6 36 18" fill="#92400e" stroke="#78350f" stroke-width="1"/>
      <circle cx="19" cy="26" r="2.5" fill="#1e293b"/><circle cx="29" cy="26" r="2.5" fill="#1e293b"/>
      <circle cx="20" cy="25" r="1" fill="#fff"/><circle cx="30" cy="25" r="1" fill="#fff"/>
      <path d="M21 33 Q24 36 27 33" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="15" cy="30" rx="3" ry="2" fill="#fca5a5" opacity="0.5"/>
      <ellipse cx="33" cy="30" rx="3" ry="2" fill="#fca5a5" opacity="0.5"/>
    </svg>`,
    Alice: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
      <path d="M10 22 Q12 10 24 12 Q36 10 38 22" fill="#fbbf24" stroke="#a16207" stroke-width="1"/>
      <path d="M10 22 L8 36 Q10 34 12 32" fill="#fbbf24"/><path d="M38 22 L40 36 Q38 34 36 32" fill="#fbbf24"/>
      <circle cx="19" cy="26" r="2.5" fill="#1e293b"/><circle cx="29" cy="26" r="2.5" fill="#1e293b"/>
      <circle cx="20" cy="25" r="1" fill="#fff"/><circle cx="30" cy="25" r="1" fill="#fff"/>
      <path d="M20 34 Q24 38 28 34" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M22 12 L26 8 L28 12" fill="#f43f5e"/>
    </svg>`,
    "Miss Fang": `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
      <path d="M10 20 Q14 8 24 10 Q34 8 38 20" fill="#1c1917" stroke="#44403c" stroke-width="1"/>
      <path d="M10 20 Q8 26 10 30" fill="#1c1917"/><path d="M38 20 Q40 26 38 30" fill="#1c1917"/>
      <rect x="14" y="22" width="20" height="8" rx="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1"/>
      <circle cx="19" cy="26" r="2" fill="#1e293b"/><circle cx="29" cy="26" r="2" fill="#1e293b"/>
      <path d="M21 35 Q24 38 27 35" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    Ben: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
      <rect x="12" y="12" width="24" height="10" rx="5" fill="#1e40af" stroke="#1d4ed8" stroke-width="1"/>
      <circle cx="19" cy="26" r="2.5" fill="#1e293b"/><circle cx="29" cy="26" r="2.5" fill="#1e293b"/>
      <circle cx="20" cy="25" r="1" fill="#fff"/><circle cx="30" cy="25" r="1" fill="#fff"/>
      <path d="M20 34 Q24 37 28 34" stroke="#92400e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="15" cy="30" rx="3" ry="2" fill="#fca5a5" opacity="0.4"/>
      <ellipse cx="33" cy="30" rx="3" ry="2" fill="#fca5a5" opacity="0.4"/>
    </svg>`,
    Joe: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
      <path d="M14 18 Q18 10 24 12 Q30 10 34 18" fill="#065f46" stroke="#047857" stroke-width="1"/>
      <circle cx="19" cy="26" r="2.5" fill="#1e293b"/><circle cx="29" cy="26" r="2.5" fill="#1e293b"/>
      <circle cx="20" cy="25" r="1" fill="#fff"/><circle cx="30" cy="25" r="1" fill="#fff"/>
      <path d="M22 34 L26 34" stroke="#065f46" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },

  // ======== 其他装饰 ========
  crystal: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,2 28,12 24,30 8,30 4,12" fill="#67e8f9" stroke="#0891b2" stroke-width="1.5"/>
    <polygon points="16,2 20,12 16,26 12,12" fill="#a5f3fc" opacity="0.6"/>
    <path d="M4 12 L28 12" stroke="#0891b2" stroke-width="1"/>
  </svg>`,

  shield: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4 L28 10 L28 20 Q28 28 16 30 Q4 28 4 20 L4 10 Z" fill="#34d399" stroke="#059669" stroke-width="1.5"/>
    <path d="M16 10 L20 16 L16 22 L12 16 Z" fill="#a7f3d0"/>
  </svg>`,
};

/**
 * 获取飞船 SVG
 * @param {string} suitId
 * @param {number} [size=64]
 */
function getShipSVG(suitId, size = 64) {
  const svg = SPRITES.ships[suitId] || SPRITES.ships.classic;
  return `<div style="width:${size}px;height:${size}px;display:inline-block">${svg}</div>`;
}

/**
 * 获取怪兽 SVG
 * @param {'word'|'dialogue'|'reading'} formId
 * @param {number} [size=80]
 */
function getMonsterSVG(formId, size = 80) {
  const svg = SPRITES.monsters[formId] || SPRITES.monsters.word;
  return `<div style="width:${size}px;height:${size}px;display:inline-block">${svg}</div>`;
}

/**
 * 获取 NPC 头像 SVG
 * @param {string} name
 * @param {number} [size=40]
 */
function getNpcSVG(name, size = 40) {
  const svg = SPRITES.npcs[name] || SPRITES.npcs.Peter;
  return `<div style="width:${size}px;height:${size}px;display:inline-block;border-radius:50%;overflow:hidden">${svg}</div>`;
}

if (typeof window !== "undefined") {
  window.SPRITES = SPRITES;
  window.getShipSVG = getShipSVG;
  window.getMonsterSVG = getMonsterSVG;
  window.getNpcSVG = getNpcSVG;
}
