import { useState, useEffect } from "react";
import api from "./api";
import { today, fmt, fmtTime } from "./utils";
import { DEMO_PROJECTS, DEMO_SESSIONS } from "./demoData";
import "./styles.css";
import AuthScreen from "./components/AuthScreen";
import SplashScreen from "./components/SplashScreen";
import StatCard from "./components/StatCard";
import SessionForm from "./components/SessionForm";
import ProjectCard from "./components/ProjectCard";
import SessionList from "./components/SessionList";
import Heatmap from "./components/Heatmap";
import Timer from "./components/Timer";

const isDemo = new URLSearchParams(window.location.search).has("demo");

export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [newProject, setNewProject] = useState({ title: "", targetWords: "", deadline: "" });

  useEffect(() => {
    if (isDemo) {
      setUser({ email: "demo" });
      setProjects(DEMO_PROJECTS);
      setSessions(DEMO_SESSIONS);
      setActiveProject(DEMO_PROJECTS[0].id);
      setAuthChecked(true);
      return;
    }
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
    if (isDemo) { window.location.href = "/"; return; }
    await api.post("/logout");
    setUser(null); setProjects([]); setSessions([]); setActiveProject(null);
  };

  const addProject = async () => {
    if (!newProject.title.trim()) return;
    const p = {
      id: Date.now().toString(), title: newProject.title.trim(),
      target_words: parseInt(newProject.targetWords) || 80000,
      deadline: newProject.deadline || null,
    };
    if (isDemo) {
      setProjects(prev => [...prev, p]);
      setActiveProject(p.id);
      setNewProject({ title: "", targetWords: "", deadline: "" });
      return;
    }
    const res = await api.post("/projects", { ...p, targetWords: p.target_words });
    setProjects(prev => [...prev, { ...res, target_words: p.target_words }]);
    setActiveProject(p.id);
    setNewProject({ title: "", targetWords: "", deadline: "" });
  };

  const addSession = async (s) => {
    if (isDemo) {
      setSessions(prev => [...prev, { ...s, project_id: s.projectId, words_delta: s.wordsDelta }]);
      return;
    }
    const res = await api.post("/sessions", s);
    setSessions(prev => [...prev, { ...res, project_id: s.projectId, words_delta: s.wordsDelta }]);
  };

  if (!authChecked) return null;
  if (!user && showSplash) return (
    <SplashScreen onEnter={(dest) => {
      if (dest === "demo") { window.location.href = "?demo"; return; }
      setShowSplash(false);
    }} />
  );
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
  return (
    <div className="page">
      <div className="container header">

        <div>
          <h1 className="header-title">Bill</h1>
          <div className="header-subtitle">A writing progress journal</div>
        </div>
        <div className="header-right">
          {streak > 0 && <span className="streak">{streak}d streak ✦</span>}
          {isDemo
            ? <span className="demo-badge">Demo</span>
            : <span className="user-email">{user.email}</span>
          }
          <button className="btn-signout" onClick={handleLogout}>
            {isDemo ? "Sign in" : "Sign out"}
          </button>
        </div>
      </div>

      <div className="container nav">
        {["dashboard", "log", "projects", "history"].map((t, _, arr) => {
            const labels = { dashboard: "Dashboard", log: "Log Session", projects: "Projects", history: "History" };
          return (
            <button key={t} className={`nav-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {labels[t]}
            </button>
          );
        })}
      </div>

      <div className="container content">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2 className="empty-title">Welcome to Bill</h2>
              <p className="empty-subtitle">Start by creating your first project.</p>
              <button className="btn-primary" onClick={() => setTab("projects")}>Create a Project</button>
            </div>
          ) : (
            <div>
              <div className="project-tabs">
                {projects.map(p => (
                  <button key={p.id} className={`project-tab${p.id === activeProject ? " active" : ""}`}
                    onClick={() => setActiveProject(p.id)}>
                    {p.title}
                  </button>
                ))}
              </div>

              {ap && <>
                <div className="stat-grid">
                  <StatCard label="Total Words" value={fmt(totalWords)} sub={`of ${fmt(ap.target_words)}`} />
                  <StatCard label="Total Time" value={fmtTime(totalTime)} />
                  <StatCard label="This Week" value={fmt(weekWords)} sub={fmtTime(weekTime)} />
                  <StatCard label="Completion" value={`${Math.min(100, Math.round(totalWords / ap.target_words * 100))}%`} sub={ap.target_words - totalWords > 0 ? `${fmt(ap.target_words - totalWords)} to go` : "Complete!"} />
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-title">{ap.title}</span>
                    {ap.deadline && <span className="progress-deadline">Due {new Date(ap.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, totalWords / ap.target_words * 100)}%` }} />
                  </div>
                </div>

                <div className="heatmap-section">
                  <div className="section-label">Writing Activity — Last 16 Weeks</div>
                  <Heatmap sessions={sessions} projectId={activeProject} />
                </div>

                <div>
                  <div className="section-label section-label-row">
                    <span>Recent Sessions</span>
                    <button className="btn-link" onClick={() => setTab("log")}>+ Log Session</button>
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
            <h2 className="page-title">Log a Session</h2>
            <p className="page-subtitle">Record your writing time, word count, and notes.</p>
            {projects.length === 0
              ? <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-light)" }}>
                  Create a project first.{" "}
                  <button className="btn-link-serif" onClick={() => setTab("projects")}>Go to Projects →</button>
                </div>
              : <SessionForm projects={projects} onAdd={async (s) => { await addSession(s); setTab("dashboard"); }} />
            }
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div>
            <h2 className="page-title">Projects</h2>
            <p className="page-subtitle">Manage your works in progress.</p>

            <div className="new-project-form">
              <div className="new-project-heading">New Project</div>
              <div className="new-project-grid">
                <div>
                  <label className="field-label">Title</label>
                  <input className="field-input" placeholder="My Novel" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Target words</label>
                  <input type="number" className="field-input" placeholder="80,000" value={newProject.targetWords} onChange={e => setNewProject(p => ({ ...p, targetWords: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Deadline</label>
                  <input type="date" className="field-input" value={newProject.deadline} onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                <button className="btn-outline" onClick={addProject}>Add Project</button>
              </div>
            </div>

            <div className="project-list">
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
            <h2 className="page-title">Session History</h2>
            <p className="page-subtitle">All sessions across all projects.</p>
            <div className="stat-grid-3">
              <StatCard label="All-Time Words" value={fmt(sessions.reduce((a, s) => a + (s.words_delta || 0), 0))} />
              <StatCard label="All-Time Time" value={fmtTime(sessions.reduce((a, s) => a + (s.duration || 0), 0))} />
              <StatCard label="Total Sessions" value={sessions.length} />
            </div>
            <div className="heatmap-section">
              <div className="section-label">All Projects — Last 16 Weeks</div>
              <Heatmap sessions={sessions} projectId={null} />
            </div>
            <SessionList sessions={sessions} projects={projects} />
          </div>
        )}

      </div>
    </div>
  );
}
