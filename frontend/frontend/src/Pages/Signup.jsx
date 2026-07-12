import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/store");
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: 320, height: 320,
        background: "radial-gradient(circle, rgba(200,111,73,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: 260, height: 260,
        background: "radial-gradient(circle, rgba(45,167,161,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "5%",
        width: 120, height: 120,
        background: "radial-gradient(circle, rgba(200,111,73,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          
          padding: "40px 36px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          animation: "fadeInUp 0.5s ease-out both",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/store" style={{ display: "inline-block", textDecoration: "none" }}>
            <p className="logo-text" style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>AVORA</p>
          </Link>
          <p style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.18em", marginTop: 4, textTransform: "uppercase" }}>
            Premium Avora
          </p>
        </div>

        {/* Heading */}
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 6px", textAlign: "center" }}>
          Create an account
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", margin: "0 0 28px" }}>
          Join the AVORA studio today
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(200,111,73,0.1)",
            border: "1px solid rgba(200,111,73,0.3)",
            
            padding: "10px 14px",
            color: "#c86f49",
            fontSize: 13,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
              FULL NAME
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handle}
              placeholder="John Doe"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                
                padding: "12px 14px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.boxShadow = "0 0 0 3px rgba(33,45,67,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email */}
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
              placeholder="you@example.com"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                
                padding: "12px 14px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.boxShadow = "0 0 0 3px rgba(33,45,67,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
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
                  transition: "border 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(33,45,67,0.1)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
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

          {/* Submit */}
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
              transition: "transform 0.15s, box-shadow 0.2s",
              width: "100%",
            }}
            onMouseEnter={e => { if (!loading) e.target.style.boxShadow = "0 8px 16px rgba(33,45,67,0.2)"; }}
            onMouseLeave={e => { e.target.style.boxShadow = "none"; }}
          >
            {loading ? "Signing up…" : "Sign Up →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ color: "var(--muted)", fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Login link */}
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, margin: 0 }}>
          Already have an account?{" "}
          <Link to="/store/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Sign In
          </Link>
        </p>

        {/* Back to store */}
        <p style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/store" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--muted)"}>
            ← Back to Store
          </Link>
        </p>
      </div>
    </div>
  );
}
