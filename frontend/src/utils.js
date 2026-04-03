export const today = () => new Date().toISOString().slice(0, 10);
export const fmt = (n) => (n ?? 0).toLocaleString();
export const fmtTime = (mins) => {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const ACTIVITY_COLORS = {
  writing: "#c17b3a", editing: "#5a7a9c",
  brainstorming: "#7a6fa0", research: "#5a8a6a",
};
export const ACTIVITY_LABELS = {
  writing: "Writing", editing: "Editing",
  brainstorming: "Brainstorming", research: "Research",
};
