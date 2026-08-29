import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const ORDERS_API = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/orders`;

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const TABS = [
  { key: "pending",          label: "Pending",          color: "#4b5563", bg: "#f3f4f6", next: "confirmed",        nextLabel: "Confirm Orders" },
  { key: "confirmed",        label: "Confirmed",        color: "#4b5563", bg: "#f3f4f6", next: "packed",           nextLabel: "Mark as Packed" },
  { key: "packed",           label: "Packed",           color: "#4b5563", bg: "#f3f4f6", next: "dispatched",       nextLabel: "Dispatch Orders" },
  { key: "dispatched",       label: "Dispatched",       color: "#4b5563", bg: "#f3f4f6", next: "out_for_delivery", nextLabel: "Out for Delivery" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "#4b5563", bg: "#f3f4f6", next: "delivered",        nextLabel: "Mark Delivered" },
  { key: "delivered",        label: "Delivered",        color: "#111827", bg: "#e5e7eb", next: null,               nextLabel: null },
  { key: "cancelled",        label: "Cancelled",        color: "#111827", bg: "#e5e7eb", next: null,               nextLabel: null },
];

const TAB_MAP = Object.fromEntries(TABS.map(t => [t.key, t]));

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fmtAmount = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const getDisplayOrderId = (o) => {
  return o.orderId || (o.orderNumber ? `AVR-${o.orderNumber}` : `#${o.id?.slice(0, 8).toUpperCase()}`);
};

function StatusPill({ status }) {
  const t = TAB_MAP[status] || { color: "#4b5563", bg: "#f3f4f6", label: status };
  return (
    <span style={{
      background: t.bg, color: t.color,
      border: `1px solid ${t.color}40`,
      padding: "3px 10px", fontSize: 11, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.06em",
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
    }}>
      {t.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   AWB DISPATCH MODAL (shown for Packed → Dispatch)
───────────────────────────────────────────── */
function DispatchModal({ orders, onConfirm, onCancel, loading }) {
  const [awbMap, setAwbMap] = useState(() =>
    Object.fromEntries(orders.map(o => [o.id, o.awbNumber || ""]))
  );
  const [estDate, setEstDate] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto",
        padding: 28,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>
          🚀 Assign AWB & Dispatch
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px" }}>
          Assign AWB numbers from Delivery Limited for each selected order before dispatching.
        </p>

        {/* Global estimated delivery */}
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
            Estimated Delivery Date (applies to all)
          </label>
          <input
            type="date"
            value={estDate}
            onChange={e => setEstDate(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "10px 12px", color: "var(--text)", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Per-order AWB inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {orders.map(o => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", fontFamily: "monospace", margin: 0 }}>
                  {getDisplayOrderId(o)}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0" }}>
                  {o.shippingAddress?.fullName} · {o.shippingAddress?.city}
                </p>
              </div>
              <input
                type="text"
                placeholder="AWB Number"
                value={awbMap[o.id] || ""}
                onChange={e => setAwbMap(p => ({ ...p, [o.id]: e.target.value }))}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  padding: "8px 12px", fontSize: 13, fontFamily: "monospace",
                  color: "var(--text)", outline: "none", width: 180, flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onConfirm(awbMap, estDate)}
            disabled={loading}
            style={{
              flex: 1, background: "var(--primary)", color: "#fff", border: "none",
              padding: "13px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Dispatching…" : "🚀 Confirm Dispatch"}
          </button>
          <button
            onClick={onCancel}
            style={{ padding: "13px 20px", background: "transparent", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ORDER DETAIL DRAWER (expandable row)
───────────────────────────────────────────── */
function OrderDetailRow({ order, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, background: "var(--surface)" }}>
        <div style={{ padding: "14px 20px 16px", borderBottom: "2px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Items */}
            <div style={{ flex: 2, minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Items Ordered</p>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.productName} style={{ width: 36, height: 44, objectFit: "cover", border: "1px solid var(--border)" }} />}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: 0 }}>{item.productName}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
                      {item.size ? `Size: ${item.size} · ` : ""}Qty: {item.quantity} · ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Delivery Address</p>
              <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                {order.shippingAddress?.addressLine1}<br />
                {order.shippingAddress?.city} - {order.shippingAddress?.pincode}<br />
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>📞 {order.shippingAddress?.phone}</span>
              </p>
              {order.shippingAddress?.note && (
                <p style={{ fontSize: 11, color: "#d97706", fontWeight: 600, marginTop: 6 }}>Note: {order.shippingAddress.note}</p>
              )}
            </div>

            {/* Tracking */}
            {order.awbNumber && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Courier Info</p>
                <p style={{ fontSize: 12, color: "var(--text)", margin: 0 }}>
                  🚚 Delivery Limited<br />
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#6366f1" }}>{order.awbNumber}</span>
                </p>
                {order.estimatedDelivery && (
                  <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 4 }}>
                    Est: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            )}

            {/* Tracking history (last 3) */}
            {Array.isArray(order.trackingHistory) && order.trackingHistory.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Recent Activity</p>
                {[...order.trackingHistory].reverse().slice(0, 3).map((evt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "var(--primary)" : "var(--border)", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", margin: 0, textTransform: "uppercase" }}>{evt.status?.replace(/_/g, " ")}</p>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontFamily: "monospace" }}>
                        {new Date(evt.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ORDERS_API}/admin/all`);
      setOrders(res.data || []);
    } catch (err) {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Reset selection when tab changes
  useEffect(() => {
    setSelected(new Set());
    setExpandedRows(new Set());
  }, [activeTab]);

  /* ── Filtered orders for current tab ── */
  const tabOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(o => {
      if (o.status !== activeTab) return false;
      if (!q) return true;
      const displayId = getDisplayOrderId(o).toLowerCase();
      return (
        displayId.includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.includes(q) ||
        o.awbNumber?.toLowerCase().includes(q)
      );
    });
  }, [orders, activeTab, searchQuery]);

  /* ── Tab counts ── */
  const counts = useMemo(() =>
    Object.fromEntries(TABS.map(t => [t.key, orders.filter(o => o.status === t.key).length])),
    [orders]
  );

  /* ── Select / Deselect ── */
  const isAllSelected = tabOrders.length > 0 && tabOrders.every(o => selected.has(o.id));
  const toggleAll = () => {
    if (isAllSelected) setSelected(new Set());
    else setSelected(new Set(tabOrders.map(o => o.id)));
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleExpand = (id) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  const selectedOrders = tabOrders.filter(o => selected.has(o.id));

  /* ── Bulk Status Change ── */
  const handleBulkAction = async () => {
    const tab = TAB_MAP[activeTab];
    if (!tab?.next || selectedOrders.length === 0) return;

    // Special case: Packed → Dispatched needs AWB
    if (activeTab === "packed") {
      setShowDispatchModal(true);
      return;
    }

    if (!window.confirm(`Move ${selectedOrders.length} order(s) to "${tab.next.replace(/_/g, " ")}"?`)) return;

    try {
      setActionLoading(true);
      await Promise.all(
        selectedOrders.map(o =>
          axios.patch(`${ORDERS_API}/${o.id}/status`, { status: tab.next })
        )
      );
      // Update local state
      setOrders(prev => prev.map(o =>
        selected.has(o.id) ? { ...o, status: tab.next } : o
      ));
      setSelected(new Set());
      showToast(`✅ ${selectedOrders.length} order(s) moved to ${tab.next.replace(/_/g, " ")}`);
    } catch (err) {
      showToast("Failed to update orders", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Dispatch with AWB ── */
  const handleDispatch = async (awbMap, estDate) => {
    try {
      setActionLoading(true);
      await Promise.all(
        selectedOrders.map(async o => {
          // Assign AWB if provided
          const awb = awbMap[o.id]?.trim();
          if (awb) {
            await axios.patch(`${ORDERS_API}/${o.id}/tracking`, {
              awbNumber: awb,
              estimatedDelivery: estDate || undefined,
            });
          }
          // Update status to dispatched
          await axios.patch(`${ORDERS_API}/${o.id}/status`, { status: "dispatched" });
        })
      );
      // Update local state
      setOrders(prev => prev.map(o =>
        selected.has(o.id) ? {
          ...o, status: "dispatched",
          awbNumber: awbMap[o.id]?.trim() || o.awbNumber,
          estimatedDelivery: estDate ? new Date(estDate) : o.estimatedDelivery,
        } : o
      ));
      setSelected(new Set());
      setShowDispatchModal(false);
      showToast(`🚀 ${selectedOrders.length} order(s) dispatched with Delivery Limited!`);
    } catch (err) {
      showToast("Failed to dispatch orders", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Single order quick action ── */
  const handleSingleAction = async (order) => {
    const tab = TAB_MAP[order.status];
    if (!tab?.next) return;
    try {
      await axios.patch(`${ORDERS_API}/${order.id}/status`, { status: tab.next });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: tab.next } : o));
      showToast(`Order ${order.orderId} → ${tab.next.replace(/_/g, " ")}`);
    } catch {
      showToast("Update failed", "error");
    }
  };

  const currentTab = TAB_MAP[activeTab];
  const hasAction = !!currentTab?.next;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "24px 0" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "var(--primary)",
          color: "#fff", padding: "12px 20px", fontSize: 14, fontWeight: 600,
          maxWidth: 360, boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          animation: "fadeIn 0.2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <DispatchModal
          orders={selectedOrders}
          onConfirm={handleDispatch}
          onCancel={() => setShowDispatchModal(false)}
          loading={actionLoading}
        />
      )}

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>
              AVORA × Delivery Limited
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>
              Order Management
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              {orders.length} total orders · ₹{totalRevenue.toLocaleString("en-IN")} revenue
            </p>
          </div>
          <button
            onClick={fetchOrders}
            style={{ background: "#111827", color: "#fff", border: "none", padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            Refresh Data
          </button>
        </div>

        {/* ── Summary Pills ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {TABS.map(t => (
            <div key={t.key} style={{ background: t.bg, border: `1px solid ${t.color}30`, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: t.color, display: "flex", alignItems: "center", gap: 6 }}>
              {t.label}
              <span style={{ background: t.color, color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                {counts[t.key] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "2px solid var(--border)", marginBottom: 0 }}>
          {TABS.map(t => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "12px 20px",
                  background: isActive ? "var(--surface)" : "transparent",
                  border: "none",
                  borderBottom: isActive ? `3px solid ${t.color}` : "3px solid transparent",
                  color: isActive ? t.color : "var(--muted)",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 7,
                  transition: "all 0.15s",
                  marginBottom: -2,
                }}
              >
                {t.label}
                {counts[t.key] > 0 && (
                  <span style={{
                    background: isActive ? t.color : "var(--border)",
                    color: isActive ? "#fff" : "var(--muted)",
                    borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800,
                  }}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content Panel ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "none" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Search order ID, name, phone, AWB…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  padding: "8px 14px", fontSize: 13, color: "var(--text)",
                  outline: "none", width: 260,
                }}
              />
              {selected.size > 0 && (
                <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>
                  {selected.size} selected
                </span>
              )}
            </div>

            {/* Bulk Action Button */}
            {hasAction && (
              <button
                onClick={handleBulkAction}
                disabled={selected.size === 0 || actionLoading}
                style={{
                  background: selected.size > 0 ? currentTab.color : "var(--border)",
                  color: selected.size > 0 ? "#fff" : "var(--muted)",
                  border: "none", padding: "10px 22px", fontSize: 13, fontWeight: 800,
                  cursor: selected.size > 0 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: actionLoading ? 0.7 : 1, letterSpacing: "0.02em",
                  transition: "background 0.15s",
                }}
              >
                {actionLoading ? "⏳ Processing…" : currentTab.nextLabel}
                {selected.size > 0 && !actionLoading && (
                  <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "1px 8px", fontSize: 11 }}>
                    {selected.size}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Loading orders…
            </div>
          ) : tabOrders.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
                No {currentTab.label} Orders
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                {activeTab === "pending" ? "All caught up! New orders will appear here." : `No orders in ${currentTab.label} status.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg)", borderBottom: "2px solid var(--border)" }}>
                    {/* Checkbox */}
                    <th style={{ width: 44, padding: "12px 16px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        style={{ width: 16, height: 16, cursor: "pointer", accentColor: currentTab.color }}
                      />
                    </th>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Items</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Date</th>
                    {["dispatched", "out_for_delivery", "delivered"].includes(activeTab) && (
                      <th style={thStyle}>AWB</th>
                    )}
                    {hasAction && <th style={{ ...thStyle, textAlign: "right" }}>Action</th>}
                    <th style={{ ...thStyle, textAlign: "center", width: 40 }}>↕</th>
                  </tr>
                </thead>
                <tbody>
                  {tabOrders.map((order, i) => {
                    const isChecked = selected.has(order.id);
                    const isExpanded = expandedRows.has(order.id);
                    const rowBg = isChecked
                      ? `${currentTab.color}10`
                      : i % 2 === 0 ? "var(--surface)" : "var(--bg)";

                    return (
                      <>
                        <tr
                          key={order.id}
                          style={{ background: rowBg, borderBottom: isExpanded ? "none" : "1px solid var(--border)", transition: "background 0.1s" }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleOne(order.id)}
                              style={{ width: 16, height: 16, cursor: "pointer", accentColor: currentTab.color }}
                            />
                          </td>

                          {/* Order ID */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <span style={{
                              background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "monospace",
                              fontSize: 12, fontWeight: 800, padding: "3px 8px", letterSpacing: "0.06em", borderRadius: 4
                            }}>
                              {getDisplayOrderId(order)}
                            </span>
                          </td>

                          {/* Customer */}
                          <td style={{ padding: "12px 14px" }}>
                            <p style={{ fontWeight: 700, color: "var(--text)", margin: 0, fontSize: 13 }}>
                              {order.shippingAddress?.fullName || "Guest"}
                            </p>
                            <p style={{ color: "var(--primary)", fontFamily: "monospace", fontSize: 11, margin: "2px 0 0", fontWeight: 600 }}>
                              📞 {order.shippingAddress?.phone}
                            </p>
                            <p style={{ color: "var(--muted)", fontSize: 11, margin: "1px 0 0" }}>
                              📍 {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                            </p>
                          </td>

                          {/* Items */}
                          <td style={{ padding: "12px 14px", maxWidth: 200 }}>
                            {(order.items || []).slice(0, 2).map((item, idx) => (
                              <p key={idx} style={{ margin: "0 0 2px", color: "var(--text)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                • {item.productName} {item.size ? `(${item.size})` : ""} ×{item.quantity}
                              </p>
                            ))}
                            {(order.items || []).length > 2 && (
                              <p style={{ color: "var(--muted)", fontSize: 11, margin: 0 }}>+{order.items.length - 2} more…</p>
                            )}
                          </td>

                          {/* Amount */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                              {fmtAmount(order.totalAmount)}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "12px 14px", whiteSpace: "nowrap", color: "var(--muted)", fontSize: 12 }}>
                            {fmtDate(order.createdAt)}
                          </td>

                          {/* AWB (for dispatched+ tabs) */}
                          {["dispatched", "out_for_delivery", "delivered"].includes(activeTab) && (
                            <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                              {order.awbNumber ? (
                                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#6366f1" }}>
                                  {order.awbNumber}
                                </span>
                              ) : (
                                <span style={{ color: "var(--muted)", fontSize: 11 }}>No AWB</span>
                              )}
                            </td>
                          )}

                          {/* Single Action Button */}
                          {hasAction && (
                            <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                              <button
                                onClick={() => {
                                  if (activeTab === "packed") {
                                    setSelected(new Set([order.id]));
                                    setShowDispatchModal(true);
                                  } else {
                                    handleSingleAction(order);
                                  }
                                }}
                                style={{
                                  background: currentTab.bg, color: currentTab.color,
                                  border: `1px solid ${currentTab.color}50`,
                                  padding: "5px 12px", fontSize: 11, fontWeight: 700,
                                  cursor: "pointer", whiteSpace: "nowrap",
                                }}
                              >
                                {currentTab.nextLabel}
                              </button>
                            </td>
                          )}

                          {/* Expand toggle */}
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <button
                              onClick={() => toggleExpand(order.id)}
                              style={{
                                background: "none", border: "1px solid var(--border)",
                                color: "var(--muted)", cursor: "pointer",
                                width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, transition: "transform 0.15s",
                                transform: isExpanded ? "rotate(180deg)" : "none",
                              }}
                            >
                              ▾
                            </button>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <OrderDetailRow
                            key={`${order.id}-detail`}
                            order={order}
                            colSpan={7 + (["dispatched", "out_for_delivery", "delivered"].includes(activeTab) ? 1 : 0) + (hasAction ? 1 : 0)}
                          />
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer */}
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)" }}>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                  Showing {tabOrders.length} {currentTab.label} order{tabOrders.length !== 1 ? "s" : ""}
                  {selected.size > 0 ? ` · ${selected.size} selected` : ""}
                </p>
                {hasAction && tabOrders.length > 0 && (
                  <button
                    onClick={toggleAll}
                    style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    {isAllSelected ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  whiteSpace: "nowrap",
};
