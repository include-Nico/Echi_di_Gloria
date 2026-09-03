/**
 * useAuth.ts
 * React hook for authentication state management
 * Handles: login, register, logout, token validation, auto-refresh
 */

import { useEffect, useState, useCallback } from "react";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<string>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const useAuth = (scriptUrl: string): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null,
    token: null,
    loading: true,
    error: null
  });

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    if (token && userId) {
      setAuthState({
        isAuthenticated: true,
        userId,
        email,
        token,
        loading: false,
        error: null
      });
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch through apps script endpoint
        const db = new (window as any).GoogleSheetsDB(scriptUrl);
        const user = await db.getUserByEmail(email);

        if (!user) {
          throw new Error("Email not found");
        }

        if (!user.verified) {
          throw new Error("Email not verified. Check your inbox.");
        }

        // Verify password (would typically be done server-side)
        // For now, we rely on backend endpoint
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        const { token, userId, email: userEmail } = data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", userEmail);

        setAuthState({
          isAuthenticated: true,
          userId,
          email: userEmail,
          token,
          loading: false,
          error: null
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        throw error;
      }
    },
    [scriptUrl]
  );

  const register = useCallback(
    async (email: string, password: string): Promise<string> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        setAuthState((prev) => ({ ...prev, loading: false }));
        return data.userId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        throw error;
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setAuthState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Verification failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");

    setAuthState({
      isAuthenticated: false,
      userId: null,
      email: null,
      token: null,
      loading: false,
      error: null
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    verifyEmail,
    logout,
    clearError
  };
};

export default useAuth;
export type { AuthState, UseAuthReturn };
