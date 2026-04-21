import { useState, useEffect, useRef } from "react";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  habits:  "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  tasks:   "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  sport:   "M13 10V3L4 14h7v7l9-11h-7z",
  spirit:  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  ai:      "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  plus:    "M12 5v14M5 12h14",
  check:   "M20 6L9 17l-5-5",
  trash:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  run:     "M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7 21l3-8 2 3 3-4 2 9",
  fire:    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
  close:   "M18 6L6 18M6 6l12 12",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  chevron: "M9 18l6-6-6-6",
  flag:    "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  brain:   "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z",
  dumbbell:"M6.5 6.5h11M6.5 17.5h11M3 12h18M8 6v12M16 6v12",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  medal:   "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
};

// ─── DATA STORAGE ────────────────────────────────────────────────────────────
const useStorage = (key, defaultVal) => {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? defaultVal; }
    catch { return defaultVal; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return [val, set];
};

const today = () => new Date().toISOString().split("T")[0];

// ─── COLORS ──────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  business:    { bg: "#1a1a2e", accent: "#e94560", light: "#ff6b6b" },
  spiritualite: { bg: "#0d1b2a", accent: "#7b61ff", light: "#a78bfa" },
  sport:       { bg: "#0a1628", accent: "#00d4aa", light: "#34d399" },
  hygiene:     { bg: "#1a1200", accent: "#f59e0b", light: "#fbbf24" },
  perso:       { bg: "#1a0a1a", accent: "#ec4899", light: "#f472b6" },
};

const URGENCY = {
  critique: { label: "🔴 Critique", color: "#ef4444" },
  haute:    { label: "🟠 Haute",    color: "#f97316" },
  moyenne:  { label: "🟡 Moyenne",  color: "#eab308" },
  basse:    { label: "🟢 Basse",    color: "#22c55e" },
};

const PROJECTS = ["Monaco-Nice", "Business", "Perso", "Santé", "Spiritualité"];

const HABIT_DEFAULTS = [
  { id: "h1", label: "Méditation", icon: "🧘", cat: "spiritualite" },
  { id: "h2", label: "Sport / Séance", icon: "🏃", cat: "sport" },
  { id: "h3", label: "Lecture 30min", icon: "📖", cat: "perso" },
  { id: "h4", label: "Cold shower", icon: "🚿", cat: "hygiene" },
  { id: "h5", label: "Journaling", icon: "✍️", cat: "spiritualite" },
  { id: "h6", label: "Hydratation 2L", icon: "💧", cat: "hygiene" },
  { id: "h7", label: "Sommeil 7h+", icon: "😴", cat: "hygiene" },
  { id: "h8", label: "Prospection", icon: "💼", cat: "business" },
];

const SESSION_TYPES = ["Course", "Gym", "Boxe", "Vélo", "Natation", "Yoga", "Marche", "Repos actif"];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
    {children}
  </span>
);

const Pill = ({ active, onClick, children, color = "#7b61ff" }) => (
  <button onClick={onClick} style={{
    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s",
    background: active ? color : "transparent",
    color: active ? "#fff" : "#888",
    border: `1px solid ${active ? color : "#333"}`,
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 20, ...style }}>
    {children}
  </div>
);

// ─── TABS ────────────────────────────────────────────────────────────────────
const tabs = [
  { id: "home",    label: "Vue d'ensemble", icon: icons.home },
  { id: "habits",  label: "Habitudes",      icon: icons.habits },
  { id: "tasks",   label: "Tâches",         icon: icons.tasks },
  { id: "sport",   label: "Sport",          icon: icons.sport },
  { id: "spirit",  label: "Esprit",         icon: icons.spirit },
  { id: "ai",      label: "IA Coach",       icon: icons.ai },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("home");
  const [habits] = useStorage("habits_def", HABIT_DEFAULTS);
  const [completions, setCompletions] = useStorage("completions", {});
  const [tasks, setTasks] = useStorage("tasks", []);
  const [sessions, setSessions] = useStorage("sessions", []);
  const [moods, setMoods] = useStorage("moods", {});
  const [journalEntries, setJournalEntries] = useStorage("journal", []);

  const todayStr = today();
  const todayCompletions = completions[todayStr] || {};

  const toggleHabit = (id) => {
    setCompletions(prev => ({
      ...prev,
      [todayStr]: { ...prev[todayStr], [id]: !prev[todayStr]?.[id] }
    }));
  };

  const habitScore = () => {
    const done = habits.filter(h => todayCompletions[h.id]).length;
    return Math.round((done / habits.length) * 100);
  };

  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  });

  const urgentTasks = tasks.filter(t => !t.done && (t.urgency === "critique" || t.urgency === "haute"));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7b61ff, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>NEXUS</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>PERFORMANCE HUB</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#888" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#00d4aa" }}>{habitScore()}%</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {tab === "home"   && <HomeTab habits={habits} todayCompletions={todayCompletions} toggleHabit={toggleHabit} tasks={urgentTasks} sessions={weekSessions} habitScore={habitScore()} moods={moods} setMoods={setMoods} todayStr={todayStr} />}
        {tab === "habits" && <HabitsTab habits={habits} completions={completions} todayCompletions={todayCompletions} toggleHabit={toggleHabit} />}
        {tab === "tasks"  && <TasksTab tasks={tasks} setTasks={setTasks} />}
        {tab === "sport"  && <SportTab sessions={sessions} setSessions={setSessions} />}
        {tab === "spirit" && <SpiritTab entries={journalEntries} setEntries={setJournalEntries} moods={moods} setMoods={setMoods} todayStr={todayStr} />}
        {tab === "ai"     && <AITab habits={habits} completions={completions} tasks={tasks} sessions={sessions} moods={moods} />}
      </main>

      {/* Bottom Nav */}
      <nav style={{ borderTop: "1px solid #1a1a1a", background: "#0a0a0a", position: "sticky", bottom: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 12px", maxWidth: 900, margin: "0 auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
              color: tab === t.id ? "#7b61ff" : "#444", transition: "color .2s"
            }}>
              <div style={{ transform: tab === t.id ? "scale(1.15)" : "scale(1)", transition: "transform .2s" }}>
                <Icon d={t.icon} size={20} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{t.label.split(" ")[0].toUpperCase()}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════════════════════════════
function HomeTab({ habits, todayCompletions, toggleHabit, tasks, sessions, habitScore, moods, setMoods, todayStr }) {
  const moodOptions = ["😫", "😕", "😐", "🙂", "🔥"];
  const todayMood = moods[todayStr];

  const totalKm = sessions.filter(s => s.type === "Course").reduce((a, b) => a + (b.distance || 0), 0);
  const monacoNiceTarget = 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mood */}
      <Card>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10, fontWeight: 600, letterSpacing: 1 }}>ÉNERGIE DU JOUR</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {moodOptions.map((m, i) => (
            <button key={i} onClick={() => setMoods(p => ({ ...p, [todayStr]: i }))} style={{
              fontSize: 24, background: "none", border: "none", cursor: "pointer",
              opacity: todayMood === i ? 1 : 0.3, transform: todayMood === i ? "scale(1.3)" : "scale(1)",
              transition: "all .2s",
            }}>{m}</button>
          ))}
        </div>
      </Card>

      {/* Monaco-Nice Progress */}
      <Card style={{ background: "linear-gradient(135deg, #0a1628, #0d1f3c)", border: "1px solid #00d4aa33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#00d4aa", fontWeight: 700, letterSpacing: 1 }}>PROJET OBJECTIF</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Monaco → Nice</div>
            <div style={{ fontSize: 12, color: "#888" }}>~{monacoNiceTarget}km d'entraînement objectif</div>
          </div>
          <div style={{ fontSize: 32 }}>🏃</div>
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${Math.min((totalKm / monacoNiceTarget) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #00d4aa, #7b61ff)", borderRadius: 8, transition: "width 1s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#888" }}>
          <span>{totalKm.toFixed(1)} km parcourus</span>
          <span>{monacoNiceTarget} km</span>
        </div>
      </Card>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Habitudes", value: `${habitScore}%`, color: "#7b61ff", sub: "Aujourd'hui" },
          { label: "Séances", value: sessions.filter(s => { const d = new Date(s.date); return (new Date() - d) / 86400000 <= 7; }).length, color: "#00d4aa", sub: "Cette semaine" },
          { label: "Tâches urgentes", value: tasks.length, color: "#ef4444", sub: "En attente" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Quick Habits */}
      <Card>
        <div style={{ fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>RITUELS DU JOUR</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {habits.map(h => (
            <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              background: todayCompletions[h.id] ? "#0d2a1a" : "#111", border: `1px solid ${todayCompletions[h.id] ? "#00d4aa44" : "#222"}`,
              borderRadius: 10, cursor: "pointer", textAlign: "left", color: "#f0f0f0", transition: "all .2s",
            }}>
              <span style={{ fontSize: 18 }}>{h.icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{h.label}</span>
              <div style={{
                width: 20, height: 20, borderRadius: 6, border: `2px solid ${todayCompletions[h.id] ? "#00d4aa" : "#333"}`,
                background: todayCompletions[h.id] ? "#00d4aa" : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {todayCompletions[h.id] && <Icon d={icons.check} size={12} stroke="#000" />}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Urgent Tasks */}
      {tasks.length > 0 && (
        <Card style={{ border: "1px solid #ef444433" }}>
          <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🔴 URGENT</div>
          {tasks.slice(0, 3).map(t => (
            <div key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{t.title}</div>
              {t.project && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{t.project} {t.deadline && `• ${t.deadline}`}</div>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HABITS TAB
// ═══════════════════════════════════════════════════════════════════════════
function HabitsTab({ habits, completions, todayCompletions, toggleHabit }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dayNames = ["L", "Ma", "Me", "J", "V", "Sa", "Di"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 7-day heatmap */}
      <Card>
        <div style={{ fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>CONSISTANCE — 7 DERNIERS JOURS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {last7.map((d, i) => {
            const comp = completions[d] || {};
            const score = habits.filter(h => comp[h.id]).length;
            const pct = score / habits.length;
            return (
              <div key={d} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{dayNames[new Date(d + "T12:00").getDay() === 0 ? 6 : new Date(d + "T12:00").getDay() - 1]}</div>
                <div style={{
                  width: "100%", aspectRatio: "1", borderRadius: 8,
                  background: pct === 0 ? "#1a1a1a" : `rgba(0, 212, 170, ${0.2 + pct * 0.8})`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                  color: pct > 0.5 ? "#fff" : "#888",
                }}>{score}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habits by category */}
      {Object.entries(
        habits.reduce((acc, h) => { (acc[h.cat] = acc[h.cat] || []).push(h); return acc; }, {})
      ).map(([cat, hs]) => (
        <Card key={cat}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[cat]?.accent || "#7b61ff" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[cat]?.accent || "#7b61ff", letterSpacing: 1 }}>{cat.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {hs.map(h => {
              const streak = (() => {
                let s = 0;
                for (let i = 0; i < 30; i++) {
                  const d = new Date(); d.setDate(d.getDate() - i);
                  const ds = d.toISOString().split("T")[0];
                  if (completions[ds]?.[h.id]) s++;
                  else if (i > 0) break;
                }
                return s;
              })();
              return (
                <button key={h.id} onClick={() => toggleHabit(h.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: todayCompletions[h.id] ? "#0d2a1a" : "#111",
                  border: `1px solid ${todayCompletions[h.id] ? "#00d4aa44" : "#222"}`,
                  borderRadius: 10, cursor: "pointer", color: "#f0f0f0", transition: "all .2s",
                }}>
                  <span style={{ fontSize: 20 }}>{h.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{h.label}</div>
                    {streak > 1 && <div style={{ fontSize: 11, color: "#f59e0b" }}>🔥 {streak} jours d'affilée</div>}
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, border: `2px solid ${todayCompletions[h.id] ? "#00d4aa" : "#333"}`,
                    background: todayCompletions[h.id] ? "#00d4aa" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {todayCompletions[h.id] && <Icon d={icons.check} size={12} stroke="#000" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TASKS TAB
// ═══════════════════════════════════════════════════════════════════════════
function TasksTab({ tasks, setTasks }) {
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState({ title: "", urgency: "moyenne", project: "", deadline: "", notes: "", category: "business" });

  const saveTask = () => {
    if (!draft.title.trim()) return;
    if (draft.id) {
      setTasks(prev => prev.map(t => t.id === draft.id ? draft : t));
    } else {
      setTasks(prev => [...prev, { ...draft, id: Date.now().toString(), done: false, createdAt: today() }]);
    }
    setForm(null);
    setDraft({ title: "", urgency: "moyenne", project: "", deadline: "", notes: "", category: "business" });
  };

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const filtered = tasks.filter(t => {
    if (filter === "done") return t.done;
    if (filter === "active") return !t.done;
    return true;
  }).sort((a, b) => {
    const order = { critique: 0, haute: 1, moyenne: 2, basse: 3 };
    return (order[a.urgency] || 2) - (order[b.urgency] || 2);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Tâches</div>
        <button onClick={() => setForm("new")} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10,
          background: "#7b61ff", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          <Icon d={icons.plus} size={14} /> Nouvelle tâche
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "active", "done"].map(f => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "Toutes" : f === "active" ? "En cours" : "Terminées"}
          </Pill>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {Object.entries(URGENCY).map(([k, v]) => {
          const count = tasks.filter(t => t.urgency === k && !t.done).length;
          return (
            <div key={k} style={{ background: "#111", border: `1px solid ${v.color}33`, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: v.color }}>{count}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{v.label.split(" ")[1]}</div>
            </div>
          );
        })}
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#444", padding: 40, fontSize: 14 }}>Aucune tâche ici 🎉</div>}
        {filtered.map(task => (
          <Card key={task.id} style={{ padding: 14, opacity: task.done ? 0.5 : 1, transition: "opacity .2s" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <button onClick={() => toggleDone(task.id)} style={{
                width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.done ? "#00d4aa" : "#444"}`,
                background: task.done ? "#00d4aa" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {task.done && <Icon d={icons.check} size={12} stroke="#000" />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  <Badge color={URGENCY[task.urgency]?.color || "#888"}>{URGENCY[task.urgency]?.label || task.urgency}</Badge>
                  {task.project && <Badge color="#7b61ff">{task.project}</Badge>}
                  {task.deadline && <Badge color="#f59e0b">📅 {task.deadline}</Badge>}
                  {task.category && <Badge color={CAT_COLORS[task.category]?.accent || "#888"}>{task.category}</Badge>}
                </div>
                {task.notes && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{task.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => { setDraft(task); setForm("edit"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 4 }}>
                  <Icon d={icons.edit} size={14} />
                </button>
                <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 4 }}>
                  <Icon d={icons.trash} size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Form */}
      {form && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setForm(null)}>
          <div style={{ background: "#111", borderTop: "1px solid #222", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 600, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>{form === "new" ? "Nouvelle tâche" : "Modifier"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Titre de la tâche..." style={inputStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Urgence</label>
                  <select value={draft.urgency} onChange={e => setDraft(p => ({ ...p, urgency: e.target.value }))} style={inputStyle}>
                    {Object.entries(URGENCY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Projet</label>
                  <select value={draft.project} onChange={e => setDraft(p => ({ ...p, project: e.target.value }))} style={inputStyle}>
                    <option value="">Aucun</option>
                    {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                    {Object.keys(CAT_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Deadline</label>
                  <input type="date" value={draft.deadline} onChange={e => setDraft(p => ({ ...p, deadline: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))} placeholder="Détails..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setForm(null)} style={{ ...btnStyle, background: "#222", color: "#888", flex: 1 }}>Annuler</button>
                <button onClick={saveTask} style={{ ...btnStyle, background: "#7b61ff", flex: 2 }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPORT TAB
// ═══════════════════════════════════════════════════════════════════════════
function SportTab({ sessions, setSessions }) {
  const [form, setForm] = useState(false);
  const [draft, setDraft] = useState({ type: "Course", date: today(), duration: "", distance: "", intensity: 3, notes: "" });

  const saveSession = () => {
    setSessions(prev => [{ ...draft, id: Date.now().toString(), distance: parseFloat(draft.distance) || 0, duration: parseFloat(draft.duration) || 0 }, ...prev]);
    setForm(false);
    setDraft({ type: "Course", date: today(), duration: "", distance: "", intensity: 3, notes: "" });
  };

  const totalKm = sessions.filter(s => s.type === "Course").reduce((a, b) => a + (b.distance || 0), 0);
  const weekKm  = sessions.filter(s => s.type === "Course" && (new Date() - new Date(s.date)) / 86400000 <= 7).reduce((a, b) => a + (b.distance || 0), 0);

  const typeCounts = SESSION_TYPES.reduce((acc, t) => {
    acc[t] = sessions.filter(s => s.type === t).length;
    return acc;
  }, {});

  const intensityColors = ["#22c55e", "#22c55e", "#eab308", "#f97316", "#ef4444"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Sport</div>
        <button onClick={() => setForm(true)} style={{ ...btnStyle, background: "#00d4aa", color: "#000", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon d={icons.plus} size={14} /> Séance
        </button>
      </div>

      {/* Monaco-Nice progress */}
      <Card style={{ background: "linear-gradient(135deg, #0a1628, #0d1f3c)", border: "1px solid #00d4aa33" }}>
        <div style={{ fontSize: 11, color: "#00d4aa", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🏃 MONACO → NICE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00d4aa" }}>{totalKm.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>km total</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#7b61ff" }}>{weekKm.toFixed(1)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>km cette semaine</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{sessions.filter(s => s.type === "Course").length}</div>
            <div style={{ fontSize: 10, color: "#888" }}>séances course</div>
          </div>
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${Math.min((totalKm / 180) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #00d4aa, #7b61ff)", transition: "width 1s" }} />
        </div>
        <div style={{ fontSize: 11, color: "#555", textAlign: "right", marginTop: 4 }}>{totalKm.toFixed(1)} / 180 km</div>
      </Card>

      {/* Activity types */}
      <Card>
        <div style={{ fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>TYPES D'ACTIVITÉS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SESSION_TYPES.map(t => (
            <div key={t} style={{ background: "#1a1a1a", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 70 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: typeCounts[t] > 0 ? "#00d4aa" : "#444" }}>{typeCounts[t]}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{t}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Session log */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sessions.slice(0, 20).map(s => (
          <Card key={s.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.type}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.date} {s.duration > 0 && `• ${s.duration}min`} {s.distance > 0 && `• ${s.distance}km`}</div>
                {s.notes && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{s.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < s.intensity ? intensityColors[s.intensity - 1] : "#222" }} />
                ))}
              </div>
            </div>
          </Card>
        ))}
        {sessions.length === 0 && <div style={{ textAlign: "center", color: "#444", padding: 40 }}>Aucune séance enregistrée 💪</div>}
      </div>

      {/* Form modal */}
      {form && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setForm(false)}>
          <div style={{ background: "#111", borderTop: "1px solid #222", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 600, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>Ajouter une séance</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={draft.date} onChange={e => setDraft(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Durée (min)</label>
                  <input type="number" value={draft.duration} onChange={e => setDraft(p => ({ ...p, duration: e.target.value }))} placeholder="60" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Distance (km)</label>
                  <input type="number" step="0.1" value={draft.distance} onChange={e => setDraft(p => ({ ...p, distance: e.target.value }))} placeholder="10.5" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Intensité</label>
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setDraft(p => ({ ...p, intensity: i }))} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: `2px solid ${draft.intensity >= i ? intensityColors[i - 1] : "#333"}`,
                      background: draft.intensity >= i ? intensityColors[i - 1] + "33" : "transparent",
                      color: draft.intensity >= i ? intensityColors[i - 1] : "#555", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}>{i}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))} placeholder="Comment tu t'es senti, détails..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setForm(false)} style={{ ...btnStyle, background: "#222", color: "#888", flex: 1 }}>Annuler</button>
                <button onClick={saveSession} style={{ ...btnStyle, background: "#00d4aa", color: "#000", flex: 2 }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPIRIT TAB
// ═══════════════════════════════════════════════════════════════════════════
function SpiritTab({ entries, setEntries, moods, setMoods, todayStr }) {
  const [text, setText] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [intention, setIntention] = useState("");

  const save = () => {
    if (!text.trim() && !gratitude.trim() && !intention.trim()) return;
    setEntries(prev => [{ id: Date.now().toString(), date: todayStr, text, gratitude, intention }, ...prev]);
    setText(""); setGratitude(""); setIntention("");
  };

  const todayEntry = entries.find(e => e.date === todayStr);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>Mindset & Esprit</div>

      {/* Mood over time */}
      <Card>
        <div style={{ fontSize: 12, color: "#7b61ff", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ÉNERGIE — 7 DERNIERS JOURS</div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 50 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const ds = d.toISOString().split("T")[0];
            const m = moods[ds];
            const emojis = ["😫", "😕", "😐", "🙂", "🔥"];
            return (
              <div key={ds} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: m !== undefined ? `${(m + 1) * 20}%` : "0%", background: "#7b61ff44", borderRadius: "4px 4px 0 0", transition: "height .5s", minHeight: m !== undefined ? 10 : 0 }} />
                <div style={{ fontSize: 14, marginTop: 4 }}>{m !== undefined ? emojis[m] : "·"}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Journal entry */}
      {!todayEntry ? (
        <Card>
          <div style={{ fontSize: 12, color: "#7b61ff", fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>JOURNAL DU JOUR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={labelStyle}>🙏 3 gratitudes</label>
              <textarea value={gratitude} onChange={e => setGratitude(e.target.value)} placeholder="Je suis reconnaissant pour..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div>
              <label style={labelStyle}>🎯 Intention du jour</label>
              <input value={intention} onChange={e => setIntention(e.target.value)} placeholder="Aujourd'hui je veux..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>💭 Réflexion libre</label>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Comment je me sens, ce qui occupe mon esprit..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <button onClick={save} style={{ ...btnStyle, background: "#7b61ff" }}>Sauvegarder</button>
          </div>
        </Card>
      ) : (
        <Card style={{ border: "1px solid #7b61ff33" }}>
          <div style={{ fontSize: 12, color: "#7b61ff", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>✅ JOURNAL COMPLÉTÉ</div>
          {todayEntry.gratitude && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 11, color: "#666" }}>GRATITUDES</div><div style={{ fontSize: 13 }}>{todayEntry.gratitude}</div></div>}
          {todayEntry.intention && <div style={{ marginBottom: 8 }}><div style={{ fontSize: 11, color: "#666" }}>INTENTION</div><div style={{ fontSize: 13 }}>{todayEntry.intention}</div></div>}
          {todayEntry.text && <div><div style={{ fontSize: 11, color: "#666" }}>RÉFLEXION</div><div style={{ fontSize: 13 }}>{todayEntry.text}</div></div>}
        </Card>
      )}

      {/* Past entries */}
      {entries.filter(e => e.date !== todayStr).slice(0, 5).map(e => (
        <Card key={e.id} style={{ padding: 14, opacity: 0.7 }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>{e.date}</div>
          {e.intention && <div style={{ fontSize: 13, fontStyle: "italic", color: "#7b61ff" }}>🎯 {e.intention}</div>}
          {e.text && <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{e.text.slice(0, 120)}{e.text.length > 120 ? "..." : ""}</div>}
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI COACH TAB
// ═══════════════════════════════════════════════════════════════════════════
function AITab({ habits, completions, tasks, sessions, moods }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("coach");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const buildContext = () => {
    const todayStr = today();
    const todayComp = completions[todayStr] || {};
    const habitsDone = habits.filter(h => todayComp[h.id]).length;
    const last7Sessions = sessions.filter(s => (new Date() - new Date(s.date)) / 86400000 <= 7);
    const weekKm = last7Sessions.filter(s => s.type === "Course").reduce((a, b) => a + (b.distance || 0), 0);
    const totalKm = sessions.filter(s => s.type === "Course").reduce((a, b) => a + (b.distance || 0), 0);
    const pendingTasks = tasks.filter(t => !t.done);
    const urgentTasks = pendingTasks.filter(t => t.urgency === "critique" || t.urgency === "haute");
    const moodArr = Object.entries(moods).sort().slice(-7);

    return `Tu es un coach de performance personnel expert, bienveillant mais exigeant. Voici les données de l'utilisateur:

📊 AUJOURD'HUI (${todayStr}):
- Habitudes complétées: ${habitsDone}/${habits.length}
- Mood/énergie actuelle: ${moods[todayStr] !== undefined ? ["😫 Épuisé", "😕 Difficile", "😐 Moyen", "🙂 Bien", "🔥 Au top"][moods[todayStr]] : "Non renseigné"}

🏃 PROJET MONACO-NICE:
- KM cette semaine: ${weekKm.toFixed(1)} km
- KM total accumulé: ${totalKm.toFixed(1)} / ~180 km objectif
- Séances cette semaine: ${last7Sessions.length} (${last7Sessions.map(s => s.type).join(", ")})
- Dernières séances: ${sessions.slice(0, 3).map(s => `${s.type} ${s.distance || ""}km ${s.duration || ""}min intensité:${s.intensity}/5`).join(" | ")}

💼 TÂCHES:
- Total en attente: ${pendingTasks.length}
- Urgentes/Critiques: ${urgentTasks.length}
- Tâches critiques: ${urgentTasks.slice(0, 3).map(t => t.title).join(", ")}

🧘 ÉNERGIE (7 derniers jours): ${moodArr.map(([d, m]) => `${d}: ${m}/4`).join(", ")}

Réponds en français, sois direct, personnalisé et actionnable. Tu connais l'objectif Monaco-Nice et tu adaptes tes conseils à ce projet.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = buildContext();
      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(c => c.type === "text")?.text || "Désolé, je n'ai pas pu répondre.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion. Réessaie." }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Analyse mes performances cette semaine",
    "Que faire pour progresser sur Monaco-Nice ?",
    "Quelles sont mes priorités business ?",
    "Donne-moi un plan d'entraînement pour cette semaine",
    "Comment optimiser mon énergie ?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)", gap: 0 }}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>IA Coach</div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>QUESTIONS RAPIDES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quickPrompts.map(q => (
              <button key={q} onClick={() => setInput(q)} style={{
                textAlign: "left", padding: "10px 14px", borderRadius: 10, background: "#111", border: "1px solid #222",
                color: "#aaa", fontSize: 13, cursor: "pointer", transition: "all .2s",
              }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "#7b61ff" : "#111",
              border: m.role === "assistant" ? "1px solid #222" : "none",
              fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 16px", background: "#111", border: "1px solid #222", borderRadius: "16px 16px 16px 4px", fontSize: 14 }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7b61ff", animation: `bounce .8s ${i * 0.15}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid #1a1a1a", background: "#0a0a0a" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Pose une question à ton coach..."
          style={{ ...inputStyle, flex: 1, margin: 0 }}
        />
        <button onClick={sendMessage} disabled={loading} style={{
          ...btnStyle, background: "#7b61ff", width: 44, height: 44, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: loading ? 0.5 : 1,
        }}>
          <Icon d={icons.send} size={16} />
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
  color: "#f0f0f0", padding: "10px 14px", fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle = { fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 6 };

const btnStyle = {
  padding: "12px 16px", borderRadius: 10, border: "none", color: "#fff",
  fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
};
