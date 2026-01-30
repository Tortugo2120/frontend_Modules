export interface LoginRequest {
  username: string;
  password: string;
  rememberMe:boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface Usuario{
  "iss": string,
  "aud": string,
  "iat": number,
  "exp": number,
  "data": {
    "username": string,
    "id": string,
    "role_id": number
  },
  "jti": string
}