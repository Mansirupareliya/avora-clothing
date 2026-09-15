import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import Footer from "../Component/Footer";
import { CartItemSkeleton } from "../Component/Skeleton";
import Skeleton from "../Component/Skeleton";
import CreditUnlockedModal from "../Component/CreditUnlockedModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Cart() {
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateCart,
    cartTotal,
    clearCart,
    loading,
  } = useCart();

  const [activeCredit, setActiveCredit] = useState(null);
  const [applyCredit, setApplyCredit] = useState(false);
  const [unlockedCredit, setUnlockedCredit] = useState(null);

  // Coupon States
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartTotal;
  const minOrderValue = activeCredit ? Number(activeCredit.minOrderValue || 6000) : 6000;
  const isCreditEligible = activeCredit && subtotal >= minOrderValue;
  const creditDiscount = (isCreditEligible && applyCredit) ? Math.min(Number(activeCredit.amount || 2000), subtotal) : 0;
  
  const subtotalAfterCredit = Math.max(0, subtotal - creditDiscount);
  const couponDiscount = appliedCoupon ? Math.min(Number(appliedCoupon.discountAmount || 0), subtotalAfterCredit) : 0;

  const gstRate = 5;
  const discountedSubtotal = Math.max(0, subtotalAfterCredit - couponDiscount);
  const gstAmount = discountedSubtotal * (gstRate / 100);
  const grandTotal = discountedSubtotal + gstAmount;

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [buyForm, setBuyForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    pincode: "",
    note: "",
    payment: "cod",
  });

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await axios.post(`${API}/coupons/validate`, {
        code: couponCodeInput.trim(),
        orderTotal: subtotalAfterCredit,
        userId: user?.id,
        userEmail: user?.email,
      });
      if (res.data && res.data.valid) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discountAmount: res.data.discountAmount,
          message: res.data.message,
        });
        setCouponMsg({ text: res.data.message, isError: false });
      } else {
        setCouponMsg({ text: res.data?.message || "Invalid coupon code", isError: true });
      }
    } catch (err) {
      setCouponMsg({ text: err?.response?.data?.message || "Failed to validate coupon", isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponMsg(null);
  };

  // Fetch available active Shopping Credit
  useEffect(() => {
    const fetchActiveCredit = async () => {
      try {
        const res = await axios.get(`${API}/shopping-credits/active`, {
          params: { userId: user?.id, userEmail: user?.email },
        });
        if (res.data) {
          setActiveCredit(res.data);
          // Auto enable if cart is eligible
          if (subtotal >= Number(res.data.minOrderValue || 6000)) {
            setApplyCredit(true);
          }
        }
      } catch (e) {
        console.error("Error fetching active credit:", e);
      }
    };
    fetchActiveCredit();
  }, [user, subtotal]);

  useEffect(() => {
    if (user) {
      setBuyForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleWhatsAppCartOrder = async () => {
    if (
      !buyForm.name ||
      !buyForm.phone ||
      !buyForm.address ||
      !buyForm.city ||
      !buyForm.pincode
    ) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    let generatedOrderId = "AVR-1001";
    let newlyUnlocked = null;

    try {
      // Save order to NestJS PostgreSQL Database & process promotional credit redemption/generation
      const orderRes = await axios.post(`${API}/orders/checkout`, {
        userId: user?.id,
        userEmail: user?.email,
        totalAmount: grandTotal,
        originalSubtotal: subtotal,
        appliedCreditId: applyCredit && isCreditEligible ? activeCredit?.id : undefined,
        appliedCreditCode: applyCredit && isCreditEligible ? activeCredit?.code : undefined,
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          price: Number(item.price),
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.imageUrl,
        })),
        shippingAddress: {
          fullName: buyForm.name,
          phone: buyForm.phone,
          addressLine1: buyForm.address,
          city: buyForm.city,
          pincode: buyForm.pincode,
          note: buyForm.note,
        }
      });

      if (orderRes.data && orderRes.data.orderId) {
        generatedOrderId = orderRes.data.orderId;

        // Record coupon application in backend
        if (appliedCoupon) {
          try {
            await axios.post(`${API}/coupons/apply`, {
              code: appliedCoupon.code,
              orderId: generatedOrderId,
              discountApplied: couponDiscount,
              userId: user?.id,
              userEmail: user?.email,
            });
          } catch (e) {
            console.error("Failed to record coupon application:", e);
          }
        }

        // Check if a new ₹2,000 credit was unlocked
        if (orderRes.data.unlockedCredit) {
          newlyUnlocked = orderRes.data.unlockedCredit;
        } else if (subtotal >= 5000) {
          newlyUnlocked = {
            code: `SC-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: 2000,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }

        // Store in user local orders history
        try {
          const localOrders = JSON.parse(localStorage.getItem('avora_local_orders') || '[]');
          localOrders.unshift(orderRes.data);
          localStorage.setItem('avora_local_orders', JSON.stringify(localOrders));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Cart order creation in DB error:", err);
      if (subtotal >= 5000) {
        newlyUnlocked = {
          code: `SC-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: 2000,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
    }

    let itemsListText = cartItems
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.productName}*\n   Size: ${item.size || "N/A"} | Qty: ${item.quantity} | Price: Rs. ${item.price * item.quantity}`
      )
      .join("\n\n");

    const paymentText =
      buyForm.payment === "cod"
        ? "Cash on Delivery (COD)"
        : "Online Payment (QR Code)";

    const creditAppliedText = creditDiscount > 0 ? `\n🎁 *CREDIT APPLIED:* -Rs. ${creditDiscount.toFixed(2)} (${activeCredit?.code})` : "";
    const couponAppliedText = couponDiscount > 0 ? `\n🎟️ *COUPON APPLIED:* -Rs. ${couponDiscount.toFixed(2)} (${appliedCoupon?.code})` : "";

    const msg = `🛍️ *NEW CART ORDER - AVORA*
🆔 *ORDER ID: ${generatedOrderId}*

*ORDER ITEMS:*
${itemsListText}

-----------------------------
*SUBTOTAL:* Rs. ${subtotal.toFixed(2)}${creditAppliedText}${couponAppliedText}
*GST (${gstRate}%):* Rs. ${gstAmount.toFixed(2)}
*TOTAL AMOUNT (incl. GST):* Rs. ${grandTotal.toFixed(2)}
*TOTAL ITEMS:* ${cartItems.reduce((sum, item) => sum + item.quantity, 0)}

*CUSTOMER DETAILS:*
👤 *Name:* ${buyForm.name}
📞 *Phone:* ${buyForm.phone}
📍 *Address:* ${buyForm.address}, ${buyForm.city} - ${buyForm.pincode}
${buyForm.note ? `📝 *Note:* ${buyForm.note}\n` : ""}💳 *Payment Method:* ${paymentText}

Please confirm my order. Thank you!`;

    const phone = "7623876280";
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowBuyModal(false);

    // If order unlocked ₹2,000 credit, trigger post-payment popup modal!
    if (newlyUnlocked) {
      setTimeout(() => {
        setUnlockedCredit(newlyUnlocked);
      }, 500);
    }
  };

  // ─── Razorpay Online Payment Handler ─────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    if (
      !buyForm.name ||
      !buyForm.phone ||
      !buyForm.address ||
      !buyForm.city ||
      !buyForm.pincode
    ) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    setRazorpayLoading(true);
    let generatedOrderId = "";
    let newlyUnlocked = null;

    try {
      // Step 1: Create DB order
      const orderRes = await axios.post(`${API}/orders/checkout`, {
        userId: user?.id,
        userEmail: user?.email,
        totalAmount: grandTotal,
        originalSubtotal: subtotal,
        paymentMethod: "razorpay",
        appliedCreditId: applyCredit && isCreditEligible ? activeCredit?.id : undefined,
        appliedCreditCode: applyCredit && isCreditEligible ? activeCredit?.code : undefined,
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          price: Number(item.price),
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.imageUrl,
        })),
        shippingAddress: {
          fullName: buyForm.name,
          phone: buyForm.phone,
          addressLine1: buyForm.address,
          city: buyForm.city,
          pincode: buyForm.pincode,
          note: buyForm.note,
        },
      });

      if (!orderRes.data?.orderId) throw new Error("Order creation failed");
      generatedOrderId = orderRes.data.orderId;

      if (orderRes.data.unlockedCredit) {
        newlyUnlocked = orderRes.data.unlockedCredit;
      }

      // Record coupon if applied
      if (appliedCoupon) {
        try {
          await axios.post(`${API}/coupons/apply`, {
            code: appliedCoupon.code,
            orderId: generatedOrderId,
            discountApplied: couponDiscount,
            userId: user?.id,
            userEmail: user?.email,
          });
        } catch (e) {
          console.error("Failed to record coupon:", e);
        }
      }

      // Step 2: Create Razorpay order on our backend
      const rzpOrderRes = await axios.post(`${API}/payments/razorpay/create-order`, {
        dbOrderId: generatedOrderId,
        amount: grandTotal,
      });

      const { razorpayOrderId, amount, currency, keyId } = rzpOrderRes.data;

      if (!keyId || keyId === "" || keyId.includes("placeholder")) {
        throw new Error("Razorpay API keys are not configured. Please add RAZORPAY_KEY_ID to your backend .env file.");
      }

      // Step 3: Load Razorpay checkout.js dynamically if not already loaded
      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
        document.head.appendChild(script);
      });

      setRazorpayLoading(false);

      // Step 4: Open Razorpay checkout popup
      await new Promise((resolve, reject) => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "AVORA",
          description: `Order ${generatedOrderId} — ${cartItems.length} item(s)`,
          order_id: razorpayOrderId,
          prefill: {
            name: buyForm.name,
            contact: buyForm.phone,
            email: user?.email || "",
          },
          notes: {
            avora_order_id: generatedOrderId,
            address: `${buyForm.address}, ${buyForm.city} - ${buyForm.pincode}`,
          },
          theme: {
            color: "#c86f49",
            backdrop_color: "rgba(0,0,0,0.6)",
          },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled by user"));
            },
          },
          handler: async (response) => {
            try {
              // Step 5: Verify payment signature on our backend
              const verifyRes = await axios.post(`${API}/payments/razorpay/verify`, {
                dbOrderId: generatedOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data?.success) {
                // Store in local orders history
                try {
                  const localOrders = JSON.parse(localStorage.getItem("avora_local_orders") || "[]");
                  localOrders.unshift(orderRes.data);
                  localStorage.setItem("avora_local_orders", JSON.stringify(localOrders));
                } catch (e) {}

                // Send WhatsApp notification to store (so owner gets notified)
                const paymentText = `Online Payment (Razorpay) — ID: ${response.razorpay_payment_id}`;
                const creditAppliedText = creditDiscount > 0 ? `\n🎁 *CREDIT APPLIED:* -Rs. ${creditDiscount.toFixed(2)} (${activeCredit?.code})` : "";
                const couponAppliedText = couponDiscount > 0 ? `\n🎟️ *COUPON APPLIED:* -Rs. ${couponDiscount.toFixed(2)} (${appliedCoupon?.code})` : "";
                const itemsListText = cartItems
                  .map((item, idx) => `${idx + 1}. *${item.productName}*\n   Size: ${item.size || "N/A"} | Qty: ${item.quantity} | Price: Rs. ${item.price * item.quantity}`)
                  .join("\n\n");

                const msg = `💳 *RAZORPAY PAYMENT RECEIVED — AVORA*
🆔 *ORDER ID: ${generatedOrderId}*
✅ *Payment Verified & Confirmed!*

*ORDER ITEMS:*
${itemsListText}

-----------------------------
*SUBTOTAL:* Rs. ${subtotal.toFixed(2)}${creditAppliedText}${couponAppliedText}
*GST (${gstRate}%):* Rs. ${gstAmount.toFixed(2)}
*TOTAL PAID (incl. GST):* Rs. ${grandTotal.toFixed(2)}

*CUSTOMER DETAILS:*
👤 *Name:* ${buyForm.name}
📞 *Phone:* ${buyForm.phone}
📍 *Address:* ${buyForm.address}, ${buyForm.city} - ${buyForm.pincode}
${buyForm.note ? `📝 *Note:* ${buyForm.note}\n` : ""}💳 *Payment:* ${paymentText}

Payment is confirmed. Please process this order!`;

                const waPhone = "7623876280";
                const waUrl = `https://wa.me/91${waPhone}?text=${encodeURIComponent(msg)}`;
                window.open(waUrl, "_blank");

                setShowBuyModal(false);
                clearCart();

                if (newlyUnlocked) {
                  setTimeout(() => setUnlockedCredit(newlyUnlocked), 600);
                }

                resolve(true);
              } else {
                reject(new Error("Payment verification failed on server"));
              }
            } catch (err) {
              reject(err);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          console.error("Razorpay payment failed:", response.error);
          reject(new Error(response.error?.description || "Payment failed"));
        });
        rzp.open();
      });

    } catch (err) {
      setRazorpayLoading(false);
      const msg = err?.message || "Payment failed. Please try again.";
      if (msg.includes("cancelled")) {
        console.log("Razorpay popup closed by user");
      } else {
        alert(`❌ ${msg}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-6 w-32 mt-4 md:mt-0" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-4">
                  <Skeleton className="h-40 w-full " />
                  <Skeleton className="h-80 w-full " />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-4">🛒</div>

            <h1 className="text-3xl font-bold mb-3">
              Your Cart is Empty
            </h1>

            <p className="text-[var(--muted)] mb-6">
              Looks like you haven't added anything yet.
            </p>

            <Link
              to="/store"
              className="inline-flex items-center justify-center  bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

          {/* Header */}
          <div className="border-b border-[var(--border)] pb-6 md:pb-8 mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light uppercase tracking-widest mb-2">
              Your Cart
            </h1>
            <p className="text-xs md:text-sm text-[var(--muted)] tracking-wide">
              {cartItems.length} {cartItems.length === 1 ? 'ITEM' : 'ITEMS'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4 md:space-y-5">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5 flex gap-4 md:gap-5"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-24 h-28 md:w-28 md:h-32 object-cover flex-shrink-0 border border-[var(--border)]"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm md:text-base font-semibold uppercase tracking-wide truncate">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider">
                          <span>Size: {item.size || "N/A"}</span>
                          {item.category && <span>{item.category}</span>}
                          <span className="text-green-600">Free Shipping</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex-shrink-0 text-[10px] md:text-xs text-[var(--muted)] hover:text-red-500 uppercase tracking-wider transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-3 flex-wrap mt-4 md:mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-[var(--border)]">
                        <button
                          onClick={() =>
                            updateCart(
                              item.id,
                              Math.max(1, item.quantity - 1),
                              item.size
                            )
                          }
                          className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--bg)] transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium min-w-[36px] md:min-w-[44px] text-center border-x border-[var(--border)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCart(
                              item.id,
                              item.quantity + 1,
                              item.size
                            )
                          }
                          className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--bg)] transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] md:text-xs text-[var(--muted)]">
                          ₹{item.price} × {item.quantity}
                        </p>
                        <p className="text-base md:text-lg font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-4 md:top-8">
                
                <div className="border border-[var(--border)] p-4 md:p-6 lg:p-8">
                  <h2 className="text-base md:text-lg lg:text-xl font-medium uppercase tracking-widest mb-4 md:mb-6 lg:mb-8 pb-4 border-b border-[var(--border)]">
                    Order Summary
                  </h2>

                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {/* Shopping Credit Application Box */}
                    {activeCredit && (
                      <div
                        style={{
                          background: isCreditEligible ? "rgba(34, 197, 94, 0.08)" : "rgba(245, 158, 11, 0.08)",
                          border: `1px solid ${isCreditEligible ? "rgba(34, 197, 94, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                          padding: "12px 14px",
                          borderRadius: 6,
                          margin: "12px 0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>🎁</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                                Apply ₹2,000 Shopping Credit
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                                Code: {activeCredit.code} (Min ₹6,000 order)
                              </p>
                            </div>
                          </div>

                          <label style={{ position: "relative", display: "inline-block", width: 36, height: 20, cursor: isCreditEligible ? "pointer" : "not-allowed" }}>
                            <input
                              type="checkbox"
                              disabled={!isCreditEligible}
                              checked={applyCredit && isCreditEligible}
                              onChange={(e) => setApplyCredit(e.target.checked)}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: applyCredit && isCreditEligible ? "var(--primary)" : "#cbd5e1",
                                borderRadius: 20,
                                transition: "0.2s",
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  content: '""',
                                  height: 14,
                                  width: 14,
                                  left: applyCredit && isCreditEligible ? 18 : 3,
                                  bottom: 3,
                                  background: "#fff",
                                  borderRadius: "50%",
                                  transition: "0.2s",
                                }}
                              />
                            </span>
                          </label>
                        </div>

                        {!isCreditEligible && (
                          <div style={{ marginTop: 8, fontSize: 11, color: "#d97706", fontWeight: 600, borderTop: "1px dashed rgba(245,158,11,0.3)", paddingTop: 6 }}>
                            ⚠️ Add ₹{(minOrderValue - subtotal).toFixed(2)} more to unlock ₹2,000 discount!
                          </div>
                        )}
                      </div>
                    )}

                    {creditDiscount > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-600 font-semibold">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                          <span>🎁</span> Shopping Credit ({activeCredit?.code})
                        </span>
                        <span>-₹{creditDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">Shipping</span>
                      <span className="text-green-600 font-medium uppercase tracking-wider">FREE</span>
                    </div>

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">
                        GST ({gstRate}%)
                      </span>
                      <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 md:pt-6 mb-6 md:mb-8">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs md:text-sm uppercase tracking-wider text-[var(--muted)]">Total (incl. GST)</span>
                      <span className="text-xl md:text-2xl font-light">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full bg-[var(--text)] text-[var(--bg)] py-3 md:py-4 text-xs md:text-sm font-medium uppercase tracking-widest hover:opacity-90 transition mb-3 md:mb-4"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full border border-[var(--border)] py-3 md:py-4 text-xs md:text-sm font-medium uppercase tracking-widest hover:bg-[var(--surface)] transition"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 md:mt-6 space-y-2 md:space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider">
                    <span>🔒</span>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider">
                    <span>🚚</span>
                    <span>Free Shipping on Orders Above ₹999</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider">
                    <span>↩️</span>
                    <span>Easy Returns & Exchanges</span>
                  </div>
                </div>

                <Link
                  to="/store"
                  className="block text-center mt-6 md:mt-8 text-xs md:text-sm text-[var(--primary)] hover:underline uppercase tracking-wider"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Buy Now Order Modal — Login Style & Square Theme */}
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
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 460,
            maxHeight: "92vh",
            overflowY: "auto",
            scrollbarWidth: "none",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 0,
            padding: "36px 36px 28px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
            animation: "fadeInUp 0.35s ease-out both",
          }}>
            {/* Background decorative circles */}
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
                transition: "all 0.2s", borderRadius: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* AVORA Logo */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p className="logo-text" style={{ color: "var(--primary)", fontSize: "2rem", margin: 0 }}>AVORA</p>
              <p style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.18em", marginTop: 4, textTransform: "uppercase", margin: "4px 0 0" }}>
                Premium Avora
              </p>
            </div>

            {/* Heading */}
            <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: "0 0 4px", textAlign: "center" }}>
              Place Your Cart Order
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", margin: "0 0 24px" }}>
              Fill in your details to complete your order
            </p>

            {/* Cart Items Summary List */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Cart Items ({cartItems.length})
              </p>
              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 0,
                      padding: "10px 12px",
                      display: "flex", gap: 12, alignItems: "center",
                    }}
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.productName} style={{ width: 48, height: 48, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muted)" }}>
                        Size: <strong style={{ color: "var(--primary)" }}>{item.size || "N/A"}</strong>
                        <span style={{ margin: "0 6px", color: "var(--border)" }}>|</span>
                        Qty: <strong style={{ color: "var(--text)" }}>{item.quantity}</strong>
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#c86f49", flexShrink: 0 }}>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total Summary Row */}
              <div style={{
                background: "rgba(33,45,67,0.05)",
                border: "1px solid var(--border)",
                padding: "12px 14px",
                marginTop: 10,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {creditDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                    <span>Credit ({activeCredit?.code}):</span>
                    <span>-₹{creditDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                    <span>Coupon ({appliedCoupon?.code}):</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>GST ({gstRate}%):</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>+₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#c86f49", paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                  <span>Total Amount (incl. GST):</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              padding: "14px 16px",
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ color: "var(--text)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🎟️</span> Have a Coupon Code?
                </label>
              </div>

              {!appliedCoupon ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                    placeholder="ENTER COUPON CODE"
                    style={{
                      flex: 1,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      padding: "10px 12px",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      outline: "none",
                      borderRadius: 0,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    style={{
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: couponLoading || !couponCodeInput.trim() ? "not-allowed" : "pointer",
                      opacity: couponLoading || !couponCodeInput.trim() ? 0.6 : 1,
                      borderRadius: 0,
                    }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(22,163,74,0.08)",
                  border: "1px solid rgba(22,163,74,0.3)",
                  padding: "10px 14px",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#16a34a", fontFamily: "monospace" }}>
                      🎟️ {appliedCoupon.code}
                    </div>
                    <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>
                      Saving ₹{couponDiscount.toFixed(2)} on this order
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    Remove ✕
                  </button>
                </div>
              )}

              {couponMsg && !appliedCoupon && (
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  marginTop: 8,
                  color: couponMsg.isError ? "#ef4444" : "#16a34a",
                }}>
                  {couponMsg.text}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Delivery Info</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Form Fields */}
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
                      borderRadius: 0,
                    }}
                    onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(33,45,67,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}

              {/* Payment Method */}
              <div>
                <label style={{ color: "var(--text)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", display: "block", marginBottom: 10, textTransform: "uppercase" }}>
                  Payment Method <span style={{ color: "#c86f49" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    {
                      value: "cod",
                      label: "Cash on Delivery",
                      sublabel: "Pay when you receive",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="0"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
                      ),
                    },
                    {
                      value: "qr",
                      label: "QR / UPI",
                      sublabel: "Pay via UPI / QR Code",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="0"/><rect x="14" y="3" width="7" height="7" rx="0"/><rect x="3" y="14" width="7" height="7" rx="0"/><path d="M14 14h2v2h-2zM18 14h3v3M21 18v3h-3M14 18h2v3"/></svg>
                      ),
                    },
                    {
                      value: "razorpay",
                      label: "Pay Online",
                      sublabel: "GPay • UPI • Card • NB",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      ),
                      badge: "INSTANT",
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
                          padding: "12px 8px",
                          background: isSel ? "var(--primary)" : "var(--bg)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          position: "relative",
                          borderRadius: 0,
                        }}
                      >
                        {isSel && (
                          <div style={{
                            position: "absolute", top: 6, right: 6,
                            width: 14, height: 14, borderRadius: "50%",
                            background: "#c86f49",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                        {opt.badge && (
                          <div style={{
                            position: "absolute", top: 0, left: 0,
                            background: isSel ? "#c86f49" : "#22c55e",
                            color: "#fff",
                            fontSize: 8, fontWeight: 800, letterSpacing: "0.05em",
                            padding: "2px 5px",
                          }}>
                            {opt.badge}
                          </div>
                        )}
                        <div style={{ color: isSel ? "rgba(255,255,255,0.7)" : "var(--muted)", marginTop: opt.badge ? 10 : 0 }}>
                          {opt.icon}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isSel ? "#fff" : "var(--text)", letterSpacing: "0.01em", lineHeight: 1.2 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 9, color: isSel ? "rgba(255,255,255,0.55)" : "var(--muted)", letterSpacing: "0.02em" }}>
                          {opt.sublabel}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Razorpay accepted payment methods banner */}
                {buyForm.payment === "razorpay" && (
                  <div style={{
                    marginTop: 10,
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em" }}>Accepted:</span>
                    {["Google Pay", "PhonePe", "Paytm", "UPI", "Visa", "Mastercard", "Net Banking", "Wallets"].map(method => (
                      <span key={method} style={{
                        fontSize: 10, fontWeight: 600,
                        background: "rgba(22,163,74,0.1)",
                        color: "#15803d",
                        padding: "2px 7px",
                        borderRadius: 20,
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}>{method}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button — changes based on payment method */}
              {buyForm.payment === "razorpay" ? (
                <button
                  onClick={handleRazorpayPayment}
                  disabled={razorpayLoading}
                  style={{
                    marginTop: 8,
                    background: razorpayLoading ? "rgba(200,111,73,0.6)" : "linear-gradient(135deg, #c86f49 0%, #a85a38 100%)",
                    border: "none",
                    padding: "14px",
                    color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: "0.06em",
                    cursor: razorpayLoading ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    borderRadius: 0,
                    boxShadow: razorpayLoading ? "none" : "0 4px 16px rgba(200,111,73,0.35)",
                  }}
                  onMouseEnter={e => { if (!razorpayLoading) e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,111,73,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = razorpayLoading ? "none" : "0 4px 16px rgba(200,111,73,0.35)"; }}
                >
                  {razorpayLoading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      Pay Now ₹{grandTotal.toFixed(2)} →
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppCartOrder}
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
                    borderRadius: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(33,45,67,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.847L.057 23.882a.5.5 0 0 0 .613.613l6.077-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.377l-.374-.215-3.875.937.953-3.793-.234-.389A9.948 9.948 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Send Cart Order on WhatsApp →
                </button>
              )}
            </div>

            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, margin: "18px 0 0" }}>
              Your details are safe &amp; secure
            </p>
          </div>
        </div>
      )}

      {unlockedCredit && (
        <CreditUnlockedModal
          credit={unlockedCredit}
          onClose={() => setUnlockedCredit(null)}
        />
      )}

      <Footer />
    </>
  );
}
