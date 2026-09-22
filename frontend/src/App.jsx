import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

// Common & Route Protection
import { CustomerProtectedRoute, AdminProtectedRoute } from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts
import CustomerLayout from './components/customer/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import CategoriesPage from './pages/customer/CategoriesPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import AboutPage from './pages/customer/AboutPage';
import GalleryPage from './pages/customer/GalleryPage';
import ContactPage from './pages/customer/ContactPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import WishlistPage from './pages/customer/WishlistPage';
import ProfilePage from './pages/customer/ProfilePage';
import NotFoundPage from './pages/customer/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminProductDetailPage from './pages/admin/AdminProductDetailPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <CustomerAuthProvider>
          <AdminAuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="app-container">
                  <Routes>
                    {/* ============================================================ */}
                    {/* ADMIN PUBLIC ROUTES                                          */}
                    {/* ============================================================ */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* ============================================================ */}
                    {/* ADMIN PROTECTED ROUTES (AdminLayout & Sub-pages)             */}
                    {/* ============================================================ */}
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout />
                        </AdminProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="products/new" element={<AdminProductFormPage />} />
                      <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                      <Route path="products/:id" element={<AdminProductDetailPage />} />
                      <Route path="offers" element={<AdminOffersPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                      <Route path="inventory" element={<AdminInventoryPage />} />
                      <Route path="analytics" element={<AdminAnalyticsPage />} />
                      <Route path="customers" element={<AdminCustomersPage />} />
                    </Route>

                    {/* ============================================================ */}
                    {/* CUSTOMER STOREFRONT ROUTES (CustomerLayout with Header/Footer)*/}
                    {/* ============================================================ */}
                    <Route element={<CustomerLayout />}>
                      {/* Public Pages */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/gallery" element={<GalleryPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Customer Authenticated / Protected Pages */}
                      <Route
                        path="/cart"
                        element={
                          <CustomerProtectedRoute>
                            <CartPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <CustomerProtectedRoute>
                            <CheckoutPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/order-success"
                        element={
                          <CustomerProtectedRoute>
                            <OrderSuccessPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <CustomerProtectedRoute>
                            <MyOrdersPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <CustomerProtectedRoute>
                            <OrderDetailPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <CustomerProtectedRoute>
                            <WishlistPage />
                          </CustomerProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <CustomerProtectedRoute>
                            <ProfilePage />
                          </CustomerProtectedRoute>
                        }
                      />

                      {/* Fallback 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </div>
              </CartProvider>
            </WishlistProvider>
          </AdminAuthProvider>
        </CustomerAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
