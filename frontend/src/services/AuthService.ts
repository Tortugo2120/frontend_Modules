import apiAxios from "../api/Axios";
import type { LoginRequest, LoginResponse } from "../model/authModel";

export const authLogin = async (authData: LoginRequest): Promise<LoginResponse> => {
  const response = await apiAxios.post("/api/auth/login", authData);
  return response.data;
};

export const logout = async (refresh_token:string): Promise<void> => {
  const response = await apiAxios.post("/api/auth/logout", { refresh_token });
  return response.data;
}