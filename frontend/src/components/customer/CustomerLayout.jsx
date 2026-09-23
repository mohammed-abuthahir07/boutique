import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { CatalogProvider } from '../../context/CatalogContext';

export default function CustomerLayout() {
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
