import { useState } from "react";
import api from "../api";

export default function AuthScreen({ onAuth }) {
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

  return (
    <div className="auth-page">
      <div className="auth-inner">
        <div className="auth-logo">
          <h1 className="auth-logo-title">Bill</h1>
          <p className="auth-logo-sub">A writing progress journal</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            {["login", "register"].map(m => (
              <button key={m} className={`auth-tab${mode === m ? " active" : ""}`}
                onClick={() => { setMode(m); setError(""); }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="auth-fields">
            <div>
              <label className="auth-field-label">Email</label>
              <input type="email" className="field-input-lg" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <div>
              <label className="auth-field-label">Password</label>
              <input type="password" className="field-input-lg" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" onClick={submit} disabled={loading}>
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
