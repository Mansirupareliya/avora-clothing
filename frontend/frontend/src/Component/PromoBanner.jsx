import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TRUST_ITEMS = [
  { icon: "🔒", label: "100% Secure Payment" },
  { icon: "↩️", label: "Easy 15-Day Returns" },
  { icon: "🚚", label: "Free Delivery on Prepaid Orders" },
  { icon: "🎧", label: "24/7 Customer Support" },
];

export default function PromoBanner() {
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = () => {
      axios
        .get(`${API}/coupons/featured`)
        .then((res) => {
          if (!cancelled) setCoupon(res.data || null);
        })
        .catch(() => {});
    };
    fetchFeatured();
    const interval = setInterval(fetchFeatured, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!coupon) return null;

  const headline =
    coupon.discountType === "percent"
      ? `GET ${Number(coupon.discountValue)}% OFF`
      : `GET ₹${Number(coupon.discountValue).toLocaleString("en-IN")} OFF`;

  const subtext = coupon.bannerSubtext || coupon.description || "On your first order";

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard?.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8" style={{ paddingTop: 32, paddingBottom: 8 }}>
        <div
          style={{
            background: "var(--primary)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexWrap: "wrap",
            minHeight: 220,
          }}
        >
          {/* Left — photo (only if admin set one; otherwise this side just collapses) */}
          {coupon.bannerImageUrl && (
            <div
              style={{
                flex: "1 1 320px",
                minHeight: 220,
                backgroundImage: `url(${coupon.bannerImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* Right — copy + code + CTA */}
          <div
            style={{
              flex: "1 1 360px",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
              position: "relative",
              zIndex: 1,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontFamily: "var(--sans)",
              }}
            >
              {headline}
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.75)" }}>
              {subtext}
            </p>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
              <button
                onClick={handleCopy}
                title="Click to copy code"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px dashed rgba(255,255,255,0.4)",
                  color: "#ffffff",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {copied ? "Copied!" : `Use code: ${coupon.code}`}
              </button>

              <Link
                to="/store"
                style={{
                  background: "#ffffff",
                  color: "var(--primary)",
                  padding: "12px 28px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "transform 0.15s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges strip below the banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            padding: "22px 12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
