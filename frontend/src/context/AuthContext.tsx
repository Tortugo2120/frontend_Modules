import {createContext, type ReactNode, useContext, useState, useCallback, useEffect} from 'react';
import type {LoginResponse, Usuario} from "../model/authModel.ts";
import {jwtDecode} from "jwt-decode";
import {registerAuthCallbacks} from "../api/Axios.tsx";
import {logout as logoutService} from "../services/AuthService.ts";

interface AuthContextType {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => Promise<void>;
  user: Usuario | null;
  updateUserFromToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeToken = (token: string | null): Usuario | null => {
  if (!token) return null;
  try {
    return jwtDecode<Usuario>(token);
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<Usuario>(token);
    // exp está en segundos, Date.now() en ms
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<Usuario | null>(() => {
    const token = sessionStorage.getItem("token");
    // Si el token está expirado al montar, no setear user —
    // el interceptor intentará el refresh cuando se haga la primera petición
    if (isTokenExpired(token)) return null;
    return decodeToken(token);
  });

  // true mientras se está verificando/refrescando el token al montar
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() => {
    const token = sessionStorage.getItem("token");
    // Si hay token expirado → necesitamos esperar al refresh
    return isTokenExpired(token) && token !== null;
  });

  const isAuthenticated = !!user;

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (e) {
      console.warn("Error al cerrar sesión en el servidor:", e);
    } finally {
      setUser(null);
      setIsCheckingAuth(false);
      sessionStorage.clear();
      localStorage.clear();
    }
  }, []);

  const login = (loginResponse: LoginResponse) => {
    sessionStorage.setItem("token", loginResponse.data.token);
    const decoded = decodeToken(loginResponse.data.token);
    setUser(decoded);
    setIsCheckingAuth(false);
  };

  // Llamado por Axios cuando obtiene un nuevo token tras el refresh exitoso
  const updateUserFromToken = useCallback((token: string) => {
    sessionStorage.setItem("token", token);
    const decoded = decodeToken(token);
    setUser(decoded);
    setIsCheckingAuth(false);
  }, []);

  // Registrar el callback en Axios
  useEffect(() => {
    registerAuthCallbacks(updateUserFromToken);
  }, [updateUserFromToken]);

  // Si hay token expirado al montar, hacer una petición de refresh inmediatamente
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!isTokenExpired(token) || token === null) return;

    // Importar refreshAxios directamente para no pasar por el interceptor
    import('../api/Axios.tsx').then(({ tryRefreshToken }) => {
      tryRefreshToken()
        .then((newToken) => {
          if (newToken) {
            updateUserFromToken(newToken);
          } else {
            // Refresh falló → limpiar y dejar que ProtectedRoute redirija
            sessionStorage.clear();
            setIsCheckingAuth(false);
          }
        })
        .catch(() => {
          sessionStorage.clear();
          setIsCheckingAuth(false);
        });
    });
  }, [updateUserFromToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isCheckingAuth, login, logout, user, updateUserFromToken }}>
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
