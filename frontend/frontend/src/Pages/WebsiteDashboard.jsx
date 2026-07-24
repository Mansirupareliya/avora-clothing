import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;
const ANALYTICS_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/analytics/dashboard`;

export default function WebsiteDashboard() {
  const [productsAnalytics, setProductsAnalytics] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [totals, setTotals] = useState({ totalViews: 0, totalClicks: 0, totalOrders: 0, totalSales: 0, conversionRate: "0" });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredHour, setHoveredHour] = useState(null);

  // Active Metric Toggles for Graph
  const [showViewsBar, setShowViewsBar] = useState(true);
  const [showOrdersLine, setShowOrdersLine] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ANALYTICS_API);
      if (res.data) {
        setProductsAnalytics(res.data.productsAnalytics || []);
        setHourlyData(res.data.hourlyBreakdown || []);
        setTotals({
          totalViews: res.data.totalViews || 0,
          totalClicks: res.data.totalClicks || 0,
          totalOrders: res.data.totalOrders || 0,
          totalSales: res.data.totalSales || 0,
          conversionRate: res.data.conversionRate || "0",
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const maxViews = Math.max(...hourlyData.map(h => h.views || 0), 1);
  const maxOrders = Math.max(...hourlyData.map(h => h.orders || 0), 1);

  // Filtering products
  const categoriesList = ["All", ...Array.from(new Set(productsAnalytics.map((p) => p.category?.trim()).filter(Boolean)))];

  const filteredAnalytics = productsAnalytics.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      String(p.id).includes(q);

    const matchesCat =
      selectedCategory === "All" ||
      (p.category && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

    return matchesQ && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">

      {/* Header Section */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
                AVORA Real-Time Traffic Center
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Backend Database Synced
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
              Website Live Analytics &amp; Product Views
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)] font-light">
              Real-time traffic monitor tracking hourly website page views, product clicks, and product-by-product view stats stored in PostgreSQL database.
            </p>
          </div>

          <button
            onClick={fetchAnalyticsData}
            className="px-5 py-3 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            🔄 Refresh Analytics
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Live Store Page Views</p>
          <h3 className="text-3xl font-bold text-[var(--primary)] mt-2">
            👁️ {totals.totalViews.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">↑ Tracked in DB</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Product Clicks</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            🖱️ {totals.totalClicks.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">↑ Detail clicks recorded</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">WhatsApp Orders</p>
          <h3 className="text-3xl font-bold text-[#c86f49] mt-2">
            🛒 {totals.totalOrders.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">↑ Converted checkouts</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Click-to-Order Ratio</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-2">
            ⚡ {totals.conversionRate}%
          </h3>
          <p className="text-[11px] text-[var(--muted)] font-medium mt-3">Conversion efficiency</p>
        </div>

      </section>

      {/* ADVANCED ADVANCED HOURLY TRAFFIC LINE + BAR GRAPH */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <span>📈</span> 24-Hour Live Traffic Line + Bar Graph
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Hourly breakdown showing Live Page Views (Blue Bars) overlaid with Order Conversions Curve (Orange Line)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowViewsBar(!showViewsBar)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition ${
                showViewsBar ? "bg-[var(--primary)] text-white" : "bg-[var(--bg)] text-[var(--muted)]"
              }`}
            >
              Bars: Page Views
            </button>

            <button
              onClick={() => setShowOrdersLine(!showOrdersLine)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition ${
                showOrdersLine ? "bg-[#c86f49] text-white" : "bg-[var(--bg)] text-[var(--muted)]"
              }`}
            >
              Line: WhatsApp Orders
            </button>
          </div>
        </div>

        {/* Combined SVG Chart Box */}
        <div className="relative pt-8 pb-2">
          <div className="h-64 relative border-b border-[var(--border)]">
            
            {/* SVG Orders Smooth Curve Line */}
            {showOrdersLine && hourlyData.length > 0 && (
              <svg
                viewBox="0 0 800 220"
                className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="hourlyOrdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c86f49" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c86f49" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const count = hourlyData.length;
                  const pts = hourlyData.map((item, idx) => {
                    const x = (idx / Math.max(count - 1, 1)) * 800;
                    const y = 200 - ((item.orders || 0) / maxOrders) * 160;
                    return { x, y, hourNum: item.hourNum };
                  });

                  let pathD = `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const curr = pts[i];
                    const next = pts[i + 1];
                    const cpX = (curr.x + next.x) / 2;
                    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
                  }
                  const areaD = `${pathD} L 800 220 L 0 220 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#hourlyOrdGrad)" />
                      <path d={pathD} fill="none" stroke="#c86f49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p) => (
                        <g key={p.hourNum}>
                          {hoveredHour === p.hourNum && (
                            <line x1={p.x} y1="0" x2={p.x} y2="220" stroke="#c86f49" strokeDasharray="3,3" strokeWidth="1.5" />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredHour === p.hourNum ? "6.5" : "3.5"}
                            fill={hoveredHour === p.hourNum ? "#c86f49" : "#ffffff"}
                            stroke="#c86f49"
                            strokeWidth={hoveredHour === p.hourNum ? "3" : "2"}
                            className="transition-all duration-200"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            )}

            {/* Underlying Bars Layer */}
            <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-2 z-10">
              {hourlyData.map((item) => {
                const heightPercent = Math.max(((item.views || 0) / maxViews) * 85, 6);
                const isHovered = hoveredHour === item.hourNum;
                return (
                  <div
                    key={item.hourNum}
                    onMouseEnter={() => setHoveredHour(item.hourNum)}
                    onMouseLeave={() => setHoveredHour(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                    style={{ height: "100%", justifyContent: "flex-end" }}
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-40 bg-[var(--primary)] text-white text-[10px] p-2.5 rounded shadow-2xl whitespace-nowrap text-center animate-fadeIn border border-white/20">
                        <p className="font-bold text-amber-300">⏰ Time: {item.hour}</p>
                        <p className="text-white">👁️ Page Views: {item.views || 0}</p>
                        <p className="text-purple-200">🖱️ Product Clicks: {item.clicks || 0}</p>
                        <p className="text-[#c86f49] font-bold">🛒 Orders: {item.orders || 0}</p>
                      </div>
                    )}

                    {showViewsBar && (
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          width: "100%",
                          maxWidth: 16,
                          background: isHovered
                            ? "var(--primary)"
                            : "rgba(33,45,67,0.3)",
                          transition: "all 0.25s ease",
                        }}
                        className="rounded-t"
                      />
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <div className="flex justify-between text-[11px] text-[var(--muted)] mt-3 px-2">
            <span>00:00 (Midnight)</span>
            <span>12:00 (Noon)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>
      </section>

      {/* PRODUCT VIEWS & CLICKS ANALYTICS TABLE */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wider">
              📊 Product-Wise Views &amp; Clicks Database Report ({filteredAnalytics.length} Items)
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Recorded page views, detail clicks, and order conversions per product fetched live from PostgreSQL database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search product analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 text-xs md:text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] w-full md:w-64"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--muted)] uppercase tracking-widest">
            Loading backend product analytics...
          </div>
        ) : filteredAnalytics.length > 0 ? (
          <div className="overflow-x-auto border border-[var(--border)]">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-[var(--primary)] text-white border-b border-[var(--border)] uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3.5 font-semibold">Product</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Price (₹)</th>
                  <th className="px-4 py-3.5 font-semibold text-center bg-[#2b3a55]">👁️ Page Views</th>
                  <th className="px-4 py-3.5 font-semibold text-center bg-[#334464]">🖱️ Detail Clicks</th>
                  <th className="px-4 py-3.5 font-semibold text-center bg-[#3b4e72]">🛒 Orders</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--bg)]">
                {filteredAnalytics.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-12 object-cover border border-[var(--border)] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 bg-gray-200 border border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted)]">
                            No Img
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs md:text-sm text-[var(--text)] uppercase tracking-wide truncate max-w-[200px]">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[var(--muted)]">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-xs text-[var(--muted)] uppercase">
                      {p.category || "Uncategorized"}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-[#c86f49]">
                      ₹{p.price}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-[var(--primary)] text-sm bg-blue-50/40">
                      👁️ {(p.views || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-purple-700 text-sm bg-purple-50/40">
                      🖱️ {(p.clicks || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-[#c86f49] text-sm bg-orange-50/40">
                      🛒 {p.ordersCount || 0}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 uppercase tracking-wider">
                        Synced DB
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[var(--muted)] uppercase tracking-wider">
            No product analytics found.
          </div>
        )}
      </section>

    </div>
  );
}
