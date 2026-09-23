import React, { lazy, Suspense } from 'react';
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
import ProductDetailPage from './pages/customer/ProductDetailPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import NotFoundPage from './pages/customer/NotFoundPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Loader from './components/common/Loader';

const CategoriesPage = lazy(() => import('./pages/customer/CategoriesPage'));
const AboutPage = lazy(() => import('./pages/customer/AboutPage'));
const GalleryPage = lazy(() => import('./pages/customer/GalleryPage'));
const ContactPage = lazy(() => import('./pages/customer/ContactPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const MyOrdersPage = lazy(() => import('./pages/customer/MyOrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminProductDetailPage = lazy(() => import('./pages/admin/AdminProductDetailPage'));
const AdminOffersPage = lazy(() => import('./pages/admin/AdminOffersPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));

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
                  <Suspense fallback={<div className="page-suspense"><Loader message="Loading..." /></div>}>
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
                  </Suspense>
                </div>
              </CartProvider>
            </WishlistProvider>
          </AdminAuthProvider>
        </CustomerAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
