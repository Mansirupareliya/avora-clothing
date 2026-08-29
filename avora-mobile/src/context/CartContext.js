import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'avora_cart_items';

function saveToStorage(items) {
  try { AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Keep storage in sync
  useEffect(() => { saveToStorage(cartItems); }, [cartItems]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await client.get('/cart');
      setCartItems(res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  // Sync cart with backend when user logs in/out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, [user, fetchCart]);

  const addToCart = useCallback(async (product, quantity = 1, size = null, color = null) => {
    const res = await client.post('/cart/add', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      size,
      color,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.size === size && i.color === color
      );
      if (existing) return prev.map((i) => (i.id === res.data.id ? res.data : i));
      return [...prev, res.data];
    });
    return res.data;
  }, []);

  const removeFromCart = useCallback(async (cartItemId) => {
    await client.delete(`/cart/${cartItemId}`);
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const updateCart = useCallback(async (cartItemId, quantity, size) => {
    const res = await client.put(`/cart/${cartItemId}`, { quantity, size });
    setCartItems((prev) => prev.map((i) => (i.id === cartItemId ? res.data : i)));
    return res.data;
  }, []);

  const clearCart = useCallback(async () => {
    await client.delete('/cart');
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal, loading,
      addToCart, removeFromCart, updateCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

export default CartContext;
