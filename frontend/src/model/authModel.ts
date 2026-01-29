export interface LoginRequest {
  user: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}