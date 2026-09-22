import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import apiClient from '../services/apiClient';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => apiClient.getCustomerToken());
  const [loading, setLoading] = useState(true);

  // Fetch full customer profile if token is present
  const refreshProfile = useCallback(async () => {
    const currentToken = apiClient.getCustomerToken();
    if (!currentToken) {
      setCustomer(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await customerService.getProfile();
      if (res.success && res.customer) {
        setCustomer(res.customer);
        return res.customer;
      }
      return null;
    } catch (err) {
      // If 401 or 403, token is expired/invalid/inactive
      if (err.status === 401 || err.status === 403) {
        apiClient.setCustomerToken(null);
        setToken(null);
        setCustomer(null);
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
    const res = await customerService.login({ email, password });
    if (res.token) {
      setToken(res.token);
      await refreshProfile();
    }
    return res;
  };

  const register = async (data) => {
    const res = await customerService.register(data);
    if (res.token) {
      setToken(res.token);
      await refreshProfile();
    }
    return res;
  };

  const googleLogin = async (credential) => {
    const res = await customerService.googleLogin(credential);
    if (res.token) {
      setToken(res.token);
      await refreshProfile();
    }
    return res;
  };

  const logout = () => {
    customerService.logout();
    setToken(null);
    setCustomer(null);
  };

  const isAuthenticated = Boolean(token && customer);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
