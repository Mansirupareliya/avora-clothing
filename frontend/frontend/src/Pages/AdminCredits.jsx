import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiGift,
  FiSearch,
  FiPlus,
  FiDownload,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const statusColors = {
  active: { bg: "#e8f5e9", color: "#16a34a", border: "#bbf7d0" },
  used: { bg: "#e3f2fd", color: "#2563eb", border: "#bfdbfe" },
  expired: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
};

export default function AdminCredits() {
  const [credits, setCredits] = useState([]);
  const [analytics, setAnalytics] = useState({
    creditsIssuedCount: 0,
    creditsIssuedAmount: 0,
    creditsRedeemedCount: 0,
    creditsRedeemedAmount: 0,
    revenueGenerated: 0,
    repeatCustomerRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manual Credit Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    userName: "",
    userEmail: "",
    amount: 2000,
    minOrderValue: 6000,
    expiryDays: 30,
  });
  // Dynamic Offer Configuration State
  const [config, setConfig] = useState({
    minTriggerSpend: 5000,
    rewardAmount: 1500,
    minRedeemOrderValue: 6000,
    expiryDays: 30,
    isEnabled: true,
    offerTitle: "₹1,500 Shopping Credit on ₹5,000+ Orders",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [creditsRes, analyticsRes, configRes] = await Promise.all([
        axios.get(`${API}/shopping-credits/admin/all`, {
          params: { search, status: statusFilter },
        }),
        axios.get(`${API}/shopping-credits/admin/analytics`),
        axios.get(`${API}/shopping-credits/config`),
      ]);
      setCredits(creditsRes.data || []);
      setAnalytics(analyticsRes.data || {});
      if (configRes.data) setConfig(configRes.data);
    } catch (err) {
      console.error("Failed to load credits data:", err);
      showToast("Error loading promotional credits data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await axios.patch(`${API}/shopping-credits/admin/config`, config);
      if (res.data) setConfig(res.data);
      showToast("Offer rules & customization saved successfully!");
      setShowConfigModal(false);
    } catch (err) {
      showToast("Failed to save offer rules", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.userName || !issueForm.userEmail) {
      showToast("Please enter customer name and email", "error");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/shopping-credits/admin/issue`, issueForm);
      showToast(`Manual credit of ₹${issueForm.amount} issued successfully!`);
      setShowIssueModal(false);
      setIssueForm({ userName: "", userEmail: "", amount: 2000, minOrderValue: 6000, expiryDays: 30 });
      fetchData();
    } catch (err) {
      showToast("Failed to issue manual credit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCredit = async (id, code) => {
    if (!window.confirm(`Are you sure you want to cancel credit ${code}?`)) return;

    try {
      await axios.patch(`${API}/shopping-credits/admin/${id}/cancel`);
      showToast(`Credit ${code} cancelled`);
      fetchData();
    } catch (err) {
      showToast("Failed to cancel credit", "error");
    }
  };

  const handleExportCSV = () => {
    window.open(`${API}/shopping-credits/admin/export`, "_blank");
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 48 }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === "error" ? "#ef4444" : "var(--primary)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {toast.type === "error" ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Page Title & Actions Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎁</span> Promotional Shopping Credits
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Manage ₹2,000 automated promotional credits, issue manual rewards & track repeat customer analytics
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowConfigModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #2da7a1 0%, #1e716c 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(45,167,161,0.3)",
            }}
          >
            ⚙️ Customize Offer Rules
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <FiDownload size={15} /> Export CSV Report
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(33,45,67,0.2)",
            }}
          >
            <FiPlus size={16} /> Issue Manual Credit
          </button>
        </div>
      </div>

      {/* Active Offer Configuration Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          borderRadius: 12,
          padding: "16px 20px",
          color: "#fff",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fcd34d" }}>
                Active Automated Offer: {config.offerTitle || `Get ₹${config.rewardAmount} Credit on ₹${config.minTriggerSpend}+ Shopping`}
              </span>
              <span
                style={{
                  background: config.isEnabled ? "#16a34a" : "#ef4444",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {config.isEnabled ? "LIVE & ACTIVE" : "PAUSED"}
              </span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#cbd5e1" }}>
              Triggers on orders ≥ <strong>₹{Number(config.minTriggerSpend).toLocaleString()}</strong> → Unlocks <strong>₹{Number(config.rewardAmount).toLocaleString()}</strong> Credit (Min Redeem Order: <strong>₹{Number(config.minRedeemOrderValue).toLocaleString()}</strong>, Valid: <strong>{config.expiryDays} Days</strong>)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✏️ Edit Rules
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          {
            title: "Credits Issued",
            value: `${analytics.creditsIssuedCount || 0}`,
            subtext: `₹${(analytics.creditsIssuedAmount || 0).toLocaleString()} Total Value`,
            icon: FiGift,
            color: "#8b5cf6",
            bg: "rgba(139, 92, 246, 0.1)",
          },
          {
            title: "Credits Redeemed",
            value: `${analytics.creditsRedeemedCount || 0}`,
            subtext: `₹${(analytics.creditsRedeemedAmount || 0).toLocaleString()} Discount Given`,
            icon: FiCheckCircle,
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.1)",
          },
          {
            title: "Revenue Generated",
            value: `₹${(analytics.revenueGenerated || 0).toLocaleString()}`,
            subtext: "From credit-redeemed orders",
            icon: FiDollarSign,
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.1)",
          },
          {
            title: "Repeat Customer Rate",
            value: `${analytics.repeatCustomerRate || 0}%`,
            subtext: "Customers with >1 order or redemption",
            icon: FiTrendingUp,
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.1)",
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: card.bg,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <card.icon size={26} />
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                {card.title}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 2px" }}>{card.value}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <FiSearch size={16} style={{ position: "absolute", left: 14, top: 13, color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search by Customer Name, Email, or Credit Code (SC-XXXXXX)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                padding: "10px 14px 10px 40px",
                borderRadius: 8,
                fontSize: 14,
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "active", "used", "expired", "cancelled"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? "var(--primary)" : "var(--bg)",
                  color: statusFilter === st ? "#fff" : "var(--muted)",
                  border: "1px solid var(--border)",
                  padding: "8px 14px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {st}
              </button>
            ))}

            <button
              type="submit"
              style={{
                background: "var(--text)",
                color: "var(--bg)",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Credits Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <FiRefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading credits database...</p>
          </div>
        ) : credits.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <FiGift size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>No promotional credits found</p>
            <p style={{ fontSize: 13, margin: 0 }}>Try clearing your search filters or issue a new manual credit.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "14px 18px" }}>Credit Code</th>
                  <th style={{ padding: "14px 18px" }}>Customer</th>
                  <th style={{ padding: "14px 18px" }}>Credit Amount</th>
                  <th style={{ padding: "14px 18px" }}>Min Order</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px" }}>Expiry Date</th>
                  <th style={{ padding: "14px 18px" }}>Issued Via</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((c) => {
                  const badge = statusColors[c.status] || { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 18px", fontWeight: 700, fontFamily: "monospace", color: "var(--primary)", fontSize: 14 }}>
                        {c.code}
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{c.userName || "Customer"}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.userEmail || "No email"}</div>
                      </td>

                      <td style={{ padding: "14px 18px", fontWeight: 700, color: "#16a34a" }}>
                        ₹{Number(c.amount).toLocaleString()}
                      </td>

                      <td style={{ padding: "14px 18px", color: "var(--muted)" }}>
                        ₹{Number(c.minOrderValue).toLocaleString()}
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px", color: "var(--muted)" }}>
                        {new Date(c.expiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td style={{ padding: "14px 18px", textTransform: "capitalize", fontSize: 12, color: "var(--muted)" }}>
                        {c.issuedBy === "admin" ? "👤 Manual Admin" : "⚡ Order Trigger (₹5k+)"}
                      </td>

                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        {c.status === "active" ? (
                          <button
                            onClick={() => handleCancelCredit(c.id, c.code)}
                            style={{
                              background: "none",
                              border: "1px solid #ef4444",
                              color: "#ef4444",
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FiXCircle size={12} /> Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Issue Credit Modal */}
      {showIssueModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "28px 28px 24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowIssueModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <FiX size={20} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
              Issue Manual Shopping Credit
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>
              Generate a promotional credit for a specific customer
            </p>

            <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={issueForm.userName}
                  onChange={(e) => setIssueForm({ ...issueForm, userName: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 6, color: "var(--text)", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Customer Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@example.com"
                  value={issueForm.userEmail}
                  onChange={(e) => setIssueForm({ ...issueForm, userEmail: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 6, color: "var(--text)", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={issueForm.amount}
                    onChange={(e) => setIssueForm({ ...issueForm, amount: Number(e.target.value) })}
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 6, color: "var(--text)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={issueForm.minOrderValue}
                    onChange={(e) => setIssueForm({ ...issueForm, minOrderValue: Number(e.target.value) })}
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 6, color: "var(--text)", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Validity (Days)
                </label>
                <input
                  type="number"
                  value={issueForm.expiryDays}
                  onChange={(e) => setIssueForm({ ...issueForm, expiryDays: Number(e.target.value) })}
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 6, color: "var(--text)", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Issuing..." : "Confirm & Issue Credit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    padding: "12px 18px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Customization Settings Modal */}
      {showConfigModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfigModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              background: "var(--surface)",
              border: "1.5px solid var(--primary)",
              borderRadius: 14,
              padding: "28px 30px 24px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowConfigModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <FiX size={20} />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
              ⚙️ Customize Automated Offer Rules
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>
              Configure the spend threshold, reward credit amount, and redemption conditions for customer orders.
            </p>

            <form onSubmit={handleSaveConfig} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Offer Status Toggle */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block" }}>Automated Offer Status</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Enable or pause automatic reward generation</span>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={config.isEnabled}
                    onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{ position: "absolute", inset: 0, background: config.isEnabled ? "#16a34a" : "#cbd5e1", borderRadius: 20, transition: "0.2s" }}>
                    <span style={{ position: "absolute", content: '""', height: 18, width: 18, left: config.isEnabled ? 22 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.2s" }} />
                  </span>
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Offer Title / Description
                </label>
                <input
                  type="text"
                  value={config.offerTitle}
                  onChange={(e) => setConfig({ ...config, offerTitle: e.target.value })}
                  placeholder="e.g. ₹1,500 Shopping Credit on ₹5,000+ Orders"
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "var(--text)", outline: "none", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Trigger Shopping Spend (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={config.minTriggerSpend}
                    onChange={(e) => setConfig({ ...config, minTriggerSpend: Number(e.target.value) })}
                    placeholder="5000"
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "var(--text)", outline: "none", fontSize: 14, fontWeight: 700 }}
                  />
                  <span style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, display: "block" }}>Min order value to earn reward</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Reward Credit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={config.rewardAmount}
                    onChange={(e) => setConfig({ ...config, rewardAmount: Number(e.target.value) })}
                    placeholder="1500"
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "#16a34a", outline: "none", fontSize: 14, fontWeight: 800 }}
                  />
                  <span style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, display: "block" }}>Coupon credit amount given</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Min Order Spend to Redeem (₹)
                  </label>
                  <input
                    type="number"
                    value={config.minRedeemOrderValue}
                    onChange={(e) => setConfig({ ...config, minRedeemOrderValue: Number(e.target.value) })}
                    placeholder="6000"
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "var(--text)", outline: "none", fontSize: 14 }}
                  />
                  <span style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, display: "block" }}>Min purchase threshold for next order</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                    Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    value={config.expiryDays}
                    onChange={(e) => setConfig({ ...config, expiryDays: Number(e.target.value) })}
                    placeholder="30"
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "var(--text)", outline: "none", fontSize: 14 }}
                  />
                  <span style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, display: "block" }}>Credit validity duration</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={savingConfig}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #2da7a1 0%, #1e716c 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "13px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(45,167,161,0.3)",
                  }}
                >
                  {savingConfig ? "Saving Offer Rules..." : "Save Custom Offer Rules"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    padding: "13px 20px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
