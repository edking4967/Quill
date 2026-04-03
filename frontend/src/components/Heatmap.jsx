import { today, fmt } from "../utils";

export default function Heatmap({ sessions, projectId }) {
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
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-week">
            {week.map(date => {
              const count = byDay[date] || 0;
              const opacity = count ? 0.2 + 0.8 * (count / max) : 0;
              return (
                <div key={date}
                  className={`heatmap-cell${date === today() ? " today" : ""}`}
                  title={`${date}: ${fmt(count)} words`}
                  style={{ background: count ? `rgba(193,123,58,${opacity})` : "var(--paper-mid)" }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-legend-label">LESS</span>
        {[0.1, 0.3, 0.55, 0.8, 1].map(o => (
          <div key={o} className="heatmap-legend-dot" style={{ background: `rgba(193,123,58,${o})` }} />
        ))}
        <span className="heatmap-legend-label">MORE</span>
      </div>
    </div>
  );
}
