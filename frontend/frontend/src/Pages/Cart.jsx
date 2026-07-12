import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import Footer from "../Component/Footer";
import { CartItemSkeleton } from "../Component/Skeleton";
import Skeleton from "../Component/Skeleton";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateCart,
    cartTotal,
    clearCart,
    loading,
  } = useCart();

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
            <div className="lg:col-span-8 space-y-4 md:space-y-6">

              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`border-b border-[var(--border)] pb-6 md:pb-8 ${index === cartItems.length - 1 ? 'border-b-0' : ''}`}
                >
                  <div className="flex gap-4 md:gap-8">

                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-24 h-28 md:w-32 md:h-40 object-cover flex-shrink-0"
                    />

                    <div className="flex-1">

                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <h3 className="text-sm md:text-base lg:text-lg font-medium uppercase tracking-wide mb-1">
                            {item.productName}
                          </h3>
                          <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider">
                            <span>Size: {item.size || "N/A"}</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] md:text-xs text-[var(--muted)] hover:text-red-500 uppercase tracking-wider transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                        <div className="flex items-center gap-2 md:gap-4">
                          <span className="text-lg md:text-xl font-light">
                            ₹{item.price}
                          </span>
                          <span className="text-[10px] md:text-xs text-green-600 uppercase tracking-wider">
                            Free Shipping
                          </span>
                        </div>

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
                            className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--surface)] transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium min-w-[40px] md:min-w-[48px] text-center">
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
                            className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm hover:bg-[var(--surface)] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right mt-3 md:mt-4">
                        <span className="text-base md:text-lg font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
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
                      <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">Shipping</span>
                      <span className="text-green-600 font-medium uppercase tracking-wider">FREE</span>
                    </div>

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">Tax</span>
                      <span className="font-medium">₹0</span>
                    </div>

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-[var(--muted)] uppercase tracking-wider">Discount</span>
                      <span className="text-green-600 font-medium uppercase tracking-wider">-₹0</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 md:pt-6 mb-6 md:mb-8">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs md:text-sm uppercase tracking-wider text-[var(--muted)]">Total</span>
                      <span className="text-xl md:text-2xl font-light">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button className="w-full bg-[var(--text)] text-[var(--bg)] py-3 md:py-4 text-xs md:text-sm font-medium uppercase tracking-widest hover:opacity-90 transition mb-3 md:mb-4">
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
      <Footer />
    </>
  );
}
