import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(`${API}${path}`, { credentials: "include" }).then(r => r.json()),
  post: (path, body) => fetch(`${API}${path}`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json()),
};

// ── Utility ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => (n ?? 0).toLocaleString();
const fmtTime = (mins) => {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const ACTIVITY_COLORS = {
  writing: "#c17b3a", editing: "#5a7a9c",
  brainstorming: "#7a6fa0", research: "#5a8a6a",
};
const ACTIVITY_LABELS = {
  writing: "Writing", editing: "Editing",
  brainstorming: "Brainstorming", research: "Research",
};

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({ sessions, projectId }) {
  const end = new Date();
  const start = new Date(end); start.setDate(start.getDate() - 111);
  const dates = [];
  const d = new Date(start);
  for (let i = 0; i < 112; i++) {
    dates.push(new Date(d).toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }

  const byDay = {};
  sessions
    .filter(s => !projectId || s.project_id === projectId)
    .forEach(s => { byDay[s.date] = (byDay[s.date] || 0) + (s.words_delta || 0); });
  const max = Math.max(...Object.values(byDay), 1);

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));

  return (
    <div>
      <div style={{ display: "flex", gap: "3px" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {week.map(date => {
              const count = byDay[date] || 0;
              const opacity = count ? 0.2 + 0.8 * (count / max) : 0;
              return (
                <div key={date} title={`${date}: ${fmt(count)} words`} style={{
                  width: 11, height: 11, borderRadius: "1px",
                  background: count ? `rgba(193,123,58,${opacity})` : "var(--paper-mid)",
                  border: date === today() ? "1.5px solid var(--accent)" : "1px solid transparent",
                }} />
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

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    const res = await api.post(`/${mode}`, { email, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onAuth(res);
  };

  const inputStyle = {
    background: "var(--paper)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--ink)",
    fontFamily: "var(--font-serif)",
    fontSize: "1rem",
    padding: "0.6rem 0.85rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--paper)",
    }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 1.5rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "2.5rem", color: "var(--ink)" }}>Quill</h1>
          <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.9rem", marginTop: "0.25rem" }}>A writing progress journal</p>
        </div>

        <div style={{ background: "var(--paper-dark)", border: "1px solid var(--border)", borderRadius: "2px", padding: "2rem" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: mode === m ? "var(--accent)" : "var(--ink-faint)",
                borderBottom: mode === m ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                padding: "0 0 0.35rem",
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", display: "block", marginBottom: "0.35rem" }}>
                Email
              </label>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", display: "block", marginBottom: "0.35rem" }}>
                Password
              </label>
              <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>

            {error && (
              <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#b85050", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{
              marginTop: "0.5rem",
              background: "var(--accent)", color: "#fff", border: "none", borderRadius: "2px",
              fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "0.75rem", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--paper-dark)", border: "1px solid var(--border)", borderRadius: "2px", padding: "1.25rem 1.5rem" }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginTop: "0.25rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontStyle: "italic", marginTop: "0.1rem" }}>{sub}</div>}
    </div>
  );
}

// ── Session Form ──────────────────────────────────────────────────────────────
function SessionForm({ projects, onAdd }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "", date: today(),
    duration: "", wordsDelta: "", activity: "writing", notes: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (projects.length && !form.projectId) setForm(f => ({ ...f, projectId: projects[0].id }));
  }, [projects]);

  const inputStyle = {
    background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "2px",
    color: "var(--ink)", fontFamily: "var(--font-serif)", fontSize: "0.95rem",
    padding: "0.5rem 0.75rem", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.3rem", display: "block",
  };

  const submit = async () => {
    const s = { id: Date.now().toString(), ...form, duration: parseInt(form.duration) || 0, wordsDelta: parseInt(form.wordsDelta) || 0 };
    await onAdd(s);
    setForm(f => ({ ...f, duration: "", wordsDelta: "", notes: "" }));
    setSuccess(true); setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div style={{ background: "var(--paper-dark)", border: "1px solid var(--border)", borderRadius: "2px", padding: "1.75rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Project</label>
          <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Activity</label>
          <select style={inputStyle} value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}>
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Duration (minutes)</label>
          <input type="number" style={inputStyle} placeholder="e.g. 45" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} min="0" />
        </div>
        <div>
          <label style={labelStyle}>Words written</label>
          <input type="number" style={inputStyle} placeholder="e.g. 800" value={form.wordsDelta} onChange={e => setForm(f => ({ ...f, wordsDelta: e.target.value }))} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} placeholder="How did the session go?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={submit} style={{
          background: "var(--accent)", color: "#fff", border: "none", borderRadius: "2px",
          fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "0.65rem 1.5rem", cursor: "pointer",
        }}>Log Session</button>
        {success && <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--accent)", fontSize: "0.9rem" }}>Session recorded ✓</span>}
      </div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, sessions, active, onClick }) {
  const ps = sessions.filter(s => s.project_id === project.id);
  const totalWords = ps.reduce((a, s) => a + (s.words_delta || 0), 0);
  const totalTime = ps.reduce((a, s) => a + (s.duration || 0), 0);
  const pct = Math.min(100, Math.round((totalWords / project.target_words) * 100));

  return (
    <div onClick={onClick} style={{
      background: active ? "var(--paper-dark)" : "var(--paper)",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "2px", padding: "1.25rem 1.5rem", cursor: "pointer",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--ink)" }}>{project.title}</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--ink-faint)", marginTop: "0.2rem" }}>
            {fmt(totalWords)} / {fmt(project.target_words)} words · {fmtTime(totalTime)}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--ink-light)" }}>{pct}%</div>
      </div>
      <div style={{ marginTop: "0.75rem", height: "3px", background: "var(--paper-mid)", borderRadius: "2px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: "2px" }} />
      </div>
    </div>
  );
}

// ── Session List ──────────────────────────────────────────────────────────────
function SessionList({ sessions, projects }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  const projMap = Object.fromEntries(projects.map(p => [p.id, p.title]));

  if (!sorted.length) return (
    <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-faint)", padding: "1rem 0" }}>
      No sessions yet.
    </div>
  );

  return (
    <div>
      {sorted.map((s, i) => (
        <div key={s.id} style={{
          display: "grid", gridTemplateColumns: "7rem 1fr 5rem 4rem 6rem",
          gap: "1rem", alignItems: "center",
          padding: "0.65rem 0",
          borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <div style={{ fontSize: "0.8rem", color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>{s.date}</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--ink)" }}>
            {projMap[s.project_id] || "—"}
            {s.notes && <span style={{ marginLeft: "0.5rem", fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.8rem" }}>"{s.notes}"</span>}
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "0.15rem 0.5rem", borderRadius: "1px",
            background: `${ACTIVITY_COLORS[s.activity]}22`, color: ACTIVITY_COLORS[s.activity],
            fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{ACTIVITY_LABELS[s.activity]}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--ink-light)" }}>
            {s.words_delta > 0 ? `+${fmt(s.words_delta)}` : "—"}
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
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", targetWords: "", deadline: "" });

  // Check existing session on mount
  useEffect(() => {
    api.get("/me").then(res => {
      if (res.user) { setUser(res.user); loadData(); }
      setAuthChecked(true);
    });
  }, []);

  const loadData = async () => {
    const [p, s] = await Promise.all([api.get("/projects"), api.get("/sessions")]);
    setProjects(p);
    setSessions(s);
    if (p.length) setActiveProject(p[0].id);
  };

  const handleAuth = (u) => { setUser(u); loadData(); };

  const handleLogout = async () => {
    await api.post("/logout");
    setUser(null); setProjects([]); setSessions([]); setActiveProject(null);
  };

  const addProject = async () => {
    if (!newProject.title.trim()) return;
    const p = {
      id: Date.now().toString(), title: newProject.title.trim(),
      targetWords: parseInt(newProject.targetWords) || 80000,
      deadline: newProject.deadline || null, createdAt: today(),
    };
    const res = await api.post("/projects", p);
    setProjects(prev => [...prev, { ...res, target_words: p.targetWords, project_id: res.id }]);
    setActiveProject(p.id);
    setNewProject({ title: "", targetWords: "", deadline: "" });
  };

  const addSession = async (s) => {
    const res = await api.post("/sessions", s);
    // normalize snake_case from backend
    setSessions(prev => [...prev, { ...res, project_id: s.projectId, words_delta: s.wordsDelta }]);
  };

  if (!authChecked) return null;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const ap = projects.find(p => p.id === activeProject);
  const apSessions = sessions.filter(s => s.project_id === activeProject);
  const totalWords = apSessions.reduce((a, s) => a + (s.words_delta || 0), 0);
  const totalTime = apSessions.reduce((a, s) => a + (s.duration || 0), 0);

  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStr = weekStart.toISOString().slice(0, 10);
  const weekWords = sessions.filter(s => s.date >= weekStr).reduce((a, s) => a + (s.words_delta || 0), 0);
  const weekTime = sessions.filter(s => s.date >= weekStr).reduce((a, s) => a + (s.duration || 0), 0);

  let streak = 0;
  const writingDays = new Set(sessions.filter(s => s.words_delta > 0).map(s => s.date));
  let checkD = new Date();
  while (writingDays.has(checkD.toISOString().slice(0, 10))) {
    streak++; checkD.setDate(checkD.getDate() - 1);
  }

  const navBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{
      background: "none", border: "none", cursor: "pointer",
      fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase",
      color: tab === t ? "var(--accent)" : "var(--ink-faint)",
      padding: "0.25rem 0",
      borderBottom: tab === t ? "1.5px solid var(--accent)" : "1.5px solid transparent",
    }}>{label}</button>
  );

  const inputStyle = {
    background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "2px",
    color: "var(--ink)", fontFamily: "var(--font-serif)", fontSize: "0.95rem",
    padding: "0.5rem 0.75rem", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.3rem", display: "block",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --font-serif: 'EB Garamond', Georgia, serif;
          --font-sans: 'DM Sans', system-ui, sans-serif;
          --paper: #f8f4ef; --paper-dark: #f0ebe3; --paper-mid: #e8e0d5;
          --border: #d9d0c3; --ink: #2a2218; --ink-light: #6b5d4e;
          --ink-faint: #9b8e82; --accent: #c17b3a;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--paper); color: var(--ink); font-family: var(--font-serif); }
        input:focus, select:focus, textarea:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px rgba(193,123,58,0.12); }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "0 1rem" }}>
        {/* Header */}
        <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: "2.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "2rem", color: "var(--ink)" }}>Quill</h1>
            <div style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginTop: "0.2rem" }}>A writing progress journal</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {streak > 0 && <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--accent)", fontStyle: "italic" }}>{streak}d streak ✦</span>}
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--ink-faint)" }}>{user.email}</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Sign out</button>
          </div>
        </div>

        {/* Nav */}
        <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: "1rem", display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          {navBtn("dashboard", "Dashboard")}
          {navBtn("log", "Log Session")}
          {navBtn("projects", "Projects")}
          {navBtn("history", "History")}
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 0 4rem" }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</div>
                <h2 style={{ fontWeight: 400, fontSize: "1.5rem", marginBottom: "0.5rem" }}>Welcome to Quill</h2>
                <p style={{ color: "var(--ink-light)", fontStyle: "italic", marginBottom: "2rem" }}>Start by creating your first project.</p>
                <button onClick={() => setTab("projects")} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "2px", fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.75rem 2rem", cursor: "pointer" }}>
                  Create a Project
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                  {projects.map(p => (
                    <button key={p.id} onClick={() => setActiveProject(p.id)} style={{
                      background: p.id === activeProject ? "var(--ink)" : "transparent",
                      color: p.id === activeProject ? "var(--paper)" : "var(--ink-light)",
                      border: "1px solid var(--border)", borderRadius: "2px",
                      fontFamily: "var(--font-serif)", fontSize: "0.9rem",
                      padding: "0.35rem 0.85rem", cursor: "pointer", fontStyle: "italic",
                    }}>{p.title}</button>
                  ))}
                </div>

                {ap && <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
                    <StatCard label="Total Words" value={fmt(totalWords)} sub={`of ${fmt(ap.target_words)}`} />
                    <StatCard label="Total Time" value={fmtTime(totalTime)} />
                    <StatCard label="This Week" value={fmt(weekWords)} sub={fmtTime(weekTime)} />
                    <StatCard label="Completion" value={`${Math.min(100, Math.round(totalWords / ap.target_words * 100))}%`} sub={ap.target_words - totalWords > 0 ? `${fmt(ap.target_words - totalWords)} to go` : "Complete!"} />
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.9rem" }}>{ap.title}</span>
                      {ap.deadline && <span style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}>Due {new Date(ap.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    </div>
                    <div style={{ height: "6px", background: "var(--paper-mid)", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, totalWords / ap.target_words * 100)}%`, background: "var(--accent)", borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem" }}>Writing Activity — Last 16 Weeks</div>
                    <Heatmap sessions={sessions} projectId={activeProject} />
                  </div>

                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                      <span>Recent Sessions</span>
                      <button onClick={() => setTab("log")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.65rem" }}>+ Log Session</button>
                    </div>
                    <SessionList sessions={apSessions} projects={projects} />
                  </div>
                </>}
              </div>
            )
          )}

          {/* ── LOG ── */}
          {tab === "log" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Log a Session</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Record your writing time, word count, and notes.</p>
              {projects.length === 0
                ? <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-light)" }}>Create a project first. <button onClick={() => setTab("projects")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: "1rem" }}>Go to Projects →</button></div>
                : <SessionForm projects={projects} onAdd={async (s) => { await addSession(s); setTab("dashboard"); }} />
              }
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === "projects" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Projects</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Manage your works in progress.</p>

              <div style={{ background: "var(--paper-dark)", border: "1px solid var(--border)", borderRadius: "2px", padding: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "1rem" }}>New Project</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <input style={inputStyle} placeholder="My Novel" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Target words</label>
                    <input type="number" style={inputStyle} placeholder="80,000" value={newProject.targetWords} onChange={e => setNewProject(p => ({ ...p, targetWords: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Deadline</label>
                    <input type="date" style={inputStyle} value={newProject.deadline} onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))} />
                  </div>
                  <button onClick={addProject} style={{ background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "2px", fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.6rem 1rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Add Project
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} sessions={sessions} active={p.id === activeProject}
                    onClick={() => { setActiveProject(p.id); setTab("dashboard"); }} />
                ))}
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.4rem", marginBottom: "0.25rem" }}>Session History</h2>
              <p style={{ fontStyle: "italic", color: "var(--ink-faint)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>All sessions across all projects.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
                <StatCard label="All-Time Words" value={fmt(sessions.reduce((a, s) => a + (s.words_delta || 0), 0))} />
                <StatCard label="All-Time Time" value={fmtTime(sessions.reduce((a, s) => a + (s.duration || 0), 0))} />
                <StatCard label="Total Sessions" value={sessions.length} />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "0.75rem" }}>All Projects — Last 16 Weeks</div>
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
