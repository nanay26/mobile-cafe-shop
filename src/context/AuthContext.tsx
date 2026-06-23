import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, setUnauthorizedCallback } from '../api/client';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek token yang tersimpan saat app pertama kali dibuka
    checkToken();

    // Register callback auto-logout saat interceptor menangkap HTTP 401
    setUnauthorizedCallback(() => {
      setIsAdmin(false);
    });
  }, []);

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('admin_token');
      setIsAdmin(!!token);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const res = await apiClient.post('/auth/mobile-login', {
      username,
      password,
    });
    await SecureStore.setItemAsync('admin_token', res.data.token);
    setIsAdmin(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('admin_token');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
