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
    user:{
      username:string;
      id:number;
      role_id:number;
    }
  }
}

export interface Usuario{
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  data: {
    username: string;
    id: string;
    role_id: number;
  }
  jti: string;
}