import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";

export default function Cart() {
const {
cartItems,
removeFromCart,
updateCart,
cartTotal,
clearCart,
} = useCart();

if (cartItems.length === 0) {
return ( <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4"> <div className="text-center max-w-md"> <div className="text-7xl mb-4">🛒</div>


      <h1 className="text-3xl font-bold mb-3">
        Your Cart is Empty
      </h1>

      <p className="text-[var(--muted)] mb-6">
        Looks like you haven't added anything yet.
      </p>

      <Link
        to="/store"
        className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Continue Shopping
      </Link>
    </div>
  </div>
);


}

return ( <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]"> <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">
          Shopping Cart
        </h1>

        <p className="text-sm text-[var(--muted)] mt-1">
          {cartItems.length} Item
          {cartItems.length > 1 ? "s" : ""} in your cart
        </p>
      </div>

      <Link
        to="/store"
        className="mt-4 md:mt-0 text-[var(--primary)] font-medium hover:underline"
      >
        ← Continue Shopping
      </Link>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm"
          >
            <div className="flex gap-4">

              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-28 h-32 object-cover rounded-xl flex-shrink-0"
              />

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  {item.productName}
                </h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Size: {item.size || "N/A"}
                  </span>

                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-bold">
                    ₹{item.price}
                  </span>

                  <span className="text-green-600 text-sm font-medium">
                    Free Delivery
                  </span>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-4">

                  <button
                    onClick={() =>
                      updateCart(
                        item.id,
                        Math.max(1, item.quantity - 1),
                        item.size
                      )
                    }
                    className="w-8 h-8 rounded-full border border-[var(--border)]"
                  >
                    -
                  </button>

                  <span className="font-medium">
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
                    className="w-8 h-8 rounded-full border border-[var(--border)]"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-4 text-red-500 text-sm font-medium hover:underline"
                >
                  Remove Item
                </button>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">

        <div className="sticky top-20 space-y-4">

          {/* Coupon */}
          <div className="bg-[#fff7f3] border border-[#c86f49] rounded-xl p-4">
            <h3 className="font-semibold mb-3">
              🎉 Apply Coupon
            </h3>

            <div className="flex">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="flex-1 border rounded-l-lg px-3 py-2 outline-none"
              />

              <button className="bg-[#c86f49] text-white px-4 rounded-r-lg">
                Apply
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--surface)] p-6">

            <h2 className="text-xl font-bold mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 border-b border-[var(--border)] pb-5">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">
                  FREE
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹0</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">
                  -₹0
                </span>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-5">
              🚚 Estimated Delivery:
              <span className="font-semibold ml-1">
                3 - 5 Business Days
              </span>
            </div>

            {/* Secure Payment */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              🔒 Secure Checkout & Safe Payments
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold mt-6 mb-6">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            {/* Checkout */}
            <button className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-xl hover:opacity-90 transition mb-3">
              Proceed To Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full border border-[var(--border)] py-4 rounded-xl font-semibold hover:bg-[var(--bg)] transition"
            >
              Clear Cart
            </button>

            <Link
              to="/store"
              className="block text-center mt-4 text-sm text-[var(--primary)] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>


);
}
