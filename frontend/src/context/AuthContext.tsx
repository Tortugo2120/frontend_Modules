import {createContext, type ReactNode, useContext, useState, useCallback} from 'react';
import type {LoginResponse, Usuario} from "../model/authModel.ts";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
  user: Usuario | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode })     => {
  const navigate = useNavigate();

  const decodedToken = (token: string | null): Usuario | null => {
    if (!token) return null;
    try{
      return jwtDecode<Usuario>(token);
    }catch (e){
      console.log("Error decoding token:", e);
      return null;
    }
  }

  const [user, setUser] = useState<Usuario | null>(()=>decodedToken(localStorage.getItem("token")));
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  const login = (loginResponse: LoginResponse) => {
    localStorage.setItem("token", loginResponse.data.token);
    const decoded = decodedToken(loginResponse.data.token);
    setUser(decoded);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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
