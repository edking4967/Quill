// Generate a date string relative to today
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const DEMO_PROJECTS = [
  { id: "demo-1", title: "The Smog We Breathe", target_words: 90000, deadline: daysAgo(-120) },
  { id: "demo-2", title: "Lili in Xi'an", target_words: 12000, deadline: null },
];

export const DEMO_SESSIONS = [
  // The Smog We Breathe — spread over ~14 weeks
  { id: "s1",  project_id: "demo-1", date: daysAgo(97), words_delta: 1200, duration: 75,  activity: "writing",       notes: "First scene, Lili arrives" },
  { id: "s2",  project_id: "demo-1", date: daysAgo(95), words_delta: 800,  duration: 55,  activity: "writing",       notes: "" },
  { id: "s3",  project_id: "demo-1", date: daysAgo(93), words_delta: 0,    duration: 40,  activity: "brainstorming", notes: "Mapped out Part One structure" },
  { id: "s4",  project_id: "demo-1", date: daysAgo(91), words_delta: 1500, duration: 90,  activity: "writing",       notes: "" },
  { id: "s5",  project_id: "demo-1", date: daysAgo(88), words_delta: 600,  duration: 45,  activity: "writing",       notes: "" },
  { id: "s6",  project_id: "demo-1", date: daysAgo(85), words_delta: 200,  duration: 60,  activity: "editing",       notes: "Cut the first two paragraphs" },
  { id: "s7",  project_id: "demo-1", date: daysAgo(83), words_delta: 1100, duration: 70,  activity: "writing",       notes: "" },
  { id: "s8",  project_id: "demo-1", date: daysAgo(80), words_delta: 900,  duration: 60,  activity: "writing",       notes: "The headmaster scene" },
  { id: "s9",  project_id: "demo-1", date: daysAgo(78), words_delta: 0,    duration: 90,  activity: "research",      notes: "Xi'an history, 1990s" },
  { id: "s10", project_id: "demo-1", date: daysAgo(76), words_delta: 1300, duration: 80,  activity: "writing",       notes: "" },
  { id: "s11", project_id: "demo-1", date: daysAgo(74), words_delta: 700,  duration: 50,  activity: "writing",       notes: "" },
  { id: "s12", project_id: "demo-1", date: daysAgo(71), words_delta: 400,  duration: 45,  activity: "editing",       notes: "" },
  { id: "s13", project_id: "demo-1", date: daysAgo(69), words_delta: 1600, duration: 95,  activity: "writing",       notes: "Good session, flow state" },
  { id: "s14", project_id: "demo-1", date: daysAgo(67), words_delta: 1000, duration: 65,  activity: "writing",       notes: "" },
  { id: "s15", project_id: "demo-1", date: daysAgo(64), words_delta: 500,  duration: 40,  activity: "editing",       notes: "" },
  { id: "s16", project_id: "demo-1", date: daysAgo(62), words_delta: 1800, duration: 110, activity: "writing",       notes: "Chapter 3 done (rough)" },
  { id: "s17", project_id: "demo-1", date: daysAgo(59), words_delta: 0,    duration: 50,  activity: "brainstorming", notes: "Restructured act two" },
  { id: "s18", project_id: "demo-1", date: daysAgo(57), words_delta: 1200, duration: 75,  activity: "writing",       notes: "" },
  { id: "s19", project_id: "demo-1", date: daysAgo(55), words_delta: 900,  duration: 60,  activity: "writing",       notes: "" },
  { id: "s20", project_id: "demo-1", date: daysAgo(52), words_delta: 600,  duration: 45,  activity: "writing",       notes: "" },
  { id: "s21", project_id: "demo-1", date: daysAgo(50), words_delta: 1400, duration: 85,  activity: "writing",       notes: "Pond's letter scene" },
  { id: "s22", project_id: "demo-1", date: daysAgo(48), words_delta: 300,  duration: 35,  activity: "editing",       notes: "" },
  { id: "s23", project_id: "demo-1", date: daysAgo(45), words_delta: 1100, duration: 70,  activity: "writing",       notes: "" },
  { id: "s24", project_id: "demo-1", date: daysAgo(43), words_delta: 800,  duration: 55,  activity: "writing",       notes: "" },
  { id: "s25", project_id: "demo-1", date: daysAgo(40), words_delta: 0,    duration: 60,  activity: "research",      notes: "Air quality records" },
  { id: "s26", project_id: "demo-1", date: daysAgo(38), words_delta: 1700, duration: 100, activity: "writing",       notes: "Best session in weeks" },
  { id: "s27", project_id: "demo-1", date: daysAgo(36), words_delta: 1000, duration: 65,  activity: "writing",       notes: "" },
  { id: "s28", project_id: "demo-1", date: daysAgo(34), words_delta: 500,  duration: 40,  activity: "editing",       notes: "" },
  { id: "s29", project_id: "demo-1", date: daysAgo(31), words_delta: 1200, duration: 75,  activity: "writing",       notes: "" },
  { id: "s30", project_id: "demo-1", date: daysAgo(29), words_delta: 900,  duration: 60,  activity: "writing",       notes: "" },
  { id: "s31", project_id: "demo-1", date: daysAgo(27), words_delta: 600,  duration: 45,  activity: "writing",       notes: "" },
  { id: "s32", project_id: "demo-1", date: daysAgo(24), words_delta: 1500, duration: 90,  activity: "writing",       notes: "Chapter 5 underway" },
  { id: "s33", project_id: "demo-1", date: daysAgo(22), words_delta: 400,  duration: 35,  activity: "editing",       notes: "" },
  { id: "s34", project_id: "demo-1", date: daysAgo(20), words_delta: 1100, duration: 70,  activity: "writing",       notes: "" },
  { id: "s35", project_id: "demo-1", date: daysAgo(17), words_delta: 800,  duration: 55,  activity: "writing",       notes: "" },
  { id: "s36", project_id: "demo-1", date: daysAgo(15), words_delta: 1300, duration: 80,  activity: "writing",       notes: "" },
  { id: "s37", project_id: "demo-1", date: daysAgo(13), words_delta: 0,    duration: 45,  activity: "brainstorming", notes: "Rethinking the ending" },
  { id: "s38", project_id: "demo-1", date: daysAgo(10), words_delta: 1600, duration: 95,  activity: "writing",       notes: "" },
  { id: "s39", project_id: "demo-1", date: daysAgo(8),  words_delta: 700,  duration: 50,  activity: "writing",       notes: "" },
  { id: "s40", project_id: "demo-1", date: daysAgo(6),  words_delta: 1000, duration: 65,  activity: "writing",       notes: "" },
  { id: "s41", project_id: "demo-1", date: daysAgo(4),  words_delta: 1200, duration: 75,  activity: "writing",       notes: "" },
  { id: "s42", project_id: "demo-1", date: daysAgo(2),  words_delta: 900,  duration: 60,  activity: "writing",       notes: "" },
  { id: "s43", project_id: "demo-1", date: daysAgo(1),  words_delta: 1100, duration: 70,  activity: "writing",       notes: "Good momentum" },
  // Lili in Xi'an — a shorter project
  { id: "s50", project_id: "demo-2", date: daysAgo(30), words_delta: 800,  duration: 55,  activity: "writing",       notes: "Opening scene" },
  { id: "s51", project_id: "demo-2", date: daysAgo(26), words_delta: 1100, duration: 70,  activity: "writing",       notes: "" },
  { id: "s52", project_id: "demo-2", date: daysAgo(21), words_delta: 600,  duration: 45,  activity: "editing",       notes: "" },
  { id: "s53", project_id: "demo-2", date: daysAgo(14), words_delta: 900,  duration: 60,  activity: "writing",       notes: "" },
  { id: "s54", project_id: "demo-2", date: daysAgo(7),  words_delta: 700,  duration: 50,  activity: "writing",       notes: "" },
  { id: "s55", project_id: "demo-2", date: daysAgo(3),  words_delta: 500,  duration: 40,  activity: "writing",       notes: "" },
];
