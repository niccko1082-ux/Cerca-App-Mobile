import { AuthSession, SignUpData } from './User';

export interface AuthRepository {
  signUp(data: SignUpData): Promise<AuthSession>;
  signIn(email: string, password: string): Promise<AuthSession>;
  refreshToken(refreshToken: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  saveSession(session: AuthSession): Promise<void>;
  getStoredSession(): Promise<AuthSession | null>;
  /**
   * Cerca.md · POST /me/capacities/provider — autoservicio, sin aprobación.
   */
  requestProviderCapacity(): Promise<void>;
}
