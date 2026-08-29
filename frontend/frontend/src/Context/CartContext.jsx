import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_API = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/cart`;
const STORAGE_KEY = 'avora_cart_items';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded – silently ignore
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // Initialise from localStorage so cart survives page refresh
  const [cartItems, setCartItems] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Keep localStorage in sync whenever cartItems changes
  useEffect(() => {
    saveToStorage(cartItems);
  }, [cartItems]);

  // ── fetchCart (still exposed so CartDrawer can call it if needed) ──────────
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(CART_API);
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cart with backend when user logs in/out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, fetchCart]);

  // ── addToCart ──────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (product, quantity, size) => {
    try {
      const response = await axios.post(`${CART_API}/add`, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity || 1,
        size: size || null,
        imageUrl: product.imageUrl,
        category: product.category,
      });
      setCartItems((prev) => {
        const existingItem = prev.find(
          (item) => item.productId === product.id && item.size === (size || null)
        );
        if (existingItem) {
          return prev.map((item) =>
            item.id === response.data.id ? response.data : item
          );
        }
        return [...prev, response.data];
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }, []);

  // ── removeFromCart ─────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      await axios.delete(`${CART_API}/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }, []);

  // ── updateCart ─────────────────────────────────────────────────────────────
  const updateCart = useCallback(async (cartItemId, quantity, size) => {
    try {
      const response = await axios.put(`${CART_API}/${cartItemId}`, {
        quantity,
        size,
      });
      setCartItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? response.data : item))
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  }, []);

  // ── clearCart ──────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      await axios.delete(CART_API);
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, []);


  // ── derived values ─────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        updateCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartContext;
