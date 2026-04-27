import { useState, useEffect } from "react";
import { today, ACTIVITY_LABELS } from "../utils";
import Timer from "./Timer";

export default function SessionForm({ projects, onAdd }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "", date: today(),
    duration: "", wordsDelta: "", activity: "writing", notes: "",
  });
  const [success, setSuccess] = useState(false);
  const [timeMode, setTimeMode] = useState("timer");

  useEffect(() => {
    if (projects.length && !form.projectId) setForm(f => ({ ...f, projectId: projects[0].id }));
  }, [projects]);

  const submit = async () => {
    const s = { id: Date.now().toString(), ...form, duration: parseInt(form.duration) || 0, wordsDelta: parseInt(form.wordsDelta) || 0 };
    await onAdd(s);
    setForm(f => ({ ...f, duration: "", wordsDelta: "", notes: "" }));
    setSuccess(true); setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="session-form">
      <div className="session-form-grid">
        <div className="session-form-full">
          <div className="time-mode-tabs">
            <button className={`nav-btn${timeMode === "timer" ? " active" : ""}`} onClick={() => setTimeMode("timer")}>Timer</button>
            <button className={`nav-btn${timeMode === "manual" ? " active" : ""}`} onClick={() => setTimeMode("manual")}>Manual</button>
          </div>
          {timeMode === "timer"
            ? <Timer onTimeChange={mins => setForm(f => ({ ...f, duration: mins }))} />
            : <div>
                <label className="field-label">Duration (minutes)</label>
                <input type="number" className="field-input" placeholder="e.g. 45" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} min="0" />
              </div>
          }
          <label className="field-label">Project</label>
          <select className="field-input" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Date</label>
          <input type="date" className="field-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Primary Activity</label>
          <select className="field-input" value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}>
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Words written</label>
          <input type="number" className="field-input" placeholder="e.g. 800" value={form.wordsDelta} onChange={e => setForm(f => ({ ...f, wordsDelta: e.target.value }))} />
        </div>
        <div className="session-form-full">
          <label className="field-label">Notes (optional)</label>
          <textarea className="field-input" style={{ resize: "vertical", minHeight: "60px" }} placeholder="How did the session go?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      <div className="session-form-actions">
        <button className="session-form-btn" onClick={submit}>Log Session</button>
        {success && <span className="session-success">Session recorded ✓</span>}
      </div>
    </div>
  );
}
