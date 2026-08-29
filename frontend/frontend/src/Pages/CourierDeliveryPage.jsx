import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CourierDeliveryPage() {
  const [awb, setAwb] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, orderId, customerName, message }
  const [error, setError] = useState("");

  const handleConfirm = async (e) => {
    e.preventDefault();
    const cleanAwb = awb.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanAwb || !cleanPin) {
      setError("Please enter both AWB number and your PIN.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await axios.post(`${API}/orders/courier/confirm-delivery`, {
        awbNumber: cleanAwb,
        pin: cleanPin,
      });
      setResult(res.data);
      if (res.data.success) {
        setAwb("");
        setPin("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please check your AWB and PIN."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Logo / Branding */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🚚</div>
        <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 6px" }}>
          Delivery Limited × Avora Clothing
        </p>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          Delivery Confirmation
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "8px 0 0" }}>
          For authorized Delivery Limited courier partners only
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        borderRadius: 20,
        padding: "36px 32px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
      }}>

        {/* ── Success State ── */}
        {result?.success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "0 auto 20px",
              boxShadow: "0 0 0 12px rgba(34,197,94,0.15)",
            }}>
              🎉
            </div>
            <h2 style={{ color: "#4ade80", fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>
              Delivered Successfully!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.6 }}>
              {result.message}
            </p>
            {result.orderId && (
              <div style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 10, padding: "12px 16px", marginTop: 16,
              }}>
                <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Order ID: {result.orderId}
                </p>
                {result.customerName && (
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "4px 0 0" }}>
                    Customer: {result.customerName}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={reset}
              style={{
                marginTop: 24, width: "100%",
                background: "linear-gradient(135deg, #6366f1, #4338ca)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "14px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.04em",
              }}
            >
              📦 Confirm Another Delivery
            </button>
          </div>

        ) : (
          /* ── Form ── */
          <form onSubmit={handleConfirm}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                AWB Number
              </label>
              <input
                id="courier-awb"
                type="text"
                placeholder="e.g. DL202612345678"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                autoComplete="off"
                style={{
                  width: "100%", background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
                  padding: "14px 16px", color: "#fff", fontSize: 16,
                  fontFamily: "monospace", fontWeight: 600, outline: "none",
                  boxSizing: "border-box", textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Courier PIN
              </label>
              <input
                id="courier-pin"
                type="password"
                placeholder="Enter your assigned PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
                  padding: "14px 16px", color: "#fff", fontSize: 16,
                  fontFamily: "monospace", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "6px 0 0" }}>
                PIN is provided by your Delivery Limited supervisor
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 20,
                color: "#fca5a5", fontSize: 13, fontWeight: 500,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              id="courier-confirm-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #4338ca)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "16px", fontSize: 15, fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", transition: "opacity 0.2s",
                boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.35)",
              }}
            >
              {loading ? "⏳ Confirming…" : "✅ Mark as Delivered"}
            </button>
          </form>
        )}
      </div>

      {/* Footer note */}
      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 28, textAlign: "center", maxWidth: 340 }}>
        This page is exclusively for Delivery Limited courier staff.
        Unauthorized use is strictly prohibited.
      </p>
    </div>
  );
}
