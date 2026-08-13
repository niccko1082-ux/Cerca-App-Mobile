import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { API_BASE_URL } from '../../constants/api';
import { AuthRepository } from '../../domain/auth/AuthRepository';
import { apiErrorSchema } from '../../domain/auth/schemas/apiError.schema';
import { authSessionSchema } from '../../domain/auth/schemas/authSession.schema';
import { AuthSession, SignUpData } from '../../domain/auth/User';

const SESSION_KEY = 'user_session_tokens';

export class ApiAuthAdapter implements AuthRepository {
  constructor(private baseUrl: string = API_BASE_URL) {}

  async signUp(data: SignUpData): Promise<AuthSession> {
    const payload = {
      email: data.email,
      password: data.password,
      displayName: data.displayName || data.name || '',
    };
    return this.postRequest('/v1/auth/sign-up', payload, authSessionSchema);
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
      await this.postRequest(
        '/v1/auth/sign-out',
        { refreshToken: session.refreshToken },
        z.unknown(),
        session.accessToken,
      );
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  async requestProviderCapacity(): Promise<void> {
    const session = await this.getStoredSession();
    if (!session?.accessToken) {
      throw new Error('No hay una sesión activa.');
    }
    await this.postRequest('/v1/me/capacities/provider', {}, z.unknown(), session.accessToken);
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
    token?: string,
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

      console.log('=== DEBUG BACKEND RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Error Body:', JSON.stringify(errorData, null, 2));
      console.log('=============================');

      let detailMessage: string | undefined;

      if (errorData?.code === 'EMAIL_TAKEN') {
        detailMessage = 'Este correo electrónico ya se encuentra registrado.';
      } else if (errorData?.code === 'INVALID_CREDENTIALS') {
        detailMessage = 'Credenciales incorrectas.';
      } else if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        detailMessage = errorData.errors
          .map((e: any) => e.message || (typeof e === 'string' ? e : ''))
          .filter(Boolean)
          .join(', ');
      }

      if (!detailMessage) {
        const parsedError = apiErrorSchema.safeParse(errorData);
        if (parsedError.success) {
          const { detail, message, title } = parsedError.data;
          if (typeof detail === 'string') {
            detailMessage = detail;
          } else if (typeof message === 'string') {
            detailMessage = message;
          } else if (Array.isArray(message) && message.length > 0) {
            detailMessage = message.join(', ');
          } else if (typeof title === 'string') {
            detailMessage = title;
          }
        }
      }

      if (!detailMessage && errorData) {
        if (Array.isArray(errorData.message)) {
          detailMessage = errorData.message.join(', ');
        } else if (typeof errorData.message === 'string') {
          detailMessage = errorData.message;
        } else if (typeof errorData.detail === 'string') {
          detailMessage = errorData.detail;
        }
      }

      throw new Error(detailMessage || `Error en la petición: ${response.status}`);
    }

    const json = await response.json();
    const result = schema.safeParse(json);

    if (!result.success) {
      console.log('=== DEBUG SCHEMA VALIDATION ERROR ===');
      console.log('Received JSON from server:', JSON.stringify(json, null, 2));
      console.log('Zod Issues:', JSON.stringify(result.error.issues, null, 2));
      console.log('====================================');
      throw new Error('La respuesta del servidor no tiene el formato esperado.');
    }

    return result.data;
  }
}
