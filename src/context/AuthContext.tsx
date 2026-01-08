
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, AuthResponse, User } from "../services/auth.ts";

interface StoredAuth {
  user: User | null;
  token: string | null;
  expiresAt: number | null; 
}

const STORAGE_KEY = "sgm_auth";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<StoredAuth>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { user: null, token: null, expiresAt: null };
      const parsed = JSON.parse(raw) as StoredAuth;
      // validar expiración
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return { user: null, token: null, expiresAt: null };
      }
      return parsed;
    } catch {
      return { user: null, token: null, expiresAt: null };
    }
  });

  // Mantener storage sincronizado y validar expiración periódicamente
  useEffect(() => {
    if (auth.token && auth.expiresAt && Date.now() > auth.expiresAt) {
      // expiró -> limpiar
      setAuth({ user: null, token: null, expiresAt: null });
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  // sincronizar entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newVal = e.newValue ? (JSON.parse(e.newValue) as StoredAuth) : { user: null, token: null, expiresAt: null };
          // si expiró, limpiarlo
          if (newVal.expiresAt && Date.now() > newVal.expiresAt) {
            localStorage.removeItem(STORAGE_KEY);
            setAuth({ user: null, token: null, expiresAt: null });
            return;
          }
          setAuth(newVal);
        } catch {
          setAuth({ user: null, token: null, expiresAt: null });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (username: string, password: string) => {
    // llama a tu API real
    const res: AuthResponse = await apiLogin(username, password);
    const expiresIn = res.expiresIn ?? 3600;
    const expiresAt = Date.now() + expiresIn * 1000;
    const store: StoredAuth = { user: res.user, token: res.token, expiresAt };
    setAuth(store);
    // localStorage se actualiza por useEffect
  };

  const logout = () => {
    setAuth({ user: null, token: null, expiresAt: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: Boolean(auth.user && auth.token),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
