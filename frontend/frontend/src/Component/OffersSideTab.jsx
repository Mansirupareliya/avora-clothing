import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiGift, FiX, FiCheckCircle, FiClock, FiShoppingBag, FiTag, FiStar, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../Context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function OffersSideTab() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [promoConfig, setPromoConfig] = useState({
    minTriggerSpend: 5000,
    rewardAmount: 1500,
    minRedeemOrderValue: 6000,
    expiryDays: 30,
    isEnabled: true,
    offerTitle: "₹1,500 Shopping Credit on ₹5,000+ Orders",
  });
  const [userActiveCredit, setUserActiveCredit] = useState(null);

  const fetchOffers = async () => {
    try {
      const [configRes, creditRes] = await Promise.all([
        axios.get(`${API}/shopping-credits/config`),
        user ? axios.get(`${API}/shopping-credits/active`, { params: { userId: user.id, userEmail: user.email } }) : Promise.resolve({ data: null }),
      ]);
      if (configRes.data) setPromoConfig(configRes.data);
      if (creditRes.data) setUserActiveCredit(creditRes.data);
    } catch (err) {
      console.error("Failed to fetch promotional offers:", err);
    }
  };

  useEffect(() => {
    fetchOffers();
    // Poll every 30 seconds so admin changes reflect immediately on frontend
    const interval = setInterval(fetchOffers, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Hide the entire tab if offer is disabled by admin
  if (!promoConfig.isEnabled) return null;

  return (
    <>
      {/* Floating Vertical Side Button (Left Edge — AVORA Minimalist Theme matching Login Screen) */}
      <button
        onClick={() => {
          fetchOffers();
          setIsOpen(true);
        }}
        style={{
          position: "fixed",
          left: 0,
          top: "42%",
          transform: "translateY(-50%)",
          zIndex: 9990,
          background: "#ffffff",
          color: "#212d43",
          border: "1px solid var(--border, #cbd5e1)",
          borderLeft: "none",
          borderRadius: "0 6px 6px 0",
          padding: "14px 10px",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(33, 45, 67, 0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          transition: "transform 0.2s, boxShadow 0.2s, borderColor 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) translateX(4px)";
          e.currentTarget.style.borderColor = "var(--primary, #212d43)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(33, 45, 67, 0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(-50%)";
          e.currentTarget.style.borderColor = "var(--border, #cbd5e1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(33, 45, 67, 0.12)";
        }}
      >
        {/* Pulsing Icon */}
        <div style={{ position: "relative" }}>
          <FiGift size={18} style={{ color: "#c86f49" }} />
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#2da7a1",
            }}
          />
        </div>

        {/* Vertical Text Label */}
        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#212d43",
            fontFamily: "var(--sans)",
          }}
        >
          Special Offers
        </span>
      </button>

      {/* Slide-out Offers Drawer / Modal — Exact AVORA Theme matching screenshot */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "16px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Drawer Box */}
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              maxHeight: "92vh",
              overflowY: "auto",
              scrollbarWidth: "none",
              background: "#ffffff",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 0,
              padding: "36px 32px 28px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
              position: "relative",
              marginLeft: "8px",
              animation: "slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Animation Keyframes */}
            <style>{`
              @keyframes slideInLeft {
                0% { opacity: 0; transform: translateX(-40px); }
                100% { opacity: 1; transform: translateX(0); }
              }
              @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
            `}</style>

            {/* Background decorative soft ambient glow */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, background: "radial-gradient(circle, rgba(200,111,73,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(45,167,161,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "1px solid var(--border, #cbd5e1)",
                cursor: "pointer",
                color: "var(--muted, #64748b)",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary, #212d43)";
                e.currentTarget.style.color = "var(--primary, #212d43)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border, #cbd5e1)";
                e.currentTarget.style.color = "var(--muted, #64748b)";
              }}
            >
              <FiX size={14} />
            </button>

            {/* AVORA Logo Header — Exactly matching Login form screenshot */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p className="logo-text" style={{ color: "var(--primary, #212d43)", fontSize: "2rem", margin: 0, fontFamily: "var(--serif)" }}>
                AVORA
              </p>
              <p style={{ color: "var(--muted, #8892a0)", fontSize: 11, letterSpacing: "0.18em", marginTop: 4, textTransform: "uppercase", margin: "4px 0 0" }}>
                PREMIUM AVORA
              </p>
            </div>

            {/* Headline */}
            <h2 style={{ color: "#212d43", fontSize: 22, fontWeight: 700, margin: "0 0 4px", textAlign: "center" }}>
              Exclusive Store Offers
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", margin: "0 0 24px" }}>
              Special rewards unlocked for your account
            </p>

            {/* Active Promotional Offer Box */}
            {promoConfig && promoConfig.isEnabled && (
              <div style={{ marginBottom: 20 }}>
                {/* Offer Highlight Card */}
                <div
                  style={{
                    background: "var(--bg, #f1f5f9)",
                    border: "1px solid var(--border, #cbd5e1)",
                    borderRadius: 0,
                    padding: "20px 18px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#c86f49", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      LIMITED PROMOTION
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#212d43", color: "#ffffff", padding: "2px 8px", borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ACTIVE
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#212d43", margin: "0 0 6px", lineHeight: 1.3 }}>
                    Unlock ₹{Number(promoConfig.rewardAmount || 1500).toLocaleString()} Shopping Credit
                  </h3>

                  <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px", lineHeight: 1.5 }}>
                    Place an order of <strong>₹{Number(promoConfig.minTriggerSpend || 5000).toLocaleString()} or more</strong> to earn an automatic <strong>₹{Number(promoConfig.rewardAmount || 1500).toLocaleString()} Shopping Credit</strong> for your next purchase!
                  </p>

                  {/* Input-style Grey Info Rows — matching login form grey input fields in screenshot */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    <div>
                      <label style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                        QUALIFYING ORDER SPEND
                      </label>
                      <div style={{ background: "#b0b8c6", border: "1px solid #cbd5e1", padding: "10px 14px", color: "#212d43", fontSize: 14, fontWeight: 700 }}>
                        ₹{Number(promoConfig.minTriggerSpend || 5000).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                        COUPON REWARD CREDIT
                      </label>
                      <div style={{ background: "#b0b8c6", border: "1px solid #cbd5e1", padding: "10px 14px", color: "#16a34a", fontSize: 15, fontWeight: 800 }}>
                        ₹{Number(promoConfig.rewardAmount || 1500).toLocaleString()} Shopping Credit
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                          REDEMPTION MIN SPEND
                        </label>
                        <div style={{ background: "#b0b8c6", border: "1px solid #cbd5e1", padding: "9px 12px", color: "#212d43", fontSize: 12, fontWeight: 700 }}>
                          ₹{Number(promoConfig.minRedeemOrderValue || 6000).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <label style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                          VALIDITY DURATION
                        </label>
                        <div style={{ background: "#b0b8c6", border: "1px solid #cbd5e1", padding: "9px 12px", color: "#212d43", fontSize: 12, fontWeight: 700 }}>
                          {promoConfig.expiryDays} Days
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button — matching Sign In button from screenshot */}
                  <Link
                    to="/store"
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "#212d43",
                      border: "none",
                      padding: "14px",
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.2s",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: 0,
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(33,45,67,0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    Shop Now &amp; Unlock Reward →
                  </Link>
                </div>
              </div>
            )}

            {/* Active User Credit Banner if Logged In */}
            {userActiveCredit && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.06)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  padding: "14px 16px",
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <FiCheckCircle size={15} /> Active Coupon Code Available
                </div>
                <p style={{ fontSize: 13, color: "#212d43", margin: "4px 0 8px", fontWeight: 600 }}>
                  Code: <span style={{ fontFamily: "monospace", color: "#c86f49", fontWeight: 800 }}>{userActiveCredit.code}</span> (₹{userActiveCredit.amount} off on ₹{userActiveCredit.minOrderValue}+ order)
                </p>
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  style={{ fontSize: 12, fontWeight: 700, color: "#212d43", textDecoration: "underline", textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Apply Code in Cart →
                </Link>
              </div>
            )}

            {/* Divider — matching screenshot divider format */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border, #e2e8f0)" }} />
              <span style={{ color: "var(--muted, #8892a0)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>AVORA Guarantee</span>
              <div style={{ flex: 1, height: 1, background: "var(--border, #e2e8f0)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>🚚 Free Delivery over ₹999</span>
              <span>🔒 Secure Checkout</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
