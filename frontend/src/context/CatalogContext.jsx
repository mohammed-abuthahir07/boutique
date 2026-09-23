import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import publicService from '../services/publicService';
import { extractProductColors, extractProductSizes, sortSizes } from '../utils/colors';

const CatalogContext = createContext(null);
const CACHE_TTL_MS = 60 * 1000;

async function enrichWithColors(listed) {
  const detailed = await Promise.allSettled(
    listed.map((p) => publicService.getProductById(p.id))
  );

  return listed.map((product, index) => {
    const result = detailed[index];
    if (result.status === 'fulfilled' && result.value?.product) {
      const full = result.value.product;
      return {
        ...product,
        colors: extractProductColors(full),
        sizes: extractProductSizes(full),
      };
    }
    return {
      ...product,
      colors: extractProductColors(product),
      sizes: extractProductSizes(product),
    };
  });
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheAtRef = useRef(0);
  const inflightRef = useRef(null);

  const loadCatalog = useCallback(async (force = false) => {
    if (!force && cacheAtRef.current && Date.now() - cacheAtRef.current < CACHE_TTL_MS) {
      setLoading(false);
      return;
    }

    if (inflightRef.current) {
      await inflightRef.current;
      return;
    }

    const request = (async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, offerRes] = await Promise.allSettled([
          publicService.getProducts(),
          publicService.getOffers(),
        ]);

        let listed = [];
        if (prodRes.status === 'fulfilled' && prodRes.value.success) {
          listed = prodRes.value.products || [];
          setProducts(listed.map((p) => ({ ...p, colors: p.colors || [], sizes: p.sizes || [] })));
        } else if (prodRes.status === 'rejected') {
          setError(prodRes.reason?.message || 'Unable to load products right now.');
        }

        if (offerRes.status === 'fulfilled' && offerRes.value.success) {
          setOffers(offerRes.value.offers || []);
        }

        setLoading(false);

        if (listed.length) {
          const enriched = await enrichWithColors(listed);
          setProducts(enriched);
        }

        cacheAtRef.current = Date.now();
      } catch (err) {
        setError(err.message || 'Unable to load the store catalog.');
        setLoading(false);
      } finally {
        inflightRef.current = null;
      }
    })();

    inflightRef.current = request;
    await request;
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.category_id && p.category_name) {
        const key = String(p.category_id);
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            id: p.category_id,
            name: p.category_name,
            count: 1,
          });
        }
      }
    });
    return Array.from(map.values());
  }, [products]);

  const sizes = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      (p.sizes || []).forEach((size) => {
        const key = String(size).toLowerCase();
        map.set(key, { name: size, count: (map.get(key)?.count || 0) + 1 });
      });
    });
    return Array.from(map.values()).sort((a, b) => sortSizes(a.name, b.name));
  }, [products]);

  const colors = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      (p.colors || []).forEach((color) => {
        const key = color.toLowerCase();
        map.set(key, { name: color, count: (map.get(key)?.count || 0) + 1 });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const value = useMemo(
    () => ({
      products,
      offers,
      categories,
      colors,
      sizes,
      loading,
      error,
      refresh: () => loadCatalog(true),
    }),
    [products, offers, categories, colors, sizes, loading, error, loadCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
