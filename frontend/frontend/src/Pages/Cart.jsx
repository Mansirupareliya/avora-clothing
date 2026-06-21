import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateCart, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link
            to="/store"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <h1 className="text-lg font-bold mb-4">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border border-[var(--border)] rounded p-3 bg-[var(--surface)]"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-xs">{item.productName}</h3>
                    <p className="text-xs text-[var(--muted)]">Size: {item.size || "N/A"}</p>
                    <p className="text-xs text-[var(--muted)]">Category: {item.category}</p>
                    <p className="font-semibold text-xs mt-1">₹{item.price}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-xs text-[var(--muted)]">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCart(item.id, Number(e.target.value), item.size)
                        }
                        className="w-10 border border-[var(--border)] rounded px-1 py-0 text-xs bg-[var(--bg)]"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-[#c86f49] hover:text-red-600 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)] sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-[var(--border)]">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-[#c86f49]">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <button className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 mb-3">
                Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full border border-[var(--border)] text-[var(--text)] font-semibold py-3 rounded-lg hover:bg-[var(--bg)]"
              >
                Clear Cart
              </button>

              <Link
                to="/store"
                className="block text-center mt-4 text-sm text-[var(--primary)] hover:text-[var(--text)]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
