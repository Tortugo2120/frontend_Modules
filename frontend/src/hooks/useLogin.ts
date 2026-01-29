import { useState } from "react";
import type { LoginRequest, LoginResponse } from "../model/authModel";
import { authLogin } from "../services/AuthService";

interface UseLoginResult {
  loading: boolean;
  error: string | null;
  login: (authData: LoginRequest) => Promise<LoginResponse | undefined>;
  clearError: () => void;
}

export default function useLogin(): UseLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (authData: LoginRequest): Promise<LoginResponse | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authLogin(authData);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido al iniciar sesión";
      setError(errorMessage);
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { loading, error, login, clearError };
}