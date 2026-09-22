import apiClient from './apiClient';

/**
 * Public APIs (No authentication required)
 */
export const publicService = {
  /**
   * Get all active public products.
   * Returns { success: true, count: number, products: [...] }
   */
  async getProducts() {
    return apiClient.get('/api/public/products');
  },

  /**
   * Get single active public product with variants and color images.
   * Returns { success: true, product: { ..., variants: [...], color_images: [...] } }
   */
  async getProductById(id) {
    return apiClient.get(`/api/public/products/${id}`);
  },

  /**
   * Get all active public offers.
   * Returns { success: true, count: number, offers: [...] }
   */
  async getOffers() {
    return apiClient.get('/api/public/offers');
  },

  /**
   * Get single active public offer.
   * Returns { success: true, offer: { ... } }
   */
  async getOfferById(id) {
    return apiClient.get(`/api/public/offers/${id}`);
  },
};

export default publicService;
