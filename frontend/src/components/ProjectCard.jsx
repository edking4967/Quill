import { fmt, fmtTime } from "../utils";

export default function ProjectCard({ project, sessions, active, onClick }) {
  const ps = sessions.filter(s => s.project_id === project.id);
  const totalWords = ps.reduce((a, s) => a + (s.words_delta || 0), 0);
  const totalTime = ps.reduce((a, s) => a + (s.duration || 0), 0);
  const pct = Math.min(100, Math.round((totalWords / project.target_words) * 100));

  return (
    <div className={`project-card${active ? " active" : ""}`} onClick={onClick}>
      <div className="project-card-header">
        <div>
          <div className="project-card-title">{project.title}</div>
          <div className="project-card-meta">
            {fmt(totalWords)} / {fmt(project.target_words)} words · {fmtTime(totalTime)}
          </div>
        </div>
        <div className="project-card-pct">{pct}%</div>
      </div>
      <div className="project-card-bar">
        <div className="project-card-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
