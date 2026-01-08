import axiosApi from "../api/AxiosApi.ts";

export interface User {
  id_usuario: string;
  usuario: string;
  rol?: string;
  modules?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number; 
}

export interface formLogin{
    userName: string;
    password: string;
}

export async function apiLogin(form:formLogin){
    return axiosApi.post("/auth/login", form);
 /*
  if (username === "admin" && password === "admin") {
    return {
      user: { id: "1", nombre: "Administrador", role: "admin", modules: ["mod1","mod2"] },
      token: "fake-jwt-token-123",
      expiresIn: 3600,
    };
  }

  throw new Error("Credenciales inválidas");
  */
}
