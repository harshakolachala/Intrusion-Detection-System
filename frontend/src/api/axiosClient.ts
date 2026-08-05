import axios from "axios";

/**
 * Single shared axios instance for the whole app.
 *
 * - Base URL points at the FastAPI backend (override with VITE_API_URL).
 * - Uses explicit IPv4 loopback (127.0.0.1) to avoid Windows localhost/IPv6 preflight CORS issues.
 * - Request interceptor attaches the JWT (if present) to every call.
 * - Response interceptor clears the session on 401 and notifies AuthContext.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const TOKEN_STORAGE_KEY = "sentinelai_access_token";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Registered once by AuthProvider so a 401 anywhere logs the user out. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export default axiosClient;