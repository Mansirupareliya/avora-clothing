import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "./Context/CartContext";

const API_URL = "http://localhost:3000/products";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
const [openAccordion, setOpenAccordion] = useState(null);
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/${productId}`);
        setProduct(response.data);
        
        // Fetch suggested products from same category
        if (response.data.category) {
          const allProducts = await axios.get(API_URL);
          const categoryProducts = allProducts.data.filter(
            (p) => p.category === response.data.category && p.id !== response.data.id
          );
          setSuggestedProducts(categoryProducts.slice(0, 4));
        }

        // Fetch reviews for this product
        try {
          const reviewsResponse = await axios.get(`${API_URL}/${productId}/reviews`);
          setReviews(reviewsResponse.data);
        } catch (err) {
          console.log("No reviews yet or reviews endpoint not available");
        }
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
  
  // Handle multiple images - if product has images array, use it, otherwise use single imageUrl
  const productImages = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  const handleAddToCart = async () => {
    await addToCart(product, quantity, selectedSize);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const review = {
        productId: productId,
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString()
      };
      
      // Submit to database
      await axios.post(`${API_URL}/${productId}/reviews`, review);
      
      // Refresh reviews from database
      const reviewsResponse = await axios.get(`${API_URL}/${productId}/reviews`);
      setReviews(reviewsResponse.data);
      
      setNewReview({ name: "", rating: 5, comment: "" });
      setShowReviewForm(false);
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
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
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-20 flex-shrink-0">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-[var(--accent)] scale-105' 
                      : 'border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] relative">
              <div
                className="w-full h-[560px] overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={{
                    transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center center'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3  bg-[var(--surface)] p-6">
            <div className="space-y-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
                    {product.category || "Men's Wear"}
                  </p>
                  <span className="product-name text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {product.name}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text)]">
                  ⭐ 5|4 Review
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-semibold">₹{product.price}</span>
                  {savings > 0 && (
                    <span className="rounded-full bg-[#c86f49] px-2 py-1 text-xs font-semibold text-white">
                      Rs. {savings} Off
                    </span>
                  )}
                </div>

                {product.mrp && (
                  <p className="text-xs text-[var(--muted)]">
                    MRP: <span className="line-through">₹{product.mrp}</span> Inclusive of all Taxes
                  </p>
                )}

              </div>
            </div>

            <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--text)]">
                Size: <span className="font-normal">Choose An Option</span>
            </h3>

            <div className="flex flex-wrap gap-4">
                {(sizes.length > 0 ? sizes : ["S", "M", "L", "XL"]).map((size) => (
                <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[60px] rounded-full border px-1 py-1 text-sm transition-all ${
                    selectedSize === size
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "border-gray-400 text-[var(--text)] hover:border-[var(--primary)]"
                    }`}
                >
                    {size}
                </button>
                ))}
            </div>

            {selectedSize && (
                <p className="text-sm text-[#c86f49]">
                Selected Size: <strong>{selectedSize}</strong>
                </p>
            )}
            </div>

       <div className="space-y-4">
            {/* Quantity + Add to Cart in same row */}
            <div className="flex gap-3">
                <div className="flex items-center border border-gray-300  overflow-hidden">
                <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-2 py-1 text-lg font-semibold hover:bg-gray-100"
                >
                    -
                </button>

                <span className="px-2 py-1 min-w-[50px] text-center">
                    {quantity}
                </span>

                <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-2 py-1 text-lg font-semibold hover:bg-gray-100"
                >
                    +
                </button>
                </div>

                    <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1  bg-[var(--primary)] px-2 py-1 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                    {addingToCart ? "Adding..." : "Add To Cart"}
                    </button>
                </div>

                {/* Buy Now in second row */}
                <button
                    className="w-full  border border-[var(--border)] px-2 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                    Buy Now
                </button>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                    {[
                        {
                        title: "Product Details",
                        content:
                            product.description ||
                            "Premium quality fabric with comfortable fit and durable stitching.",
                        },
                        {
                        title: "Shipping Information",
                        content:
                            "Orders are processed within 24-48 hours. Delivery usually takes 3-7 business days depending on your location.",
                        },
                        {
                        title: "Exchange Policy",
                        content:
                            "Easy 7-day exchange available for size issues. Product must be unused and in original condition.",
                        },
                        {
                        title: "Care Instructions",
                        content:
                            "Machine wash cold. Do not bleach. Iron on low heat. Wash dark colors separately.",
                        },
                    ].map((item, index) => (
                        <div
                        key={index}
                        className=" overflow-hidden"
                        >
                        <button
                            type="button"
                            onClick={() =>
                            setOpenAccordion(openAccordion === index ? null : index)
                            }
                            className="w-full flex items-center justify-between px-2 py-1 text-left font-medium"
                        >
                            <span>{item.title}</span>
                            <span className="text-lg">
                            {openAccordion === index ? "−" : "+"}
                            </span>
                        </button>

                        {openAccordion === index && (
                            <div className="px-4 pb-4 text-sm text-gray-600 leading-6">
                            {item.content}
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
              Customer Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition"
              style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>
          
          {/* Review Form - Collapsible */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-8 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                Share Your Experience
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                    placeholder="Enter your name"
                    style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                    Rating
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                    style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] h-32 resize-none transition"
                    placeholder="Share your experience with this product..."
                    style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-opacity-90 transition"
                  style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {/* What Others Are Saying */}
          <div>
            <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
              What Others Are Saying
            </h3>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-[var(--muted)] text-center py-12" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id || review._id} className="p-6 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                            {review.name}
                          </span>
                          <div className="text-yellow-500 text-sm">
                            {"⭐".repeat(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-[var(--muted)]" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                        {review.date ? new Date(review.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-[var(--text)] leading-relaxed" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
                      {review.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Louis George Cafe', system-ui, sans-serif" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedProducts.map((suggestedProduct) => (
                <Link
                  key={suggestedProduct.id}
                  to={`/store/${suggestedProduct.id}`}
                  className="block border border-[var(--border)] bg-[var(--surface)] overflow-hidden rounded-xl hover:shadow-xl transition"
                >
                  <div className="h-64 bg-gray-100 overflow-hidden">
                    {suggestedProduct.imageUrl ? (
                      <img
                        src={suggestedProduct.imageUrl}
                        alt={suggestedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        👕
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="product-name font-semibold mb-2 text-lg">
                      {suggestedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹{suggestedProduct.price}</span>
                      {suggestedProduct.mrp && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{suggestedProduct.mrp}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
