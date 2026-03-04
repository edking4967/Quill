import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "quill-projects";
const SESSIONS_KEY = "quill-sessions";

// ── Persistent storage helpers ────────────────────────────────────────────────
async function loadData(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveData(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

// ── Utility ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => n?.toLocaleString() ?? "0";
const fmtTime = (mins) => {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};
const getDaysInRange = (start, count) => {
  const days = [];
  const d = new Date(start);
  for (let i = 0; i < count; i++) {
    days.push(new Date(d).toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

// Build last 16 weeks of dates for heatmap
const buildHeatmapDates = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 111); // 16 weeks
  const startStr = start.toISOString().slice(0, 10);
  return getDaysInRange(startStr, 112);
};

const ACTIVITY_COLORS = {
  writing: "#c17b3a",
  editing: "#5a7a9c",
  brainstorming: "#7a6fa0",
  research: "#5a8a6a",
};

const ACTIVITY_LABELS = {
  writing: "Writing",
  editing: "Editing",
  brainstorming: "Brainstorming",
  research: "Research",
};

// ── Components ────────────────────────────────────────────────────────────────

function Ornament() {
  return (
    <span style={{ color: "var(--ink-light)", fontSize: "1rem", userSelect: "none" }}>
      ✦
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "var(--paper-dark)",
      border: "1px solid var(--border)",
      borderRadius: "2px",
      padding: "1.25rem 1.5rem",
      display: "flex", flexDirection: "column", gap: "0.25rem",
    }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--ink)", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
}

function Heatmap({ sessions, projectId }) {
  const dates = buildHeatmapDates();
  // word count per day
  const byDay = {};
  sessions
    .filter(s => !projectId || s.projectId === projectId)
    .forEach(s => {
      byDay[s.date] = (byDay[s.date] || 0) + (s.wordsDelta || 0);
    });

  const max = Math.max(...Object.values(byDay), 1);

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "3px" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {week.map(date => {
              const count = byDay[date] || 0;
              const opacity = count ? 0.2 + 0.8 * (count / max) : 0;
              const isToday = date === today();
              return (
                <div
                  key={date}
                  title={`${date}: ${fmt(count)} words`}
                  style={{
                    width: 11, height: 11,
                    borderRadius: "1px",
                    background: count ? `rgba(193,123,58,${opacity})` : "var(--paper-mid)",
                    border: isToday ? "1.5px solid var(--accent)" : "1px solid transparent",
                    transition: "transform 0.1s",
                    cursor: count ? "default" : "default",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.65rem", color: "var(--ink-faint)", letterSpacing: "0.08em" }}>LESS</span>
        {[0.1, 0.3, 0.55, 0.8, 1].map(o => (
          <div key={o} style={{ width: 10, height: 10, borderRadius: "1px", background: `rgba(193,123,58,${o})` }} />
        ))}
        <span style={{ fontSize: "0.65rem", color: "var(--ink-faint)", letterSpacing: "0.08em" }}>MORE</span>
      </div>
    </div>
  );
}

function SessionForm({ projects, onAdd }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    date: today(),
    duration: "",
    wordsDelta: "",
    activity: "writing",
    notes: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (projects.length && !form.projectId) {
      setForm(f => ({ ...f, projectId: projects[0].id }));
    }
  }, [projects]);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.projectId || !form.date) return;
    onAdd({
      id: Date.now().toString(),
      ...form,
      duration: parseInt(form.duration) || 0,
      wordsDelta: parseInt(form.wordsDelta) || 0,
    });
    setForm(f => ({ ...f, duration: "", wordsDelta: "", notes: "" }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const inputStyle = {
    background: "var(--paper)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--ink)",
    fontFamily: "var(--font-serif)",
    fontSize: "0.95rem",
    padding: "0.5rem 0.75rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--ink-faint)",
    marginBottom: "0.3rem",
    display: "block",
  };

  return (
    <div style={{
      background: "var(--paper-dark)",
      border: "1px solid var(--border)",
      borderRadius: "2px",
      padding: "1.75rem",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Project</label>
          <select style={inputStyle} value={form.projectId} onChange={e => handle("projectId", e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => handle("date", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Activity</label>
          <select style={inputStyle} value={form.activity} onChange={e => handle("activity", e.target.value)}>
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Duration (minutes)</label>
          <input type="number" style={inputStyle} placeholder="e.g. 45" value={form.duration} onChange={e => handle("duration", e.target.value)} min="0" />
        </div>
        <div>
          <label style={labelStyle}>Words written</label>
          <input type="number" style={inputStyle} placeholder="e.g. 800" value={form.wordsDelta} onChange={e => handle("wordsDelta", e.target.value)} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} placeholder="How did the session go?" value={form.notes} onChange={e => handle("notes", e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={submit}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "2px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.65rem 1.5rem",
            cursor: "pointer",
          }}
        >
          Log Session
        </button>
        {success && (
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--accent)", fontSize: "0.9rem" }}>
            Session recorded ✓
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectForm({ onAdd }) {
  const [form, setForm] = useState({ title: "", targetWords: "", deadline: "" });
  const inputStyle = {
    background: "var(--paper)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--ink)",
    fontFamily: "var(--font-serif)",
    fontSize: "0.95rem",
    padding: "0.5rem 0.75rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--ink-faint)",
    marginBottom: "0.3rem",
    display: "block",
  };

  const submit = () => {
    if (!form.title.trim()) return;
    onAdd({
      id: Date.now().toString(),
      title: form.title.trim(),
      targetWords: parseInt(form.targetWords) || 80000,
      deadline: form.deadline || null,
      createdAt: today(),
    });
    setForm({ title: "", targetWords: "", deadline: "" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
      <div>
        <label style={labelStyle}>Project title</label>
        <input style={inputStyle} placeholder="My Novel" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Target words</label>
        <input type="number" style={inputStyle} placeholder="80,000" value={form.targetWords} onChange={e => setForm(f => ({ ...f, targetWords: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Deadline</label>
        <input type="date" style={inputStyle} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
      </div>
      <button
        onClick={submit}
        style={{
          background: "transparent",
          color: "var(--accent)",
          border: "1px solid var(--accent)",
          borderRadius: "2px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0.6rem 1rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Add Project
      </button>
    </div>
  );
}

function ProjectCard({ project, sessions, active, onClick }) {
  const projectSessions = sessions.filter(s => s.projectId === project.id);
  const totalWords = projectSessions.reduce((a, s) => a + (s.wordsDelta || 0), 0);
  const totalTime = projectSessions.reduce((a, s) => a + (s.duration || 0), 0);
  const pct = Math.min(100, Math.round((totalWords / project.targetWords) * 100));

  // Streak calculation
  let streak = 0;
  const writingDays = new Set(projectSessions.filter(s => s.wordsDelta > 0).map(s => s.date));
  let check = new Date();
  while (true) {
    const d = check.toISOString().slice(0, 10);
    if (writingDays.has(d)) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "var(--paper-dark)" : "var(--paper)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "2px",
        padding: "1.25rem 1.5rem",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)" }}>{project.title}</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--ink-faint)", marginTop: "0.2rem", letterSpacing: "0.05em" }}>
            {fmt(totalWords)} / {fmt(project.targetWords)} words · {fmtTime(totalTime)}
            {streak > 0 && <span style={{ marginLeft: "0.75rem", color: "var(--accent)" }}>🔥 {streak}d streak</span>}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: pct >= 100 ? "var(--accent)" : "var(--ink-light)" }}>
          {pct}%
        </div>
      </div>
      {/* progress bar */}
      <div style={{ marginTop: "0.75rem", height: "3px", background: "var(--paper-mid)", borderRadius: "2px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: "2px", transition: "width 0.5s" }} />
      </div>
      {project.deadline && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--ink-faint)", fontStyle: "italic" }}>
          Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      )}
    </div>
  );
}

function SessionList({ sessions, projects }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  const projMap = Object.fromEntries(projects.map(p => [p.id, p.title]));

  if (!sorted.length) return (
    <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-faint)", padding: "1rem 0" }}>
      No sessions yet. Log your first session above.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {sorted.map((s, i) => (
        <div key={s.id} style={{
          display: "grid", gridTemplateColumns: "7rem 1fr 5rem 4rem 6rem",
          gap: "1rem", alignItems: "center",
          padding: "0.65rem 0",
          borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <div style={{ fontSize: "0.8rem", color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>{s.date}</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--ink)" }}>
            {projMap[s.projectId] || "Unknown"}
            {s.notes && <span style={{ marginLeft: "0.5rem", fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.8rem" }}>"{s.notes}"</span>}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "0.15rem 0.5rem",
            borderRadius: "1px",
            background: `${ACTIVITY_COLORS[s.activity]}22`,
            color: ACTIVITY_COLORS[s.activity],
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {ACTIVITY_LABELS[s.activity]}
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--ink-light)" }}>
            {s.wordsDelta > 0 ? `+${fmt(s.wordsDelta)}` : "—"}
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--ink-faint)" }}>
            {fmtTime(s.duration)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tab, setTab] = useState("dashboard"); // dashboard | log | projects | history
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadData(STORAGE_KEY);
      const s = await loadData(SESSIONS_KEY);
      if (p) setProjects(p);
      if (s) setSessions(s);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, projects);
  }, [projects, loaded]);

  useEffect(() => {
    if (loaded) saveData(SESSIONS_KEY, sessions);
  }, [sessions, loaded]);

  useEffect(() => {
    if (projects.length && !activeProject) setActiveProject(projects[0].id);
  }, [projects]);

  const addProject = (p) => {
    setProjects(prev => [...prev, p]);
    setActiveProject(p.id);
  };

  const addSession = (s) => {
    setSessions(prev => [...prev, s]);
    setActiveProject(s.projectId);
  };

  // Stats for active project
  const ap = projects.find(p => p.id === activeProject);
  const apSessions = sessions.filter(s => s.projectId === activeProject);
  const totalWords = apSessions.reduce((a, s) => a + (s.wordsDelta || 0), 0);
  const totalTime = apSessions.reduce((a, s) => a + (s.duration || 0), 0);

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStr = weekStart.toISOString().slice(0, 10);
  const weekSessions = sessions.filter(s => s.date >= weekStr);
  const weekWords = weekSessions.reduce((a, s) => a + (s.wordsDelta || 0), 0);
  const weekTime = weekSessions.reduce((a, s) => a + (s.duration || 0), 0);

  // Global streak
  let streak = 0;
  const allWritingDays = new Set(sessions.filter(s => s.wordsDelta > 0).map(s => s.date));
  let check = new Date();
  while (true) {
    const d = check.toISOString().slice(0, 10);
    if (allWritingDays.has(d)) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  const navTab = (t) => (
    <button
      onClick={() => setTab(t)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: tab === t ? "var(--accent)" : "var(--ink-faint)",
        padding: "0.25rem 0",
        borderBottom: tab === t ? "1.5px solid var(--accent)" : "1.5px solid transparent",
        transition: "color 0.15s",
      }}
    >
      {t}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --font-serif: 'EB Garamond', 'Libre Baskerville', Georgia, serif;
          --font-sans: 'DM Sans', system-ui, sans-serif;
          --paper: #f8f4ef;
          --paper-dark: #f0ebe3;
          --paper-mid: #e8e0d5;
          --border: #d9d0c3;
          --ink: #2a2218;
          --ink-light: #6b5d4e;
          --ink-faint: #9b8e82;
          --accent: #c17b3a;
          --accent-dark: #a0622a;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-serif);
        }

        input[type=date]::-webkit-calendar-picker-indicator {
          opacity: 0.5;
          cursor: pointer;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 2px rgba(193,123,58,0.12);
        }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "0 1rem" }}>
        {/* Header */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto",
          paddingTop: "2.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "2rem",
              letterSpacing: "0.02em",
              color: "var(--ink)",
              lineHeight: 1,
            }}>
              Quill
            </h1>
            <div style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              A writing progress journal
            </div>
          </div>
          {streak > 0 && (
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.9rem",
              color: "var(--accent)",
              fontStyle: "italic",
            }}>
              {streak} day{streak !== 1 ? "s" : ""} writing ✦
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: "1rem", display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          {navTab("dashboard")}
          {navTab("log")}
          {navTab("projects")}
          {navTab("history")}
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 0 4rem" }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              {projects.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  fontFamily: "var(--font-serif)",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</div>
                  <h2 style={{ fontWeight: 400, fontSize: "1.5rem", marginBottom: "0.5rem" }}>Welcome to Quill</h2>
                  <p style={{ color: "var(--ink-light)", fontStyle: "italic", marginBottom: "2rem" }}>
                    Start by creating your first project.
                  </p>
                  <button onClick={() => setTab("projects")} style={{
                    background: "var(--accent)", color: "#fff", border: "none", borderRadius: "2px",
                    fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em",
                    textTransform: "uppercase", padding: "0.75rem 2rem", cursor: "pointer",
                  }}>
                    Create a Project
                  </button>
                </div>
              ) : (
                <div>
                  {/* Project selector */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setActiveProject(p.id)}
                        style={{
                          background: p.id === activeProject ? "var(--ink)" : "transparent",
                          color: p.id === activeProject ? "var(--paper)" : "var(--ink-light)",
                          border: "1px solid var(--border)",
                          borderRadius: "2px",
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.9rem",
                          padding: "0.35rem 0.85rem",
                          cursor: "pointer",
                          fontStyle: "italic",
                          transition: "all 0.15s",
                        }}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>

                  {ap && (
                    <>
                      {/* Stats row */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
                        <StatCard label="Total Words" value={fmt(totalWords)} sub={`of ${fmt(ap.targetWords)}`} />
                        <StatCard label="Total Time" value={fmtTime(totalTime)} />
                        <StatCard label="This Week" value={fmt(weekWords)} sub={fmtTime(weekTime)} />
                        <StatCard label="Completion" value={`${Math.min(100, Math.round(totalWords / ap.targetWords * 100))}%`}
                          sub={ap.targetWords - totalWords > 0 ? `${fmt(ap.targetWords - totalWords)} to go` : "Complete!"} />
                      </div>

                      {/* Progress bar large */}
                      <div style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.9rem" }}>{ap.title}</span>
                          {ap.deadline && <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>Due {new Date(ap.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                        <div style={{ height: "6px", background: "var(--paper-mid)", borderRadius: "3px" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, totalWords / ap.targetWords * 100)}%`, background: "var(--accent)", borderRadius: "3px", transition: "width 0.6s" }} />
                        </div>
                      </div>

                      {/* Heatmap */}
                      <div style={{ marginBottom: "2rem" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem" }}>
                          Writing Activity — Last 16 Weeks
                        </div>
                        <Heatmap sessions={sessions} projectId={activeProject} />
                      </div>

                      {/* Recent sessions */}
                      <div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                          <span>Recent Sessions</span>
                          <button onClick={() => setTab("log")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                            + Log Session
                          </button>
                        </div>
                        <SessionList sessions={apSessions.slice(-5).reverse()} projects={projects} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── LOG SESSION ── */}
          {tab === "log" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Log a Session</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Record your writing time, word count, and notes.</p>
              {projects.length === 0 ? (
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-light)" }}>
                  Create a project first. <button onClick={() => setTab("projects")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: "1rem" }}>Go to Projects →</button>
                </div>
              ) : (
                <SessionForm projects={projects} onAdd={(s) => { addSession(s); setTimeout(() => setTab("dashboard"), 300); }} />
              )}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === "projects" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Projects</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Manage your works in progress.</p>
              <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--paper-dark)", border: "1px solid var(--border)", borderRadius: "2px" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "1rem" }}>New Project</div>
                <ProjectForm onAdd={addProject} />
              </div>
              {projects.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {projects.map(p => (
                    <ProjectCard key={p.id} project={p} sessions={sessions} active={p.id === activeProject} onClick={() => { setActiveProject(p.id); setTab("dashboard"); }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Session History</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>All sessions, most recent first.</p>

              {/* Summary across all projects */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
                <StatCard label="All-Time Words" value={fmt(sessions.reduce((a, s) => a + (s.wordsDelta || 0), 0))} />
                <StatCard label="All-Time Time" value={fmtTime(sessions.reduce((a, s) => a + (s.duration || 0), 0))} />
                <StatCard label="Total Sessions" value={sessions.length} />
              </div>

              {/* Heatmap all projects */}
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem" }}>
                  All Projects — Last 16 Weeks
                </div>
                <Heatmap sessions={sessions} projectId={null} />
              </div>

              <SessionList sessions={sessions} projects={projects} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
