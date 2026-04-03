const API = "/api";

const api = {
  get: (path) => fetch(`${API}${path}`, { credentials: "include" }).then(r => r.json()),
  post: (path, body) => fetch(`${API}${path}`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json()),
};

export default api;
