import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiCreditCard, FiX, FiGift, FiClock } from "react-icons/fi";

export default function CreditUnlockedModal({ credit, onClose }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Confetti Animation Effect on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ["#c86f49", "#2da7a1", "#ffd700", "#ffffff", "#4a90e2", "#e91e63"];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!credit) return null;

  const expiryDateFormatted = credit.expiresAt
    ? new Date(credit.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(10, 15, 26, 0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Background Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Modal Box with Glassmorphism */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
          border: "1.5px solid rgba(212, 175, 55, 0.4)",
          borderRadius: 16,
          padding: "36px 32px 32px",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(200, 111, 73, 0.25)",
          color: "#fff",
          animation: "modalPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        }}
      >
        {/* CSS Keyframe Styles */}
        <style>{`
          @keyframes modalPopIn {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes giftBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(-3deg); }
          }
          @keyframes lidOpen {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(-28px) rotate(-18deg) translateX(8px); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.15); }
          }
        `}</style>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: 34,
            height: 34,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
        >
          <FiX size={18} />
        </button>

        {/* Success Icon Header */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#4ade80", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
          <FiCheckCircle size={15} /> Payment Successful
        </div>

        {/* Animated Gift Box Opening */}
        <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 20px" }}>
          {/* Radial Glow */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
              animation: "glowPulse 2s infinite ease-in-out",
            }}
          />

          {/* Gift Box Base & Lid */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              animation: "giftBounce 2.5s infinite ease-in-out",
            }}
          >
            {/* Box Body */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 10,
                width: 80,
                height: 60,
                background: "linear-gradient(135deg, #c86f49 0%, #a44f2d 100%)",
                borderRadius: "0 0 8px 8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              {/* Ribbon Vertical */}
              <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, width: 12, background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)" }} />
            </div>

            {/* Box Lid */}
            <div
              style={{
                position: "absolute",
                top: 15,
                left: 6,
                width: 88,
                height: 25,
                background: "linear-gradient(135deg, #e5875d 0%, #c86f49 100%)",
                borderRadius: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                animation: "lidOpen 1.2s ease-out forwards 0.3s",
              }}
            >
              {/* Ribbon Lid Vertical */}
              <div style={{ position: "absolute", left: 38, top: 0, bottom: 0, width: 12, background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)" }} />
              {/* Bow Top */}
              <div style={{ position: "absolute", top: -14, left: 32, width: 24, height: 14, border: "3px solid #ffd700", borderRadius: "50% 50% 0 0" }} />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.25 }}>
          Congratulations! 🎉
        </h2>
        <p style={{ color: "#fcd34d", fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>
          You've unlocked a ₹{Number(credit.amount || 1500).toLocaleString()} Shopping Credit.
        </p>

        {/* Reward Details Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px dashed rgba(212, 175, 55, 0.5)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Credit Amount</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>₹{Number(credit.amount || 1500).toLocaleString()}</span>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
            <span style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
              <FiClock size={14} style={{ color: "#f59e0b" }} /> Expiry Date:
            </span>
            <span style={{ fontWeight: 700, color: "#fbbf24" }}>{expiryDateFormatted}</span>
          </div>

          <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4, marginTop: 2 }}>
            • Valid on your next order worth ₹{Number(credit.minOrderValue || 6000).toLocaleString()} or more.<br />
            • Credit code: <strong style={{ color: "#fff", letterSpacing: "0.05em" }}>{credit.code || "SC-AUTO"}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={() => {
              onClose();
              navigate("/store");
            }}
            style={{
              background: "linear-gradient(135deg, #c86f49 0%, #a44f2d 100%)",
              color: "#fff",
              border: "none",
              padding: "13px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 15px rgba(200, 111, 73, 0.4)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <FiShoppingBag size={16} /> Shop Now
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/store/account", { state: { section: "credits" } });
            }}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "13px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")}
          >
            <FiCreditCard size={16} /> View Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
