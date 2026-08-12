export interface User {
    id: string;
    email: string;
    name?: string;
    displayName?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpData {
    email: string;
    password: string;
    displayName?: string;
    name?: string; 
}

export type Role = 'USER' | 'MODERATOR' | 'ADMIN';
export type ParticipantType = 'Cliente' | 'Proveedor';

export interface LoginFormState {
  participantType: ParticipantType;
  role: Role;
  email: string;
}