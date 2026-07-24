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

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 lg:py-48 z-10">
          <div className="max-w-4xl">
            <div className="hero-animate flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-px w-12 md:w-16 bg-[var(--accent)]"></div>
              <p className="text-xs md:text-sm lg:text-base uppercase tracking-[0.2em] md:tracking-[0.4em] text-[var(--accent)] font-semibold" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                Premium Avora Collection
              </p>
            </div>
            <h1 className="hero-animate-scale hero-text-shimmer hero-title text-5xl md:text-7xl lg:text-8xl xl:text-[10rem] font-bold text-white mb-6 md:mb-10 leading-none" style={{ lineHeight: '0.85', letterSpacing: '-0.02em' }}>
              AVORA
            </h1>
            <p className="hero-animate-delay-1 text-base md:text-xl lg:text-3xl text-white/95 max-w-2xl mb-8 md:mb-14 font-light leading-relaxed" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.02em', lineHeight: '1.6' }}>
              Discover timeless elegance crafted for the modern gentleman. Premium fabrics, impeccable fit, and sophisticated style.
            </p>
            <div className="hero-animate-delay-2 flex flex-col sm:flex-row gap-4 md:gap-6">
              <button className="px-8 py-3 md:px-10 md:py-4 bg-[var(--accent)] text-white font-semibold  hover:bg-[var(--accent)]/90 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem md:0.75rem' }}>
                Shop men
              </button>
              <button className="px-8 py-3 md:px-10 md:py-4 border-2 border-white text-white font-semibold  hover:bg-white hover:text-[var(--primary)] transition-all duration-300 hover:scale-105 transform" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem md:0.75rem' }}>
                learn more
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
          {/* Theme-Matched Filter & Sort Bar */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 0,
            padding: "16px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            marginBottom: 24,
          }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Filter Controls Group */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs">
                
                {/* Header Badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(33,45,67,0.06)",
                  border: "1px solid var(--border)",
                  borderRadius: 0, padding: "6px 12px",
                  color: "var(--primary)", fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                  <span>Filters</span>
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Category:</span>
                  <CustomThemeDropdown
                    options={categories.map((cat) => ({ value: cat, label: cat }))}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                  />
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price:</span>
                  <div className="flex items-center gap-1.5">
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span style={{ position: "absolute", left: 8, color: "var(--muted)", fontSize: 11, pointerEvents: "none" }}>₹</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        placeholder="Min"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 0,
                          padding: "7px 8px 7px 20px",
                          color: "var(--text)",
                          fontSize: 12,
                          fontWeight: 600,
                          width: 68,
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                      />
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>–</span>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span style={{ position: "absolute", left: 8, color: "var(--muted)", fontSize: 11, pointerEvents: "none" }}>₹</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder="Max"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 0,
                          padding: "7px 8px 7px 20px",
                          color: "var(--text)",
                          fontSize: 12,
                          fontWeight: 600,
                          width: 68,
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Dropdown */}
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Discount:</span>
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

              </div>

              {/* Right Side: Sort + Reset */}
              <div className="flex items-center gap-3 text-xs ml-auto">
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Sort:</span>
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

                {/* Reset Button (If active filters) */}
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
                      transition: "all 0.2s",
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
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className=" overflow-hidden shadow-sm hover:shadow-xl transition relative"
                    >
                      <Link to={`/store/${product.id}`}>
                        <div className="h-96 bg-gray-100 overflow-hidden relative">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
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
                            className="absolute top-3 right-3 w-8 h-8  bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
                            style={{ opacity: likeLoading[product.id] ? 0.6 : 1 }}
                          >
                            <svg
                              className={`w-4 h-4 transition-all duration-300 ${likedProducts.includes(product.id)
                                  ? "text-red-500 fill-red-500 scale-110"
                                  : "text-gray-400"
                                }`}
                              viewBox="0 0 24 24"
                              fill={likedProducts.includes(product.id) ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="p-4 text-left">
                          <h3
                            className="product-name font-semibold mb-2 uppercase text-lg tracking-tight"
                          >
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold">
                              ₹{product.price}
                            </span>

                            {product.mrp && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>

                          {product.discount > 0 && (
                            <p className="text-sm" style={{ color: "#c86f49" }}>
                              ₹{product.mrp - product.price} Off
                            </p>
                          )}

                          <p className="text-xs mt-1" style={{ color: "#c86f49" }}>
                            Free delivery on prepaid orders
                          </p>
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