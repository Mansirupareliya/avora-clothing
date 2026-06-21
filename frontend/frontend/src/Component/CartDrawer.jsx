import { useCart } from "../context/CartContext";

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateCart, cartTotal, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--surface)] shadow-2xl overflow-y-auto z-50">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--surface)]">
          <h2 className="font-bold text-sm">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-lg hover:text-[#c86f49] transition"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--muted)]">
            Your cart is empty
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 border border-[var(--border)] rounded p-2 bg-[var(--bg)]"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-xs">{item.productName}</h4>
                      <p className="text-xs text-[var(--muted)]">₹{item.price}</p>
                      {item.size && (
                        <p className="text-xs text-[var(--muted)]">Size: {item.size}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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

                  <div className="text-right text-xs font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg)] space-y-2 text-xs sticky bottom-0">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Shipping:</span>
                <span className="text-[#c86f49]">Free</span>
              </div>
              <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <button className="w-full bg-[var(--primary)] text-white font-semibold py-2 rounded text-xs hover:bg-opacity-90 mt-2">
                Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full border border-[var(--border)] text-[var(--text)] font-semibold py-2 rounded text-xs hover:bg-[var(--surface)]"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
