import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATS = {
  Spirituality: { color: "#a78bfa", emoji: "🕌" },
  Fitness:      { color: "#34d399", emoji: "🏃" },
  Work:         { color: "#fbbf24", emoji: "💼" },
  Health:       { color: "#60a5fa", emoji: "💧" },
  Discipline:   { color: "#f87171", emoji: "🔥" },
  Personal:     { color: "#e879f9", emoji: "✨" },
  Mind:         { color: "#94a3b8", emoji: "🧠" },
};

const DEFAULT_HABITS = [
  { id:"h1",  label:"Réveil Fajr",    cat:"Spirituality", freq:"daily", nn:true,  mvp:true  },
  { id:"h2",  label:"5 Prières",      cat:"Spirituality", freq:"daily", nn:true,  mvp:true  },
  { id:"h3",  label:"1 Verset",       cat:"Spirituality", freq:"daily", nn:false, mvp:false },
  { id:"h4",  label:"Dhikr",          cat:"Spirituality", freq:"daily", nn:false, mvp:false },
  { id:"h5",  label:"Gym",            cat:"Fitness",      freq:"specific", days:[0,2,3], nn:false, mvp:false },
  { id:"h6",  label:"Boxe",           cat:"Fitness",      freq:"specific", days:[1,4,6], nn:false, mvp:false },
  { id:"h7",  label:"Course",         cat:"Fitness",      freq:"specific", days:[0,3,5], nn:false, mvp:false },
  { id:"h8",  label:"Work Deep 2h",   cat:"Work",         freq:"daily", nn:true,  mvp:true  },
  { id:"h9",  label:"Lecture 30min",  cat:"Mind",         freq:"daily", nn:false, mvp:false },
  { id:"h10", label:"Cold Shower",    cat:"Health",       freq:"daily", nn:false, mvp:true  },
  { id:"h11", label:"Hydratation 2L", cat:"Health",       freq:"daily", nn:false, mvp:false },
  { id:"h12", label:"No Music",       cat:"Discipline",   freq:"daily", nn:false, mvp:false },
  { id:"h13", label:"30m Max Insta",  cat:"Discipline",   freq:"daily", nn:false, mvp:false },
  { id:"h14", label:"Prospection",    cat:"Work",         freq:"daily", nn:false, mvp:false },
  { id:"h15", label:"Sommeil 7h+",    cat:"Health",       freq:"daily", nn:true,  mvp:true  },
];

const URGENCY = {
  critique: { label:"Critique", color:"#ef4444" },
  haute:    { label:"Haute",    color:"#f97316" },
  moyenne:  { label:"Moyenne",  color:"#fbbf24" },
  basse:    { label:"Basse",    color:"#34d399" },
};

const SPORT_TYPES = ["Course 🏃","Gym 🏋️","Boxe 🥊","Vélo 🚴","Natation 🏊","Yoga 🧘","Marche 🚶","Autre"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = d => new Date(d+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?m%60+"m":""}` : `${m}m`;
const last7 = () => Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split("T")[0]; });
const last30 = () => Array.from({length:30},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(29-i)); return d.toISOString().split("T")[0]; });
const DAY_NAMES = ["D","L","M","Me","J","V","S"];

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:16,...style}}>{children}</div>;

const Btn = ({children,onClick,variant="primary",style={},disabled=false}) => {
  const styles = {
    primary: {background:"#fbbf24",color:"#000",fontWeight:800},
    ghost:   {background:"#1f2937",color:"#9ca3af",fontWeight:600},
    danger:  {background:"#ef444420",color:"#ef4444",fontWeight:600},
  };
  return <button onClick={onClick} disabled={disabled} style={{...styles[variant],border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",opacity:disabled?0.5:1,...style}}>{children}</button>;
};

const FInput = ({label,value,onChange,type="text",placeholder="",style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:"#6b7280",fontWeight:700,letterSpacing:0.5}}>{label}</span>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",...style}} />
  </div>
);

const FSelect = ({label,value,onChange,options,style={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <span style={{fontSize:11,color:"#6b7280",fontWeight:700,letterSpacing:0.5}}>{label}</span>}
    <select value={value} onChange={onChange} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",...style}}>
      {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const PBar = ({value,max=100,color="#fbbf24",h=5}) => (
  <div style={{background:"#1f2937",borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,borderRadius:99,transition:"width .8s ease"}}/>
  </div>
);

const Badge = ({children,color}) => (
  <span style={{background:color+"25",color,border:`1px solid ${color}40`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>
);

const Modal = ({title,onClose,children}) => (
  <div style={{position:"fixed",inset:0,background:"#000d",zIndex:500,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
    <div style={{background:"#111827",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:680,margin:"0 auto",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontWeight:800,fontSize:18}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280",fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Sparkline = ({data,color="#fbbf24",h=50}) => {
  if (!data||data.length<2) return <div style={{height:h,background:"#1f2937",borderRadius:8}}/>;
  const max=Math.max(...data,1),min=Math.min(...data,0),range=max-min||1;
  const W=300,H=h;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*W},${H-((v-min)/range)*(H-6)-3}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:h,overflow:"visible"}}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill="url(#sg)" stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── NAV TABS ─────────────────────────────────────────────────────────────────
const TABS = [
  {id:"today",   e:"☀️", l:"Aujourd'hui"},
  {id:"analyse", e:"📊", l:"Analyses"},
  {id:"work",    e:"⏱",  l:"Travail"},
  {id:"ai",      e:"🤖", l:"Coach IA"},
  {id:"me",      e:"👤", l:"Moi"},
];

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("today");
  const [habits,      setHabits,     h_rdy]  = useFS("habits",      DEFAULT_HABITS);
  const [completions, setComp,       c_rdy]  = useFS("completions", {});
  const [tasks,       setTasks,      t_rdy]  = useFS("tasks",       []);
  const [body,        setBody,       b_rdy]  = useFS("body",        {});
  const [workSess,    setWorkSess,   w_rdy]  = useFS("work",        []);
  const [journal,     setJournal,    j_rdy]  = useFS("journal",     {});
  const [profile,     setProfile,    p_rdy]  = useFS("profile",     {weight:"",age:"",goal:""});
  const [sportLog,    setSportLog,   sl_rdy] = useFS("sports",      []);
  const [activeDayKey,setActiveDayKey,adk_rdy] = useFS("activeDay", todayStr());

  const ready = h_rdy && c_rdy && t_rdy && b_rdy && w_rdy && j_rdy && p_rdy && adk_rdy;

  const score = useCallback((dk) => {
    const comp = completions[dk] || {};
    const dow = new Date(dk+"T12:00").getDay();
    const applicable = habits.filter(h => h.freq==="daily" || (h.freq==="specific" && (h.days||[]).includes(dow)));
    if (!applicable.length) return {pct:0,done:0,total:0,nnOk:true,nnDone:0,nnTotal:0};
    const done = applicable.filter(h=>comp[h.id]).length;
    const nn = applicable.filter(h=>h.nn);
    const nnDone = nn.filter(h=>comp[h.id]).length;
    const nnBroken = nn.length > 0 && nnDone < nn.length;
    let pct = Math.round((done/applicable.length)*100);
    if (nnBroken) pct = Math.min(pct,70);
    return {pct,done,total:applicable.length,nnOk:!nnBroken,nnDone,nnTotal:nn.length};
  }, [habits, completions]);

  const toggle = useCallback((id) => {
    setComp(prev => ({...prev, [activeDayKey]: {...(prev[activeDayKey]||{}), [id]: !(prev[activeDayKey]||{})[id]}}));
  }, [activeDayKey, setComp]);

  if (!ready) return (
    <div style={{minHeight:"100vh",background:"#080d14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:36,height:36,border:"3px solid #fbbf24",borderTopColor:"transparent",borderRadius:"50%",animation:"sp 1s linear infinite"}}/>
      <div style={{color:"#4b5563",fontSize:13}}>Synchronisation...</div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const todayScore = score(activeDayKey);

  return (
    <div style={{minHeight:"100vh",background:"#080d14",color:"#f1f5f9",fontFamily:"'Inter',-apple-system,sans-serif",display:"flex",flexDirection:"column",maxWidth:680,margin:"0 auto"}}>
      <header style={{padding:"14px 20px 10px",borderBottom:"1px solid #1f2937",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#080d14",zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#fbbf24,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
          <div>
            <div style={{fontWeight:800,fontSize:16,letterSpacing:-0.5,lineHeight:1}}>NEXUS</div>
            <div style={{fontSize:9,color:"#374151",fontWeight:700,letterSpacing:2}}>PERFORMANCE OS</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:24,fontWeight:900,color:todayScore.nnOk?"#fbbf24":"#ef4444",lineHeight:1}}>{todayScore.pct}%</div>
          <div style={{fontSize:10,color:"#4b5563"}}>{todayScore.done}/{todayScore.total} today</div>
        </div>
      </header>

      <main style={{flex:1,padding:"16px 16px 8px",overflowY:"auto"}}>
        {tab==="today"   && <TodayTab habits={habits} completions={completions} toggle={toggle} activeDayKey={activeDayKey} setActiveDayKey={setActiveDayKey} score={score} body={body} setBody={setBody} journal={journal} setJournal={setJournal} tasks={tasks} workSess={workSess}/>}
        {tab==="analyse" && <AnalyseTab habits={habits} completions={completions} body={body} workSess={workSess} score={score}/>}
        {tab==="work"    && <WorkTab workSess={workSess} setWorkSess={setWorkSess} tasks={tasks} activeDayKey={activeDayKey}/>}
        {tab==="ai"      && <AITab habits={habits} completions={completions} body={body} workSess={workSess} tasks={tasks} profile={profile} score={score} activeDayKey={activeDayKey} sportLog={sportLog} setSportLog={setSportLog}/>}
        {tab==="me"      && <MeTab habits={habits} setHabits={setHabits} tasks={tasks} setTasks={setTasks} profile={profile} setProfile={setProfile}/>}
      </main>

      <nav style={{borderTop:"1px solid #1f2937",background:"#080d14",position:"sticky",bottom:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-around",padding:"8px 0 16px"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 10px",color:tab===t.id?"#fbbf24":"#374151",transition:"color .2s"}}>
              <span style={{fontSize:22,filter:tab===t.id?"none":"grayscale(1) opacity(0.5)"}}>{t.e}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:0.5}}>{t.l.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </nav>
      <style>{`*{box-sizing:border-box} input,select,textarea{font-family:inherit} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#374151;border-radius:99px} input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:99px;outline:none;background:#374151} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;background:#fbbf24}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY
// ═══════════════════════════════════════════════════════════════════════════════
function TodayTab({habits,completions,toggle,activeDayKey,setActiveDayKey,score,body,setBody,journal,setJournal,tasks,workSess}) {
  const [closeModal, setCloseModal] = useState(false);
  const [wakeTime, setWakeTime] = useState("");
  const [bedTime, setBedTime] = useState("");
  const [sleepH, setSleepH] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [win, setWin] = useState("");

  const todayComp = completions[activeDayKey] || {};
  const sc = score(activeDayKey);
  const workMin = workSess.filter(s=>s.date===activeDayKey).reduce((a,b)=>a+(b.duration||0),0);
  const todayTasks = tasks.filter(t=>!t.done && t.scheduledFor===activeDayKey);

  const byCategory = habits.reduce((acc,h) => {
    const dow = new Date(activeDayKey+"T12:00").getDay();
    if (h.freq==="specific" && !(h.days||[]).includes(dow)) return acc;
    (acc[h.cat] = acc[h.cat]||[]).push(h);
    return acc;
  },{});

  const handleClose = () => {
    if (wakeTime) setBody(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),wakeTime}}));
    if (sleepH) setBody(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),sleep:parseFloat(sleepH)}}));
    if (bedTime) setBody(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),bedTime}}));
    if (gratitude||win) setJournal(prev=>({...prev,[activeDayKey]:{...(prev[activeDayKey]||{}),gratitude,win}}));
    const next = new Date(activeDayKey+"T12:00");
    next.setDate(next.getDate()+1);
    setActiveDayKey(next.toISOString().split("T")[0]);
    setCloseModal(false);
    setWakeTime(""); setSleepH(""); setBedTime(""); setGratitude(""); setWin("");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:800,fontSize:20,lineHeight:1}}>Aujourd'hui</div>
          <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{fmtDate(activeDayKey)}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{textAlign:"center",background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"8px 14px"}}>
            <div style={{fontSize:22,fontWeight:900,color:sc.nnOk?"#fbbf24":"#ef4444"}}>{sc.pct}%</div>
            <div style={{fontSize:9,color:"#4b5563",fontWeight:700}}>SCORE</div>
          </div>
          <div style={{textAlign:"center",background:"#111827",border:`1px solid ${sc.nnOk?"#1f2937":"#ef444430"}`,borderRadius:12,padding:"8px 14px"}}>
            <div style={{fontSize:22,fontWeight:900,color:sc.nnOk?"#34d399":"#ef4444"}}>{sc.nnDone}/{sc.nnTotal}</div>
            <div style={{fontSize:9,color:"#4b5563",fontWeight:700}}>NON-NÉG.</div>
          </div>
        </div>
      </div>

      {!sc.nnOk && (
        <div style={{background:"#ef444415",border:"1px solid #ef444440",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#ef4444",fontWeight:600}}>
          ⚠️ Standard brisé — score plafonné à 70%
        </div>
      )}

      {(workMin>0||todayTasks.length>0) && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {workMin>0 && <Card style={{padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:"#60a5fa"}}>{fmtMin(workMin)}</div><div style={{fontSize:10,color:"#4b5563"}}>Focus</div></Card>}
          {todayTasks.length>0 && <Card style={{padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:"#f87171"}}>{todayTasks.length}</div><div style={{fontSize:10,color:"#4b5563"}}>Tâches du jour</div></Card>}
        </div>
      )}

      {Object.entries(byCategory).map(([cat,hs])=>{
        const c = CATS[cat]||{color:"#888",emoji:"•"};
        const done = hs.filter(h=>todayComp[h.id]).length;
        return (
          <Card key={cat}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:16}}>{c.emoji}</span>
                <span style={{fontSize:12,fontWeight:700,color:c.color,letterSpacing:0.5}}>{cat.toUpperCase()}</span>
              </div>
              <span style={{fontSize:12,color:"#6b7280"}}>{done}/{hs.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {hs.map(h=>{
                const checked = !!todayComp[h.id];
                return (
                  <button key={h.id} onClick={()=>toggle(h.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:checked?c.color+"18":"#0f1623",border:`1px solid ${checked?c.color+"50":"#1f2937"}`,borderRadius:11,cursor:"pointer",color:"#f1f5f9",transition:"all .15s",textAlign:"left"}}>
                    <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked?c.color:"#374151"}`,background:checked?c.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {checked && <span style={{fontSize:11,color:"#000",fontWeight:900}}>✓</span>}
                    </div>
                    <span style={{flex:1,fontSize:14,fontWeight:500,textDecoration:checked?"line-through":"none",color:checked?"#6b7280":"#f1f5f9"}}>{h.label}</span>
                    <div style={{display:"flex",gap:4}}>
                      {h.nn && <Badge color="#ef4444">NN</Badge>}
                      {h.mvp && <Badge color="#fbbf24">MVP</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}

      {todayTasks.length>0 && (
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:0.5,marginBottom:10}}>TÂCHES DU JOUR</div>
          {todayTasks.map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1f2937",fontSize:13}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:URGENCY[t.urgency]?.color||"#888",flexShrink:0}}/>
              <span style={{flex:1,fontWeight:500}}>{t.title}</span>
              {t.project && <Badge color="#60a5fa">{t.project}</Badge>}
            </div>
          ))}
        </Card>
      )}

      <button onClick={()=>setCloseModal(true)} style={{background:"#f1f5f9",color:"#080d14",border:"none",borderRadius:14,padding:"15px",fontSize:16,fontWeight:800,cursor:"pointer",width:"100%",marginTop:4,fontFamily:"inherit"}}>
        Clôturer ma journée 🌙
      </button>

      {closeModal && (
        <Modal title="Clôture de journée 🌙" onClose={()=>setCloseModal(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#0f1623",borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#6b7280",marginBottom:4}}>Score du jour</div>
              <div style={{fontSize:40,fontWeight:900,color:sc.nnOk?"#fbbf24":"#ef4444"}}>{sc.pct}%</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="⏰ Réveil" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} type="time"/>
              <FInput label="🛏 Coucher" value={bedTime} onChange={e=>setBedTime(e.target.value)} type="time"/>
            </div>
            <FInput label="😴 Durée sommeil (h)" value={sleepH} onChange={e=>setSleepH(e.target.value)} type="number" placeholder="7.5"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700}}>🙏 GRATITUDES</span>
              <textarea value={gratitude} onChange={e=>setGratitude(e.target.value)} rows={2} placeholder="Je suis reconnaissant pour..." style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical"}}/>
            </div>
            <FInput label="⭐ Victoire du jour" value={win} onChange={e=>setWin(e.target.value)} placeholder="Ma plus grande victoire..."/>
            <Btn onClick={handleClose} style={{width:"100%",padding:"14px",fontSize:15}}>Confirmer et ouvrir demain ✓</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSE
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyseTab({habits,completions,body,workSess,score}) {
  const [period,setPeriod] = useState("7d");
  const [filter,setFilter] = useState("all");

  const days = period==="7d" ? last7() : last30();
  const scores = days.map(d=>({d,...score(d)}));
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b.pct,0)/scores.length) : 0;

  const prev7 = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return d.toISOString().split("T")[0];});
  const currAvg = Math.round(last7().map(d=>score(d).pct).reduce((a,b)=>a+b,0)/7);
  const prevAvg = Math.round(prev7.map(d=>score(d).pct).reduce((a,b)=>a+b,0)/7);
  const diff = currAvg - prevAvg;

  const habitRates = habits.map(h=>{
    const done = days.filter(d=>completions[d]?.[h.id]).length;
    return {...h, rate:Math.round((done/days.length)*100)};
  }).sort((a,b)=>b.rate-a.rate);

  const filtered = filter==="all" ? habitRates : habitRates.filter(h=>h.cat===filter);

  const catAvg = Object.keys(CATS).map(cat=>{
    const hs = habitRates.filter(h=>h.cat===cat);
    return {cat, avg:hs.length?Math.round(hs.reduce((a,b)=>a+b.rate,0)/hs.length):0, color:CATS[cat].color, emoji:CATS[cat].emoji};
  }).filter(c=>c.avg>0).sort((a,b)=>b.avg-a.avg);

  const bodyDays = days.filter(d=>body[d]);
  const avgEnergy = bodyDays.length ? (bodyDays.reduce((a,d)=>a+(body[d].energy||5),0)/bodyDays.length).toFixed(1) : "—";
  const avgSleep = bodyDays.length ? (bodyDays.reduce((a,d)=>a+(body[d].sleep||7),0)/bodyDays.length).toFixed(1) : "—";
  const workMin = days.reduce((a,d)=>a+workSess.filter(s=>s.date===d).reduce((x,y)=>x+(y.duration||0),0),0);
  const perfectDays = scores.filter(s=>s.pct>=90).length;
  const best = scores.reduce((b,s)=>s.pct>(b?.pct||0)?s:b,null);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:20}}>Analyses</div>
        <div style={{display:"flex",gap:6}}>
          {["7d","30d"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 12px",borderRadius:20,border:"none",background:period===p?"#fbbf24":"#1f2937",color:period===p?"#000":"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {p==="7d"?"7 jours":"30 jours"}
            </button>
          ))}
        </div>
      </div>

      <Card style={{background:"linear-gradient(135deg,#111827,#0f1c2e)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:"#6b7280",fontWeight:700,letterSpacing:1,marginBottom:4}}>SCORE MOYEN</div>
            <div style={{fontSize:52,fontWeight:900,color:avg>=80?"#34d399":avg>=60?"#fbbf24":"#ef4444",lineHeight:1}}>{avg}%</div>
            <div style={{fontSize:12,color:diff>=0?"#34d399":"#ef4444",fontWeight:700,marginTop:4}}>
              {diff>=0?"▲":"▼"} {Math.abs(diff)}% vs semaine précédente
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fbbf24"}}>{perfectDays}</div>
            <div style={{fontSize:10,color:"#4b5563"}}>jours parfaits</div>
            <div style={{fontSize:22,fontWeight:900,color:"#a78bfa",marginTop:8}}>{best?.pct||0}%</div>
            <div style={{fontSize:10,color:"#4b5563"}}>meilleur jour</div>
          </div>
        </div>
        <Sparkline data={scores.map(s=>s.pct)} color={avg>=70?"#34d399":"#fbbf24"} h={60}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:9,color:"#374151"}}>
          {scores.filter((_,i)=>i%(Math.ceil(scores.length/6))===0).map(s=>(
            <span key={s.d}>{new Date(s.d+"T12:00").getDate()}/{new Date(s.d+"T12:00").getMonth()+1}</span>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:12}}>HEATMAP</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {scores.map(s=>(
            <div key={s.d} title={`${s.d}: ${s.pct}%`} style={{
              width:period==="7d"?"calc(14.28% - 4px)":"calc(9.5% - 4px)",
              aspectRatio:"1",borderRadius:6,
              background:s.pct===0?"#1f2937":s.pct<40?"#78350f":s.pct<70?"#92400e":s.pct<90?"#d97706":"#fbbf24",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#000",
            }}>{s.pct>0?s.pct:""}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center",fontSize:10,color:"#6b7280"}}>
          <span>0%</span>
          {["#78350f","#92400e","#d97706","#fbbf24"].map((c,i)=><div key={i} style={{width:12,height:12,borderRadius:3,background:c}}/>)}
          <span>100%</span>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {[
          {l:"Focus travail",v:fmtMin(workMin)||"0m",c:"#60a5fa"},
          {l:"Énergie moy.",v:`${avgEnergy}/10`,c:"#fbbf24"},
          {l:"Sommeil moy.",v:`${avgSleep}h`,c:"#a78bfa"},
          {l:"Jours ≥90%",v:perfectDays,c:"#34d399"},
        ].map(m=>(
          <Card key={m.l} style={{padding:12,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:900,color:m.c}}>{m.v}</div>
            <div style={{fontSize:10,fontWeight:700,color:"#6b7280",marginTop:2}}>{m.l}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:12}}>PAR CATÉGORIE</div>
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

      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:10}}>HABITUDES DÉTAIL</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          <button onClick={()=>setFilter("all")} style={{padding:"4px 10px",borderRadius:20,border:"none",background:filter==="all"?"#fbbf24":"#1f2937",color:filter==="all"?"#000":"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>Toutes</button>
          {Object.keys(CATS).map(cat=>(
            <button key={cat} onClick={()=>setFilter(cat)} style={{padding:"4px 10px",borderRadius:20,border:"none",background:filter===cat?CATS[cat].color:"#1f2937",color:filter===cat?"#000":"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>{CATS[cat].emoji} {cat}</button>
          ))}
        </div>
        {filtered.map((h,i)=>(
          <div key={h.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:"#374151",fontSize:11,width:18}}>{i+1}</span>
                <span style={{fontWeight:600}}>{h.label}</span>
                {h.nn&&<Badge color="#ef4444">NN</Badge>}
              </div>
              <span style={{fontWeight:800,color:h.rate>=80?"#34d399":h.rate>=50?"#fbbf24":"#ef4444"}}>{h.rate}%</span>
            </div>
            <PBar value={h.rate} color={h.rate>=80?"#34d399":h.rate>=50?"#fbbf24":"#ef4444"} h={4}/>
          </div>
        ))}
      </Card>

      {habitRates.filter(h=>h.rate<60).length>0&&(
        <Card style={{border:"1px solid #ef444430"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#ef4444",letterSpacing:1,marginBottom:10}}>⚠️ À AMÉLIORER</div>
          {habitRates.filter(h=>h.rate<60).slice(0,5).map(h=>(
            <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937"}}>
              <div style={{fontSize:13,fontWeight:600}}>{h.label} <span style={{color:"#6b7280",fontSize:11}}>· {h.cat}</span></div>
              <Badge color="#ef4444">{h.rate}%</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORK
// ═══════════════════════════════════════════════════════════════════════════════
function WorkTab({workSess,setWorkSess,tasks,activeDayKey}) {
  const [running,setRunning] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [selTask,setSelTask] = useState("");
  const [focus,setFocus] = useState("");
  const [targetMin,setTargetMin] = useState(0);
  const [custom,setCustom] = useState("");
  const iv = useRef(null);
  const t0 = useRef(null);

  const fmt = s=>`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const todayMin = workSess.filter(s=>s.date===activeDayKey).reduce((a,b)=>a+(b.duration||0),0);
  const weekMin = workSess.filter(s=>(new Date()-new Date(s.date+"T12:00"))/86400000<=7).reduce((a,b)=>a+(b.duration||0),0);

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
  const last7Work = last7().map(d=>({d,min:workSess.filter(s=>s.date===d).reduce((a,b)=>a+(b.duration||0),0)}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontWeight:800,fontSize:20}}>Focus Travail</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:900,color:"#60a5fa"}}>{fmtMin(todayMin)||"0m"}</div><div style={{fontSize:10,color:"#4b5563"}}>Aujourd'hui</div></Card>
        <Card style={{textAlign:"center",padding:14}}><div style={{fontSize:26,fontWeight:900,color:"#a78bfa"}}>{fmtMin(weekMin)||"0m"}</div><div style={{fontSize:10,color:"#4b5563"}}>Cette semaine</div></Card>
      </div>
      <Card>
        {targetMin>0&&<div style={{marginBottom:12}}><PBar value={pct} color="#fbbf24" h={6}/><div style={{fontSize:10,color:"#6b7280",textAlign:"right",marginTop:3}}>{Math.round(pct)}% — {fmtMin(Math.max(0,targetMin-Math.floor(elapsed/60)))} restant</div></div>}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{fontSize:38,fontWeight:900,fontVariantNumeric:"tabular-nums",flex:1,color:running?"#fbbf24":"#f1f5f9",letterSpacing:-1}}>{fmt(elapsed)}</div>
          {running ? <Btn onClick={()=>stop()} variant="danger" style={{padding:"10px 20px",fontSize:14}}>■ Stop</Btn>
                   : <Btn onClick={()=>start()} style={{padding:"10px 20px",fontSize:14}}>▶ Start</Btn>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          <FSelect label="Tâche liée" value={selTask} onChange={e=>setSelTask(e.target.value)} options={[{value:"",label:"— Libre —"},...tasks.filter(t=>!t.done).map(t=>({value:t.title,label:t.title}))]}/>
          <FInput label="Focus" value={focus} onChange={e=>setFocus(e.target.value)} placeholder="Sur quoi tu te concentres ?"/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:8}}>DÉMARRER UN BLOC</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
          {[30,60,120].map(m=><Btn key={m} onClick={()=>start(m)} variant="ghost" disabled={running} style={{padding:"12px",fontSize:15,fontWeight:800}}>{m<60?`${m}m`:`${m/60}h`}</Btn>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} type="number" placeholder="Personnalisé (min)" style={{flex:1,background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <Btn onClick={()=>custom&&start(Number(custom))} disabled={running} variant="ghost" style={{padding:"10px 16px"}}>▶</Btn>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:12}}>FOCUS 7 JOURS</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
          {last7Work.map(({d,min})=>{
            const maxM=Math.max(...last7Work.map(x=>x.min),120);
            return (
              <div key={d} style={{flex:1,textAlign:"center"}}>
                <div style={{height:`${Math.max(min>0?(min/maxM)*58:0,min>0?4:0)}px`,background:min>=120?"#fbbf24":min>0?"#fbbf2460":"#1f2937",borderRadius:"4px 4px 0 0",marginBottom:4,transition:"height .5s"}}/>
                <div style={{fontSize:9,color:"#374151"}}>{DAY_NAMES[new Date(d+"T12:00").getDay()]}</div>
                {min>0&&<div style={{fontSize:9,color:"#6b7280"}}>{fmtMin(min)}</div>}
              </div>
            );
          })}
        </div>
      </Card>
      {workSess.filter(s=>s.date===activeDayKey).length>0&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:10}}>SESSIONS DU JOUR</div>
          {workSess.filter(s=>s.date===activeDayKey).map(s=>(
            <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1f2937",fontSize:13}}>
              <div><div style={{fontWeight:600}}>{s.task||s.focus||"Session libre"}</div>{s.focus&&s.task&&<div style={{fontSize:11,color:"#6b7280"}}>{s.focus}</div>}</div>
              <span style={{color:"#fbbf24",fontWeight:700}}>{fmtMin(s.duration)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI COACH
// ═══════════════════════════════════════════════════════════════════════════════
function AITab({habits,completions,body,workSess,tasks,profile,score,activeDayKey,sportLog,setSportLog}) {
  const [msgs,setMsgs] = useState([]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [sportForm,setSportForm] = useState(false);
  const [sport,setSport] = useState({type:"Course 🏃",date:activeDayKey,duration:"",distance:"",intensity:3,notes:""});
  const bottom = useRef(null);

  useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const buildCtx = useCallback(()=>{
    const sc = score(activeDayKey);
    const bodyT = body[activeDayKey]||{};
    const urgTasks = tasks.filter(t=>!t.done&&(t.urgency==="critique"||t.urgency==="haute"));
    const recentSport = (sportLog||[]).slice(-5).map(s=>`${s.type} ${s.date}${s.distance?` ${s.distance}km`:""}${s.duration?` ${s.duration}min`:""} intensité:${s.intensity}/5${s.notes?` (${s.notes})`:""}`).join(" | ");
    const totalKm = (sportLog||[]).filter(s=>s.type?.includes("Course")).reduce((a,b)=>a+(parseFloat(b.distance)||0),0);
    return `Tu es NEXUS AI, coach de performance personnel expert et direct. Parle français.

DONNÉES AU ${activeDayKey}:
- Score: ${sc.pct}% (${sc.done}/${sc.total}) | Non-négo: ${sc.nnDone}/${sc.nnTotal} ${!sc.nnOk?"⚠️ BRISÉ":"✅"}
- Énergie: ${bodyT.energy??"??"}/10 | Sommeil: ${bodyT.sleep??"??"}h | Stress: ${bodyT.stress??"??"}/10
- Profil: ${profile.age||"??"} ans, ${profile.weight||"??"}kg | Objectif: ${profile.goal||"Non défini"}
- Projets: ${profile.business||"Non définis"}

SCORES 7J: ${last7().map(d=>`${d.slice(5)}:${score(d).pct}%`).join(" ")}
TÂCHES URGENTES: ${urgTasks.map(t=>t.title).join(", ")||"Aucune"}
SPORT RÉCENT: ${recentSport||"Aucune séance"}
TOTAL KM COURSE: ${totalKm.toFixed(1)}km (objectif Monaco-Nice ~180km)

Sois précis, direct, personnalisé. Donne des conseils actionnables basés sur les vraies données.`;
  },[score,activeDayKey,body,tasks,sportLog,profile]);

  const send = async(overrideInput)=>{
    const msg = overrideInput||input;
    if(!msg.trim()||loading) return;
    const userMsg={role:"user",content:msg};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);
    if(!overrideInput) setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:buildCtx(),messages:newMsgs})
      });
      const data = await res.json();
      const reply = data.content?.find(c=>c.type==="text")?.text||"Erreur.";
      setMsgs(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch { setMsgs(prev=>[...prev,{role:"assistant",content:"Erreur de connexion. Réessaie."}]); }
    setLoading(false);
  };

  const saveSport = ()=>{
    const entry={...sport,id:Date.now().toString(),distance:parseFloat(sport.distance)||0,duration:parseFloat(sport.duration)||0};
    setSportLog(prev=>[entry,...(prev||[])]);
    setSportForm(false);
    const msg=`Séance enregistrée: ${sport.type} le ${sport.date}${sport.distance?` - ${sport.distance}km`:""}${sport.duration?` - ${sport.duration}min`:""}, intensité ${sport.intensity}/5.${sport.notes?` Notes: ${sport.notes}`:""} Analyse et conseils ?`;
    setSport({type:"Course 🏃",date:activeDayKey,duration:"",distance:"",intensity:3,notes:""});
    setTimeout(()=>send(msg),200);
  };

  const QUICK = [
    "Analyse mes performances cette semaine",
    "Plan d'entraînement Monaco-Nice optimal",
    "Mes priorités business urgentes",
    "Comment optimiser mon énergie et récupération ?",
    "Points forts et axes d'amélioration concrets",
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 185px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:20}}>Coach IA</div>
        <Btn onClick={()=>setSportForm(true)} style={{padding:"7px 12px",fontSize:12}}>+ Séance sport 🏃</Btn>
      </div>

      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
        {msgs.length===0&&(
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <div style={{textAlign:"center",color:"#4b5563",fontSize:13,padding:"16px 0 8px"}}>Ton coach connaît toutes tes données en temps réel</div>
            {QUICK.map(q=>(
              <button key={q} onClick={()=>send(q)} style={{textAlign:"left",padding:"11px 14px",borderRadius:11,background:"#111827",border:"1px solid #1f2937",color:"#9ca3af",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
            ))}
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"88%",padding:"12px 16px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?"#fbbf24":"#111827",color:m.role==="user"?"#000":"#f1f5f9",border:m.role==="assistant"?"1px solid #1f2937":"none",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex"}}>
            <div style={{padding:"12px 16px",background:"#111827",border:"1px solid #1f2937",borderRadius:"16px 16px 16px 4px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#fbbf24",display:"inline-block",animation:`b .8s ${i*.15}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottom}/>
      </div>

      <div style={{display:"flex",gap:8,paddingTop:10,borderTop:"1px solid #1f2937",background:"#080d14"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Message au coach..." style={{flex:1,background:"#111827",border:"1px solid #1f2937",borderRadius:10,color:"#f9fafb",padding:"11px 14px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <Btn onClick={()=>send()} disabled={loading} style={{padding:"11px 16px",fontSize:16}}>↑</Btn>
      </div>

      {sportForm&&(
        <Modal title="Log séance sport 🏃" onClose={()=>setSportForm(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FSelect label="Type" value={sport.type} onChange={e=>setSport(p=>({...p,type:e.target.value}))} options={SPORT_TYPES}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="Date" value={sport.date} onChange={e=>setSport(p=>({...p,date:e.target.value}))} type="date"/>
              <FInput label="Durée (min)" value={sport.duration} onChange={e=>setSport(p=>({...p,duration:e.target.value}))} type="number" placeholder="60"/>
            </div>
            {sport.type.includes("Course")&&<FInput label="Distance (km)" value={sport.distance} onChange={e=>setSport(p=>({...p,distance:e.target.value}))} type="number" placeholder="10.5"/>}
            <div>
              <div style={{fontSize:11,color:"#6b7280",fontWeight:700,marginBottom:8}}>INTENSITÉ {sport.intensity}/5</div>
              <div style={{display:"flex",gap:7}}>
                {[1,2,3,4,5].map(i=>{
                  const c=["#34d399","#86efac","#fbbf24","#f97316","#ef4444"][i-1];
                  return <button key={i} onClick={()=>setSport(p=>({...p,intensity:i}))} style={{flex:1,padding:"10px 0",borderRadius:9,border:`2px solid ${sport.intensity>=i?c:"#374151"}`,background:sport.intensity>=i?c+"25":"transparent",color:sport.intensity>=i?c:"#4b5563",fontSize:14,fontWeight:800,cursor:"pointer"}}>{i}</button>;
                })}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700}}>NOTES</span>
              <textarea value={sport.notes} onChange={e=>setSport(p=>({...p,notes:e.target.value}))} rows={2} placeholder="Comment tu t'es senti..." style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical"}}/>
            </div>
            <Btn onClick={saveSport} style={{width:"100%",padding:"13px",fontSize:15}}>Enregistrer + Analyser avec l'IA ✓</Btn>
          </div>
        </Modal>
      )}
      <style>{`@keyframes b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ME
// ═══════════════════════════════════════════════════════════════════════════════
function MeTab({habits,setHabits,tasks,setTasks,profile,setProfile}) {
  const [section,setSection] = useState("habits");
  const [habitForm,setHabitForm] = useState(null);
  const [taskForm,setTaskForm] = useState(null);
  const [hD,setHD] = useState({label:"",cat:"Personal",freq:"daily",days:[],nn:false,mvp:false});
  const [tD,setTD] = useState({title:"",urgency:"moyenne",project:"",scheduledFor:"",duration:"",notes:""});

  const saveH=()=>{
    if(!hD.label.trim()) return;
    if(hD.id) setHabits(p=>p.map(h=>h.id===hD.id?hD:h));
    else setHabits(p=>[...p,{...hD,id:Date.now().toString()}]);
    setHabitForm(null);
    setHD({label:"",cat:"Personal",freq:"daily",days:[],nn:false,mvp:false});
  };

  const saveT=()=>{
    if(!tD.title.trim()) return;
    if(tD.id) setTasks(p=>p.map(t=>t.id===tD.id?tD:t));
    else setTasks(p=>[...p,{...tD,id:Date.now().toString(),done:false,createdAt:todayStr()}]);
    setTaskForm(null);
    setTD({title:"",urgency:"moyenne",project:"",scheduledFor:"",duration:"",notes:""});
  };

  const projects=[...new Set(tasks.map(t=>t.project).filter(Boolean))];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontWeight:800,fontSize:20}}>Profil & Config</div>

      <div style={{display:"flex",gap:6}}>
        {[{id:"habits",l:"Routines"},{id:"tasks",l:"Tâches"},{id:"profile",l:"Profil"}].map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:section===s.id?"#fbbf24":"#111827",color:section===s.id?"#000":"#6b7280",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s.l}</button>
        ))}
      </div>

      {section==="habits"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:"#6b7280"}}>{habits.length} routines · {habits.filter(h=>h.nn).length} non-négo</span>
            <Btn onClick={()=>setHabitForm("new")} style={{padding:"7px 12px",fontSize:12}}>+ Ajouter</Btn>
          </div>
          {habits.map(h=>{
            const c=CATS[h.cat]||{color:"#888"};
            return (
              <Card key={h.id} style={{padding:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:3,height:36,background:c.color,borderRadius:99,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{h.label}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>
                      {h.cat} · {h.freq==="daily"?"Quotidien":DAY_NAMES.filter((_,i)=>(h.days||[]).includes(i)).join("·")}
                      {h.nn?" · NN":""}{h.mvp?" · MVP":""}
                    </div>
                  </div>
                  <button onClick={()=>{setHD(h);setHabitForm("edit");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}}>✏️</button>
                  <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}}>🗑</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {section==="tasks"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:"#6b7280"}}>{tasks.filter(t=>!t.done).length} actives · {tasks.filter(t=>t.done).length} terminées</span>
            <Btn onClick={()=>setTaskForm("new")} style={{padding:"7px 12px",fontSize:12}}>+ Ajouter</Btn>
          </div>
          {projects.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{projects.map(p=><Badge key={p} color="#60a5fa">{p}</Badge>)}</div>}
          {tasks.filter(t=>!t.done).map(t=>{
            const u=URGENCY[t.urgency]||URGENCY.moyenne;
            return (
              <Card key={t.id} style={{padding:12}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <button onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,done:true}:x))} style={{width:20,height:20,borderRadius:5,border:`2px solid ${u.color}`,background:"transparent",cursor:"pointer",flexShrink:0,marginTop:1}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{t.title}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                      <Badge color={u.color}>{u.label}</Badge>
                      {t.project&&<Badge color="#60a5fa">{t.project}</Badge>}
                      {t.scheduledFor&&<Badge color="#6b7280">📅 {t.scheduledFor}</Badge>}
                      {t.duration&&<Badge color="#9ca3af">⏱ {t.duration}</Badge>}
                    </div>
                    {t.notes&&<div style={{fontSize:12,color:"#6b7280",marginTop:4}}>{t.notes}</div>}
                  </div>
                  <div style={{display:"flex",gap:2}}>
                    <button onClick={()=>{setTD(t);setTaskForm("edit");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:4}}>✏️</button>
                    <button onClick={()=>setTasks(p=>p.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:4}}>🗑</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {section==="profile"&&(
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:1,marginBottom:14}}>DONNÉES PERSONNELLES</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="Âge" value={profile.age||""} onChange={e=>setProfile(p=>({...p,age:e.target.value}))} type="number" placeholder="25"/>
              <FInput label="Poids (kg)" value={profile.weight||""} onChange={e=>setProfile(p=>({...p,weight:e.target.value}))} type="number" placeholder="75"/>
            </div>
            <FInput label="Taille (cm)" value={profile.height||""} onChange={e=>setProfile(p=>({...p,height:e.target.value}))} type="number" placeholder="180"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700}}>OBJECTIF PRINCIPAL</span>
              <textarea value={profile.goal||""} onChange={e=>setProfile(p=>({...p,goal:e.target.value}))} rows={2} placeholder="Monaco-Nice, développer mon business..." style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical"}}/>
            </div>
            <FInput label="Business / Projets actifs" value={profile.business||""} onChange={e=>setProfile(p=>({...p,business:e.target.value}))} placeholder="Agency 5Stars, Visa Focus..."/>
            <div style={{background:"#1f2937",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#6b7280"}}>
              💡 Ces données personnalisent les conseils du Coach IA en temps réel.
            </div>
          </div>
        </Card>
      )}

      {habitForm&&(
        <Modal title={habitForm==="new"?"Nouvelle routine":"Modifier"} onClose={()=>setHabitForm(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="Nom *" value={hD.label} onChange={e=>setHD(p=>({...p,label:e.target.value}))} placeholder="Nom de la routine..."/>
            <FSelect label="Catégorie" value={hD.cat} onChange={e=>setHD(p=>({...p,cat:e.target.value}))} options={Object.entries(CATS).map(([k,v])=>({value:k,label:`${v.emoji} ${k}`}))}/>
            <FSelect label="Fréquence" value={hD.freq} onChange={e=>setHD(p=>({...p,freq:e.target.value}))} options={[{value:"daily",label:"Quotidien"},{value:"specific",label:"Jours spécifiques"}]}/>
            {hD.freq==="specific"&&(
              <div>
                <div style={{fontSize:11,color:"#6b7280",fontWeight:700,marginBottom:8}}>JOURS</div>
                <div style={{display:"flex",gap:6}}>
                  {["D","L","Ma","Me","J","V","S"].map((d,i)=>(
                    <button key={i} onClick={()=>setHD(p=>({...p,days:p.days.includes(i)?p.days.filter(x=>x!==i):[...p.days,i]}))} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1px solid ${hD.days.includes(i)?"#fbbf24":"#374151"}`,background:hD.days.includes(i)?"#fbbf2425":"transparent",color:hD.days.includes(i)?"#fbbf24":"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>{d}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["nn","Non-négociable","#ef4444"],["mvp","Journée MVP","#fbbf24"]].map(([k,l,c])=>(
                <button key={k} onClick={()=>setHD(p=>({...p,[k]:!p[k]}))} style={{padding:"10px",borderRadius:10,border:`1px solid ${hD[k]?c:"#374151"}`,background:hD[k]?c+"25":"transparent",color:hD[k]?c:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setHabitForm(null)} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={saveH} style={{flex:2}}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {taskForm&&(
        <Modal title={taskForm==="new"?"Nouvelle tâche":"Modifier"} onClose={()=>setTaskForm(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <FInput label="Titre *" value={tD.title} onChange={e=>setTD(p=>({...p,title:e.target.value}))} placeholder="Titre de la tâche..."/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FSelect label="Urgence" value={tD.urgency} onChange={e=>setTD(p=>({...p,urgency:e.target.value}))} options={Object.entries(URGENCY).map(([k,v])=>({value:k,label:v.label}))}/>
              <FInput label="Projet" value={tD.project} onChange={e=>setTD(p=>({...p,project:e.target.value}))} placeholder="Agency 5Stars..."/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FInput label="Planifié le" value={tD.scheduledFor} onChange={e=>setTD(p=>({...p,scheduledFor:e.target.value}))} type="date"/>
              <FInput label="Durée" value={tD.duration} onChange={e=>setTD(p=>({...p,duration:e.target.value}))} placeholder="30m, 1h+..."/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <span style={{fontSize:11,color:"#6b7280",fontWeight:700}}>NOTES</span>
              <textarea value={tD.notes} onChange={e=>setTD(p=>({...p,notes:e.target.value}))} rows={2} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:10,color:"#f9fafb",padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setTaskForm(null)} variant="ghost" style={{flex:1}}>Annuler</Btn>
              <Btn onClick={saveT} style={{flex:2}}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
