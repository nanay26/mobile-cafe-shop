import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Satu sumber konfigurasi untuk semua environment.
// Untuk APK di HP, set EXPO_PUBLIC_API_BASE_URL ke URL yang bisa diakses perangkat.
const DEFAULT_DEV_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://127.0.0.1:3001',
});

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (__DEV__ ? DEFAULT_DEV_URL : 'https://backend-cafe-shop-3jj2.vercel.app/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat client dengan timeout lebih lama untuk response AI
export const chatClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback untuk auto-logout saat token expired (di-set oleh AuthContext)
let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedCallback(cb: () => void) {
  onUnauthorizedCallback = cb;
}

// Interceptor: tambah JWT header ke setiap request
const addAuthHeader = async (config: any) => {
  const token = await SecureStore.getItemAsync('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));
chatClient.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));

// Interceptor: handle 401 (token expired / invalid) → auto-logout
const handle401 = async (error: any) => {
  if (error.response?.status === 401) {
    await SecureStore.deleteItemAsync('admin_token');
    // Trigger logout di AuthContext agar navigasi ke LoginScreen
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use((response) => response, handle401);
chatClient.interceptors.response.use((response) => response, handle401);

// Helper: retry request dengan exponential backoff
export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}
