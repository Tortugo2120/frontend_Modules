import apiAxios from "../api/Axios";
import type { LoginRequest, LoginResponse } from "../model/authModel";

export const authLogin = async (authData: LoginRequest): Promise<LoginResponse> => {
  const response = await apiAxios.post("/auth/login", authData);
  return response.data;
};