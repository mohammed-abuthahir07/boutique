import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import apiClient from '../services/apiClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => apiClient.getAdminToken());
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const currentToken = apiClient.getAdminToken();
    if (!currentToken) {
      setAdmin(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await adminService.getProfile();
      if (res.success && res.admin) {
        setAdmin(res.admin);
        return res.admin;
      }
      return null;
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        adminService.logout();
        setToken(null);
        setAdmin(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email, password) => {
    const res = await adminService.login({ email, password });
    if (res.token) {
      setToken(res.token);
      await refreshProfile();
    }
    return res;
  };

  const logout = () => {
    adminService.logout();
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = Boolean(token && admin);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
