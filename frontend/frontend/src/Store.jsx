import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
  const discountOptions = [20, 40, 60];

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
      <section 
        className="hero-section relative bg-[var(--primary)] overflow-hidden"
        style={{
          '--bg-image-default': 'url("https://www.bringitonline.in/uploads/2/2/4/5/22456530/premium-men-s-shirt-photography-for-summer-collection-brand-in-delhi-mumbai-by-bring-it-online-bring-it-online-fashion-shoots-images-bio-7_orig.jpg")',
          '--bg-image-hover': 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8FRrUlST0Wg3JrUXDOicl_y_KjUO4j1sUyucAYZw9&s")'
        }}
      >
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-32 md:py-48">
          <div className="max-w-4xl">
            <div className="hero-animate flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-[var(--accent)]"></div>
              <p className="text-sm md:text-base uppercase tracking-[0.4em] text-[var(--accent)] font-semibold" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                Premium Menswear Collection
              </p>
            </div>
            <h1 className="hero-animate-scale hero-text-shimmer hero-title text-8xl md:text-[10rem] font-bold text-white mb-10 leading-none" style={{ lineHeight: '0.85', letterSpacing: '-0.02em' }}>
              AVORA
            </h1>
            <p className="hero-animate-delay-1 text-xl md:text-3xl text-white/95 max-w-2xl mb-14 font-light leading-relaxed" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.02em', lineHeight: '1.6' }}>
              Discover timeless elegance crafted for the modern gentleman. Premium fabrics, impeccable fit, and sophisticated style.
            </p>
            <div className="hero-animate-delay-2 flex flex-col sm:flex-row gap-6">
              <button className="px-10 py-4 bg-[var(--accent)] text-white font-semibold rounded-none hover:bg-[var(--accent)]/90 transition-all duration-300 hover:shadow-2xl hover:scale-105 transform" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Shop men
              </button>
              <button className="px-10 py-4 border-2 border-white text-white font-semibold rounded-none hover:bg-white hover:text-[var(--primary)] transition-all duration-300 hover:scale-105 transform" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center text-xs">
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
                className="bg-transparent px-1 py-0 text-xs text-[var(--text)] w-12 hover:text-[#c86f49] focus:outline-none"
              />
              <span className="text-[var(--muted)]">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                placeholder="Max"
                className="bg-transparent px-1 py-0 text-xs text-[var(--text)] w-12 hover:text-[#c86f49] focus:outline-none"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/store/${product.id}`}
                    className="block border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm hover:shadow-xl transition"
                  >
                    <div className="h-96 bg-gray-100 overflow-hidden">
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="logo-text font-bold mb-4">AVORA</h4>
              <p className="text-sm opacity-80">
                Premium menswear crafted for the modern gentleman.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Sale</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>About Us</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>Help Center</li>
                <li>Shipping Info</li>
                <li>Returns</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm">
            © 2026 AVORA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}