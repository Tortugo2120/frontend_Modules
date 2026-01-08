
export interface User {
  id: string;
  nombre: string;
  role?: string;
  modules?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number; 
}


export async function apiLogin(username: string, password: string): Promise<AuthResponse> {
 
  if (username === "admin" && password === "admin") {
    return {
      user: { id: "1", nombre: "Administrador", role: "admin", modules: ["mod1","mod2"] },
      token: "fake-jwt-token-123",
      expiresIn: 3600,
    };
  }

  throw new Error("Credenciales inválidas");
}
