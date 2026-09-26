import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import { useCustomerAuth } from './CustomerAuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, customer } = useCustomerAuth();
  const { success, error } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.getFavorites();
      if (res.success && Array.isArray(res.favorites)) {
        setFavorites(res.favorites);
        setFavoriteIds(new Set(res.favorites.map((f) => Number(f.product_id))));
      }
    } catch {
      // Expired or missing session: keep an empty wishlist without console noise.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, customer]);

  const clearWishlistState = () => {
    setFavorites([]);
    setFavoriteIds(new Set());
  };

  const isFavorite = useCallback(
    (productId) => {
      return favoriteIds.has(Number(productId));
    },
    [favoriteIds]
  );

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      error('Please sign in to save items to your wishlist');
      return { success: false, requireAuth: true };
    }

    const pid = Number(productId);
    const alreadySaved = favoriteIds.has(pid);

    try {
      if (alreadySaved) {
        const res = await customerService.removeFavorite(pid);
        if (res.success) {
          success(res.message || 'Removed from wishlist');
          setFavorites((prev) => prev.filter((f) => Number(f.product_id) !== pid));
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(pid);
            return next;
          });
          return { success: true, isFavorite: false };
        }
      } else {
        const res = await customerService.addFavorite(pid);
        if (res.success) {
          success(res.message || 'Added to wishlist');
          await fetchFavorites();
          return { success: true, isFavorite: true };
        }
      }
      return { success: false };
    } catch (err) {
      error(err.message || 'Failed to update wishlist');
      return { success: false, error: err.message };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        count: favorites.length,
        isFavorite,
        toggleFavorite,
        fetchFavorites,
        clearWishlistState,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
