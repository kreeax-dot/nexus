import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const app = initializeApp({
  apiKey: "AIzaSyAbWHgp0DZVSorRYoqC_mudYaSN32uZBoU",
  authDomain: "nexus-3ffb3.firebaseapp.com",
  projectId: "nexus-3ffb3",
  storageBucket: "nexus-3ffb3.firebasestorage.app",
  messagingSenderId: "511048180759",
  appId: "1:511048180759:web:cf9a009006ca0e7884e852"
});
const db = getFirestore(app);
const UID = "ndz_nexus";

function useFS(key, def) {
  const [val, setVal] = useState(def);
  const [rdy, setRdy] = useState(false);
  const ref = doc(db, "users", UID, "data", key);
  useEffect(() => {
    return onSnapshot(ref, snap => {
      setVal(snap.exists() ? (snap.data().v ?? def) : def);
      setRdy(true);
    });
  }, [key]);
  const set = useCallback(async (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    await setDoc(ref, { v: next }, { merge: true });
  }, [val, ref]);
  return [val, set, rdy];
}

// ─── DESIGN TOKENS (DARK / GOLD / NEON-GREEN) ────────────────────────────────
// Premium palette — deep near-black base, soft neon green as the hero accent,
// warm gold as the secondary. Muted reds. Glass-friendly surface tokens.
const C = {
  bg:     "#05070b",          // page: deeper near-black
  bg2:    "#090d14",          // input surfaces
  card:   "rgba(20, 26, 36, 0.72)",   // glass card (requires backdrop-filter)
  cardS:  "#121821",          // solid card fallback (for tiny ui)
  card2:  "#0d121b",          // nested cards
  border: "rgba(255,255,255,0.06)",   // hairline
  border2:"rgba(255,255,255,0.10)",   // emphasized hairline
  text:   "#eef2f7",
  text2:  "#a6b0c0",
  text3:  "#707a8c",
  text4:  "#474f5f",
  gold:   "#f5c056",
  goldD:  "#d4a73e",
  green:  "#22d3a0",          // softer neon green
  greenD: "#0f9c75",
  greenG: "#7cf2c8",          // highlight/glow edge
  red:    "#e5484d",
  orange: "#f08a3e",          // priority medium
  grey:   "#6a7385",          // priority low / neutral
};
const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ─── ICON SYSTEM (thin SVG, consistent stroke) ───────────────────────────────
const ICONS = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  check: <polyline points="20 6 9 17 4 12"/>,
  checkCircle: <><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></>,
  checkSquare: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  listCheck: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/></>,
  bar: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  sparkles: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  calendarPlus: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
  droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/></>,
  play: <polygon points="6 4 20 12 6 20 6 4"/>,
  stop: <rect x="6" y="6" width="12" height="12" rx="1"/>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  arrowUp: <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
  chevL: <polyline points="15 18 9 12 15 6"/>,
  chevR: <polyline points="9 18 15 12 9 6"/>,
  chevD: <polyline points="6 9 12 15 18 9"/>,
  sunrise: <><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></>,
  bed: <><path d="M2 4v16"/><path d="M2 8h18a4 4 0 0 1 4 4v8"/><path d="M2 17h22"/><path d="M7 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></>,
  alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  trendDown: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
  rotate: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>,
  filter: <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  dumbbell: <><path d="M6.5 6.5L17.5 17.5"/><path d="M21 21l-1-1M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7 4 4-7 7-4-4z"/><path d="M14 21l7-7-4-4-7 7 4 4z"/></>,
  mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  sortDesc: <><line x1="11" y1="5" x2="20" y2="5"/><line x1="11" y1="12" x2="17" y2="12"/><line x1="11" y1="19" x2="14" y2="19"/><polyline points="3 8 6 5 9 8"/><line x1="6" y1="5" x2="6" y2="19"/></>,
};

const Icon = ({name, size=18, stroke=1.7, color="currentColor", style={}}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{flexShrink:0, display:"inline-block", verticalAlign:"middle", ...style}}>
    {ICONS[name] || null}
  </svg>
);

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CATS = {
  Spiritual:  { color: C.text2,  icon: "moon" },
  Sport:      { color: C.green,  icon: "activity" },
  Business:   { color: C.gold,   icon: "briefcase" },
  Health:     { color: C.text2,  icon: "droplet" },
  Discipline: { color: C.red,    icon: "flame" },
};
const CAT_ALIAS = { Spirituality:"Spiritual", Fitness:"Sport", Work:"Business", Mind:"Discipline", Personal:"Discipline" };
const normCat = c => CAT_ALIAS[c] || (CATS[c] ? c : "Discipline");

// ─── PRIORITY ────────────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { label: "Haute",   color: C.red,    order: 1 },
  medium: { label: "Moyenne", color: C.orange, order: 2 },
  low:    { label: "Basse",   color: C.grey,   order: 3 },
};
const PRIO_ALIAS = { critique:"high", haute:"high", moyenne:"medium", basse:"low" };
const normPrio = p => PRIO_ALIAS[p] || (PRIORITY[p] ? p : "medium");

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
const DEFAULT_HABITS = [
  { id:"h1",  label:"Réveil Fajr",    cat:"Spiritual",  freq:"daily", nn:true  },
  { id:"h2",  label:"5 Prières",      cat:"Spiritual",  freq:"daily", nn:true  },
  { id:"h3",  label:"1 Verset",       cat:"Spiritual",  freq:"daily", nn:false },
  { id:"h4",  label:"Dhikr",          cat:"Spiritual",  freq:"daily", nn:false },
  { id:"h5",  label:"Gym",            cat:"Sport",      freq:"specific", days:[0,2,3], nn:false },
  { id:"h6",  label:"Boxe",           cat:"Sport",      freq:"specific", days:[1,4,6], nn:false },
  { id:"h7",  label:"Course",         cat:"Sport",      freq:"specific", days:[0,3,5], nn:false },
  { id:"h8",  label:"Work Deep 2h",   cat:"Business",   freq:"daily", nn:true  },
  { id:"h9",  label:"Prospection",    cat:"Business",   freq:"daily", nn:false },
  { id:"h10", label:"Cold Shower",    cat:"Health",     freq:"daily", nn:false },
  { id:"h11", label:"Hydratation 2L", cat:"Health",     freq:"daily", nn:false },
  { id:"h12", label:"Sommeil 7h+",    cat:"Health",     freq:"daily", nn:true  },
  { id:"h13", label:"No Music",       cat:"Discipline", freq:"daily", nn:false },
  { id:"h14", label:"30m Max Insta",  cat:"Discipline", freq:"daily", nn:false },
  { id:"h15", label:"Lecture 30min",  cat:"Discipline", freq:"daily", nn:false },
];

const SPORT_TYPES = ["Course","Gym","Boxe","Vélo","Natation","Yoga","Marche","Autre"];
const DAY_NAMES   = ["D","L","M","Me","J","V","S"];
const DAY_FULL    = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const parseDate = d => new Date(d + "T12:00");
const addDays = (d, n) => { const x = parseDate(d); x.setDate(x.getDate()+n); return x.toISOString().split("T")[0]; };
const diffDays = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
const fmtDate = d => parseDate(d).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fmtShort = d => parseDate(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?String(m%60).padStart(2,"0"):""}` : `${m}m`;
const lastN = n => Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(n-1-i)); return d.toISOString().split("T")[0]; });
const monthRange = (year, month) => {
  const days = new Date(year, month+1, 0).getDate();
  return Array.from({length:days},(_,i)=>`${year}-${String(month+1).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`);
};
// A habit is applicable on day `dk` iff:
//   • the day-of-week matches its frequency rule, AND
//   • dk >= its creation date (no backdating of newly added habits), AND
//   • dk falls inside one of its active ranges (if any — supports pause/resume).
// Habits without `createdAt` (seeded defaults / legacy) are treated as always existent.
// Habits without `activeRanges` are treated as always active since creation.
const isActiveOn = (h, dk) => {
  if (!h.activeRanges || !Array.isArray(h.activeRanges) || h.activeRanges.length === 0) return true;
  return h.activeRanges.some(r => dk >= r.from && (!r.to || dk <= r.to));
};
const isApplicable = (h, dk) => {
  const dow = parseDate(dk).getDay();
  const freqMatch = h.freq === "daily" || (h.freq === "specific" && (h.days || []).includes(dow));
  if (!freqMatch) return false;
  if (h.createdAt && dk < h.createdAt) return false; // no backdating
  if (!isActiveOn(h, dk)) return false;              // currently inactive on this date
  return true;
};
// Calculate sleep duration from wake & bed times (bed is previous evening)
const calcSleep = (bedTime, wakeTime) => {
  if (!bedTime || !wakeTime) return null;
  const [bh,bm] = bedTime.split(":").map(Number);
  const [wh,wm] = wakeTime.split(":").map(Number);
  let mins = (wh*60+wm) - (bh*60+bm);
  if (mins <= 0) mins += 24*60; // crossed midnight
  return Math.round((mins / 60) * 10) / 10;
};
// Heatmap color: smooth red → neutral → green
const heatColor = (pct, hasData) => {
  if (!hasData) return C.border;
  if (pct < 20)  return "#3d1a1f";
  if (pct < 40)  return "#5a2328";
  if (pct < 55)  return "#6b3a2e";
  if (pct < 70)  return "#5f4a2a";
  if (pct < 85)  return "#2d5a3e";
  if (pct < 95)  return "#1a7d52";
  return C.green;
};
const heatTextColor = pct => pct >= 85 ? "#00140a" : C.text2;

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
// Card: glass surface with subtle gradient + hairline border.
// `glow` adds a soft neon green halo for emphasis (hero cards, today score).
const Card = ({children,style={},glow=false,onClick,className=""}) => (
  <div onClick={onClick} className={`growth-card ${className}`} style={{
    background:C.card,
    border:`1px solid ${C.border}`,
    borderRadius:18,
    padding:16,
    backdropFilter:"blur(14px)",
    WebkitBackdropFilter:"blur(14px)",
    boxShadow: glow
      ? "0 0 0 1px rgba(34,211,160,0.10), 0 18px 48px -24px rgba(34,211,160,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 10px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
    transition:"border-color .2s, box-shadow .25s, transform .2s",
    ...style
  }}>{children}</div>
);

const Btn = ({children,onClick,variant="primary",style={},disabled=false,type="button"}) => {
  const styles = {
    primary: {background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,color:"#0a0a0a",fontWeight:700,boxShadow:"0 8px 24px -10px rgba(245,192,86,0.55), inset 0 1px 0 rgba(255,255,255,0.25)"},
    green:   {background:`linear-gradient(135deg, ${C.greenG}, ${C.green})`,color:"#002616",fontWeight:700,boxShadow:"0 8px 24px -10px rgba(34,211,160,0.5), inset 0 1px 0 rgba(255,255,255,0.25)"},
    ghost:   {background:C.cardS,color:C.text2,fontWeight:600,border:`1px solid ${C.border2}`},
    outline: {background:"transparent",color:C.text,fontWeight:600,border:`1px solid ${C.border2}`},
    danger:  {background:"rgba(229,72,77,.10)",color:C.red,fontWeight:600,border:`1px solid ${C.red}30`},
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{
    ...styles[variant],
    border:styles[variant].border||"none",
    borderRadius:12,padding:"10px 16px",fontSize:13,
    cursor:disabled?"not-allowed":"pointer",fontFamily:FONT,
    opacity:disabled?0.5:1,
    transition:"transform .12s cubic-bezier(.2,.8,.2,1), box-shadow .2s, filter .2s",
    display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,letterSpacing:-0.1,
    ...style
  }}>{children}</button>;
};

const FInput = ({label,value,onChange,type="text",placeholder="",style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:600,letterSpacing:0.4}}>{label}</span>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:FONT,...style}} />
  </div>
);

const FText = ({label,value,onChange,rows=2,placeholder=""}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:600,letterSpacing:0.4}}>{label}</span>}
    <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:FONT,resize:"vertical"}}/>
  </div>
);

const FSelect = ({label,value,onChange,options,style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:600,letterSpacing:0.4}}>{label}</span>}
    <select value={value} onChange={onChange} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:FONT,...style}}>
      {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const PBar = ({value,max=100,color=C.gold,h=5}) => (
  <div style={{background:C.border,borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,borderRadius:99,transition:"width .8s ease"}}/>
  </div>
);

const Badge = ({children,color,style={}}) => (
  <span style={{background:color+"18",color,border:`1px solid ${color}30`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:600,whiteSpace:"nowrap",letterSpacing:0.2,...style}}>{children}</span>
);

const IconBtn = ({name,onClick,title,color=C.text3,size=16,style={}}) => (
  <button onClick={onClick} title={title} style={{
    background:"none",border:"none",cursor:"pointer",padding:6,color,fontFamily:FONT,
    display:"inline-flex",alignItems:"center",justifyContent:"center",borderRadius:6,
    transition:"all .15s",...style
  }} onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background="none"}>
    <Icon name={name} size={size}/>
  </button>
);

const Modal = ({title,onClose,children,wide=false}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(2,4,8,0.74)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .18s ease-out"}} onClick={onClose}>
    <div style={{
      background:C.card,
      borderRadius:"24px 24px 0 0",
      padding:24,width:"100%",maxWidth:wide?780:640,maxHeight:"92vh",overflowY:"auto",
      border:`1px solid ${C.border2}`,borderBottom:"none",fontFamily:FONT,
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      boxShadow:"0 -24px 80px -20px rgba(0,0,0,0.7)",
      animation:"sheetUp .3s cubic-bezier(.2,.8,.2,1)",
    }} onClick={e=>e.stopPropagation()}>
      <div style={{width:38,height:4,borderRadius:99,background:C.border2,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontWeight:700,fontSize:18,letterSpacing:-0.3}}>{title}</span>
        <IconBtn name="x" onClick={onClose} size={18}/>
      </div>
      {children}
    </div>
  </div>
);

const Sparkline = ({data,color=C.gold,h=50}) => {
  if (!data||data.length<2) return <div style={{height:h,background:C.bg2,borderRadius:8}}/>;
  const max=Math.max(...data,1),min=Math.min(...data,0),range=max-min||1;
  const W=300,H=h;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*W},${H-((v-min)/range)*(H-6)-3}`).join(" ");
  const gid = "sg_"+color.replace("#","");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:"100%",height:h,overflow:"visible"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${gid})`} stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const FilterChip = ({children,active,onClick,color}) => (
  <button onClick={onClick} style={{
    padding:"6px 12px",borderRadius:20,border:`1px solid ${active?(color||C.gold):C.border2}`,
    background: active ? (color||C.gold)+"18" : "transparent",
    color: active ? (color||C.gold) : C.text3,
    fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT,display:"inline-flex",alignItems:"center",gap:6
  }}>{children}</button>
);

const navArrow = {
  width:34,height:34,borderRadius:10,border:`1px solid ${C.border2}`,
  background:C.card2,color:C.text2,cursor:"pointer",fontFamily:FONT,
  display:"flex",alignItems:"center",justifyContent:"center"
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({size=32}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <defs>
      <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#141b26"/>
        <stop offset="100%" stopColor="#080d14"/>
      </linearGradient>
      <linearGradient id="logo-gd" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#d4a73e"/>
        <stop offset="100%" stopColor="#f5c056"/>
      </linearGradient>
      <linearGradient id="logo-gn" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#0d9668"/>
        <stop offset="100%" stopColor="#10b981"/>
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="39" height="39" rx="10" fill="url(#logo-bg)" stroke="#2a3142"/>
    <rect x="9"  y="24" width="4" height="7"  rx="1.5" fill="url(#logo-gn)" opacity="0.85"/>
    <rect x="15" y="20" width="4" height="11" rx="1.5" fill="url(#logo-gn)"/>
    <rect x="21" y="14" width="4" height="17" rx="1.5" fill="url(#logo-gd)"/>
    <path d="M10 22 L17 16 L23 13 L30 8" stroke="#f5c056" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M27 8 L31 8 L31 12" stroke="#f5c056" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  {id:"today",   icon:"sun",          l:"Today"},
  {id:"tasks",   icon:"listCheck",    l:"Tasks"},
  {id:"analyse", icon:"bar",          l:"Analytics"},
  {id:"me",      icon:"user",         l:"Me"},
];

// ─── FOCUS TIMER (global, persistent) ────────────────────────────────────────
// Elapsed is derived from Date.now() - startTs so it is:
//   • correct after navigating between tabs (state lives at App root)
//   • correct after refresh / reopen (state restored from localStorage)
// The ticker only exists to force re-renders; it never accumulates state.
const TIMER_KEY = "growth.focusTimer.v1";
function useFocusTimer(setWorkSess) {
  const load = () => {
    try {
      const raw = localStorage.getItem(TIMER_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (!v || typeof v !== "object" || !v.running || !v.startTs) return null;
      return v;
    } catch { return null; }
  };
  const [state, setState] = useState(() => load() || {
    running:false, startTs:null, targetMin:0, selTask:"", focus:"",
  });
  const [, forceTick] = useState(0);

  // Persist every state change.
  useEffect(() => {
    try {
      if (state.running) localStorage.setItem(TIMER_KEY, JSON.stringify(state));
      else localStorage.removeItem(TIMER_KEY);
    } catch {/* ignore quota / private-mode errors */}
  }, [state]);

  // Tick (1s) only while running — advances the displayed elapsed.
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => forceTick(x => (x + 1) & 0xffff), 1000);
    return () => clearInterval(id);
  }, [state.running]);

  // Sync across tabs / windows.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== TIMER_KEY) return;
      const v = load();
      if (v) setState(v);
      else setState(s => ({...s, running:false, startTs:null}));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const elapsedSec = state.running && state.startTs
    ? Math.max(0, Math.floor((Date.now() - state.startTs) / 1000))
    : 0;

  const start = (targetMin = 0, opts = {}) => {
    setState({
      running:true,
      startTs: Date.now(),
      targetMin,
      selTask: opts.selTask ?? state.selTask ?? "",
      focus:   opts.focus   ?? state.focus   ?? "",
    });
  };

  const stop = (dateKey) => {
    if (!state.running || !state.startTs) {
      setState(s => ({...s, running:false, startTs:null, targetMin:0}));
      return 0;
    }
    const dur = Math.round((Date.now() - state.startTs) / 60000);
    if (dur > 0 && typeof setWorkSess === "function") {
      setWorkSess(prev => [...(prev||[]), {
        id: Date.now().toString(),
        date: dateKey,
        duration: dur,
        task: state.selTask || "",
        focus: state.focus || "",
      }]);
    }
    setState(s => ({...s, running:false, startTs:null, targetMin:0}));
    return dur;
  };

  const updateMeta = (patch) => setState(s => ({...s, ...patch}));

  // Auto-stop when a timed session reaches its target (checked on every tick).
  useEffect(() => {
    if (!state.running || !state.targetMin) return;
    if (elapsedSec >= state.targetMin * 60) stop(todayStr());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSec, state.running, state.targetMin]);

  return { state, elapsedSec, start, stop, updateMeta };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("today");
  const [habits,      setHabits,     h_rdy]  = useFS("habits",      DEFAULT_HABITS);
  const [completions, setComp,       c_rdy]  = useFS("completions", {});
  const [tasks,       setTasks,      t_rdy]  = useFS("tasks",       []);
  const [projects,    setProjects,   pr_rdy] = useFS("projects",    []);
  const [body,        setBody,       b_rdy]  = useFS("body",        {});
  const [workSess,    setWorkSess,   w_rdy]  = useFS("work",        []);
  const [journal,     setJournal,    j_rdy]  = useFS("journal",     {});
  const [profile,     setProfile,    p_rdy]  = useFS("profile",     {weight:"",age:"",goal:""});
  const [sportLog,    setSportLog,   sl_rdy] = useFS("sports",      []);
  const [goals,       setGoals,      g_rdy]  = useFS("goals",       []);
  const [activeDayKey,setActiveDayKey,adk_rdy]= useFS("activeDay",  todayStr());

  const ready = h_rdy && c_rdy && t_rdy && pr_rdy && b_rdy && w_rdy && j_rdy && p_rdy && sl_rdy && g_rdy && adk_rdy;

  const nHabits = useMemo(()=> (habits||[]).map(h => ({...h, cat: normCat(h.cat)})), [habits]);

  // Data cutoff — everything before this date is treated as "no data".
  // Prevents false-negative stats on days the app wasn't being used.
  const dataStartDate = profile?.dataStartDate || "";

  const score = useCallback((dk) => {
    // Before the data-cutoff → act as if the user simply wasn't tracking.
    if (dataStartDate && dk < dataStartDate) {
      return {pct:0,done:0,total:0,nnOk:true,nnDone:0,nnTotal:0};
    }
    const comp = completions[dk] || {};
    const applicable = nHabits.filter(h => isApplicable(h, dk));
    if (!applicable.length) return {pct:0,done:0,total:0,nnOk:true,nnDone:0,nnTotal:0};
    // ─── WEIGHTED SCORE (internal) ─────────────────────────────────────────────
    // Non-negotiables count double so that missing one drops the score harder
    // and completing one lifts it more. No cap — score is a free 0–100%.
    // UI-facing counts (done / total / nnDone / nnTotal) remain raw integers so
    // existing labels and rendering stay identical — the weighting is purely
    // internal to the percentage.
    const weightOf = h => h.nn ? 2 : 1;
    const totalWeight = applicable.reduce((s,h) => s + weightOf(h), 0);
    const doneWeight  = applicable.reduce((s,h) => s + (comp[h.id] ? weightOf(h) : 0), 0);
    const pct = totalWeight ? Math.round((doneWeight / totalWeight) * 100) : 0;
    // Raw counts kept for UI compatibility (badges, "x/y" strings, NN hero card).
    const done = applicable.filter(h=>comp[h.id]).length;
    const nn = applicable.filter(h=>h.nn);
    const nnDone = nn.filter(h=>comp[h.id]).length;
    const nnBroken = nn.length > 0 && nnDone < nn.length;
    return {pct,done,total:applicable.length,nnOk:!nnBroken,nnDone,nnTotal:nn.length};
  }, [nHabits, completions, dataStartDate]);

  const habitRate = useCallback((habit, windowDays=30, endKey=todayStr()) => {
    const id = habit.id;
    const firstDates = Object.keys(completions).filter(dk => completions[dk]?.[id]).sort();
    if (!firstDates.length) return {rate:0,done:0,total:0,firstSeen:null};
    const first = firstDates[0];
    const windowStart = addDays(endKey, -(windowDays-1));
    const start = first > windowStart ? first : windowStart;
    const totalDaysInRange = diffDays(start, endKey) + 1;
    let applicable = 0, done = 0;
    for (let i = 0; i < totalDaysInRange; i++) {
      const dk = addDays(start, i);
      if (!isApplicable(habit, dk)) continue;
      applicable++;
      if (completions[dk]?.[id]) done++;
    }
    const rate = applicable ? Math.round((done / applicable) * 100) : 0;
    return {rate, done, total:applicable, firstSeen:first};
  }, [completions]);

  // Rate for an explicit date-range (any month or custom span).
  // Only counts days where the habit existed (>= firstSeen).
  const habitRateRange = useCallback((habit, dayKeys) => {
    const id = habit.id;
    const firstDates = Object.keys(completions).filter(dk => completions[dk]?.[id]).sort();
    const firstSeen = firstDates[0] || null;
    if (!firstSeen || !dayKeys.length) return {rate:0,done:0,total:0,firstSeen};
    let applicable = 0, done = 0;
    for (const dk of dayKeys) {
      if (dk < firstSeen) continue;
      if (!isApplicable(habit, dk)) continue;
      applicable++;
      if (completions[dk]?.[id]) done++;
    }
    const rate = applicable ? Math.round((done / applicable) * 100) : 0;
    return {rate, done, total:applicable, firstSeen};
  }, [completions]);

  const toggle = useCallback((id, dk) => {
    const k = dk || activeDayKey;
    setComp(prev => ({...prev, [k]: {...(prev[k]||{}), [id]: !(prev[k]||{})[id]}}));
  }, [activeDayKey, setComp]);

  // Global focus timer — persists across tab navigation AND refresh (localStorage-backed).
  const focusTimer = useFocusTimer(setWorkSess);

  if (!ready) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,fontFamily:FONT}}>
      <Logo size={48}/>
      <div style={{color:C.text3,fontSize:11,letterSpacing:3,fontWeight:700,marginTop:4}}>GROWTH</div>
      <div style={{width:24,height:24,border:`2px solid ${C.gold}`,borderTopColor:"transparent",borderRadius:"50%",animation:"sp 1s linear infinite"}}/>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const todayScore = score(activeDayKey);

  const shared = {
    habits:nHabits, setHabits, completions, setComp, toggle, score, habitRate, habitRateRange,
    tasks, setTasks, projects, setProjects, body, setBody,
    workSess, setWorkSess, journal, setJournal, profile, setProfile,
    sportLog, setSportLog, goals, setGoals,
    activeDayKey, setActiveDayKey, setTab,
    focusTimer,
  };

  return (
    <div className="growth-app">
      <aside className="growth-side">
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 8px 22px"}}>
          <Logo size={32}/>
          <div style={{fontWeight:800,fontSize:19,letterSpacing:-0.6,color:C.text}}>Growth</div>
        </div>
        {TABS.map(t=>{
          const on = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} className="growth-side-tab" style={{
              background: on ? `linear-gradient(90deg, ${C.green}14, transparent 80%)` : "transparent",
              color: on ? C.green : C.text2,
              boxShadow: on ? `inset 2px 0 0 ${C.green}` : "inset 2px 0 0 transparent",
            }}>
              <Icon name={t.icon} size={17}/>
              <span style={{fontSize:13,fontWeight:on?600:500,letterSpacing:-0.1}}>{t.l}</span>
            </button>
          );
        })}
        <div style={{flex:1}}/>
        <div style={{padding:"14px 12px",fontSize:11,color:C.text4,borderTop:`1px solid ${C.border}`,marginTop:8}}>
          <div style={{marginBottom:6,fontWeight:600,letterSpacing:0.6,textTransform:"uppercase",fontSize:10,color:C.text3}}>Score du jour</div>
          <div style={{fontSize:28,fontWeight:800,color:todayScore.nnOk?C.green:C.red,letterSpacing:-0.6,textShadow:todayScore.nnOk?`0 0 24px ${C.green}55`:"none"}}>{todayScore.pct}%</div>
          <div style={{fontSize:11,color:C.text3,marginTop:2,fontWeight:500}}>{todayScore.done}/{todayScore.total} complétés</div>
        </div>
      </aside>

      <div className="growth-column">
        <header className="growth-header">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Logo size={28}/>
            <div style={{fontWeight:800,fontSize:17,letterSpacing:-0.5}}>Growth</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:800,color:todayScore.nnOk?C.green:C.red,lineHeight:1,letterSpacing:-0.6,textShadow:todayScore.nnOk?`0 0 16px ${C.green}44`:"none"}}>{todayScore.pct}%</div>
            <div style={{fontSize:10,color:C.text4,marginTop:3,fontWeight:500,letterSpacing:0.3}}>{todayScore.done}/{todayScore.total} aujourd'hui</div>
          </div>
        </header>

        <main className="growth-main">
          {tab==="today"   && <TodayTab {...shared}/>}
          {tab==="tasks"   && <TasksTab {...shared}/>}
          {tab==="analyse" && <AnalyseTab {...shared}/>}
          {tab==="me"      && <MeTab {...shared}/>}
        </main>

        <nav className="growth-bottom" aria-label="Navigation principale">
          <div className="growth-bottom-inner">
            {TABS.map(t=>{
              const on = tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} className={`growth-bottom-tab ${on?"on":""}`} aria-current={on?"page":undefined}>
                  <span className="growth-bottom-tab-icon"><Icon name={t.icon} size={19}/></span>
                  <span className="growth-bottom-tab-label">{t.l}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Global floating AI assistant — available on every page */}
      <FloatingAgent {...shared}/>

      <style>{`
        *{box-sizing:border-box}
        html,body{margin:0;background:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
        body{
          background:
            radial-gradient(1200px 600px at 100% -10%, rgba(34,211,160,0.06), transparent 60%),
            radial-gradient(900px 500px at -10% 110%, rgba(245,192,86,0.05), transparent 55%),
            ${C.bg};
          background-attachment:fixed;
        }
        input,select,textarea,button{font-family:${FONT}}
        ::selection{background:${C.green}33;color:${C.text}}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:${C.text4}}
        input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:99px;outline:none;background:${C.border2}}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;background:${C.green};box-shadow:0 0 0 4px ${C.green}22}
        input[type=date],input[type=time]{color-scheme:dark}
        input:focus,select:focus,textarea:focus{border-color:${C.green}!important;box-shadow:0 0 0 3px ${C.green}1a}
        button{transition:transform .12s cubic-bezier(.2,.8,.2,1), filter .2s, box-shadow .2s}
        button:hover:not(:disabled){filter:brightness(1.06)}
        button:active:not(:disabled){transform:translateY(0.5px) scale(0.99)}

        .growth-app{min-height:100vh;background:transparent;color:${C.text};font-family:${FONT};display:flex;letter-spacing:-0.1px}
        .growth-side{
          display:none;width:220px;flex-direction:column;padding:18px 12px;
          border-right:1px solid ${C.border};
          position:sticky;top:0;height:100vh;
          background:linear-gradient(180deg, rgba(34,211,160,0.02), transparent 40%);
          backdrop-filter:blur(14px);
        }
        .growth-side-tab{
          display:flex;align-items:center;gap:12px;
          padding:11px 14px;margin-bottom:4px;
          border:none;background:none;cursor:pointer;border-radius:12px;
          text-align:left;font-family:${FONT};
          transition:background .2s, color .2s;
        }
        .growth-side-tab:hover{background:${C.border}!important}
        .growth-column{flex:1;display:flex;flex-direction:column;min-width:0;max-width:100%}
        .growth-header{
          padding:14px 18px 12px;
          display:flex;align-items:center;justify-content:space-between;
          position:sticky;top:0;z-index:100;
          background:rgba(5,7,11,0.72);
          backdrop-filter:saturate(180%) blur(14px);
          -webkit-backdrop-filter:saturate(180%) blur(14px);
          border-bottom:1px solid ${C.border};
        }
        .growth-main{flex:1;padding:20px 16px 96px;overflow-y:auto;max-width:920px;width:100%;margin:0 auto}
        @media (min-width:520px){.growth-main{padding:24px 22px 96px}}

        /* Floating bottom nav — glassy, pill-shaped, safe-area aware */
        .growth-bottom{
          position:fixed;left:0;right:0;bottom:0;z-index:100;
          padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));
          pointer-events:none;
        }
        .growth-bottom-inner{
          pointer-events:auto;
          display:flex;justify-content:space-around;align-items:center;gap:4px;
          max-width:520px;margin:0 auto;
          background:rgba(12,15,22,0.72);
          border:1px solid ${C.border2};
          border-radius:22px;padding:7px 8px;
          backdrop-filter:saturate(180%) blur(20px);
          -webkit-backdrop-filter:saturate(180%) blur(20px);
          box-shadow:0 18px 40px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .growth-bottom-tab{
          flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
          padding:8px 6px 6px;background:none;border:none;cursor:pointer;
          color:${C.text3};font-family:${FONT};
          border-radius:16px;position:relative;
          transition:color .2s, background .2s, transform .12s;
        }
        .growth-bottom-tab-icon{
          display:inline-flex;align-items:center;justify-content:center;
          width:34px;height:26px;border-radius:10px;
          transition:background .2s, box-shadow .25s;
        }
        .growth-bottom-tab-label{
          font-size:10px;font-weight:600;letter-spacing:0.2px;
        }
        .growth-bottom-tab.on{color:${C.green}}
        .growth-bottom-tab.on .growth-bottom-tab-icon{
          background:${C.green}1a;
          box-shadow:0 0 0 1px ${C.green}30, 0 6px 16px -6px ${C.green}66;
        }
        .growth-bottom-tab:active{transform:scale(.94)}

        @media (min-width: 980px) {
          .growth-side{display:flex}
          .growth-header{display:none}
          .growth-bottom{display:none}
          .growth-main{padding:28px 32px}
        }

        /* Cards: hover lift on interactive surfaces (opt-in via .lift) */
        .growth-card.lift:hover{transform:translateY(-1px);border-color:${C.border2}}

        /* Sleep — always two equal columns for Réveil / Coucher, no overflow */
        .sleep-times{display:grid;gap:10px;grid-template-columns:1fr 1fr;min-width:0}
        .sleep-times .sleep-cell{min-width:0}
        .sleep-times input[type="time"]{max-width:100%}
        @media (max-width: 360px){
          .sleep-reset-label{display:none}
        }

        /* Animations */
        @keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(229,72,77,.55)}70%{box-shadow:0 0 0 12px rgba(229,72,77,0)}100%{box-shadow:0 0 0 0 rgba(229,72,77,0)}}
        @keyframes agentSlideUp{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes popIn{from{opacity:0;transform:translateY(-4px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes sheetUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 ${C.green}00}50%{box-shadow:0 0 24px 2px ${C.green}33}}

        /* Floating AI assistant */
        .growth-fab{
          position:fixed; right:24px; bottom:24px; z-index:60;
          width:56px; height:56px; border-radius:50%;
          background:linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%);
          color:${C.bg}; border:none; cursor:pointer;
          box-shadow:0 14px 36px -10px rgba(245,192,86,.5), 0 0 0 4px rgba(245,192,86,0.08);
          display:flex; align-items:center; justify-content:center;
          transition:transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s;
        }
        .growth-fab:hover{ transform:translateY(-2px) scale(1.04); box-shadow:0 18px 44px -10px rgba(245,192,86,.6), 0 0 0 5px rgba(245,192,86,0.10); }
        .growth-fab:active{ transform:translateY(0) scale(.97); }
        .growth-agent-panel{
          position:fixed; right:24px; bottom:24px; z-index:60;
          width:min(420px, calc(100vw - 32px));
          height:min(640px, calc(100vh - 48px));
          background:${C.card}; border:1px solid ${C.border2};
          border-radius:22px; overflow:hidden;
          box-shadow:0 32px 80px rgba(0,0,0,.72), 0 10px 24px rgba(0,0,0,.4), 0 0 0 1px rgba(245,192,86,.04);
          display:flex; flex-direction:column;
          backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
        }
        @media (max-width: 900px){
          .growth-fab{ right:16px; bottom:calc(84px + env(safe-area-inset-bottom,0px)); width:52px; height:52px; }
          .growth-agent-panel{
            right:10px; left:10px; bottom:calc(84px + env(safe-area-inset-bottom,0px));
            width:auto; height:min(76vh, 620px);
            border-radius:20px;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce){
          *,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY
// ═══════════════════════════════════════════════════════════════════════════════
function TodayTab({habits,completions,toggle,activeDayKey,setActiveDayKey,score,body,setBody,journal,setJournal,tasks,setTasks,workSess}) {
  const [viewDay, setViewDay] = useState(activeDayKey);
  useEffect(()=>{ setViewDay(activeDayKey); }, [activeDayKey]);

  const [closeModal, setCloseModal] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [win, setWin] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const dayBody = body[viewDay] || {};
  // Sleep on day N = bedTime stored on day N-1 (previous evening) + wakeTime on day N (this morning).
  const prevDayKey = addDays(viewDay, -1);
  const prevBody   = body[prevDayKey] || {};
  const nightBedTime = prevBody.bedTime || "";
  // Live computed duration (does not rely on stored sleep field).
  const computedSleep = calcSleep(nightBedTime, dayBody.wakeTime);
  const isActive = viewDay === activeDayKey;
  const isFuture = viewDay > todayStr();
  const todayComp = completions[viewDay] || {};
  const sc = score(viewDay);
  const workMin = workSess.filter(s=>s.date===viewDay).reduce((a,b)=>a+(b.duration||0),0);
  // Today bucket = explicit "add to today" (todayFor) OR naturally due (scheduledFor).
  // todayFor is set by the "Add to today" action and never mutates the due date.
  const dayTasks = tasks.filter(t => t.todayFor === viewDay || t.scheduledFor === viewDay);

  const byCategory = habits.reduce((acc,h) => {
    if (!isApplicable(h, viewDay)) return acc;
    (acc[h.cat] = acc[h.cat]||[]).push(h);
    return acc;
  },{});

  const relativeLabel = () => {
    const today = todayStr();
    if (viewDay === today) return "Aujourd'hui";
    const d = diffDays(viewDay, today);
    if (d === 1) return "Hier";
    if (d === -1) return "Demain";
    if (d > 0) return `Il y a ${d} jours`;
    return `Dans ${-d} jours`;
  };

  const updateBody = (patch) => setBody(prev => ({
    ...prev,
    [viewDay]: {...(prev[viewDay]||{}), ...patch}
  }));

  // Correct sleep model: sleep belongs to day N (wake day) and is derived from
  // body[N-1].bedTime + body[N].wakeTime. Bedtime set on day X affects day X+1's sleep.
  const handleSetWake = (v) => {
    const sleep = calcSleep(nightBedTime, v);
    setBody(prev => {
      const cur = prev[viewDay] || {};
      return {...prev, [viewDay]: {...cur, wakeTime: v, sleep: sleep}};
    });
  };
  const handleSetBed = (v) => {
    const nextKey = addDays(viewDay, 1);
    setBody(prev => {
      const cur  = prev[viewDay] || {};
      const next = prev[nextKey] || {};
      const nextSleep = calcSleep(v, next.wakeTime);
      return {
        ...prev,
        [viewDay]: {...cur,  bedTime: v},
        [nextKey]: {...next, sleep: nextSleep},
      };
    });
  };
  const handleResetSleep = () => {
    const nextKey = addDays(viewDay, 1);
    setBody(prev => {
      const cur  = prev[viewDay] || {};
      const next = prev[nextKey] || {};
      // Clearing day N's bedTime must also invalidate day N+1's sleep (which depended on it).
      const nextSleep = calcSleep("", next.wakeTime);
      return {
        ...prev,
        [viewDay]: {...cur,  bedTime: "", wakeTime: "", sleep: null},
        [nextKey]: {...next, sleep: nextSleep},
      };
    });
  };

  const handleClose = () => {
    if (gratitude || win)
      setJournal(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),gratitude,win}}));
    const next = addDays(activeDayKey, 1);
    setActiveDayKey(next);
    setCloseModal(false);
    setGratitude(""); setWin("");
  };

  const toggleCat = c => setCollapsed(p => ({...p, [c]: !p[c]}));
  const toggleTask = (id) => setTasks(p => (p||[]).map(t => t.id===id ? {...t, done:!t.done} : t));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      {/* Date nav */}
      <Card style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <button onClick={()=>setViewDay(addDays(viewDay,-1))} style={navArrow}><Icon name="chevL" size={18}/></button>
          <div style={{textAlign:"center",flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:17,lineHeight:1.1,textTransform:"capitalize",letterSpacing:-0.3}}>{relativeLabel()}</div>
            <div style={{fontSize:11,color:C.text3,marginTop:3,textTransform:"capitalize"}}>{fmtDate(viewDay)}</div>
          </div>
          <button onClick={()=>setViewDay(addDays(viewDay,1))} style={{...navArrow,opacity:isFuture?0.4:1}} disabled={isFuture}><Icon name="chevR" size={18}/></button>
        </div>
        {!isActive && (
          <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
            <Btn onClick={()=>setViewDay(activeDayKey)} variant="outline" style={{padding:"6px 12px",fontSize:12}}>
              <Icon name="rotate" size={14}/> Revenir au jour actif
            </Btn>
          </div>
        )}
      </Card>

      {/* Sleep — Réveil left / Coucher right, stable 2-col grid, Durée row below.
          Sleep = previous day's bedtime + this day's wakeup. */}
      <Card style={{padding:16,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:0.8,display:"flex",alignItems:"center",gap:7,textTransform:"uppercase",minWidth:0}}>
            <div style={{width:24,height:24,borderRadius:7,background:C.green+"14",border:`1px solid ${C.green}26`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="moon" size={12} color={C.green}/>
            </div>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Sommeil</span>
          </div>
          {(dayBody.bedTime || dayBody.wakeTime || dayBody.sleep != null || computedSleep != null) && (
            <button
              onClick={handleResetSleep}
              title="Réinitialiser le sommeil"
              aria-label="Réinitialiser le sommeil"
              style={{
                display:"inline-flex",alignItems:"center",gap:5,flexShrink:0,
                padding:"5px 10px",borderRadius:999,
                background:"transparent",border:`1px solid ${C.border2}`,
                color:C.text3,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:FONT,
                transition:"all .15s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red+"50";e.currentTarget.style.color=C.red;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.text3;}}>
              <Icon name="rotate" size={12}/> <span className="sleep-reset-label">Réinitialiser</span>
            </button>
          )}
        </div>
        {/* Times row — always 2 equal columns, no overflow */}
        <div className="sleep-times">
          {/* Réveil — LEFT (this morning's wake) */}
          <div className="sleep-cell">
            <div style={{fontSize:10,color:C.text4,fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:4,letterSpacing:0.3,textTransform:"uppercase"}}>
              <Icon name="sunrise" size={11} color={C.gold}/> Réveil
            </div>
            <input type="time" value={dayBody.wakeTime||""} onChange={e=>handleSetWake(e.target.value)}
              style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 12px",fontSize:13,outline:"none",fontFamily:FONT,width:"100%",minWidth:0,fontWeight:600,letterSpacing:-0.2,boxSizing:"border-box"}}/>
          </div>
          {/* Coucher — RIGHT (tonight's bedtime → feeds tomorrow's sleep) */}
          <div className="sleep-cell">
            <div style={{fontSize:10,color:C.text4,fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:4,letterSpacing:0.3,textTransform:"uppercase"}}>
              <Icon name="bed" size={11} color={C.green}/> Coucher
            </div>
            <input type="time" value={dayBody.bedTime||""} onChange={e=>handleSetBed(e.target.value)}
              style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 12px",fontSize:13,outline:"none",fontFamily:FONT,width:"100%",minWidth:0,fontWeight:600,letterSpacing:-0.2,boxSizing:"border-box"}}/>
          </div>
        </div>
        {/* Durée row — full width, computed live from previous bedtime + this wake */}
        <div style={{
          marginTop:10,
          background: computedSleep ? `linear-gradient(135deg, ${C.green}12, ${C.green}04)` : C.bg2,
          border: `1px solid ${computedSleep ? C.green+"30" : C.border2}`,
          borderRadius:10,padding:"10px 14px",
          display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,
          transition:"all .25s",minWidth:0,
        }}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:10,color:C.text4,fontWeight:600,letterSpacing:0.3,textTransform:"uppercase"}}>Durée</div>
            <div style={{fontSize:22,fontWeight:800,color:computedSleep?C.green:C.text4,letterSpacing:-0.7,lineHeight:1.1,marginTop:2,textShadow:computedSleep?`0 0 16px ${C.green}44`:"none"}}>
              {computedSleep ? `${computedSleep}h` : "—"}
            </div>
            {!computedSleep && !nightBedTime && (
              <div style={{fontSize:10,color:C.text4,fontWeight:500,marginTop:3}}>
                Pas de coucher enregistré hier
              </div>
            )}
          </div>
          {computedSleep != null && (
            <div style={{
              fontSize:10,fontWeight:700,letterSpacing:0.4,textTransform:"uppercase",flexShrink:0,
              color: computedSleep >= 7.5 ? C.green : computedSleep >= 6 ? C.gold : C.red,
              padding:"3px 8px",borderRadius:999,
              background: (computedSleep >= 7.5 ? C.green : computedSleep >= 6 ? C.gold : C.red) + "18",
            }}>
              {computedSleep >= 7.5 ? "Optimal" : computedSleep >= 6 ? "OK" : "Dette"}
            </div>
          )}
        </div>
      </Card>

      {/* Score stats — hero metric cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card glow={sc.nnOk} style={{padding:16,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:sc.nnOk?`radial-gradient(circle at 50% 120%, ${C.green}1c, transparent 60%)`:`radial-gradient(circle at 50% 120%, ${C.red}22, transparent 60%)`,pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:34,fontWeight:800,color:sc.nnOk?C.green:C.red,lineHeight:1,letterSpacing:-1.2,textShadow:sc.nnOk?`0 0 22px ${C.green}55`:"none"}}>{sc.pct}<span style={{fontSize:20,fontWeight:700,opacity:.6}}>%</span></div>
            <div style={{fontSize:10,color:C.text3,fontWeight:700,letterSpacing:0.8,marginTop:8,textTransform:"uppercase"}}>Score · {sc.done}/{sc.total}</div>
          </div>
        </Card>
        <Card style={{padding:16,textAlign:"center",border:`1px solid ${sc.nnOk?C.border:C.red+"40"}`,position:"relative",overflow:"hidden"}}>
          {!sc.nnOk && <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 120%, ${C.red}22, transparent 60%)`,pointerEvents:"none"}}/>}
          <div style={{position:"relative"}}>
            <div style={{fontSize:34,fontWeight:800,color:sc.nnOk?C.gold:C.red,lineHeight:1,letterSpacing:-1.2}}>{sc.nnDone}<span style={{opacity:.35,fontWeight:700}}>/{sc.nnTotal}</span></div>
            <div style={{fontSize:10,color:C.text3,fontWeight:700,letterSpacing:0.8,marginTop:8,textTransform:"uppercase"}}>Non-négociables</div>
          </div>
        </Card>
      </div>

      {!sc.nnOk && (
        <div style={{background:"rgba(229,72,77,0.08)",border:`1px solid ${C.red}30`,borderRadius:12,padding:"10px 14px",fontSize:12,color:C.red,fontWeight:500,display:"flex",alignItems:"center",gap:8}}>
          <Icon name="alert" size={14}/> Standard brisé — score plafonné à 70%
        </div>
      )}

      {workMin > 0 && (
        <Card style={{padding:12,textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:700,color:C.gold,letterSpacing:-0.4}}>{fmtMin(workMin)}</div>
          <div style={{fontSize:10,color:C.text4,fontWeight:500,marginTop:2}}>Focus aujourd'hui</div>
        </Card>
      )}

      {/* Today's tasks */}
      {dayTasks.length > 0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:0.8,marginBottom:12,display:"flex",alignItems:"center",gap:6,textTransform:"uppercase"}}>
            <Icon name="listCheck" size={12}/> Tâches du jour · {dayTasks.filter(t=>!t.done).length}/{dayTasks.length}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {dayTasks.map(t => {
              const prio = normPrio(t.priority||t.urgency);
              const p = PRIORITY[prio];
              // Consistent with TasksTab: red/orange/grey left accent for all 3 levels.
              const accent = prio === "high" ? C.red : prio === "medium" ? C.orange : C.grey + "66";
              return (
                <button key={t.id} onClick={()=>toggleTask(t.id)} style={{
                  display:"flex",alignItems:"center",gap:11,padding:"11px 13px",
                  background: t.done ? C.bg2 : C.card2,
                  border:`1px solid ${t.done ? C.border : C.border2}`,
                  borderLeft: t.done ? `1px solid ${C.border}` : `3px solid ${accent}`,
                  paddingLeft: t.done ? 13 : 11,
                  borderRadius:12,cursor:"pointer",color:C.text,fontFamily:FONT,textAlign:"left",
                  transition:"border-color .2s, background .2s, transform .12s",
                }}>
                  <div style={{
                    width:19,height:19,borderRadius:6,
                    border:`1.5px solid ${t.done?C.green:C.border2}`,
                    background:t.done?C.green:"transparent",
                    flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow: t.done?`0 0 0 3px ${C.green}22`:"none",transition:"all .2s"
                  }}>
                    {t.done && <Icon name="check" size={11} color="#002616" stroke={3}/>}
                  </div>
                  <span style={{flex:1,fontSize:13,fontWeight:500,textDecoration:t.done?"line-through":"none",color:t.done?C.text3:C.text,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</span>
                  {/* Importance dot + tiny label — same visual language as the Tasks page */}
                  {!t.done && prio !== "low" && (
                    <span title={`Importance ${p.label.toLowerCase()}`} style={{
                      width:6,height:6,borderRadius:"50%",background:p.color,flexShrink:0,
                      boxShadow:`0 0 0 3px ${p.color}22`,
                    }}/>
                  )}
                  {t.project && <span style={{fontSize:10,color:C.text3,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,flexShrink:0}}><span style={{width:4,height:4,borderRadius:"50%",background:C.gold}}/>{t.project}</span>}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Habit categories — premium collapsible sections */}
      {Object.entries(byCategory).map(([cat,hs])=>{
        const c = CATS[cat]||{color:C.text3,icon:"check"};
        const doneCount = hs.filter(h=>todayComp[h.id]).length;
        const isCollapsed = !!collapsed[cat];
        const pct = hs.length ? Math.round((doneCount/hs.length)*100) : 0;
        return (
          <Card key={cat} style={{padding:16,overflow:"hidden"}}>
            <button onClick={()=>toggleCat(cat)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",color:C.text,fontFamily:FONT,marginBottom:isCollapsed?0:14}}>
              <div style={{display:"flex",alignItems:"center",gap:11,minWidth:0}}>
                <div style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:c.color+"14",border:`1px solid ${c.color}26`,flexShrink:0}}>
                  <Icon name={c.icon} size={15} color={c.color}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:c.color,letterSpacing:0.7,textTransform:"uppercase"}}>{cat}</span>
                  <span style={{fontSize:11,color:C.text3,fontWeight:500}}>{doneCount}/{hs.length} · {pct}%</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {/* mini progress ring */}
                <div style={{width:40,height:6,borderRadius:99,background:C.border,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:c.color,transition:"width .5s cubic-bezier(.2,.8,.2,1)",boxShadow:`0 0 8px ${c.color}66`}}/>
                </div>
                <Icon name="chevD" size={14} color={C.text3} style={{transform:isCollapsed?"rotate(-90deg)":"none",transition:"transform .25s cubic-bezier(.2,.8,.2,1)"}}/>
              </div>
            </button>
            {!isCollapsed && (
              <div style={{display:"flex",flexDirection:"column",gap:7,animation:"fadeIn .25s cubic-bezier(.2,.8,.2,1)"}}>
                {hs.map(h=>{
                  const checked = !!todayComp[h.id];
                  return (
                    <button key={h.id} onClick={()=>toggle(h.id, viewDay)} style={{
                      display:"flex",alignItems:"center",gap:12,padding:"12px 13px",
                      background: checked?c.color+"14":C.card2,
                      border:`1px solid ${checked?c.color+"40":C.border}`,
                      borderRadius:12,cursor:"pointer",color:C.text,
                      transition:"background .2s, border-color .2s, transform .12s",
                      textAlign:"left",fontFamily:FONT,
                      boxShadow: checked ? `0 0 0 3px ${c.color}10` : "none",
                    }}>
                      <div style={{
                        width:20,height:20,borderRadius:6,
                        border:`1.5px solid ${checked?c.color:C.border2}`,
                        background:checked?c.color:"transparent",
                        flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                        transition:"all .2s",
                      }}>
                        {checked && <Icon name="check" size={12} color="#001a10" stroke={3}/>}
                      </div>
                      <span style={{flex:1,fontSize:14,fontWeight:500,textDecoration:checked?"line-through":"none",color:checked?C.text3:C.text}}>{h.label}</span>
                      {h.nn && <Badge color={C.red}>NN</Badge>}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {isActive && (
        <button onClick={()=>setCloseModal(true)} style={{background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,color:"#0a0a0a",border:"none",borderRadius:14,padding:"15px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:4,fontFamily:FONT,boxShadow:"0 8px 24px -10px rgba(245,192,86,0.35)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:-0.2}}>
          <Icon name="moon" size={15}/> Clôturer ma journée
        </button>
      )}

      {closeModal && (
        <Modal title="Clôture de journée" onClose={()=>setCloseModal(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:C.bg2,borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:12,color:C.text3,marginBottom:4,fontWeight:500}}>Score du jour</div>
              <div style={{fontSize:40,fontWeight:800,color:sc.nnOk?C.gold:C.red,letterSpacing:-1.5}}>{sc.pct}%</div>
              {dayBody.sleep && <div style={{fontSize:12,color:C.text3,marginTop:6}}>Sommeil: <b style={{color:C.green}}>{dayBody.sleep}h</b></div>}
            </div>
            <FText label="GRATITUDES" value={gratitude} onChange={e=>setGratitude(e.target.value)} placeholder="Je suis reconnaissant pour..."/>
            <FInput label="VICTOIRE DU JOUR" value={win} onChange={e=>setWin(e.target.value)} placeholder="Ma plus grande victoire..."/>
            <Btn onClick={handleClose} style={{width:"100%",padding:"14px",fontSize:14}}>Confirmer & ouvrir demain →</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════
function TasksTab({tasks,setTasks,projects,setProjects}) {
  const [form, setForm] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [projectForm, setProjectForm] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  // Default sort: IMPORTANCE (high → medium → low) per product spec.
  const [sortBy, setSortBy] = useState("priority"); // priority | project | date_asc | date_desc | due
  const [sortOpen, setSortOpen] = useState(false);

  const empty = {title:"",priority:"medium",project:"",scheduledFor:"",notes:""};
  const [d, setD] = useState(empty);

  const save = () => {
    if (!d.title.trim()) return;
    if (editTask) {
      setTasks(p => p.map(t => t.id === editTask.id ? {...t, ...d, priority:normPrio(d.priority)} : t));
    } else {
      setTasks(p => [...(p||[]), {...d, id:Date.now().toString(), done:false, createdAt:todayStr(), priority:normPrio(d.priority)}]);
    }
    setForm(null); setEditTask(null); setD(empty);
  };

  // TOGGLE: clicking always flips whether this task is pinned to today.
  // Never touches `scheduledFor` (due date) or any other field — only `todayFor`.
  // When already in today for today's date → clear it. Otherwise → pin to today.
  const toggleTaskToday = (id) => {
    const t0 = todayStr();
    setTasks(p => (p||[]).map(t => {
      if (t.id !== id) return t;
      const pinned = t.todayFor === t0;
      return {...t, todayFor: pinned ? "" : t0};
    }));
  };
  // Backwards-compat alias for older call-sites.
  const assignToToday = toggleTaskToday;

  const addProject = () => {
    const v = newProject.trim();
    if (!v) return;
    setProjects(p => [...new Set([...(p||[]), v])]);
    setNewProject(""); setProjectForm(false);
  };

  const removeProject = name => {
    setProjects(p => (p||[]).filter(x => x !== name));
    setTasks(p => (p||[]).map(t => t.project === name ? {...t, project:""} : t));
  };

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const allProjects = [...new Set([...(projects||[]), ...tasks.map(t => t.project).filter(Boolean)])];

  let displayed = showDone ? done : active;
  if (filter !== "all") displayed = displayed.filter(t => t.project === filter);

  const FAR = "9999-12-31";
  // Creation-order key: `id` is Date.now().toString() → deterministic timestamp.
  // Falls back to createdAt (date-only on old tasks) if id isn't numeric.
  const createdKey = (t) => {
    const n = Number(t.id);
    if (!Number.isNaN(n) && n > 0) return n;
    return Date.parse(t.createdAt || "") || 0;
  };
  displayed = [...displayed].sort((a,b)=>{
    if (sortBy === "priority") {
      const pa = PRIORITY[normPrio(a.priority||a.urgency)].order;
      const pb = PRIORITY[normPrio(b.priority||b.urgency)].order;
      if (pa !== pb) return pa - pb;
      return createdKey(b) - createdKey(a);
    }
    // Date sorts = CREATION DATE ONLY
    if (sortBy === "date_asc")  return createdKey(a) - createdKey(b); // oldest first
    if (sortBy === "date_desc") return createdKey(b) - createdKey(a); // newest first
    // Échéance = closest due date first, undated pushed to the end
    if (sortBy === "due")       return (a.scheduledFor||FAR).localeCompare(b.scheduledFor||FAR);
    // project: priority then creation order inside each group
    const pa = PRIORITY[normPrio(a.priority||a.urgency)].order;
    const pb = PRIORITY[normPrio(b.priority||b.urgency)].order;
    if (pa !== pb) return pa - pb;
    return createdKey(b) - createdKey(a);
  });

  const byProject = sortBy === "project" && filter === "all" && !showDone
    ? displayed.reduce((acc,t)=>{ const k = t.project||"Sans projet"; (acc[k]=acc[k]||[]).push(t); return acc; }, {})
    : null;

  const SORTS = [
    {id:"project",   label:"Projet",         icon:"briefcase"},
    {id:"date_asc",  label:"Date ↑ (anciens)", icon:"calendar"},
    {id:"date_desc", label:"Date ↓ (récents)", icon:"calendar"},
    {id:"due",       label:"Échéance",       icon:"clock"},
    {id:"priority",  label:"Importance",     icon:"alert"},
  ];
  const activeSort = SORTS.find(s => s.id === sortBy) || SORTS[0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:700,fontSize:22,lineHeight:1,letterSpacing:-0.5}}>Tâches</div>
          <div style={{fontSize:12,color:C.text3,marginTop:4}}>{active.length} actives · {done.length} terminées</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>{setD(empty);setEditTask(null);setForm("new");}} style={{padding:"8px 14px"}}><Icon name="plus" size={14}/> Tâche</Btn>
          <Btn onClick={()=>setProjectForm(true)} variant="ghost" style={{padding:"8px 14px"}}><Icon name="plus" size={14}/> Projet</Btn>
        </div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <FilterChip active={filter==="all"} onClick={()=>setFilter("all")}>Toutes</FilterChip>
        {allProjects.map(p =>
          <FilterChip key={p} active={filter===p} color={C.gold} onClick={()=>setFilter(p)}>{p}</FilterChip>
        )}
        <div style={{flex:1}}/>
        <FilterChip active={showDone} onClick={()=>setShowDone(x=>!x)} color={C.green}>{showDone?"Terminées":"Actives"}</FilterChip>
      </div>

      {/* Sort — collapsed into a single button with popover */}
      <div style={{position:"relative",alignSelf:"flex-start"}}>
        <button
          onClick={()=>setSortOpen(o=>!o)}
          aria-haspopup="listbox"
          aria-expanded={sortOpen}
          style={{
            display:"inline-flex",alignItems:"center",gap:8,
            padding:"7px 12px",borderRadius:999,
            background: sortOpen ? C.card2 : "transparent",
            border:`1px solid ${sortOpen?C.gold+"50":C.border2}`,
            color:C.text2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT,
            transition:"all .18s",
          }}>
          <Icon name="sortDesc" size={13} color={C.text3}/>
          <span style={{color:C.text4}}>Tri ·</span>
          <span style={{color:C.gold}}>{activeSort.label}</span>
          <Icon name="chevD" size={12} color={C.text3} style={{transform:sortOpen?"rotate(180deg)":"none",transition:"transform .18s"}}/>
        </button>
        {sortOpen && (
          <>
            <div onClick={()=>setSortOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
            <div role="listbox" style={{
              position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:41,minWidth:240,
              background:"rgba(14,18,26,0.92)",border:`1px solid ${C.border2}`,borderRadius:16,padding:6,
              boxShadow:"0 20px 50px -14px rgba(0,0,0,0.75), 0 0 0 1px rgba(34,211,160,0.04)",
              backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
              animation:"popIn .18s cubic-bezier(.2,.8,.2,1)",
              fontFamily:FONT,
            }}>
              {SORTS.map(s => {
                const on = sortBy === s.id;
                return (
                  <button key={s.id} onClick={()=>{setSortBy(s.id);setSortOpen(false);}} style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    padding:"9px 10px",borderRadius:10,border:"none",
                    background: on ? C.gold+"14" : "transparent",
                    color: on ? C.gold : C.text2,
                    fontSize:13,fontWeight:on?600:500,cursor:"pointer",fontFamily:FONT,
                    textAlign:"left",transition:"background .12s",
                  }}
                  onMouseEnter={e=>{ if(!on) e.currentTarget.style.background=C.card2; }}
                  onMouseLeave={e=>{ if(!on) e.currentTarget.style.background="transparent"; }}>
                    <Icon name={s.icon} size={14}/>
                    <span style={{flex:1}}>{s.label}</span>
                    {on && <Icon name="check" size={13}/>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {displayed.length === 0 && (
        <Card style={{padding:30,textAlign:"center",color:C.text3}}>
          <Icon name="checkCircle" size={32} color={C.text4} style={{marginBottom:10}}/>
          <div style={{fontSize:14,fontWeight:600}}>{showDone?"Aucune tâche terminée":"Aucune tâche active"}</div>
          <div style={{fontSize:12,color:C.text4,marginTop:4}}>Ajoute ta première tâche pour commencer</div>
        </Card>
      )}

      {byProject ? Object.entries(byProject).map(([proj, ts])=>(
        <div key={proj}>
          <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:8,padding:"0 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{proj === "Sans projet" ? "SANS PROJET" : proj.toUpperCase()} · {ts.length}</span>
            {proj !== "Sans projet" && projects.includes(proj) && (
              <button onClick={()=>removeProject(proj)} style={{background:"none",border:"none",color:C.text4,fontSize:11,cursor:"pointer",fontFamily:FONT}}>supprimer projet</button>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ts.map(t => <TaskCard key={t.id} task={t} setTasks={setTasks} onAssignToday={()=>assignToToday(t.id)} onEdit={()=>{setD({title:t.title,priority:normPrio(t.priority||t.urgency),project:t.project||"",scheduledFor:t.scheduledFor||"",notes:t.notes||""});setEditTask(t);setForm("edit");}}/>)}
          </div>
        </div>
      )) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {displayed.map(t => <TaskCard key={t.id} task={t} setTasks={setTasks} onAssignToday={()=>assignToToday(t.id)} onEdit={()=>{setD({title:t.title,priority:normPrio(t.priority||t.urgency),project:t.project||"",scheduledFor:t.scheduledFor||"",notes:t.notes||""});setEditTask(t);setForm("edit");}}/>)}
        </div>
      )}

      {form && (
        <Modal title={editTask?"Modifier la tâche":"Nouvelle tâche"} onClose={()=>{setForm(null);setEditTask(null);}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="TITRE *" value={d.title} onChange={e=>setD(p=>({...p,title:e.target.value}))} placeholder="Que faut-il faire ?"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FSelect label="IMPORTANCE" value={d.priority} onChange={e=>setD(p=>({...p,priority:e.target.value}))} options={Object.entries(PRIORITY).map(([k,v])=>({value:k,label:v.label}))}/>
              <FSelect label="PROJET" value={d.project} onChange={e=>setD(p=>({...p,project:e.target.value}))} options={[{value:"",label:"— Aucun —"},...allProjects.map(p=>({value:p,label:p}))]}/>
            </div>
            {/* ÉCHÉANCE — optional. A "Retirer" button clears the field so the task has no due date. */}
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
                <div style={{fontSize:11,color:C.text3,fontWeight:600,letterSpacing:0.4}}>ÉCHÉANCE</div>
                {d.scheduledFor && (
                  <button
                    type="button"
                    onClick={()=>setD(p=>({...p,scheduledFor:""}))}
                    style={{background:"transparent",border:`1px solid ${C.border2}`,borderRadius:999,color:C.text3,fontSize:10,fontWeight:600,padding:"3px 9px",cursor:"pointer",fontFamily:FONT,display:"inline-flex",alignItems:"center",gap:4,transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red+"50";e.currentTarget.style.color=C.red;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.text3;}}>
                    <Icon name="x" size={10}/> Retirer la date
                  </button>
                )}
              </div>
              <input
                type="date"
                value={d.scheduledFor||""}
                onChange={e=>setD(p=>({...p,scheduledFor:e.target.value}))}
                style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"11px 13px",fontSize:14,outline:"none",fontFamily:FONT,width:"100%",colorScheme:"dark"}}/>
            </div>
            <FText label="NOTES" value={d.notes} onChange={e=>setD(p=>({...p,notes:e.target.value}))}/>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>{setForm(null);setEditTask(null);}} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={save} style={{flex:2}}>Enregistrer</Btn>
            </div>
            {editTask && (
              <Btn onClick={()=>{setTasks(p=>p.filter(x=>x.id!==editTask.id));setForm(null);setEditTask(null);}} variant="danger" style={{width:"100%"}}><Icon name="trash" size={14}/> Supprimer la tâche</Btn>
            )}
          </div>
        </Modal>
      )}

      {projectForm && (
        <Modal title="Nouveau projet" onClose={()=>setProjectForm(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="NOM DU PROJET" value={newProject} onChange={e=>setNewProject(e.target.value)} placeholder="Agency 5Stars, Visa Focus..."/>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setProjectForm(false)} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={addProject} style={{flex:2}}>Créer le projet</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const TaskCard = ({task,setTasks,onEdit,onAssignToday}) => {
  const prio = normPrio(task.priority||task.urgency);
  const p = PRIORITY[prio];
  const due = task.scheduledFor;
  const today = todayStr();
  const isInToday = task.todayFor === today || due === today;
  const isOverdue = due && due < today && !task.done;
  // Priority color system: high=red, medium=orange, low=grey (neutral).
  // Dimmed when task is completed.
  const prioColor = task.done ? C.text4 : p.color;
  const prioAlpha = task.done ? "22" : "";
  return (
    <Card style={{
      padding:12,
      position:"relative",
      // Left-border accent colored by priority — subtle for low, strong for high.
      borderLeft: task.done
        ? `1px solid ${C.border}`
        : prio === "high"
          ? `3px solid ${C.red}`
          : prio === "medium"
            ? `3px solid ${C.orange}`
            : `3px solid ${C.grey}66`,
      paddingLeft: task.done ? 12 : 10,
    }}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <button onClick={()=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,done:!t.done}:t))} style={{
          width:20,height:20,borderRadius:6,
          border:`1.5px solid ${task.done?C.green:C.border2}`,
          background:task.done?C.green:"transparent",cursor:"pointer",flexShrink:0,marginTop:2,
          display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all .15s"
        }}>
          {task.done && <Icon name="check" size={11} color="#001a10" stroke={3}/>}
        </button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {!task.done && prio !== "low" && (
              <span title={`Importance ${p.label.toLowerCase()}`} aria-label={`Importance ${p.label.toLowerCase()}`} style={{
                width:6,height:6,borderRadius:"50%",background:prioColor,flexShrink:0,
                boxShadow:`0 0 0 3px ${prioColor}22`,
              }}/>
            )}
            <div style={{fontWeight:500,fontSize:14,textDecoration:task.done?"line-through":"none",color:task.done?C.text3:C.text,minWidth:0,flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{task.title}</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:5,alignItems:"center",fontSize:11,color:C.text3,fontWeight:500}}>
            {/* Priority badge — always visible for non-done tasks (subtle for low) */}
            {!task.done && (
              <span title={`Importance ${p.label.toLowerCase()}`} style={{
                display:"inline-flex",alignItems:"center",gap:4,
                padding:"2px 7px",borderRadius:999,
                color: prioColor,
                background: prio === "low" ? "transparent" : prioColor + "14",
                border: `1px solid ${prio === "low" ? C.border2 : prioColor + "38"}`,
                fontSize:10,fontWeight:700,letterSpacing:0.3,textTransform:"uppercase",
              }}>
                <span style={{width:5,height:5,borderRadius:"50%",background:prioColor,display:"inline-block"}}/>
                {p.label}
              </span>
            )}
            {task.project && (
              <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:C.gold,display:"inline-block"}}/>
                {task.project}
              </span>
            )}
            {due && (
              <span style={{color:isOverdue?C.red:due===today?C.green:C.text3,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>
                <Icon name="calendar" size={10}/> {fmtShort(due)}
              </span>
            )}
            {task.todayFor === today && due !== today && (
              <span style={{color:C.green,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>
                <Icon name="sun" size={10}/> Aujourd'hui
              </span>
            )}
          </div>
          {task.notes && <div style={{fontSize:12,color:C.text3,marginTop:6,lineHeight:1.5}}>{task.notes}</div>}
        </div>
        <div style={{display:"flex",gap:1,flexShrink:0}}>
          {/* Today toggle — ALWAYS visible for non-done tasks. Active state shows
              a filled green pin; inactive shows a neutral calendar-plus. Toggling
              never touches the due date, only the `todayFor` field. */}
          {!task.done && (() => {
            const pinnedToday = task.todayFor === today;
            return (
              <IconBtn
                name={pinnedToday ? "sun" : "calendarPlus"}
                onClick={onAssignToday}
                title={pinnedToday ? "Retirer d'aujourd'hui" : "Ajouter à aujourd'hui"}
                color={pinnedToday ? C.green : C.gold}
              />
            );
          })()}
          <IconBtn name="edit" onClick={onEdit} title="Modifier"/>
          <IconBtn name="trash" onClick={()=>setTasks(p=>p.filter(x=>x.id!==task.id))} title="Supprimer"/>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

// Pure helper: aggregates day-level metrics for a given range (array of date keys).
function computePeriodStats(days, score, body, workSess) {
  const scores = days.map(d => ({d, ...score(d)}));
  const withData = scores.filter(s => s.total > 0);
  const avg = withData.length ? Math.round(withData.reduce((a,b)=>a+b.pct,0) / withData.length) : 0;
  const perfectDays = withData.filter(s => s.pct >= 90).length;
  const best = withData.reduce((b,s) => s.pct > (b?.pct || 0) ? s : b, null);

  const bodyDays = days.filter(d => body[d]);
  const sleepDays = bodyDays.filter(d => body[d].sleep);
  const avgSleep = sleepDays.length
    ? (sleepDays.reduce((a,d) => a + body[d].sleep, 0) / sleepDays.length).toFixed(1)
    : "—";
  const energyDays = bodyDays.filter(d => body[d].energy != null);
  const avgEnergy = energyDays.length
    ? (energyDays.reduce((a,d) => a + body[d].energy, 0) / energyDays.length).toFixed(1)
    : "—";

  const workMin = days.reduce((a,d) =>
    a + (workSess||[]).filter(s => s.date === d).reduce((x,y) => x + (y.duration || 0), 0)
  , 0);

  return {scores, avg, perfectDays, best, avgSleep, avgEnergy, workMin, nDays: days.length};
}

// Full days of a month, optionally clipped so we don't include future days.
function monthDaysUpTo(year, month, upToKey) {
  return monthRange(year, month).filter(dk => dk <= upToKey);
}

function AnalyseTab({habits, completions, body, workSess, score, habitRateRange, profile, setProfile}) {
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [compare, setCompare] = useState(false);
  const [filter, setFilter] = useState("all");

  const todayKey = todayStr();
  const now = new Date();
  const curMonth  = useMemo(()=> new Date(now.getFullYear(), now.getMonth() + monthOffset, 1), [monthOffset]);
  const prevMonth = useMemo(()=> new Date(now.getFullYear(), now.getMonth() + monthOffset - 1, 1), [monthOffset]);
  const isCurrentMonth = monthOffset === 0;
  const canGoForward = monthOffset < 0;

  const curY = curMonth.getFullYear(), curM = curMonth.getMonth();
  const prevY = prevMonth.getFullYear(), prevM = prevMonth.getMonth();

  // Full grid + past-or-today slice for aggregates
  const fullMonthDays = useMemo(()=> monthRange(curY, curM), [curY, curM]);
  const periodDays    = useMemo(()=> fullMonthDays.filter(d => d <= todayKey), [fullMonthDays, todayKey]);
  // Previous month: clip to same "day-of-month" count as current period for fair comparison
  const prevPeriodDays = useMemo(()=>{
    const full = monthRange(prevY, prevM);
    return isCurrentMonth ? full.slice(0, periodDays.length) : full;
  }, [prevY, prevM, isCurrentMonth, periodDays.length]);

  const monthName = curMonth.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const prevMonthName = prevMonth.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
  const firstDow = new Date(curY, curM, 1).getDay();

  // ─── Period aggregates (all sections derive from these) ─────────
  const stats     = useMemo(()=> computePeriodStats(periodDays, score, body, workSess), [periodDays, score, body, workSess]);
  const prevStats = useMemo(()=> computePeriodStats(prevPeriodDays, score, body, workSess), [prevPeriodDays, score, body, workSess]);
  const diff = stats.avg - prevStats.avg;

  // ─── Habit rates for this period ────────────────────────────────
  const habitRates = useMemo(()=>
    habits.map(h => ({...h, ...habitRateRange(h, periodDays)}))
          .sort((a,b) => (b.firstSeen?b.rate:-1) - (a.firstSeen?a.rate:-1))
  , [habits, habitRateRange, periodDays]);

  const prevHabitRates = useMemo(()=>
    habits.map(h => ({...h, ...habitRateRange(h, prevPeriodDays)}))
  , [habits, habitRateRange, prevPeriodDays]);

  const filtered = filter === "all" ? habitRates : habitRates.filter(h => h.cat === filter);

  // Habit-level change vs previous period (for compare view)
  const habitDeltas = useMemo(()=>{
    const prevById = new Map(prevHabitRates.map(h => [h.id, h]));
    return habitRates
      .filter(h => h.firstSeen)
      .map(h => {
        const p = prevById.get(h.id);
        const prevRate = p?.firstSeen ? p.rate : null;
        const delta = prevRate != null ? h.rate - prevRate : null;
        return {...h, prevRate, delta};
      });
  }, [habitRates, prevHabitRates]);

  // ─── Category averages for this period ──────────────────────────
  const catAvg = useMemo(()=> Object.keys(CATS).map(cat => {
    const hs = habitRates.filter(h => h.cat === cat && h.firstSeen);
    return {
      cat,
      avg: hs.length ? Math.round(hs.reduce((a,b)=>a+b.rate, 0) / hs.length) : 0,
      color: CATS[cat].color,
      icon: CATS[cat].icon,
      count: hs.length,
    };
  }).filter(c => c.count > 0).sort((a,b)=>b.avg-a.avg), [habitRates]);

  const prevCatAvg = useMemo(()=>{
    const map = {};
    Object.keys(CATS).forEach(cat => {
      const hs = prevHabitRates.filter(h => h.cat === cat && h.firstSeen);
      map[cat] = hs.length ? Math.round(hs.reduce((a,b)=>a+b.rate, 0) / hs.length) : 0;
    });
    return map;
  }, [prevHabitRates]);

  // ─── Improvement list: bottom 5, NN-weighted (NN habits surface ~20pts earlier) ──
  const improvementList = useMemo(()=>
    habitRates
      .filter(h => h.firstSeen && h.total >= 3 && h.rate < 80)
      .map(h => ({...h, adjusted: h.rate - (h.nn ? 20 : 0)}))
      .sort((a,b) => a.adjusted - b.adjusted)
      .slice(0, 5)
  , [habitRates]);

  const periodLabel = isCurrentMonth ? "Ce mois (en cours)" : "Mois complet";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      {/* Header + month nav + compare toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:700,fontSize:22,letterSpacing:-0.5}}>Analytics</div>
          <div style={{fontSize:12,color:C.text3,marginTop:4,textTransform:"capitalize"}}>
            {monthName} · {periodLabel} · {periodDays.length}j
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setMonthOffset(o=>o-1)} title="Mois précédent" style={{...navArrow,width:32,height:32}}><Icon name="chevL" size={15}/></button>
          <button onClick={()=>setMonthOffset(0)} disabled={monthOffset===0} style={{...navArrow,width:"auto",height:32,padding:"0 12px",fontSize:12,fontWeight:600,opacity:monthOffset===0?0.4:1}}>Actuel</button>
          <button onClick={()=>setMonthOffset(o=>Math.min(0,o+1))} disabled={!canGoForward} title="Mois suivant" style={{...navArrow,width:32,height:32,opacity:canGoForward?1:0.4}}><Icon name="chevR" size={15}/></button>
          <button onClick={()=>setCompare(c=>!c)} style={{
            padding:"0 14px",height:32,borderRadius:20,
            border:`1px solid ${compare?C.gold:C.border2}`,
            background: compare ? C.gold+"18" : "transparent",
            color: compare ? C.gold : C.text3,
            fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT,
            display:"inline-flex",alignItems:"center",gap:6
          }}>
            <Icon name={compare?"trendUp":"bar"} size={12}/> Comparer
          </button>
        </div>
      </div>

      {/* Hero: avg score + highlights + sparkline */}
      <Card glow style={{background:`linear-gradient(135deg, ${C.card}, ${C.card2})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,color:C.text3,fontWeight:600,letterSpacing:0.8,marginBottom:4}}>SCORE MOYEN</div>
            <div style={{fontSize:54,fontWeight:800,color:stats.avg>=80?C.green:stats.avg>=60?C.gold:C.red,lineHeight:1,letterSpacing:-2}}>{stats.avg}%</div>
            <div style={{fontSize:12,color:diff>=0?C.green:C.red,fontWeight:600,marginTop:6,display:"inline-flex",alignItems:"center",gap:4}}>
              <Icon name={diff>=0?"trendUp":"trendDown"} size={12}/> {Math.abs(diff)}% vs {prevMonthName}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,color:C.gold,letterSpacing:-0.5}}>{stats.perfectDays}</div>
            <div style={{fontSize:10,color:C.text4,fontWeight:500}}>jours parfaits</div>
            <div style={{fontSize:22,fontWeight:800,color:C.green,marginTop:8,letterSpacing:-0.5}}>{stats.best?.pct||0}%</div>
            <div style={{fontSize:10,color:C.text4,fontWeight:500}}>meilleur jour</div>
          </div>
        </div>
        <Sparkline data={stats.scores.map(s=>s.pct)} color={stats.avg>=70?C.green:C.gold} h={60}/>
      </Card>

      {/* Compare block */}
      {compare && (
        <Card style={{border:`1px solid ${C.gold}30`,background:`linear-gradient(135deg, ${C.gold}08, transparent)`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:0.8,marginBottom:14,display:"inline-flex",alignItems:"center",gap:6,textTransform:"uppercase"}}>
            <Icon name="bar" size={12}/> Comparaison · <span style={{color:C.text2,textTransform:"capitalize"}}>{monthName}</span> vs <span style={{color:C.text3,textTransform:"capitalize"}}>{prevMonthName}</span>
          </div>

          {/* Headline metrics deltas */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:8,marginBottom:16}}>
            <CompareMetric label="Score"         cur={stats.avg}          prev={prevStats.avg}          suffix="%"/>
            <CompareMetric label="Jours parfaits" cur={stats.perfectDays}  prev={prevStats.perfectDays}  suffix=""/>
            <CompareMetric label="Focus"          cur={Math.round(stats.workMin/60*10)/10}  prev={Math.round(prevStats.workMin/60*10)/10} suffix="h"/>
            <CompareMetric label="Sommeil"        cur={stats.avgSleep}     prev={prevStats.avgSleep}     suffix="h"/>
          </div>

          {/* Per-category deltas */}
          {catAvg.length>0 && (
            <>
              <div style={{fontSize:10,color:C.text4,fontWeight:600,letterSpacing:0.6,marginBottom:8}}>PAR CATÉGORIE</div>
              {catAvg.map(c => {
                const prev = prevCatAvg[c.cat] || 0;
                const d = c.avg - prev;
                return (
                  <div key={c.cat} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                    <Icon name={c.icon} size={13} color={c.color}/>
                    <span style={{flex:1,fontSize:13,fontWeight:500}}>{c.cat}</span>
                    <span style={{fontSize:11,color:C.text4,fontWeight:500,minWidth:44,textAlign:"right"}}>{prev}%</span>
                    <Icon name="chevR" size={11} color={C.text4}/>
                    <span style={{fontSize:13,fontWeight:700,color:c.color,minWidth:44,textAlign:"right"}}>{c.avg}%</span>
                    <span style={{fontSize:11,fontWeight:700,color:d>=0?C.green:C.red,minWidth:44,textAlign:"right",display:"inline-flex",alignItems:"center",justifyContent:"flex-end",gap:2}}>
                      <Icon name={d>=0?"trendUp":"trendDown"} size={10}/>{d>0?"+":""}{d}
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {/* Habit-level improved / declined / stable */}
          {habitDeltas.length > 0 && (() => {
            const improved = habitDeltas.filter(h => h.delta > 3).sort((a,b)=>b.delta-a.delta).slice(0,5);
            const declined = habitDeltas.filter(h => h.delta < -3).sort((a,b)=>a.delta-b.delta).slice(0,5);
            const stable   = habitDeltas.filter(h => h.delta != null && Math.abs(h.delta) <= 3).length;
            return (
              <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:C.green,letterSpacing:0.6,marginBottom:8,display:"inline-flex",alignItems:"center",gap:4}}>
                    <Icon name="trendUp" size={11}/> EN PROGRÈS · {improved.length}
                  </div>
                  {improved.length === 0 ? (
                    <div style={{fontSize:11,color:C.text4}}>—</div>
                  ) : improved.map(h => (
                    <div key={h.id} style={{fontSize:12,padding:"4px 0",display:"flex",justifyContent:"space-between",gap:6}}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</span>
                      <span style={{color:C.green,fontWeight:700,flexShrink:0}}>+{h.delta}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:C.red,letterSpacing:0.6,marginBottom:8,display:"inline-flex",alignItems:"center",gap:4}}>
                    <Icon name="trendDown" size={11}/> EN BAISSE · {declined.length}
                  </div>
                  {declined.length === 0 ? (
                    <div style={{fontSize:11,color:C.text4}}>—</div>
                  ) : declined.map(h => (
                    <div key={h.id} style={{fontSize:12,padding:"4px 0",display:"flex",justifyContent:"space-between",gap:6}}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</span>
                      <span style={{color:C.red,fontWeight:700,flexShrink:0}}>{h.delta}%</span>
                    </div>
                  ))}
                </div>
                <div style={{gridColumn:"1 / -1",fontSize:11,color:C.text4,fontWeight:500,marginTop:4}}>
                  · {stable} habitude{stable>1?"s":""} stable{stable>1?"s":""} (±3%)
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Heatmap (in sync with selected month) */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,display:"inline-flex",alignItems:"center",gap:6}}>
            <Icon name="calendar" size={12}/> HEATMAP · <span style={{textTransform:"capitalize",color:C.text2,fontWeight:700}}>{monthName}</span>
          </div>
          {/* Reset-before-date: any day strictly before this is treated as "no data" everywhere. */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,color:C.text4,fontWeight:500}}>
            <span title="Ignorer les jours avant cette date">Reset avant</span>
            <input
              type="date"
              value={profile?.dataStartDate||""}
              onChange={e=>setProfile(p=>({...p, dataStartDate:e.target.value||""}))}
              style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text2,padding:"4px 7px",fontSize:10,outline:"none",fontFamily:FONT,colorScheme:"dark"}}/>
            {profile?.dataStartDate && (
              <button onClick={()=>setProfile(p=>({...p, dataStartDate:""}))}
                title="Annuler le reset"
                style={{background:"transparent",border:"none",color:C.text3,cursor:"pointer",padding:0,display:"inline-flex",alignItems:"center"}}>
                <Icon name="x" size={12}/>
              </button>
            )}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:4,marginBottom:8}}>
          {DAY_NAMES.map((d,i)=><div key={i} style={{fontSize:9,color:C.text4,textAlign:"center",fontWeight:600,padding:"3px 0"}}>{d}</div>)}
          {Array.from({length:firstDow}).map((_,i)=><div key={"e"+i}/>)}
          {fullMonthDays.map(dk=>{
            const s = score(dk);
            const today = dk === todayKey;
            const future = dk > todayKey;
            const cutoff = profile?.dataStartDate || "";
            const beforeCutoff = cutoff && dk < cutoff;
            // Before cutoff → pretend there's no data, no matter what was logged.
            const hasData = !beforeCutoff && ((completions[dk] && Object.values(completions[dk]).some(v=>v)) || body[dk]);
            const bg = (future || beforeCutoff) ? C.bg2 : heatColor(s.pct, hasData);
            return (
              <div key={dk} title={`${fmtShort(dk)}: ${future?"—":beforeCutoff?"reset":s.pct+"%"}`} style={{
                aspectRatio:"1", borderRadius:6, background:bg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:10,fontWeight:700,
                color: (future || beforeCutoff) ? C.text4 : heatTextColor(s.pct),
                border: today ? `2px solid ${C.gold}` : "none",
                opacity: future?0.4:beforeCutoff?0.35:1
              }}>{future||beforeCutoff?"":(hasData?new Date(dk+"T12:00").getDate():"")}</div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6,marginTop:14,alignItems:"center",fontSize:10,color:C.text4,flexWrap:"wrap"}}>
          <span style={{fontWeight:600}}>Faible</span>
          {[0, 25, 45, 65, 80, 95].map(v => <div key={v} style={{width:14,height:14,borderRadius:3,background:heatColor(v, v>0)}}/>)}
          <span style={{fontWeight:600}}>Élevé</span>
          <div style={{flex:1}}/>
          {isCurrentMonth && <div style={{display:"inline-flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,border:`2px solid ${C.gold}`}}/> Aujourd'hui</div>}
        </div>
      </Card>

      {/* KPI row (synced) */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:8}}>
        {[
          {l:"Focus",      v:fmtMin(stats.workMin)||"0m",   c:C.gold,  icon:"clock"},
          {l:"Énergie",    v:`${stats.avgEnergy}/10`,       c:C.gold,  icon:"activity"},
          {l:"Sommeil",    v:`${stats.avgSleep}h`,          c:C.green, icon:"moon"},
          {l:"Jours ≥90%", v:stats.perfectDays,             c:C.green, icon:"target"},
        ].map(m=>(
          <Card key={m.l} style={{padding:14,textAlign:"center"}}>
            <Icon name={m.icon} size={14} color={m.c} style={{marginBottom:6}}/>
            <div style={{fontSize:22,fontWeight:800,color:m.c,letterSpacing:-0.5}}>{m.v}</div>
            <div style={{fontSize:10,fontWeight:600,color:C.text4,marginTop:2}}>{m.l}</div>
          </Card>
        ))}
      </div>

      {/* Category breakdown (synced) */}
      {catAvg.length > 0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:12,textTransform:"uppercase"}}>
            Par catégorie · {monthName}
          </div>
          {catAvg.map(c=>(
            <div key={c.cat} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5,alignItems:"center"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:8,fontWeight:500}}><Icon name={c.icon} size={13} color={c.color}/>{c.cat}</span>
                <span style={{fontWeight:700,color:c.color,letterSpacing:-0.2}}>{c.avg}%</span>
              </div>
              <PBar value={c.avg} color={c.color} h={6}/>
            </div>
          ))}
        </Card>
      )}

      {/* Habit rates (synced) */}
      <Card>
        <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:8,textTransform:"uppercase"}}>
          Habitudes · {monthName}
        </div>
        <div style={{fontSize:11,color:C.text4,marginBottom:12,lineHeight:1.5}}>
          Taux de complétion sur {periodDays.length} jour{periodDays.length>1?"s":""}, uniquement depuis la première complétion de chaque habitude.
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          <FilterChip active={filter==="all"} onClick={()=>setFilter("all")}>Toutes</FilterChip>
          {Object.keys(CATS).map(cat=>(
            <FilterChip key={cat} active={filter===cat} onClick={()=>setFilter(cat)} color={CATS[cat].color}>
              <Icon name={CATS[cat].icon} size={11} color={filter===cat?CATS[cat].color:C.text3}/> {cat}
            </FilterChip>
          ))}
        </div>
        {filtered.map((h,i)=>(
          <div key={h.id} style={{marginBottom:12,opacity:h.firstSeen?1:0.45}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flex:1,minWidth:0}}>
                <span style={{color:C.text4,fontSize:11,width:18,flexShrink:0,fontWeight:500}}>{i+1}</span>
                <span style={{fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</span>
                {h.nn&&<Badge color={C.red}>NN</Badge>}
              </div>
              <span style={{fontWeight:700,color:!h.firstSeen?C.text4:h.rate>=80?C.green:h.rate>=50?C.gold:C.red,marginLeft:8,letterSpacing:-0.2}}>
                {h.firstSeen ? `${h.rate}%` : "—"}
              </span>
            </div>
            <PBar value={h.firstSeen?h.rate:0} color={h.rate>=80?C.green:h.rate>=50?C.gold:C.red} h={4}/>
            {h.firstSeen && (
              <div style={{fontSize:10,color:C.text4,marginTop:3,fontWeight:500}}>{h.done}/{h.total} sur {periodDays.length}j · depuis {fmtShort(h.firstSeen)}</div>
            )}
          </div>
        ))}
      </Card>

      {/* Improvement list: NN-weighted bottom 5 (synced) */}
      {improvementList.length > 0 && (
        <Card style={{border:`1px solid ${C.red}30`}}>
          <div style={{fontSize:11,fontWeight:600,color:C.red,letterSpacing:0.6,marginBottom:4,display:"inline-flex",alignItems:"center",gap:6,textTransform:"uppercase"}}>
            <Icon name="alert" size={12}/> À améliorer · {monthName}
          </div>
          <div style={{fontSize:10,color:C.text4,marginBottom:10,fontWeight:500}}>
            Classement pondéré : les non-négociables remontent de +20 points dans la priorité.
          </div>
          {improvementList.map(h=>(
            <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`,gap:8}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</div>
                {h.nn && <Badge color={C.red}>NN</Badge>}
                <span style={{color:C.text4,fontSize:11}}>· {h.cat}</span>
              </div>
              <Badge color={C.red}>{h.rate}%</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// Compact compare-metric block (current vs prev + delta arrow)
const CompareMetric = ({label, cur, prev, suffix}) => {
  const curN = typeof cur === "number" ? cur : parseFloat(cur);
  const prevN = typeof prev === "number" ? prev : parseFloat(prev);
  const hasDelta = !isNaN(curN) && !isNaN(prevN);
  const d = hasDelta ? Math.round((curN - prevN) * 10) / 10 : null;
  const up = d != null && d >= 0;
  return (
    <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
      <div style={{fontSize:10,color:C.text4,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"}}>{label}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
        <div style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:-0.4}}>{cur}{suffix}</div>
        <div style={{fontSize:11,color:C.text4,fontWeight:500}}>vs {prev}{suffix}</div>
      </div>
      {d != null && (
        <div style={{fontSize:11,fontWeight:700,color:up?C.green:C.red,marginTop:3,display:"inline-flex",alignItems:"center",gap:3}}>
          <Icon name={up?"trendUp":"trendDown"} size={10}/>{up?"+":""}{d}{suffix}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI AGENT (actionable + sport tracking)
// ═══════════════════════════════════════════════════════════════════════════════

// Sport keywords for natural language detection
const SPORT_KEYWORDS = [
  {type:"Course",   re:/\b(cours[eu]|run(?:ning|)|jog|footing)\b/i},
  {type:"Gym",      re:/\b(gym|muscu(?:lation|)|pecs?|chest|dos|back|bras|arms|leg|jambes?|workout|seance)\b/i},
  {type:"Boxe",     re:/\b(bo?xe?|boxing|sparring|sacs?|sac de frappe|round)/i},
  {type:"Vélo",     re:/\b(v[eé]lo|bike|cycling|cyclisme)\b/i},
  {type:"Natation", re:/\b(nat[ae]tion|swim|piscine|nag[eé])/i},
  {type:"Yoga",     re:/\b(yoga|stretch|[eé]tirement)/i},
  {type:"Marche",   re:/\b(march[eé]|walk|randonn[eé]e)\b/i},
];

const detectSport = (msg) => {
  const hit = SPORT_KEYWORDS.find(s => s.re.test(msg));
  if (!hit) return null;
  // distance (km)
  const distM = msg.match(/(\d+(?:[.,]\d+)?)\s*k(?:m|ilom)/i);
  // duration (min / h)
  const durMinM = msg.match(/(\d+)\s*(?:min|minutes?)\b/i);
  const durHM = msg.match(/(\d+(?:[.,]\d+)?)\s*h(?:eures?|)\b/i);
  // rounds
  const roundM = msg.match(/(\d+)\s*(?:rounds?|reprises?)/i);
  // intensity words
  let intensity = 3;
  if (/intense|dur|hard|max|pr|record/i.test(msg)) intensity = 5;
  else if (/facile|easy|light|chill|recup/i.test(msg)) intensity = 2;
  else if (/moyen|medium|normal/i.test(msg)) intensity = 3;

  const distance = distM ? parseFloat(distM[1].replace(",",".")) : 0;
  let duration = 0;
  if (durMinM) duration = parseInt(durMinM[1],10);
  else if (durHM) duration = Math.round(parseFloat(durHM[1].replace(",","."))*60);

  return {
    type: hit.type,
    distance,
    duration,
    intensity,
    rounds: roundM ? parseInt(roundM[1],10) : 0,
    notes: msg.length > 120 ? msg.slice(0,120)+"…" : msg,
  };
};

// Mock AI fallback — triggered silently when the AI endpoint is unreachable.
// Uses real user data to produce coherent, contextual replies without network.
function mockReply(msg, sc, bodyT, tasks, sportLog, habits) {
  const m = msg.toLowerCase();
  const activeTasks = (tasks||[]).filter(t=>!t.done);
  const urg = activeTasks.filter(t=>normPrio(t.priority||t.urgency)==="high");
  const recentSport = (sportLog||[]).slice(0,3);

  if (/bonjour|salut|hello|hey|coucou/.test(m))
    return `Salut. Score du jour : **${sc.pct}%** (${sc.done}/${sc.total}). ${sc.nnOk?"Les non-négos tiennent.":"⚠ Un non-négo est cassé — score plafonné à 70%."} Tu veux analyser ta journée ou ajouter une tâche ?`;

  if (/analyse|7 jours|semaine|7 derniers/.test(m))
    return `Analyse rapide :\n• Score du jour : **${sc.pct}%**\n• Non-négo : ${sc.nnDone}/${sc.nnTotal}\n• Sommeil : ${bodyT.sleep??"?"}h\n• Tâches actives : ${activeTasks.length} (dont ${urg.length} urgentes)\n• Sport récent : ${recentSport.length} séance${recentSport.length>1?"s":""}\n\n${sc.pct>=80?"Momentum solide — continue.":sc.pct>=60?"Correct. Verrouille les non-négos demain.":"Priorité : lock les non-négos avant tout le reste."}`;

  if (/priorité|urgent|important|aujourd'?hui/.test(m)) {
    if (urg.length === 0) return activeTasks.length ? `Aucune tâche urgente. Tu as ${activeTasks.length} tâches actives — attaque la première : **${activeTasks[0].title}**.` : "Aucune tâche urgente ni active. Journée ouverte — concentre-toi sur les non-négos.";
    return `Priorités du jour (${urg.length} urgentes) :\n${urg.slice(0,5).map((t,i)=>`${i+1}. **${t.title}**${t.project?` · ${t.project}`:""}`).join("\n")}\n\nCommence par la 1.`;
  }

  if (/sommeil|sleep|dormi|fatigue/.test(m)) {
    const h = bodyT.sleep;
    if (!h) return "Pas encore de données sommeil aujourd'hui. Renseigne coucher + réveil en haut de Today.";
    if (h >= 7.5) return `**${h}h** de sommeil — parfait. Tu as le carburant pour performer.`;
    if (h >= 6) return `**${h}h** — acceptable mais pas optimal. Vise 7h30 min.`;
    return `**${h}h** — dette de sommeil. Couche-toi 30min plus tôt ce soir.`;
  }

  if (/sport|entr[aâ]in|workout|training/.test(m)) {
    if (!recentSport.length) return "Aucune séance loggée récemment. Tape par ex. *\"j'ai couru 5km\"* ou *\"séance boxe 6 rounds\"* pour logger.";
    return `Dernières séances :\n${recentSport.map(s=>`• ${s.type} · ${s.date}${s.distance?` · ${s.distance}km`:""}${s.duration?` · ${s.duration}min`:""} · intensité ${s.intensity}/5`).join("\n")}`;
  }

  if (/conseil|aide|tip|recommande/.test(m)) {
    const weak = (habits||[]).filter(h=>h.nn).slice(0,3).map(h=>h.label).join(", ");
    return `Focus simple :\n1. Ferme les non-négos d'abord${weak?` (${weak})`:""}\n2. Un bloc focus de 90min avant midi\n3. Sommeil avant 23h\n\nLa discipline sur ces 3 points fait 80% des résultats.`;
  }

  return `Je peux toujours exécuter des commandes sans réseau :\n• *ajoute une tâche : ...*\n• *crée une habitude : ...*\n• *j'ai couru 5km* (tracking sport auto)\n• *mes priorités* · *analyse ma semaine* · *mon sommeil*`;
}

// ─── AI backend: keyless by default (Pollinations, OpenAI-compatible) ────────
// Override by setting VITE_AI_API_URL. Expected POST body: {model, messages}.
// Response: OpenAI chat-completions shape — data.choices[0].message.content.
const AI_URL   = import.meta.env.VITE_AI_API_URL   || "https://text.pollinations.ai/openai";
const AI_MODEL = import.meta.env.VITE_AI_MODEL     || "openai";

async function callAI({system, history, signal}) {
  const messages = [
    { role: "system", content: system },
    ...history.map(m => ({ role: m.role, content: m.content })),
  ];
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: 500 }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (
    data?.choices?.[0]?.message?.content ||
    data?.content ||
    (typeof data === "string" ? data : "")
  );
}

// ─── Voice input hook (Web Speech API, FR) ───────────────────────────────────
function useVoiceInput({ onResult, lang = "fr-FR" } = {}) {
  const [state, setState] = useState("idle"); // idle | recording | processing
  const [partial, setPartial] = useState("");
  const recRef = useRef(null);

  const supported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setPartial(finalText + interim);
    };
    rec.onerror = () => { setState("idle"); setPartial(""); };
    rec.onend = () => {
      const text = (finalText || "").trim();
      setState("idle");
      setPartial("");
      if (text && onResult) onResult(text);
    };

    recRef.current = rec;
    try { rec.start(); setState("recording"); }
    catch { setState("idle"); }
  }, [supported, lang, onResult]);

  const stop = useCallback(() => {
    if (recRef.current) {
      setState("processing");
      try { recRef.current.stop(); } catch {/*noop*/}
    }
  }, []);

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch {/*noop*/}
  }, []);

  return { supported, state, partial, start, stop };
}

// ─── AgentChat: the chat panel itself (used inside FloatingAgent) ────────────
function AgentChat({habits,setHabits,completions,toggle,body,tasks,setTasks,profile,score,activeDayKey,sportLog,setSportLog,goals}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const bottom = useRef(null);

  useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[msgs,loading]);
  useEffect(()=> () => abortRef.current?.abort(), []);

  const parseAction = (msg) => {
    const m = msg.toLowerCase().trim();
    let r = msg.match(/^(?:ajoute|crée|create|add)\s+(?:une\s+)?t[âa]che\s*[:\-]?\s+(.+)$/i);
    if (r) return {type:"add_task", title: r[1].trim()};
    r = msg.match(/^(?:ajoute|crée|create|add)\s+(?:une\s+)?(?:habitude|routine)\s*[:\-]?\s+(.+)$/i);
    if (r) {
      const rest = r[1].trim();
      let cat = "Discipline";
      for (const k of Object.keys(CATS)) if (m.includes(k.toLowerCase())) cat = k;
      return {type:"add_habit", label: rest, cat, nn: /non.?n[ée]go/.test(m), freq:"daily"};
    }
    r = msg.match(/^(?:supprime|enlève|retire|remove|delete)\s+(?:l['’]\s*)?(?:habitude|routine)\s*[:\-]?\s+(.+)$/i);
    if (r) return {type:"remove_habit", label: r[1].trim()};
    r = msg.match(/^(?:retire|enlève|supprime)\s+(.+?)\s+(?:le\s+)?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)s?$/i);
    if (r) {
      const day = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"].indexOf(r[2].toLowerCase());
      return {type:"remove_habit_day", label: r[1].trim(), day};
    }
    r = msg.match(/^(?:marque|rend[rs]?)\s+(.+?)\s+(?:comme\s+)?non[-\s]?n[ée]go(?:ciable)?$/i);
    if (r) return {type:"toggle_nn", label: r[1].trim()};
    r = msg.match(/^(?:valide|complete|coche|marque)\s+(.+?)(?:\s+(?:aujourd'?hui|today))?$/i);
    if (r && !/^(?:valide|complete|coche|marque)\s*$/i.test(msg)) {
      return {type:"complete_habit", label: r[1].trim()};
    }
    const sport = detectSport(msg);
    if (sport) {
      const {type:sportType, ...rest} = sport;
      return {type:"log_sport", sportType, ...rest};
    }
    return null;
  };

  const executeAction = (action) => {
    if (!action) return null;
    try {
      if (action.type === "add_task") {
        setTasks(p => [...(p||[]), {id:Date.now().toString(), title:action.title, priority:"medium", project:"", done:false, createdAt:todayStr()}]);
        return `✓ Tâche ajoutée : **${action.title}**`;
      }
      if (action.type === "add_habit") {
        setHabits(p => [...(p||[]), {id:"h"+Date.now(), label:action.label, cat:normCat(action.cat), freq:action.freq||"daily", nn:!!action.nn}]);
        return `✓ Habitude créée : **${action.label}** (${action.cat})${action.nn?" · non-négociable":""}`;
      }
      if (action.type === "remove_habit") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `Habitude "${action.label}" non trouvée.`;
        setHabits(p => (p||[]).filter(h => h.id !== target.id));
        return `✓ Habitude supprimée : **${target.label}**`;
      }
      if (action.type === "remove_habit_day") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `Habitude "${action.label}" non trouvée.`;
        const days = (target.days || []).filter(d => d !== action.day);
        setHabits(p => (p||[]).map(h => h.id===target.id ? {...h, freq:"specific", days} : h));
        return `✓ **${target.label}** retiré des ${DAY_FULL[action.day].toLowerCase()}s`;
      }
      if (action.type === "toggle_nn") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `Habitude "${action.label}" non trouvée.`;
        setHabits(p => (p||[]).map(h => h.id===target.id ? {...h, nn:!h.nn} : h));
        return `✓ **${target.label}** ${target.nn?"n'est plus":"est maintenant"} non-négociable`;
      }
      if (action.type === "complete_habit") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `Habitude "${action.label}" non trouvée.`;
        if (completions[activeDayKey]?.[target.id]) return `**${target.label}** est déjà validée aujourd'hui`;
        toggle(target.id, activeDayKey);
        return `✓ **${target.label}** validée aujourd'hui`;
      }
      if (action.type === "log_sport") {
        const entry = {
          id:Date.now().toString(),
          type:action.sportType || "Autre",
          date:activeDayKey,
          distance:action.distance||0,
          duration:action.duration||0,
          intensity:action.intensity||3,
          rounds:action.rounds||0,
          notes:action.notes||"",
        };
        setSportLog(p => [entry, ...(p||[])]);
        const hist = (sportLog||[]).filter(s => s.type === entry.type);
        const total = hist.length;
        const lastSame = hist[0];
        let detail = [];
        if (entry.distance) detail.push(`${entry.distance}km`);
        if (entry.duration) detail.push(`${entry.duration}min`);
        if (entry.rounds) detail.push(`${entry.rounds} rounds`);
        const detailStr = detail.length ? " · "+detail.join(" · ") : "";
        let suggestion = "";
        if (total > 0 && lastSame) {
          const days = diffDays(lastSame.date, activeDayKey);
          suggestion = `\n\n${total+1}ème séance de ${entry.type.toLowerCase()} · dernière il y a ${days}j`;
          if (entry.distance && lastSame.distance) {
            const d = entry.distance - lastSame.distance;
            suggestion += d>0?` · progression +${d.toFixed(1)}km`:d<0?` · ${d.toFixed(1)}km vs dernière`:"";
          }
        } else {
          suggestion = `\n\nPremière séance de ${entry.type.toLowerCase()} enregistrée.`;
        }
        return `✓ Séance loggée : **${entry.type}**${detailStr} · intensité ${entry.intensity}/5${suggestion}`;
      }
    } catch (e) {
      return `Erreur: ${e.message}`;
    }
    return null;
  };

  const buildCtx = useCallback(()=>{
    const sc = score(activeDayKey);
    const bodyT = body[activeDayKey]||{};
    const urgTasks = tasks.filter(t=>!t.done && normPrio(t.priority||t.urgency)==="high");
    const recentSport = (sportLog||[]).slice(0,5).map(s=>`${s.type} ${s.date}${s.distance?` ${s.distance}km`:""}${s.duration?` ${s.duration}min`:""}${s.rounds?` ${s.rounds}rounds`:""}`).join(" | ");
    const habitList = habits.map(h=>`${h.label} (${h.cat}${h.nn?", NN":""})`).join(", ");
    return `Tu es Growth Agent — assistant de performance. Parle français, direct et actionnable. Réponses courtes et précises (4-6 phrases max).

CONTEXTE ${activeDayKey}:
- Score: ${sc.pct}% (${sc.done}/${sc.total}) | Non-négo: ${sc.nnDone}/${sc.nnTotal} ${!sc.nnOk?"[broken]":"OK"}
- Sommeil: ${bodyT.sleep??"?"}h (couché ${bodyT.bedTime??"?"}, levé ${bodyT.wakeTime??"?"})
- Profil: ${profile.age||"?"}a ${profile.weight||"?"}kg | Objectif: ${profile.goal||"—"}

HABITUDES: ${habitList}
SCORES 7J: ${lastN(7).map(d=>`${d.slice(5)}:${score(d).pct}%`).join(" ")}
TÂCHES URGENTES: ${urgTasks.map(t=>t.title).join(", ")||"Aucune"}
SPORT RÉCENT: ${recentSport||"Aucun"}
OBJECTIFS 2026: ${(goals||[]).map(g=>`[${g.level}] ${g.title}`).join(" | ")||"Aucun"}

Sois précis, basé sur les vraies données.`;
  },[score,activeDayKey,body,tasks,sportLog,profile,habits,goals]);

  const send = async (overrideInput) => {
    const msg = overrideInput || input;
    if (!msg.trim() || loading) return;
    const userMsg = {role:"user", content:msg};
    setMsgs(prev => [...prev, userMsg]);
    if (!overrideInput) setInput("");

    // Local action parsing first — no network needed
    const action = parseAction(msg);
    if (action) {
      const result = executeAction(action);
      if (result) {
        setMsgs(prev => [...prev, {role:"assistant", content:result, action:true}]);
        return;
      }
    }

    // Free AI endpoint — with silent fallback to mock
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await callAI({
        system: buildCtx(),
        history: [...msgs, userMsg],
        signal: controller.signal,
      });
      const clean = (reply || "").trim();
      if (clean) {
        setMsgs(prev => [...prev, {role:"assistant", content: clean}]);
      } else {
        throw new Error("empty reply");
      }
    } catch {
      // Silent fallback — never show a raw error
      setMsgs(prev => [...prev, {role:"assistant", content: mockReply(msg, score(activeDayKey), body[activeDayKey]||{}, tasks, sportLog, habits)}]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input
  const voice = useVoiceInput({
    onResult: (text) => {
      setInput(text);
      // Auto-send after transcription
      setTimeout(() => send(text), 50);
    }
  });
  const recording = voice.state === "recording";

  const QUICK = [
    "Analyse ma semaine",
    "Mes priorités urgentes",
    "ajoute une tâche : appeler fournisseur",
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",fontFamily:FONT}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,padding:"4px 2px 8px"}}>
        {msgs.length === 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:10,animation:"fadeIn .3s"}}>
            <div style={{textAlign:"center",padding:"20px 8px 6px"}}>
              <div style={{display:"inline-flex",width:44,height:44,borderRadius:14,background:`linear-gradient(135deg, ${C.gold}22, ${C.green}16)`,border:`1px solid ${C.gold}30`,alignItems:"center",justifyContent:"center",marginBottom:10}}>
                <Icon name="sparkles" size={20} color={C.gold}/>
              </div>
              <div style={{fontSize:18,fontWeight:700,letterSpacing:-0.4,color:C.text}}>How can I help you?</div>
              <div style={{fontSize:12,color:C.text3,marginTop:6,lineHeight:1.6}}>Écris ou parle — je peux créer des tâches, habitudes, logger tes séances sport et analyser ta performance.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {QUICK.map(q=>(
                <button key={q} onClick={()=>send(q)} style={{textAlign:"left",padding:"10px 14px",borderRadius:10,background:C.card2,border:`1px solid ${C.border}`,color:C.text2,fontSize:13,cursor:"pointer",fontFamily:FONT}}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"88%",padding:"11px 14px",
              borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
              background: m.role==="user" ? C.gold : m.action ? C.green+"14" : C.card,
              color: m.role==="user" ? "#0a0a0a" : C.text,
              border: m.role==="assistant" ? `1px solid ${m.action?C.green+"30":C.border}` : "none",
              fontSize:14,lineHeight:1.55,whiteSpace:"pre-wrap",fontFamily:FONT
            }}>
              {m.content.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>
                part.startsWith("**")
                  ? <b key={i} style={{color:m.role==="user"?"#0a0a0a":m.action?C.green:C.gold,fontWeight:700}}>{part.slice(2,-2)}</b>
                  : <span key={i}>{part}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex"}}>
            <div style={{padding:"12px 16px",background:C.cardS,border:`1px solid ${C.border}`,borderRadius:"14px 14px 14px 4px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,display:"inline-block",animation:`b .8s ${i*.15}s infinite`}}/>)}
            </div>
          </div>
        )}
        {recording && (
          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{padding:"10px 14px",background:C.red+"14",border:`1px solid ${C.red}40`,borderRadius:20,fontSize:12,color:C.red,fontWeight:600,display:"inline-flex",alignItems:"center",gap:8}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:C.red,animation:"pulse 1.2s infinite"}}/>
              Écoute… {voice.partial && <span style={{color:C.text2,fontWeight:500,fontStyle:"italic"}}>"{voice.partial}"</span>}
            </div>
          </div>
        )}
        <div ref={bottom}/>
      </div>

      <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`1px solid ${C.border}`,background:"transparent",alignItems:"center"}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          disabled={recording}
          placeholder={recording ? "Écoute en cours…" : "Message ou commande…"}
          style={{flex:1,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"11px 14px",fontSize:14,outline:"none",fontFamily:FONT}}
        />
        {voice.supported && (
          <button
            type="button"
            onClick={recording ? voice.stop : voice.start}
            disabled={loading}
            title={recording ? "Arrêter" : "Voix"}
            aria-label={recording ? "Arrêter l'enregistrement" : "Entrée vocale"}
            style={{
              width:42,height:42,borderRadius:12,
              border:`1px solid ${recording?C.red:C.border2}`,
              background: recording ? C.red+"1a" : "transparent",
              color: recording ? C.red : C.text2,
              cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",
              transition:"all .15s",flexShrink:0,fontFamily:FONT,
              animation: recording ? "pulseRing 1.4s infinite" : "none",
            }}>
            <Icon name="mic" size={18}/>
          </button>
        )}
        <button
          onClick={()=>send()}
          disabled={loading || !input.trim()}
          aria-label="Envoyer"
          style={{
            width:42,height:42,borderRadius:12,border:"none",
            background: (loading||!input.trim()) ? C.border : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
            color:"#0a0a0a",cursor:(loading||!input.trim())?"not-allowed":"pointer",
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,fontFamily:FONT,transition:"all .15s"
          }}>
          <Icon name="send" size={16}/>
        </button>
      </div>
    </div>
  );
}

// ─── Global FloatingAgent: FAB + slide-up drawer, available on every page ──
function FloatingAgent(shared) {
  const [open, setOpen] = useState(false);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating action button — hidden while chat is open to avoid
          overlapping the send button. Use the top-right X inside the drawer to close. */}
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          aria-label="Ouvrir l'assistant"
          className="growth-fab"
          style={{
            position:"fixed", zIndex:420,
            width:56, height:56, borderRadius:"50%",
            background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
            border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 14px 36px -10px rgba(245,192,86,0.5), 0 0 0 4px rgba(245,192,86,0.08)",
            transition:"transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .2s",
            fontFamily: FONT,
          }}>
          <Icon name="sparkles" size={22} color="#0a0a0a"/>
        </button>
      )}

      {/* Backdrop + panel */}
      {open && (
        <>
          <div
            onClick={()=>setOpen(false)}
            style={{
              position:"fixed", inset:0, zIndex:410,
              background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
              animation:"fadeIn .18s ease-out",
            }}/>
          <div
            role="dialog"
            aria-label="Assistant IA"
            className="growth-agent-panel"
            onClick={e=>e.stopPropagation()}
            style={{
              position:"fixed", zIndex:415,
              background:C.card, border:`1px solid ${C.border2}`,
              display:"flex", flexDirection:"column",
              animation:"agentSlideUp .24s cubic-bezier(.2,.8,.2,1)",
              fontFamily: FONT,
            }}>
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"14px 16px",borderBottom:`1px solid ${C.border}`
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                <Icon name="sparkles" size={18} color={C.gold}/>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,letterSpacing:-0.3,color:C.text}}>Growth Agent</div>
                  <div style={{fontSize:10,color:C.text4,fontWeight:500,letterSpacing:0.3}}>Voix · Texte · Actions</div>
                </div>
              </div>
              <IconBtn name="x" onClick={()=>setOpen(false)} size={18}/>
            </div>
            <div style={{flex:1,minHeight:0,padding:"10px 14px 14px",display:"flex",flexDirection:"column"}}>
              <AgentChat {...shared}/>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ME (HUB)
// ═══════════════════════════════════════════════════════════════════════════════
function MeTab(props) {
  const [section, setSection] = useState("hub");
  if (section === "hub") return <MeHub setSection={setSection} {...props}/>;
  if (section === "routines") return <RoutineSection back={()=>setSection("hub")} {...props}/>;
  if (section === "focus") return <FocusSection back={()=>setSection("hub")} {...props}/>;
  if (section === "profile") return <ProfileSection back={()=>setSection("hub")} {...props}/>;
  if (section === "goals") return <GoalsSection back={()=>setSection("hub")} {...props}/>;
  return null;
}

function MeHub({setSection, habits, goals, profile, workSess}) {
  const focusMin = workSess.filter(s=>s.date===todayStr()).reduce((a,b)=>a+(b.duration||0),0);
  const cards = [
    {id:"routines", icon:"rotate",    title:"Routines",  sub:`${habits.length} habitudes · ${habits.filter(h=>h.nn).length} NN`, color:C.green},
    {id:"focus",    icon:"clock",     title:"Focus",     sub:`${fmtMin(focusMin)||"0m"} aujourd'hui`, color:C.gold},
    {id:"profile",  icon:"user",      title:"Profil",    sub:profile.age?`${profile.age} ans · ${profile.weight||"?"}kg`:"À compléter", color:C.text2},
    {id:"goals",    icon:"target",    title:"Objectifs 2026", sub:`${goals.length} objectif${goals.length>1?"s":""} définis`, color:C.gold},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div>
        <div style={{fontWeight:700,fontSize:22,lineHeight:1,letterSpacing:-0.5}}>Moi</div>
        <div style={{fontSize:12,color:C.text3,marginTop:4}}>Configure tes routines, objectifs et profil</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:10}}>
        {cards.map(c=>(
          <button key={c.id} onClick={()=>setSection(c.id)} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:18,cursor:"pointer",
            textAlign:"left",fontFamily:FONT,color:C.text,
            backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",
            boxShadow:"0 10px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
            transition:"transform .18s cubic-bezier(.2,.8,.2,1), border-color .2s, box-shadow .25s",
          }} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color+"50";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 18px 40px -18px ${c.color}44, inset 0 1px 0 rgba(255,255,255,0.04)`;}}
             onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 10px 30px -18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)";}}>
            <div style={{marginBottom:12}}><Icon name={c.icon} size={22} color={c.color}/></div>
            <div style={{fontSize:15,fontWeight:700,color:c.color,marginBottom:3,letterSpacing:-0.3}}>{c.title}</div>
            <div style={{fontSize:12,color:C.text3,fontWeight:500}}>{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const BackBtn = ({back,title}) => (
  <div style={{display:"flex",alignItems:"center",gap:12}}>
    <button onClick={back} style={{...navArrow,width:34,height:34}}><Icon name="chevL" size={18}/></button>
    <div style={{fontWeight:700,fontSize:22,letterSpacing:-0.5}}>{title}</div>
  </div>
);

function RoutineSection({back, habits, setHabits}) {
  const [form, setForm] = useState(null);
  const empty = {label:"",cat:"Discipline",freq:"daily",days:[],nn:false};
  const [d, setD] = useState(empty);

  const save = () => {
    if (!d.label.trim()) return;
    if (d.id) {
      setHabits(p => p.map(h => h.id===d.id ? {...h, ...d} : h));
    } else {
      // New habit: stamp creation date AND open the first active range so it
      // NEVER counts against days before it existed.
      const today = todayStr();
      setHabits(p => [...(p||[]), {
        ...d,
        id:"h"+Date.now(),
        createdAt: today,
        active: true,
        activeRanges: [{from: today, to: null}],
      }]);
    }
    setForm(null); setD(empty);
  };

  // Toggle active/inactive for an existing habit.
  // Inactive: close the currently-open range with today's date as `to`.
  // Active:   open a new range starting today.
  // Past days inside a previous active range remain counted — history unchanged.
  const toggleActive = (habit) => {
    const today = todayStr();
    setHabits(p => (p||[]).map(h => {
      if (h.id !== habit.id) return h;
      const ranges = Array.isArray(h.activeRanges) ? [...h.activeRanges] : [];
      const yesterday = addDays(today, -1);
      const wasActive = h.active !== false;
      if (wasActive) {
        // Deactivate — close open range at yesterday so today is already inactive.
        const idx = ranges.findIndex(r => !r.to);
        if (idx >= 0) ranges[idx] = {...ranges[idx], to: yesterday};
        else if (h.createdAt) ranges.push({from: h.createdAt, to: yesterday});
        return {...h, active: false, activeRanges: ranges};
      } else {
        // Reactivate — open a new range from today.
        ranges.push({from: today, to: null});
        return {...h, active: true, activeRanges: ranges, createdAt: h.createdAt || today};
      }
    }));
  };

  const grouped = habits.reduce((acc,h)=>{
    (acc[h.cat] = acc[h.cat]||[]).push(h); return acc;
  },{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <BackBtn back={back} title="Routines"/>
        <Btn onClick={()=>{setD(empty);setForm("new");}}><Icon name="plus" size={14}/> Ajouter</Btn>
      </div>

      {Object.entries(grouped).map(([cat,hs])=>{
        const c = CATS[cat]||{color:C.text3,icon:"check"};
        return (
          <Card key={cat}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <Icon name={c.icon} size={15} color={c.color}/>
              <span style={{fontSize:12,fontWeight:700,color:c.color,letterSpacing:0.6}}>{cat.toUpperCase()}</span>
              <span style={{fontSize:11,color:C.text4,marginLeft:"auto",fontWeight:500}}>{hs.length}</span>
            </div>
            {hs.map(h=>{
              const isActive = h.active !== false;
              return (
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:`1px solid ${C.border}`,opacity:isActive?1:0.55}}>
                  <div style={{width:3,height:30,background:isActive?c.color:C.grey,borderRadius:99,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500,fontSize:14,textDecoration:isActive?"none":"line-through"}}>{h.label}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>
                      {h.freq==="daily" ? "Quotidien" : (h.days||[]).map(i=>DAY_NAMES[i]).join(" · ")||"—"}
                      {h.nn && " · Non-négociable"}
                      {!isActive && " · Inactive"}
                    </div>
                  </div>
                  {/* Active toggle — INACTIVE hides from Today going forward without touching history */}
                  <button
                    onClick={()=>toggleActive(h)}
                    title={isActive?"Désactiver (masquer d'aujourd'hui)":"Réactiver"}
                    aria-label={isActive?"Désactiver":"Activer"}
                    style={{
                      position:"relative",width:34,height:20,borderRadius:999,
                      background:isActive?C.green+"40":C.border2,
                      border:`1px solid ${isActive?C.green+"66":C.border2}`,
                      cursor:"pointer",transition:"all .2s",flexShrink:0,padding:0,
                    }}>
                    <span style={{
                      position:"absolute",top:1,left:isActive?15:1,width:16,height:16,borderRadius:"50%",
                      background:isActive?C.green:C.text4,
                      transition:"left .2s, background .2s",
                      boxShadow:isActive?`0 0 8px ${C.green}aa`:"none",
                    }}/>
                  </button>
                  <IconBtn name="edit" onClick={()=>{setD({...h,days:h.days||[]});setForm("edit");}} title="Modifier"/>
                  <IconBtn name="trash" onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} title="Supprimer"/>
                </div>
              );
            })}
          </Card>
        );
      })}

      {form && (
        <Modal title={d.id?"Modifier la routine":"Nouvelle routine"} onClose={()=>setForm(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="NOM *" value={d.label} onChange={e=>setD(p=>({...p,label:e.target.value}))} placeholder="Ex: Méditation 10min"/>
            <FSelect label="CATÉGORIE" value={d.cat} onChange={e=>setD(p=>({...p,cat:e.target.value}))} options={Object.keys(CATS).map(k=>({value:k,label:k}))}/>
            <FSelect label="FRÉQUENCE" value={d.freq} onChange={e=>setD(p=>({...p,freq:e.target.value}))} options={[{value:"daily",label:"Quotidien"},{value:"specific",label:"Jours spécifiques"}]}/>
            {d.freq==="specific" && (
              <div>
                <div style={{fontSize:11,color:C.text3,fontWeight:600,marginBottom:8,letterSpacing:0.4}}>JOURS</div>
                <div style={{display:"flex",gap:6}}>
                  {DAY_NAMES.map((n,i)=>(
                    <button key={i} onClick={()=>setD(p=>({...p,days:p.days.includes(i)?p.days.filter(x=>x!==i):[...p.days,i]}))} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1px solid ${d.days.includes(i)?C.gold:C.border2}`,background:d.days.includes(i)?C.gold+"18":"transparent",color:d.days.includes(i)?C.gold:C.text3,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={()=>setD(p=>({...p,nn:!p.nn}))} style={{padding:"12px",borderRadius:10,border:`1px solid ${d.nn?C.red:C.border2}`,background:d.nn?C.red+"14":"transparent",color:d.nn?C.red:C.text3,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT,textAlign:"left"}}>
              <div style={{fontWeight:700,display:"inline-flex",alignItems:"center",gap:6}}>
                {d.nn && <Icon name="check" size={12}/>}Non-négociable
              </div>
              <div style={{fontSize:11,fontWeight:400,marginTop:3,opacity:0.85}}>Si ratée, score plafonné à 70%</div>
            </button>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setForm(null)} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={save} style={{flex:2}}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FocusSection({back, workSess, tasks, activeDayKey, focusTimer}) {
  // Timer state is global (lives at App root, persists to localStorage) — survives
  // tab navigation AND browser refresh. We only hold transient UI state here.
  const { state: tState, elapsedSec: elapsed, start: tStart, stop: tStop, updateMeta } = focusTimer;
  const running   = tState.running;
  const targetMin = tState.targetMin || 0;
  const selTask   = tState.selTask || "";
  const focus     = tState.focus || "";
  const [custom,setCustom] = useState("");

  const fmt = s=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const todayMin = workSess.filter(s=>s.date===activeDayKey).reduce((a,b)=>a+(b.duration||0),0);
  const weekMin = workSess.filter(s=>(new Date()-parseDate(s.date))/86400000<=7).reduce((a,b)=>a+(b.duration||0),0);

  const start = (min=0) => tStart(min, { selTask, focus });
  const stop  = () => tStop(activeDayKey);

  const pct = targetMin > 0 ? Math.min((elapsed/(targetMin*60))*100,100) : 0;
  const last7Work = lastN(7).map(d=>({d,min:workSess.filter(s=>s.date===d).reduce((a,b)=>a+(b.duration||0),0)}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <BackBtn back={back} title="Focus"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:800,color:C.gold,letterSpacing:-0.7}}>{fmtMin(todayMin)||"0m"}</div><div style={{fontSize:10,color:C.text4,fontWeight:500,marginTop:3}}>Aujourd'hui</div></Card>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:800,color:C.green,letterSpacing:-0.7}}>{fmtMin(weekMin)||"0m"}</div><div style={{fontSize:10,color:C.text4,fontWeight:500,marginTop:3}}>Cette semaine</div></Card>
      </div>
      <Card glow>
        {targetMin>0 && <div style={{marginBottom:12}}><PBar value={pct} color={C.gold} h={6}/><div style={{fontSize:10,color:C.text3,textAlign:"right",marginTop:3}}>{Math.round(pct)}% · {fmtMin(Math.max(0,targetMin-Math.floor(elapsed/60)))} restant</div></div>}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:40,fontWeight:800,fontVariantNumeric:"tabular-nums",flex:1,color:running?C.gold:C.text,letterSpacing:-1.5}}>{fmt(elapsed)}</div>
          {running ? <Btn onClick={()=>stop()} variant="danger" style={{padding:"10px 18px"}}><Icon name="stop" size={14}/> Stop</Btn>
                   : <Btn onClick={()=>start()} style={{padding:"10px 18px"}}><Icon name="play" size={14}/> Start</Btn>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          <FSelect label="TÂCHE LIÉE" value={selTask} onChange={e=>updateMeta({selTask:e.target.value})} options={[{value:"",label:"— Libre —"},...tasks.filter(t=>!t.done).map(t=>({value:t.title,label:t.title}))]}/>
          <FInput label="FOCUS" value={focus} onChange={e=>updateMeta({focus:e.target.value})} placeholder="Sur quoi tu te concentres ?"/>
        </div>
        <div style={{fontSize:11,fontWeight:600,color:C.text3,marginBottom:8,letterSpacing:0.4}}>BLOC RAPIDE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
          {[30,60,120].map(m=><Btn key={m} onClick={()=>start(m)} variant="ghost" disabled={running} style={{padding:"12px",fontSize:14,fontWeight:700}}>{m<60?`${m}m`:`${m/60}h`}</Btn>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} type="number" placeholder="Personnalisé (min)" style={{flex:1,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:FONT}}/>
          <Btn onClick={()=>custom&&start(Number(custom))} disabled={running} variant="ghost" style={{padding:"10px 14px"}}><Icon name="play" size={14}/></Btn>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:12}}>FOCUS · 7 JOURS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {last7Work.map(({d,min})=>{
            const maxM=Math.max(...last7Work.map(x=>x.min),120);
            return (
              <div key={d} style={{flex:1,textAlign:"center"}}>
                <div style={{height:`${Math.max(min>0?(min/maxM)*66:0,min>0?4:0)}px`,background:min>=120?C.gold:min>0?C.gold+"60":C.border,borderRadius:"4px 4px 0 0",marginBottom:4,transition:"height .5s"}}/>
                <div style={{fontSize:9,color:C.text4,fontWeight:500}}>{DAY_NAMES[parseDate(d).getDay()]}</div>
                {min>0&&<div style={{fontSize:9,color:C.text3}}>{fmtMin(min)}</div>}
              </div>
            );
          })}
        </div>
      </Card>
      {workSess.filter(s=>s.date===activeDayKey).length>0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:10}}>SESSIONS DU JOUR</div>
          {workSess.filter(s=>s.date===activeDayKey).map(s=>(
            <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <div><div style={{fontWeight:500}}>{s.task||s.focus||"Session libre"}</div>{s.focus&&s.task&&<div style={{fontSize:11,color:C.text3}}>{s.focus}</div>}</div>
              <span style={{color:C.gold,fontWeight:700}}>{fmtMin(s.duration)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ProfileSection({back, profile, setProfile}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <BackBtn back={back} title="Profil"/>
      <Card>
        <div style={{fontSize:11,fontWeight:600,color:C.text3,letterSpacing:0.6,marginBottom:14}}>DONNÉES PERSONNELLES</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FInput label="ÂGE" value={profile.age||""} onChange={e=>setProfile(p=>({...p,age:e.target.value}))} type="number" placeholder="25"/>
            <FInput label="POIDS (KG)" value={profile.weight||""} onChange={e=>setProfile(p=>({...p,weight:e.target.value}))} type="number" placeholder="75"/>
          </div>
          <FInput label="TAILLE (CM)" value={profile.height||""} onChange={e=>setProfile(p=>({...p,height:e.target.value}))} type="number" placeholder="180"/>
          <FText label="OBJECTIF PRINCIPAL" value={profile.goal||""} onChange={e=>setProfile(p=>({...p,goal:e.target.value}))} placeholder="Monaco-Nice, développer mon business…"/>
          <FInput label="BUSINESS / PROJETS ACTIFS" value={profile.business||""} onChange={e=>setProfile(p=>({...p,business:e.target.value}))} placeholder="Agency 5Stars, Visa Focus…"/>
        </div>
      </Card>
      <Card style={{background:C.green+"0a",border:`1px solid ${C.green}25`,fontSize:12,color:C.text2,lineHeight:1.6,display:"flex",alignItems:"flex-start",gap:10}}>
        <Icon name="sparkles" size={14} color={C.green} style={{flexShrink:0,marginTop:2}}/>
        <div>Ces données personnalisent les conseils de Growth Agent en temps réel — il les utilise dans chaque réponse.</div>
      </Card>
    </div>
  );
}

const GOAL_LEVELS = [
  {id:"short", label:"Court terme", sub:"1-3 mois", color:C.green},
  {id:"mid",   label:"Moyen terme", sub:"3-12 mois", color:C.gold},
  {id:"long",  label:"Long terme",  sub:"2026 entier", color:C.text2},
];

function GoalCard({g, color, onEdit, onDelete, onProgress}) {
  const t = parseFloat(g.target) || 0;
  const cu = parseFloat(g.current) || 0;
  const pct = t ? Math.min(Math.round((cu/t)*100), 100) : 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(cu));

  useEffect(()=>{ setDraft(String(cu)); }, [cu]);

  const commit = () => {
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0) onProgress(Math.round(v*100)/100);
    setEditing(false);
  };
  const step = (delta) => {
    const unit = t > 1000 ? 100 : t > 100 ? 10 : 1;
    const next = Math.max(0, Math.round((cu + delta*unit)*100)/100);
    onProgress(next);
  };

  return (
    <Card style={{padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:15,letterSpacing:-0.2}}>{g.title}</div>
          {g.why && <div style={{fontSize:12,color:C.text3,marginTop:4,fontStyle:"italic"}}>"{g.why}"</div>}
        </div>
        <div style={{display:"flex",gap:1,flexShrink:0}}>
          <IconBtn name="edit" onClick={onEdit}/>
          <IconBtn name="trash" onClick={onDelete}/>
        </div>
      </div>
      {t > 0 && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:C.text3,marginBottom:6,gap:8}}>
            <span style={{textTransform:"capitalize"}}>{g.metric||"Progression"}</span>
            <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
              <button onClick={()=>step(-1)} title="Diminuer" style={{
                width:26,height:26,borderRadius:8,border:`1px solid ${C.border2}`,
                background:C.card2,color:C.text2,cursor:"pointer",fontFamily:FONT,fontSize:14,fontWeight:700,padding:0
              }}>−</button>
              {editing ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={e=>setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape"){ setDraft(String(cu)); setEditing(false);} }}
                  type="number"
                  style={{
                    width:72,background:C.bg2,border:`1px solid ${color}60`,borderRadius:8,
                    color:color,padding:"4px 8px",fontSize:13,fontWeight:700,outline:"none",
                    textAlign:"center",fontFamily:FONT
                  }}/>
              ) : (
                <button onClick={()=>setEditing(true)} title="Modifier" style={{
                  minWidth:72,padding:"4px 10px",borderRadius:8,border:`1px solid ${C.border2}`,
                  background:"transparent",color:color,fontSize:13,fontWeight:700,cursor:"pointer",
                  fontFamily:FONT,letterSpacing:-0.2
                }}>{cu}<span style={{color:C.text4,fontWeight:500}}>/{t}</span></button>
              )}
              <button onClick={()=>step(1)} title="Augmenter" style={{
                width:26,height:26,borderRadius:8,border:`1px solid ${C.border2}`,
                background:C.card2,color:C.text2,cursor:"pointer",fontFamily:FONT,fontSize:14,fontWeight:700,padding:0
              }}>+</button>
              <span style={{fontWeight:700,color:color,marginLeft:4,letterSpacing:-0.2}}>{pct}%</span>
            </div>
          </div>
          <PBar value={pct} color={color} h={5}/>
        </>
      )}
      {g.dueDate && <div style={{fontSize:11,color:C.text4,marginTop:8,display:"inline-flex",alignItems:"center",gap:4}}><Icon name="calendar" size={11}/> {fmtShort(g.dueDate)}</div>}
    </Card>
  );
}

function GoalsSection({back, goals, setGoals}) {
  const [form, setForm] = useState(null);
  const empty = {title:"",why:"",metric:"",target:"",current:"0",level:"short",dueDate:""};
  const [d, setD] = useState(empty);

  const save = () => {
    if (!d.title.trim()) return;
    if (d.id) setGoals(p => p.map(g => g.id===d.id ? d : g));
    else setGoals(p => [...(p||[]), {...d, id:Date.now().toString(), createdAt:todayStr()}]);
    setForm(null); setD(empty);
  };

  const grouped = GOAL_LEVELS.map(lv => ({...lv, items: goals.filter(g => g.level === lv.id)}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <BackBtn back={back} title="Objectifs 2026"/>
        <Btn onClick={()=>{setD(empty);setForm("new");}}><Icon name="plus" size={14}/> Objectif</Btn>
      </div>

      {goals.length === 0 && (
        <Card style={{padding:20,background:`linear-gradient(135deg, ${C.gold}0a, transparent)`,border:`1px solid ${C.gold}25`}}>
          <div style={{fontSize:15,fontWeight:700,color:C.gold,marginBottom:8,display:"inline-flex",alignItems:"center",gap:8,letterSpacing:-0.3}}>
            <Icon name="target" size={16}/> Définis tes objectifs 2026
          </div>
          <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>
            Structure ta progression sur 3 horizons temporels.
          </div>
          <ul style={{margin:"10px 0 0",paddingLeft:18,fontSize:12,color:C.text3,lineHeight:1.7}}>
            <li><b style={{color:C.green}}>Court terme</b> : actions concrètes sur 1-3 mois</li>
            <li><b style={{color:C.gold}}>Moyen terme</b> : jalons importants 3-12 mois</li>
            <li><b style={{color:C.text2}}>Long terme</b> : vision 2026 entière</li>
          </ul>
        </Card>
      )}

      {grouped.map(lv => (
        <div key={lv.id}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 4px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:lv.color}}/>
            <div style={{fontSize:12,fontWeight:700,color:lv.color,letterSpacing:0.6}}>{lv.label.toUpperCase()}</div>
            <div style={{fontSize:11,color:C.text4,fontWeight:500}}>· {lv.sub}</div>
            <div style={{fontSize:11,color:C.text4,marginLeft:"auto",fontWeight:500}}>{lv.items.length}</div>
          </div>
          {lv.items.length === 0 ? (
            <Card style={{padding:"12px 14px",fontSize:12,color:C.text4,textAlign:"center",background:C.card2}}>Aucun objectif</Card>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {lv.items.map(g => (
                <GoalCard key={g.id} g={g} color={lv.color}
                  onEdit={()=>{setD({...g});setForm("edit");}}
                  onDelete={()=>setGoals(p=>p.filter(x=>x.id!==g.id))}
                  onProgress={(v)=>setGoals(p=>p.map(x=>x.id===g.id?{...x,current:String(v)}:x))}/>
              ))}
            </div>
          )}
        </div>
      ))}

      {form && (
        <Modal title={d.id?"Modifier l'objectif":"Nouvel objectif"} onClose={()=>setForm(null)} wide>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:C.green+"0a",border:`1px solid ${C.green}25`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.text2,lineHeight:1.6,display:"flex",alignItems:"flex-start",gap:8}}>
              <Icon name="sparkles" size={13} color={C.green} style={{flexShrink:0,marginTop:2}}/>
              <div><b>Un bon objectif est spécifique et mesurable.</b> Pas "gagner plus" mais "5 nouveaux clients d'ici juin".</div>
            </div>
            <FInput label="OBJECTIF *" value={d.title} onChange={e=>setD(p=>({...p,title:e.target.value}))} placeholder="Ex: Courir 180km au total (Monaco-Nice)"/>
            <FSelect label="HORIZON" value={d.level} onChange={e=>setD(p=>({...p,level:e.target.value}))} options={GOAL_LEVELS.map(l=>({value:l.id,label:`${l.label} · ${l.sub}`}))}/>
            <FText label="POURQUOI C'EST IMPORTANT ?" value={d.why} onChange={e=>setD(p=>({...p,why:e.target.value}))} placeholder="Raison profonde, motivation…" rows={2}/>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
              <FInput label="UNITÉ" value={d.metric} onChange={e=>setD(p=>({...p,metric:e.target.value}))} placeholder="km, clients, €…"/>
              <FInput label="CIBLE" value={d.target} onChange={e=>setD(p=>({...p,target:e.target.value}))} type="number" placeholder="180"/>
              <FInput label="ACTUEL" value={d.current} onChange={e=>setD(p=>({...p,current:e.target.value}))} type="number" placeholder="0"/>
            </div>
            <FInput label="ÉCHÉANCE" value={d.dueDate} onChange={e=>setD(p=>({...p,dueDate:e.target.value}))} type="date"/>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setForm(null)} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={save} style={{flex:2}}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
