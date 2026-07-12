import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const CART_API = 'http://localhost:3000/cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items on mount
  useEffect(() => {
    fetchCart();
  }, []);

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

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      await axios.delete(`${CART_API}/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }, []);

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

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(CART_API);
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
