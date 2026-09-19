import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../Context/AdminAuthContext";
import { ADMIN_BASE } from "../adminConfig";

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ADMIN_BASE;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      adminLogin(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "40px 36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p className="logo-text" style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>AVORA</p>
          <p style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.18em", marginTop: 4, textTransform: "uppercase" }}>
            Admin Panel
          </p>
        </div>

        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 6px", textAlign: "center" }}>
          Admin Sign In
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", margin: "0 0 28px" }}>
          Authorized personnel only
        </p>

        {error && (
          <div style={{
            background: "rgba(200,111,73,0.1)",
            border: "1px solid rgba(200,111,73,0.3)",
            padding: "10px 14px",
            color: "#c86f49",
            fontSize: 13,
            marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handle}
              placeholder="admin@example.com"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                padding: "12px 14px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handle}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  padding: "12px 44px 12px 14px",
                  color: "var(--text)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "var(--muted)", cursor: "pointer",
                  fontSize: 16, padding: 0,
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? "var(--muted)" : "var(--primary)",
              border: "none",
              padding: "13px",
              color: "var(--surface)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
