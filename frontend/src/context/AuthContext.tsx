import {createContext, type ReactNode, useContext, useState, useCallback, useEffect} from 'react';
import type {LoginResponse, Usuario} from "../model/authModel.ts";
import {jwtDecode} from "jwt-decode";
import {registerAuthCallbacks} from "../api/Axios.tsx";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
  user: Usuario | null;
  updateUserFromToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const decodedToken = (token: string | null): Usuario | null => {
    if (!token) return null;
    try {
      return jwtDecode<Usuario>(token);
    } catch (e) {
      console.log("Error decoding token:", e);
      return null;
    }
  };

  const [user, setUser] = useState<Usuario | null>(() => {
    // Al montar, leer el token desde sessionStorage (si existe)
    const token = sessionStorage.getItem("token");
    return decodedToken(token);
  });

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  }, []);

  const login = (loginResponse: LoginResponse) => {
    sessionStorage.setItem("token", loginResponse.data.token);
    const decoded = decodedToken(loginResponse.data.token);
    setUser(decoded);
  };

  // Llamado por Axios cuando obtiene un nuevo token tras el refresh
  const updateUserFromToken = useCallback((token: string) => {
    sessionStorage.setItem("token", token);
    const decoded = decodedToken(token);
    setUser(decoded);
  }, []);

  // Registrar el callback en Axios para actualizar el estado React
  // cuando refresca el token exitosamente (sin dependencia circular)
  useEffect(() => {
    registerAuthCallbacks(updateUserFromToken);
  }, [updateUserFromToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, updateUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const Auth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
