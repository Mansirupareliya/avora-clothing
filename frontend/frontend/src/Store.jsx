import { useEffect, useState } from "react";
import axios from "axios";
import PublicHeader from "./Component/PublicHeader";

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
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-8">
          {/* Sidebar */}
          <aside>
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 sticky top-24">
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Categories</h3>

                <div className="space-y-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-4 py-2 rounded-lg ${
                        selectedCategory === cat
                          ? "bg-[var(--primary)] text-white"
                          : "hover:bg-[var(--bg)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

                <div className="border-t border-[var(--border)] pt-6 space-y-4">
                  <h3 className="font-bold mb-2">Price Range</h3>

                  <div className="space-y-3">
                    <div className="relative h-10">
                      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
                      <div
                        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#c86f49] "
                        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                      />

                      <input
                        type="range"
                        min={priceMinBound}
                        max={priceMaxBound}
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(Math.min(Number(e.target.value), maxPrice))
                        }
                        className="absolute left-0 right-0 top-0 w-full appearance-none h-10 bg-transparent pointer-events-auto"
                      />

                      <input
                        type="range"
                        min={priceMinBound}
                        max={priceMaxBound}
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(Math.max(Number(e.target.value), minPrice))
                        }
                        className="absolute left-0 right-0 top-0 w-full appearance-none h-10 bg-transparent pointer-events-auto"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-xs text-gray-500">Min: ₹{minPrice}</div>
                      <div className="text-xs text-gray-500">Max: ₹{maxPrice}</div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-gray-700">
                        Discount filters
                      </span>
                      {discountOptions.map((threshold) => (
                        <label key={threshold} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedDiscounts.includes(threshold)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedDiscounts((current) =>
                                checked
                                  ? [...current, threshold]
                                  : current.filter((value) => value !== threshold)
                              );
                            }}
                            className="w-4 h-4"
                          />
                          {threshold}%+ Discount
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

              <div className="border-t border-[var(--border)] pt-6">
                {/* <h3 className="font-bold mb-4">Search</h3> */}

                {/* <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2"
                /> */}
              </div>
            </div>
          </aside>

          {/* Products */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <p className="text-sm">
                Showing {filteredProducts.length} products
              </p>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-[var(--border)] px-4 py-2 rounded-lg"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm hover:shadow-xl transition"
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
                        className="font-semibold mb-2 uppercase text-lg tracking-tight"
                        style={{
                          fontFamily:
                            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                        }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">The Wise</h4>
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
            © 2026 The Wise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}