/**
 * UI 控制器：负责所有界面渲染与交互
 * 屏幕：主菜单 / 关卡选择 / 战斗 / 结算 / 战功商店 / 星际花园
 */

// ======== 武器系统 ========
const WEAPONS = {
  pulse: {
    name: "脉冲光炮", price: 0,
    desc: "标准配备", ability: "",
    color: "#38bdf8", beam: "linear-gradient(to top, #fff, #38bdf8)",
    beamWidth: 8, critColor: "#67e8f9",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp1" x1="32" y1="0" x2="32" y2="64"><stop stop-color="#a5f3fc"/><stop offset="1" stop-color="#0e7490"/></linearGradient>
        <filter id="wg1"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="wc1" cx="50%" cy="50%"><stop stop-color="#fff"/><stop offset="1" stop-color="#38bdf8"/></radialGradient>
      </defs>
      <rect x="27" y="14" width="10" height="40" rx="5" fill="url(#wp1)" stroke="#22d3ee" stroke-width="1.5"/>
      <rect x="24" y="44" width="16" height="12" rx="4" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.2"/>
      <path d="M29 14 L29 8 Q32 4 35 8 L35 14" fill="#38bdf8" stroke="#67e8f9" stroke-width="1"/>
      <circle cx="32" cy="8" r="3" fill="url(#wc1)" filter="url(#wg1)">
        <animate attributeName="r" values="3;4;3" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="8" r="1.5" fill="#fff">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <rect x="23" y="26" width="18" height="3" rx="1.5" fill="#22d3ee" opacity="0.6"/>
      <rect x="25" y="32" width="14" height="2" rx="1" fill="#22d3ee" opacity="0.4"/>
      <circle cx="28" cy="50" r="1.5" fill="#38bdf8"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="36" cy="50" r="1.5" fill="#38bdf8"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/></circle>
    </svg>`,
  },
  plasma: {
    name: "等离子双管炮", price: 200,
    desc: "双束齐发，连击加成", ability: "连击伤害+25%",
    color: "#a78bfa", beam: "linear-gradient(to top, #fff, #a78bfa, #7c3aed)",
    beamWidth: 6, critColor: "#c4b5fd",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp2" x1="0" y1="32" x2="64" y2="32"><stop stop-color="#c4b5fd"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
        <filter id="wg2"><feGaussianBlur stdDeviation="2.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="wcore2"><stop stop-color="#ede9fe"/><stop offset="1" stop-color="#7c3aed"/></radialGradient>
      </defs>
      <rect x="14" y="16" width="8" height="34" rx="4" fill="url(#wp2)" stroke="#a78bfa" stroke-width="1.5"/>
      <rect x="42" y="16" width="8" height="34" rx="4" fill="url(#wp2)" stroke="#a78bfa" stroke-width="1.5"/>
      <path d="M22 34 Q32 28 42 34 Q32 40 22 34 Z" fill="#4c1d95" stroke="#a78bfa" stroke-width="1"/>
      <circle cx="32" cy="34" r="6" fill="url(#wcore2)" filter="url(#wg2)">
        <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="34" r="2.5" fill="#fff" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.7s" repeatCount="indefinite"/>
      </circle>
      <circle cx="18" cy="18" r="3.5" fill="#1e1b4b" stroke="#c4b5fd" stroke-width="1.5" filter="url(#wg2)"/>
      <circle cx="46" cy="18" r="3.5" fill="#1e1b4b" stroke="#c4b5fd" stroke-width="1.5" filter="url(#wg2)"/>
      <circle cx="18" cy="18" r="1.5" fill="#e9d5ff"><animate attributeName="r" values="1;2.5;1" dur="0.6s" repeatCount="indefinite"/></circle>
      <circle cx="46" cy="18" r="1.5" fill="#e9d5ff"><animate attributeName="r" values="1;2.5;1" dur="0.6s" repeatCount="indefinite" begin="0.3s"/></circle>
      <path d="M16 16 L16 10 Q18 6 20 10 L20 16" fill="#c4b5fd"/><path d="M44 16 L44 10 Q46 6 48 10 L48 16" fill="#c4b5fd"/>
      <line x1="18" y1="22" x2="18" y2="46" stroke="#c4b5fd" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.5"/>
      <line x1="46" y1="22" x2="46" y2="46" stroke="#c4b5fd" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.5"/>
    </svg>`,
  },
  flame: {
    name: "烈焰喷射器", price: 350,
    desc: "范围灼烧，恐惧效果", ability: "答对后额外灼烧 5 伤害",
    color: "#f97316", beam: "linear-gradient(to top, #fbbf24, #f97316, #ef4444)",
    beamWidth: 14, critColor: "#fbbf24",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp3" x1="32" y1="0" x2="32" y2="64"><stop stop-color="#fef3c7"/><stop offset=".3" stop-color="#fbbf24"/><stop offset=".7" stop-color="#f97316"/><stop offset="1" stop-color="#7c2d12"/></linearGradient>
        <filter id="wg3"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="wfire3"><stop stop-color="#fff"/><stop offset=".4" stop-color="#fde68a"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient>
      </defs>
      <path d="M32 2 Q42 12 40 22 Q46 16 46 28 Q48 38 42 44 L38 56 L26 56 L22 44 Q16 38 18 28 Q18 16 24 22 Q22 12 32 2 Z" fill="url(#wp3)" stroke="#dc2626" stroke-width="1.5" filter="url(#wg3)">
        <animate attributeName="d" values="M32 2 Q42 12 40 22 Q46 16 46 28 Q48 38 42 44 L38 56 L26 56 L22 44 Q16 38 18 28 Q18 16 24 22 Q22 12 32 2 Z;M32 4 Q40 14 38 24 Q44 18 44 30 Q46 38 40 44 L38 56 L26 56 L24 44 Q18 38 20 30 Q20 18 26 24 Q24 14 32 4 Z;M32 2 Q42 12 40 22 Q46 16 46 28 Q48 38 42 44 L38 56 L26 56 L22 44 Q16 38 18 28 Q18 16 24 22 Q22 12 32 2 Z" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <ellipse cx="32" cy="18" rx="6" ry="8" fill="url(#wfire3)" opacity="0.8">
        <animate attributeName="ry" values="8;6;8" dur="0.5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="32" cy="18" rx="3" ry="5" fill="#fff" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.3s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="26" cy="30" r="2" fill="#fde68a" opacity="0.5"><animate attributeName="cy" values="30;26;30" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="38" cy="32" r="1.5" fill="#fbbf24" opacity="0.4"><animate attributeName="cy" values="32;28;32" dur="0.8s" repeatCount="indefinite" begin="0.3s"/></circle>
      <rect x="27" y="52" width="10" height="8" rx="3" fill="#451a03" stroke="#f97316" stroke-width="1.2"/>
      <circle cx="32" cy="56" r="2" fill="#f97316"><animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/></circle>
    </svg>`,
  },
  frost: {
    name: "冰霜水晶炮", price: 500,
    desc: "冻结目标，水晶增幅", ability: "水晶获取+30%",
    color: "#67e8f9", beam: "linear-gradient(to top, #fff, #67e8f9, #06b6d4)",
    beamWidth: 10, critColor: "#a5f3fc",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp4" x1="32" y1="0" x2="32" y2="64"><stop stop-color="#ecfeff"/><stop offset="1" stop-color="#0e7490"/></linearGradient>
        <filter id="wg4"><feGaussianBlur stdDeviation="2.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="wice4"><stop stop-color="#fff"/><stop offset=".5" stop-color="#a5f3fc"/><stop offset="1" stop-color="#06b6d4" stop-opacity="0.3"/></radialGradient>
      </defs>
      <polygon points="32,2 38,16 54,18 44,30 46,46 32,40 18,46 20,30 10,18 26,16" fill="url(#wp4)" stroke="#22d3ee" stroke-width="1.5" filter="url(#wg4)">
        <animateTransform attributeName="transform" type="rotate" from="0 32 26" to="5 32 26" dur="3s" values="0 32 26;3 32 26;0 32 26;-3 32 26;0 32 26" repeatCount="indefinite"/>
      </polygon>
      <polygon points="32,10 35,18 43,20 38,26 39,34 32,30 25,34 26,26 21,20 29,18" fill="#cffafe" opacity="0.6"/>
      <circle cx="32" cy="24" r="8" fill="url(#wice4)" filter="url(#wg4)"/>
      <path d="M32 18 L32 30 M26 24 L38 24 M28 20 L36 28 M36 20 L28 28" stroke="#fff" stroke-width="1.5" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 32 24" to="360 32 24" dur="4s" repeatCount="indefinite"/>
      </path>
      <circle cx="32" cy="24" r="3" fill="#fff" opacity="0.8">
        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="14" r="1.5" fill="#a5f3fc" opacity="0.6"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="42" cy="16" r="1" fill="#67e8f9" opacity="0.5"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="1s"/></circle>
      <circle cx="20" cy="32" r="1.2" fill="#a5f3fc" opacity="0.4"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/></circle>
      <rect x="27" y="48" width="10" height="10" rx="4" fill="#164e63" stroke="#22d3ee" stroke-width="1"/>
      <circle cx="32" cy="53" r="2" fill="#67e8f9"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/></circle>
    </svg>`,
  },
  thunder: {
    name: "雷神电弧炮", price: 800,
    desc: "闪电毁灭，暴击之王", ability: "暴击率+15%，暴击伤害+50%",
    color: "#fbbf24", beam: "linear-gradient(to top, #fff, #fbbf24, #f59e0b)",
    beamWidth: 12, critColor: "#fde68a",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wp5" x1="32" y1="0" x2="32" y2="64"><stop stop-color="#fef9c3"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#92400e"/></linearGradient>
        <filter id="wg5"><feGaussianBlur stdDeviation="3.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="wg5b"><feGaussianBlur stdDeviation="1.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M38 2 L20 28 L30 28 L16 60 L50 22 L36 22 Z" fill="url(#wp5)" stroke="#d97706" stroke-width="2" filter="url(#wg5)">
        <animate attributeName="opacity" values="1;0.85;1" dur="0.15s" repeatCount="indefinite"/>
      </path>
      <path d="M36 8 L24 26 L30 26 L22 46" stroke="#fff" stroke-width="3" opacity="0.7" stroke-linecap="round" filter="url(#wg5b)">
        <animate attributeName="opacity" values="0.7;0.3;0.7;1;0.7" dur="0.2s" repeatCount="indefinite"/>
      </path>
      <circle cx="32" cy="30" r="16" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3 5" opacity="0.5" filter="url(#wg5b)">
        <animateTransform attributeName="transform" type="rotate" from="0 32 30" to="360 32 30" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="30" r="10" fill="none" stroke="#fde68a" stroke-width="1.5" stroke-dasharray="2 4" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="360 32 30" to="0 32 30" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="30" r="4" fill="#fef3c7" opacity="0.6" filter="url(#wg5b)">
        <animate attributeName="r" values="3;5;3" dur="0.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="14" r="1.5" fill="#fde68a"><animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite"/></circle>
      <circle cx="46" cy="20" r="1" fill="#fbbf24"><animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.2s"/></circle>
      <circle cx="18" cy="40" r="1.2" fill="#fde68a"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.5s"/></circle>
      <circle cx="48" cy="42" r="0.8" fill="#fbbf24"><animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin="0.3s"/></circle>
    </svg>`,
  },
};

// 宠物系统
const PETS = [
  { id: "star_fox", name: "星尘狐", emoji: "🦊", price: 80, ability: "答对护盾+3", maxLevel: 5, color: "#f97316",
    stages: ["🥚", "🦊", "🦊✨", "🔥🦊", "⭐🦊"],
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pf1" cx="50%" cy="35%"><stop stop-color="#fff7ed"/><stop offset=".6" stop-color="#fdba74"/><stop offset="1" stop-color="#ea580c"/></radialGradient>
        <filter id="pfg"><feGaussianBlur stdDeviation="1" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="32" cy="40" rx="20" ry="17" fill="url(#pf1)" stroke="#f97316" stroke-width="1"/>
      <path d="M14 28 L18 8 L24 26 Z" fill="#fdba74" stroke="#f97316" stroke-width="1.2"/>
      <path d="M40 26 L46 8 L50 28 Z" fill="#fdba74" stroke="#f97316" stroke-width="1.2"/>
      <path d="M16 14 L18 8 L20 14" fill="#fef3c7" opacity="0.8"/>
      <path d="M44 14 L46 8 L48 14" fill="#fef3c7" opacity="0.8"/>
      <ellipse cx="24" cy="38" rx="7" ry="7.5" fill="#1c1917"/>
      <ellipse cx="40" cy="38" rx="7" ry="7.5" fill="#1c1917"/>
      <circle cx="26" cy="36" r="3.5" fill="#fff"/>
      <circle cx="42" cy="36" r="3.5" fill="#fff"/>
      <circle cx="25" cy="35" r="1.5" fill="#1c1917"/>
      <circle cx="41" cy="35" r="1.5" fill="#1c1917"/>
      <path d="M22 36 L20 34 L22 35" fill="#fff" opacity="0.9"/>
      <path d="M38 36 L36 34 L38 35" fill="#fff" opacity="0.9"/>
      <ellipse cx="32" cy="46" rx="3.5" ry="2.5" fill="#1c1917"/>
      <path d="M28 48 Q32 53 36 48" stroke="#ea580c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="18" cy="42" rx="5" ry="3.5" fill="#fecaca" opacity="0.5"/>
      <ellipse cx="46" cy="42" rx="5" ry="3.5" fill="#fecaca" opacity="0.5"/>
      <path d="M10 48 Q4 54 8 60 Q10 58 12 60" stroke="#f97316" stroke-width="3" fill="#fdba74" stroke-linecap="round"/>
      <circle cx="6" cy="54" r="1" fill="#fde68a" opacity="0.8"><animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="50" cy="16" r="1.2" fill="#fbbf24"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/></circle>
      <circle cx="14" cy="12" r="1" fill="#fbbf24"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.7s"/></circle>
    </svg>` },
  { id: "nebula_cat", name: "星云猫", emoji: "🐱", price: 120, ability: "连击门槛-1（2连开始算暴击）", maxLevel: 5, color: "#a78bfa",
    stages: ["🥚", "🐱", "🐱✨", "💜🐱", "👑🐱"],
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pc1" cx="50%" cy="35%"><stop stop-color="#f5f3ff"/><stop offset=".5" stop-color="#c4b5fd"/><stop offset="1" stop-color="#6d28d9"/></radialGradient>
        <filter id="pcg"><feGaussianBlur stdDeviation="1.2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="pce"><stop stop-color="#e9d5ff"/><stop offset="1" stop-color="#7c3aed"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="40" rx="20" ry="17" fill="url(#pc1)" stroke="#7c3aed" stroke-width="1"/>
      <path d="M12 28 L16 6 L24 26 Z" fill="#ddd6fe" stroke="#8b5cf6" stroke-width="1.2"/>
      <path d="M40 26 L48 6 L52 28 Z" fill="#ddd6fe" stroke="#8b5cf6" stroke-width="1.2"/>
      <path d="M14 12 L16 6 L18 12" fill="#fde68a" opacity="0.7"/>
      <path d="M46 12 L48 6 L50 12" fill="#fde68a" opacity="0.7"/>
      <ellipse cx="23" cy="38" rx="8" ry="8.5" fill="#1e1b4b"/>
      <ellipse cx="41" cy="38" rx="8" ry="8.5" fill="#1e1b4b"/>
      <ellipse cx="23" cy="38" rx="6" ry="6.5" fill="url(#pce)" filter="url(#pcg)">
        <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="41" cy="38" rx="6" ry="6.5" fill="url(#pce)" filter="url(#pcg)">
        <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" begin="1.2s"/>
      </ellipse>
      <circle cx="26" cy="36" r="2.5" fill="#fff"/>
      <circle cx="44" cy="36" r="2.5" fill="#fff"/>
      <circle cx="25" cy="35" r="1" fill="#1e1b4b"/>
      <circle cx="43" cy="35" r="1" fill="#1e1b4b"/>
      <path d="M20 36 L18 34" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      <path d="M38 36 L36 34" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      <path d="M29 49 Q32 53 35 49" stroke="#7c3aed" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="16" cy="42" rx="4.5" ry="3" fill="#fecdd3" opacity="0.5"/>
      <ellipse cx="48" cy="42" rx="4.5" ry="3" fill="#fecdd3" opacity="0.5"/>
      <path d="M10 36 L2 34 M10 38 L2 38 M10 40 L2 42" stroke="#ddd6fe" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M54 36 L62 34 M54 38 L62 38 M54 40 L62 42" stroke="#ddd6fe" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M32 56 Q28 62 32 64 Q36 62 32 56 Z" fill="#c4b5fd" stroke="#7c3aed" stroke-width="1"/>
      <circle cx="12" cy="10" r="1.5" fill="#e9d5ff"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="52" cy="12" r="1" fill="#c4b5fd"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.5s"/></circle>
      <circle cx="32" cy="4" r="1.2" fill="#a78bfa"><animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="1s"/></circle>
    </svg>` },
  { id: "crystal_dragon", name: "水晶龙", emoji: "🐉", price: 150, ability: "每3回合自动恢复15护盾", maxLevel: 5, color: "#67e8f9",
    stages: ["🥚", "🐉", "🐉✨", "💎🐉", "🌟🐉"],
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pd1" cx="50%" cy="30%"><stop stop-color="#ecfeff"/><stop offset=".5" stop-color="#a5f3fc"/><stop offset="1" stop-color="#0e7490"/></radialGradient>
        <filter id="pdg"><feGaussianBlur stdDeviation="1.5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="pdj"><stop stop-color="#fff"/><stop offset="1" stop-color="#22d3ee"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="38" rx="18" ry="19" fill="url(#pd1)" stroke="#0891b2" stroke-width="1"/>
      <path d="M16 22 L10 4 L22 20 Z" fill="#67e8f9" stroke="#0891b2" stroke-width="1.2"/>
      <path d="M42 20 L54 4 L48 22 Z" fill="#67e8f9" stroke="#0891b2" stroke-width="1.2"/>
      <path d="M26 18 L32 8 L38 18 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1"/>
      <path d="M30 14 L32 8 L34 14" fill="#fff" opacity="0.6"/>
      <ellipse cx="24" cy="34" rx="7.5" ry="8" fill="#083344"/>
      <ellipse cx="40" cy="34" rx="7.5" ry="8" fill="#083344"/>
      <circle cx="26" cy="32" r="4" fill="url(#pdj)" filter="url(#pdg)">
        <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="42" cy="32" r="4" fill="url(#pdj)" filter="url(#pdg)">
        <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" begin="1s"/>
      </circle>
      <circle cx="25" cy="31" r="1.5" fill="#fff"/>
      <circle cx="41" cy="31" r="1.5" fill="#fff"/>
      <path d="M22 32 L20 30" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
      <path d="M38 32 L36 30" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
      <path d="M28 48 Q32 53 36 48" stroke="#0891b2" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="18" cy="40" rx="4" ry="2.5" fill="#fecdd3" opacity="0.4"/>
      <ellipse cx="46" cy="40" rx="4" ry="2.5" fill="#fecdd3" opacity="0.4"/>
      <path d="M12 46 Q6 52 9 58 Q11 56 13 58" stroke="#0891b2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M52 46 Q58 52 55 58 Q53 56 51 58" stroke="#0891b2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <polygon points="9,58 5,56 7,60" fill="#67e8f9"/>
      <polygon points="55,58 59,56 57,60" fill="#67e8f9"/>
      <ellipse cx="32" cy="38" rx="5" ry="3.5" fill="#a5f3fc" opacity="0.25"/>
      <circle cx="10" cy="8" r="1.5" fill="#67e8f9"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="56" cy="10" r="1" fill="#a5f3fc"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.8s"/></circle>
      <circle cx="32" cy="2" r="1.2" fill="#22d3ee"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="1.5s"/></circle>
    </svg>` },
];

// 向后兼容旧存档（suit字段 → weapon字段）
const SUITS = Object.fromEntries(Object.entries(WEAPONS).map(([k,v])=>[k, {...v, emoji: "🔫"}]));

// 段位/军衔系统（累计战功自动晋升）
const RANKS = [
  { name: "见习语航员", icon: "🌑", min: 0, color: "#94a3b8" },
  { name: "三等兵", icon: "🌘", min: 50, color: "#67e8f9" },
  { name: "二等兵", icon: "🌗", min: 150, color: "#38bdf8" },
  { name: "一等兵", icon: "🌖", min: 300, color: "#818cf8" },
  { name: "上等兵", icon: "🌕", min: 600, color: "#a78bfa" },
  { name: "下士", icon: "⭐", min: 1000, color: "#fbbf24" },
  { name: "中士", icon: "⭐⭐", min: 1800, color: "#f59e0b" },
  { name: "上士", icon: "⭐⭐⭐", min: 3000, color: "#f97316" },
  { name: "准尉", icon: "🎖️", min: 5000, color: "#ef4444" },
  { name: "少尉", icon: "🏅", min: 8000, color: "#e879f9" },
  { name: "语航王牌", icon: "👑", min: 15000, color: "#fbbf24" },
];

function getPlayerRank(score) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.min) rank = r;
  }
  return rank;
}

function getPetStageEmoji(def, level) {
  if (!def?.stages?.length) return def?.emoji || "🐾";
  return def.stages[Math.min(Math.max(1, level) - 1, def.stages.length - 1)];
}

function getPetVisualScale(level) {
  return 0.82 + Math.min(5, level || 1) * 0.06;
}

// 成就徽章系统
const ACHIEVEMENTS = [
  { id: "first_win", name: "初次解放", desc: "首次通关一个星域", icon: "🎯", check: (s) => Object.values(s.progress).some((p) => p.completed) },
  { id: "combo5", name: "连击达人", desc: "单场达成 5 连击", icon: "🔥", check: (s) => Object.values(s.progress).some((p) => p.bestCombo >= 5) },
  { id: "combo10", name: "连击大师", desc: "单场达成 10 连击", icon: "💥", check: (s) => Object.values(s.progress).some((p) => p.bestCombo >= 10) },
  { id: "perfect1", name: "完美主义", desc: "达成首个完美通关", icon: "⭐", check: (s) => Object.values(s.progress).some((p) => p.perfectClear) },
  { id: "vocab50", name: "词汇猎手", desc: "接触 50 个语言点", icon: "📚", check: (s) => Object.keys(s.mastery).length >= 50 },
  { id: "vocab100", name: "词汇大师", desc: "接触 100 个语言点", icon: "🏆", check: (s) => Object.keys(s.mastery).length >= 100 },
  { id: "units5", name: "星域探索家", desc: "通关 5 个星域", icon: "🌌", check: (s) => Object.values(s.progress).filter((p) => p.completed).length >= 5 },
  { id: "garden3", name: "园艺达人", desc: "培育 3 棵植物至满级", icon: "🌸", check: (s) => s.garden.filter((p) => p.growth >= 3).length >= 3 },
  { id: "rank_star", name: "闪耀星辰", desc: "晋升至一等兵", icon: "🌖", check: (s) => s.player.score >= 300 },
  { id: "score5k", name: "战功赫赫", desc: "累计战功突破 5000", icon: "🎖️", check: (s) => s.player.score >= 5000 },
];

// 保留旧数据结构兼容
const PLANT_SEEDS = {
  glowflower: { name: "辉光花", stages: ["🌱", "🌿", "🌷", "🌸"], price: 80 },
  startree: { name: "星辰树", stages: ["🌱", "🌿", "🪴", "🌳"], price: 120 },
  mooncactus: { name: "月影仙人掌", stages: ["🌱", "🌿", "🌵", "🎋"], price: 150 },
};

const UI = {
  el: null,

  init() {
    this.el = document.getElementById("app");
    this._buildStarfield();
    Storage.load();
    const children = Storage.listChildren();
    if (children.length === 0) {
      this.showCreateChild();
    } else if (children.length > 1) {
      this.showChildPicker();
    } else {
      if (!Storage.getActiveChild()) Storage.switchChild(children[0].id);
      this.showMenu();
    }
  },

  _buildStarfield() {
    const sf = document.getElementById("starfield");
    let html = '<div class="nebula a"></div><div class="nebula b"></div>';
    for (let i = 0; i < 90; i++) {
      const size = Math.random() * 2.5 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const dur = Math.random() * 3 + 2;
      html += `<span class="star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;--dur:${dur}s"></span>`;
    }
    sf.innerHTML = html;
  },

  _render(html) {
    this.el.innerHTML = html;
  },

  // ============ 孩子账号 ============
  showChildPicker() {
    const children = Storage.listChildren();
    const cards = children.map((c) => {
      const tb = Catalog.getTextbook(c.textbookId);
      const grade = Catalog.gradeLabel(c.grade || c.player?.grade || "");
      return `
        <button class="panel p-4 text-left w-full" style="cursor:pointer" onclick="UI.pickChild('${c.id}')">
          <div class="font-bold text-lg">${this._esc(c.name)}</div>
          <div class="text-xs opacity-60 mt-1">${tb.shortName} · ${grade || "未设置年级"}</div>
          <div class="text-xs opacity-40 mt-1">🏅 ${c.player?.score || 0} · 💎 ${c.player?.crystals || 0}</div>
        </button>`;
    }).join("");
    this._render(`
      <div class="screen">
        <div class="text-center mt-8 mb-6">
          <h1 class="text-2xl font-black title-glow">👨‍👩‍👧‍👦 选择小航员</h1>
          <p class="text-sm opacity-70 mt-2">这台设备上有 ${children.length} 位孩子</p>
        </div>
        <div class="grid gap-3">${cards}</div>
        <button class="btn secondary mt-4 w-full" onclick="UI.showCreateChild()">➕ 添加新孩子</button>
      </div>`);
  },

  pickChild(childId) {
    Storage.switchChild(childId);
    this.showMenu();
  },

  showCreateChild() {
    this._createDraft = { name: "", textbookId: "hujiao-oxford-2024", grade: null };
    this._renderCreateChild();
  },

  _renderCreateChild() {
    const d = this._createDraft;
    const tbBtns = Catalog.listTextbooks().map((t) =>
      `<button class="panel p-3 text-left ${d.textbookId === t.id ? "ring-2 ring-sky-400" : ""}" style="cursor:pointer" onclick="UI._setCreateTextbook('${t.id}')">
        <div class="font-bold text-sm">${t.name}</div>
        <div class="text-xs opacity-50 mt-1">${t.subtitle}</div>
      </button>`
    ).join("");
    const grades = Catalog.gradesFor(d.textbookId);
    const gradeBtns = grades.map((g) =>
      `<button class="panel p-2 text-center ${d.grade === g ? "ring-2 ring-sky-400" : ""}" style="cursor:pointer" onclick="UI._setCreateGrade('${g}')">
        <div class="font-bold text-sm">${Catalog.gradeLabel(g)}</div>
        <div class="text-xs opacity-50">${g}</div>
      </button>`
    ).join("");
    const canSubmit = d.name.trim() && d.textbookId && d.grade;
    this._render(`
      <div class="screen">
        <div class="text-center mt-6 mb-4">
          <h1 class="text-2xl font-black title-glow">🚀 创建小航员</h1>
          <p class="text-sm opacity-70 mt-2">取个名字，选择教材和年级</p>
        </div>
        <div class="panel p-4 mb-3">
          <label class="text-xs opacity-60">我的名字</label>
          <input id="child-name-input" class="w-full mt-1 p-3 rounded-lg bg-black/30 border border-white/10 text-lg" placeholder="例如：小明" maxlength="12"
            value="${this._esc(d.name)}" oninput="UI._setCreateName(this.value)" />
        </div>
        <p class="text-xs opacity-60 mb-2">选择教材</p>
        <div class="grid gap-2 mb-4">${tbBtns}</div>
        <p class="text-xs opacity-60 mb-2">选择年级 / 学期</p>
        <div class="grid grid-cols-2 gap-2 mb-4">${gradeBtns}</div>
        <button class="btn w-full ${canSubmit ? "" : "opacity-40"}" ${canSubmit ? "" : "disabled"} onclick="UI.submitCreateChild()">开始探险 ✨</button>
        ${Storage.listChildren().length ? `<button class="btn secondary mt-3 w-full" onclick="UI.showChildPicker()">返回选择</button>` : ""}
      </div>`);
    setTimeout(() => {
      const inp = document.getElementById("child-name-input");
      if (inp) inp.focus();
    }, 50);
  },

  _setCreateName(v) { this._createDraft.name = v; },
  _setCreateTextbook(id) {
    this._createDraft.textbookId = id;
    this._createDraft.grade = null;
    this._renderCreateChild();
  },
  _setCreateGrade(g) {
    this._createDraft.grade = g;
    this._renderCreateChild();
  },

  submitCreateChild() {
    const d = this._createDraft;
    if (!d.name.trim() || !d.textbookId || !d.grade) return;
    Storage.createChild({ name: d.name.trim(), textbookId: d.textbookId, grade: d.grade });
    this.showMenu();
  },

  _esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },

  // ============ 切换年级（当前孩子） ============
  showChangeGrade() {
    const ctx = Storage.getContext();
    const grades = Catalog.gradesFor(ctx.textbookId);
    const btns = grades.map((g) =>
      `<button class="panel p-3 text-center" style="cursor:pointer" onclick="UI.selectGrade('${g}')">
        <div class="font-bold">${Catalog.gradeLabel(g)}</div>
        <div class="text-xs opacity-60">${g}</div>
      </button>`
    ).join("");
    this._render(`
      <div class="screen">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-black title-glow">📍 切换年级</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-50 mb-3">${Catalog.getTextbook(ctx.textbookId).name}</p>
        <div class="grid grid-cols-2 gap-3">${btns}</div>
      </div>`);
  },

  selectGrade(gradeId) {
    const ctx = Storage.getContext();
    Storage.updateChild(ctx.childId, { grade: gradeId });
    this.showMenu();
  },

  // 兼容旧入口
  showOnboarding() {
    this.showChangeGrade();
  },

  // ============ 顶部资源条 ============
  _topBar() {
    const save = Storage.get();
    if (!save) return "";
    const p = save.player;
    const due = ReviewQueue.dueCount();
    const rank = getPlayerRank(p.score);
    return `
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex gap-2 flex-wrap">
          <span class="chip"><span style="display:inline-block;width:18px;height:18px;vertical-align:middle">${(WEAPONS[p.suit]||WEAPONS.pulse).svg}</span> <span style="color:${rank.color}">${rank.icon} ${rank.name}</span></span>
          <span class="chip" style="color:var(--gold)">🏅 ${p.score}</span>
          <span class="chip" style="color:var(--crystal)">💎 ${p.crystals}</span>
        </div>
        ${due > 0 ? `<span class="chip" style="color:var(--danger)"><span class="review-dot"></span> 警报 ${due}</span>` : ""}
      </div>`;
  },

  // ============ 主菜单 ============
  showMenu() {
    Sound._ensure();
    const save = Storage.get();
    if (!save) { this.showCreateChild(); return; }
    const due = ReviewQueue.dueCount();
    const p = save.player;
    const ctx = Storage.getContext();
    const tb = Catalog.getTextbook(ctx.textbookId);
    const gradeLabel = Catalog.gradeLabel(ctx.grade || p.grade || "");
    const childCount = Storage.listChildren().length;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="panel text-center p-6 mt-6">
          <div class="ship-hero" style="position:relative">${getShipSVG("classic", 100)}<div style="position:absolute;bottom:0;right:-10px;width:36px;height:36px">${(WEAPONS[p.suit]||WEAPONS.pulse).svg}</div></div>
          <h1 class="text-3xl font-black title-glow mt-2">${this._esc(ctx.name || p.name)}</h1>
          <p class="text-sm opacity-70 mt-1">时空语航员 · ${tb.shortName}</p>
          ${gradeLabel ? `<p class="text-xs mt-2"><span class="chip" style="cursor:pointer" onclick="UI.showChangeGrade()">📍 ${gradeLabel} <span class="opacity-60">切换</span></span></p>` : ""}
          <div class="grid gap-3 mt-5">
            <button class="btn" onclick="UI.showLevelSelect()">🌌 星图远征</button>
            ${due > 0 ? `<button class="btn gold animate__animated animate__pulse animate__infinite" onclick="UI.startReview()">🚨 红色警报突袭 (${due})</button>` : ""}
            <div class="grid grid-cols-2 gap-3">
              <button class="btn secondary" onclick="UI.showStore()">⚔️ 武器库</button>
              <button class="btn secondary" onclick="UI.showPets()">🐾 宠物舱</button>
            </div>
            <button class="btn secondary" onclick="UI.showStats()">📊 学情数据</button>
            ${childCount > 1 ? `<button class="btn secondary" onclick="UI.showChildPicker()">👨‍👩‍👧‍👦 切换孩子</button>` : ""}
            <button class="btn secondary" onclick="UI.showCreateChild()">➕ 添加孩子</button>
          </div>
        </div>
        <p class="text-center text-xs opacity-30 mt-4">0 广告 · 0 内购 · 体力靠学习获取</p>
      </div>`);
  },

  // ============ 关卡选择（星图） ============
  showLevelSelect(showAllGrades) {
    if (showAllGrades === undefined) this._showAllGrades = false;
    else this._showAllGrades = !!showAllGrades;
    const ctx = Storage.getContext();
    const course = Catalog.getActiveCourseData();
    const currentGrade = ctx.grade || Storage.get().player.grade || "3A";
    let body = "";
    course.forEach((grade) => {
      const isCurrentGrade = grade.id === currentGrade;
      if (!this._showAllGrades && !isCurrentGrade) return;
      const expanded = isCurrentGrade || this._showAllGrades;
      body += `
        <div class="mt-3">
          <div class="panel p-2 flex items-center justify-between" style="cursor:pointer;${isCurrentGrade ? 'border-color:var(--accent)' : ''}" onclick="UI._toggleGrade('${grade.id}')">
            <h2 class="font-bold ${isCurrentGrade ? '' : 'opacity-70'}">${isCurrentGrade ? '📍 ' : ''}${grade.name}</h2>
            <span class="text-xs opacity-60" id="grade-arrow-${grade.id}">${expanded ? '▼' : '▶'}</span>
          </div>
          <div class="grid gap-2 mt-2" id="grade-body-${grade.id}" style="${expanded ? '' : 'display:none'}">`;
      grade.units.forEach((unit) => {
        const prog = Storage.getUnitProgress(unit.id);
        const pct = Math.round((prog.crystals / CRYSTAL_GOAL) * 100);
        body += `
            <div class="panel unit-card" onclick="UI.startCampaign('${unit.id}')" style="cursor:pointer">
              ${prog.perfectClear ? '<span class="badge-done">⭐ 完美通关</span>' : prog.completed ? '<span class="badge-done" style="background:#38bdf8;color:#0c1a33">已解放 ✓</span>' : ""}
              <div class="flex items-center gap-3">
                <div class="text-2xl">🪐</div>
                <div class="flex-1">
                  <div class="font-bold text-sm">${unit.name}</div>
                  <div class="text-xs opacity-60">${unit.theme} · 词汇 ${unit.vocab.length} · 会话 ${unit.dialogue.length}</div>
                  <div class="crystal-bar"><i style="width:${pct}%"></i></div>
                </div>
                <div class="text-xs opacity-70" style="color:var(--crystal)">💎${prog.crystals}/${CRYSTAL_GOAL}</div>
              </div>
            </div>`;
      });
      body += `</div></div>`;
    });
    const moreBtn = this._showAllGrades
      ? `<button class="btn secondary w-full mt-3" onclick="UI.showLevelSelect(false)">📍 只看当前学期 (${Catalog.gradeLabel(currentGrade)})</button>`
      : `<button class="btn secondary w-full mt-3" onclick="UI.showLevelSelect(true)">📚 更多学期</button>`;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">🌌 星图远征</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-50 mt-1">${Catalog.getTextbook(ctx.textbookId).name}</p>
        <div class="scrollable">${body}${moreBtn}</div>
        <div class="h-6"></div>
      </div>`);
  },

  _toggleGrade(gradeId) {
    const body = document.getElementById("grade-body-" + gradeId);
    const arrow = document.getElementById("grade-arrow-" + gradeId);
    if (!body) return;
    const visible = body.style.display !== "none";
    body.style.display = visible ? "none" : "";
    if (arrow) arrow.textContent = visible ? "▶" : "▼";
  },

  // ============ 启动战斗 ============
  startCampaign(unitId) {
    const unit = this._findUnit(unitId);
    if (!unit) return;
    Combat.ensureDeployedPets();
    this.battle = new Battle(unit, "campaign");
    this._announceBattleReady();
    this._renderBattle();
  },

  startReview() {
    ReviewQueue.consolidate();
    const due = ReviewQueue.getDueSession();
    if (!due.length) {
      this.showMenu();
      return;
    }
    Combat.ensureDeployedPets();
    // 复习突袭：合并所有到期条目，一次清剿完毕
    const course = Catalog.getActiveCourseData();
    const unit = this._findUnit(due[0].unitId) || course[0]?.units[0];
    this.battle = new Battle(unit, "review", due);
    this._showAlert(due[0], () => {
      this._announceBattleReady();
      this._renderBattle();
    });
  },

  /** 战斗开始前语音：军衔 + 孩子名字 */
  _announceBattleReady() {
    if (!this.battle || this.battle._announcedReady) return;
    this.battle._announcedReady = true;
    const ctx = Storage.getContext();
    const p = Storage.get()?.player;
    const rank = getPlayerRank(p?.score || 0);
    const name = (ctx.name || p?.name || "小航员").trim();
    Sound.narrate(`${rank.name}${name}，准备好干掉 Boss 了吗？`, { rate: 1.15, pitch: 1.25 });
  },

  _findUnit(unitId) {
    return Catalog.findUnitActive(unitId);
  },

  // 红色警报突袭横幅
  _showAlert(entry, cb) {
    const threat = EBBINGHAUS.threatByLevel[entry.level] || EBBINGHAUS.threatByLevel[1];
    Sound.alarm();
    Sound.narrate(`红色警报！${threat.label}！怪兽来袭！`, { rate: 1.3, pitch: 1.1 });
    const banner = document.createElement("div");
    banner.className = "alert-banner";
    banner.innerHTML = `
      <div class="text-center animate__animated animate__zoomIn">
        <div style="font-size:72px">${threat.monster}</div>
        <div class="text-2xl font-black" style="color:${threat.color}">⚠️ ${threat.label}</div>
        <div class="opacity-90 mt-1">${threat.desc}</div>
      </div>`;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.remove();
      cb();
    }, 1800);
  },

  // ============ 战斗界面 ============
  _renderBattle() {
    const b = this.battle;
    const q = b.next();
    if (!q) {
      this._renderResult();
      return;
    }
    const st = b.status();
    const modeLabel = b.mode === "review" ? "🚨 复习突袭" : `🪐 ${b.unit.name}`;

    const STYLE_LABEL = {
      mc: q.type === "dialogue" ? "🗣️ 角色扮演" : "🎯 弹药选择",
      listen: "🎧 听音辨词",
      read: "📖 阅读理解",
      spell: "⌨️ 拼写填空",
      speak: "🎤 口语评测",
    };
    const styleBadge = `<div class="chip" style="font-size:12px;padding:3px 10px;position:absolute;right:10px;top:-12px">${STYLE_LABEL[q.style] || ""}</div>`;
    const speakBtn = `<button class="chip" style="position:absolute;left:10px;top:-12px" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊</button>`;

    let promptHtml, answersHtml;

    if (q.style === "listen") {
      // 听力理解：听音频选答案
      const listenHint = q.type === "dialogue"
        ? "听英文问句，选出正确的回应："
        : "听英文单词，选出中文含义：";
      promptHtml = `
        <div class="text-xs opacity-60 mb-2">${listenHint}</div>
        <button class="btn gold" style="margin:0 auto;font-size:18px;padding:12px 24px" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊 播放音频</button>
        <div class="text-xs opacity-40 mt-2">点击播放按钮听发音，然后选择答案</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else if (q.style === "spell") {
      // 拼写填空：字母拼块
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">为这个怪兽密码拼出英文：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        <div id="spell-slots" class="flex justify-center gap-1 mt-3 flex-wrap" style="min-height:40px"></div>`;
      answersHtml = `
        <div class="flex flex-wrap justify-center gap-2" id="letter-tray">
          ${q.letters.map((c, i) => `<button class="missile" style="min-width:44px;min-height:44px;padding:8px;font-size:20px" data-li="${i}" onclick="UI.spellTap(${i}, this)">${c}</button>`).join("")}
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <button class="btn secondary" onclick="UI.spellBackspace()">⌫ 退格</button>
          <button class="btn" id="fire-btn" onclick="UI.spellFire()">🚀 发射</button>
        </div>`;
    } else if (q.style === "speak") {
      // 口语评测：麦克风发音评分
      const isVocab = q.type === "vocab";
      promptHtml = isVocab
        ? `<div class="text-xs opacity-60 mb-1">看中文，大声读出英文：</div>
           <div class="text-xl font-bold">${q.prompt}</div>
           <div class="mt-2 p-2 rounded-lg" style="background:rgba(56,189,248,0.12)">
             <div class="text-xs opacity-60">请朗读这个单词：</div>
             <div class="text-2xl font-black" style="color:var(--accent)">${q.correct}</div>
           </div>
           <div id="speak-status" class="text-sm mt-2 opacity-70">点击麦克风开始录音，发音越标准激光炮越强！</div>`
        : `<div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
           <div class="text-lg font-bold">${q.prompt}</div>
           <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
           <div class="mt-2 p-2 rounded-lg" style="background:rgba(56,189,248,0.12)">
             <div class="text-xs opacity-60">请大声读出回应：</div>
             <div class="text-xl font-black" style="color:var(--accent)">${q.correct}</div>
           </div>
           <div id="speak-status" class="text-sm mt-2 opacity-70">点击麦克风开始录音，发音越标准激光炮越强！</div>`;
      answersHtml = `<div class="grid grid-cols-2 gap-3">
             <button class="btn gold" id="mic-btn" onclick="UI.openRecordOverlay()">🎤 开始朗读</button>
             <button class="btn secondary" onclick="UI.skipSpeak()">跳过朗读</button>
           </div>`;
    } else if (q.type === "dialogue") {
      // 角色扮演：选择最合适回应
      promptHtml = `
        <div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
        <div class="text-xl font-bold">${q.prompt}</div>
        <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
        <div class="text-xs opacity-50 mt-2">选择最合适的回应，发射激光炮 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else if (q.style === "read") {
      // 阅读理解：看英文选中文
      promptHtml = q.type === "dialogue"
        ? `<div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">阅读这段会话：</span></div>
           <div class="text-lg font-bold" style="color:var(--accent)">${q.prompt}</div>
           <div class="text-xs opacity-50 mt-2">选择正确的中文含义 →</div>`
        : `<div class="text-xs opacity-60 mb-1">阅读英文：</div>
           <div class="text-2xl font-black" style="color:var(--accent)">${q.prompt}</div>
           <div class="text-xs opacity-50 mt-2">选择正确的中文含义 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else {
      // 词汇选择（看中文选英文）
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">怪兽身上的密码：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        <div class="text-xs opacity-50 mt-2">选择正确的英文导弹击中它 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    }

    const useGrid = q.style === "mc" || q.style === "listen" || q.style === "read";

    this._render(`
      <div class="screen">
        <div class="flex items-center justify-between mb-2">
          <span class="chip">${modeLabel}</span>
          <button class="btn secondary" style="padding:8px 14px" onclick="UI.quitBattle()">撤退</button>
        </div>

        <!-- 战场 -->
        <div class="panel battle-stage" id="stage">
          <div class="combo-pop" id="combo" style="${st.combo >= 2 ? "" : "display:none"}">Combo x${st.combo}</div>
          <div class="monster" id="monster">${getMonsterSVG(st.monster.id, 90)}</div>
          ${this._battlePetsHtml()}
          <div class="player-ship" id="ship">
            ${getShipSVG("classic", 56)}
            <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:28px;height:28px">${(WEAPONS[Storage.get().player.suit] || WEAPONS.pulse).svg}</div>
          </div>
        </div>

        <!-- 怪兽信息 + 血条 -->
        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span>${st.monster.name} (${st.formIndex + 1}/${st.formTotal}) <span style="color:${st.monster.color}">· ${st.skillLabel || ""}</span></span>
            <span id="mhp-text">${st.monster.hp}/${st.monster.maxHp}</span>
          </div>
          <div class="hpbar monster-hp"><i id="mhp" style="width:${(st.monster.hp / st.monster.maxHp) * 100}%"></i></div>
        </div>

        <!-- 飞船护盾 + 水晶 -->
        <div class="grid grid-cols-2 gap-3 mt-2">
          <div>
            <div class="flex justify-between text-xs mb-1"><span>🛡️ 护盾 HP</span><span id="hp-text">${st.hp}/${st.maxHp}</span></div>
            <div class="hpbar ship-hp"><i id="hp" style="width:${st.hp}%"></i></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1"><span style="color:var(--crystal)">💎 水晶碎片</span><span id="cr-text">${st.crystals}/${st.crystalGoal}</span></div>
            <div class="hpbar"><i id="cr" style="width:${(st.crystals / st.crystalGoal) * 100}%;background:linear-gradient(90deg,var(--crystal),var(--accent2))"></i></div>
          </div>
        </div>

        <!-- 武器舱 -->
        <div class="panel p-4 mt-4 text-center" id="weapon-bay" style="position:relative">
          ${q.style === "listen" ? "" : speakBtn}
          ${styleBadge}
          ${promptHtml}
        </div>

        <!-- 弹药区 -->
        <div class="${useGrid ? "answer-grid" : ""} mt-3" id="answers">
          ${answersHtml}
        </div>
      </div>`);

    this._currentOptions = q.options;
    this._spellBuffer = [];
    this._locked = false;

    // 听音辨词：进入即自动播放一次发音
    if (q.style === "listen") {
      setTimeout(() => Sound.speak(q.speak), 350);
    }
    if (q.style === "spell") {
      this._renderSpellSlots();
    }
  },

  choose(i, elBtn) {
    if (this._locked) return;
    this._locked = true;
    const b = this.battle;
    const choice = this._currentOptions[i];
    const res = b.answer(choice);

    // 视觉反馈（选项染色）
    const buttons = Array.from(document.querySelectorAll("#answers .missile"));
    buttons.forEach((btn) => {
      if (btn.dataset.i === undefined) return;
      const opt = this._currentOptions[+btn.dataset.i];
      if (opt === res.question.correct) btn.classList.add("right");
      else if (btn === elBtn && !res.correct) btn.classList.add("wrong");
      else btn.classList.add("dim");
    });

    this._afterAnswer(res);
  },

  // ---- 拼写填空 ----
  spellTap(li, btn) {
    if (this._locked) return;
    if (btn.classList.contains("dim")) return;
    btn.classList.add("dim");
    this._spellBuffer.push({ li, char: btn.textContent });
    this._renderSpellSlots();
  },

  spellBackspace() {
    if (this._locked) return;
    const last = this._spellBuffer.pop();
    if (last) {
      const btn = document.querySelector(`#letter-tray [data-li="${last.li}"]`);
      if (btn) btn.classList.remove("dim");
    }
    this._renderSpellSlots();
  },

  _renderSpellSlots() {
    const slots = document.getElementById("spell-slots");
    if (!slots) return;
    const word = this._spellBuffer.map((x) => x.char).join("");
    slots.innerHTML =
      word
        .split("")
        .map((c) => `<span class="chip" style="min-width:28px;justify-content:center;font-size:20px">${c}</span>`)
        .join("") || `<span class="opacity-40 text-sm">点击字母拼出单词…</span>`;
  },

  spellFire() {
    if (this._locked) return;
    const word = this._spellBuffer.map((x) => x.char).join("");
    if (!word) return;
    this._locked = true;
    const res = this.battle.answer(word);
    // 反馈：显示正确答案
    const slots = document.getElementById("spell-slots");
    if (slots) {
      slots.innerHTML = `<span class="chip" style="color:${res.correct ? "var(--ok)" : "var(--danger)"};font-size:18px">${res.correct ? "✓ " + word : "✗ 正确：" + res.question.correct}</span>`;
    }
    this._afterAnswer(res);
  },

  // ---- 口语评测（微信风格录音弹层） ----
  openRecordOverlay() {
    if (this._locked) return;
    const target = this.battle.current.correct;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this._recCancelled = false;
    this._recDone = false;
    this._recResult = null;
    this._recHasAudio = false;
    this._recStartTime = Date.now();
    this._recStartY = 0;
    this._recCountdown = 60;

    // 创建全屏录音弹层
    const overlay = document.createElement("div");
    overlay.id = "rec-overlay";
    overlay.innerHTML = `
      <div class="rec-overlay-bg">
        <div class="rec-overlay-card">
          <div class="rec-wave-box" id="rec-wave">
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
          </div>
          <div class="rec-timer" id="rec-timer">${this._recCountdown}s</div>
          <div class="rec-hint" id="rec-hint">正在录音，请大声朗读…</div>
        </div>
        <div class="rec-cancel-hint" id="rec-cancel-hint">↑ 上滑取消</div>
        <button class="rec-stop-btn" id="rec-stop-btn" onclick="UI._stopRecording(false)">✓ 完成录音</button>
      </div>`;
    document.body.appendChild(overlay);

    // 启动倒计时
    this._recTimer = setInterval(() => {
      this._recCountdown--;
      const timerEl = document.getElementById("rec-timer");
      if (timerEl) timerEl.textContent = this._recCountdown + "s";
      if (this._recCountdown <= 0) {
        this._stopRecording(false);
      }
    }, 1000);

    // 同时启动：1)语音识别（如支持）2)麦克风音量检测
    this._startAudioDetection();

    if (SR) {
      try {
        const rec = new SR();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 3;
        this._speakRec = rec;

        rec.onresult = (e) => {
          this._recDone = true;
          const alts = [];
          for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
          this._recResult = alts;
        };
        rec.onerror = () => {};
        rec.onend = () => {};
        rec.start();
      } catch (err) {
        this._speakRec = null;
      }
    }
  },

  _startAudioDetection() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this._recStream = stream;
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        this._recAudioCtx = audioCtx;
        const check = () => {
          if (this._recCancelled) return;
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          if (avg > 10) this._recHasAudio = true;
          if (!this._recCancelled) requestAnimationFrame(check);
        };
        check();
      } catch (e) {}
    }).catch(() => {});
  },

  _stopRecording(cancelled) {
    if (this._recCancelled) return;
    this._recCancelled = cancelled;
    clearInterval(this._recTimer);

    // 停止语音识别（异步，结果可能稍后到达）
    if (this._speakRec) {
      try { this._speakRec.stop(); } catch (e) {}
    }

    // 移除弹层
    const overlay = document.getElementById("rec-overlay");
    if (overlay) overlay.remove();

    if (cancelled) {
      this._cleanupRecording();
      const status = document.getElementById("speak-status");
      if (status) status.innerHTML = '<span class="opacity-60">已取消，可重新录音</span>';
      return;
    }

    // 等待600ms让异步识别结果到达，然后评估
    setTimeout(() => this._evaluateRecording(), 600);
  },

  _evaluateRecording() {
    this._cleanupRecording();
    const target = this.battle.current.correct;
    const duration = Date.now() - this._recStartTime;

    // 优先使用语音识别结果
    if (this._recDone && this._recResult) {
      const quality = this._scorePronunciation(target, this._recResult);
      this._finishSpeak(quality, this._recResult[0]);
      return;
    }

    // 有麦克风音量检测到声音 → 给鼓励分
    if (this._recHasAudio) {
      this._finishSpeak(0.7, target);
      return;
    }

    // 录音时长超过2秒 → 认为用户尝试了（可能是SR不支持或灵敏度问题）
    if (duration > 2000) {
      this._finishSpeak(0.6, target);
      return;
    }

    // 录音太短，提示重试
    const status = document.getElementById("speak-status");
    if (status) status.innerHTML = '<span style="color:var(--danger)">录音时间太短，请再试一次（至少2秒）</span>';
  },

  _cleanupRecording() {
    this._speakRec = null;
    if (this._recStream) {
      this._recStream.getTracks().forEach(t => t.stop());
      this._recStream = null;
    }
    if (this._recAudioCtx) {
      try { this._recAudioCtx.close(); } catch (e) {}
      this._recAudioCtx = null;
    }
  },

  // 跳过朗读：以普通伤害发射（不享受发音加成）
  skipSpeak() {
    if (this._locked) return;
    this._finishSpeak(1, null, true);
  },

  _scorePronunciation(target, alternatives) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, "").trim();
    const t = norm(target);
    let best = 0;
    alternatives.forEach((a) => {
      const sim = this._similarity(t, norm(a));
      if (sim > best) best = sim;
    });
    return best;
  },

  // 基于编辑距离的相似度（0~1）
  _similarity(a, b) {
    if (!a.length || !b.length) return 0;
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - dp[m][n] / Math.max(m, n);
  },

  _finishSpeak(quality, heard, skipped = false) {
    if (this._locked) return;
    this._locked = true;
    const target = this.battle.current.correct;
    // 发音相似度 >= 0.5 视为答对；评级供反馈
    const correct = quality >= 0.5;
    const res = this.battle.answer(correct ? target : (heard || "__"), { quality });

    let rating = "Excellent!";
    if (quality < 0.5) rating = "再试试~";
    else if (quality < 0.7) rating = "Good";
    else if (quality < 0.9) rating = "Great!";
    const status = document.getElementById("speak-status");
    if (status) {
      status.innerHTML = skipped
        ? '<span class="opacity-70">已跳过朗读，普通发射。</span>'
        : `<span style="color:${correct ? "var(--ok)" : "var(--danger)"}">发音评分：${Math.round(quality * 100)} 分 · ${rating}${heard ? ` （听到：${heard}）` : ""}</span>`;
    }
    this._afterAnswer(res);
  },

  // ---- 统一的答题结算后处理 ----
  _afterAnswer(res) {
    const b = this.battle;
    if (res.correct) {
      this._fireLaser(res.crit);
      this._hitMonster(res);
      if (res.petDamage) this._petAttackFx();
      // 连击分级视觉
      const comboEl = document.getElementById("combo");
      if (comboEl) {
        comboEl.classList.remove("fire", "inferno");
        if (res.combo >= 10) comboEl.classList.add("inferno");
        else if (res.combo >= 5) comboEl.classList.add("fire");
      }
      // 连击回血视觉反馈
      if (res.heal) {
        const ship = document.getElementById("player-ship");
        if (ship) {
          const sr = ship.getBoundingClientRect();
          const hpPop = document.createElement("div");
          hpPop.textContent = `+${res.heal} HP`;
          hpPop.style.cssText = `position:fixed;left:${sr.left+sr.width/2-20}px;top:${sr.top-10}px;color:#4ade80;font-weight:bold;font-size:16px;z-index:9999;pointer-events:none;animation:fx-particle 0.8s ease-out forwards;text-shadow:0 0 8px #4ade80`;
          document.body.appendChild(hpPop);
          setTimeout(() => hpPop.remove(), 800);
        }
      }
      // 粒子特效
      const monster = document.getElementById("monster");
      if (monster) {
        const r = monster.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (res.crit) {
          FX.critRing(cx, cy);
          FX.shake(6, 250);
        } else {
          FX.explode(cx, cy, 10, ["#fbbf24", "#f97316", "#38bdf8"]);
          FX.shake(3, 120);
        }
        if (res.combo >= 5) FX.comboWave(res.combo);
        if (res.crystalGain) FX.crystalBurst(cx, cy + 40, res.crystalGain * 3);
      }
      // 连击播报
      if (res.combo === 5) Sound.narrate("五连击！太棒了！", { rate: 1.3, pitch: 1.4 });
      else if (res.combo === 10) Sound.narrate("十连击！不可思议！", { rate: 1.4, pitch: 1.5 });
      // BOSS 击杀庆祝（仅推图最终 BOSS 且战斗已结束）
      if (res.monsterDead && !res.formEvolved && b.finished && b.win) {
        setTimeout(() => FX.bossKill(), 200);
        Sound.narrate("Boss击败！太强了！", { rate: 1.2, pitch: 1.3 });
      }
    } else {
      this._shipHit(res);
      FX.shake(10, 400);
      FX.flash("#ef4444", 150);
      // HP 告急播报
      if (this.battle.hp > 0 && this.battle.hp <= 30) {
        Sound.narrate("护盾告急！小心！", { rate: 1.3, pitch: 1.0 });
      }
    }
    this._updateBars();
    setTimeout(() => {
      if (b.finished) {
        if (b.win) FX.victory();
        this._renderResult();
      } else if (res.formEvolved) {
        FX.evolve();
        this._showEvolve(() => this._renderBattle());
      } else {
        this._renderBattle();
      }
    }, res.correct ? 900 : 1100);
  },

  _battlePetsHtml() {
    const pets = Combat.getDeployedPets();
    if (!pets.length) return "";
    return `<div class="battle-pets">${pets
      .map((pp, i) => {
        const def = PETS.find((d) => d.id === pp.species);
        if (!def) return "";
        const stage = getPetStageEmoji(def, pp.level);
        const scale = getPetVisualScale(pp.level);
        return `<div class="battle-pet" id="pet-${pp.species}" style="--pet-color:${def.color};--pet-scale:${scale};--i:${i}" title="${def.name} Lv.${pp.level}">
          <span class="battle-pet-emoji">${stage}</span>
          <span class="battle-pet-lv">Lv.${pp.level}</span>
        </div>`;
      })
      .join("")}</div>`;
  },

  _petAttackFx() {
    document.querySelectorAll(".battle-pet").forEach((el) => {
      el.classList.remove("pet-attack");
      void el.offsetWidth;
      el.classList.add("pet-attack");
      setTimeout(() => el.classList.remove("pet-attack"), 450);
    });
  },

  _fireLaser(crit) {
    const stage = document.getElementById("stage");
    if (!stage) return;
    const w = WEAPONS[Storage.get().player.suit] || WEAPONS.pulse;
    const beam = document.createElement("div");
    beam.className = "laser-beam" + (crit ? " crit" : "");
    beam.style.background = crit ? `linear-gradient(to top, #fff, ${w.critColor}, ${w.color})` : w.beam;
    beam.style.width = (crit ? w.beamWidth + 6 : w.beamWidth) + "px";
    beam.style.boxShadow = `0 0 24px ${w.color}, 0 0 48px ${w.color}44`;
    stage.appendChild(beam);
    if (crit) {
      const flash = document.createElement("div");
      flash.className = "crit-flash";
      flash.style.background = `radial-gradient(circle at 50% 30%, ${w.critColor}66, transparent 60%)`;
      stage.appendChild(flash);
      setTimeout(() => flash.remove(), 450);
    }
    setTimeout(() => beam.remove(), 380);
  },

  _hitMonster(res) {
    const m = document.getElementById("monster");
    const stage = document.getElementById("stage");
    if (m) {
      setTimeout(() => {
        m.classList.add("hit");
        setTimeout(() => m.classList.remove("hit"), 350);
      }, 180);
    }
    // 浮动伤害
    if (stage) {
      const fn = document.createElement("div");
      fn.className = "float-num";
      fn.style.left = "48%";
      fn.style.top = "60px";
      fn.style.color = res.crit ? "#fbbf24" : "#fff";
      fn.textContent = (res.crit ? "暴击 -" : "-") + res.damage;
      stage.appendChild(fn);
      setTimeout(() => fn.remove(), 900);
      if (res.petDamage) {
        const pfn = document.createElement("div");
        pfn.className = "float-num";
        pfn.style.left = "38%";
        pfn.style.top = "78px";
        pfn.style.color = "#a78bfa";
        pfn.style.fontSize = "13px";
        pfn.textContent = `宠物 -${res.petDamage}`;
        stage.appendChild(pfn);
        setTimeout(() => pfn.remove(), 900);
      }
    }
    // combo 显示
    const combo = document.getElementById("combo");
    if (combo && res.combo >= 2) {
      combo.style.display = "block";
      combo.textContent = `Combo x${res.combo}`;
      combo.classList.remove("bump");
      void combo.offsetWidth;
      combo.classList.add("bump");
    }
  },

  _shipHit(res) {
    const ship = document.getElementById("ship");
    const stage = document.getElementById("stage");
    if (ship) {
      ship.classList.add("shake");
      setTimeout(() => ship.classList.remove("shake"), 400);
    }
    if (stage && res.selfDamage) {
      const fn = document.createElement("div");
      fn.className = "float-num";
      fn.style.left = "48%";
      fn.style.bottom = "20px";
      fn.style.top = "auto";
      fn.style.color = "#ef4444";
      fn.textContent = "护盾 -" + res.selfDamage;
      stage.appendChild(fn);
      setTimeout(() => fn.remove(), 900);
    }
    const combo = document.getElementById("combo");
    if (combo) combo.style.display = "none";
  },

  _updateBars() {
    const st = this.battle.status();
    const set = (id, w) => {
      const e = document.getElementById(id);
      if (e) e.style.width = w + "%";
    };
    set("mhp", (st.monster.hp / st.monster.maxHp) * 100);
    set("hp", st.hp);
    set("cr", (st.crystals / st.crystalGoal) * 100);
    const mt = document.getElementById("mhp-text");
    if (mt) mt.textContent = `${st.monster.hp}/${st.monster.maxHp}`;
    const ht = document.getElementById("hp-text");
    if (ht) ht.textContent = `${st.hp}/${st.maxHp}`;
    const ct = document.getElementById("cr-text");
    if (ct) ct.textContent = `${st.crystals}/${st.crystalGoal}`;
  },

  _showEvolve(cb) {
    const st = this.battle.status();
    const form = MONSTER_FORMS[this.battle.formIndex];
    const skillLabel = form ? form.skillLabel : "";
    const banner = document.createElement("div");
    banner.className = "alert-banner";
    banner.innerHTML = `
      <div class="text-center animate__animated animate__zoomIn">
        <div style="font-size:72px">${st.monster.emoji}</div>
        <div class="text-2xl font-black" style="color:${st.monster.color}">怪兽进化！</div>
        <div class="opacity-90 mt-1">${st.monster.name} 出现了！</div>
        ${skillLabel ? `<div class="chip mt-2" style="display:inline-block;background:${st.monster.color}22;color:${st.monster.color}">🎯 技能挑战：${skillLabel}</div>` : ""}
      </div>`;
    document.body.appendChild(banner);
    Sound.alarm();
    Sound.narrate(`警告！${st.monster.name}出现！准备接受${skillLabel}挑战！`, { rate: 1.3, pitch: 1.1 });
    setTimeout(() => {
      banner.remove();
      cb();
    }, 2000);
  },

  quitBattle() {
    if (confirm("确定撤退吗？本次战斗的进度将保留已收集的水晶。")) {
      this.battle._end(false);
      this.showMenu();
    }
  },

  // ============ 结算界面 ============
  _renderResult() {
    const b = this.battle;
    if (b.win) Sound.win();
    const hpZero = b.hp <= 0;

    let title, sub, icon;
    if (b.win && b.mode === "review") {
      title = "突袭击退！";
      sub = "红色警报已解除！下次复习之前不会再有怪兽突袭。";
      icon = "✨";
      Sound.narrate("突袭击退！红色警报解除！", { rate: 1.1 });
    } else if (b.win && b.perfectClear) {
      title = "⭐ 完美通关！";
      sub = "三形态 BOSS 全灭 + 水晶集齐 + 遗忘队列清零，星域恢复光明！";
      icon = "🏆";
      Sound.narrate("完美通关！你太厉害了！星域恢复光明！", { rate: 1.1, pitch: 1.3 });
    } else if (b.win) {
      title = "星域解放！";
      sub = "三形态遗忘吞噬怪全部击败！新星域已解锁！继续复习可达成「完美通关」。";
      icon = "🎉";
      Sound.narrate("恭喜！星域解放！所有怪兽已被消灭！", { rate: 1.1, pitch: 1.2 });
    } else if (hpZero) {
      title = "飞船进入充能模式";
      sub = "护盾耗尽，飞船自动休眠充能。先去现实世界休息一下吧！";
      icon = "😴";
      Sound.narrate("飞船护盾耗尽，休息一下再战！", { rate: 1.0, pitch: 0.9 });
    } else {
      title = "本轮突袭结束";
      sub = "成功守住防线，记忆又巩固了一层！";
      icon = "✨";
      Sound.narrate("防线守住了！好样的！", { rate: 1.1 });
    }

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="panel text-center p-6 mt-6 animate__animated animate__zoomIn">
          <div style="font-size:64px">${icon}</div>
          <h1 class="text-2xl font-black title-glow mt-2">${title}</h1>
          <p class="text-sm opacity-70 mt-2 px-3">${sub}</p>
          <div class="grid grid-cols-3 gap-2 mt-5">
            <div class="panel p-3"><div class="text-xs opacity-60">战功</div><div class="text-xl font-black" style="color:var(--gold)">+${b.scoreGained}</div></div>
            <div class="panel p-3"><div class="text-xs opacity-60">水晶</div><div class="text-xl font-black" style="color:var(--crystal)">+${b.crystalsGained}</div></div>
            <div class="panel p-3"><div class="text-xs opacity-60">最高连击</div><div class="text-xl font-black">x${b.bestCombo}</div></div>
          </div>
          <div class="grid gap-3 mt-6">
            ${b.mode === "campaign" && !b.win && !hpZero ? `<button class="btn" onclick="UI.startCampaign('${b.unit.id}')">继续进攻</button>` : ""}
            <button class="btn secondary" onclick="UI.showLevelSelect()">🌌 返回星图</button>
            <button class="btn secondary" onclick="UI.showMenu()">🏠 返回基地</button>
          </div>
        </div>
      </div>`);
  },

  // ============ 武器库 ============
  showStore() {
    const p = Storage.get().player;
    const weaponCards = Object.entries(WEAPONS).map(([id, w]) => {
      const owned = p.ownedSuits.includes(id);
      const equipped = p.suit === id;
      return `
        <div class="panel p-4 text-center" style="border-color:${equipped ? w.color : ""}">
          <div class="flex justify-center"><div style="width:48px;height:48px">${w.svg}</div></div>
          <div class="font-bold mt-1" style="color:${w.color}">${w.name}</div>
          <div class="text-xs opacity-60">${w.desc}</div>
          ${w.ability ? `<div class="text-xs mt-1" style="color:var(--gold)">⚡ ${w.ability}</div>` : ""}
          <div class="text-xs opacity-50">${Combat.weaponDamageLabel(id)}</div>
          <div class="text-xs opacity-60 mb-2">${owned ? "已拥有" : "🏅 " + w.price}</div>
          ${equipped
            ? `<button class="btn gold" style="width:100%" disabled>装备中</button>`
            : owned
            ? `<button class="btn" style="width:100%" onclick="UI.equipSuit('${id}')">装备</button>`
            : `<button class="btn secondary" style="width:100%" ${p.score < w.price ? "disabled" : ""} onclick="UI.buySuit('${id}')">兑换</button>`
          }
        </div>`;
    }).join("");

    const petCards = PETS.map((pet) => {
      const owned = (Storage.get().pets || []).find(pp => pp.species === pet.id);
      return `
        <div class="panel p-4 text-center">
          <div class="flex justify-center"><div style="width:52px;height:52px">${pet.svg}</div></div>
          <div class="font-bold mt-1" style="color:${pet.color}">${pet.name}</div>
          <div class="text-xs opacity-60">${pet.ability}</div>
          <div class="text-xs opacity-60 mb-2">${owned ? "Lv." + owned.level : "💎 " + pet.price}</div>
          ${owned
            ? `<button class="btn" style="width:100%" onclick="UI.showPets()">查看</button>`
            : `<button class="btn secondary" style="width:100%" ${p.crystals < pet.price ? "disabled" : ""} onclick="UI.buyPet('${pet.id}')">领养</button>`
          }
        </div>`;
    }).join("");

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">⚔️ 武器库 & 宠物</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <h2 class="text-lg font-bold mt-4 mb-2">🔫 武器系统（用战功🏅兑换）</h2>
        <div class="grid grid-cols-2 gap-3">${weaponCards}</div>
        <h2 class="text-lg font-bold mt-5 mb-2">🐾 太空宠物（用水晶💎领养）</h2>
        <div class="grid grid-cols-2 gap-3">${petCards}</div>
        <div class="h-6"></div>
      </div>`);
  },

  buySuit(id) {
    const p = Storage.get().player;
    const w = WEAPONS[id];
    if (p.score < w.price) return;
    p.score -= w.price;
    p.ownedSuits.push(id);
    p.suit = id;
    Storage.save();
    Sound.win();
    FX.explode(window.innerWidth / 2, window.innerHeight / 2, 20, [w.color, "#fbbf24", "#fff"]);
    this.showStore();
  },

  equipSuit(id) {
    Storage.get().player.suit = id;
    Storage.save();
    this.showStore();
  },

  buyPet(speciesId) {
    const p = Storage.get().player;
    const pet = PETS.find(pp => pp.id === speciesId);
    if (p.crystals < pet.price) return;
    p.crystals -= pet.price;
    if (!Storage.get().pets) Storage.get().pets = [];
    Storage.get().pets.push({ species: speciesId, level: 1, exp: 0, fedAt: Date.now() });
    const child = Storage.getActiveChild();
    if (child) {
      if (!Array.isArray(child.deployedPets)) child.deployedPets = [];
      if (child.deployedPets.length < Combat.MAX_BATTLE_PETS && !child.deployedPets.includes(speciesId)) {
        child.deployedPets.push(speciesId);
      }
    }
    Storage.save();
    Sound.win();
    FX.crystalBurst(window.innerWidth / 2, window.innerHeight / 2, 12);
    this.showPets();
  },

  // ============ 宠物舱 ============
  showPets() {
    const pets = Storage.get().pets || [];
    const p = Storage.get().player;
    const deployedIds = Combat.getDeployedPetIds();
    const slotsFull = deployedIds.length >= Combat.MAX_BATTLE_PETS;
    let content;
    if (!pets.length) {
      content = `<div class="panel p-6 text-center opacity-70">还没有宠物。<br/>去武器库用💎领养一只吧！</div>`;
    } else {
      content = pets.map((pp) => {
        const def = PETS.find(d => d.id === pp.species);
        const maxed = pp.level >= def.maxLevel;
        const feedCost = pp.level * 8;
        const expNeeded = pp.level * 20;
        const pct = Math.min(100, Math.round((pp.exp / expNeeded) * 100));
        const deployed = deployedIds.includes(pp.species);
        return `
          <div class="panel p-4 text-center" style="${deployed ? "border-color:" + def.color : ""}">
            <div class="text-3xl">${getPetStageEmoji(def, pp.level)}</div>
            <div class="flex justify-center mt-1"><div style="width:${Math.round(48 * getPetVisualScale(pp.level))}px;height:${Math.round(48 * getPetVisualScale(pp.level))}px;transition:transform 0.3s">${def.svg}</div></div>
            <div class="font-bold mt-1" style="color:${def.color}">${def.name}</div>
            <div class="text-xs" style="color:var(--gold)">Lv.${pp.level}${maxed ? " MAX" : ""}</div>
            <div class="text-xs opacity-80 mt-1" style="color:${def.color}">⚡ ${Combat.describePet(pp)}</div>
            <div class="hpbar mt-2"><i style="width:${pct}%;background:linear-gradient(90deg,${def.color},var(--gold))"></i></div>
            <div class="text-xs opacity-50 mt-1">EXP ${pp.exp}/${expNeeded}</div>
            ${deployed
              ? `<button class="btn gold" style="width:100%;margin-top:8px" onclick="UI.toggleDeployPet('${pp.species}')">⚔️ 出战中（点击换下）</button>`
              : `<button class="btn secondary" style="width:100%;margin-top:8px" ${slotsFull ? "disabled" : ""} onclick="UI.toggleDeployPet('${pp.species}')">${slotsFull ? "出战位已满" : "⚔️ 设为出战"}</button>`
            }
            ${maxed ? `<div class="text-xs mt-2" style="color:var(--gold)">🌟 满级！能力全开</div>` :
              `<button class="btn" style="width:100%;margin-top:8px" ${p.crystals < feedCost ? "disabled" : ""} onclick="UI.feedPet('${pp.species}')">🍖 喂养 (${feedCost}💎)</button>`
            }
          </div>`;
      }).join("");
    }

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">🐾 宠物舱</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-60 mt-2">选择最多 <b>${Combat.MAX_BATTLE_PETS}</b> 只宠物出战，它们会跟你一起上战场！当前出战：${deployedIds.length ? deployedIds.map((id) => PETS.find((d) => d.id === id)?.name || id).join("、") : "无"}</p>
        <div class="grid grid-cols-2 gap-3 mt-4">${content}</div>
        <div class="h-6"></div>
      </div>`);
  },

  toggleDeployPet(speciesId) {
    const child = Storage.getActiveChild();
    const pets = Storage.get()?.pets || [];
    if (!child || !pets.some((p) => p.species === speciesId)) return;
    if (!Array.isArray(child.deployedPets)) child.deployedPets = [];
    const idx = child.deployedPets.indexOf(speciesId);
    if (idx >= 0) {
      child.deployedPets.splice(idx, 1);
    } else {
      if (child.deployedPets.length >= Combat.MAX_BATTLE_PETS) return;
      child.deployedPets.push(speciesId);
    }
    Storage.save();
    this.showPets();
  },

  feedPet(speciesId) {
    const p = Storage.get().player;
    const pets = Storage.get().pets || [];
    const pp = pets.find(x => x.species === speciesId);
    const def = PETS.find(d => d.id === speciesId);
    if (!pp || pp.level >= def.maxLevel) return;
    const feedCost = pp.level * 8;
    if (p.crystals < feedCost) return;
    p.crystals -= feedCost;
    pp.exp += 10 + Math.floor(Math.random() * 6);
    const expNeeded = pp.level * 20;
    if (pp.exp >= expNeeded) {
      pp.level += 1;
      pp.exp = 0;
      Sound.win();
      Sound.narrate(`${def.name}升级到 ${pp.level} 级！${getPetStageEmoji(def, pp.level)}`, { rate: 1.2, pitch: 1.3 });
      FX.explode(window.innerWidth / 2, window.innerHeight / 3, 24, [def.color, "#fbbf24", "#fff"]);
    } else {
      Sound.correct();
    }
    pp.fedAt = Date.now();
    Storage.save();
    this.showPets();
  },

  // ============ 学情数据（家长端预览） ============
  showStats() {
    const save = Storage.get();
    const mastery = save.mastery;
    const keys = Object.keys(mastery);
    const learned = keys.length;
    const mastered = keys.filter((k) => mastery[k].level >= EBBINGHAUS.maxLevel).length;
    const totalCorrect = keys.reduce((s, k) => s + (mastery[k].correct || 0), 0);
    const totalWrong = keys.reduce((s, k) => s + (mastery[k].wrong || 0), 0);
    const acc = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;
    const pending = ReviewQueue.pendingCount();
    const dueNow = ReviewQueue.dueCount();
    const completedUnits = Object.values(save.progress).filter((p) => p.completed).length;

    // 易错词 Top
    const wrongList = keys
      .filter((k) => mastery[k].wrong > 0)
      .sort((a, b) => mastery[b].wrong - mastery[a].wrong)
      .slice(0, 6)
      .map((k) => {
        const en = k.split("::")[2];
        return `<span class="chip" style="color:#fca5a5">${en} ×${mastery[k].wrong}</span>`;
      })
      .join(" ");

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">📊 高能护航学情</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <div class="panel p-4 mt-4">
          <p class="leading-relaxed">
            您的小航员已接触 <b style="color:var(--accent)">${learned}</b> 个语言点，
            其中 <b style="color:var(--ok)">${mastered}</b> 个已牢固掌握；
            答题正确率 <b style="color:var(--gold)">${acc}%</b>，
            完美通关 <b style="color:var(--crystal)">${completedUnits}</b> 个星域。
            ${dueNow > 0 ? `当前有 <b style="color:var(--danger)">${dueNow}</b> 个遗忘怪兽正在突袭，完成一次复习突袭即可全部清剿！` : pending > 0 ? `复习队列共 <b>${pending}</b> 项，下次到期前暂无警报。` : "暂无待清剿的遗忘怪兽，状态极佳！"}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">累计答对</div><div class="text-2xl font-black" style="color:var(--ok)">${totalCorrect}</div></div>
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">待复习（已到期）</div><div class="text-2xl font-black" style="color:var(--danger)">${dueNow}</div></div>
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">复习队列总数</div><div class="text-2xl font-black" style="color:var(--accent)">${pending}</div></div>
        </div>
        <h2 class="text-lg font-bold mt-4 mb-2">⚠️ 高频易错单词</h2>
        <div class="flex flex-wrap gap-2">${wrongList || '<span class="opacity-50 text-sm">暂无易错记录，棒极了！</span>'}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🏅 成就徽章</h2>
        <div class="grid grid-cols-2 gap-2">${this._renderAchievements()}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🎖️ 段位晋升</h2>
        ${this._renderRankProgress()}

        <div class="mt-6 grid gap-3">
          <button class="btn secondary" style="width:100%" onclick="UI.exportSave()">📤 导出学习存档</button>
          <button class="btn secondary" style="width:100%" onclick="UI.importSave()">📥 导入学习存档</button>
          <button class="btn secondary" style="width:100%" onclick="UI.confirmReset()">🗑️ 重置所有存档</button>
        </div>
        <div class="h-6"></div>
      </div>`);
  },

  _renderAchievements() {
    const save = Storage.get();
    return ACHIEVEMENTS.map((a) => {
      const unlocked = a.check(save);
      return `<div class="panel p-3 ${unlocked ? "" : "opacity-40"}" style="text-align:center">
        <div style="font-size:28px">${a.icon}</div>
        <div class="font-bold text-sm mt-1">${a.name}</div>
        <div class="text-xs opacity-60">${a.desc}</div>
        ${unlocked ? '<div class="text-xs mt-1" style="color:var(--ok)">✓ 已解锁</div>' : ""}
      </div>`;
    }).join("");
  },

  _renderRankProgress() {
    const score = Storage.get().player.score;
    const rank = getPlayerRank(score);
    const nextIdx = RANKS.indexOf(rank) + 1;
    const next = nextIdx < RANKS.length ? RANKS[nextIdx] : null;
    const pct = next ? Math.min(100, Math.round(((score - rank.min) / (next.min - rank.min)) * 100)) : 100;
    return `
      <div class="panel p-4">
        <div class="flex items-center justify-between">
          <div>
            <span style="font-size:24px">${rank.icon}</span>
            <span class="font-bold ml-2" style="color:${rank.color}">${rank.name}</span>
          </div>
          ${next ? `<span class="text-xs opacity-60">下一段：${next.icon} ${next.name} (${next.min}分)</span>` : `<span class="text-xs" style="color:var(--gold)">满段位 MAX</span>`}
        </div>
        <div class="hpbar mt-2"><i style="width:${pct}%;background:linear-gradient(90deg,${rank.color},${next ? next.color : rank.color})"></i></div>
        <div class="text-xs opacity-60 mt-1 text-right">${score} / ${next ? next.min : "MAX"}</div>
      </div>`;
  },

  confirmReset() {
    if (confirm("确定要清空所有存档吗？此操作不可恢复。")) {
      Storage.reset();
      this.showMenu();
    }
  },

  exportSave() {
    try {
      const json = Storage.exportJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ctx = Storage.getContext();
      const name = (ctx.name || "save").replace(/[^\w\u4e00-\u9fa5-]+/g, "");
      a.href = url;
      a.download = `language-astronauts-${name}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert("存档已导出！请妥善保存 JSON 文件。");
    } catch (e) {
      alert("导出失败：" + e.message);
    }
  },

  importSave() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!confirm("导入将覆盖当前设备上的全部学习进度，确定继续吗？")) return;
      try {
        const text = await file.text();
        Storage.importJSON(text);
        ReviewQueue.consolidate();
        alert("导入成功！学习进度已恢复。");
        this.showMenu();
      } catch (e) {
        alert("导入失败：" + e.message);
      }
    };
    input.click();
  },
};

if (typeof window !== "undefined") window.UI = UI;
