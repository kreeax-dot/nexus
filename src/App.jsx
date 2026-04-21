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

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:     "#060a10",
  bg2:    "#0b1119",
  card:   "#10161f",
  card2:  "#0d131c",
  border: "#1c2230",
  border2:"#2a3142",
  text:   "#e8edf5",
  text2:  "#9ca3af",
  text3:  "#6b7280",
  text4:  "#4b5563",
  gold:   "#f5c056",
  goldD:  "#d4a73e",
  green:  "#10b981",
  greenD: "#0d9668",
  red:    "#ef4444",
  blue:   "#60a5fa",
  purple: "#a78bfa",
};

// ─── CATEGORIES (restructured: 5 clean cats + legacy alias) ──────────────────
const CATS = {
  Spiritual:  { color: "#a78bfa", emoji: "🕌" },
  Sport:      { color: "#10b981", emoji: "🏃" },
  Business:   { color: "#f5c056", emoji: "💼" },
  Health:     { color: "#60a5fa", emoji: "💧" },
  Discipline: { color: "#ef4444", emoji: "🔥" },
};
const CAT_ALIAS = {
  Spirituality: "Spiritual",
  Fitness:      "Sport",
  Work:         "Business",
  Mind:         "Discipline",
  Personal:     "Discipline",
};
const normCat = c => CAT_ALIAS[c] || (CATS[c] ? c : "Discipline");

// ─── PRIORITY (low/medium/high + legacy alias) ───────────────────────────────
const PRIORITY = {
  high:   { label: "Haute",   color: "#ef4444", order: 1 },
  medium: { label: "Moyenne", color: "#f5c056", order: 2 },
  low:    { label: "Basse",   color: "#10b981", order: 3 },
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

const SPORT_TYPES = ["Course 🏃","Gym 🏋️","Boxe 🥊","Vélo 🚴","Natation 🏊","Yoga 🧘","Marche 🚶","Autre"];
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
const isApplicable = (h, dk) => {
  const dow = parseDate(dk).getDay();
  return h.freq === "daily" || (h.freq === "specific" && (h.days || []).includes(dow));
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Card = ({children,style={},glow=false}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,
    boxShadow: glow ? "0 0 0 1px rgba(245,192,86,0.08), 0 6px 24px -12px rgba(245,192,86,0.15)" : "none",
    ...style}}>{children}</div>
);

const Btn = ({children,onClick,variant="primary",style={},disabled=false,type="button"}) => {
  const styles = {
    primary: {background:C.gold,color:"#000",fontWeight:800,boxShadow:"0 4px 14px -6px rgba(245,192,86,0.5)"},
    green:   {background:C.green,color:"#000",fontWeight:800,boxShadow:"0 4px 14px -6px rgba(16,185,129,0.5)"},
    ghost:   {background:C.card,color:C.text2,fontWeight:600,border:`1px solid ${C.border2}`},
    outline: {background:"transparent",color:C.text,fontWeight:600,border:`1px solid ${C.border2}`},
    danger:  {background:"rgba(239,68,68,.12)",color:C.red,fontWeight:600},
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{...styles[variant],border:styles[variant].border||"none",borderRadius:10,padding:"10px 16px",fontSize:13,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",opacity:disabled?0.5:1,transition:"all .15s",...style}}>{children}</button>;
};

const FInput = ({label,value,onChange,type="text",placeholder="",style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:700,letterSpacing:0.5}}>{label}</span>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",...style}} />
  </div>
);

const FText = ({label,value,onChange,rows=2,placeholder=""}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:700,letterSpacing:0.5}}>{label}</span>}
    <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical"}}/>
  </div>
);

const FSelect = ({label,value,onChange,options,style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:C.text3,fontWeight:700,letterSpacing:0.5}}>{label}</span>}
    <select value={value} onChange={onChange} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",...style}}>
      {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const PBar = ({value,max=100,color=C.gold,h=5}) => (
  <div style={{background:C.border,borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,borderRadius:99,transition:"width .8s ease"}}/>
  </div>
);

const Badge = ({children,color}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}40`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>
);

const Modal = ({title,onClose,children,wide=false}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:wide?780:640,maxHeight:"92vh",overflowY:"auto",border:`1px solid ${C.border2}`,borderBottom:"none"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontWeight:800,fontSize:18}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.text3,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
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
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${gid})`} stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
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

// ─── NAV ──────────────────────────────────────────────────────────────────────
const TABS = [
  {id:"today",   e:"☀",  l:"Today"},
  {id:"tasks",   e:"✓",  l:"Tasks"},
  {id:"analyse", e:"📊", l:"Analytics"},
  {id:"ai",      e:"✨", l:"Agent"},
  {id:"me",      e:"◉",  l:"Me"},
];

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

  // Normalize habit cats on the fly
  const nHabits = useMemo(()=> (habits||[]).map(h => ({...h, cat: normCat(h.cat)})), [habits]);

  const score = useCallback((dk) => {
    const comp = completions[dk] || {};
    const applicable = nHabits.filter(h => isApplicable(h, dk));
    if (!applicable.length) return {pct:0,done:0,total:0,nnOk:true,nnDone:0,nnTotal:0};
    const done = applicable.filter(h=>comp[h.id]).length;
    const nn = applicable.filter(h=>h.nn);
    const nnDone = nn.filter(h=>comp[h.id]).length;
    const nnBroken = nn.length > 0 && nnDone < nn.length;
    let pct = Math.round((done/applicable.length)*100);
    if (nnBroken) pct = Math.min(pct,70);
    return {pct,done,total:applicable.length,nnOk:!nnBroken,nnDone,nnTotal:nn.length};
  }, [nHabits, completions]);

  // Rolling habit rate since first completion — fixes "1/7=14%" bug
  const habitRate = useCallback((habit, windowDays=30, endKey=todayStr()) => {
    const id = habit.id;
    const firstDates = Object.keys(completions).filter(dk => completions[dk]?.[id]).sort();
    if (!firstDates.length) return {rate: 0, done: 0, total: 0, firstSeen: null};
    const first = firstDates[0];
    // Window = max(first, endKey-windowDays+1)
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
    return {rate, done, total: applicable, firstSeen: first};
  }, [completions]);

  const toggle = useCallback((id, dk) => {
    const k = dk || activeDayKey;
    setComp(prev => ({...prev, [k]: {...(prev[k]||{}), [id]: !(prev[k]||{})[id]}}));
  }, [activeDayKey, setComp]);

  if (!ready) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <Logo size={48}/>
      <div style={{color:C.text3,fontSize:12,letterSpacing:2,fontWeight:700,marginTop:6}}>GROWTH</div>
      <div style={{width:28,height:28,border:`2px solid ${C.gold}`,borderTopColor:"transparent",borderRadius:"50%",animation:"sp 1s linear infinite"}}/>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const todayScore = score(activeDayKey);

  const shared = {
    habits:nHabits, setHabits, completions, setComp, toggle, score, habitRate,
    tasks, setTasks, projects, setProjects, body, setBody,
    workSess, setWorkSess, journal, setJournal, profile, setProfile,
    sportLog, setSportLog, goals, setGoals,
    activeDayKey, setActiveDayKey, setTab,
  };

  return (
    <div className="growth-app">
      <aside className="growth-side">
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 8px 18px"}}>
          <Logo size={34}/>
          <div>
            <div style={{fontWeight:900,fontSize:18,letterSpacing:-0.5,lineHeight:1,color:C.text}}>Growth</div>
            <div style={{fontSize:9,color:C.text4,fontWeight:700,letterSpacing:2}}>PERFORMANCE OS</div>
          </div>
        </div>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className="growth-side-tab" style={{
            background: tab===t.id ? `linear-gradient(90deg, ${C.gold}22, transparent)` : "transparent",
            color: tab===t.id ? C.gold : C.text2,
            borderLeft: tab===t.id ? `2px solid ${C.gold}` : "2px solid transparent",
          }}>
            <span style={{fontSize:16,width:20,textAlign:"center"}}>{t.e}</span>
            <span style={{fontSize:13,fontWeight:600}}>{t.l}</span>
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{padding:"12px 10px",fontSize:11,color:C.text4,borderTop:`1px solid ${C.border}`}}>
          <div style={{marginBottom:4}}>Score du jour</div>
          <div style={{fontSize:22,fontWeight:900,color:todayScore.nnOk?C.gold:C.red}}>{todayScore.pct}%</div>
        </div>
      </aside>

      <div className="growth-column">
        <header className="growth-header">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div className="growth-header-logo"><Logo size={30}/></div>
            <div>
              <div style={{fontWeight:900,fontSize:16,letterSpacing:-0.5,lineHeight:1}}>Growth</div>
              <div style={{fontSize:9,color:C.text4,fontWeight:700,letterSpacing:2}}>PERFORMANCE OS</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:900,color:todayScore.nnOk?C.gold:C.red,lineHeight:1}}>{todayScore.pct}%</div>
            <div style={{fontSize:10,color:C.text4}}>{todayScore.done}/{todayScore.total} today</div>
          </div>
        </header>

        <main className="growth-main">
          {tab==="today"   && <TodayTab {...shared}/>}
          {tab==="tasks"   && <TasksTab {...shared}/>}
          {tab==="analyse" && <AnalyseTab {...shared}/>}
          {tab==="ai"      && <AITab {...shared}/>}
          {tab==="me"      && <MeTab {...shared}/>}
        </main>

        <nav className="growth-bottom">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 10px",color:tab===t.id?C.gold:C.text4,transition:"color .2s"}}>
              <span style={{fontSize:18,opacity:tab===t.id?1:0.55}}>{t.e}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:0.5}}>{t.l.toUpperCase()}</span>
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        *{box-sizing:border-box}
        body{margin:0;background:${C.bg}}
        input,select,textarea{font-family:inherit}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:99px}
        input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:99px;outline:none;background:${C.border2}}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;background:${C.gold}}
        input[type=date],input[type=time]{color-scheme:dark}
        button:hover:not(:disabled){filter:brightness(1.08)}

        .growth-app{min-height:100vh;background:${C.bg};color:${C.text};font-family:'Inter',-apple-system,sans-serif;display:flex}
        .growth-side{display:none;width:230px;flex-direction:column;padding:18px 14px;border-right:1px solid ${C.border};position:sticky;top:0;height:100vh}
        .growth-side-tab{display:flex;align-items:center;gap:12px;padding:11px 12px;margin-bottom:2px;border:none;background:none;cursor:pointer;border-radius:10px;text-align:left;font-family:inherit}
        .growth-column{flex:1;display:flex;flex-direction:column;min-width:0;max-width:100%}
        .growth-header{padding:14px 20px 10px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:${C.bg};z-index:100}
        .growth-header-logo{display:block}
        .growth-main{flex:1;padding:20px 18px 12px;overflow-y:auto;max-width:920px;width:100%;margin:0 auto}
        .growth-bottom{border-top:1px solid ${C.border};background:${C.bg};position:sticky;bottom:0;z-index:100;display:flex;justify-content:space-around;padding:8px 0 14px}

        @media (min-width: 980px) {
          .growth-side{display:flex}
          .growth-header{display:none}
          .growth-bottom{display:none}
          .growth-main{padding:28px 32px}
        }
        @keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY
// ═══════════════════════════════════════════════════════════════════════════════
function TodayTab({habits,completions,toggle,activeDayKey,setActiveDayKey,score,body,setBody,journal,setJournal,tasks,workSess}) {
  const [viewDay, setViewDay] = useState(activeDayKey);
  useEffect(()=>{ setViewDay(activeDayKey); }, [activeDayKey]);

  const [closeModal, setCloseModal] = useState(false);
  const [wakeTime, setWakeTime] = useState("");
  const [bedTime, setBedTime] = useState("");
  const [sleepH, setSleepH] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [win, setWin] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const isActive = viewDay === activeDayKey;
  const isFuture = viewDay > todayStr();
  const todayComp = completions[viewDay] || {};
  const sc = score(viewDay);
  const workMin = workSess.filter(s=>s.date===viewDay).reduce((a,b)=>a+(b.duration||0),0);
  const todayTasks = tasks.filter(t=>!t.done && t.scheduledFor===viewDay);
  const dayBody = body[viewDay] || {};

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

  const handleClose = () => {
    if (wakeTime || bedTime || sleepH)
      setBody(prev => ({...prev, [activeDayKey]: {
        ...(prev[activeDayKey]||{}),
        ...(wakeTime?{wakeTime}:{}),
        ...(bedTime?{bedTime}:{}),
        ...(sleepH?{sleep:parseFloat(sleepH)}:{})
      }}));
    if (gratitude || win)
      setJournal(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),gratitude,win}}));
    const next = addDays(activeDayKey, 1);
    setActiveDayKey(next);
    setCloseModal(false);
    setWakeTime(""); setSleepH(""); setBedTime(""); setGratitude(""); setWin("");
  };

  const toggleCat = c => setCollapsed(p => ({...p, [c]: !p[c]}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      {/* Header with date navigation */}
      <Card style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <button onClick={()=>setViewDay(addDays(viewDay,-1))} style={navArrow}>‹</button>
          <div style={{textAlign:"center",flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:17,lineHeight:1.1,textTransform:"capitalize"}}>{relativeLabel()}</div>
            <div style={{fontSize:11,color:C.text3,marginTop:3,textTransform:"capitalize"}}>{fmtDate(viewDay)}</div>
          </div>
          <button onClick={()=>setViewDay(addDays(viewDay,1))} style={navArrow} disabled={isFuture}>›</button>
        </div>
        {!isActive && (
          <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
            <Btn onClick={()=>setViewDay(activeDayKey)} variant="outline" style={{padding:"6px 14px",fontSize:12}}>↩ Revenir au jour actif</Btn>
          </div>
        )}
      </Card>

      {/* Score stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card style={{padding:14,textAlign:"center"}}>
          <div style={{fontSize:30,fontWeight:900,color:sc.nnOk?C.gold:C.red,lineHeight:1}}>{sc.pct}%</div>
          <div style={{fontSize:10,color:C.text4,fontWeight:700,letterSpacing:1,marginTop:4}}>SCORE · {sc.done}/{sc.total}</div>
        </Card>
        <Card style={{padding:14,textAlign:"center",border:`1px solid ${sc.nnOk?C.border:C.red+"40"}`}}>
          <div style={{fontSize:30,fontWeight:900,color:sc.nnOk?C.green:C.red,lineHeight:1}}>{sc.nnDone}/{sc.nnTotal}</div>
          <div style={{fontSize:10,color:C.text4,fontWeight:700,letterSpacing:1,marginTop:4}}>NON-NÉGOCIABLES</div>
        </Card>
      </div>

      {!sc.nnOk && (
        <div style={{background:"rgba(239,68,68,0.08)",border:`1px solid ${C.red}40`,borderRadius:12,padding:"10px 14px",fontSize:12,color:C.red,fontWeight:600}}>
          ⚠ Standard brisé — score plafonné à 70%
        </div>
      )}

      {(workMin>0||todayTasks.length>0||dayBody.sleep) && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",gap:8}}>
          {workMin>0 && <Card style={{padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.blue}}>{fmtMin(workMin)}</div><div style={{fontSize:10,color:C.text4}}>Focus</div></Card>}
          {todayTasks.length>0 && <Card style={{padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.red}}>{todayTasks.length}</div><div style={{fontSize:10,color:C.text4}}>Tâches du jour</div></Card>}
          {dayBody.sleep && <Card style={{padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.purple}}>{dayBody.sleep}h</div><div style={{fontSize:10,color:C.text4}}>Sommeil</div></Card>}
        </div>
      )}

      {/* Categories */}
      {Object.entries(byCategory).map(([cat,hs])=>{
        const c = CATS[cat]||{color:"#888",emoji:"•"};
        const done = hs.filter(h=>todayComp[h.id]).length;
        const isCollapsed = !!collapsed[cat];
        return (
          <Card key={cat} style={{padding:14}}>
            <button onClick={()=>toggleCat(cat)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",color:C.text,fontFamily:"inherit",marginBottom:isCollapsed?0:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15}}>{c.emoji}</span>
                <span style={{fontSize:12,fontWeight:700,color:c.color,letterSpacing:0.8}}>{cat.toUpperCase()}</span>
                <span style={{fontSize:11,color:C.text4,marginLeft:4}}>{done}/{hs.length}</span>
              </div>
              <span style={{color:C.text3,fontSize:14,transform:isCollapsed?"rotate(-90deg)":"none",transition:"transform .2s"}}>⌄</span>
            </button>
            {!isCollapsed && (
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {hs.map(h=>{
                  const checked = !!todayComp[h.id];
                  return (
                    <button key={h.id} onClick={()=>toggle(h.id, viewDay)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:checked?c.color+"14":C.card2,border:`1px solid ${checked?c.color+"50":C.border}`,borderRadius:11,cursor:"pointer",color:C.text,transition:"all .15s",textAlign:"left",fontFamily:"inherit"}}>
                      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked?c.color:C.border2}`,background:checked?c.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {checked && <span style={{fontSize:11,color:"#000",fontWeight:900}}>✓</span>}
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

      {todayTasks.length>0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:10}}>TÂCHES DU JOUR</div>
          {todayTasks.map(t=>{
            const p = PRIORITY[normPrio(t.urgency||t.priority)];
            return (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                <span style={{flex:1,fontWeight:500}}>{t.title}</span>
                {t.project && <Badge color={C.blue}>{t.project}</Badge>}
              </div>
            );
          })}
        </Card>
      )}

      {isActive && (
        <button onClick={()=>setCloseModal(true)} style={{background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,color:"#000",border:"none",borderRadius:14,padding:"15px",fontSize:15,fontWeight:800,cursor:"pointer",width:"100%",marginTop:4,fontFamily:"inherit",boxShadow:"0 8px 24px -10px rgba(245,192,86,0.4)"}}>
          Clôturer ma journée 🌙
        </button>
      )}

      {closeModal && (
        <Modal title="Clôture de journée" onClose={()=>setCloseModal(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:C.bg2,borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:13,color:C.text3,marginBottom:4}}>Score du jour</div>
              <div style={{fontSize:40,fontWeight:900,color:sc.nnOk?C.gold:C.red}}>{sc.pct}%</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="⏰ Heure de réveil" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} type="time"/>
              <FInput label="🛏 Heure de coucher" value={bedTime} onChange={e=>setBedTime(e.target.value)} type="time"/>
            </div>
            <FInput label="😴 Durée sommeil (heures)" value={sleepH} onChange={e=>setSleepH(e.target.value)} type="number" placeholder="7.5"/>
            <FText label="🙏 Gratitudes" value={gratitude} onChange={e=>setGratitude(e.target.value)} placeholder="Je suis reconnaissant pour..."/>
            <FInput label="⭐ Victoire du jour" value={win} onChange={e=>setWin(e.target.value)} placeholder="Ma plus grande victoire..."/>
            <Btn onClick={handleClose} style={{width:"100%",padding:"14px",fontSize:15}}>Confirmer & ouvrir demain →</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navArrow = {
  width:34,height:34,borderRadius:10,border:`1px solid ${C.border2}`,
  background:C.card2,color:C.text2,fontSize:22,cursor:"pointer",fontFamily:"inherit",lineHeight:1,
  display:"flex",alignItems:"center",justifyContent:"center"
};

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS (new dedicated tab)
// ═══════════════════════════════════════════════════════════════════════════════
function TasksTab({tasks,setTasks,projects,setProjects}) {
  const [form, setForm] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [projectForm, setProjectForm] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [filter, setFilter] = useState("all"); // all | project name | done
  const [showDone, setShowDone] = useState(false);

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

  displayed = [...displayed].sort((a,b)=>{
    const pa = PRIORITY[normPrio(a.priority||a.urgency)].order;
    const pb = PRIORITY[normPrio(b.priority||b.urgency)].order;
    if (pa !== pb) return pa - pb;
    return (a.scheduledFor||"9999") > (b.scheduledFor||"9999") ? 1 : -1;
  });

  const byProject = filter === "all" && !showDone
    ? displayed.reduce((acc,t)=>{ const k = t.project||"Sans projet"; (acc[k]=acc[k]||[]).push(t); return acc; }, {})
    : null;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:800,fontSize:22,lineHeight:1}}>Tâches</div>
          <div style={{fontSize:12,color:C.text3,marginTop:2}}>{active.length} actives · {done.length} terminées</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>{setD(empty);setEditTask(null);setForm("new");}} style={{padding:"8px 14px"}}>+ Tâche</Btn>
          <Btn onClick={()=>setProjectForm(true)} variant="ghost" style={{padding:"8px 14px"}}>+ Projet</Btn>
        </div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <FilterChip active={filter==="all"} onClick={()=>setFilter("all")}>Toutes</FilterChip>
        {allProjects.map(p =>
          <FilterChip key={p} active={filter===p} color={C.blue} onClick={()=>setFilter(p)}>{p}</FilterChip>
        )}
        <div style={{flex:1}}/>
        <FilterChip active={showDone} onClick={()=>setShowDone(x=>!x)} color={C.green}>{showDone?"Terminées":"Actives"}</FilterChip>
      </div>

      {displayed.length === 0 && (
        <Card style={{padding:30,textAlign:"center",color:C.text3}}>
          <div style={{fontSize:36,marginBottom:8,opacity:0.4}}>✓</div>
          <div style={{fontSize:14,fontWeight:600}}>{showDone?"Aucune tâche terminée":"Aucune tâche active"}</div>
          <div style={{fontSize:12,color:C.text4,marginTop:4}}>Ajoute ta première tâche pour commencer</div>
        </Card>
      )}

      {byProject ? Object.entries(byProject).map(([proj, ts])=>(
        <div key={proj}>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:8,padding:"0 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{proj === "Sans projet" ? "SANS PROJET" : proj.toUpperCase()} · {ts.length}</span>
            {proj !== "Sans projet" && projects.includes(proj) && (
              <button onClick={()=>removeProject(proj)} style={{background:"none",border:"none",color:C.text4,fontSize:11,cursor:"pointer"}}>supprimer projet</button>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ts.map(t => <TaskCard key={t.id} task={t} setTasks={setTasks} onEdit={()=>{setD({title:t.title,priority:normPrio(t.priority||t.urgency),project:t.project||"",scheduledFor:t.scheduledFor||"",notes:t.notes||""});setEditTask(t);setForm("edit");}}/>)}
          </div>
        </div>
      )) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {displayed.map(t => <TaskCard key={t.id} task={t} setTasks={setTasks} onEdit={()=>{setD({title:t.title,priority:normPrio(t.priority||t.urgency),project:t.project||"",scheduledFor:t.scheduledFor||"",notes:t.notes||""});setEditTask(t);setForm("edit");}}/>)}
        </div>
      )}

      {form && (
        <Modal title={editTask?"Modifier la tâche":"Nouvelle tâche"} onClose={()=>{setForm(null);setEditTask(null);}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="Titre *" value={d.title} onChange={e=>setD(p=>({...p,title:e.target.value}))} placeholder="Que faut-il faire ?"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FSelect label="Priorité" value={d.priority} onChange={e=>setD(p=>({...p,priority:e.target.value}))} options={Object.entries(PRIORITY).map(([k,v])=>({value:k,label:v.label}))}/>
              <FSelect label="Projet" value={d.project} onChange={e=>setD(p=>({...p,project:e.target.value}))} options={[{value:"",label:"— Aucun —"},...allProjects.map(p=>({value:p,label:p}))]}/>
            </div>
            <FInput label="Échéance (optionnel)" value={d.scheduledFor} onChange={e=>setD(p=>({...p,scheduledFor:e.target.value}))} type="date"/>
            <FText label="Notes" value={d.notes} onChange={e=>setD(p=>({...p,notes:e.target.value}))}/>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>{setForm(null);setEditTask(null);}} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={save} style={{flex:2}}>Enregistrer</Btn>
            </div>
            {editTask && (
              <Btn onClick={()=>{setTasks(p=>p.filter(x=>x.id!==editTask.id));setForm(null);setEditTask(null);}} variant="danger" style={{width:"100%"}}>Supprimer la tâche</Btn>
            )}
          </div>
        </Modal>
      )}

      {projectForm && (
        <Modal title="Nouveau projet" onClose={()=>setProjectForm(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="Nom du projet" value={newProject} onChange={e=>setNewProject(e.target.value)} placeholder="Agency 5Stars, Visa Focus..."/>
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

const FilterChip = ({children,active,onClick,color}) => (
  <button onClick={onClick} style={{
    padding:"6px 12px",borderRadius:20,border:`1px solid ${active?(color||C.gold):C.border2}`,
    background: active ? (color||C.gold)+"22" : "transparent",
    color: active ? (color||C.gold) : C.text3,
    fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"
  }}>{children}</button>
);

const TaskCard = ({task,setTasks,onEdit}) => {
  const p = PRIORITY[normPrio(task.priority||task.urgency)];
  const due = task.scheduledFor;
  const isOverdue = due && due < todayStr() && !task.done;
  return (
    <Card style={{padding:12}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <button onClick={()=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,done:!t.done}:t))} style={{
          width:20,height:20,borderRadius:6,border:`2px solid ${task.done?C.green:p.color}`,
          background:task.done?C.green:"transparent",cursor:"pointer",flexShrink:0,marginTop:2,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          {task.done && <span style={{fontSize:11,color:"#000",fontWeight:900}}>✓</span>}
        </button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:14,textDecoration:task.done?"line-through":"none",color:task.done?C.text3:C.text}}>{task.title}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:5}}>
            <Badge color={p.color}>{p.label}</Badge>
            {task.project && <Badge color={C.blue}>{task.project}</Badge>}
            {due && <Badge color={isOverdue?C.red:C.text3}>📅 {fmtShort(due)}</Badge>}
          </div>
          {task.notes && <div style={{fontSize:12,color:C.text3,marginTop:6}}>{task.notes}</div>}
        </div>
        <div style={{display:"flex",gap:2}}>
          <button onClick={onEdit} style={iconBtn}>✏</button>
          <button onClick={()=>setTasks(p=>p.filter(x=>x.id!==task.id))} style={iconBtn}>🗑</button>
        </div>
      </div>
    </Card>
  );
};

const iconBtn = {background:"none",border:"none",cursor:"pointer",fontSize:14,padding:4,color:C.text3,fontFamily:"inherit"};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyseTab({habits,completions,body,workSess,score,habitRate}) {
  const [period, setPeriod] = useState("30d");
  const [filter, setFilter] = useState("all");
  const [monthOffset, setMonthOffset] = useState(0);

  const nDays = period==="7d"?7:period==="30d"?30:90;
  const days = lastN(nDays);
  const scores = days.map(d=>({d,...score(d)}));
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b.pct,0)/scores.length) : 0;

  // Previous window for comparison
  const prevDays = Array.from({length:nDays},(_,i)=>addDays(todayStr(),-(nDays*2-1-i)));
  const prevAvg = Math.round(prevDays.map(d=>score(d).pct).reduce((a,b)=>a+b,0)/nDays);
  const diff = avg - prevAvg;

  // Fixed habit rate using rolling since first completion
  const habitRates = useMemo(()=> habits.map(h => ({...h, ...habitRate(h, 30)})).sort((a,b)=>b.rate-a.rate), [habits, habitRate]);

  const filtered = filter==="all" ? habitRates : habitRates.filter(h=>h.cat===filter);

  const catAvg = Object.keys(CATS).map(cat => {
    const hs = habitRates.filter(h=>h.cat===cat && h.firstSeen);
    return {cat, avg: hs.length?Math.round(hs.reduce((a,b)=>a+b.rate,0)/hs.length):0, color:CATS[cat].color, emoji:CATS[cat].emoji};
  }).filter(c=>c.avg>0).sort((a,b)=>b.avg-a.avg);

  const bodyDays = days.filter(d=>body[d]);
  const avgEnergy = bodyDays.length ? (bodyDays.reduce((a,d)=>a+(body[d].energy||5),0)/bodyDays.length).toFixed(1) : "—";
  const avgSleep  = bodyDays.length ? (bodyDays.reduce((a,d)=>a+(body[d].sleep||7),0)/bodyDays.length).toFixed(1) : "—";
  const workMin   = days.reduce((a,d)=>a+workSess.filter(s=>s.date===d).reduce((x,y)=>x+(y.duration||0),0),0);
  const perfectDays = scores.filter(s=>s.pct>=90).length;
  const best = scores.reduce((b,s)=>s.pct>(b?.pct||0)?s:b,null);

  // Month view for heatmap
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const y = targetMonth.getFullYear(), m = targetMonth.getMonth();
  const monthDays = monthRange(y, m);
  const firstDow = new Date(y, m, 1).getDay();
  const monthName = targetMonth.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:22}}>Analytics</div>
        <div style={{display:"flex",gap:6}}>
          {[["7d","7j"],["30d","30j"],["90d","90j"]].map(([p,l])=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 12px",borderRadius:20,border:"none",background:period===p?C.gold:C.card,color:period===p?"#000":C.text3,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Hero score card */}
      <Card glow style={{background:`linear-gradient(135deg, ${C.card}, ${C.card2})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:C.text3,fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE MOYEN</div>
            <div style={{fontSize:54,fontWeight:900,color:avg>=80?C.green:avg>=60?C.gold:C.red,lineHeight:1}}>{avg}%</div>
            <div style={{fontSize:12,color:diff>=0?C.green:C.red,fontWeight:700,marginTop:6}}>
              {diff>=0?"▲":"▼"} {Math.abs(diff)}% vs période précédente
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:900,color:C.gold}}>{perfectDays}</div>
            <div style={{fontSize:10,color:C.text4}}>jours parfaits</div>
            <div style={{fontSize:22,fontWeight:900,color:C.purple,marginTop:8}}>{best?.pct||0}%</div>
            <div style={{fontSize:10,color:C.text4}}>meilleur jour</div>
          </div>
        </div>
        <Sparkline data={scores.map(s=>s.pct)} color={avg>=70?C.green:C.gold} h={60}/>
      </Card>

      {/* Monthly heatmap */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1}}>HEATMAP · <span style={{textTransform:"capitalize",color:C.text2}}>{monthName}</span></div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setMonthOffset(o=>o-1)} style={{...navArrow,width:28,height:28,fontSize:16}}>‹</button>
            <button onClick={()=>setMonthOffset(0)} disabled={monthOffset===0} style={{...navArrow,width:"auto",height:28,padding:"0 10px",fontSize:11,fontWeight:700,opacity:monthOffset===0?0.4:1}}>Actuel</button>
            <button onClick={()=>setMonthOffset(o=>Math.min(0,o+1))} disabled={monthOffset>=0} style={{...navArrow,width:28,height:28,fontSize:16,opacity:monthOffset>=0?0.4:1}}>›</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:4,marginBottom:8}}>
          {DAY_NAMES.map((d,i)=><div key={i} style={{fontSize:9,color:C.text4,textAlign:"center",fontWeight:700,padding:"3px 0"}}>{d}</div>)}
          {Array.from({length:firstDow}).map((_,i)=><div key={"e"+i}/>)}
          {monthDays.map(dk=>{
            const s = score(dk);
            const today = dk === todayStr();
            const future = dk > todayStr();
            const bg = future ? C.bg2
              : s.pct === 0 ? C.border
              : s.pct < 40 ? "#78350f"
              : s.pct < 70 ? "#92400e"
              : s.pct < 90 ? C.goldD
              : C.gold;
            return (
              <div key={dk} title={`${fmtShort(dk)}: ${future?"—":s.pct+"%"}`} style={{
                aspectRatio:"1", borderRadius:6, background:bg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:10,fontWeight:800,
                color: s.pct>=70?"#000":C.text3,
                border: today ? `2px solid ${C.green}` : "none",
                opacity: future?0.3:1
              }}>{future?"":(s.pct>0?new Date(dk+"T12:00").getDate():"")}</div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,alignItems:"center",fontSize:10,color:C.text4}}>
          <span>0</span>
          {[C.border,"#78350f","#92400e",C.goldD,C.gold].map((c,i)=><div key={i} style={{width:14,height:14,borderRadius:3,background:c}}/>)}
          <span>100%</span>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,border:`2px solid ${C.green}`}}/> Aujourd'hui</div>
        </div>
      </Card>

      {/* KPI grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:8}}>
        {[
          {l:"Focus travail",v:fmtMin(workMin)||"0m",c:C.blue},
          {l:"Énergie moy.",v:`${avgEnergy}/10`,c:C.gold},
          {l:"Sommeil moy.",v:`${avgSleep}h`,c:C.purple},
          {l:"Jours ≥90%",v:perfectDays,c:C.green},
        ].map(m=>(
          <Card key={m.l} style={{padding:14,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:m.c}}>{m.v}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.text4,marginTop:2}}>{m.l}</div>
          </Card>
        ))}
      </div>

      {/* By category */}
      {catAvg.length > 0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:12}}>PAR CATÉGORIE (30j glissants)</div>
          {catAvg.map(c=>(
            <div key={c.cat} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                <span>{c.emoji} {c.cat}</span>
                <span style={{fontWeight:800,color:c.color}}>{c.avg}%</span>
              </div>
              <PBar value={c.avg} color={c.color} h={6}/>
            </div>
          ))}
        </Card>
      )}

      {/* Habit detail with fixed scoring */}
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:10}}>HABITUDES · 30 JOURS GLISSANTS</div>
        <div style={{fontSize:11,color:C.text4,marginBottom:10,lineHeight:1.5}}>
          📈 Calcul: depuis la <b>première complétion</b> de l'habitude, sur les 30 derniers jours applicables.
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          <FilterChip active={filter==="all"} onClick={()=>setFilter("all")}>Toutes</FilterChip>
          {Object.keys(CATS).map(cat=>(
            <FilterChip key={cat} active={filter===cat} onClick={()=>setFilter(cat)} color={CATS[cat].color}>{CATS[cat].emoji} {cat}</FilterChip>
          ))}
        </div>
        {filtered.map((h,i)=>(
          <div key={h.id} style={{marginBottom:12,opacity:h.firstSeen?1:0.45}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flex:1,minWidth:0}}>
                <span style={{color:C.text4,fontSize:11,width:18,flexShrink:0}}>{i+1}</span>
                <span style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.label}</span>
                {h.nn&&<Badge color={C.red}>NN</Badge>}
              </div>
              <span style={{fontWeight:800,color:!h.firstSeen?C.text4:h.rate>=80?C.green:h.rate>=50?C.gold:C.red,marginLeft:8}}>
                {h.firstSeen ? `${h.rate}%` : "—"}
              </span>
            </div>
            <PBar value={h.firstSeen?h.rate:0} color={h.rate>=80?C.green:h.rate>=50?C.gold:C.red} h={4}/>
            {h.firstSeen && (
              <div style={{fontSize:10,color:C.text4,marginTop:3}}>{h.done}/{h.total} depuis {fmtShort(h.firstSeen)}</div>
            )}
          </div>
        ))}
      </Card>

      {/* To improve */}
      {habitRates.filter(h=>h.firstSeen && h.rate<60).length>0&&(
        <Card style={{border:`1px solid ${C.red}30`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.red,letterSpacing:1,marginBottom:10}}>⚠ À AMÉLIORER</div>
          {habitRates.filter(h=>h.firstSeen && h.rate<60).slice(0,5).map(h=>(
            <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:600}}>{h.label} <span style={{color:C.text3,fontSize:11}}>· {h.cat}</span></div>
              <Badge color={C.red}>{h.rate}%</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI AGENT (actionable)
// ═══════════════════════════════════════════════════════════════════════════════
function AITab({habits,setHabits,completions,toggle,body,workSess,tasks,setTasks,projects,setProjects,profile,score,habitRate,activeDayKey,sportLog,setSportLog,goals}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sportForm, setSportForm] = useState(false);
  const [sport, setSport] = useState({type:"Course 🏃",date:activeDayKey,duration:"",distance:"",intensity:3,notes:""});
  const bottom = useRef(null);

  useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  // ──────── LOCAL ACTION PARSER ────────
  // Parses user messages for direct app actions. Works without API.
  const parseAction = (msg) => {
    const m = msg.toLowerCase().trim();
    // Add task
    let r = m.match(/^(?:ajoute|crée|create|add)\s+(?:une\s+)?t[âa]che[:\s]+(.+)$/i)
         || msg.match(/^(?:ajoute|crée|add)\s+t[âa]che[:\s]+(.+)$/i);
    if (r) return {type:"add_task", title: r[1].trim()};

    // Add habit
    r = m.match(/^(?:ajoute|crée|create|add)\s+(?:une\s+)?(?:habitude|routine)[:\s]+(.+)$/i);
    if (r) {
      const rest = r[1].trim();
      let cat = "Discipline";
      for (const k of Object.keys(CATS)) if (m.includes(k.toLowerCase())) cat = k;
      return {type:"add_habit", label: rest, cat, nn: /non.?n[ée]go/.test(m), freq:"daily"};
    }

    // Remove habit
    r = m.match(/^(?:supprime|enlève|retire|remove|delete)\s+(?:l['’]\s*)?(?:habitude|routine)[:\s]+(.+)$/i);
    if (r) return {type:"remove_habit", label: r[1].trim()};

    // Remove habit on specific day pattern "retire gym dimanche"
    r = m.match(/^(?:retire|enlève|supprime)\s+(.+?)\s+(?:le\s+)?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)$/i);
    if (r) {
      const day = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"].indexOf(r[2].toLowerCase());
      return {type:"remove_habit_day", label: r[1].trim(), day};
    }

    // Toggle NN
    r = m.match(/^(?:marque|rend[rs]?)\s+(.+?)\s+(?:comme\s+)?non[-\s]?n[ée]go(?:ciable)?$/i);
    if (r) return {type:"toggle_nn", label: r[1].trim()};

    // Complete habit today
    r = m.match(/^(?:valide|complete|coche|marque)\s+(.+?)(?:\s+(?:aujourd'?hui|today))?$/i);
    if (r && !/^(?:valide|complete|coche|marque)\s*$/i.test(msg)) {
      return {type:"complete_habit", label: r[1].trim()};
    }
    return null;
  };

  const executeAction = (action) => {
    if (!action) return null;
    try {
      if (action.type === "add_task") {
        const id = Date.now().toString();
        setTasks(p => [...(p||[]), {id, title:action.title, priority:"medium", project:"", done:false, createdAt:todayStr()}]);
        return `✓ Tâche ajoutée: **${action.title}**`;
      }
      if (action.type === "add_habit") {
        const id = "h"+Date.now();
        setHabits(p => [...(p||[]), {id, label:action.label, cat:normCat(action.cat), freq:action.freq||"daily", nn:!!action.nn}]);
        return `✓ Habitude créée: **${action.label}** (${action.cat})${action.nn?" · non-négociable":""}`;
      }
      if (action.type === "remove_habit") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `❌ Habitude "${action.label}" non trouvée.`;
        setHabits(p => (p||[]).filter(h => h.id !== target.id));
        return `✓ Habitude supprimée: **${target.label}**`;
      }
      if (action.type === "remove_habit_day") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `❌ Habitude "${action.label}" non trouvée.`;
        const days = (target.days || []).filter(d => d !== action.day);
        setHabits(p => (p||[]).map(h => h.id===target.id ? {...h, freq:"specific", days} : h));
        return `✓ **${target.label}** retiré des ${DAY_FULL[action.day].toLowerCase()}s`;
      }
      if (action.type === "toggle_nn") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `❌ Habitude "${action.label}" non trouvée.`;
        setHabits(p => (p||[]).map(h => h.id===target.id ? {...h, nn:!h.nn} : h));
        return `✓ **${target.label}** ${target.nn?"n'est plus":"est maintenant"} non-négociable`;
      }
      if (action.type === "complete_habit") {
        const target = habits.find(h => h.label.toLowerCase().includes(action.label.toLowerCase()));
        if (!target) return `❌ Habitude "${action.label}" non trouvée.`;
        if (completions[activeDayKey]?.[target.id]) return `ℹ **${target.label}** est déjà validée aujourd'hui`;
        toggle(target.id, activeDayKey);
        return `✓ **${target.label}** validée aujourd'hui`;
      }
    } catch (e) {
      return `❌ Erreur: ${e.message}`;
    }
    return null;
  };

  const buildCtx = useCallback(()=>{
    const sc = score(activeDayKey);
    const bodyT = body[activeDayKey]||{};
    const urgTasks = tasks.filter(t=>!t.done && normPrio(t.priority||t.urgency)==="high");
    const recentSport = (sportLog||[]).slice(-5).map(s=>`${s.type} ${s.date}${s.distance?` ${s.distance}km`:""}${s.duration?` ${s.duration}min`:""}`).join(" | ");
    const habitList = habits.map(h=>`${h.label} (${h.cat}${h.nn?", NN":""})`).join(", ");
    return `Tu es Growth Agent — assistant de performance. Parle français, direct et actionnable.

CONTEXTE DU ${activeDayKey}:
- Score: ${sc.pct}% (${sc.done}/${sc.total}) | Non-négo: ${sc.nnDone}/${sc.nnTotal} ${!sc.nnOk?"⚠ BRISÉ":"✅"}
- Énergie: ${bodyT.energy??"?"}/10 | Sommeil: ${bodyT.sleep??"?"}h
- Profil: ${profile.age||"?"} ans, ${profile.weight||"?"}kg | Objectif: ${profile.goal||"Non défini"}

HABITUDES: ${habitList}
SCORES 7J: ${lastN(7).map(d=>`${d.slice(5)}:${score(d).pct}%`).join(" ")}
TÂCHES URGENTES: ${urgTasks.map(t=>t.title).join(", ")||"Aucune"}
SPORT RÉCENT: ${recentSport||"Aucune"}
OBJECTIFS 2026: ${(goals||[]).map(g=>`[${g.level}] ${g.title}`).join(" | ")||"Aucun"}

L'utilisateur peut te demander d'exécuter des actions directement dans l'app:
- "ajoute une tâche: X"
- "crée une habitude: X"
- "supprime l'habitude X"
- "marque X comme non-négociable"
- "valide X aujourd'hui"

Sois précis, basé sur les vraies données. Donne des conseils actionnables.`;
  },[score,activeDayKey,body,tasks,sportLog,profile,habits,goals]);

  const send = async (overrideInput) => {
    const msg = overrideInput || input;
    if (!msg.trim() || loading) return;
    const userMsg = {role:"user", content:msg};
    setMsgs(prev => [...prev, userMsg]);
    if (!overrideInput) setInput("");

    // Try local action parsing first — works offline
    const action = parseAction(msg);
    if (action) {
      const result = executeAction(action);
      if (result) {
        setMsgs(prev => [...prev, {role:"assistant", content:result, action:true}]);
        return;
      }
    }

    // Fallback to AI chat
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-5-20250929",max_tokens:1000,system:buildCtx(),messages:[...msgs,userMsg].map(m=>({role:m.role,content:m.content}))})
      });
      const data = await res.json();
      const reply = data.content?.find(c=>c.type==="text")?.text || data.error?.message || "Erreur API.";
      setMsgs(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch {
      setMsgs(prev=>[...prev,{role:"assistant",content:"Connexion impossible. Les actions directes ('ajoute une tâche: ...', 'supprime l'habitude X'...) fonctionnent toujours sans réseau."}]);
    }
    setLoading(false);
  };

  const saveSport = () => {
    const entry = {...sport, id:Date.now().toString(), distance:parseFloat(sport.distance)||0, duration:parseFloat(sport.duration)||0};
    setSportLog(prev => [entry, ...(prev||[])]);
    setSportForm(false);
    setSport({type:"Course 🏃",date:activeDayKey,duration:"",distance:"",intensity:3,notes:""});
    const m = `Séance enregistrée: ${entry.type} le ${entry.date}${entry.distance?` - ${entry.distance}km`:""}${entry.duration?` - ${entry.duration}min`:""}, intensité ${entry.intensity}/5. Analyse brève ?`;
    setTimeout(()=>send(m), 200);
  };

  const QUICK = [
    "Analyse mes 7 derniers jours",
    "Mes priorités urgentes aujourd'hui",
    "Comment optimiser mon énergie ?",
    "ajoute une tâche: appeler fournisseur",
    "crée une habitude: boire 3L d'eau",
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)",animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:800,fontSize:22,lineHeight:1}}>Growth Agent ✨</div>
          <div style={{fontSize:11,color:C.text3,marginTop:3}}>Actions directes · conseils data-driven</div>
        </div>
        <Btn onClick={()=>setSportForm(true)} variant="green" style={{padding:"7px 12px",fontSize:12}}>+ Séance 🏃</Btn>
      </div>

      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
        {msgs.length===0 && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Card style={{padding:16,background:`linear-gradient(135deg, ${C.gold}10, transparent)`}}>
              <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>
                <div style={{fontWeight:700,color:C.gold,marginBottom:6}}>✨ Je peux agir sur ton app</div>
                <div style={{fontSize:12}}>Écris des commandes directes comme:</div>
                <ul style={{margin:"6px 0 0 0",paddingLeft:18,fontSize:12,color:C.text3}}>
                  <li><code style={codeS}>ajoute une tâche: appeler fournisseur</code></li>
                  <li><code style={codeS}>crée une habitude: 5 minutes méditation</code></li>
                  <li><code style={codeS}>supprime l'habitude boxe</code></li>
                  <li><code style={codeS}>valide hydratation 2L</code></li>
                </ul>
              </div>
            </Card>
            {QUICK.map(q=>(
              <button key={q} onClick={()=>send(q)} style={{textAlign:"left",padding:"11px 14px",borderRadius:11,background:C.card,border:`1px solid ${C.border}`,color:C.text2,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
            ))}
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"88%",padding:"12px 16px",
              borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              background: m.role==="user" ? C.gold : m.action ? C.green+"15" : C.card,
              color: m.role==="user" ? "#000" : C.text,
              border: m.role==="assistant" ? `1px solid ${m.action?C.green+"40":C.border}` : "none",
              fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap"
            }}>
              {m.content.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>
                part.startsWith("**")
                  ? <b key={i} style={{color:m.role==="user"?"#000":C.gold}}>{part.slice(2,-2)}</b>
                  : <span key={i}>{part}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex"}}>
            <div style={{padding:"12px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px 16px 16px 4px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.gold,display:"inline-block",animation:`b .8s ${i*.15}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottom}/>
      </div>

      <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`1px solid ${C.border}`,background:C.bg}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Message ou commande..." style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"11px 14px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <Btn onClick={()=>send()} disabled={loading} style={{padding:"11px 16px",fontSize:16}}>↑</Btn>
      </div>

      {sportForm && (
        <Modal title="Log séance sport 🏃" onClose={()=>setSportForm(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FSelect label="Type" value={sport.type} onChange={e=>setSport(p=>({...p,type:e.target.value}))} options={SPORT_TYPES}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="Date" value={sport.date} onChange={e=>setSport(p=>({...p,date:e.target.value}))} type="date"/>
              <FInput label="Durée (min)" value={sport.duration} onChange={e=>setSport(p=>({...p,duration:e.target.value}))} type="number" placeholder="60"/>
            </div>
            {sport.type.includes("Course") && <FInput label="Distance (km)" value={sport.distance} onChange={e=>setSport(p=>({...p,distance:e.target.value}))} type="number" placeholder="10.5"/>}
            <div>
              <div style={{fontSize:11,color:C.text3,fontWeight:700,marginBottom:8}}>INTENSITÉ {sport.intensity}/5</div>
              <div style={{display:"flex",gap:7}}>
                {[1,2,3,4,5].map(i=>{
                  const c=[C.green,"#86efac",C.gold,"#f97316",C.red][i-1];
                  return <button key={i} onClick={()=>setSport(p=>({...p,intensity:i}))} style={{flex:1,padding:"10px 0",borderRadius:9,border:`2px solid ${sport.intensity>=i?c:C.border2}`,background:sport.intensity>=i?c+"25":"transparent",color:sport.intensity>=i?c:C.text4,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{i}</button>;
                })}
              </div>
            </div>
            <FText label="NOTES" value={sport.notes} onChange={e=>setSport(p=>({...p,notes:e.target.value}))} placeholder="Comment tu t'es senti..."/>
            <Btn onClick={saveSport} variant="green" style={{width:"100%",padding:"13px",fontSize:15}}>Enregistrer & analyser ✓</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const codeS = {background:C.bg2,padding:"2px 6px",borderRadius:4,fontSize:11,color:C.gold,fontFamily:"'SF Mono',Consolas,monospace"};

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

function MeHub({setSection, habits, tasks, goals, profile, workSess}) {
  const focusMin = workSess.filter(s=>s.date===todayStr()).reduce((a,b)=>a+(b.duration||0),0);
  const cards = [
    {id:"routines", icon:"🔁", title:"Routines",   sub:`${habits.length} habitudes · ${habits.filter(h=>h.nn).length} NN`, color:C.green},
    {id:"focus",    icon:"⏱", title:"Focus",      sub:`${fmtMin(focusMin)||"0m"} aujourd'hui`, color:C.blue},
    {id:"profile",  icon:"👤", title:"Profil",     sub:profile.age?`${profile.age} ans · ${profile.weight||"?"}kg`:"À compléter", color:C.purple},
    {id:"goals",    icon:"🎯", title:"Objectifs 2026", sub:`${goals.length} objectif${goals.length>1?"s":""} définis`, color:C.gold},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div>
        <div style={{fontWeight:800,fontSize:22,lineHeight:1}}>Moi</div>
        <div style={{fontSize:12,color:C.text3,marginTop:3}}>Configure tes routines, objectifs et profil</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:10}}>
        {cards.map(c=>(
          <button key={c.id} onClick={()=>setSection(c.id)} style={{
            background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,cursor:"pointer",
            textAlign:"left",fontFamily:"inherit",color:C.text,
            transition:"all .15s",
            boxShadow:`0 0 0 1px ${c.color}10`
          }} onMouseEnter={e=>e.currentTarget.style.borderColor=c.color+"60"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{fontSize:28,marginBottom:10}}>{c.icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:c.color,marginBottom:2}}>{c.title}</div>
            <div style={{fontSize:12,color:C.text3}}>{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const BackBtn = ({back,title}) => (
  <div style={{display:"flex",alignItems:"center",gap:12}}>
    <button onClick={back} style={{...navArrow,width:34,height:34,fontSize:18}}>‹</button>
    <div style={{fontWeight:800,fontSize:22}}>{title}</div>
  </div>
);

// ── Routines
function RoutineSection({back, habits, setHabits}) {
  const [form, setForm] = useState(null);
  const empty = {label:"",cat:"Discipline",freq:"daily",days:[],nn:false};
  const [d, setD] = useState(empty);

  const save = () => {
    if (!d.label.trim()) return;
    if (d.id) setHabits(p => p.map(h => h.id===d.id ? d : h));
    else setHabits(p => [...(p||[]), {...d, id:"h"+Date.now()}]);
    setForm(null); setD(empty);
  };

  const grouped = habits.reduce((acc,h)=>{
    (acc[h.cat] = acc[h.cat]||[]).push(h); return acc;
  },{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <BackBtn back={back} title="Routines"/>
        <Btn onClick={()=>{setD(empty);setForm("new");}}>+ Ajouter</Btn>
      </div>

      {Object.entries(grouped).map(([cat,hs])=>{
        const c = CATS[cat]||{color:C.text3,emoji:"•"};
        return (
          <Card key={cat}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:15}}>{c.emoji}</span>
              <span style={{fontSize:12,fontWeight:700,color:c.color,letterSpacing:0.8}}>{cat.toUpperCase()}</span>
              <span style={{fontSize:11,color:C.text4,marginLeft:"auto"}}>{hs.length}</span>
            </div>
            {hs.map(h=>(
              <div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:`1px solid ${C.border}`}}>
                <div style={{width:3,height:30,background:c.color,borderRadius:99,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14}}>{h.label}</div>
                  <div style={{fontSize:11,color:C.text3,marginTop:2}}>
                    {h.freq==="daily" ? "Quotidien" : (h.days||[]).map(i=>DAY_NAMES[i]).join(" · ")||"—"}
                    {h.nn && " · Non-négociable"}
                  </div>
                </div>
                <button onClick={()=>{setD({...h,days:h.days||[]});setForm("edit");}} style={iconBtn}>✏</button>
                <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={iconBtn}>🗑</button>
              </div>
            ))}
          </Card>
        );
      })}

      {form && (
        <Modal title={d.id?"Modifier la routine":"Nouvelle routine"} onClose={()=>setForm(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="Nom *" value={d.label} onChange={e=>setD(p=>({...p,label:e.target.value}))} placeholder="Ex: Méditation 10min"/>
            <FSelect label="Catégorie" value={d.cat} onChange={e=>setD(p=>({...p,cat:e.target.value}))} options={Object.entries(CATS).map(([k,v])=>({value:k,label:`${v.emoji} ${k}`}))}/>
            <FSelect label="Fréquence" value={d.freq} onChange={e=>setD(p=>({...p,freq:e.target.value}))} options={[{value:"daily",label:"Quotidien"},{value:"specific",label:"Jours spécifiques"}]}/>
            {d.freq==="specific" && (
              <div>
                <div style={{fontSize:11,color:C.text3,fontWeight:700,marginBottom:8}}>JOURS</div>
                <div style={{display:"flex",gap:6}}>
                  {DAY_NAMES.map((n,i)=>(
                    <button key={i} onClick={()=>setD(p=>({...p,days:p.days.includes(i)?p.days.filter(x=>x!==i):[...p.days,i]}))} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1px solid ${d.days.includes(i)?C.gold:C.border2}`,background:d.days.includes(i)?C.gold+"25":"transparent",color:d.days.includes(i)?C.gold:C.text3,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={()=>setD(p=>({...p,nn:!p.nn}))} style={{padding:"12px",borderRadius:10,border:`1px solid ${d.nn?C.red:C.border2}`,background:d.nn?C.red+"18":"transparent",color:d.nn?C.red:C.text3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{fontWeight:800}}>{d.nn?"✓ ":""}Non-négociable</div>
              <div style={{fontSize:11,fontWeight:500,marginTop:3,opacity:0.8}}>Si ratée, score plafonné à 70%</div>
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

// ── Focus
function FocusSection({back, workSess, setWorkSess, tasks, activeDayKey}) {
  const [running,setRunning] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [selTask,setSelTask] = useState("");
  const [focus,setFocus] = useState("");
  const [targetMin,setTargetMin] = useState(0);
  const [custom,setCustom] = useState("");
  const iv = useRef(null); const t0 = useRef(null);

  const fmt = s=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const todayMin = workSess.filter(s=>s.date===activeDayKey).reduce((a,b)=>a+(b.duration||0),0);
  const weekMin = workSess.filter(s=>(new Date()-parseDate(s.date))/86400000<=7).reduce((a,b)=>a+(b.duration||0),0);

  const start=(min=0)=>{
    setTargetMin(min); setRunning(true);
    t0.current=Date.now()-elapsed*1000;
    iv.current=setInterval(()=>{
      const s=Math.floor((Date.now()-t0.current)/1000);
      setElapsed(s);
      if(min>0&&s>=min*60) stop(s);
    },1000);
  };
  const stop=(fe)=>{
    clearInterval(iv.current); setRunning(false);
    const dur=Math.round((fe??elapsed)/60);
    if(dur>0) setWorkSess(prev=>[...prev,{id:Date.now().toString(),date:activeDayKey,duration:dur,task:selTask,focus}]);
    setElapsed(0); setTargetMin(0);
  };
  useEffect(()=>()=>clearInterval(iv.current),[]);
  const pct=targetMin>0?Math.min((elapsed/(targetMin*60))*100,100):0;
  const last7Work = lastN(7).map(d=>({d,min:workSess.filter(s=>s.date===d).reduce((a,b)=>a+(b.duration||0),0)}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <BackBtn back={back} title="Focus"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:900,color:C.blue}}>{fmtMin(todayMin)||"0m"}</div><div style={{fontSize:10,color:C.text4}}>Aujourd'hui</div></Card>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:900,color:C.purple}}>{fmtMin(weekMin)||"0m"}</div><div style={{fontSize:10,color:C.text4}}>Cette semaine</div></Card>
      </div>
      <Card glow>
        {targetMin>0 && <div style={{marginBottom:12}}><PBar value={pct} color={C.gold} h={6}/><div style={{fontSize:10,color:C.text3,textAlign:"right",marginTop:3}}>{Math.round(pct)}% · {fmtMin(Math.max(0,targetMin-Math.floor(elapsed/60)))} restant</div></div>}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:40,fontWeight:900,fontVariantNumeric:"tabular-nums",flex:1,color:running?C.gold:C.text,letterSpacing:-1}}>{fmt(elapsed)}</div>
          {running ? <Btn onClick={()=>stop()} variant="danger" style={{padding:"10px 20px",fontSize:14}}>■ Stop</Btn>
                   : <Btn onClick={()=>start()} style={{padding:"10px 20px",fontSize:14}}>▶ Start</Btn>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          <FSelect label="Tâche liée" value={selTask} onChange={e=>setSelTask(e.target.value)} options={[{value:"",label:"— Libre —"},...tasks.filter(t=>!t.done).map(t=>({value:t.title,label:t.title}))]}/>
          <FInput label="Focus" value={focus} onChange={e=>setFocus(e.target.value)} placeholder="Sur quoi tu te concentres ?"/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:C.text3,marginBottom:8}}>BLOC RAPIDE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
          {[30,60,120].map(m=><Btn key={m} onClick={()=>start(m)} variant="ghost" disabled={running} style={{padding:"12px",fontSize:15,fontWeight:800}}>{m<60?`${m}m`:`${m/60}h`}</Btn>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} type="number" placeholder="Personnalisé (min)" style={{flex:1,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <Btn onClick={()=>custom&&start(Number(custom))} disabled={running} variant="ghost" style={{padding:"10px 16px"}}>▶</Btn>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:12}}>FOCUS 7 JOURS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
          {last7Work.map(({d,min})=>{
            const maxM=Math.max(...last7Work.map(x=>x.min),120);
            return (
              <div key={d} style={{flex:1,textAlign:"center"}}>
                <div style={{height:`${Math.max(min>0?(min/maxM)*66:0,min>0?4:0)}px`,background:min>=120?C.gold:min>0?C.gold+"60":C.border,borderRadius:"4px 4px 0 0",marginBottom:4,transition:"height .5s"}}/>
                <div style={{fontSize:9,color:C.text4}}>{DAY_NAMES[parseDate(d).getDay()]}</div>
                {min>0&&<div style={{fontSize:9,color:C.text3}}>{fmtMin(min)}</div>}
              </div>
            );
          })}
        </div>
      </Card>
      {workSess.filter(s=>s.date===activeDayKey).length>0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:10}}>SESSIONS DU JOUR</div>
          {workSess.filter(s=>s.date===activeDayKey).map(s=>(
            <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <div><div style={{fontWeight:600}}>{s.task||s.focus||"Session libre"}</div>{s.focus&&s.task&&<div style={{fontSize:11,color:C.text3}}>{s.focus}</div>}</div>
              <span style={{color:C.gold,fontWeight:700}}>{fmtMin(s.duration)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── Profile
function ProfileSection({back, profile, setProfile}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
      <BackBtn back={back} title="Profil"/>
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:14}}>DONNÉES PERSONNELLES</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FInput label="Âge" value={profile.age||""} onChange={e=>setProfile(p=>({...p,age:e.target.value}))} type="number" placeholder="25"/>
            <FInput label="Poids (kg)" value={profile.weight||""} onChange={e=>setProfile(p=>({...p,weight:e.target.value}))} type="number" placeholder="75"/>
          </div>
          <FInput label="Taille (cm)" value={profile.height||""} onChange={e=>setProfile(p=>({...p,height:e.target.value}))} type="number" placeholder="180"/>
          <FText label="OBJECTIF PRINCIPAL" value={profile.goal||""} onChange={e=>setProfile(p=>({...p,goal:e.target.value}))} placeholder="Monaco-Nice, développer mon business..."/>
          <FInput label="Business / Projets actifs" value={profile.business||""} onChange={e=>setProfile(p=>({...p,business:e.target.value}))} placeholder="Agency 5Stars, Visa Focus..."/>
        </div>
      </Card>
      <Card style={{background:C.green+"10",border:`1px solid ${C.green}30`,fontSize:12,color:C.text2,lineHeight:1.6}}>
        💡 Ces données personnalisent les conseils de Growth Agent en temps réel — il les utilise dans chaque réponse.
      </Card>
    </div>
  );
}

// ── Goals 2026
const GOAL_LEVELS = [
  {id:"short", label:"Court terme", sub:"1-3 mois", color:C.green},
  {id:"mid",   label:"Moyen terme", sub:"3-12 mois", color:C.gold},
  {id:"long",  label:"Long terme",  sub:"2026 entier", color:C.purple},
];

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
        <Btn onClick={()=>{setD(empty);setForm("new");}}>+ Objectif</Btn>
      </div>

      {goals.length === 0 && (
        <Card style={{padding:20,background:`linear-gradient(135deg, ${C.gold}10, transparent)`,border:`1px solid ${C.gold}30`}}>
          <div style={{fontSize:16,fontWeight:800,color:C.gold,marginBottom:6}}>🎯 Définis tes objectifs 2026</div>
          <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>
            Structure ta progression sur 3 horizons temporels.
          </div>
          <ul style={{margin:"10px 0 0",paddingLeft:18,fontSize:12,color:C.text3,lineHeight:1.7}}>
            <li><b style={{color:C.green}}>Court terme</b> : actions concrètes sur 1-3 mois</li>
            <li><b style={{color:C.gold}}>Moyen terme</b> : jalons importants 3-12 mois</li>
            <li><b style={{color:C.purple}}>Long terme</b> : vision 2026 entière</li>
          </ul>
        </Card>
      )}

      {grouped.map(lv => (
        <div key={lv.id}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 4px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:lv.color}}/>
            <div style={{fontSize:12,fontWeight:800,color:lv.color,letterSpacing:0.8}}>{lv.label.toUpperCase()}</div>
            <div style={{fontSize:11,color:C.text4}}>· {lv.sub}</div>
            <div style={{fontSize:11,color:C.text4,marginLeft:"auto"}}>{lv.items.length}</div>
          </div>
          {lv.items.length === 0 ? (
            <Card style={{padding:"12px 14px",fontSize:12,color:C.text4,textAlign:"center",background:C.card2}}>Aucun objectif</Card>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {lv.items.map(g => {
                const t = parseFloat(g.target)||0, cu = parseFloat(g.current)||0;
                const pct = t ? Math.min(Math.round((cu/t)*100),100) : 0;
                return (
                  <Card key={g.id} style={{padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:15}}>{g.title}</div>
                        {g.why && <div style={{fontSize:12,color:C.text3,marginTop:4,fontStyle:"italic"}}>"{g.why}"</div>}
                      </div>
                      <div style={{display:"flex",gap:2,flexShrink:0}}>
                        <button onClick={()=>{setD({...g});setForm("edit");}} style={iconBtn}>✏</button>
                        <button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))} style={iconBtn}>🗑</button>
                      </div>
                    </div>
                    {t > 0 && (
                      <>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.text3,marginBottom:5}}>
                          <span>{g.metric||"Progression"}</span>
                          <span style={{fontWeight:800,color:lv.color}}>{cu}/{t} · {pct}%</span>
                        </div>
                        <PBar value={pct} color={lv.color} h={5}/>
                      </>
                    )}
                    {g.dueDate && <div style={{fontSize:11,color:C.text4,marginTop:8}}>📅 {fmtShort(g.dueDate)}</div>}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {form && (
        <Modal title={d.id?"Modifier l'objectif":"Nouvel objectif"} onClose={()=>setForm(null)} wide>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:C.green+"10",border:`1px solid ${C.green}30`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.text2,lineHeight:1.6}}>
              💡 <b>Un bon objectif est spécifique et mesurable.</b> Pas "gagner plus" mais "5 nouveaux clients d'ici juin".
            </div>
            <FInput label="Objectif *" value={d.title} onChange={e=>setD(p=>({...p,title:e.target.value}))} placeholder="Ex: Courir 180km au total (Monaco-Nice)"/>
            <FSelect label="Horizon" value={d.level} onChange={e=>setD(p=>({...p,level:e.target.value}))} options={GOAL_LEVELS.map(l=>({value:l.id,label:`${l.label} · ${l.sub}`}))}/>
            <FText label="Pourquoi c'est important ?" value={d.why} onChange={e=>setD(p=>({...p,why:e.target.value}))} placeholder="Raison profonde, motivation..." rows={2}/>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}>
              <FInput label="Unité de mesure" value={d.metric} onChange={e=>setD(p=>({...p,metric:e.target.value}))} placeholder="km, clients, €..."/>
              <FInput label="Cible" value={d.target} onChange={e=>setD(p=>({...p,target:e.target.value}))} type="number" placeholder="180"/>
              <FInput label="Actuel" value={d.current} onChange={e=>setD(p=>({...p,current:e.target.value}))} type="number" placeholder="0"/>
            </div>
            <FInput label="Échéance" value={d.dueDate} onChange={e=>setD(p=>({...p,dueDate:e.target.value}))} type="date"/>
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
