import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "./context/CartContext";

const API_URL = "http://localhost:3000/products";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/${productId}`);
        setProduct(response.data);
      } catch (err) {
        setError("Could not load product. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center py-20">
        <div className="text-left">Loading product details…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center py-20">
        <div className="max-w-xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-left shadow-lg">
          <p className="mb-6 text-lg font-semibold">{error || "Product not found."}</p>
          <Link
            to="/store"
            className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-opacity-90"
          >
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  const savings = product.mrp && product.price ? Number(product.mrp) - Number(product.price) : 0;
  const sizes = product.sizes ? (Array.isArray(product.sizes) ? product.sizes : String(product.sizes).split(",").map((size) => size.trim())) : [];

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product, 1, selectedSize);
      alert("Added to cart!");
      setSelectedSize("");
    } catch (error) {
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 text-left">
        <div className="flex flex-col gap-6 md:flex-row text-left">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--text)]"
          >
            ← Back to store
          </Link>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full max-h-[560px] object-cover"
              />
            ) : (
              <div className="flex h-96 items-center justify-center bg-gray-100 text-5xl">👕</div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="space-y-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
                    {product.category || "Men's Wear"}
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {product.name}
                  </h1>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text)]">
                  ⭐ 5|4 Review
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-semibold">₹{product.price}</p>
                  {savings > 0 && (
                    <span className="rounded-full bg-[#5c2418] px-2 py-1 text-xs font-semibold text-white">
                      Rs. {savings} Off
                    </span>
                  )}
                </div>

                {product.mrp && (
                  <p className="text-xs text-[var(--muted)]">
                    MRP: <span className="line-through">₹{product.mrp}</span> Inclusive of all Taxes
                  </p>
                )}

                <p className="text-xs leading-6 text-[var(--muted)]">{product.description}</p>
              </div>
            </div>


            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--text)]">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)]"
              >
                <option value="">Choose an option</option>
                {sizes.length > 0 ? (
                  sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))
                ) : (
                  ["S", "M", "L", "XL"].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-xs font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </button>
              <button className="rounded-2xl border border-[var(--border)] px-4 py-3 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
