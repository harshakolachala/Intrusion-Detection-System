import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getMeRequest, loginRequest, registerRequest } from "../api/authApi";
import { setUnauthorizedHandler, TOKEN_STORAGE_KEY } from "../api/axiosClient";
import type { AuthContextValue, LoginPayload, RegisterPayload, User } from "../types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  // Any 401 from the API layer logs the user out and sends them to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      navigate("/login", { replace: true });
    });
  }, [clearSession, navigate]);

  // On first load, restore the session from a stored token (if any).
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    getMeRequest()
      .then((response) => setUser(response.data))
      .catch(() => clearSession())
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await loginRequest(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);

      const me = await getMeRequest();
      setUser(me.data);

      // Redirect to the SOC Dashboard immediately after setting user
      navigate("/dashboard", { replace: true });
    },
    [navigate]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await registerRequest(payload);

      // Automatically log the user in right after registering
      await login({ username: payload.username, password: payload.password });

      return data;
    },
    [login]
  );

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}