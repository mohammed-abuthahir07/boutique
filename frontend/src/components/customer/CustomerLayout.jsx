import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { CatalogProvider } from '../../context/CatalogContext';
import { syncStoreHeaderHeight } from '../../utils/storeHeaderHeight';
import './CustomerLayout.css';

export default function CustomerLayout() {
  useEffect(() => {
    syncStoreHeaderHeight();
    window.addEventListener('resize', syncStoreHeaderHeight);
    const timer = window.setTimeout(syncStoreHeaderHeight, 80);
    return () => {
      window.removeEventListener('resize', syncStoreHeaderHeight);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <CatalogProvider>
      <div className="customer-app-layout">
        <Navbar />
        <main className="customer-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CatalogProvider>
  );
}
