import { useEffect, useState } from "react";
import axios from "axios";

const ORDERS_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders`;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAdminOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ORDERS_API}/admin/all`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await axios.patch(`${ORDERS_API}/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by search query (Order ID, Name, Phone) and Status
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const orderIdStr = o.orderId ? o.orderId.toLowerCase() : "";
    const orderNumStr = o.orderNumber ? String(o.orderNumber) : "";
    const nameStr = o.shippingAddress?.fullName?.toLowerCase() || "";
    const phoneStr = o.shippingAddress?.phone || "";

    const matchesQ =
      !q ||
      orderIdStr.includes(q) ||
      orderNumStr.includes(q) ||
      nameStr.includes(q) ||
      phoneStr.includes(q);

    const matchesStatus =
      statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesQ && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-1">
                AVORA Customer Orders Hub
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
                All Customer Orders (Order ID Management)
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] font-light">
                Search and manage customer orders by unique sequential Order ID (e.g. AVR-1001, AVR-1002). Track delivery details and update status live.
              </p>
            </div>

            <button
              onClick={fetchAdminOrders}
              className="px-5 py-3 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              🔄 Refresh Orders
            </button>
          </div>
        </section>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Orders</p>
            <p className="text-2xl font-bold text-[var(--primary)] mt-1">{orders.length} Orders</p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-[#c86f49] mt-1">₹{totalRevenue.toLocaleString()}</p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Pending / New</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} Pending</p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Shipped &amp; Delivered</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{shippedCount + deliveredCount} Fulfilled</p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Box */}
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="🔍 Search by Order ID (e.g. AVR-1001), Customer Name, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2.5 text-xs md:text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mr-2">Filter Status:</span>
              {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border transition ${
                    statusFilter === st
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Orders List */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
          <h2 className="text-base font-bold text-[var(--text)] uppercase tracking-wider pb-3 border-b border-[var(--border)]">
            Orders List ({filteredOrders.length})
          </h2>

          {loading ? (
            <div className="py-16 text-center text-xs text-[var(--muted)] uppercase tracking-widest">
              Loading orders from database...
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const isUpdating = updatingId === order.id;
                return (
                  <div
                    key={order.id}
                    className="border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6 space-y-4 hover:border-[var(--primary)] transition-all"
                  >
                    {/* Top Bar: Order ID Badge, Status & Date */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-[var(--border)] pb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#c86f49] text-white font-mono text-sm md:text-base font-bold px-3 py-1 tracking-wider shadow-sm">
                          🆔 {order.orderId || `AVR-${order.orderNumber || '1000'}`}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          📅 {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[var(--muted)] uppercase">Status:</span>
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : order.status === "confirmed"
                              ? "bg-purple-50 text-purple-700 border-purple-300"
                              : order.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="confirmed">✅ Confirmed</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">🎉 Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Middle Section: Customer & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--surface)] p-4 border border-[var(--border)] text-xs">
                      <div>
                        <p className="font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Customer Name</p>
                        <p className="font-bold text-sm text-[var(--text)] uppercase">
                          👤 {order.shippingAddress?.fullName || "Guest Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="font-mono font-bold text-sm text-[var(--primary)]">
                          📞 {order.shippingAddress?.phone || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Delivery Address</p>
                        <p className="text-[var(--text)] font-medium">
                          📍 {order.shippingAddress?.addressLine1 || ""}{" "}
                          {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}{" "}
                          {order.shippingAddress?.pincode ? `- ${order.shippingAddress.pincode}` : ""}
                        </p>
                        {order.shippingAddress?.note && (
                          <p className="text-amber-700 font-semibold mt-1">
                            Note: {order.shippingAddress.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Purchased Products Table */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Items Ordered:</p>
                      <div className="border border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--surface)]">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-10 h-12 object-cover border border-[var(--border)]"
                                />
                              )}
                              <div>
                                <p className="font-bold text-[var(--text)] uppercase">{item.productName}</p>
                                {item.size && (
                                  <span className="inline-block bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)] mt-1">
                                    Size: {item.size}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-[var(--muted)]">
                                ₹{item.price} × {item.quantity}
                              </p>
                              <p className="font-bold text-[var(--primary)] mt-0.5">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Total Amount Bar */}
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--border)] text-xs md:text-sm">
                      <span className="text-[var(--muted)] font-semibold uppercase tracking-wider">
                        Total Amount Payable:
                      </span>
                      <span className="text-xl font-bold text-[#c86f49]">
                        ₹{Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-[var(--muted)] border border-dashed border-[var(--border)]">
              <p className="text-base font-semibold uppercase tracking-wider mb-1">No Orders Found</p>
              <p className="text-xs">No customer orders matching your Order ID or search filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
