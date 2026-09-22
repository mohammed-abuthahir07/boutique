// API and Environment Configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Constructs the complete URL for an image path returned by the backend.
 * Handles paths like: "/uploads/products/xyz.jpg" -> "http://localhost:5000/uploads/products/xyz.jpg"
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop';
export const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';
