import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { AuthRepository } from '../../domain/auth/AuthRepository';
import { AuthSession, SignUpData } from '../../domain/auth/User';
import { authSessionSchema } from '../../domain/auth/schemas/authSession.schema';
import { apiErrorSchema } from '../../domain/auth/schemas/apiError.schema';

const SESSION_KEY = 'user_session_tokens';

export class ApiAuthAdapter implements AuthRepository {
  constructor(private baseUrl: string) {}

  async signUp(data: SignUpData): Promise<AuthSession> {
    return this.postRequest('/v1/auth/sign-up', data, authSessionSchema);
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    return this.postRequest('/v1/auth/sign-in', { email, password }, authSessionSchema);
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    return this.postRequest('/v1/auth/refresh', { refreshToken }, authSessionSchema);
  }

  async signOut(): Promise<void> {
    const session = await this.getStoredSession();
    if (session?.accessToken) {
      await this.postRequest('/v1/auth/sign-out', {}, z.unknown(), session.accessToken);
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

  private async postRequest<T>(
    endpoint: string,
    body: object,
    schema: z.ZodType<T>,
    token?: string
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const parsedError = apiErrorSchema.safeParse(errorData);
      const detail = parsedError.success
        ? parsedError.data.detail || parsedError.data.message || parsedError.data.title
        : undefined;
      throw new Error(detail || `Error en la petición: ${response.status}`);
    }

    const json = await response.json();
    const result = schema.safeParse(json);
    if (!result.success) {
      throw new Error('La respuesta del servidor no tiene el formato esperado.');
    }

    return result.data;
  }
}