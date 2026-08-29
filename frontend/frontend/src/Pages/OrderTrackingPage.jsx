import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIMELINE_STEPS = [
  { key: "pending",          label: "Order Placed",      icon: "📋" },
  { key: "confirmed",        label: "Confirmed",         icon: "✅" },
  { key: "packed",           label: "Packed",            icon: "📦" },
  { key: "dispatched",       label: "Dispatched",        icon: "🚀" },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: "🛵" },
  { key: "delivered",        label: "Delivered",         icon: "🎉" },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.key);

function getStepIndex(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    const cleanId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim();
    if (!cleanId || !cleanPhone) {
      setError("Please enter both Order ID and phone number.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setTracking(null);
      const res = await axios.get(`${API}/orders/track/${cleanId}`, {
        params: { phone: cleanPhone },
      });
      if (!res.data) {
        setError("No order found. Please check your Order ID and phone number.");
      } else {
        setTracking(res.data);
      }
    } catch (err) {
      setError("Could not find your order. Please verify your Order ID and registered phone number.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = tracking ? getStepIndex(tracking.status) : -1;
  const isCancelled = tracking?.status === "cancelled";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', sans-serif" }}>

      {/* Hero Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        padding: "48px 24px 40px",
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}>🚚</span>
            <div>
              <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", margin: 0 }}>
                Delivery Limited × Avora Clothing
              </p>
              <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "4px 0 0", letterSpacing: "-0.02em" }}>
                Track Your Order
              </h1>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0 }}>
            Enter your Order ID (e.g. AVR-1001) and registered phone number to see real-time delivery updates.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 0" }}>
        <form onSubmit={handleTrack} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Order ID
              </label>
              <input
                id="track-order-id"
                type="text"
                placeholder="AVR-1001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  padding: "12px 14px", color: "var(--text)", fontSize: 15,
                  fontFamily: "monospace", outline: "none", width: "100%",
                  boxSizing: "border-box", textTransform: "uppercase",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Phone Number
              </label>
              <input
                id="track-phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  padding: "12px 14px", color: "var(--text)", fontSize: 15,
                  fontFamily: "monospace", outline: "none", width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c",
              padding: "10px 14px", fontSize: 13, fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="track-order-btn"
            type="submit"
            disabled={loading}
            style={{
              background: "var(--primary)", color: "#fff", border: "none",
              padding: "14px 24px", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
              width: "100%",
            }}
          >
            {loading ? "🔍 Searching…" : "🔍 Track My Order"}
          </button>
        </form>

        {/* ── Tracking Result ── */}
        {tracking && (
          <div style={{ marginTop: 24, marginBottom: 48 }}>

            {/* Order Summary Card */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              padding: 24, marginBottom: 20,
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{
                    background: "#c86f49", color: "#fff", fontFamily: "monospace",
                    fontSize: 16, fontWeight: 800, padding: "4px 12px", letterSpacing: "0.08em",
                    display: "inline-block", marginBottom: 8,
                  }}>
                    🆔 {tracking.orderId}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4338ca",
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", letterSpacing: "0.06em",
                      textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                      🚚 Delivery Limited
                      {tracking.awbNumber && (
                        <span style={{ fontFamily: "monospace", color: "#6366f1" }}>· {tracking.awbNumber}</span>
                      )}
                    </span>
                    {/* Current Status */}
                    <span style={{
                      background: isCancelled ? "#fce4ec" : tracking.status === "delivered" ? "#e8f5e9" : "#e3f2fd",
                      color: isCancelled ? "#ef4444" : tracking.status === "delivered" ? "#16a34a" : "#1d4ed8",
                      border: `1px solid ${isCancelled ? "#fca5a5" : tracking.status === "delivered" ? "#86efac" : "#93c5fd"}`,
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      {tracking.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 13 }}>
                  <p style={{ color: "var(--muted)", marginBottom: 2 }}>
                    Ordered: {new Date(tracking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {tracking.estimatedDelivery && !["delivered", "cancelled"].includes(tracking.status) && (
                    <p style={{ color: "#16a34a", fontWeight: 700 }}>
                      📅 Est. Delivery: {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                    ₹{Number(tracking.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Delivery address */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "12px 16px", fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Delivering to
                </p>
                <p style={{ fontWeight: 600, color: "var(--text)" }}>
                  {tracking.shippingAddress?.fullName} — {tracking.shippingAddress?.addressLine1}, {tracking.shippingAddress?.city} {tracking.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* ── Visual Tracking Timeline ── */}
            {!isCancelled ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 28 }}>
                  📍 Live Tracking Timeline
                </h2>

                {/* Desktop horizontal stepper */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i <= currentStepIdx;
                    const active = i === currentStepIdx;
                    const matchedEvent = (tracking.trackingHistory || []).find((e) => e.status === step.key);

                    return (
                      <div key={step.key} style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 90 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          {/* Circle */}
                          <div style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: done ? (active ? "var(--primary)" : "#22c55e") : "var(--bg)",
                            border: `3px solid ${done ? (active ? "var(--primary)" : "#22c55e") : "var(--border)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20,
                            boxShadow: active ? "0 0 0 4px rgba(var(--primary-rgb, 200,111,73),0.18)" : "none",
                            transition: "all 0.3s",
                            position: "relative",
                            zIndex: 1,
                          }}>
                            {done ? (active ? step.icon : "✅") : step.icon}
                          </div>

                          {/* Label */}
                          <div style={{ textAlign: "center", marginTop: 8, minHeight: 48 }}>
                            <p style={{
                              fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                              letterSpacing: "0.06em", color: done ? "var(--text)" : "var(--muted)",
                              margin: 0,
                            }}>
                              {step.label}
                            </p>
                            {matchedEvent && (
                              <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 0 0", fontFamily: "monospace" }}>
                                {new Date(matchedEvent.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                {" "}
                                {new Date(matchedEvent.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                            {matchedEvent?.location && (
                              <p style={{ fontSize: 10, color: "#6366f1", margin: "2px 0 0", fontWeight: 600 }}>
                                📍 {matchedEvent.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Connector line */}
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div style={{
                            height: 3, flex: 1, marginTop: 22, minWidth: 20,
                            background: i < currentStepIdx ? "#22c55e" : "var(--border)",
                            transition: "background 0.4s",
                            borderRadius: 99,
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c",
                padding: 24, marginBottom: 20, textAlign: "center",
              }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>❌</p>
                <p style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Order Cancelled</p>
                <p style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>This order has been cancelled. Contact support if you need help.</p>
              </div>
            )}

            {/* ── Detailed History Log ── */}
            {Array.isArray(tracking.trackingHistory) && tracking.trackingHistory.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 20 }}>
                  📋 Full Tracking History
                </h3>
                <div style={{ position: "relative" }}>
                  {[...tracking.trackingHistory].reverse().map((evt, idx, arr) => (
                    <div key={idx} style={{ display: "flex", gap: 16, position: "relative" }}>
                      {/* Timeline dot & line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: "50%", marginTop: 2,
                          background: idx === 0 ? "var(--primary)" : "var(--border)",
                          border: `2px solid ${idx === 0 ? "var(--primary)" : "var(--border)"}`,
                          flexShrink: 0,
                        }} />
                        {idx < arr.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "var(--border)", margin: "2px 0" }} />
                        )}
                      </div>

                      {/* Event info */}
                      <div style={{ paddingBottom: 20, flex: 1 }}>
                        <p style={{
                          fontWeight: 800, fontSize: 13, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: "var(--text)", margin: 0,
                        }}>
                          {evt.status?.replace(/_/g, " ")}
                        </p>
                        <p style={{ color: "var(--muted)", fontSize: 12, margin: "4px 0 0" }}>{evt.message}</p>
                        {evt.location && (
                          <p style={{ color: "#6366f1", fontSize: 12, fontWeight: 600, margin: "3px 0 0" }}>
                            📍 {evt.location}
                          </p>
                        )}
                        <p style={{ color: "var(--muted)", fontSize: 11, fontFamily: "monospace", margin: "4px 0 0" }}>
                          {new Date(evt.timestamp).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ordered Items */}
            {Array.isArray(tracking.items) && tracking.items.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 16 }}>
                  🛍 Items in This Order
                </h3>
                {tracking.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0", borderBottom: idx < tracking.items.length - 1 ? "1px solid var(--border)" : "none",
                    gap: 12,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} style={{ width: 44, height: 54, objectFit: "cover", border: "1px solid var(--border)" }} />
                      )}
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", color: "var(--text)", margin: 0 }}>
                          {item.productName}
                        </p>
                        {item.size && (
                          <span style={{
                            display: "inline-block", background: "var(--bg)", border: "1px solid var(--border)",
                            fontSize: 10, fontWeight: 700, color: "var(--muted)", padding: "2px 8px", marginTop: 4,
                          }}>
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12 }}>
                      <p style={{ color: "var(--muted)", margin: 0 }}>₹{item.price} × {item.quantity}</p>
                      <p style={{ fontWeight: 700, color: "var(--primary)", margin: "2px 0 0", fontSize: 14 }}>
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
