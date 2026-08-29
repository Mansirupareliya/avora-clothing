import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiTag, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiCheckCircle, FiAlertCircle, FiX, FiCopy, FiPercent, FiDollarSign,
  FiClock, FiUsers, FiTrendingUp, FiEye,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyForm = {
  code: "",
  discountType: "flat",
  discountValue: "",
  minOrderValue: "",
  maxDiscountAmount: "",
  usageLimit: "",
  perUserLimit: 1,
  isActive: true,
  expiresAt: "",
  description: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [statsData, setStatsData] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/coupons/admin`);
      setCoupons(res.data || []);
    } catch {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "flat",
      discountValue: coupon.discountValue || "",
      minOrderValue: coupon.minOrderValue || "",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit || "",
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive !== false,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      description: coupon.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      showToast("Code and discount value are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (editingId) {
        await axios.patch(`${API}/coupons/admin/${editingId}`, payload);
        showToast("Coupon updated successfully!");
      } else {
        await axios.post(`${API}/coupons/admin`, payload);
        showToast("Coupon created successfully! 🎉");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${API}/coupons/admin/${id}/toggle`);
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: res.data.isActive } : c)));
      showToast(res.data.isActive ? "Coupon activated!" : "Coupon deactivated!");
    } catch { showToast("Failed to toggle coupon", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/coupons/admin/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      showToast("Coupon deleted!");
    } catch { showToast("Failed to delete coupon", "error"); }
  };

  const handleViewStats = async (coupon) => {
    setStatsModal(coupon);
    setStatsData(null);
    try {
      const res = await axios.get(`${API}/coupons/admin/${coupon.id}/stats`);
      setStatsData(res.data);
    } catch { setStatsData({ error: true }); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied: ${code}`);
  };

  const isExpired = (coupon) => coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  const formatDiscount = (c) =>
    c.discountType === "percent"
      ? `${c.discountValue}%${c.maxDiscountAmount ? ` (max ₹${Number(c.maxDiscountAmount).toLocaleString()})` : ""}`
      : `₹${Number(c.discountValue).toLocaleString()}`;

  // Stats
  const totalActive = coupons.filter((c) => c.isActive && !isExpired(c)).length;
  const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
  const totalCoupons = coupons.length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 48 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "var(--primary)",
          color: "#fff", padding: "12px 20px", borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600,
        }}>
          {toast.type === "error" ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            <FiTag size={26} color="#c86f49" /> Coupon Code Manager
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Create and manage discount coupons for your customers
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--primary)", color: "#fff", border: "none",
            padding: "11px 20px", borderRadius: 8, fontSize: 14,
            fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(33,45,67,0.2)",
          }}
        >
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Coupons", value: totalCoupons, icon: FiTag, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
          { label: "Active Coupons", value: totalActive, icon: FiCheckCircle, color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
          { label: "Total Redemptions", value: totalUsed, icon: FiTrendingUp, color: "#c86f49", bg: "rgba(200,111,73,0.1)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: bg, borderRadius: 10, padding: 10 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <FiTag size={16} color="var(--muted)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>All Coupons</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{coupons.length} coupons</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <FiTag size={40} color="var(--muted)" style={{ marginBottom: 12 }} />
            <p style={{ color: "var(--muted)", fontSize: 15 }}>No coupons yet. Create your first coupon!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Code", "Discount", "Min Order", "Usage", "Expiry", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, idx) => {
                  const expired = isExpired(coupon);
                  const statusColor = !coupon.isActive ? "#6b7280" : expired ? "#d97706" : "#16a34a";
                  const statusBg = !coupon.isActive ? "rgba(107,114,128,0.1)" : expired ? "rgba(217,119,6,0.1)" : "rgba(22,163,74,0.1)";
                  const statusLabel = !coupon.isActive ? "Inactive" : expired ? "Expired" : "Active";
                  return (
                    <tr key={coupon.id} style={{ borderTop: idx > 0 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: "var(--primary)", letterSpacing: "0.05em" }}>{coupon.code}</span>
                          <button onClick={() => copyCode(coupon.code)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }} title="Copy">
                            <FiCopy size={13} />
                          </button>
                        </div>
                        {coupon.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coupon.description}</div>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ background: coupon.discountType === "percent" ? "rgba(139,92,246,0.1)" : "rgba(22,163,74,0.1)", color: coupon.discountType === "percent" ? "#8b5cf6" : "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>
                            {formatDiscount(coupon)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                        {Number(coupon.minOrderValue || 0) > 0 ? `₹${Number(coupon.minOrderValue).toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                          {coupon.usedCount || 0}{coupon.usageLimit ? `/${coupon.usageLimit}` : " used"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>per user: {coupon.perUserLimit || 1}x</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: expired ? "#d97706" : "var(--muted)", fontWeight: expired ? 700 : 400 }}>
                        {coupon.expiresAt ? (
                          <span title={new Date(coupon.expiresAt).toLocaleString()}>
                            {expired ? "⚠ Expired" : new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        ) : "Never"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: statusBg, color: statusColor, border: `1px solid ${statusColor}40`, borderRadius: 0, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{statusLabel}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleViewStats(coupon)} title="Stats" style={{ background: "rgba(139,92,246,0.1)", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#8b5cf6" }}><FiEye size={14} /></button>
                          <button onClick={() => openEdit(coupon)} title="Edit" style={{ background: "rgba(33,45,67,0.08)", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "var(--text)" }}><FiEdit2 size={14} /></button>
                          <button onClick={() => handleToggle(coupon.id)} title={coupon.isActive ? "Deactivate" : "Activate"}
                            style={{ background: coupon.isActive ? "rgba(22,163,74,0.1)" : "rgba(107,114,128,0.1)", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: coupon.isActive ? "#16a34a" : "#6b7280" }}>
                            {coupon.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                          </button>
                          <button onClick={() => setDeleteConfirm(coupon)} title="Delete" style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#ef4444" }}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 560, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "28px 30px 24px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><FiX size={20} /></button>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
              {editingId ? "✏️ Edit Coupon" : "🎟️ Create New Coupon"}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 24px" }}>
              {editingId ? "Update coupon settings" : "Set up a new discount coupon for your customers"}
            </p>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Code + Description */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. AVORA20" style={inputStyle} />
                  <span style={hintStyle}>Customers enter this at checkout</span>
                </div>
                <div>
                  <label style={labelStyle}>Description (Optional)</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. 20% off for new users" style={inputStyle} />
                </div>
              </div>

              {/* Discount Type + Value */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
                <label style={labelStyle}>Discount Type</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  {[{ val: "flat", label: "₹ Flat Amount", icon: FiDollarSign }, { val: "percent", label: "% Percentage", icon: FiPercent }].map(({ val, label, icon: Icon }) => (
                    <button key={val} type="button" onClick={() => setForm({ ...form, discountType: val })}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 8, border: `2px solid ${form.discountType === val ? "var(--primary)" : "var(--border)"}`, background: form.discountType === val ? "var(--primary)" : "var(--surface)", color: form.discountType === val ? "#fff" : "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: form.discountType === "percent" ? "1fr 1fr" : "1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>{form.discountType === "percent" ? "Discount %" : "Discount Amount (₹)"} *</label>
                    <input required type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder={form.discountType === "percent" ? "e.g. 15" : "e.g. 200"} style={{ ...inputStyle, fontWeight: 800, color: "#16a34a" }} />
                  </div>
                  {form.discountType === "percent" && (
                    <div>
                      <label style={labelStyle}>Max Discount Cap (₹)</label>
                      <input type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        placeholder="e.g. 500 (optional)" style={inputStyle} />
                      <span style={hintStyle}>Leave blank for no cap</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Min Order + Expiry */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Min Order Value (₹)</label>
                  <input type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    placeholder="e.g. 999" style={inputStyle} />
                  <span style={hintStyle}>0 = no minimum</span>
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date & Time</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
                  <span style={hintStyle}>Leave blank = never expires</span>
                </div>
              </div>

              {/* Usage Limits */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Total Usage Limit</label>
                  <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="e.g. 100" style={inputStyle} />
                  <span style={hintStyle}>Leave blank = unlimited</span>
                </div>
                <div>
                  <label style={labelStyle}>Per User Limit</label>
                  <input type="number" min="1" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) })}
                    placeholder="e.g. 1" style={inputStyle} />
                  <span style={hintStyle}>How many times one user can use</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "block" }}>Active Status</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Inactive coupons cannot be applied by customers</span>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: "absolute", inset: 0, background: form.isActive ? "#16a34a" : "#cbd5e1", borderRadius: 20, transition: "0.2s" }}>
                    <span style={{ position: "absolute", height: 18, width: 18, left: form.isActive ? 23 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.2s" }} />
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, background: "var(--primary)", color: "#fff", border: "none", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "13px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 400, background: "var(--surface)", borderRadius: 14, padding: "28px 30px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>Delete Coupon?</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 20px" }}>
              Are you sure you want to delete <strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>{deleteConfirm.code}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(deleteConfirm.id)} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Yes, Delete</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {statsModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) { setStatsModal(null); setStatsData(null); } }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 520, background: "var(--surface)", borderRadius: 14, padding: "28px 30px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => { setStatsModal(null); setStatsData(null); }} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><FiX size={20} /></button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>📊 Coupon Stats</h3>
            <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 20, color: "var(--primary)", marginBottom: 20 }}>{statsModal.code}</div>
            {!statsData ? (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: 20 }}>Loading...</div>
            ) : statsData.error ? (
              <div style={{ color: "#ef4444" }}>Failed to load stats</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Total Uses", value: statsData.usages?.length || 0 },
                    { label: "Total Saved", value: `₹${Number(statsData.totalDiscount || 0).toLocaleString()}` },
                    { label: "Unique Users", value: new Set(statsData.usages?.map((u) => u.userEmail || u.userId)).size },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "var(--bg)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{value}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {statsData.usages?.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Recent Usage</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                      {statsData.usages.slice(0, 20).map((u) => (
                        <div key={u.id} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{u.userEmail || u.userId || "Guest"}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{u.orderId || "—"} · {new Date(u.usedAt).toLocaleDateString("en-IN")}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>-₹{Number(u.discountApplied).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No usage recorded yet</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "var(--bg)", border: "1px solid var(--border)", padding: "11px 14px", borderRadius: 6, color: "var(--text)", outline: "none", fontSize: 14 };
const hintStyle = { fontSize: 10, color: "var(--muted)", marginTop: 3, display: "block" };
