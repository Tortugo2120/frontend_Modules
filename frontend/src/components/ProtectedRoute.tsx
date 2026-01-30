import { Navigate } from 'react-router-dom';
import { Auth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isTokenExpired } = Auth();

  if (!isAuthenticated || isTokenExpired()) {
    console.log("Token expirado o usuario no autenticado, redirigiendo al login...");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
