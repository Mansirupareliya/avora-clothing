import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Footer from "./Component/Footer";
import { ProductCardSkeleton } from "./Component/Skeleton";

const API_URL = "http://localhost:3000/products";

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [priceMinBound, setPriceMinBound] = useState(0);
  const [priceMaxBound, setPriceMaxBound] = useState(1000);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [openFilter, setOpenFilter] = useState("");
  const [likedProducts, setLikedProducts] = useState([]);
  const discountOptions = [20, 40, 60];

  const toggleLike = (productId) => {
    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Build categories from backend `products` (keep "All" first)
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
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
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      p.category === selectedCategory;

    const withinMin = minPrice == null || p.price >= Number(minPrice);
    const withinMax = maxPrice == null || p.price <= Number(maxPrice);
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
      {/* Hero Section */}
      <section className="hero-section">
        {/* HD Image — local file, rendered as <img> for sharpness */}
        <img
          src="/avora_store_hero.png"
          alt="AVORA Premium Menswear"
          className="hero-bg-img"
          loading="eager"
          decoding="async"
        />

        {/* Directional overlay — left heavy, fades right to reveal the model */}
        <div className="hero-overlay" />

        {/* Floating content — aligned left */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-xl xl:max-w-2xl">

            {/* Top label */}
            <div className="hero-animate flex items-center gap-3 mb-6">
              <span className="hero-rule"></span>
              <p
                className="text-xs md:text-sm uppercase tracking-[0.35em] text-[var(--accent)] font-semibold"
                style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
              >
                Premium Menswear Collection
              </p>
            </div>

            {/* Brand name */}
            <h1
              className="hero-animate-scale hero-title font-bold text-white mb-4 leading-none uppercase"
              style={{
                fontFamily: "'PlatNomor', 'Louis George Cafe', sans-serif",
                fontSize: 'clamp(4rem, 10vw, 9rem)',
                letterSpacing: '-0.02em',
                lineHeight: '0.88',
              }}
            >
              AVORA
            </h1>

            {/* Tagline */}
            <p
              className="hero-animate-delay-1 text-base md:text-xl text-white font-normal leading-relaxed mb-3"
              style={{
                fontFamily: "'Louis George Cafe', system-ui, sans-serif",
                letterSpacing: '0.02em',
                lineHeight: '1.65',
                maxWidth: '34rem',
              }}
            >
              Discover timeless elegance crafted for the modern gentleman.
              Premium fabrics, impeccable fit, and sophisticated style.
            </p>

            {/* Accent divider */}
            <div className="hero-animate-delay-1 flex items-center gap-3 mb-8">
              <div style={{ width: 40, height: 2, background: 'var(--accent)' }} />
              <span
                className="text-white/80 text-xs uppercase tracking-[0.25em] font-normal"
                style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
              >
                Est. 2024 · Crafted in India
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="hero-animate-delay-2 flex flex-col sm:flex-row gap-4">
              <button
                className="px-9 py-4 bg-[var(--accent)] text-white font-semibold rounded-none hover:bg-white hover:text-[var(--primary)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(200,111,73,0.45)] hover:scale-105 transform"
                style={{
                  fontFamily: "'Louis George Cafe', system-ui, sans-serif",
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Shop the Collection
              </button>
              <button
                className="px-9 py-4 border border-white/60 text-white font-semibold rounded-none hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 transform"
                style={{
                  fontFamily: "'Louis George Cafe', system-ui, sans-serif",
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Our Story
              </button>
            </div>

            {/* Trust badges */}
            <div className="hero-animate-delay-2 flex flex-wrap items-center gap-6 mt-10">
              {[
                { num: '500+', label: 'Premium Products' },
                { num: '100%', label: 'Pure Fabric' },
                { num: 'Free', label: 'Prepaid Delivery' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.25)' }} />
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{b.num}</p>
                    <p className="text-white/70 text-xs tracking-wide font-normal mt-0.5">{b.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-white text-[10px] uppercase tracking-[0.3em] font-normal">Scroll</span>
          <div className="w-[1px] h-8 bg-white/50 animate-pulse" />
        </div>
      </section>


      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center text-xs">
            <span className="font-semibold text-[var(--text)]">Filters:</span>

            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-[var(--text)] hover:text-[#c86f49] cursor-pointer focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[var(--surface)] text-[var(--text)]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">Price:</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                placeholder="Min"
                className="bg-transparent px-1 py-0 text-xs text-[var(--text)] w-10 md:w-12 hover:text-[#c86f49] focus:outline-none"
              />
              <span className="text-[var(--muted)]">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                placeholder="Max"
                className="bg-transparent px-1 py-0 text-xs text-[var(--text)] w-10 md:w-12 hover:text-[#c86f49] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">Discount:</span>
              <select
                value={selectedDiscounts.length > 0 ? selectedDiscounts[0] : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDiscounts([Number(e.target.value)]);
                  } else {
                    setSelectedDiscounts([]);
                  }
                }}
                className="bg-transparent text-xs text-[var(--text)] hover:text-[#c86f49] cursor-pointer focus:outline-none"
              >
                <option value="" className="bg-[var(--surface)] text-[var(--text)]">All</option>
                <option value="20" className="bg-[var(--surface)] text-[var(--text)]">20%+</option>
                <option value="40" className="bg-[var(--surface)] text-[var(--text)]">40%+</option>
                <option value="60" className="bg-[var(--surface)] text-[var(--text)]">60%+</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[var(--muted)] text-xs">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-[var(--text)] hover:text-[#c86f49] cursor-pointer focus:outline-none"
              >
                <option value="latest" className="bg-[var(--surface)] text-[var(--text)]">Latest</option>
                <option value="price-low" className="bg-[var(--surface)] text-[var(--text)]">Price: Low</option>
                <option value="price-high" className="bg-[var(--surface)] text-[var(--text)]">Price: High</option>
                <option value="discount" className="bg-[var(--surface)] text-[var(--text)]">Best Discount</option>
              </select>
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
                            toggleLike(product.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
                        >
                          <svg
                            className={`w-4 h-4 transition-colors ${
                              likedProducts.includes(product.id)
                                ? "text-red-500 fill-red-500"
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