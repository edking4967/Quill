import { fmt, fmtTime, ACTIVITY_COLORS, ACTIVITY_LABELS } from "../utils";

export default function SessionList({ sessions, projects }) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  const projMap = Object.fromEntries(projects.map(p => [p.id, p.title]));

  if (!sorted.length) return <div className="session-list-empty">No sessions yet.</div>;

  return (
    <div>
      {sorted.map(s => (
        <div key={s.id} className="session-row">
          <div className="session-date">{s.date}</div>
          <div className="session-project">
            {projMap[s.project_id] || "—"}
            {s.notes && <span className="session-notes">"{s.notes}"</span>}
          </div>
          <div className="session-badge" style={{
            background: `${ACTIVITY_COLORS[s.activity]}22`,
            color: ACTIVITY_COLORS[s.activity],
          }}>{ACTIVITY_LABELS[s.activity]}</div>
          <div className="session-words">{s.words_delta > 0 ? `+${fmt(s.words_delta)}` : "—"}</div>
          <div className="session-time">{fmtTime(s.duration)}</div>
        </div>
      ))}
    </div>
  );
}
