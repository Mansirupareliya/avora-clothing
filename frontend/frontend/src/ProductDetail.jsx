import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "./Context/CartContext";
import { useAuth } from "./Context/AuthContext";
import Footer from "./Component/Footer";
import { ProductDetailSkeleton, ProductCardSkeleton } from "./Component/Skeleton";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/products`;


export default function ProductDetail() {
  const { productId } = useParams();
  const { user } = useAuth();
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
  const scrollContainerRef = useRef(null);

  // Buy Now Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyForm, setBuyForm] = useState({ name: "", phone: "", address: "", city: "", pincode: "", note: "", payment: "cod" });


  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // card width (256px) + gap (24px)
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/${productId}`);
        setProduct(response.data);

        // Track view & click in PostgreSQL backend
        axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/analytics/track-click/${productId}`).catch(() => {});

        // Fetch suggested products from all products (max 10, excluding current)
        const allProducts = await axios.get(API_URL);
        const suggestedProducts = allProducts.data
          .filter((p) => p.id !== response.data.id)
          .slice(0, 10);
        setSuggestedProducts(suggestedProducts);

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
      <>
        <ProductDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center py-20">
        <div className="max-w-xl mx-auto  border border-[var(--border)] bg-[var(--surface)] p-10 text-left shadow-lg">
          <p className="mb-6 text-lg font-semibold">{error || "Product not found."}</p>
          <Link
            to="/store"
            className="inline-flex items-center justify-center  bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-opacity-90"
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

  // Buy Now handlers
  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    setShowBuyModal(true);
  };

  const handleWhatsAppOrder = async () => {
    const { name, phone, address, city, pincode, note } = buyForm;
    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill all required fields!");
      return;
    }
    const itemSubtotal = Number(product.price) * quantity;
    const gstRate = 5;
    const gstAmount = itemSubtotal * (gstRate / 100);
    const itemGrandTotal = itemSubtotal + gstAmount;
    const productSavings = product.mrp && product.price ? Number(product.mrp) - Number(product.price) : 0;

    let generatedOrderId = "AVR-1001";
    try {
      // Save order to NestJS PostgreSQL Database & get unique sequential Order ID
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/orders/checkout`, {
        userId: user?.id,
        totalAmount: itemGrandTotal,
        items: [
          {
            productId: product.id,
            productName: product.name,
            price: Number(product.price),
            quantity,
            size: selectedSize,
            imageUrl: product.imageUrl,
          }
        ],
        shippingAddress: {
          fullName: name,
          phone,
          addressLine1: address,
          city,
          pincode,
          note,
        }
      });
      if (orderRes.data && orderRes.data.orderId) {
        generatedOrderId = orderRes.data.orderId;
        // Store in user local orders history
        try {
          const localOrders = JSON.parse(localStorage.getItem('avora_local_orders') || '[]');
          localOrders.unshift(orderRes.data);
          localStorage.setItem('avora_local_orders', JSON.stringify(localOrders));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Order creation in DB error:", err);
    }

    const lines = [
      "*AVORA - New Order!*",
      "*Order ID: " + generatedOrderId + "*",
      "",
      "*Product Details*",
      "Product: " + product.name,
      "Category: " + (product.category || "Men's Wear"),
      "Size: " + selectedSize,
      "Quantity: " + quantity,
      "Item Price: Rs." + product.price,
      "Subtotal: Rs." + itemSubtotal.toFixed(2),
      "GST (" + gstRate + "%): Rs." + gstAmount.toFixed(2),
      "Total Amount (incl. GST): *Rs." + itemGrandTotal.toFixed(2) + "*",
    ];
    if (productSavings > 0) lines.push("Savings: Rs." + (productSavings * quantity) + " Off");
    lines.push("", "*Customer Details*");
    lines.push("Name: " + name);
    lines.push("Phone: " + phone);
    lines.push("Address: " + address);
    lines.push("City: " + city);
    lines.push("Pincode: " + pincode);
    if (note) lines.push("Note: " + note);
    const paymentLabel = buyForm.payment === "cod" ? "Cash on Delivery (COD)" : "Online Payment (QR Code)";
    lines.push("", "Payment Method: *" + paymentLabel + "*");
    lines.push("", "Thank you for ordering from AVORA!");

    const msg = lines.join("\n");
    const waUrl = "https://wa.me/917623876280?text=" + encodeURIComponent(msg);
    window.open(waUrl, "_blank");
    setShowBuyModal(false);
    setBuyForm({ name: "", phone: "", address: "", city: "", pincode: "", note: "", payment: "cod" });
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 text-left">
        <div className="flex flex-col gap-6 md:flex-row text-left">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--text)]"
          >
            ← Back to store
          </Link>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 lg:w-20 flex-shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 lg:w-20 lg:h-20  overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === index
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
            <div className="flex-1  overflow-hidden border border-[var(--border)] bg-[var(--surface)] relative">
              <div
                className="w-full h-[350px] md:h-[450px] lg:h-[560px] overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                  style={{
                    transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center center'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 bg-[var(--surface)] p-4 md:p-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-[var(--primary)]">
                    {product.category || "Men's Wear"}
                  </p>
                  <span className="product-name text-xl md:text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {product.name}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1  border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text)]">
                  ⭐ 5|4 Review
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg md:text-xl font-semibold">₹{product.price}</span>
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

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-sm font-medium text-[var(--text)]">
                Size: <span className="font-normal">Choose An Option</span>
              </h3>

              <div className="flex flex-wrap gap-3 md:gap-4">
                {(sizes.length > 0 ? sizes : ["S", "M", "L", "XL"]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] md:min-w-[60px]  border px-2 py-1 md:px-1 md:py-1 text-xs md:text-sm transition-all ${selectedSize === size
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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 md:px-2 md:py-1 text-lg font-semibold hover:bg-gray-100"
                  >
                    -
                  </button>

                  <span className="px-3 py-2 md:px-2 md:py-1 min-w-[50px] text-center">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-3 py-2 md:px-2 md:py-1 text-lg font-semibold hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-[var(--primary)] px-4 py-2 md:px-2 md:py-1 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {addingToCart ? "Adding..." : "Add To Cart"}
                </button>
              </div>

              {/* Buy Now - WhatsApp */}
              <button
                onClick={handleBuyNow}
                style={{
                  width: "100%", background: "#25D366", border: "none",
                  borderRadius: 6, padding: "10px 16px",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s, box-shadow 0.2s",
                  boxShadow: "0 2px 8px rgba(37,211,102,0.3)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1ebe5d"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,211,102,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#25D366"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,211,102,0.3)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882a.5.5 0 0 0 .613.613l6.077-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.377l-.374-.215-3.875.937.953-3.793-.234-.389A9.948 9.948 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Buy Now via WhatsApp
              </button>

              {/* Buy Now Order Modal — Login Style */}
              {showBuyModal && (
                <div
                  onClick={(e) => { if (e.target === e.currentTarget) setShowBuyModal(false); }}
                  style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "16px",
                  }}
                >
                  {/* Card — same as Login */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 440,
                    maxHeight: "92vh",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "36px 36px 28px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
                    animation: "fadeInUp 0.35s ease-out both",
                  }}>
                    {/* Background decorative circles — same as Login */}
                    <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, background: "radial-gradient(circle, rgba(200,111,73,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(45,167,161,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

                    {/* Close button */}
                    <button
                      onClick={() => setShowBuyModal(false)}
                      style={{
                        position: "absolute", top: 16, right: 16,
                        background: "none", border: "1px solid var(--border)",
                        cursor: "pointer", color: "var(--muted)",
                        width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>

                    {/* AVORA Logo — same as Login */}
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <p className="logo-text" style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>AVORA</p>
                      <p style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.18em", marginTop: 4, textTransform: "uppercase", margin: "4px 0 0" }}>
                        Premium Avora
                      </p>
                    </div>

                    {/* Heading */}
                    <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 4px", textAlign: "center" }}>
                      Place Your Order
                    </h2>
                    <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", margin: "0 0 24px" }}>
                      Fill in your details to order via WhatsApp
                    </p>

                    {/* Product Summary */}
                    {(() => {
                      const itemSubtotal = Number(product.price) * quantity;
                      const gstRate = 5;
                      const gstAmount = itemSubtotal * (gstRate / 100);
                      const itemGrandTotal = itemSubtotal + gstAmount;
                      return (
                        <div style={{ marginBottom: 22 }}>
                          <div style={{
                            background: "var(--bg)", border: "1px solid var(--border)",
                            padding: "12px 14px", marginBottom: 10,
                            display: "flex", gap: 12, alignItems: "center",
                          }}>
                            {product.imageUrl && (
                              <img src={product.imageUrl} alt={product.name} style={{ width: 56, height: 56, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
                              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
                                Size: <strong style={{ color: "var(--primary)" }}>{selectedSize}</strong>
                                <span style={{ margin: "0 8px", color: "var(--border)" }}>|</span>
                                Qty: <strong style={{ color: "var(--text)" }}>{quantity}</strong>
                              </p>
                              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                                Unit Price: ₹{product.price}
                              </p>
                            </div>
                          </div>

                          {/* GST Breakdown */}
                          <div style={{
                            background: "rgba(33,45,67,0.05)",
                            border: "1px solid var(--border)",
                            padding: "10px 12px",
                            display: "flex", flexDirection: "column", gap: 5,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                              <span>Subtotal:</span>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>₹{itemSubtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                              <span>GST ({gstRate}%):</span>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>+₹{gstAmount.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#c86f49", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                              <span>Total Amount (incl. GST):</span>
                              <span>₹{itemGrandTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Delivery Info</span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>

                    {/* Form Fields — same input style as Login */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { key: "name", label: "Full Name", placeholder: "Raj Patel", type: "text" },
                        { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210", type: "tel" },
                        { key: "address", label: "Full Address", placeholder: "House No., Street, Area", type: "text" },
                        { key: "city", label: "City", placeholder: "Surat", type: "text" },
                        { key: "pincode", label: "Pincode", placeholder: "395006", type: "text" },
                        { key: "note", label: "Special Note (Optional)", placeholder: "Any special instructions...", type: "text" },
                      ].map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                          <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                            {label} {key !== "note" && <span style={{ color: "#c86f49" }}>*</span>}
                          </label>
                          <input
                            type={type}
                            value={buyForm[key]}
                            onChange={(e) => setBuyForm(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            style={{
                              width: "100%", boxSizing: "border-box",
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                              padding: "12px 14px",
                              color: "var(--text)", fontSize: 14, outline: "none",
                              transition: "border 0.2s, box-shadow 0.2s",
                              fontFamily: "var(--sans)",
                            }}
                            onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(33,45,67,0.1)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      ))}

                      {/* Payment Method */}
                      <div>
                        <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 10, textTransform: "uppercase" }}>
                          Payment Method <span style={{ color: "#c86f49" }}>*</span>
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            {
                              value: "cod",
                              label: "Cash on Delivery",
                              sublabel: "Pay when you receive",
                              icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                                  <circle cx="12" cy="12" r="3"/>
                                  <path d="M6 12h.01M18 12h.01"/>
                                </svg>
                              ),
                            },
                            {
                              value: "qr",
                              label: "QR / Online",
                              sublabel: "Pay via UPI / QR Code",
                              icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                                  <path d="M14 14h2v2h-2zM18 14h3v3M21 18v3h-3M14 18h2v3"/>
                                </svg>
                              ),
                            },
                          ].map(opt => {
                            const isSel = buyForm.payment === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setBuyForm(prev => ({ ...prev, payment: opt.value }))}
                                style={{
                                  border: isSel ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                                  padding: "14px 12px",
                                  background: isSel ? "var(--primary)" : "var(--bg)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  textAlign: "left",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 7,
                                  position: "relative",
                                }}
                              >
                                {isSel && (
                                  <div style={{
                                    position: "absolute", top: 8, right: 8,
                                    width: 16, height: 16, borderRadius: "50%",
                                    background: "#c86f49",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                                  </div>
                                )}
                                <div style={{ color: isSel ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>
                                  {opt.icon}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: isSel ? "#fff" : "var(--text)", letterSpacing: "0.01em" }}>
                                  {opt.label}
                                </div>
                                <div style={{ fontSize: 10, color: isSel ? "rgba(255,255,255,0.55)" : "var(--muted)", letterSpacing: "0.02em" }}>
                                  {opt.sublabel}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit Button — same as Login's Sign In */}
                      <button
                        onClick={handleWhatsAppOrder}
                        style={{
                          marginTop: 8,
                          background: "var(--primary)",
                          border: "none",
                          padding: "13px",
                          color: "var(--surface)",
                          fontSize: 14, fontWeight: 700,
                          letterSpacing: "0.06em",
                          cursor: "pointer",
                          transition: "transform 0.15s, box-shadow 0.2s",
                          width: "100%",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(33,45,67,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882a.5.5 0 0 0 .613.613l6.077-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.377l-.374-.215-3.875.937.953-3.793-.234-.389A9.948 9.948 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        Send Order on WhatsApp →
                      </button>
                    </div>

                    <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, margin: "18px 0 0" }}>
                      Your details are safe &amp; secure
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-6 border-t border-gray-200 pt-4 space-y-3">
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
        <div className="mt-12 bg-[var(--surface)] p-8 md:p-12  border border-[var(--border)]">
          {/* Review Form - Collapsible */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-12 p-8 md:p-10 bg-[var(--bg)]  border border-[var(--border)] shadow-sm">
              <div className="mb-8 pb-6 border-b border-[var(--border)]">
                <h3 className="text-2xl font-light uppercase tracking-widest mb-2" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                  Write a Review
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Share your experience with this product to help others make informed decisions.
                </p>
              </div>

              <div className="space-y-8">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text)]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full px-5 py-4 border border-[var(--border)]  focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition bg-[var(--surface)]"
                    placeholder="Enter your name"
                    style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text)]">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={star <= newReview.rating ? "text-yellow-500" : "text-gray-300"}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-2">
                    Click to rate: {newReview.rating} out of 5 stars
                  </p>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium mb-3 uppercase tracking-wider text-[var(--text)]">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-5 py-4 border border-[var(--border)]  focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition bg-[var(--surface)] h-40 resize-none"
                    placeholder="Tell us about your experience with this product. What did you like or dislike?"
                    style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}
                  />
                  <p className="text-xs text-[var(--muted)] mt-2 text-right">
                    {newReview.comment.length} characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--primary)] text-white font-semibold px-8 py-4  hover:bg-opacity-90 transition shadow-lg hover:shadow-xl"
                    style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-8 py-4 border border-[var(--border)]  hover:border-[var(--primary)] hover:text-[var(--primary)] transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* What Others Are Saying */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-light uppercase tracking-widest" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                Reviews
              </h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm font-medium uppercase tracking-wider text-[var(--primary)] hover:text-[var(--text)] transition border-b border-transparent hover:border-[var(--primary)] pb-1"
              >
                {showReviewForm ? "Close" : "Write a Review"}
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[var(--border)]">
                <p className="text-[var(--muted)] italic text-lg" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                  No reviews yet. Be the first to share your experience.
                </p>
              </div>
            ) : (
              <>
                {/* Rating Summary */}
                <div className="flex items-center gap-8 mb-12 pb-8 border-b border-[var(--border)]">
                  <div className="text-center">
                    <div className="text-5xl font-light">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </div>
                    <div className="flex text-yellow-600 mt-2 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "opacity-100" : "opacity-30"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[var(--muted)] mt-2">
                      {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm w-6">{star}★</span>
                          <div className="flex-1 h-2 bg-gray-200  overflow-hidden">
                            <div
                              className="h-full bg-yellow-600 "
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-[var(--muted)] w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-10">
                  {reviews.map((review) => (
                    <div key={review.id || review._id} className="border-b border-[var(--border)] pb-10 last:border-b-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12  bg-[var(--primary)] text-white flex items-center justify-center text-lg font-semibold">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                              {review.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex text-yellow-600">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-[var(--muted)] uppercase tracking-wider">
                                Verified Purchase
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted)]" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                          {review.date ? new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : ""}
                        </span>
                      </div>
                      <p className="text-[var(--text)] leading-relaxed text-lg" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12 relative">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: '"Louis George Cafe", system-ui, sans-serif' }}>
              You May Also Like
            </h2>

            {/* Previous Button */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 bg-white  shadow-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors"
              style={{ marginTop: '-2rem' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4"
              style={{
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: 'none'
              }}
            >
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {suggestedProducts.map((suggestedProduct) => (
                <Link
                  key={suggestedProduct.id}
                  to={`/store/${suggestedProduct.id}`}
                  className="flex-shrink-0 w-64  bg-[var(--surface)] overflow-hidden  hover:shadow-xl transition"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="h-96 bg-gray-100 overflow-hidden">
                    {suggestedProduct.imageUrl ? (
                      <img
                        src={suggestedProduct.imageUrl}
                        alt={suggestedProduct.name}
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
                      {suggestedProduct.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">
                        ₹{suggestedProduct.price}
                      </span>

                      {suggestedProduct.mrp && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{suggestedProduct.mrp}
                        </span>
                      )}
                    </div>

                    {suggestedProduct.discount > 0 && (
                      <p className="text-sm" style={{ color: "#c86f49" }}>
                        ₹{suggestedProduct.mrp - suggestedProduct.price} Off
                      </p>
                    )}

                    <p className="text-xs mt-1" style={{ color: "#c86f49" }}>
                      Free delivery on prepaid orders
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-12 h-12 bg-white  shadow-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-colors"
              style={{ marginTop: '-2rem' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
