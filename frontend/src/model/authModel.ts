export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?:boolean;
}

export interface LoginResponse {
  status:boolean;
  code:number;
  message: string;
  data:{
    token: string;
  }
}

export interface Usuario{
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  jti: string;
  rol_id: number;
  user_id: number;
}