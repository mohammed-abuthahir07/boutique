import apiClient from './apiClient';

/**
 * Customer APIs (Authentication, Profile, Favorites, Cart, Orders)
 * All protected endpoints automatically include customer Bearer JWT.
 */
export const customerService = {
  // === AUTHENTICATION ===

  /**
   * Register a new customer
   * @param {Object} data - { name, email, phone, password }
   */
  async register(data) {
    const res = await apiClient.post('/api/customer/auth/register', data);
    if (res.token) {
      apiClient.setCustomerToken(res.token);
    }
    return res;
  },

  /**
   * Login with email and password
   * @param {Object} data - { email, password }
   */
  async login(data) {
    const res = await apiClient.post('/api/customer/auth/login', data);
    if (res.token) {
      apiClient.setCustomerToken(res.token);
    }
    return res;
  },

  /**
   * Login with Google ID token credential
   * @param {string} credential - Google OAuth ID Token
   */
  async googleLogin(credential) {
    const res = await apiClient.post('/api/customer/auth/google', { credential });
    if (res.token) {
      apiClient.setCustomerToken(res.token);
    }
    return res;
  },

  /**
   * Get authenticated customer profile via auth router
   */
  async getAuthProfile() {
    return apiClient.get('/api/customer/auth/profile', { authType: 'customer' });
  },

  /**
   * Logout helper
   */
  logout() {
    apiClient.setCustomerToken(null);
  },

  // === PROFILE (via profile router with profile_image support) ===

  /**
   * Get full customer profile
   * Returns { success: true, customer: { id, name, email, phone, profile_image, status, ... } }
   */
  async getProfile() {
    if (!apiClient.getCustomerToken()) {
      const error = new Error('Customer authentication required');
      error.status = 401;
      throw error;
    }
    return apiClient.get('/api/customer/profile', { authType: 'customer' });
  },

  /**
   * Update customer profile name, phone, and optional profile image.
   * @param {Object|FormData} data - { name, phone } or FormData with profile_image
   */
  async updateProfile(data) {
    return apiClient.put('/api/customer/profile', data, { authType: 'customer' });
  },

  /**
   * Permanently delete the authenticated customer's account.
   * Customer ID is taken from the JWT on the server.
   */
  async deleteAccount() {
    return apiClient.delete('/api/customer/account', { authType: 'customer' });
  },

  // === FAVORITES ===

  /**
   * Add a product to favorites
   * @param {number|string} productId
   */
  async addFavorite(productId) {
    return apiClient.post(`/api/customer/favorites/${productId}`, null, { authType: 'customer' });
  },

  /**
   * Get all active favorites for logged in customer
   */
  async getFavorites() {
    return apiClient.get('/api/customer/favorites', { authType: 'customer' });
  },

  /**
   * Check if a product is in customer's favorites
   * @param {number|string} productId
   */
  async checkFavorite(productId) {
    return apiClient.get(`/api/customer/favorites/${productId}`, { authType: 'customer' });
  },

  /**
   * Remove product from customer's favorites
   * @param {number|string} productId
   */
  async removeFavorite(productId) {
    return apiClient.delete(`/api/customer/favorites/${productId}`, { authType: 'customer' });
  },

  // === CART ===

  /**
   * Add product variant to cart
   * @param {Object} data - { product_id, variant_id, quantity }
   */
  async addToCart(data) {
    return apiClient.post('/api/customer/cart', data, { authType: 'customer' });
  },

  /**
   * Get current customer's cart
   * Returns { success: true, cart: { items, item_count, total_quantity, subtotal, total } }
   */
  async getCart() {
    return apiClient.get('/api/customer/cart', { authType: 'customer' });
  },

  /**
   * Update quantity of a cart item
   * @param {number|string} itemId - customer_cart_items.id
   * @param {number} quantity
   */
  async updateCartItem(itemId, quantity) {
    return apiClient.put(`/api/customer/cart/items/${itemId}`, { quantity }, { authType: 'customer' });
  },

  /**
   * Remove an item from cart
   * @param {number|string} itemId - customer_cart_items.id
   */
  async removeCartItem(itemId) {
    return apiClient.delete(`/api/customer/cart/items/${itemId}`, { authType: 'customer' });
  },

  // === ORDERS ===

  /**
   * Place an order from current cart items
   * @param {Object} data - { name, email, phone, shipping_address }
   */
  async createOrder(data) {
    return apiClient.post('/api/customer/orders', data, { authType: 'customer' });
  },

  async createRazorpayOrder(data) {
    return apiClient.post('/api/customer/payment/razorpay/create-order', data, { authType: 'customer' });
  },

  async verifyRazorpayPayment(data) {
    return apiClient.post('/api/customer/payment/razorpay/verify', data, { authType: 'customer' });
  },

  /**
   * Get list of customer orders
   * Returns { success: true, count: number, orders: [...] }
   */
  async getMyOrders() {
    return apiClient.get('/api/customer/orders', { authType: 'customer' });
  },

  /**
   * Get details of a single customer order by numeric ID
   * @param {number|string} id - orders.id
   */
  async getOrderById(id) {
    return apiClient.get(`/api/customer/orders/${id}`, { authType: 'customer' });
  },
};

export default customerService;
