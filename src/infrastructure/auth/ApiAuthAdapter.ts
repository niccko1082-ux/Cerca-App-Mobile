import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession, SignUpData } from '../../domain/auth/User';

const SESSION_KEY = 'user_session_tokens';

export class ApiAuthAdapter implements AuthRepository {
  constructor(private baseUrl: string) {}

  async signUp(data: SignUpData): Promise<AuthSession> {
    return this.postRequest<AuthSession>('/v1/auth/sign-up', data);
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    return this.postRequest<AuthSession>('/v1/auth/sign-in', { email, password });
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    return this.postRequest<AuthSession>('/v1/auth/refresh', { refreshToken });
  }

  async signOut(): Promise<void> {
    const session = await this.getStoredSession();
    if (session?.accessToken) {
      await this.postRequest('/v1/auth/sign-out', {}, session.accessToken);
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  async saveSession(session: AuthSession): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  }

  async getStoredSession(): Promise<AuthSession | null> {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  }

  private async postRequest<T>(endpoint: string, body: object, token?: string): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error en la petición: ${response.status}`);
    }

    return response.json();
  }
}