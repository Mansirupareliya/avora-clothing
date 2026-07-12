import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../Component/Footer";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6 md:space-y-8">
      {/* Hero Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] text-[var(--primary)] font-semibold">
              Welcome to Dashboard
            </p>
            <h1 className="logo-text mt-3 text-3xl md:text-5xl font-bold text-[var(--text)]">
              AVORA Studio
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-[var(--muted)] leading-relaxed font-light">
              Manage your premium menswear catalog, update pricing, track inventory, and keep your collection ready for discerning customers.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--primary)] px-6 py-4 md:px-8 md:py-6 text-[var(--surface)] shadow-2xl border border-[var(--border)]">
            <p className="text-xs text-[var(--surface)]/70 uppercase tracking-[0.15em] font-medium">Active Store</p>
            <p className="logo-text mt-3 text-xl md:text-2xl font-semibold">AVORA</p>
            <p className="mt-2 text-xs md:text-sm text-[var(--surface)]/70">Premium Collection</p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            icon: "📊",
            title: "Total Products",
            value: "Live",
            description: "Auto-synced inventory from your catalog",
          },
          {
            icon: "⚡",
            title: "Quick Update",
            value: "Fast",
            description: "Add, edit, and publish instantly",
          },
          {
            icon: "🔒",
            title: "Data Security",
            value: "Secure",
            description: "Safe, encrypted, and reliable storage",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 shadow-md hover:shadow-xl hover:border-[var(--primary)] transition-all duration-300 group"
          >
            <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              {card.title}
            </p>
            <p className="mt-4 text-2xl md:text-3xl font-bold text-[var(--text)]">
              {card.value}
            </p>
            <p className="mt-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed">{card.description}</p>
          </div>
        ))}
      </section>

      {/* ── PRODUCT SHOWCASE ── */}
      <section>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-1">
              Live Catalog
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] m-0">
              Our Collection
            </h2>
          </div>
          {products.length > 0 && (
            <span
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, #2d3f5c 100%)",
                color: "#fff",
                
                padding: "4px 16px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {products.length} Items
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div style={{ background: "#e6e9f0", height: 220 }} />
                <div style={{ background: "var(--primary)", padding: "14px 16px" }}>
                  <div style={{ background: "rgba(255,255,255,0.15)",  height: 14, width: "70%", marginBottom: 10 }} />
                  <div style={{ background: "rgba(255,255,255,0.1)",  height: 12, width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div
            style={{
              border: "2px dashed var(--border)",
              
              padding: "60px 32px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontWeight: 600, fontSize: 18, color: "var(--text)" }}>No products yet</p>
            <p style={{ fontSize: 14, marginTop: 6 }}>Add products from the Products page to see them here.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="product-home-card group"
                style={{
                  
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(33,45,67,0.10)",
                  transition: "transform 0.32s cubic-bezier(.4,0,.2,1), box-shadow 0.32s",
                  cursor: "pointer",
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.06}s both`,
                  background: "transparent",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.025)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(33,45,67,0.22)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(33,45,67,0.10)";
                }}
              >
                {/* ── WHITE IMAGE ZONE ── */}
                <div
                  style={{
                    background: "#ffffff",
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "4/5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
                        display: "block",
                      }}
                      className="product-home-img"
                    />
                  ) : (
                    <div style={{ fontSize: 48, color: "#c9d0dc" }}>👔</div>
                  )}

                  {/* Discount Badge — floats over the white image zone */}
                  {product.discount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "linear-gradient(135deg, #c86f49, #e08060)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        padding: "4px 10px",
                        
                        boxShadow: "0 2px 8px rgba(200,111,73,0.45)",
                      }}
                    >
                      -{product.discount}% OFF
                    </span>
                  )}

                  {/* Category tag */}
                  {product.category && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(33,45,67,0.82)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        padding: "3px 9px",
                        
                        textTransform: "uppercase",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                </div>

                {/* ── INFO ZONE — outside white background ── */}
                <div
                  style={{
                    background: "linear-gradient(160deg, #212d43 0%, #1a2538 100%)",
                    padding: "14px 16px 16px",
                  }}
                >
                  {/* Product Name */}
                  <p
                    className="product-name"
                    style={{
                      color: "#f0f4ff",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 10,
                      lineHeight: 1.4,
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </p>

                  {/* Pricing Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {/* Selling Price */}
                    <span
                      style={{
                        color: "#c86f49",
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      ₹{product.price}
                    </span>

                    {/* MRP strikethrough */}
                    {product.mrp && product.mrp !== product.price && (
                      <span
                        style={{
                          color: "rgba(240,244,255,0.38)",
                          fontSize: 12,
                          textDecoration: "line-through",
                          fontWeight: 400,
                        }}
                      >
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(Array.isArray(product.sizes) ? product.sizes : product.sizes.split(","))
                        .slice(0, 4)
                        .map(s => (
                          <span
                            key={s}
                            style={{
                              border: "1px solid rgba(240,244,255,0.18)",
                              color: "rgba(240,244,255,0.6)",
                              
                              padding: "1px 6px",
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.08em",
                              background: "rgba(255,255,255,0.04)",
                            }}
                          >
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 shadow-sm border-l-4 border-l-[var(--primary)]">
        <h3 className="font-semibold text-[var(--text)]">💡 Pro Tip</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use the Products page to manage your entire collection. Upload high-quality images, set competitive pricing, and track inventory in real-time.
        </p>
      </section>

      <Footer />
    </div>
  );
}