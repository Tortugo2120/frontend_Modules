import {createContext, type ReactNode, useContext, useState, useEffect, useCallback} from 'react';
import type {LoginResponse, Usuario} from "../model/authModel.ts";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
  user: Usuario | null;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode })     => {
  const navigate = useNavigate();

  const decodedToken = (token: string | null): Usuario | null => {
    if (!token) return null;
    try{
      const decoded = jwtDecode<Usuario>(token);
      const expirationTime = decoded.exp * 1000;

      if (expirationTime < Date.now()) {
        localStorage.removeItem('token');
        console.log("Token expirado al decodificar. Exp:", new Date(expirationTime));
        return null;
      }
      return decoded;
    }catch (e){
      console.log("Error decoding token:", e);
      localStorage.removeItem('token');
      return null;
    }
  }

  const [user, setUser] = useState<Usuario | null>(()=>decodedToken(localStorage.getItem("token")));
  const isAuthenticated = !!user;

  const isTokenExpired = useCallback((): boolean => {
    if (!user || !user.exp) return false;
    return user.exp * 1000 < Date.now();
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (user && isTokenExpired()) {
        console.log("Token expirado, cerrando sesión...");
        logout();
      }
    };

    const interval = setInterval(checkTokenExpiration, 30000);

    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [user, isTokenExpired, logout]);

  const login = (loginResponse: LoginResponse) => {
    localStorage.setItem("token", loginResponse.data.token);
    const decoded = decodedToken(loginResponse.data.token);
    setUser(decoded);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, isTokenExpired }}>
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
