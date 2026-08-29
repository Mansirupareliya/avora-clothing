import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiUser, FiMapPin, FiHeart, FiPackage, FiCornerUpLeft,
  FiLock, FiLogOut, FiChevronRight, FiPlus, FiEdit2,
  FiTrash2, FiStar, FiCheck, FiEye, FiEyeOff, FiAlertCircle,
  FiCheckCircle, FiHome, FiX, FiArrowLeft, FiMenu,
  FiGift, FiCreditCard, FiClock
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Status badge ─── */
const statusMeta = {
  pending:   { bg: "#fff8e1", color: "#f59e0b" },
  confirmed: { bg: "#e8f5e9", color: "#22c55e" },
  shipped:   { bg: "#e3f2fd", color: "#3b82f6" },
  delivered: { bg: "#e8f5e9", color: "#16a34a" },
  cancelled: { bg: "#fce4ec", color: "#ef4444" },
  approved:  { bg: "#e8f5e9", color: "#16a34a" },
  rejected:  { bg: "#fce4ec", color: "#ef4444" },
  completed: { bg: "#e8f5e9", color: "#16a34a" },
};

const Badge = ({ status }) => {
  const s = statusMeta[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.color}40`,
      padding: "3px 10px",
      borderRadius: 0,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      display: "inline-block"
    }}>
      {status}
    </span>
  );
};

/* ─── Responsive Input ─── */
const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>}
    <input
      {...props}
      style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        padding: "12px 14px", color: "var(--text)", fontSize: 15,
        outline: "none", borderRadius: 6, width: "100%", boxSizing: "border-box",
        transition: "border 0.2s", WebkitAppearance: "none",
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = "var(--primary)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--border)"; }}
    />
  </div>
);

/* ─── Button ─── */
const Btn = ({ children, loading, variant = "primary", icon: Icon, fullWidth, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
      width: fullWidth ? "100%" : "auto",
      background: variant === "primary" ? "var(--primary)" : variant === "danger" ? "#ef4444" : "transparent",
      border: variant === "outline" ? "1px solid var(--border)" : "none",
      color: variant === "outline" ? "var(--text)" : "#fff",
      padding: "12px 22px", borderRadius: 6, fontSize: 14, fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.03em",
      opacity: loading ? 0.7 : 1, transition: "opacity 0.2s, box-shadow 0.2s",
      minHeight: 44, // touch target
      ...props.style,
    }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 14px rgba(33,45,67,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
  >
    {Icon && <Icon size={15} />}
    {loading ? "Please wait…" : children}
  </button>
);

/* ─── Toast ─── */
const Toast = ({ msg, type }) => msg ? (
  <div style={{
    position: "fixed", top: 16, right: 16, left: 16, zIndex: 9999,
    maxWidth: 380, margin: "0 auto",
    background: type === "error" ? "#ef4444" : "var(--primary)",
    color: "#fff", padding: "13px 18px", borderRadius: 10,
    fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    display: "flex", alignItems: "center", gap: 10,
    animation: "fadeInUp 0.3s ease",
  }}>
    {type === "error" ? <FiAlertCircle size={17} /> : <FiCheckCircle size={17} />}
    {msg}
  </div>
) : null;

/* ─── Empty State ─── */
const Empty = ({ icon: Icon, title, subtitle }) => (
  <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)" }}>
    <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
      <Icon size={28} style={{ color: "var(--muted)" }} />
    </div>
    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>{title}</p>
    <p style={{ fontSize: 13 }}>{subtitle}</p>
  </div>
);

/* ─── Mobile Card Row (replaces table on small screens) ─── */
const MobileCard = ({ children }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
    {children}
  </div>
);

/* ══════════════════════════════════════════════
   PROFILE
══════════════════════════════════════════════ */
function ProfileSection({ user, updateUser }) {
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await axios.patch(`${API}/user/profile`, form);
      updateUser(data);
      showToast("Profile updated successfully!");
    } catch { showToast("Failed to update profile", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>My Profile</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Manage your personal information</p>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
          <p style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
        <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Input label="Email Address" value={user?.email || ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Email cannot be changed</p>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <Btn loading={loading} onClick={save} icon={FiCheck} fullWidth>Save Changes</Btn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADDRESSES
══════════════════════════════════════════════ */
function AddressSection() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const blank = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", isDefault: false };
  const [form, setForm] = useState(blank);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    axios.get(`${API}/addresses`).then(r => { setAddresses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(blank); setEditId(null); setShowForm(true); };
  const openEdit = (a) => { setForm(a); setEditId(a.id); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editId) {
        const { data } = await axios.put(`${API}/addresses/${editId}`, form);
        setAddresses(prev => prev.map(a => a.id === editId ? data : a));
        showToast("Address updated!");
      } else {
        const { data } = await axios.post(`${API}/addresses`, form);
        setAddresses(prev => [...prev, data]);
        showToast("Address added!");
      }
      setShowForm(false);
    } catch { showToast("Failed to save address", "error"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this address?")) return;
    await axios.delete(`${API}/addresses/${id}`);
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast("Address removed");
  };

  const setDefault = async (id) => {
    await axios.patch(`${API}/addresses/${id}/default`);
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    showToast("Default address set!");
  };

  const F = (key) => ({ value: form[key] || "", onChange: e => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Addresses</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 3 }}>Manage your delivery addresses</p>
        </div>
        <Btn onClick={openAdd} icon={FiPlus}>Add New</Btn>
      </div>

      {showForm && (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, marginBottom: 20, animation: "fadeInUp 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{editId ? "Edit Address" : "New Address"}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}><FiX size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Input label="Full Name" {...F("fullName")} />
            <Input label="Phone" {...F("phone")} />
            <div style={{ gridColumn: "1 / -1" }}><Input label="Address Line 1" {...F("addressLine1")} /></div>
            <div style={{ gridColumn: "1 / -1" }}><Input label="Address Line 2 (optional)" {...F("addressLine2")} /></div>
            <Input label="City" {...F("city")} />
            <Input label="State" {...F("state")} />
            <Input label="Pincode" {...F("pincode")} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer", fontSize: 14, color: "var(--text)" }}>
            <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} style={{ width: 16, height: 16 }} />
            Set as default address
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <Btn loading={saving} onClick={save} icon={FiCheck}>Save Address</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>Loading addresses…</p>
      ) : addresses.length === 0 ? (
        <Empty icon={FiMapPin} title="No addresses saved" subtitle="Add a delivery address to get started" />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {addresses.map(a => (
            <div key={a.id} style={{ background: "var(--surface)", border: `1px solid ${a.isDefault ? "var(--primary)" : "var(--border)"}`, borderRadius: 10, padding: "16px", boxShadow: a.isDefault ? "0 0 0 2px rgba(33,45,67,0.07)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FiMapPin size={16} style={{ color: "var(--primary)" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {a.isDefault && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: 10, marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FiStar size={9} /> DEFAULT
                      </span>
                    )}
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: "4px 0 2px" }}>{a.fullName}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                      {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}<br />
                      {a.city}, {a.state} — {a.pincode}<br />
                      {a.phone}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                  <button onClick={() => openEdit(a)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                    <FiEdit2 size={12} /> Edit
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a.id)} style={{ background: "none", border: "none", color: "var(--accent-2)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                      <FiStar size={12} /> Default
                    </button>
                  )}
                  <button onClick={() => remove(a.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════════ */
function WishlistSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    axios.get(`${API}/wishlist`).then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    await axios.delete(`${API}/wishlist/${productId}`);
    setItems(prev => prev.filter(i => i.productId !== productId));
    showToast("Removed from wishlist");
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>My Wishlist</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 22 }}>Products you've saved</p>

      {loading ? <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>Loading wishlist…</p>
        : items.length === 0 ? <Empty icon={FiHeart} title="Your wishlist is empty" subtitle="Save products from the store to view them here" />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {items.map(item => (
              <div key={item.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ height: 140, overflow: "hidden", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <FiPackage size={36} style={{ color: "var(--muted)" }} />
                  }
                </div>
                <div style={{ padding: "12px" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 3, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.productName}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>₹{Number(item.price).toLocaleString()}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link to={`/store/${item.productId}`} style={{ flex: 1, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 5, padding: "8px 0", fontSize: 11, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <FiEye size={11} /> View
                    </Link>
                    <button onClick={() => remove(item.productId)} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 5, padding: "8px 10px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", minHeight: 36 }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   ORDER TRACKING TIMELINE (Modal)
══════════════════════════════════════════════ */
const TRACK_STEPS = [
  { key: "pending",          label: "Order Placed",      icon: "📋" },
  { key: "confirmed",        label: "Confirmed",         icon: "✅" },
  { key: "packed",           label: "Packed",            icon: "📦" },
  { key: "dispatched",       label: "Dispatched",        icon: "🚀" },
  { key: "out_for_delivery", label: "Out for Delivery",  icon: "🛵" },
  { key: "delivered",        label: "Delivered",         icon: "🎉" },
];
const TRACK_STATUS_ORDER = TRACK_STEPS.map((s) => s.key);

function TrackingModal({ order, onClose }) {
  const currentIdx = TRACK_STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const history = Array.isArray(order.trackingHistory) ? [...order.trackingHistory].reverse() : [];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg)", width: "100%", maxWidth: 680, maxHeight: "92vh",
          overflowY: "auto", borderRadius: "18px 18px 0 0",
          padding: "28px 24px 40px",
          animation: "slideUp 0.32s cubic-bezier(0.34,1.26,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, background: "var(--border)", borderRadius: 99 }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 4px" }}>
              🚚 Delivery Limited × Avora
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>
              Track Order · <span style={{ fontFamily: "monospace", color: "#c86f49" }}>{order.orderId || `AVR-${order.orderNumber}`}</span>
            </h3>
            {order.awbNumber && (
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                AWB: <span style={{ fontFamily: "monospace", background: "var(--surface)", border: "1px solid var(--border)", padding: "1px 8px", borderRadius: 4, color: "#6366f1", fontWeight: 700 }}>{order.awbNumber}</span>
              </p>
            )}
            {order.estimatedDelivery && !["delivered", "cancelled"].includes(order.status) && (
              <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, margin: "4px 0 0" }}>
                📅 Expected: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <FiX size={16} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        {/* Timeline */}
        {!isCancelled ? (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
              {TRACK_STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const matchedEvt = (order.trackingHistory || []).find((e) => e.status === step.key);
                return (
                  <div key={step.key} style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 72 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: done ? (active ? "var(--primary)" : "#22c55e") : "var(--surface)",
                        border: `3px solid ${done ? (active ? "var(--primary)" : "#22c55e") : "var(--border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0,
                        boxShadow: active ? "0 0 0 5px rgba(200,111,73,0.15)" : "none",
                        transition: "all 0.3s",
                      }}>
                        {done ? (active ? step.icon : "✅") : step.icon}
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", margin: "7px 0 0", color: done ? "var(--text)" : "var(--muted)", lineHeight: 1.3 }}>
                        {step.label}
                      </p>
                      {matchedEvt && (
                        <p style={{ fontSize: 9, color: "var(--muted)", fontFamily: "monospace", textAlign: "center", margin: "3px 0 0" }}>
                          {new Date(matchedEvt.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" "}{new Date(matchedEvt.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {matchedEvt?.location && (
                        <p style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, textAlign: "center", margin: "2px 0 0" }}>📍 {matchedEvt.location}</p>
                      )}
                    </div>
                    {i < TRACK_STEPS.length - 1 && (
                      <div style={{ height: 3, flex: 1, marginTop: 20, minWidth: 12, background: i < currentIdx ? "#22c55e" : "var(--border)", borderRadius: 99, transition: "background 0.4s" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "18px", marginBottom: 24, borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontSize: 28 }}>❌</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#b91c1c", textTransform: "uppercase" }}>Order Cancelled</p>
          </div>
        )}

        {/* Tracking History */}
        {history.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", margin: "0 0 18px" }}>
              📋 Tracking History
            </p>
            {history.map((evt, idx) => (
              <div key={idx} style={{ display: "flex", gap: 14, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 3, flexShrink: 0, background: idx === 0 ? "var(--primary)" : "var(--border)", border: `2px solid ${idx === 0 ? "var(--primary)" : "var(--border)"}` }} />
                  {idx < history.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", margin: "3px 0" }} />}
                </div>
                <div style={{ paddingBottom: 18, flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text)", margin: 0 }}>
                    {evt.status?.replace(/_/g, " ")}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: 12, margin: "3px 0 0" }}>{evt.message}</p>
                  {evt.location && <p style={{ color: "#6366f1", fontSize: 11, fontWeight: 600, margin: "2px 0 0" }}>📍 {evt.location}</p>}
                  <p style={{ color: "var(--muted)", fontSize: 11, fontFamily: "monospace", margin: "3px 0 0" }}>
                    {new Date(evt.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address */}
        {order.shippingAddress && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", fontSize: 13 }}>
            <p style={{ fontWeight: 700, color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Delivering to</p>
            <p style={{ fontWeight: 600, color: "var(--text)", margin: 0 }}>
              {order.shippingAddress.fullName} — {order.shippingAddress.addressLine1}, {order.shippingAddress.city} {order.shippingAddress.pincode}
            </p>
            <p style={{ color: "var(--muted)", fontSize: 12, margin: "4px 0 0" }}>📞 {order.shippingAddress.phone}</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Single Order Card ── */
function OrderCard({ order, displayOrderId }) {
  const [showTracking, setShowTracking] = useState(false);
  return (
    <>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 0,
          padding: 18,
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ background: "#c86f49", color: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: 0, letterSpacing: "0.05em" }}>
                🆔 {displayOrderId}
              </span>
              <Badge status={order.status || "pending"} />
              <span style={{ background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4338ca", fontSize: 10, fontWeight: 700, padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
                🚚 Delivery Limited{order.awbNumber ? ` · ${order.awbNumber}` : ""}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, margin: "6px 0 0" }}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            {order.estimatedDelivery && !["delivered", "cancelled"].includes(order.status) && (
              <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, margin: "3px 0 0" }}>
                📅 Expected by {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </p>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, margin: "0 0 2px" }}>Total Amount</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#c86f49", margin: 0 }}>₹{Number(order.totalAmount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {(order.items || []).map((item, idx) => (
            <div key={idx} style={{ display: "flex", items: "center", justifyContent: "space-between", gap: 12, background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.productName} style={{ width: 42, height: 50, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                )}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>{item.productName}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
                    {item.size ? `Size: ${item.size} • ` : ""}Qty: {item.quantity}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                ₹{Number(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          {order.shippingAddress && (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              📍 <strong style={{ color: "var(--text)" }}>{order.shippingAddress.fullName}</strong>{" "}
              ({order.shippingAddress.city} - {order.shippingAddress.pincode})
            </div>
          )}

          <button
            onClick={() => setShowTracking(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg, #4338ca, #6366f1)",
              color: "#fff", border: "none", padding: "9px 18px",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer",
              borderRadius: 6, transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            📍 Track Order
          </button>
        </div>
      </div>

      {showTracking && <TrackingModal order={order} onClose={() => setShowTracking(false)} />}
    </>
  );
}

/* ══════════════════════════════════════════════
   ORDERS
══════════════════════════════════════════════ */
function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      let remoteOrders = [];
      try {
        const res = await axios.get(`${API}/orders`);
        remoteOrders = res.data || [];
      } catch (e) {}

      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('avora_local_orders') || '[]');
      } catch (e) {}

      const map = new Map();
      // Process local first, then overwrite with remote so backend data (fresh status/IDs) takes precedence
      [...localOrders, ...remoteOrders].forEach((o) => {
        const key = o.id || o.orderId;
        if (key && !map.has(key)) {
          map.set(key, o);
        } else if (key && map.has(key)) {
          // If already exists, overwrite it because remote comes later and is fresher
          map.set(key, o);
        }
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(combined);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>My Orders</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>View your complete order history and track order delivery status</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--surface)", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: 20 }}>
          {orders.length} Orders
        </span>
      </div>

      {loading ? <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>Loading orders…</p>
        : orders.length === 0 ? <Empty icon={FiPackage} title="No orders yet" subtitle="Your orders will appear here after purchase" />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((o) => {
              const displayOrderId = o.orderId || (o.orderNumber ? `AVR-${o.orderNumber}` : `#${o.id?.slice(0, 8).toUpperCase()}`);
              return (
                <OrderCard key={o.id || o.orderId} order={o} displayOrderId={displayOrderId} />
              );
            })}
          </div>
        )}
    </div>
  );
}


/* ══════════════════════════════════════════════
   RETURNS
══════════════════════════════════════════════ */
function ReturnsSection() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    axios.get(`${API}/returns`).then(r => { setReturns(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!form.orderId || !form.reason) { showToast("Please fill all fields", "error"); return; }
    setSaving(true);
    try {
      const { data } = await axios.post(`${API}/returns`, form);
      setReturns(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ orderId: "", reason: "" });
      showToast("Return request submitted!");
    } catch { showToast("Failed to submit return", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>My Returns</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 3 }}>Track your return requests</p>
        </div>
        <Btn onClick={() => setShowForm(!showForm)} icon={FiPlus}>New Request</Btn>
      </div>

      {showForm && (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, marginBottom: 20, animation: "fadeInUp 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Submit Return Request</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}><FiX size={18} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Order ID" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="Paste your Order ID" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reason</label>
              <textarea
                value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Describe the reason for return…" rows={3}
                style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px", color: "var(--text)", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", minHeight: 80 }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Btn loading={saving} onClick={submit} icon={FiCheck}>Submit Request</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>Loading returns…</p>
        : returns.length === 0 ? <Empty icon={FiCornerUpLeft} title="No return requests" subtitle="Submit a return request if you need to return an order" />
        : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["#", "Order ID", "Date", "Reason", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg)" }}>
                      <td style={{ padding: "12px 14px", color: "var(--muted)", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--primary)", fontFamily: "monospace", fontSize: 12 }}>#{r.orderId?.slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: "12px 14px", color: "var(--muted)" }}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</td>
                      <td style={{ padding: "12px 14px" }}><Badge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden">
              {returns.map((r, i) => (
                <MobileCard key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 12, color: "var(--primary)", fontFamily: "monospace" }}>#{r.orderId?.slice(0, 8).toUpperCase()}</p>
                      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <Badge status={r.status} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>{r.reason}</p>
                </MobileCard>
              ))}
            </div>
          </>
        )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECURITY
══════════════════════════════════════════════ */
function SecuritySection() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ curr: false, newP: false, conf: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { showToast("New passwords do not match", "error"); return; }
    if (form.newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setLoading(true);
    try {
      await axios.patch(`${API}/user/change-password`, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      showToast("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setLoading(false); }
  };

  const PwdField = ({ label, name, showKey }) => (
    <div style={{ position: "relative" }}>
      <Input
        label={label}
        type={show[showKey] ? "text" : "password"}
        value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
        placeholder="••••••••" required
      />
      <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
        style={{ position: "absolute", right: 12, bottom: 12, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
        {show[showKey] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Security</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Change your account password</p>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", maxWidth: 440, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiLock size={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>Change Password</p>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Use a strong, unique password</p>
          </div>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PwdField label="Current Password" name="currentPassword" showKey="curr" />
          <PwdField label="New Password" name="newPassword" showKey="newP" />
          <PwdField label="Confirm New Password" name="confirmPassword" showKey="conf" />
          <Btn loading={loading} icon={FiLock} style={{ marginTop: 6 }} fullWidth>Update Password</Btn>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SHOPPING CREDITS / WALLET
══════════════════════════════════════════════ */
function CreditsSection({ user }) {
  const [credits, setCredits] = useState([]);
  const [promoConfig, setPromoConfig] = useState({
    minTriggerSpend: 5000,
    rewardAmount: 1500,
    minRedeemOrderValue: 6000,
    expiryDays: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creditsRes, configRes] = await Promise.all([
          axios.get(`${API}/shopping-credits/user`, {
            params: { userId: user?.id, userEmail: user?.email },
          }),
          axios.get(`${API}/shopping-credits/config`),
        ]);
        setCredits(creditsRes.data || []);
        if (configRes.data) setPromoConfig(configRes.data);
      } catch (err) {
        console.error("Failed to fetch shopping credits data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeCredits = credits.filter((c) => c.status === "active" && new Date(c.expiresAt) > new Date());
  const activeBalance = activeCredits.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const statusBadges = {
    active: { bg: "#e8f5e9", color: "#16a34a", label: "Active" },
    used: { bg: "#e3f2fd", color: "#2563eb", label: "Used" },
    expired: { bg: "#fef3c7", color: "#d97706", label: "Expired" },
    cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>
            Shopping Credits Wallet
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
            Earn ₹{Number(promoConfig.rewardAmount).toLocaleString()} credit on every purchase worth ₹{Number(promoConfig.minTriggerSpend).toLocaleString()} or more
          </p>
        </div>

        <Link
          to="/store"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--primary)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Redeem Credit →
        </Link>
      </div>

      {/* Luxury Wallet Active Balance Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          borderRadius: 14,
          padding: "24px 28px",
          color: "#fff",
          marginBottom: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
            Available Wallet Balance
          </p>
          <p style={{ fontSize: 34, fontWeight: 800, color: "#4ade80", margin: "0 0 4px" }}>
            ₹{activeBalance.toLocaleString()}
          </p>
          <p style={{ fontSize: 12, color: "#cbd5e1", margin: 0 }}>
            {activeCredits.length} Active Shopping Credit{activeCredits.length === 1 ? "" : "s"} Available
          </p>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px dashed rgba(212, 175, 55, 0.4)",
            borderRadius: 10,
            padding: "12px 18px",
            fontSize: 12,
            color: "#fbbf24",
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          💡 <strong>How to Redeem:</strong> Apply your ₹2,000 credit during checkout on any order of ₹6,000 or more!
        </div>
      </div>

      {/* Credit History Table / List */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
        Your Promotional Credits History
      </h3>

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 32 }}>Loading shopping credits…</p>
      ) : credits.length === 0 ? (
        <Empty
          icon={FiGift}
          title="No Shopping Credits Yet"
          subtitle="Place an order of ₹5,000 or more to unlock an automatic ₹2,000 Shopping Credit!"
        />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {credits.map((c) => {
            const badge = statusBadges[c.status] || { bg: "#f3f4f6", color: "#6b7280", label: c.status };
            const isExpired = c.status === "active" && new Date(c.expiresAt) < new Date();
            const currentBadge = isExpired ? statusBadges.expired : badge;

            return (
              <div
                key={c.id || c.code}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: c.status === "active" && !isExpired ? "rgba(34, 197, 94, 0.1)" : "var(--bg)",
                      color: c.status === "active" && !isExpired ? "#16a34a" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiGift size={24} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>
                        ₹{Number(c.amount).toLocaleString()} Shopping Credit
                      </span>
                      <span
                        style={{
                          background: currentBadge.bg,
                          color: currentBadge.color,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {currentBadge.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>Code: <strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>{c.code}</strong></span>
                      <span>• Min Order: <strong>₹{Number(c.minOrderValue).toLocaleString()}</strong></span>
                      {c.originOrderId && <span>• Earned on: #{c.originOrderId}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, margin: "0 0 2px" }}>
                    Expiry Date
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: c.status === "active" && !isExpired ? "#c86f49" : "var(--muted)", margin: 0, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <FiClock size={13} />
                    {new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promotional Terms & Conditions Card */}
      <div
        style={{
          marginTop: 32,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px 24px",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ fontWeight: 700, color: "var(--text)", fontSize: 13, marginBottom: 8 }}>
          📌 Promotional Shopping Credit Terms:
        </p>
        <ul style={{ paddingLeft: 18, margin: 0, spaceY: 4 }}>
          <li>Every order of <strong>₹{Number(promoConfig.minTriggerSpend).toLocaleString()} or more</strong> automatically unlocks a <strong>₹{Number(promoConfig.rewardAmount).toLocaleString()} Shopping Credit</strong> for your next purchase.</li>
          <li>Shopping Credit is non-instant cash discount and can only be redeemed on your <strong>next order</strong>.</li>
          <li>Minimum order value to redeem credit is <strong>₹{Number(promoConfig.minRedeemOrderValue).toLocaleString()}</strong>.</li>
          <li>Each Shopping Credit is valid for <strong>{promoConfig.expiryDays} days</strong> from the date of issuance.</li>
          <li>Only <strong>one Shopping Credit</strong> can be used per order. Credits cannot be combined, transferred, or exchanged for cash.</li>
        </ul>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN: AccountDashboard
══════════════════════════════════════════════ */
const NAV_ITEMS = [
  { key: "profile",   icon: FiUser,         label: "Profile" },
  { key: "credits",   icon: FiGift,         label: "Shopping Credits" },
  { key: "addresses", icon: FiMapPin,        label: "Addresses" },
  { key: "wishlist",  icon: FiHeart,         label: "Wishlist" },
  { key: "orders",    icon: FiPackage,       label: "Orders" },
  { key: "returns",   icon: FiCornerUpLeft,  label: "Returns" },
  { key: "security",  icon: FiLock,          label: "Security" },
];

export default function AccountDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(location.state?.section || "profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.state?.section) {
      setActive(location.state.section);
    }
  }, [location.state]);

  useEffect(() => { if (!user) navigate("/store/login"); }, [user]);
  if (!user) return null;

  const renderSection = () => {
    switch (active) {
      case "profile":   return <ProfileSection user={user} updateUser={updateUser} />;
      case "credits":   return <CreditsSection user={user} />;
      case "addresses": return <AddressSection />;
      case "wishlist":  return <WishlistSection />;
      case "orders":    return <OrdersSection />;
      case "returns":   return <ReturnsSection />;
      case "security":  return <SecuritySection />;
      default:          return null;
    }
  };

  const activeNav = NAV_ITEMS.find(n => n.key === active);

  const handleNavClick = (key) => {
    setActive(key);
    setSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      {/* Same container as all other store pages */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40, backdropFilter: "blur(2px)" }}
        />
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ══ Sidebar ══ */}
        <aside style={{
          width: 230, flexShrink: 0,
          background: "var(--surface)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          // Mobile: slide in from left as drawer
          position: "fixed", top: 0, left: 0, height: "100%", zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
          // Desktop: always visible
        }}
          className="lg:translate-x-0 lg:static lg:h-auto lg:z-auto lg:transition-none"
        >
          {/* User banner */}
          <div style={{ padding: "24px 20px 18px", background: "var(--primary)", color: "#fff", flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#fff", display: "flex" }}>
              <FiX size={16} />
            </button>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.65, margin: "0 0 2px" }}>Welcome,</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{user.name.split(" ")[0]}!</p>
            <p style={{ fontSize: 11, opacity: 0.5, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 0" }}>
            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
              const isActive = active === key;
              return (
                <button key={key} onClick={() => handleNavClick(key)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "12px 20px",
                  background: isActive ? "rgba(33,45,67,0.07)" : "none", border: "none",
                  borderLeft: `3px solid ${isActive ? "var(--primary)" : "transparent"}`,
                  color: isActive ? "var(--primary)" : "var(--text)",
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <FiChevronRight size={13} style={{ opacity: 0.4 }} />}
                </button>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "10px 0 20px", flexShrink: 0 }}>
            <Link to="/store" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
              <FiHome size={15} /> Back to Store
            </Link>
            <button onClick={() => { logout(); navigate("/store"); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 20px", background: "none", border: "none", color: "#ef4444", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <FiLogOut size={15} /> Logout
            </button>
          </div>
        </aside>

        {/* ══ Main content ══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* ── Mobile top bar ── */}
          <div className="lg:hidden" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", background: "var(--surface)",
            borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30,
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center" }}>
              <FiMenu size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              {activeNav && <activeNav.icon size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />}
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeNav?.label}</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* ── Page content ── */}
          <main style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }} className="md:p-8 lg:p-10">
            {/* Desktop breadcrumb */}
            <div className="desktop-only-flex" style={{ alignItems: "center", gap: 6, marginBottom: 28, fontSize: 12, color: "var(--muted)" }}>
              <Link to="/store" style={{ color: "var(--muted)", textDecoration: "none" }}>Store</Link>
              <FiChevronRight size={12} />
              <span style={{ color: "var(--text)", fontWeight: 600 }}>My Account</span>
              <FiChevronRight size={12} />
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>{activeNav?.label}</span>
            </div>

            <div style={{ animation: "fadeInUp 0.25s ease", maxWidth: 860 }}>
              {renderSection()}
            </div>
          </main>

          {/* ── Mobile bottom tab bar ── */}
          <div className="lg:hidden" style={{
            display: "flex", alignItems: "center",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            position: "sticky", bottom: 0, zIndex: 30,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
              const isActive = active === key;
              return (
                <button key={key} onClick={() => setActive(key)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 3, padding: "10px 4px",
                  background: "none", border: "none", cursor: "pointer",
                  color: isActive ? "var(--primary)" : "var(--muted)",
                  transition: "color 0.15s",
                }}>
                  <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: "0.04em", lineHeight: 1 }}>
                    {label.split(" ").pop()}
                  </span>
                  {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", marginTop: 1 }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop static sidebar layout override */}
      <style>{`
        @media (min-width: 1024px) {
          .lg\\:translate-x-0 { transform: translateX(0) !important; }
          .lg\\:static { position: sticky !important; top: 0 !important; height: 100vh !important; }
          .lg\\:z-auto { z-index: auto !important; }
          .lg\\:transition-none { transition: none !important; }
          .lg\\:hidden { display: none !important; }
          .lg\\:flex { display: flex !important; }
          .md\\:p-8 { padding: 32px !important; }
          .lg\\:p-10 { padding: 40px !important; }
        }
        @media (min-width: 768px) {
          .md\\:block { display: block !important; }
          .md\\:hidden { display: none !important; }
          .md\\:p-8 { padding: 32px !important; }
        }
        .desktop-only-flex { display: none; }
        @media (min-width: 1024px) {
          .desktop-only-flex { display: flex !important; }
        }
      `}</style>
      </div>{/* end max-w-6xl container */}
    </div>
  );
}
