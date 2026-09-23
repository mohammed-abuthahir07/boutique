import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { CatalogProvider } from '../../context/CatalogContext';
import './CustomerLayout.css';

export default function CustomerLayout() {
  useEffect(() => {
    const header = document.querySelector('.header');
    const sync = () => {
      const height = header?.offsetHeight || 148;
      document.documentElement.style.setProperty('--store-header-h', `${height}px`);
    };
    sync();
    window.addEventListener('resize', sync);
    const timer = window.setTimeout(sync, 80);
    return () => {
      window.removeEventListener('resize', sync);
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
