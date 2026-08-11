export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpData {
    email: string;
    password: string;
    name?: string; 
}