import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAbWHgp0DZVSorRYoqC_mudYaSN32uZBoU",
  authDomain: "nexus-3ffb3.firebaseapp.com",
  projectId: "nexus-3ffb3",
  storageBucket: "nexus-3ffb3.firebasestorage.app",
  messagingSenderId: "511048180759",
  appId: "1:511048180759:web:cf9a009006ca0e7884e852"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── FIREBASE SYNC HOOK ────────────────────────────────────────────────────────
const USER_ID = "ndz_nexus";

function useFirestore(docPath, defaultVal) {
  const [data, setData] = useState(defaultVal);
  const [ready, setReady] = useState(false);
  const ref = doc(db, "users", USER_ID, "data", docPath);

  useEffect(() => {
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setData(snap.data().value ?? defaultVal);
      else setData(defaultVal);
      setReady(true);
    });
    return unsub;
  }, [docPath]);

  const set = useCallback(async (val) => {
    const next = typeof val === "function" ? val(data) : val;
    setData(next);
    await setDoc(ref, { value: next }, { merge: true });
  }, [data, ref]);

  return [data, set, ready];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const formatDate = (d) => new Date(d + "T12:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
const daysBetween = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 86400000);
const last7Days = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0]; });
const last30Days = () => Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().split("T")[0]; });

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = {
  Fitness:      { color: "#00d4aa", emoji: "🏃" },
  Work:         { color: "#f59e0b", emoji: "💼" },
  Spirituality: { color: "#a78bfa", emoji: "🕌" },
  Health:       { color: "#34d399", emoji: "💚" },
  Personal:     { color: "#60a5fa", emoji: "👤" },
  Discipline:   { color: "#f87171", emoji: "🔥" },
  Mind:         { color: "#c084fc", emoji: "🧠" },
};

const URGENCY = {
  critique: { label: "Critique", color: "#ef4444", dot: "🔴" },
  haute:    { label: "Haute",    color: "#f97316", dot: "🟠" },
  moyenne:  { label: "Moyenne",  color: "#eab308", dot: "🟡" },
  basse:    { label: "Basse",    color: "#22c55e", dot: "🟢" },
};

const DEFAULT_HABITS = [
  { id: "h1",  label: "Réveil Fajr",     cat: "Spirituality", freq: "daily", nn: true,  mvp: true  },
  { id: "h2",  label: "5 Prières",       cat: "Spirituality", freq: "daily", nn: true,  mvp: true  },
  { id: "h3",  label: "1 Verset Coran",  cat: "Spirituality", freq: "daily", nn: false, mvp: false },
  { id: "h4",  label: "Dhikr",           cat: "Spirituality", freq: "daily", nn: false, mvp: false },
  { id: "h5",  label: "Gym",             cat: "Fitness",      freq: "specific", days: [0,2,3], nn: false, mvp: false },
  { id: "h6",  label: "Boxe",            cat: "Fitness",      freq: "specific", days: [1,4,6], nn: false, mvp: false },
  { id: "h7",  label: "Course/Running",  cat: "Fitness",      freq: "specific", days: [0,3,5], nn: false, mvp: false },
  { id: "h8",  label: "Work deeply 2h",  cat: "Work",         freq: "daily", nn: true,  mvp: true  },
  { id: "h9",  label: "Lecture 30min",   cat: "Mind",         freq: "daily", nn: false, mvp: false },
  { id: "h10", label: "Cold shower",     cat: "Health",       freq: "daily", nn: false, mvp: true  },
  { id: "h11", label: "Hydratation 2L",  cat: "Health",       freq: "daily", nn: false, mvp: false },
  { id: "h12", label: "No music",        cat: "Discipline",   freq: "daily", nn: false, mvp: false },
  { id: "h13", label: "30m Max Insta",   cat: "Discipline",   freq: "daily", nn: false, mvp: false },
  { id: "h14", label: "Journaling",      cat: "Mind",         freq: "daily", nn: false, mvp: false },
  { id: "h15", label: "Sommeil 7h+",     cat: "Health",       freq: "daily", nn: true,  mvp: true  },
  { id: "h16", label: "Prospection",     cat: "Work",         freq: "daily", nn: false, mvp: false },
];

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16, ...style }}>
    {children}
  </div>
);

const Badge = ({ color, children, small }) => (
  <span style={{ background: color + "20", color, border: `1px solid ${color}40`, borderRadius: 20, padding: small ? "2px 8px" : "3px 10px", fontSize: small ? 10 : 11, fontWeight: 700, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Pill = ({ active, onClick, children, color = "#f59e0b" }) => (
  <button onClick={onClick} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: active ? color : "#1f2937", color: active ? "#000" : "#6b7280", border: "none" }}>
    {children}
  </button>
);

const ProgressBar = ({ value, max = 100, color = "#f59e0b", height = 6 }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ background: "#1f2937", borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
    </div>
  );
};

const Slider = ({ value, onChange, min = 0, max = 10, color = "#f59e0b" }) => (
  <div style={{ position: "relative" }}>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: color, height: 4 }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4b5563", marginTop: 2 }}>
      {Array.from({ length: max + 1 }, (_, i) => <span key={i}>{i}</span>)}
    </div>
  </div>
);

// Sparkline
const Sparkline = ({ data, color = "#f59e0b", height = 40 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color + "20"} stroke="none" />
    </svg>
  );
};

// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "today",   label: "Aujourd'hui", emoji: "☀️" },
  { id: "habits",  label: "Routine",     emoji: "✅" },
  { id: "tasks",   label: "Tâches",      emoji: "📋" },
  { id: "work",    label: "Travail",     emoji: "⏱" },
  { id: "analyse", label: "Analyses",    emoji: "📊" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("today");
  const [habits,    setHabits,    habitsReady]    = useFirestore("habits",      DEFAULT_HABITS);
  const [completions, setCompletions, compReady]  = useFirestore("completions", {});
  const [tasks,     setTasks,     tasksReady]     = useFirestore("tasks",       []);
  const [bodyData,  setBodyData,  bodyReady]      = useFirestore("body",        {});
  const [sessions,  setSessions,  sessReady]      = useFirestore("sessions",    []);
  const [workSess,  setWorkSess,  workReady]      = useFirestore("work",        []);
  const [journal,   setJournal,   journalReady]   = useFirestore("journal",     {});

  const ready = habitsReady && compReady && tasksReady && bodyReady;
  const todayStr = today();
  const todayComp = completions[todayStr] || {};

  // Score calculation
  const getScore = (dateStr) => {
    const comp = completions[dateStr] || {};
    const dayOfWeek = new Date(dateStr + "T12:00").getDay();
    const applicable = habits.filter(h => {
      if (!h.active && h.active !== undefined) return false;
      if (h.freq === "specific") return (h.days || []).includes(dayOfWeek);
      return true;
    });
    if (!applicable.length) return { pct: 0, done: 0, total: 0, nn: 0, nnTotal: 0 };
    const done = applicable.filter(h => comp[h.id]).length;
    const nnHabits = applicable.filter(h => h.nn);
    const nnDone = nnHabits.filter(h => comp[h.id]).length;
    const nnBroken = nnHabits.length > 0 && nnDone < nnHabits.length;
    let pct = Math.round((done / applicable.length) * 100);
    if (nnBroken) pct = Math.min(pct, 70);
    return { pct, done, total: applicable.length, nn: nnDone, nnTotal: nnHabits.length, nnBroken };
  };

  const todayScore = getScore(todayStr);

  const toggleHabit = (id) => {
    setCompletions(prev => ({
      ...prev,
      [todayStr]: { ...(prev[todayStr] || {}), [id]: !(prev[todayStr] || {})[id] }
    }));
  };

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ color: "#6b7280", fontSize: 14 }}>Synchronisation...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", color: "#f9fafb", fontFamily: "'Sora', 'SF Pro Display', -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "14px 20px 10px", borderBottom: "1px solid #1f2937", position: "sticky", top: 0, background: "#0a0f1a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5, lineHeight: 1 }}>NEXUS</div>
            <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: 2, fontWeight: 700 }}>PERFORMANCE OS</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: todayScore.nnBroken ? "#ef4444" : "#f59e0b", lineHeight: 1 }}>{todayScore.pct}%</div>
          <div style={{ fontSize: 10, color: "#4b5563" }}>{todayScore.done}/{todayScore.total} aujourd'hui</div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "16px", maxWidth: 680, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {tab === "today"   && <TodayTab habits={habits} todayComp={todayComp} toggleHabit={toggleHabit} todayStr={todayStr} todayScore={todayScore} tasks={tasks} setTasks={setTasks} bodyData={bodyData} setBodyData={setBodyData} sessions={sessions} journal={journal} setJournal={setJournal} completions={completions} getScore={getScore} workSess={workSess} />}
        {tab === "habits"  && <HabitsTab habits={habits} setHabits={setHabits} completions={completions} todayComp={todayComp} toggleHabit={toggleHabit} getScore={getScore} />}
        {tab === "tasks"   && <TasksTab tasks={tasks} setTasks={setTasks} />}
        {tab === "work"    && <WorkTab workSess={workSess} setWorkSess={setWorkSess} tasks={tasks} />}
        {tab === "analyse" && <AnalyseTab habits={habits} completions={completions} sessions={sessions} bodyData={bodyData} workSess={workSess} tasks={tasks} getScore={getScore} />}
      </main>

      {/* Bottom Nav */}
      <nav style={{ borderTop: "1px solid #1f2937", background: "#0a0f1a", position: "sticky", bottom: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 14px", maxWidth: 680, margin: "0 auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 10px", color: tab === t.id ? "#f59e0b" : "#4b5563", transition: "color .2s" }}>
              <span style={{ fontSize: 20, filter: tab === t.id ? "none" : "grayscale(1)", transition: "filter .2s" }}>{t.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{t.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </nav>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { font-family: inherit; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 99px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #f59e0b; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 99px; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TODAY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TodayTab({ habits, todayComp, toggleHabit, todayStr, todayScore, tasks, setTasks, bodyData, setBodyData, sessions, journal, setJournal, completions, getScore, workSess }) {
  const [bodyOpen, setBodyOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const todayBody = bodyData[todayStr] || {};
  const todayJournal = journal[todayStr] || {};

  const urgentTasks = tasks.filter(t => !t.done && (t.urgency === "critique" || t.urgency === "haute"));
  const todayTasks = tasks.filter(t => !t.done && t.scheduledFor === todayStr);

  const weekDays = last7Days().map(d => ({ d, score: getScore(d) }));

  const todayWorkMin = workSess.filter(s => s.date === todayStr).reduce((a, b) => a + (b.duration || 0), 0);

  // Body signal save
  const saveBody = (field, val) => {
    setBodyData(prev => ({ ...prev, [todayStr]: { ...(prev[todayStr] || {}), [field]: val } }));
  };

  const saveJournal = (field, val) => {
    setJournal(prev => ({ ...prev, [todayStr]: { ...(prev[todayStr] || {}), [field]: val } }));
  };

  // Group habits by category for today
  const byCategory = habits.reduce((acc, h) => {
    if (h.active === false) return acc;
    const dayOfWeek = new Date(todayStr + "T12:00").getDay();
    if (h.freq === "specific" && !(h.days || []).includes(dayOfWeek)) return acc;
    (acc[h.cat] = acc[h.cat] || []).push(h);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Date */}
      <div style={{ textAlign: "center", paddingBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Aujourd'hui</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{formatDate(todayStr)}</div>
      </div>

      {/* Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ROUTINE</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{todayScore.pct}%</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{todayScore.done}/{todayScore.total}</div>
          <ProgressBar value={todayScore.pct} color="#f59e0b" height={4} style={{ marginTop: 8 }} />
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>NON-NÉG.</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: todayScore.nnBroken ? "#ef4444" : "#34d399", lineHeight: 1 }}>
            {todayScore.nn}/{todayScore.nnTotal}
          </div>
          <div style={{ fontSize: 11, color: todayScore.nnBroken ? "#ef4444" : "#6b7280", marginTop: 4 }}>
            {todayScore.nnBroken ? "⚠️ Standard brisé" : "✅ Standards OK"}
          </div>
          {todayScore.nnBroken && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>Score plafonné à 70%</div>}
        </Card>
      </div>

      {/* Week sparkline */}
      <Card>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PROGRESSION 7 JOURS</div>
        <Sparkline data={weekDays.map(d => d.score.pct)} color="#f59e0b" height={50} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {weekDays.map(({ d, score }) => (
            <div key={d} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 10, color: score.pct >= 80 ? "#f59e0b" : "#4b5563", fontWeight: 700 }}>{score.pct}%</div>
              <div style={{ fontSize: 9, color: "#374151" }}>{["D","L","M","Me","J","V","S"][new Date(d + "T12:00").getDay()]}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "Travail", value: `${Math.floor(todayWorkMin / 60)}h${todayWorkMin % 60 > 0 ? (todayWorkMin % 60) + "m" : ""}`, color: "#60a5fa", sub: "focus today" },
          { label: "Urgent", value: urgentTasks.length, color: "#ef4444", sub: "tâches" },
          { label: "Énergie", value: todayBody.energy !== undefined ? `${todayBody.energy}/10` : "—", color: "#34d399", sub: "niveau" },
        ].map(s => (
          <Card key={s.label} style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Intention du jour */}
      <Card>
        <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🎯 INTENTION DU JOUR</div>
        <input
          value={todayJournal.intention || ""}
          onChange={e => saveJournal("intention", e.target.value)}
          placeholder="Quelle est ton intention pour aujourd'hui ?"
          style={{ ...IS, width: "100%" }}
        />
      </Card>

      {/* Habits by category */}
      {Object.entries(byCategory).map(([cat, hs]) => {
        const catColor = CATEGORIES[cat]?.color || "#f59e0b";
        const catDone = hs.filter(h => todayComp[h.id]).length;
        return (
          <Card key={cat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{CATEGORIES[cat]?.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: catColor, letterSpacing: 1 }}>{cat.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{catDone}/{hs.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hs.map(h => (
                <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: todayComp[h.id] ? catColor + "15" : "#1f2937",
                  border: `1px solid ${todayComp[h.id] ? catColor + "50" : "#374151"}`,
                  borderRadius: 10, cursor: "pointer", color: "#f9fafb", transition: "all .15s", textAlign: "left",
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${todayComp[h.id] ? catColor : "#374151"}`, background: todayComp[h.id] ? catColor : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {todayComp[h.id] && <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: todayComp[h.id] ? "line-through" : "none", color: todayComp[h.id] ? "#6b7280" : "#f9fafb" }}>{h.label}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {h.nn && <Badge color="#ef4444" small>NN</Badge>}
                    {h.mvp && <Badge color="#f59e0b" small>MVP</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Tâches du jour */}
      {todayTasks.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
            TÂCHES DU JOUR <span style={{ background: "#374151", borderRadius: 99, padding: "2px 7px" }}>{todayTasks.length}</span>
          </div>
          {todayTasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
              <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: true } : x))} style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid #374151", background: "transparent", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                  {t.project && <Badge color="#60a5fa" small>{t.project}</Badge>}
                  {t.duration && <span style={{ fontSize: 10, color: "#6b7280" }}>⏱ {t.duration}</span>}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Body signals */}
      <Card>
        <button onClick={() => setBodyOpen(!bodyOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", color: "#f9fafb", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>⚖️ Signaux Corporels</span>
          <span style={{ color: "#4b5563", fontSize: 18 }}>{bodyOpen ? "∧" : "∨"}</span>
        </button>
        {bodyOpen && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>POIDS (kg)</div>
              <input type="number" step="0.1" value={todayBody.poids || ""} onChange={e => saveBody("poids", e.target.value)} placeholder="70.0" style={{ ...IS, width: "100%" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>
                <span>⚡ ÉNERGIE</span><span style={{ color: "#f59e0b" }}>{todayBody.energy ?? 5}/10</span>
              </div>
              <Slider value={todayBody.energy ?? 5} onChange={v => saveBody("energy", v)} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>
                <span>😰 STRESS</span><span style={{ color: "#ef4444" }}>{todayBody.stress ?? 3}/10</span>
              </div>
              <Slider value={todayBody.stress ?? 3} onChange={v => saveBody("stress", v)} color="#ef4444" />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>
                <span>😴 SOMMEIL (h)</span><span style={{ color: "#a78bfa" }}>{todayBody.sleep ?? 7}h</span>
              </div>
              <Slider value={todayBody.sleep ?? 7} onChange={v => saveBody("sleep", v)} min={0} max={12} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 6 }}>QUALITÉ SOMMEIL</div>
              <Slider value={todayBody.sleepQ ?? 5} onChange={v => saveBody("sleepQ", v)} color="#a78bfa" />
            </div>
          </div>
        )}
      </Card>

      {/* Clôturer ma journée */}
      <button onClick={() => setCloseOpen(true)} style={{ ...BS, background: "#f9fafb", color: "#0a0f1a", fontWeight: 800, fontSize: 16, padding: "16px", borderRadius: 14, width: "100%" }}>
        Clôturer ma journée
      </button>

      {/* Close day modal */}
      {closeOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={() => setCloseOpen(false)}>
          <div style={{ background: "#111827", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 680, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Clôture du jour 🌙</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Score du jour : <span style={{ color: "#f59e0b", fontWeight: 800 }}>{todayScore.pct}%</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={LS}>🙏 3 Gratitudes</label>
                <textarea value={todayJournal.gratitude || ""} onChange={e => saveJournal("gratitude", e.target.value)} rows={2} placeholder="Je suis reconnaissant pour..." style={{ ...IS, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={LS}>💭 Réflexion / Brain dump</label>
                <textarea value={todayJournal.reflection || ""} onChange={e => saveJournal("reflection", e.target.value)} rows={3} placeholder="Ce qui occupe mon esprit..." style={{ ...IS, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={LS}>⭐ Victoire du jour</label>
                <input value={todayJournal.win || ""} onChange={e => saveJournal("win", e.target.value)} placeholder="Ma plus grande victoire aujourd'hui..." style={{ ...IS, width: "100%" }} />
              </div>
              <button onClick={() => setCloseOpen(false)} style={{ ...BS, background: "#f59e0b", color: "#000", fontWeight: 800, padding: "14px", borderRadius: 12, width: "100%" }}>
                Enregistrer et clôturer ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HABITS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function HabitsTab({ habits, setHabits, completions, todayComp, toggleHabit, getScore }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState({ label: "", cat: "Personal", freq: "daily", days: [], nn: false, mvp: false, active: true });
  const days7 = last7Days();

  const streak = (id) => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (completions[ds]?.[id]) s++;
      else if (i > 0) break;
    }
    return s;
  };

  const bestStreak = (id) => {
    let best = 0, cur = 0;
    const sorted = Object.keys(completions).sort();
    for (const d of sorted) {
      if (completions[d]?.[id]) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    }
    return best;
  };

  const completionRate = (id) => {
    const days = last30Days();
    const done = days.filter(d => completions[d]?.[id]).length;
    return Math.round((done / days.length) * 100);
  };

  const saveHabit = () => {
    if (!draft.label.trim()) return;
    if (draft.id) setHabits(prev => prev.map(h => h.id === draft.id ? draft : h));
    else setHabits(prev => [...prev, { ...draft, id: Date.now().toString() }]);
    setForm(null);
    setDraft({ label: "", cat: "Personal", freq: "daily", days: [], nn: false, mvp: false, active: true });
  };

  const deleteHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));
  const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Routine</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Tes standards et ta structure</div>
        </div>
        <button onClick={() => setForm("new")} style={{ ...BS, background: "#f59e0b", color: "#000", padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          + Ajouter
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "Actifs",    value: habits.filter(h => h.active !== false).length, color: "#f9fafb" },
          { label: "Non-nég",  value: habits.filter(h => h.nn).length, color: "#ef4444" },
          { label: "Catégories", value: [...new Set(habits.map(h => h.cat))].length, color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* 7-day heatmap */}
      <Card>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>HEATMAP 7 JOURS</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <td style={{ fontSize: 11, color: "#4b5563", paddingBottom: 6, minWidth: 100 }}>Habitude</td>
                {days7.map(d => (
                  <td key={d} style={{ textAlign: "center", fontSize: 9, color: "#4b5563", paddingBottom: 6, minWidth: 28 }}>
                    {["D","L","M","Me","J","V","S"][new Date(d + "T12:00").getDay()]}
                  </td>
                ))}
                <td style={{ fontSize: 9, color: "#4b5563", paddingBottom: 6, textAlign: "right", paddingLeft: 8 }}>30j</td>
              </tr>
            </thead>
            <tbody>
              {habits.filter(h => h.active !== false).map(h => {
                const cat = CATEGORIES[h.cat] || {};
                return (
                  <tr key={h.id}>
                    <td style={{ fontSize: 11, color: "#d1d5db", paddingBottom: 4, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.label}</td>
                    {days7.map(d => {
                      const done = completions[d]?.[h.id];
                      return (
                        <td key={d} style={{ textAlign: "center", paddingBottom: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, margin: "0 auto", background: done ? (cat.color || "#f59e0b") : "#1f2937", transition: "background .2s" }} />
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "right", paddingLeft: 8 }}>
                      <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>{completionRate(h.id)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Habits list */}
      {habits.filter(h => h.active !== false).map(h => {
        const cat = CATEGORIES[h.cat] || {};
        const s = streak(h.id);
        const bs = bestStreak(h.id);
        const rate = completionRate(h.id);
        return (
          <Card key={h.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <button onClick={() => toggleHabit(h.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${todayComp[h.id] ? cat.color : "#374151"}`, background: todayComp[h.id] ? cat.color : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {todayComp[h.id] && <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span>}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{h.label}</span>
                  {h.nn && <Badge color="#ef4444" small>NN</Badge>}
                  {h.mvp && <Badge color="#f59e0b" small>MVP</Badge>}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                  <span style={{ color: cat.color }}>{h.cat}</span>
                  {" · "}
                  {h.freq === "daily" ? "Quotidien" : DAY_LABELS.filter((_, i) => (h.days || []).includes(i)).join("·")}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: s > 0 ? "#f59e0b" : "#4b5563" }}>{s}</div>
                    <div style={{ fontSize: 9, color: "#4b5563" }}>streak</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#60a5fa" }}>{bs}</div>
                    <div style={{ fontSize: 9, color: "#4b5563" }}>record</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 3 }}>
                      <span>30 jours</span><span style={{ fontWeight: 700, color: rate >= 80 ? "#34d399" : rate >= 50 ? "#f59e0b" : "#ef4444" }}>{rate}%</span>
                    </div>
                    <ProgressBar value={rate} color={rate >= 80 ? "#34d399" : rate >= 50 ? "#f59e0b" : "#ef4444"} height={4} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => { setDraft(h); setForm("edit"); }} style={{ ...IconBtn }}> ✏️ </button>
                <button onClick={() => deleteHabit(h.id)} style={{ ...IconBtn }}> 🗑 </button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Form Modal */}
      {form && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={() => setForm(null)}>
          <div style={{ background: "#111827", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 680, margin: "0 auto", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>{form === "new" ? "Ajouter une habitude" : "Modifier"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={LS}>Nom de l'habitude *</label><input value={draft.label} onChange={e => setDraft(p => ({ ...p, label: e.target.value }))} placeholder="..." style={{ ...IS, width: "100%" }} /></div>
              <div>
                <label style={LS}>Catégorie</label>
                <select value={draft.cat} onChange={e => setDraft(p => ({ ...p, cat: e.target.value }))} style={{ ...IS, width: "100%" }}>
                  {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{CATEGORIES[c].emoji} {c}</option>)}
                </select>
              </div>
              <div>
                <label style={LS}>Fréquence</label>
                <select value={draft.freq} onChange={e => setDraft(p => ({ ...p, freq: e.target.value }))} style={{ ...IS, width: "100%" }}>
                  <option value="daily">Quotidien</option>
                  <option value="specific">Jours spécifiques</option>
                </select>
              </div>
              {draft.freq === "specific" && (
                <div>
                  <label style={LS}>Jours</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["D","L","Ma","Me","J","V","S"].map((d, i) => (
                      <button key={i} onClick={() => setDraft(p => ({ ...p, days: p.days.includes(i) ? p.days.filter(x => x !== i) : [...p.days, i] }))} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${draft.days.includes(i) ? "#f59e0b" : "#374151"}`, background: draft.days.includes(i) ? "#f59e0b20" : "transparent", color: draft.days.includes(i) ? "#f59e0b" : "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{d}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                {[["nn", "Non-négociable", "#ef4444"], ["mvp", "Journée MVP", "#f59e0b"]].map(([k, l, c]) => (
                  <button key={k} onClick={() => setDraft(p => ({ ...p, [k]: !p[k] }))} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${draft[k] ? c : "#374151"}`, background: draft[k] ? c + "20" : "transparent", color: draft[k] ? c : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setForm(null)} style={{ ...BS, background: "#1f2937", color: "#9ca3af", flex: 1 }}>Annuler</button>
                <button onClick={saveHabit} style={{ ...BS, background: "#f59e0b", color: "#000", fontWeight: 800, flex: 2 }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TasksTab({ tasks, setTasks }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState("active");
  const [projectFilter, setProjectFilter] = useState("Toutes");
  const [draft, setDraft] = useState({ title: "", urgency: "moyenne", project: "", scheduledFor: "", duration: "", notes: "" });

  const projects = ["Toutes", ...new Set(tasks.map(t => t.project).filter(Boolean))];

  const save = () => {
    if (!draft.title.trim()) return;
    if (draft.id) setTasks(prev => prev.map(t => t.id === draft.id ? draft : t));
    else setTasks(prev => [...prev, { ...draft, id: Date.now().toString(), done: false, createdAt: today() }]);
    setForm(null);
    setDraft({ title: "", urgency: "moyenne", project: "", scheduledFor: "", duration: "", notes: "" });
  };

  const filtered = tasks.filter(t => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (projectFilter !== "Toutes" && t.project !== projectFilter) return false;
    return true;
  }).sort((a, b) => {
    const o = { critique: 0, haute: 1, moyenne: 2, basse: 3 };
    return (o[a.urgency] || 2) - (o[b.urgency] || 2);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Tâches</div>
        <button onClick={() => setForm("new")} style={{ ...BS, background: "#f59e0b", color: "#000", padding: "8px 14px", fontSize: 13 }}>+ Nouvelle</button>
      </div>

      {/* Urgency stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {Object.entries(URGENCY).map(([k, v]) => {
          const count = tasks.filter(t => t.urgency === k && !t.done).length;
          return (
            <Card key={k} style={{ padding: 10, textAlign: "center", border: `1px solid ${v.color}30` }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: v.color }}>{count}</div>
              <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 700 }}>{v.label.toUpperCase()}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["active", "done", "all"].map(f => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f === "active" ? "En cours" : f === "done" ? "✓ Terminées" : "Toutes"}</Pill>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {projects.map(p => <Pill key={p} active={projectFilter === p} onClick={() => setProjectFilter(p)}>{p}</Pill>)}
        <button onClick={() => { const name = prompt("Nom du projet :"); if (name) setProjectFilter(name); }} style={{ ...BS, background: "#1f2937", color: "#6b7280", fontSize: 12, padding: "5px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>+ Projet</button>
      </div>

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#4b5563", padding: 40 }}>Aucune tâche 🎉</div>}
        {filtered.map(t => {
          const u = URGENCY[t.urgency] || URGENCY.moyenne;
          return (
            <Card key={t.id} style={{ opacity: t.done ? 0.5 : 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.done ? "#34d399" : u.color}`, background: t.done ? "#34d399" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                    <Badge color={u.color} small>{u.dot} {u.label}</Badge>
                    {t.project && <Badge color="#60a5fa" small>{t.project}</Badge>}
                    {t.scheduledFor && <Badge color="#6b7280" small>📅 {t.scheduledFor}</Badge>}
                    {t.duration && <Badge color="#9ca3af" small>⏱ {t.duration}</Badge>}
                  </div>
                  {t.notes && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>{t.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => { setDraft(t); setForm("edit"); }} style={IconBtn}>✏️</button>
                  <button onClick={() => setTasks(prev => prev.filter(x => x.id !== t.id))} style={IconBtn}>🗑</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Form modal */}
      {form && (
        <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={() => setForm(null)}>
          <div style={{ background: "#111827", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 680, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>{form === "new" ? "Nouvelle tâche" : "Modifier"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Titre de la tâche..." style={{ ...IS, width: "100%" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={LS}>Urgence</label>
                  <select value={draft.urgency} onChange={e => setDraft(p => ({ ...p, urgency: e.target.value }))} style={{ ...IS, width: "100%" }}>
                    {Object.entries(URGENCY).map(([k, v]) => <option key={k} value={k}>{v.dot} {v.label}</option>)}
                  </select>
                </div>
                <div><label style={LS}>Projet</label>
                  <input value={draft.project} onChange={e => setDraft(p => ({ ...p, project: e.target.value }))} placeholder="Agency 5Stars..." style={{ ...IS, width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={LS}>Planifié le</label><input type="date" value={draft.scheduledFor} onChange={e => setDraft(p => ({ ...p, scheduledFor: e.target.value }))} style={{ ...IS, width: "100%" }} /></div>
                <div><label style={LS}>Durée estimée</label><input value={draft.duration} onChange={e => setDraft(p => ({ ...p, duration: e.target.value }))} placeholder="30m, 1h..." style={{ ...IS, width: "100%" }} /></div>
              </div>
              <textarea value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))} placeholder="Notes..." rows={2} style={{ ...IS, width: "100%", resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setForm(null)} style={{ ...BS, background: "#1f2937", color: "#9ca3af", flex: 1 }}>Annuler</button>
                <button onClick={save} style={{ ...BS, background: "#f59e0b", color: "#000", fontWeight: 800, flex: 2 }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORK TAB
// ═══════════════════════════════════════════════════════════════════════════════
function WorkTab({ workSess, setWorkSess, tasks }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");
  const [focus, setFocus] = useState("");
  const [customMin, setCustomMin] = useState("");
  const [targetMin, setTargetMin] = useState(0);
  const interval = useRef(null);
  const startTime = useRef(null);

  const todayStr = today();
  const todayWork = workSess.filter(s => s.date === todayStr);
  const todayMin = todayWork.reduce((a, b) => a + (b.duration || 0), 0);
  const weekMin = workSess.filter(s => (new Date() - new Date(s.date + "T12:00")) / 86400000 <= 7).reduce((a, b) => a + (b.duration || 0), 0);

  const formatTime = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const formatMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? (m % 60) + "m" : ""}` : `${m}m`;

  const start = (min = 0) => {
    setTargetMin(min);
    setRunning(true);
    startTime.current = Date.now() - elapsed * 1000;
    interval.current = setInterval(() => {
      const s = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(s);
      if (min > 0 && s >= min * 60) stop(s);
    }, 1000);
  };

  const stop = (forcedElapsed) => {
    clearInterval(interval.current);
    setRunning(false);
    const dur = Math.round((forcedElapsed ?? elapsed) / 60);
    if (dur > 0) {
      setWorkSess(prev => [...prev, { id: Date.now().toString(), date: todayStr, duration: dur, task: selectedTask, focus, startedAt: new Date().toISOString() }]);
    }
    setElapsed(0);
    setTargetMin(0);
  };

  useEffect(() => () => clearInterval(interval.current), []);

  const pct = targetMin > 0 ? Math.min((elapsed / (targetMin * 60)) * 100, 100) : 0;

  const last7Work = last7Days().map(d => ({ d, min: workSess.filter(s => s.date === d).reduce((a, b) => a + (b.duration || 0), 0) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 20 }}>Travail</div>

      {/* Total today */}
      <Card style={{ textAlign: "center", padding: 20 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TOTAL DU JOUR</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#f59e0b", letterSpacing: -1 }}>{formatMin(todayMin)}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Cette semaine : {formatMin(weekMin)}</div>
      </Card>

      {/* Timer */}
      <Card>
        {targetMin > 0 && (
          <div style={{ marginBottom: 12 }}>
            <ProgressBar value={pct} color="#f59e0b" height={6} />
            <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right", marginTop: 4 }}>{Math.round(pct)}%</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 900, fontVariantNumeric: "tabular-nums", flex: 1, color: running ? "#f59e0b" : "#f9fafb" }}>{formatTime(elapsed)}</div>
          {running
            ? <button onClick={() => stop()} style={{ ...BS, background: "#ef4444", color: "#fff", padding: "10px 20px", fontSize: 14 }}>■ Stop</button>
            : <button onClick={() => start()} style={{ ...BS, background: "#f59e0b", color: "#000", padding: "10px 20px", fontSize: 14 }}>▶ Start</button>
          }
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={LS}>Sélectionner une tâche</label>
          <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} style={{ ...IS, width: "100%" }}>
            <option value="">— Tâche libre —</option>
            {tasks.filter(t => !t.done).map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={LS}>Sur quoi te concentres-tu ?</label>
          <input value={focus} onChange={e => setFocus(e.target.value)} placeholder="Décris ton focus..." style={{ ...IS, width: "100%" }} />
        </div>

        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, marginBottom: 8 }}>DÉMARRER UN BLOC</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
          {[30, 60, 120].map(m => (
            <button key={m} onClick={() => start(m)} disabled={running} style={{ ...BS, background: "#1f2937", color: "#f9fafb", padding: "12px", fontSize: 14, fontWeight: 700, opacity: running ? 0.4 : 1 }}>
              {m < 60 ? `${m}m` : `${m / 60}h`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={customMin} onChange={e => setCustomMin(e.target.value)} placeholder="Personnalisé (min)" type="number" style={{ ...IS, flex: 1 }} />
          <button onClick={() => customMin && start(Number(customMin))} disabled={running} style={{ ...BS, background: "#1f2937", color: "#f9fafb", padding: "10px 14px", opacity: running ? 0.4 : 1 }}>▶</button>
        </div>
      </Card>

      {/* Week chart */}
      <Card>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>FOCUS CETTE SEMAINE</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
          {last7Work.map(({ d, min }) => {
            const maxMin = Math.max(...last7Work.map(x => x.min), 60);
            return (
              <div key={d} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: `${Math.max((min / maxMin) * 50, 2)}px`, background: min >= 120 ? "#f59e0b" : min > 0 ? "#f59e0b80" : "#1f2937", borderRadius: "4px 4px 0 0", marginBottom: 4, transition: "height .5s" }} />
                <div style={{ fontSize: 9, color: "#4b5563" }}>{["D","L","M","Me","J","V","S"][new Date(d + "T12:00").getDay()]}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>{min > 0 ? formatMin(min) : ""}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Session log */}
      {todayWork.length > 0 && (
        <Card>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>SESSIONS DU JOUR</div>
          {todayWork.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937", fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.task || s.focus || "Session libre"}</div>
                {s.focus && s.task && <div style={{ fontSize: 11, color: "#6b7280" }}>{s.focus}</div>}
              </div>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{formatMin(s.duration)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSE TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyseTab({ habits, completions, sessions, bodyData, workSess, tasks, getScore }) {
  const [period, setPeriod] = useState("7d");

  const days = period === "7d" ? last7Days() : last30Days();

  const scores = days.map(d => ({ d, ...getScore(d) }));
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length) : 0;
  const bestDay = scores.reduce((best, s) => s.pct > (best?.pct || 0) ? s : best, null);
  const perfectDays = scores.filter(s => s.pct >= 90).length;

  // Top habits
  const habitRates = habits.map(h => {
    const done = days.filter(d => completions[d]?.[h.id]).length;
    return { ...h, rate: Math.round((done / days.length) * 100) };
  }).sort((a, b) => b.rate - a.rate);

  // Body trends
  const energyData = days.map(d => bodyData[d]?.energy ?? null).filter(v => v !== null);
  const avgEnergy = energyData.length ? (energyData.reduce((a, b) => a + b, 0) / energyData.length).toFixed(1) : "—";
  const sleepData = days.map(d => bodyData[d]?.sleep ?? null).filter(v => v !== null);
  const avgSleep = sleepData.length ? (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1) : "—";

  // Work
  const totalWorkMin = days.reduce((a, d) => a + workSess.filter(s => s.date === d).reduce((x, y) => x + (y.duration || 0), 0), 0);
  const formatMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? (m % 60) + "m" : ""}` : `${m}m`;

  // Week over week comparison
  const prev7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split("T")[0]; });
  const currAvg = Math.round(last7Days().map(d => getScore(d).pct).reduce((a, b) => a + b, 0) / 7);
  const prevAvg = Math.round(prev7.map(d => getScore(d).pct).reduce((a, b) => a + b, 0) / 7);
  const diff = currAvg - prevAvg;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Analyses</div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill active={period === "7d"} onClick={() => setPeriod("7d")}>7 jours</Pill>
          <Pill active={period === "30d"} onClick={() => setPeriod("30d")}>30 jours</Pill>
        </div>
      </div>

      {/* Global score */}
      <Card style={{ background: "linear-gradient(135deg, #111827, #1f2937)" }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SCORE MOYEN — {period === "7d" ? "7 JOURS" : "30 JOURS"}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: avgScore >= 80 ? "#34d399" : avgScore >= 60 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>{avgScore}%</div>
          <div>
            <div style={{ fontSize: 13, color: diff >= 0 ? "#34d399" : "#ef4444", fontWeight: 700 }}>{diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}% vs sem. préc.</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{perfectDays} jours parfaits (90%+)</div>
          </div>
        </div>
        <Sparkline data={scores.map(s => s.pct)} color={avgScore >= 70 ? "#34d399" : "#f59e0b"} height={60} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#4b5563" }}>
          {scores.filter((_, i) => i % Math.ceil(scores.length / 6) === 0).map(s => (
            <span key={s.d}>{new Date(s.d + "T12:00").getDate()}/{new Date(s.d + "T12:00").getMonth() + 1}</span>
          ))}
        </div>
      </Card>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Meilleur jour", value: bestDay ? `${bestDay.pct}%` : "—", sub: bestDay ? formatDate(bestDay.d) : "", color: "#34d399" },
          { label: "Focus travail", value: formatMin(totalWorkMin), sub: `sur ${period}`, color: "#60a5fa" },
          { label: "Énergie moy.", value: `${avgEnergy}/10`, sub: "moyenne", color: "#f59e0b" },
          { label: "Sommeil moy.", value: `${avgSleep}h`, sub: "par nuit", color: "#a78bfa" },
        ].map(m => (
          <Card key={m.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{m.label}</div>
            <div style={{ fontSize: 10, color: "#4b5563" }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Top habits */}
      <Card>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>TOP HABITUDES — {period}</div>
        {habitRates.slice(0, 10).map((h, i) => {
          const cat = CATEGORIES[h.cat] || {};
          return (
            <div key={h.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#4b5563", fontSize: 11, fontWeight: 700, width: 16 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{h.label}</span>
                </div>
                <span style={{ fontWeight: 800, color: h.rate >= 80 ? "#34d399" : h.rate >= 50 ? "#f59e0b" : "#ef4444" }}>{h.rate}%</span>
              </div>
              <ProgressBar value={h.rate} color={h.rate >= 80 ? "#34d399" : h.rate >= 50 ? "#f59e0b" : "#ef4444"} height={5} />
            </div>
          );
        })}
      </Card>

      {/* Category breakdown */}
      <Card>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PAR CATÉGORIE</div>
        {Object.entries(CATEGORIES).map(([cat, { color, emoji }]) => {
          const catHabits = habitRates.filter(h => h.cat === cat);
          if (!catHabits.length) return null;
          const avg = Math.round(catHabits.reduce((a, b) => a + b.rate, 0) / catHabits.length);
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{emoji} {cat}</span>
                <span style={{ fontWeight: 800, color }}>{avg}%</span>
              </div>
              <ProgressBar value={avg} color={color} height={5} />
            </div>
          );
        })}
      </Card>

      {/* Axes d'amélioration */}
      <Card style={{ border: "1px solid #ef444430" }}>
        <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>⚠️ AXES D'AMÉLIORATION</div>
        {habitRates.filter(h => h.rate < 60).slice(0, 5).map(h => (
          <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h.label}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{h.cat}</div>
            </div>
            <Badge color="#ef4444">{h.rate}%</Badge>
          </div>
        ))}
        {habitRates.filter(h => h.rate < 60).length === 0 && (
          <div style={{ color: "#34d399", fontSize: 13 }}>🎉 Toutes tes habitudes sont au-dessus de 60% !</div>
        )}
      </Card>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const IS = { background: "#1f2937", border: "1px solid #374151", borderRadius: 10, color: "#f9fafb", padding: "10px 14px", fontSize: 14, outline: "none" };
const LS = { fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 };
const BS = { border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14 };
const IconBtn = { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "4px", borderRadius: 6, opacity: 0.6 };
