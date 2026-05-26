// icons.jsx — Lumis icon set. Thin 1.5 stroke, gold-friendly.

const Ico = ({ d, size = 18, stroke = 'currentColor', fill = 'none', sw = 1.5, vb = '0 0 24 24', children, ...rest }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children || <path d={d} />}
  </svg>
);

// Navigation
const IcDashboard = (p) => <Ico {...p}><rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></Ico>;
const IcCard = (p) => <Ico {...p}><rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19"/></Ico>;
const IcAnalytics = (p) => <Ico {...p}><path d="M3 21h18"/><path d="M6 17V11"/><path d="M11 17V6"/><path d="M16 17v-8"/><path d="M20 17v-4"/></Ico>;
const IcGoals = (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/></Ico>;
const IcSparkle = (p) => <Ico {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></Ico>;

// Quick actions
const IcEdit = (p) => <Ico {...p}><path d="M14.5 4l5.5 5.5"/><path d="M3 21l4-1 12-12-3-3L4 17l-1 4z"/></Ico>;
const IcReceipt = (p) => <Ico {...p}><path d="M6 3v18l2-1.5L10 21l2-1.5L14 21l2-1.5L18 21V3z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></Ico>;
const IcMic = (p) => <Ico {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></Ico>;
const IcSplit = (p) => <Ico {...p}><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 21c0-3.3 2.7-6 6-6"/><path d="M22 21c0-3.3-2.7-6-6-6"/><path d="M10 17h4"/><path d="M12 15v4"/></Ico>;
const IcTarget = (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 8V2"/><path d="M14 4l-2 4-2-4"/></Ico>;

// UI
const IcEyeOn = (p) => <Ico {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Ico>;
const IcEyeOff = (p) => <Ico {...p}><path d="M3 3l18 18"/><path d="M10.5 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.2 4"/><path d="M6.6 6.6C3.7 8.6 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.6-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></Ico>;
const IcChevron = (p) => <Ico {...p} vb="0 0 24 24"><path d="M9 6l6 6-6 6"/></Ico>;
const IcChevronDown = (p) => <Ico {...p}><path d="M6 9l6 6 6-6"/></Ico>;
const IcPlus = (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>;
const IcArrowUp = (p) => <Ico {...p}><path d="M7 17 17 7"/><path d="M9 7h8v8"/></Ico>;
const IcArrowDown = (p) => <Ico {...p}><path d="M7 7l10 10"/><path d="M17 9v8H9"/></Ico>;
const IcArrowRight = (p) => <Ico {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ico>;
const IcSend = (p) => <Ico {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Ico>;
const IcBell = (p) => <Ico {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></Ico>;
const IcSearch = (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></Ico>;
const IcSettings = (p) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ico>;

// Categories
const IcHome = (p) => <Ico {...p}><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></Ico>;
const IcCoffee = (p) => <Ico {...p}><path d="M3 8h14v5a5 5 0 0 1-10 0v-2"/><path d="M3 8v5a5 5 0 0 0 5 5"/><path d="M17 11h2a3 3 0 1 1 0 6h-1"/><path d="M7 4v1M10 4v1M13 4v1"/></Ico>;
const IcCart = (p) => <Ico {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h12l2-8H6"/></Ico>;
const IcCar = (p) => <Ico {...p}><path d="M5 11l1.5-4.5A2 2 0 0 1 8.5 5h7a2 2 0 0 1 2 1.5L19 11"/><path d="M3 15v-2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M3 15h18v3h-2v-2H5v2H3z"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></Ico>;
const IcPlane = (p) => <Ico {...p}><path d="M2 12l8-1 4-7 2 1-2 6 6 4-1 2-7-2-3 5h-2l1-5-5-1z"/></Ico>;
const IcMusic = (p) => <Ico {...p}><path d="M9 17V5l11-2v12"/><circle cx="6" cy="17" r="3"/><circle cx="17" cy="15" r="3"/></Ico>;
const IcMore = (p) => <Ico {...p}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Ico>;
const IcHeart = (p) => <Ico {...p}><path d="M12 21s-8-5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-8 11-8 11z" transform="scale(0.83) translate(2.4 2.4)"/></Ico>;
const IcShield = (p) => <Ico {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></Ico>;
const IcBolt = (p) => <Ico {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></Ico>;
const IcWallet = (p) => <Ico {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1.2"/></Ico>;
const IcNFC = (p) => <Ico {...p}><path d="M7 8c-2 2-2 6 0 8"/><path d="M10 6c-3 3-3 9 0 12"/><path d="M13 4c-4 4-4 12 0 16"/><path d="M16 2c-5 5-5 15 0 20"/></Ico>;
const IcLock = (p) => <Ico {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Ico>;
const IcCheck = (p) => <Ico {...p}><path d="M5 12l5 5L20 7"/></Ico>;

Object.assign(window, {
  Ico,
  IcDashboard, IcCard, IcAnalytics, IcGoals, IcSparkle,
  IcEdit, IcReceipt, IcMic, IcSplit, IcTarget,
  IcEyeOn, IcEyeOff, IcChevron, IcChevronDown, IcPlus,
  IcArrowUp, IcArrowDown, IcArrowRight, IcSend, IcBell, IcSearch, IcSettings,
  IcHome, IcCoffee, IcCart, IcCar, IcPlane, IcMusic, IcMore,
  IcHeart, IcShield, IcBolt, IcWallet, IcNFC, IcLock, IcCheck,
});
