import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Footer from "./Component/Footer";
import { ProductCardSkeleton } from "./Component/Skeleton";
import { useAuth } from "./Context/AuthContext";
import heroShirts from "./assets/hero-shirts.png";
import heroModel from "./assets/hero-model.png";

const HERO_IMAGES = [heroShirts, heroModel];
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;
const WISHLIST_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/wishlist`;

// Custom Theme Dropdown Component
function CustomThemeDropdown({ options, value, onChange, highlight = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: "var(--bg)",
          border: open
            ? "1px solid var(--primary)"
            : "1px solid var(--border)",
          borderRadius: 0,
          padding: "7px 32px 7px 12px",
          color: highlight ? "var(--primary)" : "var(--text)",
          fontSize: 12,
          fontWeight: highlight ? 700 : 600,
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s",
          boxShadow: open ? "0 0 0 2px rgba(33,45,67,0.1)" : "none",
          fontFamily: "var(--sans)",
        }}
      >
        <span>{selectedOpt?.label || value}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={highlight ? "var(--primary)" : "var(--muted)"}
          strokeWidth="2.5"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
            transition: "transform 0.2s",
            pointerEvents: "none",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 99,
            minWidth: 150,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 0,
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {options.map((opt) => {
            const isSel = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  background: isSel ? "var(--primary)" : "transparent",
                  color: isSel ? "#ffffff" : "var(--text)",
                  border: "none",
                  borderRadius: 0,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: isSel ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSel) e.currentTarget.style.background = "var(--bg)";
                }}
                onMouseLeave={(e) => {
                  if (!isSel) e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{opt.label}</span>
                {isSel && (
                  <span style={{ fontSize: 10, opacity: 0.8 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Price Range Slider with Dots ───────────────────────────────────────────
function PriceRangeSlider({ min, max, minVal, maxVal, onMinChange, onMaxChange }) {
  const range = max - min || 1;
  const DOT_COUNT = 6;
  const dots = Array.from({ length: DOT_COUNT }, (_, i) =>
    Math.round(min + (i / (DOT_COUNT - 1)) * range)
  );

  const minPct = ((minVal - min) / range) * 100;
  const maxPct = ((maxVal - min) / range) * 100;

  const clamp = (val, lo, hi) => Math.min(Math.max(val, lo), hi);

  const handleMinChange = (e) => {
    const val = clamp(Number(e.target.value), min, maxVal - 1);
    onMinChange(val);
  };
  const handleMaxChange = (e) => {
    const val = clamp(Number(e.target.value), minVal + 1, max);
    onMaxChange(val);
  };

  const handleDotClick = (dotVal) => {
    const distToMin = Math.abs(dotVal - minVal);
    const distToMax = Math.abs(dotVal - maxVal);
    if (distToMin <= distToMax) {
      if (dotVal < maxVal) onMinChange(dotVal);
    } else {
      if (dotVal > minVal) onMaxChange(dotVal);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
      {/* Label + values */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          color: "var(--muted)", fontWeight: 600, fontSize: 11,
          textTransform: "uppercase", letterSpacing: "0.04em"
        }}>Price:</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "var(--primary)",
          background: "rgba(33,45,67,0.07)", padding: "2px 8px", borderRadius: 2,
          letterSpacing: "0.02em",
        }}>
          ₹{minVal.toLocaleString("en-IN")} — ₹{maxVal.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Track + thumbs */}
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        {/* Background track */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 3,
          background: "var(--border)", borderRadius: 2,
        }} />

        {/* Active fill between thumbs */}
        <div style={{
          position: "absolute",
          left: `${minPct}%`,
          width: `${maxPct - minPct}%`,
          height: 3,
          background: "var(--primary)",
          borderRadius: 2,
          transition: "left 0.08s, width 0.08s",
        }} />

        {/* Dots on the track */}
        {dots.map((dotVal, i) => {
          const pct = ((dotVal - min) / range) * 100;
          const active = dotVal >= minVal && dotVal <= maxVal;
          return (
            <div
              key={i}
              onClick={() => handleDotClick(dotVal)}
              title={`₹${dotVal.toLocaleString("en-IN")}`}
              style={{
                position: "absolute",
                left: `calc(${pct}% - 5px)`,
                width: 10, height: 10,
                borderRadius: "50%",
                background: active ? "var(--primary)" : "var(--border)",
                border: `2px solid ${active ? "var(--primary)" : "var(--muted)"}`,
                cursor: "pointer",
                transition: "background 0.15s, transform 0.15s, border-color 0.15s",
                zIndex: 2,
                boxShadow: active ? "0 0 0 3px rgba(33,45,67,0.15)" : "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.4)";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(33,45,67,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = active ? "0 0 0 3px rgba(33,45,67,0.15)" : "none";
              }}
            />
          );
        })}

        {/* Min thumb */}
        <input
          type="range"
          className="price-thumb"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          style={{
            position: "absolute", width: "100%",
            background: "transparent", zIndex: 4, height: 20,
          }}
        />
        {/* Max thumb */}
        <input
          type="range"
          className="price-thumb"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          style={{
            position: "absolute", width: "100%",
            background: "transparent", zIndex: 4, height: 20,
          }}
        />
      </div>

      {/* Min / Max labels */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>
          ₹{min.toLocaleString("en-IN")}
        </span>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>
          ₹{max.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}


export default function Store() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [priceMinBound, setPriceMinBound] = useState(0);
  const [priceMaxBound, setPriceMaxBound] = useState(100000);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [openFilter, setOpenFilter] = useState("");
  const [likedProducts, setLikedProducts] = useState([]);
  const [likeLoading, setLikeLoading] = useState({});
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // User login ਜ਼્યાબાદ existing wishlist ફેદ કરો
  useEffect(() => {
    if (user) {
      axios.get(WISHLIST_URL)
        .then(r => {
          const ids = r.data.map(item => item.productId);
          setLikedProducts(ids);
        })
        .catch(() => {}); // silently fail
    } else {
      setLikedProducts([]); // logout ਜ਼્યાબાદ clear
    }
  }, [user]);

  const toggleLike = async (productId, product) => {
    if (!user) {
      // User logged in નથી — login page પર redirect કરો
      navigate("/store/login", { state: { from: location } });
      return;
    }

    const isLiked = likedProducts.includes(productId);
    setLikeLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (isLiked) {
        // Unlike — backend માંથી remove કરો
        await axios.delete(`${WISHLIST_URL}/${productId}`);
        setLikedProducts(prev => prev.filter(id => id !== productId));
      } else {
        // Like — backend માં save કરો
        await axios.post(WISHLIST_URL, {
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl || null,
          category: product.category || null,
        });
        setLikedProducts(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setLikeLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Build categories from backend `products` (keep "All" first)
  const rawCategories = products
    .map((p) => p.category?.trim())
    .filter(Boolean);
  const categories = [
    "All",
    ...Array.from(new Set(rawCategories)),
  ];

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
      const prices = res.data.map((p) => Number(p.price) || 0);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceMinBound(min);
        setPriceMaxBound(max);
        setMinPrice(min);
        setMaxPrice(max);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  let filteredProducts = products.filter((p) => {
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower);

    const pCat = p.category ? p.category.trim().toLowerCase() : "";
    const selCat = selectedCategory ? selectedCategory.trim().toLowerCase() : "all";
    const matchesCategory = selCat === "all" || pCat === selCat;

    const prodPrice = Number(p.price) || 0;
    const withinMin = minPrice == null || prodPrice >= Number(minPrice);
    const withinMax = maxPrice == null || prodPrice <= Number(maxPrice);
    const matchesPrice = withinMin && withinMax;

    const discountValue = Number(p.discount || 0);
    const matchesDiscount =
      selectedDiscounts.length === 0 ||
      selectedDiscounts.some((threshold) => discountValue >= threshold);

    return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
  });

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "discount") {
    filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  const sliderRange = priceMaxBound - priceMinBound || 1;
  const minPercent = ((minPrice - priceMinBound) / sliderRange) * 100;
  const maxPercent = ((maxPrice - priceMinBound) / sliderRange) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section Slideshow */}
      <section className="hero-section relative bg-[var(--primary)] overflow-hidden">
        {/* Carousel Slide Images */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: currentHeroIndex === idx ? 1 : 0,
              transform: currentHeroIndex === idx ? "scale(1)" : "scale(1.04)",
              transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}

        <div className="hero-overlay"></div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-32 lg:py-48 z-10" style={{ paddingTop: 'clamp(40px, 12vw, 192px)', paddingBottom: 'clamp(40px, 12vw, 192px)' }}>
          <div className="max-w-4xl">
            <div className="hero-animate flex items-center gap-3 mb-4 md:mb-8">
              <div className="h-px w-8 md:w-16 bg-[var(--accent)]"></div>
              <p className="text-[10px] md:text-sm lg:text-base uppercase tracking-[0.15em] md:tracking-[0.4em] text-[var(--accent)] font-semibold" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                Premium Avora Collection
              </p>
            </div>
            <h1 className="hero-animate-scale hero-text-shimmer hero-title font-bold text-white mb-4 md:mb-10 leading-none" style={{ fontSize: 'clamp(3rem, 15vw, 10rem)', lineHeight: '0.85', letterSpacing: '-0.02em' }}>
              AVORA
            </h1>
            <p className="hero-animate-delay-1 text-white/90 max-w-2xl mb-6 md:mb-14 font-light leading-relaxed" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", fontSize: 'clamp(0.8rem, 3vw, 1.875rem)', letterSpacing: '0.02em', lineHeight: '1.6' }}>
              Discover timeless elegance crafted for the modern gentleman.
            </p>
            <div className="hero-animate-delay-2 flex flex-row gap-3 md:gap-6">
              <button className="px-5 py-2.5 md:px-10 md:py-4 bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent)]/90 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform text-xs md:text-sm" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Shop men
              </button>
              <button className="px-5 py-2.5 md:px-10 md:py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-[var(--primary)] transition-all duration-300 hover:scale-105 transform text-xs md:text-sm" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div style={{
          position: "absolute", bottom: 24, right: 32, zIndex: 20,
          display: "flex", gap: 8, alignItems: "center"
        }}>
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHeroIndex(i)}
              style={{
                width: currentHeroIndex === i ? 28 : 10,
                height: 6,
                borderRadius: 3,
                background: currentHeroIndex === i ? "var(--accent)" : "rgba(255,255,255,0.45)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="space-y-4">
          {/* Theme-Matched Filter & Sort Bar — single line */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 0,
            padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            marginBottom: 20,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap", minWidth: "max-content" }}>

              {/* Category Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Category:</span>
                <CustomThemeDropdown
                  options={categories.map((cat) => ({ value: cat, label: cat }))}
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                />
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

              {/* Price Range Slider */}
              <div style={{ flexShrink: 0 }}>
                <PriceRangeSlider
                  min={priceMinBound}
                  max={priceMaxBound}
                  minVal={minPrice}
                  maxVal={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                />
              </div>

              {/* Divider — hidden on mobile */}
              <div className="hidden md:block" style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

              {/* Discount Dropdown — hidden on mobile */}
              <div className="hidden md:flex" style={{ alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Discount:</span>
                <CustomThemeDropdown
                  options={[
                    { value: "", label: "All Discounts" },
                    { value: "20", label: "20%+ Off" },
                    { value: "40", label: "40%+ Off" },
                    { value: "60", label: "60%+ Off" },
                  ]}
                  value={selectedDiscounts.length > 0 ? String(selectedDiscounts[0]) : ""}
                  onChange={(val) => setSelectedDiscounts(val ? [Number(val)] : [])}
                />
              </div>

              {/* Spacer */}
              <div style={{ flex: 1, minWidth: 16 }} />

              {/* Sort Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Sort:</span>
                <CustomThemeDropdown
                  highlight={true}
                  options={[
                    { value: "latest", label: "Latest Arrival" },
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" },
                    { value: "discount", label: "Best Discount" },
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                />
              </div>

              {/* Reset Button */}
              {(selectedCategory !== "All" || minPrice > priceMinBound || maxPrice < priceMaxBound || selectedDiscounts.length > 0 || sortBy !== "latest") && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setMinPrice(priceMinBound);
                    setMaxPrice(priceMaxBound);
                    setSelectedDiscounts([]);
                    setSortBy("latest");
                  }}
                  style={{
                    background: "rgba(200,111,73,0.1)",
                    border: "1px solid rgba(200,111,73,0.3)",
                    borderRadius: 0,
                    padding: "6px 12px",
                    color: "#c86f49",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexShrink: 0,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(200,111,73,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(200,111,73,0.1)"}
                >
                  <span>Reset</span>
                  <span>✕</span>
                </button>
              )}

            </div>
          </div>

          <div>
            <div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="product-home-card overflow-hidden shadow-sm hover:shadow-xl transition relative bg-[var(--surface)]"
                      style={{ borderRadius: 0 }}
                    >
                      <Link to={`/store/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {/* Image */}
                        <div
                          className="product-home-img bg-gray-100 overflow-hidden relative"
                          style={{ aspectRatio: "3/4", width: "100%" }}
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500"
                              style={{ display: "block" }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              👕
                            </div>
                          )}

                          {/* Like Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(product.id, product);
                            }}
                            disabled={likeLoading[product.id]}
                            style={{
                              position: "absolute", top: 8, right: 8,
                              width: 30, height: 30,
                              background: "rgba(255,255,255,0.92)",
                              border: "none", borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                              zIndex: 10, transition: "transform 0.15s",
                              opacity: likeLoading[product.id] ? 0.6 : 1,
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                          >
                            <svg
                              width="14" height="14"
                              viewBox="0 0 24 24"
                              fill={likedProducts.includes(product.id) ? "#ef4444" : "none"}
                              stroke={likedProducts.includes(product.id) ? "#ef4444" : "#9ca3af"}
                              strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>

                        {/* Info */}
                        <div style={{ padding: "8px 10px 10px" }}>
                          <h3 style={{
                            fontWeight: 600, fontSize: "clamp(11px, 2.5vw, 14px)",
                            textTransform: "uppercase", letterSpacing: "0.04em",
                            marginBottom: 4, lineHeight: 1.3,
                            color: "var(--text)",
                            overflow: "hidden", textOverflow: "ellipsis",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          }}>
                            {product.name}
                          </h3>

                          <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: "clamp(12px, 3vw, 15px)", color: "var(--text)" }}>
                              ₹{product.price?.toLocaleString("en-IN")}
                            </span>
                            {product.mrp && (
                              <span style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#9ca3af", textDecoration: "line-through" }}>
                                ₹{product.mrp?.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {product.discount > 0 && (
                            <p style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#c86f49", fontWeight: 600, marginTop: 2 }}>
                              ₹{(product.mrp - product.price)?.toLocaleString("en-IN")} Off
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}