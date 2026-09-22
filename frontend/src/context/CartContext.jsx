import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import { useCustomerAuth } from './CustomerAuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, customer } = useCustomerAuth();
  const { success, error } = useToast();

  const [cart, setCart] = useState({
    items: [],
    item_count: 0,
    total_quantity: 0,
    subtotal: '0.00',
    total: '0.00',
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        item_count: 0,
        total_quantity: 0,
        subtotal: '0.00',
        total: '0.00',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      // If unauthorized or network error, silently handle
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, customer]);

  const addToCart = async (productId, variantId, quantity = 1) => {
    if (!isAuthenticated) {
      error('Please sign in to add items to your cart');
      return { success: false, requireAuth: true };
    }

    try {
      const res = await customerService.addToCart({
        product_id: Number(productId),
        variant_id: Number(variantId),
        quantity: Number(quantity),
      });

      if (res.success) {
        success(res.message || 'Added to cart successfully');
        await fetchCart();
        return { success: true, cart_item: res.cart_item };
      }
      return { success: false, message: res.message };
    } catch (err) {
      error(err.message || 'Failed to add item to cart');
      return { success: false, error: err.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await customerService.updateCartItem(itemId, Number(quantity));
      if (res.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      error(err.message || 'Failed to update quantity');
      return { success: false, error: err.message };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await customerService.removeCartItem(itemId);
      if (res.success) {
        success(res.message || 'Item removed from cart');
        await fetchCart();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      error(err.message || 'Failed to remove item');
      return { success: false, error: err.message };
    }
  };

  const clearCartState = () => {
    setCart({
      items: [],
      item_count: 0,
      total_quantity: 0,
      subtotal: '0.00',
      total: '0.00',
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount: cart.total_quantity || cart.item_count || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
