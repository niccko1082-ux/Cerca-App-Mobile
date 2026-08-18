export type Capacity = 'customer' | 'provider';
export type PlatformRole = 'user' | 'moderator' | 'admin';
export type Role = 'USER' | 'MODERATOR' | 'ADMIN';
export type ParticipantType = 'Cliente' | 'Proveedor';

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  capacities?: Capacity[];
  platformRole?: PlatformRole;
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

export interface LoginFormState {
  participantType: ParticipantType;
  role: Role;
  email: string;
}
