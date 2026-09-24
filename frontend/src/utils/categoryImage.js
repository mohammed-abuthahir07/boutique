import { getImageUrl } from '../config/apiConfig';

/**
 * Resolves a category.image path from the Categories API
 * (e.g. "/uploads/categories/category-....jpg") to a browser URL.
 */
export function getCategoryImageUrl(categoryOrPath) {
  if (!categoryOrPath) return null;
  const path = typeof categoryOrPath === 'string' ? categoryOrPath : categoryOrPath.image;
  return getImageUrl(path) || null;
}
