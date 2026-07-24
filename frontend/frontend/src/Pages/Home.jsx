import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;
const ANALYTICS_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/analytics/dashboard`;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [hoveredDay, setHoveredDay] = useState(null);

  // Active Graph Metric Toggles
  const [showRevenueLine, setShowRevenueLine] = useState(true);
  const [showOrdersBar, setShowOrdersBar] = useState(true);
  const [showViewsBar, setShowViewsBar] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prodRes, anaRes] = await Promise.all([
        axios.get(API_URL).catch(() => ({ data: [] })),
        axios.get(`${ANALYTICS_API}?month=${selectedMonth}`).catch(() => ({ data: null })),
      ]);
      setProducts(prodRes.data || []);
      setAnalytics(anaRes.data || null);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const dailyData = analytics?.dailyBreakdown || [];
  const maxSales = Math.max(...dailyData.map(d => d.salesAmount || 0), 1);
  const maxOrders = Math.max(...dailyData.map(d => d.ordersCount || 0), 1);
  const maxViews = Math.max(...dailyData.map(d => d.pageViews || 0), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">

      {/* Header Section */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold">
                AVORA Executive Studio
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Database Synced Live
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-[var(--text)] uppercase tracking-wide">
              Advanced Sales &amp; Orders Analytics
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)] font-light">
              Real-time PostgreSQL analytics tracking date-wise sales, orders volume, product clicks, and website traffic.
            </p>
          </div>

          {/* Month & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] p-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] pl-1">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text)] outline-none cursor-pointer"
              >
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
              </select>
            </div>

            <button
              onClick={fetchDashboardData}
              className="px-4 py-3 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Month Sales</p>
          <h3 className="text-3xl font-bold text-[#c86f49] mt-2">
            ₹{(analytics?.totalSales || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">↑ Live Database Total</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Orders Placed</p>
          <h3 className="text-3xl font-bold text-[var(--primary)] mt-2">
            {analytics?.totalOrders || 0} <span className="text-xs font-normal text-[var(--muted)]">Orders</span>
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-3">↑ Date-wise Recorded</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Avg Order Value</p>
          <h3 className="text-3xl font-bold text-[var(--text)] mt-2">
            ₹{(analytics?.avgOrderValue || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-[var(--muted)] font-medium mt-3">Calculated per order</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">Total Website Views</p>
          <h3 className="text-3xl font-bold text-purple-700 mt-2">
            👁️ {(analytics?.totalViews || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-[var(--muted)] font-medium mt-3">Page traffic recorded</p>
        </div>

      </section>

      {/* ADVANCED MULTI-METRIC LINE + DUAL BAR GRAPH */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <span>📈</span> Advanced Multi-Metric Line + Bar Graph
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Toggle metrics on/off to compare daily Sales (₹ Line), Orders Volume (Bars), and Page Traffic
            </p>
          </div>

          {/* Interactive Metric Toggle Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRevenueLine(!showRevenueLine)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition flex items-center gap-1.5 ${
                showRevenueLine
                  ? "bg-[#c86f49] text-white border-[#c86f49]"
                  : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]"
              }`}
            >
              <span className="w-2.5 h-0.5 bg-current"></span> Line: Sales (₹)
            </button>

            <button
              onClick={() => setShowOrdersBar(!showOrdersBar)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition flex items-center gap-1.5 ${
                showOrdersBar
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]"
              }`}
            >
              <span className="w-2.5 h-2.5 bg-current"></span> Bars: Orders
            </button>

            <button
              onClick={() => setShowViewsBar(!showViewsBar)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition flex items-center gap-1.5 ${
                showViewsBar
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]"
              }`}
            >
              <span className="w-2.5 h-2.5 bg-current"></span> Bars: Page Views
            </button>
          </div>
        </div>

        {/* Chart View Area */}
        <div className="relative pt-8 pb-2">
          <div className="h-72 relative border-b border-[var(--border)]">
            
            {/* SVG Smooth Curve Area Overlay */}
            {showRevenueLine && dailyData.length > 0 && (
              <svg
                viewBox="0 0 800 240"
                className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="advSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c86f49" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c86f49" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const count = dailyData.length;
                  const pts = dailyData.map((item, idx) => {
                    const x = (idx / Math.max(count - 1, 1)) * 800;
                    const y = 220 - ((item.salesAmount || 0) / maxSales) * 180;
                    return { x, y, day: item.day };
                  });

                  // Cubic Bezier curve path calculation
                  let pathD = `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const curr = pts[i];
                    const next = pts[i + 1];
                    const cpX = (curr.x + next.x) / 2;
                    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
                  }
                  const areaD = `${pathD} L 800 240 L 0 240 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#advSalesGrad)" />
                      <path d={pathD} fill="none" stroke="#c86f49" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p) => (
                        <g key={p.day}>
                          {hoveredDay === p.day && (
                            <line x1={p.x} y1="0" x2={p.x} y2="240" stroke="#c86f49" strokeDasharray="3,3" strokeWidth="1.5" />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredDay === p.day ? "7" : "4"}
                            fill={hoveredDay === p.day ? "#c86f49" : "#ffffff"}
                            stroke="#c86f49"
                            strokeWidth={hoveredDay === p.day ? "3.5" : "2"}
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
              {dailyData.map((item) => {
                const ordersHeight = Math.max(((item.ordersCount || 0) / maxOrders) * 80, 6);
                const viewsHeight = Math.max(((item.pageViews || 0) / maxViews) * 80, 6);
                const isHovered = hoveredDay === item.day;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                    style={{ height: "100%", justifyContent: "flex-end" }}
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-20 z-40 bg-[var(--primary)] text-white text-[10px] p-3 rounded shadow-2xl whitespace-nowrap text-center animate-fadeIn border border-white/20">
                        <p className="font-bold text-amber-300">📅 {item.dateStr}</p>
                        <p className="text-[#c86f49] font-bold">💰 Sales: ₹{(item.salesAmount || 0).toLocaleString()}</p>
                        <p className="text-white">🛒 Orders: {item.ordersCount || 0}</p>
                        <p className="text-purple-200">👁️ Views: {item.pageViews || 0}</p>
                      </div>
                    )}

                    <div className="w-full max-w-[18px] flex items-end justify-center gap-0.5" style={{ height: "100%" }}>
                      {showOrdersBar && (
                        <div
                          style={{
                            height: `${ordersHeight}%`,
                            width: "100%",
                            background: isHovered ? "var(--primary)" : "rgba(33,45,67,0.3)",
                            transition: "all 0.25s ease",
                          }}
                          className="rounded-t"
                        />
                      )}

                      {showViewsBar && (
                        <div
                          style={{
                            height: `${viewsHeight}%`,
                            width: "100%",
                            background: isHovered ? "#7e22ce" : "rgba(126,34,206,0.3)",
                            transition: "all 0.25s ease",
                          }}
                          className="rounded-t"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="flex justify-between text-[11px] text-[var(--muted)] mt-3 px-2">
            <span>Day 1 ({selectedMonth})</span>
            <span>Day {Math.round((dailyData.length || 30) / 2)}</span>
            <span>Day {dailyData.length || 31}</span>
          </div>
        </div>
      </section>

      {/* DATE-WISE ORDERS BREAKDOWN TABLE */}
      <section className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wider">
              🗓️ Date-Wise Database Records ({selectedMonth})
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Date-wise recorded daily sales revenue, orders count, and page views fetched directly from NestJS PostgreSQL backend.
            </p>
          </div>

          <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--bg)] border border-[var(--border)] px-4 py-2 uppercase tracking-wider">
            {dailyData.length} Recorded Days
          </span>
        </div>

        <div className="overflow-x-auto border border-[var(--border)]">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-[var(--primary)] text-white border-b border-[var(--border)] uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-center">Orders Count</th>
                <th className="px-5 py-3.5 font-semibold text-center">Page Views</th>
                <th className="px-5 py-3.5 font-semibold text-right">Daily Sales (₹)</th>
                <th className="px-5 py-3.5 font-semibold text-center">Backend Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--bg)]">
              {dailyData.map((row) => (
                <tr key={row.dateStr} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[var(--text)]">
                    📅 {row.dateStr}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center font-bold px-3 py-1 bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)]">
                      {row.ordersCount || 0} Orders
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-medium text-[var(--text)]">
                    👁️ {row.pageViews || 0}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#c86f49]">
                    ₹{(row.salesAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 uppercase tracking-wider">
                      Synced DB
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}