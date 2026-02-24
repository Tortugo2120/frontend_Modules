import { useState } from "react";
import type { LoginRequest, LoginResponse } from "../model/authModel";
import { authLogin } from "../services/AuthService";

interface UseLoginResult {
  loading: boolean;
  error: string | null;
  loginUser: (authData: LoginRequest) => Promise<LoginResponse | undefined>;
}

export default function useLogin(): UseLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (authData: LoginRequest): Promise<LoginResponse | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const  response = await authLogin(authData);
       return response;
    } catch (e: any) {
      console.log("error", e.response);
      const status = e?.response?.status;

      if (!status) {
        setError("No se pudo conectar al servidor");
      }else if (status === 404) {
        setError("Usuario no encontrado");
      }else if (status === 401) {
        setError("Contraseña incorrecta");
      }

      console.log("Login error:", e.message.error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loginUser };
}