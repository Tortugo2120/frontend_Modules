import apiAxios from "../api/Axios";
import type { LoginRequest, LoginResponse } from "../model/authModel";

export const authLogin = async (authData: LoginRequest): Promise<LoginResponse> => {
  const response = await apiAxios.post("/api/auth/login", authData);
  return response.data;
};

// El refresh token viaja como cookie HttpOnly — Axios lo envía automáticamente con withCredentials: true
// Se marca _skipRetry para que el interceptor NO intente refresh si el access token ya expiró al cerrar sesión
export const logout = async (): Promise<void> => {
  const response = await apiAxios.post("/api/v1/logout", {}, { headers: { _skipRetry: true } as any });
  const data = response.data;

  if (!data?.status || data?.code !== 200) {
    throw new Error(data?.message ?? "Error al cerrar sesión");
  }
}