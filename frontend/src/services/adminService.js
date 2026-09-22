import apiClient from './apiClient';

/**
 * Admin APIs
 * Every endpoint strictly adheres to BACKEND_API_DOCUMENTATION.md.
 */
export const adminService = {
  // === AUTHENTICATION ===

  async login(data) {
    const res = await apiClient.post('/api/admin/auth/login', data);
    if (res.token) {
      apiClient.setAdminToken(res.token);
    }
    return res;
  },

  async getProfile() {
    return apiClient.get('/api/admin/auth/profile', { authType: 'admin' });
  },

  logout() {
    apiClient.setAdminToken(null);
  },

  // === CATEGORIES ===

  async getCategories() {
    return apiClient.get('/api/admin/categories', { authType: 'admin' });
  },

  async getCategoryById(id) {
    return apiClient.get(`/api/admin/categories/${id}`, { authType: 'admin' });
  },

  async createCategory(data) {
    return apiClient.post('/api/admin/categories', data, { authType: 'admin' });
  },

  async updateCategory(id, data) {
    return apiClient.put(`/api/admin/categories/${id}`, data, { authType: 'admin' });
  },

  async deleteCategory(id) {
    return apiClient.delete(`/api/admin/categories/${id}`, { authType: 'admin' });
  },

  // === PRODUCTS ===

  async getProducts() {
    return apiClient.get('/api/admin/products', { authType: 'admin' });
  },

  async getProductById(id) {
    return apiClient.get(`/api/admin/products/${id}`, { authType: 'admin' });
  },

  async createProduct(data) {
    return apiClient.post('/api/admin/products', data, { authType: 'admin' });
  },

  async updateProduct(id, data) {
    return apiClient.put(`/api/admin/products/${id}`, data, { authType: 'admin' });
  },

  async deleteProduct(id) {
    return apiClient.delete(`/api/admin/products/${id}`, { authType: 'admin' });
  },

  // === PRODUCT VARIANTS ===

  async createVariant(productId, data) {
    return apiClient.post(`/api/admin/products/${productId}/variants`, data, { authType: 'admin' });
  },

  async updateVariant(productId, variantId, data) {
    return apiClient.put(`/api/admin/products/${productId}/variants/${variantId}`, data, { authType: 'admin' });
  },

  async deleteVariant(productId, variantId) {
    return apiClient.delete(`/api/admin/products/${productId}/variants/${variantId}`, { authType: 'admin' });
  },

  // === PRODUCT COLOR IMAGES ===

  /**
   * Upload color images (multipart)
   * @param {number|string} productId
   * @param {string} color
   * @param {File[]} files
   */
  async uploadColorImages(productId, color, files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    return apiClient.post(`/api/admin/products/${productId}/colors/${encodeURIComponent(color)}/images`, formData, {
      authType: 'admin',
    });
  },

  async deleteColorImage(productId, color, imageId) {
    return apiClient.delete(`/api/admin/products/${productId}/colors/${encodeURIComponent(color)}/images/${imageId}`, {
      authType: 'admin',
    });
  },

  // === OFFERS ===

  async getOffers() {
    return apiClient.get('/api/admin/offers', { authType: 'admin' });
  },

  async getOfferById(id) {
    return apiClient.get(`/api/admin/offers/${id}`, { authType: 'admin' });
  },

  async createOffer(data) {
    return apiClient.post('/api/admin/offers', data, { authType: 'admin' });
  },

  async updateOffer(id, data) {
    return apiClient.put(`/api/admin/offers/${id}`, data, { authType: 'admin' });
  },

  async deleteOffer(id) {
    return apiClient.delete(`/api/admin/offers/${id}`, { authType: 'admin' });
  },

  // === ORDERS ===

  async getOrders() {
    return apiClient.get('/api/admin/orders', { authType: 'admin' });
  },

  async getOrderById(id) {
    return apiClient.get(`/api/admin/orders/${id}`, { authType: 'admin' });
  },

  async updateOrderStatus(id, order_status) {
    return apiClient.put(`/api/admin/orders/${id}/status`, { order_status }, { authType: 'admin' });
  },

  // === INVENTORY ===

  async getInventory() {
    return apiClient.get('/api/admin/inventory', { authType: 'admin' });
  },

  // === DASHBOARD ===

  async getDashboardSummary() {
    return apiClient.get('/api/admin/dashboard/summary', { authType: 'admin' });
  },

  async getDashboardMonthlyRevenue() {
    return apiClient.get('/api/admin/dashboard/monthly-revenue', { authType: 'admin' });
  },

  async getDashboardYearlyRevenue() {
    return apiClient.get('/api/admin/dashboard/yearly-revenue', { authType: 'admin' });
  },

  async getDashboardRecentOrders() {
    return apiClient.get('/api/admin/dashboard/recent-orders', { authType: 'admin' });
  },

  async getDashboardRecentProducts() {
    return apiClient.get('/api/admin/dashboard/recent-products', { authType: 'admin' });
  },

  async getDashboardLowStock() {
    return apiClient.get('/api/admin/dashboard/low-stock', { authType: 'admin' });
  },

  async getDashboardRecentActivity() {
    return apiClient.get('/api/admin/dashboard/recent-activity', { authType: 'admin' });
  },

  // === ANALYTICS ===

  async getAnalyticsSummary() {
    return apiClient.get('/api/admin/analytics/summary', { authType: 'admin' });
  },

  async getAnalyticsOrderStatus() {
    return apiClient.get('/api/admin/analytics/order-status', { authType: 'admin' });
  },

  async getAnalyticsBestSelling() {
    return apiClient.get('/api/admin/analytics/best-selling-products', { authType: 'admin' });
  },

  async getAnalyticsMonthlyOrders() {
    return apiClient.get('/api/admin/analytics/monthly-orders', { authType: 'admin' });
  },

  async getAnalyticsMonthlyRevenue() {
    return apiClient.get('/api/admin/analytics/monthly-revenue', { authType: 'admin' });
  },

  async getAnalyticsCategorySales() {
    return apiClient.get('/api/admin/analytics/category-sales', { authType: 'admin' });
  },

  // === CUSTOMERS ===

  async getCustomers() {
    return apiClient.get('/api/admin/customers', { authType: 'admin' });
  },

  async getCustomerById(id) {
    return apiClient.get(`/api/admin/customers/${id}`, { authType: 'admin' });
  },

  async getCustomerOrders(id) {
    return apiClient.get(`/api/admin/customers/${id}/orders`, { authType: 'admin' });
  },

  async getCustomerOrderDetail(id, orderId) {
    return apiClient.get(`/api/admin/customers/${id}/orders/${orderId}`, { authType: 'admin' });
  },
};

export default adminService;
